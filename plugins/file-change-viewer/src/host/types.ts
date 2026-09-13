/**
 * Host 半共享类型
 *
 * 本插件 Host 半只做 bundle 入口与 `dsh.client` 发现锚点，没有自有数据结构，
 * 因此这里只有运行时透传用的 `AnyCtx`（DSH 运行时暂无官方类型包，见 AGENT.md §2.2）。
 * 真正的数据建模（`FileDiff` / `FileChangeModel`）在 `src/client/types.ts`。
 */

export type AnyCtx = any;
