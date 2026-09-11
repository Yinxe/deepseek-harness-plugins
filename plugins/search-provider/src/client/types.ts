/**
 * Client 侧协议类型（与 host 的 routes.ts / types.ts 对齐）与运行时注入声明
 *
 * 原实现：dsh-tavily-search/client.js 里散落的隐式结构（JS）
 * → 本文件为 TS 重写新增：把路由协议显式化，多供应商字段与 host 保持一致。
 *
 * @module @dshp/search-provider/client
 */

/** __ModuleLoader__ 注入的 require（react / primitives 由 DSH 运行时提供，绝不打包） */
export interface DshRequire {
  (id: 'react'): any;
  (id: '@deepseek-ai/dsh-client-ui-primitives'): any;
  (id: string): any;
}

declare global {
  interface Window {
    __ModuleLoader__?: {
      load: (mod: { id: string; factory: (require: DshRequire) => unknown }) => void;
    };
  }
}

// ── 供应商元数据 / 状态 ─────────────────────────────────────────────────────

export interface ProviderFieldOption {
  value: string;
  label: string;
}

export interface ProviderField {
  key: string;
  label: string;
  kind: 'text' | 'number' | 'select';
  options?: ProviderFieldOption[];
  hint?: string;
  mono?: boolean;
  placeholder?: string;
}

export interface ProviderState {
  id: string;
  label: string;
  title: string;
  credentialRef: string;
  homepage: string;
  description: string;
  fields: ProviderField[];
  configured: boolean;
  source?: string;
  selected: boolean;
}

export interface SearchSource {
  url: string;
  title?: string;
  snippet?: string;
  publishedAt?: string;
}

/** 生效配置快照：通用字段 + 各供应商分节（键名 = provider id） */
export interface ConfigSnapshot {
  provider: string;
  maxResults: number;
  [providerId: string]: unknown;
}

export interface StateResponse {
  ok: boolean;
  namespace?: string;
  /** web seam 配置固定的提供方 id（profile patch / 环境变量；未固定为 null） */
  selectedProviderId?: string | null;
  /** 插件当前动态注册的提供方 id（settings 的 provider 决定；未注册为 null） */
  registeredProviderId?: string | null;
  providers?: ProviderState[];
  config?: ConfigSnapshot;
  extras?: Record<string, Record<string, unknown>>;
  selectionHint?: string;
  error?: string;
}

export interface ConfigSaveResponse {
  ok: boolean;
  config?: ConfigSnapshot;
  error?: string;
}

export interface TestResponse {
  ok: boolean;
  provider?: string;
  sources?: SearchSource[];
  error?: string;
  takenMs?: number;
}

export interface UsageResponse {
  ok: boolean;
  usage?: Record<string, unknown>;
  cached?: boolean;
  fetchedAt?: number;
  takenMs?: number;
  error?: string;
  /** 最新查询失败时附带的旧快照 */
  stale?: { usage: Record<string, unknown>; fetchedAt: number };
  /** 404/空响应等“Host 是旧版本”场景 */
  needsRestart?: boolean;
}

export interface CredentialReply {
  ok: boolean;
  error?: string;
  state?: StateResponse;
}

/** 路由前缀（与 host 的 ROUTE_BASE 一致） */
export const ROUTE_BASE = '/ext/dshp-search-provider';
