#!/usr/bin/env node
/**
 * 跨插件集成冒烟：把 **token-meter 的真实 `lib/client.js`** 挂到 **widget-kit 的真实 `lib/client.js`**
 * 发布的 `widgets` 服务上，不打开浏览器。
 *
 * 为什么值得单独一个脚本：类型只能证明「描述符写对了」，证明不了「真的注册进去了」——
 * 而这条链上有四个只能靠跑起来才知道的断点：
 *   1. 服务是**跨模块**拿到的（本插件 bundle 里 `require('react')` 与框架那半是两个工厂），拿到的是不是同一个对象？
 *   2. 顶层 `inject` 有没有误把可选依赖写成硬依赖（那样没装框架时整个插件都不激活）；
 *   3. 描述符是不是真能过框架的 `normalizeDescriptor`（id 形状 / `trayIcon: false` 只对 card 合法 /
 *      `content.render` 必填）；
 *   4. `trayIcon: false` 的自由卡片是不是**提前注册**了（刷新后「还开着」的卡片靠它长回来）。
 *
 * 只读两边已提交的产物（`lib/client.js`），所以先跑 `pnpm build`（或至少构建这两个插件）。
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { encodeFloatId } from '../src/client/widget-bridge.ts';

/* ────────────────────────────── 浏览器环境替身 ────────────────────────────── */

const storage = new Map();
const styleTags = [];

const localStorageStub = {
  getItem: (key) => (storage.has(key) ? storage.get(key) : null),
  setItem: (key, value) => storage.set(key, String(value)),
  removeItem: (key) => storage.delete(key),
};

const documentStub = {
  head: { appendChild: (tag) => styleTags.push(tag) },
  body: {},
  visibilityState: 'visible',
  createElement: () => ({ setAttribute: () => {}, textContent: '' }),
  querySelector: () => null,
  addEventListener: () => {},
  removeEventListener: () => {},
};

const windowStub = {
  innerWidth: 1440,
  innerHeight: 900,
  localStorage: localStorageStub,
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => true,
  setInterval: () => 1,
  clearInterval: () => {},
  setTimeout: () => 1,
  clearTimeout: () => {},
};

globalThis.window = windowStub;
globalThis.document = documentStub;
globalThis.localStorage = localStorageStub;
globalThis.CustomEvent = function CustomEvent(type, init) {
  this.type = type;
  this.detail = init?.detail;
};
globalThis.requestAnimationFrame = (callback) => {
  callback();
  return 1;
};
globalThis.cancelAnimationFrame = () => {};

/** 假 Host：`/state` 回两个供应商，其中一个 id 是故意难看的（会走 slug + 哈希编码）。 */
const VENDORS = [
  { id: 'deepseek', name: 'DeepSeek 官方', type: 'deepseek', params: {}, enabled: true },
  { id: 'My_Vendor', name: '手写供应商', type: 'manual', params: {}, enabled: true },
];
globalThis.fetch = async (url) => ({
  async json() {
    if (String(url).endsWith('/state')) {
      return { ok: true, config: { version: 1, activeVendor: 'deepseek', vendors: VENDORS }, snaps: {} };
    }
    return { ok: true };
  },
});

/* ────────────────────────────── React / primitives 替身 ────────────────────────────── */

/** 任意缺失的 React 成员都给个能调用的空实现：本脚本只跑模块级代码与服务注册，不渲染。 */
const ReactStub = new Proxy(
  {
    createElement: (type, props, ...children) => ({ type, props: { ...props, children } }),
    Fragment: 'Fragment',
    Component: class Component {
      constructor(props) {
        this.props = props;
      }
      setState() {}
    },
    createContext: () => ({ Provider: 'Provider', Consumer: 'Consumer' }),
    forwardRef: (render) => render,
    memo: (component) => component,
    // 组件树是**真的被调用**的（菜单面板），所以 hook 要给出合理初值：
    // useReducer / useState 返回初值、useMemo / useCallback 直接求值、useEffect 不执行。
    useReducer: (reducer, initial) => [typeof initial === 'function' ? initial(reducer) : initial, () => {}],
    useState: (initial) => [typeof initial === 'function' ? initial() : initial, () => {}],
    useRef: (initial) => ({ current: initial }),
    useMemo: (factory) => factory(),
    useCallback: (callback) => callback,
    useEffect: () => {},
    useLayoutEffect: () => {},
  },
  {
    get(target, prop) {
      if (prop in target) return target[prop];
      if (typeof prop === 'symbol') return undefined;
      return () => undefined;
    },
  },
);
ReactStub.Component.prototype.isReactComponent = {};

