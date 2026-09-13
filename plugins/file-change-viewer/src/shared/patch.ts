/**
 * Unified diff（patch）解析与应用 —— 纯函数，Host / Client 两份产物都会内联它
 *
 * 为什么放在 `src/shared/`：Host 半要用它**落盘**（`patch` 工具），Client 半要用它**预览**
 * （流式生成时 args 里的 patch 文本 → 本次打算改什么）。同一个解析器两处共用，才不会出现
 * 「模型看到的预览」与「真正写进去的内容」对不上的情况。tsup 会把本文件分别内联进
 * `lib/host.js` 与 `lib/client.js`，运行时零依赖。
 *
 * 支持的范围（git 风格 unified diff）：
 *
 * ```
 * diff --git a/src/a.ts b/src/a.ts        ← 可省，忽略
 * --- a/src/a.ts
 * +++ b/src/a.ts
 * @@ -12,3 +12,4 @@ 可选的小节标题       ← 行号/条数可省（默认 1）
 *   未变的上下文行（行首一个空格）
 * - 被删除的行
 * + 新增的行
 * \ No newline at end of file            ← 文件末尾无换行
 * ```
 *
 * 一次可以带**多个文件、多处零散修改**——这正是这个工具存在的意义：把以前用 shell 脚本
 * 一把梭的批量替换，变成一次可审阅、可整体失败回滚的 patch。
 *
 * 暂不支持：删除文件（`+++ /dev/null`）、重命名（`rename from/to`）、二进制补丁。
 *
 * @module @dshp/file-change-viewer/shared/patch
 */

/** 一个 hunk 里的一行。 */
export type PatchLineKind = 'ctx' | 'del' | 'add';

/** 一个 hunk 里的一行。 */
export interface PatchLine {
  kind: PatchLineKind;
  text: string;
}

/** 一个 `@@ … @@` 小节。 */
export interface PatchHunk {
  /** 旧文件起始行（1 起，0 表示空文件）。 */
  oldStart: number;
  /** 旧文件行数。 */
  oldCount: number;
  /** 新文件起始行。 */
  newStart: number;
  /** 新文件行数。 */
  newCount: number;
  /** `@@ … @@` 后面的标题文本（没有就是空串）。 */
  heading: string;
  lines: PatchLine[];
  /** 旧侧最后一行带 `\ No newline at end of file`。 */
  oldNoNewline: boolean;
  /** 新侧最后一行带 `\ No newline at end of file`。 */
  newNoNewline: boolean;
}

/** 补丁里针对一个文件的全部改动。 */
export interface FilePatch {
  /** 用于读写的路径（已去掉 `a/` `b/` 前缀）。 */
  path: string;
  /** 旧路径（`---` 行），`/dev/null` 表示新建。 */
  oldPath: string | null;
  /** 新路径（`+++` 行），`/dev/null` 表示删除。 */
  newPath: string | null;
  /** 是否是新建文件。 */
  create: boolean;
  /** 是否是删除文件（本插件不支持，解析出来只为给出清晰报错）。 */
  delete: boolean;
  hunks: PatchHunk[];
  /** 只含被删除的行（供差异视图：未变的上下文行不进统计）。 */
  oldText: string | null;
  /** 只含新增的行（同上）。 */
  newText: string;
  /** 新增行数（= newText 的行数）。 */
  added: number;
  /** 删除行数（= oldText 的行数，没有删除就是 0）。 */
  removed: number;
}

/** 解析选项。 */
export interface ParseOptions {
  /**
   * 宽容模式：流式生成时 patch 文本可能是半截的（最后一个 hunk 还没写完），
   * 此时不因为没有收尾而报错，能解析出多少算多少。
   */
  tolerant?: boolean;
}

/** 上下文不匹配时的最大搜索偏移（行），与 `patch(1)` 的 fuzz 思路一致。 */
const MAX_OFFSET = 3;

// ── 解析 ────────────────────────────────────────────────────────────────────

const HUNK_HEADER = /^@@+ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@+(.*)$/;

