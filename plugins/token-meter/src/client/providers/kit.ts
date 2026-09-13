/**
 * @dshp/token-meter —— provider UI 通用组件库（kit）
 *
 * 设计意图（对应「每个 provider 都能 return 自己的数据，client 也有一套属于它
 * 自己的 UI」）：
 *
 *   Host 侧：适配器 return 自己的数据（ProviderResult：windows/billing/view/extra…）
 *   Client 侧：`providers/ui/<type>.ts` 是**该供应商专属的完整 UI 实现**，
 *              自己决定怎么排版；需要通用零件时从本 kit 取，不重复造。
 *
 * 因此本文件是「零件仓库」而非「渲染框架」——它不认识任何供应商，只提供可复用
 * 的展示组件与格式化工具：
 *
 *   RollingBar   滚动刷新进度条（label + 进度 + 占比 + 剩余时长）★最常用
 *   WindowGroup  多条窗口成组（自动附「最高占用 / 最早重置」汇总行）
 *   BalanceBlock 余额主数字块（币种/可用状态/赠送充值拆分/多币种/低余额告警）
 *   MetricRows   键值指标行集合
 *   SplitBar     分段占比条（含图例与百分比）
 *   NoteLine     提示条（info/warn/bad 三色）
 *   MiniChart    趋势折线（纯 SVG）
 *   SectionTitle 区块小标题
 *   Chips        徽标组（计划/状态/来源等小标签）
 *   ErrorCard    失败卡（结构化结论 + 排查步骤 + 原始信息）
 *
 * 工具函数 num/fmt/fmtLeft/curSymbol/remainOf/timeAgo 一并透出，保证专属 UI 与
 * 兜底渲染的格式化口径完全一致。
 */
import { createErrorBox, fallbackErrorInfo } from '../ErrorBox.js';
import type { AnyReact, ErrorInfo, QuotaBilling, QuotaWindow, VendorSnapshot } from '../types.js';

const X_PAL = ['#4c7ef3', '#2fb261', '#f5a623', '#e05e4e', '#9a6ef1', '#25b8c4'];

/** 渲染上下文：快照 + 当前时间（窗口倒计时用）+ 供应商身份。 */
export interface RenderCtx {
  snap: VendorSnapshot;
  now: number;
  type: string;
  vendorName: string;
}

/** kit 构造依赖（由 QuotaSection 注入，避免循环依赖与重复实现）。 */
export interface KitDeps {
  num: (v: unknown, d: number) => number;
  fmt: (n: unknown) => string;
  fmtLeft: (sec: number) => string;
  curSymbol: (cur: string) => string;
  remainOf: (w: { resetInSec: number }, snap: VendorSnapshot, nowMs: number) => number;
  /** 相对时间（如「3 分钟前」） */
  timeAgo: (iso: string) => string;
  /** 进度等级 → CSS 后缀（ok/warn/bad/over） */
  levelOf: (pct: number) => string;
  /** 等级说明（title 提示用） */
  levelTip: (lvl: string) => string;
  /** 失败卡展开态（跨卡片共享） */
  errOpen: () => boolean;
  toggleErr: () => void;
  /** 可选：跳到设置页 */
  openSettings?: () => void;
}

export interface ProviderUIKit {
  /** React.createElement 透出（专属 UI 的书写便利） */
  h: AnyReact;
  /** React 本体透出（需要 hooks 的专属 UI 用） */
  React: AnyReact;

