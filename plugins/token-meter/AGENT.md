# plugins/token-meter — 局部规则

> provider 型插件的**第二标杆**（分层渲染 / 结构化失败提示）。上层：[根 AGENT.md](../../AGENT.md) → [docs/provider-ui.md](../../docs/provider-ui.md)（本文的详细版）。本文只写本插件自己的事实与局部约定。

## 身份

| 项      | 值                                                                                                                                                      |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 包名    | `@dshp/token-meter`                                                                                                                                     |
| NS      | `dshp-token-meter`（四处同名）                                                                                                                          |
| UI 入口 | `settings.section` order **27**（label = `src/name.ts` 的 DISPLAY_NAME）+ `conversation.view` order **40**（中心区 tab）+ `shell.overlay`（小组件浮层） |
| inject  | Host 按 quota/stats 两块装配                                                                                                                            |
| 原实现  | `@dshp-inx/token-quota` v1.0.1 + `@dshp-inx/token-stats` v1.1.3 两插件合并等价 TS 重写                                                                  |

## 结构与职责

- `src/host/`：`quota.ts`（额度路由）/ `providers/*`（适配器 + `view.ts` 声明式契约 + `index.ts` 注册与别名）/ `errors.ts`（ProviderError 分类学）/ `secrets.ts`（凭据引用解析）/ `stats/*`（引擎/指纹缓存/合并/在线口径/路由）。
- `src/client/`（含 JSX 的一律 `.tsx`，纯逻辑保持 `.ts`；`widget-bridge.ts` = 宿主 id 编解码/标题的**纯函数**，Node 可直跑）：`index.tsx`（**只导出 `inject` / `apply`**，loader 壳由 `shared/tsup.preset.ts` 拼出）/ `CenterView.tsx`（tab 内左侧菜单切 额度/用量/在线/设置）/ `TokenMeterSection.tsx`（设置节 + 中心区「用量统计」+ 小组件浮层，**模块级装配**：`const widgets = createWidgetSystem()` → `createQuotaSection(widgets)`）/ `QuotaSection.tsx` / `StatsSection.tsx` / `OnlineSection.tsx` / `SharePanel.tsx` + `ShareShell.tsx`（分享卡导出）/ `ErrorBox.tsx` / `providers/{kit,sections,registry,ui/*}`（分层渲染）/ `components.tsx` `glyphs.tsx` `icons.tsx`（自绘小构件与图标）/ `styles.module.css`。
- **哪些还保留工厂**：`createWidgetSystem()` / `createQuotaSection(widgets)` / `createCenterView(sections, icons)` / `createErrorBox(deps)` / `createProviderKit(deps)` / `createProviderRenderers(K)` —— 它们返回的是**多键命名空间或服务对象**（`widgets.WidgetFloat`、`quota.quotaUI`、`K.RollingBar`），或者**确有注入依赖**（`widgets` / `deps` / `sections`）；`React` / `P` / `ReactDOM` 这三个注入参数已全部改为模块顶层 import。零件本身（`Badge` / `Row` / `Select` / `Switch` / `Glyph` / 五个导航图标 / kit 的 12 个成员 / `StatsSettingsPage` …）都是普通具名导出的函数组件。
- 历史决策：额度/用量/在线曾各占一个右侧栏 tab，已收敛为中心区单 tab——会话级 tab 会盖过产品自带的对话/轨迹。

## 本插件的局部规则

