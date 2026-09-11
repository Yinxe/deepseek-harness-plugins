/**
 * Client 半共享类型（设置页）
 * 与 Host 的 /ext/dshp-inx-vision-bridge/* 路由协议对齐
 */

export interface VisionRoute {
  provider: string;
  model: string;
  name?: string;
}

export interface VisionConfig {
  enabled: boolean;
  primary: VisionRoute | null;
  fallback: VisionRoute | null;
  detail: 'auto' | 'low' | 'high';
  maxImages: number;
  promptTemplate: string;
}

export interface VisionModel extends VisionRoute {
  name: string;
}

export interface StateResponse {
  ok: boolean;
  models?: VisionModel[];
  config?: VisionConfig;
  visionModelCount?: number;
  admissionTakeover?: boolean;
  error?: string;
}

export interface ProbeResult {
  ok: boolean;
  message: string;
}

export interface CheckResponse {
  ok: boolean;
  primary?: ProbeResult;
  fallback?: ProbeResult;
  error?: string;
}

export type ConfigPatch = Partial<VisionConfig>;

/** DSH __ModuleLoader__ 的 require（运行时提供 react / primitives） */
export type DshRequire = (id: 'react' | '@deepseek-ai/dsh-client-ui-primitives' | string) => any;
export type AnyReact = any;
export type AnyPrimitives = any;
