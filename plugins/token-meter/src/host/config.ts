/**
 * 配置：默认值 / schemastery schema / 双源迁移
 *
 * - 官方 settings 命名空间 `dshp-token-meter`（与包名/路由前缀/cordis id 一致）
 * - 历史命名空间：`dshp-inx-token-quota`（quota）+ `dshp-inx-token-stats`（stats）
 *   首次启动自动合并为新 key（文本级块搬运，保留注释与缩进；新 key 已存在则以新为准）
 * - 历史文件 `storages/token-quota.json`（quota）仅一次性迁移读，之后不再读写任何文件
 *   （stats 的指纹缓存走 storageDomain 域 `token_stats`，域名保持不变，见 stats/engine.ts）
 *
 * 原实现：
 *  - quota 部分：dsh-token-quota/lib/config.js（DEFAULT_ENTRY/normSec/sanitizeVendor/迁移）
 *  - stats 部分：dsh-token-stats/lib/index.js 的 DEFAULT_ENTRY/ConfigSchema/sanitizePatchConfig
 * 本文件为合并 TS 重写：两边字段共存于同一 NS，校验规则逐行对齐。
 */
import { homedir } from 'node:os';
import { join } from 'node:path';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import z from '@deepseek-ai/schemastery';
import { settingsNamespace } from './http.js';
import { ID_RE } from './providers/base.js';
import { normalizeSecretRef } from './secrets.js';
import { canonicalType, hasProvider, sanitizeParamsForType } from './providers/index.js';
import type { DefaultRange, PluginConfig, PluginConfigPatch, Vendor } from './types.js';

export const NS: string = settingsNamespace('dshp-token-meter');
/** quota 历史命名空间（@dshp-inx 时代） */
export const PREV_QUOTA_KEY = 'dshp-inx-token-quota';
/** stats 历史命名空间（@dshp-inx 时代） */
export const PREV_STATS_KEY = 'dshp-inx-token-stats';
/** 历史命名空间（迁移时按此顺序收集块内容） */
export const LEGACY_SETTINGS_KEYS: readonly string[] = [PREV_QUOTA_KEY, PREV_STATS_KEY];

export const DEFAULT_CONFIG: PluginConfig = {
  version: 1,
  activeVendor: '',
  refreshSec: 60,
  enabled: true,
  vendors: [],
  showToday: false,
  defaultRange: '30',
};

const VendorSchema: any = z.object({
  id: z.string().required(),
  name: z.string().required(),
  type: z.string().default('manual'),
  params: z.dict(z.any()).default({}),
  // 余额查询开关：false = 不参与 Host 定时拉取（手动拉取不受影响），缺省 = 启用
  enabled: z.boolean().default(true),
});

