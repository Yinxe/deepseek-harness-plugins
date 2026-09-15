/**
 * 组件运行时 —— 注册表 + 布局状态 + 全部动作（无 React）
 *
 * 这里是框架的心脏：托盘与卡片层都只从它的快照里读，所有变更都走这里的方法，
 * 于是「单开语义 / z 序 / 会话绑定 / 夹紧 / 卸载清理 / 尺寸回环防护」只有一份实现。
 *
 * 两档快照：
 *  - **layout 快照**：离散动作（注册、开关、最小化、落盘）后重建；
 *  - **live 快照**：拖拽/缩放**每帧**只更新当前那一张卡的矩形，只通知订阅了它的人 ——
 *    这样 60fps 的拖动不会带着托盘和其他卡一起重渲染。
 *
 * @module @dshp/widget-kit/client/service
 */
import { FRAMEWORK_VERSION, SPEC_DEFAULTS, SPEC_VERSION, normalizeDescriptor } from './spec.js';
import {
  applyResize,
  bringToFront,
  clampRect,
  contentBox,
  defaultRect,
  isSameRect,
  sizeClassOf,
} from './geometry.js';
import type { Rect, RectConstraints, ResizeDir, Size, SizeClass, Viewport } from './geometry.js';
import {
  createDebouncedSaver,
  clearState,
  emptyState,
  loadState,
  moveInOrder,
  pruneId,
  setHiddenInList,
} from './store.js';
import type { CardState, DebouncedSaver, PersistedState, StorageLike } from './store.js';
import type { FrameworkConfig } from './types.js';
import type { NormalizedWidget, WidgetBadge, WidgetDescriptor, WidgetSummary } from './spec.js';

/** 拖拽/缩放期间挂起来的活动几何（只通知订阅 live 的那张卡）。 */
export interface LiveGeometry {
  id: string;
  rect: Rect;
  mode: 'move' | ResizeDir;
}

/** 托盘与卡片层消费的完整快照（`useSyncExternalStore` 的 getSnapshot 返回它）。 */
export interface FrameworkSnapshot {
  /** 框架偏好是否已从宿主拿到（首帧不渲染托盘，避免按默认值闪一下布局）。 */
  ready: boolean;
  /** localStorage 不可用（隐私模式 / 配额满）—— 功能照常，只是不落盘。 */
  degraded: boolean;
  widgets: readonly NormalizedWidget[];
  layout: PersistedState;
  /** popover 的单开目标（card 允许多开，状态在 `layout.cards[id].open`）。 */
  openId: string | null;
  /** 卡片层自下而上的顺序，末尾 = 最上。 */
  zOrder: readonly string[];
  badges: Readonly<Record<string, WidgetBadge | null>>;
  prefs: FrameworkConfig;
}

export interface WidgetRuntime {
  readonly specVersion: number;
  readonly frameworkVersion: string;

  // ── 公开服务（提供给其它插件的 facade 就是这几个） ──
  register<D>(descriptor: WidgetDescriptor<D>): () => void;
  list(): readonly WidgetSummary[];
  subscribe(listener: () => void): () => void;
  open(id: string): void;
  close(id: string): void;
  toggle(id: string): void;
  isOpen(id: string): boolean;
  minimize(id: string): void;
  restore(id: string): void;

