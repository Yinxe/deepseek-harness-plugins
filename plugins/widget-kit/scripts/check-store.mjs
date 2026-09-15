#!/usr/bin/env node
/**
 * 本机布局存储自检（纯逻辑 + 注入式 IO）
 *
 * 覆盖：消毒（坏结构 / 版本不符 / 类型不符 / 不在册 id / 超长列表 / 几何夹紧 / 布尔强制）、
 * 读写的降级路径（storage 抛错 / 坏 JSON / 无 storage）、合并写盘（debounce / flush / cancel / onError）、
 * 菜单操作（上移下移、隐藏集合）与卸载清理（pruneId）。
 */

import assert from 'node:assert/strict';
import { clampRect } from '../src/client/geometry.ts';
import {
  MAX_TRACKED,
  STORE_KEY,
  STORE_VERSION,
  clearState,
  createDebouncedSaver,
  emptyState,
  loadState,
  moveInOrder,
  pruneId,
  sanitizeState,
  saveState,
  setHiddenInList,
} from '../src/client/store.ts';

const VP = { width: 1280, height: 800 };
const KNOWN = ['alpha:one', 'beta:two', 'gamma:three'];
const DEPS = {
  isKnown: (id) => KNOWN.includes(id),
  constraintsOf: () => ({ min: { w: 240, h: 140 }, max: null }),
  viewport: VP,
  clampRect,
};

let checks = 0;
const check = (fn) => {
  fn();
  checks += 1;
};

/** 假的 localStorage。 */
function fakeStorage(initial = {}) {
  const map = new Map(Object.entries(initial));
  return {
    map,
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, v),
    removeItem: (k) => map.delete(k),
  };
}

function throwingStorage() {
  return {
    getItem: () => {
      throw new Error('blocked');
    },
    setItem: () => {
      throw new Error('quota');
    },
    removeItem: () => {
      throw new Error('blocked');
    },
  };
}

check(() => assert.equal(STORE_KEY, 'dshp-widget-kit:v1'));
check(() =>
  assert.deepEqual(emptyState(), {
    v: STORE_VERSION,
    tray: { order: [], hidden: [] },
    cards: {},
    lastOpenId: null,
  }),
);

// ── 消毒 ────────────────────────────────────────────────────────────────
check(() => {
  assert.deepEqual(sanitizeState(null, DEPS), emptyState());
  assert.deepEqual(sanitizeState('nope', DEPS), emptyState());
  assert.deepEqual(
    sanitizeState({ v: 2, tray: { order: KNOWN } }, DEPS),
    emptyState(),
    '版本不符必须整份丢弃',
  );
  assert.deepEqual(sanitizeState({ tray: { order: KNOWN } }, DEPS), emptyState(), '缺 v 必须整份丢弃');
});

check(() => {
  const out = sanitizeState(
    {
      v: STORE_VERSION,
      tray: {
        order: ['beta:two', 'alpha:one', 'beta:two', 'delta:nope', 42],
        hidden: ['gamma:three', 'delta:nope'],
      },
      cards: {
        'alpha:one': { x: 420, y: 260, w: 400, h: 300, minimized: true, open: true },
        'delta:nope': { x: 1, y: 1, w: 300, h: 200 },
        'beta:two': { x: 10, y: 10, w: 10, h: 10, minimized: 'yes', open: 0 },
      },
      lastOpenId: 'delta:nope',
    },
    DEPS,
  );
  assert.deepEqual(out.tray.order, ['beta:two', 'alpha:one'], '去重 + 丢未在册');
  assert.deepEqual(out.tray.hidden, ['gamma:three']);
  const cardIds = Object.keys(out.cards);
  cardIds.sort();
  assert.deepEqual(cardIds, ['alpha:one', 'beta:two']);
  assert.deepEqual(out.cards['alpha:one'], { x: 420, y: 260, w: 400, h: 300, minimized: true, open: true });
  // 尺寸被夹到 min，布尔被强制
  assert.deepEqual(out.cards['beta:two'], { x: 10, y: 10, w: 240, h: 140, minimized: false, open: false });
  assert.equal(out.lastOpenId, null, '不在册的 lastOpenId 必须清掉');
});

check(() => {
  const out = sanitizeState(
    { v: STORE_VERSION, cards: { 'alpha:one': { x: 99999, y: -500, w: 300, h: 200 } } },
    DEPS,
  );
  assert.equal(out.cards['alpha:one'].x, VP.width - 48, '越界坐标必须夹回');
  assert.equal(out.cards['alpha:one'].y, 0);
});

check(() => {
  const cards = {};
  for (let i = 0; i < MAX_TRACKED + 20; i += 1) {
    cards[`alpha:one`] = { x: 1, y: 1, w: 300, h: 200 };
  }
  // 用合法 id 撑数量：同一个 id 只会留一条，所以换一批合法 id
  const many = {};
  for (let i = 0; i < MAX_TRACKED + 20; i += 1) many[`alpha:${String(i)}`] = { x: 1, y: 1, w: 300, h: 200 };
  const known = Object.keys(many);
  const out = sanitizeState(
    { v: STORE_VERSION, cards: many },
    { ...DEPS, isKnown: (id) => known.includes(id) },
  );
  assert.equal(Object.keys(out.cards).length, MAX_TRACKED, '卡片数必须被截断');
  assert.equal(Object.keys(sanitizeState({ v: STORE_VERSION, cards }, DEPS).cards).length, 1);
});

