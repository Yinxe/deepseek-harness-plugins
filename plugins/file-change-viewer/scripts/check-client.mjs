/**
 * 无头冒烟测试：不打开浏览器，把 lib/client.js 当 IIFE 跑一遍
 *
 * 覆盖的是「看不见但错了就白屏」的部分——这些恰好在浏览器里最难自查：
 *
 *   1. loader 契约：`__ModuleLoader__.load({ id, factory })` 的 id 与包名一致，
 *      `inject` / `apply` 齐全，`apply` 在只给 slots 的 ctx 下不抛；
 *   2. 槽位注册：`tool.call.toolview` 的 edit / write / str_replace_editor 三个键，
 *      且带 `locale: 'conversation'`（少了它就不会有 `t`，DiffBlock 文案全变 undefined）；
 *   3. 默认展开：`DisclosureRow` 拿到的是 `open === true`——本插件的全部意义；
 *   4. 变更推导：结算结果的 `meta.diffs`、流式半截 JSON、失败调用的错误行三条路径。
 *
 * 断言方式是直接调用组件函数，再遍历它返回的 React 元素树（stub React 的
 * `createElement` 只造数据结构、不渲染），因此不需要 jsdom / react-dom / 浏览器。
 *
 * 这份测试用到的都只是 node 内建模块，零依赖。
 */

import assert from 'node:assert/strict';

// ── React / primitives 的最小替身 ────────────────────────────────────────────
// 组件用 React.createElement 造树；stub 只保留 type/props/children 三个字段，
// 遍历时就能认出「这棵树里有没有 DiffBlock」。

const ReactStub = {
  createElement: (type, props, ...children) => ({ type, props: props ?? {}, children }),
  useState: (initial) => [initial, () => {}],
};

/** 各 primitives 用同名函数占位，遍历时按引用比对。 */
const PStub = {
  DiffBlock: function DiffBlock() {},
  DisclosureRow: function DisclosureRow() {},
  StateDot: function StateDot() {},
  IconEditOutline16: function IconEditOutline16() {},
  JsonBlock: function JsonBlock() {},
  diffTotals: (diffs) => {
    let added = 0;
    let removed = 0;
    for (const diff of diffs) {
      const count = (text) => (text === '' ? 0 : text.replace(/\n$/, '').split('\n').length);
      added += count(diff.newText);
      if (diff.oldText !== null) removed += count(diff.oldText);
    }
    return { added, removed };
  },
};

// ── 浏览器环境替身（bundle 在被 import 的那一刻就会读它们） ──────────────────

let captured = null;
globalThis.window = {
  __ModuleLoader__: {
    load: (mod) => {
      captured = mod;
    },
  },
};
const injectedStyles = [];
globalThis.document = {
  createElement: () => ({
    setAttribute() {},
    remove() {},
    textContent: '',
  }),
  head: {
    appendChild: (node) => injectedStyles.push(node),
  },
};

// ── 断言小工具 ───────────────────────────────────────────────────────────────

let checks = 0;
function ok(label, condition) {
  checks += 1;
  assert.ok(condition, label);
}

/**
 * DisclosureRow 这类 primitives 把内容放在 props 里（`collapsedContent` 摘要、`icon` 图标），
 * 只跟着 `children` 走会整段漏掉，所以这两个具名 prop 也要下钻。
 * 之所以列白名单而不是遍历全部 props：卡片自己的 `diffs` 是纯数据，钻进去只会白跑。
 */
const ELEMENT_PROPS = ['collapsedContent', 'icon'];

/** 深度遍历 createElement 产出的元素树。 */
function walk(node, visit) {
  if (node === null || node === undefined || typeof node !== 'object') return;
  if (Array.isArray(node)) {
    for (const child of node) walk(child, visit);
    return;
  }
  visit(node);
  for (const child of node.children ?? []) walk(child, visit);
  for (const key of ELEMENT_PROPS) walk(node.props?.[key], visit);
}

/** 找一个 primitives 组件节点。 */
function findByType(tree, type) {
  let found = null;
  walk(tree, (node) => {
    if (found === null && node.type === type) found = node;
  });
  return found;
}

/** 找所有带某个 class 的元素（class 用空格拼接）。 */
function findAllByClass(tree, className) {
  const found = [];
  walk(tree, (node) => {
    const cls = node.props?.className;
    if (typeof cls === 'string' && cls.split(' ').includes(className)) found.push(node);
  });
  return found;
}

