/**
 * @dshp/file-change-viewer —— DSH Bundle 插件 Host 半（Cordis 插件）
 *
 * 挂载：~/.dsh/profiles/<profile>/cordis.patch.yml（由 bundle patch 自动 insert 一行）
 *
 * ## 本插件为什么几乎全在 Client 半
 *
 * 「文件修改卡片默认展开」是**纯渲染行为**：数据（`meta.diffs`）由官方 `dsh-tool-fs`
 * 的 edit / write 工具在结果元数据里给出，客户端的 `tool.call.toolview` 槽位就是
 * 官方留给我们接管这张卡片的扩展点。因此 Host 半没有工具、没有路由、没有 settings：
 * 每多一个配置项就多一份文档、一个控件、一处校验，而这里确实没有任何东西需要用户配置
 * （唯一行为就是「别折叠」，这正是插件的全部意义）。
 *
 * ## 那为什么还要 Host 半
 *
 * 因为 DSH 是**从 Host Loader 的条目里扫描 `dsh.client` 声明**来发现并下发客户端
 * bundle 的（`@deepseek-ai/dsh-client-modules` 的 activation scan）。也就是说：
 * 没有本文件（`lib/host.js`）+ cordis.patch.yml 的 insert 行，`lib/client.js` 不会被
 * 找到、更不会被加载。Host 半在这里的角色是 **bundle 入口与客户端发现锚点**，
 * 这不是偷懒，而是双 bundle 架构的既定契约。
 *
 * ## 原实现
 *
 * 动态版（`cordis_define` 的 client-only package，进程内临时扩展）→ 本目录 TS 标准包：
 * 客户端逻辑等价重写为 `src/client/*.ts`，并把当时的自绘 diff 换成官方
 * `@deepseek-ai/dsh-client-ui-primitives` 的 `DiffBlock` / `DisclosureRow`
 * （与内置卡片同源同色，不再有写死色值）。
 *
 * @module @dshp/file-change-viewer
 */
import type { AnyCtx } from './types.js';

export const name = '@dshp/file-change-viewer';

/** 无硬依赖：Host 半不读任何 service，service 缺失也照常挂载。 */
export const inject: string[] = [];

/**
 * 挂载 Host 半；无副作用可注册，仅打印一行就绪日志。
 *
 * 约定：apply 顶层不抛（本段无注册动作，自然满足），崩溃的只可能是日志本身——
 * 那也属于不该拖垮 composition 的情况。
 *
 * @param _ctx - Cordis 插件上下文（本插件 Host 半不使用）。
 */
export function apply(_ctx: AnyCtx): void {
  console.info('[dshp-file-change-viewer] Host 半已挂载：渲染逻辑在 Client 半，edit / write 卡片默认展开。');
}