/** 去掉 `a/`、`b/` 前缀与尾部的制表符/时间戳。 */
function cleanPath(raw: string): string {
  let text = raw.trim();
  // `--- a/x.ts\t2024-01-01` 这种时间戳尾巴
  const tab = text.indexOf('\t');
  if (tab >= 0) text = text.slice(0, tab);
  if (text === '/dev/null') return '';
  if (text.startsWith('a/') || text.startsWith('b/')) text = text.slice(2);
  return text;
}

function isHeaderNoise(line: string): boolean {
  return (
    line.startsWith('diff --git ') ||
    line.startsWith('index ') ||
    line.startsWith('old mode ') ||
    line.startsWith('new mode ') ||
    line.startsWith('similarity index ') ||
    line.startsWith('new file mode ') ||
    line.startsWith('deleted file mode ')
  );
}

/**
 * 解析 unified diff。
 *
 * @param text - patch 文本（允许前后有说明文字：只有 `---`/`+++`/`@@` 起头的行才有意义）。
 * @param options - `tolerant` 用于流式预览。
 * @returns 按出现顺序排列的每个文件的改动；解析不出任何 hunk 时返回空数组。
 * @throws 结构损坏且非宽容模式时抛错（消息面向模型，指明行号）。
 */
export function parseUnifiedPatch(text: string, options: ParseOptions = {}): FilePatch[] {
  const tolerant = options.tolerant === true;
  const raw = text.replace(/\r\n/g, '\n').split('\n');
  const files: FilePatch[] = [];
  let current: FilePatch | null = null;
  let hunk: PatchHunk | null = null;
  let pendingOldPath: string | null = null;
  let sawOldNull = false;
  let sawNewNull = false;
  let createFlag = false;
  let deleteFlag = false;
  let lastSide: 'old' | 'new' | null = null;

  const closeHunk = (): void => {
    if (current !== null && hunk !== null) current.hunks.push(hunk);
    hunk = null;
  };

  const closeFile = (): void => {
    closeHunk();
    if (current !== null) {
      if (current.newPath === null) {
        // `+++ /dev/null`：删除文件。保留解析结果，由调用方给出「不支持」的清晰报错。
        current.delete = true;
      }
      current.create = current.oldPath === null;
      finalizeFile(current);
      if (current.oldPath === null && !current.delete && !createFlag && !sawOldNull && !tolerant) {
        // 没有 `--- /dev/null` 也没有 `new file mode`：视为普通改动，路径取 +++ 侧
        current.oldPath = current.newPath;
        current.create = false;
      }
      files.push(current);
    }
    current = null;
  };

  for (let index = 0; index < raw.length; index += 1) {
    const line = raw[index] as string;

    if (isHeaderNoise(line)) {
      if (line.startsWith('new file mode ')) createFlag = true;
      if (line.startsWith('deleted file mode ')) deleteFlag = true;
      continue;
    }

    if (line.startsWith('--- ')) {
      closeFile();
      pendingOldPath = cleanPath(line.slice(4));
      sawOldNull = pendingOldPath === '';
      continue;
    }

    if (line.startsWith('+++ ')) {
      const newPath = cleanPath(line.slice(4));
      sawNewNull = newPath === '';
      current = {
        path: newPath !== '' ? newPath : (pendingOldPath ?? ''),
        oldPath: sawOldNull ? null : pendingOldPath,
        newPath: sawNewNull ? null : newPath,
        create: sawOldNull || createFlag,
        delete: sawNewNull || deleteFlag,
        hunks: [],
        oldText: null,
        newText: '',
        added: 0,
        removed: 0,
      };
      lastSide = null;
      continue;
    }

    const header = HUNK_HEADER.exec(line);
    if (header !== null) {
      closeHunk();
      if (current === null) {
        if (tolerant) continue;
        throw new Error(`patch 第 ${index + 1} 行：出现了 @@ 小节，但它前面没有 --- / +++ 文件头`);
      }
      hunk = {
        oldStart: Number(header[1]),
        oldCount: header[2] === undefined ? 1 : Number(header[2]),
        newStart: Number(header[3]),
        newCount: header[4] === undefined ? 1 : Number(header[4]),
        heading: (header[5] ?? '').trim(),
        lines: [],
        oldNoNewline: false,
        newNoNewline: false,
      };
      continue;
    }

    if (hunk !== null) {
      const marker = line.charAt(0);
      if (line.startsWith('\\')) {
        // `\ No newline at end of file`：贴在上一条行尾
        if (lastSide === 'old') hunk.oldNoNewline = true;
        else if (lastSide === 'new') hunk.newNoNewline = true;
        continue;
      }
      if (line === '') {
        // 空行在 hunk 里等价于「一行空的上下文行」（末尾被吃掉的那个空行除外）
        if (index === raw.length - 1) continue;
        hunk.lines.push({ kind: 'ctx', text: '' });
        lastSide = null;
        continue;
      }
      if (marker === ' ') {
        hunk.lines.push({ kind: 'ctx', text: line.slice(1) });
        lastSide = null;
        continue;
      }
      if (marker === '-') {
        hunk.lines.push({ kind: 'del', text: line.slice(1) });
        lastSide = 'old';
        continue;
      }
      if (marker === '+') {
        hunk.lines.push({ kind: 'add', text: line.slice(1) });
        lastSide = 'new';
        continue;
      }
      if (tolerant) {
        // 半截 JSON 里剩下的杂音：宽容模式直接跳过
        continue;
      }
      throw new Error(
        `patch 第 ${index + 1} 行：hunk 里的行必须以空格、- 或 + 开头，实际是 ${JSON.stringify(line.slice(0, 20))}`,
      );
    }
  }
  closeFile();
  return files.filter((file) => file.delete || file.hunks.length > 0);
}

