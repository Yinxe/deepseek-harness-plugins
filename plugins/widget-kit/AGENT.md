# plugins/widget-kit — 局部规则

> 本目录是**小组件规范**的实现：不含业务，只提供宿主与契约。
> 上层：[根 AGENT.md](../../AGENT.md)（红线）→ [docs/](../../docs/)（主题细节）→
> **组件提供方看 [`docs/widget-spec.md`](../../docs/widget-spec.md)**（那份才是对外契约）。

## 身份

| 项     | 值                                                                                                                                                                                                                          |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 包名   | `@dshp/widget-kit`                                                                                                                                                                                                          |
| NS     | `dshp-widget-kit`（settings 命名空间 / 路由前缀 / patch id / 设置节 id 四处同名）                                                                                                                                           |
| 契约   | `SPEC_VERSION = 1`（0.2.0 起的改动全是向后兼容新增），公开类型在 `spec.d.ts`（其它插件 `import type` 的唯一入口）                                                                                                           |
| inject | host：`['webServer']`；client：`['slots', 'timer']`                                                                                                                                                                         |
| 槽位   | `conversation.session.header.utilities` id `dshp-widget-kit-tray` order **30**<br>`shell.overlay` id `dshp-widget-kit-cards` order **10**<br>`settings.section` id `dshp-widget-kit` order **32**                           |
| 路由   | `GET /ext/dshp-widget-kit/state` / `POST /ext/dshp-widget-kit/config`                                                                                                                                                       |
| 服务   | `ctx.reflect.provide('widgets', …)`。**只有「没有宿主就没有这个插件」的提供方才写顶层 `inject: ['widgets']`**；增强型接入用 `ctx.inject(['widgets'], …)`（否则没装框架时对方整个插件不激活，见 `docs/widget-spec.md` §2.1） |

## 结构与职责

- `src/client/spec.ts` —— **规范单一事实来源**：公开类型 + 默认值 + `normalizeDescriptor` 校验器 + `SPEC_KEYS`。
- `src/client/appearance.ts` —— 把外观 / 动效偏好（`cardOpacity` / `cardBlur` / `cardBorder` /
  `cardRadius` / `motionMs`）翻成 CSS 自定义属性；卡片层与托盘**各钉一份**（两棵树、两个槽位），
  绝不写 `document.documentElement`。
- `spec.d.ts` —— 给别的插件 `import type` 的手写契约；与 `spec.ts` 由 `check-spec-drift.mjs` 逐字段比对。
- `src/client/geometry.ts` —— 全部卡片几何（视口夹紧 / 八向缩放 / 内容盒 / 尺寸档 / z 序），
  以及**移动落点的吸附候选**（`snapRect`：视口边 / 邻卡边 + 8px 间隔 / 边缘对齐线，12px 磁力），纯函数。
  **不做防重叠**：卡片允许互相覆盖，吸附只是"靠上去"的候选，且命中与否由用户松手决定。
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
  `CardLayer` 里有两个**只订阅稳定值的叶子组件**：`.gestureShield`（手势期间的全视口盾：
  `user-select: none` + 指针跟随手势，治「缩放扫过文字选中一片高亮」）与 `.snapGhost`
  （吸附预览：只显示「松手会落到哪」，卡片本体自由跟手；**主题色填充 + 主题色柔光**，不是一根虚线，
  颜色一律走 `--dsw-alias-state-business-*`，透明部分用 `color-mix` 并保留 token 兜底）。
  两者都靠「快照是字符串 / 对象引用」做到帧间零重渲染 —— 别把 live 订阅搬回卡片层本身。
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
   `SNAP_GAP`+`SNAP_DISTANCE` 只在 `geometry.ts` 与 `SPEC_DEFAULTS` 各一份，靠自检对齐。
3. **卸载 / 热重载不得动本机布局**：`register` 的 disposer 只清运行时的东西（注册表、徽标、锚点、live、
   展开目标），**绝不 `pruneId`** —— 插件热重载、暂时停用、开发中构建失败都会走这条路径，
   早先版本在这里删记录，于是「开发时每改一次代码组件状态就被重置」。残留只由设置页的
   `pruneOrphans()` 显式清理。**不在册的记录不能参与任何运行时判定**：渲染、吸附对象（`othersOf`）、
   同屏上限与层叠序号（`visibleCardCount` / `trackedCardCount`）都要先 `registry.has(id)`。
