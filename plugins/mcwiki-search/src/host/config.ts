/**
 * 配置：默认值 / schemastery schema / 补丁消毒
 *
 * - 官方 settings 命名空间 `dshp-mcwiki-search`（与包名/路由前缀/cordis id 一致）
 * - 只认 NS：历史命名空间 `dshp-inx-mcwiki-search` 不再读写、不再重命名
 * - 本插件无自有文件存储（配置只进 settings.yaml 的 NS 分节）
 */
import z from '@deepseek-ai/schemastery';
import { settingsNamespace } from './http.js';
import type { PluginConfig, PluginConfigPatch } from './types.js';
import { DEFAULT_TIMEOUT_MS } from './api.js';

export const NS: string = settingsNamespace('dshp-mcwiki-search');

/** 配置默认值（settings base 层；用户层缺省即继承此处）。0 = 不截断、完整输出。 */
export const DEFAULT_CONFIG: PluginConfig = {
  timeoutMs: DEFAULT_TIMEOUT_MS,
  maxChars: 0,
  introMaxChars: 0,
  searchMaxResults: 8,
};

export const ConfigSchema: any = z.object({
  timeoutMs: z.number().step(1).min(1000).default(DEFAULT_TIMEOUT_MS),
  maxChars: z.number().step(1).min(0).default(0),
  introMaxChars: z.number().step(1).min(0).default(0),
  searchMaxResults: z.number().step(1).min(1).default(8),
});

// ── 类型守卫 ────────────────────────────────────────────────────────────

function isRecord(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

function toFiniteNumber(v: unknown): number | undefined {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

// ── cordis.patch.yml / settings base 层的部分覆盖（只取合法字段）─────────

export function sanitizePatchConfig(raw: unknown): PluginConfigPatch | null {
  if (!isRecord(raw)) return null;
  const out: PluginConfigPatch = {};
  if (Object.hasOwn(raw, 'timeoutMs')) {
    const n = toFiniteNumber(raw['timeoutMs']);
    if (n !== undefined && n >= 1000) out.timeoutMs = n;
  }
  // 0 = 不截断；正整数 = 上限字符数
  if (Object.hasOwn(raw, 'maxChars')) {
    const n = toFiniteNumber(raw['maxChars']);
    if (n !== undefined && n >= 0) out.maxChars = n;
  }
  if (Object.hasOwn(raw, 'introMaxChars')) {
    const n = toFiniteNumber(raw['introMaxChars']);
    if (n !== undefined && n >= 0) out.introMaxChars = n;
  }
  if (Object.hasOwn(raw, 'searchMaxResults')) {
    const n = toFiniteNumber(raw['searchMaxResults']);
    if (n !== undefined && n >= 1) out.searchMaxResults = n;
  }
  return out;
}