/**
 * 汇总 `oldText` / `newText` / 增删计数。
 *
 * `oldText` / `newText` 是**各自那一侧的原文**（旧侧 = 上下文 + 删除行，新侧 = 上下文 + 新增行），
 * 与官方 `edit` 交给差异卡片的 `old_string` / `new_string` 同性质：卡片自己跑一次 LCS，
 * 把没变的上下文行合并成一行显示、只给真正变化的行上色与计数。所以这里**故意保留上下文**——
 * 丢掉它，预览就只剩两行光秃秃的旧/新，看不出改在文件的哪个位置。
 */
function finalizeFile(file: FilePatch): void {
  const oldSide: string[] = [];
  const newSide: string[] = [];
  let added = 0;
  let removed = 0;
  for (const hunk of file.hunks) {
    for (const line of hunk.lines) {
      if (line.kind === 'del') {
        oldSide.push(line.text);
        removed += 1;
      } else if (line.kind === 'add') {
        newSide.push(line.text);
        added += 1;
      } else {
        oldSide.push(line.text);
        newSide.push(line.text);
      }
    }
  }
  file.oldText = oldSide.length === 0 ? null : oldSide.join('\n');
  file.newText = newSide.join('\n');
  file.added = added;
  file.removed = removed;
}

// ── 应用 ────────────────────────────────────────────────────────────────────

/** 按 `\n` 切行；末尾换行单独记住（`splitLines` 会把最后的空串吃掉）。 */
function toLines(text: string): { lines: string[]; endNewline: boolean } {
  if (text === '') return { lines: [], endNewline: true };
  const endNewline = text.endsWith('\n');
  const body = endNewline ? text.slice(0, -1) : text;
  return { lines: body.split('\n'), endNewline };
}

/** 与 {@link toLines} 互逆。 */
function fromLines(lines: readonly string[], endNewline: boolean): string {
  if (lines.length === 0) return '';
  return lines.join('\n') + (endNewline ? '\n' : '');
}

/** hunk 的旧侧行（上下文 + 删除），按顺序。 */
function oldSideLines(hunk: PatchHunk): string[] {
  return hunk.lines.filter((line) => line.kind !== 'add').map((line) => line.text);
}

/** hunk 的新侧行（上下文 + 新增），按顺序。 */
function newSideLines(hunk: PatchHunk): string[] {
  return hunk.lines.filter((line) => line.kind !== 'del').map((line) => line.text);
}

