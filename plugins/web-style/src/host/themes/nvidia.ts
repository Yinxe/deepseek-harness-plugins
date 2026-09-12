/**
 * nvidia.ts —— NVIDIA 硬核绿（纯 dark）。
 *
 * 参考 open-design/design-systems/nvidia：
 *   - 纯黑 #000000 画布 —— 最大能量对比
 *   - NVIDIA 绿 #76b900 只做信号色（边框/下划线/激活指示），从不大面积填充
 *   - 悬停惊喜：绿 → 青 #1eaedb → 亮蓝 #007fff
 *   - 2px 圆角的精工硬件观感；系统无衬线字体
 */

import { SANS, MONO, FLAT_SHADOWS, fillFontTokens, type ThemeMetaMap } from './shared.js';

export const dark = fillFontTokens(
  {
    '--dsw-alias-bg-base': '#000000',
    '--dsw-alias-bg-layer-1': '#1a1a1a',
    '--dsw-alias-bg-layer-2': '#222222',
    '--dsw-alias-bg-layer-3': '#2a2a2a',
    '--dsw-alias-bg-overlay': '#1a1a1a',
    '--dsw-alias-bg-multi-select': '#1a1a1a',
    '--dsw-alias-bg-module-platform': '#1a1a1a',
    '--dsw-alias-bg-skeleton': '#1a1a1a',

    '--dsw-alias-border-l1': '#2a2a2a',
    '--dsw-alias-border-l2': '#5e5e5e',
    '--dsw-alias-border-l2-darkmode-thin': '#2a2a2a',
    '--dsw-alias-border-l3': '#7a7a7a',
    '--dsw-alias-border-l4': '#9a9a9a',
    '--dsw-alias-border-inverted': '#ffffff',
    '--dsw-alias-border-inverted2': '#a7a7a7',
    '--dsw-alias-separator-primary': '#2a2a2a',
    '--dsw-alias-fill-l2': '#222222',
    '--dsw-alias-fill-tsp-secondary': 'rgba(255, 255, 255, 0.05)',

    /* NVIDIA 绿：品牌指纹 */
    '--dsw-alias-brand-primary': '#76b900',
    '--dsw-alias-brand-primary-invert': '#000000',
    '--dsw-alias-brand-text': '#76b900',
    '--dsw-alias-link': '#76b900',

    /* 主按钮绿填充；悬停走"绿→青"的品牌惊喜 */
    '--dsw-alias-button-primary-fill': '#76b900',
    '--dsw-alias-button-primary-hover': '#1eaedb',
    '--dsw-alias-button-primary-dimmed': '#3f8500',
    '--dsw-alias-button-contrast-fill': '#ffffff',
    '--dsw-alias-button-elevated-fill': '#1a1a1a',
    '--dsw-alias-button-floating-fill': '#1a1a1a',
    '--dsw-alias-button-floating-hover': '#222222',
    '--dsw-alias-button-ghost-active-border': '#76b900',
    '--dsw-alias-button-ghost-active-fill': '#222222',
    '--dsw-alias-button-ghost-active-hover': '#2a2a2a',
    '--dsw-alias-button-info-fill': '#1eaedb',
    '--dsw-alias-button-info-hover': '#007fff',
    '--dsw-alias-button-tool-bar-fill': '#1a1a1a',
    '--dsw-alias-button-tool-bar-fill-invisible': 'transparent',
    '--dsw-alias-button-tool-bar-hover': '#222222',

    '--dsw-alias-interactive-bg-hover': '#161616',
    '--dsw-alias-interactive-bg-active': '#222222',
    '--dsw-alias-interactive-bg-hover-accent': 'rgba(118, 185, 0, 0.15)',
    '--dsw-alias-interactive-bg-hover-danger': 'rgba(229, 32, 32, 0.15)',
    '--dsw-alias-interactive-bg-hover-solid': '#222222',

    '--dsw-alias-label-primary': '#ffffff',
    '--dsw-alias-label-secondary': '#a7a7a7',
    '--dsw-alias-label-tertiary': '#898989',
    '--dsw-alias-label-quaternary': '#757575',
    '--dsw-alias-label-caption': '#898989',
    '--dsw-alias-label-dimmed': '#757575',
    '--dsw-alias-label-error': '#e52020',
    '--dsw-alias-label-primary-foreground': '#ffffff',
    '--dsw-alias-label-primary-inverted': '#000000',
    '--dsw-alias-label-primary-bluish': '#1eaedb',

    '--dsw-alias-state-business-primary': '#76b900',
    '--dsw-alias-state-business-tertiary': 'rgba(118, 185, 0, 0.15)',
    /* 成功绿用更深的 #3f8500 与品牌绿区分 */
    '--dsw-alias-state-error-primary': '#e52020',
    '--dsw-alias-state-error-secondary': 'rgba(229, 32, 32, 0.15)',
    '--dsw-alias-state-success-primary': '#76b900',
    '--dsw-alias-state-success-secondary': 'rgba(118, 185, 0, 0.15)',
    '--dsw-alias-state-warn-primary': '#ef9100',
    '--dsw-alias-state-warn-secondary': 'rgba(239, 145, 0, 0.15)',
    '--dsw-alias-state-warn-label': '#ef9100',

    '--dsw-alias-markdown-citation': '#76b900',
    '--dsw-alias-markdown-code-block': '#1a1a1a',
    '--dsw-alias-markdown-code-block-banner': '#222222',
    '--dsw-alias-markdown-inline-code': 'rgba(118, 185, 0, 0.10)',
    '--dsw-alias-markdown-code-segment-selected': 'rgba(118, 185, 0, 0.18)',
    '--dsw-alias-markdown-code-segment-unselected': 'transparent',
    '--dsw-alias-markdown-placeholder': '#757575',

    '--dsw-alias-scrollbar-bg-l1': '#2a2a2a',
    '--dsw-alias-scrollbar-bg-l2': '#222222',
    '--dsw-alias-scrollbar-hover-l1': '#5e5e5e',
    '--dsw-alias-scrollbar-hover-l2': '#2a2a2a',

    '--dsw-alias-toast-bg': '#1a1a1a',
    '--dsw-alias-tooltip-bg': '#2a2a2a',
    '--dsw-hovercard-bg': '#222222',
    '--dsw-specific-sidebar-fill': '#000000',
    '--dsw-specific-sidebar-nav-item-active': 'rgba(118, 185, 0, 0.22)',
    '--dsw-specific-sidebar-nav-item-active-accent': '#76b900',
    '--dsw-specific-sidebar-nav-item-hover': '#161616',
    '--dsw-specific-bubble': '#1a1a1a',
    '--dsw-specific-bubble-highlight': '#222222',
    '--dsw-specific-input-major': '#1a1a1a',
    '--dsw-specific-login-input': '#1a1a1a',
    '--dsw-specific-menu': '#222222',
    '--dsw-specific-selector': '#222222',
    '--dsw-specific-tip': '#2a2a2a',

    '--dsw-font-family': SANS,
    '--dsw-font-mono': MONO,
    ...FLAT_SHADOWS,
  },
  SANS,
);

export const meta: ThemeMetaMap = {
  dark: {
    id: 'nvidia-dark',
    label: 'NVIDIA 硬核绿',
    desc: '纯黑 #000 + 信号绿 #76b900',
    swatch: ['#000000', '#1a1a1a', '#76b900', '#ffffff'],
  },
};
