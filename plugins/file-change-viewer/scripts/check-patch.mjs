/**
 * `patch` 工具的纯函数冒烟测试：unified diff 的解析与应用
 *
 * 直接 import `lib/host.js`（Host 产物把 `src/shared/patch.ts` 内联进去了，并额外导出这三个函数），
 * 不启动 DSH、不碰真实文件系统。盯的是「模型给的 patch 文本 → 文件内容」这条最要紧的路径：
 * 多文件、多 hunk、行号漂移、新建文件、末尾无换行、以及**不匹配时必须整体失败、绝不写坏文件**。
 *
 * 只用 node 内建模块，零依赖。
 */

import assert from 'node:assert/strict';

const host = await import('../lib/host.js');
const { parseUnifiedPatch, applyFilePatch, patchTotals } = host;

let checks = 0;
function ok(label, condition) {
  checks += 1;
  assert.ok(condition, label);
}

function throws(label, fn, fragment) {
  checks += 1;
  let error = null;
  try {
    fn();
  } catch (caught) {
    error = caught;
  }
  assert.ok(error !== null, label + '（应当抛错）');
  if (fragment !== undefined) {
    assert.ok(
      String(error.message).includes(fragment),
      label + '：错误消息里应包含 ' + JSON.stringify(fragment) + '，实际是 ' + JSON.stringify(error.message),
    );
  }
}

// 行首标记 + 原文：手写这些前缀太容易数错空格，统一用 helper 拼。
const ctx = (text) => ' ' + text;
const del = (text) => '-' + text;
const add = (text) => '+' + text;

// ── 解析：单文件单 hunk ─────────────────────────────────────────────────────

const simple = [
  '--- a/src/a.ts',
  '+++ b/src/a.ts',
  '@@ -12,3 +12,4 @@ export function a() {',
  ctx('const keep = 1;'),
  del('const old = 2;'),
  add('const mid = 2;'),
  add('const extra = 3;'),
  ctx('return keep;'),
].join('\n');

const parsedSimple = parseUnifiedPatch(simple);
ok('解析出 1 个文件', parsedSimple.length === 1);
ok('路径去掉 a/ b/ 前缀', parsedSimple[0].path === 'src/a.ts' && parsedSimple[0].oldPath === 'src/a.ts');
ok('不是新建也不是删除', parsedSimple[0].create === false && parsedSimple[0].delete === false);
ok('解析出 1 个 hunk', parsedSimple[0].hunks.length === 1);
const hunk0 = parsedSimple[0].hunks[0];
ok(
  'hunk 头行号与条数正确',
  hunk0.oldStart === 12 && hunk0.oldCount === 3 && hunk0.newStart === 12 && hunk0.newCount === 4,
);
ok('hunk 标题保留', hunk0.heading === 'export function a() {');
ok(
  '逐行类型判定正确（1 上下文 + 1 删 + 2 增 + 1 上下文）',
  hunk0.lines.map((line) => line.kind).join(',') === 'ctx,del,add,add,ctx',
);
ok('上下文行内容去掉了行首标记', hunk0.lines[0].text === 'const keep = 1;');
ok(
  'oldText 是旧侧原文（上下文 + 删除行，交给卡片自己跑 LCS）',
  parsedSimple[0].oldText === 'const keep = 1;\nconst old = 2;\nreturn keep;',
);
ok(
  'newText 是新侧原文（上下文 + 新增行）',
  parsedSimple[0].newText === 'const keep = 1;\nconst mid = 2;\nconst extra = 3;\nreturn keep;',
);
ok('增删计数只算真正变化的行', parsedSimple[0].added === 2 && parsedSimple[0].removed === 1);

// ── 解析：多文件 + 省略条数 + CRLF + diff --git 杂音 ─────────────────────────

const multi = [
  'diff --git a/x.ts b/x.ts',
  'index 111..222 100644',
  '--- a/x.ts',
  '+++ b/x.ts',
  '@@ -1 +1 @@',
  del('one'),
  add('ONE'),
  'diff --git a/y.md b/y.md',
  '--- a/y.md',
  '+++ b/y.md',
  '@@ -3,2 +3,2 @@',
  ctx('keep'),
  del('old'),
  add('new'),
].join('\r\n');

const parsedMulti = parseUnifiedPatch(multi);
ok('CRLF 也能解析，且认出 2 个文件', parsedMulti.length === 2);
ok('省略条数时按 1 算', parsedMulti[0].hunks[0].oldCount === 1 && parsedMulti[0].hunks[0].newCount === 1);
ok('第二个文件路径正确', parsedMulti[1].path === 'y.md');
ok(
  '多文件统计各自独立',
  parsedMulti[0].added === 1 &&
    parsedMulti[0].removed === 1 &&
    parsedMulti[1].added === 1 &&
    parsedMulti[1].removed === 1,
);
ok('patchTotals 汇总', patchTotals(parsedMulti).added === 2 && patchTotals(parsedMulti).removed === 2);

