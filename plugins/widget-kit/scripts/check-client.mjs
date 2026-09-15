#!/usr/bin/env node
/**
 * 无头冒烟测试：把 `lib/client.js` 当 IIFE 跑一遍（不打开浏览器）
 *
 * 覆盖「看不见但错了就白屏」的部分：
 *   1. loader 契约：`__ModuleLoader__.load({ id, factory })` 的 id 与包名一致、`inject` 齐全、
 *      `apply` 在最小 ctx 下不抛；
 *   2. `widgets` 服务**真的发布出去**了，且成员与规范的 `SPEC_KEYS.service` 完全一致；
 *   3. 三个槽位注册（会话顶部托盘 / shell.overlay 卡片层 / 设置节）的 name / id / order；
 *   4. 每个 `ctx.effect` 都带 `dshp-widget-kit:` 前缀（本仓红线：无 label 的 effect 打回）；
 *   5. 描述符校验：12 类非法输入逐个抛中文错误；合法注册 → list() → disposer 清理；
 *   6. 同 id 重注册 = 覆盖（HMR / 重复 apply 的语义）；
 *   7. **渲染一遍**：托盘与卡片层的组件树能真的跑出元素（用 stub 的 React，不画像），
 *      卡片外层几何等于运行时给的矩形 —— 这一步能在没有浏览器的情况下抓住渲染期崩溃；
 *   8. 本轮新增的四件事：**刷新后恢复**（首帧会话绑定不算切会话）、**最小化折叠成标题栏**、
 *      **位置锁定**、**启用 / 禁用**与**常驻 popover**。
 *
 * 只用 node 内建模块。
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// ── 最小 React / primitives 替身 ─────────────────────────────────────────
let liveHook = null;

const ReactStub = {
  createElement: (type, props, ...children) => ({ type, props: { ...props, children } }),
  Fragment: 'Fragment',
  Component: class Component {
    constructor(props) {
      this.props = props;
    }
    setState() {}
  },
  useState(initial) {
    if (liveHook !== null)
      return [liveHook.slots.shift() ?? (typeof initial === 'function' ? initial() : initial), () => {}];
    return [typeof initial === 'function' ? initial() : initial, () => {}];
  },
  useEffect: () => {},
  useLayoutEffect: () => {},
  useCallback: (fn) => fn,
  useMemo: (fn) => fn(),
  useRef: (initial) => ({ current: initial }),
  useSyncExternalStore: (_subscribe, getSnapshot) => getSnapshot(),
};

const jsxRuntime = {
  Fragment: 'Fragment',
  jsx: (type, props) => ({ type, props: props ?? {} }),
  jsxs: (type, props) => ({ type, props: props ?? {} }),
};

// React 用这个标记识别 class 组件；我们的极简渲染器也靠它区分「函数组件」与「class 组件」
ReactStub.Component.prototype.isReactComponent = {};

/** primitives 替身：只要能当组件调用即可（渲染树里我们只断言我们自己的节点）。 */
function primitive(name) {
  return (props) => ({ type: name, props: props ?? {} });
}

const primitivesStub = {
  Button: primitive('Button'),
  Menu: primitive('Menu'),
  Tooltip: primitive('Tooltip'),
  Switch: primitive('Switch'),
  Pill: primitive('Pill'),
  StateDot: primitive('StateDot'),
  useAnchoredPosition: () => null,
  useDismissOnOutsidePointer: () => {},
};
void liveHook;

// ── 浏览器环境替身 ───────────────────────────────────────────────────────
const storage = new Map();
const windowStub = {
  __ModuleLoader__: {
    load: (entry) => {
      loaded = entry;
    },
  },
  innerWidth: 1280,
  innerHeight: 800,
  addEventListener: () => {},
  removeEventListener: () => {},
  localStorage: {
    getItem: (key) => (storage.has(key) ? storage.get(key) : null),
    setItem: (key, value) => storage.set(key, value),
    removeItem: (key) => storage.delete(key),
  },
};
let loaded = null;

const fetchCalls = [];
globalThis.fetch = async (url, init) => {
  fetchCalls.push({ url, method: init?.method ?? 'GET' });
  return {
    async json() {
      return {
        ok: true,
        version: '0.3.1',
        specVersion: 1,
        config: {
          trayEnabled: true,
          maxVisibleIcons: 4,
          badgeIntervalMs: 30000,
          hoverPreview: true,
          referenceWidgets: true,
        },
      };
    },
  };
};

// ── 跑 bundle ────────────────────────────────────────────────────────────
const source = readFileSync(new URL('../lib/client.js', import.meta.url), 'utf8');
// eslint-disable-next-line no-new-func -- 自检脚本就是要把产物当脚本求值
new Function('window', source)(windowStub);

assert.ok(loaded !== null, 'bundle 没有调用 window.__ModuleLoader__.load');
assert.equal(loaded.id, '@dshp/widget-kit', 'loader id 必须等于包名');
assert.equal(typeof loaded.factory, 'function');

const requireStub = (spec) => {
  if (spec === 'react') return ReactStub;
  if (spec === 'react/jsx-runtime') return jsxRuntime;
  if (spec === '@deepseek-ai/dsh-client-ui-primitives') return primitivesStub;
  throw new Error(`未预期的运行时依赖：${spec}（本插件运行时零依赖）`);
};

const exportsObject = loaded.factory(requireStub);
assert.deepEqual(exportsObject.inject, ['slots', 'timer'], 'client 半的 inject 必须声明 slots 与 timer');
assert.equal(typeof exportsObject.apply, 'function');

// ── 假 ctx ───────────────────────────────────────────────────────────────
const effects = [];
const provides = [];
const intervals = [];
const timeouts = [];
const injections = [];
const registrations = [];

const slots = {
  inject: (name, callback) => {
    injections.push(name);
    return callback();
  },
  register: (spec, component) => {
    registrations.push({ spec, component });
    return () => {};
  },
};

const ctx = {
  get: (name) => {
    if (name === 'slots') return slots;
    if (name === 'timer') return {};
    return undefined;
  },
  effect: (callback, label) => {
    const result = callback();
    effects.push({ label, dispose: typeof result === 'function' ? result : null });
    return result;
  },
  interval: (callback, ms) => {
    intervals.push(ms);
    void callback;
    return () => {};
  },
  timeout: (callback, ms) => {
    const entry = { callback, ms, cancelled: false, fired: false };
    timeouts.push(entry);
    return () => {
      entry.cancelled = true;
    };
  },
  reflect: {
    provide: (serviceName, value) => {
      provides.push({ serviceName, value });
      return () => {};
    },
  },
};

