/**
 * github.ts —— GitHub Primer（dark + light 双模式）。
 *
 * 参考 open-design/design-systems/github：
 *   - 亮：纯白画布 + canvas-subtle #f6f8fa 次级面；发丝线 #d0d7de 定义每个面板
 *   - 暗：#0d1117 画布 + #161b22 抬升面 + #30363d 边框（官方 dark palette）
 *   - Primer Blue（#0969da 亮 / #2f81f7 暗）承担全部交互色
 *   - GitHub 绿只留给主按钮与成功/合并态（#1f883d 亮 / #238636 暗）
 *   - 系统字体栈，14px 产品密度观感
 */

import { SANS, MONO, fillFontTokens, type ThemeMetaMap } from './shared.js';

export const dark = fillFontTokens(
  {
    '--dsw-alias-bg-base': '#0d1117',
    '--dsw-alias-bg-layer-1': '#161b22',
    '--dsw-alias-bg-layer-2': '#21262d',
    '--dsw-alias-bg-layer-3': '#282e35',
    '--dsw-alias-bg-overlay': '#161b22',
    '--dsw-alias-bg-multi-select': '#161b22',
    '--dsw-alias-bg-module-platform': '#161b22',
    '--dsw-alias-bg-skeleton': '#161b22',

    '--dsw-alias-border-l1': '#30363d',
    '--dsw-alias-border-l2': '#3d444d',
    '--dsw-alias-border-l2-darkmode-thin': '#30363d',
    '--dsw-alias-border-l3': '#545d68',
    '--dsw-alias-border-l4': '#6e7681',
    '--dsw-alias-border-inverted': '#f0f6fc',
    '--dsw-alias-border-inverted2': '#c9d1d9',
    '--dsw-alias-separator-primary': '#21262d',
    '--dsw-alias-line-secondary': '#30363d',
    '--dsw-alias-fill-l2': '#21262d',
    '--dsw-alias-fill-tsp-secondary': 'rgba(240, 246, 252, 0.05)',

    '--dsw-alias-brand-primary': '#2f81f7',
    '--dsw-alias-brand-primary-invert': '#ffffff',
    '--dsw-alias-brand-text': '#2f81f7',

    /* 主按钮 GitHub 绿 #238636（暗色官方值） */
    '--dsw-alias-button-primary-fill': '#238636',
    '--dsw-alias-button-primary-hover': '#2ea043',
    '--dsw-alias-button-primary-dimmed': '#1f6e30',
    '--dsw-alias-button-contrast-fill': '#f0f6fc',
    '--dsw-alias-button-elevated-fill': '#161b22',
    '--dsw-alias-button-floating-fill': '#161b22',
    '--dsw-alias-button-floating-hover': '#21262d',
    '--dsw-alias-button-ghost-active-border': '#3d444d',
    '--dsw-alias-button-ghost-active-fill': '#21262d',
    '--dsw-alias-button-ghost-active-hover': '#282e35',
    '--dsw-alias-button-info-fill': '#2f81f7',
    '--dsw-alias-button-info-hover': '#1f6feb',
    '--dsw-alias-button-tool-bar-fill': '#161b22',
    '--dsw-alias-button-tool-bar-fill-invisible': 'transparent',
    '--dsw-alias-button-tool-bar-hover': '#21262d',

    '--dsw-alias-interactive-bg-hover': '#161b22',
    '--dsw-alias-interactive-bg-active': '#21262d',
    '--dsw-alias-interactive-bg-hover-accent': 'rgba(47, 129, 247, 0.15)',
    '--dsw-alias-interactive-bg-hover-danger': 'rgba(248, 81, 73, 0.15)',
    '--dsw-alias-interactive-bg-hover-solid': '#21262d',

    '--dsw-alias-label-primary': '#f0f6fc',
    '--dsw-alias-label-secondary': '#c9d1d9',
    '--dsw-alias-label-tertiary': '#8b949e',
    '--dsw-alias-label-quaternary': '#6e7681',
    '--dsw-alias-label-caption': '#8b949e',
    '--dsw-alias-label-dimmed': '#6e7681',
    '--dsw-alias-label-error': '#f85149',
    '--dsw-alias-label-primary-foreground': '#f0f6fc',
    '--dsw-alias-label-primary-inverted': '#0d1117',
    '--dsw-alias-label-primary-bluish': '#2f81f7',

    '--dsw-alias-state-error-primary': '#f85149',
    '--dsw-alias-state-error-secondary': 'rgba(248, 81, 73, 0.15)',
    '--dsw-alias-state-success-primary': '#3fb950',
    '--dsw-alias-state-success-secondary': 'rgba(63, 185, 80, 0.15)',
    '--dsw-alias-state-warn-primary': '#d29922',
    '--dsw-alias-state-warn-secondary': 'rgba(210, 153, 34, 0.15)',
    '--dsw-alias-state-warn-label': '#d29922',

    '--dsw-alias-markdown-citation': '#2f81f7',
    '--dsw-alias-markdown-code-block': '#161b22',
    '--dsw-alias-markdown-code-block-banner': '#21262d',
    '--dsw-alias-markdown-inline-code': 'rgba(56, 139, 253, 0.15)',
    '--dsw-alias-markdown-code-segment-selected': 'rgba(47, 129, 247, 0.25)',
    '--dsw-alias-markdown-code-segment-unselected': 'transparent',
    '--dsw-alias-markdown-placeholder': '#6e7681',
    '--dsw-alias-markdown-tag': '#8b949e',

    '--dsw-alias-scrollbar-bg-l1': '#30363d',
    '--dsw-alias-scrollbar-bg-l2': '#21262d',
    '--dsw-alias-scrollbar-hover-l1': '#545d68',
    '--dsw-alias-scrollbar-hover-l2': '#30363d',

    '--dsw-alias-toast-bg': '#161b22',
    '--dsw-alias-tooltip-bg': '#282e35',
    '--dsw-hovercard-bg': '#21262d',
    '--dsw-specific-sidebar-fill': '#0d1117',
    '--dsw-specific-sidebar-nav-item-active': '#21262d',
    '--dsw-specific-sidebar-nav-item-active-accent': '#2f81f7',
    '--dsw-specific-sidebar-nav-item-hover': '#161b22',
    '--dsw-specific-bubble': '#161b22',
    '--dsw-specific-bubble-highlight': '#21262d',
    '--dsw-specific-input-major': '#0d1117',
    '--dsw-specific-login-input': '#0d1117',
    '--dsw-specific-menu': '#21262d',
    '--dsw-specific-selector': '#21262d',
    '--dsw-specific-tip': '#282e35',

    '--dsw-shadow-lv1': 'none',
    '--dsw-shadow-lv2': 'none',
    '--dsw-shadow-lv3': 'none',
    '--dsw-shadow-lv1-blur': '0px',

    '--dsw-font-family': SANS,
    '--dsw-font-mono': MONO,
  },
  SANS,
);

