/**
 * Client 半共享类型（设置页 + 侧边栏）
 * 与 Host 的 /ext/dshp-token-meter/* 路由协议对齐
 *
 * 合并来源：
 *  - quota：client.js 的 state/config/snaps/providers 协议
 *  - stats：client.js 的 data/state/config 协议
 */

export interface QuotaWindow {
  key: string;
  label: string;
  pct: number;
  used: number;
  limit: number;
  resetInSec: number;
  /** 上游窗口状态原值（非 `ok` = 已限流/停用，UI 需显式提示） */
  status?: string;
}

export interface QuotaBilling {
  balance?: number;
  currency?: string;
  granted?: number | null;
  toppedUp?: number | null;
  isAvailable?: boolean | null;
  infos?: Array<{ currency: string; total: number; granted: number | null; toppedUp: number | null }>;
  lowWarn?: number | null;
  plan?: string;
}

export interface ProviderBlock {
  kind: 'kv' | 'progress' | 'split' | 'note';
  label?: string;
  value?: string;
  used?: number;
  total?: number;
  left?: string;
  segments?: Array<{ label: string; value: number; color?: string }>;
  text?: string;
  tone?: 'info' | 'warn' | 'bad';
}

export interface ProviderExtra {
  stats?: Array<{ label: string; value: string }>;
  chart?: { title: string; labels: string[]; values: number[] };
  blocks?: ProviderBlock[];
}

/**
 * provider 视图区块（与 host/types.ts 对齐）。
 * 供应商自描述「自己的数据 + 排版」，客户端按 kind 分发渲染 —— 无需认识具体供应商。
 * 未知 kind / 字段缺失一律跳过（前向兼容：老客户端遇到新 provider 不崩）。
 */
export interface ProviderSection {
  kind: 'windows' | 'balance' | 'metrics' | 'progress' | 'split' | 'note' | 'chart';
  key?: string;
  title?: string;
  windows?: QuotaWindow[];
  billing?: QuotaBilling;
  items?: Array<{ label: string; value: string }>;
  progress?: { label?: string; used: number; total: number; left?: string };
  split?: { segments: Array<{ label: string; value: number; color?: string }> };
  note?: { text: string; tone?: 'info' | 'warn' | 'bad' };
  chart?: { title?: string; labels: string[]; values: number[] };
}

export interface ProviderView {
  sections: ProviderSection[];
}

/** 失败原因分类（与 host/errors.ts 对齐） */
export type ErrorKind =
  'auth' | 'session' | 'plan' | 'balance' | 'rate' | 'network' | 'parse' | 'config' | 'server' | 'unknown';

export type ErrorTone = 'bad' | 'warn' | 'info';

/** 结构化失败信息：标题/解释/去哪改/排查步骤/严重度（客户端只负责渲染） */
export interface ErrorInfo {
  kind: ErrorKind;
  title: string;
  hint: string;
  action?: string;
  steps: string[];
  detail: string;
  status?: number;
  docs?: string;
  retriable: boolean;
  tone: ErrorTone;
}

export interface VendorSnapshot {
  vendorId: string;
  vendorName: string;
  ok: boolean;
  at: string;
  fetchedAtMs: number;
  billingKind?: 'rolling' | 'payg';
  windows?: QuotaWindow[];
  billing?: QuotaBilling;
  /** 供应商自描述视图（分层渲染第 2 层；无则走 legacy 兜底） */
  view?: ProviderView | null;
  secretKind?: string;
  extra?: ProviderExtra | null;
  via?: string;
  /** 失败原始文案 */
  error?: string;
  /** 失败结构化信息（友好提示与详情） */
  errorInfo?: ErrorInfo;
}

export interface ProviderField {
  key: string;
  label: string;
  kind: 'text' | 'secret' | 'number' | 'select';
  mono?: boolean;
  placeholder?: string;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  showWhen?: { key: string; eq: string };
  hint?: string;
}

export interface ProviderMeta {
  type: string;
  label: string;
  title: string;
  secretField: string;
  hint: string;
  fields: ProviderField[];
  /** 新增供应商时的 params 初始值（provider 自声明；缺省 {}） */
  defaultParams?: Record<string, unknown>;
}

export interface Vendor {
  id: string;
  name: string;
  type: string;
  params: Record<string, unknown>;
  secretKind?: string;
  /** 余额查询开关：false = 不参与 Host 定时拉取（手动拉取不受影响）；缺省 = 启用 */
  enabled?: boolean;
}

export type DefaultRange = '7' | '30' | '90' | 'all';

export interface TokenMeterConfig {
  version: number;
  activeVendor: string;
  refreshSec: number;
  enabled: boolean;
  vendors: Vendor[];
  showToday: boolean;
  defaultRange: DefaultRange;
  /** 在线时长空闲阈值（分钟，1/5/15/30/60；缺省 5） */
  onlineGapMin: number;
}

export interface QuotaStateResponse {
  ok: boolean;
  namespace?: string;
  docPath?: string;
  config?: TokenMeterConfig;
  snaps?: Record<string, VendorSnapshot>;
  providers?: ProviderMeta[];
  providerTypes?: string[];
  error?: string;
}

export interface StatsRecord {
  d: string;
  h: number;
  m: string;
  i: number;
  o: number;
  cr: number;
  cw: number;
  n: number;
}

export interface StatsOnlineDay {
  d: string;
  sessions: number;
  tokens: number;
  turnMs: number;
  byGap: Record<string, number>;
  segByGap: Record<string, number>;
  llmMs: number;
  toolMs: number;
}

export interface StatsOnline {
  defaultGapMin: number;
  gaps: number[];
  totalMs: Record<string, number>;
  segments: Record<string, number>;
  turnMs: number;
  llmMs: number;
  toolMs: number;
  activeDays: number;
  firstDay: string | null;
  lastDay: string | null;
  days: StatsOnlineDay[];
}

export interface StatsSnapshot {
  ready: boolean;
  records: StatsRecord[];
  models: Record<string, { provider: string; model: string }>;
  daySessions: Record<string, number>;
  peakStep: { tokens: number; d: string; model: string } | null;
  range: { first: string; last: string } | null;
  sessions: number;
  active: number;
  partial: boolean;
  scanned: number;
  total: number;
  errors: number;
  /** 扫描失败原因样本（最多 5 条） */
  errorSamples?: Array<{ id: string; message: string }>;
  /** 靠直读日志兜底拿到的会话数 */
  directReads?: number;
  /** 会话结局分类计数 */
  sessionOutcomes?: Record<string, number>;
  storage: string;
  generatedAt: number;
  /** 在线时长估算（老 Host 无此字段 → 面板自行降级提示） */
  online?: StatsOnline;
  error?: string;
}

export type ConfigPatch = Partial<
  Pick<
    TokenMeterConfig,
    'enabled' | 'showToday' | 'defaultRange' | 'refreshSec' | 'activeVendor' | 'onlineGapMin'
  >
>;

/** DSH __ModuleLoader__ 的 require（运行时提供 react / primitives） */
export type DshRequire = (id: 'react' | '@deepseek-ai/dsh-client-ui-primitives' | string) => any;
export type AnyReact = any;
export type AnyPrimitives = any;
