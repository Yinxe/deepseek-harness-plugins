/**
 * 卡片几何 —— 纯函数，无 React、无 DOM、无副作用
 *
 * 所有「拖拽 / 缩放 / 夹紧 / 内容盒 / 尺寸档」的数学都在这里，`scripts/check-geometry.mjs`
 * 直接 import 本文件跑断言（Node 的 TS 类型擦除）。**所以本文件必须自包含**：只允许 `import type`。
 *
 * 为什么这里又写了一遍标题栏/内边距/吸附参数：`src/client/spec.ts` 也必须自包含（同一个自检脚本
 * 要 import 它），两边不能互相值导入。几处数字由 `scripts/check-geometry.mjs` 断言相等，
 * 漂移即测试失败。
 *
 * @module @dshp/widget-kit/geometry
 */

/** 卡片标题栏高度（px）。内容区从它下面开始。 */
export const TITLE_BAR_HEIGHT = 36;

/** 内容区内边距（px）：内容盒 = 外层宽 − 2×它，外层高 − 标题栏 − 2×它。 */
export const CONTENT_PADDING = 10;

/** 新卡相对上一张的层叠偏移（px）。 */
export const CASCADE_STEP = 28;

/** 相邻卡片之间的间隔（px）：贴在一起时也留这么多，不糊在一起。 */
export const SNAP_GAP = 8;

/** 同轴吸附距离（px）：与邻卡的边、或视口边缘差这么多以内就吸过去。 */
export const SNAP_DISTANCE = 12;

/** 跨轴对齐容差（px）：贴到邻卡旁边时，另一轴差这么多以内就顺带对齐（比吸附距离宽松一档）。 */
export const SNAP_ALIGN = 28;

/** 层叠位置的回绕周期（第 n 张卡用第 n % 该值 档）。 */
export const CASCADE_WRAP = 6;

/** 卡片外层矩形（左上角 + 尺寸，px）。 */
export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Size {
  w: number;
  h: number;
}

export interface Box {
  width: number;
  height: number;
}

export interface Viewport {
  width: number;
  height: number;
}

export interface RectConstraints {
  min: Size;
  max?: Size | null | undefined;
}

/** 八个缩放方向。 */
export type ResizeDir = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

/** 全部缩放方向（UI 生成把手 + 自检遍历）。 */
export const RESIZE_DIRS: readonly ResizeDir[] = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];

export type SizeClass = 'compact' | 'regular' | 'wide';

export interface Breakpoints {
  compact: number;
  wide: number;
}

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

/** 视口退化（宽高为 0 / NaN）时的兜底。 */
function safeViewport(viewport: Viewport): Viewport {
  const width = Number.isFinite(viewport.width) && viewport.width > 0 ? viewport.width : 1024;
  const height = Number.isFinite(viewport.height) && viewport.height > 0 ? viewport.height : 768;
  return { width, height };
}

/** 该约束下的有效最大尺寸：描述符 max 与视口取小，且永不小于 min。 */
export function maxSizeFor(constraints: RectConstraints, viewport: Viewport): Size {
  const vp = safeViewport(viewport);
  const maxW = Math.min(constraints.max?.w ?? vp.width, vp.width);
  const maxH = Math.min(constraints.max?.h ?? vp.height, vp.height);
  return {
    w: Math.max(constraints.min.w, maxW),
    h: Math.max(constraints.min.h, maxH),
  };
}

/** 把尺寸夹进 [min, max]，并取整。 */
export function clampSize(size: Size, constraints: RectConstraints, viewport: Viewport): Size {
  const cap = maxSizeFor(constraints, viewport);
  return {
    w: Math.round(clamp(size.w, Math.min(constraints.min.w, cap.w), cap.w)),
    h: Math.round(clamp(size.h, Math.min(constraints.min.h, cap.h), cap.h)),
  };
}

/**
 * 只做「整卡留在视口内」这一件事（尺寸不动，位置取整）。
 *
 * 卡片比视口还大时（视口极窄 / minSize 比视口还宽）只能贴左上角，此时横向会溢出 —— 这是无解的，
 * 但左上角仍然保证抓得到。
 */
