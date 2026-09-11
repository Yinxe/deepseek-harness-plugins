/**
 * 通用小构件（官方 primitives 之上的一层薄封装，多供应商设置页共用）
 *
 * 原实现：dsh-tavily-search/client.js 里的 Badge/Row/Select 内联组件（JS）
 * → 本文件为等价 TS 重写 + 抽出 Notice/Meter/BreakRow/Loading 复用件。
 * 新增供应商只在 SearchSection / providers/* 里组合这些构件，不重复造。
 *
 * @module @dshp/search-provider/client
 */

export interface Components {
  Badge: (props: { kind: 'ok' | 'warn' | 'muted'; text: string }) => any;
  Row: (props: { label: string; desc?: string; children?: any }) => any;
  Select: (props: {
    value: string;
    selectedLabel: string;
    options: { id: string; label: string }[];
    disabled?: boolean;
    onSelect: (id: string) => void;
  }) => any;
  Notice: (props: { kind: 'ok' | 'err'; text: string }) => any;
  Hint: (props: { text: string }) => any;
  Loading: (props: { text: string }) => any;
  Meter: (props: { pct: number }) => any;
  BreakRow: (props: { label: string; value: string }) => any;
}

export function createComponents(React: any, P: any): Components {
  function Badge(props: { kind: string; text: string }) {
    return React.createElement('span', { className: 'sp-badge sp-badge-' + props.kind }, props.text);
  }

  function Row(props: { label: string; desc?: string; children?: any }) {
    return React.createElement(
      'div',
      { className: 'sp-row' },
      React.createElement(
        'div',
        { className: 'sp-rowText' },
        React.createElement('div', { className: 'sp-title' }, props.label),
        props.desc ? React.createElement('div', { className: 'sp-desc' }, props.desc) : null,
      ),
      props.children,
    );
  }

  /** 胶囊按钮 + P.Menu(portal) 下拉（官方设置页同款） */
  function Select(props: {
    value: string;
    selectedLabel: string;
    options: { id: string; label: string }[];
    disabled?: boolean;
    onSelect: (id: string) => void;
  }) {
    const [open, setOpen] = React.useState(false);
    const selector = React.createElement(
      'button',
      {
        type: 'button',
        className: 'sp-selector',
        'aria-haspopup': 'menu',
        'aria-expanded': open,
        disabled: props.disabled,
        onClick: () => setOpen((v: boolean) => !v),
      },
      React.createElement('span', { className: 'sp-selectorLabel' }, props.selectedLabel),
      React.createElement(P.IconChevronDownOutline14, { className: 'sp-chevron' }),
    );
    return React.createElement(P.Menu, {
      open,
      onClose: () => setOpen(false),
      items: props.options,
      selectedId: props.value,
      onSelect: (id: string) => {
        setOpen(false);
        props.onSelect(id);
      },
      align: 'end',
      portal: true,
      anchor: selector,
    });
  }

  function Notice(props: { kind: string; text: string }) {
    return React.createElement('p', { className: 'sp-notice sp-notice-' + props.kind }, props.text);
  }

  function Hint(props: { text: string }) {
    return React.createElement('p', { className: 'sp-hint' }, props.text);
  }

  function Loading(props: { text: string }) {
    return React.createElement(
      'div',
      { className: 'sp-loading' },
      React.createElement(P.IconLoadingOutline16, null),
      React.createElement('span', { className: 'sp-loadingText' }, props.text),
    );
  }

  /** 用量进度条（≥90% 转错误色） */
  function Meter(props: { pct: number }) {
    const v =
      typeof props.pct === 'number' && Number.isFinite(props.pct)
        ? Math.min(100, Math.max(0, Math.round(props.pct)))
        : 0;
    return React.createElement(
      'div',
      { className: 'sp-meter' },
      React.createElement('div', {
        className: 'sp-meter-fill' + (v >= 90 ? ' sp-meter-fill-high' : ''),
        style: { width: v + '%' },
      }),
    );
  }

  function BreakRow(props: { label: string; value: string }) {
    return React.createElement(
      'div',
      { className: 'sp-break-row', key: props.label },
      React.createElement('span', { className: 'sp-break-label' }, props.label),
      React.createElement('span', { className: 'sp-break-value' }, props.value),
    );
  }

  return { Badge, Row, Select, Notice, Hint, Loading, Meter, BreakRow };
}
