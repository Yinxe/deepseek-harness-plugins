/**
 * @dshp/token-meter —— 共享类型定义
 *
 * DSH 运行时（Cordis ctx / tools / llm / settings / webServer）暂无官方 npm 类型包，
 * Host 侧统一用 `AnyCtx`（= any 的别名）透传，仅对本插件自有的数据结构做严格建模。
 *
 * 合并来源：
 *  - quota：~/.dsh/plugins/dsh-token-quota（@dshp-inx/token-quota v1.0.1）
 *    lib/config.js + lib/secrets.js + lib/providers/*.js + lib/index.js 的隐式结构
 *  - stats：~/.dsh/plugins/dsh-token-stats（@dshp-inx/token-stats v1.1.3）
 *    lib/fold.js + lib/engine.js + lib/index.js 的聚合快照结构
 * 本文件为 TS 重写新增：把两边散落的隐式结构显式化，行为不变。
 */

export interface Vendor {
  id: string;
  name: string;
  type: string;
  params: Record<string, unknown>;
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
  secretKind?: string;
  extra?: ProviderExtra | null;
  via?: string;
  error?: string;
}

export interface QuotaWindow {
  key: string;
  label: string;
  pct: number;
  used: number;
  limit: number;
  resetInSec: number;
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
  [key: string]: unknown;
}

export interface ProviderFieldOption {
  value: string;
  label: string;
}

export interface ProviderField {
  key: string;
  label: string;
  kind: 'text' | 'secret' | 'number' | 'select';
  mono?: boolean;
  placeholder?: string;
  required?: boolean;
  options?: ProviderFieldOption[];
  showWhen?: { key: string; eq: string };
  hint?: string;
}

export interface ProviderDeps {
  resolveSecret: (raw: string) => Promise<{ value: string; kind: string }>;
  fetchImpl: typeof fetch;
}

export interface ProviderResult {
  billingKind: 'rolling' | 'payg';
  windows?: QuotaWindow[];
  billing?: QuotaBilling;
  extra?: ProviderExtra | null;
  secretKind?: string;
  via?: string;
}

export interface ProviderExtra {
  stats?: Array<{ label: string; value: string }>;
  chart?: { title: string; labels: string[]; values: number[] };
  blocks?: ProviderBlock[];
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

export interface ProviderAdapter {
  type: string;
  label: string;
  title: string;
  secretField: string;
  secretFields?: string[];
  fields: ProviderField[];
  hint?: string;
  sanitizeParams?: (raw: unknown) => Record<string, unknown>;
  validateParams?: (params: Record<string, unknown>) => string;
  readSecret?: (params: Record<string, unknown>) => unknown;
  maskParams?: (params: Record<string, unknown>) => Record<string, unknown>;
  fetch: (vendor: Vendor, deps: ProviderDeps) => Promise<ProviderResult>;
}

export interface ProviderMeta {
  type: string;
  label: string;
  title: string;
  secretField: string;
  hint: string;
  fields: ProviderField[];
}

// ── stats 聚合 ─────────────────────────────────────────────────────────────

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

export interface StatsModelInfo {
  provider: string;
  model: string;
}

export interface StatsPeak {
  tokens: number;
  d: string;
  model: string;
}

export interface StatsSnapshot {
  ready: boolean;
  records: StatsRecord[];
  models: Record<string, StatsModelInfo>;
  daySessions: Record<string, number>;
  peakStep: StatsPeak | null;
  range: { first: string; last: string } | null;
  sessions: number;
  active: number;
  partial: boolean;
  scanned: number;
  total: number;
  errors: number;
  storage: string;
  generatedAt: number;
  error?: string;
}

// ── 插件配置（settings.yaml: dshp-token-meter）─────────────────────────────

export type DefaultRange = '7' | '30' | '90' | 'all';

export interface PluginConfig {
  version: number;
  activeVendor: string;
  refreshSec: number;
  enabled: boolean;
  vendors: Vendor[];
  showToday: boolean;
  defaultRange: DefaultRange;
}

/** settings.patch / cordis.patch.yml 里允许的部分覆盖（全部可选） */
export interface PluginConfigPatch {
  version?: number;
  activeVendor?: string;
  refreshSec?: number;
  enabled?: boolean;
  vendors?: Vendor[];
  showToday?: boolean;
  defaultRange?: DefaultRange;
}

// ── 同源路由协议（host ↔ client/types.ts 对齐）─────────────────────────────

export interface SanitizedVendor extends Vendor {
  secretKind: string;
}

export interface SanitizedQuotaConfig {
  version: number;
  activeVendor: string;
  refreshSec: number;
  enabled: boolean;
  vendors: SanitizedVendor[];
}

export interface StateResponse {
  ok: boolean;
  namespace?: string;
  docPath?: string;
  config?: SanitizedQuotaConfig & { showToday: boolean; defaultRange: DefaultRange };
  snaps?: Record<string, VendorSnapshot>;
  providers?: ProviderMeta[];
  providerTypes?: string[];
  error?: string;
}

export interface StatsDataResponse extends StatsSnapshot {}

export interface ConfigSaveResponse {
  ok: boolean;
  config?: PluginConfig;
  error?: string;
}

/** DSH 运行时 ctx —— 暂无官方类型，透传 any */
export type AnyCtx = any;
export type AnySettings = any;
