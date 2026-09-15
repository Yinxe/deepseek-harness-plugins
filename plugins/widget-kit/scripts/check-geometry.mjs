#!/usr/bin/env node
/**
 * 几何数学自检（纯函数，Node 直接 import TS 源码）
 *
 * 覆盖：夹紧（左右上下四个越界方向）、默认层叠落点、内容盒换算、尺寸档阈值、
 * 八向缩放（对边固定、min/max、北向不越过 y=0）、z 序。
 *
 * 为什么用 `import '../src/client/geometry.ts'`：Node 24 的 TS 类型擦除可以直跑 `.ts`
 * （本仓 CI 与 .nvmrc 都是 24）。这也要求 geometry.ts / spec.ts **自包含**：只允许 `import type`，
 * 值导入的 `./x.js` 在 Node 里解析不到。三处与 spec.ts 重复的常量在这里断言相等。
 */

import assert from 'node:assert/strict';
import {
  CASCADE_STEP,
  CONTENT_PADDING,
  MIN_VISIBLE_TITLE_BAR,
  RESIZE_DIRS,
  TITLE_BAR_HEIGHT,
  applyResize,
  bringToFront,
  clampRect,
  clampSize,
  contentBox,
  defaultRect,
  isSameRect,
  maxSizeFor,
  sizeClassOf,
} from '../src/client/geometry.ts';
import { SPEC_DEFAULTS } from '../src/client/spec.ts';

const VP = { width: 1280, height: 800 };
const CONSTRAINTS = { min: { w: 240, h: 140 }, max: null };

let checks = 0;
function check(label, fn) {
  fn();
  checks += 1;
  void label;
}

// ── 与 spec.ts 的常量不漂移 ──────────────────────────────────────────────
check('constants', () => {
  assert.equal(TITLE_BAR_HEIGHT, SPEC_DEFAULTS.titleBarHeight, 'titleBarHeight 漂移');
  assert.equal(CONTENT_PADDING, SPEC_DEFAULTS.contentPadding, 'contentPadding 漂移');
  assert.equal(MIN_VISIBLE_TITLE_BAR, SPEC_DEFAULTS.minVisibleTitleBar, 'minVisibleTitleBar 漂移');
  assert.equal(CASCADE_STEP, SPEC_DEFAULTS.cascadeStep, 'cascadeStep 漂移');
});

// ── clampSize ───────────────────────────────────────────────────────────
check('clampSize', () => {
  assert.deepEqual(clampSize({ w: 100, h: 100 }, CONSTRAINTS, VP), { w: 240, h: 140 });
  assert.deepEqual(clampSize({ w: 99999, h: 99999 }, CONSTRAINTS, VP), { w: 1280, h: 800 });
  assert.deepEqual(clampSize({ w: 500, h: 400 }, { min: { w: 240, h: 140 }, max: { w: 480, h: 360 } }, VP), {
    w: 480,
    h: 360,
  });
  assert.deepEqual(clampSize({ w: 360.4, h: 240.6 }, CONSTRAINTS, VP), { w: 360, h: 241 });
});

// ── clampRect ───────────────────────────────────────────────────────────
check('clampRect edges', () => {
  // 右越界：左边缘最多到 vw - 48
  assert.equal(clampRect({ x: 5000, y: 100, w: 360, h: 240 }, CONSTRAINTS, VP).x, 1280 - 48);
  // 左越界：至少留 48px，x >= 48 - w
  assert.equal(clampRect({ x: -5000, y: 100, w: 360, h: 240 }, CONSTRAINTS, VP).x, 48 - 360);
  // 上越界：标题栏整条可见 → y >= 0
  assert.equal(clampRect({ x: 100, y: -80, w: 360, h: 240 }, CONSTRAINTS, VP).y, 0);
  // 下越界：标题栏底边最多贴到视口底部 → y <= vh - 36
  assert.equal(clampRect({ x: 100, y: 5000, w: 360, h: 240 }, CONSTRAINTS, VP).y, 800 - TITLE_BAR_HEIGHT);
  // 尺寸也一起夹
  const r = clampRect({ x: 0, y: 0, w: 10, h: 10 }, CONSTRAINTS, VP);
  assert.deepEqual({ w: r.w, h: r.h }, { w: 240, h: 140 });
});

