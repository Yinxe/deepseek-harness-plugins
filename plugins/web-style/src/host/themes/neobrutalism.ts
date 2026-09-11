/**
 * neobrutalism.ts —— Neobrutalism 粗野拼贴（纯 light）。
 *
 * 参考 open-design/design-systems/neobrutalism：
 *   - 奶油 #fff4cf 画布 + 深咖文字 #2a1810，暖底高对比
 *   - 橘红 #d24b1f 品牌信号（CTA/激活边框/焦点环）
 *   - 硬偏移阴影是灵魂：3/5/8px 实色投影——本文件是全库唯一的阴影例外
 *   - 系统无衬线字体
 */

import { SANS, MONO, fillFontTokens, type ThemeMetaMap } from './shared.js';

export const light = fillFontTokens(
  {
    '--dsw-alias-bg-base': '#fff4cf',
    '--dsw-alias-bg-layer-1': '#fffaf0',
    '--dsw-alias-bg-layer-2': '#ffe8c2',
    '--dsw-alias-bg-layer-3': '#ffdca8',
    '--dsw-alias-bg-overlay': '#fffaf0',
    '--dsw-alias-bg-multi-select': '#fffaf0',
    '--dsw-alias-bg-module-platform': '#fffaf0',
    '--dsw-alias-bg-skeleton': '#fffaf0',

    '--dsw-alias-border-l1': '#efd0ab',
    '--dsw-alias-border-l2': '#d9aa7a',
    '--dsw-alias-border-l2-darkmode-thin': '#efd0ab',
    '--dsw-alias-border-l3': '#bd8f60',
    '--dsw-alias-border-l4': '#8a6652',
    '--dsw-alias-border-inverted': '#2a1810',
    '--dsw-alias-border-inverted2': '#593625',
    '--dsw-alias-separator-primary': '#efd0ab',
    '--dsw-alias-line-secondary': '#ffe8c2',
    '--dsw-alias-fill-l2': '#ffe8c2',
    '--dsw-alias-fill-tsp-secondary': 'rgba(42, 24, 16, 0.04)',

    /* 橘红：CTA 与激活信号 */
    '--dsw-alias-brand-primary': '#d24b1f',
    '--dsw-alias-brand-primary-invert': '#ffffff',
    '--dsw-alias-brand-text': '#d24b1f',

    '--dsw-alias-button-primary-fill': '#d24b1f',
    '--dsw-alias-button-primary-hover': '#c1451d',
    '--dsw-alias-button-primary-dimmed': '#b5411b',
    '--dsw-alias-button-contrast-fill': '#2a1810',
    '--dsw-alias-button-elevated-fill': '#fffaf0',
    '--dsw-alias-button-floating-fill': '#fffaf0',
    '--dsw-alias-button-floating-hover': '#ffe8c2',
    '--dsw-alias-button-ghost-active-border': '#d9aa7a',
    '--dsw-alias-button-ghost-active-fill': '#ffe8c2',
    '--dsw-alias-button-ghost-active-hover': '#ffdca8',
    '--dsw-alias-button-info-fill': '#d24b1f',
    '--dsw-alias-button-info-hover': '#c1451d',
    '--dsw-alias-button-tool-bar-fill': '#fffaf0',
    '--dsw-alias-button-tool-bar-fill-invisible': 'transparent',
    '--dsw-alias-button-tool-bar-hover': '#ffe8c2',

    '--dsw-alias-interactive-bg-hover': '#ffe8c2',
    '--dsw-alias-interactive-bg-active': '#ffdca8',
    '--dsw-alias-interactive-bg-hover-accent': 'rgba(210, 75, 31, 0.10)',
    '--dsw-alias-interactive-bg-hover-danger': 'rgba(184, 58, 47, 0.08)',
    '--dsw-alias-interactive-bg-hover-solid': '#ffdca8',

    '--dsw-alias-label-primary': '#2a1810',
    '--dsw-alias-label-secondary': '#593625',
    '--dsw-alias-label-tertiary': '#8a6652',
    '--dsw-alias-label-quaternary': '#bd8f60',
    '--dsw-alias-label-caption': '#8a6652',
    '--dsw-alias-label-dimmed': '#bd8f60',
    '--dsw-alias-label-error': '#b83a2f',
    '--dsw-alias-label-primary-foreground': '#ffffff',
    '--dsw-alias-label-primary-inverted': '#fffaf0',
    '--dsw-alias-label-primary-bluish': '#d24b1f',

    /* 警示琥珀在奶油底上压暗，保证文字可读 */
    '--dsw-alias-state-error-primary': '#b83a2f',
    '--dsw-alias-state-error-secondary': 'rgba(184, 58, 47, 0.08)',
    '--dsw-alias-state-success-primary': '#3d8f4f',
    '--dsw-alias-state-success-secondary': 'rgba(61, 143, 79, 0.10)',
    '--dsw-alias-state-warn-primary': '#9a6700',
    '--dsw-alias-state-warn-secondary': 'rgba(242, 169, 59, 0.10)',
    '--dsw-alias-state-warn-label': '#9a6700',

    '--dsw-alias-markdown-citation': '#d24b1f',
    '--dsw-alias-markdown-code-block': '#fffaf0',
    '--dsw-alias-markdown-code-block-banner': '#ffe8c2',
    '--dsw-alias-markdown-inline-code': 'rgba(210, 75, 31, 0.08)',
    '--dsw-alias-markdown-code-segment-selected': 'rgba(210, 75, 31, 0.12)',
    '--dsw-alias-markdown-code-segment-unselected': 'transparent',
    '--dsw-alias-markdown-placeholder': '#bd8f60',
    '--dsw-alias-markdown-tag': '#8a6652',

    '--dsw-alias-scrollbar-bg-l1': '#d9aa7a',
    '--dsw-alias-scrollbar-bg-l2': '#ffe8c2',
    '--dsw-alias-scrollbar-hover-l1': '#bd8f60',
    '--dsw-alias-scrollbar-hover-l2': '#d9aa7a',

    '--dsw-alias-toast-bg': '#fffaf0',
    '--dsw-alias-tooltip-bg': '#2a1810',
    '--dsw-hovercard-bg': '#fffaf0',

    '--dsw-specific-sidebar-fill': '#fff4cf',
    '--dsw-specific-sidebar-nav-item-active': '#ffe8c2',
    '--dsw-specific-sidebar-nav-item-active-accent': '#d24b1f',
    '--dsw-specific-sidebar-nav-item-hover': '#ffe8c2',
    '--dsw-specific-bubble': '#fffaf0',
    '--dsw-specific-bubble-highlight': '#ffe8c2',
    '--dsw-specific-input-major': '#fffaf0',
    '--dsw-specific-login-input': '#fffaf0',
    '--dsw-specific-menu': '#fffaf0',
    '--dsw-specific-selector': '#fffaf0',
    '--dsw-specific-tip': '#2a1810',

    '--dsw-font-family': SANS,
    '--dsw-font-mono': MONO,

    /* 唯一的阴影例外：硬偏移实色投影，三档由浅入深 */
    '--dsw-shadow-lv1': '3px 3px 0 #2a1810',
    '--dsw-shadow-lv2': '5px 5px 0 #2a1810',
    '--dsw-shadow-lv3': '8px 8px 0 #2a1810',
    '--dsw-shadow-lv1-blur': '0px',
  },
  SANS,
);

export const meta: ThemeMetaMap = {
  light: {
    id: 'neobrutalism-light',
    label: 'Neobrutalism 粗野拼贴',
    desc: '奶油 #fff4cf + 橘红 #d24b1f',
    swatch: ['#fff4cf', '#fffaf0', '#d24b1f', '#2a1810'],
  },
};
