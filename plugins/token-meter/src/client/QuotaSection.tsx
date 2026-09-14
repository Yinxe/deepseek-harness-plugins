/**
 * 额度 Section（quota）：设置页供应商运维 + 侧边栏额度卡 + 浮窗
 *
 * 原实现：dsh-token-quota/client.js（1238 行手写 bundle）→ 本文件为等价 TS 重写，
 * 行为对齐（多供应商/动态表单/脱敏留空/secret-to-cred/滚动-or-余额双形态/extra 扩展展示/
 * 供应商菜单浮层/浮窗拖拽/localStorage 坐标），仅样式前缀由 tq- 改为 tm-、
 * 路由前缀改为 dshp-token-meter。
 *
 * 分层渲染：供应商数据的「主体展示」不再由本文件分支（旧 RollingBody/PaygBody/ExtraBody
 * 已下沉到 ./providers/*）——本文件只提供 UI 工具集（QRow/fmt/fmtLeft…），
 * 「provider 专属渲染器 → 声明式区块 → legacy 兜底」由 providers 层负责。
 *
 * 工厂形态：`createQuotaSection(React, P, ReactDOM, widgets)` 的 **React / P / ReactDOM 三个
 * 形参取消** —— React 与官方构件改成模块顶层 import，`ReactDOM` 改成
 * `import * as ReactDOM from 'react-dom'`（portal 的守卫与兜底分支原样保留）；`widgets`
 * （调用方用 `createWidgetSystem()` 建出的唯一实例）是真实依赖，仍以参数传入。
 * 类名统一走 CSS Module（`styles.module.css`），动态拼接走本地 `cx()`。
 */
import { useEffect, useState, type ReactNode } from 'react';
import * as ReactDOM from 'react-dom';
import {
  Button,
  CodeBlock,
  IconChevronDownOutline14,
  Menu,
  RiskConfirmation,
  Tooltip,
} from '@deepseek-ai/dsh-client-ui-primitives';
import { createProviderKit, createProviderRenderers, fallbackErrorInfo } from './providers/index.js';
import { DISPLAY_NAME } from '../name.js';
import styles from './styles.module.css';
import type { ErrorInfo, ProviderMeta, Vendor, VendorSnapshot } from './types.js';

const BASE = '/ext/dshp-token-meter';
const ID_RE = /^[a-z0-9][a-z0-9-]{1,30}$/;

function num(v: unknown, d: number): number {
  const n = Number(v);
  return isFinite(n) ? n : d;
}
function fmt(n: unknown): string {
  try {
    return Number(n).toLocaleString('zh-CN', { maximumFractionDigits: 2 });
  } catch {
    return String(n);
  }
}
function fmtLeft(sec: number): string {
  sec = Math.max(0, Math.round(sec));
  if (sec >= 86400) return Math.floor(sec / 86400) + '天后';
  if (sec >= 3600) return Math.floor(sec / 3600) + '小时后';
  if (sec >= 60) return Math.floor(sec / 60) + '分后';
  return sec + '秒后';
}
function timeAgo(iso: string): string {
  const t = Date.parse(iso);
  if (isNaN(t)) return '未知';
  const s = Math.floor((Date.now() - t) / 1000);
  if (s < 60) return s + ' 秒前';
  const m = Math.floor(s / 60);
  if (m < 60) return m + ' 分钟前';
  const hh = Math.floor(m / 60);
  if (hh < 24) return hh + ' 小时前';
  return Math.floor(hh / 24) + ' 天前';
}
/** 滚动窗口占用等级（阈值集中在此，便于调整）：
 *  ok  < 70%          正常（品牌蓝）
 *  warn 70–90%        注意（黄）
 *  bad  90–100%       快完了（红）—— 新增档位
 *  over ≥ 100%        已用尽/超限（红 + 脉冲） */
const QUOTA_LEVEL = { warn: 70, bad: 90, over: 100 };
function levelOf(pct: number): string {
  if (pct >= QUOTA_LEVEL.over) return 'over';
  if (pct >= QUOTA_LEVEL.bad) return 'bad';
  if (pct >= QUOTA_LEVEL.warn) return 'warn';
  return 'ok';
}
/** 等级 → 提示语（进度条 title） */
function levelTip(lvl: string): string {
  if (lvl === 'over') return '额度已用尽（或超出），可能被限流/拒绝';
  if (lvl === 'bad') return '额度快用完了，注意后续调用';
  if (lvl === 'warn') return '额度占用偏高';
  return '额度充足';
}

const TYPE_LABEL_FALLBACK: Record<string, string> = {
  opencode: 'OC',
  deepseek: 'DS',
  commandcode: 'CC',
  manual: '手动',
};
const TYPE_TITLE_FALLBACK = [
  { type: 'opencode', title: 'opencode（Go+Zen 合并）' },
  { type: 'deepseek', title: 'deepseek（官方·自动选路）' },
  { type: 'commandcode', title: 'commandcode（Command Code）' },
  { type: 'manual', title: 'manual（手动）' },
];

const FLOAT_LS_OPEN = 'tm-quota-float';
const FLOAT_LS_POS = 'tm-quota-float-pos';
const OLD_FLOAT_LS_OPEN = 'tquota.float.open';
const OLD_FLOAT_LS_POS = 'tquota.float.pos';

function loadFloatOpen(): boolean {
  try {
    if (window.localStorage.getItem(FLOAT_LS_OPEN) === '1') return true;
    if (window.localStorage.getItem(OLD_FLOAT_LS_OPEN) === '1') return true;
  } catch {
    /* ignore */
  }
  return false;
}
function loadFloatPos(): { x: number; y: number } | null {
  try {
    const raw =
      window.localStorage.getItem(FLOAT_LS_POS) || window.localStorage.getItem(OLD_FLOAT_LS_POS) || 'null';
    const v = JSON.parse(raw as string) as { x: number; y: number } | null;
    if (v && isFinite(v.x) && isFinite(v.y)) return { x: Number(v.x), y: Number(v.y) };
  } catch {
    /* ignore */
  }
  return null;
}
function saveFloat(open: boolean, pos: { x: number; y: number } | null): void {
  try {
    window.localStorage.setItem(FLOAT_LS_OPEN, open ? '1' : '0');
    if (pos)
      window.localStorage.setItem(
        FLOAT_LS_POS,
        JSON.stringify({ x: Math.round(pos.x), y: Math.round(pos.y) }),
      );
  } catch {
    /* ignore */
  }
}
function defaultFloatPos(): { x: number; y: number } {
  try {
    const vw = window.innerWidth || 1024,
      vh = window.innerHeight || 768;
    return { x: Math.max(8, vw - 320), y: Math.max(8, Math.min(120, vh - 320)) };
  } catch {
    return { x: 100, y: 100 };
  }
}
function clampFloatPos(p: { x: number; y: number }): { x: number; y: number } {
  try {
    const vw = window.innerWidth || 1024,
      vh = window.innerHeight || 768;
    return { x: Math.max(8, Math.min(p.x, vw - 304)), y: Math.max(8, Math.min(p.y, vh - 140)) };
  } catch {
    return p;
  }
}

/**
 * 拼类名。
 *
 * CSS Module 的映射是宽松声明（`shared/types/css-modules.d.ts`），每个值都是 `string | undefined`
 * ——直接拼字符串会得到 `"a undefined"`。这里统一滤掉空值。
 *
 * @param names - 类名候选。
 * @returns 空格分隔的类名。
 */
function cx(...names: Array<string | undefined>): string {
  return names.filter((name) => name !== undefined).join(' ');
}

/** 徽章配色 → 类名（旧 `tm-badge-<kind>`；未知 kind 无对应规则，退化成只有底色）。 */
const BADGE_CLASS: Record<string, string | undefined> = {
  ok: styles.badgeOk,
  warn: styles.badgeWarn,
  muted: styles.badgeMuted,
  info: styles.badgeInfo,
  bad: styles.badgeBad,
};

/** 状态点色调 → 类名（旧 `tm-dot <tone>` 的复合选择器，两段都要走 CSS Module）。 */
const DOT_TONE_CLASS: Record<string, string | undefined> = {
  bad: styles.bad,
  warn: styles.warn,
};

/** 小组件浮窗系统（调用方用 `createWidgetSystem()` 建出的唯一实例）。 */
export interface WidgetsApi {
  useWidgets(): Array<{ id: string; pos: { x: number; y: number } }>;
  WidgetToggle: (props: { id: string; name?: string | undefined }) => ReactNode;
}

/** 官方 `Button` 缺席时的原生兜底（props 与官方 Button 对齐到「能透传就行」）。 */
type BtnFallbackProps = { children?: ReactNode } & Record<string, unknown>;

/** 状态页/卡片共用的一行：左标题 + 说明，右控件。 */
interface SecRowProps {
  label?: ReactNode;
  desc?: ReactNode;
  /** 控件换行到标题下方独占整行（长控件用）。 */
  wrap?: boolean | undefined;
  children?: ReactNode;
}

/** 堆叠式表单字段：标签 → 控件 → 说明。 */
interface FormFieldProps {
  label?: ReactNode;
  desc?: ReactNode;
  hint?: ReactNode;
  required?: boolean | undefined;
  children?: ReactNode;
}

/** 胶囊下拉。 */
interface PillSelectProps {
  disabled?: boolean | undefined;
  value: string;
  /** 收起状态下按钮上显示的文字。 */
  selectedLabel: string;
  options: Array<{ id: string; label: string }>;
  onSelect: (id: string) => void;
}

/** 供应商草稿（`settings.yaml` 里一条 vendor 的编辑态）。 */
interface VendorDraft {
  id?: string | undefined;
  name?: string | undefined;
  type: string;
  params?: Record<string, unknown> | undefined;
}

/** 供应商表单。 */
interface VendorFormProps {
  draft: VendorDraft;
  set: (d: VendorDraft) => void;
  busy: boolean;
  isEdit?: boolean | undefined;
  submitLabel?: string | undefined;
  onSubmit: () => void;
  onCancel?: (() => void) | undefined;
}

/** 侧边栏额度卡。 */
interface QuotaSidebarProps {
  /** `false` = 窄栏只占位（旧默认宽版）。 */
  wide?: boolean | undefined;
}

/** 中心区额度查询面板。 */
export interface QuotaViewProps {
  /** 由中心区视图注入（跳到同一 tab 的「设置」分区）。 */
  onOpenSettings?: (() => void) | undefined;
}

/** 峰谷显示器。 */
interface PeakIndicatorProps {
  /** 小组件浮窗系统（可选）。 */
  widgets?: WidgetsApi | undefined;
  widgetId?: string | undefined;
}

/** 峰谷悬浮明细卡。 */
interface PeakPopoverProps {
  now: number;
  peak: boolean;
  isWeekend: boolean;
  at: any;
}

/** 状态徽章。 */
interface BadgeProps {
  kind: string;
  text: string;
}

/** 快照主体（交给 provider 分层渲染）。 */
interface SnapBodyProps {
  snap: VendorSnapshot;
  type?: string | undefined;
  now: number;
}

interface QuotaStoreState {
  cfg: any;
  snaps: Record<string, VendorSnapshot>;
  loading: boolean;
  error: string;
  menuOpen: boolean;
  errOpen: boolean;
  menuAt: { x: number; y: number } | null;
  lastErr: { id: string; msg: string; at: string } | null;
  namespace: string;
  docPath: string;
  providers: ProviderMeta[] | null;
  floatOpen: boolean;
  floatPos: { x: number; y: number } | null;
}

