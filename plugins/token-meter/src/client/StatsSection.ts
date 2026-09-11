/**
 * 用量统计 Section（stats）：设置页总览/趋势/热力图/模型 + 侧边栏今日卡 + 今日浮窗
 *
 * 原实现：dsh-token-stats/client.js（1548 行手写 bundle）→ 本文件为等价 TS 重写，
 * 口径对齐（总 Token = i+o+cr+cw；usage 终值覆盖采样；fork 种子跳过已在 Host 完成，
 * Client 仅按范围二次聚合），图表均为手绘 SVG（零依赖），样式前缀由 ts- 改为 tm-、
 * 路由前缀改为 dshp-token-meter。动效/悬浮/浮窗行为 1:1 还原。
 */
import { fetchStats, saveConfig } from './api.js';
import { createComponents } from './components.js';
import type { AnyPrimitives, AnyReact, StatsRecord, StatsSnapshot } from './types.js';

const BP = 'var(--dsw-alias-state-business-primary)';
const PALETTE = [
  '#4c7ef3', '#2fb261', '#f5a623', '#e05e4e', '#9a6ef1', '#25b8c4',
  '#d557a8', '#8a94a6', '#6b7280', '#34d399', '#f472b6', '#a3e635',
];
const RANGES = [
  { v: '7', t: '近7天' },
  { v: '30', t: '近30天' },
  { v: '90', t: '近90天' },
  { v: 'all', t: '全部' },
];
const rangeText = (rv: string): string => {
  for (const r of RANGES) if (r.v === rv) return r.t;
  return '';
};

/* ---------- util ---------- */
const keyOf = (t: number): string => {
  const d = new Date(t);
  const M = String(d.getMonth() + 1);
  const D = String(d.getDate());
  return d.getFullYear() + '-' + (M.length < 2 ? '0' + M : M) + '-' + (D.length < 2 ? '0' + D : D);
};
const fromKey = (k: string): number => {
  const p = k.split('-');
  return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]), 12).getTime();
};
const dispDay = (k: string): string => (k ? k.slice(5).replace('-', '/') : '');
const cnDate = (k: string): string => {
  const p = k.split('-');
  return Number(p[0]) + '年' + Number(p[1]) + '月' + Number(p[2]) + '日';
};
const hhmm = (t: number): string => {
  const d = new Date(t);
  const H = String(d.getHours());
  const Mi = String(d.getMinutes());
  return (H.length < 2 ? '0' + H : H) + ':' + (Mi.length < 2 ? '0' + Mi : Mi);
};
const tok = (r: { i?: number; o?: number; cr?: number; cw?: number }): number =>
  (r.i || 0) + (r.o || 0) + (r.cr || 0) + (r.cw || 0);
const fmt = (n: number): string => {
  n = Math.round(n || 0);
  if (n >= 1e8) return (n / 1e8).toFixed(1).replace(/\.0$/, '') + '亿';
  if (n >= 1e4) return (n / 1e4).toFixed(1).replace(/\.0$/, '') + '万';
  return n.toLocaleString('en-US');
};
const fmtFull = (n: number): string => Math.round(n || 0).toLocaleString('en-US');
const fmtRail = (n: number): string => {
  n = Math.round(n || 0);
  if (n >= 1e8) return (n / 1e8).toFixed(1).replace(/\.0$/, '') + '亿';
  if (n >= 1e4) return String(Math.round(n / 1e4)) + '万';
  return String(n);
};
const niceMax = (m: number): number => {
  if (m <= 0) return 1;
  const p = Math.pow(10, Math.floor(Math.log(m) / Math.LN10));
  // 候选更密（1/1.1/1.2/1.25…）：贴近实际峰值，减少曲线上方的大片空白
  const c = [1, 1.1, 1.2, 1.25, 1.5, 1.75, 2, 2.5, 3, 4, 5, 6, 8, 10];
  for (const v of c) if (v * p >= m) return v * p;
  return 10 * p;
};
/** 新鲜拷贝排序（oxlint unicorn/no-array-sort 要求不原地 sort；此处入参均为调用处新鲜数组，拷贝后排序语义与原实现一致） */
function sorted<T>(arr: T[], cmp?: (a: T, b: T) => number): T[] {
  // eslint-disable-next-line unicorn/no-array-sort
  return [...arr].sort(cmp);
}
const median = (arr: number[]): number => {
  if (!arr.length) return 0;
  const s = sorted(arr, (a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? (s[mid] as number) : (((s[mid - 1] as number) + (s[mid] as number)) / 2);
};

interface DayAgg { d: string; i: number; o: number; cr: number; cw: number; n: number; t: number; byModel: Record<string, number> }
interface ModelAgg { m: string; i: number; o: number; cr: number; cw: number; n: number; t: number }
interface Agg {
  byDay: Map<string, DayAgg>;
  byModel: Map<string, ModelAgg>;
  byHour: number[];
  i: number; o: number; cr: number; cw: number; n: number; total: number;
  first: string | null; last: string | null;
}

function aggregate(records: StatsRecord[], cutoff: string | null): Agg {
  const byDay = new Map<string, DayAgg>();
  const byModel = new Map<string, ModelAgg>();
  const byHour: number[] = [];
  for (let i = 0; i < 24; i++) byHour.push(0);
  let si = 0, so = 0, scr = 0, scw = 0, sn = 0;
  let first: string | null = null, last: string | null = null;
  for (const r of records) {
    if (cutoff !== null && r.d < cutoff) continue;
    const t = tok(r);
    si += r.i || 0; so += r.o || 0; scr += r.cr || 0; scw += r.cw || 0; sn += r.n || 0;
    (byHour[r.h] as number) += t;
    let day = byDay.get(r.d);
    if (day === undefined) {
      day = { d: r.d, i: 0, o: 0, cr: 0, cw: 0, n: 0, t: 0, byModel: {} };
      byDay.set(r.d, day);
    }
    day.i += r.i || 0; day.o += r.o || 0; day.cr += r.cr || 0; day.cw += r.cw || 0; day.n += r.n || 0; day.t += t;
    day.byModel[r.m] = ((day.byModel[r.m] as number) || 0) + t;
    let mo = byModel.get(r.m);
    if (mo === undefined) {
      mo = { m: r.m, i: 0, o: 0, cr: 0, cw: 0, n: 0, t: 0 };
      byModel.set(r.m, mo);
    }
    mo.i += r.i || 0; mo.o += r.o || 0; mo.cr += r.cr || 0; mo.cw += r.cw || 0; mo.n += r.n || 0; mo.t += t;
    if (first === null || r.d < first) first = r.d;
    if (last === null || r.d > last) last = r.d;
  }
  return { byDay, byModel, byHour, i: si, o: so, cr: scr, cw: scw, n: sn, total: si + so + scr + scw, first, last };
}

function streaks(byDay: Map<string, unknown>): { current: number; longest: number } {
  const set = new Set(byDay.keys());
  const today = keyOf(Date.now());
  const yKey = keyOf(fromKey(today) - 86400000);
  let cur = 0;
  let cursor: string | null = set.has(today) ? today : set.has(yKey) ? yKey : null;
  while (cursor !== null && set.has(cursor)) {
    cur++;
    cursor = keyOf(fromKey(cursor) - 86400000);
  }
  const keys = sorted(Array.from(set));
  let longest = 0, run = 0, prev: string | null = null;
  for (const k of keys) {
    run = prev !== null && keyOf(fromKey(prev) + 86400000) === k ? run + 1 : 1;
    if (run > longest) longest = run;
    prev = k;
  }
  return { current: cur, longest };
}

function buildDayList(startKey: string, endKey: string): string[] {
  const out: string[] = [];
  let c = startKey;
  let guard = 0;
  while (c <= endKey && guard < 3000) {
    out.push(c);
    c = keyOf(fromKey(c) + 86400000);
    guard++;
  }
  return out;
}

let MODEL_COLORS = new Map<string, string>();
function buildModelColors(models: Record<string, unknown>): void {
  const map = new Map<string, string>();
  sorted(Object.keys(models || {})).forEach((k, i) => map.set(k, PALETTE[i % PALETTE.length] as string));
  MODEL_COLORS = map;
}
const modelColor = (mk: string): string => MODEL_COLORS.get(mk) || '#8a94a6';

/** fixed 定位 tooltip 坐标：跟随鼠标 + 视口边缘四向翻转 */
function tipPos(mx: number, my: number, w: number, h: number): Record<string, string | undefined> {
  const vw = typeof window !== 'undefined' ? window.innerWidth || 1024 : 1024;
  const vh = typeof window !== 'undefined' ? window.innerHeight || 768 : 768;
  const flipX = mx + w + 28 > vw;
  const flipY = my + h + 28 > vh;
  return {
    left: flipX ? undefined : mx + 14 + 'px',
    right: flipX ? vw - mx + 14 + 'px' : undefined,
    top: flipY ? undefined : my + 16 + 'px',
    bottom: flipY ? vh - my + 16 + 'px' : undefined,
  };
}

/** 平滑路径（Catmull-Rom → 三次 Bezier） */
function smoothPath(pts: Array<[number, number]>): string {
  const n = pts.length;
  if (n === 0) return '';
  if (n === 1) return 'M ' + (pts[0] as [number, number])[0] + ' ' + (pts[0] as [number, number])[1];
  if (n === 2) return 'M ' + (pts[0] as [number, number])[0] + ' ' + (pts[0] as [number, number])[1] + ' L ' + (pts[1] as [number, number])[0] + ' ' + (pts[1] as [number, number])[1];
  let d = 'M ' + ((pts[0] as [number, number])[0]).toFixed(1) + ' ' + ((pts[0] as [number, number])[1]).toFixed(1);
  for (let i = 0; i < n - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)] as [number, number];
    const p1 = pts[i] as [number, number];
    const p2 = pts[i + 1] as [number, number];
    const p3 = pts[Math.min(n - 1, i + 2)] as [number, number];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ' C ' + c1x.toFixed(1) + ' ' + c1y.toFixed(1) + ' ' + c2x.toFixed(1) + ' ' + c2y.toFixed(1) + ' ' + p2[0].toFixed(1) + ' ' + p2[1].toFixed(1);
  }
  return d;
}

/* ---------- 今日浮窗全局状态（侧栏/浮窗同一时刻只挂载一个数据实例，弹出后侧栏零占位） ---------- */
const TM_TODAY_LS_OPEN = 'tm-today.float.open';
const TM_TODAY_LS_POS = 'tm-today.float.pos';
const TS_TODAY_LS_OPEN = 'ts-today.float.open';
const TS_TODAY_LS_POS = 'ts-today.float.pos';
function tmTodayLoadOpen(): boolean {
  try {
    if (window.localStorage.getItem(TM_TODAY_LS_OPEN) === '1') return true;
    if (window.localStorage.getItem(TS_TODAY_LS_OPEN) === '1') return true;
  } catch { /* ignore */ }
  return false;
}
function tmTodayLoadPos(): { x: number; y: number } | null {
  try {
    const v = JSON.parse(window.localStorage.getItem(TM_TODAY_LS_POS) || window.localStorage.getItem(TS_TODAY_LS_POS) || 'null') as { x: number; y: number } | null;
    if (v && isFinite(v.x) && isFinite(v.y)) return { x: Number(v.x), y: Number(v.y) };
  } catch { /* ignore */ }
  return null;
}
function tmTodaySave(open: boolean, pos: { x: number; y: number } | null): void {
  try {
    window.localStorage.setItem(TM_TODAY_LS_OPEN, open ? '1' : '0');
    if (pos) window.localStorage.setItem(TM_TODAY_LS_POS, JSON.stringify({ x: Math.round(pos.x), y: Math.round(pos.y) }));
  } catch { /* ignore */ }
}
function tmTodayDefaultPos(): { x: number; y: number } {
  try {
    const vw = window.innerWidth || 1024, vh = window.innerHeight || 768;
    return { x: Math.max(8, vw - 332), y: Math.max(8, Math.min(120, vh - 340)) };
  } catch { return { x: 100, y: 100 }; }
}
function tmTodayClamp(p: { x: number; y: number }): { x: number; y: number } {
  try {
    const vw = window.innerWidth || 1024, vh = window.innerHeight || 768;
    return { x: Math.max(8, Math.min(p.x, vw - 316)), y: Math.max(8, Math.min(p.y, vh - 140)) };
  } catch { return p; }
}
export const tmTodayFloat: { open: boolean; pos: { x: number; y: number } | null } = {
  open: typeof window !== 'undefined' ? tmTodayLoadOpen() : false,
  pos: typeof window !== 'undefined' ? tmTodayLoadPos() : null,
};
const tmTodayListeners = new Set<(v: { open: boolean; pos: { x: number; y: number } | null }) => void>();
const tmTodayEmit = (): void => {
  for (const fn of tmTodayListeners) {
    try { fn({ open: tmTodayFloat.open, pos: tmTodayFloat.pos }); } catch { /* ignore */ }
  }
};
export function tmTodaySet(open: boolean): void {
  tmTodayFloat.open = open;
  if (open) tmTodayFloat.pos = tmTodayClamp(tmTodayFloat.pos || tmTodayLoadPos() || tmTodayDefaultPos());
  tmTodaySave(tmTodayFloat.open, tmTodayFloat.pos);
  tmTodayEmit();
}

