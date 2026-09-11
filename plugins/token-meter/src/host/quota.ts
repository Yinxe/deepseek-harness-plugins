/**
 * 额度编排：快照缓存 + 供应商校验/脱敏/合并 + 同源 JSON 路由
 *
 * 原实现：dsh-token-quota/lib/index.js 的 st/snaps/refreshOne/checkVendor/
 * mergeVendorSecret/settingsDocPath/ROUTES 段（逐行对齐，仅加 TS 类型，
 * 路由前缀由 dshp-inx-token-quota 改为 dshp-token-meter）。
 */
import type { IncomingMessage, ServerResponse } from 'node:http';
import { json, readBody, sameOrigin } from './http.js';
import { NS } from './config.js';
import { DOLLAR_REF_RE, ENV_REF_RE, CRED_REF_RE } from './secrets.js';
import {
  canonicalType,
  describeProviders,
  getProvider,
  getSecretField,
  hasProvider,
  locateSecretKey,
  maskParamsForType,
  providerTypes,
  readSecretValue,
  secretKindOf,
} from './providers/index.js';
import type {
  AnyCtx,
  PluginConfig,
  SanitizedQuotaConfig,
  SanitizedVendor,
  Vendor,
  VendorSnapshot,
} from './types.js';

function isRecord(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

export interface QuotaState {
  snaps: Record<string, VendorSnapshot>;
  /** 最后一次上游拉取完成时间（毫秒）：Host 定时器据此顺延，避免刚手动刷过又重复拉 */
  lastPullMs?: number;
}

export interface QuotaDeps {
  getConfig: () => PluginConfig;
  updateConfig: (patch: Record<string, unknown>) => Promise<void>;
  resolveSecret: (raw: string) => Promise<{ value: string; kind: string }>;
  st: QuotaState;
}

/** 脱敏后的配置快照（state 下发用；明文密钥只写不读）。 */
export function sanitizeCfg(cfg: PluginConfig): SanitizedQuotaConfig {
  const vs = Array.isArray(cfg.vendors) ? cfg.vendors : [];
  const av =
    cfg.activeVendor !== undefined && cfg.activeVendor !== null
      ? String(cfg.activeVendor)
      : (vs[0] && (vs[0] as Vendor).id) || '';
  return {
    version: 1,
    activeVendor: av,
    refreshSec: cfg.refreshSec,
    enabled: cfg.enabled !== false,
    vendors: vs
      .filter((v) => v && (v as Vendor).id && (v as Vendor).name && (v as Vendor).type)
      .map((v) => {
        const vv = v as Vendor;
        const rawParams =
          vv.params && typeof vv.params === 'object' ? (vv.params as Record<string, unknown>) : {};
        const kind = secretKindOf({ type: vv.type, params: rawParams });
        const params = maskParamsForType(vv.type, rawParams);
        const out: SanitizedVendor = {
          id: String(vv.id),
          name: String(vv.name),
          type: String(vv.type),
          params,
          secretKind: kind,
        };
        return out;
      }),
  };
}

/**
 * 单供应商快照拉取（委托适配器 fetch；未知类型直接报错）。
 */
export async function refreshOne(
  st: QuotaState,
  resolveSecret: QuotaDeps['resolveSecret'],
  v: Vendor,
): Promise<VendorSnapshot> {
  const snap: VendorSnapshot = {
    vendorId: v.id,
    vendorName: v.name,
    ok: false,
    at: new Date().toISOString(),
    fetchedAtMs: Date.now(),
  };
  try {
    const adapter = getProvider(v.type);
    if (!adapter) throw new Error('未知供应商类型:' + v.type);
    const data = await adapter.fetch(v, { resolveSecret, fetchImpl: fetch });
    if (!data) throw new Error('未知供应商类型:' + v.type);
    snap.ok = true;
    snap.billingKind = data.billingKind;
    if (data.windows) snap.windows = data.windows;
    if (data.billing) snap.billing = data.billing;
    if (data.secretKind) snap.secretKind = data.secretKind;
    if (data.extra !== undefined && data.extra !== null) {
      try {
        snap.extra = JSON.parse(JSON.stringify(data.extra)) as import('./types.js').ProviderExtra | null;
      } catch {
        /* ignore */
      }
    }
    if (typeof data.via === 'string' && data.via) snap.via = data.via.slice(0, 24);
  } catch (e) {
    snap.ok = false;
    snap.error = (e as Error)?.message || '拉取失败';
  }
  st.snaps[v.id] = snap;
  st.lastPullMs = Date.now();
  return snap;
}

export function checkVendor(v: unknown): string {
  if (!v || typeof v !== 'object') return '供应商为空';
  const r = v as Record<string, unknown>;
  if (!/^[a-z0-9][a-z0-9-]{1,30}$/.test((r['id'] as string) || ''))
    return 'ID 非法(小写字母/数字/横线,2-31位)';
  if (!r['name']) return '显示名字必填';
  if (!hasProvider(String(r['type']))) return '未知类型';
  r['params'] = r['params'] && typeof r['params'] === 'object' ? r['params'] : {};
  return '';
}

/** 明文脱敏后的编辑合并：全部密钥字段留空即保留存储值。 */
export function mergeVendorSecret(stored: Vendor | undefined, incoming: Vendor): Vendor {
  const f = getSecretField(incoming.type);
  if (!f) return incoming;
  const key = (stored && locateSecretKey(stored)) || f;
  const nextVal = incoming.params ? (incoming.params[key] as string) : '';
  const prevVal = stored ? readSecretValue(stored) : '';
  const prevKind = stored ? secretKindOf(stored) : 'empty';
  const incomingHasSecret = readSecretValue(incoming) !== '';
  if (
    !incomingHasSecret &&
    (nextVal === undefined || nextVal === null || nextVal === '') &&
    prevKind === 'plain' &&
    prevVal
  ) {
    return { ...incoming, params: { ...incoming.params, [key]: prevVal } };
  }
  return incoming;
}

function settingsDocPath(ctx: AnyCtx): string {
  try {
    const settings = ctx.get('settings') as AnyCtx;
    if (settings && typeof settings.documentPath === 'string') {
      const p = settings.documentPath as string;
      const idx = p.lastIndexOf('/');
      const name = idx === -1 ? p : p.slice(idx + 1);
      return name === 'settings.yaml' ? '$DSH_HOME/settings.yaml' : name;
    }
  } catch {
    /* ignore */
  }
  return '';
}

const BASE = '/ext/dshp-token-meter';

export function registerQuotaRoutes(ctx: AnyCtx, deps: QuotaDeps): void {
  const { getConfig, updateConfig, resolveSecret, st } = deps;

  // GET state —— 配置（明文脱敏）+ 快照 + provider 元数据
  ctx.effect(
    () =>
      ctx.webServer.register({
        kind: 'exact',
        path: `${BASE}/state`,
        handler: async (req: IncomingMessage, res: ServerResponse) => {
          if (!sameOrigin(req)) return json(res, 403, { ok: false, error: 'forbidden' });
          try {
            const cfg = getConfig();
            return json(res, 200, {
              ok: true,
              namespace: NS,
              docPath: settingsDocPath(ctx),
              config: {
                ...sanitizeCfg(cfg),
                showToday: cfg.showToday === true,
                defaultRange: cfg.defaultRange,
              },
              snaps: st.snaps,
              providers: describeProviders(),
              providerTypes: providerTypes(),
            });
          } catch (e) {
            return json(res, 200, { ok: false, error: (e as Error)?.message || '加载失败' });
          }
        },
      }),
    'dshp-token-meter: state route',
  );

  // POST refresh
  ctx.effect(
    () =>
      ctx.webServer.register({
        kind: 'exact',
        path: `${BASE}/refresh`,
        handler: async (req: IncomingMessage, res: ServerResponse) => {
          if (!sameOrigin(req)) return json(res, 403, { ok: false, error: 'forbidden' });
          let body: unknown = {};
          try {
            body = JSON.parse((await readBody(req)) || '{}') as unknown;
          } catch {
            return json(res, 200, { ok: false, error: '请求体不是合法 JSON' });
          }
          try {
            const cfg = getConfig();
            const a = (body ?? {}) as Record<string, unknown>;
            const list = a['id'] ? cfg.vendors.filter((v) => v.id === a['id']) : cfg.vendors;
            if (a['id'] && !list.length)
              return json(res, 200, { ok: false, error: '未知供应商:' + String(a['id']) });
            for (const v of list) await refreshOne(st, resolveSecret, v);
            return json(res, 200, { ok: true, snaps: st.snaps });
          } catch (e) {
            return json(res, 200, { ok: false, error: (e as Error)?.message || '刷新失败' });
          }
        },
      }),
    'dshp-token-meter: refresh route',
  );

  // POST set-active
  ctx.effect(
    () =>
      ctx.webServer.register({
        kind: 'exact',
        path: `${BASE}/set-active`,
        handler: async (req: IncomingMessage, res: ServerResponse) => {
          if (!sameOrigin(req)) return json(res, 403, { ok: false, error: 'forbidden' });
          let body: unknown = {};
          try {
            body = JSON.parse((await readBody(req)) || '{}') as unknown;
          } catch {
            return json(res, 200, { ok: false, error: '请求体不是合法 JSON' });
          }
          try {
            const cfg = getConfig();
            const b = (body ?? {}) as Record<string, unknown>;
            const id = b['id'] !== undefined && b['id'] !== null ? String(b['id']) : '';
            if (id !== '' && !cfg.vendors.some((v) => v.id === id))
              return json(res, 200, { ok: false, error: '未知供应商' });
            await updateConfig({ activeVendor: id });
            return json(res, 200, { ok: true });
          } catch (e) {
            return json(res, 200, { ok: false, error: (e as Error)?.message || '切换失败' });
          }
        },
      }),
    'dshp-token-meter: set-active route',
  );

  // POST set-refresh
  ctx.effect(
    () =>
      ctx.webServer.register({
        kind: 'exact',
        path: `${BASE}/set-refresh`,
        handler: async (req: IncomingMessage, res: ServerResponse) => {
          if (!sameOrigin(req)) return json(res, 403, { ok: false, error: 'forbidden' });
          let body: unknown = {};
          try {
            body = JSON.parse((await readBody(req)) || '{}') as unknown;
          } catch {
            return json(res, 200, { ok: false, error: '请求体不是合法 JSON' });
          }
          try {
            const b = (body ?? {}) as Record<string, unknown>;
            const raw = b ? b['sec'] : undefined;
            if (raw === undefined || raw === null || raw === '')
              return json(res, 200, { ok: false, error: '秒数必填(0=关闭自动刷新)' });
            if (!Number.isFinite(Number(raw))) return json(res, 200, { ok: false, error: '秒数非法' });
            const n = (function (v: unknown): number {
              if (v === 0 || v === '0') return 0;
              const nn = Math.floor(Number(v));
              if (!Number.isFinite(nn)) return 60;
              return Math.min(3600, Math.max(10, nn));
            })(raw);
            await updateConfig({ refreshSec: n });
            return json(res, 200, { ok: true, sec: n });
          } catch (e) {
            return json(res, 200, { ok: false, error: (e as Error)?.message || '保存失败' });
          }
        },
      }),
    'dshp-token-meter: set-refresh route',
  );

  // POST set-enabled
  ctx.effect(
    () =>
      ctx.webServer.register({
        kind: 'exact',
        path: `${BASE}/set-enabled`,
        handler: async (req: IncomingMessage, res: ServerResponse) => {
          if (!sameOrigin(req)) return json(res, 403, { ok: false, error: 'forbidden' });
          let body: unknown = {};
          try {
            body = JSON.parse((await readBody(req)) || '{}') as unknown;
          } catch {
            return json(res, 200, { ok: false, error: '请求体不是合法 JSON' });
          }
          try {
            const b = (body ?? {}) as Record<string, unknown>;
            if (!b || !Object.hasOwn(b, 'enabled'))
              return json(res, 200, { ok: false, error: 'enabled 必填（布尔值）' });
            const on = b['enabled'] === true;
            await updateConfig({ enabled: on });
            return json(res, 200, { ok: true, enabled: on });
          } catch (e) {
            return json(res, 200, { ok: false, error: (e as Error)?.message || '保存失败' });
          }
        },
      }),
    'dshp-token-meter: set-enabled route',
  );

  // POST add-vendor
  ctx.effect(
    () =>
      ctx.webServer.register({
        kind: 'exact',
        path: `${BASE}/add-vendor`,
        handler: async (req: IncomingMessage, res: ServerResponse) => {
          if (!sameOrigin(req)) return json(res, 403, { ok: false, error: 'forbidden' });
          let body: unknown = {};
          try {
            body = JSON.parse((await readBody(req)) || '{}') as unknown;
          } catch {
            return json(res, 200, { ok: false, error: '请求体不是合法 JSON' });
          }
          try {
            const cfg = getConfig();
            const b = (body ?? {}) as Record<string, unknown>;
            const v = (b && (b['vendor'] as Vendor)) || null;
            const err = checkVendor(v);
            if (err) return json(res, 200, { ok: false, error: err });
            const vv = v as Vendor;
            if (cfg.vendors.some((x) => x.id === vv.id))
              return json(res, 200, { ok: false, error: 'ID 已存在' });
            await updateConfig({
              vendors: [...cfg.vendors, { id: vv.id, name: vv.name, type: vv.type, params: vv.params }],
            });
            return json(res, 200, { ok: true });
          } catch (e) {
            return json(res, 200, { ok: false, error: (e as Error)?.message || '保存失败' });
          }
        },
      }),
    'dshp-token-meter: add-vendor route',
  );

  // POST update-vendor
  ctx.effect(
    () =>
      ctx.webServer.register({
        kind: 'exact',
        path: `${BASE}/update-vendor`,
        handler: async (req: IncomingMessage, res: ServerResponse) => {
          if (!sameOrigin(req)) return json(res, 403, { ok: false, error: 'forbidden' });
          let body: unknown = {};
          try {
            body = JSON.parse((await readBody(req)) || '{}') as unknown;
          } catch {
            return json(res, 200, { ok: false, error: '请求体不是合法 JSON' });
          }
          try {
            const cfg = getConfig();
            const b = (body ?? {}) as Record<string, unknown>;
            const v = (b && (b['vendor'] as Vendor)) || null;
            const err = checkVendor(v);
            if (err) return json(res, 200, { ok: false, error: err });
            const vv = v as Vendor;
            const i = cfg.vendors.findIndex((x) => x.id === vv.id);
            if (i === -1) return json(res, 200, { ok: false, error: '未知供应商' });
            const next = cfg.vendors.slice();
            const stored = cfg.vendors[i] as Vendor;
            next[i] = mergeVendorSecret(stored, {
              id: vv.id,
              name: vv.name,
              type: canonicalType(String(vv.type)),
              params: (vv.params ?? {}) as Record<string, unknown>,
            });
            await updateConfig({ vendors: next });
            return json(res, 200, { ok: true });
          } catch (e) {
            return json(res, 200, { ok: false, error: (e as Error)?.message || '保存失败' });
          }
        },
      }),
    'dshp-token-meter: update-vendor route',
  );

  // POST delete-vendor
  ctx.effect(
    () =>
      ctx.webServer.register({
        kind: 'exact',
        path: `${BASE}/delete-vendor`,
        handler: async (req: IncomingMessage, res: ServerResponse) => {
          if (!sameOrigin(req)) return json(res, 403, { ok: false, error: 'forbidden' });
          let body: unknown = {};
          try {
            body = JSON.parse((await readBody(req)) || '{}') as unknown;
          } catch {
            return json(res, 200, { ok: false, error: '请求体不是合法 JSON' });
          }
          try {
            const cfg = getConfig();
            const b = (body ?? {}) as Record<string, unknown>;
            const id = (b && (b['id'] as string)) || '';
            const next = cfg.vendors.filter((v) => v.id !== id);
            const nextActive =
              cfg.activeVendor === id ? (next[0] && (next[0] as Vendor).id) || '' : cfg.activeVendor;
            if (nextActive !== cfg.activeVendor)
              await updateConfig({ vendors: next, activeVendor: nextActive });
            else await updateConfig({ vendors: next });
            delete st.snaps[id];
            return json(res, 200, { ok: true });
          } catch (e) {
            return json(res, 200, { ok: false, error: (e as Error)?.message || '删除失败' });
          }
        },
      }),
    'dshp-token-meter: delete-vendor route',
  );

  // POST secret-to-cred
  ctx.effect(
    () =>
      ctx.webServer.register({
        kind: 'exact',
        path: `${BASE}/secret-to-cred`,
        handler: async (req: IncomingMessage, res: ServerResponse) => {
          if (!sameOrigin(req)) return json(res, 403, { ok: false, error: 'forbidden' });
          let body: unknown = {};
          try {
            body = JSON.parse((await readBody(req)) || '{}') as unknown;
          } catch {
            return json(res, 200, { ok: false, error: '请求体不是合法 JSON' });
          }
          try {
            let creds: AnyCtx = null;
            try {
              creds = ctx.get('credentials') as AnyCtx;
            } catch {
              creds = null;
            }
            if (!creds) return json(res, 200, { ok: false, error: '凭据服务不可用' });
            const cfg = getConfig();
            const b = (body ?? {}) as Record<string, unknown>;
            const id = (b && (b['id'] as string)) || '';
            const v = cfg.vendors.filter((x) => x.id === id)[0] as Vendor | undefined;
            if (!v) return json(res, 200, { ok: false, error: '未知供应商' });
            const f = getSecretField(v.type);
            if (!f) return json(res, 200, { ok: false, error: '该类型无密钥字段' });
            const raw = readSecretValue(v) || '';
            const writeKey = locateSecretKey(v) || f;
            if (
              typeof raw === 'string' &&
              (DOLLAR_REF_RE.test(raw) || ENV_REF_RE.test(raw) || CRED_REF_RE.test(raw))
            ) {
              return json(res, 200, { ok: false, error: '已经是引用,无需转存' });
            }
            const r = await resolveSecret(raw);
            if (!r.value) return json(res, 200, { ok: false, error: '密钥为空' });
            const credName = ('TMETER_' + id.replace(/[^A-Za-z0-9_]/g, '_')).toUpperCase();
            await creds.set(credName, r.value);
            const next = cfg.vendors.map((x) =>
              x.id === id ? { ...x, params: { ...x.params, [writeKey]: '$' + credName } } : x,
            );
            await updateConfig({ vendors: next });
            return json(res, 200, { ok: true, cred: credName });
          } catch (e) {
            return json(res, 200, { ok: false, error: (e as Error)?.message || '转存失败' });
          }
        },
      }),
    'dshp-token-meter: secret-to-cred route',
  );

  // POST config —— 通用偏好补丁（quota 显示/刷新/活动 + stats 偏好二合一）
  ctx.effect(
    () =>
      ctx.webServer.register({
        kind: 'exact',
        path: `${BASE}/config`,
        handler: async (req: IncomingMessage, res: ServerResponse) => {
          if (!sameOrigin(req)) return json(res, 403, { ok: false, error: 'forbidden' });
          if ((req as { method?: string }).method !== 'POST')
            return json(res, 405, { ok: false, error: 'method not allowed' });
          let body: unknown = {};
          try {
            body = JSON.parse((await readBody(req)) || '{}') as unknown;
          } catch {
            return json(res, 200, { ok: false, error: '请求体不是合法 JSON' });
          }
          const a: Record<string, unknown> = isRecord(body) ? body : {};
          try {
            const patchObj: Record<string, unknown> = {};
            let hasPatch = false;
            if (Object.hasOwn(a, 'enabled')) {
              patchObj['enabled'] = a['enabled'] === true;
              hasPatch = true;
            }
            if (Object.hasOwn(a, 'showToday')) {
              patchObj['showToday'] = a['showToday'] === true;
              hasPatch = true;
            }
            if (Object.hasOwn(a, 'defaultRange')) {
              const dr = a['defaultRange'];
              if (dr !== '7' && dr !== '30' && dr !== '90' && dr !== 'all')
                throw new Error("defaultRange 非法，应为 '7' / '30' / '90' / 'all'");
              patchObj['defaultRange'] = dr;
              hasPatch = true;
            }
            if (Object.hasOwn(a, 'refreshSec')) {
              const raw = a['refreshSec'];
              if (raw === undefined || raw === null || raw === '')
                throw new Error('refreshSec 非法，应为数字（0=关闭）');
              const n = Number(raw);
              if (!Number.isFinite(n)) throw new Error('refreshSec 非法，应为数字（0=关闭）');
              patchObj['refreshSec'] =
                raw === 0 || raw === '0' ? 0 : Math.min(3600, Math.max(10, Math.floor(n)));
              hasPatch = true;
            }
            if (Object.hasOwn(a, 'activeVendor')) {
              if (typeof a['activeVendor'] !== 'string') throw new Error('activeVendor 非法，应为字符串');
              const id = a['activeVendor'] as string;
              const cfg = getConfig();
              if (id !== '' && !cfg.vendors.some((v) => v.id === id)) throw new Error('未知供应商');
              patchObj['activeVendor'] = id;
              hasPatch = true;
            }
            if (hasPatch) await updateConfig(patchObj);
            return json(res, 200, { ok: true, config: getConfig() });
          } catch (e) {
            return json(res, 200, { ok: false, error: String((e as Error)?.message ?? e) });
          }
        },
      }),
    'dshp-token-meter: config route',
  );
}
