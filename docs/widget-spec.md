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
        │  注册表 → 会话顶部托盘（图标/徽标/溢出/拖拽排序/启用禁用）                │
        │         → 内容面：card（拖拽/缩放/最小化/锁定/关闭 + 吸附贴合、防重叠）    │
        │                  或 popover（锚定小面板：点击/悬停展开、常驻、单开、不可拖动）│
        │         → 调度：加载态 / 错误隔离 / 轮询节流 / 本机布局持久化 / a11y       │
        └───────────────────────────────────────────────────────────────────────┘
```

三个决策点只有你能定：

| 决策                       | 字段                                 | 取值                                                                         |
| -------------------------- | ------------------------------------ | ---------------------------------------------------------------------------- |
| 有没有图标常驻、点开是什么 | `presentation`                       | `'tray'`（只有图标+徽标）/ `'popover'`（锚定小面板）/ `'card'`（可拖拽窗口） |
| 打开时怎么取数             | `content.load` + `content.refreshMs` | 不写 `load` = 纯展示；写了 = 框架负责加载/轮询/中止/陈旧标记                 |
| 尺寸变化后怎么呈现         | **你的 `content.render`**            | 用 `sizeClass`、容器查询或 `size` 三种路径任选                               |

> 小面板（`popover`）与卡片（`card`）是两种不同的问题：**popover 是「小窗口」** —— 不可拖动、
> 不可缩放、同一时刻只展开一个（可以声明为**常驻**），适合快捷设置、状态/数据速览，
> 甚至可以整块渲染 iframe、视频或画布；
> **card 是「窗口」** —— 可拖动/八向缩放/最小化/**锁定位置**/关闭，可同时开多张，适合图表与长列表。
>
> 用户侧还有两件事框架直接提供、**你不需要写任何代码**：**启用/禁用**（在设置页或「组件诊断」里
> 一键停用某组件的图标、卡片、面板与徽标）与**布局持久化**（刷新后卡片位置、尺寸、锁定、层叠顺序
> 与展开的面板原地恢复）。

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

export const inject = ['widgets']; // 只提供组件就不需要 slots；自己还要注册槽位时再加上

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

同一个插件可以再注册**小面板**（popover）：不可拖动、单开，适合快捷设置或数据速览。

```tsx
// 悬停展开的快捷设置：小、快、扫一眼就走
ctx.effect(
  () =>
    ctx.widgets.register({
      id: 'my-quota:quick',
      title: '快捷设置',
      icon: <GearGlyph />,
      presentation: 'popover',
      popover: { trigger: 'hover', width: 320 },
      content: { render: (props) => <QuickSettings sessionId={props.sessionId} onClose={props.close} /> },
    }),
  'my-quota: quick settings',
);

