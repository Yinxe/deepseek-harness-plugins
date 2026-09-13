/**
 * Host 半共享类型
 *
 * DSH 运行时暂无官方类型包，运行时透传对象用 `AnyCtx`（AGENT.md §2.2）；本插件自己的一等公民
 * （配置与补丁）严格建模。客户端的渲染模型（`FileDiff` / `FileChangeModel`）在
 * `src/client/types.ts`。
 */

export type AnyCtx = any;

/** 差异展示方式（与 Client 半的 `DiffView` 逐字对齐）。 */
export type DiffView = 'highlight' | 'diff';

/**
 * 本插件在 `settings.yaml` 里的命名空间内容。
 *
 * 只有两项**显示偏好**，但它们是全插件唯一的权威值：设置节的「文件修改卡片」页与每个
 * 工具行的文件块都读同一份（Client 侧经 `/ext/dshp-file-change-viewer/state` 拉取并本地缓存）。
 * 偏好落 `settings.yaml` 的 NS 分节，跨浏览器、跨会话都在，也吃 schema 校验与 base 层补丁。
 */
export interface PluginConfig {
  /** 差异展示方式：`highlight` = 单代码块统一 diff；`diff` = 逐行 ± 视图。 */
  view: DiffView;
  /**
   * **新渲染**的「编辑 / 写入」操作是否默认展开（键名是历史遗留，含义已收敛为「这一行要不要默认展开」）。
   *
   * 关（默认）= 与思考 / 读取行一致的原生折叠，点一下才展开；开 = 直接看到改动。
   * 只作用于**新渲染**的行：已经渲染出来的行保持它自己的状态（含用户临时点出来的开合）。
   */
  sectionsOpen: boolean;
}

/** 外部来的配置补丁（composition 的 `config:` 层）。 */
export interface PluginConfigPatch {
  view?: DiffView | undefined;
  sectionsOpen?: boolean | undefined;
}
