# 小组件规范（`@dshp/widget-kit`）

> 面向**组件提供方**（写业务插件的你）的完整契约。实现者视角的局部规则见
> [`plugins/widget-kit/AGENT.md`](../plugins/widget-kit/AGENT.md)；仓库级红线见[根 AGENT.md](../AGENT.md)。
>
> 一句话：**框架管「窗口」，提供方管「内容」**。托盘图标、卡片几何、z 序、加载/错误/陈旧态、
> 轮询节流、错误隔离、持久化、键盘与焦点由框架负责；**内容长什么样、随尺寸怎么变，完全由你决定**。

---

## 1. 心智模型

```
插件 Host 半 ──(自己的路由/服务)──┐
                                  │  你的数据
插件 Client 半 ── ctx.widgets.register(descriptor) ──┐
                                                    │
        ┌───────────────────────────────────────────┴─────────────────────────┐
        │                        @dshp/widget-kit（框架）                       │
        │  注册表 → 会话顶部托盘（图标/徽标/溢出/拖拽排序）                        │
        │         → 内容面：card（拖拽/缩放/最小化/关闭）或 popover（锚定轻面板）    │
        │         → 调度：加载态 / 错误隔离 / 轮询节流 / 本机布局持久化 / a11y       │
        └───────────────────────────────────────────────────────────────────────┘
```

三个决策点只有你能定：

| 决策                       | 字段                                 | 取值                                                                         |
| -------------------------- | ------------------------------------ | ---------------------------------------------------------------------------- |
| 有没有图标常驻、点开是什么 | `presentation`                       | `'tray'`（只有图标+徽标）/ `'popover'`（锚定轻面板）/ `'card'`（可拖拽窗口） |
| 打开时怎么取数             | `content.load` + `content.refreshMs` | 不写 `load` = 纯展示；写了 = 框架负责加载/轮询/中止/陈旧标记                 |
| 尺寸变化后怎么呈现         | **你的 `content.render`**            | 用 `sizeClass`、容器查询或 `size` 三种路径任选                               |

## 2. 快速开始（三步）

```bash
# 1. 装框架（一次）：组件提供方只在 devDependencies 里加类型，运行时零 import
dsh plugin --profile web add ./plugins/widget-kit
```

```jsonc
// 2. 你的插件 package.json：只加 devDependency（类型用，运行时不会被打进产物）
"devDependencies": {
  "@dshp/widget-kit": "workspace:*"
}
```

```tsx
// 3. 你的插件 client 半：声明硬依赖 + 在 effect 里注册
import type { WidgetDescriptor, WidgetContentProps } from '@dshp/widget-kit/spec';

export const inject = ['slots', 'widgets'];

interface QuotaData {
  used: number;
  limit: number;
}

function QuotaView({ props }: { props: WidgetContentProps<QuotaData> }): ReactNode {
  if (props.status === 'loading') return <div>正在读取额度…</div>;
  if (props.error !== undefined && props.data === undefined) {
    return <button onClick={props.retry}>读取失败，重试</button>;
  }
  const data = props.data;
  // 提供方自己决定窄/常规/宽怎么画 —— 框架只给事实
  if (props.sizeClass === 'compact') {
    return <strong>{data ? `${pct(data)}%` : '—'}</strong>;
  }
  return (
    <div>
      已用 {data?.used} / {data?.limit}
    </div>
  );
}

export function apply(ctx: ClientContext): void {
  const widgets = ctx.widgets; // 由 inject 保证存在
  ctx.effect(
    () =>
      widgets.register({
        id: 'my-quota:panel', // <你的命名空间>:<名字>
        title: '额度',
        icon: <QuotaGlyph />, // 18px 视口，currentColor
        presentation: 'card',
        tray: { badge: () => ({ text: '3', tone: 'warn' }), badgeIntervalMs: 30000 },
        content: {
          load: async (loadCtx) => fetchQuota(loadCtx.signal),
          refreshMs: 60000,
          render: (props) => <QuotaView props={props} />,
        },
        card: { defaultSize: { w: 360, h: 240 }, minSize: { w: 240, h: 140 } },
      }),
    'my-quota: widget registration',
  );
}
```