/**
 * 在 `lines` 里找 `needle` 的落点：先试期望位置，再左右各扩 {@link MAX_OFFSET} 行，
 * 还找不到就**全文件扫描取离期望位置最近的一处**（与 `patch(1)` 报 "succeeded at N (offset …)"
 * 的思路一致——模型手写 hunk 头时行号经常是估的，内容对得上就该让它过）。
 *
 * @param lines - 待搜索的行。
 * @param needle - 要找的整段（逐行完全相等）。
 * @param expected - 期望的 0 基下标。
 * @returns 命中的下标；找不到返回 -1。
 */
function findBlock(lines: readonly string[], needle: readonly string[], expected: number): number {
  const clamp = (at: number): number => Math.min(Math.max(at, 0), lines.length);
  if (needle.length === 0) return clamp(expected);
  const matches = (at: number): boolean => {
    if (at < 0 || at + needle.length > lines.length) return false;
    for (let k = 0; k < needle.length; k += 1) if (lines[at + k] !== needle[k]) return false;
    return true;
  };
  if (matches(expected)) return expected;
  for (let delta = 1; delta <= MAX_OFFSET; delta += 1) {
    if (matches(expected - delta)) return expected - delta;
    if (matches(expected + delta)) return expected + delta;
  }
  let best = -1;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (let at = 0; at + needle.length <= lines.length; at += 1) {
    if (!matches(at)) continue;
    const distance = Math.abs(at - expected);
    if (distance < bestDistance) {
      best = at;
      bestDistance = distance;
    }
  }
  return best;
}

/** 应用一个 hunk 时的失败信息素材。 */
function mismatchError(
  path: string,
  file: FilePatch,
  hunkIndex: number,
  expected: string,
  actual: string,
): Error {
  const hunk = file.hunks[hunkIndex] as PatchHunk;
  const where = hunk.heading === '' ? '' : `（${hunk.heading}）`;
  return new Error(
    `patch 无法应用：${path} 的第 ${hunkIndex + 1} 个 hunk${where} 找不到匹配的上下文。` +
      `期望 ${JSON.stringify(expected.slice(0, 80))}，实际 ${JSON.stringify(actual.slice(0, 80))}。` +
      '文件没有被修改——先 read 确认当前内容，再重做 patch。',
  );
}

/**
 * 把 {@link FilePatch} 应用到当前内容上。
 *
 * @param current - 文件当前内容；新建文件传 `null`。
 * @param file - 解析出来的文件改动。
 * @param options - `displayPath`：该路径在本次会话里解析出来的样子（相对路径 + 会话 cwd）。
 *   报错时把它一起带上——「文件不存在」最常见的原因就是工作目录不是你以为的那个，
 *   光看 patch 里的相对路径看不出来。
 * @returns 应用后的完整内容。
 * @throws 上下文不匹配、或对不存在的文件做非新建改动时抛错（消息面向模型）。
 */
