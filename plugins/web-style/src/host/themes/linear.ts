/**
 * linear.ts —— Linear 暗夜无彩（纯 dark）。
 *
 * 参考 open-design/design-systems/linear-app：
 *   - 近黑 #08090a 画布，信息密度靠亮度台阶而非色相
 *   - 半透明白边框（rgba(255,255,255,0.08)）贯穿全局
 *   - 几乎无彩：唯一彩色是 Indigo #5e6ad2（CTA / 激活态）
 *   - Inter Variable + 签名字重；深度靠亮度阶，不靠阴影
 */

import { INTER, MONO, FLAT_SHADOWS, fillFontTokens, type ThemeMetaMap } from './shared.js';

export const dark = fillFontTokens(
  {
    '--dsw-alias-bg-base': '#08090a',
    '--dsw-alias-bg-layer-1': '#191a1b',
    '--dsw-alias-bg-layer-2': '#1f2022',
    '--dsw-alias-bg-layer-3': '#252629',
    '--dsw-alias-bg-overlay': '#191a1b',
    '--dsw-alias-bg-multi-select': '#191a1b',
    '--dsw-alias-bg-module-platform': '#191a1b',
    '--dsw-alias-bg-skeleton': '#191a1b',

    /* 半透明白边框 —— Linear 的深度全靠这层 */
    '--dsw-alias-border-l1': 'rgba(255, 255, 255, 0.08)',
    '--dsw-alias-border-l2': 'rgba(255, 255, 255, 0.14)',
    '--dsw-alias-border-l2-darkmode-thin': 'rgba(255, 255, 255, 0.08)',
    '--dsw-alias-border-l3': 'rgba(255, 255, 255, 0.22)',
    '--dsw-alias-border-l4': 'rgba(255, 255, 255, 0.35)',
    '--dsw-alias-border-inverted': '#f7f8f8',
    '--dsw-alias-border-inverted2': '#d0d6e0',
    '--dsw-alias-separator-primary': 'rgba(255, 255, 255, 0.08)',
    '--dsw-alias-line-secondary': 'rgba(255, 255, 255, 0.05)',
    '--dsw-alias-fill-l2': '#1f2022',
    '--dsw-alias-fill-tsp-secondary': 'rgba(247, 248, 248, 0.05)',

    /* Indigo：#5e6ad2 → hover #828fff（更亮的饱和悬停） */
    '--dsw-alias-brand-primary': '#5e6ad2',
    '--dsw-alias-brand-primary-invert': '#ffffff',
    '--dsw-alias-brand-text': '#828fff',

    '--dsw-alias-button-primary-fill': '#5e6ad2',
    '--dsw-alias-button-primary-hover': '#828fff',
    '--dsw-alias-button-primary-dimmed': '#4752c4',
    '--dsw-alias-button-contrast-fill': '#f7f8f8',
    '--dsw-alias-button-elevated-fill': '#191a1b',
    '--dsw-alias-button-floating-fill': '#191a1b',
    '--dsw-alias-button-floating-hover': '#1f2022',
    '--dsw-alias-button-ghost-active-border': 'rgba(255, 255, 255, 0.14)',
    '--dsw-alias-button-ghost-active-fill': '#1f2022',
    '--dsw-alias-button-ghost-active-hover': '#252629',
    '--dsw-alias-button-info-fill': '#5e6ad2',
    '--dsw-alias-button-info-hover': '#828fff',
    '--dsw-alias-button-tool-bar-fill': '#191a1b',
    '--dsw-alias-button-tool-bar-fill-invisible': 'transparent',
    '--dsw-alias-button-tool-bar-hover': '#1f2022',

    /* 交互态全走半透明白，不引入新色相 */
    '--dsw-alias-interactive-bg-hover': 'rgba(255, 255, 255, 0.06)',
    '--dsw-alias-interactive-bg-active': 'rgba(255, 255, 255, 0.10)',
    '--dsw-alias-interactive-bg-hover-accent': 'rgba(94, 106, 210, 0.25)',
    '--dsw-alias-interactive-bg-hover-danger': 'rgba(220, 38, 38, 0.20)',
    '--dsw-alias-interactive-bg-hover-solid': '#1f2022',

    '--dsw-alias-label-primary': '#f7f8f8',
    '--dsw-alias-label-secondary': '#d0d6e0',
    '--dsw-alias-label-tertiary': '#8f959f',
    '--dsw-alias-label-quaternary': '#6a707a',
    '--dsw-alias-label-caption': '#8f959f',
    '--dsw-alias-label-dimmed': '#6a707a',
    '--dsw-alias-label-error': '#dc2626',
    '--dsw-alias-label-primary-foreground': '#f7f8f8',
    '--dsw-alias-label-primary-inverted': '#08090a',
    '--dsw-alias-label-primary-bluish': '#828fff',

    '--dsw-alias-state-error-primary': '#dc2626',
    '--dsw-alias-state-error-secondary': 'rgba(220, 38, 38, 0.15)',
    '--dsw-alias-state-success-primary': '#27a644',
    '--dsw-alias-state-success-secondary': 'rgba(39, 166, 68, 0.15)',
    '--dsw-alias-state-warn-primary': '#eab308',
    '--dsw-alias-state-warn-secondary': 'rgba(234, 179, 8, 0.15)',
    '--dsw-alias-state-warn-label': '#eab308',

    '--dsw-alias-markdown-citation': '#828fff',
    '--dsw-alias-markdown-code-block': '#191a1b',
    '--dsw-alias-markdown-code-block-banner': '#1f2022',
    '--dsw-alias-markdown-inline-code': 'rgba(130, 143, 255, 0.12)',
    '--dsw-alias-markdown-code-segment-selected': 'rgba(94, 106, 210, 0.25)',
    '--dsw-alias-markdown-code-segment-unselected': 'transparent',
    '--dsw-alias-markdown-placeholder': '#6a707a',
    '--dsw-alias-markdown-tag': '#8f959f',

    '--dsw-alias-scrollbar-bg-l1': 'rgba(255, 255, 255, 0.10)',
    '--dsw-alias-scrollbar-bg-l2': 'rgba(255, 255, 255, 0.06)',
    '--dsw-alias-scrollbar-hover-l1': 'rgba(255, 255, 255, 0.20)',
    '--dsw-alias-scrollbar-hover-l2': 'rgba(255, 255, 255, 0.12)',

    '--dsw-alias-toast-bg': '#191a1b',
    '--dsw-alias-tooltip-bg': '#252629',
    '--dsw-hovercard-bg': '#1f2022',
    '--dsw-specific-sidebar-fill': '#08090a',
    '--dsw-specific-sidebar-nav-item-active': 'rgba(255, 255, 255, 0.10)',
    '--dsw-specific-sidebar-nav-item-active-accent': '#5e6ad2',
    '--dsw-specific-sidebar-nav-item-hover': 'rgba(255, 255, 255, 0.06)',
    '--dsw-specific-bubble': '#191a1b',
    '--dsw-specific-bubble-highlight': '#1f2022',
    '--dsw-specific-input-major': '#191a1b',
    '--dsw-specific-login-input': '#191a1b',
    '--dsw-specific-menu': '#1f2022',
    '--dsw-specific-selector': '#1f2022',
    '--dsw-specific-tip': '#252629',

    '--dsw-font-family': INTER,
    '--dsw-font-mono': MONO,
    ...FLAT_SHADOWS,
  },
  INTER,
);

export const meta: ThemeMetaMap = {
  dark: {
    id: 'linear-dark',
    label: 'Linear 暗夜无彩',
    desc: '近黑 #08090a + Indigo #5e6ad2',
    swatch: ['#08090a', '#191a1b', '#5e6ad2', '#f7f8f8'],
  },
};