const jsxRuntimeStub = {
  Fragment: 'Fragment',
  jsx: (type, props) => ({ type, props: props ?? {} }),
  jsxs: (type, props) => ({ type, props: props ?? {} }),
};

/** primitives 替身：任何名字都是一个「组件」；同时提供本插件真的会调的 hook 级函数。 */
const primitivesStub = new Proxy(
  {
    useAnchoredPosition: () => null,
    useDismissOnOutsidePointer: () => {},
  },
  {
    get(target, prop) {
      if (prop in target) return target[prop];
      if (typeof prop === 'symbol') return undefined;
      const name = String(prop);
      return (props) => ({ type: name, props: props ?? {} });
    },
  },
);

const reactDomStub = { createPortal: (node) => node };

const requireStub = (spec) => {
  if (spec === 'react') return ReactStub;
  if (spec === 'react/jsx-runtime') return jsxRuntimeStub;
  if (spec === 'react-dom') return reactDomStub;
  if (spec === '@deepseek-ai/dsh-client-ui-primitives') return primitivesStub;
  throw new Error(`未预期的运行时依赖：${spec}（本仓插件运行时零依赖）`);
};

/**
 * 求值一个 bundle 并取回它的 loader 入口。
 *
 * 两个 bundle 用同一套替身、同一个 `window`，所以第二个 bundle 看到的世界与真机一致
 * （真机上它们也确实在同一页里）。
 *
 * @param relative - 相对本脚本的产物路径。
 * @returns loader 条目（`{ id, factory }`）。
 */
function loadBundle(relative) {
  const url = relative.startsWith('@')
    ? new URL(import.meta.resolve(relative))
    : new URL(relative, import.meta.url);
  let source;
  try {
    source = readFileSync(url, 'utf8');
  } catch {
    throw new Error(`读不到 ${url.pathname} —— 先构建产物：pnpm -r build`);
  }
  let entry = null;
  const loader = { __ModuleLoader__: { load: (value) => (entry = value) } };
  // 用同一个 window 对象，只临时换掉 loader 收集器
  const previous = window.__ModuleLoader__;
  window.__ModuleLoader__ = loader.__ModuleLoader__;
  try {
    // eslint-disable-next-line no-new-func -- 自检脚本就是要把产物当脚本求值
    new Function('window', source)(window);
  } finally {
    window.__ModuleLoader__ = previous;
  }
  assert.ok(entry !== null, `${relative} 没有调用 window.__ModuleLoader__.load`);
  assert.equal(typeof entry.factory, 'function', `${relative} 的 factory 必须是函数`);
  return entry;
}

/**
 * 一个「最小可用」的 client ctx。
 *
 * `inject` 的实现刻意与真 cordis 的语义一致：**服务在册时才调用回调**，并且把回调包在作用域里 ——
 * 这正是本插件不该把 `widgets` 写进顶层 inject 的原因。
 *
 * @param services - 名字 → 服务值（不在册的不给）。
 * @returns 记录器与 ctx。
 */
function makeCtx(services) {
  const record = {
    effects: [],
    injections: [],
    registrations: [],
    errors: [],
    warnings: [],
  };
  const slots = {
    inject: (name, callback) => callback(),
    register: (spec, component) => {
      record.registrations.push({ spec, component });
      return () => {};
    },
  };
  const ctx = {
    get: (name) => (name === 'slots' ? slots : services[name]),
    effect: (callback, label) => {
      const result = callback();
      record.effects.push({ label, dispose: typeof result === 'function' ? result : null });
      return result;
    },
    inject: (deps, callback) => {
      record.injections.push(deps);
      if (!deps.every((name) => services[name] !== undefined)) return undefined;
      const scope = {
        ...ctx,
        get: (name) => services[name],
      };
      return callback(scope);
    },
    interval: () => () => {},
    timeout: () => () => {},
    reflect: { provide: () => () => {} },
  };
  return { ctx, record, slots };
}

/* ────────────────────────────── 1. 起框架（widget-kit） ────────────────────────────── */

const kit = loadBundle('@dshp/widget-kit/client');
assert.equal(kit.id, '@dshp/widget-kit', 'widget-kit loader id 必须等于包名');
const kitExports = kit.factory(requireStub);

