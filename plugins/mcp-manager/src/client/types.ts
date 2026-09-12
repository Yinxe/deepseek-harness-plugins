/**
 * Client 半共享类型（设置页）
 * 与 Host 的 /ext/dshp-mcp-manager/* 路由协议对齐（host/types.ts 同名字段）
 */

export interface EnvValueView {
  js: boolean;
  source: string;
}

export interface McpServerView {
  id: string;
  dup: boolean;
  serverName: string;
  transport: 'stdio' | 'streamable-http' | '';
  disabled: boolean;
  disabledIsJs: boolean;
  command: string;
  args: string[];
  env: Record<string, EnvValueView>;
  cwd: string;
  url: string;
  headers: Record<string, EnvValueView>;
  toolCallTimeoutMs: number | null;
  failOnStartupError: boolean | null;
  reconnect: unknown;
  extras: Record<string, unknown>;
  unmanageable: boolean;
  /** 运行时已注册的 mcp__<serverName>__* 工具数；null = 无法枚举（tools 服务缺席） */
  toolCount: number | null;
  issues: string[];
  line: number | null;
}

export interface ProbeResult {
  state: 'ok' | 'fail' | 'skip';
  detail: string;
  serverInfoName: string;
  serverInfoVersion: string;
  protocolVersion: string;
  latencyMs: number | null;
  at: number;
}

export interface PatchFileInfo {
  path: string;
  exists: boolean;
  source: 'settings' | 'env' | 'module-path' | 'profile-scan' | 'fallback';
}

export interface McpState {
  enabled: boolean;
  patchFile: PatchFileInfo;
  servers: McpServerView[];
  probes: Record<string, ProbeResult>;
  fileIssue: string;
}

export interface StateResponse {
  ok: boolean;
  state?: McpState;
  error?: string;
}

export interface MutateResponse {
  ok: boolean;
  state?: McpState;
  error?: string;
}

export interface ProbeResponse {
  ok: boolean;
  probe?: ProbeResult;
  error?: string;
}

/** env/headers 文本框里的 JSON 形态：js 值序列化为 "js: <源码>" */
export type EnvJson = Record<string, string>;

/** DSH __ModuleLoader__ 的 require（运行时提供 react / primitives） */
export type DshRequire = (id: 'react' | '@deepseek-ai/dsh-client-ui-primitives' | string) => any;
export type AnyReact = any;
export type AnyPrimitives = any;