check('maxSizeFor', () => {
  assert.deepEqual(maxSizeFor({ min: { w: 240, h: 140 }, max: { w: 5000, h: 5000 } }, VP), {
    w: 1280,
    h: 800,
  });
  assert.deepEqual(maxSizeFor({ min: { w: 240, h: 140 }, max: { w: 100, h: 100 } }, VP), {
    w: 240,
    h: 140,
  });
});

// ── defaultRect ─────────────────────────────────────────────────────────
check('defaultRect', () => {
  const first = defaultRect(0, { w: 360, h: 240 }, CONSTRAINTS, VP);
  assert.deepEqual(first, { x: 1280 - 360 - 24, y: 88, w: 360, h: 240 });
  const second = defaultRect(1, { w: 360, h: 240 }, CONSTRAINTS, VP);
  assert.equal(second.y - first.y, CASCADE_STEP);
  assert.equal(first.x - second.x, CASCADE_STEP);
  // 回绕：第 6 张与第 0 张同位
  assert.deepEqual(defaultRect(6, { w: 360, h: 240 }, CONSTRAINTS, VP), first);
  // 小视口里被夹回可见区
  const tiny = defaultRect(0, { w: 360, h: 240 }, CONSTRAINTS, { width: 320, height: 200 });
  assert.ok(tiny.y >= 0 && tiny.y <= 200 - TITLE_BAR_HEIGHT);
});

// ── contentBox ──────────────────────────────────────────────────────────
check('contentBox', () => {
  assert.deepEqual(contentBox({ x: 0, y: 0, w: 360, h: 240 }), {
    width: 360 - CONTENT_PADDING * 2,
    height: 240 - TITLE_BAR_HEIGHT - CONTENT_PADDING * 2,
  });
  assert.deepEqual(contentBox({ x: 0, y: 0, w: 4, h: 4 }), { width: 0, height: 0 });
});

// ── sizeClassOf ─────────────────────────────────────────────────────────
check('sizeClassOf', () => {
  const bp = SPEC_DEFAULTS.breakpoints;
  assert.equal(sizeClassOf(bp.compact - 1, bp), 'compact');
  assert.equal(sizeClassOf(bp.compact, bp), 'regular');
  assert.equal(sizeClassOf(bp.wide - 1, bp), 'regular');
  assert.equal(sizeClassOf(bp.wide, bp), 'wide');
  assert.equal(sizeClassOf(Number.NaN, bp), 'regular');
});

// ── applyResize ─────────────────────────────────────────────────────────
check('applyResize single edges', () => {
  const base = { x: 400, y: 300, w: 360, h: 240 };
  const east = applyResize(base, 'e', 50, 0, CONSTRAINTS, VP);
  assert.deepEqual(east, { x: 400, y: 300, w: 410, h: 240 });
  const west = applyResize(base, 'w', 50, 0, CONSTRAINTS, VP);
  assert.deepEqual(west, { x: 450, y: 300, w: 310, h: 240 });
  assert.equal(west.x + west.w, base.x + base.w, '西向缩放右边缘必须固定');
  const south = applyResize(base, 's', 0, 40, CONSTRAINTS, VP);
  assert.deepEqual(south, { x: 400, y: 300, w: 360, h: 280 });
  const north = applyResize(base, 'n', 0, 40, CONSTRAINTS, VP);
  assert.deepEqual(north, { x: 400, y: 340, w: 360, h: 200 });
  assert.equal(north.y + north.h, base.y + base.h, '北向缩放底边缘必须固定');
});

