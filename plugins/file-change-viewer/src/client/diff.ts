/**
 * 文件变更推导（纯函数，无 React / 无 DOM / 无副作用）
 *
 * 输入一次工具调用的两份材料，输出卡片要渲染的最小模型：
 *
 * | 材料                 | 来源               | 用途                                         |
 * | -------------------- | ------------------ | -------------------------------------------- |
 * | `block.meta.diffs`   | 结算后的结果元数据 | **优先**：真正落盘的 hunk（含 3 行上下文）   |
 * | `block.call.argsRaw` | 调用参数原文       | 兜底 + 进行中：模型「打算」改什么            |
 *
 * 三条容易被忽略的规则（都对齐官方 `dsh-tool-fs` / `dsh-client-ui-tool`）：
 *
 * 1. `meta.diffs` 为**空数组**是合法且有意义的值：write 覆盖一个原本不存在的文件时，
 *    `presentationMeta` 给的就是 `{ diffs: [] }`。此时必须回落到参数推导，否则新文件
 *    会渲染成一张空白卡片。
 * 2. 参数 JSON 在**流式生成期间只是半截文本**：`JSON.parse` 必然失败。这正是本插件
 *    相对内置卡片的价值之一——宽容解析器逐字符读字符串字面量，让「正在写入」的内容
 *    当场可见。
 * 3. 失败的调用（`isError`）没有 `meta.diffs`，但我们仍然展示参数推导出的 hunk 并打上
 *    `rejected` 角标：用户要看到的是「它本来打算改什么」。
 *
 * `block` 是运行时 live 对象，形如官方 `RunningToolCall` / `ToolResultNode`，但窗口截断、
 * 版本漂移都可能让它缺字段，因此这里一律按 `unknown` 逐字段收窄（AGENT.md §2.2 / §11）。
 *
 * @module @dshp/file-change-viewer/client/diff
 */
import type {
  FileChangeBadge,
  FileChangeModel,
  FileChangeState,
  FileDiff,
  ToolResultBlockLike,
} from './types.js';

const EDIT_TOOL = 'edit';
const WRITE_TOOL = 'write';
const STR_REPLACE_TOOL = 'str_replace_editor';

/** 就地类型守卫（AGENT.md §2.2：不跨包共享）。 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** 已结算的调用（带 `kind: 'tool-result'`）还是进行中的调用。 */
export function isResultBlock(block: unknown): block is ToolResultBlockLike {
  return isRecord(block) && block['kind'] === 'tool-result';
}

/** 失败判定（只在已结算的块上有意义）。 */
function isErrored(block: unknown): boolean {
  return isRecord(block) && block['isError'] === true;
}

/** 调用头（工具名 + 参数原文），进行中与已结算两种形态共用。 */
interface CallHead {
  name: string;
  argsRaw: string;
}

/**
 * 读调用头：已结算的从 `block.call` 读（窗口截断时为 null），进行中的块自身就是调用头。
 *
 * @param block - 原始调用块。
 * @param settled - 是否已结算（由 {@link isResultBlock} 得出）。
 * @returns 工具名与参数原文，形状不对时 null。
 */
function readCallHead(block: unknown, settled: boolean): CallHead | null {
  const source = settled ? (isRecord(block) ? block['call'] : null) : block;
  if (!isRecord(source)) return null;
  const name = source['name'];
  const argsRaw = source['argsRaw'];
  if (typeof name !== 'string' || typeof argsRaw !== 'string') return null;
  return { name, argsRaw };
}

/**
 * 收窄结果元数据里的 `diffs`（与官方 `diffsFromMeta` 同判定）。
 *
 * @param meta - 工具结果的 `meta`（不透明值）。
 * @returns 校验后的 hunk 列表；缺失/格式不对/空数组一律 null（交由参数推导兜底）。
 */
export function readAppliedDiffs(meta: unknown): FileDiff[] | null {
  if (!isRecord(meta)) return null;
  const diffs = meta['diffs'];
  if (!Array.isArray(diffs) || diffs.length === 0) return null;
  const out: FileDiff[] = [];
  for (const hunk of diffs) {
    if (!isRecord(hunk)) return null;
    const path = hunk['path'];
    const oldText = hunk['oldText'];
    const newText = hunk['newText'];
    if (typeof path !== 'string') return null;
    if (oldText !== null && typeof oldText !== 'string') return null;
    if (typeof newText !== 'string') return null;
    out.push({ path, oldText, newText });
  }
  return out;
}

