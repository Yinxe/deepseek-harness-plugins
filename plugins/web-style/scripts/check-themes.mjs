/**
 * check-themes.mjs —— 主题一致性校验（目录 / client 画廊 meta / 构建产物）。
 *
 * token 单源 src/host/themes（Host 经 GET /themes 下发，client 只存 meta），
 * 本脚本校验 meta 两处同源 + 产物完整：
 *   node scripts/check-themes.mjs        # 需要先 pnpm build（读 lib/host.js 与 lib/client.js）
 *
 * 1. 目录自洽：id 唯一、swatch ≥3 色、label/desc/colorScheme 齐备；
 * 2. client 画廊 meta（src/client/themes.ts）与目录逐项对齐（数量/字段/swatch）；
 * 3. 构建产物：client bundle 含每个 id，且未内联主题 token（静态主题独有的
 *    --dsw-font-markdown-* 不应出现在客户端）；
 * 4. Host 产物：photo:custom 白名单 + 四条同源路由齐全。
 *
 * 新增主题三步：src/host/themes 加一文件 → themes/index.ts 加 import + expand →
 * src/client/themes.ts 加一条 meta（含 swatch），然后 build + 跑本脚本。
 *
 * 原实现：dsh-custom-ui/scripts/check-themes.mjs（JS 版三处校验）。TS 化后
 * Host 白名单已从目录动态派生，故第 2 项校验点从「client 源码文本」升级为
 * 「client 源码 meta 结构 + 产物存在性」。
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = dirname(here);

// 目录随 Host 产物导出（lib/host.js 为纯声明式 ESM，导入无副作用）。
const { THEME_CATALOG, THEME_IDS } = await import('../lib/host.js');

let fail = 0;
const bad = (msg) => {
  fail++;
  console.error('FAIL ' + msg);
};

// ── 1. 目录自洽 ────────────────────────────────────────────────────────
const seen = new Set();
for (const t of THEME_CATALOG) {
  if (seen.has(t.id)) bad('目录 id 重复：' + t.id);
  seen.add(t.id);
  if (!Array.isArray(t.swatch) || t.swatch.length < 3) bad(`目录 ${t.id} swatch 缺失`);
  if (!t.label || !t.desc || (t.colorScheme !== 'dark' && t.colorScheme !== 'light')) {
    bad(`目录 ${t.id} meta 不全`);
  }
  if (!t.tokens || typeof t.tokens !== 'object' || Object.keys(t.tokens).length < 50) {
    bad(`目录 ${t.id} token 过少（应 ≥50 个 --dsw-*）`);
  }
}
console.log(`目录：${THEME_CATALOG.length} 套主题 / ${THEME_IDS.length} 个 id`);

// ── 2. client 画廊 meta 与目录逐项对齐 ─────────────────────────────────
const clientSrc = readFileSync(join(root, 'src', 'client', 'themes.ts'), 'utf8');
const entryRe =
  /\{\s*id:\s*'([^']+)',\s*colorScheme:\s*'(dark|light)',\s*label:\s*'([^']*)',\s*desc:\s*'([^']*)',\s*swatch:\s*\[([^\]]*)\],?\s*\}/g;
const clientEntries = [...clientSrc.matchAll(entryRe)];
console.log(`client 画廊：${clientEntries.length} 条`);
if (clientEntries.length !== THEME_CATALOG.length) {
  bad(`数量不一致：client ${clientEntries.length} vs 目录 ${THEME_CATALOG.length}`);
}
for (const t of THEME_CATALOG) {
  const m = clientEntries.find((x) => x[1] === t.id);
  if (!m) {
    bad('client 缺条目：' + t.id);
    continue;
  }
  if (m[2] !== t.colorScheme) bad(`${t.id} colorScheme 不一致`);
  if (m[3] !== t.label) bad(`${t.id} label 不一致：${m[3]} vs ${t.label}`);
  if (m[4] !== t.desc) bad(`${t.id} desc 不一致：${m[4]} vs ${t.desc}`);
  const sw = m[5].split(',').map((s) => s.trim().replace(/^'|'$/g, ''));
  for (let i = 0; i < 3; i++) {
    if (sw[i] !== t.swatch[i]) bad(`${t.id} swatch[${i}] 不一致：${sw[i]} vs ${t.swatch[i]}`);
  }
}
const clientIds = new Set(clientEntries.map((m) => m[1]));
for (const id of clientIds) {
  if (!THEME_IDS.includes(id)) bad('client 多余条目：' + id);
}

// ── 3. client 构建产物 ────────────────────────────────────────────────
const clientBundle = readFileSync(join(root, 'lib', 'client.js'), 'utf8');
for (const id of THEME_IDS) {
  // esbuild 产物统一双引号，两种引号都认
  if (!clientBundle.includes("'" + id + "'") && !clientBundle.includes('"' + id + '"')) {
    bad('client bundle 缺主题 id（未重新 build？）：' + id);
  }
}
if (clientBundle.includes('--dsw-font-markdown-')) {
  bad('client bundle 内联了静态主题 token（应从 Host /themes 下发）');
}

// ── 4. Host 产物 ─────────────────────────────────────────────────────
const hostBundle = readFileSync(join(root, 'lib', 'host.js'), 'utf8');
for (const path of [
  '/ext/dshp-web-style/state',
  '/ext/dshp-web-style/themes',
  '/ext/dshp-web-style/theme',
  '/ext/dshp-web-style/config',
]) {
  if (!hostBundle.includes(path)) bad('Host 缺路由：' + path);
}
if (!hostBundle.includes('photo:custom')) bad('Host 缺 photo:custom 虚拟主题白名单');
if (!hostBundle.includes('dshp-web-style')) bad('Host 缺 NS（dshp-web-style）注册');

// 配置只认 NS：历史键 / 迁移代码不得回归（AGENT.md §7.3）
for (const symbol of ['migrateYamlNamespaceKey', 'LEGACY_SETTINGS_KEYS', 'storages/', 'dshp-inx-custom-ui']) {
  if (hostBundle.includes(symbol)) {
    bad('Host 产物含已废弃的历史键/迁移代码：' + symbol + '（配置只认 NS，不做迁移）');
  }
}

if (fail > 0) {
  console.error(`\n${fail} 项不一致`);
  process.exit(1);
}
console.log('目录 / client meta / 产物一致 ✓');