/** 取一个节点的纯文本（递归拼接字符串子节点）。 */
function textOf(node) {
  if (typeof node === 'string') return node;
  if (node === null || node === undefined || typeof node !== 'object') return '';
  if (Array.isArray(node)) return node.map(textOf).join('');
  return (node.children ?? []).map(textOf).join('');
}

// ── 加载 bundle 并取出注册结果 ───────────────────────────────────────────────

const bundleUrl = new URL('../lib/client.js', import.meta.url);
await import(bundleUrl.href);

ok('bundle 必须调用 __ModuleLoader__.load', captured !== null);
ok('loader id 必须等于包名', captured.id === '@dshp/file-change-viewer');
ok('factory 必须是函数', typeof captured.factory === 'function');

const require = (id) => {
  if (id === 'react') return ReactStub;
  if (id === '@deepseek-ai/dsh-client-ui-primitives') return PStub;
  throw new Error('未预期的 require：' + id);
};

const exportsObj = captured.factory(require);
ok(
  'client 半必须声明 inject（含 slots）',
  Array.isArray(exportsObj.inject) && exportsObj.inject.includes('slots'),
);
ok('client 半必须导出 apply', typeof exportsObj.apply === 'function');

const registrations = [];
let effects = 0;
const slotsStub = {
  inject: (name, callback) => {
    const result = callback();
    // 官方 inject 支持 generator 回调（逐项 yield 注册），这里把它抽干。
    if (result !== null && typeof result === 'object' && typeof result.next === 'function') {
      let step = result.next();
      while (!step.done) step = result.next();
    }
  },
  register: (spec, component) => {
    registrations.push({ spec, component });
    return () => {};
  },
};

exportsObj.apply({
  get: (name) => (name === 'slots' ? slotsStub : undefined),
  effect: (callback) => {
    effects += 1;
    return callback();
  },
});

ok('至少注册了样式 effect + 卡片注册 effect', effects >= 2);
ok('注入了卡片样式表', injectedStyles.length === 1);

const keys = registrations.map((entry) => entry.spec.key);
for (const key of ['edit', 'write', 'str_replace_editor']) {
  ok('必须接管 tool.call.toolview 的 ' + key + ' 键', keys.includes(key));
}
ok(
  '每次注册都要挂 conversation 本地化命名空间',
  registrations.every(
    (entry) => entry.spec.name === 'tool.call.toolview' && entry.spec.locale === 'conversation',
  ),
);
// keyed 槽位同 key 同 priority 直接抛错，派发取 priority 最小者；内置卡片是 0。
ok(
  '必须用比内置卡片更小的 priority 才能接管',
  registrations.every((entry) => typeof entry.spec.priority === 'number' && entry.spec.priority < 0),
);

const FileChangeRow = registrations[0]?.component;
ok('注册项必须是组件', typeof FileChangeRow === 'function');

/** 渲染一次并喂一个假的 t（返回键名，便于断言用的是哪个键）。 */
function render(toolName, block, overrides = {}) {
  return FileChangeRow({
    callId: 'c1',
    toolName,
    block,
    cwd: '/w',
    home: '/home/u',
    openFile: () => {},
    t: (key) => key,
    ...overrides,
  });
}

// ── 场景 1：结算成功，走 meta.diffs（真正落盘的 hunk） ────────────────────────

const settled = render('edit', {
  kind: 'tool-result',
  call: { name: 'edit', argsRaw: '{"file_path":"/w/src/a.ts","old_string":"A","new_string":"B"}' },
  isError: false,
  content: [{ type: 'text', text: 'The file has been updated successfully.' }],
  meta: {
    diffs: [
      { path: '/w/src/a.ts', oldText: 'ctx\nA', newText: 'ctx\nB' },
      { path: '/w/src/b.ts', oldText: null, newText: 'new file' },
    ],
  },
});

const disclosure = findByType(settled, PStub.DisclosureRow);
ok('卡片必须用 DisclosureRow 承载折叠语义', disclosure !== null);
ok('默认必须展开（本插件的全部意义）', disclosure.props.open === true);
ok('标题走 conversation 的 tool.title.edit 键', disclosure.props.title === 'tool.title.edit');
ok('必须可折叠（用户仍能手动收起）', disclosure.props.expandable === true);