export function containRect(rect: Rect, viewport: Viewport): Rect {
  const vp = safeViewport(viewport);
  const w = Number.isFinite(rect.w) ? Math.max(0, Math.round(rect.w)) : 0;
  const h = Number.isFinite(rect.h) ? Math.max(0, Math.round(rect.h)) : 0;
  return {
    x: Math.round(clamp(rect.x, 0, Math.max(0, vp.width - w))),
    y: Math.round(clamp(rect.y, 0, Math.max(0, vp.height - h))),
    w,
    h,
  };
}

/**
 * 把矩形夹回可用范围：尺寸夹进 `min/max` 与视口，位置**整卡留在视口内**。
 *
 * 规则（治「卡片被拖到屏幕外找不回来」）：不允许把卡片拖到屏幕之外，任何时刻它都完整可见 ——
 * 比「至少留 48px」更严格，代价是卡片不能停在屏幕边缘外（吸附规则同样以视口边缘为吸附目标）。
 */
export function clampRect(rect: Rect, constraints: RectConstraints, viewport: Viewport): Rect {
  const size = clampSize(rect, constraints, viewport);
  return containRect({ ...rect, ...size }, viewport);
}

/**
 * 第八张卡（index 从 0 起）的默认落点：从右上角往左下阶梯层叠，最后夹回视口。
 *
 * @param index - 当前已打开的卡片数（第几张新卡）。
 * @param size - 期望的初始尺寸（外层 px）。
 * @param constraints - 尺寸约束（夹紧用）。
 * @param viewport - 视口尺寸。
 */
export function defaultRect(
  index: number,
  size: Size,
  constraints: RectConstraints,
  viewport: Viewport,
): Rect {
  const vp = safeViewport(viewport);
  const step = (Math.max(0, Math.floor(index)) % CASCADE_WRAP) * CASCADE_STEP;
  const raw: Rect = {
    x: vp.width - size.w - 24 - step,
    y: 88 + step,
    w: size.w,
    h: size.h,
  };
  return clampRect(raw, constraints, viewport);
}

/** 内容盒（给提供方的 `size`）：整数 px，已扣标题栏与内边距，永不为负。 */
export function contentBox(rect: Rect): Box {
  return {
    width: Math.max(0, Math.round(rect.w) - CONTENT_PADDING * 2),
    height: Math.max(0, Math.round(rect.h) - TITLE_BAR_HEIGHT - CONTENT_PADDING * 2),
  };
}

/** 由内容盒宽度派生尺寸档：`< compact` → compact，`>= wide` → wide，其余 regular。 */
export function sizeClassOf(width: number, breakpoints: Breakpoints): SizeClass {
  if (!Number.isFinite(width)) return 'regular';
  if (width < breakpoints.compact) return 'compact';
  if (width >= breakpoints.wide) return 'wide';
  return 'regular';
}

// ── 吸附 / 防重叠（移动落点）────────────────────────────────────────────

/** 吸附参数。 */
export interface DockOptions {
  /** 相邻卡片之间保留的间隔（px）。 */
  gap: number;
  /** 同轴吸附距离：与邻卡边或视口边缘差这么多以内就吸过去（px）。 */
  distance: number;
  /** 跨轴对齐容差：贴到邻卡旁边时另一轴对齐的容差（px）。 */
  align: number;
}

const DEFAULT_DOCK: DockOptions = { gap: SNAP_GAP, distance: SNAP_DISTANCE, align: SNAP_ALIGN };

/** 单轴上的一个区间（位置 + 尺寸），吸附算法用它描述邻卡在某一轴上的投影（数值，不依赖 Rect）。 */
export interface AxisSpan {
  pos: number;
  size: number;
}

/**
 * 两块矩形是否「冲突」：任一轴上的间隔小于 `gap` 就算冲突（`gap: 0` 时退化成普通的相交判定）。
 */
export function conflicts(a: Rect, b: Rect, gap: number): boolean {
  return a.x < b.x + b.w + gap && b.x < a.x + a.w + gap && a.y < b.y + b.h + gap && b.y < a.y + a.h + gap;
}

