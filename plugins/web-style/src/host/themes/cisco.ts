/**
 * cisco.ts —— Cisco 信任蓝（纯 dark）。
 *
 * 参考 open-design/design-systems/cisco：
 *   - 深海军藏青 #0f1720 画布 + 三层表面 #1b2530 / #243447
 *   - Cisco 蓝 #049fd9 只做信号色（主操作 / 焦点 / 激活指示）
 *   - 浅青 #64bbe3 做技术高光文本；胶囊 CTA + 大圆角卡片
 *   - 系统无衬线正文，等宽栈复用 MONO（IBM Plex Mono 替代）
 *   - 无投射阴影，以描边营造深度（扁平）
 */

import { SANS, MONO, FLAT_SHADOWS, fillFontTokens, type ThemeMetaMap } from './shared.js';

export const dark = fillFontTokens(
  {
    '--dsw-alias-bg-base': '#0f1720',
    '--dsw-alias-bg-layer-1': '#1b2530',
    '--dsw-alias-bg-layer-2': '#243447',
    '--dsw-alias-bg-layer-3': '#2e4257',
    '--dsw-alias-bg-overlay': '#1b2530',
    '--dsw-alias-bg-multi-select': '#1b2530',
    '--dsw-alias-bg-module-platform': '#1b2530',
    '--dsw-alias-bg-skeleton': '#1b2530',

    '--dsw-alias-border-l1': '#243447',
    '--dsw-alias-border-l2': '#58585b',
    '--dsw-alias-border-l2-darkmode-thin': 'rgba(232, 235, 241, 0.14)',
    '--dsw-alias-border-l3': '#9e9ea2',
    '--dsw-alias-border-l4': '#e8ebf1',
    '--dsw-alias-border-inverted': '#ffffff',
    '--dsw-alias-border-inverted2': '#e8ebf1',
    '--dsw-alias-separator-primary': '#243447',
    '--dsw-alias-fill-l2': '#243447',
    '--dsw-alias-fill-tsp-secondary': 'rgba(255, 255, 255, 0.05)',

    /* Cisco 蓝：品牌信号 */
    '--dsw-alias-brand-primary': '#049fd9',
    '--dsw-alias-brand-primary-invert': '#001923',
    '--dsw-alias-brand-text': '#049fd9',
    '--dsw-alias-link': '#049fd9',

    '--dsw-alias-button-primary-fill': '#049fd9',
    '--dsw-alias-button-primary-hover': '#048fc3',
    '--dsw-alias-button-primary-dimmed': '#03709a',
    '--dsw-alias-button-contrast-fill': '#ffffff',
    '--dsw-alias-button-elevated-fill': '#1b2530',
    '--dsw-alias-button-floating-fill': '#1b2530',
    '--dsw-alias-button-floating-hover': '#243447',
    '--dsw-alias-button-ghost-active-border': '#58585b',
    '--dsw-alias-button-ghost-active-fill': '#243447',
    '--dsw-alias-button-ghost-active-hover': '#2e4257',
    '--dsw-alias-button-info-fill': '#049fd9',
    '--dsw-alias-button-info-hover': '#048fc3',
    '--dsw-alias-button-tool-bar-fill': '#1b2530',
    '--dsw-alias-button-tool-bar-fill-invisible': 'transparent',
    '--dsw-alias-button-tool-bar-hover': '#243447',

    '--dsw-alias-interactive-bg-hover': '#16202c',
    '--dsw-alias-interactive-bg-active': '#243447',
    '--dsw-alias-interactive-bg-hover-accent': 'rgba(4, 159, 217, 0.18)',
    '--dsw-alias-interactive-bg-hover-danger': 'rgba(207, 32, 48, 0.15)',
    '--dsw-alias-interactive-bg-hover-solid': '#243447',

    '--dsw-alias-label-primary': '#ffffff',
    '--dsw-alias-label-secondary': '#e8ebf1',
    '--dsw-alias-label-tertiary': '#9e9ea2',
    '--dsw-alias-label-quaternary': '#58585b',
    '--dsw-alias-label-caption': '#9e9ea2',
    '--dsw-alias-label-dimmed': '#58585b',
    '--dsw-alias-label-error': '#cf2030',
    '--dsw-alias-label-primary-foreground': '#ffffff',
    '--dsw-alias-label-primary-inverted': '#0f1720',
    '--dsw-alias-label-primary-bluish': '#64bbe3',

    '--dsw-alias-state-business-primary': '#049fd9',
    '--dsw-alias-state-business-tertiary': 'rgba(4, 159, 217, 0.18)',
    '--dsw-alias-state-error-primary': '#cf2030',
    '--dsw-alias-state-error-secondary': 'rgba(207, 32, 48, 0.15)',
    '--dsw-alias-state-success-primary': '#6cc04a',
    '--dsw-alias-state-success-secondary': 'rgba(108, 192, 74, 0.15)',
    '--dsw-alias-state-warn-primary': '#ffcc00',
    '--dsw-alias-state-warn-secondary': 'rgba(255, 204, 0, 0.15)',
    '--dsw-alias-state-warn-label': '#ffcc00',

    '--dsw-alias-markdown-citation': '#64bbe3',
    '--dsw-alias-markdown-code-block': '#1b2530',
    '--dsw-alias-markdown-code-block-banner': '#243447',
    '--dsw-alias-markdown-inline-code': 'rgba(4, 159, 217, 0.12)',
    '--dsw-alias-markdown-code-segment-selected': 'rgba(4, 159, 217, 0.22)',
    '--dsw-alias-markdown-code-segment-unselected': 'transparent',
    '--dsw-alias-markdown-placeholder': '#58585b',

    '--dsw-alias-scrollbar-bg-l1': '#58585b',
    '--dsw-alias-scrollbar-bg-l2': '#243447',
    '--dsw-alias-scrollbar-hover-l1': '#9e9ea2',
    '--dsw-alias-scrollbar-hover-l2': '#58585b',

    '--dsw-alias-toast-bg': '#1b2530',
    '--dsw-alias-tooltip-bg': '#243447',
    '--dsw-hovercard-bg': '#243447',

    '--dsw-specific-sidebar-fill': '#0f1720',
    '--dsw-specific-sidebar-nav-item-active': 'rgba(4, 159, 217, 0.22)',
    '--dsw-specific-sidebar-nav-item-active-accent': '#049fd9',
    '--dsw-specific-sidebar-nav-item-hover': '#16202c',
    '--dsw-specific-bubble': '#1b2530',
    '--dsw-specific-bubble-highlight': '#243447',
    '--dsw-specific-input-major': '#1b2530',
    '--dsw-specific-login-input': '#1b2530',
    '--dsw-specific-menu': '#243447',
    '--dsw-specific-selector': '#243447',
    '--dsw-specific-tip': '#2e4257',

    '--dsw-font-family': SANS,
    '--dsw-font-mono': MONO,
    ...FLAT_SHADOWS,
  },
  SANS,
);

export const meta: ThemeMetaMap = {
  dark: {
    id: 'cisco-dark',
    label: 'Cisco 信任蓝',
    desc: '藏青 #0f1720 + 信号蓝 #049fd9',
    swatch: ['#0f1720', '#1b2530', '#049fd9', '#ffffff'],
  },
};