/** 参数原文能整体解析成对象时返回它，否则 null（半截 JSON 走 readJsonString）。 */
function parseArgs(rawArgs: string): Record<string, unknown> | null {
  try {
    const value: unknown = JSON.parse(rawArgs);
    return isRecord(value) ? value : null;
  } catch {
    return null;
  }
}

/** JSON 字符串字面量里的单字符转义还原表（半截文本同样适用）。 */
const SIMPLE_ESCAPES: Record<string, string> = {
  '"': '"',
  '\\': '\\',
  '/': '/',
  b: '\b',
  f: '\f',
  n: '\n',
  r: '\r',
  t: '\t',
};

/**
 * 从可能**尚未写完**的 JSON 文本里读一个字符串字段。
 *
 * 与 `JSON.parse` 的区别：不要求闭合引号/括号，遇到流末尾就停下；读到完整转义才还原，
 * 残缺的 `\` 或 `\u12` 直接截断（不会把半个转义当字符）。这样流式期间的 `content` /
 * `new_string` 可以逐帧显示。
 *
 * @param raw - 参数原文（可能半截）。
 * @param key - 字段名。
 * @returns 已还原的字符串；字段不存在或值不是字符串时 undefined。
 */
export function readJsonString(raw: string, key: string): string | undefined {
  const marker = '"' + key + '"';
  const at = raw.indexOf(marker);
  if (at < 0) return undefined;
  let i = at + marker.length;
  while (i < raw.length && raw[i] !== ':') i += 1;
  if (i >= raw.length) return undefined;
  i += 1;
  while (i < raw.length && (raw[i] === ' ' || raw[i] === '\t' || raw[i] === '\n' || raw[i] === '\r')) i += 1;
  if (raw[i] !== '"') return undefined;
  i += 1;
  let out = '';
  while (i < raw.length) {
    const ch = raw[i] as string;
    if (ch === '\\') {
      const next = raw[i + 1];
      if (next === undefined) break;
      if (next === 'u') {
        const hex = raw.slice(i + 2, i + 6);
        if (!/^[0-9a-fA-F]{4}$/.test(hex)) break;
        out += String.fromCharCode(parseInt(hex, 16));
        i += 6;
        continue;
      }
      out += SIMPLE_ESCAPES[next] ?? next;
      i += 2;
      continue;
    }
    if (ch === '"') break;
    out += ch;
    i += 1;
  }
  return out;
}

/** 一次参数推导出的变更。 */
export interface IntendedChange {
  diffs: FileDiff[];
  replaceAll: boolean;
  /** 参数 JSON 是否已完整（false = 仍在流式生成）。 */
  complete: boolean;
}

/**
 * 从调用参数推导「模型打算做的变更」。
 *
 * 支持的三个工具与各自的字段：
 * - `write`：`content`（整文件写入，`oldText` 恒为 null）；
 * - `edit`：`old_string` / `new_string` / `replace_all`；
 * - `str_replace_editor`：`command: create` + `file_text`，或 `command: str_replace` + `old_str` / `new_str`。
 *
 * @param toolName - 线上工具名（分发来源，窗口截断时仍可知）。
 * @param rawArgs - 参数原文，可能半截。
 * @returns 推导结果；字段不全（例如 `new_string` 还没流出来）返回 null，交给原始参数兜底。
 */
export function readIntended(toolName: string, rawArgs: string): IntendedChange | null {
  if (rawArgs === '') return null;
  const args = parseArgs(rawArgs);
  const complete = args !== null;
  const readString = (key: string): string | undefined => {
    if (args !== null) {
      const value = args[key];
      if (typeof value === 'string') return value;
    }
    return readJsonString(rawArgs, key);
  };
  const path = readString('file_path') ?? readString('path');
  if (path === undefined || path.trim() === '') return null;

  if (toolName === WRITE_TOOL) {
    const content = readString('content');
    if (content === undefined) return null;
    return { diffs: [{ path, oldText: null, newText: content }], replaceAll: false, complete };
  }

  if (toolName === STR_REPLACE_TOOL) {
    const command = readString('command');
    if (command === 'create') {
      const fileText = readString('file_text');
      if (fileText === undefined) return null;
      return { diffs: [{ path, oldText: null, newText: fileText }], replaceAll: false, complete };
    }
    if (command === 'str_replace') {
      const oldStr = readString('old_str');
      const newStr = readString('new_str');
      if (oldStr === undefined || newStr === undefined) return null;
      return {
        diffs: [{ path, oldText: oldStr === '' ? null : oldStr, newText: newStr }],
        replaceAll: false,
        complete,
      };
    }
    return null;
  }

  if (toolName !== EDIT_TOOL) return null;
  const oldString = readString('old_string');
  const newString = readString('new_string');
  if (oldString === undefined || newString === undefined) return null;
  const replaceAll = args !== null && args['replace_all'] === true;
  return {
    diffs: [{ path, oldText: oldString === '' ? null : oldString, newText: newString }],
    replaceAll,
    complete,
  };
}

