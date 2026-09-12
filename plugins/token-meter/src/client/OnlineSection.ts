/**
 * 在线时长面板（右栏独立 tab + 可弹出小组件）
 *
 * 数据全部来自 Host：GET /ext/dshp-token-meter/stats 的 `snapshot.online`。
 * Host 侧口径见 src/host/stats/online.ts —— 这里只做呈现与阈值切换，
 * **不在客户端重算统计**，避免两端口径漂移。
 *
 * 面板内容：
 *  - 阈值切换（1/5/15/30/60 分钟）+ 区间切换（近 14/30/90 天 / 全部），阈值落 settings.yaml；
 *  - 三组关键数字：在线（你 + DSH）/ 对话进行中（DSH 的钟）/ 模型 + 工具（DSH 的活，精确）；
 *  - 每日柱线混合图：柱 = 对话中(实) + 空档(半透)、虚线 = 引擎合计，带悬浮数据提示；
 *  - 三口径对照条 + 数据准确性表（哪些精确、哪些估算）；
 *  - 高在线日 Top 8 明细。
 */
import { fetchStats, saveConfig } from './api.js';
import type { AnyReact, StatsOnline, StatsOnlineDay, StatsSnapshot } from './types.js';

/** 阈值档位（分钟）与文案 */
const GAP_LABELS: Array<[number, string]> = [
  [1, '1 分钟'],
  [5, '5 分钟'],
  [15, '15 分钟'],
  [30, '30 分钟'],
  [60, '60 分钟'],
];
/** 图表区间档位（天；0 = 全部活跃日） */
const RANGE_LABELS: Array<[number, string]> = [
  [14, '近 14 天'],
  [30, '近 30 天'],
  [90, '近 90 天'],
  [0, '全部'],
];

/** 会话结局分类的中文标签（Host 端 fold 打的标，见 host/stats/fold.ts） */
const OUTCOME_LABELS: Record<string, string> = {
  usage: '有用量',
  'fork-empty': '继承空壳（fork 后没干活）',
  'no-request': '从没发起模型请求',
  failed: '请求失败/中断（模型没回答）',
  'no-usage': '有回答但供应商没上报 usage',
  unreadable: '日志读不出来（已兜底，若仍有则为疑难日志）',
};

/** 主色（跟随主题）与引擎线颜色 */
const C_MAIN = 'var(--dsw-alias-state-business-primary)';
const C_BUSY = '#f5a623';

/** 每日图表的 viewBox 尺寸（固定 viewBox + width:100% 渲染） */
const CHART_W = 320;
const CHART_H = 150;

/* ---------- 格式化 ---------- */

/** 时长：≥1h 用 `141h10m`，≥1min 用 `42m`，否则 `38s`。 */
export function fmtDur(ms: number): string {
  const s = Math.max(0, Math.round((ms || 0) / 1000));
  if (s < 60) return s + 's';
  const m = Math.floor(s / 60);
  if (m < 60) return m + 'm';
  const h = Math.floor(m / 60);
  const rest = m % 60;
  return rest === 0 ? h + 'h' : h + 'h' + String(rest).padStart(2, '0') + 'm';
}

/** 时长（中文，用于卡片主数字）：`141 小时 10 分` */
function fmtDurCn(ms: number): string {
  const m = Math.max(0, Math.round((ms || 0) / 60000));
  if (m < 1) return '<1 分';
  if (m < 60) return m + ' 分';
  const h = Math.floor(m / 60);
  const rest = m % 60;
  return rest === 0 ? h + ' 小时' : h + ' 小时 ' + rest + ' 分';
}

const fmtTok = (n: number): string => {
  const v = Math.round(n || 0);
  if (v >= 1e8) return (v / 1e8).toFixed(2) + ' 亿';
  if (v >= 1e4) return (v / 1e4).toFixed(1) + ' 万';
  return String(v);
};

const keyOf = (t: number): string => {
  const d = new Date(t);
  const M = String(d.getMonth() + 1);
  const D = String(d.getDate());
  return d.getFullYear() + '-' + (M.length < 2 ? '0' + M : M) + '-' + (D.length < 2 ? '0' + D : D);
};
const dispDay = (k: string): string => (k ? k.slice(5).replace('-', '/') : '');
const cnDate = (k: string): string => {
  const p = k.split('-');
  return Number(p[0]) + '年' + Number(p[1]) + '月' + Number(p[2]) + '日';
};
/** 从「今天」倒推 n-1 天的日期键列表（本地时区，升序） */
function lastNDays(n: number, now: number = Date.now()): string[] {
  const out: string[] = [];
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - (n - 1));
  for (let i = 0; i < n; i++) {
    out.push(keyOf(d.getTime()));
    d.setDate(d.getDate() + 1);
  }
  return out;
}

/** 悬浮提示定位（与 StatsSection.tipPos 同款：越界自动翻边） */
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

/* ---------- 取数 ---------- */

interface SeriesItem {
  d: string;
  ms: number;
  turnMs: number;
  idleMs: number;
  llmMs: number;
  toolMs: number;
  busyMs: number;
  tokens: number;
  sessions: number;
  seg: number;
  actual: boolean;
}

