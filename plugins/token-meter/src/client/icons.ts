/**
 * 插件自绘导航图标（纯 SVG，零依赖）
 *
 * 用途：
 *  - 中心区「Token 总览」视图的左侧菜单项图标（CenterView.ts），运行时以 { size, className } 渲染。
 *
 * 数据语义图标（指标卡 / 图表标题上的那些）在 glyphs.ts；两者共用同一套
 * svgAttrs 默认值，观感一致：viewBox 固定 0 0 24 24、颜色走 currentColor
 * （跟随所在行的文字色/主题）、线性风格（stroke，圆帽）。
 */
import { svgAttrs } from './glyphs.js';
import type { AnyReact } from './types.js';

export function createIcons(React: AnyReact): {
  QuotaIcon: any;
  UsageIcon: any;
  OnlineIcon: any;
  SettingsIcon: any;
  ShareIcon: any;
} {
  const h = React.createElement;

  /** 基础 svg 属性（尺寸随 size 缩放，颜色继承）—— 与 glyphs.ts 共用同一实现 */
  const svgProps = svgAttrs;

  /** 额度：电池 + 已用刻度（剩余电量语义） */
  function QuotaIcon(props: any): any {
    return h(
      'svg',
      svgProps(props),
      h('rect', { key: 'body', x: 2.5, y: 7, width: 16, height: 10, rx: 2.6 }),
      h('path', { key: 'cap', d: 'M21.2 10.4v3.2' }),
      h('rect', {
        key: 'level',
        x: 5,
        y: 9.4,
        width: 6.4,
        height: 5.2,
        rx: 1.3,
        fill: 'currentColor',
        stroke: 'none',
      }),
    );
  }

  /** 用量：三根高低不同的柱（统计/趋势语义） */
  function UsageIcon(props: any): any {
    return h(
      'svg',
      svgProps(props),
      h('path', { key: 'a', d: 'M4.6 20v-6.4', strokeWidth: 2.6 }),
      h('path', { key: 'b', d: 'M12 20V5.4', strokeWidth: 2.6 }),
      h('path', { key: 'c', d: 'M19.4 20v-9.6', strokeWidth: 2.6 }),
    );
  }

  /** 在线时长：时钟 + 指针（时长/在场语义） */
  function OnlineIcon(props: any): any {
    return h(
      'svg',
      svgProps(props),
      h('circle', { key: 'face', cx: 12, cy: 12, r: 8.4 }),
      h('path', { key: 'hand', d: 'M12 7.6V12l3.2 2' }),
    );
  }

  /** 设置：两条滑杆 + 旋钮（配置/调节语义） */
  function SettingsIcon(props: any): any {
    return h(
      'svg',
      svgProps(props),
      h('path', { key: 'a1', d: 'M3.6 8h9' }),
      h('path', { key: 'a2', d: 'M18.4 8h2' }),
      h('circle', { key: 'a3', cx: 15.5, cy: 8, r: 2.3 }),
      h('path', { key: 'b1', d: 'M3.6 16h2' }),
      h('path', { key: 'b2', d: 'M11.4 16h9' }),
      h('circle', { key: 'b3', cx: 8.5, cy: 16, r: 2.3 }),
    );
  }

  /** 分享：方框 + 右上出箭 */
  function ShareIcon(props: any): any {
    return h(
      'svg',
      svgProps(props),
      h('path', {
        key: 'box',
        d: 'M12.6 4.6H5.4a1.8 1.8 0 0 0-1.8 1.8v12.2a1.8 1.8 0 0 0 1.8 1.8h12.2a1.8 1.8 0 0 0 1.8-1.8v-7.2',
      }),
      h('path', { key: 'arrow', d: 'M14.4 3.4h6.2v6.2' }),
      h('path', { key: 'diag', d: 'M20.6 3.4 11.4 12.6' }),
    );
  }

  return { QuotaIcon, UsageIcon, OnlineIcon, SettingsIcon, ShareIcon };
}
