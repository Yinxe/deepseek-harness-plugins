/**
 * wechat.ts —— WeChat 微信绿（纯 light）。
 *
 * 参考 open-design/design-systems/wechat：
 *   - 聊天列表灰 #ededed 画布（每个微信用户盯了十年的颜色），卡片 #f7f7f7 上浮一阶
 *   - 微信绿 #07c160 是唯一信号色（CTA / 成功 / 激活 / 焦点），悬停 #10b160，按压 #059050
 *   - 功能红 #fa5151，警告橙 #fab702；系统无衬线字体
 */

import { SANS, MONO, FLAT_SHADOWS, fillFontTokens, type ThemeMetaMap } from './shared.js';

export const light = fillFontTokens(
  {
    '--dsw-alias-bg-base': '#ededed',
    '--dsw-alias-bg-layer-1': '#f7f7f7',
    '--dsw-alias-bg-layer-2': '#efefef',
    '--dsw-alias-bg-layer-3': '#e4e4e4',
    '--dsw-alias-bg-overlay': '#ffffff',
    '--dsw-alias-bg-multi-select': '#f7f7f7',
    '--dsw-alias-bg-module-platform': '#f7f7f7',
    '--dsw-alias-bg-skeleton': '#f1f1f1',

    '--dsw-alias-border-l1': '#e0e0e0',
    '--dsw-alias-border-l2': '#c8c8c8',
    '--dsw-alias-border-l2-darkmode-thin': '#e0e0e0',
    '--dsw-alias-border-l3': '#a8a8a8',
    '--dsw-alias-border-l4': '#888888',
    '--dsw-alias-border-inverted': '#1a1a1a',
    '--dsw-alias-border-inverted2': '#1a1a1a',
    '--dsw-alias-separator-primary': '#e0e0e0',
    '--dsw-alias-fill-l2': '#efefef',
    '--dsw-alias-fill-tsp-secondary': 'rgba(26, 26, 26, 0.04)',

    /* 微信绿：唯一信号色 */
    '--dsw-alias-brand-primary': '#07c160',
    '--dsw-alias-brand-primary-invert': '#ffffff',
    '--dsw-alias-brand-text': '#07c160',
    '--dsw-alias-link': '#07c160',

    '--dsw-alias-button-primary-fill': '#07c160',
    '--dsw-alias-button-primary-hover': '#10b160',
    '--dsw-alias-button-primary-dimmed': '#059050',
    '--dsw-alias-button-contrast-fill': '#1a1a1a',
    '--dsw-alias-button-elevated-fill': '#ffffff',
    '--dsw-alias-button-floating-fill': '#ffffff',
    '--dsw-alias-button-floating-hover': '#f7f7f7',
    '--dsw-alias-button-ghost-active-border': '#c8c8c8',
    '--dsw-alias-button-ghost-active-fill': '#efefef',
    '--dsw-alias-button-ghost-active-hover': '#e4e4e4',
    '--dsw-alias-button-info-fill': '#07c160',
    '--dsw-alias-button-info-hover': '#10b160',
    '--dsw-alias-button-tool-bar-fill': '#f7f7f7',
    '--dsw-alias-button-tool-bar-fill-invisible': 'transparent',
    '--dsw-alias-button-tool-bar-hover': '#efefef',

    '--dsw-alias-interactive-bg-hover': '#f1f1f1',
    '--dsw-alias-interactive-bg-active': '#e4e4e4',
    '--dsw-alias-interactive-bg-hover-accent': 'rgba(7, 193, 96, 0.12)',
    '--dsw-alias-interactive-bg-hover-danger': 'rgba(250, 81, 81, 0.10)',
    '--dsw-alias-interactive-bg-hover-solid': '#e4e4e4',

    '--dsw-alias-label-primary': '#1a1a1a',
    '--dsw-alias-label-secondary': '#1a1a1a',
    '--dsw-alias-label-tertiary': '#888888',
    '--dsw-alias-label-quaternary': '#b2b2b2',
    '--dsw-alias-label-caption': '#888888',
    '--dsw-alias-label-dimmed': '#b2b2b2',
    '--dsw-alias-label-error': '#fa5151',
    '--dsw-alias-label-primary-foreground': '#ffffff',
    '--dsw-alias-label-primary-inverted': '#ffffff',
    '--dsw-alias-label-primary-bluish': '#07c160',

    '--dsw-alias-state-business-primary': '#07c160',
    '--dsw-alias-state-business-tertiary': 'rgba(7, 193, 96, 0.12)',
    /* 微信绿即成功态（green is "done"） */
    '--dsw-alias-state-error-primary': '#fa5151',
    '--dsw-alias-state-error-secondary': 'rgba(250, 81, 81, 0.10)',
    '--dsw-alias-state-success-primary': '#07c160',
    '--dsw-alias-state-success-secondary': 'rgba(7, 193, 96, 0.12)',
    '--dsw-alias-state-warn-primary': '#fab702',
    '--dsw-alias-state-warn-secondary': 'rgba(250, 183, 2, 0.12)',
    '--dsw-alias-state-warn-label': '#9a6700',

    '--dsw-alias-markdown-citation': '#07c160',
    '--dsw-alias-markdown-code-block': '#f7f7f7',
    '--dsw-alias-markdown-code-block-banner': '#efefef',
    '--dsw-alias-markdown-inline-code': 'rgba(7, 193, 96, 0.10)',
    '--dsw-alias-markdown-code-segment-selected': 'rgba(7, 193, 96, 0.14)',
    '--dsw-alias-markdown-code-segment-unselected': 'transparent',
    '--dsw-alias-markdown-placeholder': '#b2b2b2',

    '--dsw-alias-scrollbar-bg-l1': '#e0e0e0',
    '--dsw-alias-scrollbar-bg-l2': '#efefef',
    '--dsw-alias-scrollbar-hover-l1': '#888888',
    '--dsw-alias-scrollbar-hover-l2': '#e0e0e0',

    '--dsw-alias-toast-bg': '#ffffff',
    '--dsw-alias-tooltip-bg': '#1a1a1a',
    '--dsw-hovercard-bg': '#ffffff',

    '--dsw-specific-sidebar-fill': '#ededed',
    '--dsw-specific-sidebar-nav-item-active': 'rgba(7, 193, 96, 0.22)',
    '--dsw-specific-sidebar-nav-item-active-accent': '#07c160',
    '--dsw-specific-sidebar-nav-item-hover': '#efefef',
    '--dsw-specific-bubble': '#ffffff',
    '--dsw-specific-bubble-highlight': '#f7f7f7',
    '--dsw-specific-input-major': '#f7f7f7',
    '--dsw-specific-login-input': '#f7f7f7',
    '--dsw-specific-menu': '#ffffff',
    '--dsw-specific-selector': '#ffffff',
    '--dsw-specific-tip': '#f7f7f7',

    '--dsw-font-family': SANS,
    '--dsw-font-mono': MONO,
    ...FLAT_SHADOWS,
  },
  SANS,
);

export const meta: ThemeMetaMap = {
  light: {
    id: 'wechat-light',
    label: 'WeChat 微信绿',
    desc: '浅灰 #ededed + 微信绿 #07c160',
    swatch: ['#ededed', '#f7f7f7', '#07c160', '#1a1a1a'],
  },
};
