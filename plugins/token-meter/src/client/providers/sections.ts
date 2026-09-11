/**
 * 声明式区块渲染器（分层渲染的兜底层之一）
 *
 * 把 provider 自描述的 `ProviderSection[]` 渲染成节点 —— **本文件不认识任何具体
 * 供应商**，也不自己实现组件：全部转发给 `kit.ts` 的通用零件。
 * 未知 kind / 字段缺失一律跳过，保证老客户端遇到新 provider 不崩。
 *
 * 兜底链上的位置（见 registry.ts）：
 *   专属 UI（providers/ui/<type>.ts） → **声明式区块（本文件）** → legacy 快照
 */
import type { ProviderSection } from '../types.js';
import type { ProviderUIKit, RenderCtx } from './kit.js';

export function createSectionRenderer(K: ProviderUIKit): {
  renderSection: (s: ProviderSection, ctx: RenderCtx, i: number) => any;
  renderSections: (sections: unknown, ctx: RenderCtx) => any;
} {
  const h = K.h;

  function renderSection(s: ProviderSection, ctx: RenderCtx, i: number): any {
    if (!s || typeof s !== 'object') return null;
    const key = 'sec:' + (s.key || s.kind) + ':' + i;
    switch (s.kind) {
      case 'windows':
        return h(K.WindowGroup, { key, windows: s.windows, snap: ctx.snap, now: ctx.now, title: s.title });
      case 'balance':
        return h(K.BalanceBlock, { key, billing: s.billing, title: s.title });
      case 'metrics':
        return h(K.MetricRows, { key, items: s.items, title: s.title });
      case 'progress': {
        const p = s.progress;
        if (!p) return null;
        const total = Number(p.total);
        const used = Number(p.used);
        if (!isFinite(total) || total <= 0 || !isFinite(used)) return null;
        const pct = Math.min(100, Math.max(0, (used / total) * 100));
        const left = p.left !== undefined && p.left !== '' ? String(p.left) : '剩余 ' + (total - used);
        return h('div', { key, className: 'tm-xprog' }, [
          h(K.SectionTitle, { key: 't', text: s.title }),
          h(K.RollingBar, {
            key: 'bar',
            label: String(p.label || s.title || '额度'),
            pct,
            left,
          }),
        ]);
      }
      case 'split':
        return h(K.SplitBar, { key, segments: s.split && s.split.segments, title: s.title });
      case 'note':
        return h(K.NoteLine, { key, text: s.note && s.note.text, tone: s.note && s.note.tone });
      case 'chart':
        return h(K.MiniChart, { key, chart: s.chart });
      default:
        return null; // 未知 kind：静默跳过（前向兼容）
    }
  }

  /** 渲染整份视图；无有效区块返回 null（交给上一层兜底）。 */
  function renderSections(sections: unknown, ctx: RenderCtx): any {
    if (!Array.isArray(sections) || !sections.length) return null;
    const kids = (sections as ProviderSection[])
      .map((s, i) => renderSection(s, ctx, i))
      .filter((n) => n !== null && n !== undefined && n !== false);
    if (!kids.length) return null;
    return h('div', { className: 'tm-sections' }, kids);
  }

  return { renderSection, renderSections };
}