> `inject: ['widgets']` 是**硬依赖**：没装框架时你的插件停在 waiting（不报错、不半死）。
> 这是有意的：声明了要提供组件，就该明确要求框架在场。

## 3. 描述符逐字段

| 字段                        | 类型                                         | 必填                            | 默认                   | 说明                                                                |
| --------------------------- | -------------------------------------------- | ------------------------------- | ---------------------- | ------------------------------------------------------------------- |
| `id`                        | `string`                                     | ✅                              | —                      | `^[a-z0-9-]{2,32}:[a-z0-9-]{2,32}$`，前缀必须是**你自己的命名空间** |
| `title`                     | `string \| () => string`                     | ✅                              | —                      | 托盘 aria-label、卡片标题、菜单里的名字                             |
| `icon`                      | `ReactNode`                                  | ✅                              | —                      | 18px 视口；用 `currentColor`；框架负责 `aria-hidden`                |
| `subtitle`                  | `string \| () => string`                     | —                               | 无                     | 卡片标题栏右侧的小字                                                |
| `order`                     | `number`                                     | —                               | `0`                    | 托盘排序；同值按 id 字典序（稳定）                                  |
| `presentation`              | `'tray' \| 'popover' \| 'card'`              | ✅                              | —                      | 没有默认值，必须明说                                                |
| `tray.badge`                | `(ctx) => WidgetBadge \| null \| Promise<…>` | —                               | 无                     | 徽标；返回值见下                                                    |
| `tray.badgeIntervalMs`      | `number`                                     | —                               | 框架偏好（默认 30000） | 下限 5000、上限 600000                                              |
| `tray.preview`              | `(props) => ReactNode`                       | —                               | 无                     | 悬停预览（当前版本留位，未接线）                                    |
| `content.title`             | `string \| () => string`                     | —                               | 用 `title`             | 卡片标题栏文案                                                      |
| `content.load`              | `(ctx) => Promise<D>`                        | —                               | 无                     | 不写 = 纯展示组件                                                   |
| `content.refreshMs`         | `number`                                     | —                               | `0`（不轮询）          | 要么 0，要么 ≥ 5000                                                 |
| `content.render`            | `(props) => ReactNode`                       | `presentation !== 'tray'` 时 ✅ | —                      | 内容面                                                              |
| `card.defaultSize`          | `{ w, h }`                                   | —                               | `360×240`              | 首次打开的尺寸（外层 px）                                           |
| `card.minSize`              | `{ w, h }`                                   | —                               | `240×140`              | **不得小于框架地板 240×140**                                        |
| `card.maxSize`              | `{ w, h }`                                   | —                               | 视口 90%               | 小于 `minSize` 直接判错                                             |
| `card.sizeClassBreakpoints` | `{ compact, wide }`                          | —                               | `{320, 560}`           | 内容盒宽度阈值；`compact < wide`                                    |
| `card.resizable`            | `boolean`                                    | —                               | `true`                 | `false` 时不渲染 8 个把手，菜单里也没有尺寸项                       |
| `card.minimizable`          | `boolean`                                    | —                               | `true`                 | `false` 时没有最小化按钮、双击无效                                  |
| `card.closable`             | `boolean`                                    | —                               | `true`                 | `false` 时没有关闭按钮                                              |
| `minFramework`              | `string`                                     | —                               | 无                     | 语义化版本下限；不满足则 `register` 抛错                            |

**校验**：任何字段不合法 → `register()` 抛 `WidgetSpecError`（中文、指出字段与期望），
你的其余组件与框架都不受影响。错误信息里会告诉你「改哪里」。

`WidgetBadge`：`{ text?: string（≤2 字）、dot?: boolean、tone?: 'info'|'ok'|'warn'|'bad'、title?: string }`。
`text` 为空且 `dot` 为 false 且 `tone` 未给 = 不显示角标。

## 4. 内容 props 逐字段（`content.render` 收到的）