export const light = fillFontTokens(
  {
    '--dsw-alias-bg-base': '#ffffff',
    '--dsw-alias-bg-layer-1': '#f6f8fa',
    '--dsw-alias-bg-layer-2': '#eff2f5',
    '--dsw-alias-bg-layer-3': '#eaeef2',
    '--dsw-alias-bg-overlay': '#ffffff',
    '--dsw-alias-bg-multi-select': '#f6f8fa',
    '--dsw-alias-bg-module-platform': '#f6f8fa',
    '--dsw-alias-bg-skeleton': '#f6f8fa',

    /* 发丝线 #d0d7de —— 结构骨架 */
    '--dsw-alias-border-l1': '#d0d7de',
    '--dsw-alias-border-l2': '#afb8c1',
    '--dsw-alias-border-l2-darkmode-thin': '#d0d7de',
    '--dsw-alias-border-l3': '#8c959f',
    '--dsw-alias-border-l4': '#57606a',
    '--dsw-alias-border-inverted': '#1f2328',
    '--dsw-alias-border-inverted2': '#656d76',
    '--dsw-alias-separator-primary': '#d8dee4',
    '--dsw-alias-line-secondary': '#eff2f5',
    '--dsw-alias-fill-l2': '#eff2f5',
    '--dsw-alias-fill-tsp-secondary': 'rgba(31, 35, 40, 0.04)',

    '--dsw-alias-brand-primary': '#0969da',
    '--dsw-alias-brand-primary-invert': '#ffffff',
    '--dsw-alias-brand-text': '#0969da',

    /* 主按钮 GitHub 绿 #1f883d（亮色官方值） */
    '--dsw-alias-button-primary-fill': '#1f883d',
    '--dsw-alias-button-primary-hover': '#1a7f37',
    '--dsw-alias-button-primary-dimmed': '#16795c',
    '--dsw-alias-button-contrast-fill': '#1f2328',
    '--dsw-alias-button-elevated-fill': '#ffffff',
    '--dsw-alias-button-floating-fill': '#ffffff',
    '--dsw-alias-button-floating-hover': '#f6f8fa',
    '--dsw-alias-button-ghost-active-border': '#afb8c1',
    '--dsw-alias-button-ghost-active-fill': '#eff2f5',
    '--dsw-alias-button-ghost-active-hover': '#eaeef2',
    '--dsw-alias-button-info-fill': '#0969da',
    '--dsw-alias-button-info-hover': '#0550ae',
    '--dsw-alias-button-tool-bar-fill': '#f6f8fa',
    '--dsw-alias-button-tool-bar-fill-invisible': 'transparent',
    '--dsw-alias-button-tool-bar-hover': '#eff2f5',

    '--dsw-alias-interactive-bg-hover': '#f6f8fa',
    '--dsw-alias-interactive-bg-active': '#eff2f5',
    '--dsw-alias-interactive-bg-hover-accent': 'rgba(9, 105, 218, 0.10)',
    '--dsw-alias-interactive-bg-hover-danger': 'rgba(207, 34, 46, 0.08)',
    '--dsw-alias-interactive-bg-hover-solid': '#eff2f5',

    '--dsw-alias-label-primary': '#1f2328',
    '--dsw-alias-label-secondary': '#1f2328',
    '--dsw-alias-label-tertiary': '#656d76',
    '--dsw-alias-label-quaternary': '#8c959f',
    '--dsw-alias-label-caption': '#656d76',
    '--dsw-alias-label-dimmed': '#8c959f',
    '--dsw-alias-label-error': '#cf222e',
    '--dsw-alias-label-primary-foreground': '#ffffff',
    '--dsw-alias-label-primary-inverted': '#ffffff',
    '--dsw-alias-label-primary-bluish': '#0969da',

    '--dsw-alias-state-error-primary': '#cf222e',
    '--dsw-alias-state-error-secondary': 'rgba(207, 34, 46, 0.08)',
    '--dsw-alias-state-success-primary': '#1a7f37',
    '--dsw-alias-state-success-secondary': 'rgba(26, 127, 55, 0.10)',
    '--dsw-alias-state-warn-primary': '#9a6700',
    '--dsw-alias-state-warn-secondary': 'rgba(154, 103, 0, 0.10)',
    '--dsw-alias-state-warn-label': '#9a6700',

    '--dsw-alias-markdown-citation': '#0969da',
    '--dsw-alias-markdown-code-block': '#f6f8fa',
    '--dsw-alias-markdown-code-block-banner': '#eff2f5',
    '--dsw-alias-markdown-inline-code': 'rgba(9, 105, 218, 0.08)',
    '--dsw-alias-markdown-code-segment-selected': 'rgba(9, 105, 218, 0.12)',
    '--dsw-alias-markdown-code-segment-unselected': 'transparent',
    '--dsw-alias-markdown-placeholder': '#8c959f',
    '--dsw-alias-markdown-tag': '#656d76',

    '--dsw-alias-scrollbar-bg-l1': '#d0d7de',
    '--dsw-alias-scrollbar-bg-l2': '#eff2f5',
    '--dsw-alias-scrollbar-hover-l1': '#afb8c1',
    '--dsw-alias-scrollbar-hover-l2': '#d0d7de',

    '--dsw-alias-toast-bg': '#ffffff',
    '--dsw-alias-tooltip-bg': '#1f2328',
    '--dsw-hovercard-bg': '#ffffff',
    '--dsw-specific-sidebar-fill': '#f6f8fa',
    '--dsw-specific-sidebar-nav-item-active': '#eff2f5',
    '--dsw-specific-sidebar-nav-item-active-accent': '#0969da',
    '--dsw-specific-sidebar-nav-item-hover': '#eff2f5',
    '--dsw-specific-bubble': '#f6f8fa',
    '--dsw-specific-bubble-highlight': '#eff2f5',
    '--dsw-specific-input-major': '#f6f8fa',
    '--dsw-specific-login-input': '#f6f8fa',
    '--dsw-specific-menu': '#ffffff',
    '--dsw-specific-selector': '#ffffff',
    '--dsw-specific-tip': '#1f2328',

    '--dsw-shadow-lv1': '0 1px 0 rgba(31, 35, 40, 0.04)',
    '--dsw-shadow-lv2': '0 1px 3px rgba(31, 35, 40, 0.06)',
    '--dsw-shadow-lv3': '0 1px 5px rgba(31, 35, 40, 0.08)',
    '--dsw-shadow-lv1-blur': '1px',

    '--dsw-font-family': SANS,
    '--dsw-font-mono': MONO,
  },
  SANS,
);

export const meta: ThemeMetaMap = {
  dark: {
    id: 'github-dark',
    label: 'GitHub 暗色 Primer',
    desc: '#0d1117 + Primer 蓝 #2f81f7',
    swatch: ['#0d1117', '#161b22', '#2f81f7', '#3fb950'],
  },
  light: {
    id: 'github-light',
    label: 'GitHub 亮色 Primer',
    desc: '纯白 + #0969da + 绿色按钮',
    swatch: ['#ffffff', '#f6f8fa', '#0969da', '#1f883d'],
  },
};
