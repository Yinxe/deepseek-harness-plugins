/**
 * opencode.ts —— OpenCode Terminal（暖黑终端 / 纸感终端）。
 *
 * 参考 open-design/design-systems/opencode-ai：
 *   - 暖黑 #201d1d + 暖白 #fdfcfc，Apple HIG 语义色（#007aff / #ff3b30 / #30d158 / #ff9f0a）
 *   - Berkeley Mono 全站唯一字体："everything is code"
 *   - 纯扁平：零阴影，深度全靠边框与底色层次
 *   - 窄阅读列、4px 圆角的 utilitarian 观感
 *
 * 双主题：dark（暱夜终端，原汁原味）+ light（纸感终端，暖白纸 + 暖灰层次）。
 */

import { MONO, FLAT_SHADOWS, fillFontTokens, type ThemeMetaMap } from './shared.js';

/** 暖黑终端 token 集（dark scheme）。 */
export const dark = fillFontTokens(
  {
    /* ── 背景：暖黑 → 暖灰三级抬升 ── */
    '--dsw-alias-bg-base': '#201d1d',
    '--dsw-alias-bg-layer-1': '#302c2c',
    '--dsw-alias-bg-layer-2': '#3a3535',
    '--dsw-alias-bg-layer-3': '#423d3d',
    '--dsw-alias-bg-overlay': '#302c2c',
    '--dsw-alias-bg-multi-select': '#302c2c',
    '--dsw-alias-bg-module-platform': '#302c2c',
    '--dsw-alias-bg-skeleton': '#302c2c',

    /* ── 边框：暖灰边框（#464343 可见 / #646262 强调）── */
    '--dsw-alias-border-l1': '#464343',
    '--dsw-alias-border-l2': '#646262',
    '--dsw-alias-border-l2-darkmode-thin': '#464343',
    '--dsw-alias-border-l3': '#6e6e73',
    '--dsw-alias-border-l4': '#9a9898',
    '--dsw-alias-border-inverted': '#fdfcfc',
    '--dsw-alias-border-inverted2': '#c8c6c4',
    '--dsw-alias-separator-primary': '#464343',
    '--dsw-alias-fill-l2': '#3a3535',
    '--dsw-alias-fill-tsp-secondary': 'rgba(253, 252, 252, 0.06)',

    /* ── 品牌：Apple 系统蓝三段式（#007aff → #0056b3 hover）── */
    '--dsw-alias-brand-primary': '#007aff',
    '--dsw-alias-brand-primary-invert': '#ffffff',
    '--dsw-alias-brand-text': '#007aff',
    '--dsw-alias-link': '#007aff',

    /* ── 按钮：主按钮蓝填充，其余暖灰层次 ── */
    '--dsw-alias-button-primary-fill': '#007aff',
    '--dsw-alias-button-primary-hover': '#0056b3',
    '--dsw-alias-button-primary-dimmed': '#0056b3',
    '--dsw-alias-button-contrast-fill': '#fdfcfc',
    '--dsw-alias-button-elevated-fill': '#302c2c',
    '--dsw-alias-button-floating-fill': '#302c2c',
    '--dsw-alias-button-floating-hover': '#3a3535',
    '--dsw-alias-button-ghost-active-border': '#646262',
    '--dsw-alias-button-ghost-active-fill': '#3a3535',
    '--dsw-alias-button-ghost-active-hover': '#423d3d',
    '--dsw-alias-button-info-fill': '#007aff',
    '--dsw-alias-button-info-hover': '#0056b3',
    '--dsw-alias-button-tool-bar-fill': '#302c2c',
    '--dsw-alias-button-tool-bar-fill-invisible': 'transparent',
    '--dsw-alias-button-tool-bar-hover': '#3a3535',

    /* ── 交互态：暖灰悬停/按压 + 语义色半透明 ── */
    '--dsw-alias-interactive-bg-hover': '#2a2626',
    '--dsw-alias-interactive-bg-active': '#3a3535',
    '--dsw-alias-interactive-bg-hover-accent': 'rgba(0, 122, 255, 0.12)',
    '--dsw-alias-interactive-bg-hover-danger': 'rgba(255, 59, 48, 0.12)',
    '--dsw-alias-interactive-bg-hover-solid': '#3a3535',

    /* ── 文字：暖白主文字 → 暖灰四级衰减 ── */
    '--dsw-alias-label-primary': '#fdfcfc',
    '--dsw-alias-label-secondary': '#c8c6c4',
    '--dsw-alias-label-tertiary': '#9a9898',
    '--dsw-alias-label-quaternary': '#6e6e73',
    '--dsw-alias-label-caption': '#9a9898',
    '--dsw-alias-label-dimmed': '#6e6e73',
    '--dsw-alias-label-error': '#ff3b30',
    '--dsw-alias-label-primary-foreground': '#fdfcfc',
    '--dsw-alias-label-primary-inverted': '#201d1d',
    '--dsw-alias-label-primary-bluish': '#007aff',

    '--dsw-alias-state-business-primary': '#007aff',
    '--dsw-alias-state-business-tertiary': 'rgba(0, 122, 255, 0.12)',
    /* ── 语义：Apple HIG 四色 + 半透明次级 ── */
    '--dsw-alias-state-error-primary': '#ff3b30',
    '--dsw-alias-state-error-secondary': 'rgba(255, 59, 48, 0.12)',
    '--dsw-alias-state-success-primary': '#30d158',
    '--dsw-alias-state-success-secondary': 'rgba(48, 209, 88, 0.12)',
    '--dsw-alias-state-warn-primary': '#ff9f0a',
    '--dsw-alias-state-warn-secondary': 'rgba(255, 159, 10, 0.12)',
    '--dsw-alias-state-warn-label': '#ff9f0a',

    /* ── Markdown：代码块暖灰底 + 行内代码淡绿底（opencode 标志）── */
    '--dsw-alias-markdown-citation': '#007aff',
    '--dsw-alias-markdown-code-block': '#302c2c',
    '--dsw-alias-markdown-code-block-banner': '#3a3535',
    '--dsw-alias-markdown-inline-code': 'rgba(48, 209, 88, 0.08)',
    '--dsw-alias-markdown-code-segment-selected': 'rgba(0, 122, 255, 0.15)',
    '--dsw-alias-markdown-code-segment-unselected': 'transparent',
    '--dsw-alias-markdown-placeholder': '#6e6e73',

    /* ── 滚动条 ── */
    '--dsw-alias-scrollbar-bg-l1': '#464343',
    '--dsw-alias-scrollbar-bg-l2': '#3a3535',
    '--dsw-alias-scrollbar-hover-l1': '#646262',
    '--dsw-alias-scrollbar-hover-l2': '#423d3d',

    /* ── 浮层与特定区域 ── */
    '--dsw-alias-toast-bg': '#302c2c',
    '--dsw-alias-tooltip-bg': '#302c2c',
    '--dsw-hovercard-bg': '#302c2c',
    '--dsw-specific-sidebar-fill': '#201d1d',
    '--dsw-specific-sidebar-nav-item-active': 'rgba(0, 122, 255, 0.22)',
    '--dsw-specific-sidebar-nav-item-active-accent': '#007aff',
    '--dsw-specific-sidebar-nav-item-hover': '#2a2626',
    '--dsw-specific-bubble': '#302c2c',
    '--dsw-specific-bubble-highlight': '#3a3535',
    '--dsw-specific-input-major': '#302c2c',
    '--dsw-specific-login-input': '#302c2c',
    '--dsw-specific-menu': '#302c2c',
    '--dsw-specific-selector': '#302c2c',
    '--dsw-specific-tip': '#302c2c',

    /* ── 字体 + 扁平阴影 ── */
    '--dsw-font-family': MONO,
    '--dsw-font-mono': MONO,
    ...FLAT_SHADOWS,
  },
  MONO,
  true,
);

