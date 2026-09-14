/**
 * 通用小组件浮窗系统
 *
 * 中心区面板里的独立组件（供应商额度卡 `quota:<vendorId>`、统计图表 `stats:<kind>`）
 * 都可以拖出为全局浮窗（shell.overlay），坐标与开关持久化到 localStorage。
 * 与额度/今日卡旧浮窗并存（旧浮窗跟随当前供应商/今日，widget 浮窗绑定固定组件）。
 *
 * 原来是 `createWidgetSystem(React, ReactDOM)` 工厂：React 注入取消（模块顶层 import），
 * `ReactDOM` 改成模块顶层 `import * as ReactDOM from 'react-dom'`（运行时由 shell 的冻结
 * 模块表注入），portal 的守卫与兜底分支原样保留。
 */
import { useEffect, useReducer, type ReactNode } from 'react';
import * as ReactDOM from 'react-dom';
import styles from './styles.module.css';

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
  } catch {
    /* ignore */
  }
  return {};
}
function saveAll(open: Record<string, WidgetPlacement>): void {
  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify(open));
  } catch {
    /* ignore */
  }
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

/**
 * 小组件注册表（`createWidgetSystem()` 的产出）。
 *
 * 只有真正被别处用到的成员在这里显式声明（旧的 `Record<string, any>` 让「拼错方法名」变成
 * 运行时才发现的问题——`forget` 少一个字母就是浮窗永不消失）。字段与下面的 return 一一对应。
 */
export interface WidgetSystem {
  /** 当前开着的 widget 列表（订阅式：内部有 listeners + forceUpdate）。 */
  useWidgets(): Array<{ id: string; pos: { x: number; y: number } }>;
  /** 某个 id 是否开着。 */
  isOpen(id: string): boolean;
  /** 打开 / 关闭 / 忘记某个 widget。 */
  openWidget(id: string): void;
  closeWidget(id: string): void;
  forget(prefix: string): void;
  /** 拖拽期间的临时坐标与落点提交。 */
  moveWidget(id: string, pos: WidgetPlacement): void;
  commitWidget(id: string): void;
  /** 抓手的事件属性（`{...gripProps(id)}` 展开到拖拽把手上）。 */
  gripProps(id: string): { onPointerDown: (e: unknown) => void };
  /** 浮窗外壳与开关小按钮。 */
  WidgetFloat: (props: { id: string; children?: ReactNode }) => ReactNode;
  WidgetToggle: (props: { id: string; name?: string | undefined }) => ReactNode;
  /** 置顶与坐标查询。 */
  raise(id: string): void;
  zOf(id: string): number;
  clampAllToViewport(): void;
}

