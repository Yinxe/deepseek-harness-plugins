/**
 * @dshp/token-meter —— deepseek-api 适配器（官方 apiKey 接口，纯通道）
 *
 * 原实现：dsh-token-quota/lib/providers/deepseek-api.js（逐行对齐，仅加 TS 类型）
 *
 * 接口：`GET https://api.deepseek.com/user/balance`
 *   `Authorization: Bearer <apiKey>` → `{ balance_infos, is_available }`。
 * 币种归一：params.currency 优先 → CNY → 首条。
 */
import { numStr } from './base.js';
import { normalizeSecretRef } from '../secrets.js';
import type { ProviderAdapter, Vendor, ProviderDeps } from '../types.js';

function isRecord(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

/**
 * 余额币种选择（纯函数，可单测）。
 */
export function pickBalanceInfo(infos: unknown[], prefer: string): Record<string, unknown> | null {
  if (!Array.isArray(infos) || !infos.length) return null;
  if (prefer) {
    const hit = infos.filter((x) => isRecord(x) && x['currency'] === prefer)[0] as
      Record<string, unknown> | undefined;
    if (hit) return hit;
  }
  const cny = infos.filter((x) => isRecord(x) && x['currency'] === 'CNY')[0] as
    Record<string, unknown> | undefined;
  if (cny) return cny;
  return infos[0] as Record<string, unknown>;
}

function curSym(cur: string): string {
  if (cur === 'CNY') return '¥';
  if (cur === 'USD') return '$';
  return '';
}

/**
 * 官方余额拉取（纯逻辑，可单测；secretKind 由调用方附）。
 */
export async function fetchOfficialBalance(
  params: Record<string, unknown>,
  secret: string,
  fetchImpl: typeof fetch,
): Promise<{ billingKind: 'payg'; billing: Record<string, unknown>; extra: Record<string, unknown> | null }> {
  const url = 'https://api.deepseek.com/user/balance';
  const res = await fetchImpl(url, { headers: { Authorization: 'Bearer ' + secret }, cache: 'no-store' });
  const code = res.status;
  const body = await res.text();
  if (code === 401) throw new Error('DeepSeek 密钥无效(401),请检查 apiKey');
  if (code === 402) throw new Error('DeepSeek 余额不足(402),请前往平台充值');
  if (code === 429) throw new Error('DeepSeek 限流(429),稍后重试');
  if (code !== 200) throw new Error('DeepSeek 接口 HTTP ' + code + ':' + body.slice(0, 100));
  let j: unknown = null;
  try {
    j = JSON.parse(body) as unknown;
  } catch {
    throw new Error('余额接口返回非 JSON(' + body.length + 'B):' + body.slice(0, 80));
  }
  const jr = (j ?? {}) as Record<string, unknown>;
  if (jr && jr['error']) {
    const em = isRecord(jr['error']) ? String(jr['error']['message'] ?? '') : '';
    throw new Error('余额接口报错:' + (em || body.slice(0, 80)));
  }
  let infos = jr && Array.isArray(jr['balance_infos']) ? (jr['balance_infos'] as unknown[]) : null;
  const isAvail = jr && jr['is_available'] !== undefined ? !!jr['is_available'] : null;
  if (!infos && jr && jr['total_balance'] !== undefined) {
    infos = [
      {
        currency: (jr['currency'] as string) || 'CNY',
        total_balance: jr['total_balance'],
        granted_balance: jr['granted_balance'],
        topped_up_balance: jr['topped_up_balance'],
      },
    ];
  }
  if (!infos) throw new Error('余额接口字段缺失(无 balance_infos):' + String(body).slice(0, 100));
  const prefer = (params && (params['currency'] as string)) || '';
  const primary = pickBalanceInfo(infos, prefer);
  if (!primary) throw new Error('余额为空');
  const normInfos = infos.map((x) => {
    const xr = (x ?? {}) as Record<string, unknown>;
    return {
      currency: String(xr['currency'] || ''),
      total: numStr(xr['total_balance']),
      granted:
        xr['granted_balance'] !== undefined && xr['granted_balance'] !== null && xr['granted_balance'] !== ''
          ? numStr(xr['granted_balance'])
          : null,
      toppedUp:
        xr['topped_up_balance'] !== undefined &&
        xr['topped_up_balance'] !== null &&
        xr['topped_up_balance'] !== ''
          ? numStr(xr['topped_up_balance'])
          : null,
    };
  });
  const g =
    primary['granted_balance'] !== undefined &&
    primary['granted_balance'] !== null &&
    primary['granted_balance'] !== ''
      ? numStr(primary['granted_balance'])
      : null;
  const t =
    primary['topped_up_balance'] !== undefined &&
    primary['topped_up_balance'] !== null &&
    primary['topped_up_balance'] !== ''
      ? numStr(primary['topped_up_balance'])
      : null;
  const currency = String(primary['currency'] || 'CNY');
  const balance = numStr(primary['total_balance']);
  // 总额度块：赠送 + 充值 = 总量，已用 = 总量 - 余额
  let extra: Record<string, unknown> | null = null;
  const totalQuota = (g !== null ? g : 0) + (t !== null ? t : 0);
  if (totalQuota > 0) {
    const used = Math.max(0, totalQuota - balance);
    const r2 = (n: number): number => Math.round(Number(n) * 100) / 100;
    extra = {
      blocks: [
        {
          kind: 'progress',
          label: '总额度消耗',
          used: r2(used),
          total: r2(totalQuota),
          left: '剩余 ' + curSym(currency) + balance.toFixed(2),
        },
      ],
    };
  }
  return {
    billingKind: 'payg',
    billing: {
      balance,
      currency,
      granted: g,
      toppedUp: t,
      isAvailable: isAvail,
      infos: normInfos,
      lowWarn: params['lowWarn'] !== undefined && params['lowWarn'] !== '' ? Number(params['lowWarn']) : null,
      plan: 'DeepSeek API',
    },
    extra,
  };
}

const deepseekApi: ProviderAdapter = {
  type: 'deepseek-api',
  label: 'DS-API',
  title: 'deepseek-api（官方密钥）',
  secretField: 'apiKey',
  hint: '官方余额接口：长期有效的 apiKey（sk- 开头），余额 + 总额度块，无历史趋势。',
  fields: [
    {
      key: 'apiKey',
      label: 'apiKey *',
      kind: 'secret',
      mono: true,
      required: true,
      placeholder: '填 $NAME 引用（推荐）或粘贴明文',
      hint: '密钥获取：DeepSeek 开放平台 → API keys（platform.deepseek.com/api_keys）创建，sk- 开头，长期有效。建议先存入系统凭据再填 $NAME。',
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
      hint: '多币种账户时优先展示的币种；不填则自动归一（CNY 优先）。',
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
    if (typeof out['apiKey'] === 'string') out['apiKey'] = normalizeSecretRef(out['apiKey']) as never;
    return out;
  },

  validateParams(): string {
    return '';
  },

  async fetch(vendor: Vendor, deps: ProviderDeps) {
    const params = (vendor && vendor.params) || {};
    const r = await deps.resolveSecret(
      typeof params['apiKey'] === 'string' ? (params['apiKey'] as string) : '',
    );
    if (!r.value)
      throw new Error('apiKey 未配置:请在设置页填写或检查 $NAME 引用（开放平台 → API keys 创建）');
    const data = await fetchOfficialBalance(params, r.value, (deps && deps.fetchImpl) || fetch);
    return { ...data, secretKind: r.kind, via: '官方接口' };
  },
};

export default deepseekApi;