check(() => {
  const out = sanitizeState(
    {
      v: STORE_VERSION,
      cards: { 'alpha:one': { x: Number.NaN, y: 0, w: 300, h: 200 }, 'beta:two': 'nope' },
    },
    DEPS,
  );
  assert.deepEqual(Object.keys(out.cards), [], '非有限数/非对象的卡片条目必须丢弃');
});

// ── 读写 ────────────────────────────────────────────────────────────────
check(() => {
  const storage = fakeStorage();
  assert.deepEqual(loadState(storage, DEPS), { state: emptyState(), degraded: false });
  assert.deepEqual(loadState(null, DEPS), { state: emptyState(), degraded: true }, '无 storage = 降级');
  const broken = fakeStorage({ [STORE_KEY]: '{oops' });
  assert.deepEqual(loadState(broken, DEPS).degraded, true, '坏 JSON = 降级');
  const blocked = loadState(throwingStorage(), DEPS);
  assert.equal(blocked.degraded, true);
  assert.deepEqual(blocked.state, emptyState());
});

check(() => {
  const storage = fakeStorage();
  const state = { ...emptyState(), lastOpenId: 'alpha:one' };
  assert.equal(saveState(storage, state), true);
  assert.deepEqual(loadState(storage, DEPS).state, state);
  assert.equal(clearState(storage), true);
  assert.equal(storage.getItem(STORE_KEY), null);
  assert.equal(saveState(throwingStorage(), state), false);
  assert.equal(clearState(null), false);
  assert.equal(saveState(null, state), false);
});

// ── 合并写盘 ────────────────────────────────────────────────────────────
await (async () => {
  const storage = fakeStorage();
  let errors = 0;
  const saver = createDebouncedSaver(storage, 5, () => {
    errors += 1;
  });
  saver.schedule({ ...emptyState(), lastOpenId: 'alpha:one' });
  saver.schedule({ ...emptyState(), lastOpenId: 'beta:two' });
  assert.equal(storage.getItem(STORE_KEY), null, 'schedule 不得同步写盘');
  assert.equal(saver.pending(), true);
  await new Promise((r) => setTimeout(r, 20));
  assert.equal(saver.pending(), false);
  assert.equal(JSON.parse(storage.getItem(STORE_KEY)).lastOpenId, 'beta:two', '合并后只落最后一次');

  // cancel：丢弃未落盘内容
  saver.schedule({ ...emptyState(), lastOpenId: 'gamma:three' });
  saver.cancel();
  assert.equal(saver.pending(), false);
  assert.equal(JSON.parse(storage.getItem(STORE_KEY)).lastOpenId, 'beta:two');

  // flush：立即写
  saver.schedule({ ...emptyState(), lastOpenId: 'gamma:three' });
  assert.equal(saver.flush(), true);
  assert.equal(JSON.parse(storage.getItem(STORE_KEY)).lastOpenId, 'gamma:three');

  // 写失败 → onError 只报一次
  const bad = createDebouncedSaver(throwingStorage(), 1, () => {
    errors += 1;
  });
  bad.schedule(emptyState());
  bad.flush();
  assert.equal(errors, 1, '写失败必须走 onError');
  checks += 1;
})();

// ── 菜单操作与清理 ──────────────────────────────────────────────────────
check(() => {
  const order = ['a', 'b', 'c'];
  assert.deepEqual(moveInOrder(order, 'b', -1), ['b', 'a', 'c']);
  assert.deepEqual(moveInOrder(order, 'b', 1), ['a', 'c', 'b']);
  assert.deepEqual(moveInOrder(order, 'a', -1), order, '越界原样返回');
  assert.deepEqual(moveInOrder(order, 'zz', 1), order, '不在册原样返回');
});

check(() => {
  assert.deepEqual(setHiddenInList(['a'], 'b', true), ['a', 'b']);
  assert.deepEqual(setHiddenInList(['a'], 'a', true), ['a'], '重复隐藏必须幂等');
  assert.deepEqual(setHiddenInList(['a', 'b'], 'a', false), ['b']);
});

check(() => {
  const state = {
    v: STORE_VERSION,
    tray: { order: ['alpha:one', 'beta:two'], hidden: ['alpha:one'] },
    cards: {
      'alpha:one': { x: 0, y: 0, w: 300, h: 200, minimized: false, open: true },
      'beta:two': { x: 0, y: 0, w: 300, h: 200, minimized: false, open: false },
    },
    lastOpenId: 'alpha:one',
  };
  const out = pruneId(state, 'alpha:one');
  assert.deepEqual(out.tray.order, ['beta:two']);
  assert.deepEqual(out.tray.hidden, []);
  assert.deepEqual(Object.keys(out.cards), ['beta:two']);
  assert.equal(out.lastOpenId, null);
  assert.deepEqual(Object.keys(state.cards).length, 2, 'pruneId 不得改动入参');
});

console.log(`check-store.mjs ok (${String(checks)} checks)`);
void clampRect;
