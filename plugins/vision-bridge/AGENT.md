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
- `src/client/`：`index.ts`（**ModuleLoader** loader）/ `VisionSection.ts`（设置节，`createVisionSection(React, P)` 工厂形态的范式）/ `components.ts`（Select/Switch/Badge 小构件）/ `api.ts` / `styles.ts`（类前缀 `vb-`）/ `types.ts`。

## 本插件的局部规则

1. **工具描述必须含占位符原文**：`vision_describe` 的 description 写明 `[image omitted because this model accepts text only]` 触发信号与「不要猜图」禁令——纯文本模型靠它决策是否调用。
2. **视觉模型候选的并集来源**：settings 里 `llm-*` 命名空间 `providers[].models[]`（input 含 image）+ `llm.listProviders()/listModels()`（inputModalities 含 image），字典序去重；主备同路由则跳过 fallback。
3. **缓存双通道**：`agent/inbox/inserted`（同步）+ `llm/stream`（记得 `return next()`）；扫块递归处理 `tool-result` 嵌套（`walkBlocks`）；图片只存 6 字段 owned copy，每会话 ≤20 张、全内存 ≤50 会话。
4. **runtime monkey-patch 的范式**：`resolveModelInfo` 接管必须保存原函数、`ctx.effect` 返回恢复、启动 `console.info` 一行说明——能用官方事件就不用 patch。
5. 路由三件套：`GET state` / `POST config` / `GET check`；业务错误一律 200 + `ok:false`（见 [docs/ext-routes.md](../../docs/ext-routes.md)）。

## 自检

`pnpm --filter @dshp/vision-bridge test` = `node --check` 双 bundle（无额外脚本）。改 host/client 后跑 `build`；README 用户侧文档见本目录 `README.md`。
