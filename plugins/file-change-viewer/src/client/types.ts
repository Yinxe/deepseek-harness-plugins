/**
 * Client 半共享类型
 *
 * 数据来源两条，都与官方实现逐字段对齐（不 import 官方类型包——DSH 运行时暂无
 * 官方 npm 类型包，见 AGENT.md §2.2）：
 *
 *  1. `dsh-tool-fs` 的 edit / write 结果元数据 `meta.diffs`（真正落盘的 hunk，每 hunk 带 3 行上下文）；
 *  2. 调用尚未结算时的参数原文 `argsRaw`（模型产出的 JSON，可能只写了一半）。
 *
 * 卡片渲染本身交给官方 primitives（`DiffBlock` / `DisclosureRow`），
 * 这里只建模「我们要读的那几个 leaf 字段」。
 */

/** DSH __ModuleLoader__ 的 require（运行时提供 react / primitives） */
export type DshRequire = (id: 'react' | '@deepseek-ai/dsh-client-ui-primitives' | string) => any;
export type AnyReact = any;
export type AnyPrimitives = any;
export type AnyCtx = any;

/**
 * 一次文件变更的 hunk。
 * 与 `@deepseek-ai/dsh-tool-fs` 的 `FileDiff` 同形：纯插入/新文件 `oldText` 为 null。
 */
export interface FileDiff {
  path: string;
  oldText: string | null;
  newText: string;
}

/** 调用语义状态（决定卡片配色与角标）。 */
export type FileChangeState = 'running' | 'ok' | 'error';

/**
 * 卡片主体视图。
 *
 * - `highlight`：官方 `CodeBlock`（真 shiki 着色 + 行号），每个 hunk 拆成「− 旧块 / + 新块」；
 * - `diff`：官方 `DiffBlock` 的逐行 ± 红绿合并 diff（紧凑）。
 *
 * 两个视图都是官方组件，差别只在「代码块形态」与「逐行差异形态」——官方高亮器没有
 * 「只给某一行的着色碎片」这种接口，所以逐行 ± 与真高亮无法同时存在于一个布局里。
 */
export type FileChangeView = 'highlight' | 'diff';

/**
 * 这次变更到底有没有落盘——卡片右上角标就是它。
 *
 * - `streaming`：调用进行中，参数还在流式生成（内容可能不完整）；
 * - `pending`：调用进行中，参数已完整（即将应用）；
 * - `applied`：调用成功结算；
 * - `rejected`：调用失败（变更未落盘，展示的是「本来要改什么」）。
 */
export type FileChangeBadge = 'streaming' | 'pending' | 'applied' | 'rejected';

/** 正在执行的调用（`RunningToolCall` 的用到的字段）。 */
export interface RunningToolCallLike {
  name: string;
  /** 模型产出的参数原文；流式生成期间可能是半截 JSON。 */
  argsRaw: string;
  /** 子调用（Code Dispatch）时存在；本插件的渲染不区分。 */
  parentCallId?: string | undefined;
}

/** 已结算的调用（`ToolResultNode` 的用到的字段）。 */
export interface ToolResultBlockLike {
  kind: 'tool-result';
  /** 窗口截断可能让 call head 落在窗口外，此时为 null。 */
  call: { name: string; argsRaw: string } | null;
  isError: boolean;
  /** 工具结果元数据；edit / write 在这里给 `diffs`。 */
  meta?: unknown;
  content: readonly unknown[];
  error?: { name: string; code: string } | undefined;
}

export type ToolCallBlockLike = RunningToolCallLike | ToolResultBlockLike;

/** 由一次调用推导出的渲染模型（纯函数产物，diff.ts 负责）。 */
export interface FileChangeModel {
  state: FileChangeState;
  /** 要交给 DiffBlock 的 hunk 列表；空数组表示没有可渲染的变更。 */
  diffs: FileDiff[];
  badge: FileChangeBadge;
  /** 首 hunk 是纯新增（新文件 / 纯插入）。 */
  newFile: boolean;
  /** edit 带了 replace_all: true。 */
  replaceAll: boolean;
  /** 失败调用的首行错误文本；非失败为 null。 */
  errorText: string | null;
  /** 参数可解析成对象时的结果，供无 diff 时兜底展示。 */
  parsedArgs: Record<string, unknown> | null;
  /** 参数原文，供无 diff 且不可解析时兜底展示。 */
  rawArgs: string;
}

/** DiffBlock 的本地化文案契约（字段名与官方 `diffBlockLabels(t)` 一致）。 */
export interface DiffBlockLabels {
  copy: string;
  copied: string;
  collapseAria: string;
  expandAria: (hidden: number) => string;
  collapse: string;
  expand: (hidden: number) => string;
  files: (count: number) => string;
}

/**
 * `tool.call.toolview` 交给我们的 props（owner + locale seat）。
 *
 * 注册时传 `locale: 'conversation'`，框架才会注入 `t`；`cwd` / `home` 只用于把
 * 绝对路径显示成工作区相对路径与 `~`。
 */
export interface ToolViewProps {
  callId: string;
  toolName: string;
  block: ToolCallBlockLike;
  cwd?: string | undefined;
  home?: string | undefined;
  openFile: (path: string, options?: { line?: number | undefined }) => void;
  inspect?: (() => void) | undefined;
  t: (key: string, params?: Record<string, unknown>) => string;
}

/** slots 服务（本插件只用 inject + register）。 */
export interface SlotsService {
  inject(name: string, fn: () => unknown): unknown;
  /**
   * 注册一个槽位条目。
   *
   * `priority` 是 keyed 槽位的影子化开关：同 key 同 priority 会抛错，派发取 priority
   * 最小的一条（官方内置卡片为 0，接管必须用负数）。
   */
  register(spec: { name: string; key: string; locale: string; priority: number }, component: any): unknown;
}
