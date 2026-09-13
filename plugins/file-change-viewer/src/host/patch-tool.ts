/**
 * `patch` 模型工具：一次调用改多个文件、多处零散位置
 *
 * 这是本插件除「渲染」之外唯一的实质功能，动机很具体：**批量修改以前只能靠 shell 脚本**。
 * 官方文件工具是 `read` / `write` / `edit`（`edit` 一次只能替换一处），所以「一个文件里改 8 处、
 * 顺带再改 3 个文件」这种活儿，模型往往会退化成 `bash` + `sed`/`python` 一把梭——改动因此
 * 藏在命令里：看不见 diff、也没法整体回滚。`patch` 把它变成一次调用：
 *
 * - 输入是一份 unified diff（可以含多个文件、多个 hunk），与 `patch(1)` / `git apply` 同格式；
 * - **全有或全无**：先把每个文件读进来、在内存里全部应用成功，才真正落盘。批量改一半失败
 *   留下半截状态是最糟的结果，这里从结构上避免；
 * - 通过 `ctx.fs`（也就是官方的文件系统 seam）读写：同样吃沙箱模式、`fs/write-intent` 观察策略
 *   与 `fs/observed` 记账，不绕过后端；
 * - 结果元数据里带 `diffs`，交给本插件的差异卡片渲染——这条调用于是也能一眼看清改了什么。
 *
 * 与官方工具一致，删除文件不在范围内（本插件只做「改 / 建」）。
 *
 * @module @dshp/file-change-viewer
 */
import {
  assertWritable,
  createEscalation,
  escalationSchemaFields,
  type SandboxExecutionPolicy,
} from './sandbox-escalation.js';
import { applyFilePatch, hunkDiffsOf, parseUnifiedPatch } from '../shared/patch.js';
import type { FilePatch } from '../shared/patch.js';
import type { AnyCtx } from './types.js';

/**
 * 一次落盘的结果（工具返回值，进 output.schema）。
 *
 * `oldText` / `newText` 是**只含真正变化的行**的文本（不是整份文件内容，也不是工具的原文口径）：
 * 差异卡片直接拿它渲染，所以卡片上的 `+A -B` 与这次 patch 实际改了哪几行永远一致。
 * 模型侧看不到它们——`output.render` 只输出下面那段小结。
 */
interface PatchedFile {
  path: string;
  operation: 'create' | 'update';
  added: number;
  removed: number;
  oldText: string | null;
  newText: string;
}

/** 工具返回值。 */
interface PatchToolValue {
  files: PatchedFile[];
  added: number;
  removed: number;
}

/** 取会话工作目录（与官方文件工具同一来源）。 */
function sessionCwdOf(exec: AnyCtx): string | undefined {
  const cwd = exec?.agent?.session?.header?.cwd;
  return typeof cwd === 'string' && cwd !== '' ? cwd : undefined;
}

/**
 * 读一个文件；不存在返回 `null`，并把「我看过它」登记给观察策略。
 *
 * 观察策略（`dsh-fs-observation-policy`）要求写之前先被观察过，否则写入会被判 `FS_NOT_OBSERVED`。
 * 这里在读到的当下就补一次 `fs/observed`（与官方 `read` 工具同一套语义），模型不必先手动 read。
 */
async function readForPatch(
  ctx: AnyCtx,
  file: FilePatch,
  exec: AnyCtx,
): Promise<{ target: AnyCtx; current: string | null }> {
  const cwd = sessionCwdOf(exec);
  const target = await ctx.fs.resolve(file.path, {
    ...(cwd === undefined ? {} : { cwd }),
    ...(exec?.signal === undefined ? {} : { signal: exec.signal }),
  });
  const info = await ctx.fs.stat(target, exec?.signal);
  if (info === undefined) {
    ctx.emit('fs/observed', target, { kind: 'absent' }, exec);
    return { target, current: null };
  }
  if (info.type !== 'file') {
    throw new Error(`patch 无法应用：${target.displayPath} 不是普通文件。`);
  }
  const current = (await ctx.fs.readText(target, exec?.signal)) as string;
  ctx.emit('fs/observed', target, { kind: 'present', version: info.version }, exec);
  return { target, current };
}

/**
 * 把 seam 抛出来的错误翻译成模型能照做的提示。
 *
 * **不新造错误对象**：`ToolRuntime` 只对运行时的 `HarnessError` 实例（`instanceof` 判定）填
 * `result.error = { name, code }`，重新包一层 `Error` 就等于把错误码丢了（`patch` 的失败在
 * 日志/重试逻辑里会与 `edit` 不一致）。所以这里就地改 message、把**原对象**抛出去。
 *
 * @param error - 原始错误（沙箱类已过 `mapError`）。
 * @param displayPath - 这次要写的路径。
 * @param detail - 追加说明（例如「哪些文件已经写成功了，别重复改」）。
 * @returns 交给模型看的错误（尽量是原对象）。
 */