interface OnlineView {
  gap: number;
  total: number;
  turn: number;
  idle: number;
  llm: number;
  tool: number;
  busy: number;
  activeDays: number;
  avg: number;
  today: number;
  segments: number;
  series: SeriesItem[];
  peak: SeriesItem | null;
  /** 全部活跃日按在线时长降序（排行用） */
  ranked: SeriesItem[];
  /** ranked 前 8（保留旧字段） */
  top: SeriesItem[];
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];
/** `2026-09-08` → `周一` */
function weekdayOf(k: string): string {
  const p = k.split('-');
  const d = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]), 12);
  return '周' + (WEEKDAYS[d.getDay()] ?? '');
}

/** 按在线时长降序拷贝（客户端保持 ES2020 兼容，不用 toSorted） */
function sortByMsDesc(arr: SeriesItem[]): SeriesItem[] {
  const out = arr.slice();
  // eslint-disable-next-line unicorn/no-array-sort
  return out.sort((a, b) => b.ms - a.ms);
}

/** 从 Host 快照派生视图（纯计算，无副作用）。 */
export function deriveOnlineView(
  online: StatsOnline,
  gap: number,
  rangeDays: number,
  now: number = Date.now(),
): OnlineView {
  const g = String(gap);
  const byKey = new Map<string, StatsOnlineDay>();
  for (const day of online.days) byKey.set(day.d, day);
  const series: SeriesItem[] = [];
  const keys = rangeDays > 0 ? lastNDays(rangeDays, now) : online.days.map((x) => x.d);
  for (const k of keys) {
    const day = byKey.get(k);
    const ms = day ? (day.byGap[g] ?? 0) : 0;
    const turnMs = day ? day.turnMs : 0;
    series.push({
      d: k,
      ms,
      turnMs,
      idleMs: Math.max(0, ms - turnMs),
      llmMs: day ? day.llmMs || 0 : 0,
      toolMs: day ? day.toolMs || 0 : 0,
      busyMs: day ? (day.llmMs || 0) + (day.toolMs || 0) : 0,
      tokens: day ? day.tokens : 0,
      sessions: day ? day.sessions : 0,
      seg: day ? (day.segByGap ? (day.segByGap[g] ?? 0) : 0) : 0,
      actual: day !== undefined,
    });
  }
  let peak: SeriesItem | null = null;
  const actualItems: SeriesItem[] = [];
  for (const it of series) {
    if (!it.actual) continue;
    if (peak === null || it.ms > peak.ms) peak = it;
    actualItems.push(it);
  }
  const ranked = sortByMsDesc(actualItems);
  const top = ranked.slice(0, 8);
  const total = online.totalMs[g] ?? 0;
  const turn = online.turnMs;
  const llm = online.llmMs || 0;
  const tool = online.toolMs || 0;
  return {
    gap,
    total,
    turn,
    idle: Math.max(0, total - turn),
    llm,
    tool,
    busy: llm + tool,
    activeDays: online.activeDays,
    avg: online.activeDays > 0 ? total / online.activeDays : 0,
    today: byKey.get(keyOf(now))?.byGap[g] ?? 0,
    segments: online.segments[g] ?? 0,
    series,
    peak,
    ranked,
    top,
  };
}

/* ---------- 组件 ---------- */

