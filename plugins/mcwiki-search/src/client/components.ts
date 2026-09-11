/**
 * 基础 UI 构件（官方设置行规格，与原 client.js 行为一致）
 * React / P 由 factory 注入（运行时 __ModuleLoader__ 提供），此处不直接 import，
 * 避免打包器把 react 打进 bundle。
 */
import type { AnyPrimitives, AnyReact } from './types.js';

export interface BadgeProps {
  kind: 'ok' | 'muted';
  text: string;
}

export function createComponents(
  React: AnyReact,
  _P: AnyPrimitives,
): {
  Badge: (props: BadgeProps) => any;
  Row: (props: { label: string; desc?: string; children?: any }) => any;
} {
  void _P;

  function Badge(props: BadgeProps): any {
    return React.createElement('span', { className: 'mw-badge mw-badge-' + props.kind }, props.text);
  }

  function Row(props: { label: string; desc?: string; children?: any }): any {
    return React.createElement(
      'div',
      { className: 'mw-row' },
      React.createElement(
        'div',
        { className: 'mw-rowText' },
        React.createElement('div', { className: 'mw-title' }, props.label),
        props.desc ? React.createElement('div', { className: 'mw-desc' }, props.desc) : null,
      ),
      props.children,
    );
  }

  return { Badge, Row };
}
