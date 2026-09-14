/**
 * opencode 专属 UI（provider 自己的渲染实现）
 *
 * 数据特征：同一个 workspace 同时拉 `/go`（订阅三窗口 + 计划）与 `/billing`（充值余额），
 * 因此一张卡上可能同时存在「滚动窗口」与「按量余额」两种形态：
 *  - Go 订阅：5 小时 / 每周 / 每月 三窗口 + 订阅状态与到期倒计时；
 *  - Zen 按量：充值余额（USD）。
 *
 * 专属表达：
 *  - 订阅徽标 + 三窗口进度条（月度窗口同时充当「订阅周期」参照）；
 *  - 余额作为补充指标（订阅用户也可能有充值余额）；
 *  - 订阅备注（购买时间 / 到期倒计时）单独成行。
 */
import type { ReactNode } from 'react';
import styles from '../../styles.module.css';
import type { ProviderUIKit, RenderCtx } from '../kit.js';

/**
 * opencode 的专属渲染。
 *
 * @param ctx - 快照 / 时间 / 供应商身份。
 * @param K - deps 绑定后的零件命名空间（专属 UI 与声明式层共用同一批零件）。
 * @returns 卡片主体节点。
 */
export function opencodeUI(ctx: RenderCtx, K: ProviderUIKit): ReactNode {
  const snap = ctx.snap;
  const b = (snap.billing || {}) as Record<string, unknown>;
  const plan = b['plan'] ? String(b['plan']) : '';
  const wins = Array.isArray(snap.windows) ? snap.windows : [];
  const balance = b['balance'] !== undefined && b['balance'] !== null ? K.num(b['balance'], 0) : null;

  const kids: ReactNode[] = [];

  /* ── 订阅徽标 + 三窗口占用概览 ──────────────────────────────── */
  const chips: Array<{ text: string; tone?: 'ok' | 'warn' | 'bad' | 'info' }> = [];
  if (plan) chips.push({ text: '订阅 ' + plan, tone: 'info' });
  for (const w of wins) {
    const pct = Math.round(Number(w.pct) || 0);
    chips.push({ text: w.label + ' ' + pct + '%', tone: pct >= 90 ? 'bad' : pct >= 70 ? 'warn' : 'ok' });
  }
  if (!wins.length && balance !== null) chips.push({ text: '按量计费', tone: 'info' });
  if (chips.length) kids.push(<K.Chips key="chips" chips={chips} />);

  /* ── 滚动窗口（5h / 每周 / 每月）────────────────────────────── */
  if (wins.length) {
    kids.push(<K.WindowGroup key="win" windows={wins} snap={snap} now={ctx.now} title="订阅窗口" />);
  }

  /* ── 充值余额（订阅用户也可能有；Zen 用户则是主体）────────────── */
  if (balance !== null && balance !== undefined) {
    const onlyBalance = !wins.length;
    kids.push(<K.BalanceBlock key="bal" billing={b as any} title={onlyBalance ? '账户余额' : '充值余额'} />);
  }

  /* ── 订阅备注 / 余额补充说明 ────────────────────────────────── */
  const notes = (snap.extra && Array.isArray(snap.extra.blocks) ? snap.extra.blocks : []).filter(
    (x: any) => x && x.kind === 'note' && x.text,
  );
  if (notes.length) {
    kids.push(<K.NoteLine key="note" text={(notes[0] as { text: string }).text} tone="info" />);
  } else if (wins.length) {
    const monthly = wins.filter((w) => w.key === 'monthly')[0];
    if (monthly && monthly.resetInSec > 0) {
      kids.push(
        <K.NoteLine
          key="note"
          text={'订阅约 ' + K.fmtLeft(monthly.resetInSec) + '后重置/到期（以每月窗口为准）。'}
          tone="info"
        />,
      );
    }
  }

  return <div className={styles.ui}>{kids}</div>;
}