export function createOnlineSection(
  React: AnyReact,
  ReactDOM: any,
  /** 「Token 用量」面板的共享快照（有就复用，避免两套轮询各打一次 /stats） */
  statsApi?: any,
): {
  /** 在线时长面板（不再支持弹出为浮窗 —— 顶栏抓手/回归已移除） */
  OnlineRightPane: (props: any) => any;
} {
  const h = React.createElement;

  function portal(node: any): any {
    if (node === null || node === undefined) return null;
    try {
      if (
        ReactDOM &&
        typeof ReactDOM.createPortal === 'function' &&
        typeof document !== 'undefined' &&
        document.body
      )
        return ReactDOM.createPortal(node, document.body);
    } catch {
      /* ignore */
    }
    return node;
  }

  /** 悬浮数据提示的内容：标题 + 键值行 + 多行说明（全部走同一个浮层样式） */
  interface TipContent {
    /** 稳定 key：避免每次 mousemove 都重建浮层 */
    k: string;
    title?: string;
    text?: string;
    rows?: Array<[string, string]>;
  }

  /**
   * 统一的悬浮数据提示（替代原生 `title`，与图表/排行的提示同一套外观）。
   *
   * 实现是「store + 单一 Host」而不是把 state 放在使用方：
   * 鼠标移动时只有 `TipHost` 这一个小组件重渲染，不会把整个面板（十几张卡 + 表格）
   * 跟着重画一遍。
   */
  const tipStore: {
    cur: { x: number; y: number; c: TipContent } | null;
    subs: Set<() => void>;
  } = { cur: null, subs: new Set() };

  function tipEmit(): void {
    for (const fn of tipStore.subs) {
      try {
        fn();
      } catch {
        /* ignore */
      }
    }
  }

  /** 挂到任意元素上的悬浮事件（内容按 k 去抖：同元素内移动不重建） */
  function useTip(): { bind: (c: TipContent) => Record<string, any> } {
    return {
      bind: (c: TipContent) => ({
        onMouseEnter: (e: any) => {
          tipStore.cur = { x: e.clientX, y: e.clientY, c };
          tipEmit();
        },
        onMouseMove: (e: any) => {
          const cur = tipStore.cur;
          if (cur !== null && cur.c.k === c.k && cur.x === e.clientX && cur.y === e.clientY) return;
          tipStore.cur = { x: e.clientX, y: e.clientY, c };
          tipEmit();
        },
        onMouseLeave: () => {
          tipStore.cur = null;
          tipEmit();
        },
      }),
    };
  }

  /** 每个面板实例只挂一个：负责渲染当前提示（portal 到 body） */
  function TipHost(): any {
    const [, force] = React.useReducer((x: number) => x + 1, 0);
    React.useEffect(() => {
      tipStore.subs.add(force);
      return () => {
        tipStore.subs.delete(force);
      };
    }, [force]);
    const tip = tipStore.cur;
    if (tip === null) return null;
    return portal(
      h(
        'div',
        {
          className: 'tm-tipfixed',
          style: tipPos(
            tip.x,
            tip.y,
            250,
            30 + (tip.c.rows ? tip.c.rows.length * 18 : 0) + (tip.c.text ? 36 : 0),
          ),
        },
        tip.c.title ? h('div', { className: 'tm-tip-title' }, tip.c.title) : null,
        (tip.c.rows ?? []).map(([k, v]: [string, string]) =>
          h(
            'div',
            { key: k, className: 'tm-tiprow' },
            h('span', { className: 'tm-tip-k' }, k),
            h('span', { className: 'tm-tip-v' }, v),
          ),
        ),
        tip.c.text ? h('div', { className: 'tm-tip-text' }, tip.c.text) : null,
      ),
    );
  }

  /** 本地兜底取数（没有共享快照时用）：轮询 + 回到前台立即刷新 */
  function useOnlineLocal(pollMs: number): { snap: StatsSnapshot | null; err: string; reload: () => void } {
    const [snap, setSnap] = React.useState(null as StatsSnapshot | null);
    const [err, setErr] = React.useState('');
    const load = React.useCallback(() => {
      void fetchStats()
        .then((s: StatsSnapshot) => {
          setSnap(s);
          setErr(s && s.error ? String(s.error) : '');
        })
        .catch((e: unknown) => setErr(String((e as Error)?.message ?? e)));
    }, []);
    React.useEffect(() => {
      load();
      const id = window.setInterval(() => {
        if (document.visibilityState !== 'hidden') load();
      }, pollMs);
      const onVis = (): void => {
        if (document.visibilityState === 'visible') load();
      };
      document.addEventListener('visibilitychange', onVis);
      return () => {
        window.clearInterval(id);
        document.removeEventListener('visibilitychange', onVis);
      };
    }, [load, pollMs]);
    return { snap, err, reload: load };
  }

  // 用哪个取数钩子在**工厂期**定下来（共享快照优先），因此组件里调用的始终是同一个钩子，
  // 不存在"条件调用 hooks"的问题。
  const useShared:
    (() => { data: StatsSnapshot | null; err: string; reload: (force?: boolean) => void }) | null =
    statsApi && typeof statsApi.useSharedStats === 'function' ? statsApi.useSharedStats : null;

  /** 面板取数：优先与「Token 用量」面板共用同一份快照（一次请求），否则自轮询 */
  function useSnapshot(): { snap: StatsSnapshot | null; err: string; reload: () => void } {
    if (useShared !== null) {
      const sharedSnap = useShared();
      return { snap: sharedSnap.data, err: sharedSnap.err, reload: () => sharedSnap.reload(true) };
    }
    return useOnlineLocal(20000);
  }

  /** 档位切换 */
  function Seg(props: { items: Array<[number, string]>; value: number; onPick: (v: number) => void }): any {
    return h(
      'span',
      { className: 'tm-seg' },
      props.items.map(([v, t]) =>
        h(
          'button',
          {
            key: String(v),
            type: 'button',
            className: 'tm-seg-btn' + (v === props.value ? ' tm-seg-on' : ''),
            onClick: () => props.onPick(v),
          },
          t,
        ),
      ),
    );
  }

  /** 准确度徽标：精确 / 估算 / 下界 */
  function Acc(props: { kind: 'exact' | 'estimate' | 'bound' }): any {
    const map = {
      exact: ['tm-badge-ok', '精确'],
      estimate: ['tm-badge-warn', '估算'],
      bound: ['tm-badge-muted', '下界'],
    } as const;
    const picked = map[props.kind];
    return h('span', { className: 'tm-badge ' + picked[0] }, picked[1]);
  }

  function Stat(props: {
    label: string;
    value: string;
    sub?: string;
    tint?: boolean;
    /** 悬浮提示（统一外观，不用原生 title） */
    tip?: TipContent;
    acc?: 'exact' | 'estimate' | 'bound';
  }): any {
    const t = useTip();
    return h(
      'div',
      {
        className: 'tm-stat',
        ...(props.tint ? { 'data-tint': '1' } : {}),
        ...(props.tip ? t.bind(props.tip) : {}),
      },
      h(
        'div',
        { className: 'tm-stat-label', style: { display: 'flex', alignItems: 'center', gap: 4 } },
        props.label,
        props.acc
          ? h(
              'span',
              { className: 'tm-acc ' + props.acc },
              props.acc === 'exact' ? '精确' : props.acc === 'estimate' ? '估算' : '下界',
            )
          : null,
      ),
      h('div', { className: 'tm-stat-value' }, props.value),
      props.sub ? h('div', { className: 'tm-stat-sub' }, props.sub) : null,
    );
  }

  function Dot(props: { color: string; faint?: boolean }): any {
    return h('span', {
      className: 'tm-dot',
      style: { background: props.color, opacity: props.faint ? 0.35 : 1, marginTop: 0 },
    });
  }

  function Legend(): any {
    return h(
      'div',
      { className: 'tm-legend' },
      h(Dot, { color: C_MAIN }),
      h('span', { className: 'tm-hint' }, '对话进行中'),
      h(Dot, { color: C_MAIN, faint: true }),
      h('span', { className: 'tm-hint' }, '空档（≤ 阈值的追问/收尾，算在线不算对话）'),
      h(Dot, { color: C_BUSY }),
      h('span', { className: 'tm-hint' }, '模型 + 工具（并行相加，可高于柱高）'),
    );
  }

  /** 每日柱线混合图：堆叠柱（对话中 + 空档）+ 引擎合计虚线，带悬浮数据提示 */
  function Chart(props: { items: SeriesItem[]; gap: number }): any {
    const items = props.items;
    const W = CHART_W;
    const H = CHART_H;
    const padT = 12;
    const padB = 18;
    const innerH = H - padT - padB;
    const [hover, setHover] = React.useState(null as { i: number; mx: number; my: number } | null);
    if (items.length === 0) return h('div', { className: 'tm-empty' }, '暂无数据');
    let max = 0;
    for (const it of items) {
      if (it.ms > max) max = it.ms;
      if (it.busyMs > max) max = it.busyMs;
    }
    if (max <= 0) max = 1;
    const bw = W / items.length;
    const barW = Math.max(1.4, Math.min(20, bw * 0.6));
    const yOf = (v: number): number => padT + innerH * (1 - v / max);
    const step = Math.max(1, Math.ceil(items.length / 6));
    const today = keyOf(Date.now());
    const children: any[] = [];
    children.push(
      h('line', { key: 'ax', x1: 0, y1: padT + innerH, x2: W, y2: padT + innerH, className: 'tm-gridln' }),
    );
    children.push(
      h('line', {
        key: 'mid',
        x1: 0,
        y1: padT + innerH / 2,
        x2: W,
        y2: padT + innerH / 2,
        className: 'tm-gridln',
        strokeDasharray: '3 3',
      }),
    );
    children.push(
      h('text', { key: 'ymax', x: 0, y: padT - 3, className: 'tm-axislbl' }, (max / 3.6e6).toFixed(1) + 'h'),
    );
    items.forEach((it, i) => {
      const x = i * bw + (bw - barW) / 2;
      const turnH = it.turnMs > 0 ? Math.max(1, (it.turnMs / max) * innerH) : 0;
      const idleH = it.idleMs > 0 ? Math.max(1, (it.idleMs / max) * innerH) : 0;
      const yTurn = padT + innerH - turnH;
      const yIdle = yTurn - idleH;
      if (turnH > 0)
        children.push(
          h('rect', {
            key: 't' + it.d,
            x,
            y: yTurn,
            width: barW,
            height: turnH,
            rx: 2,
            fill: C_MAIN,
            opacity: it.d === today ? 0.95 : 0.72,
          }),
        );
      if (idleH > 0)
        children.push(
          h('rect', {
            key: 'i' + it.d,
            x,
            y: yIdle,
            width: barW,
            height: idleH,
            rx: 2,
            fill: C_MAIN,
            opacity: 0.26,
          }),
        );
      if (i % step === 0)
        children.push(
          h(
            'text',
            { key: 'l' + it.d, x: x + barW / 2, y: H - 5, textAnchor: 'middle', className: 'tm-axislbl' },
            dispDay(it.d),
          ),
        );
    });
    if (items.some((it) => it.busyMs > 0))
      children.push(
        h('polyline', {
          key: 'busy',
          points: items
            .map((it, i) => (i * bw + bw / 2).toFixed(1) + ',' + yOf(it.busyMs).toFixed(1))
            .join(' '),
          fill: 'none',
          stroke: C_BUSY,
          strokeWidth: 1.6,
          strokeDasharray: '4 3',
          strokeLinejoin: 'round',
        }),
      );
    const hovered = hover !== null ? items[hover.i] : undefined;
    if (hover !== null && hovered)
      children.push(
        h('rect', {
          key: 'hv',
          x: hover.i * bw,
          y: padT,
          width: bw,
          height: innerH,
          fill: 'currentColor',
          opacity: 0.08,
          pointerEvents: 'none',
        }),
      );
    // 透明命中区：第 i 根柱 = 第 i 整列（含柱间空隙），hover 命中即该列
    items.forEach((it, i) => {
      children.push(
        h('rect', {
          key: 'hit' + it.d,
          x: i * bw,
          y: padT,
          width: bw,
          height: innerH,
          fill: 'transparent',
          style: { pointerEvents: 'all', cursor: 'crosshair' },
          onMouseEnter: (e: any) => setHover({ i, mx: e.clientX, my: e.clientY }),
        }),
      );
    });
    const rows: any[] = [];
    if (hovered) {
      const line = (k: string, v: string): any =>
        h(
          'div',
          { key: k, className: 'tm-tiprow' },
          h('span', { className: 'tm-tip-k' }, k),
          h('span', { className: 'tm-tip-v' }, v),
        );
      rows.push(line('在线', fmtDur(hovered.ms)));
      rows.push(line('对话进行中', fmtDur(hovered.turnMs)));
      rows.push(line('空档', fmtDur(hovered.idleMs)));
      rows.push(line('模型 + 工具', fmtDur(hovered.busyMs)));
      rows.push(line('活动段数', String(hovered.seg)));
      rows.push(line('会话数', String(hovered.sessions)));
      rows.push(line('Token', fmtTok(hovered.tokens)));
    }
    const pop =
      hover !== null && hovered
        ? portal(
            h(
              'div',
              { className: 'tm-tipfixed', style: tipPos(hover.mx, hover.my, 200, 40 + rows.length * 18) },
              h('div', { style: { fontWeight: 600, marginBottom: 3 } }, cnDate(hovered.d)),
              rows,
            ),
          )
        : null;
    return h(
      'div',
      { className: 'tm-svgwrap' },
      h(
        'div',
        { style: { cursor: 'crosshair' } },
        h(
          'svg',
          {
            viewBox: '0 0 ' + W + ' ' + H,
            width: '100%',
            height: H,
            role: 'img',
            // 下标由每根柱的透明命中区给出（DOM 决定，不做坐标换算 → 不会因留边/缩放偏移）；
            // 容器这里只负责让浮层跟随鼠标。
            onMouseMove: (e: any) => {
              setHover((prev: any) =>
                prev === null || (prev.mx === e.clientX && prev.my === e.clientY)
                  ? prev
                  : { i: prev.i, mx: e.clientX, my: e.clientY },
              );
            },
            onMouseLeave: () => setHover(null),
          },
          children,
        ),
      ),
      pop,
    );
  }

  /** 三口径对照条：一眼看出「你 + DSH / DSH 的钟 / DSH 的活」 */
  function ProportionBars(props: { view: OnlineView }): any {
    const v = props.view;
    const tip = useTip();
    const max = Math.max(v.total, v.busy, 1);
    const bar = (label: string, ms: number, color: string, note: string, faint?: boolean): any =>
      h(
        'div',
        { key: label, className: 'tm-bar', style: { padding: '7px 0' } },
        h(
          'div',
          { style: { flex: '1 1 118px', minWidth: 118 } },
          h('div', { className: 'tm-title' }, label),
          h('div', { className: 'tm-desc' }, note),
        ),
        h(
          'div',
          Object.assign(
            { className: 'tm-bartrack' },
            tip.bind({
              k: label,
              title: label,
              rows: [
                ['时长', fmtDur(ms)],
                ['占在线', v.total > 0 ? Math.round((ms / v.total) * 100) + '%' : '—'],
              ],
              text: note,
            }),
          ),
          h('span', {
            className: 'tm-barfill',
            style: {
              width: Math.round((ms / max) * 100) + '%',
              background: color,
              opacity: faint ? 0.42 : 1,
            },
          }),
        ),
        h(
          'div',
          { className: 'tm-mono', style: { fontSize: 12.5, minWidth: 62, textAlign: 'right' } },
          fmtDur(ms),
        ),
      );
    return h(
      'div',
      null,
      bar('在线（你 + DSH）', v.total, C_MAIN, '含你自己的追问/阅读空档', true),
      bar('对话进行中（DSH 的钟）', v.turn, C_MAIN, 'turn 区间并集，墙钟去重'),
      bar('模型 + 工具（DSH 的活）', v.busy, C_BUSY, '并行会话相加，可高于墙钟', true),
    );
  }

  /** 数据准确性表：明确哪些精确、哪些估算 */
  function Accuracy(props: { view: OnlineView; snap: StatsSnapshot | null }): any {
    const tip = useTip();
    const v = props.view;
    const snap = props.snap;
    const windowTokens = v.series.reduce((a, b) => a + b.tokens, 0);
    const row = (name: string, val: string, kind: 'exact' | 'estimate' | 'bound', note: string): any =>
      h(
        'tr',
        { key: name },
        h('td', { style: { padding: '6px 8px 6px 0', whiteSpace: 'nowrap' } }, name),
        h('td', { style: { padding: '6px 8px 6px 0', whiteSpace: 'nowrap' } }, h(Acc, { kind })),
        h(
          'td',
          { style: { padding: '6px 8px 6px 0', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' } },
          val,
        ),
        h('td', { style: { padding: '6px 0', color: 'var(--dsw-alias-label-secondary)' } }, note),
      );
    return h(
      'div',
      { className: 'tm-card' },
      h('div', { className: 'tm-title' }, '口径与准确性'),
      h(ProportionBars, { view: v }),
      h(
        'div',
        { style: { overflowX: 'auto' } },
        h(
          'table',
          { style: { width: '100%', borderCollapse: 'collapse', fontSize: 12, marginTop: 4 } },
          h(
            'thead',
            null,
            h(
              'tr',
              { style: { color: 'var(--dsw-alias-label-caption)', textAlign: 'left' } },
              h('th', { style: { padding: '0 8px 4px 0', fontWeight: 500 } }, '指标'),
              h('th', { style: { padding: '0 8px 4px 0', fontWeight: 500 } }, '性质'),
              h('th', { style: { padding: '0 8px 4px 0', fontWeight: 500 } }, '当前值'),
              h('th', { style: { padding: '0 0 4px', fontWeight: 500 } }, '说明'),
            ),
          ),
          h(
            'tbody',
            null,
            row(
              '在线时长',
              fmtDur(v.total),
              'bound',
              '日志只在有事件时打点：窗口开着但没事件的时间不可见，所以是下界；阈值（当前 ' +
                v.gap +
                ' 分钟）直接决定结果',
            ),
            row(
              '对话进行中',
              fmtDur(v.turn),
              'estimate',
              'turn/start→turn/end 并集（墙钟去重）；含少量等你操作的时间（实测审批等待约 0.7h）',
            ),
            row(
              '模型生成',
              fmtDur(v.llm),
              'exact',
              'step/start→assistant/message；已与 DSH 自带 sessionStats 投影逐会话对账一致',
            ),
            row('工具执行', fmtDur(v.tool), 'exact', 'tool/call→tool/result 按 callId 配对'),
            row(
              '引擎合计',
              fmtDur(v.busy),
              'exact',
              '上两者相加；同时开多个会话/子代理会重复计，所以可能大于墙钟',
            ),
            row('活跃天数', String(v.activeDays), 'exact', '有事件或有用量的自然日数'),
            row(
              'Token 用量',
              fmtTok(windowTokens),
              'exact',
              '当前区间的上报值；只统计供应商给了 usage 的步骤，未上报的算不到，因此略低',
            ),
            row(
              '会话口径',
              snap ? (snap.sessionOutcomes?.['usage'] ?? 0) + ' / ' + snap.total : String(v.activeDays),
              'exact',
              snap
                ? '共 ' +
                    snap.total +
                    ' 个会话：' +
                    Object.entries(snap.sessionOutcomes ?? {})
                      .map(([k, n]) => (OUTCOME_LABELS[k] ?? k) + ' ' + n + ' 个')
                      .join(' · ')
                : '会话列表来自 sessionQuery',
            ),
          ),
        ),
      ),
      snap
        ? h(
            'div',
            { className: 'tm-cacheRow' },
            h('span', { className: 'tm-muted' }, '数据源'),
            h(
              'span',
              null,
              snap.scanned + '/' + snap.total + ' 个会话已扫描' + (snap.partial ? '（后台补扫中）' : ''),
            ),
            (snap.directReads ?? 0) > 0
              ? h(
                  'span',
                  Object.assign(
                    {},
                    tip.bind({
                      k: 'direct',
                      title: '直读日志',
                      rows: [['会话数', String(snap.directReads)]],
                      text: '非 live 会话默认直接读日志文件（逐帧解压 + 切掉 fork 继承前缀），比官方 reader 快一到两个数量级；live 会话仍走官方 reader。',
                    }),
                  ),
                  '直读 ' + snap.directReads + ' 个',
                )
              : null,
            snap.errors > 0
              ? h(
                  'span',
                  Object.assign(
                    {},
                    tip.bind({
                      k: 'errors',
                      title: '扫描失败 ' + snap.errors + ' 个',
                      text:
                        (snap.errorSamples ?? []).length > 0
                          ? (snap.errorSamples ?? []).map((x) => x.id + '：' + x.message).join('；')
                          : '没有可用的原因样本',
                    }),
                  ),
                  '扫描失败 ' + snap.errors + ' 个',
                )
              : null,
            h('span', null, '缓存 ' + snap.storage),
            h('span', null, 'fork/续接的继承前缀不重复计时'),
          )
        : null,
    );
  }

  /** 悬浮提示的一行 */
  function tipLine(k: string, v: string, key?: string): any {
    return h(
      'div',
      { key: key ?? k, className: 'tm-tiprow' },
      h('span', { className: 'tm-tip-k' }, k),
      h('span', { className: 'tm-tip-v' }, v),
    );
  }

  /**
   * 每日在线排行：**柱状图 + 列表合体** —— 每行既是名次也是一根横向堆叠条
   * （实色 = 对话进行中，浅色 = 空档，长度按当日在线时长占榜首的比例）。
   * 鼠标悬浮整行弹出该日明细（在线 / 对话中 / 空档 / 模型+工具 / 段数 / 会话 / Token）。
   */
  function RankingList(props: { ranked: SeriesItem[]; gap: number }): any {
    const [showAll, setShowAll] = React.useState(false);
    const [hover, setHover] = React.useState(null as { i: number; mx: number; my: number } | null);
    const ranked = props.ranked;
    if (ranked.length === 0) return h('div', { className: 'tm-empty' }, '暂无数据');
    const items = showAll ? ranked : ranked.slice(0, 8);
    let max = 1;
    for (const it of items) if (it.ms > max) max = it.ms;
    const rows = items.map((it, i) => {
      const wTurn = Math.round((it.turnMs / max) * 100);
      const wIdle = Math.round((it.idleMs / max) * 100);
      return h(
        'div',
        {
          key: it.d,
          className: 'tm-rankRow' + (i < 3 ? ' top3' : ''),
          onMouseMove: (e: any) => setHover({ i, mx: e.clientX, my: e.clientY }),
          onMouseLeave: () => setHover(null),
        },
        h('span', { className: 'tm-rankNo' }, String(i + 1)),
        h(
          'div',
          { style: { minWidth: 0 } },
          h('div', { className: 'tm-rankDate' }, dispDay(it.d) + ' ' + weekdayOf(it.d)),
          h(
            'div',
            { className: 'tm-desc', style: { margin: 0, fontSize: 11, whiteSpace: 'nowrap' } },
            it.sessions + ' 会话 · 段 ' + it.seg,
          ),
        ),
        h(
          'div',
          { className: 'tm-rankBarTrack' },
          h('span', { className: 'tm-rankFillTurn', style: { width: wTurn + '%' } }),
          h('span', { className: 'tm-rankFillIdle', style: { width: wIdle + '%' } }),
        ),
        h('span', { className: 'tm-rankVal' }, fmtDur(it.ms)),
        h('span', { className: 'tm-rankTok' }, fmtTok(it.tokens)),
      );
    });
    const hovered = hover !== null ? items[hover.i] : undefined;
    const pop =
      hover !== null && hovered
        ? portal(
            h(
              'div',
              { className: 'tm-tipfixed', style: tipPos(hover.mx, hover.my, 220, 190) },
              h(
                'div',
                { style: { fontWeight: 600, marginBottom: 3 } },
                cnDate(hovered.d) + '（第 ' + (hover.i + 1) + ' 名）',
              ),
              tipLine('在线', fmtDur(hovered.ms), 'a'),
              tipLine('对话进行中', fmtDur(hovered.turnMs), 'b'),
              tipLine('空档', fmtDur(hovered.idleMs), 'c'),
              tipLine('模型 + 工具', fmtDur(hovered.busyMs), 'd'),
              tipLine('活动段数', String(hovered.seg), 'e'),
              tipLine('会话数', String(hovered.sessions), 'f'),
              tipLine('Token', fmtTok(hovered.tokens), 'g'),
            ),
          )
        : null;
    return h(
      'div',
      null,
      h(
        'div',
        { className: 'tm-rankHead' },
        h('span', null, '#'),
        h('span', null, '日期'),
        h('span', null, '在线构成 · 实色 对话中 / 浅色 空档'),
        h('span', { style: { textAlign: 'right' } }, '在线'),
        h('span', { style: { textAlign: 'right' } }, 'Token'),
      ),
      rows,
      pop,
      ranked.length > 8
        ? h(
            'div',
            { className: 'tm-toolbar', style: { margin: '8px 0 0', justifyContent: 'center' } },
            h(
              'button',
              {
                type: 'button',
                className: 'tm-mini',
                onClick: () => setShowAll((v: boolean) => !v),
              },
              showAll ? '只看前 8 名' : '展开全部 ' + ranked.length + ' 天',
            ),
          )
        : null,
    );
  }

  function Body(props: {
    data: StatsSnapshot | null;
    err: string;
    gap: number;
    rangeDays: number;
    onGap: (g: number) => void;
    onRange: (d: number) => void;
    onReload: () => void;
  }): any {
    const tip = useTip();
    const data = props.data;
    const online = data && data.ready && data.online ? data.online : null;
    if (!online) {
      return h(
        'div',
        { className: 'tm-card' },
        h('div', { className: 'tm-title' }, '在线时长'),
        h(
          'div',
          { className: 'tm-desc' },
          props.err
            ? '读取失败：' + props.err
            : data && data.ready
              ? '当前 Host 未提供在线时长数据（插件需重启以加载新版 Host 半）。'
              : '统计尚未就绪，正在扫描会话日志…',
        ),
        h(
          'div',
          { className: 'tm-toolbar', style: { marginTop: 8 } },
          h('button', { type: 'button', className: 'tm-mini', onClick: props.onReload }, '重试'),
        ),
      );
    }
    const view = deriveOnlineView(online, props.gap, props.rangeDays);
    const gapSeg = h(Seg, {
      items: GAP_LABELS.filter(([v]) => online.gaps.indexOf(v) >= 0),
      value: online.gaps.indexOf(props.gap) >= 0 ? props.gap : (online.gaps[0] as number),
      onPick: props.onGap,
    });
    /** 两个档位组各自带标题 + 说明（此前只有 tooltip，看不出来是干什么的） */
    const segRow = (label: string, hint: string, control: any, rows?: Array<[string, string]>): any =>
      h(
        'div',
        { className: 'tm-segField' },
        h(
          'div',
          Object.assign(
            { className: 'tm-segFieldKey' },
            tip.bind({ k: label, title: label, text: hint, ...(rows ? { rows } : {}) }),
          ),
          label,
        ),
        h('div', { className: 'tm-segFieldCtl' }, control),
        h('div', { className: 'tm-segFieldHint' }, hint),
      );
    return h(
      'div',
      null,
      h(TipHost, null),
      h(
        'div',
        { className: 'tm-card', style: { padding: '10px 12px' } },
        segRow(
          '空闲阈值',
          '相邻事件间隔超过它就算「离开」。它是口径不是精度：调大在线时长变多（60 分钟档比 1 分钟档多约 90h）。',
          gapSeg,
          [
            ['当前', props.gap + ' 分钟'],
            ['活跃段数', String(view.segments)],
          ],
        ),
        segRow(
          '时间范围',
          '「每日在线」图表与下方「在线最多的日子」明细的统计窗口；上面的累计/日均始终按全部活跃日计算。',
          h(Seg, { items: RANGE_LABELS, value: props.rangeDays, onPick: props.onRange }),
          [['当前区间', props.rangeDays === 0 ? '全部活跃日' : '近 ' + props.rangeDays + ' 天']],
        ),
        h(
          'div',
          { className: 'tm-toolbar', style: { margin: '2px 0 0' } },
          h('span', { className: 'tm-hint' }, online.activeDays + ' 个活跃日 · 默认按全部显示'),
        ),
      ),
      h(
        'div',
        { className: 'tm-statGrid' },
        h(Stat, {
          label: '今日在线',
          value: fmtDurCn(view.today),
          tint: true,
          sub: '截至此刻',
          acc: 'bound',
          tip: {
            k: 'today',
            title: '今日在线 · 下界',
            text: '有事件覆盖、且空档 ≤ ' + view.gap + ' 分钟的时间。日志只在有事件时打点，所以是下界。',
          },
        }),
        h(Stat, {
          label: '累计在线',
          value: fmtDurCn(view.total),
          sub:
            (online.firstDay ? dispDay(online.firstDay) + ' 起' : '') +
            ' · 共 ' +
            view.activeDays +
            ' 个活跃日',
          acc: 'bound',
          tip: {
            k: 'total',
            title: '累计在线 · 下界',
            rows: [
              ['活跃日', String(view.activeDays)],
              ['日均', fmtDur(view.avg)],
              ['当前口径', view.gap + ' 分钟'],
            ],
            text: '口径依赖阈值：60 分钟档比 1 分钟档约多 90 小时。',
          },
        }),
        h(Stat, {
          label: '活跃日均',
          value: fmtDurCn(view.avg),
          sub: '仅按有活动的日子平均',
          tip: {
            k: 'avg',
            title: '活跃日均',
            rows: [
              ['累计', fmtDur(view.total)],
              ['活跃日', String(view.activeDays)],
            ],
            text: '只按有活动的日子平均，不含空白天。',
          },
        }),
        h(Stat, {
          label: '对话进行中',
          value: fmtDurCn(view.turn),
          sub: '占在线 ' + (view.total > 0 ? Math.round((view.turn / view.total) * 100) : 0) + '%',
          acc: 'estimate',
          tip: {
            k: 'turn',
            title: '对话进行中 · 估算',
            rows: [
              ['时长', fmtDur(view.turn)],
              ['占在线', (view.total > 0 ? Math.round((view.turn / view.total) * 100) : 0) + '%'],
            ],
            text: 'turn/start→turn/end 的并集（墙钟去重）：DSH 在为你干活的钟，含少量等你操作的时间。',
          },
        }),
      ),
      h(
        'div',
        { className: 'tm-statGrid' },
        h(Stat, {
          label: '模型生成',
          value: fmtDurCn(view.llm),
          sub: '已与官方投影对账',
          acc: 'exact',
          tip: {
            k: 'llm',
            title: '模型生成 · 精确',
            text: 'step/start→assistant/message；已与 DSH 自带 sessionStats 投影逐会话对账（126/126 一致）。',
          },
        }),
        h(Stat, {
          label: '工具执行',
          value: fmtDurCn(view.tool),
          sub: 'call→result',
          acc: 'exact',
          tip: {
            k: 'tool',
            title: '工具执行 · 精确',
            text: 'tool/call→tool/result 按 callId 配对；turn/end 时丢弃未落地的调用。',
          },
        }),
        h(Stat, {
          label: '引擎合计',
          value: fmtDurCn(view.busy),
          sub: '并行相加，可高于墙钟',
          acc: 'exact',
          tip: {
            k: 'busy',
            title: '引擎合计 · 精确',
            rows: [
              ['模型生成', fmtDur(view.llm)],
              ['工具执行', fmtDur(view.tool)],
            ],
            text: '两者相加；同时开多个会话/子代理会重复计，所以可能大于墙钟的「对话进行中」。',
          },
        }),
      ),
      h(
        'div',
        { className: 'tm-card' },
        h(
          'div',
          { className: 'tm-toolbar' },
          h('span', { className: 'tm-title' }, '每日在线'),
          h(
            'span',
            { className: 'tm-hint' },
            view.peak ? '峰值 ' + cnDate(view.peak.d) + ' ' + fmtDur(view.peak.ms) : '',
          ),
        ),
        h(Chart, { items: view.series, gap: view.gap }),
        h(Legend, null),
      ),
      h(Accuracy, { view, snap: data }),
      h(
        'div',
        { className: 'tm-card' },
        h(
          'div',
          { className: 'tm-toolbar', style: { margin: '0 0 2px' } },
          h('span', { className: 'tm-title', style: { margin: 0 } }, '每日在线排行'),
          h(
            'span',
            { className: 'tm-hint' },
            '当前区间 ' + view.ranked.length + ' 个活跃日 · 按在线时长排序 · 鼠标悬浮看当日明细',
          ),
        ),
        h(RankingList, { ranked: view.ranked, gap: view.gap }),
      ),
    );
  }

  /** 右栏「在线时长」面板 */
  function OnlineRightPane(): any {
    const [gapState, setGapState] = React.useState(null as number | null);
    const [rangeDays, setRangeDays] = React.useState(0); // 默认「全部」
    const { snap, err, reload } = useSnapshot();
    const online = snap && snap.ready && snap.online ? snap.online : null;
    const gap = gapState !== null ? gapState : online ? online.defaultGapMin : 5;
    const onGap = React.useCallback(
      (g: number) => {
        setGapState(g);
        void saveConfig({ onlineGapMin: g }).catch(() => {});
        try {
          window.dispatchEvent(new Event('tm-prefs-changed'));
        } catch {
          /* ignore */
        }
      },
      [setGapState],
    );
    return h(Body, {
      data: snap,
      err,
      gap,
      rangeDays,
      onGap,
      onRange: setRangeDays,
      onReload: reload,
    });
  }

  return { OnlineRightPane };
}
