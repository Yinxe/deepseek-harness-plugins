# plugins/widget-kit — 局部规则

> 本目录是**小组件规范**的实现：不含业务，只提供宿主与契约。
> 上层：[根 AGENT.md](../../AGENT.md)（红线）→ [docs/](../../docs/)（主题细节）→
> **组件提供方看 [`docs/widget-spec.md`](../../docs/widget-spec.md)**（那份才是对外契约）。

## 身份

| 项     | 值                                                                                                                                                                                                |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 包名   | `@dshp/widget-kit`                                                                                                                                                                                |
| NS     | `dshp-widget-kit`（settings 命名空间 / 路由前缀 / patch id / 设置节 id 四处同名）                                                                                                                 |
| 契约   | `SPEC_VERSION = 1`（0.2.0 的改动全是向后兼容新增），公开类型在 `spec.d.ts`（其它插件 `import type` 的唯一入口）                                                                                   |
| inject | host：`['webServer']`；client：`['slots', 'timer']`                                                                                                                                               |
| 槽位   | `conversation.session.header.utilities` id `dshp-widget-kit-tray` order **30**<br>`shell.overlay` id `dshp-widget-kit-cards` order **10**<br>`settings.section` id `dshp-widget-kit` order **32** |
| 路由   | `GET /ext/dshp-widget-kit/state` / `POST /ext/dshp-widget-kit/config`                                                                                                                             |
| 服务   | `ctx.reflect.provide('widgets', …)` —— 别的插件通过 `inject: ['widgets']` 拿到                                                                                                                    |

## 结构与职责

- `src/client/spec.ts` —— **规范单一事实来源**：公开类型 + 默认值 + `normalizeDescriptor` 校验器 + `SPEC_KEYS`。
- `spec.d.ts` —— 给别的插件 `import type` 的手写契约；与 `spec.ts` 由 `check-spec-drift.mjs` 逐字段比对。
- `src/client/geometry.ts` —— 全部卡片几何（视口夹紧 / 八向缩放 / 内容盒 / 尺寸档 / z 序），
  以及**移动落点的吸附与防重叠**（`dockRect` + `snapAxis` / `alignAxis` / `escapeConflicts` / `conflicts`），纯函数。
- `src/client/store.ts` —— localStorage 布局（消毒 / 版本 / debounce / 合并可见顺序 / 一维拖拽排序 / 卸载清理），纯逻辑 + 注入 IO。
- `src/client/service.ts` —— 运行时：注册表 + 布局状态 + 动作（open/close/minimize/锁定/启停/z 序/会话绑定/尺寸回环防护）。
  - **打开状态与层叠顺序也住在 `state` 里**（不是局部变量）：`zOrder` / `popoverId` / `popoverOrigin` 都要落盘，
    刷新后原地恢复 —— 这是 0.2.0 修掉的「刷新即重置」。
  - **首帧会话绑定不算切会话**：`setSession` 里 `sessionId === null` 时只绑定、不清理。
  - **popover 悬停控制器**（`hoverEnter` / `hoverLeave` + `popoverOrigin`：延迟展开、宽限收起、被点开的不受移开指针影响、
    `persistent` 面完全不收起 —— 这一套只在这一处实现）。
- `src/client/badges.ts` —— 徽标调度：全局 1s tick、可见性门控、5s 超时、指数退避、连续失败转告警色。
- `src/client/hooks.ts` —— React 粘合：快照订阅（`useSyncExternalStore`）、数据生命周期、指针拖拽（官方 `DragHandle` 范式）。
- `src/client/{Tray,Card,CardLayer,Popover,ResizeHandles,ErrorBoundary}.tsx` —— 承载面 UI。
- `src/client/SettingsSection.tsx` / `api.ts` / `components.tsx` —— 设置节（偏好）。
- `src/client/widgets/{clock,diagnostics,quick-settings,status}.tsx` —— **四个参考实现**（规范示例，不是业务；可在设置里关掉）：
  `clock` / `diagnostics` 是卡片（演示尺寸呈现、注册表诊断与**在组件里启停别的组件**），
  `quick-settings` 是**点击展开 + 常驻**的 popover（演示小面板放快捷设置 + 写偏好 + `persistent`），
  `status` 是**悬停展开**的 popover（演示 `trigger: 'hover'` 与 `header: false` + `padding: 0` 的整块让权）。
- `src/host/` —— 只做三件事：声明 NS/schema、两条同源路由、一行启动日志。

## 本插件的局部规则

1. **几何与存储必须自包含**：`spec.ts` / `geometry.ts` / `store.ts` 只允许 `import type`，
   禁止值导入别的 `.ts`。原因是 `scripts/check-*.mjs` 用 Node 的 TS 类型擦除直接 import 这三个源文件，
   值导入的 `./x.js` 在 Node 里解析不到（源码只有 `x.ts`）。三处与 `spec.ts` 重复的常量由
   `check-geometry.mjs` 断言相等。
2. **父子常量不重复第四遍**：`TITLE_BAR_HEIGHT` / `CONTENT_PADDING` / `CASCADE_STEP` /
   `SNAP_GAP`+`SNAP_DISTANCE`+`SNAP_ALIGN` 只在 `geometry.ts` 与 `SPEC_DEFAULTS` 各一份，靠自检对齐。