/**
 * 单轴吸附：候选 = 视口两端 + 邻卡两端（贴边，带 gap）+ 邻卡两端（对齐）。
 *
 * 取位移最小的那个；位移相同则优先「贴边」候选（贴上去比单纯对齐更可用）。
 */
function snapAxis(
  pos: number,
  size: number,
  spans: readonly AxisSpan[],
  limit: number,
  options: DockOptions,
): number {
  const candidates: { value: number; edge: boolean }[] = [
    { value: 0, edge: true },
    { value: limit - size, edge: true },
  ];
  for (const span of spans) {
    candidates.push({ value: span.pos + span.size + options.gap, edge: true }); // 贴在邻卡后面
    candidates.push({ value: span.pos - options.gap - size, edge: true }); // 贴在邻卡前面
    candidates.push({ value: span.pos, edge: false }); // 前缘对齐
    candidates.push({ value: span.pos + span.size - size, edge: false }); // 后缘对齐
  }
  let bestValue = pos;
  let bestDelta = options.distance + 1;
  let bestEdge = true;
  for (const candidate of candidates) {
    const delta = Math.abs(candidate.value - pos);
    if (!Number.isFinite(delta) || delta > options.distance) continue;
    if (delta < bestDelta) {
      bestValue = candidate.value;
      bestDelta = delta;
      bestEdge = candidate.edge;
    } else if (delta === bestDelta && candidate.edge && !bestEdge) {
      bestValue = candidate.value;
      bestEdge = true;
    }
  }
  return Math.round(bestValue);
}

/** 跨轴对齐：把 `pos` 拉向邻卡的前缘或后缘（取更近的那个，且都在容差内）。 */
function alignAxis(pos: number, size: number, span: AxisSpan, tolerance: number): number {
  const head = span.pos - pos;
  if (Number.isFinite(head) && Math.abs(head) <= tolerance) return span.pos;
  const tail = span.pos + span.size - size - pos;
  if (Number.isFinite(tail) && Math.abs(tail) <= tolerance) return span.pos + span.size - size;
  return pos;
}

/**
 * 不许压在别的卡片上：为目标矩形找**离它最近的空位** —— 候选是「贴到每一张卡片的四条边」
 * （另一轴尽量与那张卡对齐），取无冲突且位移最小的一个。
 *
 * 为什么是「全局扫候选」而不是「撞到谁就往那一边推」：多张卡片挨在一起时，局部推挤会连锁
 * （推开的落点又撞上第三张），推着推着就没解了 —— 新卡会叠上去。扫候选一次就能找到空位。
 *
 * 一个候选都放不下（屏幕真的满了）时保持原样：宁可短暂重叠，也不要让卡片乱跳到莫名其妙的位置。
 */
function escapeConflicts(
  rect: Rect,
  others: readonly Rect[],
  viewport: Viewport,
  options: DockOptions,
): Rect {
  if (!others.some((other) => conflicts(rect, other, options.gap))) return rect;
  const candidates: Rect[] = [];
  for (const other of others) {
    const vertical = alignAxis(rect.y, rect.h, { pos: other.y, size: other.h }, options.align);
    const horizontal = alignAxis(rect.x, rect.w, { pos: other.x, size: other.w }, options.align);
    candidates.push(
      { ...rect, x: other.x + other.w + options.gap, y: vertical }, // 贴它右边
      { ...rect, x: other.x - rect.w - options.gap, y: vertical }, // 贴它左边
      { ...rect, y: other.y + other.h + options.gap, x: horizontal }, // 贴它下边
      { ...rect, y: other.y - rect.h - options.gap, x: horizontal }, // 贴它上边
    );
  }
  let best: Rect | null = null;
  let bestCost = Number.POSITIVE_INFINITY;
  for (const candidate of candidates) {
    const placed = containRect(candidate, viewport);
    if (others.some((other) => conflicts(placed, other, options.gap))) continue;
    const cost = Math.abs(placed.x - rect.x) + Math.abs(placed.y - rect.y);
    if (cost < bestCost) {
      best = placed;
      bestCost = cost;
    }
  }
  return best ?? rect;
}