const provided = [];
const kitCtx = {
  get: (name) => (name === 'slots' ? { inject: (n, cb) => cb(), register: () => () => {} } : {}),
  effect: (callback) => callback(),
  interval: () => () => {},
  timeout: () => () => {},
  reflect: {
    provide: (name, value) => {
      provided.push({ name, value });
      return () => {};
    },
  },
};
kitExports.apply(kitCtx);
assert.equal(provided.length, 1, 'widget-kit 必须发布恰好一个服务');
assert.equal(provided[0].name, 'widgets');
const service = provided[0].value;

/* ────────────────────────────── 2. 挂上 token-meter ────────────────────────────── */

/** 拦下「进框架」的描述符：类型证明不了的事，这里逐条断言。 */
const descriptors = [];
const rawRegister = service.register.bind(service);
service.register = (descriptor) => {
  descriptors.push(descriptor);
  return rawRegister(descriptor);
};

const meter = loadBundle('../lib/client.js');
assert.equal(meter.id, '@dshp/token-meter', 'token-meter loader id 必须等于包名');
const meterExports = meter.factory(requireStub);

assert.deepEqual(
  meterExports.inject,
  ['slots'],
  '顶层 inject 只能声明不可或缺的服务：widgets 是可选增强，写进顶层会让插件在没装框架时整体不激活',
);

const { ctx: meterCtx, record } = makeCtx({ widgets: service, slots: undefined });
const originalError = console.error;
const originalWarn = console.warn;
console.error = (...args) => record.errors.push(args.map(String).join(' '));
console.warn = (...args) => record.warnings.push(args.map(String).join(' '));
try {
  meterExports.apply(meterCtx);
} finally {
  console.error = originalError;
  console.warn = originalWarn;
}

assert.deepEqual(record.errors, [], '挂载过程不该有 console.error');
assert.deepEqual(
  record.injections,
  [['widgets']],
  '必须用 ctx.inject 等 widgets（可选依赖），而不是顶层 inject',
);

// `ensureLoad()` 是 async 的：等一拍让「读到供应商 → 对齐注册表」跑完
await new Promise((resolve) => setTimeout(resolve, 0));

/* ────────────────────────────── 3. 断言：真的进了框架的注册表 ────────────────────────────── */

const registeredIds = service.list().map((row) => row.id);
const expected = [
  'token-meter:peak',
  'token-meter:stats-cards',
  'token-meter:stats-trend',
  'token-meter:stats-heat',
  'token-meter:stats-donut',
  'token-meter:stats-today',
];
for (const id of expected) {
  assert.ok(registeredIds.includes(id), `静态小组件没注册：${id}（当前：${registeredIds.join(', ')}）`);
}
// 供应商族：id 由 slug + 哈希编码出来，这里只要求「两个供应商各一条、且形状合法」
const quotaIds = registeredIds.filter((id) => id.startsWith('token-meter:quota-'));
assert.equal(quotaIds.length, VENDORS.length, `供应商卡片数量不对：${quotaIds.join(', ')}`);
for (const id of quotaIds) {
  assert.match(id, /^[a-z0-9-]{2,32}:[a-z0-9-]{2,32}$/, `宿主 id 形状不合法：${id}`);
}

const byOwner = service.list().filter((row) => row.owner === 'token-meter');
assert.equal(byOwner.length, registeredIds.length, '所有小组件都必须归到 token-meter 名下');
// 形态：除菜单面板外全是卡片（菜单是活动栏上那个点击展开的小面板）
const popovers = byOwner.filter((row) => row.presentation === 'popover').map((row) => row.id);
assert.deepEqual(popovers, ['token-meter:menu'], `popover 只该有菜单面板，实际：${popovers.join(', ')}`);
assert.equal(
  byOwner.filter((row) => row.presentation === 'card').length,
  expected.length + quotaIds.length,
  '卡片数量应等于「静态小组件 + 供应商卡片」',
);

// 描述符本身：自由卡片全是「不占活动栏 + 有内容 + 有尺寸」，且标题可求值（供应商会改名）
assert.equal(descriptors.length, registeredIds.length, '描述符数量必须与注册表一致');
const cards = descriptors.filter((descriptor) => descriptor.presentation === 'card');
assert.equal(cards.length, expected.length + quotaIds.length, '卡片描述符数量不对');
for (const descriptor of cards) {
  assert.equal(descriptor.trayIcon, false, `${descriptor.id} 必须不占活动栏图标`);
  assert.equal(typeof descriptor.content?.render, 'function', `${descriptor.id} 必须有内容渲染函数`);
  assert.ok(descriptor.card?.defaultSize?.w >= 240, `${descriptor.id} 默认宽度不得小于框架地板`);
  assert.equal(typeof descriptor.title, 'function', `${descriptor.id} 的标题应该是可求值的（供应商改名）`);
}