exportsObject.apply(ctx);

// ── 1. 服务发布 ──────────────────────────────────────────────────────────
assert.equal(provides.length, 1, '必须只发布一个客户端服务');
assert.equal(provides[0].serviceName, 'widgets');
const service = provides[0].value;
const EXPECTED_SERVICE_KEYS = [
  'specVersion',
  'frameworkVersion',
  'register',
  'list',
  'subscribe',
  'open',
  'close',
  'toggle',
  'isOpen',
  'minimize',
  'restore',
  'setEnabled',
  'isEnabled',
  'setLocked',
  'isLocked',
];
const actualServiceKeys = Object.keys(service);
actualServiceKeys.sort();
const expectedServiceKeys = [...EXPECTED_SERVICE_KEYS];
expectedServiceKeys.sort();
assert.deepEqual(actualServiceKeys, expectedServiceKeys, 'widgets 服务的成员必须与 SPEC_KEYS.service 一致');
assert.equal(service.specVersion, 1);
assert.equal(service.frameworkVersion, '0.3.1');

// ── 2. 槽位注册 ──────────────────────────────────────────────────────────
assert.deepEqual(injections, ['conversation.session.header.utilities', 'shell.overlay', 'settings.section']);
const bySlot = new Map(registrations.map((entry) => [entry.spec.name, entry.spec]));
assert.deepEqual(bySlot.get('conversation.session.header.utilities'), {
  name: 'conversation.session.header.utilities',
  id: 'dshp-widget-kit-tray',
  order: 30,
  label: '小组件',
});
assert.deepEqual(bySlot.get('shell.overlay'), {
  name: 'shell.overlay',
  id: 'dshp-widget-kit-cards',
  order: 10,
  label: '小组件卡片',
});
assert.deepEqual(bySlot.get('settings.section'), {
  name: 'settings.section',
  id: 'dshp-widget-kit',
  order: 32,
  label: '小组件',
});

// ── 3. effect 全带 label（本仓红线）──────────────────────────────────────
for (const entry of effects) {
  assert.ok(
    typeof entry.label === 'string' && entry.label.startsWith('dshp-widget-kit:'),
    `effect 缺少 'dshp-widget-kit:' 前缀：${String(entry.label)}`,
  );
}
assert.ok(effects.length >= 8, `effect 数量太少（${String(effects.length)}），装配可能被吞掉了`);
assert.ok(intervals.includes(1000), '徽标调度必须挂在 1s 的 ctx.interval 上');
const timeoutMs = timeouts.map((entry) => entry.ms);
assert.ok(timeoutMs.includes(5000), '启动后清理残留必须挂在 ctx.timeout 上');
assert.ok(timeoutMs.includes(3000), '偏好读取必须有兜底超时（否则托盘可能一直不渲染）');

/** 把指定延时的挂起任务「到点」（悬停展开/收起是定时器驱动的，自检里要能确定性地推进它）。 */
function fireTimeouts(ms) {
  for (const entry of timeouts) {
    if (entry.ms !== ms || entry.fired || entry.cancelled) continue;
    entry.fired = true;
    entry.callback();
  }
}

// ── 4. 描述符校验（12 类非法输入）───────────────────────────────────────
const base = { id: 'demo:thing', title: 'T', icon: 'i', presentation: 'tray' };
const invalidCases = [
  ['descriptor 不是对象', null],
  ['缺 id', { title: 'T', icon: 'i', presentation: 'tray' }],
  ['id 格式不对', { ...base, id: 'nope' }],
  ['缺 title', { id: 'demo:thing', icon: 'i', presentation: 'tray' }],
  ['缺 icon', { id: 'demo:thing', title: 'T', presentation: 'tray' }],
  ['presentation 非法', { ...base, presentation: 'window' }],
  ['card 缺 content.render', { ...base, presentation: 'card' }],
  ['tray 带 content', { ...base, content: { render: () => null } }],
  ['badge 不是函数', { ...base, tray: { badge: 1 } }],
  ['badgeIntervalMs 越界', { ...base, tray: { badgeIntervalMs: 10 } }],
  [
    'card.minSize 小于地板',
    { ...base, presentation: 'card', content: { render: () => null }, card: { minSize: { w: 10, h: 10 } } },
  ],
  [
    'sizeClassBreakpoints 反了',
    {
      ...base,
      presentation: 'card',
      content: { render: () => null },
      card: { sizeClassBreakpoints: { compact: 600, wide: 300 } },
    },
  ],
  ['minFramework 高于当前', { ...base, minFramework: '9.0.0' }],
  [
    'popover.trigger 非法',
    { ...base, presentation: 'popover', content: { render: () => null }, popover: { trigger: 'tap' } },
  ],
  [
    'popover.width 太窄',
    { ...base, presentation: 'popover', content: { render: () => null }, popover: { width: 100 } },
  ],
  [
    'popover.padding 过大',
    { ...base, presentation: 'popover', content: { render: () => null }, popover: { padding: 99 } },
  ],
  [
    'popover.hoverOpenDelayMs 过大',
    {
      ...base,
      presentation: 'popover',
      content: { render: () => null },
      popover: { hoverOpenDelayMs: 9999 },
    },
  ],
  [
    'card 用 popover 配置',
    { ...base, presentation: 'card', content: { render: () => null }, popover: { trigger: 'hover' } },
  ],
];
for (const [label, input] of invalidCases) {
  assert.throws(
    () => service.register(input),
    (error) => {
      assert.ok(error instanceof Error, `${label}: 必须抛 Error`);
      assert.match(error.message, /小组件描述符不合法/, `${label}: 错误信息必须是中文可操作的`);
      return true;
    },
    `${label} 必须被拒绝`,
  );
}

