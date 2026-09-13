/**
 * 无头冒烟测试：不打开浏览器，把 lib/client.js 当 IIFE 跑一遍
 *
 * 覆盖的是「看不见但错了就白屏」的部分——这些恰好在浏览器里最难自查：
 *
 *   1. loader 契约：`__ModuleLoader__.load({ id, factory })` 的 id 与包名一致，
 *      `inject` / `apply` 齐全，`apply` 在只给 slots 的 ctx 下不抛；
 *   2. 槽位注册：`tool.call.toolview` 的 edit / write / str_replace_editor 三个键，
 *      带 `locale: 'conversation'`（少了它就不会有 `t`，文案全变 undefined），
 *      且带**比内置卡片更小的 priority**（同 key 同优先级在 keyed 槽位上直接抛错）；
 *   3. 默认展开：`DisclosureRow` 拿到的是 `open === true`——本插件的意义之一；
 *   4. 默认高亮视图：`CodeBlock` 拿到正确的 `code` / `lang`（按扩展名）/ 行号 / 复制文案，
 *      以及点切换按钮后 ± 差异视图（`DiffBlock`）仍然可达；
 *   5. 变更推导：结算结果的 `meta.diffs`、流式半截 JSON、失败调用、窗口截断四条路径。
 *
 * 断言方式是直接调用组件函数，再遍历它返回的 React 元素树（stub React 的
 * `createElement` 只造数据结构、不渲染），因此不需要 jsdom / react-dom / 浏览器。
 * `useState` 用一份跨调用保留的槽位实现，好让「点按钮 → 再渲染 → 断言另一个视图」可测。
 *
 * 这份测试用到的都只是 node 内建模块，零依赖。
 */

import assert from 'node:assert/strict';

// ── React / primitives 的最小替身 ────────────────────────────────────────────
// 组件用 React.createElement 造树；stub 只保留 type/props/children 三个字段，
// 遍历时就能认出「这棵树里有没有 CodeBlock / DiffBlock」。

let hookSlots = [];
let hookCursor = 0;

const ReactStub = {
  createElement: (type, props, ...children) => ({ type, props: props ?? {}, children }),
  useState: (initial) => {
    const index = hookCursor;
    hookCursor += 1;
    if (!(index in hookSlots)) hookSlots[index] = initial;
    return [
      hookSlots[index],
      (next) => {
        hookSlots[index] = typeof next === 'function' ? next(hookSlots[index]) : next;
      },
    ];
  },
};

/** 每个场景从干净状态开始（模拟一次全新的组件挂载）。 */
function resetHooks() {
  hookSlots = [];
  hookCursor = 0;
}