4. **本机布局 vs 用户配置**：布局进 localStorage（`dshp-widget-kit:v1`），配置进 settings.yaml NS。
   任何新状态都要先归到这两边之一，不许开第三个坑（见 `docs/widget-spec.md` §7）。
   存储结构只允许**向后兼容地追加字段**（老记录缺字段 = 用默认值），破坏性改动才 bump `STORE_VERSION`。
   凡是「用户看得见的状态」（开着的卡片、展开的面板、层叠顺序、锁定、禁用）都必须进本机布局 ——
   只放内存的后果就是刷新即丢（0.2.0 的教训）。
5. **几何只有一道锁**：拖动/缩放（`beginLive`）、键盘微调、菜单预设、内容 `setSize`、居中全部经过
   `applyRect` 或 `beginLive`，锁定判定就放在这两处；卡片 UI 另外把几何项从菜单里摘掉（点了没反应最糟）。
   **最小化期间只允许改位置**：布局里存的是展开尺寸，胶囊尺寸由 `service.collapsedSize`
   （`min(布局宽, SPEC_DEFAULTS.minimizedWidth)` × 标题栏高）算出来，`visualRectOf` 用它；
   **Card 渲染胶囊时读的是同一个算式**（不再有「渲染 → 量 → 回报」回路，那样第一帧会不一致）。
   `applyRect` 与 `commitLive` 在最小化态下都只取 x/y —— 否则一次拖动就把用户的展开尺寸写成胶囊尺寸了。
6. **移动模型只有一处实现**：`geometry.snapRect` 只算**吸附候选**（视口边 / 邻卡边 / 对齐线，
   夹进视口 + 磁力，绝不移动卡片本体），`service.setLive` 每帧把「自由位置 + 候选」一起放进
   `LiveGeometry`，`commitLive` 才决定用哪个（有候选就用候选 = 松手同意吸附）。
   **允许卡片互相覆盖**：不要在任何地方加「必须让开别人」的硬约束。
   键盘微调与「居中」走 `applyRect`（精确移动，不吃磁力，只夹视口）。
   手势的可靠性在 `useCardDrag`：`window` 上的 move/up/cancel 兜底 + 每帧检查 `buttons`；
   手势期间要保证**选不中文字**（整卡 `user-select: none` + 全视口手势盾 + `pointerdown` 一律
   `preventDefault()`，锁定分支也要）。
   吸附参数（`snapGap` / `snapDistance`）只在 `SPEC_DEFAULTS` 与 `geometry.ts` 各一份，由
   `check-geometry.mjs` 断言相等。
7. **两档快照 + 按 id 切开订阅 + 快照引用必须稳定**：live 快照（`subscribeLive`/`getLive`）与 layout
   快照分开，60fps 的拖动不得带着托盘和其它卡重渲染。订阅必须用 `useLiveGeometry(runtime, id)` /
   `useGestureCursor` / `useLiveSnap`：状态没变时 `getSnapshot()` **必须返回同一个引用**
   （`getLiveFor` 恒 `null`、cursor 是字符串、吸附候选用 `liveSnapView` 复用对象）——
   这是 `useSyncExternalStore` 的硬要求，每次新建对象会让 React 无限重渲染（error #185，实机崩过整个
   卡片层）。`check-client.mjs` 的 `useSyncExternalStore` 替身会连续调两次 `getSnapshot` 并断言
   `Object.is` 相等，专门拦这一类事故。
   早先版本还用全局 `getLive()` 且让卡片层直接订阅，结果拖动时**所有卡片连同内容每帧重渲染**，
   表现就是「拖动有时卡」。
8. **悬停语义只有一份实现**：延迟展开、宽限收起、`transientOrigin`（被点开的不受移开指针影响）都在
   `service.ts`。托盘只报「指针进出图标」、面板只报「指针进出面板」，两边都调 `hoverEnter`/`hoverLeave` ——
   这样「图标 → 面板」的间隙才被同一条宽限覆盖，被取消的定时器也不会事后自己蹦出来。
   展开状态分**两层**：`channelOf(widget)` 由 `popover.persistent` 决定 —— 常驻层（`state.popoverId`，
   手风琴、落盘）与临时层（局部变量 `transientId`，只在内存）。**两层互不干扰**是刻意的：
   `showPopover` / `hidePopover` / `hoverLeave` / `open` / `toggle` 一律只动自己那一层，
   卡片层把两层各渲染一个面板（可以同时出现）。