1. **provider 分层是硬契约**：Host 适配器 return 自己的数据（`view` 优先，legacy 字段双轨兜底），Client 每供应商专属 UI（`providers/ui/<type>.ts`）+ kit 通用零件 + registry 三层兜底（专属 → 声明式 → legacy）。详见 [docs/provider-ui.md](../../docs/provider-ui.md)。
2. **失败必须走 `ProviderError`**：`kind` 取 `auth|session|plan|balance|rate|network|parse|config|server|unknown`；`session` 判定排在 `auth` 前（HTTP 200 错误信封陷阱）；`retriable` 默认由分类决定；包装异常不许吞 `kind`。详见 [docs/provider-ui.md](../../docs/provider-ui.md) 失败提示节。
3. **统计缓存域名不改**：派生缓存走 `ctx.storageDomain` 域 `token_stats`——域名只允许小写字母/数字/下划线，改名即废掉已有缓存触发全量重扫。缓存是**可丢的派生数据**（会话日志才是持久层），不是配置（见 [docs/settings.md](../../docs/settings.md) 派生缓存节）。
4. **表单字段来自 provider 元数据 `fields[]`**：禁止在 client 按 type 硬编码字段；适配器可声明 `defaultParams` 作新增类型时的初始值。
5. **快照前过 `sanitizeView()`**：区块数/条目数/字符串长度夹紧，与外部输入同等对待。
6. **同类 provider 合并 + 别名**：`deepseek-api`/`deepseek-web` 并入 `deepseek`（按凭据形态选路），旧 type 只留 `registerAlias` 读路径别名，不落库、不改写用户文件。
7. **在线时长口径分级**（精确/估算/下界）必须随数字标注（README「统计口径」节是权威描述）；界面时间按北京时间，见 [docs/timezone.md](../../docs/timezone.md)。
8. **小组件的双后端必须都留着**：装了 `@dshp/widget-kit` 时窗口交给框架（`ctx.widgets.register`，`trayIcon: false` 的自由卡片），没装时退回自带浮层（`widgets.tsx` 的 `WidgetFloat`）。两条都是硬要求：① 宿主是**可选依赖**，只能 `ctx.inject(['widgets'], …)`，写进顶层 `inject` 会让整个插件在没装框架时不激活；② 卡片不占活动栏，注册必须**常驻**（`syncFloatWidgets()` 在启动与供应商增删时对齐），否则刷新后开着的卡片长不回来。宿主契约类型来自 `@dshp/widget-kit/spec` 的 **workspace devDependency**（纯类型、`import type`，产物里零 import），不许手写镜像。
9. **密钥只存引用**（`$NAME`）或脱敏展示，经 credentials/secrets 解析，不进 settings.yaml。

## 自检

`pnpm --filter @dshp/token-meter test` = `node --check` 双 bundle + `shared/scripts/check-css-modules.mjs`（`styles.x` 拼错在类型上是合法的，这个静态检查是唯一会自动红的网）+ `scripts/check-share-tokens.mjs`（分享卡导出的 token 清单必须覆盖 `styles.module.css` 全部 `--dsw-*`——`<foreignObject>` 光栅化读不到壳层样式表，漏 token 导出图掉色）。

外加两个跨插件自检（都只用 node 内建模块）：

- `scripts/check-widget-bridge.mjs` —— 宿主 id 编码：**合法 / 稳定 / 不撞车**。供应商 id 是用户手写的任意字符串：编码不合法 → 宿主 `register()` 直接抛；不稳定 → 每次刷新布局重置；撞车 → 一张卡凭空消失。
- `scripts/check-widget-kit-bridge.mjs` —— **集成冒烟**：把本插件真实的 `lib/client.js` 挂到 `@dshp/widget-kit` 真实的 `lib/client.js` 发布的服务上（无浏览器），断言 ① 顶层 `inject` 不含 `widgets`（写了就没装框架的机器上整个插件不激活）② 描述符全部 `trayIcon: false` + 有 `content.render` ③ 静态与供应商卡片都真的进了注册表 ④ `open`/`close` 通 ⑤ 卸载不留注册 ⑥ 没有服务时仍注册自带浮层。产物缺失会提示先 `pnpm -r build`。

**分享卡的内联样式来自「已注入的那条 `<style>`」**：CSS Module 化之后样式表文本不再是一个导出（类名也被哈希了），而分享卡是把**真实 DOM** 序列化进 `<foreignObject>`——里面元素的 class 是哈希名，所以内联的样式表也必须是哈希后的那一份。`SharePanel.collectShareCss()` 因此从 `document.querySelector('style[data-plugin-css^="@dshp/token-meter/"]')` 取文本（取不到退化成空串），**不要**改回「import 一份 CSS 字符串」。
