/**
 * @dshp/token-meter —— deepseek 适配器（统一入口，按密钥格式自动选路）
 *
 * 原实现：dsh-token-quota/lib/providers/deepseek.js（逐行对齐，仅加 TS 类型）
 *
 * 同一 vendor 内任意填写，插件按已解析密钥的格式选择数据接口：
 *  - `sk-` 开头 → deepseek-api（官方 `/user/balance`，长期有效，无历史趋势）；
 *  - 其他 → deepseek-web（网页 `get_user_summary`，余额 + 历史趋势，会话会过期）。
 * 一路鉴权失败（401/403）且另一路有凭据时自动换路重试；其他错误直接抛出。
 */
import { normalizeSecretRef, secretKindOfRaw } from '../secrets.js';
import { fetchOfficialBalance } from './deepseek-api.js';
import { fetchWebSummary } from './deepseek-web.js';
import type { ProviderAdapter, Vendor, ProviderDeps } from '../types.js';

/** 去 Bearer 前缀（分类前归一，大小写不敏感）。 */
export function stripBearer(v: unknown): string {
  const t = String(v || '').trim();
  const m = t.match(/^bearer\s+(.+)$/i);
  return m ? (m[1] as string).trim() : t;
}

/** 是否像官方 apiKey（`sk-` 开头 + 足够长度；否则按网页会话票据处理）。 */
export function looksOfficial(v: unknown): boolean {
  return /^sk-[A-Za-z0-9_-]{8,}$/.test(stripBearer(v));
}

const isWebAuthErr = (msg: string): boolean => /会话失效\(40[13]\)/.test(msg || '');
const isApiAuthErr = (msg: string): boolean => /密钥无效\(401\)/.test(msg || '');

const deepseek: ProviderAdapter = {
  type: 'deepseek',
  label: 'DS',
  title: 'deepseek（官方·自动）',
  secretField: 'token',
  secretFields: ['token', 'apiKey', 'cookie'],
  hint: '自动选路：sk- 开头走官方余额接口，其余走网页账单（含历史趋势）；同时配置优先用 token 走网页，一路失效自动换路。分开配请用 deepseek-api / deepseek-web。',
  fields: [
    {
      key: 'apiKey',
      label: 'apiKey',
      kind: 'secret',
      mono: true,
      placeholder: '填 $NAME 引用（推荐）或粘贴明文',
      hint: '官方余额接口用：开放平台 → API keys 创建（sk- 开头，长期有效）。只填它也能查余额（无历史趋势）；sk- 格式会被自动送往官方接口。',
    },
    {
      key: 'token',
      label: 'token',
      kind: 'secret',
      mono: true,
      placeholder: '粘贴 Bearer 会话票据（网页接口用）',
      hint: '网页接口用：platform.deepseek.com 登录后，Network 里 get_user_summary 请求的 authorization 头 Bearer 后面的串（ciYi 开头）。非 sk- 格式会被自动送往网页接口；与 apiKey 同时填时优先用它。会话过期后需重粘。',
    },
    {
      key: 'lowWarn',
      label: '低余额预警线',
      kind: 'number',
      placeholder: '如：20',
      hint: '余额低于此值时侧边栏黄色提醒（与所选币种同单位）。',
    },
    {
      key: 'currency',
      label: '优先币种',
      kind: 'text',
      mono: true,
      placeholder: '默认 CNY，可填 USD',
      hint: '多币种账户时优先展示的币种；不填则自动归一（CNY 优先）。仅官方接口多币种时有效。',
    },
  ],

  sanitizeParams(raw: unknown): Record<string, unknown> {
    const src =
      raw !== null && typeof raw === 'object' && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(src)) {
      const v = src[k];
      if (v !== undefined) out[k] = typeof v === 'string' ? normalizeSecretRef(v) : v;
    }
    for (const k of ['apiKey', 'token', 'cookie']) {
      if (typeof out[k] === 'string') out[k] = normalizeSecretRef(out[k]) as never;
    }
    return out;
  },

  maskParams(params: Record<string, unknown>): Record<string, unknown> {
    const out = { ...params };
    for (const k of ['apiKey', 'token', 'cookie']) {
      if (typeof out[k] === 'string' && out[k] !== '' && secretKindOfRaw(out[k]) === 'plain') out[k] = '';
    }
    return out;
  },

  validateParams(): string {
    return '';
  },

  async fetch(vendor: Vendor, deps: ProviderDeps) {
    const params = (vendor && vendor.params) || {};
    const strOf = (v: unknown): string => (typeof v === 'string' ? v : '');
    const rCookie = await deps.resolveSecret(strOf(params['cookie']));
    const rToken = await deps.resolveSecret(strOf(params['token']));
    const rKey = await deps.resolveSecret(strOf(params['apiKey']));
    const fetchImpl = (deps && deps.fetchImpl) || fetch;
    const bearers: Array<{ value: string; kind: string; via: string }> = [];
    if (rToken.value) bearers.push({ ...rToken, via: 'web' });
    if (rKey.value) bearers.push({ ...rKey, via: looksOfficial(rKey.value) ? 'api' : 'web' });
    for (const b of bearers) {
      if (b.via === 'web' && looksOfficial(b.value)) b.via = 'api';
    }
    if (!bearers.length && !rCookie.value) {
      throw new Error(
        '凭据未配置:apiKey 与 token 至少填一个（sk- 开头走官方，其余走网页，获取方式见字段说明）',
      );
    }
    const order: string[] = [];
    const firstVia = bearers.length ? (bearers[0] as { via: string }).via : 'web';
    order.push(firstVia);
    if (bearers.some((b) => b.via !== firstVia)) order.push(firstVia === 'web' ? 'api' : 'web');
    let lastErr: unknown = null;
    for (const which of order) {
      if (which === 'web') {
        const wb = bearers.filter((b) => b.via === 'web')[0];
        if (!wb && !rCookie.value) continue;
        try {
          const data = await fetchWebSummary(params, rCookie.value, wb ? wb.value : '', fetchImpl);
          return { ...data, secretKind: wb ? wb.kind : rCookie.kind, via: '网页接口' };
        } catch (e) {
          lastErr = e;
          if (!isWebAuthErr((e as Error)?.message || '')) throw e;
        }
      } else {
        const kb = bearers.filter((b) => b.via === 'api')[0];
        if (!kb) continue;
        try {
          const data = await fetchOfficialBalance(params, kb.value, fetchImpl);
          return { ...data, secretKind: kb.kind, via: '官方接口' };
        } catch (e) {
          lastErr = e;
          if (!isApiAuthErr((e as Error)?.message || '')) throw e;
        }
      }
    }
    throw lastErr || new Error('拉取失败');
  },
};

export default deepseek;