| 字段                          | 类型                                         | 说明                                                                     |
| ----------------------------- | -------------------------------------------- | ------------------------------------------------------------------------ |
| `frame`                       | `'card' \| 'popover'`                        | 当前承载面（同一个 `render` 可以两用）                                   |
| `sessionId`                   | `string \| null`                             | 开启内容面的会话；无会话时为 `null`                                      |
| `status`                      | `'loading' \| 'ready' \| 'error' \| 'empty'` | `load` 解析为 `null`/`undefined` → `empty`                               |
| `data`                        | `D \| undefined`                             | `load` 的返回值                                                          |
| `error`                       | `{ message, retriable } \| undefined`        | 失败原因；有旧数据时 `status` 仍是 `ready` 且 `stale: true`              |
| `stale`                       | `boolean`                                    | 展示的是旧数据、刷新失败                                                 |
| `lastUpdatedAt`               | `number \| null`                             | 上次成功加载的时间戳                                                     |
| `size`                        | `{ width, height } \| null`                  | **内容盒**实测尺寸（整数 px，已扣标题栏与内边距）；`popover` 恒为 `null` |
| `sizeClass`                   | `'compact' \| 'regular' \| 'wide'`           | `card` 由内容盒宽度派生；`popover` 恒 `'regular'`（用容器查询）          |
| `setSize`                     | `(next) => void \| undefined`                | **仅 `card` 存在**（`popover` 是 `undefined`，不是静默 no-op）           |
| `minimized`                   | `boolean`                                    | 仅 `card` 有意义（最小化时内容根本不渲染）                               |
| `refresh` / `retry` / `close` | `() => void`                                 | 手动刷新 / 重试 / 关闭内容面                                             |

## 5. 尺寸契约（本节是规范的核心）

### 5.1 框架保证（你可以依赖）

1. `size` 是**内容盒**（外层 − 标题栏 36px − 内边距 2×10px），取整，**永远不小于 `minSize`** 换算出的内容盒。
2. 拖拽/缩放期间**每帧至多通知一次**（rAF 合并）；`pointerup` 之后**必发一次最终精确值**。
3. 视口变化后先把卡片夹回可见区，再通知新尺寸。
4. 最小化 = 内容卸载（`load` 轮询同时停止），还原后重新挂载。
5. 你**不需要**监听任何 window 事件。

### 5.2 三条合法适配路径（任选）

| 路径               | 用法                                                                                         | 适合                      |
| ------------------ | -------------------------------------------------------------------------------------------- | ------------------------- |
| ① 声明式           | `props.sizeClass === 'compact' ? <Mini/> : <Full/>`                                          | 两三种形态切换            |
| ② 容器查询（推荐） | 框架在内容盒设了 `container-type: size`：自己 CSS 里写 `@container (min-width: 480px) { … }` | 纯排版差异，零 JS         |
| ③ 精确尺寸         | 读 `props.size.width/height`                                                                 | 图表/画布类需要按像素重绘 |

### 5.3 提供方红线

1. 必须处理 `minSize` 下的可用性：不白屏、不溢出、不出现只剩边框的空卡片。
2. 长列表用**内滚**（内容盒自带 `overflow: auto`），不要撑开卡片。
3. 文本溢出用截断/省略号，不要横向撑破。
4. **禁止**在 `render` 里根据本次 `size` 反推容器尺寸再 `setSize`：框架会 defer + 警告一次，
   同一组件 500ms 内超过 3 次判定回环，记 `console.error` 并**冻结**它的自动改尺寸。
5. **禁止**自己监听 `window.resize`（框架已按帧通知，重复监听就是双跑甚至抖动）。
6. 不要依赖外层尺寸，也不要读写 `document.body` / 官方 DOM 选择器。

## 6. 承载面行为（框架负责，你只需要知道）

### 托盘（`conversation.session.header.utilities`，order 30）