  RollingBar: (props: { label: string; pct: number; left?: string; barKey?: string }) => any;
  WindowGroup: (props: {
    windows?: QuotaWindow[];
    snap: VendorSnapshot;
    now: number;
    title?: string;
    /** 省略「最高占用 / 最早重置」汇总行（每行已各自标了重置时长时，该行是冗余） */
    noSummary?: boolean;
  }) => any;
  BalanceBlock: (props: { billing?: QuotaBilling | null; title?: string; compact?: boolean }) => any;
  MetricRows: (props: { items?: Array<{ label: string; value: string }>; title?: string }) => any;
  /** 两列紧凑指标网格：条目多时把高度减半 */
  MetricGrid: (props: {
    items?: Array<{ label: string; value: string }>;
    title?: string;
    /** 每列占比合并显示（如「输入 5905万 · 输出 27万」压成一行） */
    mergePairs?: boolean;
  }) => any;
  SplitBar: (props: {
    segments?: Array<{ label: string; value: number; color?: string }>;
    title?: string;
  }) => any;
  NoteLine: (props: { text?: unknown; tone?: 'info' | 'warn' | 'bad' }) => any;
  MiniChart: (props: { chart?: { title?: string; labels?: string[]; values?: number[] } }) => any;
  SectionTitle: (props: { text?: string }) => any;
  Chips: (props: { chips?: Array<{ text: string; tone?: 'ok' | 'warn' | 'bad' | 'info' }> }) => any;
  ErrorCard: (props: {
    info?: ErrorInfo | null;
    msg?: string;
    meta?: string;
    onRetry?: () => void;
    compact?: boolean;
  }) => any;

  num: KitDeps['num'];
  fmt: KitDeps['fmt'];
  fmtLeft: KitDeps['fmtLeft'];
  curSymbol: KitDeps['curSymbol'];
  remainOf: KitDeps['remainOf'];
  timeAgo: KitDeps['timeAgo'];
  levelOf: KitDeps['levelOf'];
}

