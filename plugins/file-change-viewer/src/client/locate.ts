/**
 * 真实行号：向 Host 问「这段新文本在文件里的第几行」
 *
 * 为什么需要它：差异卡片的行号由官方代码块的 CSS 计数器给出，默认从 **1** 开始。而
 * `edit` / `write` 的结果元数据只有 `{ path, oldText, newText }`——**没有行偏移**（官方
 * `computeHunkDiffs` 就是这么产出的）。想在卡片上显示文件里的真实行号，只有一个办法：
 * 拿文件当前内容去定位这段 hunk。
 *
 * 所以这里做三件事：
 *
 * 1. **批量**：一屏里可能有好几个块都要定位，攒到一个微任务里发一次请求；
 * 2. **缓存**：键是 `path + newText`（同一段文本在文件里的位置不会因为重渲染而变化），
 *    命中就不再问；
 * 3. **只问行号**：Host 侧的路由只回整数，正文一个字都不回传（见 `src/host/routes.ts`）。
 *
 * 定位不到（文件之后又被改过、hunk 已被覆盖）就返回 `null`，卡片老老实实退回从 1 开始编号——
 * 宁可编号朴素，也不要编一个错的数字。
 *
 * @module @dshp/file-change-viewer/client/locate
 */
import type { AnyReact } from './types.js';

const BASE = '/ext/dshp-file-change-viewer/locate';

/** 一次请求最多带几个待定位项（与 Host 侧上限一致）。 */
const MAX_BATCH = 20;

/** 定位缓存：`path\u0000newText` → 行号（null = 问过了但定位不到）。 */
const cache = new Map<string, number | null>();

/** 订阅者（行组件用它触发重渲染）。 */
const listeners = new Set<() => void>();

/** 已经排进这一批、还没发出去的请求。 */
let pending: Array<{ key: string; path: string; newText: string }> = [];
let scheduled = false;
/** 供测试注入的会话工作目录（浏览器里由行自己带过来）。 */
let currentCwd: string | undefined;

function keyOf(path: string, newText: string): string {
  return path + '\u0000' + newText;
}

function notify(): void {
  for (const listener of Array.from(listeners)) {
    try {
      listener();
    } catch {
      /* 订阅者自己的异常不该影响其它订阅者 */
    }
  }
}

async function flush(): Promise<void> {
  scheduled = false;
  const batch = pending;
  pending = [];
  if (batch.length === 0) return;
  try {
    const response = await fetch(BASE, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        ...(currentCwd === undefined ? {} : { cwd: currentCwd }),
        items: batch.map((item) => ({ path: item.path, newText: item.newText })),
      }),
    });
    const payload = (await response.json()) as { ok?: unknown; lines?: unknown };
    const lines = Array.isArray(payload?.lines) ? payload.lines : [];
    batch.forEach((item, index) => {
      const value = lines[index];
      cache.set(item.key, typeof value === 'number' && value > 0 ? value : null);
    });
  } catch {
    // 网络/后端不可用：记成「不知道」，避免每次渲染都重问同一段
    for (const item of batch) cache.set(item.key, null);
  }
  notify();
}

/**
 * 取某段 hunk 的真实起始行号。
 *
 * @param path - 文件路径（工具参数里的原始路径）。
 * @param newText - 该 hunk 的新侧原文（定位用的锚）。
 * @param cwd - 会话工作目录（用于相对路径解析）。
 * @returns 已知行号 / `null`（问过但定位不到）/ `undefined`（还没问，已排队）。
 */
export function lineOf(path: string, newText: string, cwd?: string): number | null | undefined {
  if (path === '' || newText === '') return null;
  if (cwd !== undefined) currentCwd = cwd;
  const key = keyOf(path, newText);
  if (cache.has(key)) return cache.get(key) ?? null;
  if (!pending.some((item) => item.key === key) && pending.length < MAX_BATCH) {
    pending.push({ key, path, newText });
    if (!scheduled) {
      scheduled = true;
      setTimeout(() => {
        void flush();
      }, 0);
    }
  }
  return undefined;
}

/** 订阅缓存变化（返回退订函数）。 */
export function subscribeLines(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** 供测试重置模块内状态（生产路径不会调用）。 */
export function resetLines(): void {
  cache.clear();
  pending = [];
  scheduled = false;
  currentCwd = undefined;
}

/** 行组件用到的那一面。 */
export interface LocatorFace {
  lineOf: (path: string, newText: string, cwd?: string) => number | null | undefined;
  /** 订阅缓存变化（返回 0，纯为了触发重渲染）。 */
  useLines: () => number;
}

/** 订阅封装成 React hook，供行组件使用。 */
export function createLocator(React: AnyReact): LocatorFace {
  function useLines(): number {
    const [, bump] = React.useState(0) as [number, (next: number | ((prev: number) => number)) => void];
    React.useEffect(() => {
      const listener = (): void => bump((tick: number) => tick + 1);
      return subscribeLines(listener);
    }, []);
    return 0;
  }
  return { lineOf, useLines };
}
