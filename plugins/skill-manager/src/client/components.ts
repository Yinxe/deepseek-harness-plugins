/**
 * 基础 UI 构件 —— 尽量包一层官方 @deepseek-ai/dsh-client-ui-primitives 原语
 * （Tag / Switch / Button / Menu），没有的原语才自创；保证主题与交互跟手。
 * React / P 由 factory 注入（运行时 __ModuleLoader__ 提供），此处不直接 import。
 */
import type { AnyPrimitives, AnyReact } from './types.js';

export type BadgeKind = 'ok' | 'warn' | 'muted' | 'info' | 'err';

/** 自有 kind → 原生 Tag tone */
const KIND_TO_TONE: Record<BadgeKind, string> = {
  ok: 'success',
  warn: 'warning',
  muted: 'neutral',
  info: 'info',
  err: 'danger',
};

export function createComponents(
  React: AnyReact,
  P: AnyPrimitives,
): {
  Badge: (props: { kind: BadgeKind; text: string }) => any;
  Switch: (props: {
    checked: boolean;
    disabled?: boolean;
    label: string;
    title?: string;
    onChange: (next: boolean) => void;
  }) => any;
  Selector: (props: {
    disabled?: boolean;
    value: string;
    selectedLabel: string;
    options: Array<{ id: string; label: string }>;
    onSelect: (id: string) => void;
  }) => any;
  ActionMenu: (props: {
    disabled?: boolean;
    text?: string;
    icon?: any;
    title?: string;
    options: Array<{ id: string; label: string }>;
    onPick: (id: string) => void;
  }) => any;
} {
  /** 徽章：原生 Tag（tone 映射），没有才自创 */
  function Badge(props: { kind: BadgeKind; text: string }): any {
    return React.createElement(P.Tag, { tone: KIND_TO_TONE[props.kind] }, props.text);
  }

  /** 开关：原生 Switch（onChange 取反值） */
  function Switch(props: {
    checked: boolean;
    disabled?: boolean;
    label: string;
    title?: string;
    onChange: (next: boolean) => void;
  }): any {
    return React.createElement(P.Switch, {
      checked: props.checked === true,
      disabled: props.disabled,
      label: props.label,
      title: props.title,
      onChange: props.onChange,
    });
  }

  /** 下拉：原生 Button(toolbar) 作锚 + 原生 Menu */
  function Selector(props: {
    disabled?: boolean;
    value: string;
    selectedLabel: string;
    options: Array<{ id: string; label: string }>;
    onSelect: (id: string) => void;
  }): any {
    const [open, setOpen] = React.useState(false);
    const anchor = React.createElement(
      P.Button,
      {
        variant: 'toolbar',
        disabled: props.disabled,
        'aria-haspopup': 'menu',
        'aria-expanded': open,
        onClick: () => setOpen((v: boolean) => !v),
      },
      React.createElement('span', { className: 'sm-selectorLabel' }, props.selectedLabel),
      React.createElement(P.IconChevronDownOutline14, null),
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
      align: 'start',
      portal: true,
      anchor,
    });
  }

  /** 「⋯」动作菜单：原生 Button 作锚 + 原生 Menu（portal，防裁剪） */
  function ActionMenu(props: {
    disabled?: boolean;
    text?: string;
    icon?: any;
    title?: string;
    options: Array<{ id: string; label: string }>;
    onPick: (id: string) => void;
  }): any {
    const [open, setOpen] = React.useState(false);
    const anchor = React.createElement(
      P.Button,
      {
        variant: 'toolbar',
        disabled: props.disabled,
        title: props.title,
        'aria-haspopup': 'menu',
        'aria-expanded': open,
        onClick: () => setOpen((v: boolean) => !v),
      },
      props.icon !== undefined ? props.icon : (props.text ?? '⋯'),
    );
    return React.createElement(P.Menu, {
      open,
      onClose: () => setOpen(false),
      items: props.options,
      selectedId: '',
      onSelect: (id: string) => {
        setOpen(false);
        props.onPick(id);
      },
      align: 'end',
      portal: true,
      anchor,
    });
  }

  return { Badge, Switch, Selector, ActionMenu };
}
