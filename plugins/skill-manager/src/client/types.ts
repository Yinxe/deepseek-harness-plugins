/**
 * Client 半共享类型（设置页）
 * 与 Host 的 /ext/dshp-skill-manager/* 路由协议对齐（host/types.ts 同名字段）
 */

export interface RootInfo {
  id: string;
  label: string;
  scope: 'global' | 'workspace';
  workspace: string;
  path: string;
  rank: number;
  exists: boolean;
}

export interface SkillEntry {
  rootId: string;
  name: string;
  dirName: string;
  kind: 'bundle' | 'flat';
  description: string;
  whenToUse: string;
  modelInvocable: boolean;
  userInvocable: boolean;
  scope: 'global' | 'workspace';
  workspace: string;
  entryPath: string;
  valid: boolean;
  problem: string;
  shadowedBy: string;
}

export interface SkillState {
  enabled: boolean;
  dshHome: string;
  agentsHome: string;
  roots: RootInfo[];
  skills: SkillEntry[];
  workspaces: string[];
  workspaceRoot: string;
}

export interface StateResponse {
  ok: boolean;
  state?: SkillState;
  error?: string;
}

export interface ReadResponse {
  ok: boolean;
  entry?: SkillEntry;
  fields?: Array<{ key: string; value: string }>;
  body?: string;
  error?: string;
}

export interface ConfigResponse {
  ok: boolean;
  config?: { enabled: boolean; workspaceRoot: string };
  error?: string;
}

export interface CreatePayload {
  rootId: string;
  name: string;
  description: string;
  whenToUse?: string;
  body?: string;
  kind?: 'bundle' | 'flat';
}

export interface UpdatePayload {
  rootId: string;
  name: string;
  description?: string;
  whenToUse?: string;
  body?: string;
}

export interface TogglePayload {
  rootId: string;
  name: string;
  /** all = 整个技能启用/禁用（两个调用面一起切）；model / user = 单个调用面 */
  field: 'model' | 'user' | 'all';
  value: boolean;
}

export interface TransferPayload {
  fromRootId: string;
  fromName: string;
  toRootId: string;
  toName?: string;
  deleteSource?: boolean;
}

/** DSH __ModuleLoader__ 的 require（运行时提供 react / primitives） */
export type DshRequire = (id: 'react' | '@deepseek-ai/dsh-client-ui-primitives' | string) => any;
export type AnyReact = any;
export type AnyPrimitives = any;