/** 纸感终端 token 集（light scheme）。 */
export const light = fillFontTokens(
  {
    '--dsw-alias-bg-base': '#fdfcfc',
    '--dsw-alias-bg-layer-1': '#f1eeee',
    '--dsw-alias-bg-layer-2': '#e9e2e2',
    '--dsw-alias-bg-layer-3': '#e2dcdc',
    '--dsw-alias-bg-overlay': '#ffffff',
    '--dsw-alias-bg-multi-select': '#f1eeee',
    '--dsw-alias-bg-module-platform': '#f1eeee',
    '--dsw-alias-bg-skeleton': '#f1eeee',

    '--dsw-alias-border-l1': '#e2dcdc',
    '--dsw-alias-border-l2': '#9a9898',
    '--dsw-alias-border-l2-darkmode-thin': '#e2dcdc',
    '--dsw-alias-border-l3': '#b5aeae',
    '--dsw-alias-border-l4': '#9a9898',
    '--dsw-alias-border-inverted': '#201d1d',
    '--dsw-alias-border-inverted2': '#424245',
    '--dsw-alias-separator-primary': '#d6cfcf',
    '--dsw-alias-fill-l2': '#e9e2e2',
    '--dsw-alias-fill-tsp-secondary': 'rgba(32, 29, 29, 0.05)',

    '--dsw-alias-brand-primary': '#007aff',
    '--dsw-alias-brand-primary-invert': '#ffffff',
    '--dsw-alias-brand-text': '#007aff',
    '--dsw-alias-link': '#007aff',

    /* 浅色主按钮还原 opencode 原版"暗底白字"（#201d1d 填充） */
    '--dsw-alias-button-primary-fill': '#201d1d',
    '--dsw-alias-button-primary-hover': '#3d3a3a',
    '--dsw-alias-button-primary-dimmed': '#424245',
    '--dsw-alias-button-contrast-fill': '#201d1d',
    '--dsw-alias-button-elevated-fill': '#ffffff',
    '--dsw-alias-button-floating-fill': '#ffffff',
    '--dsw-alias-button-floating-hover': '#f1eeee',
    '--dsw-alias-button-ghost-active-border': '#9a9898',
    '--dsw-alias-button-ghost-active-fill': '#e9e2e2',
    '--dsw-alias-button-ghost-active-hover': '#d6cfcf',
    '--dsw-alias-button-info-fill': '#007aff',
    '--dsw-alias-button-info-hover': '#0056b3',
    '--dsw-alias-button-tool-bar-fill': '#f1eeee',
    '--dsw-alias-button-tool-bar-fill-invisible': 'transparent',
    '--dsw-alias-button-tool-bar-hover': '#e9e2e2',

    '--dsw-alias-interactive-bg-hover': '#f1eeee',
    '--dsw-alias-interactive-bg-active': '#e9e2e2',
    '--dsw-alias-interactive-bg-hover-accent': 'rgba(0, 122, 255, 0.10)',
    '--dsw-alias-interactive-bg-hover-danger': 'rgba(255, 59, 48, 0.10)',
    '--dsw-alias-interactive-bg-hover-solid': '#e2dcdc',

    '--dsw-alias-label-primary': '#201d1d',
    '--dsw-alias-label-secondary': '#424245',
    '--dsw-alias-label-tertiary': '#6e6e73',
    '--dsw-alias-label-quaternary': '#9a9898',
    '--dsw-alias-label-caption': '#6e6e73',
    '--dsw-alias-label-dimmed': '#9a9898',
    '--dsw-alias-label-error': '#d70015',
    '--dsw-alias-label-primary-foreground': '#fdfcfc',
    '--dsw-alias-label-primary-inverted': '#fdfcfc',
    '--dsw-alias-label-primary-bluish': '#007aff',

    '--dsw-alias-state-business-primary': '#007aff',
    '--dsw-alias-state-business-tertiary': 'rgba(0, 122, 255, 0.10)',
    /* 浅色下语义色降饱和（Apple HIG 的浅色变体） */
    '--dsw-alias-state-error-primary': '#d70015',
    '--dsw-alias-state-error-secondary': 'rgba(255, 59, 48, 0.10)',
    '--dsw-alias-state-success-primary': '#178a33',
    '--dsw-alias-state-success-secondary': 'rgba(48, 209, 88, 0.10)',
    '--dsw-alias-state-warn-primary': '#b26a00',
    '--dsw-alias-state-warn-secondary': 'rgba(255, 159, 10, 0.10)',
    '--dsw-alias-state-warn-label': '#b26a00',

    '--dsw-alias-markdown-citation': '#007aff',
    '--dsw-alias-markdown-code-block': '#f6f3f3',
    '--dsw-alias-markdown-code-block-banner': '#eae4e4',
    '--dsw-alias-markdown-inline-code': 'rgba(48, 209, 88, 0.10)',
    '--dsw-alias-markdown-code-segment-selected': 'rgba(0, 122, 255, 0.12)',
    '--dsw-alias-markdown-code-segment-unselected': 'transparent',
    '--dsw-alias-markdown-placeholder': '#9a9898',

    '--dsw-alias-scrollbar-bg-l1': '#d6cfcf',
    '--dsw-alias-scrollbar-bg-l2': '#e2dcdc',
    '--dsw-alias-scrollbar-hover-l1': '#9a9898',
    '--dsw-alias-scrollbar-hover-l2': '#d6cfcf',

    '--dsw-alias-toast-bg': '#ffffff',
    '--dsw-alias-tooltip-bg': '#ffffff',
    '--dsw-hovercard-bg': '#ffffff',
    '--dsw-specific-sidebar-fill': '#f1eeee',
    '--dsw-specific-sidebar-nav-item-active': 'rgba(0, 122, 255, 0.22)',
    '--dsw-specific-sidebar-nav-item-active-accent': '#007aff',
    '--dsw-specific-sidebar-nav-item-hover': '#e9e2e2',
    '--dsw-specific-bubble': '#f1eeee',
    '--dsw-specific-bubble-highlight': '#e9e2e2',
    '--dsw-specific-input-major': '#f8f7f7',
    '--dsw-specific-login-input': '#f8f7f7',
    '--dsw-specific-menu': '#ffffff',
    '--dsw-specific-selector': '#ffffff',
    '--dsw-specific-tip': '#f1eeee',

    '--dsw-font-family': MONO,
    '--dsw-font-mono': MONO,
    ...FLAT_SHADOWS,
  },
  MONO,
  true,
);

/** 画廊展示元数据。 */
export const meta: ThemeMetaMap = {
  dark: {
    id: 'opencode-terminal-dark',
    label: 'OpenCode 暱夜终端',
    desc: '暖黑 #201d1d + Apple 蓝，全站 mono',
    swatch: ['#201d1d', '#302c2c', '#007aff', '#30d158'],
  },
  light: {
    id: 'opencode-terminal-light',
    label: 'OpenCode 纸感终端',
    desc: '暖白 #fdfcfc + 暖灰层次',
    swatch: ['#fdfcfc', '#f1eeee', '#201d1d', '#007aff'],
  },
};
