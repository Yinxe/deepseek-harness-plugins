/**
 * shared.ts —— 主题包共享常量与工具（Host 半）
 *
 * 字体栈、字体 token 批量填充、单主题定义的通用形状。
 * 每套主题文件导出 { dark?, light?, meta }：
 *   - dark / light：`--dsw-*` token → CSS 值 的映射（不含字体批量 token，注册前填充）
 *   - meta：画廊展示元数据（id / label / desc / swatch）
 *
 * 有意不覆盖的 token（全部 23 套主题一律不定义，由官方亮/暗值直接生效）：
 *   - `--dsw-alias-markdown-tag`：DSH 里它是「活动标签页底色」（index-*.css 的
 *     `._tabActive_* { background: var(--dsw-alias-markdown-tag) }`），是面不是前景。
 *     主题若按前景语义填中灰实色，会把活动标签页压成一块灰块；故交给官方默认。
 *
 * 原实现：dsh-custom-ui/lib/themes/shared.js（JS），本文件为等价 TS 重写，
 * 仅补类型（TokenMap / ThemeMetaMap），常量与函数逻辑逐行对齐。
 *
 * @module @dshp/web-style/themes
 */

/** 一套主题的单 scheme token 映射（`--dsw-*` → CSS 值）。 */
export type TokenMap = Record<string, string>;

/** 单套主题（单 scheme）的画廊展示元数据。 */
export interface ThemeMetaEntry {
  /** 主题 id，全局唯一（Host 白名单与持久化值都用它）。 */
  id: string;
  label: string;
  desc: string;
  /** 卡片三色拼接 + 搜索 accent（前三位用于色块）。 */
  swatch: string[];
}

/** 一个主题模块的 meta：单模式主题只贡献自己那一份。 */
export interface ThemeMetaMap {
  dark?: ThemeMetaEntry;
  light?: ThemeMetaEntry;
}

/** 主题模块的形状（`import * as x from './x.js'` 即为该形状）。 */
export interface ThemeModule {
  dark?: TokenMap;
  light?: TokenMap;
  meta?: ThemeMetaMap;
}

/** 目录条目 = meta + scheme + 全量 token（Host 经 GET /themes 下发的形态）。 */
export interface ThemeCatalogEntry extends ThemeMetaEntry {
  colorScheme: 'dark' | 'light';
  tokens: TokenMap;
}

/** Berkeley Mono 等宽栈（opencode "everything is code"）。 */
export const MONO =
  '"Berkeley Mono", "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace';
/** 通用系统无衬线栈（GitHub / NVIDIA）。 */
export const SANS =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif';
/** Linear 的 Inter 栈。 */
export const INTER =
  '"Inter Variable", "Inter", "SF Pro Display", -apple-system, system-ui, "Segoe UI", Roboto, sans-serif';
/** Notion 的 NotionInter 栈。 */
export const NOTION = '"NotionInter", "Inter", -apple-system, system-ui, Helvetica, Arial, sans-serif';
/** Claude 的 Anthropic Sans 栈。 */
export const CLAUDE_SANS = '"Anthropic Sans", "Arial", system-ui, -apple-system, sans-serif';

/** HashiCorp Sans 栈（标题面；正文回落到 system-ui）。 */
export const HASHICORP =
  '"HashiCorp Sans", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif';
/** Runway 的 abcNormal 栈（单一字体包办从 48px 标题到 11px 标签）。 */
export const ABC_NORMAL =
  '"abcNormal", "abcNormal Fallback", "Inter", "DM Sans", system-ui, -apple-system, "Segoe UI", sans-serif';
/** SpaceX 的 D-DIN 栈（工业 DIN 血统，全大写 + 正字距）。 */
export const DIN = '"D-DIN", "DIN Alternate", "Helvetica Neue", Arial, Verdana, sans-serif';
/** Warp 的 Matter 栈（几何无衬线，Regular 一档走天下）。 */
export const MATTER = '"Matter Regular", "Matter", "Inter", ui-sans-serif, system-ui, sans-serif';
/** Spotify 的 CircularSp 派生栈（SpotifyMixUI / SpotifyMixUITitle）。 */
export const SPOTIFY = '"SpotifyMixUI", "CircularSp", "Helvetica Neue", Helvetica, Arial, sans-serif';
/** Tetris 的像素显示栈（Press Start 2P）。 */
export const PIXEL = '"Press Start 2P", "Arial Black", system-ui, sans-serif';

/** Roboto Mono 栈（trading-terminal 的数据面）。 */
export const ROBOTO_MONO = '"Roboto Mono", "SF Mono", ui-monospace, Menlo, monospace';
/** Geist Mono 栈（Raycast / Warp 的代码面）。 */
export const GEIST_MONO =
  '"Geist Mono", "GeistMono", ui-monospace, "SF Mono", Menlo, Monaco, Consolas, monospace';
/** SF Mono 栈（minimal / sleek）。 */
export const SF_MONO = '"SF Mono", ui-monospace, Menlo, Monaco, Consolas, monospace';

/** UI 文本字体 token 前缀集合（base-16 / l-20 / … / xxxs-strong-11）。 */
export const TEXT_STYLE_KEYS: string[] = [
  'base-16',
  'base-strong-16',
  'l-20',
  'm-18',
  's-14',
  's-strong-14',
  'xl-24',
  'xs-13',
  'xs-strong-13',
  'xxs-12',
  'xxs-strong-12',
  'xxxs-11',
  'xxxs-strong-11',
];

/** Markdown 渲染字体 token 前缀集合。 */
export const MD_STYLE_KEYS: string[] = [
  'base',
  'base-italic',
  'base-strong',
  'base-strong-italic',
  'small',
  'small-italic',
  'small-strong',
  'small-strong-italic',
  'code',
  'code-block',
  'code-block-small',
  'h1',
  'h2',
  'h3',
  'h4',
  'table',
  'table-head',
];

/**
 * 把字体批量 token 填充进一份 token 映射（原地修改）。
 *
 * `mono` 传 true 时全部文本走 MONO（opencode「一切皆代码」）；传字符串时把它当作
 * 该主题的等宽栈 —— 此时 markdown 代码块与 `--dsw-font-mono` 保持同源
 * （Roboto Mono / Geist Mono / Press Start 2P 这类主题专属等宽栈）。
 */
export function fillFontTokens(tokens: TokenMap, font: string, mono?: boolean | string): TokenMap {
  const monoStack = typeof mono === 'string' ? mono : MONO;
  const ui = mono === true ? MONO : font;
  for (const s of TEXT_STYLE_KEYS) tokens[`--dsw-font-${s}-font-family`] = ui;
  for (const m of MD_STYLE_KEYS) {
    const isCode = m === 'code' || m === 'code-block' || m === 'code-block-small';
    tokens[`--dsw-font-markdown-${m}-font-family`] = isCode ? monoStack : ui;
  }
  return tokens;
}

/** 阴影扁平化（opencode / Linear / NVIDIA / GitHub 暗色的纯 border 深度观感）。 */
export const FLAT_SHADOWS: TokenMap = {
  '--dsw-shadow-lv1': 'none',
  '--dsw-shadow-lv2': 'none',
  '--dsw-shadow-lv3': 'none',
  '--dsw-shadow-lv1-blur': '0px',
};
