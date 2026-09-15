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
  /** 卡片背景不透明度（0.2–1）与毛玻璃模糊半径（px，0–32）：用户偏好，写进 settings.yaml。 */
  cardOpacity: number;
  cardBlur: number;
  /** 卡片边框与圆角样式档。 */
  cardBorder: 'auto' | 'on' | 'off';
  cardRadius: 'auto' | 'round' | 'square';
  /** 动效时长（ms，0–500）：`0` = 关闭过渡与入场动画。 */
  motionMs: number;
}

/** 路由 body 允许的部分覆盖。 */
export interface FrameworkConfigPatch {
  trayEnabled?: boolean;
  maxVisibleIcons?: number;
  badgeIntervalMs?: number;
  hoverPreview?: boolean;
  referenceWidgets?: boolean;
  cardOpacity?: number;
  cardBlur?: number;
  cardBorder?: 'auto' | 'on' | 'off';
  cardRadius?: 'auto' | 'round' | 'square';
  motionMs?: number;
}
