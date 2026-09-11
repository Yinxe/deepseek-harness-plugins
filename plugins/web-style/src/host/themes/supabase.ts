/**
 * supabase.ts —— Supabase 翡翠夜（纯 dark）。
 *
 * 参考 open-design/design-systems/supabase：
 *   - 墨黑 #171717 画布（从不用纯黑），卡片 #1c1c1c 上浮一阶
 *   - 翡翠绿 #3ecf8e 只做信号色（logo / 链接 / 描边高光），交互绿 #00c573 做悬停
 *   - 描边即深度：标准 #2e2e2e / 内层 #242424；四阶文字 #fafafa → #4d4d4d
 *   - 系统无衬线字体
 */

import { SANS, MONO, FLAT_SHADOWS, fillFontTokens, type ThemeMetaMap } from './shared.js';

export const dark = fillFontTokens(
  {
    '--dsw-alias-bg-base': '#171717',
    '--dsw-alias-bg-layer-1': '#1c1c1c',
    '--dsw-alias-bg-layer-2': '#242424',
    '--dsw-alias-bg-layer-3': '#2e2e2e',
    '--dsw-alias-bg-overlay': '#1c1c1c',
    '--dsw-alias-bg-multi-select': '#1c1c1c',
    '--dsw-alias-bg-module-platform': '#1c1c1c',
    '--dsw-alias-bg-skeleton': '#242424',

    '--dsw-alias-border-l1': '#242424',
    '--dsw-alias-border-l2': '#2e2e2e',
    '--dsw-alias-border-l2-darkmode-thin': '#242424',
    '--dsw-alias-border-l3': '#363636',
    '--dsw-alias-border-l4': '#4d4d4d',
    '--dsw-alias-border-inverted': '#fafafa',
    '--dsw-alias-border-inverted2': '#b4b4b4',
    '--dsw-alias-separator-primary': '#242424',
    '--dsw-alias-line-secondary': '#242424',
    '--dsw-alias-fill-l2': '#242424',
    '--dsw-alias-fill-tsp-secondary': 'rgba(250, 250, 250, 0.05)',

    /* 翡翠绿：品牌信号（亮绿配深字，对比才够） */
    '--dsw-alias-brand-primary': '#3ecf8e',
    '--dsw-alias-brand-primary-invert': '#0f0f0f',
    '--dsw-alias-brand-text': '#3ecf8e',

    '--dsw-alias-button-primary-fill': '#3ecf8e',
    '--dsw-alias-button-primary-hover': '#00c573',
    '--dsw-alias-button-primary-dimmed': '#2aa872',
    '--dsw-alias-button-contrast-fill': '#fafafa',
    '--dsw-alias-button-elevated-fill': '#1c1c1c',
    '--dsw-alias-button-floating-fill': '#1c1c1c',
    '--dsw-alias-button-floating-hover': '#242424',
    '--dsw-alias-button-ghost-active-border': 'rgba(62, 207, 142, 0.3)',
    '--dsw-alias-button-ghost-active-fill': '#242424',
    '--dsw-alias-button-ghost-active-hover': '#2e2e2e',
    '--dsw-alias-button-info-fill': '#3ecf8e',
    '--dsw-alias-button-info-hover': '#00c573',
    '--dsw-alias-button-tool-bar-fill': '#1c1c1c',
    '--dsw-alias-button-tool-bar-fill-invisible': 'transparent',
    '--dsw-alias-button-tool-bar-hover': '#242424',

    '--dsw-alias-interactive-bg-hover': '#202020',
    '--dsw-alias-interactive-bg-active': '#2e2e2e',
    '--dsw-alias-interactive-bg-hover-accent': 'rgba(62, 207, 142, 0.15)',
    '--dsw-alias-interactive-bg-hover-danger': 'rgba(220, 38, 38, 0.15)',
    '--dsw-alias-interactive-bg-hover-solid': '#2e2e2e',

    '--dsw-alias-label-primary': '#fafafa',
    '--dsw-alias-label-secondary': '#b4b4b4',
    '--dsw-alias-label-tertiary': '#898989',
    '--dsw-alias-label-quaternary': '#4d4d4d',
    '--dsw-alias-label-caption': '#898989',
    '--dsw-alias-label-dimmed': '#4d4d4d',
    '--dsw-alias-label-error': '#dc2626',
    '--dsw-alias-label-primary-foreground': '#fafafa',
    '--dsw-alias-label-primary-inverted': '#171717',
    '--dsw-alias-label-primary-bluish': '#3ecf8e',

    '--dsw-alias-state-error-primary': '#dc2626',
    '--dsw-alias-state-error-secondary': 'rgba(220, 38, 38, 0.15)',
    '--dsw-alias-state-success-primary': '#16a34a',
    '--dsw-alias-state-success-secondary': 'rgba(22, 163, 74, 0.15)',
    '--dsw-alias-state-warn-primary': '#eab308',
    '--dsw-alias-state-warn-secondary': 'rgba(234, 179, 8, 0.15)',
    '--dsw-alias-state-warn-label': '#eab308',

    '--dsw-alias-markdown-citation': '#3ecf8e',
    '--dsw-alias-markdown-code-block': '#1c1c1c',
    '--dsw-alias-markdown-code-block-banner': '#242424',
    '--dsw-alias-markdown-inline-code': 'rgba(62, 207, 142, 0.12)',
    '--dsw-alias-markdown-code-segment-selected': 'rgba(62, 207, 142, 0.20)',
    '--dsw-alias-markdown-code-segment-unselected': 'transparent',
    '--dsw-alias-markdown-placeholder': '#4d4d4d',
    '--dsw-alias-markdown-tag': '#898989',

    '--dsw-alias-scrollbar-bg-l1': '#2e2e2e',
    '--dsw-alias-scrollbar-bg-l2': '#242424',
    '--dsw-alias-scrollbar-hover-l1': '#4d4d4d',
    '--dsw-alias-scrollbar-hover-l2': '#2e2e2e',

    '--dsw-alias-toast-bg': '#1c1c1c',
    '--dsw-alias-tooltip-bg': '#2e2e2e',
    '--dsw-hovercard-bg': '#242424',

    '--dsw-specific-sidebar-fill': '#171717',
    '--dsw-specific-sidebar-nav-item-active': '#2e2e2e',
    '--dsw-specific-sidebar-nav-item-active-accent': '#3ecf8e',
    '--dsw-specific-sidebar-nav-item-hover': '#202020',
    '--dsw-specific-bubble': '#1c1c1c',
    '--dsw-specific-bubble-highlight': '#242424',
    '--dsw-specific-input-major': '#1c1c1c',
    '--dsw-specific-login-input': '#1c1c1c',
    '--dsw-specific-menu': '#242424',
    '--dsw-specific-selector': '#242424',
    '--dsw-specific-tip': '#2e2e2e',

    '--dsw-font-family': SANS,
    '--dsw-font-mono': MONO,
    ...FLAT_SHADOWS,
  },
  SANS,
);

export const meta: ThemeMetaMap = {
  dark: {
    id: 'supabase-dark',
    label: 'Supabase 翡翠夜',
    desc: '墨黑 #171717 + 翡翠绿 #3ecf8e',
    swatch: ['#171717', '#1c1c1c', '#3ecf8e', '#fafafa'],
  },
};
