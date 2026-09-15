/**
 * 会话顶部托盘 —— 注册进 `conversation.session.header.utilities` 的那一个条目
 *
 * 像系统状态栏：每个组件一个常驻图标（可带徽标），点击开/最小化/还原（任务栏语义），
 * 超出可见上限的进溢出菜单（菜单里有完整的键盘通道：打开、显示/隐藏、上移/下移）。
 * 图标之间可拖拽换序（点击阈值 8px，`pointercancel` 丢弃本次手势）。
 *
 * @module @dshp/widget-kit/client/Tray
 */
import { Menu, Tooltip } from '@deepseek-ai/dsh-client-ui-primitives';
import type { MenuEntry, MenuItem } from '@deepseek-ai/dsh-client-ui-primitives';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent, ReactNode } from 'react';
import { mergeVisibleOrder } from './store.js';
import { useFramework } from './hooks.js';
import type { WidgetRuntime } from './service.js';
import type { NormalizedWidget } from './spec.js';
import styles from './styles.module.css';

/** 判定为「拖拽」而不是「点击」的位移阈值（px）。 */
const DRAG_THRESHOLD = 8;

function resolveText(value: string | (() => string)): string {
  return typeof value === 'function' ? value() : value;
}

interface DragState {
  id: string;
  pointerId: number;
  startX: number;
  startY: number;
  moved: boolean;
  order: string[];
}