- 每个组件一个 28px 图标按钮：`aria-label`（`title` + 徽标说明）、`aria-haspopup="dialog"`、`aria-expanded`。
- **点击语义（任务栏惯例）**：没开 → 打开；已开且在最前 → 最小化；已最小化 → 还原并置顶；被压在下面 → 提到最前。
- 可见图标上限取框架偏好（默认 4），超出的进 `⋯` 菜单；菜单里每个组件都有子菜单：
  **打开 / 收起、在托盘中显示 / 隐藏、上移、下移** —— 这是排序与隐藏的**键盘通道**。
- 图标之间可**拖拽换序**：位移超过 8px 才算拖拽，`pointerup` 一次性落盘，`pointercancel` 丢弃本次手势。
- 单击与拖拽共用同一个按钮：拖拽结束后那一次 `click` 会被吞掉（不会误触发打开）。
- 空白会话（DSH 会隐藏整个会话头）时托盘不渲染 —— 这是官方行为，不是框架缺失。

### 卡片（`card`）

- **拖动**：整条标题栏是把手（照抄官方 `dsh-client-ui-layout` 的 `DragHandle` 范式：
  `setPointerCapture` + rAF 合并 + `pointerup` 补最终值 + `pointercancel`/`onLostPointerCapture` 收尾 + 卸载兜底）。
- **缩放**：8 个把手（四边 + 四角），对边固定，夹在 `min/max` 与视口内；向北缩放时顶边不越过 `y=0`。
- **最小化**：折叠成标题栏高度，位置与宽度不变，**内容卸载**；双击标题栏或点托盘图标还原。
- **关闭**：托盘图标保留（非激活态），再点按原位置重开。
- **z 序**：点击/拖动即置顶；只在卡片层自己的层叠上下文里用相对值（客户端目前没有 z-index token 层）。
- **同屏上限**：6 张；开第 7 张时自动最小化 z 序最底的那一张并提示。
- **几何护栏**：任何时刻卡片横向至少留 48px 在视口内、整条标题栏纵向可见 —— 拖到屏幕外也抓得回来。
- **键盘**：标题栏聚焦后方向键移动（Shift 加速 32px）、`Alt+方向键` 缩放 16px；
  `⋯` 菜单里有最小化/还原、恢复默认尺寸、居中、三档尺寸预设、关闭。
- **a11y**：卡片 `role="dialog"` + `aria-label`；8 个把手是 `aria-hidden` 的纯指针增强（不污染 tab 序）。

### popover（`popover`）

- 锚定在开启它的托盘图标下方（官方 `useAnchoredPosition`：滚动/resize 跟随 + 视口夹紧 + 边距 8px）。
- 宽度自适应（`min(420px, 100vw−24)`），高度 `min(60vh, 520px)` 内滚；**不可**拖动/缩放/最小化。
- 单开：打开另一个 popover 会收起上一个。
- 点外部关闭（点锚点自身除外，否则会「关掉又被打开」）；`Esc` 关闭并把焦点还给图标。
- 锚点元素失效（会话切换/图标卸载）→ 关闭；`card` 则回退到视口右上角固定位（不消失）。

### 会话绑定

内容面（卡片与 popover）**绑定开启它的会话**：切换会话即关闭（位置与尺寸保留在 store，回来再用）。
根因：`shell.overlay` 是 root 作用域、拿不到 `sessionId`，框架由托盘（会话作用域）把会话 id 带过去。

## 7. 状态与持久化（边界很重要）

| 数据                                                           | 存哪            | 键/位置                | 说明                                                                         |
| -------------------------------------------------------------- | --------------- | ---------------------- | ---------------------------------------------------------------------------- |
| 用户**配置**：托盘开关、图标上限、徽标间隔、悬停预览、参考组件 | `settings.yaml` | `dshp-widget-kit` 分节 | 走宿主 `/ext/dshp-widget-kit/state`、`POST config`；跨设备、随 settings 备份 |
| 本机**布局**：托盘顺序、隐藏集合、卡片矩形/最小化/开关         | `localStorage`  | `dshp-widget-kit:v1`   | 每台浏览器一份；换设备或清缓存回到默认                                       |
| 运行时                                                         | 内存            | —                      | 注册表、当前打开的内容面、z 序、锚点、徽标结果、加载数据                     |