// ── 5. 合法注册 / 列表 / 清理 ───────────────────────────────────────────
const popoverWidget = {
  id: 'demo:quick',
  title: '快捷设置',
  icon: 'i',
  presentation: 'popover',
  content: { render: () => null },
};
const disposePopover = service.register(popoverWidget);
assert.deepEqual(
  service
    .list()
    .map((item) => item.id)
    .includes('demo:quick'),
  true,
  '注册后必须出现在 list() 里',
);
// 同 id 重注册 = 覆盖（不抛）
assert.doesNotThrow(() => service.register({ ...popoverWidget, title: '快捷设置 v2' }));
assert.equal(service.list().filter((item) => item.id === 'demo:quick').length, 1, '同 id 只能有一条');
disposePopover();
assert.equal(
  service.list().some((item) => item.id === 'demo:quick'),
  false,
  'disposer 必须把组件摘掉',
);

// ── 6. 打开 / 最小化 / 还原语义（card）──────────────────────────────────
const cardWidget = {
  id: 'demo:card',
  title: '卡片示例',
  icon: 'i',
  presentation: 'card',
  content: { render: () => null },
  card: { defaultSize: { w: 360, h: 240 } },
};
const disposeCard = service.register(cardWidget);
assert.equal(service.isOpen('demo:card'), false);
service.open('demo:card');
assert.equal(service.isOpen('demo:card'), true, 'open 之后必须 isOpen');
service.minimize('demo:card');
service.restore('demo:card');
assert.equal(service.isOpen('demo:card'), true, 'restore 之后必须仍然 open');
service.close('demo:card');
assert.equal(service.isOpen('demo:card'), false, 'close 之后必须 isOpen=false');

// ── 7. 宿主偏好：读取路由 + 参考组件自动装载 ─────────────────────────────
await new Promise((resolve) => setTimeout(resolve, 0));
assert.ok(
  fetchCalls.some((call) => call.url === '/ext/dshp-widget-kit/state' && call.method === 'GET'),
  `必须从 GET /ext/dshp-widget-kit/state 读偏好，实际：${JSON.stringify(fetchCalls)}`,
);
const ids = service.list().map((item) => item.id);
assert.ok(ids.includes('dshp-widget-kit:clock'), '参考组件「时钟」必须自动注册');
assert.ok(ids.includes('dshp-widget-kit:registry'), '参考组件「组件诊断」必须自动注册');
assert.ok(ids.includes('dshp-widget-kit:quick'), '参考组件「快速设置」（点击 popover）必须自动注册');
assert.ok(ids.includes('dshp-widget-kit:status'), '参考组件「状态速览」（悬停 popover）必须自动注册');

// 两个参考 popover 的形态：点击 vs 悬停、header / padding 的差异必须真的在描述符里
const referenceWidgets = new Map(service.list().map((item) => [item.id, item]));
assert.equal(referenceWidgets.get('dshp-widget-kit:quick').presentation, 'popover');
assert.equal(referenceWidgets.get('dshp-widget-kit:status').presentation, 'popover');

// ── 8. 渲染一遍：托盘 + 卡片层 ──────────────────────────────────────────
/** 极简渲染：只调用函数组件、不执行 effect、不画像。 */
function render(node) {
  if (node === null || node === undefined || typeof node === 'boolean') return null;
  if (Array.isArray(node)) return node.map(render);
  if (typeof node === 'string' || typeof node === 'number') return node;
  if (typeof node.type === 'function') {
    // class 组件（本插件只有一个：错误边界）必须 new 出来再 render
    if (node.type.prototype !== undefined && node.type.prototype.isReactComponent !== undefined) {
      return render(new node.type(node.props).render());
    }
    return render(node.type(node.props));
  }
  return { type: node.type, props: node.props ?? {}, children: render(node.props?.children ?? null) };
}

/** 深度优先收集所有宿主节点。 */
function collect(node, out = []) {
  if (node === null || node === undefined || typeof node !== 'object') return out;
  if (Array.isArray(node)) {
    for (const item of node) collect(item, out);
    return out;
  }
  if (typeof node.type === 'string') out.push(node);
  collect(node.children, out);
  return out;
}

const trayEntry = registrations.find((entry) => entry.spec.name === 'conversation.session.header.utilities');
const layerEntry = registrations.find((entry) => entry.spec.name === 'shell.overlay');

const trayElement = trayEntry.component({ sessionId: 'session-demo' });
/** 组件注册时我们注入的运行时（自检里用它驱动几何，等价于用户拖拽/菜单操作）。 */
const runtime = trayElement.props.runtime;
assert.equal(typeof runtime.resizeTo, 'function', '托盘应拿到运行时');
const trayTree = render(trayElement);
const trayNodes = collect(trayTree);
const trayButtons = trayNodes.filter(
  (node) => node.type === 'button' && typeof node.props['aria-label'] === 'string',
);
assert.ok(
  trayButtons.some((button) => button.props['aria-label'] === '时钟'),
  `托盘里应有「时钟」图标，实际：${JSON.stringify(trayButtons.map((b) => b.props['aria-label']))}`,
);

service.open('dshp-widget-kit:clock');
const layerTree = render(layerEntry.component({}));
const layerNodes = collect(layerTree);
const cardNode = layerNodes.find((node) => node.props['data-widget'] === 'dshp-widget-kit:clock');
assert.ok(cardNode, '打开时钟后卡片层必须渲染出它的卡片');
assert.equal(cardNode.props.style.width, 320, '卡片宽度必须等于描述符的 defaultSize');
assert.equal(cardNode.props.style.height, 220, '卡片高度必须等于描述符的 defaultSize');
assert.equal(cardNode.props.style.zIndex, 1, '第一张卡片的层内 z-index 应为 1');
assert.equal(cardNode.props.role, 'dialog');
assert.equal(cardNode.props['aria-label'], '时钟');

// 拖拽把手的数量必须是 8（四边 + 四角）
const handles = layerNodes.filter((node) => node.props['data-dir'] !== undefined);
assert.equal(handles.length, 8, `缩放把手必须是 8 个，实际 ${String(handles.length)}`);

// 内容盒事实交出去了：宽 320 − 20 内边距 = 300 → 时钟自己的阈值（compact 300 / wide 420）
assert.equal(cardNode.props['data-size-class'], 'regular', '默认尺寸应对应 regular');