// 活动栏：本插件只能有**一个**图标（一个所有者 = 一个图标 + 多张自由卡片）
const trayOwners = descriptors.filter((descriptor) => descriptor.trayIcon !== false);
assert.equal(
  trayOwners.length,
  1,
  `必须恰好一个带活动栏图标的描述符，实际 ${String(trayOwners.length)} 个：${trayOwners
    .map((descriptor) => descriptor.id)
    .join(', ')}`,
);
const menu = trayOwners[0];
assert.equal(menu.id, 'token-meter:menu', '活动栏上的必须是本插件的菜单面板');
assert.equal(menu.presentation, 'popover', '菜单是点击展开的小面板，不是卡片');
assert.equal(menu.popover?.trigger, 'click', '菜单应该点开（悬停展开会误触）');
assert.equal(typeof menu.content?.render, 'function', '菜单必须有内容渲染函数');
assert.ok(menu.icon !== undefined && menu.icon !== null, '托盘图标必须有图形（否则活动栏只剩空白）');

// 尺寸：每张卡各自适配（热力图宽而扁、模型分布留高、今日卡小），不是一套尺寸打天下
const sizeOf = (id) => descriptors.find((descriptor) => descriptor.id === id)?.card;
const heat = sizeOf('token-meter:stats-heat');
const donut = sizeOf('token-meter:stats-donut');
const today = sizeOf('token-meter:stats-today');
const trend = sizeOf('token-meter:stats-trend');
assert.notEqual(heat.defaultSize.h, donut.defaultSize.h, '热力图与模型分布不该同高（一个扁一个高）');
assert.ok(heat.defaultSize.h < trend.defaultSize.h, '热力图应该比趋势矮（周 × 日网格不需要高度）');
assert.ok(heat.defaultSize.w > trend.defaultSize.w, '热力图应该比趋势宽（横向格子多）');
assert.ok(today.defaultSize.w < heat.defaultSize.w, '今日卡应该比热力图窄（就一张卡）');
for (const descriptor of cards) {
  assert.ok(
    descriptor.card.minSize.w >= 240 && descriptor.card.minSize.h >= 140,
    `${descriptor.id} 的最小尺寸低于框架地板 240×140，注册会被拒`,
  );
  assert.ok(
    descriptor.card.defaultSize.w >= descriptor.card.minSize.w &&
      descriptor.card.defaultSize.h >= descriptor.card.minSize.h,
    `${descriptor.id} 的初始尺寸小于最小尺寸`,
  );
}

// 标题真的有内容（不是空串、不是 undefined）
const titles = new Map(
  descriptors.map((descriptor) => [
    descriptor.id,
    typeof descriptor.title === 'function' ? descriptor.title() : descriptor.title,
  ]),
);
assert.equal(titles.get('token-meter:peak'), '峰谷定价');
assert.equal(titles.get('token-meter:stats-trend'), '用量趋势');
const quotaTitle = titles.get(quotaIds.find((id) => id.includes('quota-my-vendor')));
assert.equal(quotaTitle, '额度 · 手写供应商', '供应商卡片标题应该用用户配的名字');

// 开关：交给框架的开合动作（几何/持久化在那边），这里只验状态机通
for (const id of ['token-meter:peak', quotaIds[0]]) {
  assert.equal(service.isOpen(id), false, `${id} 初始不该是开的`);
  service.open(id);
  assert.equal(service.isOpen(id), true, `${id} 打开失败（框架多半认为它不在册）`);
  service.close(id);
  assert.equal(service.isOpen(id), false, `${id} 关闭失败`);
}

