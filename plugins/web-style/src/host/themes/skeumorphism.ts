/**
 * skeumorphism.ts —— Skeumorphism 拟物陶土（纯 light）。
 *
 * 参考 open-design/design-systems/skeumorphism：
 *   - 暖陶底 #f7eee6 + 奶油面 #fff8f1 + 做旧描边 #dac8b9
 *   - 陶釉强调 #b46a46（CTA / 焦点环 / 元文本）
 *   - 柔和拟物阴影（本主题唯一例外，不用 FLAT_SHADOWS）
 *   - 系统无衬线字体
 */

import { SANS, MONO, fillFontTokens, type ThemeMetaMap } from './shared.js';

export const light = fillFontTokens(
  {
    '--dsw-alias-bg-base': '#f7eee6',
    '--dsw-alias-bg-layer-1': '#fff8f1',
    '--dsw-alias-bg-layer-2': '#f2e3d3',
    '--dsw-alias-bg-layer-3': '#ead6c7',
    '--dsw-alias-bg-overlay': '#fff8f1',
    '--dsw-alias-bg-multi-select': '#f2e3d3',
    '--dsw-alias-bg-module-platform': '#fff8f1',
    '--dsw-alias-bg-skeleton': '#f2e3d3',

    '--dsw-alias-border-l1': '#eaded4',
    '--dsw-alias-border-l2': '#dac8b9',
    '--dsw-alias-border-l2-darkmode-thin': '#eaded4',
    '--dsw-alias-border-l3': '#c9b3a1',
    '--dsw-alias-border-l4': '#8a7a70',
    '--dsw-alias-border-inverted': '#2b211c',
    '--dsw-alias-border-inverted2': '#5a4b43',
    '--dsw-alias-separator-primary': '#eaded4',
    '--dsw-alias-fill-l2': '#f2e3d3',
    '--dsw-alias-fill-tsp-secondary': 'rgba(43, 33, 28, 0.05)',

    /* 陶釉：品牌指纹 */
    '--dsw-alias-brand-primary': '#b46a46',
    '--dsw-alias-brand-primary-invert': '#ffffff',
    '--dsw-alias-brand-text': '#b46a46',
    '--dsw-alias-link': '#b46a46',

    '--dsw-alias-button-primary-fill': '#b46a46',
    '--dsw-alias-button-primary-hover': '#a66240',
    '--dsw-alias-button-primary-dimmed': '#9b5b3c',
    '--dsw-alias-button-contrast-fill': '#2b211c',
    '--dsw-alias-button-elevated-fill': '#fff8f1',
    '--dsw-alias-button-floating-fill': '#fff8f1',
    '--dsw-alias-button-floating-hover': '#f2e3d3',
    '--dsw-alias-button-ghost-active-border': '#dac8b9',
    '--dsw-alias-button-ghost-active-fill': '#f2e3d3',
    '--dsw-alias-button-ghost-active-hover': '#ead6c7',
    '--dsw-alias-button-info-fill': '#b46a46',
    '--dsw-alias-button-info-hover': '#a66240',
    '--dsw-alias-button-tool-bar-fill': '#fff8f1',
    '--dsw-alias-button-tool-bar-fill-invisible': 'transparent',
    '--dsw-alias-button-tool-bar-hover': '#f2e3d3',

    '--dsw-alias-interactive-bg-hover': '#f2e3d3',
    '--dsw-alias-interactive-bg-active': '#ead6c7',
    '--dsw-alias-interactive-bg-hover-accent': 'rgba(180, 106, 70, 0.12)',
    '--dsw-alias-interactive-bg-hover-danger': 'rgba(184, 76, 76, 0.12)',
    '--dsw-alias-interactive-bg-hover-solid': '#ead6c7',

    '--dsw-alias-label-primary': '#2b211c',
    '--dsw-alias-label-secondary': '#5a4b43',
    '--dsw-alias-label-tertiary': '#8a7a70',
    '--dsw-alias-label-quaternary': '#b39d8d',
    '--dsw-alias-label-caption': '#8a7a70',
    '--dsw-alias-label-dimmed': '#b39d8d',
    '--dsw-alias-label-error': '#b84c4c',
    '--dsw-alias-label-primary-foreground': '#ffffff',
    '--dsw-alias-label-primary-inverted': '#fff8f1',
    '--dsw-alias-label-primary-bluish': '#b46a46',

    '--dsw-alias-state-business-primary': '#b46a46',
    '--dsw-alias-state-business-tertiary': 'rgba(180, 106, 70, 0.12)',
    '--dsw-alias-state-error-primary': '#b84c4c',
    '--dsw-alias-state-error-secondary': 'rgba(184, 76, 76, 0.10)',
    '--dsw-alias-state-success-primary': '#4d8f5a',
    '--dsw-alias-state-success-secondary': 'rgba(77, 143, 90, 0.12)',
    '--dsw-alias-state-warn-primary': '#c88735',
    '--dsw-alias-state-warn-secondary': 'rgba(200, 135, 53, 0.12)',
    '--dsw-alias-state-warn-label': '#c88735',

    '--dsw-alias-markdown-citation': '#b46a46',
    '--dsw-alias-markdown-code-block': '#fff8f1',
    '--dsw-alias-markdown-code-block-banner': '#f2e3d3',
    '--dsw-alias-markdown-inline-code': 'rgba(180, 106, 70, 0.10)',
    '--dsw-alias-markdown-code-segment-selected': 'rgba(180, 106, 70, 0.14)',
    '--dsw-alias-markdown-code-segment-unselected': 'transparent',
    '--dsw-alias-markdown-placeholder': '#b39d8d',

    '--dsw-alias-scrollbar-bg-l1': '#dac8b9',
    '--dsw-alias-scrollbar-bg-l2': '#ead6c7',
    '--dsw-alias-scrollbar-hover-l1': '#b46a46',
    '--dsw-alias-scrollbar-hover-l2': '#dac8b9',

    '--dsw-alias-toast-bg': '#fff8f1',
    '--dsw-alias-tooltip-bg': '#2b211c',
    '--dsw-hovercard-bg': '#fff8f1',

    '--dsw-specific-sidebar-fill': '#f7eee6',
    '--dsw-specific-sidebar-nav-item-active': 'rgba(180, 106, 70, 0.22)',
    '--dsw-specific-sidebar-nav-item-active-accent': '#b46a46',
    '--dsw-specific-sidebar-nav-item-hover': '#f2e3d3',
    '--dsw-specific-bubble': '#fff8f1',
    '--dsw-specific-bubble-highlight': '#f2e3d3',
    '--dsw-specific-input-major': '#fff8f1',
    '--dsw-specific-login-input': '#fff8f1',
    '--dsw-specific-menu': '#fff8f1',
    '--dsw-specific-selector': '#fff8f1',
    '--dsw-specific-tip': '#ead6c7',

    '--dsw-font-family': SANS,
    '--dsw-font-mono': MONO,

    /* 拟物柔和阴影（本主题唯一例外：不用 FLAT_SHADOWS） */
    '--dsw-shadow-lv1': '0 2px 6px rgba(43, 33, 28, 0.12)',
    '--dsw-shadow-lv2': '0 4px 12px rgba(43, 33, 28, 0.12)',
    '--dsw-shadow-lv3': '0 8px 20px rgba(43, 33, 28, 0.12)',
    '--dsw-shadow-lv1-blur': '6px',
  },
  SANS,
);

export const meta: ThemeMetaMap = {
  light: {
    id: 'skeumorphism-light',
    label: 'Skeumorphism 拟物陶土',
    desc: '陶土 #f7eee6 + 陶釉 #b46a46',
    swatch: ['#f7eee6', '#fff8f1', '#b46a46', '#2b211c'],
  },
};
