/**
 * Client 半共享类型（设置页）
 * 与 Host 的 /ext/dshp-mcwiki-search/* 路由协议对齐
 */

export interface McWikiConfig {
  timeoutMs: number;
  maxChars: number;
  introMaxChars: number;
  searchMaxResults: number;
}

export interface StateResponse {
  ok: boolean;
  timeoutMs?: number;
  maxChars?: number;
  introMaxChars?: number;
  searchMaxResults?: number;
  config?: McWikiConfig;
  tools?: string[];
  error?: string;
}

export interface TestResultItem {
  title: string;
  snippet: string;
  url: string;
  updated?: string;
}

export interface TestPage {
  title: string;
  section: 'intro' | 'full';
  format: 'text' | 'markdown';
  text: string;
  url: string;
}

export interface TestResponse {
  ok: boolean;
  query?: string;
  totalHits?: number;
  results?: TestResultItem[];
  page?: TestPage | null;
  takenMs?: number;
  error?: string;
}

export type ConfigPatch = Partial<McWikiConfig>;
export type TestKind = 'search' | 'page';

/** DSH __ModuleLoader__ 的 require（运行时提供 react / primitives） */
export type DshRequire = (id: 'react' | '@deepseek-ai/dsh-client-ui-primitives' | string) => any;
export type AnyReact = any;
export type AnyPrimitives = any;