/**
 * 移动落点（拖动与键盘移动共用）：夹进视口 → 同轴吸附（贴邻卡 / 贴视口边 / 边缘对齐）→
 * 不许压在别的卡片上。
 *
 * 拖动期间**每帧**都会跑它，所以吸附是「提前渲染」出来的：卡片在指针还没松手时就贴好了，
 * 松手只是把同一份几何写进本机布局。缩放不走这里（缩放只夹在 min/max 与视口内）。
 *
 * @param rect - 指针（或键盘）算出来的目标矩形。
 * @param others - 屏幕上其它卡片的矩形（不含自己；最小化的卡片不算障碍）。
 * @param viewport - 视口尺寸。
 * @param options - 吸附参数（默认 `SNAP_GAP` / `SNAP_DISTANCE` / `SNAP_ALIGN`）。
 */
export function dockRect(
  rect: Rect,
  others: readonly Rect[],
  viewport: Viewport,
  options: DockOptions = DEFAULT_DOCK,
): Rect {
  const vp = safeViewport(viewport);
  const contained = containRect(rect, vp);
  const snapped: Rect = {
    ...contained,
    x: snapAxis(
      contained.x,
      contained.w,
      others.map((other) => ({ pos: other.x, size: other.w })),
      vp.width,
      options,
    ),
    y: snapAxis(
      contained.y,
      contained.h,
      others.map((other) => ({ pos: other.y, size: other.h })),
      vp.height,
      options,
    ),
  };
  return escapeConflicts(snapped, others, vp, options);
}

/**
 * 一次缩放：方向 + 指针位移 → 新矩形。
 *
 * 语义：被拖的那条边跟手，**对边固定**（对角缩放因此不会漂移）；夹在 `min/max` 内；
 * 最后整块再过 `clampRect`（标题栏保底可见）。向北缩放时顶边不得越过 y=0（标题栏必须可见）。
 */
export function applyResize(
  rect: Rect,
  dir: ResizeDir,
  dx: number,
  dy: number,
  constraints: RectConstraints,
  viewport: Viewport,
): Rect {
  const vp = safeViewport(viewport);
  const cur = clampRect(rect, constraints, viewport);
  const cap = maxSizeFor(constraints, viewport);
  const minW = Math.min(constraints.min.w, cap.w);
  const minH = Math.min(constraints.min.h, cap.h);

  const east = dir.includes('e');
  const west = dir.includes('w');
  const north = dir.includes('n');
  const south = dir.includes('s');

  let w = cur.w;
  let h = cur.h;

  if (east) {
    // 右手边跟手；不越过视口右缘（除非本来就已经在外面）
    const limit = Math.max(minW, Math.min(cap.w, vp.width - cur.x));
    w = clamp(cur.w + dx, minW, limit);
  } else if (west) {
    w = clamp(cur.w - dx, minW, cap.w);
  }

  if (south) {
    const limit = Math.max(minH, Math.min(cap.h, vp.height - cur.y));
    h = clamp(cur.h + dy, minH, limit);
  } else if (north) {
    // 底边固定，顶边不得越过 0（标题栏整条可见）
    const limit = Math.max(minH, cur.y + cur.h);
    h = clamp(cur.h - dy, minH, limit);
  }

  const x = west ? cur.x + (cur.w - w) : cur.x;
  const y = north ? cur.y + (cur.h - h) : cur.y;
  return clampRect({ x, y, w, h }, constraints, viewport);
}

/**
 * 把 id 放到 z 序末尾（最上）。不在序列里时**追加**。
 *
 * 已是末尾时原样返回同一引用（调用方据此跳过无谓的快照重建）。
 */
export function bringToFront(order: readonly string[], id: string): readonly string[] {
  const index = order.indexOf(id);
  if (index !== -1 && index === order.length - 1) return order;
  const next = order.filter((x) => x !== id);
  next.push(id);
  return next;
}

/** 矩形是否完全相同（整数比较；避免无谓的 store 写入）。 */
export function isSameRect(a: Rect, b: Rect): boolean {
  return a.x === b.x && a.y === b.y && a.w === b.w && a.h === b.h;
}
