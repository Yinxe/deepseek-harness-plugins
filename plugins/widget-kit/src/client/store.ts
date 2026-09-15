/**
 * 本机布局存储 —— 纯逻辑 + 可注入 IO，Node 里直接可测
 *
 * 存 localStorage 的**只有本机布局**（托盘顺序/隐藏、卡片矩形/最小化、上次打开的组件）；
 * 用户**配置**（托盘开关、图标上限、刷新间隔…）走 settings.yaml 的 NS 分节，两者的边界见
 * `docs/widget-spec.md`。
 *
 * 与 geometry.ts 一样，本文件必须自包含（只允许 `import type`）——`scripts/check-store.mjs`
 * 直接 import 它。类型层面从 geometry 借，值层面靠注入（`deps.clampRect`）。
 *
 * @module @dshp/widget-kit/store
 */
import type { Rect, RectConstraints, Viewport } from './geometry.js';

/** localStorage 单键（带版本：`v` 不匹配就整份丢弃，不做迁移）。 */
export const STORE_KEY = 'dshp-widget-kit:v1';

/** 存储结构版本。 */
export const STORE_VERSION = 1;

/** 最多跟踪多少张卡片（防脏数据把 store 撑爆）。 */
export const MAX_TRACKED = 64;

/** 列表（托盘顺序 / 隐藏集合）长度上限。 */
export const MAX_LIST = 64;

/** 拖拽/缩放结束后落盘的延迟（合并抖动）。 */
export const SAVE_DEBOUNCE_MS = 300;

/** 单张卡片的持久状态。 */
export interface CardState extends Rect {
  minimized: boolean;
  open: boolean;
}

export interface TrayState {
  order: string[];
  hidden: string[];
}

export interface PersistedState {
  v: typeof STORE_VERSION;
  tray: TrayState;
  cards: Record<string, CardState>;
  lastOpenId: string | null;
}

/** localStorage 的最小接口（测试里传假实现）。 */
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface SanitizeDeps {
  /**
   * 该 id 是否在册。
   *
   * 启动读盘时注册表还是空的（各插件的 client 半随后才注册），此时应传 `() => true`
   * —— 否则整份布局会被当成残留清空。残留由启动后的 `pruneOrphans()` 清理。
   */
  isKnown(id: string): boolean;
  constraintsOf(id: string): RectConstraints;
  viewport: Viewport;
  clampRect(rect: Rect, constraints: RectConstraints, viewport: Viewport): Rect;
}

export function emptyState(): PersistedState {
  return { v: STORE_VERSION, tray: { order: [], hidden: [] }, cards: {}, lastOpenId: null };
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

function isFiniteNumber(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v);
}

function readIdList(raw: unknown, deps: SanitizeDeps): string[] {
  if (!Array.isArray(raw)) return [];
  const out: string[] = [];
  for (const item of raw) {
    if (out.length >= MAX_LIST) break;
    if (typeof item !== 'string') continue;
    if (!deps.isKnown(item)) continue;
    if (out.includes(item)) continue;
    out.push(item);
  }
  return out;
}

/**
 * 消毒一份从 localStorage 读回来的原始值。
 *
 * 丢弃即回默认：坏 JSON / 结构不对 / `v` 不匹配 / 字段类型不符 / 不在册的 id / 超长列表。
 * **不做迁移** —— 老结构直接丢（与仓库「不迁移历史配置」一致）。
 */
export function sanitizeState(raw: unknown, deps: SanitizeDeps): PersistedState {
  if (!isRecord(raw)) return emptyState();
  if (raw['v'] !== STORE_VERSION) return emptyState();

  const trayRaw = isRecord(raw['tray']) ? raw['tray'] : {};
  const order = readIdList(trayRaw['order'], deps);
  const hidden = readIdList(trayRaw['hidden'], deps);

  const cardsRaw = isRecord(raw['cards']) ? raw['cards'] : {};
  const cards: Record<string, CardState> = {};
  let tracked = 0;
  for (const id of Object.keys(cardsRaw)) {
    if (tracked >= MAX_TRACKED) break;
    if (!deps.isKnown(id)) continue;
    const value = cardsRaw[id];
    if (!isRecord(value)) continue;
    const x = value['x'];
    const y = value['y'];
    const w = value['w'];
    const h = value['h'];
    if (!isFiniteNumber(x) || !isFiniteNumber(y) || !isFiniteNumber(w) || !isFiniteNumber(h)) continue;
    const rect = deps.clampRect({ x, y, w, h }, deps.constraintsOf(id), deps.viewport);
    cards[id] = {
      x: rect.x,
      y: rect.y,
      w: rect.w,
      h: rect.h,
      minimized: value['minimized'] === true,
      open: value['open'] === true,
    };
    tracked += 1;
  }

  const lastRaw = raw['lastOpenId'];
  const lastOpenId = typeof lastRaw === 'string' && deps.isKnown(lastRaw) ? lastRaw : null;

  return { v: STORE_VERSION, tray: { order, hidden }, cards, lastOpenId };
}

