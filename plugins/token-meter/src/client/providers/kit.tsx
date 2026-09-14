/**
 * @dshp/token-meter —— provider UI 通用组件库（kit）
 *
 * 设计意图（对应「每个 provider 都能 return 自己的数据，client 也有一套属于它
 * 自己的 UI」）：
 *
 *   Host 侧：适配器 return 自己的数据（ProviderResult：windows/billing/view/extra…）
 *   Client 侧：`providers/ui/<type>.tsx` 是**该供应商专属的完整 UI 实现**，
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
 *
 * 工厂形态说明：`createProviderKit(React, deps)` 的 **React 形参取消**（模块顶层 import），
 * 每个零件也各自成了具名导出；`deps` 是 QuotaSection 注入的**真实依赖**（数值格式化、
 * 错误展开态），仍以参数传入 —— 由 `createProviderKit(deps)` 收拢成
 * `ProviderUIKit` 命名空间，专属 UI / 声明式渲染按 `K.零件名` 取用。
 */
import type { ReactNode } from 'react';
import { createErrorBox, fallbackErrorInfo } from '../ErrorBox.js';
import styles from '../styles.module.css';
import type { ErrorInfo, QuotaBilling, QuotaWindow, VendorSnapshot } from '../types.js';

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

/** 组件与工具的命名空间（deps 绑定后由 `createProviderKit` 产出）。 */
export interface ProviderUIKit {
  RollingBar: (props: RollingBarProps) => ReactNode;
  WindowGroup: (props: WindowGroupProps) => ReactNode;
  BalanceBlock: (props: BalanceBlockProps) => ReactNode;
  MetricRows: (props: MetricRowsProps) => ReactNode;
  /** 两列紧凑指标网格：条目多时把高度减半 */
  MetricGrid: (props: MetricGridProps) => ReactNode;
  SplitBar: (props: SplitBarProps) => ReactNode;
  NoteLine: (props: NoteLineProps) => ReactNode;
  MiniChart: (props: MiniChartProps) => ReactNode;
  SectionTitle: (props: SectionTitleProps) => ReactNode;
  Chips: (props: ChipsProps) => ReactNode;
  ErrorCard: (props: {
    info?: ErrorInfo | null | undefined;
    msg?: string | undefined;
    meta?: string | undefined;
    onRetry?: (() => void) | undefined;
    compact?: boolean | undefined;
  }) => ReactNode;

  num: KitDeps['num'];
  fmt: KitDeps['fmt'];
  fmtLeft: KitDeps['fmtLeft'];
  curSymbol: KitDeps['curSymbol'];
  remainOf: KitDeps['remainOf'];
  timeAgo: KitDeps['timeAgo'];
  levelOf: KitDeps['levelOf'];
}

/** 分区小标题 props。 */
export interface SectionTitleProps {
  text?: string | undefined;
}

/** 滚动刷新进度条 props。 */
export interface RollingBarProps {
  label: string;
  pct: number;
  left?: string | undefined;
  barKey?: string | undefined;
  /** 上游窗口状态；非 ok 时尾部加状态标签（限流时 pct 可能还没到 100） */
  status?: string | undefined;
}

/** 多窗口成组 props。 */
export interface WindowGroupProps {
  windows?: QuotaWindow[] | undefined;
  snap: VendorSnapshot;
  now: number;
  title?: string | undefined;
  /** 省略「最高占用 / 最早重置」汇总行（每行已各自标了重置时长时，该行是冗余） */
  noSummary?: boolean | undefined;
}

/** 余额块 props。 */
export interface BalanceBlockProps {
  billing?: QuotaBilling | null | undefined;
  title?: string | undefined;
  compact?: boolean | undefined;
}

/** 键值指标行 props。 */
export interface MetricRowsProps {
  items?: Array<{ label: string; value: string }> | undefined;
  title?: string | undefined;
}

/** 两列紧凑指标网格 props。 */
export interface MetricGridProps {
  items?: Array<{ label: string; value: string }> | undefined;
  title?: string | undefined;
  /** 每列占比合并显示（如「输入 5905万 · 输出 27万」压成一行） */
  mergePairs?: boolean | undefined;
}

/** 分段占比条 props。 */
export interface SplitBarProps {
  segments?: Array<{ label: string; value: number; color?: string }> | undefined;
  title?: string | undefined;
}

/** 提示条 props。 */
export interface NoteLineProps {
  text?: unknown;
  tone?: 'info' | 'warn' | 'bad' | undefined;
}

