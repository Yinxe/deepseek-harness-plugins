/**
 * @dshp/widget-kit —— 小组件规范的**公开类型契约**（供其它插件 `import type` 用）
 *
 * 用法（业务插件侧，只加 devDependency，运行时零 import）：
 *
 * ```ts
 * import type { WidgetDescriptor, WidgetContentProps } from '@dshp/widget-kit/spec';
 * ```
 *
 * 本文件是手写的、**自包含**的（除 `react` 的类型外不 import 任何东西），并且是
 * `src/client/spec.ts` 的镜像：`scripts/check-spec-drift.mjs` 逐字段比对两边，
 * 漂移即 `pnpm test` 失败。请不要手改这里的字段名而不改实现（反之亦然）。
 */

import type { ReactNode } from 'react';

/** 契约版本：破坏性变更 +1，迁移步骤写在 `docs/widget-spec.md`。 */
export declare const SPEC_VERSION: number;

/** 框架版本（等于 package.json 的 version）。 */
export declare const FRAMEWORK_VERSION: string;

/** 本插件的命名空间 = settings NS = cordis 行 id。组件 id 的前缀必须是自己的命名空间。 */
export declare const NS: string;

export interface WidgetSize {
  w: number;
  h: number;
}

export interface WidgetBox {
  width: number;
  height: number;
}

export interface WidgetBadge {
  text?: string;
  dot?: boolean;
  tone?: 'info' | 'ok' | 'warn' | 'bad';
  title?: string;
}

export interface WidgetBadgeContext {
  sessionId: string | null;
  signal: AbortSignal;
  frameworkVersion: string;
}

export interface WidgetLoadContext {
  sessionId: string | null;
  signal: AbortSignal;
  reason: 'open' | 'refresh' | 'retry';
}

/**
 * 内容面（popover / card）拿到的 props。
 *
 * 内容如何随尺寸变化**完全由提供方决定**：框架只给事实（`size` / `sizeClass` / `frame`）
 * 与一个受约束的 `setSize`，不干涉布局、不做内容驱动的自动尺寸。
 */
export interface WidgetContentProps<D = unknown> {
  frame: 'card' | 'popover';
  sessionId: string | null;
  status: 'loading' | 'ready' | 'error' | 'empty';
  data: D | undefined;
  error?: { message: string; retriable: boolean } | undefined;
  stale: boolean;
  lastUpdatedAt: number | null;
  size: WidgetBox | null;
  sizeClass: 'compact' | 'regular' | 'wide';
  setSize?(next: { w?: number; h?: number }): void;
  minimized: boolean;
  refresh(): void;
  retry(): void;
  close(): void;
}

export interface WidgetCardOptions {
  defaultSize?: WidgetSize;
  minSize?: WidgetSize;
  maxSize?: WidgetSize;
  sizeClassBreakpoints?: { compact: number; wide: number };
  resizable?: boolean;
  minimizable?: boolean;
  closable?: boolean;
}

export interface WidgetTrayOptions<D = unknown> {
  badge?(ctx: WidgetBadgeContext): WidgetBadge | null | Promise<WidgetBadge | null>;
  badgeIntervalMs?: number;
  preview?(props: WidgetContentProps<D>): ReactNode;
}

export interface WidgetContentOptions<D = unknown> {
  title?: string | (() => string);
  load?(ctx: WidgetLoadContext): Promise<D>;
  refreshMs?: number;
  render(props: WidgetContentProps<D>): ReactNode;
}

export interface WidgetDescriptor<D = unknown> {
  id: string;
  title: string | (() => string);
  icon: ReactNode;
  subtitle?: string | (() => string);
  order?: number;
  presentation: 'tray' | 'popover' | 'card';
  tray?: WidgetTrayOptions<D>;
  content?: WidgetContentOptions<D>;
  card?: WidgetCardOptions;
  minFramework?: string;
}

/** 注册表对外的一行摘要（设置页/诊断组件只读这份）。 */
export interface WidgetSummary {
  id: string;
  title: string;
  owner: string;
  presentation: 'tray' | 'popover' | 'card';
}

/** 客户端服务 `ctx.widgets`（由本插件 `ctx.reflect.provide('widgets', …)` 发布）。 */
export interface WidgetsService {
  readonly specVersion: number;
  readonly frameworkVersion: string;
  register<D>(descriptor: WidgetDescriptor<D>): () => void;
  list(): readonly WidgetSummary[];
  subscribe(listener: () => void): () => void;
  open(id: string): void;
  close(id: string): void;
  toggle(id: string): void;
  isOpen(id: string): boolean;
  minimize(id: string): void;
  restore(id: string): void;
}
