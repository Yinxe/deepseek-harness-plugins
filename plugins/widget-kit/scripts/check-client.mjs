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
 *      卡片外层几何等于运行时给的矩形 —— 这一步能在没有浏览器的情况下抓住渲染期崩溃。
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
        version: '0.1.0',
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
];
const actualServiceKeys = Object.keys(service);
actualServiceKeys.sort();
const expectedServiceKeys = [...EXPECTED_SERVICE_KEYS];
expectedServiceKeys.sort();
assert.deepEqual(actualServiceKeys, expectedServiceKeys, 'widgets 服务的成员必须与 SPEC_KEYS.service 一致');
assert.equal(service.specVersion, 1);
assert.equal(service.frameworkVersion, '0.1.0');

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

disposeClick();
disposeHover();
console.log('check-client.mjs ok (loader / 服务 / 槽位 / 校验 / 渲染 / popover 两种触发)');
