/**
 * notion.ts —— Notion 暖白极简（纯 light）。
 *
 * 参考 open-design/design-systems/notion：
 *   - 纯白画布 + 暖白 #f6f5f4 次级面；灰阶全带黄褐暖底（#31302e / #615d59 / #a39e98）
 *   - 主文字 rgba(0,0,0,0.95)——"渐弱至无形"的近黑
 *   - Notion Blue #0075de 是唯一饱和色
 *   - whisper 边框（1px rgba(0,0,0,0.1)）+ 多层微阴影（<0.05 不透明度）——深度"感觉得到但看不见"
 *   - NotionInter 字体栈
 */

import { NOTION, MONO, fillFontTokens, type ThemeMetaMap } from './shared.js';

export const light = fillFontTokens(
  {
    '--dsw-alias-bg-base': '#ffffff',
    '--dsw-alias-bg-layer-1': '#f6f5f4',
    '--dsw-alias-bg-layer-2': '#efefee',
    '--dsw-alias-bg-layer-3': '#e8e7e5',
    '--dsw-alias-bg-overlay': '#ffffff',
    '--dsw-alias-bg-multi-select': '#f6f5f4',
    '--dsw-alias-bg-module-platform': '#f6f5f4',
    '--dsw-alias-bg-skeleton': '#f6f5f4',

    /* whisper 边框：半透明黑 */
    '--dsw-alias-border-l1': 'rgba(0, 0, 0, 0.1)',
    '--dsw-alias-border-l2': 'rgba(0, 0, 0, 0.16)',
    '--dsw-alias-border-l2-darkmode-thin': 'rgba(0, 0, 0, 0.1)',
    '--dsw-alias-border-l3': 'rgba(0, 0, 0, 0.24)',
    '--dsw-alias-border-l4': 'rgba(0, 0, 0, 0.32)',
    '--dsw-alias-border-inverted': '#31302e',
    '--dsw-alias-border-inverted2': '#615d59',
    '--dsw-alias-separator-primary': 'rgba(0, 0, 0, 0.06)',
    '--dsw-alias-fill-l2': '#efefee',
    '--dsw-alias-fill-tsp-secondary': 'rgba(0, 0, 0, 0.04)',

    '--dsw-alias-brand-primary': '#0075de',
    '--dsw-alias-brand-primary-invert': '#ffffff',
    '--dsw-alias-brand-text': '#0075de',
    '--dsw-alias-link': '#0075de',

    '--dsw-alias-button-primary-fill': '#0075de',
    '--dsw-alias-button-primary-hover': '#005bab',
    '--dsw-alias-button-primary-dimmed': '#005bab',
    '--dsw-alias-button-contrast-fill': '#31302e',
    '--dsw-alias-button-elevated-fill': '#ffffff',
    '--dsw-alias-button-floating-fill': '#ffffff',
    '--dsw-alias-button-floating-hover': '#f6f5f4',
    '--dsw-alias-button-ghost-active-border': 'rgba(0, 0, 0, 0.16)',
    '--dsw-alias-button-ghost-active-fill': '#efefee',
    '--dsw-alias-button-ghost-active-hover': '#e8e7e5',
    '--dsw-alias-button-info-fill': '#0075de',
    '--dsw-alias-button-info-hover': '#005bab',
    '--dsw-alias-button-tool-bar-fill': '#f6f5f4',
    '--dsw-alias-button-tool-bar-fill-invisible': 'transparent',
    '--dsw-alias-button-tool-bar-hover': '#efefee',

    '--dsw-alias-interactive-bg-hover': '#f6f5f4',
    '--dsw-alias-interactive-bg-active': '#efefee',
    '--dsw-alias-interactive-bg-hover-accent': 'rgba(0, 117, 222, 0.10)',
    '--dsw-alias-interactive-bg-hover-danger': 'rgba(220, 38, 38, 0.08)',
    '--dsw-alias-interactive-bg-hover-solid': '#efefee',

    '--dsw-alias-label-primary': 'rgba(0, 0, 0, 0.95)',
    '--dsw-alias-label-secondary': '#31302e',
    '--dsw-alias-label-tertiary': '#615d59',
    '--dsw-alias-label-quaternary': '#a39e98',
    '--dsw-alias-label-caption': '#615d59',
    '--dsw-alias-label-dimmed': '#a39e98',
    '--dsw-alias-label-error': '#dc2626',
    '--dsw-alias-label-primary-foreground': '#ffffff',
    '--dsw-alias-label-primary-inverted': '#ffffff',
    '--dsw-alias-label-primary-bluish': '#0075de',

    '--dsw-alias-state-business-primary': '#0075de',
    '--dsw-alias-state-business-tertiary': 'rgba(0, 117, 222, 0.10)',
    '--dsw-alias-state-error-primary': '#dc2626',
    '--dsw-alias-state-error-secondary': 'rgba(220, 38, 38, 0.08)',
    '--dsw-alias-state-success-primary': '#1aae39',
    '--dsw-alias-state-success-secondary': 'rgba(26, 174, 57, 0.10)',
    '--dsw-alias-state-warn-primary': '#dd5b00',
    '--dsw-alias-state-warn-secondary': 'rgba(221, 91, 0, 0.10)',
    '--dsw-alias-state-warn-label': '#dd5b00',

    '--dsw-alias-markdown-citation': '#0075de',
    '--dsw-alias-markdown-code-block': '#f6f5f4',
    '--dsw-alias-markdown-code-block-banner': '#efefee',
    '--dsw-alias-markdown-inline-code': 'rgba(0, 0, 0, 0.06)',
    '--dsw-alias-markdown-code-segment-selected': 'rgba(0, 117, 222, 0.12)',
    '--dsw-alias-markdown-code-segment-unselected': 'transparent',
    '--dsw-alias-markdown-placeholder': '#a39e98',

    '--dsw-alias-scrollbar-bg-l1': 'rgba(0, 0, 0, 0.14)',
    '--dsw-alias-scrollbar-bg-l2': 'rgba(0, 0, 0, 0.08)',
    '--dsw-alias-scrollbar-hover-l1': 'rgba(0, 0, 0, 0.26)',
    '--dsw-alias-scrollbar-hover-l2': 'rgba(0, 0, 0, 0.16)',

    '--dsw-alias-toast-bg': '#ffffff',
    '--dsw-alias-tooltip-bg': '#31302e',
    '--dsw-hovercard-bg': '#ffffff',
    '--dsw-specific-sidebar-fill': '#f6f5f4',
    '--dsw-specific-sidebar-nav-item-active': 'rgba(0, 117, 222, 0.22)',
    '--dsw-specific-sidebar-nav-item-active-accent': '#0075de',
    '--dsw-specific-sidebar-nav-item-hover': '#efefee',
    '--dsw-specific-bubble': '#f6f5f4',
    '--dsw-specific-bubble-highlight': '#efefee',
    '--dsw-specific-input-major': '#f6f5f4',
    '--dsw-specific-login-input': '#f6f5f4',
    '--dsw-specific-menu': '#ffffff',
    '--dsw-specific-selector': '#ffffff',
    '--dsw-specific-tip': '#31302e',

    /* 多层微阴影 —— Notion "felt-not-seen" 深度 */
    '--dsw-shadow-lv1': '0 1px 2px rgba(0, 0, 0, 0.04)',
    '--dsw-shadow-lv2': '0 2px 6px rgba(0, 0, 0, 0.04)',
    '--dsw-shadow-lv3': '0 4px 12px rgba(0, 0, 0, 0.05)',
    '--dsw-shadow-lv1-blur': '2px',

    '--dsw-font-family': NOTION,
    '--dsw-font-mono': MONO,
  },
  NOTION,
);

export const meta: ThemeMetaMap = {
  light: {
    id: 'notion-light',
    label: 'Notion 暖白极简',
    desc: '纯白 + 暖灰 + Notion 蓝',
    swatch: ['#ffffff', '#f6f5f4', '#31302e', '#0075de'],
  },
};
