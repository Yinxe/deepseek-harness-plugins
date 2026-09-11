/**
 * DeepSeek 专属 UI（provider 自己的渲染实现）
 *
 * 该适配器是「按凭据形态自动选路」的单入口，两条路线返回的数据并不一样：
 *  - 官方余额接口（`sk-` apiKey）：只有余额 + 赠送/充值拆分 + 总额度消耗，**无历史趋势**；
 *  - 网页账单接口（会话 token）：余额 + 累计消费 + **历史使用趋势**。
 *
 * 因此本 UI 的专属表达是「让用户时刻知道这次数据是哪来的、为什么没有趋势图」：
 *  - 顶部徽标写明数据来源与凭据形态；
 *  - 有趋势就画折线，没有就明说「官方接口不提供历史趋势」而不是留白；
 *  - 总额度消耗进度仅在能推导出总量（赠送+充值）时展示。
 */
import type { ProviderUIKit, RenderCtx } from '../kit.js';

export function deepseekUI(ctx: RenderCtx, K: ProviderUIKit): any {
  const h = K.h;
  const snap = ctx.snap;
  const b = (snap.billing || {}) as Record<string, unknown>;
  const via = String(snap.via || '');
  const isWeb = via.indexOf('网页') >= 0;

  const kids: any[] = [];

  /* ── 数据来源徽标（两套凭据体系，必须让用户看清这次走的哪条）────── */
  const chips: Array<{ text: string; tone?: 'ok' | 'warn' | 'bad' | 'info' }> = [];
  if (via) chips.push({ text: isWeb ? '网页账单接口' : '官方余额接口', tone: isWeb ? 'info' : 'ok' });
  if (snap.secretKind)
    chips.push({ text: '凭据 ' + K.curSymbol('') + String(snap.secretKind), tone: 'info' });
  if (isWeb) chips.push({ text: '票据会过期', tone: 'warn' });
  if (chips.length) kids.push(h(K.Chips, { key: 'chips', chips }));

  /* ── 账户余额 ──────────────────────────────────────────────── */
  kids.push(h(K.BalanceBlock, { key: 'bal', billing: b as any, title: '账户余额' }));

  /* ── 总额度消耗（赠送 + 充值 = 总量；仅官方接口给得出拆分）──────── */
  const granted = b['granted'] !== undefined && b['granted'] !== null ? K.num(b['granted'], 0) : null;
  const topped = b['toppedUp'] !== undefined && b['toppedUp'] !== null ? K.num(b['toppedUp'], 0) : null;
  const totalQuota = (granted || 0) + (topped || 0);
  const balance = K.num(b['balance'], 0);
  if (totalQuota > 0) {
    const used = Math.max(0, totalQuota - balance);
    const segs = [
      { label: '赠送额度', value: granted || 0, color: '#4c7ef3' },
      { label: '充值额度', value: topped || 0, color: '#2fb261' },
    ].filter((s) => s.value > 0);
    if (segs.length > 1) kids.push(h(K.SplitBar, { key: 'split', segments: segs, title: '额度构成' }));
    kids.push(
      h('div', { key: 'prog', className: 'tm-xprog' }, [
        h(K.SectionTitle, { key: 't', text: '总额度消耗' }),
        h(K.RollingBar, {
          key: 'bar',
          label: '总额度',
          pct: totalQuota > 0 ? Math.min(100, (used / totalQuota) * 100) : 0,
          left: '已用 ' + K.fmt(used) + ' / 共 ' + K.fmt(totalQuota),
        }),
      ]),
    );
  }

  /* ── 累计消费等指标（网页接口给得更全）───────────────────────── */
  const items = (snap.extra && Array.isArray(snap.extra.stats) ? snap.extra.stats : []).slice(0, 8);
  if (items.length) kids.push(h(K.MetricRows, { key: 'metrics', items, title: '消费统计' }));

  /* ── 使用趋势：有就画，没有就说明原因（不留白）────────────────── */
  const chart = snap.extra && snap.extra.chart ? snap.extra.chart : null;
  if (chart && Array.isArray(chart.values) && chart.values.length > 1) {
    kids.push(h(K.MiniChart, { key: 'chart', chart }));
  } else if (!isWeb) {
    kids.push(
      h(K.NoteLine, {
        key: 'nochart',
        text: '官方余额接口不提供历史趋势；如需趋势图，可在「编辑」里同时填入网页 token（会话票据），插件会自动改用网页账单接口。',
        tone: 'info',
      }),
    );
  }

  /* ── 自动选路说明（只在网页路线上提示票据会过期）──────────────── */
  if (isWeb) {
    kids.push(
      h(K.NoteLine, {
        key: 'note',
        text: '当前走网页账单接口（含趋势），依赖登录会话票据；票据过期后卡片会提示重新抓取。官方 sk- 密钥长期有效但无趋势。',
        tone: 'info',
      }),
    );
  }

  return h('div', { className: 'tm-ui tm-ui-deepseek' }, kids);
}