9. **服务只发布 facade**：`createWidgetsService(runtime)` 只暴露 `SPEC_KEYS.service` 那几个成员，
   内部方法（`setLive`/`commitLive`/`pruneOrphans`…）不出插件。
10. **内容数据生命周期只在 `useWidgetData`**：组件提供方不写请求代码；`popover` 的 `setSize` 是
    `undefined`（不是静默 no-op）；尺寸回环防护在 `service.requestSize` 里硬停。
11. **错误隔离三层**：`badge` 与 `load` 各自 try/catch + 超时；`render` 走 `WidgetErrorBoundary`
    （全插件唯一 class 组件）；托盘图标渲染失败不影响其它图标。
12. **不写产品 DOM**：不使用 portal 到 `document.body`（popover 定位靠官方 `useAnchoredPosition`），
    只通过槽位落点渲染；样式里不出现字面色值。
13. **托盘拖拽必须用「冻结槽位」**：`pointerdown` 量一次各图标槽位（`readSlots`），拖动期间**不再读 DOM**，
    命中判定与让位位移都由纯函数 `store.planTrayDrag` 算（双向对称，`check-store.mjs` 有用例）。
    拖动期间**不重排 DOM**：被拖图标用 `translateX` 跟手、其余图标平移一格让位、目标槽位画 `.trayGhost`；
    松手才 `runtime.setOrder` 提交。历史上两次方向性 bug（先只能从右往左、后只能从左往右）都出在
    「边拖边重排 / 用 `elementFromPoint` 或实时 DOM 找落点」这类自我反馈上 —— 别再走回头路。

## 自检

`pnpm --filter @dshp/widget-kit test` 串起六个检查（全部只依赖 node 内建模块）：

| 脚本                                   | 覆盖                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `check-geometry.mjs`                   | 夹紧（整卡留在视口内）、层叠落点、内容盒换算、尺寸档阈值、八向缩放（对边固定/上下限/北向不越 0）、z 序、与 spec 常量不漂移，以及**吸附候选**（贴视口边与邻卡边、边缘对齐、8px 间隔、允许覆盖、结果稳定、多邻卡取最近）                                                                                                                                                                                                                                                                                                                                                                          |
| `check-store.mjs`                      | 消毒（坏结构/版本/类型/未知 id/超长/夹紧/布尔强制/新增字段默认值/超上限保留最新）、读写降级、debounce/flush/cancel/onError、菜单顺序、一维拖拽排序（左右双向 + 不振荡）、托盘拖拽计划（冻结槽位 + 双向对称）、卸载清理（pruneId）                                                                                                                                                                                                                                                                                                                                                               |
| `check-spec-drift.mjs`                 | `spec.d.ts` ↔ `SPEC_KEYS` 逐字段比对；`FRAMEWORK_VERSION` ↔ `package.json`；host/config.ts 同版本；`./spec` 类型入口存在                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `check-css-tokens.mjs`                 | 样式表里没有字面色值；其它插件产物里不得出现 `@dshp/widget-kit`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `check-client.mjs`                     | 无头跑 `lib/client.js`：loader 契约、服务发布（成员 = `SPEC_KEYS.service`）、三条槽位注册、effect 前缀、16 类非法描述符、注册/覆盖/清理、**渲染一遍**托盘与卡片（含 8 个把手、几何、尺寸档变化）、**popover 两种触发**与**常驻/临时两层**（手风琴 + 互不干扰 + 只落盘常驻层）、**刷新恢复**、**最小化折叠**、**位置锁定**（含按钮状态）、**启停**、**拖动模型**（自由跟手 + 允许覆盖 + 预览虚框 + 松手才吸附 + 越界夹回 + 订阅引用稳定）、**手势**（window 兜底监听、`buttons === 0` 收尾、pointercancel 丢弃、监听摘干净）、**卸载/热重载不动本机布局**（注册回来原地恢复 + 显式清理只清残留） |
| `shared/scripts/check-css-modules.mjs` | `styles.x` 拼错（类型上合法、运行时静默丢 className）                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
