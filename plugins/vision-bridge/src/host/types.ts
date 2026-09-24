/**
 * @dshp/vision-bridge —— 共享类型定义
 *
 * DSH 运行时（Cordis ctx / tools / llm / settings / webServer）暂无官方 npm 类型包，
 * Host 侧统一用 `AnyCtx`（= any 的别名）透传，仅对本插件自有的数据结构做严格建模。
 * 这样既能过 `strict`，又不会与未来官方类型冲突。
 */
import type { Volatile } from '@deepseek-ai/cosmokit';

export type Detail = 'auto' | 'low' | 'high';

export interface VisionRoute {
  provider: string;
  model: string;
  /** 仅展示用，持久化时不存 */
  name?: string;
}

export interface PluginConfig {
  enabled: boolean;
  primary: VisionRoute | null;
  fallback: VisionRoute | null;
  detail: Detail;
  maxImages: number;
  promptTemplate: string;
}

/** `apply(ctx, config)` 收到的实参：ConfigSchema 全字段 volatile，每个字段是稳定引用，`.get()` 读当前深只读快照 */
export interface VolatileConfig {
  enabled: Volatile<boolean>;
  primary: Volatile<VisionRoute | null>;
  fallback: Volatile<VisionRoute | null>;
  detail: Volatile<Detail>;
  maxImages: Volatile<number>;
  promptTemplate: Volatile<string>;
}

/** 图片 leaf 的 owned copy（只取这几个字段，会话级缓存） */
export interface ImageRef {
  attachmentId: string;
  mediaType: string;
  bytes: number;
  width?: number;
  height?: number;
  name?: string;
}

/** 候选视觉模型（去重后） */
export interface CandidateModel {
  provider: string;
  model: string;
  name: string;
}

/** vision_describe 工具参数 */
export interface VisionDescribeArgs {
  question?: unknown;
  image_hint?: unknown;
  detail?: unknown;
}

/** DSH 运行时 ctx —— 暂无官方类型，透传 any */
export type AnyCtx = any;
export type AnySettings = any;
export type AnyLlm = any;