// ── 解析：新建文件 / 删除文件 / 无换行标记 ───────────────────────────────────

const created = parseUnifiedPatch(
  ['--- /dev/null', '+++ b/new.txt', '@@ -0,0 +1,2 @@', add('line1'), add('line2')].join('\n'),
);
ok('新建文件：create=true 且没有旧内容', created[0].create === true && created[0].oldPath === null);
ok(
  '新建文件：oldText 为 null，newText 是全部内容',
  created[0].oldText === null && created[0].newText === 'line1\nline2',
);

const deleted = parseUnifiedPatch(
  ['--- a/old.txt', '+++ /dev/null', '@@ -1,2 +0,0 @@', del('a'), del('b')].join('\n'),
);
ok('删除文件能被识别（随后由应用层拒绝）', deleted[0].delete === true && deleted[0].newPath === null);

const noNewline = parseUnifiedPatch(
  [
    '--- a/n.txt',
    '+++ b/n.txt',
    '@@ -1,1 +1,1 @@',
    del('old'),
    '\\ No newline at end of file',
    add('new'),
    '\\ No newline at end of file',
  ].join('\n'),
);
ok(
  '两侧都无换行：标记分别落在旧侧 / 新侧',
  noNewline[0].hunks[0].oldNoNewline === true && noNewline[0].hunks[0].newNoNewline === true,
);

// ── 应用：多处零散修改（这个工具的主要用途） ─────────────────────────────────

const file = '  const a = 1;\n  const b = 2;\n  const c = 3;\n  const d = 4;\n  const e = 5;\n';
const patch = parseUnifiedPatch(
  [
    '--- a/f.ts',
    '+++ b/f.ts',
    '@@ -1,2 +1,2 @@',
    ctx('  const a = 1;'),
    del('  const b = 2;'),
    add('  const b = 22;'),
    '@@ -4,2 +4,2 @@',
    del('  const d = 4;'),
    add('  const d = 44;'),
    ctx('  const e = 5;'),
  ].join('\n'),
);
const applied = applyFilePatch(file, patch[0]);
ok(
  '两处零散修改都落到正确位置',
  applied === '  const a = 1;\n  const b = 22;\n  const c = 3;\n  const d = 44;\n  const e = 5;\n',
);
ok('应用结果保留文件末尾换行', applied.endsWith(';\n'));
ok('统计仍是语义口径（+2 -2，不受上下文行影响）', patch[0].added === 2 && patch[0].removed === 2);

// ── 应用：行号漂移（hunk 头不准，但内容找得到） ──────────────────────────────

const drifted = parseUnifiedPatch(
  ['--- a/g.ts', '+++ b/g.ts', '@@ -40,1 +40,1 @@', del('  const b = 2;'), add('  const b = 222;')].join(
    '\n',
  ),
);
ok(
  '行号写得很离谱也能应用（近邻窗口找不到就全文件取最近匹配）',
  applyFilePatch(file, drifted[0]) ===
    '  const a = 1;\n  const b = 222;\n  const c = 3;\n  const d = 4;\n  const e = 5;\n',
);

// ── 应用：失败必须整体拒绝，且消息能照做 ─────────────────────────────────────

const missing = parseUnifiedPatch(
  ['--- a/h.ts', '+++ b/h.ts', '@@ -1,1 +1,1 @@', del('  const zzz = 9;'), add('  const zzz = 99;')].join(
    '\n',
  ),
);
throws('上下文找不到时抛错', () => applyFilePatch(file, missing[0]), '文件没有被修改');
throws('错误消息点名文件', () => applyFilePatch(file, missing[0]), 'h.ts');
throws('错误消息给出第几个 hunk', () => applyFilePatch(file, missing[0]), '第 1 个 hunk');

throws('对不存在的文件做普通改动：拒绝', () => applyFilePatch(null, patch[0]), '不存在');
throws(
  '「文件不存在」的错误要教怎么新建（--- /dev/null + @@ -0,0 +1,N @@）',
  () => applyFilePatch(null, patch[0]),
  '--- /dev/null',
);
throws('「文件不存在」的错误要提示检查工作目录', () => applyFilePatch(null, patch[0]), '工作目录');
throws(
  '报错里带上解析后的路径（工作目录不对时一眼看出来）',
  () => applyFilePatch(null, patch[0], { displayPath: '/home/u/proj/f.ts' }),
  '/home/u/proj/f.ts',
);
throws('把已存在的文件当新建：拒绝', () => applyFilePatch(file, created[0]), '已经存在');
throws('「已存在却当新建」要教怎么改成普通改动', () => applyFilePatch(file, created[0]), '普通改动形式');
throws(
  '新建文件却带删除行：拒绝',
  () =>
    applyFilePatch(
      null,
      parseUnifiedPatch(
        ['--- /dev/null', '+++ b/bad.txt', '@@ -1,1 +1,1 @@', del('gone'), add('new')].join('\n'),
      )[0],
    ),
  '不存在',
);
throws('删除文件的 patch：明确说不支持', () => applyFilePatch('a\nb\n', deleted[0]), '暂不支持删除文件');

