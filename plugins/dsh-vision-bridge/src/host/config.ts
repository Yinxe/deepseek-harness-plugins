/**
 * 配置：默认值 / schemastery schema / 旧存储迁移
 *
 * - 官方 settings 命名空间 `dshp-inx-vision-bridge`（与包名/路由前缀一致）
 * - v1.2.0 以前曾用 `vision-bridge`，启动时自动重命名 settings.yaml 顶层 key
 * - 旧版文件 `storages/dshp-inx-vision-bridge.json` 仅一次性迁移，之后不再读写
 */
import { homedir } from 'node:os';
import { join } from 'node:path';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import z from '@deepseek-ai/schemastery';
import { settingsNamespace } from './http.js';
import type { Detail, PluginConfig, PluginConfigPatch, VisionRoute } from './types.js';

export const NS: string = settingsNamespace('dshp-inx-vision-bridge');
export const OLD_SETTINGS_KEY = 'vision-bridge';

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

// ── 路径 ────────────────────────────────────────────────────────────────

export function dshHome(): string {
  try {
    const env = process.env['DSH_HOME'];
    if (typeof env === 'string' && env.length > 0) return env;
  } catch { /* ignore */ }
  try {
    return join(homedir(), '.dsh');
  } catch {
    return '/tmp/.dsh';
  }
}

export function configPath(): string {
  return join(dshHome(), 'storages', 'dshp-inx-vision-bridge.json');
}

export function settingsYamlPath(): string {
  return join(dshHome(), 'settings.yaml');
}

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

// ── 旧文件 sanitize（仅迁移用） ─────────────────────────────────────────

export function sanitizePersisted(raw: unknown): PluginConfig | null {
  if (!isRecord(raw)) return null;
  const out: PluginConfig = { ...DEFAULT_CONFIG };
  if (typeof raw['enabled'] === 'boolean') out.enabled = raw['enabled'];
  if (raw['primary'] === null || isRecord(raw['primary'])) {
    const r = asRoute(raw['primary']);
    // asRoute(null) === null 合法；isRecord 但字段非法时 asRoute 返回 null —— 与原逻辑一致视为 null？
    // 原逻辑：非法结构则保持默认值；这里更严格一点：只有 null 或合法 route 才覆盖
    if (raw['primary'] === null) out.primary = null;
    else if (r) out.primary = r;
  }
  if (raw['fallback'] === null || isRecord(raw['fallback'])) {
    if (raw['fallback'] === null) out.fallback = null;
    else {
      const r = asRoute(raw['fallback']);
      if (r) out.fallback = r;
    }
  }
  if (isDetail(raw['detail'])) out.detail = raw['detail'];
  if (typeof raw['maxImages'] === 'number' && Number.isFinite(raw['maxImages'])) {
    const n = Math.floor(raw['maxImages']);
    if (n >= 1 && n <= 8) out.maxImages = n;
  }
  if (typeof raw['promptTemplate'] === 'string') out.promptTemplate = raw['promptTemplate'].slice(0, 2000);
  return out;
}

export function loadPersisted(): PluginConfig | null {
  try {
    const p = configPath();
    if (!existsSync(p)) return null;
    const text = readFileSync(p, 'utf8');
    return sanitizePersisted(JSON.parse(text) as unknown);
  } catch {
    return null;
  }
}

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
  if (Object.hasOwn(raw, 'maxImages') && typeof raw['maxImages'] === 'number' && Number.isFinite(raw['maxImages'])) {
    const n = Math.floor(raw['maxImages'] as number);
    if (n >= 1 && n <= 8) out.maxImages = n;
  }
  if (Object.hasOwn(raw, 'promptTemplate') && typeof raw['promptTemplate'] === 'string') {
    out.promptTemplate = (raw['promptTemplate'] as string).slice(0, 2000);
  }
  return out;
}

// ── settings.yaml 顶层 key 重命名（vision-bridge → dshp-inx-vision-bridge） ──

export function migrateYamlNamespaceKey(): void {
  try {
    const p = settingsYamlPath();
    if (!existsSync(p)) return;
    const text = readFileSync(p, 'utf8');
    const lines = text.split('\n');
    let oldIdx = -1;
    let newIdx = -1;
    for (let i = 0; i < lines.length; i++) {
      const line: string = lines[i] as string;
      if (/^dshp-inx-vision-bridge:\s*(#.*)?$/.test(line)) newIdx = i;
      else if (/^vision-bridge:\s*(#.*)?$/.test(line)) oldIdx = i;
    }
    if (oldIdx < 0) return;
    if (newIdx >= 0) {
      try {
        console.info('[dshp-inx-vision-bridge] settings.yaml 同时存在 vision-bridge 与 dshp-inx-vision-bridge，以新 key 为准，请手动删除旧 vision-bridge 段落');
      } catch { /* ignore */ }
      return;
    }
    const m = (lines[oldIdx] as string).match(/(#.*)$/);
    lines[oldIdx] = 'dshp-inx-vision-bridge:' + (m?.[1] ? ' ' + m[1] : '');
    writeFileSync(p, lines.join('\n'), 'utf8');
    try {
      console.info('[dshp-inx-vision-bridge] 已将 settings.yaml 顶层 vision-bridge 重命名为 dshp-inx-vision-bridge');
    } catch { /* ignore */ }
  } catch (e) {
    try {
      console.warn('[dshp-inx-vision-bridge] settings.yaml 命名空间重命名失败：' + String((e as Error)?.message ?? e));
    } catch { /* ignore */ }
  }
}
