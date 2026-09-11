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
}

export interface Vendor {
  id: string;
  name: string;
  type: string;
  params: Record<string, unknown>;
  secretKind?: string;
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
  storage: string;
  generatedAt: number;
  error?: string;
}

export type ConfigPatch = Partial<
  Pick<TokenMeterConfig, 'enabled' | 'showToday' | 'defaultRange' | 'refreshSec' | 'activeVendor'>
>;

/** DSH __ModuleLoader__ 的 require（运行时提供 react / primitives） */
export type DshRequire = (id: 'react' | '@deepseek-ai/dsh-client-ui-primitives' | string) => any;
export type AnyReact = any;
export type AnyPrimitives = any;
