/**
 * 配置：默认值 / schemastery schema / 补丁消毒
 *
 * - 官方 settings 命名空间 `dshp-vision-bridge`（与包名/路由前缀/cordis id 一致）
 * - 只认 NS：历史命名空间（`vision-bridge` / `dshp-inx-vision-bridge`）与旧文件
 *   （`storages/*.json`）不再读写、不再迁移
 *
 * @module @dshp/vision-bridge
 */
import z from '@deepseek-ai/schemastery';
import { settingsNamespace } from './http.js';
import type { Detail, PluginConfig, PluginConfigPatch, VisionRoute } from './types.js';

export const NS: string = settingsNamespace('dshp-vision-bridge');

export const DEFAULT_CONFIG: PluginConfig = {
  enabled: true,
  primary: null,
  fallback: null,
  detail: 'auto',
  maxImages: 4,
  promptTemplate: '',
};

const VisionRouteSchema: any = z.object({
  provider: z.string().required(),
  model: z.string().required(),
});

export const ConfigSchema: any = z.object({
  enabled: z.boolean().default(true),
  primary: z.union([VisionRouteSchema, z.const(null)]).default(null),
  fallback: z.union([VisionRouteSchema, z.const(null)]).default(null),
  detail: z.union([z.const('auto'), z.const('low'), z.const('high')]).default('auto'),
  maxImages: z.number().step(1).min(1).max(8).default(4),
  promptTemplate: z.string().default(''),
});

// ── 类型守卫 ────────────────────────────────────────────────────────────

function isRecord(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

function isDetail(v: unknown): v is Detail {
  return v === 'auto' || v === 'low' || v === 'high';
}

function asRoute(v: unknown): VisionRoute | null {
  if (v === null) return null;
  if (!isRecord(v)) return null;
  if (typeof v['provider'] !== 'string' || typeof v['model'] !== 'string') return null;
  const provider = (v['provider'] as string).slice(0, 120);
  const model = (v['model'] as string).slice(0, 200);
  if (!provider || !model) return null;
  return { provider, model };
}

// ── 补丁消毒 ────────────────────────────────────────────────────────────

/** cordis.patch.yml / settings base 层的部分覆盖（只取合法字段） */
export function sanitizePatchConfig(raw: unknown): PluginConfigPatch | null {
  if (!isRecord(raw)) return null;
  const out: PluginConfigPatch = {};
  if (Object.hasOwn(raw, 'enabled')) out.enabled = raw['enabled'] === true;
  if (Object.hasOwn(raw, 'primary')) {
    const v = raw['primary'];
    if (v === null) out.primary = null;
    else {
      const r = asRoute(v);
      if (r) out.primary = r;
    }
  }
  if (Object.hasOwn(raw, 'fallback')) {
    const v = raw['fallback'];
    if (v === null) out.fallback = null;
    else {
      const r = asRoute(v);
      if (r) out.fallback = r;
    }
  }
  if (Object.hasOwn(raw, 'detail') && isDetail(raw['detail'])) out.detail = raw['detail'];
  if (
    Object.hasOwn(raw, 'maxImages') &&
    typeof raw['maxImages'] === 'number' &&
    Number.isFinite(raw['maxImages'])
  ) {
    const n = Math.floor(raw['maxImages'] as number);
    if (n >= 1 && n <= 8) out.maxImages = n;
  }
  if (Object.hasOwn(raw, 'promptTemplate') && typeof raw['promptTemplate'] === 'string') {
    out.promptTemplate = (raw['promptTemplate'] as string).slice(0, 2000);
  }
  return out;
}