// ── 应用：新建 / 无换行 / 空文件 ────────────────────────────────────────────

ok('新建文件写出内容 + 末尾换行', applyFilePatch(null, created[0]) === 'line1\nline2\n');
ok(
  '带无换行标记的新建文件不补末尾换行',
  applyFilePatch(
    null,
    parseUnifiedPatch(
      ['--- /dev/null', '+++ b/nn.txt', '@@ -0,0 +1,1 @@', add('only'), '\\ No newline at end of file'].join(
        '\n',
      ),
    )[0],
  ) === 'only',
);
ok(
  '空文件里插入两行（oldCount=0）',
  applyFilePatch(
    '',
    parseUnifiedPatch(['--- a/e.txt', '+++ b/e.txt', '@@ -0,0 +1,2 @@', add('a'), add('b')].join('\n'))[0],
  ) === 'a\nb\n',
);
ok(
  '无换行文件加一行后仍无末尾换行',
  applyFilePatch(
    'tail',
    parseUnifiedPatch(
      ['--- a/t.txt', '+++ b/t.txt', '@@ -1,1 +1,2 @@', ctx('tail'), add('more')].join('\n'),
    )[0],
  ) === 'tail\nmore',
);

// ── 解析：垃圾输入 / 结构错误 ───────────────────────────────────────────────

ok('纯文本里没有 hunk → 空数组', parseUnifiedPatch('这只是一段说明文字，没有任何 diff。').length === 0);
ok('空字符串 → 空数组', parseUnifiedPatch('').length === 0);
throws(
  '没有文件头就出现 @@ ：非宽容模式报错',
  () => parseUnifiedPatch(['@@ -1,1 +1,1 @@', del('a'), add('b')].join('\n')),
  '文件头',
);
ok(
  '同一份输入在宽容模式下不报错（流式预览用）',
  parseUnifiedPatch(['@@ -1,1 +1,1 @@', del('a'), add('b')].join('\n'), { tolerant: true }).length === 0,
);
ok(
  '半截 patch 在宽容模式下能预览出已有内容',
  parseUnifiedPatch(
    ['--- a/p.ts', '+++ b/p.ts', '@@ -1,1 +1,1 @@', del('old'), add('new'), '{ "still": "stream'].join('\n'),
    { tolerant: true },
  )[0].newText === 'new',
);
throws(
  'hunk 里出现非法行首标记：非宽容模式报错',
  () => parseUnifiedPatch(['--- a/x.ts', '+++ b/x.ts', '@@ -1,1 +1,1 @@', '?weird'].join('\n')),
  'hunk 里的行',
);

// ── hunkDiffsOf：交给卡片的「一 hunk 一条 + 真实起始行号」 ────────────────────

const twoHunks = parseUnifiedPatch(
  [
    '--- a/m.ts',
    '+++ b/m.ts',
    '@@ -10,2 +10,2 @@',
    ctx('keep1'),
    del('old1'),
    add('new1'),
    '@@ -50,2 +50,3 @@',
    ctx('keep2'),
    add('extra'),
  ].join('\n'),
);
const hunks = host.hunkDiffsOf(twoHunks);
ok('一个文件的多个 hunk → 多条卡片差异（不是压成一条）', hunks.length === 2);
ok('每个 hunk 各自带真实起始行号', hunks[0].startLine === 10 && hunks[1].startLine === 50);
ok(
  '两侧原文都保留上下文行（卡片自己跑 LCS）',
  hunks[0].oldText === 'keep1\nold1' && hunks[0].newText === 'keep1\nnew1',
);
ok(
  '第二个 hunk 的起始行号来自它自己的 @@ 头',
  hunks[1].newText === 'keep2\nextra' && hunks[1].startLine === 50,
);
ok(
  '多文件也按出现顺序摊平',
  host
    .hunkDiffsOf(parsedMulti)
    .map((item) => item.path)
    .join(',') === 'x.ts,y.md',
);

console.log('✓ @dshp/file-change-viewer patch: ' + checks + ' 项断言全部通过');
