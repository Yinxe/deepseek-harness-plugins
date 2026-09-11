/**
 * Host 半自有类型（设置页协议 + 持久化形状）
 *
 * 与 client 半 `src/client/types.ts` 的路由协议保持对齐：
 * GET /ext/dshp-web-style/state、GET /themes、POST /theme、POST /config。
 *
 * @module @dshp/web-style
 */

/** DSH 运行时透传对象（无官方 npm 类型包，统一 any；自有的数据结构见下方） */
export type AnyCtx = any;
export type AnySettings = any;

/** 全局圆角：-1 跟随主题 / 0 全锐角 / N 统一圆润（当前只暴露 global） */
export interface RadiusConfig {
  global: number;
}

/** 壁纸取色的持久化形态（accent 恒等于 seed；companions 仅信息性派生） */
export interface PhotoPalette {
  accent: string;
  companionA: string;
  companionB: string;
}

/** settings.yaml `dshp-web-style` 命名空间的完整快照 */
export interface StyleConfig {
  /** 选中的主题 id；空串 = 完全跟随官方亮/暗偏好 */
  themeId: string;
  photoPalette: PhotoPalette | null;
  radius: RadiusConfig;
  /** 已退役特性（旧数据透传保留，UI 不再读写） */
  wallpaper: Record<string, unknown>;
  glass: Record<string, unknown>;
}

/** 部分覆盖（cordis.patch.yml 的 config / 路由 body 用） */
export interface StyleConfigPatch {
  themeId?: string;
  photoPalette?: PhotoPalette | null;
  radius?: Partial<RadiusConfig>;
  wallpaper?: Record<string, unknown>;
  glass?: Record<string, unknown>;
}
