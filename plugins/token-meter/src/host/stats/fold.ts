/**
 * 会话日志折叠聚合 —— 纯函数，无副作用，可独立单测
 *
 * 原实现：dsh-token-stats/lib/fold.js（逐行对齐，仅加 TS 类型）
 *
 * 聚合口径：
 *  - 单请求 Token = inputTokens + cacheReadTokens + cacheWriteTokens + outputTokens
 *    （reasoningTokens 已含在 outputTokens，不重复计）；
 *  - 同一 (turn, step) 的 usage chunk 为早期采样、assistant/message usage 为终值，
 *    后到者覆盖前者（flush 语义），不重复累计；
 *  - fork/resume 会话跳过其头 skipCount 条种子事件（父会话已计）。
 */

export function modelKey(provider: unknown, model: unknown): string {
  return String(provider || 'unknown') + '/' + String(model || 'unknown');
}

export function dayKey(t: number): string {
  const d = new Date(t);
  const M = String(d.getMonth() + 1);
  const D = String(d.getDate());
  return d.getFullYear() + '-' + (M.length < 2 ? '0' + M : M) + '-' + (D.length < 2 ? '0' + D : D);
}

const BUCKETS = ['i', 'o', 'cr', 'cw'] as const;
type Bucket = (typeof BUCKETS)[number];

export interface FoldBucket {
  d: string;
  h: number;
  m: string;
  i: number;
  o: number;
  cr: number;
  cw: number;
  n: number;
}

export interface FoldPeak {
  tokens: number;
  d: string;
  model: string;
}

export interface FoldResult {
  records: Map<string, FoldBucket>;
  peak: FoldPeak | null;
  first: string | null;
  last: string | null;
  used: boolean;
}

interface SessionEvent {
  seq?: unknown;
  type?: unknown;
  time?: unknown;
  data?: unknown;
}

interface UsageLike {
  inputTokens?: unknown;
  outputTokens?: unknown;
  cacheReadTokens?: unknown;
  cacheWriteTokens?: unknown;
}

/** 会话聚合结果：records 键为 `${day}|${hour}|${model}`。 */
function emptyResult(): FoldResult {
  return { records: new Map(), peak: null, first: null, last: null, used: false };
}

function numOf(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/**
 * 折叠一个会话的事件日志为聚合记录（跳过前 skipCount 条种子事件）。
 */
export function foldSession(events: SessionEvent[], skipCount: number): FoldResult {
  const state = emptyResult();
  let routeProvider = 'unknown';
  let routeModel = 'unknown';
  const route = (): string => routeProvider + '/' + routeModel;
  const setRoute = (p: unknown, m: unknown): void => {
    if (p !== undefined && p !== null && p !== '') routeProvider = String(p);
    if (m !== undefined && m !== null && m !== '') routeModel = String(m);
  };
  let pending: { key: string; usage: UsageLike; time: number; model: string } | null = null;

  const commit = (usage: UsageLike, time: number, model: string): void => {
    const vals: Record<Bucket, number> = {
      i: numOf((usage as Record<string, unknown>)['inputTokens']),
      o: numOf((usage as Record<string, unknown>)['outputTokens']),
      cr: numOf((usage as Record<string, unknown>)['cacheReadTokens']),
      cw: numOf((usage as Record<string, unknown>)['cacheWriteTokens']),
    };
    const tokens = vals.i + vals.o + vals.cr + vals.cw;
    if (tokens <= 0) return;
    state.used = true;
    const d = dayKey(time);
    const h = new Date(time).getHours();
    const k = d + '|' + h + '|' + model;
    let r = state.records.get(k);
    if (r === undefined) {
      r = { d, h, m: model, i: 0, o: 0, cr: 0, cw: 0, n: 0 };
      state.records.set(k, r);
    }
    for (const b of BUCKETS) r[b] += vals[b];
    r.n += 1;
    if (state.peak === null || tokens > state.peak.tokens) state.peak = { tokens, d, model };
    if (state.first === null || d < state.first) state.first = d;
    if (state.last === null || d > state.last) state.last = d;
  };

  const flush = (): void => {
    if (pending === null) return;
    commit(pending.usage, pending.time, pending.model);
    pending = null;
  };

  const limit = skipCount > 0 ? skipCount : 0;
  for (let idx = 0; idx < events.length; idx++) {
    if (idx < limit) continue;
    const ev = events[idx] as SessionEvent;
    const data = ev && (ev.data as Record<string, unknown> | null);
    if (data === null || typeof data !== 'object') continue;

    switch (ev.type) {
      case 'request/header': {
        const header = data['header'] as Record<string, unknown> | undefined;
        const cfg = header && (header['config'] as Record<string, unknown> | undefined);
        if (cfg) setRoute(cfg['provider'], cfg['model']);
        break;
      }
      case 'request/context': {
        setRoute(data['provider'], data['model']);
        break;
      }
      case 'assistant/chunk': {
        const chunk = data['chunk'] as Record<string, unknown> | null | undefined;
        if (chunk !== null && typeof chunk === 'object' && chunk['type'] === 'usage' && chunk['usage']) {
          const key = String(data['turn']) + ':' + String(data['step']);
          if (pending !== null && pending.key !== key) flush();
          pending = {
            key,
            usage: chunk['usage'] as UsageLike,
            time: Number(ev.time) || 0,
            model: route(),
          };
        }
        break;
      }
      case 'assistant/message': {
        const key = String(data['turn']) + ':' + String(data['step']);
        const msg = data['message'] as Record<string, unknown> | undefined;
        const src = msg && (msg['source'] as Record<string, unknown> | undefined);
        const srcModel = src && src['kind'] === 'model' ? modelKey(src['provider'], src['model']) : null;
        if (data['usage']) {
          if (pending !== null && pending.key !== key) flush();
          pending = {
            key,
            usage: data['usage'] as UsageLike,
            time: Number(ev.time) || 0,
            model: srcModel || route(),
          };
        } else if (pending !== null && pending.key === key && srcModel !== null) {
          pending.model = srcModel;
        }
        break;
      }
    }
  }
  flush();
  return state;
}

export interface CompactAgg {
  r: Array<[string, FoldBucket]>;
  p: FoldPeak | null;
  f: string | null;
  l: string | null;
  u: boolean;
}

/** Map ↔ 数组序列化（JSON 不支持 Map）。 */
export const compactAgg = (agg: FoldResult): CompactAgg => ({
  r: Array.from(agg.records.entries()),
  p: agg.peak,
  f: agg.first,
  l: agg.last,
  u: agg.used,
});

export const reviveAgg = (c: CompactAgg): FoldResult => ({
  records: new Map(c.r),
  peak: c.p,
  first: c.f,
  last: c.l,
  used: c.u,
});