/** 尺寸变化后「怎么呈现」由提供方决定 —— 这里验证框架把新尺寸如实转达。 */
function cardSizeClass() {
  const nodes = collect(render(layerEntry.component({})));
  const card = nodes.find((node) => node.props['data-widget'] === 'dshp-widget-kit:clock');
  assert.ok(card, '卡片应仍在');
  return card.props['data-size-class'];
}
runtime.resizeTo('dshp-widget-kit:clock', { w: 260, h: 200 });
assert.equal(cardSizeClass(), 'compact', '缩到最窄应变成 compact');
runtime.resizeTo('dshp-widget-kit:clock', { w: 460, h: 320 });
assert.equal(cardSizeClass(), 'wide', '拉宽应变成 wide');
runtime.resizeTo('dshp-widget-kit:clock', { w: 320, h: 220 });
assert.equal(cardSizeClass(), 'regular', '回到默认尺寸应回到 regular');

// 卡片菜单里必须有键盘可达的尺寸子菜单项（a11y 路径）
const menuNodes = layerNodes.filter((node) => node.type === 'Menu');
assert.ok(menuNodes.length >= 1, '卡片标题栏必须有 ⋯ 菜单');

disposeCard();

// ── 9. popover：点击展开 vs 悬停展开 ─────────────────────────────────────
const clickPopover = {
  id: 'demo:quick',
  title: '快捷设置',
  icon: 'i',
  presentation: 'popover',
  popover: { trigger: 'click' },
  content: { render: () => null },
};
const hoverPopover = {
  id: 'demo:hover',
  title: '悬停面板',
  icon: 'i',
  presentation: 'popover',
  popover: {
    trigger: 'hover',
    hoverOpenDelayMs: 50,
    hoverCloseDelayMs: 60,
    header: false,
    padding: 0,
    width: 520,
  },
  content: { render: () => null },
};
const disposeClick = service.register(clickPopover);
const disposeHover = service.register(hoverPopover);

// 点击触发：悬停不该打开它
runtime.hoverEnter('demo:quick');
fireTimeouts(50);
assert.equal(service.isOpen('demo:quick'), false, "trigger: 'click' 的组件不该被悬停打开");
service.toggle('demo:quick');
assert.equal(service.isOpen('demo:quick'), true);
assert.equal(runtime.getSnapshot().openOrigin, 'click');

// 单开：悬停展开另一个会收起它
runtime.hoverEnter('demo:hover');
assert.equal(service.isOpen('demo:hover'), false, '悬停展开要留 hoverOpenDelayMs');
fireTimeouts(50);
assert.equal(service.isOpen('demo:hover'), true, '延迟到点必须展开');
assert.equal(service.isOpen('demo:quick'), false, '同一时刻只能展开一个 popover');
assert.equal(runtime.getSnapshot().openOrigin, 'hover');

// 悬停收起：留宽限，宽限内回到面板则撤销
runtime.hoverLeave('demo:hover');
assert.equal(service.isOpen('demo:hover'), true, '收起要留 hoverCloseDelayMs');
runtime.hoverEnter('demo:hover');
fireTimeouts(60);
assert.equal(service.isOpen('demo:hover'), true, '① 宽限内回到面板必须撤销收起');
runtime.hoverLeave('demo:hover');
fireTimeouts(60);
assert.equal(service.isOpen('demo:hover'), false, '② 真正离开后必须收起');

// 悬停面板的形态选项真的落到 DOM 上（任意 web 视图要能贴边）
runtime.hoverEnter('demo:hover');
fireTimeouts(50);
const popoverNodes = collect(render(layerEntry.component({})));
const panel = popoverNodes.find((node) => node.props['data-widget'] === 'demo:hover');
assert.ok(panel, '悬停展开后必须渲染出面板');
assert.equal(panel.props.style.width, 520, 'popover.width 必须落到面板宽度');
assert.equal(panel.props['data-trigger'], 'hover');
assert.equal(panel.props['aria-label'], '悬停面板');
const bodyNode = popoverNodes.find(
  (node) => typeof node.props.className === 'string' && node.props.className.includes('popoverBody'),
);
assert.ok(bodyNode, '面板必须有 body');
assert.equal(bodyNode.props.style.padding, 0, 'popover.padding: 0 必须落到 body（贴边渲染）');
assert.ok(
  !popoverNodes.some(
    (node) => typeof node.props.className === 'string' && node.props.className.includes('popoverHeader'),
  ),
  'popover.header: false 时不得渲染框架标题栏',
);

// 关闭要清掉挂起的悬停定时器：关掉后即使定时器到点也不该再自己蹦出来
runtime.hoverLeave('demo:hover');
service.close('demo:hover');
fireTimeouts(60);
assert.equal(service.isOpen('demo:hover'), false, '关闭后必须清掉待收起的定时器');
runtime.hoverEnter('demo:hover');
fireTimeouts(50);
service.toggle('demo:hover');
assert.equal(service.isOpen('demo:hover'), false, 'toggle 关闭后必须清掉待展开的定时器');
fireTimeouts(50);
assert.equal(service.isOpen('demo:hover'), false, '被取消的展开定时器不得生效');

// 悬停展开的参考面板：header: false + padding: 0（整块归提供方）
runtime.hoverEnter('dshp-widget-kit:status');
fireTimeouts(80);
assert.equal(service.isOpen('dshp-widget-kit:status'), true, '悬停 80ms 后参考面板应展开');
const statusNodes = collect(render(layerEntry.component({})));
const statusPanel = statusNodes.find((node) => node.props['data-widget'] === 'dshp-widget-kit:status');
assert.ok(statusPanel, '状态速览必须渲染出面板');
assert.equal(statusPanel.props['data-trigger'], 'hover');
assert.equal(statusPanel.props.style.width, 260, '状态速览的 width 必须生效');
assert.ok(
  !statusNodes.some(
    (node) =>
      typeof node.props.className === 'string' &&
      node.props.className.includes('popoverHeader') &&
      node.props['data-widget'] !== 'demo:hover',
  ),
  'header: false 的参考面板不得画框架标题栏',
);
const statusBody = statusNodes.find(
  (node) => typeof node.props.className === 'string' && node.props.className.includes('popoverBody'),
);
assert.equal(statusBody.props.style.padding, 0, 'padding: 0 必须落到 body');
runtime.hoverLeave('dshp-widget-kit:status');
fireTimeouts(220);
assert.equal(service.isOpen('dshp-widget-kit:status'), false, '移开后参考面板应收起');

