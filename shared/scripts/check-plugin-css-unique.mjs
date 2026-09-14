#!/usr/bin/env node
/**
 * 跨插件类名唯一性检查（仓库级，`pnpm test` 里调一行）
 *
 * 为什么需要它：`shared/tsup.preset.ts` 用 lightningcss 的 `[hash]_[local]` 给 CSS Module 生成类名，
 * 而 `[hash]` **只吃喂进去的 filename**。8 个插件的样式表相对路径完全相同
 * （`src/client/styles.module.css`），所以只要 filename 里不含插件 id，每个插件都会算出**一模一样**
 * 的 `<hash>_<local>`；而 `.card` / `.title` / `.body` / `.stat` / `.desc` 这类局部名在插件之间
 * 天然重名，于是浏览器里**谁后注入谁覆盖**——样式在插件之间互相串味。
 *
 * 真实踩过：token-meter 的 `.stat{display:flex;flex-direction:column;border-radius:12px}` 把
 * file-change-viewer 行头那对 `+N -M` 统计打成了上下两行（还带上了别人的卡片边框），排查时
 * 完全没往构建配置上想。修法是 filename 用 `<包名>/<相对路径>`，这个脚本是那道防线：
 * 扫所有插件的产物，任何**带哈希的类名**出现在两个插件里就算挂。
 *
 * 只看形如 `<hash>_<local>` 的名字：`:global(.line)` 这种**裸类名**是有意的全局名（官方组件自己也用），
 * 跨插件重名是正常的。
 *
 * 需要在 `pnpm -r build` 之后跑（读 `plugins/<name>/lib/client.js` 里内联的 CSS）。
 */

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';

/** 从产物里取出内联的 CSS 文本（esbuild 可能用单引号也可能用双引号）。 */
function inlineCss(bundle) {
  const tag = bundle.indexOf('var tagId =');
  if (tag < 0) return null;
  const end = bundle.lastIndexOf(';', tag);
  const quote = bundle[end - 1];
  if (quote !== "'" && quote !== '"') return null;
  let i = end - 2;
  while (i >= 0 && !(bundle[i] === quote && bundle[i - 1] !== '\\')) i -= 1;
  return bundle.slice(i + 1, end - 1).replace(/\\(['"\\])/g, '$1');
}

const root = 'plugins';
const plugins = readdirSync(root, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .toSorted();

const byClass = new Map();
let scanned = 0;
for (const name of plugins) {
  let bundle;
  try {
    bundle = readFileSync(join(root, name, 'lib', 'client.js'), 'utf8');
  } catch {
    continue;
  }
  const css = inlineCss(bundle);
  if (css === null) continue;
  scanned += 1;
  for (const match of css.matchAll(/\.([A-Za-z_][A-Za-z0-9_-]*)/g)) {
    const cls = match[1];
    // 裸类名 = 有意的全局名（`:global(...)`），不参与唯一性判定。
    if (!cls.includes('_')) continue;
    if (!byClass.has(cls)) byClass.set(cls, new Set());
    byClass.get(cls).add(name);
  }
}

const clashes = [...byClass].filter(([, owners]) => owners.size > 1);
if (clashes.length > 0) {
  console.error(
    `✗ 有 ${clashes.length} 个带哈希的类名同时出现在多个插件里（CSS Module 哈希没有按插件区分）：`,
  );
  for (const [cls, owners] of clashes.slice(0, 20)) {
    console.error(`  ${cls}  ←  ${[...owners].join(', ')}`);
  }
  console.error('  → 检查 shared/tsup.preset.ts 里喂给 lightningcss 的 filename 是否含插件 id。');
  process.exit(1);
}

console.log(`✓ 跨插件类名唯一：扫了 ${scanned} 个产物，${byClass.size} 个带哈希的类名，无重名`);