/** 取首个非空行（失败卡片只显示一行，与官方行内卡片一致）。 */
function firstLine(text: string): string | null {
  for (const line of text.split('\n')) {
    if (line.trim() !== '') return line;
  }
  return null;
}

/**
 * 失败调用的首行说明：先看结果文本，再看结构化错误。
 *
 * @param block - 已结算的调用块（不透明）。
 * @returns 一行错误文本，取不到时 null。
 */
function readErrorLine(block: unknown): string | null {
  if (!isRecord(block)) return null;
  const content = block['content'];
  if (Array.isArray(content)) {
    const parts: string[] = [];
    for (const part of content) {
      if (isRecord(part) && typeof part['text'] === 'string') parts.push(part['text']);
    }
    const line = firstLine(parts.join('\n'));
    if (line !== null) return line;
  }
  const error = block['error'];
  if (isRecord(error)) return String(error['name']) + ': ' + String(error['code']);
  return null;
}

/**
 * 推导一张卡片要渲染的全部内容。
 *
 * @param toolName - 线上工具名（分发来源）。
 * @param block - 进行中或已结算的调用块（运行时 live 对象，按 unknown 收窄）。
 * @returns 卡片模型；`diffs` 为空数组表示只能展示原始参数或错误行。
 */
export function buildModel(toolName: string, block: unknown): FileChangeModel {
  const settled = isResultBlock(block);
  const call = readCallHead(block, settled);
  const name = call !== null && call.name !== '' ? call.name : toolName;
  const rawArgs = call !== null ? call.argsRaw : '';

  const state: FileChangeState = settled ? (isErrored(block) ? 'error' : 'ok') : 'running';
  const errorText = state === 'error' ? readErrorLine(block) : null;

  const meta = isRecord(block) ? block['meta'] : undefined;
  const applied = settled && state === 'ok' ? readAppliedDiffs(meta) : null;
  const intended = readIntended(name, rawArgs);
  const diffs = applied ?? intended?.diffs ?? [];

  let badge: FileChangeBadge;
  if (state === 'error') badge = 'rejected';
  else if (state === 'ok') badge = 'applied';
  else badge = intended !== null && !intended.complete ? 'streaming' : 'pending';

  return {
    state,
    diffs,
    badge,
    newFile: diffs.length > 0 && diffs.every((diff) => diff.oldText === null),
    replaceAll: intended?.replaceAll === true,
    errorText,
    parsedArgs: parseArgs(rawArgs),
    rawArgs,
  };
}

/** Windows 盘符或 UNC 路径（这两类不做 POSIX 的 `~` / 工作区相对化）。 */
function isWindowsStylePath(path: string): boolean {
  return /^[A-Za-z]:[\\/]/.test(path) || path.startsWith('\\\\');
}

/** 去掉工作区前缀，只用于显示（不改变真正打开的路径）。 */
function relativizeToCwd(text: string, cwd: string | undefined): string {
  if (cwd === undefined || cwd === '') return text;
  const root = cwd.replace(/[/\\]+$/, '');
  if (text.startsWith(root + '/') || text.startsWith(root + '\\')) return text.slice(root.length + 1);
  return text;
}

/** POSIX home 及其子孙显示成 `~`（与官方 `abbreviateHomePath` 同判定）。 */
function abbreviateHomePath(path: string, home: string | undefined): string {
  if (home === undefined || home === '') return path;
  if (isWindowsStylePath(path) || isWindowsStylePath(home)) return path;
  const root = home.replace(/\/+$/, '');
  if (root === '' || root === '/') return path;
  if (path.replace(/\/+$/, '') === root) return '~';
  if (path.startsWith(root + '/')) return '~' + path.slice(root.length);
  return path;
}

/**
 * 卡片上显示的路径：工作区相对路径优先，其次 `~` 缩写。
 *
 * @param path - 工具参数里的原始路径。
 * @param cwd - 会话工作区根。
 * @param home - Host 账户 home。
 * @returns 供显示的短路径。
 */
export function displayPath(path: string, cwd?: string | undefined, home?: string | undefined): string {
  return abbreviateHomePath(relativizeToCwd(path, cwd), home);
}
