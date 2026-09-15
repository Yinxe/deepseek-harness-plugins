/**
 * 配置：默认值 / schemastery schema / 补丁消毒
 *
 * 这里存的是**用户配置**（进 settings.yaml 的 `dshp-widget-kit` 分节）；
 * **本机布局**（托盘顺序、卡片位置尺寸、隐藏集合）在浏览器 localStorage，不经 Host。
 * 只认 NS，不做历史 key / 旧文件迁移。
 *
 * @module @dshp/widget-kit/host/config
 */
import z from '@deepseek-ai/schemastery';
import { settingsNamespace } from './http.js';
import type { FrameworkConfig, FrameworkConfigPatch } from './types.js';

/** 命名空间（= cordis 行 id = 路由前缀段 = 组件 id 前缀）。 */
export const NS: string = settingsNamespace('dshp-widget-kit');

/** 框架版本。必须等于 package.json 的 version（scripts/check-spec-drift.mjs 比对）。 */
export const FRAMEWORK_VERSION = '0.4.3';

/** 契约版本（与 client 侧 spec.ts 的 SPEC_VERSION 同步）。 */
export const SPEC_VERSION = 1;

export const DEFAULT_CONFIG: FrameworkConfig = {
  trayEnabled: true,
  maxVisibleIcons: 4,
  badgeIntervalMs: 30000,
  hoverPreview: true,
  referenceWidgets: true,
};

export const ConfigSchema: any = z.object({
  trayEnabled: z.boolean().default(true),
  maxVisibleIcons: z.number().step(1).min(1).max(8).default(4),
  badgeIntervalMs: z.number().step(1).min(5000).max(600000).default(30000),
  hoverPreview: z.boolean().default(true),
  referenceWidgets: z.boolean().default(true),
});

function isRecord(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

/**
 * 消毒 `cordis.patch.yml` 的 base 层与 `/ext` 路由 body（只收合法字段，非法静默丢弃）。
 *
 * @param raw - 未信任的输入。
 * @returns 合法字段的补丁；一个字段都没有时返回 `null`。
 */
export function sanitizePatchConfig(raw: unknown): FrameworkConfigPatch | null {
  if (!isRecord(raw)) return null;
  const out: FrameworkConfigPatch = {};
  if (Object.hasOwn(raw, 'trayEnabled')) out.trayEnabled = raw['trayEnabled'] === true;
  if (Object.hasOwn(raw, 'hoverPreview')) out.hoverPreview = raw['hoverPreview'] === true;
  if (Object.hasOwn(raw, 'referenceWidgets')) out.referenceWidgets = raw['referenceWidgets'] === true;
  if (Object.hasOwn(raw, 'maxVisibleIcons')) {
    const v = raw['maxVisibleIcons'];
    if (typeof v === 'number' && Number.isFinite(v)) {
      const n = Math.floor(v);
      if (n >= 1 && n <= 8) out.maxVisibleIcons = n;
    }
  }
  if (Object.hasOwn(raw, 'badgeIntervalMs')) {
    const v = raw['badgeIntervalMs'];
    if (typeof v === 'number' && Number.isFinite(v)) {
      const n = Math.floor(v);
      if (n >= 5000 && n <= 600000) out.badgeIntervalMs = n;
    }
  }
  return Object.keys(out).length === 0 ? null : out;
}
