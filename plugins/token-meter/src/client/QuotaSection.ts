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
 */
import { createProviderKit, createProviderRenderers, fallbackErrorInfo } from './providers/index.js';
import type { AnyPrimitives, AnyReact, ProviderMeta, Vendor, VendorSnapshot } from './types.js';

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

export function createQuotaSection(
  React: AnyReact,
  P: AnyPrimitives,
  ReactDOM: any,
  widgets?: any,
): Record<string, any> {
  const h = React.createElement;
  const useState = React.useState as <T>(init: T) => [T, (v: T | ((prev: T) => T)) => void];
  const WG = widgets || null;
  void ReactDOM;

  function tmPortal(node: any): any {
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
  /** 通用偏好补丁（showToday/defaultRange 等）：经 POST /config，成功后合入本地 cfg，侧栏/右栏即时同步 */
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
    React.useEffect(() => store.subscribe(() => force((x: number) => x + 1)), []);
    return store.get();
  }
  function useNow(step?: number): number {
    const st = useState(Date.now());
    React.useEffect(() => {
      const id = window.setInterval(() => st[1](Date.now()), step || 1000);
      return () => window.clearInterval(id);
    }, []);
    return st[0];
  }
  function remainOf(w: { resetInSec: number }, snap: VendorSnapshot, nowMs: number): number {
    const f = snap.fetchedAtMs || nowMs;
    return Math.max(0, w.resetInSec - (nowMs - f) / 1000);
  }
  function activeOf(s: QuotaStoreState): any {
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
  const kit = createProviderKit(React, {
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
  const providerViews = createProviderRenderers(React, kit);
  const ErrBox = kit.ErrorCard;

  /** 快照主体：交给 provider 分层渲染（专属 UI → 声明式 → legacy）。 */
  function SnapBody(props: { snap: VendorSnapshot; type?: string; now: number }): any {
    return providerViews.renderBody(props.type || '', props.snap, props.now);
  }

  /** 失败快照 → 结构化信息（Host 已给则直接用） */
  function errInfoOf(snap: VendorSnapshot | undefined, fallbackMsg: string): any {
    const info = snap && (snap as any).errorInfo;
    if (info && typeof info === 'object' && typeof info.title === 'string') return info;
    return fallbackErrorInfo((snap && snap.error) || fallbackMsg);
  }

  /** 状态点严重度：失败原因越「要人管」越红，限流/网络类只是黄。 */
  function dotToneOf(snap: VendorSnapshot | undefined): string {
    if (!snap) return '';
    if (snap.ok) return '';
    const info = (snap as any).errorInfo;
    const tone = info && info.tone ? String(info.tone) : 'warn';
    return tone === 'bad' ? ' bad' : ' warn';
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

  function VendorPopOverlay(): any {
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
      h(
        'div',
        null,
        h('button', {
          className: 'tm-backdrop',
          'aria-label': '关闭供应商菜单',
          onClick: () => store.set({ menuOpen: false, menuAt: null }),
        }),
        h(
          'div',
          { className: 'tm-popmenu tm-in', style },
          vendors.map((v: Vendor) =>
            h(
              'button',
              {
                key: v.id,
                className: 'tm-mitem' + (v.id === curId ? ' active' : ''),
                onClick: () => void setActive(v.id),
              },
              h('span', { className: 'grow' }, v.name),
              h('span', { className: 'tm-vtype' }, typeLabel(v.type)),
            ),
          ),
          h(
            'button',
            {
              key: '__none',
              className: 'tm-mitem' + (!curId ? ' active' : ''),
              title: '不显示任何供应商额度，保持极简',
              onClick: () => void setActive(''),
            },
            h('span', { className: 'grow' }, '无 · 极简模式'),
            h('span', { className: 'tm-vtype' }, '隐藏'),
          ),
        ),
      ),
    );
  }

  function quotaContent(s: QuotaStoreState, a: any, snap: VendorSnapshot | undefined, now: number): any[] {
    const stale = s.lastErr && (!s.lastErr.id || s.lastErr.id === a.id) && snap && snap.ok ? s.lastErr : null;
    let cbody: any = null;
    if (snap && snap.ok) {
      cbody = h(SnapBody, { snap, type: a.type, now });
    } else if (s.loading) {
      cbody = h('div', { className: 'tm-qmeta' }, h('span', null, '拉取中…'));
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
        (snap && (snap as any).secretKind ? ' · 凭据:' + (snap as any).secretKind : '');
      cbody = h(ErrBox, {
        info: snap ? errInfoOf(snap, msg) : fallbackErrorInfo(msg),
        msg,
        meta,
        onRetry: () => void refreshVendor(a.id),
      });
    }
    return [
      s.error ? h('div', { key: 'e', className: 'tm-err' }, s.error) : null,
      h('div', { key: 'b' }, cbody),
      h(
        'div',
        { key: 'm', className: 'tm-qmeta' },
        h(
          'span',
          null,
          (snap && snap.at ? '更新' + timeAgo(snap.at) : '未拉取') +
            (snap && snap.ok && (snap as any).via ? ' · ' + (snap as any).via : ''),
        ),
        h(
          'span',
          null,
          stale
            ? h(
                'button',
                {
                  className: 'tm-mini warn',
                  title: (stale as { msg: string }).msg + '（旧数据仍可用）',
                  onClick: () => store.set({ errOpen: !store.get().errOpen }),
                },
                '⚠旧数据',
              )
            : null,
          h(
            'button',
            { className: 'tm-mini', title: '刷新当前供应商', onClick: () => void refreshVendor(a.id) },
            '↻ 刷新',
          ),
        ),
      ),
      stale && s.errOpen
        ? h('div', { key: 'd', className: 'tm-errdetail' }, (stale as { msg: string }).msg)
        : null,
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

  function FloatingQuota(): any {
    const s = useStore();
    const now = useNow(1000);
    React.useEffect(() => {
      void ensureLoad();
    }, []);
    if (!s.floatOpen) return null;
    const a = activeOf(s);
    if (!s.cfg || s.cfg.enabled === false || !a) return null;
    const pos = clampFloatPos(s.floatPos || loadFloatPos() || defaultFloatPos());
    const snap = s.snaps[a.id] as VendorSnapshot | undefined;
    return tmPortal(
      h(
        'div',
        { className: 'tm-float tm-in', style: { left: pos.x + 'px', top: pos.y + 'px' } },
        h(
          'div',
          {
            className: 'tm-float-hd',
            title: '按住拖到任意位置 · 双击收回侧边栏',
            onPointerDown: startFloatDrag,
            onDoubleClick: () => setFloatOpen(false),
          },
          h('span', { className: 'tm-dot' + (snap && !snap.ok ? dotToneOf(snap) : '') }),
          h('span', { className: 'tm-vname' }, a.name),
          h('span', { className: 'tm-vtype' }, typeLabel(a.type)),
          h(
            'button',
            {
              className: 'tm-mini',
              title: '切换供应商',
              onClick: (e: any) => {
                if (e.stopPropagation) e.stopPropagation();
                openMenu(e);
              },
            },
            '▾',
          ),
          h(
            'button',
            {
              className: 'tm-mini',
              title: '刷新当前供应商',
              onClick: (e: any) => {
                if (e.stopPropagation) e.stopPropagation();
                void refreshVendor(a.id);
              },
            },
            '↻',
          ),
          h(
            'button',
            {
              className: 'tm-mini',
              title: '收回侧边栏',
              onClick: (e: any) => {
                if (e.stopPropagation) e.stopPropagation();
                setFloatOpen(false);
              },
            },
            '📌',
          ),
        ),
        h('div', { className: 'tm-float-bd' }, quotaContent(s, a, snap, now)),
      ),
    );
  }

  function QuotaFloatEntry(): any {
    return h(React.Fragment, null, h(VendorPopOverlay, null), h(FloatingQuota, null));
  }

  function QuotaSidebar(props: any): any {
    const s = useStore();
    const now = useNow(1000);
    React.useEffect(() => {
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
    React.useEffect(() => {
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
      return h(
        'div',
        { title: a ? a.name : 'Token 额度（已隐藏）' },
        h('span', { className: 'tm-dot' + (bad ? ' bad' : '') }),
      );
    }
    const vendors = (s.cfg && s.cfg.vendors) || [];
    const a = activeOf(s);
    if (!s.cfg)
      return h(
        'div',
        { className: 'tm-side' },
        h(
          'div',
          { className: 'tm-qmeta' },
          h('span', null, s.loading ? '额度加载中…' : s.error || '额度加载失败'),
        ),
      );
    if (s.cfg.enabled === false) {
      return h(
        'div',
        { className: 'tm-side tm-in' },
        h(
          'div',
          { className: 'tm-qmeta' },
          h('span', null, '额度显示已关闭'),
          h('span', null, '设置页可重新打开'),
        ),
      );
    }
    if (!a) {
      return h(
        'div',
        { className: 'tm-side tm-in' },
        h(
          'button',
          {
            className: 'tm-vendor',
            title: '点击选择计费供应商（当前：无）',
            onClick: (e: any) => openMenu(e),
          },
          h('span', { className: 'tm-dot' }),
          h('span', { className: 'tm-vname' }, '额度已隐藏'),
          h('span', { className: 'tm-vtype' }, '极简'),
          h('span', { className: 'tm-vcaret' }, s.menuOpen ? '▴' : '▾'),
        ),
        h(
          'div',
          { className: 'tm-qmeta' },
          h('span', null, '极简模式 · 不拉取额度'),
          h('span', null, vendors.length ? vendors.length + ' 个供应商' : ''),
        ),
      );
    }
    if (s.floatOpen) return null;
    const snap = s.snaps[a.id] as VendorSnapshot | undefined;
    const failed = !!(snap && !snap.ok);
    return h(
      'div',
      {
        className:
          'tm-side tm-in' +
          (s.loading ? ' loading' : '') +
          (failed && !s.loading ? ' error' : '') +
          moodClass(a.enabled === false, isPeakHour(new Date(now))),
      },
      h(
        'div',
        { className: 'tm-vendor-row' },
        h(
          'span',
          { className: 'tm-grip', title: '按住拖出为浮窗，点按直接弹出', onPointerDown: gripDragOut },
          '⠿',
        ),
        h(
          'button',
          { className: 'tm-vendor', title: '点击切换计费供应商', onClick: (e: any) => openMenu(e) },
          h('span', { className: 'tm-dot' + (snap && !snap.ok ? dotToneOf(snap) : '') }),
          h('span', { className: 'tm-vname' }, a.name),
          h('span', { className: 'tm-vtype' }, typeLabel(a.type)),
          h('span', { className: 'tm-vcaret' }, s.menuOpen ? '▴' : '▾'),
        ),
        h(
          'button',
          {
            className: 'tm-mini',
            title: '弹出为浮窗（可拖到屏幕任意位置）',
            onClick: () => setFloatOpen(true),
          },
          '⧉',
        ),
      ),
      quotaContent(s, a, snap, now),
    );
  }

  /* ---------- 设置页 ---------- */
  function Badge(props: { kind: string; text: string }): any {
    return h('span', { className: 'tm-badge tm-badge-' + (props.kind || 'muted') }, props.text);
  }
  function SecRow(props: any): any {
    return h(
      'div',
      {
        className: 'tm-row',
        style: props.wrap ? { flexWrap: 'wrap', flexDirection: 'column', alignItems: 'stretch' } : null,
      },
      h(
        'div',
        { className: 'tm-rowText' },
        h('div', { className: 'tm-rowLabel' }, props.label),
        props.desc ? h('div', { className: 'tm-rowDesc' }, props.desc) : null,
      ),
      h(
        'span',
        {
          className: props.wrap ? 'tm-rowValue' : undefined,
          style: props.wrap ? { flexBasis: '100%', justifyContent: 'flex-start' } : null,
        },
        props.children,
      ),
    );
  }

  /**
   * 表单字段（堆叠式）：标签 → 控件 → 说明，各占一行。
   *
   * 为什么不复用 SecRow：SecRow 是「左说明 + 右控件」的同行布局，说明一长
   * （如 cookie / workspaceId 的抓取步骤）就把控件挤到只剩几十像素、占位符被截断。
   * 表单字段改为纵向排列：控件恒定占满整行宽度，说明在下方独占整行自由换行。
   */
  function FormField(props: { label: any; desc?: any; hint?: any; required?: boolean; children?: any }): any {
    return h(
      'div',
      { className: 'tm-field' },
      h(
        'div',
        { className: 'tm-fieldHead' },
        h('span', { className: 'tm-fieldLabel' }, props.label),
        props.required ? h('span', { className: 'tm-fieldReq' }, '必填') : null,
        props.hint ? h('span', { className: 'tm-fieldOpt' }, props.hint) : null,
      ),
      h('div', { className: 'tm-fieldControl' }, props.children),
      props.desc ? h('div', { className: 'tm-fieldDesc' }, props.desc) : null,
    );
  }

  function PillSelect(props: {
    disabled?: boolean;
    value: string;
    selectedLabel: string;
    options: Array<{ id: string; label: string }>;
    onSelect: (id: string) => void;
  }): any {
    const [open, setOpen] = useState(false);
    const selector = h(
      'button',
      {
        type: 'button',
        className: 'tm-selector',
        'aria-haspopup': 'menu',
        'aria-expanded': open,
        disabled: props.disabled,
        onClick: () => setOpen((v: boolean) => !v),
      },
      h('span', { className: 'tm-selectorLabel' }, props.selectedLabel),
      P.IconChevronDownOutline14
        ? h(P.IconChevronDownOutline14, { className: 'tm-chevron' })
        : h('span', { className: 'tm-chevron' }, '▾'),
    );
    if (!P.Menu) {
      if (!open) return selector;
      return h(
        'div',
        null,
        selector,
        h(
          'div',
          { className: 'tm-popmenu', style: { position: 'absolute' } },
          props.options.map((o) =>
            h(
              'button',
              {
                key: o.id,
                className: 'tm-mitem' + (o.id === props.value ? ' active' : ''),
                onClick: () => {
                  setOpen(false);
                  props.onSelect(o.id);
                },
              },
              o.label,
            ),
          ),
        ),
      );
    }
    return h(P.Menu, {
      open,
      onClose: () => setOpen(false),
      items: props.options,
      selectedId: props.value,
      onSelect: (id: string) => {
        setOpen(false);
        props.onSelect(id);
      },
      align: 'end',
      portal: true,
      anchor: selector,
    });
  }
  function secretBadge(kind: string): any {
    if (kind === 'ref') return h(Badge, { kind: 'ok', text: '密钥:$引用' });
    if (kind === 'plain') return h(Badge, { kind: 'warn', text: '密钥:明文' });
    if (kind === 'env' || kind === 'cred') return h(Badge, { kind: 'info', text: '密钥:' + kind + '(旧)' });
    if (kind === 'empty') return h(Badge, { kind: 'warn', text: '密钥:未填' });
    return null;
  }

  function VendorForm(props: {
    draft: any;
    set: (d: any) => void;
    busy: boolean;
    isEdit?: boolean;
    submitLabel?: string;
    onSubmit: () => void;
    onCancel?: () => void;
  }): any {
    const d = props.draft;
    const set = props.set;
    const busy = !!props.busy;
    const isEdit = !!props.isEdit;
    const put = (k: string) => (v: unknown) => set(Object.assign({}, d, { [k]: v }));
    const putP = (k: string) => (v: unknown) =>
      set(Object.assign({}, d, { params: Object.assign({}, d.params, { [k]: v }) }));
    const p = d.params || {};
    const idOk = ID_RE.test(d.id || '');
    const nameOk = !!(d.name && String(d.name).trim());
    const canSubmit = idOk && nameOk && !busy;
    const secretPh = isEdit ? '留空=保留原值，或填 $NAME 引用 / 新明文' : '填 $NAME 引用（推荐）或粘贴明文';
    const inputWrap = (opts: any, inner: any): any =>
      h(
        'div',
        { className: 'tm-inputWrap', style: opts && opts.maxWidth ? { maxWidth: opts.maxWidth } : null },
        inner,
      );
    const textInput = (opts: any): any =>
      inputWrap(
        opts,
        h('input', {
          className: 'tm-ninput' + (opts && opts.mono ? ' tm-mono' : ''),
          style: opts && opts.alignRight ? { textAlign: 'right', fontVariantNumeric: 'tabular-nums' } : null,
          value: opts.value,
          placeholder: opts.placeholder || '',
          autoComplete: 'off',
          inputMode: opts.inputMode,
          disabled: busy,
          onChange: opts.onChange,
        }),
      );
    const rows: any[] = [];

    // 显示名称：只影响界面观感，随便填（支持中文）
    rows.push(
      h(
        FormField,
        {
          key: 'name',
          label: '显示名称',
          required: true,
          desc: '只给你自己看的名字：显示在侧边栏额度卡、供应商列表和切换菜单里，不参与任何请求。同名也没关系，随便填（支持中文），例如「DeepSeek 主号」「公司账号」。',
        },
        textInput({
          value: d.name || '',
          placeholder: '如：DeepSeek 主号',
          onChange: (e: any) => put('name')(e.target.value),
        }),
      ),
    );
    const typeSel = h(PillSelect, {
      disabled: busy,
      value: d.type,
      selectedLabel: (typeOptions().filter((o) => o.type === d.type)[0] || {}).title || d.type,
      options: typeOptions().map((o) => ({ id: o.type, label: o.title })),
      onSelect: (id: string) => {
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
      },
    });
    rows.push(
      h(
        FormField,
        {
          key: 'id',
          label: 'ID（配置标识）',
          required: !isEdit,
          hint: isEdit ? '添加后不可修改' : undefined,
          desc: isEdit
            ? '这是该供应商在配置里的唯一标识（主键），用来在 settings.yaml 中区分不同账号，也被「设为当前」等操作引用。已添加的供应商不能改 ID，需要别的 ID 请删掉重新添加。'
            : '该供应商在配置里的唯一标识（主键）：用于在 settings.yaml 中区分不同账号，也被「设为当前」等操作引用。填简短英文/数字即可，例如 ds-main、cc-work、go-2。规则：小写字母、数字、横线，2–31 位，字母或数字开头；添加后不可修改。',
        },
        isEdit
          ? h(
              'span',
              {
                className: 'tm-inputWrap tm-inputReadonly',
                title: 'ID 是配置主键，不可修改',
              },
              h('span', { className: 'tm-ninput tm-mono' }, d.id),
            )
          : inputWrap(
              {},
              h('input', {
                className: 'tm-ninput tm-mono',
                value: d.id || '',
                placeholder: '如：ds-main',
                autoComplete: 'off',
                disabled: busy,
                onChange: (e: any) => put('id')(e.target.value),
              }),
            ),
      ),
    );
    if (!isEdit && !idOk && (d.id || ''))
      rows.push(
        h(
          'p',
          { key: 'idhint', className: 'tm-notice tm-notice-warn' },
          'ID 不合法：需小写字母、数字或横线，2–31 位，且以字母或数字开头（不能有空格、下划线、中文）。',
        ),
      );
    rows.push(
      h(
        FormField,
        {
          key: 'type',
          label: '类型',
          required: true,
          desc: '决定去哪个平台、用哪个接口拉取额度。切换类型会同时重置该类型的参数（已填的预警线、币种等通用项会保留）。',
        },
        typeSel,
      ),
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
            h(
              FormField,
              {
                key,
                label: f.label || f.key,
                required: f.required === true,
                desc: f.hint || undefined,
              },
              h(PillSelect, {
                disabled: busy,
                value: selVal,
                selectedLabel: ((f.options || []).filter((o) => o.value === selVal)[0] || {}).label || selVal,
                options: (f.options || []).map((o) => ({ id: o.value, label: o.label })),
                onSelect: (
                  (k: string) => (id: string) =>
                    putP(k)(id)
                )(f.key),
              }),
            ),
          );
        } else if (f.kind === 'number') {
          rows.push(
            h(
              FormField,
              { key, label: f.label || f.key, required: f.required === true, desc: f.hint || undefined },
              textInput({
                maxWidth: 220,
                inputMode: 'decimal',
                placeholder: f.placeholder || '',
                value: val === undefined || val === null ? '' : String(val),
                onChange: (
                  (k: string) => (e: any) =>
                    putP(k)(e.target.value)
                )(f.key),
              }),
            ),
          );
        } else {
          const isSecret = f.kind === 'secret';
          rows.push(
            h(
              FormField,
              {
                key,
                label: f.label || f.key,
                required: f.required === true,
                hint: isSecret ? '填 $NAME 引用或明文；明文保存后不回显' : undefined,
                desc: f.hint || undefined,
              },
              textInput({
                mono: !!f.mono,
                placeholder: f.placeholder || (isSecret ? secretPh : ''),
                value: val === undefined || val === null ? '' : String(val),
                onChange: (
                  (k: string) => (e: any) =>
                    putP(k)(e.target.value)
                )(f.key),
              }),
            ),
          );
        }
      });
      if (dynMeta.hint)
        rows.push(
          h('p', { key: 'dyn:hint', className: 'tm-fieldNote' }, h('b', null, '关于该类型：'), dynMeta.hint),
        );
    } else {
      // 字段定义以 Host 上报的 provider 元数据为唯一来源（适配器 fields）。
      // 元数据缺失时不再硬编码各类型表单——那会与适配器实现悄悄漂移。
      rows.push(
        h(
          'p',
          { key: 'nometa', className: 'tm-notice tm-notice-warn' },
          'Host 未上报类型「' +
            String(d.type) +
            '」的字段定义：请重启 dsh web 让插件重新注册，然后刷新本页。',
        ),
      );
    }
    const Btn =
      P.Button ||
      (({ children, ...rest }: any) =>
        h('button', { type: 'button', className: 'tm-btn', ...rest }, children));
    rows.push(
      h(
        'div',
        { key: 'actions', className: 'tm-bar' },
        h(
          Btn,
          { variant: 'primary', size: 'sm', disabled: !canSubmit, onClick: props.onSubmit },
          busy ? '保存中…' : props.submitLabel || '保存',
        ),
        props.onCancel
          ? h(Btn, { variant: 'outline', size: 'sm', disabled: busy, onClick: props.onCancel }, '取消')
          : null,
        !idOk || !nameOk
          ? h(
              'span',
              { className: 'tm-hint' },
              !nameOk ? '请先填写显示名称。' : 'ID 不合法：需小写字母/数字/横线，2–31 位，字母或数字开头。',
            )
          : null,
      ),
    );
    return h('div', { className: 'tm-section' }, rows);
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

  function QuotaSettingsPage(): any {
    const Btn =
      P.Button ||
      (({ children, ...rest }: any) =>
        h('button', { type: 'button', className: 'tm-btn', ...rest }, children));
    const s = useStore();
    React.useEffect(() => {
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
    async function saveVendor(v: any, isEdit: boolean): Promise<void> {
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

    const kids: any[] = [];
    kids.push(
      h(
        'p',
        { key: 'd', className: 'tm-intro' },
        '多供应商滚动额度 / 按量余额，侧边栏实时卡片展示。配置持久化在 settings.yaml（',
        h('code', { className: 'tm-mono' }, s.namespace || 'dshp-token-meter'),
        ' 命名空间' +
          (s.docPath ? '，文件 ' + s.docPath : '') +
          '），外部编辑热重载；密钥用 $NAME 引用或明文。',
      ),
    );
    if (s.error) kids.push(h('p', { key: 'err', className: 'tm-notice tm-notice-err' }, s.error));
    if (!s.cfg) {
      kids.push(
        h(
          'div',
          { key: 'loading', className: 'tm-loading' },
          h('span', { className: 'tm-spinner' }),
          h('span', { className: 'tm-loadingText' }, s.loading ? '正在读取额度配置…' : '额度配置加载失败'),
        ),
      );
      return h('div', { className: 'tm-page' }, kids);
    }
    const a0 = activeOf(s);
    const aSnap = a0 && (s.snaps[a0.id] as VendorSnapshot | undefined);
    kids.push(
      h(
        'div',
        { key: 'status', className: 'tm-section' },
        h(
          SecRow,
          { key: 'a', label: '当前供应商', desc: '侧边栏卡片展示的额度来源。' },
          a0
            ? h('span', null, a0.name, ' ', h(Badge, { kind: 'info', text: typeLabel(a0.type) }))
            : h(Badge, { kind: 'muted', text: '极简模式（无）' }),
        ),
        h(
          SecRow,
          { key: 'n', label: '供应商数量' },
          h(Badge, { kind: vendors.length ? 'info' : 'muted', text: vendors.length + ' 个' }),
        ),
        h(
          SecRow,
          { key: 'v', label: '额度显示' },
          shown ? h(Badge, { kind: 'ok', text: '显示中' }) : h(Badge, { kind: 'muted', text: '已隐藏' }),
        ),
        h(
          SecRow,
          { key: 'r', label: '自动刷新' },
          curSec === 0
            ? h(Badge, { kind: 'muted', text: '已关闭' })
            : h(Badge, { kind: 'ok', text: '每 ' + curSec + ' 秒' }),
        ),
        h(
          SecRow,
          { key: 'u', label: '最近拉取' },
          aSnap && (aSnap as VendorSnapshot).at
            ? h('span', { className: 'tm-hint' }, timeAgo((aSnap as VendorSnapshot).at as string))
            : h('span', { className: 'tm-hint' }, a0 ? '未拉取' : '—'),
        ),
        h(
          SecRow,
          { key: 'f', label: '浮窗' },
          s.floatOpen
            ? h(
                'span',
                { className: 'tm-bar', style: { padding: 0, border: 'none' } },
                h(Badge, { kind: 'info', text: '已弹出' }),
                h(
                  Btn,
                  { variant: 'outline', size: 'sm', disabled: busy, onClick: () => setFloatOpen(false) },
                  '收回侧边栏',
                ),
              )
            : h('span', { className: 'tm-hint' }, '在侧边栏中（卡片标题栏 ⠿ 可拖出）'),
        ),
      ),
    );
    kids.push(
      h(
        'div',
        { key: 'display', className: 'tm-section' },
        h(
          SecRow,
          {
            key: 'sw',
            label: '侧边栏额度卡',
            desc: '关闭后侧边栏仅保留占位提示，不再自动拉取；供应商配置与手动拉取不受影响。',
          },
          h(
            'button',
            {
              className: 'tm-switch' + (shown ? ' tm-switchOn' : ''),
              role: 'switch',
              'aria-checked': shown,
              disabled: busy,
              'aria-label': '侧边栏额度卡',
              onClick: () => void toggleEnabled(),
            },
            h('span', { className: 'tm-knob' }),
          ),
        ),
      ),
    );
    const activeSelect = h(PillSelect, {
      disabled: busy,
      value: activeId,
      selectedLabel: a0 ? a0.name + '（' + typeLabel(a0.type) + '）' : '无 · 极简模式（不拉取）',
      options: [{ id: '', label: '无 · 极简模式（不拉取）' }].concat(
        vendors.map((v: Vendor) => ({ id: v.id, label: v.name + '（' + typeLabel(v.type) + '）' })),
      ),
      onSelect: (id: string) => void applyActive(id),
    });
    const vrows: any[] = [
      h(
        SecRow,
        { key: '__active', label: '当前供应商', desc: '点开选择侧边栏展示的供应商；无 = 极简模式。' },
        activeSelect,
      ),
    ];
    vendors.forEach((v: any) => {
      const snap = s.snaps[v.id] as VendorSnapshot | undefined;
      const isCur = v.id === activeId;
      const status =
        snap && snap.ok
          ? h('span', { className: 'tm-hint' }, '更新' + timeAgo(snap.at as string))
          : snap
            ? P.Tooltip
              ? h(
                  P.Tooltip,
                  { label: snap.error || '拉取失败', side: 'top' },
                  h('span', { className: 'tm-hint' }, '拉取失败'),
                )
              : h('span', { className: 'tm-hint', title: snap.error || '拉取失败' }, '拉取失败')
            : h('span', { className: 'tm-hint' }, '未拉取');
      vrows.push(
        h(
          SecRow,
          {
            key: 'v:' + v.id,
            wrap: true,
            label: h(
              'span',
              { style: { display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, maxWidth: '100%' } },
              h('span', { className: 'tm-dot' + (snap && !snap.ok ? dotToneOf(snap) : '') }),
              h('span', { className: 'tm-vname2', style: { maxWidth: 280 } }, v.name),
              h(Badge, { kind: 'info', text: typeLabel(v.type) }),
              isCur ? h(Badge, { kind: 'ok', text: '当前' }) : null,
              secretBadge(v.secretKind),
            ),
          },
          h(
            'span',
            { className: 'tm-bar', style: { width: '100%', padding: 0, border: 'none' } },
            status,
            h('span', { style: { flex: 1 } }),
            h(
              Btn,
              { variant: 'outline', size: 'sm', disabled: busy, onClick: () => void refreshVendor(v.id) },
              '拉取',
            ),
            h(
              Btn,
              {
                variant: 'outline',
                size: 'sm',
                disabled: busy,
                onClick: () => setEditing({ id: v.id, data: JSON.parse(JSON.stringify(v)) }),
              },
              '编辑',
            ),
            v.secretKind === 'plain'
              ? h(
                  Btn,
                  {
                    variant: 'ghost',
                    size: 'sm',
                    disabled: busy,
                    title: '明文转存系统凭据，改写为 $NAME 引用',
                    onClick: () => void toCred(v.id),
                  },
                  '存凭据',
                )
              : null,
            h(
              Btn,
              { variant: 'ghost', size: 'sm', disabled: busy, onClick: () => requestDelVendor(v) },
              '删除',
            ),
          ),
        ),
      );
    });
    kids.push(
      h(
        'div',
        { key: 'vendors', className: 'tm-section' },
        h('div', { className: 'tm-sectionHead' }, '供应商'),
        h(
          'p',
          { className: 'tm-cardHint', style: { margin: '0 0 4px' } },
          '侧边栏卡片点供应商名也可切换。密钥 $NAME 引用优先，明文保存后不明文回显。',
        ),
        vrows,
      ),
    );
    if (editing)
      kids.push(
        h(
          'div',
          { key: 'edit', className: 'tm-section' },
          h('div', { className: 'tm-sectionHead' }, '编辑 ' + (editing as { id: string }).id),
          h(
            'p',
            { className: 'tm-cardHint', style: { margin: '0 0 4px' } },
            'ID 是主键，不可修改；密钥留空即保留原值。',
          ),
          h(VendorForm, {
            draft: (editing as { data: any }).data,
            set: (nd: any) => setEditing({ id: (editing as { id: string }).id, data: nd }),
            submitLabel: '保存修改',
            busy,
            isEdit: true,
            onCancel: () => setEditing(null),
            onSubmit: () => void saveVendor((editing as { data: any }).data, true),
          }),
        ),
      );
    kids.push(
      h(
        'div',
        { key: 'add', className: 'tm-section' },
        h('div', { className: 'tm-sectionHead' }, '添加供应商'),
        h(VendorForm, {
          draft,
          set: setDraft,
          submitLabel: '添加',
          busy,
          onSubmit: () => void saveVendor(draft, false),
        }),
      ),
    );
    const allSecs = SEC_PRESETS.indexOf(curSec) >= 0 ? SEC_PRESETS : [curSec].concat(SEC_PRESETS);
    kids.push(
      h(
        'div',
        { key: 'refresh', className: 'tm-section' },
        h('div', { className: 'tm-sectionHead' }, '自动刷新'),
        h(
          SecRow,
          {
            key: 'sec',
            label: '刷新间隔',
            desc: '当前供应商按间隔自动拉取；切换供应商会立即刷新一次；失败时保留旧数据并在卡片标注。',
          },
          h(PillSelect, {
            disabled: busy,
            value: String(curSec),
            selectedLabel: secLabel(curSec),
            options: allSecs.map((n) => ({ id: String(n), label: secLabel(n) })),
            onSelect: (id: string) => void saveSecVal(Number(id)),
          }),
        ),
      ),
    );
    kids.push(
      h(
        'div',
        { key: 'tools', className: 'tm-section' },
        h(
          'div',
          { className: 'tm-bar', style: { borderBottom: 'none' } },
          h(
            Btn,
            { variant: 'outline', size: 'sm', disabled: busy, onClick: () => void withBusy(() => reload()) },
            busy ? '读取中…' : '重新读取',
          ),
          h(
            Btn,
            {
              variant: 'outline',
              size: 'sm',
              disabled: busy,
              onClick: () => void withBusy(() => refreshVendor()),
            },
            '全部拉取',
          ),
        ),
      ),
    );
    const manual = aiManual(s.namespace || 'dshp-token-meter', s.docPath || '');
    kids.push(
      h(
        'div',
        { key: 'manual', className: 'tm-section' },
        h('div', { className: 'tm-sectionHead' }, '给 AI 的配置说明书'),
        h(
          'p',
          { className: 'tm-cardHint', style: { margin: '0 0 4px' } },
          'AI 可直接编辑 settings.yaml 的 ',
          h('code', { className: 'tm-mono' }, s.namespace || 'dshp-token-meter'),
          ' 分节，保存即生效（热重载），无需走表单。密钥优先用 $NAME 引用写法。',
        ),
        P.CodeBlock
          ? h(P.CodeBlock, {
              code: manual,
              lang: 'yaml',
              copyLabel: '复制',
              copiedLabel: '已复制',
              className: 'tm-codeblock',
            })
          : h(
              'pre',
              {
                className: 'tm-mono',
                style: { fontSize: 11, whiteSpace: 'pre-wrap', wordBreak: 'break-all' },
              },
              manual,
            ),
      ),
    );
    kids.push(
      h(
        'p',
        { key: 'foot', className: 'tm-footerNote', style: { marginTop: 4 } },
        'manual 类型直接写数字，无需拉取；activeVendor 为空字符串时进入极简模式。',
      ),
    );
    if (confirmDel) {
      const target = confirmDel as { id: string; name: string };
      if (P.RiskConfirmation) {
        kids.push(
          h(P.RiskConfirmation, {
            key: 'confirm-del',
            open: true,
            title: '删除供应商「' + target.name + '」？',
            description: '该供应商的配置与侧边栏快照将一并清除，此操作不可撤销。',
            acknowledgeLabel: '我已了解，删除该供应商',
            cancelLabel: '取消',
            closeLabel: '关闭',
            confirmLabel: '删除',
            acknowledged: acked,
            onAcknowledgedChange: setAcked,
            onCancel: () => setConfirmDel(null),
            onConfirm: () => {
              setConfirmDel(null);
              void delVendor(target.id);
            },
          }),
        );
      } else if (acked) {
        kids.push(
          h(
            'div',
            { key: 'confirm-del', className: 'tm-errbox' },
            h('div', { className: 'tm-errtext' }, '确认删除「' + target.name + '」？'),
            h(
              'div',
              { style: { display: 'flex', gap: 8, marginTop: 6 } },
              h(
                Btn,
                {
                  variant: 'outline',
                  size: 'sm',
                  onClick: () => {
                    setConfirmDel(null);
                    void delVendor(target.id);
                  },
                },
                '确认删除',
              ),
              h(
                Btn,
                {
                  variant: 'outline',
                  size: 'sm',
                  onClick: () => {
                    setConfirmDel(null);
                    setAcked(false);
                  },
                },
                '取消',
              ),
            ),
          ),
        );
      } else {
        kids.push(
          h(
            'div',
            { key: 'confirm-del', className: 'tm-errbox' },
            h('div', { className: 'tm-errtext' }, '删除供应商「' + target.name + '」？此操作不可撤销。'),
            h(
              'div',
              { style: { display: 'flex', gap: 8, marginTop: 6 } },
              h(Btn, { variant: 'outline', size: 'sm', onClick: () => setAcked(true) }, '我已了解'),
              h(Btn, { variant: 'outline', size: 'sm', onClick: () => setConfirmDel(null) }, '取消'),
            ),
          ),
        );
      }
    }
    return h('div', { className: 'tm-page' }, kids);
  }

  /* ---------- 右侧栏富面板：全部供应商展开卡（只读为主 + 切换/拉取/浮窗；增删改去设置页） ---------- */
  /* ---------- 独立供应商小组件（右栏卡片与 widget 浮窗共用同一渲染，样式一致） ----------
   * 自带 tm-card 外框；标题栏的 WidgetToggle 在侧栏显示 ⧉弹出，浮出后同一位置显示 回归。
   * 绑定固定供应商，不跟随“当前供应商”切换。 */
  function QuotaVendorWidget(props: { vendorId: string }): any {
    const Btn =
      P.Button ||
      (({ children, ...rest }: any) =>
        h('button', { type: 'button', className: 'tm-btn', ...rest }, children));
    const s = useStore();
    const now = useNow(1000);
    React.useEffect(() => {
      void ensureLoad();
    }, []);
    // 数据同步（小组件/右栏卡片统一）：Host 每 refreshSec 在服务端拉取上游并写快照，
    // 客户端只做轻量 GET /state 同步 —— 多客户端/多标签页不会重复 fetch 上游。
    // 客户端轮询取 min(refreshSec, 30s) 以便及时看到 Host 的新快照；refreshSec=0 时不轮询（仅手动刷新）。
    const rawSec = s.cfg ? s.cfg.refreshSec : undefined;
    const numSec = rawSec === undefined || rawSec === null || rawSec === '' ? 60 : Number(rawSec);
    const effSec2 = numSec === 0 ? 0 : isFinite(numSec) ? Math.min(3600, Math.max(10, numSec || 60)) : 60;
    const syncMs = effSec2 > 0 ? Math.max(10, Math.min(30, effSec2)) * 1000 : 0;
    React.useEffect(() => {
      if (!(syncMs > 0)) return undefined;
      startSyncLoop(syncMs);
      return () => stopSyncLoop();
    }, [syncMs]);
    const v = ((s.cfg && s.cfg.vendors) || []).filter((x: Vendor) => x.id === props.vendorId)[0];
    if (!s.cfg)
      return h(
        'div',
        { className: 'tm-card' },
        h('div', { className: 'tm-hint' }, s.loading ? '额度加载中…' : s.error || '额度加载失败'),
      );
    if (!v)
      return h(
        'div',
        { className: 'tm-card' },
        h('div', { className: 'tm-hint' }, '供应商已删除，关闭本浮窗即可。'),
      );
    const snap = s.snaps[v.id] as VendorSnapshot | undefined;
    const isCur = v.id === s.cfg.activeVendor;
    const failed = !!(snap && !snap.ok);
    const off = v.enabled === false;
    const peakNow = isPeakHour(new Date(now));
    const wid = 'quota:' + v.id;
    return h(
      'div',
      {
        className: 'tm-card' + (failed && !s.loading ? ' tm-side error' : '') + moodClass(off, peakNow),
        style: { marginBottom: 12 },
      },
      h(
        'div',
        { style: { display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, flexWrap: 'wrap' } },
        h('span', { className: 'tm-dot' + (off ? ' off' : snap && !snap.ok ? dotToneOf(snap) : '') }),
        h('span', { className: 'tm-vname2', style: { maxWidth: 220 } }, v.name),
        h(Badge, { kind: 'info', text: typeLabel(v.type) }),
        secretBadge(v.secretKind),
        isCur ? h(Badge, { kind: 'ok', text: '当前' }) : null,
        off ? h(Badge, { kind: 'bad', text: '已禁用' }) : null,
        h('span', { style: { flex: '1 1 auto' } }),
        h(
          'span',
          { style: { display: 'inline-flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' } },
          isCur
            ? null
            : h(
                Btn,
                { variant: 'outline', size: 'sm', disabled: s.loading, onClick: () => void setActive(v.id) },
                '设为当前',
              ),
          h(
            Btn,
            {
              variant: 'outline',
              size: 'sm',
              disabled: s.loading,
              title: off ? '已禁用定时拉取，手动拉取仍然可用' : undefined,
              onClick: () => void refreshVendor(v.id),
            },
            '拉取',
          ),
          h(
            Btn,
            {
              variant: 'ghost',
              size: 'sm',
              disabled: s.loading,
              title: off ? '重新加入 Host 定时拉取' : '退出 Host 定时拉取（手动拉取不受影响）',
              onClick: () => void setVendorEnabled(v.id, off),
            },
            off ? '启用' : '禁用',
          ),
          WG ? h(WG.WidgetToggle, { id: wid }) : null,
        ),
      ),
      snap
        ? snap.ok
          ? h(
              'div',
              { style: { marginTop: 6 } },
              h(SnapBody, { snap, type: v.type, now }),
              h(
                'div',
                { className: 'tm-qmeta' },
                h(
                  'span',
                  null,
                  '更新' + timeAgo(snap.at as string) + ((snap as any).via ? ' · ' + (snap as any).via : ''),
                ),
                h('span', null, ''),
              ),
            )
          : h(ErrBox, {
              info: errInfoOf(snap, snap.error || '拉取失败'),
              msg: snap.error || '拉取失败',
              meta: v.name + ' · 失败于' + timeAgo(snap.at as string),
              onRetry: () => void refreshVendor(v.id),
            })
        : h('div', { className: 'tm-hint', style: { marginTop: 6 } }, '尚未拉取，点击拉取获取最新额度。'),
    );
  }

  /**
   * 峰谷显示器：部分供应商按峰谷定价，峰值时段用量/计费加速。
   * 规则（可按需调整）：工作日 9:00–18:00 为「峰」，其余时段与周末为「谷」。
   */
  const PEAK_RULE = { weekdays: [1, 2, 3, 4, 5], startHour: 9, endHour: 18 };
  function isPeakHour(t: Date): boolean {
    const w = t.getDay(); // 0=周日
    if (!PEAK_RULE.weekdays.includes(w)) return false;
    const hr = t.getHours();
    return hr >= PEAK_RULE.startHour && hr < PEAK_RULE.endHour;
  }
  /**
   * 卡片氛围类：禁用优先（红），其次按峰/谷 —— 峰=暖色+呼吸（消耗加速），
   * 谷=冷绿+静稳（费率低）。右栏富卡片与左栏紧凑卡片共用同一套观感。
   */
  function moodClass(off: boolean, peak: boolean): string {
    if (off) return ' tm-off';
    return peak ? ' mood-peak' : ' mood-valley';
  }
  function nextPeakSwitch(nowMs: number, peak: boolean): { ms: number; toPeak: boolean } {
    const step = 60000;
    for (let i = 1; i < 7 * 24 * 60; i++) {
      const t = new Date(nowMs + i * step);
      if (isPeakHour(t) !== peak) return { ms: i * step, toPeak: !peak };
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
  function PeakIndicator(props: { widgets?: any; widgetId?: string }): any {
    const now = useNow(60000); // 每分钟刷新状态与倒计时
    const d = new Date(now);
    const peak = isPeakHour(d);
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    const ns = nextPeakSwitch(now, peak);
    const cells: any[] = [];
    for (let hr = 0; hr < 24; hr++) {
      const on = !isWeekend && hr >= PEAK_RULE.startHour && hr < PEAK_RULE.endHour;
      cells.push(
        h('span', {
          key: hr,
          className: 'tm-peakCell' + (on ? ' on' : ' von') + (hr === d.getHours() ? ' now' : ''),
          title: String(hr).padStart(2, '0') + ':00' + (on ? ' 峰' : ' 谷'),
        }),
      );
    }
    const bandLabel = isWeekend
      ? '周末全天为谷'
      : PEAK_RULE.startHour + ':00–' + PEAK_RULE.endHour + ':00 为峰';
    const curTxt = peak ? '峰时段' : '谷时段';
    const nextTxt = ns.toPeak ? '约 ' + fmtDur(ns.ms) + ' 后进入峰' : '约 ' + fmtDur(ns.ms) + ' 后进入谷';
    return h(
      'div',
      { className: 'tm-peak ' + (peak ? 'peak' : 'valley') },
      h(
        'div',
        { className: 'tm-peakHead' },
        h('span', { className: 'tm-peakDot ' + (peak ? 'peak' : 'valley') }),
        h('span', { className: 'tm-peakTitle' }, '峰谷提醒 · ' + curTxt),
        h('span', { className: 'tm-peakTime' }, nextTxt),
        props.widgets && props.widgetId ? h(props.widgets.WidgetToggle, { id: props.widgetId }) : null,
      ),
      h('div', { className: 'tm-peakBand' }, cells),
      h(
        'div',
        { className: 'tm-peakHint' },
        '部分供应商采用峰谷定价：' + bandLabel + '，',
        h(
          'b',
          null,
          peak
            ? '当前为峰，用量消耗加速、额度走得更快，建议错峰跑量或留意余额。'
            : '当前为谷，费率相对低，适合批量与长任务跑量。',
        ),
      ),
    );
  }

  function QuotaRightPane(): any {
    const s = useStore();
    React.useEffect(() => {
      void ensureLoad();
    }, []);
    // 已浮出的供应商卡片原位不渲染（浮窗内自带「回归」）。
    // ⚠ Hooks 规则：任何早退（return）之前必须调用完所有 hooks —— useWidgets 放最前面。
    const floats =
      WG && typeof WG.useWidgets === 'function' ? (WG.useWidgets() as Array<{ id: string }>) : [];
    // 自动刷新已下沉到每个 QuotaVendorWidget（右栏卡片与小组件浮窗统一按 refreshSec 自刷），此处不再重复。
    const kids: any[] = [];
    // 置顶峰谷显示器：工作时间为峰、其余为谷，提醒峰时消耗加速；已浮出为小组件时原位隐藏
    if (!floats.some((w) => w.id === 'peak')) {
      kids.push(h(PeakIndicator, { key: 'peak', widgets: WG || undefined, widgetId: 'peak' }));
    }
    kids.push(
      h(
        'p',
        { key: 'd', className: 'tm-intro' },
        '全部供应商额度一览（右侧栏空间更宽，图表完整展开）。增删改请到 设置 → Token 计量。',
      ),
    );
    if (s.error) kids.push(h('p', { key: 'err', className: 'tm-notice tm-notice-err' }, s.error));
    if (!s.cfg) {
      kids.push(
        h(
          'div',
          { key: 'loading', className: 'tm-loading' },
          h('span', { className: 'tm-spinner' }),
          h('span', { className: 'tm-loadingText' }, s.loading ? '正在读取额度配置…' : '额度配置加载失败'),
        ),
      );
      return h('div', { className: 'tm-page' }, kids);
    }
    const vendors = s.cfg.vendors || [];
    if (!vendors.length) {
      kids.push(
        h(
          'div',
          { key: 'empty', className: 'tm-card tm-empty' },
          '暂无供应商，去 设置 → Token 计量 添加第一个。',
        ),
      );
      return h('div', { className: 'tm-page' }, kids);
    }
    const activeId = s.cfg.activeVendor || '';
    // 卡片顺序：已启用优先 → 组内当前供应商置顶 → 其余保持配置顺序。
    // 禁用的大多只是留档备查，沉到末尾少占视线；两组都在时才加分隔标题说明这不是配置顺序。
    const activeFirst = (list: any[]): any[] =>
      list.filter((v: any) => v.id === activeId).concat(list.filter((v: any) => v.id !== activeId));
    const on = vendors.filter((v: any) => v.enabled !== false);
    const off = vendors.filter((v: any) => v.enabled === false);
    const ordered = activeFirst(on).concat(activeFirst(off));
    const bothGroups = on.length > 0 && off.length > 0;
    let shownOffLabel = false;
    for (const v of ordered) {
      if (bothGroups && v.enabled === false && !shownOffLabel) {
        shownOffLabel = true;
        kids.push(h('div', { key: 'grp-off', className: 'tm-grouplabel' }, '已禁用 · ' + off.length + ' 个'));
      }
      if (floats.some((w) => w.id === 'quota:' + v.id)) continue;
      kids.push(h(QuotaVendorWidget, { key: v.id, vendorId: v.id }));
    }
    return h('div', { className: 'tm-page' }, kids);
  }

  return {
    QuotaSettingsPage,
    QuotaSidebar,
    QuotaFloatEntry,
    QuotaRightPane,
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
