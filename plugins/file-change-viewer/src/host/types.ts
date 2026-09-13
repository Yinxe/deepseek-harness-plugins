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

/** 改动两侧多显示几行上下文（与 Client 半的列举逐字对齐）。 */
export type ContextLines = 0 | 3 | 5 | 8;

/**
 * 本插件在 `settings.yaml` 里的命名空间内容。
 *
 * 两项**显示偏好** + 一个**工具开关**，但它们是全插件唯一的权威值：设置节的「文件修改卡片」页与
 * 每个工具行的文件块都读同一份（Client 侧经 `/ext/dshp-file-change-viewer/state` 拉取并本地缓存）。
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
  /**
   * 差异卡片在改动两侧**多显示几行没受影响的上下文**。
   *
   * 上下文来自文件当前内容（Host 的 `/locate` 路由读文件定位后一并回传），不是模型在
   * `old_string` / 补丁片段里带的那几行——所以模型只给 1 行上下文时，卡片照样能看到前后文。
   * `0` = 只显示模型给的内容（旧行为）。
   */
  contextLines: ContextLines;
  /**
   * 是否注册 **`patch` 工具**（批量 / 零散修改那一个）。
   *
   * **默认关**：它是本插件的测试版能力，注册与否由这一项动态决定——改完立即生效（Host 半在
   * settings 的 `onChange` 里重新判定：需要就注册、取消就反注册），不必重启 `dsh web`。
   * 关着的时候模型看不到 `patch`，只会用官方的 `read` / `write` / `edit`。
   */
  patchTool: boolean;
}

/** 外部来的配置补丁（composition 的 `config:` 层）。 */
export interface PluginConfigPatch {
  view?: DiffView | undefined;
  sectionsOpen?: boolean | undefined;
  patchTool?: boolean | undefined;
  contextLines?: ContextLines | undefined;
}
