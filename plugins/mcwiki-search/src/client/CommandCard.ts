/**
 * /mcwiki 命令卡片 —— 通过官方 `conversation.chat.commandview` 槽位（按命令
 * 名 keyed）替换通用 <pre> 卡片，让命令结果以 Markdown 渲染。
 *
 * - 组件收到 CommandRowOwnerProps 形态的 props：{ node }（CommandNode：
 *   { name, args, outcome: { kind, text } | null }）
 * - 渲染走原语库 MarkdownText（与助手消息同一渲染管线；raw HTML 与相对
 *   链接被禁用，HTTP(S) 链接可用）；labels 硬编码中文（形状对齐官方
 *   markdown-labels.ts）
 * - 折叠态摘要取结果首行去 md 标记；running（outcome 为 null）显示查询中
 */
import type { AnyReact, AnyPrimitives } from './types.js';

/** MarkdownText 需要的本地化文案（MarkdownLabels 形状，硬编码中文） */
const MD_LABELS = { code: { copyLabel: '复制', copiedLabel: '已复制' }, footnotes: '脚注' };

/** 结果首行 → 折叠态摘要（剥掉 md 标题/加粗标记）。 */
function summaryOf(text: string): string {
  return (
    text
      .split('\n')[0]
      ?.replace(/^#+\s*/, '')
      .replace(/\*\*/g, '')
      .slice(0, 120) ?? ''
  );
}

export function createMcwikiCommandCard(React: AnyReact, P: AnyPrimitives): (props: { node: any }) => any {
  const h = React.createElement.bind(React);

  return function McwikiCommandCard(props: { node: any }): any {
    const [open, setOpen] = React.useState(false);
    const node = (props?.node ?? {}) as { outcome?: { kind?: string; text?: string } | null };
    const outcome = node.outcome ?? null;
    const text = typeof outcome?.text === 'string' ? outcome.text : '';
    const state: 'running' | 'ok' | 'error' =
      outcome === null ? 'running' : outcome.kind === 'error' ? 'error' : 'ok';
    const body = text.includes('\n') ? text : null;
    const summary =
      outcome === null
        ? '正在查询 Minecraft Wiki…'
        : state === 'error'
          ? text
          : text.length === 0
            ? '完成'
            : summaryOf(text);

    return h(
      'div',
      { className: 'mw-cmdRoot', 'data-state': state },
      h(
        P.DisclosureRow,
        {
          rowClassName: 'mw-cmdRow',
          titleClassName: 'mw-cmdTitle',
          chevronClassName: 'mw-cmdChevron',
          icon: state === 'error' ? h(P.StateDot, { state: 'error' }) : h(P.IconApiOutline14, null),
          title: 'mcwiki',
          open: open && body !== null,
          expandable: body !== null,
          expandOnRowClick: true,
          keepContentWhenOpen: true,
          onToggle: () => setOpen((v: boolean) => !v),
          collapsedContent: h(
            'span',
            { className: 'mw-cmdSummary' + (state === 'error' ? ' mw-cmdSummaryErr' : '') },
            summary,
          ),
        },
        body !== null
          ? h(
              'div',
              { className: 'mw-cmdBody' },
              h(P.MarkdownText, { text, streaming: false, labels: MD_LABELS }),
            )
          : null,
      ),
    );
  };
}