// 也可以整块交给「任意 web 视图」：贴边 + 不给框架标题栏 + 自定义尺寸
ctx.effect(
  () =>
    ctx.widgets.register({
      id: 'my-quota:mini-app',
      title: '迷你面板',
      icon: <PanelGlyph />,
      presentation: 'popover',
      popover: { trigger: 'click', width: 720, maxHeight: 560, padding: 0, header: false },
      content: {
        render: () => (
          <iframe
            src="/ext/my-quota/mini-app"
            title="迷你面板"
            style={{ width: '100%', height: '100%', border: 0 }}
          />
        ),
      },
    }),
  'my-quota: mini app panel',
);
```

（`header: false` 时框架不画标题栏与关闭按钮，整块归你；用户仍可用 `Esc`、点外部、再点图标关闭。）

## 3. 描述符逐字段

| 字段                        | 类型                                                   | 必填                            | 默认                   | 说明                                                                |
| --------------------------- | ------------------------------------------------------ | ------------------------------- | ---------------------- | ------------------------------------------------------------------- |
| `id`                        | `string`                                               | ✅                              | —                      | `^[a-z0-9-]{2,32}:[a-z0-9-]{2,32}$`，前缀必须是**你自己的命名空间** |
| `title`                     | `string \| () => string`                               | ✅                              | —                      | 托盘 aria-label、卡片标题、菜单里的名字                             |
| `icon`                      | `ReactNode`                                            | ✅                              | —                      | 18px 视口；用 `currentColor`；框架负责 `aria-hidden`                |
| `subtitle`                  | `string \| () => string`                               | —                               | 无                     | 卡片标题栏右侧的小字                                                |
| `order`                     | `number`                                               | —                               | `0`                    | 托盘排序；同值按 id 字典序（稳定）                                  |
| `presentation`              | `'tray' \| 'popover' \| 'card'`                        | ✅                              | —                      | 没有默认值，必须明说                                                |
| `tray.badge`                | `(ctx) => WidgetBadge \| null \| Promise<…>`           | —                               | 无                     | 徽标；返回值见下                                                    |
| `tray.badgeIntervalMs`      | `number`                                               | —                               | 框架偏好（默认 30000） | 下限 5000、上限 600000                                              |
| `content.title`             | `string \| () => string`                               | —                               | 用 `title`             | 卡片标题栏文案                                                      |
| `content.load`              | `(ctx) => Promise<D>`                                  | —                               | 无                     | 不写 = 纯展示组件                                                   |
| `content.refreshMs`         | `number`                                               | —                               | `0`（不轮询）          | 要么 0，要么 ≥ 5000                                                 |
| `content.render`            | `(props) => ReactNode`                                 | `presentation !== 'tray'` 时 ✅ | —                      | 内容面                                                              |
| `card.defaultSize`          | `{ w, h }`                                             | —                               | `360×240`              | 首次打开的尺寸（外层 px）                                           |
| `card.minSize`              | `{ w, h }`                                             | —                               | `240×140`              | **不得小于框架地板 240×140**                                        |
| `card.maxSize`              | `{ w, h }`                                             | —                               | 视口 90%               | 小于 `minSize` 直接判错                                             |
| `card.sizeClassBreakpoints` | `{ compact, wide }`                                    | —                               | `{320, 560}`           | 内容盒宽度阈值；`compact < wide`                                    |
| `card.resizable`            | `boolean`                                              | —                               | `true`                 | `false` 时不渲染 8 个把手，菜单里也没有尺寸项                       |
| `card.minimizable`          | `boolean`                                              | —                               | `true`                 | `false` 时没有最小化按钮、双击无效                                  |
| `card.closable`             | `boolean`                                              | —                               | `true`                 | `false` 时没有关闭按钮                                              |
| —（框架行为，非字段）       | 吸附间隔 `8` / 吸附距离 `12` / 跨轴对齐容差 `28`（px） | —                               | 见左                   | 拖动时的贴边、贴邻卡与对齐，见 §6「移动、吸附与防重叠」             |
| `popover.*`                 | 见下表                                                 | —                               | 见下表                 | **只有 `presentation: 'popover'` 接受**                             |
| `minFramework`              | `string`                                               | —                               | 无                     | 语义化版本下限；不满足则 `register` 抛错                            |

### 3.1 `popover` 形态选项（小面板）

| 字段                | 类型                 | 默认             | 说明                                                                   |
| ------------------- | -------------------- | ---------------- | ---------------------------------------------------------------------- |
| `trigger`           | `'click' \| 'hover'` | `'click'`        | 点图标展开，或悬停展开（移开自动收起，并留宽限让指针能从图标移到面板） |
| `width`             | `number`             | 自适应           | 面板宽度 px（160–2000）；不写 = 自适应内容，上限 `min(420, 视口−24)`   |
| `maxHeight`         | `number`             | `min(60vh, 520)` | 面板最大高度 px（120–2000），超出内滚                                  |
| `padding`           | `number`             | `12`             | 内容内边距（0–48）；要贴边渲染（iframe / 视频 / 画布）就设 `0`         |
| `side`              | `'bottom' \| 'top'`  | `'bottom'`       | 相对图标在下方还是上方展开                                             |
| `header`            | `boolean`            | `true`           | 是否渲染框架自带的标题栏（标题 + 关闭按钮）；`false` = 整块面板归你    |
| `hoverOpenDelayMs`  | `number`             | `80`             | 悬停展开延迟（0–2000）；给「鼠标只是路过」留出撤销机会                 |
| `hoverCloseDelayMs` | `number`             | `220`            | 悬停收起宽限（0–2000）；覆盖「从图标移到面板」的间隙                   |
| `persistent`        | `boolean`            | `false`          | **持续显示**：点外部 / 指针移开都不收起（详见下）                      |

**`trigger: 'hover'` 的行为细节**：延迟到点才展开；移开图标后不立刻收起，宽限期内指针进入面板
（面板自己也会 `hoverEnter`）就撤销收起；**被点开的** popover（`trigger: 'click'`，或悬停期间点了图标）
不受移开指针影响，只由「点外部 / Esc / 再点图标 / 打开另一个」关闭。

**`persistent: true`（持续显示）**：面板不受**外部操作**影响 —— 点面板外的区域、指针移开都不会收起，
标题栏里会标一个「常驻」角标。它只认三条明确的关闭意图：面板上的「✕」、再点一次托盘图标、`Esc`。
适合「常驻的快捷设置 / 实时数据面板」；一次性的菜单 / 选择器**不要**设它（用户会找不到关掉的办法）。
单开语义不变：打开另一个 popover 仍然会先收起它。

**校验**：任何字段不合法 → `register()` 抛 `WidgetSpecError`（中文、指出字段与期望），
你的其余组件与框架都不受影响。错误信息里会告诉你「改哪里」。

`WidgetBadge`：`{ text?: string（≤2 字）、dot?: boolean、tone?: 'info'|'ok'|'warn'|'bad'、title?: string }`。
`text` 为空且 `dot` 为 false 且 `tone` 未给 = 不显示角标。

## 4. 内容 props 逐字段（`content.render` 收到的）

| 字段                          | 类型                                         | 说明                                                                          |
| ----------------------------- | -------------------------------------------- | ----------------------------------------------------------------------------- |
| `frame`                       | `'card' \| 'popover'`                        | 当前承载面（同一个 `render` 可以两用）                                        |
| `sessionId`                   | `string \| null`                             | 开启内容面的会话；无会话时为 `null`                                           |
| `status`                      | `'loading' \| 'ready' \| 'error' \| 'empty'` | `load` 解析为 `null`/`undefined` → `empty`                                    |
| `data`                        | `D \| undefined`                             | `load` 的返回值                                                               |
| `error`                       | `{ message, retriable } \| undefined`        | 失败原因；有旧数据时 `status` 仍是 `ready` 且 `stale: true`                   |
| `stale`                       | `boolean`                                    | 展示的是旧数据、刷新失败                                                      |
| `lastUpdatedAt`               | `number \| null`                             | 上次成功加载的时间戳                                                          |
| `size`                        | `{ width, height } \| null`                  | **内容盒**实测尺寸（整数 px，已扣标题栏与内边距）；`popover` 恒为 `null`      |
| `sizeClass`                   | `'compact' \| 'regular' \| 'wide'`           | `card` 由内容盒宽度派生；`popover` 恒 `'regular'`（用容器查询）               |
| `setSize`                     | `(next) => void \| undefined`                | **仅 `card` 存在**（`popover` 是 `undefined`，不是静默 no-op）                |
| `minimized`                   | `boolean`                                    | 仅 `card` 有意义：卡片已折叠成标题栏（内容**仍在树上**、只是不显示）          |
| `locked`                      | `boolean`                                    | 仅 `card` 有意义：位置已锁定（框架已拒掉拖动/缩放；可据此收掉自己的几何控件） |
| `refresh` / `retry` / `close` | `() => void`                                 | 手动刷新 / 重试 / 关闭内容面                                                  |

## 5. 尺寸契约（本节是规范的核心）

### 5.1 框架保证（你可以依赖）

1. `size` 是**内容盒**（外层 − 标题栏 36px − 内边距 2×10px），取整，**永远不小于 `minSize`** 换算出的内容盒。
2. 拖拽/缩放期间**每帧至多通知一次**（rAF 合并）；`pointerup` 之后**必发一次最终精确值**。
3. 视口变化后先把卡片夹回可见区，再通知新尺寸。
4. 最小化 = **折叠成一条标题栏**（高度 36px，位置与宽度不变）：内容留在树上但被隐藏，组件自身的
   内部状态与 `load` 轮询都不断（还原是瞬时的，不会重新加载）；提供方通过 `props.minimized` 决定要不要停自己的活。
5. 卡片**永远完整留在视口内**，并且**不会压在别的卡片上**：拖动时框架会做吸附与避让（不是提供方的事）。
6. 你**不需要**监听任何 window 事件。

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
  换序判定只看**其余图标**的中心线，**左右两个方向都可用**；拖拽的结果与溢出菜单里的上移/下移等价。
- 被**禁用**的组件不出现在托盘（见下「启用 / 禁用」）。
- 单击与拖拽共用同一个按钮：拖拽结束后那一次 `click` 会被吞掉（不会误触发打开）。
- 空白会话（DSH 会隐藏整个会话头）时托盘不渲染 —— 这是官方行为，不是框架缺失。

### 卡片（`card`）

- **拖动**：整条标题栏是把手（照抄官方 `dsh-client-ui-layout` 的 `DragHandle` 范式：
  `setPointerCapture` + rAF 合并 + `pointerup` 补最终值 + `pointercancel`/`onLostPointerCapture` 收尾 + 卸载兜底）。
- **缩放**：8 个把手（四边 + 四角），对边固定，夹在 `min/max` 与视口内；向北缩放时顶边不越过 `y=0`。
- **最小化**：折叠成一条标题栏（高度 36px），位置与宽度不变，**内容隐藏但不卸载**（还原即时、
  组件状态不丢、数据不重取）；双击标题栏、点 `—` 按钮或点托盘图标还原。
- **锁定位置**：标题栏的锁按钮（或 `⋯` 菜单）锁住几何 —— 拖动、8 个把手、键盘微调、`⋯` 里的
  尺寸预设/居中/内容面 `setSize` 全部失效，`⋯` 菜单里也不再出现这些项；**最小化 / 关闭 / 还原照常**，
  只是这两个动作从标题栏收进了 `⋯` 菜单：**锁定时标题栏只留「解锁」与「⋯」两个按钮**，
  避免一排图标里点错；解锁后恢复「锁定 / 最小化 / ⋯ / 关闭」。
  锁定状态记在本机布局里（刷新后仍是锁的），并同步给内容面的 `props.locked`。
- **关闭**：托盘图标保留（非激活态），再点按原位置重开。
- **z 序**：点击/拖动即置顶；只在卡片层自己的层叠上下文里用相对值（客户端目前没有 z-index token 层）。
- **同屏上限**：6 张；开第 7 张时自动最小化 z 序最底的那一张并提示。
- **几何护栏**：任何时刻卡片**整卡留在视口内**（不允许拖到屏幕之外）；视口变小后会被夹回可见区域。
  卡片之间**允许互相覆盖**（叠着放是允许的），靠近时的吸附只是候选，见下节。
- **键盘**：标题栏聚焦后方向键移动（Shift 加速 32px）、`Alt+方向键` 缩放 16px（锁定时不响应）；
  `⋯` 菜单里有最小化/还原、锁定/解锁位置、恢复默认尺寸、居中、三档尺寸预设、关闭。
- **a11y**：卡片 `role="dialog"` + `aria-label`；8 个把手是 `aria-hidden` 的纯指针增强（不污染 tab 序）。
- **手势期间不可选中文字**：拖动或缩放时，框架给整卡加 `user-select: none`，并盖一层**全视口手势盾**
  （`user-select: none` + `pointer-events: auto` + 与手势一致的鼠标指针）—— 缩放的指针会扫过卡片内容与页面文字，
  没有这层盾就会拖出一片蓝色高亮；顺带挡住指针进入 iframe / 画布时事件被吞。提供方什么都不用做。
- **拖动过程中还有一个虚线预览框**：它表示「松手会落到这里」（吸附候选），卡片本体自由跟手，
  见下节。

### 启用 / 禁用（动态启停，用户侧）

- **不是**组件自己开关，而是**用户**在「设置 → 小组件」或参考组件「组件诊断」里对每个组件的开关。
- 禁用 = 一次**软卸载**：托盘图标、卡片、popover 面板、徽标排期与在飞请求全部停用，
  内容面随之卸载（`load` 轮询随 effect 一起停），已展开的内容面立刻收起。
- **注册记录与本机布局保留**：组件仍在注册表里（`list()` 拿得到），卡片的位置/尺寸/锁定状态、
  托盘顺序、隐藏记录都留着 —— 再次启用时回到原样，不需要重新 `register`。
- 状态记在本机布局（`localStorage`）里，刷新后仍然有效。框架内部走 `setEnabled/isEnabled`；
  注册方**不需要**为此做任何事（不要自己监听开关去 `register`/`unregister`）。

### 移动、吸附与预览（框架行为，提供方不用管）

拖动（以及键盘方向键微调）的落点由框架算，规则是「**自由跟手 + 磁力候选 + 松手确认**」：

1. **自由跟手**：拖动期间卡片停在指针给的位置，**允许与其它卡片互相覆盖**（谁在上面由 z 序决定，
   拖到哪就是哪，框架不会把你推开）。越界会夹回视口内 —— **整卡永远不会跑到屏幕之外**。
2. **吸附只是候选（先看预览，再决定要不要）**：与视口边缘、邻卡边缘或邻卡对齐线相差 ≤ `12px` 时，
   框架在**吸附后的位置**画一个虚线预览框（`.snapGhost`），卡片本体**不动**。
   两个轴各自独立判断，所以「贴到旁边 + 上对齐」是两条候选同时命中（贴邻卡时留 `8px` 间隔）。
3. **松手 = 同意**：松手时预览框还在 → 落到预览位置；拖开让预览框消失再松手 → 落回自由位置。
   拖动期间预览框一直在动（候选切换有 120ms 过渡），所以你总能先看到「会落到哪」再决定。
4. **键盘微调**是精确移动：不吃磁力（否则贴着邻卡时每一步都会被吸回去），只受视口约束。
   `⋯` 菜单的「居中」同理。
5. **缩放不受吸附影响**：缩放只夹在 `min/max` 与视口内（对边固定是缩放的硬语义），也不产生预览框。
6. **谁提供吸附线**：当前打开且**未最小化**的其它卡片（最小化的只留一条标题栏，不参与）。
7. **视口变化**（窗口 resize）只做「夹回视口内」，不重新吸附 —— 布局是用户摆的，不该被窗口大小改掉。

**手势可靠性**（这部分也在框架里，提供方不用做任何事）：拖动/缩放的 `pointerdown` 会捕获指针并在
`window` 上挂一份 move/up/cancel 兜底监听；每帧还会检查鼠标左键是否还按着，漏收 `pointerup`
（松在窗口外）时当帧就收尾。手势期间整卡 `user-select: none` 并盖一层全视口手势盾
（`user-select: none` + 指针形状跟随手势），所以拖不出文字高亮，指针扫过 iframe / 画布也不会断。

### 动效（框架行为）

- 卡片出现：180ms 放大淡入；最小化 / 还原 / 尺寸预设：160ms 高度宽度过渡，内容 140ms 淡出淡入。
- 拖动 / 缩放期间：卡片轻微放大 + 更强阴影（`transform` 120ms 过渡）；**几何本身不做过场**
  （逐帧跟手，任何过渡都会变成拖不动的滞后感）；吸附预览框位置 120ms 过渡，切换候选时是滑过去而不是闪一下。
- 跟随系统「减少动效」偏好（`prefers-reduced-motion: reduce` 时全部关掉）。

### popover（`popover`）—— 小面板

- 锚定在开启它的托盘图标上（官方 `useAnchoredPosition`：滚动/resize 跟随 + 视口夹紧 + 边距 8px）；
  `side: 'top'` 时向上展开。
- **不可拖动、不可缩放、不可最小化**；同一时刻**只展开一个**（打开另一个会先收起上一个）。
- 尺寸：`width`（不写则自适应，上限 `min(420, 视口−24)`）、`maxHeight`（不写则 `min(60vh, 520)`，超出内滚）、
  `padding`（`0` = 贴边，适合 iframe / 视频 / 画布这类「任意 web 视图」）。
- `header: false` 时框架不画标题栏与关闭按钮，整块面板归你；关闭手段仍是 **Esc / 点外部 / 再点图标**。
- 展开方式：`trigger: 'click'`（默认）点图标展开；`trigger: 'hover'` 悬停展开、移开自动收起（带宽限）。
  悬停展开的组件**不再叠 Tooltip 气泡**（面板本身就是说明），且**不抢焦点**；点开的会把焦点移进面板。
- 点外部关闭（点锚点自身除外，否则会「关掉又被打开」）；`Esc` 关闭并把焦点还给图标。
  设了 `persistent: true` 的面板**不参与点外部关闭**（常驻，见 §3.1）。
- 锚点元素失效（会话切换/图标卸载）→ 关闭；`card` 则回退到视口右上角固定位（不消失）。

**参考实现**（可直接对照源码，都在框架自己的 `plugins/widget-kit/src/client/widgets/` 下）：
`quick-settings.tsx` = 点击展开 + 小面板放快捷设置（写偏好）；`status.tsx` = 悬停展开 + `header: false` +
`padding: 0`（整块面板归提供方）；`clock.tsx` / `diagnostics.tsx` = 卡片侧的尺寸呈现与注册表诊断。

### 会话绑定

内容面（卡片与 popover）**绑定开启它的会话**：切换会话即关闭（位置与尺寸保留在 store，回来再用）。
根因：`shell.overlay` 是 root 作用域、拿不到 `sessionId`，框架由托盘（会话作用域）把会话 id 带过去。

**首帧拿到会话不算切换**：刷新后托盘是带着真实 `sessionId` 挂载的，而运行时此刻还是「还没会话」，
这一步必须只做绑定、不做清理 —— 否则每次刷新都会把刚从本机布局里恢复出来的卡片与面板全部关掉
（这正是 0.2.0 修掉的那个 bug）。只有 `会话A → 会话B` 这种真正的切换才收起内容面。

## 7. 状态与持久化（边界很重要）

| 数据                                                                                   | 存哪            | 键/位置                | 说明                                                                         |
| -------------------------------------------------------------------------------------- | --------------- | ---------------------- | ---------------------------------------------------------------------------- |
| 用户**配置**：托盘开关、图标上限、徽标间隔、悬停预览、参考组件                         | `settings.yaml` | `dshp-widget-kit` 分节 | 走宿主 `/ext/dshp-widget-kit/state`、`POST config`；跨设备、随 settings 备份 |
| 本机**布局**：托盘顺序、隐藏/禁用集合、卡片矩形与最小化/锁定、层叠顺序、当前展开的面板 | `localStorage`  | `dshp-widget-kit:v1`   | 每台浏览器一份；换设备或清缓存回到默认                                       |
| 运行时                                                                                 | 内存            | —                      | 注册表、锚点、徽标结果、加载数据（**打开状态与层叠顺序已不在这一类**）       |

localStorage 结构（带版本；`v` 不匹配整份丢弃，**不做迁移**）：

```ts
interface PersistedV1 {
  v: 1;
  tray: { order?: string[]; hidden?: string[] }; // 各 ≤64 项
  cards: Record<string, { x; y; w; h; minimized?; open?; locked? }>; // ≤64 项
  lastOpenId?: string | null; // 只用于「上次开的是谁」
  zOrder?: string[]; // 卡片层自下而上的顺序（末尾 = 最上）
  popoverId?: string | null; // 当前展开的 popover（单开）
  popoverOrigin?: 'click' | 'hover' | null; // 它是被点开的还是被悬停打开的
  disabled?: string[]; // 被用户禁用的组件（软卸载）
}
```

- **刷新即恢复**：上次开着的卡片、展开的 popover、层叠顺序、锁定与禁用状态都在本机布局里，
  刷新/重开页面后原地回来（这也是为什么这些字段必须持久化，而不能只放内存）。
- `cards[id].open` 只决定「要不要在刷新后恢复这张卡片」；真的关卡片（`close`）会把它写成 `false`。
- 吸附结果就是卡片的最终矩形，所以刷新后回来的是**吸附之后**的位置（不会又散开）。
- 写入 debounce 300ms；拖拽/缩放期间不写，`pointerup` 提交一次；插件卸载前 `flush`。
- 消毒：坏 JSON / 版本不符 / 字段类型不符 → 回默认；坐标夹进视口；`w/h` 夹进 `min/max`；未知 id 丢弃。
  **新增字段一律向后兼容地追加**（老记录缺字段 = 用默认值），所以结构版本不需要 bump。
- 不可用（隐私模式、配额满）→ 内存降级 + 一行 `console.warn`，功能照常。
- **组件卸载**（插件停用/更新）→ 该 id 的卡片、托盘项、隐藏/禁用记录、层叠顺序与残留一并清除 + 一行提示。
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
| 组件被用户禁用                           | 图标、卡片、面板、徽标一并停用；注册记录与布局保留，重新启用即回到原样             |
| 卡片被锁定后仍尝试移动/缩放              | 静默无效（菜单里也不出现这些项）；最小化 / 关闭 / 还原不受影响                     |

## 9. 已知边界（诚实清单）

1. **owner 只能从 id 前缀推断**：框架拿不到调用者的插件身份，所以两个插件若声明同一个 id，
   后注册者覆盖前者（同 id 重注册 = 覆盖，这是 HMR 友好的必要语义）。**请用你自己的命名空间做前缀**。
2. **内容面是 root 作用域**：只拿得到 `sessionId`（由托盘带过来），拿不到 `useChat`/`useConversation`
   这类会话级 hook。需要完整会话快照的组件，请通过自己的 Host 路由按 `sessionId` 取数。
3. **客户端还没有 z-index token 层**（官方 `sidebar-right` README 也这么说）：卡片层只能在自己的
   层叠上下文里用相对 z，不与官方层抢序。
4. **不依赖官方 `@deepseek-ai/dsh-client-ui-dockkit`**：它是右侧栏 tab/pane 的停靠状态机
   （`planFloatTab`/`split`），不是通用窗口管理器；我们只对齐它的词汇（cascade 默认位、float/dock、rect）。
5. **悬停面板的边界**：只有 `trigger: 'hover'` 的 popover 会在移开指针后自动收起（带宽限），
   被点开的不会；两种都仍然单开。悬停展开依赖指针事件，触屏/键盘用户走点击与 `Esc`。
6. **锁定与启停是「用户侧」状态，不是描述符**：提供方不能在描述符里声明「默认锁定」或
   「默认禁用」（那属于用户的本机布局）；`popover.persistent` 是唯一形态级的常驻声明。
7. **吸附只做「贴边 + 对齐」**：不做自由网格、不做等宽等高的网格对齐、不做分屏/停靠 tab 化；
   不预留「避开其它卡片」的空位（卡片允许重叠，这是刻意的）。
8. **不做**：看板页与自由网格、卡片分屏/停靠 tab 化、同一组件多实例、组件之间直接通信、
   跨设备同步布局、`scope: 'global'` 的卡片（切会话不关）、多标签页布局同步。

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
- [ ] 若用 `popover`：`trigger` 想清楚（悬停只适合「扫一眼」的信息，需要输入/点选的用点击）；
      `padding: 0` / `header: false` 时自己确保内容有边距、且用户能靠 Esc 或点外部关掉；
      面板内部**不要**再自己监听 window 事件（宽度已由 `width` 或容器查询给出）。
- [ ] 设了 `persistent: true` 的话，面板里必须留一个明确的关闭入口（「✕」或者自己画一个），
      并确认「常驻」是用户想要的（常驻的菜单/选择器会被打回）。
- [ ] 若用 `card`：最小化只折叠成标题栏、内容仍在树上 —— 需要停掉自己的定时器/动画就自己看
      `props.minimized`；`props.locked` 为真时不要再画自己的拖动/缩放控件。
- [ ] 不要自己实现拖动、吸附或贴边（框架的 `dockRect` 已经做了）：提供方只渲染内容，
      标题栏的按钮由框架给。

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
  并在本节写下迁移步骤；字段**新增**（可选、有默认）不升版本 —— 例如 `popover` 形态选项就是 v1 内的新增。
- **0.4.2（框架版本，契约仍为 v1）**：修一个会让整个卡片层崩掉的渲染死循环
  （`getLiveSnap()` 每帧新建对象，违反 `useSyncExternalStore` 的快照稳定性，React error #185）。
- **0.4.1（框架版本，契约仍为 v1）**：锁定的卡片标题栏只保留「解锁」与「⋯」两个按钮，
  最小化 / 关闭收进 `⋯` 菜单（动作本身不变）。纯 UI 调整。
- **0.4.0（框架版本，契约仍为 v1）**：移动模型改成「自由跟手 + 吸附预览虚框 + 松手确认」
  （**允许卡片互相覆盖**，新增 `LiveGeometry.snap` 与运行时的 `getLiveFor` / `getLiveSnap`），
  手势改由 `window` 兜底监听驱动并新增「左键已松开即收尾」，卡片出现 / 最小化 / 拖动加上动效。
  对外描述符契约无变化。
- **0.3.1（框架版本，契约仍为 v1）**：拖动与缩放期间整卡不可选中文字，并盖一层全视口手势盾
  （鼠标指针跟随手势方向）；标题栏与缩放手把也各自 `user-select: none`。纯交互修复，无契约变化。
- **0.3.0（框架版本，契约仍为 v1）**：几何护栏从「至少留 48px 可见」改成**整卡留在视口内**，
  并新增拖动/键盘移动时的**吸附与防重叠**（`dockRect`：贴视口边与邻卡边、跨轴对齐、始终留 8px 间隔、
  拖动期间即可见）；标题栏不可选中文字、锁定按钮用红/绿状态色。
  `SPEC_DEFAULTS` 里 `minVisibleTitleBar` 由 `snapGap` / `snapDistance` / `snapAlign` 取代（这三个不在对外契约里）。
- **0.2.0（框架版本，契约仍为 v1）**新增，全部向后兼容：
  `popover.persistent`（持续显示）、内容 props 的 `locked`、
  `widgets` 服务的 `setEnabled`/`isEnabled`/`setLocked`/`isLocked`，
  以及三处行为修复 —— 刷新后恢复布局与展开状态（含「首帧会话绑定不算切换」）、
  最小化改为折叠标题栏（内容不卸载）、托盘图标拖拽换序左右双通。
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