check('applyResize min/max', () => {
  const base = { x: 400, y: 300, w: 360, h: 240 };
  const tiny = applyResize(base, 'e', -100000, 0, CONSTRAINTS, VP);
  assert.equal(tiny.w, CONSTRAINTS.min.w);
  assert.equal(tiny.x, 400, '被 min 挡住时左边缘不动');
  const huge = applyResize(base, 'e', 100000, 0, CONSTRAINTS, VP);
  assert.equal(huge.w, VP.width - base.x, '东向不越过视口右缘');
  const capped = applyResize(base, 'e', 100000, 0, { min: { w: 240, h: 140 }, max: { w: 380, h: 300 } }, VP);
  assert.equal(capped.w, 380);
});

check('applyResize north never hides title bar', () => {
  const atTop = { x: 400, y: 0, w: 360, h: 240 };
  const grown = applyResize(atTop, 'n', 0, -500, CONSTRAINTS, VP);
  assert.equal(grown.y, 0, '顶边不得越过 0');
  assert.equal(grown.h, 240, '被顶边挡住时高度不再增长');
});

check('applyResize corners keep opposite corner fixed', () => {
  const base = { x: 400, y: 300, w: 360, h: 240 };
  const se = applyResize(base, 'se', 30, 20, CONSTRAINTS, VP);
  assert.equal(se.x, base.x);
  assert.equal(se.y, base.y);
  assert.deepEqual({ w: se.w, h: se.h }, { w: 390, h: 260 });
  const nw = applyResize(base, 'nw', 30, 20, CONSTRAINTS, VP);
  assert.equal(nw.x + nw.w, base.x + base.w, '西北缩放右下角固定（x）');
  assert.equal(nw.y + nw.h, base.y + base.h, '西北缩放右下角固定（y）');
  const ne = applyResize(base, 'ne', 30, 20, CONSTRAINTS, VP);
  assert.equal(ne.x, base.x);
  assert.equal(ne.y + ne.h, base.y + base.h);
});

check('applyResize is stable and clamped for every direction', () => {
  const base = { x: 10, y: 5, w: 360, h: 240 };
  for (const dir of RESIZE_DIRS) {
    const out = applyResize(base, dir, -9999, -9999, CONSTRAINTS, VP);
    assert.ok(out.w >= CONSTRAINTS.min.w, `${dir}: 宽度不得小于 min`);
    assert.ok(out.h >= CONSTRAINTS.min.h, `${dir}: 高度不得小于 min`);
    assert.ok(out.y >= 0, `${dir}: 标题栏必须可见`);
    assert.ok(out.x >= MIN_VISIBLE_TITLE_BAR - out.w, `${dir}: 横向必须留 48px`);
    assert.ok(out.x <= VP.width - MIN_VISIBLE_TITLE_BAR, `${dir}: 横向必须留 48px（右）`);
  }
});

// ── z 序 ────────────────────────────────────────────────────────────────
check('bringToFront', () => {
  const order = ['a', 'b', 'c'];
  assert.deepEqual(bringToFront(order, 'a'), ['b', 'c', 'a']);
  assert.equal(bringToFront(order, 'c'), order, '已在最上：必须返回同一引用');
  assert.deepEqual(bringToFront([], 'x'), ['x'], '空序列也能加进去');
  assert.deepEqual(bringToFront(order, 'zzz'), ['a', 'b', 'c', 'zzz'], '不在序列里必须追加到末尾');
});

check('isSameRect', () => {
  assert.equal(isSameRect({ x: 1, y: 2, w: 3, h: 4 }, { x: 1, y: 2, w: 3, h: 4 }), true);
  assert.equal(isSameRect({ x: 1, y: 2, w: 3, h: 4 }, { x: 1, y: 2, w: 3, h: 5 }), false);
});

console.log(`check-geometry.mjs ok (${String(checks)} groups)`);