const diffBlock = findByType(settled, PStub.DiffBlock);
ok('结算成功必须渲染 DiffBlock', diffBlock !== null);
ok('DiffBlock 收到全部 2 个 hunk', diffBlock.props.diffs.length === 2);
ok('DiffBlock 用宽松的展开上限', diffBlock.props.maxLines === 200);
for (const field of ['copy', 'copied', 'collapseAria', 'collapse']) {
  ok('DiffBlock 文案字段 ' + field + ' 不能缺', typeof diffBlock.props.labels[field] === 'string');
}
for (const field of ['expandAria', 'expand', 'files']) {
  ok('DiffBlock 文案字段 ' + field + ' 必须是函数', typeof diffBlock.props.labels[field] === 'function');
}
ok('统计行用 diffTotals 的结果', textOf(findAllByClass(settled, 'fcv-stat')[0]) === '+3 -2');
ok('角标为「已应用」', textOf(findAllByClass(settled, 'fcv-badge-applied')[0]) === '已应用');
ok('路径按工作区相对化显示', textOf(findAllByClass(settled, 'fcv-path')[0]) === 'src/a.ts');
ok('卡片带 data-state=ok', settled.props['data-state'] === 'ok');

// ── 场景 2：进行中，参数还是半截 JSON（宽容解析 + 实时可见） ──────────────────

const streaming = render('write', {
  name: 'write',
  argsRaw: '{"file_path":"/w/new.md","content":"line1\\nline2',
});
ok('流式生成的卡片 state=running', streaming.props['data-state'] === 'running');
ok('流式生成角标为「生成中」', textOf(findAllByClass(streaming, 'fcv-badge-streaming')[0]) === '生成中');
const streamingDiff = findByType(streaming, PStub.DiffBlock);
ok('半截 JSON 也要推导出变更', streamingDiff !== null);
ok('半截 content 的换行必须还原', streamingDiff.props.diffs[0].newText === 'line1\nline2');
ok('纯新增的 oldText 必须是 null', streamingDiff.props.diffs[0].oldText === null);
ok('整份新增要打「新文件」角标', textOf(findAllByClass(streaming, 'fcv-badge-newfile')[0]) === '新文件');
ok('运行中的卡片同样默认展开', findByType(streaming, PStub.DisclosureRow).props.open === true);

// ── 场景 3：调用参数还没开始流（只有工具名） ─────────────────────────────────

const waiting = render('edit', { name: 'edit', argsRaw: '' });
ok('无参数时不留白：给出等待文案', textOf(findAllByClass(waiting, 'fcv-muted')[0]) === '等待参数…');
ok('无参数时不渲染 DiffBlock', findByType(waiting, PStub.DiffBlock) === null);

// ── 场景 4：失败调用（未落盘，但仍要看到「本来要改什么」） ───────────────────

const failed = render('edit', {
  kind: 'tool-result',
  call: { name: 'edit', argsRaw: '{"file_path":"/w/src/a.ts","old_string":"A","new_string":"B"}' },
  isError: true,
  content: [{ type: 'text', text: 'old_string not found in file\nsecond line' }],
});
ok('失败卡片 state=error', failed.props['data-state'] === 'error');
ok('失败卡片角标为「未应用」', textOf(findAllByClass(failed, 'fcv-badge-rejected')[0]) === '未应用');
ok('失败卡片显示首行错误', textOf(findAllByClass(failed, 'fcv-error')[0]) === 'old_string not found in file');
ok('失败也保留参数推导的变更', findByType(failed, PStub.DiffBlock).props.diffs[0].newText === 'B');

// ── 场景 5：窗口截断（call 为 null、无 meta） ────────────────────────────────

const truncated = render('write', { kind: 'tool-result', call: null, isError: false, content: [] });
ok('截断的调用不抛错，也没有可渲染的变更', findByType(truncated, PStub.DiffBlock) === null);
ok('截断的调用给出等待/兜底文案', findAllByClass(truncated, 'fcv-muted').length === 1);

// ── 场景 6：replace_all 与 inspect 角标 ─────────────────────────────────────

const replaceAll = render('edit', {
  kind: 'tool-result',
  call: {
    name: 'edit',
    argsRaw: '{"file_path":"/w/src/a.ts","old_string":"A","new_string":"B","replace_all":true}',
  },
  isError: false,
  content: [],
  meta: { diffs: [{ path: '/w/src/a.ts', oldText: 'A', newText: 'B' }] },
});
ok('replace_all 要提示「全部替换」', findAllByClass(replaceAll, 'fcv-replaceAll').length === 1);
ok(
  '有 inspect 时提供「查看」入口',
  findAllByClass(render('edit', { name: 'edit', argsRaw: '' }, { inspect: () => {} }), 'fcv-inspect')
    .length === 1,
);
ok(
  '没有 inspect 时不渲染入口',
  findAllByClass(render('edit', { name: 'edit', argsRaw: '' }), 'fcv-inspect').length === 0,
);

console.log('✓ @dshp/file-change-viewer client: ' + checks + ' 项断言全部通过');