localStorage 结构（带版本；`v` 不匹配整份丢弃，**不做迁移**）：

```ts
interface PersistedV1 {
  v: 1;
  tray: { order?: string[]; hidden?: string[] }; // 各 ≤64 项
  cards: Record<string, { x; y; w; h; minimized?; open? }>; // ≤64 项
  lastOpenId?: string | null; // 只用于“上次开的是谁”
}
```

- 写入 debounce 300ms；拖拽/缩放期间不写，`pointerup` 提交一次；插件卸载前 `flush`。
- 消毒：坏 JSON / 版本不符 / 字段类型不符 → 回默认；坐标夹进视口；`w/h` 夹进 `min/max`；未知 id 丢弃。
- 不可用（隐私模式、配额满）→ 内存降级 + 一行 `console.warn`，功能照常。
- 多标签：监听 `storage` 事件重新 hydrate（几何同步，`lastOpenId` 不同步）。
- **组件卸载**（插件停用/更新）→ 该 id 的卡片、托盘项、隐藏记录与残留一并清除 + 一行提示。
- 启动 5 秒后会清理「在册但没人注册」的历史残留（卸载过的插件留下的记录）。

## 8. 失败模式

| 场景                                     | 行为                                                                               |
| ---------------------------------------- | ---------------------------------------------------------------------------------- |
| 框架没装，你声明了 `inject: ['widgets']` | 你的插件停在 waiting（不报错、不半死）；文档里写清要装框架                         |
| 描述符非法                               | `register` 抛中文错误；其它组件与框架不受影响                                      |
| `render` 抛错                            | 只有这张卡片显示错误态 + 「重试」；托盘、其它卡片、popover 都不受影响              |
| `load` 失败/超时                         | 无数据 → 错误态；有旧数据 → 保持展示并标 `stale`，`error.retriable` 告诉你能否重试 |
| `badge` 抛错/超时（5s）                  | 退避 5s→10s→30s→60s；连续 3 次失败徽标转告警色；不影响其它组件                     |
| 尺寸回环                                 | defer + 警告一次；500ms 内超过 3 次冻结该组件的自动改尺寸                          |
| 同一 id 被两个插件声明                   | 后注册者胜（见下「已知边界」）                                                     |
| 会话切换                                 | 内容面关闭；本机布局保留                                                           |

## 9. 已知边界（诚实清单）

1. **owner 只能从 id 前缀推断**：框架拿不到调用者的插件身份，所以两个插件若声明同一个 id，
   后注册者覆盖前者（同 id 重注册 = 覆盖，这是 HMR 友好的必要语义）。**请用你自己的命名空间做前缀**。
2. **内容面是 root 作用域**：只拿得到 `sessionId`（由托盘带过来），拿不到 `useChat`/`useConversation`
   这类会话级 hook。需要完整会话快照的组件，请通过自己的 Host 路由按 `sessionId` 取数。
3. **客户端还没有 z-index token 层**（官方 `sidebar-right` README 也这么说）：卡片层只能在自己的
   层叠上下文里用相对 z，不与官方层抢序。
4. **不依赖官方 `@deepseek-ai/dsh-client-ui-dockkit`**：它是右侧栏 tab/pane 的停靠状态机
   （`planFloatTab`/`split`），不是通用窗口管理器；我们只对齐它的词汇（cascade 默认位、float/dock、rect）。
5. **`tray.preview` 目前是留位**：字段已在契约里冻结，v1 未接线（悬停显示的是 Tooltip 文案）。
6. **不做**：看板页与自由网格、卡片吸附/停靠/分屏/置顶常驻、同一组件多实例、组件之间直接通信、
   跨设备同步布局、`scope: 'global'` 的卡片（切会话不关）。

## 10. 提交前自检清单

