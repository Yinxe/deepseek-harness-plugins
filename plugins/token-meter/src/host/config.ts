/**
 * 配置：默认值 / schemastery schema / 补丁消毒
 *
 * - 官方 settings 命名空间 `dshp-token-meter`（与包名/路由前缀/cordis id 一致）
 * - 只认 NS：历史命名空间（`dshp-inx-token-quota` / `dshp-inx-token-stats`）与旧文件
 *   （`storages/token-quota.json`）不再读写、不再迁移
 *   （stats 的指纹缓存走 storageDomain 域 `token_stats`，域名保持不变，见 stats/engine.ts）
 *
 * 原实现：
 *  - quota 部分：dsh-token-quota/lib/config.js（DEFAULT_ENTRY/normSec/sanitizeVendor）
 *  - stats 部分：dsh-token-stats/lib/index.js 的 DEFAULT_ENTRY/ConfigSchema/sanitizePatchConfig
 * 本文件为合并 TS 重写：两边字段共存于同一 NS，校验规则逐行对齐。
 */
import z from '@deepseek-ai/schemastery';
import { settingsNamespace } from './http.js';
import { ID_RE } from './providers/base.js';
import { normalizeSecretRef } from './secrets.js';
import { canonicalType, hasProvider, sanitizeParamsForType } from './providers/index.js';
import { normGapMin } from './stats/online.js';
import type { DefaultRange, PluginConfig, PluginConfigPatch, Vendor } from './types.js';

export const NS: string = settingsNamespace('dshp-token-meter');

export const DEFAULT_CONFIG: PluginConfig = {
  version: 1,
  activeVendor: '',
  refreshSec: 60,
  enabled: true,
  vendors: [],
  showToday: false,
  // token 统计默认「全部」；热力图另有自己的 6 个月默认（客户端）
  defaultRange: 'all',
  // 在线时长空闲阈值（分钟）：1/5/15/30/60。
  // 缺省 15：DSH 在干活时日志里本就有事件（模型 step、工具 call/result、子代理），
  // 不需要靠大阈值兜底；要兜的是「读长回答、想下一个需求」这类几分钟量级的静默期。
  // 5 分钟以下会把这类静默期切断（偏低），60 分钟会把开会/吃饭整段算成在线。
  onlineGapMin: 15,
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
  defaultRange: z.union([z.const('7'), z.const('30'), z.const('90'), z.const('all')]).default('all'),
  onlineGapMin: z.number().step(1).min(1).max(60).default(15),
});

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
  if (Object.hasOwn(raw, 'onlineGapMin') && raw['onlineGapMin'] !== undefined && raw['onlineGapMin'] !== null)
    out.onlineGapMin = normGapMin(raw['onlineGapMin']);
  return out;
}
