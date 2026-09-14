/**
 * manual（本地账本）专属 UI（provider 自己的渲染实现）
 *
 * 无网络请求，数字全部是用户在设置页手填的本地账本：
 *  - `billing: rolling` → 一条额度进度（总额/已用）；
 *  - `billing: payg`    → 余额卡（余额/总额度/预警线）。
 *
 * 专属表达：明确标注「本地手填，非实时」，避免用户误以为这是从平台拉来的真实额度。
 */
import type { ReactNode } from 'react';
import styles from '../../styles.module.css';
import type { ProviderUIKit, RenderCtx } from '../kit.js';
import { DISPLAY_NAME } from '../../../name.js';

/**
 * 本地账本的专属渲染。
 *
 * @param ctx - 快照 / 时间 / 供应商身份。
 * @param K - deps 绑定后的零件命名空间（专属 UI 与声明式层共用同一批零件）。
 * @returns 卡片主体节点。
 */
export function manualUI(ctx: RenderCtx, K: ProviderUIKit): ReactNode {
  const snap = ctx.snap;
  const b = (snap.billing || {}) as Record<string, unknown>;
  const wins = Array.isArray(snap.windows) ? snap.windows : [];

  const kids: ReactNode[] = [];
  kids.push(<K.Chips key="chips" chips={[{ text: '本地手填', tone: 'info' }]} />);

  if (wins.length) {
    kids.push(<K.WindowGroup key="win" windows={wins} snap={snap} now={ctx.now} title="额度" />);
  }
  if (Object.keys(b).length) {
    const isPayg = !wins.length;
    kids.push(<K.BalanceBlock key="bal" billing={b as any} title={isPayg ? '当前余额' : undefined} />);
  }

  const items: Array<{ label: string; value: string }> = [];
  const total = wins.length ? K.num(wins[0]?.limit, 0) : 0;
  const used = wins.length ? K.num(wins[0]?.used, 0) : 0;
  if (wins.length) {
    items.push({ label: '总额度', value: K.fmt(total) });
    items.push({ label: '已用', value: K.fmt(used) });
    items.push({ label: '剩余', value: K.fmt(Math.max(0, total - used)) });
  }
  if (items.length) kids.push(<K.MetricRows key="metrics" items={items} title="账本明细" />);

  kids.push(
    <K.NoteLine
      key="note"
      text={
        '数据来自本地手填（非平台实时接口）：在「设置 → ' +
        DISPLAY_NAME +
        ' → 编辑」里更新，改完点「刷新」即可。'
      }
      tone="info"
    />,
  );

  return <div className={styles.ui}>{kids}</div>;
}