/** 趋势折线 props。 */
export interface MiniChartProps {
  chart?: { title?: string; labels?: string[]; values?: number[] } | undefined;
}

/** 徽标组 props。 */
export interface ChipsProps {
  chips?: Array<{ text: string; tone?: 'ok' | 'warn' | 'bad' | 'info' }> | undefined;
}

/** 分区小标题。 */
export function SectionTitle(props: SectionTitleProps): ReactNode {
  return props.text ? <div className={styles.xtitle}>{props.text}</div> : null;
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
export function RollingBar(deps: KitDeps, props: RollingBarProps): ReactNode {
  const pct = Number(props.pct) || 0;
  const lvl = deps.levelOf(pct);
  const bad = props.status && props.status !== 'ok' ? props.status : '';
  const barTitle = deps.levelTip(lvl) + '（' + Math.round(pct) + '%）' + (bad ? ' · 上游状态：' + bad : '');
  return (
    <div className={styles.qrow} key={props.barKey}>
      <span className={styles.qlabel}>{props.label}</span>
      <div className={styles.qbar} title={barTitle}>
        <span
          className={styles.qfill + (lvl === 'ok' ? '' : ' ' + styles[lvl])}
          style={{ width: Math.min(100, pct) + '%' }}
        />
      </div>
      <span className={styles.qpct + (lvl === 'ok' ? '' : ' ' + styles[lvl])}>{Math.round(pct) + '%'}</span>
      {bad ? (
        <span className={styles.qstatus} title={'上游窗口状态：' + bad}>
          {statusText(bad)}
        </span>
      ) : null}
      {props.left ? <span className={styles.qleft}>{props.left}</span> : null}
    </div>
  );
}

/** 多条窗口成组 + 汇总行（最高占用 / 最早重置） */
export function WindowGroup(deps: KitDeps, props: WindowGroupProps): ReactNode {
  const wins = (Array.isArray(props.windows) ? props.windows : []).filter((w) => w && w.label !== undefined);
  if (!wins.length) return null;
  const kids: ReactNode[] = [];
  if (props.title) kids.push(<SectionTitle key="t" text={props.title} />);
  wins.forEach((w, i) => {
    // resetInSec<=0 = 该窗口没有重置时间（本地账本、周期未知）→ 不显示倒计时，
    // 否则会渲染成误导性的「0 秒」
    const left = w.resetInSec > 0 ? deps.fmtLeft(deps.remainOf(w, props.snap, props.now)) : undefined;
    kids.push(
      RollingBar(deps, {
        barKey: w.key || 'w' + i,
        label: w.label,
        pct: w.pct,
        left,
        status: w.status,
      }),
    );
  });
  if (wins.length > 1 && !props.noSummary) {
    const worst = wins.reduce((m, w) => (w.pct > m.pct ? w : m), wins[0] as QuotaWindow);
    const minRem = wins.reduce((m, w) => Math.min(m, deps.remainOf(w, props.snap, props.now)), Infinity);
    kids.push(
      <div key="sum" className={styles.paygSub}>
        {'最高占用 ' + worst.label + ' ' + Math.round(worst.pct) + '% · 最早重置' + deps.fmtLeft(minRem)}
      </div>,
    );
  }
  return <div className={styles.body}>{kids}</div>;
}

/** 余额主数字块（payg 语义的通用展示） */
export function BalanceBlock(deps: KitDeps, props: BalanceBlockProps): ReactNode {
  const b = (props.billing || {}) as Record<string, unknown>;
  if (!Object.keys(b).length) return null;
  const amt = deps.num(b['balance'], 0);
  const cur = String(b['currency'] || 'CNY');
  const granted = b['granted'] !== undefined && b['granted'] !== null ? deps.num(b['granted'], 0) : null;
  const topped = b['toppedUp'] !== undefined && b['toppedUp'] !== null ? deps.num(b['toppedUp'], 0) : null;
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
      ? deps.num(b['lowWarn'], 0)
      : null;
  const infos = Array.isArray(b['infos']) ? (b['infos'] as Array<Record<string, unknown>>) : [];
  const kids: ReactNode[] = [];
  if (props.title) kids.push(<SectionTitle key="t" text={props.title} />);
  kids.push(
    <div key="top" className={styles.paygTop}>
      <div>
        <span className={styles.paygCur}>{deps.curSymbol(cur) + cur}</span>
        <span className={styles.paygAmt + (amt < 0 ? ' ' + styles.neg : '')}>{deps.fmt(amt)}</span>
      </div>
      <span className={styles.avail + ' ' + styles[availCls]} title={availTip}>
        {availTxt}
      </span>
    </div>,
  );
  const parts: string[] = [];
  if (granted !== null && granted > 0) parts.push('赠送 ' + deps.fmt(granted));
  if (topped !== null && topped > 0) parts.push('充值 ' + deps.fmt(topped));
  if (warnLine !== null) parts.push('预警线 ' + deps.fmt(warnLine));
  if (parts.length)
    kids.push(
      <div key="parts" className={styles.paygSub}>
        {parts.join(' · ')}
      </div>,
    );
  if (infos.length > 1)
    kids.push(
      <div key="infos" className={styles.infos}>
        {infos.map((x, i) => (
          <div key={String(x['currency'] || i)} className={styles.inforow}>
            <span>{String(x['currency'] || '?')}</span>
            <b>{deps.fmt(x['total'])}</b>
          </div>
        ))}
      </div>,
    );
  // empty 已在上面算好（徽标与这条告警共用同一个判据，两处不会再打架）
  const low = !empty && warnLine !== null && amt <= warnLine;
  if (empty)
    kids.push(
      <div key="warn" className={styles.warn + ' ' + styles.bad}>
        {'余额不足，API 调用可能被拒绝，请及时充值。'}
      </div>,
    );
  else if (low)
    kids.push(
      <div key="warn" className={styles.warn}>
        {'余额低于预警线 ' + deps.fmt(warnLine) + '，建议及时充值。'}
      </div>,
    );
  // 旧实现的 'tm-payg' 在样式表里从来没有对应规则（只有 .tm-payg-* 系列），CSS Module 迁移后
  // `styles.payg` 只会是 undefined、被 React 静默丢掉；这里只保留 compact 修饰类。
  return <div className={props.compact ? styles.paygCompact : undefined}>{kids}</div>;
}

/** 键值指标行 */
export function MetricRows(deps: KitDeps, props: MetricRowsProps): ReactNode {
  const items = (Array.isArray(props.items) ? props.items : []).filter((it) => it && it.label);
  if (!items.length) return null;
  return (
    <div className={styles.xstats}>
      {props.title ? <SectionTitle key="t" text={props.title} /> : null}
      {items.map((it, i) => (
        <div key={'r' + i} className={styles.xrow}>
          <span>{String(it.label)}</span>
          <b>{String(it.value)}</b>
        </div>
      ))}
    </div>
  );
}

/**
 * 两列紧凑指标网格：单列 8 行会占掉卡片近半高度，两列直接减半。
 * mergePairs=true 时把相邻两项合成一格（「输入 5905万 · 输出 27万」），进一步省行。
 */
export function MetricGrid(deps: KitDeps, props: MetricGridProps): ReactNode {
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
  return (
    <div className={styles.xgrid}>
      {props.title ? <SectionTitle key="t" text={props.title} /> : null}
      <div key="g" className={styles.xgridBody}>
        {cells.map((c, i) => (
          <div key={'c' + i} className={styles.xcell} title={c.label + '：' + c.value}>
            <span className={styles.xcellLabel}>{c.label}</span>
            <b className={styles.xcellValue}>{c.value}</b>
          </div>
        ))}
      </div>
    </div>
  );
}

/** 分段占比条 */
export function SplitBar(deps: KitDeps, props: SplitBarProps): ReactNode {
  const segs = (Array.isArray(props.segments) ? props.segments : [])
    .filter((sg) => sg && isFinite(Number(sg.value)) && Number(sg.value) > 0)
    .slice(0, 8);
  if (!segs.length) return null;
  const sum = segs.reduce((acc, x) => acc + Number(x.value), 0);
  const color = (i: number): string => segs[i]?.color || (X_PAL[i % X_PAL.length] as string);
  return (
    <div>
      {props.title ? <SectionTitle key="t" text={props.title} /> : null}
      <div className={styles.xsplit}>
        {segs.map((sg, i) => (
          <span key={'g' + i} style={{ flexGrow: Number(sg.value), background: color(i) }} />
        ))}
      </div>
      <div className={styles.xstats}>
        {segs.map((sg, i) => (
          <div key={'l' + i} className={styles.xrow}>
            <span>
              <span className={styles.xdot} style={{ background: color(i) }} />
              {String(sg.label || '')}
            </span>
            <b>{String(Math.round((Number(sg.value) * 100) / sum)) + '%'}</b>
          </div>
        ))}
      </div>
    </div>
  );
}

/** 提示条 */
export function NoteLine(deps: KitDeps, props: NoteLineProps): ReactNode {
  const t = typeof props.text === 'string' ? props.text : '';
  if (!t) return null;
  const tone =
    props.tone === 'bad'
      ? styles.warn + ' ' + styles.bad
      : props.tone === 'warn'
        ? styles.warn
        : styles.paygSub;
  return <div className={tone}>{t}</div>;
}

/** 趋势折线（纯 SVG，无依赖） */
export function MiniChart(deps: KitDeps, props: MiniChartProps): ReactNode {
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
  return (
    <div className={styles.xchart}>
      {ch && ch.title ? <div className={styles.xtitle}>{String(ch.title)}</div> : null}
      <svg
        viewBox={'0 0 ' + W + ' ' + Hh}
        preserveAspectRatio="none"
        style={{ display: 'block', width: '100%', height: Hh + 'px' }}
      >
        <polygon points={area} style={{ fill: 'var(--dsw-alias-state-business-primary)', opacity: 0.15 }} />
        <polyline
          points={line}
          fill="none"
          style={{
            stroke: 'var(--dsw-alias-state-business-primary)',
            strokeWidth: 1.6,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
          }}
        />
      </svg>
    </div>
  );
}

/**
 * 拼类名。
 *
 * CSS Module 的映射是宽松声明（每个值是 `string | undefined`），直接拼会得到 `"a undefined"`。
 *
 * @param names - 类名候选。
 * @returns 空格分隔的类名。
 */
function cx(...names: Array<string | undefined>): string {
  return names.filter((name) => name !== undefined).join(' ');
}

/**
 * chip 的 tone → 局部类名。
 *
 * 旧实现是运行时拼 `'tm-vchip-' + tone`（`vchip-ok` / `vchip-warn` / `vchip-bad` / `vchip-info`），
 * CSS Module 化之后局部名是**后缀驼峰**（`vchipOk`）——`styles['vchip-' + tone]` 是 undefined。
 * 所以改成查表；未知 tone（Host 下发的数据里可能有）按「无样式的标记类」口径不再挂。
 */
const VCHIP_TONE: Record<string, string | undefined> = {
  ok: styles.vchipOk,
  warn: styles.vchipWarn,
  bad: styles.vchipBad,
  info: styles.vchipInfo,
};

/** 徽标组 */
export function Chips(deps: KitDeps, props: ChipsProps): ReactNode {
  const chips = (Array.isArray(props.chips) ? props.chips : []).filter((c) => c && c.text);
  if (!chips.length) return null;
  return (
    <div className={styles.vchips}>
      {chips.map((c, i) => (
        <span key={i} className={cx(styles.vchip, c.tone ? VCHIP_TONE[c.tone] : undefined)}>
          {c.text}
        </span>
      ))}
    </div>
  );
}

/**
 * 造一个 deps 绑定的零件命名空间。
 *
 * @param deps - QuotaSection 注入的格式化与错误展开态依赖。
 * @returns `ProviderUIKit`（专属 UI / 声明式渲染按 `K.零件名` 取用）。
 */
export function createProviderKit(deps: KitDeps): ProviderUIKit {
  const ErrorCard = createErrorBox({
    isOpen: deps.errOpen,
    toggle: deps.toggleErr,
    ...(deps.openSettings ? { openSettings: deps.openSettings } : {}),
  });

  return {
    RollingBar: (props: RollingBarProps) => RollingBar(deps, props),
    WindowGroup: (props: WindowGroupProps) => WindowGroup(deps, props),
    BalanceBlock: (props: BalanceBlockProps) => BalanceBlock(deps, props),
    MetricRows: (props: MetricRowsProps) => MetricRows(deps, props),
    MetricGrid: (props: MetricGridProps) => MetricGrid(deps, props),
    SplitBar: (props: SplitBarProps) => SplitBar(deps, props),
    NoteLine: (props: NoteLineProps) => NoteLine(deps, props),
    MiniChart: (props: MiniChartProps) => MiniChart(deps, props),
    SectionTitle: (props: SectionTitleProps) => SectionTitle(props),
    Chips: (props: ChipsProps) => Chips(deps, props),
    ErrorCard,
    num: deps.num,
    fmt: deps.fmt,
    fmtLeft: deps.fmtLeft,
    curSymbol: deps.curSymbol,
    remainOf: deps.remainOf,
    timeAgo: deps.timeAgo,
    levelOf: deps.levelOf,
  };
}

export { fallbackErrorInfo };
