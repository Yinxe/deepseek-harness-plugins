/**
 * @dshp/token-meter —— opencode 适配器（官方 /go + /billing 双页合并）
 *
 * 原实现：dsh-token-quota/lib/providers/opencode.js（逐行对齐，仅加 TS 类型）
 *
 * 一个渠道覆盖 Opencode Go（订阅制三窗口）与 Zen（按量余额）：
 * 同一 workspace、同一 cookie，一次拉取同时请求两页。
 */
import { WORKSPACE_RE, numStr } from './base.js';
import { normalizeSecretRef, secretKindOfRaw } from '../secrets.js';
import type { ProviderAdapter, Vendor, ProviderDeps, QuotaWindow } from '../types.js';

/** 旧密钥字段名（兼容读取 + 自动迁移）。 */
export const LEGACY_AUTH_FIELD = 'auth';

/**
 * 取生效 Cookie 原文（`cookie` 优先，旧 `auth` 兜底）。
 */
export function effectiveCookie(params: Record<string, unknown>): string {
  const p = params && typeof params === 'object' ? params : {};
  const c = p['cookie'];
  if (typeof c === 'string' && c.trim() !== '') return c;
  const a = p[LEGACY_AUTH_FIELD];
  if (typeof a === 'string' && a.trim() !== '') return a;
  return '';
}

/**
 * 组装 Cookie 请求头：含 `=` 视为整段 Cookie 原样透传，否则视为裸 token 补 `auth=` 前缀。
 */
export function toCookieHeader(secret: string): string {
  const s = String(secret || '').trim();
  if (s === '') return '';
  if (s.indexOf('=') !== -1) return s;
  return 'auth=' + s;
}

/** cookie 类 params 通用清洗：旧引用归一 + 旧 auth→cookie 收敛（读兼容，写收敛）。 */
export function sanitizeCookieParams(raw: unknown): Record<string, unknown> {
  const src =
    raw !== null && typeof raw === 'object' && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
  const out: Record<string, unknown> = {};
  for (const k of Object.keys(src)) {
    const v = src[k];
    if (v !== undefined) out[k] = typeof v === 'string' ? normalizeSecretRef(v) : v;
  }
  if (typeof out['cookie'] === 'string') out['cookie'] = normalizeSecretRef(out['cookie']) as never;
  if (typeof out[LEGACY_AUTH_FIELD] === 'string')
    out[LEGACY_AUTH_FIELD] = normalizeSecretRef(out[LEGACY_AUTH_FIELD]) as never;
  if (
    (out['cookie'] === undefined || out['cookie'] === '') &&
    typeof out[LEGACY_AUTH_FIELD] === 'string' &&
    (out[LEGACY_AUTH_FIELD] as string) !== ''
  ) {
    out['cookie'] = out[LEGACY_AUTH_FIELD];
  }
  return out;
}

/** cookie 类 params 脱敏：cookie 与旧 auth 的明文一律抹掉（只写不读）。 */
export function maskCookieParams(params: Record<string, unknown>): Record<string, unknown> {
  const out = { ...params };
  for (const k of ['cookie', LEGACY_AUTH_FIELD]) {
    if (typeof out[k] === 'string' && out[k] !== '' && secretKindOfRaw(out[k]) === 'plain') out[k] = '';
  }
  return out;
}

const GO_PATH = '/go';
const BILLING_PATH = '/billing';
/** billing 页 amount 的最小展示单位（实测 500000000 → $5.00，即 1e8 记账单位）。 */
const BILLING_UNIT = 1e8;