function remediate(error: unknown, displayPath: string, detail: string): unknown {
  const code = (error as { code?: unknown })?.code;
  const message = String((error as Error)?.message ?? error);
  const text =
    code === 'FS_NOT_OBSERVED'
      ? `cannot modify "${displayPath}": file has not been read — read the file, then retry`
      : code === 'FS_STALE_VERSION'
        ? `${message} — re-read the file, then retry`
        : message;
  const finalText = text + detail;
  if (finalText === message) return error;
  try {
    (error as { message?: unknown }).message = finalText;
    return error;
  } catch {
    return new Error(finalText);
  }
}

/** 模型可见的文本小结（不把整份 patch 回显）。 */
function formatPatchOutput(value: PatchToolValue): string {
  const lines: string[] = [];
  for (const file of value.files) {
    lines.push(
      `${file.operation === 'create' ? 'Created' : 'Updated'} ${file.path} (+${file.added} -${file.removed})`,
    );
  }
  lines.push(`\n${value.files.length} file(s) changed, +${value.added} -${value.removed}.`);
  return lines.join('\n');
}

/**
 * 解析出的文件列表 → 差异卡片的 `diffs`。
 *
 * 按 **hunk** 摊平（不是按文件），因为卡片是一 hunk 一张、而 `@@ -a,b +c,d @@` 里的 `c` 正是
 * 那张卡该从第几行开始编号——于是 patch 行的行号是**文件里的真实行号**，不必像 edit / write
 * 那样回头问 Host 定位（它们的结果元数据里没有偏移）。
 */
function diffsOf(
  files: readonly FilePatch[],
): Array<{ path: string; oldText: string | null; newText: string; startLine: number }> {
  return hunkDiffsOf(files);
}

/**
 * 注册 `patch` 工具。
 *
 * @param ctx - 注入了 `tools` 与 `fs` 的上下文。
 */
