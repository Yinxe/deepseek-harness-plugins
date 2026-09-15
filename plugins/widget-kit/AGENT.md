# plugins/widget-kit — 局部规则

> 本目录是**小组件规范**的实现：不含业务，只提供宿主与契约。
> 上层：[根 AGENT.md](../../AGENT.md)（红线）→ [docs/](../../docs/)（主题细节）→
> **组件提供方看 [`docs/widget-spec.md`](../../docs/widget-spec.md)**（那份才是对外契约）。

## 身份

| 项     | 值                                                                                                                                                                                                |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 包名   | `@dshp/widget-kit`                                                                                                                                                                                |
| NS     | `dshp-widget-kit`（settings 命名空间 / 路由前缀 / patch id / 设置节 id 四处同名）                                                                                                                 |
| 契约   | `SPEC_VERSION = 1`，公开类型在 `spec.d.ts`（其它插件 `import type` 的唯一入口）                                                                                                                   |
| inject | host：`['webServer']`；client：`['slots', 'timer']`                                                                                                                                               |
| 槽位   | `conversation.session.header.utilities` id `dshp-widget-kit-tray` order **30**<br>`shell.overlay` id `dshp-widget-kit-cards` order **10**<br>`settings.section` id `dshp-widget-kit` order **32** |
| 路由   | `GET /ext/dshp-widget-kit/state` / `POST /ext/dshp-widget-kit/config`                                                                                                                             |
| 服务   | `ctx.reflect.provide('widgets', …)` —— 别的插件通过 `inject: ['widgets']` 拿到                                                                                                                    |

## 结构与职责

- `src/client/spec.ts` —— **规范单一事实来源**：公开类型 + 默认值 + `normalizeDescriptor` 校验器 + `SPEC_KEYS`。
- `spec.d.ts` —— 给别的插件 `import type` 的手写契约；与 `spec.ts` 由 `check-spec-drift.mjs` 逐字段比对。
- `src/client/geometry.ts` —— 全部卡片几何（夹紧 / 八向缩放 / 内容盒 / 尺寸档 / z 序），纯函数。
- `src/client/store.ts` —— localStorage 布局（消毒 / 版本 / debounce / 合并可见顺序 / 卸载清理），纯逻辑 + 注入 IO。
- `src/client/service.ts` —— 运行时：注册表 + 布局状态 + 动作（open/close/minimize/z 序/会话绑定/尺寸回环防护）。
  - **popover 悬停控制器**（`hoverEnter` / `hoverLeave` + `openOrigin`：延迟展开、宽限收起、被点开的不受移开指针影响 —— 这一套只在这一处实现）。
- `src/client/badges.ts` —— 徽标调度：全局 1s tick、可见性门控、5s 超时、指数退避、连续失败转告警色。
- `src/client/hooks.ts` —— React 粘合：快照订阅（`useSyncExternalStore`）、数据生命周期、指针拖拽（官方 `DragHandle` 范式）。
- `src/client/{Tray,Card,CardLayer,Popover,ResizeHandles,ErrorBoundary}.tsx` —— 承载面 UI。
- `src/client/SettingsSection.tsx` / `api.ts` / `components.tsx` —— 设置节（偏好）。
- `src/client/widgets/{clock,diagnostics}.tsx` —— **参考实现**（规范示例，不是业务；可在设置里关掉）。
- `src/host/` —— 只做三件事：声明 NS/schema、两条同源路由、一行启动日志。

## 本插件的局部规则

1. **几何与存储必须自包含**：`spec.ts` / `geometry.ts` / `store.ts` 只允许 `import type`，
   禁止值导入别的 `.ts`。原因是 `scripts/check-*.mjs` 用 Node 的 TS 类型擦除直接 import 这三个源文件，
   值导入的 `./x.js` 在 Node 里解析不到（源码只有 `x.ts`）。三处与 `spec.ts` 重复的常量由
   `check-geometry.mjs` 断言相等。
2. **父子常量不重复第四遍**：`TITLE_BAR_HEIGHT` / `CONTENT_PADDING` / `MIN_VISIBLE_TITLE_BAR` / `CASCADE_STEP`
   只在 `geometry.ts` 与 `SPEC_DEFAULTS` 各一份，靠自检对齐。
3. **本机布局 vs 用户配置**：布局进 localStorage（`dshp-widget-kit:v1`），配置进 settings.yaml NS。
   任何新状态都要先归到这两边之一，不许开第三个坑（见 `docs/widget-spec.md` §7）。
4. **悬停语义只有一份实现**：延迟展开、宽限收起、`openOrigin`（被点开的不受移开指针影响）都在
   `service.ts`。托盘只报「指针进出图标」、面板只报「指针进出面板」，两边都调 `hoverEnter`/`hoverLeave` ——
   这样「图标 → 面板」的间隙才被同一条宽限覆盖，被取消的定时器也不会事后自己蹦出来。
5. **服务只发布 facade**：`createWidgetsService(runtime)` 只暴露 `SPEC_KEYS.service` 那几个成员，
   内部方法（`setLive`/`commitLive`/`pruneOrphans`…）不出插件。
6. **每帧只通知正在拖的那张卡**：live 快照（`subscribeLive`/`getLive`）与 layout 快照分开，
   60fps 拖动不得带着托盘和其它卡重渲染。
7. **内容数据生命周期只在 `useWidgetData`**：组件提供方不写请求代码；`popover` 的 `setSize` 是
   `undefined`（不是静默 no-op）；尺寸回环防护在 `service.requestSize` 里硬停。
8. **错误隔离三层**：`badge` 与 `load` 各自 try/catch + 超时；`render` 走 `WidgetErrorBoundary`
   （全插件唯一 class 组件）；托盘图标渲染失败不影响其它图标。
9. **不写产品 DOM**：不使用 portal 到 `document.body`（popover 定位靠官方 `useAnchoredPosition`），
   只通过槽位落点渲染；样式里不出现字面色值。

## 自检

`pnpm --filter @dshp/widget-kit test` 串起六个检查（全部只依赖 node 内建模块）：

| 脚本                                   | 覆盖                                                                                                                                                                                                                                                                                             |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `check-geometry.mjs`                   | 夹紧四向、层叠落点、内容盒换算、尺寸档阈值、八向缩放（对边固定/上下限/北向不越 0）、z 序、与 spec 常量不漂移                                                                                                                                                                                     |
| `check-store.mjs`                      | 消毒（坏结构/版本/类型/未知 id/超长/夹紧/布尔强制）、读写降级、debounce/flush/cancel/onError、菜单顺序、卸载清理                                                                                                                                                                                 |
| `check-spec-drift.mjs`                 | `spec.d.ts` ↔ `SPEC_KEYS` 逐字段比对；`FRAMEWORK_VERSION` ↔ `package.json`；host/config.ts 同版本；`./spec` 类型入口存在                                                                                                                                                                         |
| `check-css-tokens.mjs`                 | 样式表里没有字面色值；其它插件产物里不得出现 `@dshp/widget-kit`                                                                                                                                                                                                                                  |
| `check-client.mjs`                     | 无头跑 `lib/client.js`：loader 契约、服务发布（成员 = `SPEC_KEYS.service`）、三条槽位注册、effect 前缀、16 类非法描述符、注册/覆盖/清理、**渲染一遍**托盘与卡片（含 8 个把手、几何、尺寸档变化）、**popover 两种触发**（悬停延迟/宽限撤销/单开/关闭清定时器，width·padding·header 真的落到 DOM） |
| `shared/scripts/check-css-modules.mjs` | `styles.x` 拼错（类型上合法、运行时静默丢 className）                                                                                                                                                                                                                                            |
