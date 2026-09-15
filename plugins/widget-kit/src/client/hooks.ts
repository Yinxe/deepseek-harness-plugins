/**
 * React 粘合层：快照订阅、内容数据、指针拖拽
 *
 * - `useFramework` / `useLiveGeometry`：`useSyncExternalStore` 订阅运行时快照。快照是**不可变对象**，
 *   只有真正变更时才换引用 —— 这治的是 token-meter 那套「任一浮窗移动 → 全部浮窗 forceUpdate」。
 * - `useWidgetData`：`load` 的加载/错误/陈旧/轮询全在这一处，组件提供方不写任何请求生命周期代码。
 * - `useCardDrag`：**照抄官方 `dsh-client-ui-layout` 的 `DragHandle` 范式** —— 指针捕获 + rAF 合并 +
 *   `pointerup` 补最终值 + `pointercancel`/`onLostPointerCapture` 收尾 + 卸载 effect 兜底。
 *
 * @module @dshp/widget-kit/client/hooks
 */
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { applyResize, clampRect } from './geometry.js';
import type { Rect, RectConstraints, ResizeDir, Viewport } from './geometry.js';
import type { FrameworkSnapshot, LiveGeometry, WidgetRuntime } from './service.js';
import type { NormalizedWidget } from './spec.js';
import type { CONTENT_STATUS } from './spec.js';

