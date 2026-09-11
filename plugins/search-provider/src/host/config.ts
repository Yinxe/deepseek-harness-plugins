/**
 * 配置：默认值 / schemastery schema 组合 / 补丁消毒 / 旧插件配置一次性采用
 *
 * - 官方 settings 命名空间 `dshp-search-provider`（与包名/路由前缀/cordis id 一致）
 * - 供应商分节：settings.yaml 顶层其余键 = 各供应商配置（键名即 provider id），
 *   schema 由各供应商模块自述，本文件按清单动态组合（新增供应商不改这里）。
 * - 旧插件迁移：`dshp-inx-tavily-search`（~/.dsh/plugins/dsh-tavily-search 时代）的
 *   maxResults / searchDepth 在新 NS 缺省时一次性采用；旧 NS 只读不删（旧插件可能仍在）。
 *
 * 原实现：dsh-tavily-search/lib/index.js 的 ConfigSchema + sanitizePatchConfig（JS）
 * → 本文件为 TS 重写并泛化为多供应商组合。
 *
 * @module @dshp/search-provider
 */
import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import z from '@deepseek-ai/schemastery';
import { settingsNamespace } from './http.js';
import type { PluginConfig, SearchProviderModule } from './types.js';

export const NS: string = settingsNamespace('dshp-search-provider');

/**
 * 同源路由前缀。四处同名是定位插件状态的唯一钥匙：
 * settings 命名空间 / 路由前缀 / cordis.patch.yml id / settings.section id。
 */
export const ROUTE_BASE = `/ext/${NS}`;

/** 结果数上限（Tavily / Exa 等主流供应商单次上限均为 10 左右，统一钳到 10） */
export const MAX_RESULTS = 10;
/** 默认结果数（与旧插件默认一致，迁移后行为不变） */
export const DEFAULT_MAX_RESULTS = 5;

/**
 * 旧插件命名空间 → 对应的供应商分节（一次性采用；数组顺序即优先级）。
 * 只读旧键、不写不删：新 NS 已存在时以新为准，旧键留给用户自行清理。
 */
export const LEGACY_PROVIDER_SETTINGS: readonly { ns: string; provider: string }[] = [
  { ns: 'dshp-inx-tavily-search', provider: 'tavily' },
];

// ── 类型守卫 ────────────────────────────────────────────────────────────────