// 点击展开的参考面板：不带悬停行为，点开/再点关
runtime.hoverEnter('dshp-widget-kit:quick');
fireTimeouts(80);
assert.equal(service.isOpen('dshp-widget-kit:quick'), false, '点击展开的参考面板不该被悬停打开');
service.toggle('dshp-widget-kit:quick');
assert.equal(service.isOpen('dshp-widget-kit:quick'), true);
service.toggle('dshp-widget-kit:quick');
assert.equal(service.isOpen('dshp-widget-kit:quick'), false);

disposeClick();
disposeHover();

// ── 10. 本轮修复：刷新恢复 / 最小化折叠 / 位置锁定 / 启用禁用 / 常驻面板 ──
const STORE_KEY = 'dshp-widget-kit:v1';
const persisted = () => JSON.parse(storage.get(STORE_KEY));

/** 记录每个组件最近一次拿到的内容 props（用来断言「交出去的事实」）。 */
const seenProps = new Map();

/** 造一个内容可辨认的卡片组件（内容面会在最小化时留在树上，所以在树里能查到一个探针节点）。 */
function makeCard(id, title) {
  return {
    id,
    title,
    icon: 'i',
    presentation: 'card',
    content: {
      render: (props) => {
        seenProps.set(id, props);
        return { type: 'span', props: { 'data-probe': id } };
      },
    },
    card: { defaultSize: { w: 360, h: 240 } },
  };
}

const cardA = makeCard('demo:persist', '持久卡片');
const cardB = makeCard('demo:lock', '锁定卡片');
const disposeA = service.register(cardA);
const disposeB = service.register(cardB);
// 这一段会注册不少组件，把可见图标上限抬上去 —— 否则断言的对象都被挤进溢出菜单了
void runtime.setPrefs({ maxVisibleIcons: 12 });

/** 按 data-widget 找卡片根节点。 */
function cardNodeOf(id) {
  return collect(render(layerEntry.component({}))).find((node) => node.props['data-widget'] === id);
}

/** 按 data-widget 找 popover 面板节点。 */
function panelNodeOf(id) {
  return collect(render(layerEntry.component({}))).find((node) => node.props['data-widget'] === id);
}

// 10.1 打开后落盘：卡片矩形、层叠顺序、打开状态都要进本机布局（刷新后靠它恢复）
service.open('demo:persist');
runtime.saveNow();
assert.equal(persisted().cards['demo:persist'].open, true, '打开状态必须落盘（否则刷新就没了）');
assert.equal(
  persisted().zOrder.at(-1),
  'demo:persist',
  '层叠顺序必须落盘（末尾 = 最上层，恢复出来才不会所有卡片 z-index 都是 1）',
);
assert.equal(runtime.getSnapshot().zOrder.includes('demo:persist'), true);

// 10.2 首帧拿到会话**不算切会话**：托盘带 sessionId 挂载时不能再把恢复出来的卡片关掉
runtime.setSession('session-one');
assert.equal(runtime.getSession(), 'session-one');
assert.equal(
  service.isOpen('demo:persist'),
  true,
  '首帧会话绑定不得关掉已恢复的卡片（旧实现每次刷新都清空）',
);
// 真的换会话才收起（v1 语义：内容面绑定开启它的会话）
runtime.setSession('session-two');
assert.equal(service.isOpen('demo:persist'), false, '换会话必须收起内容面');
runtime.setSession('session-one');

// 10.3 最小化 = 折叠成标题栏：不是「留一个空窗口」
service.open('demo:lock');
runtime.minimize('demo:lock');
const miniCard = cardNodeOf('demo:lock');
assert.ok(miniCard, '最小化后卡片仍然存在（不是关闭）');
assert.equal(miniCard.props.style.height, 36, '最小化必须折叠成标题栏高度');
assert.equal(miniCard.props['data-minimized'], 'true');
const miniBody = collect(render(layerEntry.component({}))).find(
  (node) => typeof node.props.className === 'string' && node.props.className.includes('cardBody'),
);
assert.ok(
  miniBody.props.className.includes('cardBodyHidden'),
  '最小化时内容区必须隐藏（但留在树上，还原即时且不丢内部状态）',
);
assert.ok(
  collect(render(layerEntry.component({}))).some((node) => node.props['data-probe'] === 'demo:lock'),
  '最小化不得卸载内容面（这是「内容一片空白」的正解：折叠而不是抽空）',
);
const miniProps = seenProps.get('demo:lock');
assert.equal(miniProps.minimized, true, '内容必须知道自己在最小化状态');
assert.ok(
  miniProps.size !== null && miniProps.size.height > 0 && miniProps.size.width > 0,
  `最小化不得把「内容盒尺寸」交成负数（实际 ${JSON.stringify(miniProps.size)}）`,
);
runtime.restore('demo:lock');
const restoredCard = cardNodeOf('demo:lock');
assert.equal(restoredCard.props.style.height, 240, '还原必须回到原来的高度');
assert.equal(restoredCard.props['data-minimized'], 'false');

// 10.4 位置锁定：几何动作全部无效，最小化 / 关闭照常
const rectBefore = runtime.rectOf('demo:lock');
runtime.setLocked('demo:lock', true);
assert.equal(runtime.isLocked('demo:lock'), true);
assert.equal(cardNodeOf('demo:lock').props['data-locked'], 'true');
assert.equal(seenProps.get('demo:lock').locked, true, '锁定状态必须告诉内容提供方');
runtime.nudge('demo:lock', 40, 40);
runtime.nudgeResize('demo:lock', 80, 80);
runtime.resizeTo('demo:lock', { w: 520, h: 400 });
runtime.requestSize('demo:lock', { w: 520, h: 400 });
runtime.center('demo:lock');
assert.deepEqual(runtime.rectOf('demo:lock'), rectBefore, '锁定后移动 / 缩放 / 居中都必须无效');
runtime.beginLive('demo:lock', 'move');
assert.equal(runtime.getLive(), null, '锁定后不得进入拖拽（不会有 live 几何）');

