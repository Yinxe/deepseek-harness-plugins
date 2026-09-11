/**
 * 配置：默认值 / schemastery schema / 旧存储迁移
 *
 * - 官方 settings 命名空间 `dshp-vision-bridge`（与包名/路由前缀一致）
 * - 历史命名空间按代迁移到 NS：`vision-bridge`（v1.2.0 前）→ `dshp-inx-vision-bridge`（monorepo 改名前）
 * - 历史文件 `storages/dshp-inx-vision-bridge.json` 仅一次性迁移，之后不再读写任何文件
 */
import { homedir } from 'node:os';
import { join } from 'node:path';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import z from '@deepseek-ai/schemastery';
import { settingsNamespace } from './http.js';
import type { Detail, PluginConfig, PluginConfigPatch, VisionRoute } from './types.js';

export const NS: string = settingsNamespace('dshp-vision-bridge');
export const OLD_SETTINGS_KEY = 'vision-bridge';
/** monorepo 改名前的命名空间（@dshp-inx 时代），与 OLD_SETTINGS_KEY 一起迁移到 NS */
export const PREV_SETTINGS_KEY = 'dshp-inx-vision-bridge';
/** 历史命名空间（迁移优先级：先较新的历史 key） */
export const LEGACY_SETTINGS_KEYS: readonly string[] = [PREV_SETTINGS_KEY, OLD_SETTINGS_KEY];

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
  } catch {
    /* ignore */
  }
  try {
    return join(homedir(), '.dsh');
  } catch {
    return '/tmp/.dsh';
  }
}

export function configPath(): string {
  return join(dshHome(), 'storages', 'dshp-vision-bridge.json');
}

/** 历史存储文件（仅迁移时读取/清理，新版不再写入任何文件） */
export function legacyConfigPaths(): string[] {
  return [join(dshHome(), 'storages', 'dshp-inx-vision-bridge.json')];
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

export interface PersistedMigration {
  config: PluginConfig;
  /** 实际读到的历史文件路径（迁移完清理/备份用） */
  source: string;
}

export function loadPersisted(): PersistedMigration | null {
  for (const p of legacyConfigPaths()) {
    try {
      if (!existsSync(p)) continue;
      const text = readFileSync(p, 'utf8');
      const cfg = sanitizePersisted(JSON.parse(text) as unknown);
      if (cfg) return { config: cfg, source: p };
    } catch {
      continue;
    }
  }
  return null;
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

// ── settings.yaml 顶层 key 重命名（vision-bridge / dshp-inx-vision-bridge → dshp-vision-bridge，一次性）──
// settings 服务只暴露已注册命名空间，旧 key 孤立后读不到，所以直接做文本级顶层 key 重命名，
// 保留缩进块与注释（FileSettingsProvider 热重载后新 NS 即生效）。新 key 已存在时以新为准，不自动删旧。

export function migrateYamlNamespaceKey(): void {
  try {
    const p = settingsYamlPath();
    if (!existsSync(p)) return;
    const text = readFileSync(p, 'utf8');
    const lines = text.split('\n');
    const at = (key: string): number => {
      const re = new RegExp(`^${key}:\\s*(#.*)?$`);
      for (let i = 0; i < lines.length; i++) {
        if (re.test(lines[i] as string)) return i;
      }
      return -1;
    };
    const newIdx = at(NS);
    const hit = LEGACY_SETTINGS_KEYS.map((key) => ({ key, idx: at(key) })).find((h) => h.idx >= 0);
    if (!hit) return;
    if (newIdx >= 0) {
      try {
        console.info(
          `[dshp-vision-bridge] settings.yaml 同时存在 ${hit.key} 与 dshp-vision-bridge，以新 key 为准，请手动删除旧 ${hit.key} 段落`,
        );
      } catch {
        /* ignore */
      }
      return;
    }
    const m = (lines[hit.idx] as string).match(/(#.*)$/);
    lines[hit.idx] = 'dshp-vision-bridge:' + (m?.[1] ? ' ' + m[1] : '');
    writeFileSync(p, lines.join('\n'), 'utf8');
    try {
      console.info(`[dshp-vision-bridge] 已将 settings.yaml 顶层 ${hit.key} 重命名为 dshp-vision-bridge`);
    } catch {
      /* ignore */
    }
  } catch (e) {
    try {
      console.warn(
        '[dshp-vision-bridge] settings.yaml 命名空间重命名失败：' + String((e as Error)?.message ?? e),
      );
    } catch {
      /* ignore */
    }
  }
}