function isRecord(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

/** 整数钳制：非有限值或越界返回 undefined（调用方决定丢弃还是报错） */
function clampInt(v: unknown, min: number, max: number): number | undefined {
  const n = Math.floor(Number(v));
  if (!Number.isFinite(n) || n < min || n > max) return undefined;
  return n;
}

// ── 默认值 / schema 组合（供应商清单驱动）───────────────────────────────────

/** 默认 provider：清单首个（新增供应商不会抢占默认，除非放在清单首位） */
export function defaultProviderId(modules: readonly SearchProviderModule[]): string {
  return modules[0]?.id ?? 'tavily';
}

/** 组装默认配置（settings base 层；用户层缺省即继承此处） */
export function buildDefaultConfig(modules: readonly SearchProviderModule[]): PluginConfig {
  const config: PluginConfig = {
    provider: defaultProviderId(modules),
    maxResults: DEFAULT_MAX_RESULTS,
  };
  for (const m of modules) config[m.id] = { ...m.defaultConfig };
  return config;
}

/** 组装 schemastery schema：通用字段 + 各供应商自述分节 schema（provider 限已知 id） */
export function buildConfigSchema(modules: readonly SearchProviderModule[]): unknown {
  const defaults = defaultProviderId(modules);
  const shape: Record<string, unknown> = {
    provider: z.union(modules.map((m) => z.const(m.id))).default(defaults),
    maxResults: z.number().step(1).min(1).max(MAX_RESULTS).default(DEFAULT_MAX_RESULTS),
  };
  for (const m of modules) shape[m.id] = m.configSchema;
  return z.object(shape);
}

// ── 补丁消毒 ────────────────────────────────────────────────────────────────

function isKnownProvider(id: unknown, modules: readonly SearchProviderModule[]): id is string {
  return typeof id === 'string' && modules.some((m) => m.id === id);
}

function providerIds(modules: readonly SearchProviderModule[]): string {
  return modules.map((m) => m.id).join(' / ');
}

/**
 * composition entry（cordis.patch.yml / settings base 层）部分覆盖：非法值静默丢弃。
 */
export function sanitizeEntryConfig(
  raw: unknown,
  modules: readonly SearchProviderModule[],
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (!isRecord(raw)) return out;
  if (Object.hasOwn(raw, 'provider') && isKnownProvider(raw['provider'], modules)) {
    out['provider'] = raw['provider'];
  }
  if (Object.hasOwn(raw, 'maxResults')) {
    const n = clampInt(raw['maxResults'], 1, MAX_RESULTS);
    if (n !== undefined) out['maxResults'] = n;
  }
  for (const m of modules) {
    if (!Object.hasOwn(raw, m.id)) continue;
    try {
      const block = m.sanitizePatch(raw[m.id]);
      if (block !== null) out[m.id] = block;
    } catch {
      /* 静默丢弃非法分节：base 层容错优先 */
    }
  }
  return out;
}

/**
 * 设置页路由补丁：非法值抛中文 Error（前端 notice 直接展示）。
 * 返回可直接交给 settings.update 的扁平补丁；无合法字段时返回空对象。
 */
export function sanitizeRoutePatch(
  raw: unknown,
  modules: readonly SearchProviderModule[],
): Record<string, unknown> {
  if (!isRecord(raw)) throw new Error('请求体不是合法 JSON 对象');
  const out: Record<string, unknown> = {};
  if (Object.hasOwn(raw, 'provider')) {
    if (!isKnownProvider(raw['provider'], modules)) {
      throw new Error(`provider 非法，应为已注册供应商之一：${providerIds(modules)}`);
    }
    out['provider'] = raw['provider'];
  }
  if (Object.hasOwn(raw, 'maxResults')) {
    const n = clampInt(raw['maxResults'], 1, MAX_RESULTS);
    if (n === undefined) throw new Error(`maxResults 非法，应为 1-${MAX_RESULTS} 的整数`);
    out['maxResults'] = n;
  }
  for (const m of modules) {
    if (!Object.hasOwn(raw, m.id)) continue;
    const block = m.sanitizePatch(raw[m.id]);
    if (block !== null) out[m.id] = block;
  }
  return out;
}

/** 生效配置快照（下发给 Client；只取契约字段，不透传整包） */
export function snapshotConfig(
  config: PluginConfig,
  modules: readonly SearchProviderModule[],
): Record<string, unknown> {
  const out: Record<string, unknown> = {
    provider: config.provider,
    maxResults: typeof config.maxResults === 'number' ? config.maxResults : DEFAULT_MAX_RESULTS,
  };
  for (const m of modules) out[m.id] = m.snapshot({ ...m.defaultConfig, ...readBlock(config, m.id) });
  return out;
}

/** 读某供应商分节（非法结构按空对象处理） */
export function readBlock(config: PluginConfig, providerId: string): Record<string, unknown> {
  const raw = config[providerId];
  return isRecord(raw) ? raw : {};
}

// ── settings.yaml 路径与旧命名空间采用 ──────────────────────────────────────

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

/**
 * 读 settings.yaml 顶层分节的标量子键（仅一层缩进；嵌套值忽略）。
 * 零依赖手写：只认 `<key>: <scalar>`，足够读旧插件的 maxResults / searchDepth。
 */
export function readYamlSection(text: string, key: string): Record<string, string> | null {
  const lines = text.split('\n');
  const head = new RegExp(`^${key}:\\s*(#.*)?$`);
  let start = -1;
  for (let i = 0; i < lines.length; i += 1) {
    if (head.test(lines[i] as string)) {
      start = i;
      break;
    }
  }
  if (start < 0) return null;
  const out: Record<string, string> = {};
  for (let i = start + 1; i < lines.length; i += 1) {
    const line = lines[i] as string;
    if (line.trim().length === 0 || line.trimStart().startsWith('#')) continue;
    if (!/^\s/.test(line)) break; // 下一个顶层键
    const m = line.match(/^\s+([A-Za-z0-9_-]+):\s*(.*)$/);
    if (m === null) continue;
    const k = m[1] as string;
    const raw = (m[2] as string).replace(/\s+#.*$/, '').trim();
    if (raw.length === 0 || raw === 'null' || raw === '~') continue;
    out[k] = raw.replace(/^['"]|['"]$/g, '');
  }
  return out;
}

/** 新 NS 是否已在 settings.yaml 里落盘（落盘即以用户层为准，不再采用旧插件配置） */
export function hasSectionInYaml(text: string, key: string): boolean {
  return new RegExp(`^${key}:`, 'm').test(text);
}

/**
 * 旧插件配置一次性采用：新 NS 缺省 + 旧 NS 存在时，把旧值按新 schema 归一后写入新 NS。
 * 旧 NS 段落保持原样（旧插件可能仍装着，删了会连带清掉它的配置）。
 * @returns 采用到的补丁（未采用时为 null）
 */
export function planLegacyAdoption(modules: readonly SearchProviderModule[]): Record<string, unknown> | null {
  try {
    const path = settingsYamlPath();
    if (!existsSync(path)) return null;
    const text = readFileSync(path, 'utf8');
    if (hasSectionInYaml(text, NS)) return null;
    const patch: Record<string, unknown> = {};
    for (const legacy of LEGACY_PROVIDER_SETTINGS) {
      const module = modules.find((m) => m.id === legacy.provider);
      if (module === undefined) continue;
      const section = readYamlSection(text, legacy.ns);
      if (section === null) continue;
      try {
        // 旧分节的通用字段（maxResults）与供应商字段（如 searchDepth）一起交给模块消毒
        const block = module.sanitizePatch(section);
        const n = clampInt(section['maxResults'], 1, MAX_RESULTS);
        const hasBlock = block !== null && Object.keys(block).length > 0;
        if (!hasBlock && n === undefined) continue;
        if (hasBlock && block !== null) patch[module.id] = block;
        if (n !== undefined) patch['maxResults'] = n;
        patch['provider'] = module.id;
      } catch {
        /* 旧值非法即跳过该分节 */
      }
    }
    return Object.keys(patch).length > 0 ? patch : null;
  } catch {
    return null;
  }
}
