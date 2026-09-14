# plugins/vision-bridge — 局部规则

> 本目录是全仓**唯一标杆实现**：新插件有疑问先读这里，再读规范。
> 上层：[根 AGENT.md](../../AGENT.md)（红线规则）→ [docs/](../../docs/)（主题细节）。本文只写本插件自己的事实与局部约定。

## 身份

| 项     | 值                                                                                |
| ------ | --------------------------------------------------------------------------------- |
| 包名   | `@dshp/vision-bridge`                                                             |
| NS     | `dshp-vision-bridge`（四处同名）                                                  |
| 设置节 | `settings.section` order **25**，label「视觉模型」                                |
| inject | `['tools', 'webServer', 'llm']`                                                   |
| 原实现 | `~/.dsh/plugins/vision-bridge`（JS，816 行 `lib/index.js`），本目录为等价 TS 重写 |

## 结构与职责

- `src/host/`：`index.ts`（apply 装配，分段顺序的范式）/ `types.ts` / `config.ts`（DEFAULT_CONFIG + ConfigSchema + sanitize*）/ `http.ts`（json / readBody / sameOrigin，各插件抄这份）/ `cache.ts`（会话级图片 LRU + `walkBlocks`）/ `vision.ts`（模型发现 + 调用 + 主备 fallback）。
- `src/client/`：`index.tsx`（**只导出 `inject` / `apply`**，loader 壳由 `shared/tsup.preset.ts` 拼出）/ `VisionSection.tsx`（设置节，普通函数组件 + JSX 的范式）/ `components.tsx`（Select/Switch/Badge 小构件，真实 props 类型）/ `api.ts` / `styles.module.css`（CSS Modules，局部名不再需要前缀）/ `types.ts`（协议 + 领域模型 + 只含实际用到的 `ClientContext` / `SlotsService` 接缝）。

## 本插件的局部规则

1. **工具描述必须含占位符原文**：`vision_describe` 的 description 写明 `[image omitted because this model accepts text only]` 触发信号与「不要猜图」禁令——纯文本模型靠它决策是否调用。
2. **视觉模型候选的并集来源**：settings 里 `llm-*` 命名空间 `providers[].models[]`（input 含 image）+ `llm.listProviders()/listModels()`（inputModalities 含 image），字典序去重；主备同路由则跳过 fallback。
3. **缓存双通道**：`agent/inbox/inserted`（同步）+ `llm/stream`（记得 `return next()`）；扫块递归处理 `tool-result` 嵌套（`walkBlocks`）；图片只存 6 字段 owned copy，每会话 ≤20 张、全内存 ≤50 会话。
4. **runtime monkey-patch 的范式**：`resolveModelInfo` 接管必须保存原函数、`ctx.effect` 返回恢复、启动 `console.info` 一行说明——能用官方事件就不用 patch。
5. 路由三件套：`GET state` / `POST config` / `GET check`；业务错误一律 200 + `ok:false`（见 [docs/ext-routes.md](../../docs/ext-routes.md)）。

## 自检

`pnpm --filter @dshp/vision-bridge test` = `node --check` 双 bundle + `shared/scripts/check-css-modules.mjs`（`styles.x` 拼错在类型上是合法的，这个静态检查是唯一会自动红的网）。改 host/client 后跑 `build`；README 用户侧文档见本目录 `README.md`。