export function createStatsSection(React: AnyReact, P: AnyPrimitives, ReactDOM: any): Record<string, any> {
  const { Badge } = createComponents(React, P);
  const h = React.createElement;
  const useState = React.useState as <T>(init: T) => [T, (v: T | ((prev: T) => T)) => void];

  /** 浮窗 .tm-float 带 backdrop-filter + overflow:hidden，会成为 fixed 后代的定位基准并裁剪之；图表悬浮提示必须 portal 到 body */
  function tmPortal(node: any): any {
    if (node === null || node === undefined) return null;
    try {
      if (ReactDOM && typeof ReactDOM.createPortal === 'function' && typeof document !== 'undefined' && document.body) {
        return ReactDOM.createPortal(node, document.body);
      }
    } catch { /* ignore */ }
    return node;
  }

  /** SVG 悬浮捕获层的鼠标 x → 索引 */
  const hoverIndex = (svgRef: any, e: any, W: number, pl: number, pr: number, n: number): number | null => {
    const node = svgRef.current;
    if (node === null || node === undefined) return null;
    const rect = node.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * W;
    let i = n <= 1 ? 0 : Math.round(((relX - pl) / (W - pl - pr)) * (n - 1));
    if (i < 0) i = 0;
    if (i > n - 1) i = n - 1;
    return i;
  };

  function useTmTodayFloat(): { open: boolean; pos: { x: number; y: number } | null } {
    const [, force] = React.useReducer((x: number) => x + 1, 0);
    React.useEffect(() => {
      const fn = (): void => force();
      tmTodayListeners.add(fn);
      return () => { tmTodayListeners.delete(fn); };
    }, []);
    return tmTodayFloat;
  }

  function tmGripDragOut(e: any): void {
    if (e.button !== undefined && e.button !== 0) return;
    if (e.preventDefault) e.preventDefault();
    if (e.stopPropagation) e.stopPropagation();
    const sx = e.clientX, sy = e.clientY;
    let out = false;
    function mv(ev: any): void {
      if (!out && Math.hypot(ev.clientX - sx, ev.clientY - sy) < 8) return;
      out = true;
      tmTodayFloat.open = true;
      tmTodayFloat.pos = tmTodayClamp({ x: ev.clientX - 60, y: ev.clientY - 20 });
      tmTodayEmit();
    }
    function up(): void {
      try { window.removeEventListener('pointermove', mv); } catch { /* ignore */ }
      try { window.removeEventListener('pointerup', up); } catch { /* ignore */ }
      if (out) tmTodaySave(true, tmTodayFloat.pos);
      else tmTodaySet(true);
    }
    try { window.addEventListener('pointermove', mv); } catch { /* ignore */ }
    try { window.addEventListener('pointerup', up); } catch { /* ignore */ }
  }

  function tmFloatDrag(e: any): void {
    if (e.button !== undefined && e.button !== 0) return;
    if (e.target && e.target.closest && e.target.closest('button')) return;
    if (e.preventDefault) e.preventDefault();
    const p0 = tmTodayClamp(tmTodayFloat.pos || tmTodayLoadPos() || tmTodayDefaultPos());
    const ox = e.clientX - p0.x, oy = e.clientY - p0.y;
    function mv(ev: any): void {
      tmTodayFloat.pos = tmTodayClamp({ x: ev.clientX - ox, y: ev.clientY - oy });
      tmTodayEmit();
    }
    function up(): void {
      try { window.removeEventListener('pointermove', mv); } catch { /* ignore */ }
      try { window.removeEventListener('pointerup', up); } catch { /* ignore */ }
      tmTodaySave(tmTodayFloat.open, tmTodayFloat.pos);
    }
    try { window.addEventListener('pointermove', mv); } catch { /* ignore */ }
    try { window.addEventListener('pointerup', up); } catch { /* ignore */ }
  }

  /* ---------- 原子组件 ---------- */
  function AnimatedNumber(props: { value: number; format?: (v: number) => string; className?: string; style?: any; duration?: number }): any {
    const [disp, setDisp] = useState(0);
    const ref = React.useRef(0);
    const played = React.useRef(false);
    React.useEffect(() => {
      const to = Number((props as any).value) || 0;
      if (played.current) {
        if (ref.current !== to) { ref.current = to; setDisp(to); }
        return undefined;
      }
      played.current = true;
      const from = ref.current;
      if (from === to) return undefined;
      const dur = (props as any).duration || 650;
      const t0 = performance.now();
      let raf = 0;
      const step = (t: number): void => {
        const p = Math.min(1, (t - t0) / dur);
        const e2 = 1 - Math.pow(1 - p, 3);
        const v = from + (to - from) * e2;
        ref.current = v;
        setDisp(v);
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
      return () => cancelAnimationFrame(raf);
    }, [(props as any).value]);
    const format = (props as any).format || ((v: number) => Math.round(v).toLocaleString('en-US'));
    return h('div', { className: (props as any).className || '', style: (props as any).style || undefined }, format(disp));
  }

  function Seg(props: { options: Array<{ v: string; t: string }>; current: string; onPick: (v: string) => void }): any {
    return h('div', { className: 'tm-seg' }, (props.options || []).map((o) =>
      h('button', {
        key: o.v, className: 'tm-seg-btn' + (props.current === o.v ? ' tm-seg-on' : ''),
        'aria-pressed': props.current === o.v ? 'true' : 'false',
        onClick: () => props.onPick(o.v),
      }, o.t)));
  }

  function StatCard(props: any): any {
    const valueNode = props.count !== undefined
      ? h(AnimatedNumber, { className: 'tm-stat-value', value: props.count, format: props.fmt || fmt })
      : h('div', { className: 'tm-stat-value' }, props.value);
    return h('div', {
      className: 'tm-stat',
      'data-tint': props.tint ? '1' : '0',
      style: props.delay !== undefined ? { animationDelay: props.delay + 'ms' } : undefined,
      onMouseEnter: props.onHover || undefined,
      onMouseMove: props.onHover || undefined,
      onMouseLeave: props.onLeave || undefined,
    },
      h('div', { className: 'tm-stat-label' }, props.label),
      valueNode,
      props.sub ? h('div', { className: 'tm-stat-sub' }, props.sub) : null,
      ...((props.visual as any[]) || []));
  }

  function breakdown(title: string, parts: Array<[string, number, number, number]>): any {
    return h('div', null,
      h('div', { className: 'tm-pop-title' }, title),
      parts.map((p) => h('div', { key: p[0], className: 'tm-pop-row' },
        h('span', { className: 'tm-pop-k' }, p[0]),
        h('span', { className: 'tm-pop-v' }, fmtFull(p[1]) + ' · ' + (p[3] > 0 ? ((p[1] / p[3]) * 100).toFixed(1) : '0.0') + '%'))));
  }

  function ComposeBar(props: { parts: Array<[string, number, string]> }): any {
    const parts = props.parts || [];
    const total = parts.reduce((s, p) => s + p[1], 0);
    if (total <= 0) return null;
    return h('div', null,
      h('div', { className: 'tm-compose' }, parts.filter((p) => p[1] > 0).map((p) => {
        const w = (p[1] / total) * 100;
        return h('span', { key: p[0], style: { width: w.toFixed(2) + '%', background: p[2] } });
      })),
      h('div', { className: 'tm-compose-legend' },
        parts.map((p) => h('span', { key: p[0] },
          h('i', { style: { background: p[2] } }), p[0]))));
  }

  function Sparkline(props: { values: number[]; color?: string }): any {
    const vals = props.values || [];
    const W = 150, H = 34, PAD = 2;
    if (vals.length < 2) return null;
    const min = Math.min(...vals), max = Math.max(...vals);
    const span = max - min || 1;
    const xs = (i: number): number => PAD + ((W - PAD * 2) * i) / (vals.length - 1);
    const ys = (v: number): number => H - PAD - ((v - min) / span) * (H - PAD * 2);
    const line = smoothPath(vals.map((v, i) => [xs(i), ys(v)] as [number, number]));
    const area = line + ' L ' + xs(vals.length - 1).toFixed(1) + ' ' + (H - PAD) + ' L ' + xs(0).toFixed(1) + ' ' + (H - PAD) + ' Z';
    const c = props.color || BP;
    return h('svg', { className: 'tm-spark', viewBox: '0 0 ' + W + ' ' + H, preserveAspectRatio: 'none' },
      h('path', { d: area, className: 'tm-fadein', style: { fill: c, fillOpacity: 0.13, animationDelay: '.18s' } }),
      h('path', { d: line, className: 'tm-draw', fill: 'none', style: { stroke: c, strokeWidth: 1.5, strokeLinecap: 'round', animationDelay: '.12s' } }),
      h('circle', { cx: xs(vals.length - 1), cy: ys(vals[vals.length - 1] as number), r: 1.8, className: 'tm-fadein', style: { fill: c, animationDelay: '.55s' } }));
  }

  function TrendDelta(props: { recent: number; before: number }): any {
    const recent = props.recent, before = props.before;
    if (before === 0 && recent === 0) return null;
    const delta = before === 0 ? null : ((recent - before) / before) * 100;
    let arrow = 'flat', color = 'var(--dsw-alias-label-tertiary)', text = '持平';
    if (delta === null) { arrow = 'up'; text = '新增'; }
    else if (delta > 2) { arrow = 'up'; color = 'var(--dsw-alias-state-success-primary)'; text = '+' + delta.toFixed(0) + '%'; }
    else if (delta < -2) { arrow = 'down'; color = 'var(--dsw-alias-state-error-primary)'; text = delta.toFixed(0) + '%'; }
    return h('div', { className: 'tm-statgrow tm-fadein', style: { color } },
      h('span', { className: 'tm-arrow tm-arrow-' + arrow }),
      h('span', null, text + '（对比前 7 天）'));
  }

  function StreakBar(props: { current: number; best: number }): any {
    const pct = props.best > 0 ? Math.min(100, (props.current / props.best) * 100) : 0;
    return h('div', { className: 'tm-streakbar' },
      h('span', { className: 'tm-streakfill', style: { width: pct.toFixed(1) + '%', background: 'linear-gradient(90deg, var(--dsw-alias-state-business-primary), color-mix(in srgb, var(--dsw-alias-state-business-primary) 55%, transparent))' } }));
  }

  function DaysRibbon(props: { byDay: Map<string, unknown> }): any {
    const byDay = props.byDay;
    if (byDay === undefined || byDay.size === 0) return null;
    const keys = sorted(Array.from(byDay.keys()));
    const firstT = fromKey(keys[0] as string), lastT = fromKey(keys[keys.length - 1] as string);
    const NB = Math.min(Math.max(1, Math.round((lastT - firstT) / (30.44 * 86400000)) + 1), 24);
    const buckets: Array<{ active: number; total: number }> = [];
    for (let i = 0; i < NB; i++) buckets.push({ active: 0, total: 0 });
    for (let m = firstT; m <= lastT; m += 86400000) {
      const b = Math.min(NB - 1, Math.floor(((m - firstT) / (lastT - firstT || 1)) * NB));
      (buckets[b] as { active: number; total: number }).total++;
      if (byDay.has(keyOf(m))) (buckets[b] as { active: number; total: number }).active++;
    }
    return h('div', { className: 'tm-dayscroll' },
      buckets.map((b, i) => {
        const ratio = b.total > 0 ? b.active / b.total : 0;
        return h('span', { key: i, style: { background: BP, opacity: ratio === 0 ? 0.08 : 0.15 + ratio * 0.8, animationDelay: i * 26 + 'ms' } });
      }));
  }

  function DualBars(props: { a: number; b: number; height?: number; className?: string }): any {
    const { a, b, height } = props;
    const max = Math.max(a, b) || 1;
    const H = height || 14;
    return h('div', { className: props.className || '', style: { display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 3, height: H + 2, marginTop: 3 } },
      h('span', { className: 'tm-rise', style: { width: 9, borderRadius: '2px 2px 0 0', background: BP, display: 'block', height: Math.max(2, (a / max) * H).toFixed(1) + 'px', animationDelay: '60ms' } }),
      h('span', { className: 'tm-rise', style: { width: 9, borderRadius: '2px 2px 0 0', background: BP, opacity: 0.28, display: 'block', height: Math.max(2, (b / max) * H).toFixed(1) + 'px', animationDelay: '150ms' } }));
  }

  /* ---------- 图表 ---------- */
  interface TrendSeries { name: string; shortName: string; color: string; isTotal?: boolean; values: number[]; visible: boolean }

  interface SlotComp { i: number; o: number; cr: number; cw: number }
  function TrendChart(props: {
    series: TrendSeries[]; labels: string[]; titles?: string[]; emptyText?: string;
    /** 每槽位构成（输入/输出/缓存读/写），用于悬浮明细；缺省时只显示模型合计 */
    comp?: Array<SlotComp> | null;
    /** 置于浮窗内时提示上浮到浮窗之上（tm-tip-above），不被浮窗遮挡 */
    above?: boolean;
  }): any {
    const seriesList = props.series;
    const labels = props.labels;
    const titles = props.titles || labels;
    const emptyText = props.emptyText || '当日无消耗';
    const W = 780, H = 250, pl = 54, pr = 14, pt = 6, pb = 28;
    const n = labels.length;
    const vis = seriesList.filter((s) => s.visible);
    const top = niceMax(vis.length > 0 ? Math.max(1, ...vis.flatMap((s) => s.values)) : 1);
    const xs = (i: number): number => (n <= 1 ? pl + (W - pl - pr) / 2 : pl + ((W - pl - pr) * i) / (n - 1));
    const ys = (v: number): number => H - pb - (v / top) * (H - pb - pt);
    const [hover, setHover] = useState<{ i: number; mx: number; my: number } | null>(null);
    const svgRef = React.useRef(null);
    const onMove = (e: any): void => {
      const i = hoverIndex(svgRef, e, W, pl, pr, n);
      if (i !== null) setHover({ i, mx: e.clientX, my: e.clientY });
    };
    const kids: any[] = [];
    for (const fr of [0, 0.25, 0.5, 0.75, 1]) {
      const yy = ys(top * fr);
      kids.push(h('line', { key: 'g' + fr, x1: pl, x2: W - pr, y1: yy, y2: yy, className: 'tm-gridln' }));
      kids.push(h('text', { key: 'gt' + fr, x: pl - 8, y: yy + 4, textAnchor: 'end', className: 'tm-axislbl' }, fmt(top * fr)));
    }
    const tickCount = Math.min(n, 9);
    const xt: number[] = [];
    for (let j = 0; j < tickCount; j++) {
      const idx = tickCount <= 1 ? 0 : Math.round((j * (n - 1)) / (tickCount - 1));
      if (xt.length === 0 || xt[xt.length - 1] !== idx) xt.push(idx);
    }
    for (const i of xt) {
      kids.push(h('text', { key: 'x' + i, x: xs(i), y: H - 9, textAnchor: i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle', className: 'tm-axislbl' }, labels[i]));
    }
    if (hover !== null) {
      kids.push(h('line', { key: 'ch', x1: xs(hover.i), x2: xs(hover.i), y1: pt, y2: H - pb, style: { stroke: BP, strokeWidth: 1, strokeDasharray: '3 3', opacity: 0.7 } }));
      for (const s of vis) {
        if (s.values[hover.i] === undefined) continue;
        kids.push(h('circle', { key: 'd' + s.name, cx: xs(hover.i), cy: ys(s.values[hover.i] as number), r: 3.5, style: { fill: s.color, stroke: 'var(--dsw-alias-bg-layer-1)', strokeWidth: 1.5 } }));
      }
    }
    let li = 0;
    for (const s of seriesList) {
      if (!s.visible) continue;
      kids.push(h('path', {
        key: 'ln' + s.name, className: 'tm-draw',
        d: smoothPath(s.values.map((v, i) => [xs(i), ys(v)] as [number, number])),
        fill: 'none',
        style: { stroke: s.color, strokeWidth: s.isTotal ? 2.6 : 1.9, strokeLinecap: 'round', strokeLinejoin: 'round', opacity: s.isTotal ? 1 : 0.92, animationDelay: 0.15 + li * 0.09 + 's' },
      }));
      li++;
    }
    kids.push(h('rect', { key: 'cap', x: 0, y: 0, width: W, height: H, fill: 'transparent', style: { cursor: 'crosshair' }, onMouseMove: onMove, onMouseLeave: () => setHover(null) }));
    const tip = hover !== null
      ? (() => {
          const active = vis.filter((s) => ((s.values[hover.i] as number) || 0) > 0);
          const rows = sorted(active, (a, b) => ((b.values[hover.i] as number) || 0) - ((a.values[hover.i] as number) || 0));
          const comp = props.comp ? (props.comp[hover.i] as SlotComp | undefined) : undefined;
          const compTotal = comp ? comp.i + comp.o + comp.cr + comp.cw : 0;
          const pos = tipPos(hover.mx, hover.my, 270, (comp ? 98 : 44) + rows.length * 18);
          return tmPortal(h('div', { className: 'tm-tipfixed' + (props.above ? ' tm-tip-above' : ''), style: pos },
            h('div', { className: 'tm-tiprow', style: { fontWeight: 600, marginBottom: 2 } }, titles[hover.i]),
            comp
              ? h('div', { className: 'tm-tiprow' },
                  h('span', { className: 'tm-tip-k' }, '总 Token'),
                  h('span', { className: 'tm-tip-v' }, fmt(compTotal)))
              : null,
            comp
              ? h('div', { className: 'tm-tiprow' },
                  h('span', { className: 'tm-tip-k' }, '输入 / 输出'),
                  h('span', { className: 'tm-tip-v' }, fmt(comp.i) + ' / ' + fmt(comp.o)))
              : null,
            comp
              ? h('div', { className: 'tm-tiprow', style: { marginBottom: rows.length > 0 ? 4 : 0 } },
                  h('span', { className: 'tm-tip-k' }, '缓存读 / 写'),
                  h('span', { className: 'tm-tip-v' }, fmt(comp.cr) + ' / ' + fmt(comp.cw)))
              : null,
            rows.length > 0
              ? rows.map((s) => h('div', { key: s.name, className: 'tm-tiprow' },
                  h('span', { className: 'tm-dot', style: { background: s.color, width: 8, height: 8 } }),
                  h('span', { className: 'tm-tip-k', style: { flex: '1 1 auto', overflow: 'hidden', textOverflow: 'ellipsis' } }, s.shortName),
                  h('span', { className: 'tm-tip-v' }, fmt((s.values[hover.i] as number) || 0))))
              : (comp ? null : h('div', { className: 'tm-tiprow', style: { color: 'var(--dsw-alias-label-tertiary)' } }, emptyText))));
        })()
      : null;
    return h('div', { className: 'tm-svgwrap' },
      h('svg', { viewBox: '0 0 ' + W + ' ' + H, style: { width: '100%', height: 'auto', display: 'block' }, ref: svgRef }, kids),
      tip);
  }

  function Heatmap(props: { byDay: Map<string, DayAgg>; daySessions?: Record<string, number>; models?: Record<string, { model: string }>; months?: number; above?: boolean }): any {
    const byDay = props.byDay;
    const daySessions = props.daySessions || {};
    const months = props.months || 6;
    const today = keyOf(Date.now());
    const todayT = fromKey(today);
    let startW = todayT - Math.max(1, months) * 31 * 86400000;
    const dow0 = new Date(startW).getDay();
    startW = startW - (((dow0 + 6) % 7) * 86400000);
    const weeks = Math.max(1, Math.ceil((todayT - startW) / 604800000));
    const cols: Array<Array<{ k: string; v: number; day: DayAgg | undefined; sess: number } | null>> = [];
    let max = 1;
    for (let w = 0; w < weeks; w++) {
      const col: Array<{ k: string; v: number; day: DayAgg | undefined; sess: number } | null> = [];
      for (let r = 0; r < 7; r++) {
        const k = keyOf(startW + w * 604800000 + r * 86400000);
        if (k > today) { col.push(null); continue; }
        const day = byDay.get(k);
        const v = day === undefined ? 0 : day.t;
        col.push({ k, v, day, sess: (daySessions[k] as number) || 0 });
        if (v > max) max = v;
      }
      cols.push(col);
    }
    const OPS = [0.16, 0.3, 0.5, 0.72, 0.95];
    const levelOf = (v: number): number => (v <= 0 ? 0 : v <= max * 0.25 ? 1 : v <= max * 0.5 ? 2 : v <= max * 0.75 ? 3 : 4);
    const cellGap = months >= 12 ? 2.5 : months >= 6 ? 3 : 4;
    const rowGap = months >= 12 ? 0 : cellGap;
    const [hover, setHover] = useState<{ k: string; day: DayAgg; sess: number; mx: number; my: number } | null>(null);
    const onCell = (cell: { k: string; v: number; day: DayAgg | undefined; sess: number } | null, e: any): void => {
      if (cell === null || cell.day === undefined) { setHover(null); return; }
      setHover({ k: cell.k, day: cell.day, sess: cell.sess, mx: e.clientX, my: e.clientY });
    };
    const WL = ['一', '二', '三', '四', '五', '六', '日'];
    const rows: any[] = [];
    for (let r = 0; r < 7; r++) {
      const cells: any[] = [];
      for (let w = 0; w < weeks; w++) {
        const cell = (cols[w] as Array<{ k: string; v: number; day: DayAgg | undefined; sess: number } | null>)[r] as { k: string; v: number; day: DayAgg | undefined; sess: number } | null;
        cells.push(h('div', {
          key: w,
          className: 'tm-hcell',
          'data-lv': cell === null || (cell as { v: number }).v <= 0 ? '0' : String(levelOf((cell as { v: number }).v)),
          style: cell === null ? { visibility: 'hidden' }
            : (cell as { v: number }).v > 0 ? { background: BP, opacity: OPS[levelOf((cell as { v: number }).v)], animationDelay: ((w * 45) % 480) + 'ms' } : undefined,
          onMouseEnter: cell ? (e: any) => onCell(cell, e) : undefined,
          onMouseMove: cell ? (e: any) => onCell(cell, e) : undefined,
          onMouseLeave: () => setHover(null),
        }));
      }
      rows.push(h('div', { key: r, style: { display: 'flex', gap: 4, alignItems: 'center' } },
        h('span', { style: { width: 14, fontSize: 9, color: 'var(--dsw-alias-label-caption)', flex: 'none', textAlign: 'center', lineHeight: '14px' } }, r % 2 === 0 ? WL[r] : ''),
        h('div', { className: 'tm-heatrow', style: { gap: cellGap + 'px' } }, cells)));
    }
    const monthLabels: Array<{ w: number; mo: number }> = [];
    let prevM: number | null = null;
    for (let w = 0; w < weeks; w++) {
      const mo = Number(keyOf(startW + w * 604800000).slice(5, 7));
      if (mo !== prevM) { monthLabels.push({ w, mo }); prevM = mo; }
    }
    const monthRow = h('div', { style: { display: 'flex', gap: 4, marginBottom: 3 } },
      h('span', { style: { width: 14, flex: 'none' } }),
      h('div', { style: { display: 'flex', gap: cellGap + 'px', flex: '1 1 auto', minHeight: 12 } },
        monthLabels.map((m, i) => h('span', { key: i, style: { fontSize: 9.5, color: 'var(--dsw-alias-label-caption)', width: (100 / weeks).toFixed(3) + '%', flex: 'none', overflow: 'hidden', whiteSpace: 'nowrap' } }, m.mo + '月'))));
    let pop: any = null;
    if (hover !== null) {
      const d = hover.day;
      const entries = sorted(Object.entries(d.byModel || {}), (a, b) => (b[1] as number) - (a[1] as number));
      const tot = d.t;
      const cache = (d.cr || 0) + (d.cw || 0);
      const cachePct = tot > 0 ? (cache / tot) * 100 : 0;
      // 高度估算：标题 + 总消耗/会话 + 输入/输出 + 缓存读/写两行 + 模型行
      const pos = tipPos(hover.mx, hover.my, 300, 134 + Math.min(entries.length, 8) * 18);
      pop = tmPortal(h('div', { className: 'tm-pop' + (props.above ? ' tm-tip-above' : ''), style: pos },
        h('div', { className: 'tm-pop-title' }, cnDate(hover.k)),
        h('div', { className: 'tm-pop-row', style: { marginBottom: 2 } },
          h('span', { className: 'tm-pop-k' }, '总消耗'),
          h('span', { className: 'tm-pop-v' }, fmt(tot)),
          h('span', { className: 'tm-pop-k', style: { paddingLeft: 12 } }, '会话'),
          h('span', { className: 'tm-pop-v' }, String(hover.sess))),
        h('div', { className: 'tm-pop-row' },
          h('span', { className: 'tm-pop-k' }, '输入 / 输出'),
          h('span', { className: 'tm-pop-v' }, fmt(d.i || 0) + ' / ' + fmt(d.o || 0))),
        // 缓存：读/写各自占比条（与模型占比条同样式），数值 + 占当日总量比例
        h('div', { className: 'tm-pop-row' },
          h('span', { className: 'tm-pop-k' }, '缓存读'),
          h('span', { className: 'tm-pop-bar' }, h('span', { className: 'tm-pop-fill', style: { width: (tot > 0 ? ((d.cr || 0) / tot) * 100 : 0).toFixed(1) + '%', background: '#f5a623' } })),
          h('span', { className: 'tm-pop-v' }, fmt(d.cr || 0) + ' · ' + (tot > 0 ? (((d.cr || 0) / tot) * 100).toFixed(0) : 0) + '%')),
        h('div', { className: 'tm-pop-row', style: { marginBottom: entries.length > 0 ? 4 : 0 } },
          h('span', { className: 'tm-pop-k' }, '缓存写'),
          h('span', { className: 'tm-pop-bar' }, h('span', { className: 'tm-pop-fill', style: { width: (tot > 0 ? ((d.cw || 0) / tot) * 100 : 0).toFixed(1) + '%', background: '#9a6ef1' } })),
          h('span', { className: 'tm-pop-v' }, fmt(d.cw || 0) + ' · 占比 ' + cachePct.toFixed(1) + '%')),
        tot > 0
          ? entries.slice(0, 8).map(([mk, v]) => {
              const info = ((props.models || {}) as Record<string, { model: string }>)[mk];
              const color = modelColor(mk);
              return h('div', { key: mk, className: 'tm-pop-row' },
                h('span', { className: 'tm-dot', style: { background: color } }),
                h('span', { style: { maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, info ? info.model : mk),
                h('span', { className: 'tm-pop-bar' }, h('span', { className: 'tm-pop-fill', style: { width: (tot > 0 ? ((v as number) / tot) * 100 : 0).toFixed(1) + '%', background: color } })),
                h('span', { className: 'tm-pop-v' }, fmt(v as number) + ' · ' + (tot > 0 ? (((v as number) / tot) * 100).toFixed(0) : 0) + '%'));
            })
          : h('div', { className: 'tm-pop-k' }, '当日无用量'),
        entries.length > 8 ? h('div', { className: 'tm-pop-k', style: { marginTop: 4 } }, '…另有 ' + (entries.length - 8) + ' 个模型') : null));
    }
    return h('div', { className: 'tm-heatwrap' }, monthRow,
      h('div', { style: { display: 'flex', flexDirection: 'column', gap: rowGap + 'px' } }, rows),
      pop);
  }

  function Donut(props: { entries: Array<{ name: string; t: number; color: string }>; total: number }): any {
    const entries = props.entries;
    const total = props.total;
    const size = 168, cx = 84, cy = 84, r = 57, C = 2 * Math.PI * r;
    const kids: any[] = [h('circle', { key: 'bg', cx, cy, r, fill: 'none', style: { stroke: 'var(--dsw-alias-interactive-bg-hover)', strokeWidth: 18 } })];
    let acc = 0;
    for (let i = 0; i < entries.length; i++) {
      const it = entries[i] as { t: number; color: string };
      const len = total > 0 ? (it.t / total) * C : 0;
      kids.push(h('circle', {
        key: 's' + i, cx, cy, r, fill: 'none', className: 'tm-donutseg',
        strokeDasharray: len.toFixed(2) + ' ' + (C - len).toFixed(2),
        strokeDashoffset: (-acc).toFixed(2),
        style: { stroke: it.color, strokeWidth: 18, animationDelay: i * 70 + 'ms' },
        transform: 'rotate(-90 ' + cx + ' ' + cy + ')',
      }));
      acc += len;
    }
    return h('div', { className: 'tm-donutBox', style: { position: 'relative', width: size, height: size } },
      h('svg', { viewBox: '0 0 ' + size + ' ' + size, style: { width: '100%', height: '100%', display: 'block' } }, kids),
      h(AnimatedNumber, { className: 'tm-donut-c', value: total, format: fmt }),
      h('div', { className: 'tm-donut-cap' }, '累计 Token'));
  }

  function TodayChart(props: { series: TrendSeries[]; n: number; labels?: string[]; floatTip?: boolean }): any {
    const seriesList = props.series;
    const n = props.n;
    const tickLabels = props.labels || null;
    const W = 160, H = 44, PAD = 3;
    const [hover, setHover] = useState<{ i: number; mx: number; my: number } | null>(null);
    const svgRef = React.useRef(null);
    if (n < 2 || seriesList.length === 0) return null;
    const maxV = Math.max(1, ...seriesList.flatMap((s) => s.values));
    const xs = (i: number): number => PAD + ((W - PAD * 2) * i) / (n - 1);
    const ys = (v: number): number => H - PAD - (v / maxV) * (H - PAD * 2);
    const onMove = (e: any): void => {
      const i = hoverIndex(svgRef, e, W, PAD, PAD, n);
      if (i !== null) setHover({ i, mx: e.clientX, my: e.clientY });
    };
    const kids: any[] = [];
    if (hover !== null) {
      kids.push(h('line', { key: 'ch', x1: xs(hover.i), x2: xs(hover.i), y1: PAD, y2: H - PAD, style: { stroke: BP, strokeWidth: 1, strokeDasharray: '2 2', opacity: 0.7 } }));
    }
    for (let si = 0; si < seriesList.length; si++) {
      const s = seriesList[si] as TrendSeries;
      kids.push(h('path', {
        key: 'l' + s.name, className: 'tm-draw',
        d: smoothPath(s.values.map((v, i) => [xs(i), ys(v)] as [number, number])),
        fill: 'none',
        style: { stroke: s.color, strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round', opacity: 0.9, animationDelay: 0.1 + si * 0.12 + 's' },
      }));
      kids.push(h('circle', { key: 'e' + s.name, cx: xs(n - 1), cy: ys(s.values[n - 1] as number || 0), r: 1.8, className: 'tm-fadein', style: { fill: s.color, animationDelay: 0.55 + si * 0.12 + 's' } }));
      if (hover !== null) {
        kids.push(h('circle', { key: 'h' + s.name, cx: xs(hover.i), cy: ys((s.values[hover.i] as number) || 0), r: 2.2, style: { fill: s.color, stroke: 'var(--dsw-alias-bg-layer-1)', strokeWidth: 1 } }));
      }
    }
    kids.push(h('rect', { key: 'cap', x: 0, y: 0, width: W, height: H, fill: 'transparent', style: { cursor: 'crosshair' }, onMouseMove: onMove, onMouseLeave: () => setHover(null) }));
    const tip = hover !== null
      ? (() => {
          const active = seriesList.filter((s) => (((s.values[hover.i] as number) || 0) > 0));
          const pos = tipPos(hover.mx, hover.my, 170, 34 + active.length * 16);
          return tmPortal(h('div', { className: 'tm-tipfixed' + (props.floatTip === true ? ' tm-tipfloat' : ''), style: { ...pos, fontSize: 10.5 } },
            h('div', { style: { fontWeight: 600 } }, tickLabels !== null ? (tickLabels[hover.i] as string) : hover.i + ':00'),
            active.length > 0
              ? sorted(active, (a, b) => (((b.values[hover.i] as number) || 0) - ((a.values[hover.i] as number) || 0))).map((s) =>
                  h('div', { key: s.name, className: 'tm-tiprow' },
                    h('span', { className: 'tm-dot', style: { background: s.color, width: 6, height: 6 } }),
                    h('span', { className: 'tm-tip-k', style: { overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 80 } }, s.shortName),
                    h('span', { className: 'tm-tip-v' }, fmt((s.values[hover.i] as number) || 0))))
              : h('div', { style: { color: 'var(--dsw-alias-label-tertiary)' } }, '该小时无消耗')));
        })()
      : null;
    return h('div', { className: 'tm-svgwrap' },
      h('svg', { className: 'tm-spark', viewBox: '0 0 ' + W + ' ' + H, preserveAspectRatio: 'none', ref: svgRef }, kids),
      tip);
  }

  function RangeSelect(props: { options: Array<{ v: string; t: string }>; value: string; onPick: (v: string) => void }): any {
    const [open, setOpen] = useState(false);
    const hit = (props.options || []).filter((o) => o.v === props.value)[0];
    const selector = h('button', {
      type: 'button', className: 'tm-selector',
      'aria-haspopup': 'menu', 'aria-expanded': open,
      onClick: () => setOpen((v: boolean) => !v),
    },
      h('span', { className: 'tm-selectorLabel' }, hit ? hit.t : props.value),
      P.IconChevronDownOutline14 ? h(P.IconChevronDownOutline14, { className: 'tm-chevron' }) : h('span', { className: 'tm-chevron' }, '▾'));
    return h(P.Menu, {
      open, onClose: () => setOpen(false),
      items: (props.options || []).map((o) => ({ id: o.v, label: o.t })),
      selectedId: props.value,
      onSelect: (id: string) => { setOpen(false); props.onPick(id); },
      align: 'end', portal: true, anchor: selector,
    });
  }

  /* ---------- 跨组件共享统计快照（右栏面板与 widget 浮窗共用一次拉取，60s 可见即刷） ---------- */
  const shared: {
    data: StatsSnapshot | null; err: string; at: number;
    inflight: Promise<StatsSnapshot | null> | null; subs: Set<() => void>;
  } = { data: null, err: '', at: 0, inflight: null, subs: new Set() };
  function notifyShared(): void {
    for (const fn of shared.subs) {
      try { fn(); } catch { /* ignore */ }
    }
  }
  function writeShared(data: StatsSnapshot): void {
    shared.data = data;
    shared.err = '';
    shared.at = Date.now();
    notifyShared();
  }
  function ensureSharedStats(force?: boolean): Promise<StatsSnapshot | null> {
    if (!force && shared.data && Date.now() - shared.at < 45000) return Promise.resolve(shared.data);
    if (shared.inflight) return shared.inflight;
    const p = fetchStats().then((v) => {
      shared.inflight = null;
      if (v && (v as StatsSnapshot).ready === true) writeShared(v as StatsSnapshot);
      else { shared.err = String((v as any)?.error || '统计服务不可用'); notifyShared(); }
      return shared.data;
    }).catch(() => {
      shared.inflight = null;
      shared.err = '连接失败';
      notifyShared();
      return shared.data;
    });
    shared.inflight = p;
    return p;
  }
  function useSharedStats(): { data: StatsSnapshot | null; err: string; loading: boolean } {
    const [, force] = (React.useReducer as any)((x: number) => x + 1, 0);
    React.useEffect(() => {
      const fn = (): void => force();
      shared.subs.add(fn);
      if (!shared.data && !shared.inflight) void ensureSharedStats();
      const id = window.setInterval(() => { if (document.visibilityState === 'visible') void ensureSharedStats(); }, 60000);
      return () => { shared.subs.delete(fn); window.clearInterval(id); };
    }, []);
    return { data: shared.data, err: shared.err, loading: !shared.data && !!shared.inflight };
  }

  /** 小组件开关按钮：widgets 系统存在且传入 widgetId 时渲染。
   * 侧栏中显示 ⧉弹出，浮出后同一位置显示 回归（WidgetToggle 按 open 状态切换）。 */
  function widgetBtns(widgets: any, widgetId: string | undefined): any {
    if (!widgets || !widgetId || !widgets.WidgetToggle) return null;
    return h(widgets.WidgetToggle, { id: widgetId });
  }

  /** 该小组件是否已浮出：已浮出时原位（inPlace）不渲染，避免同一内容出现两份。
   * 浮窗实例不传 inPlace，因此照常渲染并自带「回归」。 */
  function useWidgetOpen(widgets: any, widgetId: string | undefined): boolean {
    const list = widgets && typeof widgets.useWidgets === 'function' ? (widgets.useWidgets() as Array<{ id: string }>) : [];
    return !!(widgetId && list.some((w) => w.id === widgetId));
  }

  /** 已浮出时原位不渲染的包装器（内容自带各自的开关按钮） */
  function HiddenWhenFloated(props: { widgets?: any; id: string; children?: any }): any {
    const open = useWidgetOpen(props.widgets, props.id);
    if (open) return null;
    return props.children === undefined ? null : props.children;
  }

  /* ---------- 独立 section 组件（右栏面板与 widget 浮窗共用） ---------- */

  /** 指标卡组（全量 + 可视化 + 悬浮构成） */
  function StatCardsSection(props: { aggAll: Agg; data: StatsSnapshot; widgets?: any; widgetId?: string; inFloat?: boolean; inPlace?: boolean }): any {
    const aggAll = props.aggAll;
    const data = props.data;
    const [pop, setPop] = useState<{ mx: number; my: number; content: any } | null>(null);
    const open = useWidgetOpen(props.widgets, props.widgetId);
    if (props.inPlace && open) return null;
    const leave = (): void => setPop(null);
    const todayK = keyOf(Date.now());
    const st = streaks(aggAll.byDay);
    let peakDay: DayAgg | null = null;
    for (const day of aggAll.byDay.values()) { if (peakDay === null || day.t > peakDay.t) peakDay = day; }
    const dayVals = Array.from(aggAll.byDay.values()).map((d) => d.t);
    const avgDay = dayVals.length > 0 ? aggAll.total / dayVals.length : 0;
    const medDay = median(dayVals);
    const allDays = buildDayList(aggAll.first as string, todayK);
    const dayVal = (k: string): number => { const d = aggAll.byDay.get(k); return d === undefined ? 0 : d.t; };
    const sparkVals = allDays.slice(-30).map(dayVal);
    const last7 = allDays.slice(-7).reduce((s, k) => s + dayVal(k), 0);
    const prev7 = allDays.slice(-14, -7).reduce((s, k) => s + dayVal(k), 0);
    const CI = '#4c7ef3', CO = '#2fb261', CC = '#f5a623';
    const cards: any[] = [];
    cards.push(h(StatCard, {
      label: '累计 Token', count: aggAll.total, tint: true, sub: '输入 ' + fmt(aggAll.i) + ' · 输出 ' + fmt(aggAll.o), delay: cards.length * 45,
      onHover: (e: any) => setPop({ mx: e.clientX, my: e.clientY, content: breakdown('累计构成', [['输入', aggAll.i, 1, aggAll.total], ['输出', aggAll.o, 1, aggAll.total], ['缓存读', aggAll.cr, 1, aggAll.total], ['缓存写', aggAll.cw, 1, aggAll.total]]) }),
      onLeave: leave,
      visual: [h(ComposeBar, { parts: [['输入', aggAll.i, CI], ['输出', aggAll.o, CO], ['缓存读', aggAll.cr, CC], ['缓存写', aggAll.cw, '#9a6ef1']] })],
    }));
    cards.push(h(StatCard, {
      label: '近 30 天走势', count: sparkVals.reduce((s, v) => s + v, 0), sub: '每日用量迷你图', delay: cards.length * 45,
      visual: [h(Sparkline, { values: sparkVals }), h(TrendDelta, { recent: last7, before: prev7 })],
    }));
    cards.push(h(StatCard, {
      label: '缓存 Token', count: aggAll.cr + aggAll.cw, sub: '命中 ' + fmt(aggAll.cr) + ' · 写入 ' + fmt(aggAll.cw), delay: cards.length * 45,
      onHover: (e: any) => setPop({ mx: e.clientX, my: e.clientY, content: breakdown('缓存构成 · 命中率 ' + (aggAll.total > 0 ? ((aggAll.cr / aggAll.total) * 100).toFixed(1) : '0.0') + '%', [['缓存读（命中）', aggAll.cr, 1, aggAll.total], ['缓存写', aggAll.cw, 1, aggAll.total]]) }),
      onLeave: leave,
      visual: [h(ComposeBar, { parts: [['缓存读', aggAll.cr, CC], ['缓存写', aggAll.cw, '#9a6ef1']] })],
    }));
    cards.push(data.peakStep ? h(StatCard, {
      label: '峰值单次请求', count: (data.peakStep as { tokens: number }).tokens,
      sub: (data.peakStep as { model: string; d: string }).model + ' · ' + dispDay((data.peakStep as { d: string }).d),
      delay: cards.length * 45,
    }) : null);
    cards.push(peakDay ? h(StatCard, {
      label: '峰值单日', count: (peakDay as DayAgg).t, sub: dispDay((peakDay as DayAgg).d), delay: cards.length * 45,
      onHover: (e: any) => setPop({ mx: e.clientX, my: e.clientY, content: breakdown((peakDay as DayAgg).d + ' 各模型', sorted(Object.entries((peakDay as DayAgg).byModel || {}), (a, b) => ((b[1] as number) - (a[1] as number))).slice(0, 6).map(([mk, v]) => [mk, v as number, 1, (peakDay as DayAgg).t] as [string, number, number, number])) }),
      onLeave: leave,
      visual: [h(ComposeBar, { parts: sorted(Object.entries((peakDay as DayAgg).byModel || {}), (a, b) => ((b[1] as number) - (a[1] as number))).slice(0, 4).map(([mk, v]) => { const info = (data.models as Record<string, { model: string }>)[mk]; return [info ? info.model : mk, v as number, modelColor(mk)] as [string, number, string]; }) })],
    }) : null);
    cards.push(h(StatCard, {
      label: '日均消耗', count: avgDay, sub: '按活跃日平均', delay: cards.length * 45,
      visual: [h(Sparkline, { values: sparkVals, color: CO })],
    }));
    cards.push(h(StatCard, { label: '日消耗中位数', count: medDay, sub: '按活跃日取中位', delay: cards.length * 45 }));
    cards.push(h(StatCard, {
      label: '当前连续使用', count: st.current, fmt: (v: number) => fmt(v) + ' 天', sub: '按自然日统计', delay: cards.length * 45,
      visual: [h(StreakBar, { current: st.current, best: st.longest })],
    }));
    cards.push(h(StatCard, {
      label: '最长连续使用', count: st.longest, fmt: (v: number) => fmt(v) + ' 天', sub: '历史最佳纪录', delay: cards.length * 45,
      visual: [h(StreakBar, { current: st.current, best: st.longest })],
    }));
    cards.push(h(StatCard, {
      label: '活跃天数', count: aggAll.byDay.size, fmt: (v: number) => fmt(v) + ' 天', sub: '共 ' + data.sessions + ' 个会话', delay: cards.length * 45,
      visual: [h(DaysRibbon, { byDay: aggAll.byDay })],
    }));
    cards.push(h(StatCard, { label: '模型调用次数', count: aggAll.n, sub: data.active + ' 个会话有用量', delay: cards.length * 45 }));
    cards.push(h(StatCard, { label: '首次使用', value: dispDay(aggAll.first as string), sub: aggAll.first }));
    cards.push(h(StatCard, { label: '最近使用', value: dispDay(aggAll.last as string), sub: aggAll.last }));
    const toolbar = props.widgets && props.widgetId
      ? h('div', { style: { display: 'flex', justifyContent: 'flex-end', marginBottom: 6 } }, widgetBtns(props.widgets, props.widgetId))
      : null;
    // 外层卡片容器：浮窗/右侧栏内指标卡组都是"一张不透明卡片"（内部各指标卡自带层次）
    return h('div', { className: 'tm-card' },
      toolbar,
      h('div', { className: 'tm-grid' }, cards),
      pop !== null
        ? tmPortal(h('div', { className: 'tm-pop' + (props.inFloat ? ' tm-tip-above' : ''), style: tipPos(pop.mx, pop.my, 280, 60) }, pop.content))
        : null);
  }

  /** 趋势图卡（24h 按小时 / 7d·30d 按天 + 模型筛选，自带档位状态；悬浮带构成明细） */
  function TrendSection(props: { data: StatsSnapshot; aggAll: Agg; widgets?: any; widgetId?: string; inFloat?: boolean; inPlace?: boolean }): any {
    const data = props.data;
    const aggAll = props.aggAll;
    const [trendRange, setTrendRange] = useState('30d');
    const [modelOff, setModelOff] = useState<Record<string, boolean>>({});
    const [showTotal, setShowTotal] = useState(false);
    const open = useWidgetOpen(props.widgets, props.widgetId);
    if (props.inPlace && open) return null;
    const todayK = keyOf(Date.now());
    const newComp = (): SlotComp => ({ i: 0, o: 0, cr: 0, cw: 0 });
    let trendLabels: string[], trendTitles: string[], trendEmpty: string;
    let slotComp: SlotComp[];
    const trendSeries: TrendSeries[] = [];
    if (trendRange === '24h') {
      const endH = new Date();
      endH.setMinutes(0, 0, 0);
      const slots: Array<{ d: string; h: number }> = [];
      for (let k = 23; k >= 0; k--) {
        const t = endH.getTime() - k * 3600000;
        slots.push({ d: keyOf(t), h: new Date(t).getHours() });
      }
      trendLabels = slots.map((s) => (s.d === todayK ? s.h + ':00' : '昨日' + s.h + ':00'));
      trendTitles = slots.map((s) => cnDate(s.d) + ' ' + s.h + ':00–' + (s.h + 1) + ':00');
      trendEmpty = '该小时无消耗';
      const slotIdx = new Map<string, number>();
      for (let i = 0; i < slots.length; i++) slotIdx.set((slots[i] as { d: string; h: number }).d + '|' + (slots[i] as { d: string; h: number }).h, i);
      slotComp = Array.from({ length: 24 }, newComp);
      const hourVals = new Map<string, number[]>();
      for (const r of data.records || []) {
        const idx = slotIdx.get(r.d + '|' + r.h);
        if (idx === undefined) continue;
        let arr = hourVals.get(r.m);
        if (arr === undefined) { arr = Array.from({ length: 24 }, () => 0); hourVals.set(r.m, arr); }
        (arr[idx] as number) += tok(r);
        const c = slotComp[idx] as SlotComp;
        c.i += r.i || 0; c.o += r.o || 0; c.cr += r.cr || 0; c.cw += r.cw || 0;
      }
      const hourTotal = Array.from({ length: 24 }, () => 0);
      for (const arr of hourVals.values()) { for (let i = 0; i < 24; i++) (hourTotal[i] as number) += (arr[i] as number); }
      for (const mk of sorted(Array.from(hourVals.keys()))) {
        trendSeries.push({
          name: mk, shortName: ((data.models as Record<string, { model: string }>)[mk] || {}).model || mk,
          color: modelColor(mk), isTotal: false, values: hourVals.get(mk) as number[], visible: !modelOff[mk],
        });
      }
      trendSeries.push({ name: '__total__', shortName: '总 Token', color: '#8a94a6', isTotal: true, values: hourTotal, visible: showTotal });
    } else {
      const N = trendRange === '7d' ? 7 : 30;
      const dayList = buildDayList(keyOf(fromKey(todayK) - (N - 1) * 86400000), todayK);
      trendLabels = dayList.map(dispDay);
      trendTitles = dayList.map(cnDate);
      trendEmpty = '当日无消耗';
      const dayIdx = new Map<string, number>();
      for (let i = 0; i < dayList.length; i++) dayIdx.set(dayList[i] as string, i);
      slotComp = dayList.map(newComp);
      for (const r of data.records || []) {
        const idx = dayIdx.get(r.d);
        if (idx === undefined) continue;
        const c = slotComp[idx] as SlotComp;
        c.i += r.i || 0; c.o += r.o || 0; c.cr += r.cr || 0; c.cw += r.cw || 0;
      }
      for (const mk of sorted(Array.from(aggAll.byModel.keys()))) {
        trendSeries.push({
          name: mk, shortName: ((data.models as Record<string, { model: string }>)[mk] || {}).model || mk,
          color: modelColor(mk), isTotal: false,
          values: dayList.map((k) => { const d = aggAll.byDay.get(k); return d !== undefined && (d.byModel[mk] as number) !== undefined ? (d.byModel[mk] as number) : 0; }),
          visible: !modelOff[mk],
        });
      }
      trendSeries.push({
        name: '__total__', shortName: '总 Token', color: '#8a94a6', isTotal: true,
        values: dayList.map((k) => { const d = aggAll.byDay.get(k); return d === undefined ? 0 : d.t; }),
        visible: showTotal,
      });
    }
    const anyVisible = trendSeries.some((s) => s.visible);
    return h('div', { className: 'tm-card' },
      h('div', { className: 'tm-chart-title' },
        h('span', { className: 'tm-chart-name' }, 'Token 使用趋势（' + (trendRange === '24h' ? '近24小时按小时' : trendRange === '7d' ? '近7天按天' : '近30天按天') + ' · 悬浮查看明细）'),
        h('span', { style: { display: 'inline-flex', gap: 6, alignItems: 'center' } },
          h(Seg, { options: [{ v: '24h', t: '近24小时' }, { v: '7d', t: '近7天' }, { v: '30d', t: '近30天' }], current: trendRange, onPick: setTrendRange }),
          widgetBtns(props.widgets, props.widgetId))),
      h('div', { className: 'tm-legend', style: { marginBottom: 2, marginTop: 0 } },
        trendSeries.map((s) => h('button', {
          key: s.name, className: 'tm-modelchip', 'data-off': s.visible ? '0' : '1',
          'aria-pressed': s.visible ? 'true' : 'false',
          onClick: () => { if (s.name === '__total__') setShowTotal(!showTotal); else setModelOff({ ...modelOff, [s.name]: !modelOff[s.name] }); },
        }, h('span', { className: 'tm-dot', style: { background: s.color } }), h('span', { className: 'tm-mc-name' }, s.shortName))),
        h('span', { className: 'tm-hint', style: { marginLeft: 6 } }, '默认隐藏总曲线')),
      anyVisible
        ? h(TrendChart, {
            key: trendRange, series: trendSeries, labels: trendLabels, titles: trendTitles,
            emptyText: trendEmpty, comp: slotComp, above: props.inFloat === true,
          })
        : h('div', { className: 'tm-empty' }, '全部曲线已隐藏 —— 点击上方标签恢复'));
  }

  /** 热力图卡（1/3/6/12 月，自带档位状态） */
  function HeatSection(props: { data: StatsSnapshot; aggAll: Agg; widgets?: any; widgetId?: string; inFloat?: boolean; inPlace?: boolean }): any {
    const data = props.data;
    const aggAll = props.aggAll;
    const [heatSpan, setHeatSpan] = useState('6');
    const open = useWidgetOpen(props.widgets, props.widgetId);
    if (props.inPlace && open) return null;
    const HEAT_OPS = [0.16, 0.3, 0.5, 0.72, 0.95];
    return h('div', { className: 'tm-card' },
      h('div', { className: 'tm-chart-title' }, h('span', { className: 'tm-chart-name' }, 'Token 活动热力图（悬浮查看当日明细）'),
        h('span', { style: { display: 'inline-flex', gap: 6, alignItems: 'center' } },
          h(Seg, { options: [{ v: '1', t: '1个月' }, { v: '3', t: '3个月' }, { v: '6', t: '6个月' }, { v: '12', t: '12个月' }], current: heatSpan, onPick: setHeatSpan }),
          widgetBtns(props.widgets, props.widgetId))),
      h(Heatmap, {
        key: heatSpan, byDay: aggAll.byDay, daySessions: data.daySessions || {}, models: data.models,
        months: Number(heatSpan), above: props.inFloat === true,
      }),
      h('div', { className: 'tm-legend' },
        h('span', { className: 'tm-muted' }, '少'),
        HEAT_OPS.map((o, i) => h('span', { key: i, className: 'tm-cell', style: { background: BP, opacity: o } })),
        h('span', { className: 'tm-muted' }, '多')),
      // 缓存汇总行（全量）：不悬停也能直接看到缓存读/写与占比
      h('div', { className: 'tm-cacheRow' },
        h('span', { className: 'tm-xdot', style: { background: '#f5a623' } }),
        h('span', null, '缓存读 ' + fmt(aggAll.cr)),
        h('span', { className: 'tm-cacheSep' }, '·'),
        h('span', { className: 'tm-xdot', style: { background: '#9a6ef1' } }),
        h('span', null, '缓存写 ' + fmt(aggAll.cw)),
        h('span', { className: 'tm-cacheSep' }, '·'),
        h('span', null, '缓存占比 ' + (aggAll.total > 0 ? ((aggAll.cr + aggAll.cw) / aggAll.total * 100).toFixed(1) : '0.0') + '%')));
  }

  /** 模型分布卡（环形 + 行悬浮构成） */
  function DonutSection(props: { data: StatsSnapshot; agg: Agg; rangeLabel: string; widgets?: any; widgetId?: string; inFloat?: boolean; inPlace?: boolean; prepend?: any }): any {
    const data = props.data;
    const sc = props.agg;
    const [pop, setPop] = useState<{ mx: number; my: number; content: any } | null>(null);
    const open = useWidgetOpen(props.widgets, props.widgetId);
    if (props.inPlace && open) return null;
    const leave = (): void => setPop(null);
    const arr = sorted(Array.from(sc.byModel.values()), (a, b) => b.t - a.t);
    if (arr.length === 0) return h('div', { className: 'tm-card tm-empty' }, '该范围内暂无模型用量');
    const donutEntries = arr.slice(0, 7).map((m) => ({ name: m.m, t: m.t, color: modelColor(m.m) }));
    const rest = arr.slice(7);
    if (rest.length > 0) donutEntries.push({ name: '其他', t: rest.reduce((s, m) => s + m.t, 0), color: '#8a94a6' });
    const modelRows = arr.map((m, i) => {
      const info = ((data.models as Record<string, { provider: string; model: string }>)[m.m]) || null;
      const name = info ? info.model : m.m;
      const color = modelColor(m.m);
      const pct = sc.total > 0 ? (m.t / sc.total) * 100 : 0;
      const hoverContent = (): any => breakdown(m.m + ' 用量构成', [['输入', m.i, 1, m.t], ['输出', m.o, 1, m.t], ['缓存读', m.cr, 1, m.t], ['缓存写', m.cw, 1, m.t]]);
      return h('div', {
        key: m.m, className: 'tm-model',
        onMouseEnter: (e: any) => setPop({ mx: e.clientX, my: e.clientY, content: hoverContent() }),
        onMouseMove: (e: any) => setPop({ mx: e.clientX, my: e.clientY, content: hoverContent() }),
        onMouseLeave: leave,
      },
        h('span', { className: 'tm-dot', style: { background: color } }),
        h('div', { style: { minWidth: 0, flex: '1' } },
          h('div', { className: 'tm-modelhead' },
            h('span', { className: 'tm-modelname' }, name),
            h('span', { className: 'tm-modelval' }, fmt(m.t) + ' · ' + pct.toFixed(1) + '%')),
          h('div', { className: 'tm-bartrack' },
            h('span', { className: 'tm-barfill', style: { width: ((m.t / (arr[0] as ModelAgg).t) * 100).toFixed(1) + '%', background: color, animationDelay: i * 40 + 120 + 'ms' } })),
          h('div', { className: 'tm-muted tm-modeldetail' },
            (info && info.provider ? info.provider + ' · ' : '') + '输入 ' + fmt(m.i) + ' · 输出 ' + fmt(m.o) + ' · 缓存 ' + fmt(m.cr + m.cw) + ' · ' + fmtFull(m.n) + ' 次')));
    });
    return h('div', { className: 'tm-card' },
      props.prepend ? props.prepend : null,
      h('div', { className: 'tm-chart-title' },
        h('span', { className: 'tm-chart-name' }, '模型用量分布（' + props.rangeLabel + ' · 悬浮查看构成）'),
        widgetBtns(props.widgets, props.widgetId)),
      h('div', { className: 'tm-flexrow' },
        h(Donut, { entries: donutEntries, total: sc.total }),
        h('div', { className: 'tm-models' }, modelRows)),
      pop !== null
        ? tmPortal(h('div', { className: 'tm-pop' + (props.inFloat ? ' tm-tip-above' : ''), style: tipPos(pop.mx, pop.my, 280, 60) }, pop.content))
        : null);
  }

  /** 独立图表小组件（widget 浮窗内容：kind = cards/trend/heat/donut/today，自带档位，数据走共享缓存；
   * 浮窗内悬浮提示统一上浮 tm-tip-above，不被浮窗遮挡） */
  function StatsWidget(props: { kind: string; widgets?: any; widgetId?: string }): any {
    const { data, err, loading } = useSharedStats();
    const [range, setRange] = useState('30');
    const aggAll = React.useMemo(() => {
      if (!data) return null;
      buildModelColors(data.models || {});
      return aggregate(data.records || [], null);
    }, [data]);
    if (!data || !aggAll) {
      return h('div', { className: 'tm-hint' }, err ? '统计加载失败：' + err : loading ? '正在聚合会话日志…' : '暂无数据（打开右侧栏用量面板可加速加载）');
    }
    const aa = aggAll as Agg;
    // 浮窗实例：传 widgets/widgetId 让标题栏的开关显示「回归」，但不传 inPlace（原位才隐藏）
    const w = { widgets: props.widgets, widgetId: props.widgetId };
    if (props.kind === 'trend') return h(TrendSection, { data, aggAll: aa, inFloat: true, ...w });
    if (props.kind === 'heat') return h(HeatSection, { data, aggAll: aa, inFloat: true, ...w });
    if (props.kind === 'donut') {
      const tk = keyOf(Date.now());
      const cut = range === 'all' ? null : keyOf(fromKey(tk) - (Number(range) - 1) * 86400000);
      const scoped = cut === null ? null : aggregate(data.records || [], cut);
      // 范围 Seg 作为卡片内顶部行（prepend），浮窗/面板内都不在卡片外
      return h(DonutSection, {
        data, agg: scoped !== null ? scoped : aa, rangeLabel: rangeText(range), inFloat: true, ...w,
        prepend: h('div', { className: 'tm-segRow' },
          h(Seg, { options: [{ v: '7', t: '近7天' }, { v: '30', t: '近30天' }, { v: '90', t: '近90天' }, { v: 'all', t: '全部' }], current: range, onPick: setRange })),
      });
    }
    if (props.kind === 'today') return h(TodayCard, { wide: true, bare: true, name: '今日消耗', inFloat: true, ...w });
    return h(StatCardsSection, { aggAll: aa, data, inFloat: true, ...w });
  }

  /* ---------- 设置页主体（showPrefs=false 时隐藏顶部开关行，供右栏富面板使用；开关收归设置页） ---------- */
  function StatsSettingsPage(props: { defaultRange: string; showToday: boolean; onPrefs: () => void; showPrefs?: boolean; widgets?: any }): any {
    const showPrefs = props.showPrefs !== false;
    const Btn = P.Button || (({ children, ...rest }: any) => h('button', { type: 'button', className: 'tm-btn', ...rest }, children));
    const [data, setData] = useState<StatsSnapshot | null>(null);
    const [err, setErr] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState(props.defaultRange || '30');
    const [todayOn, setTodayOn] = useState(false);
    const fl = useTmTodayFloat();

    React.useEffect(() => { setRange(props.defaultRange || '30'); }, [props.defaultRange]);
    React.useEffect(() => { setTodayOn(props.showToday === true); }, [props.showToday]);

    const inflight = (React.useRef as any)(false);
    const lastSig = (React.useRef as any)(null);
    const spinTimer = (React.useRef as any)(0);
    const dataRef = (React.useRef as any)(null);
    dataRef.current = data;
    const stallRef = React.useRef({ scanned: -1, same: 0 });
    const sigOf = (v: StatsSnapshot): string =>
      v.scanned + '/' + v.total + '/' + v.errors + '/' + (v.partial ? 1 : 0) + '/' + v.records.length + '/' + v.records.reduce((s, r) => s + tok(r), 0);

    const refresh = React.useCallback((force?: boolean) => {
      if (inflight.current && force !== true) return;
      inflight.current = true;
      window.clearTimeout(spinTimer.current);
      spinTimer.current = window.setTimeout(() => setLoading(true), 400);
      fetchStats().then((value) => {
        window.clearTimeout(spinTimer.current);
        inflight.current = false;
        setLoading(false);
        if (value && (value as StatsSnapshot).ready === true) {
          writeShared(value as StatsSnapshot);
          const sig = sigOf(value as StatsSnapshot);
          if (sig !== lastSig.current) {
            lastSig.current = sig;
            setData(value as StatsSnapshot);
            setErr(null);
          }
        } else setErr((value && (value as any).error) || '统计服务不可用');
      }).catch((e: unknown) => {
        window.clearTimeout(spinTimer.current);
        inflight.current = false;
        setLoading(false);
        setErr(String((e as Error)?.message ?? e));
      });
    }, []);
    React.useEffect(() => { (refresh as (f: boolean) => void)(true); }, [refresh]);
    React.useEffect(() => {
      const tick = (): void => { if (document.visibilityState === 'visible') refresh(); };
      const id = window.setInterval(tick, 60000);
      const onVis = (): void => { if (document.visibilityState === 'visible') refresh(); };
      document.addEventListener('visibilitychange', onVis);
      return () => { window.clearInterval(id); document.removeEventListener('visibilitychange', onVis); window.clearTimeout(spinTimer.current); };
    }, [refresh]);
    React.useEffect(() => {
      if (data === null || (data as StatsSnapshot).partial !== true) { stallRef.current.same = 0; return undefined; }
      let alive = true;
      let timer = 0;
      const st = stallRef.current;
      if ((data as StatsSnapshot).scanned === st.scanned) st.same++;
      else { st.same = 0; st.scanned = (data as StatsSnapshot).scanned; }
      const arm = (): void => {
        if (!alive) return;
        timer = window.setTimeout(() => {
          if (!alive) return;
          const d = dataRef.current;
          if (d !== null && d.partial === true) {
            if (d.scanned === st.scanned) st.same++;
            else { st.same = 0; st.scanned = d.scanned; }
            if (document.visibilityState === 'visible') refresh();
          }
          arm();
        }, st.same >= 8 ? 12000 : 2000);
      };
      arm();
      return () => { alive = false; window.clearTimeout(timer); };
    }, [data, refresh]);

    const derived = React.useMemo(() => {
      if (data === null) return null;
      buildModelColors((data as StatsSnapshot).models || {});
      const tk = keyOf(Date.now());
      const c = range === 'all' ? null : keyOf(fromKey(tk) - (Number(range) - 1) * 86400000);
      return {
        todayK: tk, cut: c,
        scoped: c === null ? null : aggregate((data as StatsSnapshot).records || [], c),
        aggAll: aggregate((data as StatsSnapshot).records || [], null),
      };
    }, [data, range]);

    const setToday = async (on: boolean): Promise<void> => {
      setTodayOn(on);
      try { await saveConfig({ showToday: on }); } catch { /* ignore */ }
      try { window.dispatchEvent(new CustomEvent('tm-today-toggle', { detail: { on } })); } catch { /* ignore */ }
      props.onPrefs();
    };

    const children: any[] = [];
    children.push(h('h3', { className: 'tm-title' }, 'Token 用量统计'));
    // 右栏模式（showPrefs=false）隐藏长描述，压缩与上方今日消耗卡的间距
    if (showPrefs) {
      children.push(h('p', { className: 'tm-desc' },
        '聚合本机全部会话日志（含子代理会话；fork/resume 种子事件已去重）。数据每 60 秒自动刷新；时间范围作用于当前范围卡片与模型分布，趋势图用自带的近24小时 / 近7天 / 近30天切换，总览与热力图为全量数据。'));
    }
    if (showPrefs) {
      children.push(h('div', { className: 'tm-swrow' },
        h('div', { className: 'tm-swrowText' },
          h('div', { className: 'tm-swlabel' }, '在侧边栏显示今日用量'),
          h('div', { className: 'tm-swhint' }, '开启后左侧边栏底部显示今日 Token 消耗小卡片（含分色小时曲线与昨日对比；偏好存 settings.yaml · dshp-token-meter）')),
        h('button', {
          className: 'tm-switch', role: 'switch', 'aria-checked': todayOn ? 'true' : 'false',
          'aria-label': '在侧边栏显示今日用量',
          onClick: () => void setToday(!todayOn),
        }, h('span', { className: 'tm-knob' }))));
      children.push(h('div', { className: 'tm-swrow' },
        h('div', { className: 'tm-swrowText' },
          h('div', { className: 'tm-swlabel' }, '今日卡片浮窗'),
          h('div', { className: 'tm-swhint' }, '弹出后可拖到屏幕任意位置，侧边栏不再占位；开关与坐标存本机 localStorage')),
        fl.open
          ? h(Btn, { variant: 'outline', size: 'sm', onClick: () => tmTodaySet(false) }, '收回侧边栏')
          : h('div', { className: 'tm-hint' }, '在侧边栏中（卡片标题栏 ⠿ 可拖出）')));
    }

    if (err) {
      children.push(h('div', { className: 'tm-notice tm-notice-err' }, '读取失败：' + err));
      children.push(h(Btn, { variant: 'outline', size: 'sm', onClick: () => refresh(true) }, '重试'));
      return h('div', { className: 'tm-page' }, children);
    }
    if (data === null) {
      children.push(h('div', { className: 'tm-notice tm-notice-empty' }, loading ? '正在统计会话日志…' : '暂无数据'));
      return h('div', { className: 'tm-page' }, children);
    }
    const dd = derived as { todayK: string; cut: string | null; scoped: Agg | null; aggAll: Agg };
    const scoped = dd.scoped;
    const aggAll = dd.aggAll;
    const hasData = aggAll.first !== null;

    children.push(h('div', { className: 'tm-toolbar' },
      h('label', { className: 'tm-hint' }, '时间范围'),
      h(RangeSelect, { options: RANGES, value: range, onPick: (v: string) => setRange(v) }),
      h('span', { className: 'tm-hint', style: { marginLeft: 'auto' } },
        '更新于 ' + hhmm((data as StatsSnapshot).generatedAt) + (loading ? ' · 刷新中…' : '')),
      (data as StatsSnapshot).storage === 'disabled'
        ? (P.Tooltip
            ? h(P.Tooltip, { label: '统计仍正常运行；重启后需全量重扫。详情见宿主日志 [dshp-token-meter] storage domain', side: 'bottom' },
                h('span', { className: 'tm-hint', style: { cursor: 'help' } }, '⚠ 无持久缓存'))
            : h('span', { className: 'tm-hint', title: '统计仍正常运行；重启后需全量重扫' }, '⚠ 无持久缓存'))
        : null,
      h(Btn, {
        variant: 'outline', size: 'sm', onClick: () => refresh(), disabled: loading,
        icon: loading && P.IconLoadingOutline16 ? h(P.IconLoadingOutline16) : P.IconRefreshOutline14 ? h(P.IconRefreshOutline14) : undefined,
      }, loading ? '刷新中…' : '刷新')));

    {
      const pct = (data as StatsSnapshot).total > 0 ? Math.round((((data as StatsSnapshot).scanned / (data as StatsSnapshot).total) * 100)) : 0;
      children.push((data as StatsSnapshot).partial === true
        ? h('div', { className: 'tm-notice tm-notice-empty', style: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' } },
            h('span', null, '后台统计中 ' + pct + '%（' + (data as StatsSnapshot).scanned + '/' + (data as StatsSnapshot).total + ' 个会话）—— 已扫描部分先展示，完成后自动补全。'),
            (data as StatsSnapshot).errors > 0 ? h('span', { className: 'tm-muted' }, (data as StatsSnapshot).errors + ' 个会话读取失败已跳过') : null)
        : null);
    }

    if (!hasData) {
      children.push(h('div', { className: 'tm-empty' },
        '暂无 Token 用量数据 — 发起一次对话后会自动统计（已扫描 ' + (data as StatsSnapshot).sessions + ' 个会话）'));
      return h('div', { className: 'tm-page' }, children);
    }

    // ── 指标卡组（独立组件，右栏与 widget 浮窗复用）─────────────────
    children.push(h(StatCardsSection, {
      aggAll, data: data as StatsSnapshot,
      widgets: (props as any).widgets || null, widgetId: 'stats:cards', inPlace: true,
    }));
    children.push(scoped !== null
      ? h('div', { className: 'tm-card' },
          h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' } },
            h('span', { className: 'tm-muted' }, '当前范围（' + rangeText(range) + '）'),
            h('span', { style: { fontVariantNumeric: 'tabular-nums' } },
              fmt(scoped.total) + ' tokens · 输入 ' + fmt(scoped.i) + ' · 输出 ' + fmt(scoped.o) + ' · ' + fmtFull(scoped.n) + ' 次调用')))
      : null);

    // ── 趋势 / 热力 / 模型分布（独立组件，右栏与 widget 浮窗复用）───
    children.push(h(TrendSection, {
      data: data as StatsSnapshot, aggAll,
      widgets: (props as any).widgets || null, widgetId: 'stats:trend', inPlace: true,
    }));
    children.push(h(HeatSection, {
      data: data as StatsSnapshot, aggAll,
      widgets: (props as any).widgets || null, widgetId: 'stats:heat', inPlace: true,
    }));
    children.push(h(DonutSection, {
      data: data as StatsSnapshot, agg: scoped !== null ? scoped : aggAll, rangeLabel: rangeText(range),
      widgets: (props as any).widgets || null, widgetId: 'stats:donut', inPlace: true,
    }));
    children.push(h('div', { className: 'tm-muted', style: { margin: '4px 2px 0' } },
      '统计口径：总 Token = 输入 + 缓存读 + 缓存写 + 输出（reasoning 已含在输出内）；同一请求的采样 usage 被终值覆盖，不重复累计；fork/resume 种子事件已去重。'));
    return h('div', { className: 'tm-page' }, children);
  }

  /* ---------- 今日卡（侧栏宽栏 / 折叠 rail / 浮窗共用） ---------- */
  function TodayCard(props: any): any {
    const wide = !(props && props.wide === false);
    const isFloat = !!(props && props.float === true);
    const bare = !!(props && props.bare === true);
    const floatPos = (props && props.floatPos) || null;
    const floatXY = isFloat ? tmTodayClamp(floatPos || tmTodayLoadPos() || tmTodayDefaultPos()) : null;
    const [data, setData] = useState<StatsSnapshot | null>(null);
    const [tip, setTip] = useState<{ mx: number; my: number } | null>(null);
    const doRefresh = React.useCallback(() => {
      fetchStats().then((v) => { if (v && (v as StatsSnapshot).ready === true) setData(v as StatsSnapshot); }).catch(() => { /* ignore */ });
    }, []);
    React.useEffect(() => {
      doRefresh();
      const id = window.setInterval(() => { if (document.visibilityState === 'visible') doRefresh(); }, 60000);
      return () => { window.clearInterval(id); };
    }, [doRefresh]);

    if (data === null) {
      if (isFloat) {
        return h('div', { className: 'tm-float', style: { left: (floatXY as { x: number }).x + 'px', top: (floatXY as { y: number }).y + 'px' } },
          h('div', { className: 'tm-todayhead tm-floathead', title: '按住拖到任意位置 · 双击收回侧边栏', onPointerDown: tmFloatDrag, onDoubleClick: () => tmTodaySet(false) },
            h('span', { className: 'tm-todaylabel' }, '今日用量'),
            h('span', { className: 'tm-todayval', style: { opacity: 0.5 } }, '…'),
            h('button', { className: 'tm-minibtn', title: '收回侧边栏', onClick: (e: any) => { if (e.stopPropagation) e.stopPropagation(); tmTodaySet(false); } }, '📌')));
      }
      return h('div', { className: 'tm-today' + (wide ? '' : ' tm-todayRail') },
        h('div', { className: 'tm-todaylabel' }, '今日用量'),
        h('div', { className: 'tm-todayval', style: { opacity: 0.5 } }, '…'));
    }

    buildModelColors((data as StatsSnapshot).models || {});
    const todayK = keyOf(Date.now());
    const yK = keyOf(fromKey(todayK) - 86400000);
    const both = aggregate((data as StatsSnapshot).records || [], yK);
    const dayTotal = (k: string): number => { const d = both.byDay.get(k); return d === undefined ? 0 : d.t; };
    const todayTotal = dayTotal(todayK);
    const yTotal = dayTotal(yK);
    const delta = yTotal > 0 ? (((todayTotal - yTotal) / yTotal) * 100) : null;

    if (!wide) {
      const showTip = (e: any): void => setTip({ mx: e.clientX, my: e.clientY });
      const hideTip = (): void => setTip(null);
      const dTxt = delta === null ? (todayTotal > 0 ? '昨日无消耗' : '—') : ((delta >= 0 ? '+' : '') + delta.toFixed(0) + '% vs 昨日');
      return h('div', {
        className: 'tm-today tm-todayRail',
        onMouseEnter: showTip, onMouseMove: showTip, onMouseLeave: hideTip,
      },
        h('div', { className: 'tm-todaylabel' }, '今日'),
        h(AnimatedNumber, { className: 'tm-todayval', value: todayTotal, format: fmtRail }),
        h(DualBars, { className: 'tm-dualbars', a: todayTotal, b: yTotal }),
        tip === null ? null : (() => {
          const pos = tipPos(tip.mx, tip.my, 190, 82);
          return tmPortal(h('div', { className: 'tm-tipfixed', style: pos },
            h('div', { className: 'tm-tiprow', style: { fontWeight: 600, marginBottom: 2 } }, '今日用量'),
            h('div', { className: 'tm-tiprow' }, h('span', { className: 'tm-tip-k' }, '今日'), h('span', { className: 'tm-tip-v' }, fmt(todayTotal))),
            h('div', { className: 'tm-tiprow' }, h('span', { className: 'tm-tip-k' }, '昨日'), h('span', { className: 'tm-tip-v' }, fmt(yTotal))),
            h('div', { className: 'tm-tiprow' }, h('span', { className: 'tm-tip-k' }, '对比'), h('span', { className: 'tm-tip-v' }, dTxt))));
        })());
    }

    const endH = new Date();
    endH.setMinutes(0, 0, 0);
    const hourSlots: Array<{ d: string; h: number }> = [];
    for (let k = 23; k >= 0; k--) {
      const t = endH.getTime() - k * 3600000;
      hourSlots.push({ d: keyOf(t), h: new Date(t).getHours() });
    }
    const hourLabels = hourSlots.map((s) => (s.d === todayK ? s.h + ':00' : '昨日' + s.h + ':00'));
    const hourIdx = new Map<string, number>();
    for (let i = 0; i < hourSlots.length; i++) hourIdx.set((hourSlots[i] as { d: string; h: number }).d + '|' + (hourSlots[i] as { d: string; h: number }).h, i);
    const hourArrs = new Map<string, number[]>();
    for (const r of (data as StatsSnapshot).records || []) {
      const idx = hourIdx.get(r.d + '|' + r.h);
      if (idx === undefined) continue;
      let arr = hourArrs.get(r.m);
      if (arr === undefined) { arr = Array.from({ length: 24 }, () => 0); hourArrs.set(r.m, arr); }
      (arr[idx] as number) += tok(r);
    }
    const modelHourSeries: TrendSeries[] = [];
    for (const mk of sorted(Array.from(hourArrs.keys()))) {
      modelHourSeries.push({
        name: mk,
        shortName: (((data as StatsSnapshot).models as Record<string, { model: string }>)[mk] || {}).model || mk,
        color: modelColor(mk),
        values: hourArrs.get(mk) as number[],
        visible: true,
      });
    }

    return h('div', isFloat
      ? { className: 'tm-float', style: { left: (floatXY as { x: number }).x + 'px', top: (floatXY as { y: number }).y + 'px' } }
      : { className: 'tm-today' },
      h('div', isFloat
        ? { className: 'tm-todayhead tm-floathead', title: '按住拖到任意位置 · 双击收回侧边栏', onPointerDown: tmFloatDrag, onDoubleClick: () => tmTodaySet(false) }
        : { className: 'tm-todayhead' },
        isFloat || bare ? null : h('span', { className: 'tm-grip', title: '按住拖出为浮窗，点按直接弹出', onPointerDown: tmGripDragOut }, '⠿'),
        h('span', { className: 'tm-todaylabel' }, props.name || '今日 Token'),
        h(AnimatedNumber, { className: 'tm-todayval', value: todayTotal, format: fmt }),
        bare
          ? widgetBtns(props.widgets, props.widgetId)
          : h('button', {
              className: 'tm-minibtn',
              title: isFloat ? '收回侧边栏' : '弹出为浮窗（可拖到屏幕任意位置）',
              onClick: (e: any) => { if (e.stopPropagation) e.stopPropagation(); tmTodaySet(!isFloat); },
            }, isFloat ? '📌' : '⧉')),
      h(TodayChart, { series: modelHourSeries, n: 24, labels: hourLabels, floatTip: isFloat || props.inFloat === true }),
      modelHourSeries.length > 0
        ? h('div', { className: 'tm-todaymodels' },
            modelHourSeries.map((s, si) => h('span', { key: s.name, className: 'tm-todaymchip tm-fadein', style: { animationDelay: si * 60 + 'ms' } },
              h('span', { className: 'tm-dot', style: { background: s.color } }),
              h('span', null, s.shortName))))
        : null,
      delta !== null
        ? h('div', { className: 'tm-statgrow tm-fadein', style: { marginTop: 4, color: delta >= 0 ? 'var(--dsw-alias-state-success-primary)' : 'var(--dsw-alias-state-error-primary)', fontSize: 10.5 } },
            h('span', { className: 'tm-arrow ' + (delta >= 0 ? 'tm-arrow-up' : 'tm-arrow-down') }),
            h('span', null, (delta >= 0 ? '+' : '') + delta.toFixed(0) + '% vs 昨日'))
        : h('div', { className: 'tm-muted', style: { fontSize: 10, marginTop: 4 } }, todayTotal > 0 ? '昨日无消耗' : '开始使用后统计'));
  }

  function TodayFloatEntry(): any {
    const on = React.useRef(true);
    void on;
    const fl = useTmTodayFloat();
    const [showToday, setShowToday] = useState<boolean | null>(null);
    React.useEffect(() => {
      let alive = true;
      fetch('/ext/dshp-token-meter/state', { cache: 'no-store' })
        .then((r) => r.json())
        .then((s: any) => { if (alive && s && s.ok && s.config) setShowToday(s.config.showToday === true); })
        .catch(() => { /* ignore */ });
      const fn = (ev: any): void => { if (ev && ev.detail) setShowToday(!!ev.detail.on); };
      const wrap = (ev: Event): void => fn((ev as CustomEvent).detail ? { detail: (ev as CustomEvent).detail } : ev);
      window.addEventListener('tm-today-toggle', wrap);
      return () => window.removeEventListener('tm-today-toggle', wrap);
    }, []);
    if (showToday !== true || !fl.open) return null;
    const pos = tmTodayClamp(fl.pos || tmTodayLoadPos() || tmTodayDefaultPos());
    void Badge;
    return h(TodayCard, { wide: true, float: true, floatPos: pos });
  }

  return {
    StatsSettingsPage, TodayCard, TodayFloatEntry, useTmTodayFloat, tmTodayFloat, tmTodaySet,
    StatsWidget, StatCardsSection, TrendSection, HeatSection, DonutSection, HiddenWhenFloated,
  };
}
