/**
 * 通用小组件浮窗系统
 *
 * 右栏/左栏的独立组件（供应商额度卡 `quota:<vendorId>`、统计图表 `stats:<kind>`）
 * 都可以拖出为全局浮窗（shell.overlay），坐标与开关持久化到 localStorage。
 * 与额度/今日卡旧浮窗并存（旧浮窗跟随当前供应商/今日，widget 浮窗绑定固定组件）。
 */
import type { AnyReact } from './types.js';

export interface WidgetPlacement {
  x: number;
  y: number;
}
export interface OpenWidget {
  id: string;
  pos: WidgetPlacement;
}

const LS_KEY = 'tm-widgets';
/** 统一的浮窗宽度（clamp 与渲染共用；所有小组件一致） */
const FLOAT_W = 360;
/** 统一的最大高度（clamp 底部余量与 CSS 一致） */
const FLOAT_H = Math.round(FLOAT_W * 0.6);

function loadAll(): Record<string, WidgetPlacement> {
  try {
    const raw = window.localStorage.getItem(LS_KEY) || 'null';
    const v = JSON.parse(raw) as Record<string, unknown> | null;
    if (v && typeof v === 'object') {
      const out: Record<string, WidgetPlacement> = {};
      for (const k of Object.keys(v)) {
        const p = (v as Record<string, any>)[k] as { x: number; y: number };
        if (p && isFinite(p.x) && isFinite(p.y)) out[k] = { x: Number(p.x), y: Number(p.y) };
      }
      return out;
    }
  } catch { /* ignore */ }
  return {};
}
function saveAll(open: Record<string, WidgetPlacement>): void {
  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify(open));
  } catch { /* ignore */ }
}
function clampPos(p: WidgetPlacement): WidgetPlacement {
  try {
    const vw = window.innerWidth || 1024;
    const vh = window.innerHeight || 768;
    return {
      x: Math.max(8, Math.min(p.x, vw - FLOAT_W)),
      y: Math.max(8, Math.min(p.y, vh - FLOAT_H)),
    };
  } catch {
    return p;
  }
}
function cascadePos(count: number): WidgetPlacement {
  try {
    const vw = window.innerWidth || 1024;
    const vh = window.innerHeight || 768;
    const step = (count % 8) * 36;
    return {
      x: Math.max(8, Math.min(vw - FLOAT_W - 24 - step, vw - FLOAT_W)),
      y: Math.max(8, Math.min(96 + step, vh - FLOAT_H)),
    };
  } catch {
    return { x: 120, y: 120 };
  }
}