export function Tray({
  runtime,
  sessionId,
}: {
  runtime: WidgetRuntime;
  sessionId?: string | null | undefined;
}): ReactNode {
  const snapshot = useFramework(runtime);
  const [menuOpen, setMenuOpen] = useState(false);
  const [preview, setPreview] = useState<string[] | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const suppressClick = useRef(false);

  // 内容面绑定开启它的会话：把当前会话告诉运行时（切换会话时运行时会把内容面关掉）
  useEffect(() => {
    if (sessionId === undefined) return;
    runtime.setSession(sessionId ?? null);
  }, [runtime, sessionId]);

  /** 完整顺序（把尚未进 order 的新组件补在后面）。 */
  const orderIds = useMemo(() => {
    const ids = [...snapshot.layout.tray.order];
    for (const widget of snapshot.widgets) {
      if (!ids.includes(widget.id)) ids.push(widget.id);
    }
    return ids;
  }, [snapshot.layout.tray.order, snapshot.widgets]);

  const ordered = useMemo(
    () => orderIds.map((id) => snapshot.widgets.find((widget) => widget.id === id)),
    [orderIds, snapshot.widgets],
  );
  const ready = ordered.filter((widget): widget is NormalizedWidget => widget !== undefined);
  const hidden = new Set(snapshot.layout.tray.hidden);
  const visibleIds = ready.filter((widget) => !hidden.has(widget.id)).map((widget) => widget.id);
  const displayIds = preview ?? visibleIds;
  const limit = Math.max(1, snapshot.prefs.maxVisibleIcons);
  const shownIds = displayIds.slice(0, limit);
  const shown = shownIds
    .map((id) => ready.find((widget) => widget.id === id))
    .filter((widget): widget is NormalizedWidget => widget !== undefined);
  const overflow = ready.filter((widget) => !shownIds.includes(widget.id));

  // ── 拖拽换序（1D；点击阈值 + 取消语义）───────────────────────────────

  const onIconPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>, id: string): void => {
      if (event.button !== 0) return;
      if (visibleIds.length < 2) return;
      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {
        /* 不支持捕获时仍然允许拖（只是移出元素后收不到事件） */
      }
      dragRef.current = {
        id,
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        moved: false,
        order: visibleIds,
      };
      setPreview(visibleIds);
    },
    [visibleIds],
  );

  const onIconPointerMove = useCallback((event: ReactPointerEvent<HTMLButtonElement>): void => {
    const drag = dragRef.current;
    if (drag === null || drag.pointerId !== event.pointerId) return;
    if (
      !drag.moved &&
      Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) < DRAG_THRESHOLD
    ) {
      return;
    }
    drag.moved = true;
    if (typeof document === 'undefined') return;
    const slot = document.elementFromPoint(event.clientX, event.clientY)?.closest('[data-tray-index]');
    const raw = slot?.getAttribute('data-tray-index') ?? null;
    const target = raw === null ? Number.NaN : Number.parseInt(raw, 10);
    if (!Number.isFinite(target) || target < 0) return;
    const from = drag.order.indexOf(drag.id);
    if (from < 0 || from === target) return;
    const next = drag.order.slice();
    next.splice(from, 1);
    next.splice(Math.min(target, next.length), 0, drag.id);
    drag.order = next;
    setPreview(next);
  }, []);

  const finishDrag = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>, commit: boolean): void => {
      const drag = dragRef.current;
      if (drag === null || drag.pointerId !== event.pointerId) return;
      dragRef.current = null;
      try {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }
      } catch {
        /* ignore */
      }
      setPreview(null);
      if (!commit || !drag.moved) return;
      suppressClick.current = true;
      runtime.setOrder(mergeVisibleOrder(orderIds, drag.order));
    },
    [orderIds, runtime],
  );

  const onIconClick = useCallback(
    (id: string): void => {
      if (suppressClick.current) {
        suppressClick.current = false;
        return;
      }
      runtime.toggle(id);
    },
    [runtime],
  );

  // ── 溢出菜单 ──────────────────────────────────────────────────────────

  const menuItems = useMemo<MenuEntry[]>(() => {
    const entries: MenuEntry[] = [{ type: 'label', id: 'widgets-label', text: '组件' }];
    for (const widget of ready) {
      const title = resolveText(widget.title);
      const submenu: MenuItem[] = [
        { id: `open:${widget.id}`, label: runtime.isOpen(widget.id) ? '收起 / 最小化' : '打开' },
        {
          id: `hide:${widget.id}`,
          label: hidden.has(widget.id) ? '在托盘中显示' : '从托盘隐藏',
        },
        { id: `up:${widget.id}`, label: '上移' },
        { id: `down:${widget.id}`, label: '下移' },
      ];
      entries.push({
        id: `w:${widget.id}`,
        label: hidden.has(widget.id) ? `已隐藏 · ${title}` : title,
        submenu,
      });
    }
    entries.push({ type: 'separator', id: 'sep-tray' });
    entries.push({ id: 'reset-tray', label: '重置托盘顺序与隐藏' });
    return entries;
    // hidden / snapshot 变化都要重建菜单文案
  }, [hidden, ready, runtime, snapshot]);

  const onMenuSelect = useCallback(
    (id: string): void => {
      setMenuOpen(false);
      if (id === 'reset-tray') {
        runtime.resetTrayLayout();
        return;
      }
      const index = id.indexOf(':');
      if (index < 0) return;
      const action = id.slice(0, index);
      const widgetId = id.slice(index + 1);
      if (action === 'open') runtime.toggle(widgetId);
      else if (action === 'hide') runtime.setHidden(widgetId, !hidden.has(widgetId));
      else if (action === 'up') runtime.setTrayOrder(widgetId, -1);
      else if (action === 'down') runtime.setTrayOrder(widgetId, 1);
    },
    [hidden, runtime],
  );

  const overflowBadge = overflow.some((widget) => (snapshot.badges[widget.id] ?? null) !== null);

  if (!snapshot.ready || !snapshot.prefs.trayEnabled || ready.length === 0) return null;

  return (
    <div className={styles.tray} role="group" aria-label="小组件托盘">
      {shown.map((widget, index) => {
        const badge = snapshot.badges[widget.id] ?? null;
        const active = runtime.isOpen(widget.id);
        const dragging = preview !== null && dragRef.current?.id === widget.id;
        const title = resolveText(widget.title);
        const label = badge?.title !== undefined && badge.title !== '' ? `${title} · ${badge.title}` : title;
        const tone = badge?.tone ?? 'info';
        return (
          <span
            key={widget.id}
            className={styles.trayAnchor}
            data-tray-index={index}
            ref={(element) => {
              runtime.setAnchor(widget.id, element);
            }}
          >
            <Tooltip label={label} side="bottom" delayMs={400}>
              <button
                type="button"
                className={
                  styles.trayBtn +
                  (active ? ' ' + styles.trayBtnActive : '') +
                  (dragging ? ' ' + styles.trayBtnDragging : '')
                }
                aria-label={label}
                aria-haspopup="dialog"
                aria-expanded={active}
                onPointerDown={(event) => {
                  onIconPointerDown(event, widget.id);
                }}
                onPointerMove={onIconPointerMove}
                onPointerUp={(event) => {
                  finishDrag(event, true);
                }}
                onPointerCancel={(event) => {
                  finishDrag(event, false);
                }}
                onLostPointerCapture={(event) => {
                  finishDrag(event, false);
                }}
                onClick={() => {
                  onIconClick(widget.id);
                }}
              >
                <span className={styles.trayGlyph}>{widget.icon}</span>
                {badge !== null && badge.text !== undefined && badge.text !== '' ? (
                  <span className={styles.trayBadgeText} data-tone={tone}>
                    {badge.text.slice(0, 2)}
                  </span>
                ) : badge !== null && (badge.dot === true || badge.tone !== undefined) ? (
                  <span className={styles.trayBadge} data-tone={tone} />
                ) : null}
              </button>
            </Tooltip>
          </span>
        );
      })}

      {overflow.length > 0 && (
        <span className={styles.trayAnchor}>
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
                className={styles.trayBtn}
                aria-label={`还有 ${String(overflow.length)} 个组件`}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                onClick={() => {
                  setMenuOpen((prev) => !prev);
                }}
              >
                <span className={styles.trayGlyph}>⋯</span>
                {overflowBadge && <span className={styles.trayBadge} data-tone="info" />}
              </button>
            }
          />
        </span>
      )}
    </div>
  );
}
