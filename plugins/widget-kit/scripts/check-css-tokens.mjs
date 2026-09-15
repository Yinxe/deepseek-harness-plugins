#!/usr/bin/env node
/**
 * 样式与运行时依赖自检
 *
 * 1. **颜色只走 token**：client 下所有 `*.module.css` 里不允许出现 `#rrggbb` / `rgb()` / `hsl()`
 *    或常见命名色 —— 深浅主题靠 `--dsw-alias-*` 切换，写死色值在另一套主题下必然出错。
 *    这正是 web-style 用 token 覆盖层在做的事：插件写死颜色 = 与它对冲。
 * 2. **类型导入不得进入运行时**：其它插件的产物里不允许出现 `@dshp/widget-kit` 的 require ——
 *    业务插件只加 devDependency 做 `import type`，运行时靠 `ctx.widgets` 服务接缝。
 */

import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const CLIENT_DIR = 'src/client';
const PLUGINS_DIR = '../../plugins';

const LITERAL_COLOR = /#[0-9a-fA-F]{3,8}\b|\brgba?\s*\(|\bhsla?\s*\(/;
// 颜色名后面必须不是 `-` 或字母：`white-space` / `blacklist` 这类属性名不能算色值
const NAMED_COLOR =
  /(?:^|[\s:(,])(?:white|black|red|green|blue|yellow|orange|purple|gray|grey|silver|maroon|navy|teal|olive|lime|aqua|fuchsia)(?![\w-])/;

/** 去掉注释，避免文档里的示例色值被误判。 */
function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name.endsWith('.module.css')) out.push(full);
  }
  return out;
}

const files = walk(CLIENT_DIR);
assert.ok(files.length > 0, '没有找到任何 .module.css');

let declarations = 0;
for (const file of files) {
  const clean = stripComments(readFileSync(file, 'utf8'));
  for (const [index, line] of clean.split('\n').entries()) {
    if (line.includes('--dsw-')) continue;
    if (LITERAL_COLOR.test(line)) {
      assert.fail(`${file}:${String(index + 1)} 出现字面色值（只允许 var(--dsw-*)）：${line.trim()}`);
    }
    if (NAMED_COLOR.test(line)) {
      assert.fail(`${file}:${String(index + 1)} 出现命名色（只允许 var(--dsw-*)）：${line.trim()}`);
    }
    declarations += 1;
  }
}

// 其它插件的产物里不得出现本插件的模块说明符（证明「只 import type」被擦除）
const others = readdirSync(PLUGINS_DIR, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && entry.name !== 'widget-kit')
  .map((entry) => join(PLUGINS_DIR, entry.name, 'lib', 'client.js'));
let scanned = 0;
for (const bundle of others) {
  let text = '';
  try {
    text = readFileSync(bundle, 'utf8');
  } catch {
    continue; // 还没构建过的插件跳过
  }
  scanned += 1;
  assert.ok(
    !text.includes('@dshp/widget-kit'),
    `${bundle} 里出现了 '@dshp/widget-kit'：小组件只能通过 ctx.widgets 服务注册，` +
      '运行时不允许 require 本框架（只加 devDependency 用 import type）',
  );
}

console.log(
  `check-css-tokens.mjs ok (${String(files.length)} 个样式表 / ${String(declarations)} 行声明 / ` +
    `${String(scanned)} 个外部产物)`,
);
