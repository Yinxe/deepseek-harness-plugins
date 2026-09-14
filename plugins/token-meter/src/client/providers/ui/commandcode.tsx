/**
 * CommandCode 专属 UI（provider 自己的渲染实现）
 *
 * 数据（Host `providers/commandcode.ts` 产出）：
 *  - windows：5 小时 / 每周滚动窗口（额度窗口）
 *  - billing：剩余额度（月度 + 充值 + 赠送合成的 USD 余额）、订阅计划、低余额线、
 *    额度构成（monthlyCredits/purchasedCredits/freeCredits）、本期消费（consumedCredits）
 *  - extra：账户与用量指标、订阅状态提示
 *
 * 排版原则（针对首版「卡片过高」的返工）：
 *  1. **同一份数据只出现一次**：进度条已标百分比，顶部就不再重复挂百分比徽标；
 *     计划名只在顶部徽标出现（带订阅状态），指标网格里不再重复「订阅计划」；
 *     月度额度进度只标「已用 / 共」，不重复「剩余 $X」（余额大数字已给）。
 *  2. **指标走两列网格 + 成对合并**：8 条单列指标占掉卡片近半高度，压到 2–3 行。
 *  3. **提示只在异常时出现**：订阅正常时不写「订阅生效中」这类零信息量套话。
 *
 * 保留的核心信息（高度优化时不可省）：余额大数字、5 小时 / 每周 / 每月三条进度
 * （含重置倒计时）、可用状态与预警线、额度构成、账户与用量、异常提示。
 *
 * 三条进度全部由 Host 的 windows 驱动、WindowGroup 统一渲染 —— 不在本文件手写
 * 单条进度（手写会与组件内的标签列宽/间距规则脱节，导致标签被挤到换行）。
 */
import type { ReactNode } from 'react';
import styles from '../../styles.module.css';
import type { ProviderUIKit, RenderCtx } from '../kit.js';

/**
 * CommandCode 的专属渲染。
 *
 * @param ctx - 快照 / 时间 / 供应商身份。
 * @param K - deps 绑定后的零件命名空间（专属 UI 与声明式层共用同一批零件）。
 * @returns 卡片主体节点。
 */
export function commandcodeUI(ctx: RenderCtx, K: ProviderUIKit): ReactNode {
  const snap = ctx.snap;
  const b = (snap.billing || {}) as Record<string, unknown>;
  const plan = b['plan'] ? String(b['plan']) : '';
  const wins = Array.isArray(snap.windows) ? snap.windows : [];
  const notes = (snap.extra && Array.isArray(snap.extra.blocks) ? snap.extra.blocks : []).filter(
    (x: any) => x && x.kind === 'note' && x.text,
  ) as Array<{ text: string; tone?: 'info' | 'warn' | 'bad' }>;
  // 需要用户处理的提示（订阅异常、额度告警）才值得占一行
  const alerts = notes.filter((n) => n.tone === 'bad' || n.tone === 'warn');

  const kids: ReactNode[] = [];

  /* ── 指标预处理：先把「订阅计划」摘出来，避免与顶部计划徽标重复 ─────
     Host 给的这一项形如「GOAT（active）」，正好把状态也一并带过来。 */
  const metrics = (snap.extra && Array.isArray(snap.extra.stats) ? snap.extra.stats : []).slice(0, 12);
  const planMetric = metrics.filter((m) => m && m.label === '订阅计划')[0] as
    { label: string; value: string } | undefined;
  const planStatus = planMetric
    ? String(planMetric.value)
        .replace(/^[^（(]*[（(]/, '')
        .replace(/[）)]\s*$/, '')
    : '';
  const restMetrics = metrics.filter((m) => m && m.label !== '订阅计划');

  /* ── 顶部徽标：只放「定性」信息（计划名+状态、异常态）───────────────
     窗口百分比已在下方进度条上（含颜色严重度），重复挂一遍纯属占高。 */
  const chips: Array<{ text: string; tone?: 'ok' | 'warn' | 'bad' | 'info' }> = [];
  if (plan)
    chips.push({
      text: planStatus ? plan + ' · ' + planStatus : plan,
      tone: /active|生效/i.test(planStatus) ? 'ok' : 'info',
    });
  if (alerts.length) chips.push({ text: '需处理', tone: 'bad' });
  else if (wins.some((w) => Number(w.pct) >= 100)) chips.push({ text: '窗口已满', tone: 'bad' });
  if (chips.length) kids.push(<K.Chips key="chips" chips={chips} />);

  /* ── 核心：剩余额度大数字（大数字本身即标题，省掉区块标题行）────── */
  kids.push(<K.BalanceBlock key="bal" billing={b as any} compact={true} />);

  /* ── 额度窗口：进度条已含百分比与重置时长，省略重复的汇总行 ─────── */
  if (wins.length)
    kids.push(
      <K.WindowGroup key="win" windows={wins} snap={snap} now={ctx.now} title="额度窗口" noSummary={true} />,
    );

  /* ── 额度构成：仅当有多种来源时才画（单一来源画条无意义）─────────
     注：月度额度进度条不在这里手写 —— Host 已把它作为标准 QuotaWindow
     放进 snap.windows，三条（5 小时 / 每周 / 每月）由上面的 WindowGroup
     统一渲染，标签列宽、间距、倒计时位置天然一致（复用同一个组件）。 */
  const monthly = K.num(b['monthlyCredits'], 0);
  const purchased = K.num(b['purchasedCredits'], 0);
  const free = K.num(b['freeCredits'], 0);
  const segs = [
    { label: '月度额度', value: monthly, color: '#4c7ef3' },
    { label: '充值额度', value: purchased, color: '#2fb261' },
    { label: '赠送额度', value: free, color: '#f5a623' },
  ].filter((s) => s.value > 0);
  if (segs.length > 1) kids.push(<K.SplitBar key="split" segments={segs} title="额度构成" />);

  /* ── 账户与用量：两列网格 + 成对合并 ─────────────────────────────
     原先 8 行单列列表是卡片最高的部分，现在两项并一格、两格一行。 */
  const items: Array<{ label: string; value: string }> = [];
  for (const it of restMetrics) items.push({ label: it.label, value: it.value });
  if (!items.length) {
    if (plan) items.push({ label: '订阅计划', value: plan });
    if (b['periodEnd']) items.push({ label: '当前周期至', value: String(b['periodEnd']) });
  }
  kids.push(<K.MetricGrid key="metrics" items={items} title="账户与用量" mergePairs={true} />);

  /* ── 提示：只在订阅异常/额度告警时出现 ──────────────────────────── */
  for (let i = 0; i < alerts.length && i < 2; i++) {
    const n = alerts[i] as { text: string; tone?: 'info' | 'warn' | 'bad' };
    kids.push(<K.NoteLine key={'note' + i} text={n.text} tone={n.tone || 'warn'} />);
  }

  return <div className={styles.ui}>{kids}</div>;
}