/** 订阅 layout 快照（托盘、卡片层、设置页都用它）。 */
export function useFramework(runtime: WidgetRuntime): FrameworkSnapshot {
  const subscribe = useCallback((listener: () => void) => runtime.subscribe(listener), [runtime]);
  const getSnapshot = useCallback(() => runtime.getSnapshot(), [runtime]);
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/** 订阅拖拽期间的活动几何（只有正在拖的那张卡真的会因此重渲染）。 */
export function useLiveGeometry(runtime: WidgetRuntime): LiveGeometry | null {
  const subscribe = useCallback((listener: () => void) => runtime.subscribeLive(listener), [runtime]);
  const getSnapshot = useCallback(() => runtime.getLive(), [runtime]);
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export interface WidgetDataState {
  status: (typeof CONTENT_STATUS)[number];
  data: unknown;
  error: { message: string; retriable: boolean } | undefined;
  stale: boolean;
  lastUpdatedAt: number | null;
}

const IDLE: WidgetDataState = {
  status: 'ready',
  data: undefined,
  error: undefined,
  stale: false,
  lastUpdatedAt: null,
};

/**
 * 内容面的数据生命周期：打开时加载、可选轮询、失败保留旧数据并标记 `stale`、卸载即中止。
 *
 * `load` 解析为 `null` / `undefined` 时状态是 `empty`（框架唯一会判空的地方，其余空态由提供方自己渲染）。
 *
 * @param runtime - 框架运行时。
 * @param widget - 规范化后的组件。
 * @param enabled - 内容面是否真的在展示（最小化/关闭时为 false，轮询随之停止）。
 */
export function useWidgetData(
  runtime: WidgetRuntime,
  widget: NormalizedWidget,
  enabled: boolean,
): WidgetDataState & { refresh(): void; retry(): void } {
  const load = widget.content?.load ?? null;
  const refreshMs = widget.content?.refreshMs ?? 0;
  const sessionId = runtime.getSession();
  const [state, setState] = useState<WidgetDataState>(load === null ? IDLE : { ...IDLE, status: 'loading' });
  const requestId = useRef(0);
  const flight = useRef<AbortController | null>(null);

  const run = useCallback(
    (reason: 'open' | 'refresh' | 'retry'): void => {
      if (load === null) return;
      requestId.current += 1;
      const id = requestId.current;
      flight.current?.abort();
      const controller = new AbortController();
      flight.current = controller;
      setState((prev) =>
        prev.data === undefined
          ? { ...prev, status: 'loading', error: undefined }
          : { ...prev, status: 'ready', stale: false },
      );
      Promise.resolve()
        .then(() => load({ sessionId, signal: controller.signal, reason }))
        .then((data) => {
          if (requestId.current !== id) return;
          const empty = data === null || data === undefined;
          setState({
            status: empty ? 'empty' : 'ready',
            data: empty ? undefined : data,
            error: undefined,
            stale: false,
            lastUpdatedAt: Date.now(),
          });
        })
        .catch((error: unknown) => {
          if (requestId.current !== id) return;
          const message = String((error as Error)?.message ?? error);
          setState((prev) =>
            prev.data === undefined
              ? {
                  status: 'error',
                  data: undefined,
                  error: { message, retriable: true },
                  stale: false,
                  lastUpdatedAt: null,
                }
              : { ...prev, status: 'ready', stale: true, error: { message, retriable: true } },
          );
        });
    },
    [load, sessionId],
  );

  useEffect(() => {
    if (!enabled) return undefined;
    run('open');
    let disposeInterval: (() => void) | null = null;
    if (refreshMs > 0) {
      disposeInterval = runtime.scheduleInterval(() => {
        run('refresh');
      }, refreshMs);
    }
    return () => {
      requestId.current += 1;
      flight.current?.abort();
      disposeInterval?.();
    };
  }, [enabled, refreshMs, run, runtime, widget.id]);

  const refresh = useCallback(() => {
    run('refresh');
  }, [run]);
  const retry = useCallback(() => {
    run('retry');
  }, [run]);

  return { ...state, refresh, retry };
}

export interface CardDragHandlers {
  onPointerDown(event: ReactPointerEvent): void;
  onPointerMove(event: ReactPointerEvent): void;
  onPointerUp(event: ReactPointerEvent): void;
  onPointerCancel(event: ReactPointerEvent): void;
  onLostPointerCapture(event: ReactPointerEvent): void;
}

/**
 * 卡片拖动 / 缩放（两者只差一个方向参数）。
 *
 * @param runtime - 框架运行时。
 * @param widget - 目标组件。
 * @param mode - `'move'` 拖动整卡，或八个缩放方向之一。
 * @returns `dragging` 状态与要展开到把手元素上的事件处理器。
 */
export function useCardDrag(
  runtime: WidgetRuntime,
  widget: NormalizedWidget,
  mode: 'move' | ResizeDir,
): { dragging: boolean; handlers: CardDragHandlers } {
  const [dragging, setDragging] = useState(false);
  const capture = useRef<{ element: HTMLElement; id: number } | null>(null);
  const origin = useRef({ x: 0, y: 0 });
  const latest = useRef({ x: 0, y: 0 });
  const startRect = useRef<Rect | null>(null);
  const frame = useRef<number | null>(null);
  const modeRef = useRef(mode);
  modeRef.current = mode;

  const compute = useCallback((): Rect | null => {
    const start = startRect.current;
    if (start === null) return null;
    const dx = latest.current.x - origin.current.x;
    const dy = latest.current.y - origin.current.y;
    const constraints: RectConstraints = runtime.constraintsOf(widget);
    const viewport: Viewport = runtime.viewport();
    return modeRef.current === 'move'
      ? clampRect({ x: start.x + dx, y: start.y + dy, w: start.w, h: start.h }, constraints, viewport)
      : applyResize(start, modeRef.current, dx, dy, constraints, viewport);
  }, [runtime, widget]);

  /** 收尾：`commit` = 落盘当前几何；`false` = 丢弃本次手势（pointercancel / 失去捕获）。 */
  const endDrag = useCallback(
    (commit: boolean) => {
      const active = capture.current;
      if (active === null) return;
      capture.current = null;
      if (frame.current !== null) {
        cancelAnimationFrame(frame.current);
        frame.current = null;
      }
      try {
        if (active.element.hasPointerCapture(active.id)) active.element.releasePointerCapture(active.id);
      } catch {
        /* ignore */
      }
      setDragging(false);
      if (commit) runtime.commitLive(widget.id);
      else runtime.cancelLive();
    },
    [runtime, widget.id],
  );

  const onPointerDown = useCallback(
    (event: ReactPointerEvent): void => {
      if (event.button !== 0 || capture.current !== null) return;
      event.preventDefault();
      event.stopPropagation();
      const element = event.currentTarget as HTMLElement;
      try {
        element.setPointerCapture(event.pointerId);
      } catch {
        /* 某些环境不支持捕获：仍然允许拖（只是移出元素后收不到事件） */
      }
      capture.current = { element, id: event.pointerId };
      origin.current = { x: event.clientX, y: event.clientY };
      latest.current = { x: event.clientX, y: event.clientY };
      startRect.current = runtime.rectOf(widget.id);
      runtime.raise(widget.id);
      runtime.beginLive(widget.id, modeRef.current);
      setDragging(true);
    },
    [runtime, widget.id],
  );

  const onPointerMove = useCallback(
    (event: ReactPointerEvent): void => {
      if (capture.current?.id !== event.pointerId) return;
      latest.current = { x: event.clientX, y: event.clientY };
      if (frame.current !== null) return;
      frame.current = requestAnimationFrame(() => {
        frame.current = null;
        const next = compute();
        if (next !== null) runtime.setLive(widget.id, next);
      });
    },
    [compute, runtime, widget.id],
  );

  const onPointerUp = useCallback(
    (event: ReactPointerEvent): void => {
      if (capture.current?.id !== event.pointerId) return;
      latest.current = { x: event.clientX, y: event.clientY };
      const next = compute();
      if (next !== null) runtime.setLive(widget.id, next);
      endDrag(true);
    },
    [compute, endDrag, runtime, widget.id],
  );

  const onPointerCancel = useCallback(
    (event: ReactPointerEvent): void => {
      if (capture.current?.id !== event.pointerId) return;
      endDrag(false);
    },
    [endDrag],
  );

  useEffect(
    () => () => {
      if (capture.current !== null) endDrag(true);
    },
    [endDrag],
  );

  return {
    dragging,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      onLostPointerCapture: onPointerCancel,
    },
  };
}
