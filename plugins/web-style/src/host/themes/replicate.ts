/**
 * replicate.ts —— Replicate 开发者红（纯 light）。
 *
 * 参考 open-design/design-systems/replicate：
 *   - 纯白 #ffffff 画布 + Replicate 深灰 #202020 文字/描边
 *   - 品牌红 #ea2804 只做渐变与高光信号，不大面积填充
 *   - 以描边和底色营造深度，不用阴影（扁平）
 *   - 状态绿 #2b9a66（running / operational 徽标）
 *   - 系统无衬线正文，等宽栈复用 MONO（JetBrains Mono 替代）
 */

import { SANS, MONO, FLAT_SHADOWS, fillFontTokens, type ThemeMetaMap } from './shared.js';

export const light = fillFontTokens(
  {
    '--dsw-alias-bg-base': '#ffffff',
    '--dsw-alias-bg-layer-1': '#f8f8f8',
    '--dsw-alias-bg-layer-2': '#efefef',
    '--dsw-alias-bg-layer-3': '#e5e5e5',
    '--dsw-alias-bg-overlay': '#ffffff',
    '--dsw-alias-bg-multi-select': '#f8f8f8',
    '--dsw-alias-bg-module-platform': '#f8f8f8',
    '--dsw-alias-bg-skeleton': '#f8f8f8',

    '--dsw-alias-border-l1': '#e5e5e5',
    '--dsw-alias-border-l2': '#bbbbbb',
    '--dsw-alias-border-l2-darkmode-thin': '#e5e5e5',
    '--dsw-alias-border-l3': '#8d8d8d',
    '--dsw-alias-border-l4': '#4e4e4e',
    '--dsw-alias-border-inverted': '#202020',
    '--dsw-alias-border-inverted2': '#4e4e4e',
    '--dsw-alias-separator-primary': '#e5e5e5',
    '--dsw-alias-line-secondary': '#efefef',
    '--dsw-alias-fill-l2': '#efefef',
    '--dsw-alias-fill-tsp-secondary': 'rgba(32, 32, 32, 0.04)',

    /* 品牌红：主操作与高光 */
    '--dsw-alias-brand-primary': '#ea2804',
    '--dsw-alias-brand-primary-invert': '#ffffff',
    '--dsw-alias-brand-text': '#ea2804',

    '--dsw-alias-button-primary-fill': '#ea2804',
    '--dsw-alias-button-primary-hover': '#d42403',
    '--dsw-alias-button-primary-dimmed': '#b01e02',
    '--dsw-alias-button-contrast-fill': '#202020',
    '--dsw-alias-button-elevated-fill': '#ffffff',
    '--dsw-alias-button-floating-fill': '#ffffff',
    '--dsw-alias-button-floating-hover': '#f8f8f8',
    '--dsw-alias-button-ghost-active-border': '#bbbbbb',
    '--dsw-alias-button-ghost-active-fill': '#efefef',
    '--dsw-alias-button-ghost-active-hover': '#e5e5e5',
    '--dsw-alias-button-info-fill': '#ea2804',
    '--dsw-alias-button-info-hover': '#d42403',
    '--dsw-alias-button-tool-bar-fill': '#f8f8f8',
    '--dsw-alias-button-tool-bar-fill-invisible': 'transparent',
    '--dsw-alias-button-tool-bar-hover': '#efefef',

    '--dsw-alias-interactive-bg-hover': '#f8f8f8',
    '--dsw-alias-interactive-bg-active': '#efefef',
    '--dsw-alias-interactive-bg-hover-accent': 'rgba(234, 40, 4, 0.10)',
    '--dsw-alias-interactive-bg-hover-danger': 'rgba(220, 38, 38, 0.08)',
    '--dsw-alias-interactive-bg-hover-solid': '#efefef',

    '--dsw-alias-label-primary': '#202020',
    '--dsw-alias-label-secondary': '#4e4e4e',
    '--dsw-alias-label-tertiary': '#646464',
    '--dsw-alias-label-quaternary': '#8d8d8d',
    '--dsw-alias-label-caption': '#646464',
    '--dsw-alias-label-dimmed': '#8d8d8d',
    '--dsw-alias-label-error': '#dc2626',
    '--dsw-alias-label-primary-foreground': '#ffffff',
    '--dsw-alias-label-primary-inverted': '#ffffff',
    '--dsw-alias-label-primary-bluish': '#ea2804',

    '--dsw-alias-state-error-primary': '#dc2626',
    '--dsw-alias-state-error-secondary': 'rgba(220, 38, 38, 0.08)',
    '--dsw-alias-state-success-primary': '#2b9a66',
    '--dsw-alias-state-success-secondary': 'rgba(43, 154, 102, 0.10)',
    '--dsw-alias-state-warn-primary': '#9a6700',
    '--dsw-alias-state-warn-secondary': 'rgba(234, 179, 8, 0.10)',
    '--dsw-alias-state-warn-label': '#9a6700',

    '--dsw-alias-markdown-citation': '#ea2804',
    '--dsw-alias-markdown-code-block': '#f8f8f8',
    '--dsw-alias-markdown-code-block-banner': '#efefef',
    '--dsw-alias-markdown-inline-code': 'rgba(234, 40, 4, 0.08)',
    '--dsw-alias-markdown-code-segment-selected': 'rgba(234, 40, 4, 0.12)',
    '--dsw-alias-markdown-code-segment-unselected': 'transparent',
    '--dsw-alias-markdown-placeholder': '#8d8d8d',
    '--dsw-alias-markdown-tag': '#646464',

    '--dsw-alias-scrollbar-bg-l1': '#e5e5e5',
    '--dsw-alias-scrollbar-bg-l2': '#efefef',
    '--dsw-alias-scrollbar-hover-l1': '#bbbbbb',
    '--dsw-alias-scrollbar-hover-l2': '#e5e5e5',

    '--dsw-alias-toast-bg': '#ffffff',
    '--dsw-alias-tooltip-bg': '#202020',
    '--dsw-hovercard-bg': '#ffffff',

    '--dsw-specific-sidebar-fill': '#f8f8f8',
    '--dsw-specific-sidebar-nav-item-active': '#efefef',
    '--dsw-specific-sidebar-nav-item-active-accent': '#ea2804',
    '--dsw-specific-sidebar-nav-item-hover': '#efefef',
    '--dsw-specific-bubble': '#f8f8f8',
    '--dsw-specific-bubble-highlight': '#efefef',
    '--dsw-specific-input-major': '#f8f8f8',
    '--dsw-specific-login-input': '#f8f8f8',
    '--dsw-specific-menu': '#ffffff',
    '--dsw-specific-selector': '#ffffff',
    '--dsw-specific-tip': '#202020',

    '--dsw-font-family': SANS,
    '--dsw-font-mono': MONO,
    ...FLAT_SHADOWS,
  },
  SANS,
);

export const meta: ThemeMetaMap = {
  light: {
    id: 'replicate-light',
    label: 'Replicate 开发者红',
    desc: '纯白 #ffffff + 品牌红 #ea2804',
    swatch: ['#ffffff', '#f8f8f8', '#ea2804', '#202020'],
  },
};
