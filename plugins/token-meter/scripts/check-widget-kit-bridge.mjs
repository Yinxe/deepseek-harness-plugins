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
assert.equal(byOwner.length, registeredIds.length, '所有卡片都必须归到 token-meter 名下');
assert.ok(
  byOwner.every((row) => row.presentation === 'card'),
  'token-meter 只注册卡片',
);

// 描述符本身：全部是「不占活动栏的自由卡片」+ 有内容渲染函数
assert.equal(descriptors.length, registeredIds.length, '描述符数量必须与注册表一致');
for (const descriptor of descriptors) {
  assert.equal(descriptor.presentation, 'card', `${descriptor.id} 必须是 card`);
  assert.equal(descriptor.trayIcon, false, `${descriptor.id} 必须不占活动栏图标`);
  assert.equal(typeof descriptor.content?.render, 'function', `${descriptor.id} 必须有内容渲染函数`);
  assert.ok(descriptor.card?.defaultSize?.w >= 240, `${descriptor.id} 默认宽度不得小于框架地板`);
  assert.equal(typeof descriptor.title, 'function', `${descriptor.id} 的标题应该是可求值的（供应商改名）`);
}

// 标题真的有内容（不是空串、不是 undefined）
const titles = new Map(descriptors.map((descriptor) => [descriptor.id, descriptor.title()]));
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
  `宿主桥集成冒烟通过：${String(registeredIds.length)} 个描述符进框架注册表（含 ${String(quotaIds.length)} 个供应商卡片），退化路径正常`,
);