export function applyFilePatch(
  current: string | null,
  file: FilePatch,
  options: { displayPath?: string | undefined } = {},
): string {
  /** 报错时的路径标注：与 patch 里写的一样就只写一遍。 */
  const where =
    options.displayPath !== undefined && options.displayPath !== file.path
      ? `${file.path}（解析为 ${options.displayPath}）`
      : file.path;
  if (file.delete) {
    throw new Error(
      `patch 暂不支持删除文件（${file.oldPath ?? file.path} 的 +++ 是 /dev/null）：请改用 bash 删除，或不要删这个文件。`,
    );
  }
  if (current === null) {
    if (!file.create) {
      throw new Error(
        `patch 无法应用：${where} 不存在，而这份 patch 把它当成「改已有文件」。\n` +
          '要新建它请用新建文件的形式：文件头写 --- /dev/null，hunk 头写 @@ -0,0 +1,N @@，内容全是 + 行（父目录会自动创建）。\n' +
          '如果它本该存在，检查会话工作目录是不是你以为的那个，或先 read / write 这个路径。',
      );
    }
    const lines: string[] = [];
    let endNewline = true;
    for (const hunk of file.hunks) {
      for (const line of hunk.lines) {
        if (line.kind === 'del') {
          throw new Error(
            `patch 无法应用：${where} 不存在，但 patch 里有删除行 ${JSON.stringify(line.text.slice(0, 80))}。`,
          );
        }
        if (line.kind === 'add') lines.push(line.text);
      }
      if (hunk.newNoNewline && lines.length > 0) endNewline = false;
    }
    return fromLines(lines, endNewline);
  }

  if (file.create && file.hunks.every((hunk) => hunk.oldCount === 0)) {
    throw new Error(
      `patch 无法应用：${where} 已经存在，而 patch 把它当成新建（--- /dev/null）。` +
        '改成普通改动形式（--- a/路径，hunk 头写真实行号）即可。',
    );
  }

  const { lines, endNewline } = toLines(current);
  let next = lines.slice();
  let offset = 0;
  let finalEndNewline = endNewline;

  for (let index = 0; index < file.hunks.length; index += 1) {
    const hunk = file.hunks[index] as PatchHunk;
    const expectedLines = oldSideLines(hunk);
    // 0 基期望位置：hunk 头里的旧起始行 + 前面 hunk 造成的行数漂移
    const expected = Math.max(0, hunk.oldStart - 1 + offset);
    const at = findBlock(next, expectedLines, expected);
    if (at < 0) {
      const actualLine = expectedLines[0] ?? '';
      const actual = next[Math.min(expected, Math.max(0, next.length - 1))] ?? '';
      throw mismatchError(where, file, index, actualLine, actual);
    }
    const replacement = newSideLines(hunk);
    next = next.slice(0, at).concat(replacement, next.slice(at + expectedLines.length));
    offset += replacement.length - expectedLines.length;
    if (hunk.newNoNewline && index === file.hunks.length - 1) finalEndNewline = false;
    else if (hunk.oldNoNewline && index === file.hunks.length - 1 && !hunk.newNoNewline)
      finalEndNewline = false;
  }

  return fromLines(next, finalEndNewline);
}

/** 供工具输出用的统计。 */
export interface PatchTotals {
  added: number;
  removed: number;
}

/**
 * 汇总整份 patch 的增删行数（只算真正变化的行）。
 *
 * @param files - 解析结果。
 * @returns 增删计数。
 */
export function patchTotals(files: readonly FilePatch[]): PatchTotals {
  let added = 0;
  let removed = 0;
  for (const file of files) {
    added += file.added;
    removed += file.removed;
  }
  return { added, removed };
}

/** 交给差异卡片的单个 hunk（`startLine` 是行号能有真实值的关键）。 */
export interface HunkDiff {
  path: string;
  /** 旧侧原文（上下文 + 删除行）；纯新建为 null。 */
  oldText: string | null;
  /** 新侧原文（上下文 + 新增行）。 */
  newText: string;
  /** 这个 hunk 在新文件里的起始行号（1 起）——行号从它开始数，而不是从 1 开始。 */
  startLine: number;
}

/** 取 hunk 的某一侧原文（旧侧 = 非 add，新侧 = 非 del）。 */
function sideText(hunk: PatchHunk, side: 'old' | 'new'): string[] {
  const skip: PatchLineKind = side === 'old' ? 'add' : 'del';
  return hunk.lines.filter((line) => line.kind !== skip).map((line) => line.text);
}

/**
 * 把解析结果摊平成「一个 hunk 一条」的卡片差异。
 *
 * 与 {@link FilePatch} 的 `oldText` / `newText`（整个文件的所有 hunk 拼在一起）不同，这里刻意
 * **按 hunk 拆开**，因为差异卡片是一 hunk 一张卡，而 `newStart` 正是那张卡该从第几行开始编号。
 *
 * @param files - 解析结果。
 * @returns 每个 hunk 一条差异，顺序与文件里出现的顺序一致。
 */
export function hunkDiffsOf(files: readonly FilePatch[]): HunkDiff[] {
  const out: HunkDiff[] = [];
  for (const file of files) {
    for (const hunk of file.hunks) {
      const oldLines = sideText(hunk, 'old');
      out.push({
        path: file.path,
        oldText: oldLines.length === 0 ? null : oldLines.join('\n'),
        newText: sideText(hunk, 'new').join('\n'),
        startLine: hunk.newStart > 0 ? hunk.newStart : 1,
      });
    }
  }
  return out;
}
