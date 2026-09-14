# 时间与时区（北京时间约定）

> 本文承接旧 AGENT.md §10.5（时间与时区）的完整细节。规则版总纲见[仓库根 AGENT.md](../AGENT.md)。

**界面上一律按北京时间（UTC+8）判定与展示，且必须与浏览器本地时区无关。**

供应商的定价/刷新/重置规则几乎都以 UTC 给出，而用户看的是中国时间；用 `getHours()`、`getDay()`、`toLocaleString()` 直接读本地字段，会让同一份数据在不同机器上算出不同结论。

```ts
const CN_OFFSET_MS = 8 * 3600000; // 中国无夏令时，偏移恒定
const cn = new Date(ms + CN_OFFSET_MS); // 再取 getUTC* 即北京日历字段
const day = cn.getUTCDay(),
  hour = cn.getUTCHours(),
  min = cn.getUTCMinutes();
```

- **规则来源写进注释**：抄供应商原文（如 `"peak ... 01-04 & 06-10 UTC, Mon-Fri"`），
  并列出折合北京时间的结果（`09:00–12:00`、`14:00–18:00`）。只写结论、不留出处，
  下一个维护者不敢改。
- 段数不固定就别用「一个起止区间」建模：峰段是**两段**（`[9,12]`、`[14,18]`），
  用 `Array<[number, number]>` 表示，判定用 `.some(([s,e]) => h >= s && h < e)`。
- 展示要能自证：倒计时要给出**绝对落点**（「距峰 4h00m」+ 悬浮里的「今天 18:00」），
  标题里写明「（北京时间）」，小时格 `title` 也带时间基准。
- 窄容器里的时间文本**不许靠 `overflow:hidden + ellipsis` 兜底**：先压标题字数
  （「峰谷定价」而非「峰谷提醒 · 峰时段」）、把状态拆成独立 chip、给时间
  `flex:none; white-space:nowrap`，让它在 240px 宽下也整份可见。
- 悬浮明细 portal 到 `body` 后用 `getBoundingClientRect()` 定位（`position:fixed`）：
  留在容器内会被侧栏/浮窗的 `overflow` 裁掉，也会被 `backdrop-filter` 形成的包含块
  带偏；放不下时翻到上方。浮出加 `@keyframes` 入场动画，时钟跳变加 tick 动画。