  // ── UI 内部 ──
  getSnapshot(): FrameworkSnapshot;
  subscribeLive(listener: () => void): () => void;
  getLive(): LiveGeometry | null;
  beginLive(id: string, mode: 'move' | ResizeDir): void;
  setLive(id: string, rect: Rect): void;
  commitLive(id: string): void;
  cancelLive(): void;
  raise(id: string): void;
  toggleMinimize(id: string): void;
  nudge(id: string, dx: number, dy: number): void;
  nudgeResize(id: string, dw: number, dh: number): void;
  requestSize(id: string, next: { w?: number | undefined; h?: number | undefined }): void;
  /** 框架自己改尺寸（菜单预设 / 恢复默认）：不受内容回环防护限制。 */
  resizeTo(id: string, next: { w?: number | undefined; h?: number | undefined }): void;
  /** 在视口里居中（菜单「居中」）。 */
  center(id: string): void;
  sizeClassOf(widget: NormalizedWidget, rect: Rect): SizeClass;
  contentSize(rect: Rect): { width: number; height: number };
  rectOf(id: string): Rect;
  constraintsOf(widget: NormalizedWidget): RectConstraints;
  viewport(): Viewport;
  setViewport(next: Viewport): void;
  setSession(sessionId: string | null): void;
  getSession(): string | null;
  setAnchor(id: string, el: HTMLElement | null): void;
  getAnchor(id: string): HTMLElement | null;
  setBadge(id: string, badge: WidgetBadge | null): void;
  setTrayOrder(id: string, delta: number): void;
  /** 直接落一个完整顺序（托盘拖拽排序的结果）。 */
  setOrder(order: readonly string[]): void;
  /** 重置托盘顺序与隐藏集合（溢出菜单里的一项）。 */
  resetTrayLayout(): void;
  setHidden(id: string, hidden: boolean): void;
  setPrefs(patch: Partial<FrameworkConfig>): Promise<{ ok: boolean; error?: string }>;
  /** 宿主偏好到达后调一次：填偏好 + 标记 ready（首个快照才算正式）。 */
  applyPrefs(prefs: FrameworkConfig): void;
  /** 启动一段时间后清理「在册但从未注册」的历史残留（卸载过的插件留下的卡片/顺序项）。 */
  pruneOrphans(): number;
  resetLocal(): boolean;
  saveNow(): void;
  /** 挂一个周期任务（由 `ctx.interval` 注入；未注入时退回原生 setInterval）。 */
  scheduleInterval(callback: () => void, ms: number): () => void;
}

export interface RuntimeDeps {
  prefs: FrameworkConfig;
  storage: StorageLike | null;
  viewport: Viewport;
  /** 写偏好回宿主（settings.yaml）；不要它时 `setPrefs` 只改内存。 */
  savePrefs?: (prefs: FrameworkConfig) => Promise<{ ok: boolean; error?: string }>;
  /** 周期任务（`ctx.interval`）；缺省用原生 setInterval。 */
  interval?: (callback: () => void, ms: number) => () => void;
  /** 用户可见的提示（超上限自动最小化、组件卸载清理…）。 */
  onNotice?: (message: string) => void;
  onError?: (message: string, error?: unknown) => void;
}

function defaultConstraints(): RectConstraints {
  return { min: SPEC_DEFAULTS.cardFloorSize, max: null };
}

/**
 * 造一个运行时。**不碰任何全局**：storage / viewport / 宿主回调全部由调用方注入。
 */