// 锁定的卡片不给几何菜单项（点了没反应是最糟的交互）
const lockedMenu = collect(render(layerEntry.component({}))).find((node) => node.type === 'Menu');
const lockedItems = lockedMenu.props.items.map((item) => item.id);
assert.ok(lockedItems.includes('lock'), '菜单里必须有锁定项');
assert.ok(lockedItems.includes('minimize'), '锁定后仍要能最小化');
assert.ok(
  !lockedItems.some((id) => typeof id === 'string' && id.startsWith('size:')),
  '锁定后不得出现尺寸预设',
);
assert.ok(!lockedItems.includes('center'), '锁定后不得出现居中');
assert.equal(
  lockedMenu.props.items.find((item) => item.id === 'lock').label,
  '解锁位置',
  '已锁定时要把动作说清楚',
);
// 最小化仍然可用
runtime.minimize('demo:lock');
assert.equal(runtime.getSnapshot().layout.cards['demo:lock'].minimized, true, '锁定后仍可最小化');
runtime.restore('demo:lock');
runtime.saveNow();
assert.equal(persisted().cards['demo:lock'].locked, true, '锁定状态必须落盘（刷新后还是锁的）');

runtime.setLocked('demo:lock', false);
runtime.nudge('demo:lock', 16, 0);
assert.equal(runtime.rectOf('demo:lock').x, rectBefore.x + 16, '解锁后必须能再移动');
const freeItems = collect(render(layerEntry.component({})))
  .find((node) => node.type === 'Menu')
  .props.items.map((item) => item.id);
assert.ok(
  freeItems.some((id) => typeof id === 'string' && id.startsWith('size:')),
  '解锁后尺寸预设必须回来',
);

// 10.5 动态启用 / 禁用：图标、卡片、内容面、徽标一并停用，注册记录与布局保留
runtime.setBadge('demo:persist', { text: '3', tone: 'info' });
assert.ok(runtime.getSnapshot().badges['demo:persist'], '前置条件：有徽标');
service.setEnabled('demo:persist', false);
assert.equal(service.isEnabled('demo:persist'), false);
assert.equal(service.isOpen('demo:persist'), false, '禁用必须把已打开的卡片收起来');
assert.equal(runtime.getSnapshot().badges['demo:persist'], undefined, '禁用必须清掉徽标');
assert.equal(
  service.list().some((item) => item.id === 'demo:persist'),
  true,
  '禁用只是停用：注册记录必须留着，否则无法再启用',
);
const trayAfterDisable = collect(render(trayEntry.component({ sessionId: 'session-one' })));
assert.ok(
  !trayAfterDisable.some((node) => node.props['aria-label'] === '持久卡片'),
  '禁用的组件不得出现在托盘',
);
assert.ok(
  !collect(render(layerEntry.component({}))).some((node) => node.props['data-widget'] === 'demo:persist'),
  '禁用的组件不得渲染卡片或面板',
);
runtime.saveNow();
assert.deepEqual(persisted().disabled, ['demo:persist'], '禁用状态必须落盘');
assert.equal(persisted().cards['demo:persist'].open, false, '禁用时卡片要收起来（布局仍保留）');

service.setEnabled('demo:persist', true);
assert.equal(service.isEnabled('demo:persist'), true);
assert.ok(
  collect(render(trayEntry.component({ sessionId: 'session-one' }))).some(
    (node) => node.props['aria-label'] === '持久卡片',
  ),
  '重新启用后图标必须回来',
);
runtime.saveNow();
assert.deepEqual(persisted().disabled, [], '启用后必须从禁用集合里移除');

// 禁用当前展开的面板：面板立刻收起
service.toggle('dshp-widget-kit:quick');
assert.equal(service.isOpen('dshp-widget-kit:quick'), true);
service.setEnabled('dshp-widget-kit:quick', false);
assert.equal(service.isOpen('dshp-widget-kit:quick'), false, '禁用必须收起它的面板');
service.setEnabled('dshp-widget-kit:quick', true);

// 10.6 常驻面板（popover.persistent）：不受外部操作影响，只认明确的关闭意图
const pinnedClick = {
  id: 'demo:pinned',
  title: '常驻面板',
  icon: 'i',
  presentation: 'popover',
  popover: { trigger: 'click', width: 280, persistent: true },
  content: { render: () => null },
};
const pinnedHover = {
  id: 'demo:pinned-hover',
  title: '常驻悬停面板',
  icon: 'i',
  presentation: 'popover',
  popover: { trigger: 'hover', hoverOpenDelayMs: 40, hoverCloseDelayMs: 40, persistent: true },
  content: { render: () => null },
};
const disposePinned = service.register(pinnedClick);
const disposePinnedHover = service.register(pinnedHover);

service.toggle('demo:pinned');
assert.equal(service.isOpen('demo:pinned'), true);
const pinnedPanel = panelNodeOf('demo:pinned');
assert.equal(pinnedPanel.props['data-persistent'], 'true', '常驻标记必须落到面板上');
assert.ok(
  collect(render(layerEntry.component({}))).some(
    (node) => typeof node.props.className === 'string' && node.props.className.includes('popoverPinned'),
  ),
  '常驻面板必须在标题栏标出来',
);
runtime.saveNow();
assert.equal(persisted().popoverId, 'demo:pinned', '展开的面板必须落盘（刷新后原地恢复）');
assert.equal(persisted().popoverOrigin, 'click');
// 明确的关闭意图仍然有效
service.toggle('demo:pinned');
assert.equal(service.isOpen('demo:pinned'), false, '再点一次图标必须能关掉常驻面板');

// 悬停式常驻：指针移开也不收起（这是「持续显示」与普通悬停面板的唯一差别）
runtime.hoverEnter('demo:pinned-hover');
fireTimeouts(40);
assert.equal(service.isOpen('demo:pinned-hover'), true);
runtime.hoverLeave('demo:pinned-hover');
fireTimeouts(40);
assert.equal(service.isOpen('demo:pinned-hover'), true, '常驻面板不得因指针移开而收起');
service.close('demo:pinned-hover');
assert.equal(service.isOpen('demo:pinned-hover'), false, '显式 close 必须能关掉它');

// 对照：非常驻的悬停面板移开就收起（行为不能被这次改动带偏）
runtime.hoverEnter('dshp-widget-kit:status');
fireTimeouts(80);
assert.equal(service.isOpen('dshp-widget-kit:status'), true);
runtime.hoverLeave('dshp-widget-kit:status');
fireTimeouts(220);
assert.equal(service.isOpen('dshp-widget-kit:status'), false, '非常驻面板仍然移开即收起');

