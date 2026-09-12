/**
 * nebula.ts —— Nebula 星云紫（纯 dark，原创）。
 *
 * 原创配色（结构参考 open-design/design-systems/linear-app 的暗夜无彩骨架）：
 *   - 紫黑 #0d0a1a 画布 + 三层紫灰表面，星云纵深
 *   - 霓紫 #8b5cf6 品牌信号 + 品红 #d946ef 信息点缀（双霓色，但只在交互处出现）
 *   - 系统无衬线字体；扁平无阴影
 */

import { SANS, MONO, FLAT_SHADOWS, fillFontTokens, type ThemeMetaMap } from './shared.js';

export const dark = fillFontTokens(
  {
    '--dsw-alias-bg-base': '#0d0a1a',
    '--dsw-alias-bg-layer-1': '#161230',
    '--dsw-alias-bg-layer-2': '#1e1840',
    '--dsw-alias-bg-layer-3': '#282058',
    '--dsw-alias-bg-overlay': '#161230',
    '--dsw-alias-bg-multi-select': '#161230',
    '--dsw-alias-bg-module-platform': '#161230',
    '--dsw-alias-bg-skeleton': '#161230',

    '--dsw-alias-border-l1': '#2a2350',
    '--dsw-alias-border-l2': '#554a8a',
    '--dsw-alias-border-l2-darkmode-thin': '#2a2350',
    '--dsw-alias-border-l3': '#6d63a8',
    '--dsw-alias-border-l4': '#8b7fc7',
    '--dsw-alias-border-inverted': '#f1edfd',
    '--dsw-alias-border-inverted2': '#c9bff0',
    '--dsw-alias-separator-primary': '#2a2350',
    '--dsw-alias-fill-l2': '#1e1840',
    '--dsw-alias-fill-tsp-secondary': 'rgba(241, 237, 253, 0.05)',

    /* 霓紫：品牌信号 */
    '--dsw-alias-brand-primary': '#8b5cf6',
    '--dsw-alias-brand-primary-invert': '#ffffff',
    '--dsw-alias-brand-text': '#a78bfa',
    '--dsw-alias-link': '#a78bfa',

    '--dsw-alias-button-primary-fill': '#8b5cf6',
    '--dsw-alias-button-primary-hover': '#a78bfa',
    '--dsw-alias-button-primary-dimmed': '#6d28d9',
    '--dsw-alias-button-contrast-fill': '#f1edfd',
    '--dsw-alias-button-elevated-fill': '#161230',
    '--dsw-alias-button-floating-fill': '#161230',
    '--dsw-alias-button-floating-hover': '#1e1840',
    '--dsw-alias-button-ghost-active-border': '#554a8a',
    '--dsw-alias-button-ghost-active-fill': '#1e1840',
    '--dsw-alias-button-ghost-active-hover': '#282058',
    '--dsw-alias-button-info-fill': '#d946ef',
    '--dsw-alias-button-info-hover': '#e879f9',
    '--dsw-alias-button-tool-bar-fill': '#161230',
    '--dsw-alias-button-tool-bar-fill-invisible': 'transparent',
    '--dsw-alias-button-tool-bar-hover': '#1e1840',

    '--dsw-alias-interactive-bg-hover': '#1a1438',
    '--dsw-alias-interactive-bg-active': '#1e1840',
    '--dsw-alias-interactive-bg-hover-accent': 'rgba(139, 92, 246, 0.20)',
    '--dsw-alias-interactive-bg-hover-danger': 'rgba(244, 63, 94, 0.15)',
    '--dsw-alias-interactive-bg-hover-solid': '#1e1840',

    '--dsw-alias-label-primary': '#f1edfd',
    '--dsw-alias-label-secondary': '#c9bff0',
    '--dsw-alias-label-tertiary': '#8f86b8',
    '--dsw-alias-label-quaternary': '#655c94',
    '--dsw-alias-label-caption': '#8f86b8',
    '--dsw-alias-label-dimmed': '#655c94',
    '--dsw-alias-label-error': '#fb7185',
    '--dsw-alias-label-primary-foreground': '#f1edfd',
    '--dsw-alias-label-primary-inverted': '#0d0a1a',
    '--dsw-alias-label-primary-bluish': '#a78bfa',

    '--dsw-alias-state-business-primary': '#a78bfa',
    '--dsw-alias-state-business-tertiary': 'rgba(139, 92, 246, 0.20)',
    '--dsw-alias-state-error-primary': '#fb7185',
    '--dsw-alias-state-error-secondary': 'rgba(251, 113, 133, 0.15)',
    '--dsw-alias-state-success-primary': '#34d399',
    '--dsw-alias-state-success-secondary': 'rgba(52, 211, 153, 0.15)',
    '--dsw-alias-state-warn-primary': '#fbbf24',
    '--dsw-alias-state-warn-secondary': 'rgba(251, 191, 36, 0.15)',
    '--dsw-alias-state-warn-label': '#fbbf24',

    '--dsw-alias-markdown-citation': '#a78bfa',
    '--dsw-alias-markdown-code-block': '#161230',
    '--dsw-alias-markdown-code-block-banner': '#1e1840',
    '--dsw-alias-markdown-inline-code': 'rgba(167, 139, 250, 0.12)',
    '--dsw-alias-markdown-code-segment-selected': 'rgba(139, 92, 246, 0.25)',
    '--dsw-alias-markdown-code-segment-unselected': 'transparent',
    '--dsw-alias-markdown-placeholder': '#655c94',

    '--dsw-alias-scrollbar-bg-l1': '#554a8a',
    '--dsw-alias-scrollbar-bg-l2': '#1e1840',
    '--dsw-alias-scrollbar-hover-l1': '#8f86b8',
    '--dsw-alias-scrollbar-hover-l2': '#554a8a',

    '--dsw-alias-toast-bg': '#161230',
    '--dsw-alias-tooltip-bg': '#282058',
    '--dsw-hovercard-bg': '#1e1840',

    '--dsw-specific-sidebar-fill': '#0d0a1a',
    '--dsw-specific-sidebar-nav-item-active': 'rgba(139, 92, 246, 0.22)',
    '--dsw-specific-sidebar-nav-item-active-accent': '#8b5cf6',
    '--dsw-specific-sidebar-nav-item-hover': '#1a1438',
    '--dsw-specific-bubble': '#161230',
    '--dsw-specific-bubble-highlight': '#1e1840',
    '--dsw-specific-input-major': '#161230',
    '--dsw-specific-login-input': '#161230',
    '--dsw-specific-menu': '#1e1840',
    '--dsw-specific-selector': '#1e1840',
    '--dsw-specific-tip': '#282058',

    '--dsw-font-family': SANS,
    '--dsw-font-mono': MONO,
    ...FLAT_SHADOWS,
  },
  SANS,
);

export const meta: ThemeMetaMap = {
  dark: {
    id: 'nebula-dark',
    label: 'Nebula 星云紫',
    desc: '紫黑 #0d0a1a + 霓紫 #8b5cf6',
    swatch: ['#0d0a1a', '#161230', '#8b5cf6', '#f1edfd'],
  },
};
