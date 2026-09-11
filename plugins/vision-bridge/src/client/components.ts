/**
 * 基础 UI 构件（官方设置行规格，与原 client.js 行为一致）
 * React / P 由 factory 注入（运行时 __ModuleLoader__ 提供），此处不直接 import，
 * 避免打包器把 react 打进 bundle。
 */
import type { AnyPrimitives, AnyReact } from './types.js';

export interface BadgeProps {
  kind: 'ok' | 'warn' | 'muted' | 'info';
  text: string;
}

export function createComponents(
  React: AnyReact,
  P: AnyPrimitives,
): {
  Badge: (props: BadgeProps) => any;
  Row: (props: { label: string; desc?: string; children?: any }) => any;
  Select: (props: {
    disabled?: boolean;
    value: string;
    selectedLabel: string;
    options: Array<{ id: string; label: string }>;
    onSelect: (id: string) => void;
  }) => any;
  Switch: (props: { checked: boolean; disabled?: boolean; label: string; onChange: () => void }) => any;
} {
  function Badge(props: BadgeProps): any {
    return React.createElement('span', { className: 'vb-badge vb-badge-' + props.kind }, props.text);
  }

  function Row(props: { label: string; desc?: string; children?: any }): any {
    return React.createElement(
      'div',
      { className: 'vb-row' },
      React.createElement(
        'div',
        { className: 'vb-rowText' },
        React.createElement('div', { className: 'vb-title' }, props.label),
        props.desc ? React.createElement('div', { className: 'vb-desc' }, props.desc) : null,
      ),
      props.children,
    );
  }

  function Select(props: {
    disabled?: boolean;
    value: string;
    selectedLabel: string;
    options: Array<{ id: string; label: string }>;
    onSelect: (id: string) => void;
  }): any {
    const [open, setOpen] = React.useState(false);
    const selector = React.createElement(
      'button',
      {
        type: 'button',
        className: 'vb-selector',
        'aria-haspopup': 'menu',
        'aria-expanded': open,
        disabled: props.disabled,
        onClick: () => setOpen((v: boolean) => !v),
      },
      React.createElement('span', { className: 'vb-selectorLabel' }, props.selectedLabel),
      React.createElement(P.IconChevronDownOutline14, { className: 'vb-chevron' }),
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

  function Switch(props: { checked: boolean; disabled?: boolean; label: string; onChange: () => void }): any {
    return React.createElement(
      'button',
      {
        type: 'button',
        role: 'switch',
        'aria-checked': props.checked === true,
        'aria-label': props.label,
        className: 'vb-switch' + (props.checked ? ' vb-switchOn' : ''),
        disabled: props.disabled,
        onClick: props.onChange,
      },
      React.createElement('span', { className: 'vb-thumb' }),
    );
  }

  return { Badge, Row, Select, Switch };
}