/** 读一次；任何异常都降级为「默认 + degraded」（隐私模式 / 配额满 / 坏 JSON）。 */
export function loadState(
  storage: StorageLike | null,
  deps: SanitizeDeps,
): { state: PersistedState; degraded: boolean } {
  if (storage === null) return { state: emptyState(), degraded: true };
  try {
    const raw = storage.getItem(STORE_KEY);
    if (raw === null || raw === '') return { state: emptyState(), degraded: false };
    return { state: sanitizeState(JSON.parse(raw) as unknown, deps), degraded: false };
  } catch {
    return { state: emptyState(), degraded: true };
  }
}

/** 写一次；返回是否成功（失败由调用方决定是否记一行 warn）。 */
export function saveState(storage: StorageLike | null, state: PersistedState): boolean {
  if (storage === null) return false;
  try {
    storage.setItem(STORE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

/** 清掉本机布局（设置页「清空本机布局」用）。 */
export function clearState(storage: StorageLike | null): boolean {
  if (storage === null) return false;
  try {
    storage.removeItem(STORE_KEY);
    return true;
  } catch {
    return false;
  }
}

export interface DebouncedSaver {
  schedule(state: PersistedState): void;
  flush(): boolean;
  cancel(): void;
  /** 自检用：当前是否有尚未落盘的改动。 */
  pending(): boolean;
}

/**
 * 合并写盘：300ms 内的多次改动只落一次；`flush()` 立即写（关闭页面/卸载插件时用）。
 *
 * @param storage - localStorage 接口（null = 内存降级，直接返回 false）。
 * @param delayMs - 合并窗口。
 * @param onError - 写失败回调（每插件只记一行 warn 用）。
 */
export function createDebouncedSaver(
  storage: StorageLike | null,
  delayMs: number = SAVE_DEBOUNCE_MS,
  onError: () => void = () => {},
): DebouncedSaver {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let queued: PersistedState | null = null;

  const write = (): boolean => {
    if (queued === null) return true;
    const payload = queued;
    queued = null;
    const ok = saveState(storage, payload);
    if (!ok) onError();
    return ok;
  };

  return {
    schedule(state: PersistedState): void {
      queued = state;
      if (timer !== null) return;
      timer = setTimeout(() => {
        timer = null;
        write();
      }, delayMs);
    },
    flush(): boolean {
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
      return write();
    },
    cancel(): void {
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
      queued = null;
    },
    pending(): boolean {
      return queued !== null;
    },
  };
}

/** 在顺序里前后移动一项（溢出菜单的「上移 / 下移」）。越界或不存在时原样返回。 */
export function moveInOrder(order: readonly string[], id: string, delta: number): string[] {
  const index = order.indexOf(id);
  const next = index + delta;
  if (index < 0 || next < 0 || next >= order.length) return order.slice();
  const out = order.slice();
  const [item] = out.splice(index, 1);
  if (item === undefined) return order.slice();
  out.splice(next, 0, item);
  return out;
}

/**
 * 把「可见项的新顺序」合并回完整顺序。
 *
 * 托盘里被用户藏起来的组件不参与拖拽，但它们在完整顺序里占的位置必须保留 —— 否则把几个组件
 * 藏起来再拖一次，隐藏项的相对位置就被打乱了。
 *
 * @param full - 完整顺序（含隐藏项）。
 * @param nextVisible - 可见项的新顺序。
 * @returns 新的完整顺序。
 */
export function mergeVisibleOrder(full: readonly string[], nextVisible: readonly string[]): string[] {
  const visible = new Set(nextVisible);
  const out = full.slice();
  let cursor = 0;
  for (let i = 0; i < out.length; i += 1) {
    const id = out[i];
    if (id === undefined || !visible.has(id)) continue;
    const replacement = nextVisible[cursor];
    cursor += 1;
    if (replacement !== undefined) out[i] = replacement;
  }
  for (const id of nextVisible) {
    if (!out.includes(id)) out.push(id);
  }
  return out;
}

/** 增删隐藏集合。 */
export function setHiddenInList(hidden: readonly string[], id: string, isHidden: boolean): string[] {
  if (isHidden) {
    if (hidden.includes(id)) return hidden.slice();
    return [...hidden, id].slice(0, MAX_LIST);
  }
  return hidden.filter((x) => x !== id);
}

/** 组件被卸载后清掉它的全部残留（卡片、托盘顺序、隐藏集合、lastOpenId）。 */
export function pruneId(state: PersistedState, id: string): PersistedState {
  const next: PersistedState = {
    v: STORE_VERSION,
    tray: {
      order: state.tray.order.filter((x) => x !== id),
      hidden: state.tray.hidden.filter((x) => x !== id),
    },
    cards: { ...state.cards },
    lastOpenId: state.lastOpenId === id ? null : state.lastOpenId,
  };
  delete next.cards[id];
  return next;
}