// 10.7 托盘图标：DOM 里带 data-tray-id（拖拽换序靠它读中心线），旧的 index 落点已废弃
const finalTrayNodes = collect(render(trayEntry.component({ sessionId: 'session-one' })));
assert.ok(
  finalTrayNodes.some((node) => node.props['data-tray-id'] === 'demo:lock'),
  '托盘图标必须带 data-tray-id（拖拽排序的命中依据）',
);
assert.ok(
  !finalTrayNodes.some((node) => node.props['data-tray-index'] !== undefined),
  '旧的 data-tray-index 落点必须移除（elementFromPoint 方案只会单向可用）',
);

// 10.8 锚点通知：图标真正挂上时要通知一次（刷新后恢复的面板才能重新测量位置），
//      而同一次 commit 里的 detach + attach 不得重复通知（否则 publish ↔ 重渲染 会死循环）
let anchorNotices = 0;
const stopAnchorWatch = runtime.subscribe(() => {
  anchorNotices += 1;
});
const iconOne = { nodeType: 1 };
runtime.setAnchor('demo:lock', iconOne);
assert.equal(runtime.getAnchor('demo:lock'), iconOne, '锚点必须可读回');
const afterAttach = anchorNotices;
assert.ok(afterAttach >= 1, '新锚点挂上必须通知一次');
runtime.setAnchor('demo:lock', null); // React 每次 commit 先 detach
runtime.setAnchor('demo:lock', iconOne); // 再 attach 同一个元素
assert.equal(
  anchorNotices,
  afterAttach,
  '同一次 commit 的 detach + attach 不得再通知（否则 publish ↔ 重渲染 无限循环）',
);
const iconTwo = { nodeType: 1 };
runtime.setAnchor('demo:lock', iconTwo);
assert.equal(anchorNotices, afterAttach + 1, '换了一个新的锚点元素要通知（面板需要重新测量）');
runtime.setAnchor('demo:lock', null);
assert.equal(runtime.getAnchor('demo:lock'), null, '卸载后锚点必须清掉');
stopAnchorWatch();

// 10.9 吸附与防重叠（拖动期间就要看到吸附结果）
/** 两块矩形是否冲突（与 framework 的 geometry.conflicts 同一判定）。 */
function overlaps(a, b, gap) {
  return a.x < b.x + b.w + gap && b.x < a.x + a.w + gap && a.y < b.y + b.h + gap && b.y < a.y + a.h + gap;
}
function insideViewport(rect) {
  return rect.x >= 0 && rect.y >= 0 && rect.x + rect.w <= 1280 && rect.y + rect.h <= 800;
}

const disposeDockA = service.register(makeCard('demo:dock-a', '吸附甲'));
const disposeDockB = service.register(makeCard('demo:dock-b', '吸附乙'));
const disposeDockC = service.register(makeCard('demo:dock-c', '吸附丙'));

// ① 不许拖到屏幕之外：四个越界方向都夹回视口内（整卡可见），靠近边缘则直接吸附贴边
service.close('demo:lock');
assert.deepEqual(runtime.resolveMove('demo:dock-c', { x: -9999, y: -9999, w: 240, h: 140 }), {
  x: 0,
  y: 0,
  w: 240,
  h: 140,
});
assert.deepEqual(
  runtime.resolveMove('demo:dock-c', { x: 5, y: 4, w: 240, h: 140 }),
  { x: 0, y: 0, w: 240, h: 140 },
  '离边缘 5px 以内要吸附贴边',
);
assert.deepEqual(runtime.resolveMove('demo:dock-c', { x: 9999, y: 9999, w: 240, h: 140 }), {
  x: 1280 - 240,
  y: 800 - 140,
  w: 240,
  h: 140,
});

// ② 甲挪到左上角当基准（键盘微调不受磁力影响，落点精确）
service.open('demo:dock-a');
runtime.nudge('demo:dock-a', -9999, -9999);
const dockAnchor = runtime.rectOf('demo:dock-a');
assert.deepEqual(dockAnchor, { x: 0, y: 0, w: 360, h: 240 }, '甲应停在左上角');

// ③ 拖动期间：乙拖到甲右侧 3px、往下 100px → **live 快照里就已经是吸附结果**
service.open('demo:dock-b');
runtime.beginLive('demo:dock-b', 'move');
runtime.setLive(
  'demo:dock-b',
  runtime.resolveMove('demo:dock-b', {
    x: dockAnchor.x + dockAnchor.w + 3,
    y: dockAnchor.y + 100,
    w: 360,
    h: 240,
  }),
);
const liveRect = runtime.getLive().rect;
assert.equal(liveRect.x, dockAnchor.x + dockAnchor.w + 8, '拖动期间就要贴到邻卡右侧（间隔 8px）');
assert.equal(liveRect.y, dockAnchor.y + 100, '纵向差得多就不对齐，跟手走');
runtime.commitLive('demo:dock-b');
assert.deepEqual(runtime.rectOf('demo:dock-b'), liveRect, '松手后落到同一个吸附位置（预览即结果）');
assert.equal(overlaps(liveRect, dockAnchor, 8), false, '吸附结果不得压住邻卡');

// 纵向也靠近时：顺带上对齐
runtime.beginLive('demo:dock-b', 'move');
runtime.setLive(
  'demo:dock-b',
  runtime.resolveMove('demo:dock-b', {
    x: dockAnchor.x + dockAnchor.w + 3,
    y: dockAnchor.y + 2,
    w: 360,
    h: 240,
  }),
);
const alignedRect = runtime.getLive().rect;
assert.equal(alignedRect.y, dockAnchor.y, '另一轴在容差内顺带对齐（上对齐）');
runtime.commitLive('demo:dock-b');

