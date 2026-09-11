/**
 * tide.ts —— Tide 潮汐青（纯 dark，原创）。
 *
 * 原创配色（结构参考 open-design/design-systems/nvidia 的纯黑信号骨架）：
 *   - 深青 #062a2c 画布 + 三层青灰表面，深海纵深
 *   - 潮汐青 #2dd4bf 品牌信号 + 海蓝 #38bdf8 信息点缀
 *   - 系统无衬线字体；扁平无阴影
 */

import { SANS, MONO, FLAT_SHADOWS, fillFontTokens, type ThemeMetaMap } from './shared.js';

export const dark = fillFontTokens(
  {
    '--dsw-alias-bg-base': '#062a2c',
    '--dsw-alias-bg-layer-1': '#0b3538',
    '--dsw-alias-bg-layer-2': '#104144',
    '--dsw-alias-bg-layer-3': '#174f52',
    '--dsw-alias-bg-overlay': '#0b3538',
    '--dsw-alias-bg-multi-select': '#0b3538',
    '--dsw-alias-bg-module-platform': '#0b3538',
    '--dsw-alias-bg-skeleton': '#0b3538',

    '--dsw-alias-border-l1': '#174f52',
    '--dsw-alias-border-l2': '#3d7a7d',
    '--dsw-alias-border-l2-darkmode-thin': '#174f52',
    '--dsw-alias-border-l3': '#5b9a9d',
    '--dsw-alias-border-l4': '#7fbabd',
    '--dsw-alias-border-inverted': '#eafaf8',
    '--dsw-alias-border-inverted2': '#b5deda',
    '--dsw-alias-separator-primary': '#174f52',
    '--dsw-alias-line-secondary': '#104144',
    '--dsw-alias-fill-l2': '#104144',
    '--dsw-alias-fill-tsp-secondary': 'rgba(234, 250, 248, 0.05)',

    /* 潮汐青：品牌信号 */
    '--dsw-alias-brand-primary': '#2dd4bf',
    '--dsw-alias-brand-primary-invert': '#062a2c',
    '--dsw-alias-brand-text': '#5eead4',

    '--dsw-alias-button-primary-fill': '#2dd4bf',
    '--dsw-alias-button-primary-hover': '#5eead4',
    '--dsw-alias-button-primary-dimmed': '#0d9488',
    '--dsw-alias-button-contrast-fill': '#eafaf8',
    '--dsw-alias-button-elevated-fill': '#0b3538',
    '--dsw-alias-button-floating-fill': '#0b3538',
    '--dsw-alias-button-floating-hover': '#104144',
    '--dsw-alias-button-ghost-active-border': '#3d7a7d',
    '--dsw-alias-button-ghost-active-fill': '#104144',
    '--dsw-alias-button-ghost-active-hover': '#174f52',
    '--dsw-alias-button-info-fill': '#38bdf8',
    '--dsw-alias-button-info-hover': '#7dd3fc',
    '--dsw-alias-button-tool-bar-fill': '#0b3538',
    '--dsw-alias-button-tool-bar-fill-invisible': 'transparent',
    '--dsw-alias-button-tool-bar-hover': '#104144',

    '--dsw-alias-interactive-bg-hover': '#0d3a3d',
    '--dsw-alias-interactive-bg-active': '#104144',
    '--dsw-alias-interactive-bg-hover-accent': 'rgba(45, 212, 191, 0.15)',
    '--dsw-alias-interactive-bg-hover-danger': 'rgba(248, 113, 113, 0.15)',
    '--dsw-alias-interactive-bg-hover-solid': '#104144',

    '--dsw-alias-label-primary': '#eafaf8',
    '--dsw-alias-label-secondary': '#b5deda',
    '--dsw-alias-label-tertiary': '#7fa8a5',
    '--dsw-alias-label-quaternary': '#527a78',
    '--dsw-alias-label-caption': '#7fa8a5',
    '--dsw-alias-label-dimmed': '#527a78',
    '--dsw-alias-label-error': '#f87171',
    '--dsw-alias-label-primary-foreground': '#eafaf8',
    '--dsw-alias-label-primary-inverted': '#062a2c',
    '--dsw-alias-label-primary-bluish': '#38bdf8',

    '--dsw-alias-state-error-primary': '#f87171',
    '--dsw-alias-state-error-secondary': 'rgba(248, 113, 113, 0.15)',
    '--dsw-alias-state-success-primary': '#34d399',
    '--dsw-alias-state-success-secondary': 'rgba(52, 211, 153, 0.15)',
    '--dsw-alias-state-warn-primary': '#fbbf24',
    '--dsw-alias-state-warn-secondary': 'rgba(251, 191, 36, 0.15)',
    '--dsw-alias-state-warn-label': '#fbbf24',

    '--dsw-alias-markdown-citation': '#5eead4',
    '--dsw-alias-markdown-code-block': '#0b3538',
    '--dsw-alias-markdown-code-block-banner': '#104144',
    '--dsw-alias-markdown-inline-code': 'rgba(45, 212, 191, 0.10)',
    '--dsw-alias-markdown-code-segment-selected': 'rgba(45, 212, 191, 0.20)',
    '--dsw-alias-markdown-code-segment-unselected': 'transparent',
    '--dsw-alias-markdown-placeholder': '#527a78',
    '--dsw-alias-markdown-tag': '#7fa8a5',

    '--dsw-alias-scrollbar-bg-l1': '#3d7a7d',
    '--dsw-alias-scrollbar-bg-l2': '#104144',
    '--dsw-alias-scrollbar-hover-l1': '#7fa8a5',
    '--dsw-alias-scrollbar-hover-l2': '#3d7a7d',

    '--dsw-alias-toast-bg': '#0b3538',
    '--dsw-alias-tooltip-bg': '#174f52',
    '--dsw-hovercard-bg': '#104144',

    '--dsw-specific-sidebar-fill': '#062a2c',
    '--dsw-specific-sidebar-nav-item-active': '#104144',
    '--dsw-specific-sidebar-nav-item-active-accent': '#2dd4bf',
    '--dsw-specific-sidebar-nav-item-hover': '#0d3a3d',
    '--dsw-specific-bubble': '#0b3538',
    '--dsw-specific-bubble-highlight': '#104144',
    '--dsw-specific-input-major': '#0b3538',
    '--dsw-specific-login-input': '#0b3538',
    '--dsw-specific-menu': '#104144',
    '--dsw-specific-selector': '#104144',
    '--dsw-specific-tip': '#174f52',

    '--dsw-font-family': SANS,
    '--dsw-font-mono': MONO,
    ...FLAT_SHADOWS,
  },
  SANS,
);

export const meta: ThemeMetaMap = {
  dark: {
    id: 'tide-dark',
    label: 'Tide 潮汐青',
    desc: '深青 #062a2c + 潮汐 #2dd4bf',
    swatch: ['#062a2c', '#0b3538', '#2dd4bf', '#eafaf8'],
  },
};
