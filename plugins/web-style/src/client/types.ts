/**
 * Client 半共享类型（设置 → 外观定制）
 * 与 Host 的 /ext/dshp-web-style/* 路由协议对齐（见 src/host/types.ts）
 *
 * @module @dshp/web-style/client
 */

/** DSH __ModuleLoader__ 的 require（运行时提供 react / primitives） */
export type DshRequire = (id: 'react' | '@deepseek-ai/dsh-client-ui-primitives' | string) => any;
export type AnyReact = any;
export type AnyCtx = any;

/** 主题色值映射（Host 下发的全量 token）。 */
export type TokenMap = Record<string, string>;

/** 画廊卡片展示信息（token 不在其中，按需问 Host 要）。 */
export interface ThemeMeta {
  id: string;
  colorScheme: 'light' | 'dark';
  label: string;
  desc: string;
  /** 卡片三色拼接 + 搜索 accent（第 3 位即 accent）；虚拟主题不带色卡 */
  swatch?: string[];
  /** 卡片左上角小标签（缺省回退「深色/浅色 · accent」）。 */
  tag?: string;
  /** 虚拟壁纸主题的运行时 seed（仅 photo:custom 用）。 */
  accent?: string;
}

/** 持久化的壁纸调色盘（accent 恒等于 seed）。 */
export interface PhotoPalette {
  accent: string;
  companionA: string;
  companionB: string;
}

/** 圆角配置（Host settings 形状）。 */
export interface RadiusConfig {
  global: number;
}

/** GET /ext/dshp-web-style/state 应答。 */
export interface StateReply {
  ok?: boolean;
  themeId?: string;
  /** seed 为旧数据兼容字段（新数据 seed 恒等于 accent），读取时二者取一 */
  photoPalette?: (PhotoPalette & { seed?: string }) | null;
  radius?: RadiusConfig;
  wallpaper?: Record<string, unknown>;
  glass?: Record<string, unknown>;
  error?: string;
}

/** GET /ext/dshp-web-style/themes 应答。 */
export interface ThemesReply {
  ok?: boolean;
  count?: number;
  themes?: Array<ThemeMeta & { tokens?: TokenMap }>;
  error?: string;
}

/** POST /theme 与 POST /config 共用应答（= state 快照）。 */
export type SaveReply = StateReply;

/** POST /config 的补丁体。 */
export interface ConfigPatch {
  radius?: RadiusConfig;
  photoPalette?: PhotoPalette | null;
}

/** 主题覆盖层 pair：每个 token 一份 {light, dark}。 */
export type TokenOverridePair = Record<string, { light: string; dark: string }>;

/** theme 服务快照（只取插件真正读的 leaf 字段）。 */
export interface ThemeSnapshot {
  preference?: string;
  revision?: number;
  active?: { id?: string; tokens?: TokenMap } | null;
}

/** theme 服务（官方外观服务，插件只消费不替换）。 */
export interface ThemeService {
  getTheme(): ThemeSnapshot;
  setTheme(preference: string): void;
  /** 注册 token 覆盖层，返回撤销函数。 */
  overrideTokens(source: string, pair: TokenOverridePair): () => void;
}

/** slots 服务（设置节注册）。 */
export interface SlotsService {
  inject(name: string, fn: () => unknown): unknown;
  register(spec: { name: string; id: string; order: number; label: string }, component: any): unknown;
}
