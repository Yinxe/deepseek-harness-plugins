/**
 * @dshp/widget-kit —— Host 半共享类型
 *
 * DSH 运行时的 Cordis ctx / settings / webServer 暂无官方类型包，Host 侧统一用 `AnyCtx`
 * 透传；本插件自有的数据结构（框架偏好）严格建模。
 */

export type AnyCtx = any;
export type AnySettings = any;

/** 框架偏好（settings.yaml 的 `dshp-widget-kit` 分节）。 */
export interface FrameworkConfig {
  trayEnabled: boolean;
  maxVisibleIcons: number;
  badgeIntervalMs: number;
  hoverPreview: boolean;
  referenceWidgets: boolean;
}

/** 路由 body 允许的部分覆盖。 */
export interface FrameworkConfigPatch {
  trayEnabled?: boolean;
  maxVisibleIcons?: number;
  badgeIntervalMs?: number;
  hoverPreview?: boolean;
  referenceWidgets?: boolean;
}
