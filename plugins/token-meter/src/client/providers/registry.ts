/**
 * provider 渲染调度器
 *
 * 「每个 provider return 自己的数据，client 也有一套属于它自己的 UI」的调度中枢：
 *
 *   1. **专属 UI**（providers/ui/<type>.ts）—— 该供应商自己的完整实现，自由排版；
 *   2. **声明式区块**（sections.ts + snap.view）—— 通用渲染，新供应商零客户端代码可用；
 *   3. **legacy 兜底** —— 老 Host 只下发 billingKind/windows/extra 时仍能显示。
 *
 * 失败不在这里处理：调度器只渲染成功快照，失败卡片由 QuotaSection 统一走
 * `Kit.ErrorCard`（结构化结论 + 排查步骤 + 重试），任何 provider 一致。
 */
import type { ProviderSection, VendorSnapshot } from '../types.js';
import { createSectionRenderer } from './sections.js';
import { getProviderUI, hasProviderUI, providerUITypes, registerProviderUI } from './ui/index.js';
import type { ProviderUI } from './ui/index.js';
import type { ProviderUIKit, RenderCtx } from './kit.js';

/** 调度器对外接口。 */
export interface ProviderRenderer {
  /** 渲染成功快照的主体（三层兜底） */
  renderBody: (type: string, snap: VendorSnapshot, now: number) => any;
  /** 该 type 是否有专属 UI */
  hasBespoke: (type: string) => boolean;
  /** 已注册专属 UI 的 type 列表 */
  bespokeTypes: () => string[];
}

/** legacy 快照 → 声明式区块（旧 Host 未下发 view 时兜底）。 */
export function legacySections(snap: VendorSnapshot): ProviderSection[] {
  const out: ProviderSection[] = [];
  if (snap.billingKind === 'payg')
    out.push({ kind: 'balance', key: 'balance', title: '账户余额', billing: (snap.billing || {}) as any });
  else if (Array.isArray(snap.windows) && snap.windows.length)
    out.push({ kind: 'windows', key: 'windows', windows: snap.windows });
  const extra = snap.extra;
  if (extra) {
    const stats = Array.isArray(extra.stats) ? extra.stats.slice(0, 6) : [];
    if (stats.length) out.push({ kind: 'metrics', key: 'stats', items: stats });
    const blocks = Array.isArray(extra.blocks) ? extra.blocks.slice(0, 8) : [];
    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i];
      if (!b || typeof b !== 'object') continue;
      if (b.kind === 'kv' && b.label)
        out.push({
          kind: 'metrics',
          key: 'kv' + i,
          items: [{ label: String(b.label), value: String(b.value ?? '') }],
        });
      else if (b.kind === 'progress' && isFinite(Number(b.used)) && Number(b.total) > 0) {
        const p: NonNullable<ProviderSection['progress']> = { used: Number(b.used), total: Number(b.total) };
        if (b.label) p.label = String(b.label);
        if (b.left !== undefined && b.left !== null && b.left !== '') p.left = String(b.left);
        out.push({ kind: 'progress', key: 'pg' + i, progress: p });
      } else if (b.kind === 'split' && Array.isArray(b.segments))
        out.push({ kind: 'split', key: 'sp' + i, split: { segments: b.segments } });
      else if (b.kind === 'note' && b.text) {
        const n: NonNullable<ProviderSection['note']> = { text: String(b.text) };
        if (b.tone) n.tone = b.tone;
        out.push({ kind: 'note', key: 'nt' + i, note: n });
      }
    }
    if (extra.chart && Array.isArray(extra.chart.values) && extra.chart.values.length > 1)
      out.push({ kind: 'chart', key: 'chart', chart: extra.chart });
  }
  return out;
}

export function createProviderRenderers(React: unknown, K: ProviderUIKit): ProviderRenderer {
  const { renderSections } = createSectionRenderer(K);

  /** 第 2 层：provider 自描述 view；没给就用 legacy 快照现推 */
  function generic(ctx: RenderCtx): any {
    const sections = ctx.snap.view && Array.isArray(ctx.snap.view.sections) ? ctx.snap.view.sections : null;
    const rendered = sections ? renderSections(sections, ctx) : null;
    if (rendered) return rendered;
    return renderSections(legacySections(ctx.snap), ctx);
  }

  function renderBody(type: string, snap: VendorSnapshot, now: number): any {
    const ctx: RenderCtx = { snap, now, type, vendorName: snap.vendorName || '' };
    const ui: ProviderUI | undefined = getProviderUI(type);
    if (ui) {
      try {
        const out = ui(ctx, K);
        if (out !== null && out !== undefined) return out;
      } catch {
        /* 专属 UI 出错不影响可用性：落到通用层 */
      }
    }
    return generic(ctx);
  }

  return {
    renderBody,
    hasBespoke: (type: string) => hasProviderUI(type),
    bespokeTypes: () => providerUITypes(),
  };
}

export { registerProviderUI };