/** 单例额度 store 的对外方法（调用方按这些名字取用）。 */
export interface QuotaStoreApi {
  useStore: () => QuotaStoreState;
  useNow: (step?: number) => number;
  ensureLoad: () => Promise<void>;
  reload: () => Promise<void>;
  refreshVendor: (id?: string) => Promise<void>;
  syncState: () => Promise<void>;
  setActive: (id: string) => Promise<void>;
  setEnabled: (enabled: boolean) => Promise<void>;
  setVendorEnabled: (id: string, enabled: boolean) => Promise<void>;
  setRefresh: (sec: number) => Promise<void>;
  setFloatOpen: (open: boolean) => void;
  openMenu: (e: any) => void;
  savePrefs: (patch: Record<string, unknown>) => Promise<{ ok: boolean; error?: string | undefined }>;
  activeOf: (s: QuotaStoreState) => Vendor | null;
  typeLabel: (type: string) => string;
  remainOf: (w: { resetInSec: number }, snap: VendorSnapshot, nowMs: number) => number;
  call: (method: string, args?: any) => Promise<any>;
}

/** 设置页与侧栏共用的 UI 零件（调用方按这些名字取用）。 */
export interface QuotaUIApi {
  Badge: (props: BadgeProps) => ReactNode;
  SecRow: (props: SecRowProps) => ReactNode;
  FormField: (props: FormFieldProps) => ReactNode;
  PillSelect: (props: PillSelectProps) => ReactNode;
  VendorForm: (props: VendorFormProps) => ReactNode;
  secretBadge: (kind: string) => ReactNode;
}

/** 本 Section 对外暴露的全部构件。 */
export interface QuotaSectionParts {
  QuotaSettingsPage: () => ReactNode;
  QuotaSidebar: (props: QuotaSidebarProps) => ReactNode;
  QuotaFloatEntry: () => ReactNode;
  QuotaView: (props: QuotaViewProps) => ReactNode;
  QuotaVendorWidget: (props: { vendorId: string }) => ReactNode;
  PeakIndicator: (props: PeakIndicatorProps) => ReactNode;
  quotaStore: QuotaStoreApi;
  quotaUI: QuotaUIApi;
}