export function createWidgetRuntime(deps: RuntimeDeps): WidgetRuntime {
  const registry = new Map<string, NormalizedWidget>();
  const anchors = new Map<string, HTMLElement | null>();
  const badges: Record<string, WidgetBadge | null> = {};
  /** 尺寸回环防护：每个组件的请求时间戳与「已冻结」标记。 */
  const sizeCalls = new Map<string, number[]>();
  const sizeFrozen = new Set<string>();

  let prefs: FrameworkConfig = { ...deps.prefs };
  let viewport: Viewport = { ...deps.viewport };
  let sessionId: string | null = null;
  let openId: string | null = null;
  let zOrder: string[] = [];
  let live: LiveGeometry | null = null;

  const listeners = new Set<() => void>();
  const liveListeners = new Set<() => void>();

  const constraintsFor = (widget: NormalizedWidget): RectConstraints => {
    const floor = SPEC_DEFAULTS.cardFloorSize;
    const min = widget.card?.minSize ?? floor;
    return { min, max: widget.card?.maxSize ?? null };
  };

  // 启动时**宽松**读盘：此刻注册表还是空的（各插件的 client 半随后才注册），按 id 过滤会把
  // 整份布局清空。残留由启动后的 pruneOrphans() 负责清理。
  const initial = loadState(deps.storage, {
    isKnown: () => true,
    constraintsOf: () => defaultConstraints(),
    viewport,
    clampRect,
  });

  let state: PersistedState = initial.state;
  let degraded = initial.degraded;
  if (degraded && deps.storage !== null) {
    deps.onError?.('[dshp-widget-kit] 本机布局存储不可用，本次布局只存在于内存里');
  }

  const saver: DebouncedSaver = createDebouncedSaver(deps.storage, undefined, () => {
    degraded = true;
    deps.onError?.('[dshp-widget-kit] 写入本机布局失败（配额或隐私模式），后续改动只留在内存');
  });

  let snapshot: FrameworkSnapshot = {
    ready: false,
    degraded,
    widgets: [],
    layout: state,
    openId: null,
    zOrder: [],
    badges,
    prefs,
  };

  // ── 快照与通知 ────────────────────────────────────────────────────────

  function sortedWidgets(): NormalizedWidget[] {
    const all = [...registry.values()];
    all.sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
    });
    return all;
  }

  function publish(): void {
    snapshot = {
      ready: snapshot.ready,
      degraded,
      widgets: sortedWidgets(),
      layout: state,
      openId,
      zOrder: [...zOrder],
      badges: { ...badges },
      prefs,
    };
    for (const listener of listeners) {
      try {
        listener();
      } catch (error) {
        deps.onError?.('[dshp-widget-kit] 订阅者回调抛错（已隔离）', error);
      }
    }
  }

  function notifyLive(): void {
    for (const listener of liveListeners) {
      try {
        listener();
      } catch (error) {
        deps.onError?.('[dshp-widget-kit] live 订阅者回调抛错（已隔离）', error);
      }
    }
  }

  function persist(): void {
    saver.schedule(state);
  }

  // ── 几何辅助 ──────────────────────────────────────────────────────────

  /** 真正占着屏幕的卡片数（`open` 但已最小化的不算）。 */
  function visibleCardCount(): number {
    return Object.values(state.cards).filter((c) => c.open && !c.minimized).length;
  }

  function trackedCardCount(): number {
    return Object.keys(state.cards).length;
  }

  function makeCardState(widget: NormalizedWidget, index: number): CardState {
    const constraints = constraintsFor(widget);
    const wanted: Size = widget.card?.defaultSize ?? SPEC_DEFAULTS.cardDefaultSize;
    const rect = defaultRect(index, wanted, constraints, viewport);
    return { ...rect, minimized: false, open: false };
  }

  function cardStateOf(widget: NormalizedWidget): CardState {
    const existing = state.cards[widget.id];
    if (existing !== undefined) return existing;
    return makeCardState(widget, trackedCardCount());
  }

  function writeCard(id: string, next: CardState, persistNow: boolean): void {
    state = { ...state, cards: { ...state.cards, [id]: next } };
    if (persistNow) persist();
    publish();
  }

  /** 同屏卡片超上限：把最旧的一张（z 序最底、开着、未最小化）收起来。 */
  function enforceCardLimit(exceptId: string): void {
    if (visibleCardCount() <= SPEC_DEFAULTS.maxOpenCards) return;
    for (const id of zOrder) {
      if (id === exceptId) continue;
      const card = state.cards[id];
      if (card === undefined || !card.open || card.minimized) continue;
      writeCard(id, { ...card, minimized: true }, false);
      deps.onNotice?.(`同屏卡片超过 ${String(SPEC_DEFAULTS.maxOpenCards)} 张，已自动最小化「${id}」`);
      return;
    }
  }

  function raiseOrder(id: string): void {
    const next = bringToFront(zOrder, id);
    if (next !== zOrder) zOrder = [...next];
  }

  function widgetOf(id: string): NormalizedWidget | undefined {
    return registry.get(id);
  }

  // ── 公开动作 ──────────────────────────────────────────────────────────

  function register<D>(raw: WidgetDescriptor<D>): () => void {
    const value = normalizeDescriptor(raw, FRAMEWORK_VERSION);
    // 同 id 再次注册 = 覆盖（HMR / 重复 apply / 同插件重注册都走这条）。
    // 注意：owner 是从 id 前缀推出来的，框架无法验证调用者身份 —— 两个插件若声明同一个 id，
    // 后注册者胜。这条限制写在 docs/widget-spec.md 的「已知边界」里。
    registry.set(value.id, value);
    if (!state.tray.order.includes(value.id)) {
      state = { ...state, tray: { ...state.tray, order: [...state.tray.order, value.id] } };
      persist();
    }
    publish();

    let disposed = false;
    return () => {
      if (disposed) return;
      disposed = true;
      registry.delete(value.id);
      if (openId === value.id) openId = null;
      zOrder = zOrder.filter((x) => x !== value.id);
      if (live?.id === value.id) live = null;
      delete badges[value.id];
      const hadCard = state.cards[value.id] !== undefined;
      state = pruneId(state, value.id);
      if (hadCard) {
        deps.onNotice?.(`组件「${value.id}」已卸载，它的卡片与本机布局记录一并清除`);
      }
      persist();
      publish();
      notifyLive();
    };
  }

  function list(): readonly WidgetSummary[] {
    return sortedWidgets().map((widget) => ({
      id: widget.id,
      title: typeof widget.title === 'function' ? widget.title() : widget.title,
      owner: widget.owner,
      presentation: widget.presentation,
    }));
  }

  function open(id: string): void {
    const widget = widgetOf(id);
    if (widget === undefined || widget.presentation === 'tray') return;
    if (widget.presentation === 'popover') {
      openId = id;
      publish();
      return;
    }
    const existing = cardStateOf(widget);
    state = {
      ...state,
      cards: { ...state.cards, [id]: { ...existing, open: true, minimized: false } },
      lastOpenId: id,
    };
    raiseOrder(id);
    persist();
    enforceCardLimit(id);
    publish();
  }

  function close(id: string): void {
    const widget = widgetOf(id);
    if (widget === undefined) return;
    if (widget.presentation === 'popover') {
      if (openId === id) {
        openId = null;
        publish();
      }
      return;
    }
    const existing = state.cards[id];
    if (existing === undefined) return;
    zOrder = zOrder.filter((x) => x !== id);
    state = { ...state, cards: { ...state.cards, [id]: { ...existing, open: false, minimized: false } } };
    persist();
    publish();
  }

  function minimize(id: string): void {
    const widget = widgetOf(id);
    if (widget === undefined || widget.presentation !== 'card' || widget.card?.minimizable === false) return;
    const existing = state.cards[id];
    if (existing === undefined || !existing.open || existing.minimized) return;
    writeCard(id, { ...existing, minimized: true }, true);
  }

  function restore(id: string): void {
    const widget = widgetOf(id);
    if (widget === undefined || widget.presentation !== 'card') return;
    const existing = state.cards[id];
    if (existing === undefined) return;
    raiseOrder(id);
    writeCard(id, { ...existing, open: true, minimized: false }, true);
  }

  function isOpen(id: string): boolean {
    const widget = widgetOf(id);
    if (widget === undefined) return false;
    if (widget.presentation === 'popover') return openId === id;
    const card = state.cards[id];
    return card !== undefined && card.open;
  }

  function toggle(id: string): void {
    const widget = widgetOf(id);
    if (widget === undefined || widget.presentation === 'tray') return;
    if (widget.presentation === 'popover') {
      if (openId === id) close(id);
      else open(id);
      return;
    }
    const card = state.cards[id];
    if (card === undefined || !card.open) {
      open(id);
      return;
    }
    if (card.minimized) {
      restore(id);
      return;
    }
    // 任务栏语义：点已经开在最前的卡片 = 最小化；点被压在下面的 = 提到最前
    if (zOrder[zOrder.length - 1] === id) minimize(id);
    else {
      raiseOrder(id);
      publish();
    }
  }

  function toggleMinimize(id: string): void {
    const card = state.cards[id];
    if (card === undefined) return;
    if (card.minimized) restore(id);
    else minimize(id);
  }

  // ── live 几何（拖拽/缩放每帧） ────────────────────────────────────────

  function beginLive(id: string, mode: 'move' | ResizeDir): void {
    if (widgetOf(id) === undefined) return;
    live = { id, rect: rectOf(id), mode };
    notifyLive();
  }

  function setLive(id: string, rect: Rect): void {
    if (live === null || live.id !== id) return;
    if (isSameRect(live.rect, rect)) return;
    live = { id, rect, mode: live.mode };
    notifyLive();
  }

  function commitLive(id: string): void {
    if (live === null || live.id !== id) return;
    const widget = widgetOf(id);
    const rect = live.rect;
    live = null;
    notifyLive();
    if (widget === undefined || widget.presentation !== 'card') return;
    const existing = state.cards[id];
    const base: CardState = existing ?? { ...rect, minimized: false, open: true };
    if (isSameRect(base, rect)) return;
    writeCard(id, { ...base, ...rect }, true);
  }

  function cancelLive(): void {
    if (live === null) return;
    live = null;
    notifyLive();
  }

  // ── 键盘与程序化几何 ──────────────────────────────────────────────────

  function rectOf(id: string): Rect {
    const widget = widgetOf(id);
    if (widget === undefined) {
      return {
        x: 0,
        y: 0,
        w: SPEC_DEFAULTS.cardDefaultSize.w,
        h: SPEC_DEFAULTS.cardDefaultSize.h,
      };
    }
    const card = cardStateOf(widget);
    return { x: card.x, y: card.y, w: card.w, h: card.h };
  }

  function applyRect(id: string, rect: Rect): void {
    const widget = widgetOf(id);
    if (widget === undefined || widget.presentation !== 'card') return;
    const clamped = clampRect(rect, constraintsFor(widget), viewport);
    const existing = state.cards[id];
    const base: CardState = existing ?? { ...clamped, minimized: false, open: true };
    if (isSameRect(base, clamped)) return;
    writeCard(id, { ...base, ...clamped }, true);
  }

  function nudge(id: string, dx: number, dy: number): void {
    const rect = rectOf(id);
    raiseOrder(id);
    applyRect(id, { ...rect, x: rect.x + dx, y: rect.y + dy });
  }

  function nudgeResize(id: string, dw: number, dh: number): void {
    const widget = widgetOf(id);
    if (widget === undefined) return;
    applyRect(id, applyResize(rectOf(id), 'se', dw, dh, constraintsFor(widget), viewport));
  }

  /**
   * 组件自己要求改尺寸（`props.setSize`）。
   *
   * 回环防护：500ms 内超过 3 次就判定「内容按尺寸再反推尺寸」，记一次 console.error 并冻结该组件 ——
   * 这类回环会让界面以帧率抖动，必须在框架侧硬停，而不是指望每个组件都守规范。
   */
  function resizeTo(id: string, next: { w?: number | undefined; h?: number | undefined }): void {
    const widget = widgetOf(id);
    if (widget === undefined || widget.presentation !== 'card') return;
    const rect = rectOf(id);
    applyRect(id, { ...rect, w: next.w ?? rect.w, h: next.h ?? rect.h });
  }

  function center(id: string): void {
    const widget = widgetOf(id);
    if (widget === undefined || widget.presentation !== 'card') return;
    const rect = rectOf(id);
    applyRect(id, {
      ...rect,
      x: Math.round((viewport.width - rect.w) / 2),
      y: Math.round((viewport.height - rect.h) / 2),
    });
  }

  function requestSize(id: string, next: { w?: number | undefined; h?: number | undefined }): void {
    if (sizeFrozen.has(id)) return;
    const widget = widgetOf(id);
    if (widget === undefined || widget.presentation !== 'card') return;
    const now = Date.now();
    const calls = (sizeCalls.get(id) ?? []).filter((t) => now - t < 500);
    calls.push(now);
    sizeCalls.set(id, calls);
    if (calls.length > 3) {
      sizeFrozen.add(id);
      deps.onError?.(
        `[dshp-widget-kit] 组件「${id}」在 500ms 内连续请求改尺寸（疑似尺寸回环），已冻结它的自动改尺寸。` +
          '请检查 content.render 是否根据本次 size 又调用了 setSize。',
      );
      return;
    }
    resizeTo(id, next);
  }

  function sizeClassFor(widget: NormalizedWidget, rect: Rect): SizeClass {
    const box = contentBox(rect);
    const breakpoints = widget.card?.breakpoints ?? SPEC_DEFAULTS.breakpoints;
    return sizeClassOf(box.width, breakpoints);
  }

  // ── 托盘顺序 / 隐藏 / 偏好 ────────────────────────────────────────────

  function setTrayOrder(id: string, delta: number): void {
    const next = moveInOrder(state.tray.order, id, delta);
    state = { ...state, tray: { ...state.tray, order: next } };
    persist();
    publish();
  }

  function setOrder(order: readonly string[]): void {
    const known = new Set(registry.keys());
    const next = order.filter((id) => known.has(id));
    for (const id of registry.keys()) {
      if (!next.includes(id)) next.push(id);
    }
    state = { ...state, tray: { ...state.tray, order: next } };
    persist();
    publish();
  }

  function resetTrayLayout(): void {
    state = {
      ...state,
      tray: { order: sortedWidgets().map((widget) => widget.id), hidden: [] },
    };
    persist();
    publish();
  }

  function setHidden(id: string, hidden: boolean): void {
    const next = setHiddenInList(state.tray.hidden, id, hidden);
    state = { ...state, tray: { ...state.tray, hidden: next } };
    persist();
    publish();
  }

  async function setPrefs(patch: Partial<FrameworkConfig>): Promise<{ ok: boolean; error?: string }> {
    const before = prefs;
    prefs = { ...prefs, ...patch };
    publish();
    if (deps.savePrefs === undefined) return { ok: true };
    const result = await deps.savePrefs(prefs);
    if (!result.ok) {
      prefs = before;
      publish();
      return result.error === undefined ? { ok: false } : { ok: false, error: result.error };
    }
    return { ok: true };
  }

  function applyPrefs(next: FrameworkConfig): void {
    prefs = { ...next };
    snapshot = { ...snapshot, ready: true };
    publish();
  }

  /** 清理「在册但从未注册」的残留。启动一段时间后调一次（此时各插件的 client 半都已注册）。 */
  function pruneOrphans(): number {
    const known = [...registry.keys()];
    const isKnown = (id: string): boolean => known.includes(id);
    let removed = 0;
    for (const id of Object.keys(state.cards)) {
      if (isKnown(id)) continue;
      state = pruneId(state, id);
      removed += 1;
    }
    if (removed > 0) {
      state = {
        ...state,
        tray: {
          order: state.tray.order.filter(isKnown),
          hidden: state.tray.hidden.filter(isKnown),
        },
      };
      persist();
    }
    if (openId !== null && !isKnown(openId)) openId = null;
    zOrder = zOrder.filter(isKnown);
    publish();
    return removed;
  }

  function resetLocal(): boolean {
    saver.cancel();
    const ok = clearState(deps.storage);
    state = emptyState();
    zOrder = [];
    openId = null;
    live = null;
    for (const key of Object.keys(badges)) delete badges[key];
    publish();
    notifyLive();
    return ok;
  }

  function setViewport(next: Viewport): void {
    const width = Number.isFinite(next.width) && next.width > 0 ? Math.round(next.width) : viewport.width;
    const height =
      Number.isFinite(next.height) && next.height > 0 ? Math.round(next.height) : viewport.height;
    if (width === viewport.width && height === viewport.height) return;
    viewport = { width, height };
    // 视口变化后把所有卡片夹回可见区（真被夹过的才落盘）
    let changed = false;
    const nextCards: Record<string, CardState> = { ...state.cards };
    for (const [id, card] of Object.entries(state.cards)) {
      const widget = widgetOf(id);
      if (widget === undefined) continue;
      const clamped = clampRect(card, constraintsFor(widget), viewport);
      if (isSameRect(card, clamped)) continue;
      nextCards[id] = { ...card, ...clamped };
      changed = true;
    }
    if (changed) {
      state = { ...state, cards: nextCards };
      persist();
    }
    if (live !== null) {
      const widget = widgetOf(live.id);
      if (widget !== undefined) {
        live = { ...live, rect: clampRect(live.rect, constraintsFor(widget), viewport) };
        notifyLive();
      }
    }
    publish();
  }

  function setSession(next: string | null): void {
    if (sessionId === next) return;
    sessionId = next;
    // 内容面绑定开启它的会话：切会话 = 关掉当前内容面（v1 规则，见 docs/widget-spec.md）
    let changed = false;
    if (openId !== null) {
      openId = null;
      changed = true;
    }
    const nextCards: Record<string, CardState> = { ...state.cards };
    for (const [id, card] of Object.entries(state.cards)) {
      if (!card.open) continue;
      nextCards[id] = { ...card, open: false, minimized: false };
      changed = true;
    }
    zOrder = [];
    if (changed) {
      state = { ...state, cards: nextCards };
      persist();
      publish();
    }
  }

  function setBadge(id: string, badge: WidgetBadge | null): void {
    const before = badges[id] ?? null;
    if (JSON.stringify(before) === JSON.stringify(badge)) return;
    badges[id] = badge;
    publish();
  }

  publish();

  return {
    specVersion: SPEC_VERSION,
    frameworkVersion: FRAMEWORK_VERSION,
    register,
    list,
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    open,
    close,
    toggle,
    isOpen,
    minimize,
    restore,
    getSnapshot: () => snapshot,
    subscribeLive(listener) {
      liveListeners.add(listener);
      return () => {
        liveListeners.delete(listener);
      };
    },
    getLive: () => live,
    beginLive,
    setLive,
    commitLive,
    cancelLive,
    raise(id) {
      raiseOrder(id);
      publish();
    },
    toggleMinimize,
    nudge,
    nudgeResize,
    requestSize,
    resizeTo,
    center,
    sizeClassOf: sizeClassFor,
    contentSize: (rect) => contentBox(rect),
    rectOf,
    constraintsOf: constraintsFor,
    viewport: () => viewport,
    setViewport,
    setSession,
    getSession: () => sessionId,
    setAnchor: (id, el) => {
      if (el === null) anchors.delete(id);
      else anchors.set(id, el);
    },
    getAnchor: (id) => anchors.get(id) ?? null,
    setBadge,
    setTrayOrder,
    setOrder,
    resetTrayLayout,
    setHidden,
    setPrefs,
    applyPrefs,
    pruneOrphans,
    resetLocal,
    saveNow() {
      saver.flush();
    },
    scheduleInterval(callback, ms) {
      if (deps.interval !== undefined) return deps.interval(callback, ms);
      const handle = setInterval(callback, ms);
      return () => {
        clearInterval(handle);
      };
    },
  };
}

/** 提供给其它插件的 facade：只有规范里承诺的那几个成员，内部方法不外泄。 */
export function createWidgetsService(runtime: WidgetRuntime): {
  readonly specVersion: number;
  readonly frameworkVersion: string;
  register: <D>(descriptor: WidgetDescriptor<D>) => () => void;
  list: () => readonly WidgetSummary[];
  subscribe: (listener: () => void) => () => void;
  open: (id: string) => void;
  close: (id: string) => void;
  toggle: (id: string) => void;
  isOpen: (id: string) => boolean;
  minimize: (id: string) => void;
  restore: (id: string) => void;
} {
  return {
    specVersion: runtime.specVersion,
    frameworkVersion: runtime.frameworkVersion,
    register: (descriptor) => runtime.register(descriptor),
    list: () => runtime.list(),
    subscribe: (listener) => runtime.subscribe(listener),
    open: (id) => {
      runtime.open(id);
    },
    close: (id) => {
      runtime.close(id);
    },
    toggle: (id) => {
      runtime.toggle(id);
    },
    isOpen: (id) => runtime.isOpen(id),
    minimize: (id) => {
      runtime.minimize(id);
    },
    restore: (id) => {
      runtime.restore(id);
    },
  };
}
