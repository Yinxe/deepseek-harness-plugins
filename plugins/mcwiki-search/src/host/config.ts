/**
 * 配置：默认值 / schemastery schema / 旧命名空间迁移
 *
 * - 官方 settings 命名空间 `dshp-mcwiki-search`（与包名/路由前缀/cordis id 一致）
 * - 历史命名空间 `dshp-inx-mcwiki-search`（monorepo 改名前，@dshp-inx 时代）首次启动自动重命名
 * - 本插件无自有文件存储：只有 settings.yaml 顶层 key 文本级重命名（保留注释与缩进）
 */
import { homedir } from 'node:os';
import { join } from 'node:path';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import z from '@deepseek-ai/schemastery';
import { settingsNamespace } from './http.js';
import type { PluginConfig, PluginConfigPatch } from './types.js';
import { DEFAULT_TIMEOUT_MS } from './api.js';

export const NS: string = settingsNamespace('dshp-mcwiki-search');
/** monorepo 改名前的命名空间（@dshp-inx 时代） */
export const PREV_SETTINGS_KEY = 'dshp-inx-mcwiki-search';
/** 历史命名空间（迁移优先级：先较新的历史 key） */
export const LEGACY_SETTINGS_KEYS: readonly string[] = [PREV_SETTINGS_KEY];

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

export function settingsYamlPath(): string {
  return join(dshHome(), 'settings.yaml');
}

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

// ── settings.yaml 顶层 key 重命名（dshp-inx-mcwiki-search → dshp-mcwiki-search，一次性）──
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
          `[dshp-mcwiki-search] settings.yaml 同时存在 ${hit.key} 与 dshp-mcwiki-search，以新 key 为准，请手动删除旧 ${hit.key} 段落`,
        );
      } catch {
        /* ignore */
      }
      return;
    }
    const m = (lines[hit.idx] as string).match(/(#.*)$/);
    lines[hit.idx] = 'dshp-mcwiki-search:' + (m?.[1] ? ' ' + m[1] : '');
    writeFileSync(p, lines.join('\n'), 'utf8');
    try {
      console.info(`[dshp-mcwiki-search] 已将 settings.yaml 顶层 ${hit.key} 重命名为 dshp-mcwiki-search`);
    } catch {
      /* ignore */
    }
  } catch (e) {
    try {
      console.warn(
        '[dshp-mcwiki-search] settings.yaml 命名空间重命名失败：' + String((e as Error)?.message ?? e),
      );
    } catch {
      /* ignore */
    }
  }
}