export function createQuotaSection(widgets?: WidgetsApi): QuotaSectionParts {
  const WG = widgets || null;

  function tmPortal(node: ReactNode): ReactNode {
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

  const store: {
    state: QuotaStoreState;
    listeners: Set<() => void>;
    get(): QuotaStoreState;
    subscribe(fn: () => void): () => void;
    set(patch: Partial<QuotaStoreState>): void;
  } = {
    state: {
      cfg: null,
      snaps: {},
      loading: false,
      error: '',
      menuOpen: false,
      errOpen: false,
      menuAt: null,
      lastErr: null,
      namespace: '',
      docPath: '',
      providers: null,
      floatOpen: typeof window !== 'undefined' ? loadFloatOpen() : false,
      floatPos: typeof window !== 'undefined' ? loadFloatPos() : null,
    },
    listeners: new Set(),
    get() {
      return this.state;
    },
    subscribe(fn) {
      this.listeners.add(fn);
      return () => {
        this.listeners.delete(fn);
      };
    },
    set(patch) {
      this.state = Object.assign({}, this.state, patch);
      this.listeners.forEach((fn) => {
        try {
          fn();
        } catch {
          /* ignore */
        }
      });
    },
  };
  let loaded = false;

  async function call(method: string, args?: any): Promise<any> {
    const MAP: Record<string, [string, string]> = {
      'quota.load': ['GET', '/state'],
      'quota.refresh': ['POST', '/refresh'],
      'quota.set-active': ['POST', '/set-active'],
      'quota.set-refresh': ['POST', '/set-refresh'],
      'quota.set-enabled': ['POST', '/set-enabled'],
      'quota.set-vendor-enabled': ['POST', '/set-vendor-enabled'],
      'quota.add-vendor': ['POST', '/add-vendor'],
      'quota.update-vendor': ['POST', '/update-vendor'],
      'quota.delete-vendor': ['POST', '/delete-vendor'],
      'quota.secret-to-cred': ['POST', '/secret-to-cred'],
      'config.save': ['POST', '/config'],
    };
    const ent = MAP[method];
    if (!ent) throw new Error('unknown quota method: ' + method);
    const m = ent[0],
      path = BASE + ent[1];
    if (m === 'GET') {
      const r = await fetch(path, { cache: 'no-store' });
      return r.json();
    }
    const r = await fetch(path, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(args || {}),
      cache: 'no-store',
    });
    return r.json();
  }

  /** 同步节拍（单例）：同一客户端所有额度卡/浮窗共享一个轮询定时器，
   *  避免 N 张卡各自 interval。Host 侧才是真正的上游拉取方。 */
  let syncRefs = 0;
  let syncTimer: number | null = null;
  let syncMsCur = 0;
  function startSyncLoop(ms: number): void {
    syncRefs++;
    if (syncTimer === null || syncMsCur !== ms) {
      if (syncTimer !== null) window.clearInterval(syncTimer);
      syncMsCur = ms;
      syncTimer = window.setInterval(() => {
        if (document.visibilityState === 'visible') void syncState();
      }, ms);
    }
  }
  function stopSyncLoop(): void {
    syncRefs--;
    if (syncRefs <= 0 && syncTimer !== null) {
      window.clearInterval(syncTimer);
      syncTimer = null;
      syncMsCur = 0;
    }
  }

  async function ensureLoad(): Promise<void> {
    if (loaded) return;
    loaded = true;
    store.set({ loading: true });
    try {
      const r = await call('quota.load');
      if (r && r.ok) {
        // 只同步快照与配置；不在此自动触发上游拉取（Host 定时器负责，避免多客户端重复 fetch）
        store.set({
          loading: false,
          cfg: r.config,
          snaps: r.snaps || {},
          namespace: r.namespace || '',
          docPath: r.docPath || '',
          providers: r.providers || null,
          error: r.error || '',
        });
      } else store.set({ loading: false, error: (r && r.error) || '加载失败' });
    } catch {
      store.set({ loading: false, error: '连接 Host 失败' });
    }
  }
  async function reload(): Promise<void> {
    loaded = false;
    store.set({ menuOpen: false, errOpen: false, menuAt: null, lastErr: null });
    await ensureLoad();
  }
  /** 同步 Host 快照（只读 GET /state，不触发上游拉取）。
   * Host 已按 refreshSec 在服务端定时拉取，客户端多开也只读同一份内存快照。
   * 同步 cfg（多客户端配置一致）与 snaps（额度数据），但不动本地菜单/错误展开状态。 */
  async function syncState(): Promise<void> {
    if (store.get().loading) return; // 本地正在手动操作（切换/拉取）时让位
    try {
      const r = await call('quota.load');
      if (!(r && r.ok)) return;
      const cur = store.get();
      store.set({
        cfg: r.config || cur.cfg,
        snaps: r.snaps || cur.snaps,
        namespace: r.namespace || cur.namespace,
        docPath: r.docPath || cur.docPath,
        providers: r.providers || cur.providers,
      });
    } catch {
      /* 同步失败静默（下次轮询重试） */
    }
  }
  async function refreshVendor(id?: string): Promise<void> {
    store.set({ loading: true });
    try {
      const r = await call('quota.refresh', id ? { id } : {});
      if (r && r.ok) {
        const snaps = Object.assign({}, store.get().snaps);
        let failMsg = '';
        Object.keys(r.snaps || {}).forEach((k) => {
          const s2 = (r.snaps as Record<string, VendorSnapshot>)[k] as VendorSnapshot;
          if (!s2) return;
          if (s2.ok) snaps[k] = s2;
          else if (!id || k === id) failMsg = s2.error || '刷新失败';
        });
        const patch: Partial<QuotaStoreState> = { loading: false, snaps };
        if (failMsg) patch.lastErr = { id: id || '', msg: failMsg, at: new Date().toISOString() };
        else {
          patch.lastErr = null;
          patch.error = '';
        }
        store.set(patch);
      } else store.set({ loading: false, error: (r && r.error) || '刷新失败' });
    } catch {
      store.set({ loading: false, error: '连接 Host 失败' });
    }
  }
  async function setActive(id: string): Promise<void> {
    try {
      const r = await call('quota.set-active', { id });
      if (r && r.ok) {
        const cfg = Object.assign({}, store.get().cfg, { activeVendor: id });
        store.set({ cfg, menuOpen: false, errOpen: false, menuAt: null, lastErr: null, error: '' });
        if (id && cfg && cfg.enabled !== false) void refreshVendor(id);
      } else {
        store.set({ menuOpen: false, menuAt: null, error: (r && r.error) || '切换供应商失败' });
      }
    } catch {
      store.set({ menuOpen: false, menuAt: null, error: '连接 Host 失败，供应商未切换' });
    }
  }
  function setFloatOpen(open: boolean): void {
    const pos = clampFloatPos(store.get().floatPos || loadFloatPos() || defaultFloatPos());
    store.set({ floatOpen: open, floatPos: pos });
    saveFloat(open, pos);
  }
  /** 通用偏好补丁（showToday/defaultRange 等）：经 POST /config，成功后合入本地 cfg，侧栏/中心区即时同步 */
  async function savePrefs(patch: Record<string, unknown>): Promise<{ ok: boolean; error?: string }> {
    try {
      const r = await call('config.save', patch);
      if (r && r.ok) {
        const cfg = Object.assign({}, store.get().cfg, r.config || patch);
        store.set({ cfg, error: '' });
        return { ok: true };
      }
      return { ok: false, error: (r && r.error) || '保存失败' };
    } catch {
      return { ok: false, error: '连接 Host 失败' };
    }
  }
  async function setEnabled(enabled: boolean): Promise<void> {
    try {
      const r = await call('quota.set-enabled', { enabled });
      if (r && r.ok) await reload();
      else store.set({ error: (r && r.error) || '保存失败' });
    } catch {
      store.set({ error: '连接 Host 失败' });
    }
  }
  /**
   * 单个供应商的余额查询开关：false = 退出 Host 主动定时拉取（手动「拉取」照常可用）。
   * 本地即时合入 cfg，不整页 reload（避免卡片闪烁）；Host 快照由下一轮 sync 对齐。
   */
  async function setVendorEnabled(id: string, enabled: boolean): Promise<void> {
    try {
      const r = await call('quota.set-vendor-enabled', { id, enabled });
      if (!(r && r.ok)) {
        store.set({ error: (r && r.error) || '保存失败' });
        return;
      }
      const cur = store.get();
      const cfg = cur.cfg
        ? Object.assign({}, cur.cfg, {
            vendors: (cur.cfg.vendors || []).map((v: Vendor) => {
              if (v.id !== id) return v;
              const nv: Vendor = { ...v };
              if (enabled) delete nv.enabled;
              else nv.enabled = false;
              return nv;
            }),
          })
        : cur.cfg;
      store.set({ cfg, error: '' });
    } catch {
      store.set({ error: '连接 Host 失败' });
    }
  }
  async function setRefresh(sec: number): Promise<void> {
    try {
      const r = await call('quota.set-refresh', { sec });
      if (r && r.ok) await reload();
      else store.set({ error: (r && r.error) || '保存失败' });
    } catch {
      store.set({ error: '连接 Host 失败' });
    }
  }

  function useStore(): QuotaStoreState {
    const force = useState(0)[1];
    useEffect(() => store.subscribe(() => force((x: number) => x + 1)), []);
    return store.get();
  }
  function useNow(step?: number): number {
    const st = useState(Date.now());
    useEffect(() => {
      const id = window.setInterval(() => st[1](Date.now()), step || 1000);
      return () => window.clearInterval(id);
    }, []);
    return st[0];
  }
  function remainOf(w: { resetInSec: number }, snap: VendorSnapshot, nowMs: number): number {
    const f = snap.fetchedAtMs || nowMs;
    return Math.max(0, w.resetInSec - (nowMs - f) / 1000);
  }
  function activeOf(s: QuotaStoreState): Vendor | null {
    if (!s.cfg) return null;
    const vs = s.cfg.vendors || [];
    const av = s.cfg.activeVendor;
    if (av === '') return null;
    if (av === undefined || av === null) return vs[0] || null;
    return vs.filter((v: Vendor) => v.id === av)[0] || vs[0] || null;
  }
  function curSymbol(cur: string): string {
    if (cur === 'CNY') return '¥';
    if (cur === 'USD') return '$';
    return cur ? cur + ' ' : '';
  }
  function providerMetas(): ProviderMeta[] | null {
    try {
      const ps = store.get().providers;
      if (Array.isArray(ps) && ps.length) return ps;
    } catch {
      /* ignore */
    }
    return null;
  }
  function typeLabel(type: string): string {
    const ps = providerMetas();
    if (ps) {
      const hit = ps.filter((x) => x && x.type === type)[0];
      if (hit && hit.label) return hit.label;
    }
    return TYPE_LABEL_FALLBACK[type] || type;
  }
  function typeOptions(): Array<{ type: string; title: string }> {
    const ps = providerMetas();
    if (ps) return ps.map((x) => ({ type: x.type, title: x.title || x.type }));
    return TYPE_TITLE_FALLBACK.slice();
  }
  function providerMetaOf(type: string): ProviderMeta | null {
    const ps = providerMetas();
    if (ps) return ps.filter((x) => x && x.type === type)[0] || null;
    return null;
  }

  /* ---------- provider 分层渲染装配 ----------
     通用零件（滚动刷新条/余额块/指标/图表/失败卡…）集中在 providers/kit.ts，
     每个 provider 在 providers/ui/<type>.ts 里有**属于它自己的完整 UI**；
     没写专属 UI 的 type 自动落到声明式区块 → legacy 兜底（见 providers/registry.ts）。
     本文件只提供数据访问与少量格式化工具。 */
  const kit = createProviderKit({
    num,
    fmt,
    fmtLeft,
    curSymbol,
    remainOf,
    timeAgo,
    levelOf,
    levelTip,
    errOpen: () => !!store.get().errOpen,
    toggleErr: () => store.set({ errOpen: !store.get().errOpen }),
  });
  const providerViews = createProviderRenderers(kit);
  const ErrBox = kit.ErrorCard;

  /** 快照主体：交给 provider 分层渲染（专属 UI → 声明式 → legacy）。 */
  function SnapBody(props: SnapBodyProps): ReactNode {
    return providerViews.renderBody(props.type || '', props.snap, props.now);
  }

  /** 失败快照 → 结构化信息（Host 已给则直接用） */
  function errInfoOf(snap: VendorSnapshot | undefined, fallbackMsg: string): ErrorInfo {
    const info = snap && snap.errorInfo;
    if (info && typeof info === 'object' && typeof info.title === 'string') return info;
    return fallbackErrorInfo((snap && snap.error) || fallbackMsg);
  }

  /** 状态点严重度：失败原因越「要人管」越红，限流/网络类只是黄。 */
  function dotToneOf(snap: VendorSnapshot | undefined): string | undefined {
    if (!snap) return undefined;
    if (snap.ok) return undefined;
    const info = snap.errorInfo;
    const tone = info && info.tone ? String(info.tone) : 'warn';
    return tone === 'bad' ? DOT_TONE_CLASS['bad'] : DOT_TONE_CLASS['warn'];
  }

  function openMenu(e: any): void {
    const open = !store.get().menuOpen;
    let at: { x: number; y: number } | null = null;
    if (open) {
      let x = 160,
        y = 220;
      if (e && typeof e.clientX === 'number' && typeof e.clientY === 'number') {
        x = e.clientX + 4;
        y = e.clientY + 4;
      }
      try {
        const vw = window.innerWidth || 1024,
          vh = window.innerHeight || 768;
        x = Math.max(8, Math.min(x, vw - 280));
        y = Math.max(8, Math.min(y, vh - 260));
      } catch {
        x = Math.max(8, x);
        y = Math.max(8, y);
      }
      at = { x, y };
    }
    store.set({ menuOpen: open, menuAt: open ? at : null, error: '' });
  }

  function VendorPopOverlay(): ReactNode {
    const s = useStore();
    if (!s.menuOpen || !s.menuAt) return null;
    const vendors = (s.cfg && s.cfg.vendors) || [];
    const a0 = activeOf(s);
    const curId = a0 ? a0.id : '';
    let mx = (s.menuAt as { x: number; y: number }).x,
      my = (s.menuAt as { x: number; y: number }).y;
    try {
      const vw = window.innerWidth || 1024,
        vh = window.innerHeight || 768;
      mx = Math.max(8, Math.min(mx, vw - 280));
      my = Math.max(8, Math.min(my, vh - 260));
    } catch {
      mx = Math.max(8, mx);
      my = Math.max(8, my);
    }
    const style = { left: mx + 'px', top: my + 'px' };
    return tmPortal(
      <div>
        <button
          className={styles.backdrop}
          aria-label="关闭供应商菜单"
          onClick={() => store.set({ menuOpen: false, menuAt: null })}
        />
        <div className={cx(styles.popmenu, styles.in)} style={style}>
          {vendors.map((v: Vendor) => (
            <button
              key={v.id}
              className={cx(styles.mitem, v.id === curId ? styles.active : undefined)}
              onClick={() => void setActive(v.id)}
            >
              <span className={styles.grow}>{v.name}</span>
              <span className={styles.vtype}>{typeLabel(v.type)}</span>
            </button>
          ))}
          <button
            key="__none"
            className={cx(styles.mitem, !curId ? styles.active : undefined)}
            title="不显示任何供应商额度，保持极简"
            onClick={() => void setActive('')}
          >
            <span className={styles.grow}>{'无 · 极简模式'}</span>
            <span className={styles.vtype}>{'隐藏'}</span>
          </button>
        </div>
      </div>,
    );
  }

  function quotaContent(
    s: QuotaStoreState,
    a: Vendor,
    snap: VendorSnapshot | undefined,
    now: number,
  ): ReactNode[] {
    const stale = s.lastErr && (!s.lastErr.id || s.lastErr.id === a.id) && snap && snap.ok ? s.lastErr : null;
    let cbody: ReactNode = null;
    if (snap && snap.ok) {
      cbody = <SnapBody snap={snap} type={a.type} now={now} />;
    } else if (s.loading) {
      cbody = (
        <div className={styles.qmeta}>
          <span>{'拉取中…'}</span>
        </div>
      );
    } else {
      const le0 = s.lastErr && (!s.lastErr.id || s.lastErr.id === a.id) ? s.lastErr : null;
      const msg = (snap && snap.error) || (le0 ? le0.msg : '') || s.error || '暂无数据，点击↻刷新';
      const meta =
        a.name +
        (snap && snap.at
          ? ' · 失败于' + timeAgo(snap.at)
          : le0 && le0.at
            ? ' · 失败于' + timeAgo(le0.at)
            : '') +
        (snap && snap.secretKind ? ' · 凭据:' + snap.secretKind : '');
      cbody = (
        <ErrBox
          info={snap ? errInfoOf(snap, msg) : fallbackErrorInfo(msg)}
          msg={msg}
          meta={meta}
          onRetry={() => void refreshVendor(a.id)}
        />
      );
    }
    return [
      s.error ? (
        <div key="e" className={styles.err}>
          {s.error}
        </div>
      ) : null,
      <div key="b">{cbody}</div>,
      <div key="m" className={styles.qmeta}>
        <span>
          {(snap && snap.at ? '更新' + timeAgo(snap.at) : '未拉取') +
            (snap && snap.ok && snap.via ? ' · ' + snap.via : '')}
        </span>
        <span>
          {stale ? (
            <button
              className={cx(styles.mini, styles.warn)}
              title={stale.msg + '（旧数据仍可用）'}
              onClick={() => store.set({ errOpen: !store.get().errOpen })}
            >
              {'⚠旧数据'}
            </button>
          ) : null}
          <button className={styles.mini} title="刷新当前供应商" onClick={() => void refreshVendor(a.id)}>
            {'↻ 刷新'}
          </button>
        </span>
      </div>,
      stale && s.errOpen ? (
        <div key="d" className={styles.errdetail}>
          {stale.msg}
        </div>
      ) : null,
    ];
  }

  function gripDragOut(e: any): void {
    if (e.button !== undefined && e.button !== 0) return;
    if (e.preventDefault) e.preventDefault();
    const sx = e.clientX,
      sy = e.clientY;
    let out = false;
    function mv(ev: any): void {
      if (!out && Math.hypot(ev.clientX - sx, ev.clientY - sy) < 8) return;
      out = true;
      store.set({ floatOpen: true, floatPos: clampFloatPos({ x: ev.clientX - 60, y: ev.clientY - 20 }) });
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
      if (out) saveFloat(true, store.get().floatPos);
      else setFloatOpen(true);
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

  function startFloatDrag(e: any): void {
    if (e.button !== undefined && e.button !== 0) return;
    if (e.target && e.target.closest && e.target.closest('button')) return;
    if (e.preventDefault) e.preventDefault();
    const p0 = clampFloatPos(store.get().floatPos || loadFloatPos() || defaultFloatPos());
    const ox = e.clientX - p0.x,
      oy = e.clientY - p0.y;
    function mv(ev: any): void {
      store.set({ floatPos: clampFloatPos({ x: ev.clientX - ox, y: ev.clientY - oy }) });
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
      saveFloat(store.get().floatOpen, store.get().floatPos);
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

  function FloatingQuota(): ReactNode {
    const s = useStore();
    const now = useNow(1000);
    useEffect(() => {
      void ensureLoad();
    }, []);
    if (!s.floatOpen) return null;
    const a = activeOf(s);
    if (!s.cfg || s.cfg.enabled === false || !a) return null;
    const pos = clampFloatPos(s.floatPos || loadFloatPos() || defaultFloatPos());
    const snap = s.snaps[a.id] as VendorSnapshot | undefined;
    return tmPortal(
      <div className={cx(styles.float, styles.in)} style={{ left: pos.x + 'px', top: pos.y + 'px' }}>
        <div
          className={styles.floatHd}
          title="按住拖到任意位置 · 双击收回侧边栏"
          onPointerDown={startFloatDrag}
          onDoubleClick={() => setFloatOpen(false)}
        >
          <span className={cx(styles.dot, snap && !snap.ok ? dotToneOf(snap) : undefined)} />
          <span className={styles.vname}>{a.name}</span>
          <span className={styles.vtype}>{typeLabel(a.type)}</span>
          <button
            className={styles.mini}
            title="切换供应商"
            onClick={(e: any) => {
              if (e.stopPropagation) e.stopPropagation();
              openMenu(e);
            }}
          >
            {'▾'}
          </button>
          <button
            className={styles.mini}
            title="刷新当前供应商"
            onClick={(e: any) => {
              if (e.stopPropagation) e.stopPropagation();
              void refreshVendor(a.id);
            }}
          >
            {'↻'}
          </button>
          <button
            className={styles.mini}
            title="收回侧边栏"
            onClick={(e: any) => {
              if (e.stopPropagation) e.stopPropagation();
              setFloatOpen(false);
            }}
          >
            {'📌'}
          </button>
        </div>
        <div className={styles.floatBd}>{quotaContent(s, a, snap, now)}</div>
      </div>,
    );
  }

  function QuotaFloatEntry(): ReactNode {
    return (
      <>
        <VendorPopOverlay />
        <FloatingQuota />
      </>
    );
  }

  function QuotaSidebar(props: QuotaSidebarProps): ReactNode {
    const s = useStore();
    const now = useNow(1000);
    useEffect(() => {
      void ensureLoad();
    }, []);
    const vendors0 = (s.cfg && s.cfg.vendors) || [];
    const av0 = s.cfg ? s.cfg.activeVendor : undefined;
    const effA =
      av0 === ''
        ? null
        : av0 === undefined || av0 === null
          ? vendors0[0] || null
          : vendors0.filter((v: Vendor) => v.id === av0)[0] || vendors0[0] || null;
    const effId = effA ? effA.id : '';
    const rawSec = s.cfg ? s.cfg.refreshSec : undefined;
    const numSec = rawSec === undefined || rawSec === null || rawSec === '' ? 60 : Number(rawSec);
    const effSec = numSec === 0 ? 0 : isFinite(numSec) ? Math.min(3600, Math.max(10, numSec || 60)) : 60;
    const effShown = !s.cfg || s.cfg.enabled !== false;
    useEffect(() => {
      if (!effShown || !effId || !(effSec > 0)) return undefined;
      const id = window.setInterval(() => {
        const cur = store.get();
        if (cur.loading) return;
        const curA = activeOf(cur);
        if (curA && curA.id === effId) void refreshVendor(effId);
      }, effSec * 1000);
      return () => window.clearInterval(id);
    }, [effShown, effId, effSec]);
    const wide = !(props && props.wide === false);
    if (!wide) {
      const a = activeOf(s);
      const snap = a && s.snaps[a.id];
      const bad = snap && !snap.ok;
      return (
        <div title={a ? a.name : 'Token 额度（已隐藏）'}>
          <span className={cx(styles.dot, bad ? styles.bad : undefined)} />
        </div>
      );
    }
    const vendors = (s.cfg && s.cfg.vendors) || [];
    const a = activeOf(s);
    if (!s.cfg)
      return (
        <div className={styles.side}>
          <div className={styles.qmeta}>
            <span>{s.loading ? '额度加载中…' : s.error || '额度加载失败'}</span>
          </div>
        </div>
      );
    if (s.cfg.enabled === false) {
      return (
        <div className={cx(styles.side, styles.in)}>
          <div className={styles.qmeta}>
            <span>{'额度显示已关闭'}</span>
            <span>{'设置页可重新打开'}</span>
          </div>
        </div>
      );
    }
    if (!a) {
      return (
        <div className={cx(styles.side, styles.in)}>
          <button
            className={styles.vendor}
            title="点击选择计费供应商（当前：无）"
            onClick={(e: any) => openMenu(e)}
          >
            <span className={styles.dot} />
            <span className={styles.vname}>{'额度已隐藏'}</span>
            <span className={styles.vtype}>{'极简'}</span>
            <span className={styles.vcaret}>{s.menuOpen ? '▴' : '▾'}</span>
          </button>
          <div className={styles.qmeta}>
            <span>{'极简模式 · 不拉取额度'}</span>
            <span>{vendors.length ? vendors.length + ' 个供应商' : ''}</span>
          </div>
        </div>
      );
    }
    if (s.floatOpen) return null;
    const snap = s.snaps[a.id] as VendorSnapshot | undefined;
    const failed = !!(snap && !snap.ok);
    return (
      <div
        className={cx(
          styles.side,
          styles.in,
          s.loading ? styles.loading : undefined,
          failed && !s.loading ? styles.error : undefined,
          moodClass(a.enabled === false, isPeakHour(new Date(now))),
        )}
      >
        <div className={styles.vendorRow}>
          <span className={styles.grip} title="按住拖出为浮窗，点按直接弹出" onPointerDown={gripDragOut}>
            {'⠿'}
          </span>
          <button className={styles.vendor} title="点击切换计费供应商" onClick={(e: any) => openMenu(e)}>
            <span className={cx(styles.dot, snap && !snap.ok ? dotToneOf(snap) : undefined)} />
            <span className={styles.vname}>{a.name}</span>
            <span className={styles.vtype}>{typeLabel(a.type)}</span>
            <span className={styles.vcaret}>{s.menuOpen ? '▴' : '▾'}</span>
          </button>
          <button
            className={styles.mini}
            title="弹出为浮窗（可拖到屏幕任意位置）"
            onClick={() => setFloatOpen(true)}
          >
            {'⧉'}
          </button>
        </div>
        {quotaContent(s, a, snap, now)}
      </div>
    );
  }

  /* ---------- 设置页 ---------- */
  function Badge(props: BadgeProps): ReactNode {
    return <span className={cx(styles.badge, BADGE_CLASS[props.kind || 'muted'])}>{props.text}</span>;
  }
  function SecRow(props: SecRowProps): ReactNode {
    return (
      <div
        className={styles.row}
        style={props.wrap ? { flexWrap: 'wrap', flexDirection: 'column', alignItems: 'stretch' } : undefined}
      >
        <div className={styles.rowText}>
          <div className={styles.rowLabel}>{props.label}</div>
          {props.desc ? <div className={styles.rowDesc}>{props.desc}</div> : null}
        </div>
        <span
          className={props.wrap ? styles.rowValue : undefined}
          style={props.wrap ? { flexBasis: '100%', justifyContent: 'flex-start' } : undefined}
        >
          {props.children}
        </span>
      </div>
    );
  }

  /**
   * 表单字段（堆叠式）：标签 → 控件 → 说明，各占一行。
   *
   * 为什么不复用 SecRow：SecRow 是「左说明 + 右控件」的同行布局，说明一长
   * （如 cookie / workspaceId 的抓取步骤）就把控件挤到只剩几十像素、占位符被截断。
   * 表单字段改为纵向排列：控件恒定占满整行宽度，说明在下方独占整行自由换行。
   */
  function FormField(props: FormFieldProps): ReactNode {
    return (
      <div className={styles.field}>
        <div className={styles.fieldHead}>
          <span className={styles.fieldLabel}>{props.label}</span>
          {props.required ? <span className={styles.fieldReq}>{'必填'}</span> : null}
          {props.hint ? <span className={styles.fieldOpt}>{props.hint}</span> : null}
        </div>
        <div className={styles.fieldControl}>{props.children}</div>
        {props.desc ? <div className={styles.fieldDesc}>{props.desc}</div> : null}
      </div>
    );
  }

  function PillSelect(props: PillSelectProps): ReactNode {
    const [open, setOpen] = useState(false);
    const selector = (
      <button
        type="button"
        className={styles.selector}
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={props.disabled}
        onClick={() => setOpen((v: boolean) => !v)}
      >
        <span className={styles.selectorLabel}>{props.selectedLabel}</span>
        {IconChevronDownOutline14 ? (
          <IconChevronDownOutline14 className={styles.chevron} />
        ) : (
          <span className={styles.chevron}>{'▾'}</span>
        )}
      </button>
    );
    if (!Menu) {
      if (!open) return selector;
      return (
        <div>
          {selector}
          <div className={styles.popmenu} style={{ position: 'absolute' }}>
            {props.options.map((o) => (
              <button
                key={o.id}
                className={cx(styles.mitem, o.id === props.value ? styles.active : undefined)}
                onClick={() => {
                  setOpen(false);
                  props.onSelect(o.id);
                }}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      );
    }
    return (
      <Menu
        open={open}
        onClose={() => setOpen(false)}
        items={props.options}
        selectedId={props.value}
        onSelect={(id: string) => {
          setOpen(false);
          props.onSelect(id);
        }}
        align="end"
        portal
        anchor={selector}
      />
    );
  }
  function secretBadge(kind: string): ReactNode {
    if (kind === 'ref') return <Badge kind="ok" text="密钥:$引用" />;
    if (kind === 'plain') return <Badge kind="warn" text="密钥:明文" />;
    if (kind === 'env' || kind === 'cred') return <Badge kind="info" text={'密钥:' + kind + '(旧)'} />;
    if (kind === 'empty') return <Badge kind="warn" text="密钥:未填" />;
    return null;
  }

  function VendorForm(props: VendorFormProps): ReactNode {
    const Btn =
      Button ||
      (({ children, ...rest }: BtnFallbackProps) => (
        <button type="button" className={styles.btn} {...rest}>
          {children}
        </button>
      ));
    const d = props.draft;
    const set = props.set;
    const busy = !!props.busy;
    const isEdit = !!props.isEdit;
    const put = (k: string) => (v: unknown) => set(Object.assign({}, d, { [k]: v }));
    const putP = (k: string) => (v: unknown) =>
      set(Object.assign({}, d, { params: Object.assign({}, d.params, { [k]: v }) }));
    const p: Record<string, unknown> = d.params || {};
    const idOk = ID_RE.test(d.id || '');
    const nameOk = !!(d.name && String(d.name).trim());
    const canSubmit = idOk && nameOk && !busy;
    const secretPh = isEdit ? '留空=保留原值，或填 $NAME 引用 / 新明文' : '填 $NAME 引用（推荐）或粘贴明文';
    const inputWrap = (opts: any, inner: ReactNode): ReactNode => (
      <div
        className={styles.inputWrap}
        style={opts && opts.maxWidth ? { maxWidth: opts.maxWidth } : undefined}
      >
        {inner}
      </div>
    );
    const textInput = (opts: any): ReactNode =>
      inputWrap(
        opts,
        <input
          className={cx(styles.ninput, opts && opts.mono ? styles.mono : undefined)}
          style={
            opts && opts.alignRight ? { textAlign: 'right', fontVariantNumeric: 'tabular-nums' } : undefined
          }
          value={opts.value}
          placeholder={opts.placeholder || ''}
          autoComplete="off"
          inputMode={opts.inputMode}
          disabled={busy}
          onChange={opts.onChange}
        />,
      );
    const rows: ReactNode[] = [];

    // 显示名称：只影响界面观感，随便填（支持中文）
    rows.push(
      <FormField
        key="name"
        label="显示名称"
        required
        desc="只给你自己看的名字：显示在侧边栏额度卡、供应商列表和切换菜单里，不参与任何请求。同名也没关系，随便填（支持中文），例如「DeepSeek 主号」「公司账号」。"
      >
        {textInput({
          value: d.name || '',
          placeholder: '如：DeepSeek 主号',
          onChange: (e: any) => put('name')(e.target.value),
        })}
      </FormField>,
    );
    const typeSel = (
      <PillSelect
        disabled={busy}
        value={d.type}
        selectedLabel={
          (typeOptions().filter((o) => o.type === d.type)[0] || ({} as { title?: string })).title || d.type
        }
        options={typeOptions().map((o) => ({ id: o.type, label: o.title }))}
        onSelect={(id: string) => {
          // provider 自声明 params 默认值：切换类型时套用（保留已填的通用字段如 lowWarn/currency）
          const meta = providerMetaOf(id);
          const defaults =
            meta && meta.defaultParams && typeof meta.defaultParams === 'object'
              ? JSON.parse(JSON.stringify(meta.defaultParams))
              : {};
          const keep: Record<string, unknown> = {};
          for (const k of ['lowWarn', 'currency', 'billing', 'total', 'used', 'balance', 'granted']) {
            if (p[k] !== undefined && p[k] !== '') keep[k] = p[k];
          }
          set(Object.assign({}, d, { type: id, params: Object.assign({}, defaults, keep) }));
        }}
      />
    );
    rows.push(
      <FormField
        key="id"
        label="ID（配置标识）"
        required={!isEdit}
        hint={isEdit ? '添加后不可修改' : undefined}
        desc={
          isEdit
            ? '这是该供应商在配置里的唯一标识（主键），用来在 settings.yaml 中区分不同账号，也被「设为当前」等操作引用。已添加的供应商不能改 ID，需要别的 ID 请删掉重新添加。'
            : '该供应商在配置里的唯一标识（主键）：用于在 settings.yaml 中区分不同账号，也被「设为当前」等操作引用。填简短英文/数字即可，例如 ds-main、cc-work、go-2。规则：小写字母、数字、横线，2–31 位，字母或数字开头；添加后不可修改。'
        }
      >
        {isEdit ? (
          <span className={cx(styles.inputWrap, styles.inputReadonly)} title="ID 是配置主键，不可修改">
            <span className={cx(styles.ninput, styles.mono)}>{d.id}</span>
          </span>
        ) : (
          inputWrap(
            {},
            <input
              className={cx(styles.ninput, styles.mono)}
              value={d.id || ''}
              placeholder="如：ds-main"
              autoComplete="off"
              disabled={busy}
              onChange={(e: any) => put('id')(e.target.value)}
            />,
          )
        )}
      </FormField>,
    );
    if (!isEdit && !idOk && (d.id || ''))
      rows.push(
        <p key="idhint" className={cx(styles.notice, styles.noticeWarn)}>
          {'ID 不合法：需小写字母、数字或横线，2–31 位，且以字母或数字开头（不能有空格、下划线、中文）。'}
        </p>,
      );
    rows.push(
      <FormField
        key="type"
        label="类型"
        required
        desc="决定去哪个平台、用哪个接口拉取额度。切换类型会同时重置该类型的参数（已填的预警线、币种等通用项会保留）。"
      >
        {typeSel}
      </FormField>,
    );
    const dynMeta = providerMetaOf(d.type);
    if (dynMeta && Array.isArray(dynMeta.fields)) {
      const dynFields = dynMeta.fields.filter((f) => {
        if (!f || !f.showWhen) return true;
        let cur = (p as Record<string, unknown>)[f.showWhen.key];
        if (cur === undefined || cur === null || cur === '')
          cur = f.showWhen.key === 'billing' ? 'rolling' : '';
        return String(cur) === String(f.showWhen.eq);
      });
      dynFields.forEach((f, idx) => {
        const val = (p as Record<string, unknown>)[f.key];
        const key = 'dyn:' + f.key + ':' + idx;
        if (f.kind === 'select') {
          const selVal =
            val === undefined || val === null || val === ''
              ? f.key === 'billing'
                ? 'rolling'
                : ''
              : String(val);
          rows.push(
            <FormField
              key={key}
              label={f.label || f.key}
              required={f.required === true}
              desc={f.hint || undefined}
            >
              <PillSelect
                disabled={busy}
                value={selVal}
                selectedLabel={
                  ((f.options || []).filter((o) => o.value === selVal)[0] || ({} as { label?: string }))
                    .label || selVal
                }
                options={(f.options || []).map((o) => ({ id: o.value, label: o.label }))}
                onSelect={(
                  (k: string) => (id: string) =>
                    putP(k)(id)
                )(f.key)}
              />
            </FormField>,
          );
        } else if (f.kind === 'number') {
          rows.push(
            <FormField
              key={key}
              label={f.label || f.key}
              required={f.required === true}
              desc={f.hint || undefined}
            >
              {textInput({
                maxWidth: 220,
                inputMode: 'decimal',
                placeholder: f.placeholder || '',
                value: val === undefined || val === null ? '' : String(val),
                onChange: (
                  (k: string) => (e: any) =>
                    putP(k)(e.target.value)
                )(f.key),
              })}
            </FormField>,
          );
        } else {
          const isSecret = f.kind === 'secret';
          rows.push(
            <FormField
              key={key}
              label={f.label || f.key}
              required={f.required === true}
              hint={isSecret ? '填 $NAME 引用或明文；明文保存后不回显' : undefined}
              desc={f.hint || undefined}
            >
              {textInput({
                mono: !!f.mono,
                placeholder: f.placeholder || (isSecret ? secretPh : ''),
                value: val === undefined || val === null ? '' : String(val),
                onChange: (
                  (k: string) => (e: any) =>
                    putP(k)(e.target.value)
                )(f.key),
              })}
            </FormField>,
          );
        }
      });
      if (dynMeta.hint)
        rows.push(
          <p key="dyn:hint" className={styles.fieldNote}>
            <b>{'关于该类型：'}</b>
            {dynMeta.hint}
          </p>,
        );
    } else {
      // 字段定义以 Host 上报的 provider 元数据为唯一来源（适配器 fields）。
      // 元数据缺失时不再硬编码各类型表单——那会与适配器实现悄悄漂移。
      rows.push(
        <p key="nometa" className={cx(styles.notice, styles.noticeWarn)}>
          {'Host 未上报类型「' +
            String(d.type) +
            '」的字段定义：请重启 dsh web 让插件重新注册，然后刷新本页。'}
        </p>,
      );
    }
    rows.push(
      <div key="actions" className={styles.bar}>
        <Btn variant="primary" size="sm" disabled={!canSubmit} onClick={props.onSubmit}>
          {busy ? '保存中…' : props.submitLabel || '保存'}
        </Btn>
        {props.onCancel ? (
          <Btn variant="outline" size="sm" disabled={busy} onClick={props.onCancel}>
            {'取消'}
          </Btn>
        ) : null}
        {!idOk || !nameOk ? (
          <span className={styles.hint}>
            {!nameOk ? '请先填写显示名称。' : 'ID 不合法：需小写字母/数字/横线，2–31 位，字母或数字开头。'}
          </span>
        ) : null}
      </div>,
    );
    return <div className={styles.section}>{rows}</div>;
  }

  const NEW_VENDOR = { id: '', name: '', type: 'opencode', params: { workspaceId: '', cookie: '' } };
  const SEC_PRESETS = [0, 30, 60, 120, 300, 600, 1800, 3600];
  function secLabel(n: number): string {
    return n === 0 ? '关闭自动刷新' : n + ' 秒';
  }
  function aiManual(namespace: string, docPath: string): string {
    let types = 'opencode / deepseek / commandcode / manual';
    try {
      const ps = providerMetas();
      if (ps && ps.length) types = ps.map((x) => x.type).join(' / ');
    } catch {
      /* ignore */
    }
    return [
      '【给 AI 的配置说明书】直接改 settings.yaml 的 ' +
        namespace +
        ' 分节' +
        (docPath ? '（文件：' + docPath + '）' : '') +
        '，保存即热重载生效，无需点任何按钮。',
      'dshp-token-meter:',
      '  activeVendor: "ds-main"   # "" = 极简模式，侧边栏只占位、不拉取',
      '  refreshSec: 60            # 当前供应商自动刷新秒数，0=关闭（其余 10~3600）',
      '  enabled: true             # false=隐藏侧边栏额度卡（仅占位，不拉取）',
      '  vendors:',
      '    - id: go-main           # 小写字母/数字/横线，2-31 位（主键，不可改）',
      '      name: 显示名',
      '      type: opencode',
      '      params: { workspaceId: "wrk_xxx", cookie: "$TQUOTA_GO" }',
      '    - id: ds-main',
      '      name: DeepSeek 官方',
      '      type: deepseek',
      '      params: { token: "$DS_TOKEN", apiKey: "$DEEPSEEK_API_KEY", lowWarn: 5 }',
      '      # deepseek 一个类型搞定两种凭据：sk- 开头的 apiKey 走官方余额，会话 token 走网页账单（含历史）；一路失效自动换路',
      '      # 旧 type deepseek-api / deepseek-web 已合并为别名，老配置原样可用（读路径自动归一，不会改写你的文件）',
      '    - id: cc-main',
      '      name: Command Code',
      '      type: commandcode',
      '      params: { apiKey: "$COMMAND_CODE_API_KEY", lowWarn: 10 }',
      '      # apiKey 留空时自动回退读 $COMMAND_CODE_API_KEY（与 CLI 同一约定）',
      '    - id: m1',
      '      name: 手动账本',
      '      type: manual',
      '      params: { billing: payg, balance: 50, granted: 100, lowWarn: 10 }',
      '密钥：$NAME（推荐：先读 ~/.dsh/.credentials.yaml，再读环境变量）/ 明文（设置页不明文回显，编辑留空即保留）/ {env:}/{cred:}（旧写法，仅兼容）',
      'cookie：浏览器开发者工具 → Application → Cookies → 复制 auth 的值，整段 Cookie 原样粘贴亦可；workspaceId 见各字段下方的获取说明',
      'deepseek：单类型自动选路（旧 deepseek-api / deepseek-web 为别名）；apiKey 与会话票据不通用（实测 40003），不要混填到对方字段',
      'manual：billing=rolling 填 total/used；billing=payg 填 balance/granted/lowWarn',
      '可用 type（本机 Host 已注册）：' + types + '（新增供应商只需 Host 注册，新 type 自动出现在此）',
    ].join('\n');
  }

  function QuotaSettingsPage(): ReactNode {
    const Btn =
      Button ||
      (({ children, ...rest }: BtnFallbackProps) => (
        <button type="button" className={styles.btn} {...rest}>
          {children}
        </button>
      ));
    const s = useStore();
    useEffect(() => {
      void ensureLoad();
    }, []);
    const ds = useState(JSON.parse(JSON.stringify(NEW_VENDOR)));
    const draft = ds[0];
    const setDraft = ds[1];
    const es = useState<{ id: string; data: any } | null>(null);
    const editing = es[0];
    const setEditing = es[1];
    const bs = useState(false);
    const busy = bs[0];
    const setBusy = bs[1];
    const cs = useState<any | null>(null);
    const confirmDel = cs[0];
    const setConfirmDel = cs[1];
    const ackS = useState(false);
    const acked = ackS[0];
    const setAcked = ackS[1];

    async function withBusy(fn: () => Promise<void>): Promise<void> {
      setBusy(true);
      try {
        await fn();
      } finally {
        setBusy(false);
      }
    }
    async function saveVendor(v: VendorDraft, isEdit: boolean): Promise<void> {
      await withBusy(async () => {
        try {
          const r = await call(isEdit ? 'quota.update-vendor' : 'quota.add-vendor', { vendor: v });
          if (r && r.ok) {
            if (!isEdit) setDraft(JSON.parse(JSON.stringify(NEW_VENDOR)));
            else setEditing(null);
            await reload();
          } else store.set({ error: (r && r.error) || '保存失败' });
        } catch {
          store.set({ error: '连接 Host 失败' });
        }
      });
    }
    async function delVendor(id: string): Promise<void> {
      await withBusy(async () => {
        try {
          const r = await call('quota.delete-vendor', { id });
          if (!(r && r.ok)) store.set({ error: (r && r.error) || '删除失败' });
          await reload();
        } catch {
          store.set({ error: '连接 Host 失败' });
        }
      });
    }
    const requestDelVendor = (v: any): void => {
      setAcked(false);
      setConfirmDel(v);
    };
    async function toCred(id: string): Promise<void> {
      await withBusy(async () => {
        try {
          const r = await call('quota.secret-to-cred', { id });
          if (r && r.ok) await reload();
          else store.set({ error: (r && r.error) || '转存失败' });
        } catch {
          store.set({ error: '连接 Host 失败' });
        }
      });
    }
    async function applyActive(id: string): Promise<void> {
      await withBusy(async () => {
        await setActive(id);
        await reload();
      });
    }
    async function saveSecVal(n: number): Promise<void> {
      await withBusy(async () => {
        try {
          const r = await call('quota.set-refresh', { sec: n });
          if (r && r.ok) await reload();
          else store.set({ error: (r && r.error) || '保存失败' });
        } catch {
          store.set({ error: '连接 Host 失败' });
        }
      });
    }
    async function toggleEnabled(): Promise<void> {
      const next = s.cfg ? s.cfg.enabled === false : false;
      await withBusy(async () => {
        try {
          const r = await call('quota.set-enabled', { enabled: next });
          if (r && r.ok) await reload();
          else store.set({ error: (r && r.error) || '保存失败' });
        } catch {
          store.set({ error: '连接 Host 失败' });
        }
      });
    }

    const vendors = (s.cfg && s.cfg.vendors) || [];
    const activeId = s.cfg ? s.cfg.activeVendor || '' : '';
    const shown = s.cfg ? s.cfg.enabled !== false : true;
    const rawSec = s.cfg ? s.cfg.refreshSec : undefined;
    const curSec =
      rawSec === undefined || rawSec === null || rawSec === ''
        ? 60
        : Number(rawSec) === 0
          ? 0
          : isFinite(Number(rawSec))
            ? Math.min(3600, Math.max(10, Number(rawSec) || 60))
            : 60;

    const kids: ReactNode[] = [];
    kids.push(
      <p key="d" className={styles.intro}>
        {'多供应商滚动额度 / 按量余额，侧边栏实时卡片展示。配置持久化在 settings.yaml（'}
        <code className={styles.mono}>{s.namespace || 'dshp-token-meter'}</code>
        {' 命名空间' +
          (s.docPath ? '，文件 ' + s.docPath : '') +
          '），外部编辑热重载；密钥用 $NAME 引用或明文。'}
      </p>,
    );
    if (s.error)
      kids.push(
        <p key="err" className={cx(styles.notice, styles.noticeErr)}>
          {s.error}
        </p>,
      );
    if (!s.cfg) {
      kids.push(
        <div key="loading" className={styles.loading}>
          <span className={styles.spinner} />
          <span className={styles.loadingText}>{s.loading ? '正在读取额度配置…' : '额度配置加载失败'}</span>
        </div>,
      );
      return <div className={styles.page}>{kids}</div>;
    }
    const a0 = activeOf(s);
    const aSnap = a0 && (s.snaps[a0.id] as VendorSnapshot | undefined);
    kids.push(
      <div key="status" className={styles.section}>
        <SecRow key="a" label="当前供应商" desc="侧边栏卡片展示的额度来源。">
          {a0 ? (
            <span>
              {a0.name} <Badge kind="info" text={typeLabel(a0.type)} />
            </span>
          ) : (
            <Badge kind="muted" text="极简模式（无）" />
          )}
        </SecRow>
        <SecRow key="n" label="供应商数量">
          <Badge kind={vendors.length ? 'info' : 'muted'} text={vendors.length + ' 个'} />
        </SecRow>
        <SecRow key="v" label="额度显示">
          {shown ? <Badge kind="ok" text="显示中" /> : <Badge kind="muted" text="已隐藏" />}
        </SecRow>
        <SecRow key="r" label="自动刷新">
          {curSec === 0 ? (
            <Badge kind="muted" text="已关闭" />
          ) : (
            <Badge kind="ok" text={'每 ' + curSec + ' 秒'} />
          )}
        </SecRow>
        <SecRow key="u" label="最近拉取">
          {aSnap && (aSnap as VendorSnapshot).at ? (
            <span className={styles.hint}>{timeAgo((aSnap as VendorSnapshot).at as string)}</span>
          ) : (
            <span className={styles.hint}>{a0 ? '未拉取' : '—'}</span>
          )}
        </SecRow>
        <SecRow key="f" label="浮窗">
          {s.floatOpen ? (
            <span className={styles.bar} style={{ padding: 0, border: 'none' }}>
              <Badge kind="info" text="已弹出" />
              <Btn variant="outline" size="sm" disabled={busy} onClick={() => setFloatOpen(false)}>
                {'收回侧边栏'}
              </Btn>
            </span>
          ) : (
            <span className={styles.hint}>{'在侧边栏中（卡片标题栏 ⠿ 可拖出）'}</span>
          )}
        </SecRow>
      </div>,
    );
    kids.push(
      <div key="display" className={styles.section}>
        <SecRow
          key="sw"
          label="侧边栏额度卡"
          desc="关闭后侧边栏仅保留占位提示，不再自动拉取；供应商配置与手动拉取不受影响。"
        >
          <button
            className={cx(styles.switch, shown ? styles.switchOn : undefined)}
            role="switch"
            aria-checked={shown}
            disabled={busy}
            aria-label="侧边栏额度卡"
            onClick={() => void toggleEnabled()}
          >
            <span className={styles.knob} />
          </button>
        </SecRow>
      </div>,
    );
    const activeSelect = (
      <PillSelect
        disabled={busy}
        value={activeId}
        selectedLabel={a0 ? a0.name + '（' + typeLabel(a0.type) + '）' : '无 · 极简模式（不拉取）'}
        options={[{ id: '', label: '无 · 极简模式（不拉取）' }].concat(
          vendors.map((v: Vendor) => ({ id: v.id, label: v.name + '（' + typeLabel(v.type) + '）' })),
        )}
        onSelect={(id: string) => void applyActive(id)}
      />
    );
    const vrows: ReactNode[] = [
      <SecRow key="__active" label="当前供应商" desc="点开选择侧边栏展示的供应商；无 = 极简模式。">
        {activeSelect}
      </SecRow>,
    ];
    vendors.forEach((v: any) => {
      const snap = s.snaps[v.id] as VendorSnapshot | undefined;
      const isCur = v.id === activeId;
      const status =
        snap && snap.ok ? (
          <span className={styles.hint}>{'更新' + timeAgo(snap.at as string)}</span>
        ) : snap ? (
          Tooltip ? (
            <Tooltip label={snap.error || '拉取失败'} side="top">
              <span className={styles.hint}>{'拉取失败'}</span>
            </Tooltip>
          ) : (
            <span className={styles.hint} title={snap.error || '拉取失败'}>
              {'拉取失败'}
            </span>
          )
        ) : (
          <span className={styles.hint}>{'未拉取'}</span>
        );
      vrows.push(
        <SecRow
          key={'v:' + v.id}
          wrap
          label={
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, maxWidth: '100%' }}>
              <span className={cx(styles.dot, snap && !snap.ok ? dotToneOf(snap) : undefined)} />
              <span className={styles.vname2} style={{ maxWidth: 280 }}>
                {v.name}
              </span>
              <Badge kind="info" text={typeLabel(v.type)} />
              {isCur ? <Badge kind="ok" text="当前" /> : null}
              {secretBadge(v.secretKind)}
            </span>
          }
        >
          <span className={styles.bar} style={{ width: '100%', padding: 0, border: 'none' }}>
            {status}
            <span style={{ flex: 1 }} />
            <Btn variant="outline" size="sm" disabled={busy} onClick={() => void refreshVendor(v.id)}>
              {'拉取'}
            </Btn>
            <Btn
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={() => setEditing({ id: v.id, data: JSON.parse(JSON.stringify(v)) })}
            >
              {'编辑'}
            </Btn>
            {v.secretKind === 'plain' ? (
              <Btn
                variant="ghost"
                size="sm"
                disabled={busy}
                title="明文转存系统凭据，改写为 $NAME 引用"
                onClick={() => void toCred(v.id)}
              >
                {'存凭据'}
              </Btn>
            ) : null}
            <Btn variant="ghost" size="sm" disabled={busy} onClick={() => requestDelVendor(v)}>
              {'删除'}
            </Btn>
          </span>
        </SecRow>,
      );
    });
    kids.push(
      <div key="vendors" className={styles.section}>
        <div className={styles.sectionHead}>{'供应商'}</div>
        <p className={styles.cardHint} style={{ margin: '0 0 4px' }}>
          {'侧边栏卡片点供应商名也可切换。密钥 $NAME 引用优先，明文保存后不明文回显。'}
        </p>
        {vrows}
      </div>,
    );
    if (editing)
      kids.push(
        <div key="edit" className={styles.section}>
          <div className={styles.sectionHead}>{'编辑 ' + (editing as { id: string }).id}</div>
          <p className={styles.cardHint} style={{ margin: '0 0 4px' }}>
            {'ID 是主键，不可修改；密钥留空即保留原值。'}
          </p>
          <VendorForm
            draft={(editing as { data: any }).data}
            set={(nd: any) => setEditing({ id: (editing as { id: string }).id, data: nd })}
            submitLabel="保存修改"
            busy={busy}
            isEdit
            onCancel={() => setEditing(null)}
            onSubmit={() => void saveVendor((editing as { data: any }).data, true)}
          />
        </div>,
      );
    kids.push(
      <div key="add" className={styles.section}>
        <div className={styles.sectionHead}>{'添加供应商'}</div>
        <VendorForm
          draft={draft}
          set={setDraft}
          submitLabel="添加"
          busy={busy}
          onSubmit={() => void saveVendor(draft, false)}
        />
      </div>,
    );
    const allSecs = SEC_PRESETS.indexOf(curSec) >= 0 ? SEC_PRESETS : [curSec].concat(SEC_PRESETS);
    kids.push(
      <div key="refresh" className={styles.section}>
        <div className={styles.sectionHead}>{'自动刷新'}</div>
        <SecRow
          key="sec"
          label="刷新间隔"
          desc="当前供应商按间隔自动拉取；切换供应商会立即刷新一次；失败时保留旧数据并在卡片标注。"
        >
          <PillSelect
            disabled={busy}
            value={String(curSec)}
            selectedLabel={secLabel(curSec)}
            options={allSecs.map((n) => ({ id: String(n), label: secLabel(n) }))}
            onSelect={(id: string) => void saveSecVal(Number(id))}
          />
        </SecRow>
      </div>,
    );
    kids.push(
      <div key="tools" className={styles.section}>
        <div className={styles.bar} style={{ borderBottom: 'none' }}>
          <Btn variant="outline" size="sm" disabled={busy} onClick={() => void withBusy(() => reload())}>
            {busy ? '读取中…' : '重新读取'}
          </Btn>
          <Btn
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => void withBusy(() => refreshVendor())}
          >
            {'全部拉取'}
          </Btn>
        </div>
      </div>,
    );
    const manual = aiManual(s.namespace || 'dshp-token-meter', s.docPath || '');
    kids.push(
      <div key="manual" className={styles.section}>
        <div className={styles.sectionHead}>{'给 AI 的配置说明书'}</div>
        <p className={styles.cardHint} style={{ margin: '0 0 4px' }}>
          {'AI 可直接编辑 settings.yaml 的 '}
          <code className={styles.mono}>{s.namespace || 'dshp-token-meter'}</code>
          {' 分节，保存即生效（热重载），无需走表单。密钥优先用 $NAME 引用写法。'}
        </p>
        {CodeBlock ? (
          <CodeBlock
            code={manual}
            lang="yaml"
            copyLabel="复制"
            copiedLabel="已复制"
            className={styles.codeblock}
          />
        ) : (
          <pre
            className={styles.mono}
            style={{ fontSize: 11, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}
          >
            {manual}
          </pre>
        )}
      </div>,
    );
    kids.push(
      <p key="foot" className={styles.footerNote} style={{ marginTop: 4 }}>
        {'manual 类型直接写数字，无需拉取；activeVendor 为空字符串时进入极简模式。'}
      </p>,
    );
    if (confirmDel) {
      const target = confirmDel as { id: string; name: string };
      if (RiskConfirmation) {
        kids.push(
          <RiskConfirmation
            key="confirm-del"
            open
            title={'删除供应商「' + target.name + '」？'}
            description="该供应商的配置与侧边栏快照将一并清除，此操作不可撤销。"
            acknowledgeLabel="我已了解，删除该供应商"
            cancelLabel="取消"
            closeLabel="关闭"
            confirmLabel="删除"
            acknowledged={acked}
            onAcknowledgedChange={setAcked}
            onCancel={() => setConfirmDel(null)}
            onConfirm={() => {
              setConfirmDel(null);
              void delVendor(target.id);
            }}
          />,
        );
      } else if (acked) {
        kids.push(
          <div key="confirm-del" className={styles.errbox}>
            {/* 旧实现给这个 div 挂过 `tm-errtext`，但 styles.module.css 与旧 styles.ts 里都没有这条规则
                （纯摆设）→ 去掉该 className，与 c8e140f（file-change-viewer 去掉无样式的 fcv-toolRow）同一先例。 */}
            <div>{'确认删除「' + target.name + '」？'}</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              <Btn
                variant="outline"
                size="sm"
                onClick={() => {
                  setConfirmDel(null);
                  void delVendor(target.id);
                }}
              >
                {'确认删除'}
              </Btn>
              <Btn
                variant="outline"
                size="sm"
                onClick={() => {
                  setConfirmDel(null);
                  setAcked(false);
                }}
              >
                {'取消'}
              </Btn>
            </div>
          </div>,
        );
      } else {
        kids.push(
          <div key="confirm-del" className={styles.errbox}>
            <div>{'删除供应商「' + target.name + '」？此操作不可撤销。'}</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              <Btn variant="outline" size="sm" onClick={() => setAcked(true)}>
                {'我已了解'}
              </Btn>
              <Btn variant="outline" size="sm" onClick={() => setConfirmDel(null)}>
                {'取消'}
              </Btn>
            </div>
          </div>,
        );
      }
    }
    return <div className={styles.page}>{kids}</div>;
  }

  /* ---------- 额度查询面板：全部供应商展开卡（只读为主 + 切换/拉取/浮窗；增删改去设置页） ---------- */
  /* ---------- 独立供应商小组件（中心区卡片与 widget 浮窗共用同一渲染，样式一致） ----------
   * 自带 tm-card 外框；标题栏的 WidgetToggle 在侧栏显示 ⧉弹出，浮出后同一位置显示 回归。
   * 绑定固定供应商，不跟随“当前供应商”切换。 */
  function QuotaVendorWidget(props: { vendorId: string }): ReactNode {
    const Btn =
      Button ||
      (({ children, ...rest }: BtnFallbackProps) => (
        <button type="button" className={styles.btn} {...rest}>
          {children}
        </button>
      ));
    const s = useStore();
    const now = useNow(1000);
    useEffect(() => {
      void ensureLoad();
    }, []);
    // 数据同步（小组件/中心区卡片统一）：Host 每 refreshSec 在服务端拉取上游并写快照，
    // 客户端只做轻量 GET /state 同步 —— 多客户端/多标签页不会重复 fetch 上游。
    // 客户端轮询取 min(refreshSec, 30s) 以便及时看到 Host 的新快照；refreshSec=0 时不轮询（仅手动刷新）。
    const rawSec = s.cfg ? s.cfg.refreshSec : undefined;
    const numSec = rawSec === undefined || rawSec === null || rawSec === '' ? 60 : Number(rawSec);
    const effSec2 = numSec === 0 ? 0 : isFinite(numSec) ? Math.min(3600, Math.max(10, numSec || 60)) : 60;
    const syncMs = effSec2 > 0 ? Math.max(10, Math.min(30, effSec2)) * 1000 : 0;
    useEffect(() => {
      if (!(syncMs > 0)) return undefined;
      startSyncLoop(syncMs);
      return () => stopSyncLoop();
    }, [syncMs]);
    const v = ((s.cfg && s.cfg.vendors) || []).filter((x: Vendor) => x.id === props.vendorId)[0];
    if (!s.cfg)
      return (
        <div className={styles.card}>
          <div className={styles.hint}>{s.loading ? '额度加载中…' : s.error || '额度加载失败'}</div>
        </div>
      );
    if (!v)
      return (
        <div className={styles.card}>
          <div className={styles.hint}>{'供应商已删除，关闭本浮窗即可。'}</div>
        </div>
      );
    const snap = s.snaps[v.id] as VendorSnapshot | undefined;
    const isCur = v.id === s.cfg.activeVendor;
    const failed = !!(snap && !snap.ok);
    const off = v.enabled === false;
    const peakNow = isPeakHour(new Date(now));
    const wid = 'quota:' + v.id;
    return (
      <div
        className={cx(
          styles.card,
          failed && !s.loading ? cx(styles.side, styles.error) : undefined,
          moodClass(off, peakNow),
        )}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, flexWrap: 'wrap' }}>
          <span
            className={cx(styles.dot, off ? styles.off : snap && !snap.ok ? dotToneOf(snap) : undefined)}
          />
          <span className={styles.vname2} style={{ maxWidth: 220 }}>
            {v.name}
          </span>
          <Badge kind="info" text={typeLabel(v.type)} />
          {secretBadge(v.secretKind)}
          {isCur ? <Badge kind="ok" text="当前" /> : null}
          {off ? <Badge kind="bad" text="已禁用" /> : null}
          <span style={{ flex: '1 1 auto' }} />
          <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
            {isCur ? null : (
              <Btn variant="outline" size="sm" disabled={s.loading} onClick={() => void setActive(v.id)}>
                {'设为当前'}
              </Btn>
            )}
            <Btn
              variant="outline"
              size="sm"
              disabled={s.loading}
              title={off ? '已禁用定时拉取，手动拉取仍然可用' : undefined}
              onClick={() => void refreshVendor(v.id)}
            >
              {'拉取'}
            </Btn>
            <Btn
              variant="ghost"
              size="sm"
              disabled={s.loading}
              title={off ? '重新加入 Host 定时拉取' : '退出 Host 定时拉取（手动拉取不受影响）'}
              onClick={() => void setVendorEnabled(v.id, off)}
            >
              {off ? '启用' : '禁用'}
            </Btn>
            {WG ? <WG.WidgetToggle id={wid} /> : null}
          </span>
        </div>
        {snap ? (
          snap.ok ? (
            <div style={{ marginTop: 6 }}>
              <SnapBody snap={snap} type={v.type} now={now} />
              <div className={styles.qmeta}>
                <span>{'更新' + timeAgo(snap.at as string) + (snap.via ? ' · ' + snap.via : '')}</span>
                <span>{''}</span>
              </div>
            </div>
          ) : (
            <ErrBox
              info={errInfoOf(snap, snap.error || '拉取失败')}
              msg={snap.error || '拉取失败'}
              meta={v.name + ' · 失败于' + timeAgo(snap.at as string)}
              onRetry={() => void refreshVendor(v.id)}
            />
          )
        ) : (
          <div className={styles.hint} style={{ marginTop: 6 }}>
            {'尚未拉取，点击拉取获取最新额度。'}
          </div>
        )}
      </div>
    );
  }

  /**
   * 峰谷显示器：部分供应商按峰谷定价，峰值时段用量/计费加速。
   *
   * 规则来源（供应商定价提示原文）：
   *   "Off-peak shown (17h/day) · peak $0.30 / $1.20 01-04 & 06-10 UTC, Mon-Fri"
   * 即：UTC 周一至周五 01:00–04:00 与 06:00–10:00 为「峰」，每日 7h 峰 / 17h 谷，
   * 周末全天为「谷」。
   *
   * ⚠ 一律按【北京时间 · UTC+8】判定与展示：浏览器本地时区可能是任何值，
   *   `getHours()` 直接读会让判定随机器漂移，故用固定 +8h 偏移后取 UTC 字段，
   *   等价于固定的 Asia/Shanghai（中国无夏令时，偏移恒定）。
   *   折合北京时间：周一至周五 09:00–12:00（←UTC 01–04）、14:00–18:00（←UTC 06–10）。
   */
  const CN_OFFSET_MS = 8 * 3600000;
  const PEAK_SEGMENTS: Array<[number, number]> = [
    [9, 12], // ← UTC 01:00–04:00
    [14, 18], // ← UTC 06:00–10:00
  ];
  const PEAK_WEEKDAYS = [1, 2, 3, 4, 5]; // 周一至周五
  const CN_WEEK_LABEL = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  function pad2(n: number): string {
    return String(n).padStart(2, '0');
  }
  /** 北京时间日历字段（固定 +8h 偏移 + getUTC*，与浏览器时区无关） */
  function cnAt(ms: number): { day: number; hour: number; min: number } {
    const d = new Date(ms + CN_OFFSET_MS);
    return { day: d.getUTCDay(), hour: d.getUTCHours(), min: d.getUTCMinutes() };
  }
  /** 北京时间 HH:MM */
  function cnHm(ms: number): string {
    const c = cnAt(ms);
    return pad2(c.hour) + ':' + pad2(c.min);
  }
  /** 北京时间自然日序号（用于「今天/明天」判断） */
  function cnDayKey(ms: number): number {
    return Math.floor((ms + CN_OFFSET_MS) / 86400000);
  }
  /** 把某个北京时间点说成人话：今天 18:00 / 明天 09:00 / 周一 09:00 */
  function cnWhen(targetMs: number, nowMs: number): string {
    const diff = cnDayKey(targetMs) - cnDayKey(nowMs);
    const d = new Date(targetMs + CN_OFFSET_MS);
    const hm = pad2(d.getUTCHours()) + ':' + pad2(d.getUTCMinutes());
    if (diff <= 0) return '今天 ' + hm;
    if (diff === 1) return '明天 ' + hm;
    if (diff === 2) return '后天 ' + hm;
    return CN_WEEK_LABEL[d.getUTCDay()] + ' ' + hm;
  }
  function isPeakMs(ms: number): boolean {
    const c = cnAt(ms);
    if (!PEAK_WEEKDAYS.includes(c.day)) return false;
    return PEAK_SEGMENTS.some(([s, e]) => c.hour >= s && c.hour < e);
  }
  function isPeakHour(t: Date): boolean {
    return isPeakMs(t.getTime());
  }
  /**
   * 卡片氛围类：禁用优先（红），其次按峰/谷 —— 峰=暖色+呼吸（消耗加速），
   * 谷=冷绿+静稳（费率低）。中心区富卡片与左栏紧凑卡片共用同一套观感。
   */
  function moodClass(off: boolean, peak: boolean): string | undefined {
    if (off) return styles.off;
    return peak ? styles.moodPeak : styles.moodValley;
  }
  function nextPeakSwitch(nowMs: number, peak: boolean): { ms: number; toPeak: boolean } {
    const step = 60000;
    for (let i = 1; i < 8 * 24 * 60; i++) {
      if (isPeakMs(nowMs + i * step) !== peak) return { ms: i * step, toPeak: !peak };
    }
    return { ms: 7 * 24 * 3600000, toPeak: peak };
  }
  function fmtDur(ms: number): string {
    const m = Math.round(ms / 60000);
    const hh = Math.floor(m / 60);
    const mm = m % 60;
    if (hh >= 24) return Math.floor(hh / 24) + ' 天 ' + (hh % 24) + ' 小时';
    if (hh > 0) return hh + ' 小时 ' + mm + ' 分';
    return mm + ' 分';
  }
  /** 行内倒计时的紧凑写法：4h12m / 12m / 2d15h（头部一行放得下，不吃省略号） */
  function fmtDurShort(ms: number): string {
    const m = Math.max(1, Math.round(ms / 60000));
    const hh = Math.floor(m / 60);
    if (hh >= 24) return Math.floor(hh / 24) + 'd' + (hh % 24) + 'h';
    if (hh > 0) return hh + 'h' + pad2(m % 60) + 'm';
    return m + 'm';
  }

  /** 峰谷悬浮明细卡（鼠标悬停/键盘聚焦时浮出，动画展开） */
  function PeakPopover(props: PeakPopoverProps): ReactNode {
    const now = props.now;
    const ns = nextPeakSwitch(now, props.peak);
    const segTxt = PEAK_SEGMENTS.map(([s, e]) => pad2(s) + ':00–' + pad2(e) + ':00').join('、');
    return (
      <div
        className={cx(styles.tipfixed, styles.peakPop)}
        style={{ left: props.at.left + 'px', top: props.at.top, bottom: props.at.bottom }}
      >
        <div className={styles.peakPopHead}>
          <span className={cx(styles.peakPopDot, props.peak ? styles.peak : styles.valley)} />
          <span>{'峰谷定价 · 北京时间'}</span>
          <span key={cnHm(now)} className={styles.peakPopClock}>
            {cnHm(now)}
          </span>
        </div>
        <div className={styles.tiprow}>
          <span className={styles.tipK}>{'当前'}</span>
          <span className={styles.tipV}>
            {(props.peak ? '峰时段' : '谷时段') + (props.isWeekend ? '（周末）' : '')}
          </span>
        </div>
        <div className={styles.tiprow}>
          <span className={styles.tipK}>{'峰段'}</span>
          <span className={styles.tipV}>{segTxt}</span>
        </div>
        <div className={styles.tiprow}>
          <span className={styles.tipK}>{'峰日'}</span>
          <span className={styles.tipV}>{'周一至周五'}</span>
        </div>
        <div className={styles.tiprow}>
          <span className={styles.tipK}>{ns.toPeak ? '转入峰' : '转入谷'}</span>
          <span className={styles.tipV}>{cnWhen(now + ns.ms, now)}</span>
        </div>
        <div className={styles.tiprow}>
          <span className={styles.tipK}>{'倒计时'}</span>
          <span className={styles.tipV}>{fmtDur(ns.ms)}</span>
        </div>
        <div className={styles.peakPopFoot}>{'折算自 01-04 & 06-10 UTC, Mon-Fri · 每日 7h 峰 / 17h 谷'}</div>
      </div>
    );
  }

  function PeakIndicator(props: PeakIndicatorProps): ReactNode {
    const now = useNow(60000); // 每分钟刷新状态与倒计时
    const [popAt, setPopAt] = useState<any>(null);
    // ⚠ Hooks 规则：useState/useNow 之后不得提前 return（本组件无早退分支）。
    const c = cnAt(now);
    const peak = isPeakMs(now);
    const isWeekend = c.day === 0 || c.day === 6;
    const ns = nextPeakSwitch(now, peak);
    const segTxt = PEAK_SEGMENTS.map(([s, e]) => pad2(s) + ':00–' + pad2(e) + ':00').join('、');
    const cells: ReactNode[] = [];
    for (let hr = 0; hr < 24; hr++) {
      const on = !isWeekend && PEAK_SEGMENTS.some(([s, e]) => hr >= s && hr < e);
      cells.push(
        <span
          key={hr}
          className={cx(styles.peakCell, on ? styles.on : styles.von, hr === c.hour ? styles.now : undefined)}
          title={pad2(hr) + ':00–' + pad2((hr + 1) % 24) + ':00 ' + (on ? '峰' : '谷') + '（北京时间）'}
        />,
      );
    }
    const curTxt = peak ? '峰' : '谷';
    const nextTxt = (ns.toPeak ? '距峰 ' : '距谷 ') + fmtDurShort(ns.ms);
    // 悬浮明细卡挂在 body 上（tmPortal）后按视口坐标定位：既不被中心区/浮窗的 overflow 裁掉，
    // 也不受浮窗 backdrop-filter 形成的包含块影响；放不下时自动翻到卡片上方。
    const openPop = (el: any): void => {
      try {
        if (!el || typeof el.getBoundingClientRect !== 'function') return;
        const r = el.getBoundingClientRect();
        const W = 252;
        const H = 168;
        const vw = window.innerWidth || 1024;
        const vh = window.innerHeight || 768;
        const left = Math.max(8, Math.min(r.left, vw - W - 8));
        const below = r.bottom + 8;
        if (below + H <= vh - 8) setPopAt({ left, top: below + 'px', bottom: undefined });
        else setPopAt({ left, top: undefined, bottom: Math.max(8, vh - r.top + 8) + 'px' });
      } catch {
        /* 定位失败就不浮出，不影响主面板 */
      }
    };
    return (
      <div
        className={cx(styles.peak, peak ? styles.peak : styles.valley)}
        tabIndex={0}
        aria-label={'峰谷定价：当前' + (peak ? '峰时段' : '谷时段') + '，' + nextTxt}
        onMouseEnter={(e: any) => openPop(e.currentTarget)}
        onMouseLeave={() => setPopAt(null)}
        onFocus={(e: any) => openPop(e.currentTarget)}
        onBlur={() => setPopAt(null)}
      >
        <div className={styles.peakHead} key="hd">
          <span className={cx(styles.peakDot, peak ? styles.peak : styles.valley)} />
          <span className={styles.peakTitle}>{'峰谷定价'}</span>
          <span className={cx(styles.peakChip, peak ? styles.peak : styles.valley)}>{curTxt}</span>
          <span
            className={styles.peakTime}
            title={'北京时间 ' + cnHm(now) + ' · ' + nextTxt + '（' + cnWhen(now + ns.ms, now) + '）'}
          >
            {nextTxt}
          </span>
          {props.widgets && props.widgetId ? <props.widgets.WidgetToggle id={props.widgetId} /> : null}
        </div>
        <div className={styles.peakBand} key="band">
          {cells}
        </div>
        <div className={styles.peakHint} key="hint">
          {isWeekend
            ? '峰谷定价（北京时间）：周末全天为谷，'
            : '峰谷定价（北京时间）：周一至周五 ' + segTxt + ' 为峰，'}
          <b>
            {peak
              ? '当前为峰，用量消耗加速、额度走得更快，建议错峰跑量或留意余额。'
              : '当前为谷，费率相对低，适合批量与长任务跑量。'}
          </b>
        </div>
        {popAt === null
          ? null
          : tmPortal(<PeakPopover now={now} peak={peak} isWeekend={isWeekend} at={popAt as any} />)}
      </div>
    );
  }

  /** 额度查询面板。onOpenSettings 由中心区视图注入（跳到同一 tab 的「设置」分区）。 */
  function QuotaView(props: QuotaViewProps): ReactNode {
    const Btn =
      Button ||
      (({ children, ...rest }: BtnFallbackProps) => (
        <button type="button" className={styles.btn} {...rest}>
          {children}
        </button>
      ));
    const s = useStore();
    useEffect(() => {
      void ensureLoad();
    }, []);
    // 已浮出的供应商卡片原位不渲染（浮窗内自带「回归」）。
    // ⚠ Hooks 规则：任何早退（return）之前必须调用完所有 hooks —— useWidgets 放最前面。
    const floats =
      WG && typeof WG.useWidgets === 'function' ? (WG.useWidgets() as Array<{ id: string }>) : [];
    // 自动刷新已下沉到每个 QuotaVendorWidget（中心区卡片与小组件浮窗统一按 refreshSec 自刷），此处不再重复。
    // 中心区是宽画布：顶部通栏（峰谷横幅 + 提示）之外，供应商卡片走自适应网格（4/3/2/1 列）。
    const kids: ReactNode[] = [];
    // 置顶峰谷显示器：工作时间为峰、其余为谷，提醒峰时消耗加速；已浮出为小组件时原位隐藏
    if (!floats.some((w) => w.id === 'peak')) {
      kids.push(<PeakIndicator key="peak" widgets={WG || undefined} widgetId="peak" />);
    }
    if (s.error)
      kids.push(
        <p key="err" className={cx(styles.notice, styles.noticeErr)}>
          {s.error}
        </p>,
      );
    if (!s.cfg) {
      kids.push(
        <div key="loading" className={styles.loading}>
          <span className={styles.spinner} />
          <span className={styles.loadingText}>{s.loading ? '正在读取额度配置…' : '额度配置加载失败'}</span>
        </div>,
      );
      return <div className={styles.page}>{kids}</div>;
    }
    const vendors = s.cfg.vendors || [];
    if (!vendors.length) {
      // 空状态直接给一个「去设置」按钮：在中心区里就能跳到同一 tab 的「设置」分区，
      // 不用再绕去侧边栏的设置页。
      kids.push(
        <div key="empty" className={cx(styles.card, styles.empty)}>
          <div>{'还没有配置任何供应商。'}</div>
          {props.onOpenSettings ? (
            <Btn variant="outline" size="sm" style={{ marginTop: 10 }} onClick={props.onOpenSettings}>
              {'去添加供应商'}
            </Btn>
          ) : (
            <div className={styles.hint} style={{ marginTop: 6 }}>
              {'去 设置 → ' + DISPLAY_NAME + ' 添加第一个。'}
            </div>
          )}
        </div>,
      );
      return <div className={styles.page}>{kids}</div>;
    }
    const activeId = s.cfg.activeVendor || '';
    // 卡片顺序：当前供应商 → 已启用 → 已禁用（同档保持 settings.yaml 里的配置顺序，
    // Array.sort 是稳定排序）。**不再按启用/禁用分组**：卡片自身的左缘色、底色与
    // 「已禁用」徽标已经足够区分状态，再插一条「已禁用 · N 个」分隔行既多一层视觉噪声，
    // 又因为它是整行网格项而强行把后面所有卡片挤到下一行、留下半行空洞。
    const rankOf = (v: any): number => (v.id === activeId ? 0 : v.enabled === false ? 2 : 1);
    // 按 0/1/2 三档分桶拼接（不排序）：档内自然保持 settings.yaml 的配置顺序，
    // 也避免依赖 Array#toSorted 这类较新的运行时方法。
    const ordered: any[] = [];
    for (const rank of [0, 1, 2]) {
      for (const v of vendors) if (rankOf(v) === rank) ordered.push(v);
    }
    const grid: ReactNode[] = [];
    for (const v of ordered) {
      // 已弹出为浮窗的供应商，原位不再渲染
      if (floats.some((w) => w.id === 'quota:' + v.id)) continue;
      grid.push(<QuotaVendorWidget key={v.id} vendorId={v.id} />);
    }
    kids.push(
      <div key="grid" className={styles.vgrid}>
        {grid}
      </div>,
    );
    return <div className={styles.page}>{kids}</div>;
  }

  return {
    QuotaSettingsPage,
    QuotaSidebar,
    QuotaFloatEntry,
    QuotaView,
    QuotaVendorWidget,
    PeakIndicator,
    quotaStore: {
      useStore,
      useNow,
      ensureLoad,
      reload,
      refreshVendor,
      syncState,
      setActive,
      setEnabled,
      setVendorEnabled,
      setRefresh,
      setFloatOpen,
      openMenu,
      savePrefs,
      activeOf,
      typeLabel,
      remainOf,
      call,
    },
    quotaUI: { Badge, SecRow, FormField, PillSelect, VendorForm, secretBadge },
  };
}
