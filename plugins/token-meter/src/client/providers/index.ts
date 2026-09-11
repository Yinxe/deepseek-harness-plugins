/**
 * provider 分层渲染入口
 *
 * 「每个 provider return 自己的数据，client 也有一套属于它自己的 UI」：
 *
 *   Host 侧  providers/<type>.ts          适配器 return 自己的数据（view/billing/windows/extra）
 *   Client 侧 providers/ui/<type>.ts      **该供应商专属的完整 UI 实现**（自由排版）
 *            providers/kit.ts             通用可复用零件（滚动刷新条/余额块/指标/图表/失败卡…）
 *            providers/sections.ts        声明式区块渲染（无专属 UI 的供应商零代码可用）
 *            providers/registry.ts        调度：专属 UI → 声明式 → legacy 兜底
 *
 * 扩展方式：
 *  - 只想「能显示」：Host 适配器产出 view 即可，客户端零改动（走声明式层）；
 *  - 想要「专属界面」：在 ui/ 下加一个 `<type>.ts` 并在 ui/index.ts 注册一行，
 *    需要通用零件就从 `ProviderUIKit` 取，不要重复造。
 */
export { createProviderKit, fallbackErrorInfo } from './kit.js';
export type { ProviderUIKit, KitDeps, RenderCtx } from './kit.js';
export { createProviderRenderers, legacySections, registerProviderUI } from './registry.js';
export type { ProviderRenderer } from './registry.js';
export {
  registerProviderUI as registerProviderUIFromUI,
  getProviderUI,
  providerUITypes,
} from './ui/index.js';
export type { ProviderUI } from './ui/index.js';