export function createWidgetSystem(): WidgetSystem {
  let open: Record<string, WidgetPlacement> = typeof window !== 'undefined' ? loadAll() : {};
  // 置顶次序：数组尾部 = 最新交互/新开（z-index 随之递增），点击/拖动自动置顶
  let order: string[] = Object.keys(open);
  const listeners = new Set<() => void>();

  function emit(save: boolean): void {
    if (save) saveAll(open);
    for (const fn of listeners) {
      try {
        fn();
      } catch {
        /* ignore */
      }
    }
  }
  function portal(node: ReactNode): ReactNode {
    if (node === null || node === undefined) return null;
    try {
      if (
        ReactDOM &&
        typeof ReactDOM.createPortal === 'function' &&
        typeof document !== 'undefined' &&
        document.body
      ) {
        return ReactDOM.createPortal(node, document.body);
      }
    } catch {
      /* ignore */
    }
    return node;
  }

  /** 点击/交互浮窗时置顶（最新者 z 最高） */
  function raise(id: string): void {
    const i = order.indexOf(id);
    if (i < 0 || i === order.length - 1) return;
    order = order.filter((x) => x !== id).concat(id);
    emit(false);
  }
  function zOf(id: string): number {
    const i = order.indexOf(id);
    return 300 + (i < 0 ? 0 : i);
  }

  function useWidgets(): OpenWidget[] {
    const [, force] = useReducer((x: number) => x + 1, 0);
    useEffect(() => {
      const fn = (): void => force();
      listeners.add(fn);
      return () => {
        listeners.delete(fn);
      };
    }, []);
    return Object.keys(open).map((id) => ({
      id,
      pos: (open as Record<string, WidgetPlacement>)[id] as WidgetPlacement,
    }));
  }

  function isOpen(id: string): boolean {
    return Object.hasOwn(open, id);
  }
  function openWidget(id: string, at?: WidgetPlacement): void {
    const pos = clampPos(
      at || (open[id] as WidgetPlacement | undefined) || cascadePos(Object.keys(open).length),
    );
    open = Object.assign({}, open, { [id]: pos });
    order = order.filter((x) => x !== id).concat(id); // 新开/移动都置顶
    emit(true);
  }
  /** 按前缀丢弃浮窗记录（组件被移除后用它清理 localStorage 里的遗留项） */
  function forget(prefix: string): void {
    const next = Object.assign({}, open as Record<string, WidgetPlacement>);
    let changed = false;
    for (const id of Object.keys(next)) {
      if (!id.startsWith(prefix)) continue;
      delete next[id];
      order = order.filter((x) => x !== id);
      changed = true;
    }
    if (!changed) return;
    open = next;
    emit(true);
  }
  function closeWidget(id: string): void {
    if (!Object.hasOwn(open, id)) return;
    const next = Object.assign({}, open);
    delete next[id];
    open = next;
    order = order.filter((x) => x !== id);
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

  /** 窗口缩放后钳制回视口（浮窗不丢失） */
  function clampAllToViewport(): void {
    let changed = false;
    const next = Object.assign({}, open);
    for (const id of Object.keys(next)) {
      const c = clampPos(next[id] as WidgetPlacement);
      if (c.x !== (next[id] as WidgetPlacement).x || c.y !== (next[id] as WidgetPlacement).y) {
        next[id] = c;
        changed = true;
      }
    }
    if (changed) {
      open = next;
      emit(true);
    }
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
    let ox = -60,
      oy = -20;
    try {
      const t = e.target;
      if (t && t.closest) {
        const card = t.closest('[data-tm-widget], .' + styles.card + ', .' + styles.today);
        if (card) {
          const r = (card as HTMLElement).getBoundingClientRect();
          ox = e.clientX - r.left;
          oy = e.clientY - r.top;
        }
      }
    } catch {
      /* ignore */
    }
    let out = false;
    function mv(ev: any): void {
      if (!out && Math.hypot(ev.clientX - sx, ev.clientY - sy) < 8) return;
      out = true;
      openWidget(id, { x: ev.clientX - ox, y: ev.clientY - oy });
    }
    function up(): void {
      try {
        window.removeEventListener('pointermove', mv);
      } catch {
        /* ignore */
      }
      try {
        window.removeEventListener('pointerup', up);
      } catch {
        /* ignore */
      }
      if (!out) openWidget(id);
    }
    try {
      window.addEventListener('pointermove', mv);
    } catch {
      /* ignore */
    }
    try {
      window.addEventListener('pointerup', up);
    } catch {
      /* ignore */
    }
  }
  function gripProps(id: string): { onPointerDown: (e: any) => void } {
    return { onPointerDown: (e: any) => gripOut(id, e) };
  }

  /** 浮窗拖动（整卡可拖）：交互元素上按下不触发；fromGrip=true 时忽略 .tm-grip 自身的跳过（抓手主动发起）。 */
  function startDrag(id: string, cur: WidgetPlacement, e: any, fromGrip?: boolean): void {
    if (e.button !== undefined && e.button !== 0) return;
    if (e.target && e.target.closest) {
      const skip =
        e.target.closest(
          'button, input, select, textarea, a, .' +
            styles.seg +
            ', .' +
            styles.modelchip +
            ', .' +
            styles.switch,
        ) ||
        (!fromGrip && e.target.closest('.' + styles.grip));
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
      } catch {
        /* ignore */
      }
      try {
        window.removeEventListener('pointerup', up);
      } catch {
        /* ignore */
      }
      commitWidget();
    }
    try {
      window.addEventListener('pointermove', mv);
    } catch {
      /* ignore */
    }
    try {
      window.addEventListener('pointerup', up);
    } catch {
      /* ignore */
    }
  }

  /** 通用浮窗外壳：只做定位（fixed + 坐标），不带任何边框/背景/内边距/阴影。
   * 组件自身的卡片样式即浮窗样式 —— 浮出前后视觉完全一致，原位置由调用方隐藏。
   * 拖动：卡片内任意非交互区域按住即可拖（抓手 ⠿ 同样有效）。 */
  function WidgetFloat(props: { id: string; children?: ReactNode }): ReactNode {
    const list = useWidgets();
    const cur = list.filter((w) => w.id === props.id)[0];
    // 窗口缩放时把坐标钳制回视口（hook 必须在早退前声明）
    useEffect(() => {
      const onR = (): void => {
        const p = (open as Record<string, WidgetPlacement>)[props.id];
        if (!p) return;
        const c = clampPos(p);
        if (c.x !== p.x || c.y !== p.y) moveWidget(props.id, c);
      };
      window.addEventListener('resize', onR);
      return () => window.removeEventListener('resize', onR);
    }, [props.id]);
    if (!cur) return null;
    return portal(
      <div
        className={styles.widgetFloat + ' ' + styles.in}
        style={{
          left: cur.pos.x + 'px',
          top: cur.pos.y + 'px',
          width: FLOAT_W + 'px',
          zIndex: zOf(props.id),
        }}
        onPointerDown={(e: any) => {
          raise(props.id); // 交互即置顶
          const t = e.target;
          if (
            t &&
            t.closest &&
            t.closest(
              'button, input, select, textarea, a, .' +
                styles.grip +
                ', .' +
                styles.seg +
                ', .' +
                styles.modelchip +
                ', .' +
                styles.switch,
            )
          )
            return;
          startDrag(props.id, cur.pos, e);
        }}
      >
        {props.children}
      </div>,
    );
  }

  /**
   * 小组件开关按钮（抓手 + 状态按钮）：侧栏中显示 ⧉弹出，浮出后同一位置显示 回归侧栏。
   * 放在卡片/图表标题栏使用，浮窗内外渲染一致。
   */
  function WidgetToggle(props: { id: string; name?: string | undefined }): ReactNode {
    const list = useWidgets();
    const opened = list.some((w) => w.id === props.id);
    /** 抓手/按钮的文案里带上目标卡片名 —— 避免"抓手挂在这张卡上、弹出的却是另一张"的困惑 */
    const what = props.name ? '「' + props.name + '」' : '本卡片';
    return (
      <span style={{ display: 'inline-flex', gap: 2, alignItems: 'center', marginLeft: 6, flex: 'none' }}>
        <span
          className={styles.grip}
          title={
            opened ? what + ' 已弹出为独立浮窗（可拖动）' : '按住拖出 ' + what + ' 为独立浮窗，点按直接弹出'
          }
          aria-label={'拖动或弹出 ' + what}
          {...gripProps(props.id)}
        >
          {'⠿'}
        </span>
        {opened ? (
          <button
            className={styles.minibtn}
            title={'把 ' + what + ' 收回原位（关闭浮窗）'}
            onClick={() => closeWidget(props.id)}
          >
            {'回归'}
          </button>
        ) : (
          <button
            className={styles.minibtn}
            title={'弹出 ' + what + ' 为独立浮窗'}
            onClick={() => openWidget(props.id)}
          >
            {'⧉'}
          </button>
        )}
      </span>
    );
  }

  return {
    useWidgets,
    isOpen,
    openWidget,
    closeWidget,
    forget,
    moveWidget,
    commitWidget,
    gripProps,
    WidgetFloat,
    WidgetToggle,
    raise,
    zOf,
    clampAllToViewport,
  };
}
