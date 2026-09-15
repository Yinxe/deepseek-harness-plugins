/**
 * 会话顶部托盘 —— 注册进 `conversation.session.header.utilities` 的那一个条目
 *
 * 像系统状态栏：每个组件一个常驻图标（可带徽标），点击开/最小化/还原（任务栏语义），
 * 超出可见上限的进溢出菜单（菜单里有完整的键盘通道：打开、显示/隐藏、上移/下移）。
 * 图标之间可拖拽换序（点击阈值 8px，`pointercancel` 丢弃本次手势）；被禁用的组件不出现在这里
 * （启用/禁用走设置页或「组件诊断」卡片）。
 *
 * 换序用 `reorderByPointer`：命中判定只看**其余图标**的中心线，因此左右两个方向对称可用 ——
 * 旧实现拿 `elementFromPoint` 找落点，被拖的图标自己也在指针下面，于是渲染顺序一换就回到原地，
 * 表现为「只能从右往左拖」。
 *
 * @module @dshp/widget-kit/client/Tray
 */
import { Menu, Tooltip } from '@deepseek-ai/dsh-client-ui-primitives';
import type { MenuEntry, MenuItem } from '@deepseek-ai/dsh-client-ui-primitives';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent, ReactNode } from 'react';
import { mergeVisibleOrder, reorderByPointer } from './store.js';
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
  /** 完整可见顺序（含被「可见上限」截掉、进溢出菜单的那些）。 */
  visible: string[];
  /** 当前真正渲染出来的那批图标（拖拽只在这批上排序，指针也只可能落在它们身上）。 */
  shown: string[];
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
  const containerRef = useRef<HTMLDivElement | null>(null);
  const disabled = useMemo(() => new Set(snapshot.layout.disabled), [snapshot.layout.disabled]);

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
  // 被禁用的组件不进托盘（图标、卡片、面板一并停用 —— 见 runtime.setEnabled）
  const ready = ordered.filter(
    (widget): widget is NormalizedWidget => widget !== undefined && !disabled.has(widget.id),
  );
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
        visible: visibleIds,
        shown: visibleIds.slice(0, limit),
      };
      setPreview(visibleIds);
    },
    [limit, visibleIds],
  );

  /** 读当前渲染出来的各图标中心线（顺序 = DOM 顺序 = 预览顺序）。 */
  const readCenters = useCallback((ids: readonly string[]): number[] => {
    const root = containerRef.current;
    if (root === null) return [];
    const centers = new Map<string, number>();
    for (const node of root.querySelectorAll('[data-tray-id]')) {
      const nodeId = node.getAttribute('data-tray-id');
      if (nodeId === null) continue;
      const rect = node.getBoundingClientRect();
      centers.set(nodeId, rect.left + rect.width / 2);
    }
    const out: number[] = [];
    for (const id of ids) {
      const center = centers.get(id);
      if (center === undefined) return []; // 少一个就不动：宁可这一次不排序，也不要错位
      out.push(center);
    }
    return out;
  }, []);

  const onIconPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>): void => {
      const drag = dragRef.current;
      if (drag === null || drag.pointerId !== event.pointerId) return;
      if (
        !drag.moved &&
        Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) < DRAG_THRESHOLD
      ) {
        return;
      }
      drag.moved = true;
      const others = drag.shown.filter((id) => id !== drag.id);
      const centers = readCenters(others);
      const nextShown = reorderByPointer(drag.shown, drag.id, centers, event.clientX);
      if (nextShown.every((id, index) => id === drag.shown[index])) return;
      drag.shown = nextShown;
      drag.visible = mergeVisibleOrder(drag.visible, nextShown);
      setPreview(drag.visible);
    },
    [readCenters],
  );

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
      runtime.setOrder(mergeVisibleOrder(orderIds, drag.visible));
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
    <div className={styles.tray} role="group" aria-label="小组件托盘" ref={containerRef}>
      {shown.map((widget) => {
        const badge = snapshot.badges[widget.id] ?? null;
        const active = runtime.isOpen(widget.id);
        const dragging = preview !== null && dragRef.current?.id === widget.id;
        const title = resolveText(widget.title);
        const label = badge?.title !== undefined && badge.title !== '' ? `${title} · ${badge.title}` : title;
        const hoverTriggered = widget.presentation === 'popover' && widget.popover?.trigger === 'hover';
        const tone = badge?.tone ?? 'info';
        return (
          <span
            key={widget.id}
            className={styles.trayAnchor}
            data-tray-id={widget.id}
            ref={(element) => {
              runtime.setAnchor(widget.id, element);
            }}
            // 悬停展开的组件：指针进出图标都要告诉运行时（延迟与宽限由描述符定）
            onPointerEnter={() => {
              runtime.hoverEnter(widget.id);
            }}
            onPointerLeave={() => {
              runtime.hoverLeave(widget.id);
            }}
          >
            <Tooltip
              label={label}
              side="bottom"
              delayMs={400}
              // 悬停展开的 popover 本身就是它的说明，再叠一层气泡只会互相打架
              disabled={hoverTriggered}
            >
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