- [ ] `id` 前缀是自己的命名空间；`title`/`icon` 齐全；`presentation` 明说。
- [ ] `card.minSize` ≥ `240×140`，`defaultSize` 在 `min/max` 之间。
- [ ] `refreshMs` 为 0 或 ≥ 5000；`badgeIntervalMs` 在 5000–600000。
- [ ] `content.load` 用了传进来的 `signal`（关闭/切换时会 abort；不理会它就会留后台请求）。
- [ ] 用容器查询或 `sizeClass` 适配过 `minSize`，没有白屏/溢出/撑破。
- [ ] `render` 里没有 `setSize`（改尺寸只在事件回调里）。
- [ ] 没有自己监听 `window.resize`、没有 portal 到 `document.body`、没有硬编码颜色。
- [ ] 颜色只用 `--dsw-alias-*` token，类名走 CSS Module。
- [ ] `package.json` 里只有 `devDependencies` 引用 `@dshp/widget-kit`（`import type`，产物里不得出现它）。
- [ ] `ctx.effect(..., 'dshp-<你的插件>: …')` 包住了注册调用。

## 11. 反例（会被打回）

```tsx
// ✗ 在 render 里按尺寸反推容器尺寸：尺寸回环
render: (props) => {
  if (props.data && props.data.items.length > 5) props.setSize?.({ h: 600 });
  return <List items={props.data?.items} />;
}

// ✗ 自己监听 window resize（框架已按帧通知）
useEffect(() => {
  window.addEventListener('resize', () => setW(window.innerWidth));
}, []);

// ✗ 只处理“漂亮宽度”：minSize 下溢出、撑破、白屏
render: (props) => <div style={{ width: 520 }}>{/* 固定宽度 */}</div>;

// ✗ 忽略 signal：面板关了请求还在跑
load: async () => (await fetch('/ext/my-plugin/data')).json();
load: async (ctx) => (await fetch('/ext/my-plugin/data', { signal: ctx.signal })).json(); // ✓

// ✗ 硬编码颜色（深浅主题必错）
.card { background: #ffffff; }
.card { background: var(--dsw-alias-bg-layer-1); } // ✓
```

## 12. 版本政策

- `SPEC_VERSION`（当前 **1**）是契约版本：字段改名、语义变化、默认值改变 → **+1**，
  并在本节写下迁移步骤；字段**新增**（可选、有默认）不升版本。
- `minFramework` 让你声明「本组件需要 ≥ 某个框架版本」，不满足时 `register` 抛错而不是悄悄降级。
- `FRAMEWORK_VERSION` 必须等于 `package.json` 的 version（`scripts/check-spec-drift.mjs` 会拦）。
- `spec.d.ts`（你 `import type` 的那份）与实现由同一个脚本逐字段比对 —— 类型与实现不会漂移。

## 13. 参考项目（这套模型从哪来）

- **VS Code contribution points**：清单 + 贡献点 + 按需激活 + 收窄的 API 面 —— 描述符/注册表/`minFramework` 取此骨架。
  <https://www.devleader.ca/2026/04/12/building-a-vs-codestyle-extension-system-in-c>
- **Backstage extension points / frontend extension tree**：扩展点由插件自己注册并导出，只允许附加式演进。
  <https://backstage.io/docs/frontend-system/architecture/index>
- **Grafana panel plugin**：`plugin.json`（清单）+ `module.ts`（实现）两件套，面板即组件。
  <https://grafana.com/developers/plugin-tools/tutorials/build-a-panel-plugin>
- **macOS 菜单栏 extra（`NSStatusItem`）/ GNOME 顶栏指示器**：状态栏图标 + 点开弹窗 + 徽标 —— 托盘部分的心智模型。
  <https://8thlight.com/insights/tutorial-add-a-menu-bar-extra-to-a-macos-app>
- **Home Assistant Lovelace 自定义卡片**：卡壳与内容分离、单卡错误不互相拖垮。
  <https://github.com/thomasloven/lovelace-hui-element>
- 本仓既有教训：`plugins/token-meter/src/client/widgets.tsx` 的自由浮窗（固定尺寸假设、
  无 pointercancel、硬编码 z-index 基线、一次移动全量重渲染、组件卸载靠手工前缀清理）—— 本规范逐条对应修复。
