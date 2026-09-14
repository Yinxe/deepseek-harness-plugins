/**
 * provider 专属 UI 注册表
 *
 * 「每个 provider 有一套属于它自己的 UI」的落点：一个 type 对应一个 UI 函数，
 * 该函数**完整负责**这个供应商的数据展示（可以随意排版、加专属区块），
 * 通用零件从 `../kit.js` 取。
 *
 *   export function xxxUI(ctx: RenderCtx, K: ProviderUIKit): ReactNode { … }
 *
 * 注册是可选的：没注册的 type 自动落到「声明式区块 → legacy」兜底层，
 * 因此新增供应商**不必写客户端代码**；写了则获得完全自由的专属观感。
 *
 * 注意：专属 UI 只负责「成功快照」的渲染；失败卡片由调度器统一处理
 * （任何 provider 失败都走同一套结构化友好提示 + 重试）。
 */
import type { ProviderUIKit, RenderCtx } from '../kit.js';
import { commandcodeUI } from './commandcode.js';
import { deepseekUI } from './deepseek.js';
import { opencodeUI } from './opencode.js';
import { manualUI } from './manual.js';

/** provider 专属 UI：自己决定怎么画，返回完整节点。 */
export type ProviderUI = (ctx: RenderCtx, K: ProviderUIKit) => any;

const UIS = new Map<string, ProviderUI>();

/** 注册/覆盖某 type 的专属 UI（重复注册覆盖，便于热更与测试）。 */
export function registerProviderUI(type: string, ui: ProviderUI): void {
  if (typeof type === 'string' && type && typeof ui === 'function') UIS.set(type, ui);
}

export function getProviderUI(type: string): ProviderUI | undefined {
  return UIS.get(type);
}

export function hasProviderUI(type: string): boolean {
  return UIS.has(type);
}

export function providerUITypes(): string[] {
  return [...UIS.keys()];
}

// ── 内置专属 UI（新增一行即接入一个供应商的专属界面）──────────────
registerProviderUI('commandcode', commandcodeUI);
registerProviderUI('deepseek', deepseekUI);
registerProviderUI('opencode', opencodeUI);
registerProviderUI('manual', manualUI);