export function registerPatchTool(ctx: AnyCtx): void {
  // 提权面：沙箱后端在限制时才广告 `sandbox_permissions` / `justification`（与官方文件工具同一判定）。
  const escalation = createEscalation(ctx);
  ctx.tools.register({
    name: 'patch',
    description:
      'Apply a unified diff (git patch) to one or more files in a single call — the right tool for several scattered ' +
      'edits or a multi-file change, instead of many edit calls or a shell script. Format: --- / +++ file headers ' +
      'plus @@ -oldStart,oldCount +newStart,newCount @@ hunks, exactly like `git diff` output.\n' +
      'Two forms, and picking the right one matters:\n' +
      '1) EDIT an existing file: "--- a/src/a.ts" + "+++ b/src/a.ts" (+ @@ hunks). The file must already exist.\n' +
      '2) CREATE a new file: "--- /dev/null" + "+++ b/new.ts" + "@@ -0,0 +1,N @@" with only + lines; parent ' +
      'directories are created automatically.\n' +
      'A missing file patched with form 1 is refused (a typo must not silently create a file). Deleting files is not ' +
      'supported. Every file is read, matched and sandbox-checked before the first write: if any hunk does not match, ' +
      'or any target is outside the writable roots of the current policy, nothing is written at all. ' +
      'The write goes through the session file policy (sandbox): a denial reports the mode in a [sandbox: ...] marker, ' +
      'and when this composition advertises it, the sanctioned retry carries sandbox_permissions + justification for a ' +
      'one-shot user-approved escalation. Use edit for one small replacement and write to create or completely replace ' +
      'a single file.',
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        patch: {
          type: 'string',
          description:
            'Unified diff text. EDIT: "--- a/src/a.ts\\n+++ b/src/a.ts\\n@@ -12,3 +12,3 @@\\n ctx\\n-old\\n+new\\n ctx".\n' +
            'CREATE: "--- /dev/null\\n+++ b/notes/t.md\\n@@ -0,0 +1,3 @@\\n+| a | b |\\n+| --- | --- |\\n+| hi | x |".\n' +
            'Multiple files and multiple @@ hunks per file are allowed; the a/ b/ prefixes are optional; line numbers ' +
            'go in the @@ header (a few lines of drift is tolerated — the applier searches the file for the context).',
        },
        // 与官方 write / edit 一样：只在真的会围栏的组合里广告这两个字段。
        ...(escalation.modes.length > 0 ? escalationSchemaFields(escalation.modes) : {}),
      },
      required: ['patch'],
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          files: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: false,
              properties: {
                path: { type: 'string' },
                operation: { type: 'string', enum: ['create', 'update'] },
                added: { type: 'integer' },
                removed: { type: 'integer' },
                oldText: { oneOf: [{ type: 'string' }, { type: 'null' }] },
                newText: { type: 'string' },
              },
              required: ['path', 'operation', 'added', 'removed', 'oldText', 'newText'],
            },
          },
          added: { type: 'integer' },
          removed: { type: 'integer' },
        },
        required: ['files', 'added', 'removed'],
      },
      render: (_args: unknown, value: PatchToolValue) => [{ type: 'text', text: formatPatchOutput(value) }],
      /**
       * 差异卡片就读这里：按 hunk 给出「两侧原文 + 新文件起始行号」。
       *
       * 行号从 `@@` 头里拿（`args.patch` 再解析一次即可，patch 文本很小），这样卡片上的编号
       * 就是文件里的真实行号；统计仍是语义口径（卡片自己跑 LCS），两者不冲突。
       */
      presentationMeta: (args: unknown, _value: PatchToolValue) => ({
        diffs: diffsOf(safeParse((args as AnyCtx)?.patch)),
      }),
    },
    /** 预览（流式 / 结算前）：宽容解析 args 里的 patch 文本，等真正应用后再由 meta.diffs 接管。 */
    presentCall(args: AnyCtx) {
      const files = safeParse(args?.patch);
      return {
        card: 'diff',
        title: `Patch ${files.length} file(s)`,
        diffs: diffsOf(files),
        locations: files.map((file) => ({ path: file.path })),
      };
    },
    isConcurrencySafe: () => false,
    async execute(args: AnyCtx, exec: AnyCtx): Promise<PatchToolValue> {
      const text = typeof args?.patch === 'string' ? args.patch : '';
      if (text.trim() === '') throw new Error('patch 必须是非空的 unified diff 文本。');
      const files = parseUnifiedPatch(text);
      if (files.length === 0) {
        throw new Error(
          'patch 里没有解析到任何 hunk：需要 --- / +++ 文件头与 @@ 小节（格式同 git diff 输出）。',
        );
      }

      // 提权：`sandbox_permissions` + `justification` 在这里过一次审批（`allowed-once` 才放行），
      // 没批准就直接抛错——**在读文件之前**，所以一个字节都不会写。
      const sandboxPolicy = await escalation.resolvePolicy('patch', args, exec);

      // ── 阶段一：全部读进来、在内存里全部应用成功（一处失败 => 一个字节都不写） ──
      const plans: Array<{ target: AnyCtx; next: string; file: FilePatch; operation: 'create' | 'update' }> =
        [];
      for (const file of files) {
        const { target, current } = await readForPatch(ctx, file, exec);
        // 把「解析后的路径」也交给校验：报「文件不存在」时能一眼看出工作目录对不对。
        const next = applyFilePatch(current, file, { displayPath: target.displayPath });
        if (next === current) continue; // 空 patch 段：没有任何实际变化
        plans.push({ target, next, file, operation: current === null ? 'create' : 'update' });
      }
      if (plans.length === 0) throw new Error('patch 解析成功，但它没有带来任何实际改动。');

      // 写前预检：批量里只要混进一个越界目标，就在**任何写入之前**整体失败。
      // 否则第一个文件已经落盘、第二个才被围栏拒绝，磁盘上会留半截结果（实测踩过）。
      for (const plan of plans) {
        await assertWritable(sandboxPolicy, plan.target.displayPath);
      }

      // ── 阶段二：逐个原子落盘（每个文件一次原子写；写失败的会点名已写成功的文件） ──
      const done: PatchedFile[] = [];
      for (const plan of plans) {
        try {
          const intent = await ctx.waterfall('fs/write-intent', plan.target, exec, () => undefined);
          const outcome = await ctx.fs.writeText(
            plan.target,
            plan.next,
            intent,
            exec?.signal,
            sandboxPolicy as SandboxExecutionPolicy | undefined,
          );
          ctx.emit('fs/observed', plan.target, { kind: 'present', version: outcome.version }, exec);
          done.push({
            path: plan.target.displayPath,
            operation: plan.operation,
            added: plan.file.added,
            removed: plan.file.removed,
            oldText: plan.file.oldText,
            newText: plan.file.newText,
          });
        } catch (error) {
          // 诊断只留在 Host 侧日志：模型看到的消息必须与官方 write / edit 逐字一致（两行 marker），
          // 但排查「为什么这个路径不可写」时需要知道路径、模式和可写根。
          if ((error as { code?: unknown })?.code === 'FS_SANDBOX_DENIED') {
            console.warn(
              '[dshp-file-change-viewer] patch 被文件策略拒绝：path=' +
                plan.target.displayPath +
                ' mode=' +
                String(sandboxPolicy?.mode ?? '(默认)') +
                ' workspaceRoot=' +
                String(sandboxPolicy?.workspaceRoot ?? '(默认)') +
                '（workspace-write 的可写根 = 会话工作区 + /tmp + 平台临时目录；创建与修改同一把尺子）',
            );
          }
          const already = done.map((file) => file.path).join(', ');
          const detail =
            already === ''
              ? ''
              : ` 已经成功写入的是：${already}（它们不会回滚；请 read 这些文件后继续处理剩下的）。`;
          throw remediate(escalation.mapError(error, sandboxPolicy), plan.target.displayPath, detail);
        }
      }

      let added = 0;
      let removed = 0;
      for (const file of done) {
        added += file.added;
        removed += file.removed;
      }
      return { files: done, added, removed };
    },
  });
}

/** 预览用：解析失败就当没有（流式期间半截 patch 很正常）。 */
function safeParse(text: unknown): FilePatch[] {
  if (typeof text !== 'string' || text === '') return [];
  try {
    return parseUnifiedPatch(text, { tolerant: true });
  } catch {
    return [];
  }
}
