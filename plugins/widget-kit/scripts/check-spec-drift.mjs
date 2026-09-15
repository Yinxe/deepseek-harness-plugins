#!/usr/bin/env node
/**
 * 契约漂移守卫：`spec.d.ts`（给别的插件 import type 的那份）必须与 `src/client/spec.ts` 的实现一致
 *
 * 这么做是因为 `spec.d.ts` 是**手写**的（本仓 tsup 关了 dts，没法自动生成）：任何一个字段只改一边，
 * 使用方拿到的类型就与运行时校验对不上，而 TypeScript 完全不会报错 —— 这个脚本是唯一会自动红的网。
 *
 * 另外比对 `FRAMEWORK_VERSION` 与 `package.json` 的 version（文档与 `minFramework` 都依赖它）。
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { FRAMEWORK_VERSION, SPEC_KEYS, SPEC_VERSION } from '../src/client/spec.ts';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

const dts = readFileSync(join(root, 'spec.d.ts'), 'utf8');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));

/** 去掉块注释与行注释，避免 JSDoc 里的词被当成字段。 */
function stripComments(text) {
  return text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
}

/** 取出一个 interface 的顶层成员名（本文件的成员声明都是单行起始，够用且零依赖）。 */
function interfaceKeys(text, name) {
  const clean = stripComments(text);
  const start = clean.search(new RegExp(`export interface ${name}\\b[^{]*\\{`));
  assert.notEqual(start, -1, `spec.d.ts 里找不到 interface ${name}`);
  const bodyStart = clean.indexOf('{', start) + 1;
  let depth = 1;
  let i = bodyStart;
  while (i < clean.length && depth > 0) {
    const ch = clean[i];
    if (ch === '{') depth += 1;
    else if (ch === '}') depth -= 1;
    i += 1;
  }
  assert.equal(depth, 0, `interface ${name} 大括号不闭合`);
  const body = clean.slice(bodyStart, i - 1);
  const out = [];
  for (const line of body.split('\n')) {
    const m = /^\s{2}(?:readonly\s+)?([A-Za-z_$][\w$]*)\s*\??\s*[:(<]/.exec(line);
    if (m) out.push(m[1]);
  }
  // oxlint 的 no-array-sort 只认「排一个具名数组」，所以先赋值再排
  out.sort();
  return out;
}

const groups = {
  descriptor: 'WidgetDescriptor',
  tray: 'WidgetTrayOptions',
  content: 'WidgetContentOptions',
  card: 'WidgetCardOptions',
  size: 'WidgetSize',
  summary: 'WidgetSummary',
  box: 'WidgetBox',
  badge: 'WidgetBadge',
  badgeContext: 'WidgetBadgeContext',
  loadContext: 'WidgetLoadContext',
  contentProps: 'WidgetContentProps',
  service: 'WidgetsService',
};

let compared = 0;
for (const [group, name] of Object.entries(groups)) {
  const declared = interfaceKeys(dts, name);
  const expected = [...SPEC_KEYS[group]];
  expected.sort();
  assert.deepEqual(
    declared,
    expected,
    `spec.d.ts 的 ${name} 与 src/client/spec.ts 的 SPEC_KEYS.${group} 不一致：\n` +
      `  声明 = ${declared.join(', ')}\n  实现 = ${expected.join(', ')}`,
  );
  compared += declared.length;
}

// spec.d.ts 必须自包含：只允许 import type
for (const line of dts.split('\n')) {
  const m = /^\s*import\b(.*)$/.exec(line);
  if (m && !/^\s*type\b/.test(m[1])) {
    assert.fail(`spec.d.ts 只允许 import type，发现值导入：${line.trim()}`);
  }
}

assert.equal(
  FRAMEWORK_VERSION,
  pkg.version,
  `FRAMEWORK_VERSION(${FRAMEWORK_VERSION}) 必须等于 package.json 的 version(${pkg.version})`,
);
assert.equal(typeof SPEC_VERSION, 'number');
assert.equal(pkg.exports['./spec'].types, './spec.d.ts', 'package.json 必须导出 ./spec 类型入口');

console.log(`check-spec-drift.mjs ok (${String(Object.keys(groups).length)} 组 / ${String(compared)} 字段)`);
