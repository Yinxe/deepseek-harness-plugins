/**
 * popover 承载体：锚定在托盘图标下方的轻量面板
 *
 * 定位交给官方 `useAnchoredPosition`（滚动/resize 跟随 + 视口夹紧），我们只负责：
 * 单开语义（运行时保证）、点外部关闭（锚点自身除外，否则点图标会先关再开）、Esc 关闭并把焦点还给图标。
 * 锚点元素拿不到时（会话切换/图标卸载）退回右上角固定位，绝不静默消失。
 *
 * @module @dshp/widget-kit/client/Popover
 */
import { useAnchoredPosition } from '@deepseek-ai/dsh-client-ui-primitives';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { ReactNode } from 'react';
import { WidgetErrorBoundary } from './ErrorBoundary.js';
import { useWidgetData } from './hooks.js';
import type { WidgetRuntime } from './service.js';
import type { NormalizedWidget, WidgetContentProps } from './spec.js';
import styles from './styles.module.css';

function resolveText(value: string | (() => string) | null | undefined, fallback: string): string {
  if (value === null || value === undefined) return fallback;
  return typeof value === 'function' ? value() : value;
}

/** 锚点失效时的兜底位（右上角，与默认层叠落点同一区域）。 */
const FALLBACK = { left: { offset: 24, width: 420 }, top: 88 };

export function Popover({
  runtime,
  widget,
  onError,
}: {
  runtime: WidgetRuntime;
  widget: NormalizedWidget;
  onError?: ((message: string, error?: unknown) => void) | undefined;
}): ReactNode {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const anchorRef = useMemo(() => ({ current: runtime.getAnchor(widget.id) }), [runtime, widget.id]);
  const anchored = useAnchoredPosition({
    open: true,
    anchorRef,
    panelRef,
    side: 'bottom',
    gap: 8,
    margin: 8,
  });
  const data = useWidgetData(runtime, widget, true);
  const close = useCallback(() => {
    runtime.close(widget.id);
  }, [runtime, widget.id]);

  useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    const onPointerDown = (event: PointerEvent): void => {
      const target = event.target as Node | null;
      if (panelRef.current !== null && panelRef.current.contains(target)) return;
      // 点锚点（托盘图标）时不在这里关：让图标自己的 onClick 去 toggle，否则会「关掉又被打开」
      if (anchorRef.current !== null && anchorRef.current.contains(target)) return;
      close();
    };
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape') return;
      close();
      const button = anchorRef.current?.querySelector('button') ?? null;
      button?.focus();
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('keydown', onKeyDown, true);
    };
  }, [anchorRef, close]);

  const title = resolveText(widget.content?.title ?? widget.title, widget.id);
  const content = widget.content;
  const contentProps: WidgetContentProps = {
    frame: 'popover',
    sessionId: runtime.getSession(),
    status: data.status,
    data: data.data,
    ...(data.error === undefined ? {} : { error: data.error }),
    stale: data.stale,
    lastUpdatedAt: data.lastUpdatedAt,
    size: null,
    sizeClass: 'regular',
    minimized: false,
    refresh: data.refresh,
    retry: data.retry,
    close,
  };
  const body = content === null ? null : content.render(contentProps);
  const style =
    anchored ??
    ({
      top: FALLBACK.top,
      left: Math.max(12, runtime.viewport().width - FALLBACK.left.width - FALLBACK.left.offset),
    } as const);

  return (
    <div
      ref={panelRef}
      className={styles.popover}
      style={style}
      role="dialog"
      aria-label={title}
      data-widget={widget.id}
    >
      <div className={styles.popoverHeader}>
        <span className={styles.popoverTitle}>{title}</span>
        <button type="button" className={styles.cardAction} aria-label={`关闭「${title}」`} onClick={close}>
          ✕
        </button>
      </div>
      <div className={styles.popoverBody}>
        <WidgetErrorBoundary label={title} onError={onError} onRetry={data.retry}>
          {body}
        </WidgetErrorBoundary>
      </div>
    </div>
  );
}
