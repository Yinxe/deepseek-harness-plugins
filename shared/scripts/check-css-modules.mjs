#!/usr/bin/env node
/**
 * CSS Module 类名静态检查（全仓共用，各插件 `pnpm test` 里调一行）
 *
 * 为什么需要它：`shared/types/css-modules.d.ts` 是**宽松声明**（`Record<string, string>`），所以
 * `styles.拼错` 不是编译错误——运行时是 `undefined`，React 静默丢掉 className，页面只是「样式没了」。
 * 类型系统在这里帮不上忙（见 docs/typescript.md 的取舍说明），这个脚本就是那道网。
 *
 * 检查三件事：
 *
 *   1. **用了但没定义**（error）：`styles.foo` 在对应的 `*.module.css` 里找不到 `.foo`。
 *      这是真正的 bug，退出码 1。
 *   2. **定义了但没用到**（warn）：CSS 里有 `.bar`，源码里没有任何 `styles.bar`。通常是改名漏删
 *      或复制粘贴的残留；也可能是有意留给后续用的词汇表，所以只提示不拦。
 *   3. **风格**：类名必须 camelCase（`.rowText` 而不是 `.row-text`）。习惯写法统一，
 *      且与 `styles.rowText` 的调用点一致。
 *
 * 判定用的是**正则**而不是 CSS 解析器：这里只需要「文件里有没有 `.name` 选择器」，引入
 * postcss/lightningcss 只为这件事不划算（构建期已经用 lightningcss 编译过了）。
 *
 * 用法：`node ../../shared/scripts/check-css-modules.mjs src/client`（目录可给多个，缺省 `src`）。
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import process from 'node:process';

/** 要扫描的源码扩展名。 */
const CODE_EXT = /\.(?:ts|tsx)$/;
/** CSS Module 文件。 */
const CSS_MODULE = /\.module\.css$/;

/** 递归列出目录下的文件（跳过 node_modules / lib / dist）。 */
function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'lib' || entry.name === 'dist') continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

/**
 * 从一份 `*.module.css` 里取出所有局部类名。
 *
 * 只看 `.name` 形式（选择器、以及 `.a .b` / `.a:hover` 这类复合里的每一段）。
 * `:global(...)` 里的名字是**全局**的，不属于模块映射，跳过。
 */
function localNames(css) {
  const names = new Set();
  const source = css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/:global\([^)]*\)/g, '');
  for (const match of source.matchAll(/\.([A-Za-z_][A-Za-z0-9_-]*)/g)) {
    names.add(match[1]);
  }
  return names;
}

/**
 * 把「不是代码」的部分原地抹成空格（保留换行，行号与列号不变）。
 *
 * 抹掉注释与 `import` 语句是必须的：`import styles from './styles.module.css'` 与注释里提到
 * 的 `styles.ts` 都会被「`styles.x` 用法」的正则当成引用，造出一堆假报错。行注释的识别要求
 * `//` 前面不是 `:`，免得把 `https://…` 里的双斜杠当注释起点。
 */
function blank(code) {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
    .replace(/(^|[^:])\/\/[^\n]*/g, (m, head) => head + m.slice(head.length).replace(/[^\n]/g, ' '))
    .replace(/\bimport\b[^;\n]*?from\s*['"][^'"]*['"];?/g, (m) => m.replace(/[^\n]/g, ' '));
}

/**
 * 从一份源码里找出「import 进来的 CSS Module 标识符 → 用到它的类名」。
 *
 * 支持 `import styles from './x.module.css'`，也支持换个名字（`import css from ...`）。
 */
function usages(code) {
  const bindings = new Map();
  for (const match of code.matchAll(/import\s+([A-Za-z_$][\w$]*)\s+from\s+['"]([^'"]+\.module\.css)['"]/g)) {
    bindings.set(match[1], match[2]);
  }
  const found = [];
  const source = blank(code);
  for (const [ident, spec] of bindings) {
    const re = new RegExp('\\b' + ident + '\\.([A-Za-z_$][\\w$]*)', 'g');
    for (const match of source.matchAll(re)) {
      found.push({ ident, spec, name: match[1], line: source.slice(0, match.index).split('\n').length });
    }
  }
  return found;
}

const dirs = process.argv.slice(2);
const roots = dirs.length > 0 ? dirs : ['src'];
const files = roots.flatMap((dir) => walk(dir));

/** 全目录的类名并集：`import styles from './styles.module.css'` 的映射是**文件级**的， */
/** 但一个目录里只有一个样式表是常态，用并集判定能容忍「多个 module.css 互相引用类名」。 */
const defined = new Set();
const perFile = new Map();
const cssFiles = files.filter((file) => CSS_MODULE.test(file));
for (const file of cssFiles) {
  const names = localNames(readFileSync(file, 'utf8'));
  perFile.set(file, names);
  for (const name of names) defined.add(name);
}

let errors = 0;
let warnings = 0;
let checked = 0;
const used = new Set();

for (const file of files) {
  if (!CODE_EXT.test(file)) continue;
  for (const use of usages(readFileSync(file, 'utf8'))) {
    checked += 1;
    used.add(use.name);
    if (perFile.has(use.spec)) {
      const local = perFile.get(use.spec);
      if (!local.has(use.name)) {
        console.error(
          `✗ ${relative('.', file)}:${use.line} 用了 ${use.ident}.${use.name}，但 ${use.spec} 里没有 .${use.name}`,
        );
        errors += 1;
      }
    } else if (!defined.has(use.name)) {
      console.error(
        `✗ ${relative('.', file)}:${use.line} 用了 ${use.ident}.${use.name}，但没有任何 module.css 定义它`,
      );
      errors += 1;
    }
    if (use.name.includes('-')) {
      console.error(
        `✗ ${relative('.', file)}:${use.line} 类名 ${use.name} 不是 camelCase（CSS Module 里写 .${use.name.replace(/-([a-z])/g, (_, c) => c.toUpperCase())}）`,
      );
      errors += 1;
    }
  }
}

for (const [file, names] of perFile) {
  for (const name of names) {
    if (!used.has(name)) {
      console.warn(`· ${relative('.', file)} 定义了 .${name}，但源码里没有用到`);
      warnings += 1;
    }
  }
}

console.log(
  `css-modules: ${cssFiles.length} 个样式表 / ${defined.size} 个类名，源码里 ${checked} 处引用，` +
    `未定义 ${errors}，未使用 ${warnings}`,
);
process.exit(errors > 0 ? 1 : 0);