/** 各 primitives 用同名函数占位，遍历时按引用比对。 */
const PStub = {
  CodeBlock: function CodeBlock() {},
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
 * DisclosureRow 之类的 primitives 把内容放在 props 里（`collapsedContent` 摘要、`icon`
 * 图标），只跟着 `children` 走会整段漏掉，所以这两个具名 prop 也要下钻。
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

/** 找同一类 primitives 组件的全部节点（高亮视图里 CodeBlock 会有多个）。 */
function findAllByType(tree, type) {
  const found = [];
  walk(tree, (node) => {
    if (node.type === type) found.push(node);
  });
  return found;
}

/** 找一个 primitives 组件节点。 */
function findByType(tree, type) {
  return findAllByType(tree, type)[0] ?? null;
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

/** 整棵树里的字符串子节点拼起来（用于「某段文案有没有出现」这类断言）。 */
function treeText(tree) {
  let text = '';
  walk(tree, (node) => {
    for (const child of node.children ?? []) {
      if (typeof child === 'string') text += child + '\n';
    }
  });
  return text;
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

// ── 渲染辅助：假 t 返回键名，便于断言用的是哪个键 ────────────────────────────

function callRow(toolName, block, overrides = {}) {
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

/** 全新挂载渲染一次。 */
function render(toolName, block, overrides = {}) {
  resetHooks();
  return callRow(toolName, block, overrides);
}

/** 同一个挂载再渲染一次（保留 useState，用于验证交互之后的状态）。 */
function rerender(toolName, block, overrides = {}) {
  hookCursor = 0;
  return callRow(toolName, block, overrides);
}

// ── 场景 1：结算成功，走 meta.diffs（真正落盘的 hunk） ────────────────────────

const settledBlock = {
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
};
const settled = render('edit', settledBlock);

const disclosure = findByType(settled, PStub.DisclosureRow);
ok('卡片必须用 DisclosureRow 承载折叠语义', disclosure !== null);
ok('默认必须展开（本插件的意义之一）', disclosure.props.open === true);
ok('标题走 conversation 的 tool.title.edit 键', disclosure.props.title === 'tool.title.edit');
ok('必须可折叠（用户仍能手动收起）', disclosure.props.expandable === true);

// 默认视图 = 官方 shiki 高亮，且**每个 hunk 只有一个代码块**（增删在同一块里）
const settledCodes = findAllByType(settled, PStub.CodeBlock);
ok('默认视图必须渲染 CodeBlock（真 shiki 高亮）', settledCodes.length === 2);
ok('默认视图不应渲染 DiffBlock', findByType(settled, PStub.DiffBlock) === null);

const [firstCode, insertCode] = settledCodes;
ok(
  '同一代码块内：未变行只出现一次，增删交错；代码原样（不加 - / + 标记）',
  firstCode.props.code === 'ctx\nA\nB',
);
ok('纯新增的 hunk 直接给新内容', insertCode.props.code === 'new file');
ok('语言按扩展名推导（.ts → typescript）', firstCode.props.lang === 'typescript');
ok('每个 hunk 各自按自己的路径推导语言', insertCode.props.lang === 'typescript');
// 行号模式是整行底色的前提：官方只有在这一模式下才把 .line 变成块级元素。
ok(
  '高亮块必须开行号（否则 .line 是行内元素，底色铺不满整行）',
  settledCodes.every((node) => node.props.lineNumbers === true),
);
ok(
  '高亮块必须带复制文案（官方按钮不传就是空标签）',
  settledCodes.every((node) => node.props.copyLabel === 'copy' && node.props.copiedLabel === 'copied'),
);
ok(
  '每个 hunk 的代码块挂自己的类名，用于限定行底色规则',
  settledCodes.every((node, index) => node.props.className === 'fcv-code fcv-lines-c1-' + index),
);

// 行底色：删/增行区间规则，颜色只走 token
const tintStyle = findAllByType(settled, 'style')[0];
ok('必须渲染一条 <style> 承担整卡的行底色', tintStyle !== undefined);
const tintCss = textOf(tintStyle);
ok(
  '删除行按其行号区间上底色，且不占行号',
  tintCss.includes(
    '.fcv-lines-c1-0 code>.line:nth-child(2){counter-increment:none;background:var(--fcv-del-bg)}',
  ),
);
ok(
  '删除行的行号位被清空（留空而不是显示旧行号）',
  tintCss.includes('.fcv-lines-c1-0 code>.line:nth-child(2):before{content:""}'),
);
ok(
  '新增行按其行号区间上底色，且照常占行号',
  tintCss.includes('.fcv-lines-c1-0 code>.line:nth-child(3){background:var(--fcv-add-bg)}') &&
    !tintCss.includes('nth-child(3){counter-increment:none'),
);
ok('第二个 hunk（纯新增）行底色从第 1 行开始', tintCss.includes('.fcv-lines-c1-1 code>.line:nth-child(1)'));
ok('行底色不写死色值（只允许官方 token）', !/#[0-9a-fA-F]{3,8}\b|rgba?\(/.test(tintCss));
ok(
  '旧的「删除块 / 新增块」两段式布局已移除',
  findAllByClass(settled, 'fcv-sideDel').length === 0 &&
    findAllByClass(settled, 'fcv-sideLabel').length === 0,
);
ok('多 hunk 时才显示 hunk 头（路径 + 分 hunk 统计）', findAllByClass(settled, 'fcv-hunkhead').length === 2);
ok('hunk 头显示工作区相对路径', treeText(settled).includes('src/a.ts'));

ok('统计行用 diffTotals 的结果', textOf(findAllByClass(settled, 'fcv-stat')[0]) === '+3 -2');
ok('角标为「已应用」', textOf(findAllByClass(settled, 'fcv-badge-applied')[0]) === '已应用');
ok('路径按工作区相对化显示', textOf(findAllByClass(settled, 'fcv-path')[0]) === 'src/a.ts');
ok('卡片带 data-state=ok', settled.props['data-state'] === 'ok');

// ── 场景 2：切换回 ± 差异视图（官方 DiffBlock 仍然可达） ─────────────────────

const toggle = findAllByClass(settled, 'fcv-viewToggle')[0];
ok('卡片头提供视图切换按钮', toggle !== undefined);
ok('默认视图是高亮，按钮提示切到 ± 差异', textOf(toggle) === '± 差异');

toggle.props.onClick({ stopPropagation() {} });
const diffView = rerender('edit', settledBlock);
const diffBlock = findByType(diffView, PStub.DiffBlock);
ok('切到 ± 差异视图必须渲染 DiffBlock', diffBlock !== null);
ok('DiffBlock 收到全部 2 个 hunk', diffBlock.props.diffs.length === 2);
ok('DiffBlock 用宽松的展开上限', diffBlock.props.maxLines === 200);
for (const field of ['copy', 'copied', 'collapseAria', 'collapse']) {
  ok('DiffBlock 文案字段 ' + field + ' 不能缺', typeof diffBlock.props.labels[field] === 'string');
}
for (const field of ['expandAria', 'expand', 'files']) {
  ok('DiffBlock 文案字段 ' + field + ' 必须是函数', typeof diffBlock.props.labels[field] === 'function');
}
ok('± 视图不再渲染 CodeBlock', findByType(diffView, PStub.CodeBlock) === null);
ok('切到 ± 后按钮提示切回高亮', textOf(findAllByClass(diffView, 'fcv-viewToggle')[0]) === '高亮');

// ── 场景 3：进行中，参数还是半截 JSON（宽容解析 + 实时可见） ──────────────────

const streaming = render('write', {
  name: 'write',
  argsRaw: '{"file_path":"/w/new.md","content":"line1\\nline2',
});
ok('流式生成的卡片 state=running', streaming.props['data-state'] === 'running');
ok('流式生成角标为「生成中」', textOf(findAllByClass(streaming, 'fcv-badge-streaming')[0]) === '生成中');
const streamingCode = findByType(streaming, PStub.CodeBlock);
ok('半截 JSON 也要推导出变更', streamingCode !== null);
ok('半截 content 的换行必须还原', streamingCode.props.code === 'line1\nline2');
ok('纯新增时不生成任何删除行底色规则', !treeText(streaming).includes('--fcv-del-bg'));
ok('新文件按 .md 推导成 markdown', streamingCode.props.lang === 'markdown');
ok('整份新增要打「新文件」角标', textOf(findAllByClass(streaming, 'fcv-badge-newfile')[0]) === '新文件');
ok('运行中的卡片同样默认展开', findByType(streaming, PStub.DisclosureRow).props.open === true);
ok('单 hunk 不渲染 hunk 头（卡片头已有路径与统计）', findAllByClass(streaming, 'fcv-hunkhead').length === 0);

// ── 场景 4：调用参数还没开始流（只有工具名） ─────────────────────────────────

const waiting = render('edit', { name: 'edit', argsRaw: '' });
ok('无参数时不留白：给出等待文案', textOf(findAllByClass(waiting, 'fcv-muted')[0]) === '等待参数…');
ok('无参数时不渲染 CodeBlock', findByType(waiting, PStub.CodeBlock) === null);
ok('无参数时不渲染视图切换按钮', findAllByClass(waiting, 'fcv-viewToggle').length === 0);

// ── 场景 5：失败调用（未落盘，但仍要看到「本来要改什么」） ───────────────────

const failed = render('edit', {
  kind: 'tool-result',
  call: { name: 'edit', argsRaw: '{"file_path":"/w/src/a.ts","old_string":"A","new_string":"B"}' },
  isError: true,
  content: [{ type: 'text', text: 'old_string not found in file\nsecond line' }],
});
ok('失败卡片 state=error', failed.props['data-state'] === 'error');
ok('失败卡片角标为「未应用」', textOf(findAllByClass(failed, 'fcv-badge-rejected')[0]) === '未应用');
ok('失败卡片显示首行错误', textOf(findAllByClass(failed, 'fcv-error')[0]) === 'old_string not found in file');
const failedCodes = findAllByType(failed, PStub.CodeBlock).map((node) => node.props.code);
ok('失败也保留参数推导的变更（同一个块内删增交错）', failedCodes.length === 1 && failedCodes[0] === 'A\nB');

// ── 场景 6：窗口截断（call 为 null、无 meta） ────────────────────────────────

const truncated = render('write', { kind: 'tool-result', call: null, isError: false, content: [] });
ok('截断的调用不抛错，也没有可渲染的变更', findByType(truncated, PStub.CodeBlock) === null);
ok('截断的调用给出等待/兜底文案', findAllByClass(truncated, 'fcv-muted').length === 1);

// ── 场景 7：replace_all / inspect / 语言未知 / 超长封顶 ──────────────────────

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

const unknownLang = render('edit', {
  kind: 'tool-result',
  call: { name: 'edit', argsRaw: '{"file_path":"/w/src/App.vue","old_string":"A","new_string":"B"}' },
  isError: false,
  content: [],
  meta: { diffs: [{ path: '/w/src/App.vue', oldText: 'A', newText: 'B' }] },
});
ok(
  '官方没有语法的扩展名必须传 undefined（退化成纯文本，而不是给错的高亮）',
  findByType(unknownLang, PStub.CodeBlock).props.lang === undefined,
);

const longText = Array.from({ length: 401 }, (_, index) => 'line' + index).join('\n');
const capped = render('write', {
  kind: 'tool-result',
  call: { name: 'write', argsRaw: '{"file_path":"/w/big.ts","content":"x"}' },
  isError: false,
  content: [],
  meta: { diffs: [{ path: '/w/big.ts', oldText: null, newText: longText }] },
});
const cappedCode = findByType(capped, PStub.CodeBlock);
ok(
  '单块超过上限必须封顶（CodeBlock 没有 maxLines，会全量渲染）',
  cappedCode.props.code.split('\n').length === 400,
);
ok('封顶要给出剩余行数与去处提示', treeText(capped).includes('其余 1 行未显示'));

// LCS 交错：中间改一行时，前后未变的行必须只出现一次（上下文行、- 行、+ 行交错）
const interleaved = render('edit', {
  kind: 'tool-result',
  call: { name: 'edit', argsRaw: '{"file_path":"/w/src/b.ts","old_string":"b","new_string":"x"}' },
  isError: false,
  content: [],
  meta: { diffs: [{ path: '/w/src/b.ts', oldText: 'a\nb\nc', newText: 'a\nx\nc' }] },
});
ok(
  '未变的上下文行只出现一次，增删夹在中间',
  findByType(interleaved, PStub.CodeBlock).props.code === 'a\nb\nx\nc',
);

// 连续同类行必须并成一个区间选择器（否则大 diff 会生成海量规则）
const coalesced = render('edit', {
  kind: 'tool-result',
  call: { name: 'edit', argsRaw: '{"file_path":"/w/src/c.ts","old_string":"A\nB","new_string":"C\nD"}' },
  isError: false,
  content: [],
  meta: { diffs: [{ path: '/w/src/c.ts', oldText: 'k\nA\nB\nZ', newText: 'k\nC\nD\nZ' }] },
});
const coalescedCss = textOf(findAllByType(coalesced, 'style')[0]);
ok(
  '连续两行删除并成一个区间选择器，区间整体不占行号',
  coalescedCss.includes(
    'code>.line:nth-child(n+2):nth-child(-n+3){counter-increment:none;background:var(--fcv-del-bg)}',
  ) && coalescedCss.includes('code>.line:nth-child(n+2):nth-child(-n+3):before{content:""}'),
);
ok(
  '新增区间不加 counter-increment:none（行号按新文件连续）',
  !coalescedCss.includes('nth-child(n+4):nth-child(-n+5){counter-increment:none'),
);
ok(
  '连续两行新增并成一个区间选择器',
  coalescedCss.includes('code>.line:nth-child(n+4):nth-child(-n+5){background:var(--fcv-add-bg)}'),
);
ok('区间规则不会把无关行算进去', !coalescedCss.includes('nth-child(1){background'));

console.log('✓ @dshp/file-change-viewer client: ' + checks + ' 项断言全部通过');
