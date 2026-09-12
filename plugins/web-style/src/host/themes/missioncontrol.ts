/**
 * missioncontrol.ts —— Mission Control 深空（纯 dark）。
 *
 * 参考 open-design/design-systems/mission-control：
 *   - 深空海军蓝 #090b12 画布 —— 指挥中心式信息密度
 *   - 指挥蓝 #60a5fa 主信号；霓虹青 #00d4ff 做健康/激活指示（info 位）
 *   -  telemetry 琥珀 #fbbf24、告警粉红 #fb7185， slate 文字三档
 *   - 系统无衬线字体
 */

import { SANS, MONO, FLAT_SHADOWS, fillFontTokens, type ThemeMetaMap } from './shared.js';

export const dark = fillFontTokens(
  {
    '--dsw-alias-bg-base': '#090b12',
    '--dsw-alias-bg-layer-1': '#121722',
    '--dsw-alias-bg-layer-2': '#1b2233',
    '--dsw-alias-bg-layer-3': '#232e42',
    '--dsw-alias-bg-overlay': '#121722',
    '--dsw-alias-bg-multi-select': '#121722',
    '--dsw-alias-bg-module-platform': '#121722',
    '--dsw-alias-bg-skeleton': '#121722',

    '--dsw-alias-border-l1': '#1d2636',
    '--dsw-alias-border-l2': '#2a3447',
    '--dsw-alias-border-l2-darkmode-thin': '#1d2636',
    '--dsw-alias-border-l3': '#3b4a63',
    '--dsw-alias-border-l4': '#5b6b84',
    '--dsw-alias-border-inverted': '#f8fafc',
    '--dsw-alias-border-inverted2': '#cbd5e1',
    '--dsw-alias-separator-primary': '#1d2636',
    '--dsw-alias-fill-l2': '#1b2233',
    '--dsw-alias-fill-tsp-secondary': 'rgba(248, 250, 252, 0.05)',

    /* 指挥蓝：主信号 */
    '--dsw-alias-brand-primary': '#60a5fa',
    '--dsw-alias-brand-primary-invert': '#06101d',
    '--dsw-alias-brand-text': '#60a5fa',
    '--dsw-alias-link': '#60a5fa',

    '--dsw-alias-button-primary-fill': '#60a5fa',
    '--dsw-alias-button-primary-hover': '#5898e6',
    '--dsw-alias-button-primary-dimmed': '#538ed7',
    '--dsw-alias-button-contrast-fill': '#f8fafc',
    '--dsw-alias-button-elevated-fill': '#121722',
    '--dsw-alias-button-floating-fill': '#121722',
    '--dsw-alias-button-floating-hover': '#1b2233',
    '--dsw-alias-button-ghost-active-border': '#60a5fa',
    '--dsw-alias-button-ghost-active-fill': '#1b2233',
    '--dsw-alias-button-ghost-active-hover': '#232e42',
    '--dsw-alias-button-info-fill': '#00d4ff',
    '--dsw-alias-button-info-hover': '#1adcff',
    '--dsw-alias-button-tool-bar-fill': '#121722',
    '--dsw-alias-button-tool-bar-fill-invisible': 'transparent',
    '--dsw-alias-button-tool-bar-hover': '#1b2233',

    '--dsw-alias-interactive-bg-hover': '#0e1420',
    '--dsw-alias-interactive-bg-active': '#1b2233',
    '--dsw-alias-interactive-bg-hover-accent': 'rgba(96, 165, 250, 0.15)',
    '--dsw-alias-interactive-bg-hover-danger': 'rgba(251, 113, 133, 0.15)',
    '--dsw-alias-interactive-bg-hover-solid': '#1b2233',

    '--dsw-alias-label-primary': '#f8fafc',
    '--dsw-alias-label-secondary': '#cbd5e1',
    '--dsw-alias-label-tertiary': '#94a3b8',
    '--dsw-alias-label-quaternary': '#64748f',
    '--dsw-alias-label-caption': '#94a3b8',
    '--dsw-alias-label-dimmed': '#64748f',
    '--dsw-alias-label-error': '#fb7185',
    '--dsw-alias-label-primary-foreground': '#f8fafc',
    '--dsw-alias-label-primary-inverted': '#090b12',
    '--dsw-alias-label-primary-bluish': '#60a5fa',

    '--dsw-alias-state-business-primary': '#60a5fa',
    '--dsw-alias-state-business-tertiary': 'rgba(96, 165, 250, 0.15)',
    '--dsw-alias-state-error-primary': '#fb7185',
    '--dsw-alias-state-error-secondary': 'rgba(251, 113, 133, 0.15)',
    '--dsw-alias-state-success-primary': '#22c55e',
    '--dsw-alias-state-success-secondary': 'rgba(34, 197, 94, 0.15)',
    '--dsw-alias-state-warn-primary': '#fbbf24',
    '--dsw-alias-state-warn-secondary': 'rgba(251, 191, 36, 0.15)',
    '--dsw-alias-state-warn-label': '#fbbf24',

    '--dsw-alias-markdown-citation': '#60a5fa',
    '--dsw-alias-markdown-code-block': '#121722',
    '--dsw-alias-markdown-code-block-banner': '#1b2233',
    '--dsw-alias-markdown-inline-code': 'rgba(96, 165, 250, 0.10)',
    '--dsw-alias-markdown-code-segment-selected': 'rgba(96, 165, 250, 0.18)',
    '--dsw-alias-markdown-code-segment-unselected': 'transparent',
    '--dsw-alias-markdown-placeholder': '#64748f',

    '--dsw-alias-scrollbar-bg-l1': '#2a3447',
    '--dsw-alias-scrollbar-bg-l2': '#1b2233',
    '--dsw-alias-scrollbar-hover-l1': '#3b4a63',
    '--dsw-alias-scrollbar-hover-l2': '#2a3447',

    '--dsw-alias-toast-bg': '#121722',
    '--dsw-alias-tooltip-bg': '#232e42',
    '--dsw-hovercard-bg': '#1b2233',

    '--dsw-specific-sidebar-fill': '#090b12',
    '--dsw-specific-sidebar-nav-item-active': 'rgba(96, 165, 250, 0.22)',
    '--dsw-specific-sidebar-nav-item-active-accent': '#60a5fa',
    '--dsw-specific-sidebar-nav-item-hover': '#0e1420',
    '--dsw-specific-bubble': '#121722',
    '--dsw-specific-bubble-highlight': '#1b2233',
    '--dsw-specific-input-major': '#121722',
    '--dsw-specific-login-input': '#121722',
    '--dsw-specific-menu': '#1b2233',
    '--dsw-specific-selector': '#1b2233',
    '--dsw-specific-tip': '#232e42',

    '--dsw-font-family': SANS,
    '--dsw-font-mono': MONO,
    ...FLAT_SHADOWS,
  },
  SANS,
);

export const meta: ThemeMetaMap = {
  dark: {
    id: 'mission-control-dark',
    label: 'Mission Control 深空',
    desc: '深空 #090b12 + 指挥蓝 #60a5fa',
    swatch: ['#090b12', '#121722', '#60a5fa', '#f8fafc'],
  },
};