export const ConfigSchema: any = z.object({
  version: z.number().step(1).default(1),
  activeVendor: z.string().default(''),
  refreshSec: z.number().step(1).min(0).max(3600).default(60),
  enabled: z.boolean().default(true),
  vendors: z.array(VendorSchema).default([]),
  showToday: z.boolean().default(false),
  defaultRange: z.union([z.const('7'), z.const('30'), z.const('90'), z.const('all')]).default('30'),
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

/** quota 历史存储文件（仅迁移时读取/清理，新版不再写入任何文件） */
export function legacyQuotaConfigPath(): string {
  return join(dshHome(), 'storages', 'token-quota.json');
}

export function settingsYamlPath(): string {
  return join(dshHome(), 'settings.yaml');
}

// ── 类型守卫 ────────────────────────────────────────────────────────────

function isRecord(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

function isDefaultRange(v: unknown): v is DefaultRange {
  return v === '7' || v === '30' || v === '90' || v === 'all';
}

/** 自动刷新秒数归一：0=关闭，其余钳制到 10~3600（quota 原 normSec） */
export function normSec(v: unknown): number {
  if (v === 0 || v === '0') return 0;
  const n = Math.floor(Number(v));
  if (!Number.isFinite(n)) return 60;
  return Math.min(3600, Math.max(10, n));
}

/**
 * 单条供应商清洗（id 规则 + 类型注册表 + params 委托适配器）。
 * 非法返回 null（调用方 filter(Boolean) 丢弃）。原 quota sanitizeVendor 逐行对齐。
 */
export function sanitizeVendor(raw: unknown): Vendor | null {
  if (!isRecord(raw)) return null;
  const id = raw['id'] !== undefined && raw['id'] !== null ? String(raw['id']).trim() : '';
  const nm = raw['name'] !== undefined && raw['name'] !== null ? String(raw['name']).trim() : '';
  const typeRaw = raw['type'] !== undefined && raw['type'] !== null ? String(raw['type']) : 'manual';
  // 别名归一（opencode-go/zen → opencode）：读旧配置时兼容，写回时落新 type
  const type = canonicalType(typeRaw);
  if (!ID_RE.test(id)) return null;
  if (!nm) return null;
  if (!hasProvider(type)) return null;
  const params = sanitizeParamsForType(type, raw['params']);
  // 兜底：params 里混入的旧 `{env:}/{cred:}` 写法统一归一（适配器内已做，此处双保险）
  for (const k of Object.keys(params)) {
    const pv = params[k] as unknown;
    if (typeof pv === 'string') params[k] = normalizeSecretRef(pv) as never;
  }
  const out: Vendor = { id, name: nm, type, params };
  // 只在显式禁用时落字段：旧配置零迁移，YAML 里不会冒出冗余的 enabled: true
  if (raw['enabled'] === false) out.enabled = false;
  return out;
}

/** cordis.patch.yml / settings base 层的部分覆盖（只取合法字段） */
export function sanitizePatchConfig(raw: unknown): PluginConfigPatch | null {
  if (!isRecord(raw)) return null;
  const out: PluginConfigPatch = {};
  if (Object.hasOwn(raw, 'activeVendor') && typeof raw['activeVendor'] === 'string')
    out.activeVendor = raw['activeVendor'];
  if (
    Object.hasOwn(raw, 'refreshSec') &&
    raw['refreshSec'] !== undefined &&
    raw['refreshSec'] !== null &&
    raw['refreshSec'] !== ''
  ) {
    out.refreshSec = normSec(raw['refreshSec']);
  }
  if (Object.hasOwn(raw, 'enabled')) out.enabled = raw['enabled'] === true;
  if (Object.hasOwn(raw, 'vendors') && Array.isArray(raw['vendors'])) {
    out.vendors = (raw['vendors'] as unknown[]).map(sanitizeVendor).filter((v): v is Vendor => v !== null);
  }
  if (Object.hasOwn(raw, 'showToday')) out.showToday = raw['showToday'] === true;
  if (Object.hasOwn(raw, 'defaultRange') && isDefaultRange(raw['defaultRange']))
    out.defaultRange = raw['defaultRange'];
  return out;
}

/** 旧文件内容清洗（quota storages 迁移专用，与 sanitizePatchConfig 同规则 + stats 字段透传） */
export function sanitizePersisted(raw: unknown): PluginConfig | null {
  if (!isRecord(raw)) return null;
  const out: PluginConfig = { ...DEFAULT_CONFIG, vendors: [] };
  if (typeof raw['activeVendor'] === 'string') out.activeVendor = raw['activeVendor'];
  if (raw['refreshSec'] !== undefined && raw['refreshSec'] !== null && raw['refreshSec'] !== '')
    out.refreshSec = normSec(raw['refreshSec']);
  if (Object.hasOwn(raw, 'enabled')) out.enabled = raw['enabled'] === true;
  if (Array.isArray(raw['vendors']))
    out.vendors = (raw['vendors'] as unknown[]).map(sanitizeVendor).filter((v): v is Vendor => v !== null);
  if (Object.hasOwn(raw, 'showToday')) out.showToday = raw['showToday'] === true;
  if (isDefaultRange(raw['defaultRange'])) out.defaultRange = raw['defaultRange'];
  return out;
}

export interface PersistedMigration {
  config: PluginConfig;
  /** 实际读到的历史文件路径（迁移完清理/备份用） */
  source: string;
}

export function loadPersistedQuota(): PersistedMigration | null {
  try {
    const p = legacyQuotaConfigPath();
    if (!existsSync(p)) return null;
    const text = readFileSync(p, 'utf8');
    const cfg = sanitizePersisted(JSON.parse(text) as unknown);
    if (cfg) return { config: cfg, source: p };
  } catch {
    /* ignore */
  }
  return null;
}

// ── settings.yaml 双命名空间合并迁移 ──────────────────────────────────────
// 两个旧插件各有一个顶层 key，合并为一个新 key。settings 服务只暴露已注册命名空间，
// 旧 key 孤立后读不到，所以直接做文本级块搬运（保留缩进与注释）。
// 策略：新 key 已存在 → 以新为准，只提示不覆盖；否则把旧块的缩进体内联拼到新块下
// （quota 字段 + stats 字段无交集，直接拼接即合并），追加到文件末尾，旧块保留待手动删除。

function topLevelIndex(lines: string[], key: string): number {
  const re = new RegExp(`^${key}:\\s*(#.*)?$`);
  for (let i = 0; i < lines.length; i++) {
    if (re.test(lines[i] as string)) return i;
  }
  return -1;
}

function blockBody(lines: string[], start: number): string[] {
  const out: string[] = [];
  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i] as string;
    if (line.trim() === '' || /^\s/.test(line) || line.trimStart().startsWith('#')) {
      // 空行/缩进行/注释行都属于块（注释保留）；遇到下一个顶层 key 即止
      if (/^[A-Za-z0-9_-]+:\s*(#.*)?$/.test(line)) break;
      out.push(line);
    } else break;
  }
  // 去掉块尾多余空行，保留块内格式
  while (out.length > 0 && (out[out.length - 1] as string).trim() === '') out.pop();
  return out;
}

export function migrateYamlNamespaces(): void {
  try {
    const p = settingsYamlPath();
    if (!existsSync(p)) return;
    const text = readFileSync(p, 'utf8');
    const lines = text.split('\n');
    const newIdx = topLevelIndex(lines, NS);
    const hits = LEGACY_SETTINGS_KEYS.map((key) => ({ key, idx: topLevelIndex(lines, key) })).filter(
      (h) => h.idx >= 0,
    );
    if (hits.length === 0) return;
    if (newIdx >= 0) {
      try {
        console.info(
          `[dshp-token-meter] settings.yaml 同时存在 ${hits.map((h) => h.key).join(' 与 ')} 与 dshp-token-meter，以新 key 为准，请手动删除旧段落`,
        );
      } catch {
        /* ignore */
      }
      return;
    }
    const body: string[] = [];
    for (const h of hits) body.push(...blockBody(lines, h.idx));
    if (body.length === 0) return;
    const addition = ['', 'dshp-token-meter:', ...body].join('\n');
    const next = text.endsWith('\n') ? text + addition.slice(1) + '\n' : text + addition + '\n';
    writeFileSync(p, next, 'utf8');
    try {
      console.info(
        `[dshp-token-meter] 已将 settings.yaml 顶层 ${hits.map((h) => h.key).join(' + ')} 合并为 dshp-token-meter（旧段落保留，请确认后手动删除）`,
      );
    } catch {
      /* ignore */
    }
  } catch (e) {
    try {
      console.warn(
        '[dshp-token-meter] settings.yaml 命名空间合并失败：' + String((e as Error)?.message ?? e),
      );
    } catch {
      /* ignore */
    }
  }
}
