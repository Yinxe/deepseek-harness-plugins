#!/usr/bin/env node
/**
 * 宿主桥自检：legacy id → `@dshp/widget-kit` 的 id 编码必须**合法、稳定、不撞车**。
 *
 * 三件事各自会怎么坏：
 *  - **不合法**：宿主 `register()` 直接抛 `WidgetSpecError`，那张小组件永远弹不出来
 *    （供应商 id 是用户在 settings.yaml 里手写的，什么字符都可能出现）；
 *  - **不稳定**：宿主按 id 存卡片几何，同一供应商两次编码得到不同 id = 每次刷新布局重置；
 *  - **撞车**：两个供应商拿到同一个宿主 id，后注册者覆盖前者，一张卡片凭空消失。
 *
 * 纯函数、不依赖浏览器，所以放进 `pnpm test`。
 */
import assert from 'node:assert/strict';
import {
  STATS_KINDS,
  STATS_TITLES,
  WK_ID_PATTERN,
  WK_OWNER,
  decodeFloatId,
  encodeFloatId,
  floatTitle,
  hash32,
  isFloatId,
  slugifyVendor,
} from '../src/client/widget-bridge.ts';

let groups = 0;
const check = (name, fn) => {
  fn();
  groups += 1;
  console.log('✓ ' + name);
};

/** 会在宿主 `register()` 里被拒的形状，这里提前拦下来。 */
const assertLegal = (wkId, legacy) => {
  assert.match(wkId, WK_ID_PATTERN, `${legacy} → ${wkId} 不是合法的宿主 id`);
  assert.equal(wkId.slice(0, wkId.indexOf(':')), WK_OWNER, `${legacy} → ${wkId} owner 段不对`);
};

/** 故意难看的供应商 id：settings.yaml 里真的可能出现这些写法。 */
const VENDORS = [
  'deepseek',
  'opencode',
  'commandcode',
  'My_Vendor',
  'my-vendor',
  'my.vendor',
  'my vendor',
  'VENDOR-2',
  'a',
  'a:b',
  '额度',
  'vendor/with/slash',
  'x'.repeat(200),
  'Ünïcøde-Name',
  'weird\u0000control',
];

check('1. legacy → 宿主 id：全部合法（owner 段 + 形状）', () => {
  assertLegal(encodeFloatId('peak'), 'peak');
  for (const kind of STATS_KINDS) assertLegal(encodeFloatId('stats:' + kind), 'stats:' + kind);
  for (const v of VENDORS) assertLegal(encodeFloatId('quota:' + v), 'quota:' + v);
  assertLegal(encodeFloatId('online:whatever'), 'online:whatever');
});

check('2. 编码稳定：同一输入永远同一 id（几何持久化的前提）', () => {
  for (const v of VENDORS) {
    const a = encodeFloatId('quota:' + v);
    const b = encodeFloatId('quota:' + v);
    assert.equal(a, b, `quota:${v} 两次编码不一致`);
  }
  assert.equal(encodeFloatId('stats:trend'), encodeFloatId('stats:trend'));
  // 哈希对固定输入固定（换实现就会让所有人的布局重置，必须显式钉住）
  assert.equal(hash32('deepseek'), 'fqfx');
  assert.equal(hash32(''), 'ztnt');
});

check('3. 不撞车：不同供应商 id 得到不同宿主 id', () => {
  const seen = new Map();
  for (const v of VENDORS) {
    const wk = encodeFloatId('quota:' + v);
    assert.equal(seen.has(wk), false, `quota:${v} 与 quota:${seen.get(wk)} 撞成 ${wk}`);
    seen.set(wk, v);
  }
  // 同一个供应商 id 不可能既算 quota 又算别的族
  assert.notEqual(encodeFloatId('quota:deepseek'), encodeFloatId('stats:deepseek'));
});

check('4. 静态族可反解：peak / stats:* 往返一致', () => {
  assert.equal(decodeFloatId(encodeFloatId('peak')), 'peak');
  for (const kind of STATS_KINDS) {
    assert.equal(decodeFloatId(encodeFloatId('stats:' + kind)), 'stats:' + kind);
  }
  // 供应商族故意不反解（slug 是单向的），别的 owner 也不认
  assert.equal(decodeFloatId(encodeFloatId('quota:deepseek')), null);
  assert.equal(decodeFloatId('other-plugin:peak'), null);
  assert.equal(decodeFloatId('peak'), null);
});

check('5. isFloatId：只认本插件的三个族', () => {
  assert.equal(isFloatId('peak'), true);
  assert.equal(isFloatId('stats:cards'), true);
  assert.equal(isFloatId('stats:nope'), false);
  assert.equal(isFloatId('quota:deepseek'), true);
  assert.equal(isFloatId('quota:'), false);
  assert.equal(isFloatId('online:today'), false);
  assert.equal(isFloatId(''), false);
});

check('6. 标题：默认表 + 供应商名提示', () => {
  for (const kind of STATS_KINDS) {
    assert.equal(floatTitle('stats:' + kind), STATS_TITLES[kind]);
  }
  assert.equal(floatTitle('peak'), '峰谷定价');
  assert.equal(floatTitle('quota:deepseek'), '额度 · deepseek');
  assert.equal(floatTitle('quota:deepseek', '额度 · DeepSeek 官方'), '额度 · DeepSeek 官方');
  // 空提示回落到默认表（不能出现没有标题的卡片）
  assert.equal(floatTitle('quota:deepseek', ''), '额度 · deepseek');
  assert.equal(floatTitle('whatever'), '小组件');
});

check('7. slug 永远是宿主认的形状', () => {
  for (const v of VENDORS) {
    const slug = slugifyVendor(v);
    assert.match(slug, /^[a-z0-9-]+$/, `${v} → ${slug} 含非法字符`);
    assert.equal(slug.startsWith('-'), false, `${v} → ${slug} 以 - 开头`);
    assert.equal(slug.endsWith('-'), false, `${v} → ${slug} 以 - 结尾`);
    assert.ok(slug.length <= 20, `${v} → ${slug} 过长`);
  }
});

console.log(`\n宿主桥自检通过：${String(groups)} 组`);