export function createWidgetSystem(React: AnyReact, ReactDOM: any): Record<string, any> {
  const h = React.createElement;
  let open: Record<string, WidgetPlacement> = typeof window !== 'undefined' ? loadAll() : {};
  const listeners = new Set<() => void>();

  function emit(save: boolean): void {
    if (save) saveAll(open);
    for (const fn of listeners) {
      try {
        fn();
      } catch { /* ignore */ }
    }
  }
  function portal(node: any): any {
    if (node === null || node === undefined) return null;
    try {
      if (ReactDOM && typeof ReactDOM.createPortal === 'function' && typeof document !== 'undefined' && document.body) {
        return ReactDOM.createPortal(node, document.body);
      }
    } catch { /* ignore */ }
    return node;
  }

  function useWidgets(): OpenWidget[] {
    const [, force] = (React.useReducer as any)((x: number) => x + 1, 0);
    React.useEffect(() => {
      const fn = (): void => force();
      listeners.add(fn);
      return () => {
        listeners.delete(fn);
      };
    }, []);
    return Object.keys(open).map((id) => ({ id, pos: (open as Record<string, WidgetPlacement>)[id] as WidgetPlacement }));
  }

  function isOpen(id: string): boolean {
    return Object.hasOwn(open, id);
  }
  function openWidget(id: string, at?: WidgetPlacement): void {
    const pos = clampPos(at || (open[id] as WidgetPlacement | undefined) || cascadePos(Object.keys(open).length));
    open = Object.assign({}, open, { [id]: pos });
    emit(true);
  }
  function closeWidget(id: string): void {
    if (!Object.hasOwn(open, id)) return;
    const next = Object.assign({}, open);
    delete next[id];
    open = next;
    emit(true);
  }
  function moveWidget(id: string, pos: WidgetPlacement): void {
    if (!Object.hasOwn(open, id)) return;
    open = Object.assign({}, open, { [id]: clampPos(pos) });
    emit(false);
  }
  function commitWidget(): void {
    emit(true);
  }

  /** 抓手：点按=弹出浮窗；按住拖动超 8px=直接拖出并跟随鼠标。
   * 拖拽保持“按下时鼠标在卡片内的偏移”——浮窗左上角 = 指针 − 锚点偏移，
   * 不会因为固定偏移而瞬移。已浮出的抓手直接转为浮窗拖拽（同样保偏移）。 */
  function gripOut(id: string, e: any): void {
    if (e.button !== undefined && e.button !== 0) return;
    if (e.preventDefault) e.preventDefault();
    if (e.stopPropagation) e.stopPropagation();
    // 已浮出：交给 startDrag（保持抓取偏移，平滑移动）
    if (Object.hasOwn(open, id)) {
      startDrag(id, (open as Record<string, WidgetPlacement>)[id] as WidgetPlacement, e, true);
      return;
    }
    const sx = e.clientX;
    const sy = e.clientY;
    // 锚点偏移：指针相对原始卡片左上角（浮窗内容与卡片一致，这样拖出后抓取点不会跳）
    let ox = -60, oy = -20;
    try {
      const t = e.target;
      if (t && t.closest) {
        const card = t.closest('[data-tm-widget], .tm-card, .tm-today');
        if (card) {
          const r = (card as HTMLElement).getBoundingClientRect();
          ox = e.clientX - r.left;
          oy = e.clientY - r.top;
        }
      }
    } catch { /* ignore */ }
    let out = false;
    function mv(ev: any): void {
      if (!out && Math.hypot(ev.clientX - sx, ev.clientY - sy) < 8) return;
      out = true;
      openWidget(id, { x: ev.clientX - ox, y: ev.clientY - oy });
    }
    function up(): void {
      try {
        window.removeEventListener('pointermove', mv);
      } catch { /* ignore */ }
      try {
        window.removeEventListener('pointerup', up);
      } catch { /* ignore */ }
      if (!out) openWidget(id);
    }
    try {
      window.addEventListener('pointermove', mv);
    } catch { /* ignore */ }
    try {
      window.addEventListener('pointerup', up);
    } catch { /* ignore */ }
  }
  function gripProps(id: string): { onPointerDown: (e: any) => void } {
    return { onPointerDown: (e: any) => gripOut(id, e) };
  }

  /** 浮窗拖动（整卡可拖）：交互元素上按下不触发；fromGrip=true 时忽略 .tm-grip 自身的跳过（抓手主动发起）。 */
  function startDrag(id: string, cur: WidgetPlacement, e: any, fromGrip?: boolean): void {
    if (e.button !== undefined && e.button !== 0) return;
    if (e.target && e.target.closest) {
      const skip = e.target.closest('button, input, select, textarea, a, .tm-seg, .tm-modelchip, .tm-switch') || (!fromGrip && e.target.closest('.tm-grip'));
      if (skip) return;
    }
    if (e.preventDefault) e.preventDefault();
    const ox = e.clientX - cur.x;
    const oy = e.clientY - cur.y;
    function mv(ev: any): void {
      moveWidget(id, { x: ev.clientX - ox, y: ev.clientY - oy });
    }
    function up(): void {
      try {
        window.removeEventListener('pointermove', mv);
      } catch { /* ignore */ }
      try {
        window.removeEventListener('pointerup', up);
      } catch { /* ignore */ }
      commitWidget();
    }
    try {
      window.addEventListener('pointermove', mv);
    } catch { /* ignore */ }
    try {
      window.addEventListener('pointerup', up);
    } catch { /* ignore */ }
  }

  /** 通用浮窗外壳：只做定位（fixed + 坐标），不带任何边框/背景/内边距/阴影。
   * 组件自身的卡片样式即浮窗样式 —— 浮出前后视觉完全一致，原位置由调用方隐藏。
   * 拖动：卡片内任意非交互区域按住即可拖（抓手 ⠿ 同样有效）。 */
  function WidgetFloat(props: { id: string; children?: any }): any {
    const list = useWidgets();
    const cur = list.filter((w) => w.id === props.id)[0];
    if (!cur) return null;
    return portal(
      h(
        'div',
        {
          className: 'tm-widgetFloat tm-in',
          style: { left: cur.pos.x + 'px', top: cur.pos.y + 'px', width: FLOAT_W + 'px' },
          onPointerDown: (e: any) => {
            const t = e.target;
            if (t && t.closest && t.closest('button, input, select, textarea, a, .tm-grip, .tm-seg, .tm-modelchip, .tm-switch')) return;
            startDrag(props.id, cur.pos, e);
          },
        },
        props.children,
      ),
    );
  }

  /**
   * 小组件开关按钮（抓手 + 状态按钮）：侧栏中显示 ⧉弹出，浮出后同一位置显示 回归侧栏。
   * 放在卡片/图表标题栏使用，浮窗内外渲染一致。
   */
  function WidgetToggle(props: { id: string }): any {
    const list = useWidgets();
    const opened = list.some((w) => w.id === props.id);
    return h('span', { style: { display: 'inline-flex', gap: 2, alignItems: 'center', marginLeft: 6, flex: 'none' } },
      h('span', Object.assign(
        { className: 'tm-grip', title: opened ? '已弹出为独立浮窗（可拖动）' : '按住拖出为独立浮窗，点按直接弹出' },
        gripProps(props.id),
      ), '⠿'),
      opened
        ? h('button', { className: 'tm-minibtn', title: '回归侧栏（关闭浮窗，内容仍在原位）', onClick: () => closeWidget(props.id) }, '回归')
        : h('button', { className: 'tm-minibtn', title: '弹出为独立浮窗', onClick: () => openWidget(props.id) }, '⧉'));
  }

  return { useWidgets, isOpen, openWidget, closeWidget, moveWidget, commitWidget, gripProps, WidgetFloat, WidgetToggle };
}
