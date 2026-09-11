/**
 * 插件自绘图标（纯 SVG，零依赖）
 *
 * 用途：
 *  - 右侧栏指南/菜单条目（SidebarRightGuideEntry.icon），运行时以 { size, className } 渲染；
 *  - tab chip 标题（sidebar.right.pane.tab.title slot）里与文字并排。
 *
 * 约定：viewBox 固定 0 0 24 24，颜色走 currentColor（跟随所在行的文字色/主题），
 * 线性风格（stroke，圆帽），与 DSH 官方图标的观感一致。
 */
import type { AnyReact } from './types.js';

export function createIcons(React: AnyReact): { QuotaIcon: any; UsageIcon: any } {
  const h = React.createElement;

  /** 基础 svg 属性（尺寸随 size 缩放，颜色继承） */
  function svgProps(props: any): Record<string, unknown> {
    const size = props && props.size ? props.size : 16;
    return {
      width: size,
      height: size,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 1.8,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      className: (props && props.className) || undefined,
      'aria-hidden': 'true',
      focusable: 'false',
    };
  }

  /** 额度：电池 + 已用刻度（剩余电量语义） */
  function QuotaIcon(props: any): any {
    return h('svg', svgProps(props),
      h('rect', { key: 'body', x: 2.5, y: 7, width: 16, height: 10, rx: 2.6 }),
      h('path', { key: 'cap', d: 'M21.2 10.4v3.2' }),
      h('rect', { key: 'level', x: 5, y: 9.4, width: 6.4, height: 5.2, rx: 1.3, fill: 'currentColor', stroke: 'none' }));
  }

  /** 用量：三根高低不同的柱（统计/趋势语义） */
  function UsageIcon(props: any): any {
    return h('svg', svgProps(props),
      h('path', { key: 'a', d: 'M4.6 20v-6.4', strokeWidth: 2.6 }),
      h('path', { key: 'b', d: 'M12 20V5.4', strokeWidth: 2.6 }),
      h('path', { key: 'c', d: 'M19.4 20v-9.6', strokeWidth: 2.6 }));
  }

  return { QuotaIcon, UsageIcon };
}
