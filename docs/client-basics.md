# Client（浏览器半）规范

> 本文承接旧 AGENT.md §10 的 §10.1–10.2（loader / Section）的完整细节；provider 分层渲染（原 §10.3）、失败提示（原 §10.4）、时间与时区（原 §10.5）见另两篇。规则版总纲见[仓库根 AGENT.md](../AGENT.md)。

## loader 骨架（照抄 index.ts，一字不改结构）

```ts
loader.load({
  id: PLUGIN_ID,
  factory: (require) => {
    const React = require('react');
    const P = require('@deepseek-ai/dsh-client-ui-primitives');
    // 自有模块内联，react/primitives 绝不打包
    exportsObj.inject = ['slots'];
    exportsObj.apply = (ctx) => {
      /* 样式注入 + slots.inject(...) */
    };
  },
});
```

- `PLUGIN_ID` 必须等于 host 的 `name`（`@dshp/<name>`）。
- **不用 JSX**：全部 `React.createElement`（避免 jsx 运行时配置漂移）。`React`/`P` 由 factory 参数传入，**禁止顶层 `import React`**（打包器会把它打进 bundle）。
- 样式：`document.createElement('style')` + `data-plugin-css="dshp-<name>/settings.css"` + `textContent = CSS`，`ctx.effect(() => () => style.remove(), ...)` 清理。CSS 类前缀用插件缩写（`vb-` / `fcv-` / `tm-`……），**颜色/字号只用 `var(--dsw-alias-*)` token**，不许写死色值（深浅主题靠 token 切换）。
- 设置节注册：`slots.inject('settings.section', () => slots.register({ name:'settings.section', id:'dshp-<name>', order: <空位>, label:'中文名' }, Section))`。order 占位表见 docs/scaffolding.md。

## Section 组件状态机

`createVisionSection(React, P)` 工厂形态照抄：`useState` 五件套（models/config/loading/saving/error）+ `useEffect` 初次 `load()`。必须覆盖四态：loading（Icon + 「正在读取…」）/ error（红字 notice）/ 空列表（warn notice + setting.yml 改法指引）/ 正常表单。

- 下拉用 `components.ts` 的 `Select`（胶囊 `P.Menu`），开关用 `Switch`，状态用 `Badge(kind: ok/warn/muted/info)`。新插件缺构件先看 primitives 有没有，没有才在 `components.ts` 加。
- 保存：即时项直接 `save(patch)`；长文本（textarea）`onChange` 只改本地、`onBlur` 才保存（标杆 promptTemplate 写法）。保存中 `disabled`，失败回 error notice 不丢本地值。
- `api.ts` 三函数形态照抄：`fetchState`（`cache: no-store`）/ `saveConfig`（POST json）/ `checkConnectivity`。BASE 常量 `/ext/dshp-<name>` 与 host 对齐，类型从 `client/types.ts` 来。

## keyed 槽位与影子化（接管已有渲染时）

- keyed 槽位（如 `tool.call.toolview`）按「key + priority」去重，**同 key 同 priority 会直接抛错**；派发取 priority 升序每个 key 的**第一条**，数值最小者渲染。
- 官方内置行注册时没传 priority（即 0），接管必须用**更小**的负数。file-change-viewer 取 `-1` 是有意的：动态 Cordis 插件的影子优先级也从 -1 起分配，取 -1 意味着「两份注册同时存在时会明确撞车并打日志」，而不是让其中一份悄悄失效。
- 注释（`locale: 'conversation'`）传了才注入 `t`；`t` 缺失时退化成显示键名，不要让行抛错。

## 无头自检

Client 侧「看不见但错了就白屏」的行为（loader 注册结果、渲染树、偏好生命周期）用无头冒烟测试兜住：把 `lib/client.js` 当 IIFE 跑一遍 + 一层迷你 React（见 file-change-viewer `scripts/check-client.mjs`），进 `pnpm test`。