export function createProviderKit(React: AnyReact, deps: KitDeps): ProviderUIKit {
  const h = React.createElement;
  const { num, fmt, fmtLeft, curSymbol, remainOf, timeAgo, levelOf, levelTip } = deps;

  /** 区块小标题 */
  function SectionTitle(props: { text?: string }): any {
    return props.text ? h('div', { className: 'tm-xtitle' }, props.text) : null;
  }

  /** 上游窗口状态 → 中文短标签（非 ok 才显示，如 opencode 的 rate-limited）。 */
  function statusText(st: string): string {
    const k = st.toLowerCase().replace(/[\s_-]/g, '');
    const MAP: Record<string, string> = {
      ratelimited: '已限流',
      throttled: '已限流',
      exceeded: '已超限',
      overlimit: '已超限',
      disabled: '已停用',
      paused: '已暂停',
      expired: '已过期',
    };
    return MAP[k] || st;
  }

  /** ★ 滚动刷新进度条：一条 = 一个窗口/额度周期 */
  function RollingBar(props: {
    label: string;
    pct: number;
    left?: string;
    barKey?: string;
    /** 上游窗口状态；非 ok 时尾部加状态标签（限流时 pct 可能还没到 100） */
    status?: string;
  }): any {
    const pct = Number(props.pct) || 0;
    const lvl = levelOf(pct);
    const cls = lvl === 'ok' ? '' : ' ' + lvl;
    const bad = props.status && props.status !== 'ok' ? props.status : '';
    const barTitle = levelTip(lvl) + '（' + Math.round(pct) + '%）' + (bad ? ' · 上游状态：' + bad : '');
    return h(
      'div',
      { className: 'tm-qrow', key: props.barKey },
      h('span', { className: 'tm-qlabel' }, props.label),
      h(
        'div',
        { className: 'tm-qbar', title: barTitle },
        h('span', { className: 'tm-qfill' + cls, style: { width: Math.min(100, pct) + '%' } }),
      ),
      h('span', { className: 'tm-qpct' + cls }, Math.round(pct) + '%'),
      bad ? h('span', { className: 'tm-qstatus', title: '上游窗口状态：' + bad }, statusText(bad)) : null,
      props.left ? h('span', { className: 'tm-qleft' }, props.left) : null,
    );
  }

  /** 多条窗口成组 + 汇总行（最高占用 / 最早重置） */
  function WindowGroup(props: {
    windows?: QuotaWindow[];
    snap: VendorSnapshot;
    now: number;
    title?: string;
    noSummary?: boolean;
  }): any {
    const wins = (Array.isArray(props.windows) ? props.windows : []).filter(
      (w) => w && w.label !== undefined,
    );
    if (!wins.length) return null;
    const kids: any[] = [];
    if (props.title) kids.push(h(SectionTitle, { key: 't', text: props.title }));
    wins.forEach((w, i) => {
      // resetInSec<=0 = 该窗口没有重置时间（本地账本、周期未知）→ 不显示倒计时，
      // 否则会渲染成误导性的「0 秒」
      const left = w.resetInSec > 0 ? fmtLeft(remainOf(w, props.snap, props.now)) : undefined;
      kids.push(
        h(RollingBar, {
          key: w.key || 'w' + i,
          label: w.label,
          pct: w.pct,
          ...(left ? { left } : {}),
          ...(w.status ? { status: w.status } : {}),
        }),
      );
    });
    if (wins.length > 1 && !props.noSummary) {
      const worst = wins.reduce((m, w) => (w.pct > m.pct ? w : m), wins[0] as QuotaWindow);
      const minRem = wins.reduce((m, w) => Math.min(m, remainOf(w, props.snap, props.now)), Infinity);
      kids.push(
        h(
          'div',
          { key: 'sum', className: 'tm-payg-sub' },
          '最高占用 ' + worst.label + ' ' + Math.round(worst.pct) + '% · 最早重置' + fmtLeft(minRem),
        ),
      );
    }
    return h('div', { className: 'tm-body' }, kids);
  }

  /** 余额主数字块（payg 语义的通用展示） */
  function BalanceBlock(props: { billing?: QuotaBilling | null; title?: string; compact?: boolean }): any {
    const b = (props.billing || {}) as Record<string, unknown>;
    if (!Object.keys(b).length) return null;
    const amt = num(b['balance'], 0);
    const cur = String(b['currency'] || 'CNY');
    const granted = b['granted'] !== undefined && b['granted'] !== null ? num(b['granted'], 0) : null;
    const topped = b['toppedUp'] !== undefined && b['toppedUp'] !== null ? num(b['toppedUp'], 0) : null;
    const avail = b['isAvailable'];
    // 单一判据：余额 ≤ 0 也算「不可用」—— 与下面那条红字余额告警用的是同一个 empty。
    // 上游多数 provider 在余额非正时只回 null（它们不肯替上游断言「不可用」，见
    // host/providers/*.ts 的 `isAvailable: balance > 0 ? true : null`），旧代码只读
    // isAvailable，于是同一张卡会出现「状态未知」顶着「余额不足」红字的自相矛盾。
    const empty = amt <= 0 || avail === false;
    const availCls = empty ? 'bad' : avail === true ? 'ok' : 'unknown';
    const availTxt = availCls === 'bad' ? '不足' : availCls === 'ok' ? '可用' : '状态未知';
    const availTip =
      '可用性徽标：\n' +
      '· 可用 —— 上游明确说可用\n' +
      '· 不足 —— 上游明确报不足，或余额已 ≤ 0（与下方余额告警同一个判据）\n' +
      '· 状态未知 —— 上游没有给出可用性判断，这里只反映余额数字本身（例如手动账本）';
    const warnLine =
      b['lowWarn'] !== undefined && b['lowWarn'] !== null && b['lowWarn'] !== ''
        ? num(b['lowWarn'], 0)
        : null;
    const infos = Array.isArray(b['infos']) ? (b['infos'] as Array<Record<string, unknown>>) : [];
    const kids: any[] = [];
    if (props.title) kids.push(h(SectionTitle, { key: 't', text: props.title }));
    kids.push(
      h(
        'div',
        { key: 'top', className: 'tm-payg-top' },
        h(
          'div',
          null,
          h('span', { className: 'tm-payg-cur' }, curSymbol(cur) + cur),
          h('span', { className: 'tm-payg-amt' + (amt < 0 ? ' neg' : '') }, fmt(amt)),
        ),
        h('span', { className: 'tm-avail ' + availCls, title: availTip }, availTxt),
      ),
    );
    const parts: string[] = [];
    if (granted !== null && granted > 0) parts.push('赠送 ' + fmt(granted));
    if (topped !== null && topped > 0) parts.push('充值 ' + fmt(topped));
    if (warnLine !== null) parts.push('预警线 ' + fmt(warnLine));
    if (parts.length) kids.push(h('div', { key: 'parts', className: 'tm-payg-sub' }, parts.join(' · ')));
    if (infos.length > 1)
      kids.push(
        h(
          'div',
          { key: 'infos', className: 'tm-infos' },
          infos.map((x, i) =>
            h(
              'div',
              { key: String(x['currency'] || i), className: 'tm-inforow' },
              h('span', null, String(x['currency'] || '?')),
              h('b', null, fmt(x['total'])),
            ),
          ),
        ),
      );
    // empty 已在上面算好（徽标与这条告警共用同一个判据，两处不会再打架）
    const low = !empty && warnLine !== null && amt <= warnLine;
    if (empty)
      kids.push(
        h('div', { key: 'warn', className: 'tm-warn bad' }, '余额不足，API 调用可能被拒绝，请及时充值。'),
      );
    else if (low)
      kids.push(
        h(
          'div',
          { key: 'warn', className: 'tm-warn' },
          '余额低于预警线 ' + fmt(warnLine) + '，建议及时充值。',
        ),
      );
    return h('div', { className: 'tm-payg' + (props.compact ? ' tm-payg-compact' : '') }, kids);
  }

  /** 键值指标行 */
  function MetricRows(props: { items?: Array<{ label: string; value: string }>; title?: string }): any {
    const items = (Array.isArray(props.items) ? props.items : []).filter((it) => it && it.label);
    if (!items.length) return null;
    return h(
      'div',
      { className: 'tm-xstats' },
      props.title ? h(SectionTitle, { key: 't', text: props.title }) : null,
      items.map((it, i) =>
        h(
          'div',
          { key: 'r' + i, className: 'tm-xrow' },
          h('span', null, String(it.label)),
          h('b', null, String(it.value)),
        ),
      ),
    );
  }

  /**
   * 两列紧凑指标网格：单列 8 行会占掉卡片近半高度，两列直接减半。
   * mergePairs=true 时把相邻两项合成一格（「输入 5905万 · 输出 27万」），进一步省行。
   */
  function MetricGrid(props: {
    items?: Array<{ label: string; value: string }>;
    title?: string;
    mergePairs?: boolean;
  }): any {
    const items = (Array.isArray(props.items) ? props.items : []).filter((it) => it && it.label);
    if (!items.length) return null;
    const cells: Array<{ label: string; value: string }> = [];
    if (props.mergePairs) {
      for (let i = 0; i < items.length; i += 2) {
        const a = items[i] as { label: string; value: string };
        const b = items[i + 1];
        if (b) cells.push({ label: a.label + ' / ' + b.label, value: a.value + ' · ' + b.value });
        else cells.push(a);
      }
    } else {
      for (const it of items) cells.push(it);
    }
    return h(
      'div',
      { className: 'tm-xgrid' },
      props.title ? h(SectionTitle, { key: 't', text: props.title }) : null,
      h(
        'div',
        { key: 'g', className: 'tm-xgridBody' },
        cells.map((c, i) =>
          h(
            'div',
            { key: 'c' + i, className: 'tm-xcell', title: c.label + '：' + c.value },
            h('span', { className: 'tm-xcellLabel' }, c.label),
            h('b', { className: 'tm-xcellValue' }, c.value),
          ),
        ),
      ),
    );
  }

  /** 分段占比条 */
  function SplitBar(props: {
    segments?: Array<{ label: string; value: number; color?: string }>;
    title?: string;
  }): any {
    const segs = (Array.isArray(props.segments) ? props.segments : [])
      .filter((sg) => sg && isFinite(Number(sg.value)) && Number(sg.value) > 0)
      .slice(0, 8);
    if (!segs.length) return null;
    const sum = segs.reduce((acc, x) => acc + Number(x.value), 0);
    const color = (i: number): string => segs[i]?.color || (X_PAL[i % X_PAL.length] as string);
    return h(
      'div',
      null,
      props.title ? h(SectionTitle, { key: 't', text: props.title }) : null,
      h(
        'div',
        { className: 'tm-xsplit' },
        segs.map((sg, i) =>
          h('span', { key: 'g' + i, style: { flexGrow: Number(sg.value), background: color(i) } }),
        ),
      ),
      h(
        'div',
        { className: 'tm-xstats' },
        segs.map((sg, i) =>
          h(
            'div',
            { key: 'l' + i, className: 'tm-xrow' },
            h(
              'span',
              null,
              h('span', { className: 'tm-xdot', style: { background: color(i) } }),
              String(sg.label || ''),
            ),
            h('b', null, String(Math.round((Number(sg.value) * 100) / sum)) + '%'),
          ),
        ),
      ),
    );
  }

  /** 提示条 */
  function NoteLine(props: { text?: unknown; tone?: 'info' | 'warn' | 'bad' }): any {
    const t = typeof props.text === 'string' ? props.text : '';
    if (!t) return null;
    const tone = props.tone === 'bad' ? 'tm-warn bad' : props.tone === 'warn' ? 'tm-warn' : 'tm-payg-sub';
    return h('div', { className: tone }, t);
  }

  /** 趋势折线（纯 SVG，无依赖） */
  function MiniChart(props: { chart?: { title?: string; labels?: string[]; values?: number[] } }): any {
    const ch = props.chart;
    const vals = (ch && Array.isArray(ch.values) ? ch.values : [])
      .map((v) => (isFinite(Number(v)) ? Number(v) : 0))
      .slice(-60);
    if (vals.length < 2) return null;
    const W = 248;
    const Hh = 52;
    const Pd = 3;
    const max = Math.max.apply(null, vals.concat([1]));
    const step = vals.length > 1 ? (W - Pd * 2) / (vals.length - 1) : 0;
    const pts = vals.map((v, i) => [Pd + step * i, Hh - Pd - (v / max) * (Hh - Pd * 2)]);
    const line = pts.map((p) => (p[0] as number).toFixed(1) + ',' + (p[1] as number).toFixed(1)).join(' ');
    const area = Pd + ',' + (Hh - Pd) + ' ' + line + ' ' + (W - Pd) + ',' + (Hh - Pd);
    return h(
      'div',
      { className: 'tm-xchart' },
      ch && ch.title ? h('div', { className: 'tm-xtitle' }, String(ch.title)) : null,
      h(
        'svg',
        {
          viewBox: '0 0 ' + W + ' ' + Hh,
          preserveAspectRatio: 'none',
          style: { display: 'block', width: '100%', height: Hh + 'px' },
        },
        h('polygon', {
          points: area,
          style: { fill: 'var(--dsw-alias-state-business-primary)', opacity: 0.15 },
        }),
        h('polyline', {
          points: line,
          fill: 'none',
          style: {
            stroke: 'var(--dsw-alias-state-business-primary)',
            strokeWidth: 1.6,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
          },
        }),
      ),
    );
  }

  /** 徽标组 */
  function Chips(props: { chips?: Array<{ text: string; tone?: 'ok' | 'warn' | 'bad' | 'info' }> }): any {
    const chips = (Array.isArray(props.chips) ? props.chips : []).filter((c) => c && c.text);
    if (!chips.length) return null;
    return h(
      'div',
      { className: 'tm-vchips' },
      chips.map((c, i) =>
        h('span', { key: i, className: 'tm-vchip' + (c.tone ? ' tm-vchip-' + c.tone : '') }, c.text),
      ),
    );
  }

  const ErrorCard = createErrorBox(React, {
    isOpen: deps.errOpen,
    toggle: deps.toggleErr,
    ...(deps.openSettings ? { openSettings: deps.openSettings } : {}),
  });

  return {
    h,
    React,
    RollingBar,
    WindowGroup,
    BalanceBlock,
    MetricRows,
    MetricGrid,
    SplitBar,
    NoteLine,
    MiniChart,
    SectionTitle,
    Chips,
    ErrorCard,
    num,
    fmt,
    fmtLeft,
    curSymbol,
    remainOf,
    timeAgo,
    levelOf,
  };
}

export { fallbackErrorInfo };
