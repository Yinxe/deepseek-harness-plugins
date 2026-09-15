/**
 * 卡片：可拖拽 / 八向缩放 / 最小化 / 关闭的浮层窗口
 *
 * 框架只管**窗口**（几何、z 序、状态、错误隔离、加载/错误/陈旧态），**内容如何随尺寸变化由提供方决定**：
 * 这里只把事实交出去（`size` / `sizeClass` / `frame`）与一个受约束的 `setSize`。
 *
 * @module @dshp/widget-kit/client/Card
 */
import { Menu } from '@deepseek-ai/dsh-client-ui-primitives';
import type { MenuEntry } from '@deepseek-ai/dsh-client-ui-primitives';
import { useCallback, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from 'react';
import { SPEC_DEFAULTS } from './spec.js';
import type { NormalizedWidget, WidgetContentProps } from './spec.js';
import { WidgetErrorBoundary } from './ErrorBoundary.js';
import { ResizeHandles } from './ResizeHandles.js';
import { LockGlyph } from './glyphs.js';
import { useCardDrag, useFramework, useLiveGeometry, useWidgetData } from './hooks.js';
import type { WidgetRuntime } from './service.js';
import styles from './styles.module.css';

/** 尺寸档预设相对描述符 `defaultSize` 的倍率（菜单里的「紧凑 / 常规 / 宽」）。 */
const SIZE_PRESET_FACTOR = { compact: 0.75, regular: 1, wide: 1.35 } as const;

function resolveText(value: string | (() => string) | null | undefined, fallback: string): string {
  if (value === null || value === undefined) return fallback;
  return typeof value === 'function' ? value() : value;
}

export function Card({
  runtime,
  widget,
  onError,
}: {
  runtime: WidgetRuntime;
  widget: NormalizedWidget;
  onError?: ((message: string, error?: unknown) => void) | undefined;
}): ReactNode {
  const snapshot = useFramework(runtime);
  const live = useLiveGeometry(runtime);
  const [menuOpen, setMenuOpen] = useState(false);
  const renderDepth = useRef(0);
  const warnedRenderSize = useRef(false);
  const drag = useCardDrag(runtime, widget, 'move');
  const card = snapshot.layout.cards[widget.id];
  const open = card?.open === true;
  const minimized = card?.minimized === true;
  /** 位置锁定：不可拖动、不可缩放；最小化 / 关闭 / 还原照常。 */
  const locked = card?.locked === true;
  // 最小化 = 折叠成一条标题栏（不是「留一个空窗口」）。内容仍挂在树上（只是不显示），
  // 所以还原是瞬时的、组件自己的内部状态也不会丢；数据轮询不因最小化而中断。
  const data = useWidgetData(runtime, widget, open);

  /** 渲染期调 setSize = 规范禁止的尺寸回环来源：延后到微任务并只警告一次。 */
  const setSize = useCallback(
    (next: { w?: number; h?: number }): void => {
      if (renderDepth.current > 0) {
        if (!warnedRenderSize.current) {
          warnedRenderSize.current = true;
          console.warn(
            `[dshp-widget-kit] 组件「${widget.id}」在 content.render 期间调用了 setSize（规范禁止：` +
              '这会让尺寸与内容互相驱动）。本次已延后处理，请把改尺寸放到事件回调里。',
          );
        }
        queueMicrotask(() => {
          runtime.requestSize(widget.id, next);
        });
        return;
      }
      runtime.requestSize(widget.id, next);
    },
    [runtime, widget.id],
  );

  const menuItems = useMemo<MenuEntry[]>(() => {
    const size = widget.card?.defaultSize ?? SPEC_DEFAULTS.cardDefaultSize;
    const entries: MenuEntry[] = [
      { id: 'minimize', label: minimized ? '还原卡片' : '最小化' },
      { id: 'lock', label: locked ? '解锁位置' : '锁定位置（不可移动与缩放）' },
    ];
    // 锁定后几何相关的项一律不出现：菜单里能点、点了没反应是最糟的一种交互
    if (locked) {
      entries.push({ type: 'label', id: 'locked-label', text: '位置已锁定' });
    } else {
      entries.push(
        { id: 'reset', label: '恢复默认尺寸' },
        { id: 'center', label: '居中' },
        { type: 'label', id: 'size-label', text: '尺寸' },
        {
          id: 'size:compact',
          label: `紧凑 ${String(Math.round(size.w * SIZE_PRESET_FACTOR.compact))}×${String(Math.round(size.h * SIZE_PRESET_FACTOR.compact))}`,
        },
        { id: 'size:regular', label: `常规 ${String(size.w)}×${String(size.h)}` },
        {
          id: 'size:wide',
          label: `宽 ${String(Math.round(size.w * SIZE_PRESET_FACTOR.wide))}×${String(Math.round(size.h * SIZE_PRESET_FACTOR.wide))}`,
        },
      );
    }
    entries.push({ type: 'separator', id: 'sep-1' }, { id: 'close', label: '关闭卡片', danger: true });
    return entries;
  }, [locked, minimized, widget.card]);

  const onMenuSelect = useCallback(
    (id: string): void => {
      setMenuOpen(false);
      const size = widget.card?.defaultSize ?? SPEC_DEFAULTS.cardDefaultSize;
      if (id === 'minimize') {
        runtime.toggleMinimize(widget.id);
        return;
      }
      if (id === 'lock') {
        runtime.setLocked(widget.id, !locked);
        return;
      }
      if (id === 'reset') {
        runtime.resizeTo(widget.id, { w: size.w, h: size.h });
        return;
      }
      if (id === 'center') {
        runtime.center(widget.id);
        return;
      }
      if (id === 'close') {
        runtime.close(widget.id);
        return;
      }
      if (id.startsWith('size:')) {
        const key = id.slice(5) as keyof typeof SIZE_PRESET_FACTOR;
        const factor = SIZE_PRESET_FACTOR[key];
        if (factor === undefined) return;
        runtime.resizeTo(widget.id, { w: Math.round(size.w * factor), h: Math.round(size.h * factor) });
      }
    },
    [locked, runtime, widget.card, widget.id],
  );

  const onHeaderKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>): void => {
      if (locked) return; // 锁定的卡片不吃几何键（服务端也会拦，这里省掉一次无谓的 preventDefault）
      const step = event.shiftKey ? 32 : 8;
      const resizeStep = 16;
      const key = event.key;
      if (key === 'ArrowLeft') runtime.nudge(widget.id, event.altKey ? 0 : -step, 0);
      else if (key === 'ArrowRight') runtime.nudge(widget.id, event.altKey ? 0 : step, 0);
      else if (key === 'ArrowUp') runtime.nudge(widget.id, 0, event.altKey ? 0 : -step);
      else if (key === 'ArrowDown') runtime.nudge(widget.id, 0, event.altKey ? 0 : step);
      else return;
      event.preventDefault();
      if (event.altKey)
        runtime.nudgeResize(
          widget.id,
          key === 'ArrowLeft' ? -resizeStep : key === 'ArrowRight' ? resizeStep : 0,
          key === 'ArrowUp' ? -resizeStep : key === 'ArrowDown' ? resizeStep : 0,
        );
    },
    [locked, runtime, widget.id],
  );

  if (card === undefined || !card.open) return null;

  const stored = live !== null && live.id === widget.id ? live.rect : card;
  // 最小化时**渲染**成一条标题栏：几何仍按原矩形留着，还原后回到原位原尺寸。
  // 注意交出去的事实（size / sizeClass）仍旧按 stored 算 —— 内容还在树上，
  // 不能因为折叠就让它看到一个负数高度。
  const rect = minimized ? { ...stored, h: SPEC_DEFAULTS.titleBarHeight } : stored;
  const contentSize = runtime.contentSize(stored);
  const sizeClass = runtime.sizeClassOf(widget, stored);
  const content = widget.content;
  const contentProps = {
    frame: 'card' as const,
    sessionId: runtime.getSession(),
    status: data.status,
    data: data.data,
    ...(data.error === undefined ? {} : { error: data.error }),
    stale: data.stale,
    lastUpdatedAt: data.lastUpdatedAt,
    size: contentSize,
    sizeClass,
    setSize,
    minimized,
    locked,
    refresh: data.refresh,
    retry: data.retry,
    close: () => {
      runtime.close(widget.id);
    },
  } satisfies WidgetContentProps;

  const title = resolveText(widget.title, widget.id);
  const subtitle = resolveText(content?.title ?? widget.subtitle, '');
  const zIndex = Math.max(1, snapshot.zOrder.indexOf(widget.id) + 1);

  // 渲染期标记：内容在 render 里调 setSize 属于规范禁止的尺寸回环来源，要能识别出来（见 setSize）。
  renderDepth.current += 1;
  let body: ReactNode = null;
  try {
    body = content === null ? null : content.render(contentProps);
  } finally {
    renderDepth.current -= 1;
  }

  return (
    <div
      className={
        styles.card +
        (drag.dragging ? ' ' + styles.cardDragging : '') +
        (minimized ? ' ' + styles.cardMinimized : '') +
        (locked ? ' ' + styles.cardLocked : '')
      }
      style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h, zIndex }}
      role="dialog"
      aria-label={title}
      data-widget={widget.id}
      data-size-class={sizeClass}
      data-minimized={minimized ? 'true' : 'false'}
      data-locked={locked ? 'true' : 'false'}
    >
      <div
        className={styles.cardHeader}
        tabIndex={0}
        aria-label={
          locked
            ? '位置已锁定；双击最小化（在 ⋯ 菜单里解锁）'
            : '拖动标题栏移动卡片；方向键移动，Alt+方向键缩放；双击最小化'
        }
        onKeyDown={onHeaderKeyDown}
        onDoubleClick={() => {
          runtime.toggleMinimize(widget.id);
        }}
        {...(locked ? {} : drag.handlers)}
      >
        <span className={styles.cardTitle}>{title}</span>
        {subtitle !== '' && !minimized && <span className={styles.cardSubtitle}>{subtitle}</span>}
        <span
          className={styles.cardActions}
          onPointerDown={(event) => {
            event.stopPropagation();
          }}
        >
          {widget.card?.resizable !== false && (
            <button
              type="button"
              className={styles.cardAction + (locked ? ' ' + styles.cardActionActive : '')}
              aria-label={locked ? `解锁「${title}」的位置` : `锁定「${title}」的位置`}
              aria-pressed={locked}
              onClick={() => {
                runtime.setLocked(widget.id, !locked);
              }}
            >
              <LockGlyph locked={locked} />
            </button>
          )}
          {widget.card?.minimizable !== false && (
            <button
              type="button"
              className={styles.cardAction}
              aria-label={minimized ? `还原「${title}」` : `最小化「${title}」`}
              onClick={() => {
                runtime.toggleMinimize(widget.id);
              }}
            >
              {minimized ? '▢' : '—'}
            </button>
          )}
          <Menu
            open={menuOpen}
            dense
            portal
            autoFocus
            align="end"
            items={menuItems}
            onSelect={onMenuSelect}
            onClose={() => {
              setMenuOpen(false);
            }}
            anchor={
              <button
                type="button"
                className={styles.cardAction}
                aria-label={`「${title}」的卡片菜单`}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                onClick={() => {
                  setMenuOpen((prev) => !prev);
                }}
              >
                ⋯
              </button>
            }
          />
          {widget.card?.closable !== false && (
            <button
              type="button"
              className={styles.cardAction + ' ' + styles.cardActionDanger}
              aria-label={`关闭「${title}」`}
              onClick={() => {
                runtime.close(widget.id);
              }}
            >
              ✕
            </button>
          )}
        </span>
      </div>

      <div
        className={styles.cardBody + (minimized ? ' ' + styles.cardBodyHidden : '')}
        aria-hidden={minimized}
      >
        <div className={styles.contentHost}>
          <WidgetErrorBoundary label={title} onError={onError} onRetry={data.retry}>
            {body}
          </WidgetErrorBoundary>
        </div>
        {widget.card?.resizable !== false && !locked && !minimized && (
          <ResizeHandles runtime={runtime} widget={widget} />
        )}
      </div>
    </div>
  );
}
