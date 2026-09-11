/**
 * discord.ts —— Discord Blurple夜（纯 dark）。
 *
 * 参考 open-design/design-systems/discord：
 *   - 深夜三阶：聊天面 #313338 → 侧栏 #2b2d31 → 服务器轨 #1e1f22
 *   - Blurple #5865f2 是聊天面唯一的饱和色（CTA / 提及 / 高亮），悬停 #4752c4
 *   - 状态点：在线绿 #23a55a / 闲置黄 #f0b232 / 勿扰红 #f23f43
 *   - 系统无衬线字体
 */

import { SANS, MONO, FLAT_SHADOWS, fillFontTokens, type ThemeMetaMap } from './shared.js';

export const dark = fillFontTokens(
  {
    '--dsw-alias-bg-base': '#313338',
    '--dsw-alias-bg-layer-1': '#2b2d31',
    '--dsw-alias-bg-layer-2': '#242529',
    '--dsw-alias-bg-layer-3': '#1e1f22',
    '--dsw-alias-bg-overlay': '#2b2d31',
    '--dsw-alias-bg-multi-select': '#2b2d31',
    '--dsw-alias-bg-module-platform': '#2b2d31',
    '--dsw-alias-bg-skeleton': '#242529',

    '--dsw-alias-border-l1': 'rgba(255, 255, 255, 0.06)',
    '--dsw-alias-border-l2': '#3f4147',
    '--dsw-alias-border-l2-darkmode-thin': 'rgba(255, 255, 255, 0.06)',
    '--dsw-alias-border-l3': '#5c5e66',
    '--dsw-alias-border-l4': '#80848e',
    '--dsw-alias-border-inverted': '#f2f3f5',
    '--dsw-alias-border-inverted2': '#dbdee1',
    '--dsw-alias-separator-primary': 'rgba(255, 255, 255, 0.06)',
    '--dsw-alias-line-secondary': '#242529',
    '--dsw-alias-fill-l2': '#242529',
    '--dsw-alias-fill-tsp-secondary': 'rgba(219, 222, 225, 0.06)',

    /* Blurple：品牌指纹 */
    '--dsw-alias-brand-primary': '#5865f2',
    '--dsw-alias-brand-primary-invert': '#ffffff',
    '--dsw-alias-brand-text': '#5865f2',

    '--dsw-alias-button-primary-fill': '#5865f2',
    '--dsw-alias-button-primary-hover': '#4752c4',
    '--dsw-alias-button-primary-dimmed': '#3c45a5',
    '--dsw-alias-button-contrast-fill': '#f2f3f5',
    '--dsw-alias-button-elevated-fill': '#2b2d31',
    '--dsw-alias-button-floating-fill': '#2b2d31',
    '--dsw-alias-button-floating-hover': '#313338',
    '--dsw-alias-button-ghost-active-border': '#3f4147',
    '--dsw-alias-button-ghost-active-fill': '#242529',
    '--dsw-alias-button-ghost-active-hover': '#1e1f22',
    '--dsw-alias-button-info-fill': '#5865f2',
    '--dsw-alias-button-info-hover': '#4752c4',
    '--dsw-alias-button-tool-bar-fill': '#2b2d31',
    '--dsw-alias-button-tool-bar-fill-invisible': 'transparent',
    '--dsw-alias-button-tool-bar-hover': '#313338',

    '--dsw-alias-interactive-bg-hover': '#2e3035',
    '--dsw-alias-interactive-bg-active': '#34363c',
    '--dsw-alias-interactive-bg-hover-accent': 'rgba(88, 101, 242, 0.18)',
    '--dsw-alias-interactive-bg-hover-danger': 'rgba(242, 63, 67, 0.15)',
    '--dsw-alias-interactive-bg-hover-solid': '#34363c',

    '--dsw-alias-label-primary': '#dbdee1',
    '--dsw-alias-label-secondary': '#b5bac1',
    '--dsw-alias-label-tertiary': '#949ba4',
    '--dsw-alias-label-quaternary': '#80848e',
    '--dsw-alias-label-caption': '#949ba4',
    '--dsw-alias-label-dimmed': '#6d6f78',
    '--dsw-alias-label-error': '#f23f43',
    '--dsw-alias-label-primary-foreground': '#dbdee1',
    '--dsw-alias-label-primary-inverted': '#313338',
    '--dsw-alias-label-primary-bluish': '#7289da',

    /* 状态点三色：在线绿 / 闲置黄 / 勿扰红 */
    '--dsw-alias-state-error-primary': '#f23f43',
    '--dsw-alias-state-error-secondary': 'rgba(242, 63, 67, 0.15)',
    '--dsw-alias-state-success-primary': '#23a55a',
    '--dsw-alias-state-success-secondary': 'rgba(35, 165, 90, 0.15)',
    '--dsw-alias-state-warn-primary': '#f0b232',
    '--dsw-alias-state-warn-secondary': 'rgba(240, 178, 50, 0.15)',
    '--dsw-alias-state-warn-label': '#f0b232',

    '--dsw-alias-markdown-citation': '#7289da',
    '--dsw-alias-markdown-code-block': '#2b2d31',
    '--dsw-alias-markdown-code-block-banner': '#1e1f22',
    '--dsw-alias-markdown-inline-code': 'rgba(88, 101, 242, 0.16)',
    '--dsw-alias-markdown-code-segment-selected': 'rgba(88, 101, 242, 0.25)',
    '--dsw-alias-markdown-code-segment-unselected': 'transparent',
    '--dsw-alias-markdown-placeholder': '#6d6f78',
    '--dsw-alias-markdown-tag': '#949ba4',

    '--dsw-alias-scrollbar-bg-l1': '#3f4147',
    '--dsw-alias-scrollbar-bg-l2': '#242529',
    '--dsw-alias-scrollbar-hover-l1': '#80848e',
    '--dsw-alias-scrollbar-hover-l2': '#3f4147',

    '--dsw-alias-toast-bg': '#2b2d31',
    '--dsw-alias-tooltip-bg': '#1e1f22',
    '--dsw-hovercard-bg': '#242529',

    '--dsw-specific-sidebar-fill': '#2b2d31',
    '--dsw-specific-sidebar-nav-item-active': '#34363c',
    '--dsw-specific-sidebar-nav-item-active-accent': '#5865f2',
    '--dsw-specific-sidebar-nav-item-hover': '#2e3035',
    '--dsw-specific-bubble': '#2b2d31',
    '--dsw-specific-bubble-highlight': '#313338',
    '--dsw-specific-input-major': '#1e1f22',
    '--dsw-specific-login-input': '#2b2d31',
    '--dsw-specific-menu': '#2b2d31',
    '--dsw-specific-selector': '#2b2d31',
    '--dsw-specific-tip': '#1e1f22',

    '--dsw-font-family': SANS,
    '--dsw-font-mono': MONO,
    ...FLAT_SHADOWS,
  },
  SANS,
);

export const meta: ThemeMetaMap = {
  dark: {
    id: 'discord-dark',
    label: 'Discord Blurple夜',
    desc: '深灰 #313338 + Blurple #5865f2',
    swatch: ['#313338', '#2b2d31', '#5865f2', '#dbdee1'],
  },
};