// ④ 再打开丙：它自己会让位，屏幕上三张卡两两不重叠
service.open('demo:dock-c');
assert.equal(service.isOpen('demo:lock'), false, '这一段开始时已收起「锁定卡片」');
const openIds = ['demo:dock-a', 'demo:dock-b', 'demo:dock-c'];
const openRects = openIds.map((id) => runtime.rectOf(id));
for (let i = 0; i < openRects.length; i += 1) {
  assert.ok(insideViewport(openRects[i]), `${openIds[i]} 必须完整留在视口内`);
  for (let j = i + 1; j < openRects.length; j += 1) {
    assert.equal(
      overlaps(openRects[i], openRects[j], 8),
      false,
      `${openIds[i]} 与 ${openIds[j]} 不得叠在一起（新卡自己会让位）`,
    );
  }
}

// ⑤ 键盘：贴着邻卡的卡片必须还能被挪开（关掉磁力），但挪不进别的卡片里（防重叠照旧）
const dockedB = runtime.rectOf('demo:dock-b');
runtime.nudge('demo:dock-b', 8, 0);
assert.deepEqual(runtime.rectOf('demo:dock-b'), { ...dockedB, x: dockedB.x + 8 }, '键盘微调不得被磁力吸住');
runtime.nudge('demo:dock-b', -1000, 0);
const pushed = runtime.rectOf('demo:dock-b');
assert.equal(overlaps(pushed, runtime.rectOf('demo:dock-a'), 8), false, '键盘也不许把卡片压到别人身上');
assert.equal(overlaps(pushed, runtime.rectOf('demo:dock-c'), 8), false);
assert.ok(insideViewport(pushed), '键盘移动同样受视口约束');

// 10.9b 锁定后拖拽入口仍要吃掉 pointerdown（否则会选中页面文字），但不能产生 live 几何
runtime.setLocked('demo:dock-a', true);
const lockedHandlers = cardNodeOf('demo:dock-a');
assert.ok(lockedHandlers, '锁定的卡片仍然渲染');
const headerNode = collect(lockedHandlers).find(
  (node) => typeof node.props.className === 'string' && node.props.className.includes('cardHeader'),
);
assert.ok(headerNode, '卡片必须有标题栏');
assert.equal(
  typeof headerNode.props.onPointerDown,
  'function',
  '锁定后仍要挂 pointerdown（用来 preventDefault）',
);
let prevented = false;
headerNode.props.onPointerDown({
  button: 0,
  pointerId: 1,
  clientX: 10,
  clientY: 10,
  currentTarget: { setPointerCapture: () => {} },
  preventDefault: () => {
    prevented = true;
  },
  stopPropagation: () => {},
});
assert.equal(prevented, true, '锁定后的 pointerdown 必须 preventDefault（否则拖动会选中文字）');
assert.equal(runtime.getLive(), null, '锁定后不得进入拖拽');
runtime.setLocked('demo:dock-a', false);

// 10.9c 手势盾：拖动 / 缩放期间盖一层全视口盾（不可选中 + 指针形状跟随手势）
const shieldOf = () => {
  const node = collect(render(layerEntry.component({}))).find(
    (candidate) =>
      typeof candidate.props.className === 'string' && candidate.props.className.includes('gestureShield'),
  );
  return node ?? null;
};
const cardClassName = (id) => cardNodeOf(id).props.className;

assert.equal(shieldOf(), null, '没有手势时不得有手势盾');
assert.equal(cardClassName('demo:dock-a').includes('cardDragging'), false);

// 拖动
runtime.beginLive('demo:dock-a', 'move');
runtime.setLive('demo:dock-a', { x: 20, y: 20, w: 360, h: 240 });
const moveShield = shieldOf();
assert.ok(moveShield, '拖动期间必须有手势盾（挡住页面文字的选中）');
assert.equal(moveShield.props['data-cursor'], 'moving', '拖动时指针应是抓取态');
assert.equal(cardClassName('demo:dock-a').includes('cardDragging'), true, '拖动期间整卡不可选中');
runtime.cancelLive();
assert.equal(shieldOf(), null, '手势结束后手势盾必须撤掉');
assert.equal(cardClassName('demo:dock-a').includes('cardDragging'), false);

// 缩放（用户反馈的这一条：缩放的指针扫过内容/页面文字也容易选中）
runtime.beginLive('demo:dock-a', 'se');
runtime.setLive('demo:dock-a', { x: 0, y: 0, w: 420, h: 300 });
const resizeShield = shieldOf();
assert.ok(resizeShield, '缩放期间同样必须有手势盾');
assert.equal(resizeShield.props['data-cursor'], 'nwse', '东南缩放时指针应是 nwse-resize');
assert.equal(cardClassName('demo:dock-a').includes('cardDragging'), true, '缩放期间整卡不可选中');
assert.equal(runtime.rectOf('demo:dock-a').w, 360, '手势未提交前不得改动画布几何');
runtime.commitLive('demo:dock-a');
assert.equal(shieldOf(), null);
assert.equal(runtime.rectOf('demo:dock-a').w, 420, '提交后几何才落盘');

// 10.10 锁定按钮的状态（红色锁 / 绿色开锁靠 data-locked 选择器着色）
const lockBtnOf = (id) => {
  const card = collect(render(layerEntry.component({}))).find((node) => node.props['data-widget'] === id);
  assert.ok(card, `${id} 必须渲染出来`);
  const buttons = collect(card).filter((node) => node.type === 'button');
  const button = buttons.find((node) => node.props['data-locked'] !== undefined);
  assert.ok(button, `${id} 的标题栏必须有锁定按钮`);
  return button;
};
assert.equal(lockBtnOf('demo:dock-a').props['data-locked'], 'false', '未锁定时必须是开锁态');
assert.match(lockBtnOf('demo:dock-a').props['aria-label'], /锁定「吸附甲」的位置/);
runtime.setLocked('demo:dock-a', true);
const lockedBtn = lockBtnOf('demo:dock-a');
assert.equal(lockedBtn.props['data-locked'], 'true', '锁定后必须切到红锁态');
assert.equal(lockedBtn.props['aria-pressed'], true);
assert.match(lockedBtn.props['aria-label'], /解锁「吸附甲」的位置/);
runtime.setLocked('demo:dock-a', false);

disposeDockA();
disposeDockB();
disposeDockC();

disposePinned();
disposePinnedHover();
disposeA();
disposeB();
console.log(
  'check-client.mjs ok (loader / 服务 / 槽位 / 校验 / 渲染 / popover / 恢复 / 折叠 / 锁定 / 启停 / 吸附)',
);