3. **本机布局 vs 用户配置**：布局进 localStorage（`dshp-widget-kit:v1`），配置进 settings.yaml NS。
   任何新状态都要先归到这两边之一，不许开第三个坑（见 `docs/widget-spec.md` §7）。
   存储结构只允许**向后兼容地追加字段**（老记录缺字段 = 用默认值），破坏性改动才 bump `STORE_VERSION`。
   凡是「用户看得见的状态」（开着的卡片、展开的面板、层叠顺序、锁定、禁用）都必须进本机布局 ——
   只放内存的后果就是刷新即丢（0.2.0 的教训）。
4. **几何只有一道锁**：拖动/缩放（`beginLive`）、键盘微调、菜单预设、内容 `setSize`、居中全部经过
   `applyRect` 或 `beginLive`，锁定判定就放在这两处；卡片 UI 另外把几何项从菜单里摘掉（点了没反应最糟）。
5. **移动落点只有一个入口**：`service.resolveMove`（→ `geometry.dockRect`）负责「夹进视口 + 吸附 + 避让」，
   拖动（`useCardDrag` 每帧）与键盘微调都走它 —— 不要在别处再写一份夹紧/避让逻辑。
   键盘与「居中」传 `magnet: false`（关磁力、保留防重叠），否则贴着邻卡时每步都会被吸回去。
   吸附参数（`snapGap` / `snapDistance` / `snapAlign`）只在 `SPEC_DEFAULTS` 与 `geometry.ts` 各一份，
   由 `check-geometry.mjs` 断言相等。
6. **悬停语义只有一份实现**：延迟展开、宽限收起、`popoverOrigin`（被点开的不受移开指针影响）都在
   `service.ts`。托盘只报「指针进出图标」、面板只报「指针进出面板」，两边都调 `hoverEnter`/`hoverLeave` ——
   这样「图标 → 面板」的间隙才被同一条宽限覆盖，被取消的定时器也不会事后自己蹦出来。
7. **服务只发布 facade**：`createWidgetsService(runtime)` 只暴露 `SPEC_KEYS.service` 那几个成员，
   内部方法（`setLive`/`commitLive`/`pruneOrphans`…）不出插件。
8. **每帧只通知正在拖的那张卡**：live 快照（`subscribeLive`/`getLive`）与 layout 快照分开，
   60fps 拖动不得带着托盘和其它卡重渲染。
9. **内容数据生命周期只在 `useWidgetData`**：组件提供方不写请求代码；`popover` 的 `setSize` 是
   `undefined`（不是静默 no-op）；尺寸回环防护在 `service.requestSize` 里硬停。
10. **错误隔离三层**：`badge` 与 `load` 各自 try/catch + 超时；`render` 走 `WidgetErrorBoundary`
    （全插件唯一 class 组件）；托盘图标渲染失败不影响其它图标。
11. **不写产品 DOM**：不使用 portal 到 `document.body`（popover 定位靠官方 `useAnchoredPosition`），
    只通过槽位落点渲染；样式里不出现字面色值。
12. **一维拖拽排序不许用 `elementFromPoint` 找落点**：被拖的图标自己就在指针下面，渲染顺序一换就回到原地
    （表现为只能单向拖）。命中判定走 `store.reorderByPointer` + 其余图标的**中心线**，纯函数、可单测。

## 自检

`pnpm --filter @dshp/widget-kit test` 串起六个检查（全部只依赖 node 内建模块）：

| 脚本                                   | 覆盖                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `check-geometry.mjs`                   | 夹紧（整卡留在视口内）、层叠落点、内容盒换算、尺寸档阈值、八向缩放（对边固定/上下限/北向不越 0）、z 序、与 spec 常量不漂移，以及**吸附 / 防重叠**（贴视口边与邻卡边、跨轴对齐、间隔、三卡连锁避让、结果稳定、无解兜底）                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `check-store.mjs`                      | 消毒（坏结构/版本/类型/未知 id/超长/夹紧/布尔强制/新增字段默认值）、读写降级、debounce/flush/cancel/onError、菜单顺序、一维拖拽排序（左右双向 + 不振荡）、卸载清理                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `check-spec-drift.mjs`                 | `spec.d.ts` ↔ `SPEC_KEYS` 逐字段比对；`FRAMEWORK_VERSION` ↔ `package.json`；host/config.ts 同版本；`./spec` 类型入口存在                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `check-css-tokens.mjs`                 | 样式表里没有字面色值；其它插件产物里不得出现 `@dshp/widget-kit`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `check-client.mjs`                     | 无头跑 `lib/client.js`：loader 契约、服务发布（成员 = `SPEC_KEYS.service`）、三条槽位注册、effect 前缀、16 类非法描述符、注册/覆盖/清理、**渲染一遍**托盘与卡片（含 8 个把手、几何、尺寸档变化）、**popover 两种触发**（悬停延迟/宽限撤销/单开/关闭清定时器，width·padding·header 真的落到 DOM）、**刷新恢复**（首帧会话绑定不算切会话 + 落盘字段）、**最小化折叠**（高度 36 / 内容仍在树上 / 还原尺寸）、**位置锁定**（几何全失效、菜单摘项、仍可最小化、按钮状态）、**启停**（图标与卡片消失、徽标清掉、注册记录保留、状态落盘）、**常驻面板**（移开不收起、显式关闭仍有效）、**吸附**（拖动期间 live 就是吸附结果、越界夹回、贴边磁力、多卡不重叠、键盘关磁力但不破防重叠） |
| `shared/scripts/check-css-modules.mjs` | `styles.x` 拼错（类型上合法、运行时静默丢 className）                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