function isObj(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

/**
 * 从页面 html 提取标量内联键值（React Server Components 流式数据）。
 */
function inlineVal(html: string, key: string): string | number | boolean | null | undefined {
  const re = new RegExp(key + '\\s*:\\s*("([^"]{0,80})"|null|true|false|(-?\\d+(?:\\.\\d+)?))');
  const m = re.exec(html);
  if (!m) return undefined;
  if (m[2] !== undefined) return m[2];
  if (m[3] !== undefined) return Number(m[3]);
  if (m[1] === 'null') return null;
  if (m[1] === 'true') return true;
  if (m[1] === 'false') return false;
  return undefined;
}

/** ISO 日期字符串首个命中，返回 Date 或 null。 */
function inlineDate(html: string, key: string): Date | null {
  const m = new RegExp(key + '\\s*:\\s*(?:new Date\\()?"(\\d{4}-\\d{2}-\\d{2}T[0-9:.]+Z?)"').exec(html);
  if (!m) return null;
  const d = new Date(m[1] as string);
  return Number.isNaN(d.getTime()) ? null : d;
}

const mmdd = (d: Date | null): string =>
  d ? String(d.getMonth() + 1).padStart(2, '0') + '/' + String(d.getDate()).padStart(2, '0') : '';

/** 秒数 → 中文剩余时长（订阅到期话术用：X天后 / X小时后）。 */
export function fmtLeftCn(sec: number): string {
  const s = Math.max(0, Math.round(Number(sec) || 0));
  if (s >= 86400) return Math.floor(s / 86400) + ' 天';
  if (s >= 3600) return Math.floor(s / 3600) + ' 小时';
  if (s >= 60) return Math.floor(s / 60) + ' 分钟';
  return s + ' 秒';
}

/** 余额换算：amount（最小单位）→ 展示数（除以 1e8，保留 2 位）。 */
export function billingAmount(amount: unknown): number | null {
  if (amount === undefined || amount === null) return null;
  const n = Number(amount);
  if (!Number.isFinite(n)) return null;
  return Math.round((n / BILLING_UNIT) * 100) / 100;
}

/**
 * 从 /go + /billing 提取订阅信息（纯函数，可单测）。
 */
export function parseSubscription(
  goHtml: string,
  billingHtml: string,
): { plan: string; note: string; expireAt: null } | null {
  const src = (goHtml || '') + '\n' + (billingHtml || '');
  const plan = inlineVal(src, 'subscriptionPlan');
  void inlineDate;
  if (typeof plan === 'string' && plan && plan !== 'null') {
    const sub = inlineVal(src, 'subscription');
    return { plan: String(plan), note: sub ? '订阅生效中' : '', expireAt: null };
  }
  const liteId = inlineVal(src, 'liteSubscriptionID');
  if (typeof liteId === 'string' && liteId && liteId !== 'null') {
    const paid = latestLitePurchase(billingHtml || '');
    return { plan: 'Lite', note: paid ? '购买于 ' + mmdd(paid) : '', expireAt: null };
  }
  return null;
}

/** /billing 支付记录里 type:"lite" 的最近购买时间。 */
function latestLitePurchase(billingHtml: string): Date | null {
  const html = billingHtml || '';
  let latest: Date | null = null;
  const re =
    /timeCreated\s*:\s*(?:new Date\()?"(\d{4}-\d{2}-\d{2}T[0-9:.]+Z?)"[^}]{0,400}?type\s*:\s*"lite"/g;
  let m: RegExpExecArray | null = null;
  while ((m = re.exec(html)) !== null) {
    const d = new Date(m[1] as string);
    if (!Number.isNaN(d.getTime()) && (latest === null || d > latest)) latest = d;
  }
  if (latest === null) {
    const re2 =
      /type\s*:\s*"lite"[^}]{0,400}?timeCreated\s*:\s*(?:new Date\()?"(\d{4}-\d{2}-\d{2}T[0-9:.]+Z?)"/g;
    while ((m = re2.exec(html)) !== null) {
      const d = new Date(m[1] as string);
      if (!Number.isNaN(d.getTime()) && (latest === null || d > latest)) latest = d;
    }
  }
  return latest;
}

/**
 * 从 /go 页 html 提取 3 个滚动窗口 + 订阅名（纯函数，可单测）。
 */
export function parseGoQuota(html: string): { windows: QuotaWindow[]; plan: string | null } | null {
  const re = /\{status:"ok",resetInSec:(\d+),usagePercent:([\d.]+),usage:(\d+),limit:(\d+)\}/g;
  const wins: Array<{ resetInSec: number; pct: number; used: number; limit: number }> = [];
  let m: RegExpExecArray | null = null;
  while ((m = re.exec(html)) !== null) {
    wins.push({
      resetInSec: Number(m[1]),
      pct: Number(m[2]),
      used: Number(m[3]),
      limit: Number(m[4]),
    });
  }
  if (wins.length < 3) return null;
  const meta: Array<[string, string]> = [
    ['5h', '5小时'],
    ['weekly', '每周'],
    ['monthly', '每月'],
  ];
  let plan: string | null = null;
  const pm = /subscriptionPlan:([A-Za-z0-9_]+|null)/.exec(html);
  if (pm && pm[1] !== 'null') plan = pm[1] as string;
  return {
    windows: wins.slice(0, 3).map((w, i) => {
      const mt = meta[i] as [string, string];
      return { key: mt[0], label: mt[1], pct: w.pct, used: w.used, limit: w.limit, resetInSec: w.resetInSec };
    }),
    plan,
  };
}

/**
 * 合并解析双页 → 渲染数据（纯函数，可单测）。
 */
export function parseOpencodePages(
  goHtml: string,
  billingHtml: string,
  opts?: { lowWarn?: unknown; currency?: string },
): {
  billingKind: 'rolling' | 'payg';
  windows?: QuotaWindow[];
  billing: Record<string, unknown>;
  extra?: Record<string, unknown> | null;
} | null {
  const q = parseGoQuota(goHtml || '');
  const sub = parseSubscription(goHtml || '', billingHtml || '');
  const balance = billingAmount(inlineVal(billingHtml || '', 'balance'));
  const optsEff = opts || {};
  if (q) {
    const billing: Record<string, unknown> = { balance, plan: (sub && sub.plan) || q.plan || 'Opencode' };
    const extra: Record<string, unknown> = {};
    if (sub && (sub.note || sub.plan)) {
      const monthly = q.windows.filter((w) => w.key === 'monthly')[0];
      const renewIn = monthly && monthly.resetInSec > 0 ? monthly.resetInSec : null;
      (extra as { blocks?: unknown[] }).blocks = [
        {
          kind: 'note',
          tone: 'info',
          text:
            '订阅 ' +
            sub.plan +
            (sub.note ? ' · ' + sub.note : '') +
            (renewIn !== null ? ' · 约 ' + fmtLeftCn(renewIn) + '重置/到期' : ''),
        },
      ];
    }
    if (balance !== null && balance !== undefined) {
      (extra as { stats?: unknown[] }).stats = [{ label: '充值余额', value: String(balance) }];
    }
    return {
      billingKind: 'rolling',
      windows: q.windows,
      billing,
      extra: (extra as { blocks?: unknown }).blocks || (extra as { stats?: unknown }).stats ? extra : null,
    };
  }
  if (balance !== null && balance !== undefined) {
    const currency = optsEff.currency || 'USD';
    return {
      billingKind: 'payg',
      billing: {
        balance: numStr(balance),
        currency,
        granted: null,
        toppedUp: null,
        isAvailable: balance > 0 ? true : null,
        infos: [],
        lowWarn:
          optsEff.lowWarn !== undefined && optsEff.lowWarn !== '' && optsEff.lowWarn !== null
            ? Number(optsEff.lowWarn)
            : null,
        plan: 'Opencode Zen',
      },
      extra: sub
        ? {
            blocks: [
              { kind: 'note', tone: 'info', text: '订阅 ' + sub.plan + (sub.note ? ' · ' + sub.note : '') },
            ],
          }
        : null,
    };
  }
  return null;
}

const opencode: ProviderAdapter = {
  type: 'opencode',
  label: 'OC',
  title: 'opencode（Go+Zen 合并）',
  secretField: 'cookie',
  hint: '官方渠道合并版：同一 workspace+cookie 同时拉 /go（三窗口+订阅）与 /billing（余额）。旧 opencode-go / opencode-zen 配置自动迁移。',
  fields: [
    {
      key: 'workspaceId',
      label: 'workspaceId *',
      kind: 'text',
      mono: true,
      required: true,
      placeholder: '如：wrk_xxx',
      hint: '工作区 ID：浏览器打开 opencode.ai 并进入你的工作区，地址栏 workspace/ 后面的 wrk_ 开头字符串（Go 与 Zen 页面通用）。',
    },
    {
      key: 'cookie',
      label: 'cookie *',
      kind: 'secret',
      mono: true,
      required: true,
      placeholder: '填 $NAME 引用（推荐）或粘贴 Cookie',
      hint: '登录态：浏览器开发者工具 → Application → Cookies → 复制 auth 的值；整段 Cookie（含 oc_locale 等）原样粘贴亦可。建议先存入系统凭据再填 $NAME。',
    },
    {
      key: 'lowWarn',
      label: '低余额预警线',
      kind: 'number',
      placeholder: '如：10',
      hint: '余额低于此值时侧边栏黄色提醒（USD，按量模式才生效）。',
    },
    {
      key: 'currency',
      label: '优先币种',
      kind: 'text',
      mono: true,
      placeholder: '默认 USD',
      hint: '按量余额展示币种（页面未声明币种，默认按 USD）。',
    },
  ],

  sanitizeParams: sanitizeCookieParams,
  readSecret: (params: Record<string, unknown>): unknown => effectiveCookie(params),
  maskParams: maskCookieParams,

  validateParams(params: Record<string, unknown>): string {
    const wid =
      params && params['workspaceId'] !== undefined && params['workspaceId'] !== null
        ? String(params['workspaceId'])
        : '';
    if (!WORKSPACE_RE.test(wid)) return 'workspaceId 非法';
    return '';
  },

  async fetch(vendor: Vendor, deps: ProviderDeps) {
    const params = (vendor && vendor.params) || {};
    const wid = (params['workspaceId'] as string) || '';
    if (!WORKSPACE_RE.test(String(wid)))
      throw new Error('workspaceId 非法（4~64 位字母/数字/下划线，如 wrk_xxx，见字段说明）');
    const r = await deps.resolveSecret(effectiveCookie(params));
    if (!r.value)
      throw new Error(
        'cookie 未配置:当前为' + r.kind + ',请在设置页填写 Cookie 或检查 $NAME 引用（获取方式见字段说明）',
      );
    const fetchImpl = (deps && deps.fetchImpl) || fetch;
    const base = 'https://opencode.ai/workspace/' + wid;
    const header = { Cookie: toCookieHeader(r.value), Accept: 'text/html' };
    const [goRes, billingRes] = await Promise.all([
      fetchImpl(base + GO_PATH, { headers: header, cache: 'no-store' }).catch(() => null),
      fetchImpl(base + BILLING_PATH, { headers: header, cache: 'no-store' }).catch(() => null),
    ]);
    let goHtml = '';
    let billingHtml = '';
    if (goRes) goHtml = await goRes.text().catch(() => '');
    if (billingRes) billingHtml = await billingRes.text().catch(() => '');
    if (goHtml.indexOf('usagePercent') === -1 && billingHtml.indexOf('balance') === -1) {
      throw new Error(
        '登录失效或被风控（/go ' +
          goHtml.length +
          'B · /billing ' +
          billingHtml.length +
          'B 均无数据），请更新 cookie',
      );
    }
    let data;
    try {
      data = parseOpencodePages(goHtml, billingHtml, {
        lowWarn: params['lowWarn'],
        currency: params['currency'] as string,
      });
    } catch (e) {
      throw new Error((e as Error)?.message || '页面解析失败', { cause: e });
    }
    if (!data) throw new Error('页面结构变化，解析失败（无窗口且无余额字段），请把两页顶层键名发给维护者');
    void isObj;
    return { ...data, secretKind: r.kind, via: '官方渠道' };
  },
};

export default opencode;