// 菜单面板：真的把组件树跑一遍，并点它的按钮（菜单 → widgets 外观接口 → 框架）
/** 递归求值函数组件（`{ type: Fn, props }` → `Fn(props)`），得到一个纯元素树。 */
function renderTree(node) {
  if (node === null || node === undefined || typeof node !== 'object') return node;
  if (Array.isArray(node)) return node.map(renderTree);
  if (typeof node.type === 'function') return renderTree(node.type(node.props));
  const children = node.props?.children;
  const rendered =
    children === undefined
      ? undefined
      : Array.isArray(children)
        ? children.map(renderTree)
        : renderTree(children);
  return { ...node, props: { ...node.props, children: rendered } };
}
const menuTree = renderTree(menu.content.render({ frame: 'popover' }));
/** 在元素树里找所有带 `data-open` 的节点（= 面板里的每一行）。 */
function findRows(node, out = []) {
  if (node === null || typeof node !== 'object') return out;
  if (node.props !== undefined && node.props['data-open'] !== undefined) out.push(node);
  const children = node.props?.children;
  if (Array.isArray(children)) for (const child of children) findRows(child, out);
  else if (children !== undefined) findRows(children, out);
  return out;
}
/** 在元素树里找 props.children 恰好包含某段文字的节点（按钮文案）。 */
function findByText(node, text) {
  if (node === null || typeof node !== 'object') return null;
  const children = node.props?.children;
  if (children === text) return node;
  const list = Array.isArray(children) ? children : children === undefined ? [] : [children];
  for (const child of list) {
    const hit = findByText(child, text);
    if (hit !== null) return hit;
  }
  return null;
}
const rowsBefore = findRows(menuTree);
assert.equal(
  rowsBefore.length,
  cards.length,
  `菜单面板应该列出本插件的全部 ${String(cards.length)} 张自由卡片（菜单自己不是一行），实际 ${String(
    rowsBefore.length,
  )} 行`,
);
assert.ok(findByText(menuTree, '全部收起') !== null, '菜单面板必须有「全部收起」');

// 点第一行的「打开」→ 框架里那张卡真的开了（菜单 → widgets.openWidget → ctx.widgets.open）
const firstRow = rowsBefore[0];
const openButton = findByText(firstRow, '打开');
assert.ok(openButton !== null, '每一行都要有开合按钮');
// 菜单行绑定的是**本插件内部的 legacy id**（`peak` / `stats:trend` / `quota:<vid>`），
// 而框架认的是编码后的宿主 id —— 这里用同一个纯函数翻一次，顺便交叉验证编码没漂
const targetLegacy = firstRow.props.children
  .flat()
  .find((child) => child !== null && typeof child === 'object' && typeof child.props?.title === 'string')
  ?.props.title;
const targetId = encodeFloatId(targetLegacy);
assert.ok(
  registeredIds.includes(targetId),
  `菜单行上的 ${String(targetLegacy)} 编码成 ${targetId} 后不在注册表里`,
);
openButton.props.onClick();
assert.equal(service.isOpen(targetId), true, '点菜单里的「打开」应该真的打开那张卡');

// 再渲染一次：那一行应该变成「收起」，点它又收回去（状态是实时的，不靠轮询）
const rowsAfter = findRows(renderTree(menu.content.render({ frame: 'popover' })));
const openedRow = rowsAfter.find((row) => row.props['data-open'] === '1');
assert.ok(openedRow !== undefined, '打开后菜单里应该有一行显示为「已打开」');
findByText(openedRow, '收起').props.onClick();
assert.equal(service.isOpen(targetId), false, '点「收起」应该真的关掉那张卡');

// 注销：插件卸载后必须不留注册（布局记录由框架按设计保留）
record.effects
  .filter((entry) => entry.label === 'dshp-token-meter: widget-kit bridge')
  .forEach((entry) => entry.dispose?.());
assert.equal(service.list().filter((row) => row.owner === 'token-meter').length, 0, '卸载后不该有残留注册');

/* ────────────────────────────── 4. 断言：没有框架时的路径 ────────────────────────────── */

// 重新求值一份 bundle（等价于「这台机器上没装 widget-kit」），只把 slots 给出去
const withoutKit = loadBundle('../lib/client.js').factory(requireStub);
const bare = makeCtx({ slots: undefined });
console.error = (...args) => bare.record.errors.push(args.map(String).join(' '));
try {
  withoutKit.apply(bare.ctx);
} finally {
  console.error = originalError;
}
assert.deepEqual(bare.record.errors, [], '没有 widgets 服务时挂载不该报错（应退化为自带浮窗）');
assert.ok(
  bare.record.registrations.some((entry) => entry.spec.name === 'shell.overlay'),
  '没有框架时仍要注册自带浮层（退化路径不能一起没了）',
);
assert.equal(bare.record.injections[0]?.[0], 'widgets', '没有框架时也在等 widgets（只是永远等不到）');

console.log(
  `宿主桥集成冒烟通过：${String(registeredIds.length)} 个描述符进框架注册表（1 个活动栏菜单 + ${String(
    quotaIds.length,
  )} 个供应商卡片），菜单面板 ${String(rowsBefore.length)} 行可开合，退化路径正常`,
);
