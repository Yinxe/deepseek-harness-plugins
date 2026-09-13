/**
 * TokenMeter 设置页（精简版）+ 中心区「用量统计 / 在线统计」面板
 *
 * 布局分工：
 *  - 设置页（settings.section）：偏好（自动刷新/默认范围/在线阈值）+ 供应商添加与管理
 *    （当前选择/拉取/编辑/存凭据/删除）。图表与展示全部搬到中心区，
 *    设置页不再展示趋势/热力/模型分布；失效的侧边栏显示开关已移除。
 *  - 中心区 tab（conversation.view，见 CenterView.ts）：左侧菜单切换
 *    额度查询 / 用量统计 / 在线统计；本文件提供其中「用量统计」面板。
 *
 * 状态经 quota 共享 store 即时同步（设置/中心区同一数据源）；偏好变更后广播
 * tm-prefs-changed，中心区用量面板跟进重载。
 */
import { clearStatsCache, fetchState, fetchStats } from './api.js';
import { createQuotaSection } from './QuotaSection.js';
import { createStatsSection } from './StatsSection.js';
import { createWidgetSystem } from './widgets.js';
import type { AnyPrimitives, AnyReact } from './types.js';
import { DISPLAY_NAME } from '../name.js';

const STATS_WIDGET_BTNS: Array<[string, string]> = [
  ['cards', '指标卡'],
  ['trend', '趋势'],
  ['heat', '热力'],
  ['donut', '模型'],
  ['today', '今日'],
];

const SEC_PRESETS = [0, 30, 60, 120, 300, 600, 1800, 3600];
function secLabel(n: number): string {
  return n === 0 ? '关闭自动刷新' : n + ' 秒';
}
const NEW_VENDOR = { id: '', name: '', type: 'opencode', params: { workspaceId: '', cookie: '' } };

/**
 * 装配产出面。**显式声明，不要 `any`**：
 * 这份对象是中心区 tab 唯一的来源，漏掉一个字段不会报错，只会在渲染时才炸成 React #130
 * （分享面板正是这么崩的：`parts.SharePanel` 为 undefined，一打开分享就把整个 tab 打崩）。
 * 有显式接口之后，漏字段在 `pnpm typecheck` 阶段就会被拦下。
 */
export interface TokenMeterSectionParts {
  /** 设置页组件（settings.section 与中心区「设置」分区共用同一个） */
  TokenMeterSettings: any;
  /** 额度查询视图（中心区分区） */
  QuotaView: any;
  /** 用量统计视图（中心区分区） */
  StatsView: any;
  /** 分享面板（中心区 tab 头部「分享」按钮渲染它） */
  SharePanel: any;
  /** 全局小组件浮层（shell.overlay） */
  WidgetFloatLayer: any;
  /** 小组件注册表 */
  widgetsApi: any;
  /** 统计接口（在线统计复用同一份快照） */
  statsApi: any;
}

export function createTokenMeterSection(
  React: AnyReact,
  P: AnyPrimitives,
  ReactDOM: any,
): TokenMeterSectionParts {
  const h = React.createElement;
  const useState = React.useState as <T>(init: T) => [T, (v: T | ((prev: T) => T)) => void];
  const widgets = createWidgetSystem(React, ReactDOM);
  const quota = createQuotaSection(React, P, ReactDOM, widgets);
  const stats = createStatsSection(React, P, ReactDOM);
  const store = quota.quotaStore;
  const UI = quota.quotaUI;
  const Btn =
    P.Button ||
    (({ children, ...rest }: any) => h('button', { type: 'button', className: 'tm-btn', ...rest }, children));

  function notifyPrefs(patch: Record<string, unknown>): void {
    try {
      window.dispatchEvent(new CustomEvent('tm-prefs-changed', { detail: patch }));
    } catch {
      /* ignore */
    }
  }

  /** 精简设置页：开关 + 供应商添加/管理（无图表） */
  function TokenMeterSettings(): any {
    const s = store.useStore();
    React.useEffect(() => {
      void store.ensureLoad();
    }, []);
    const [busy, setBusy] = useState(false);
    const [opErr, setOpErr] = useState('');
    const [draft, setDraft] = useState(JSON.parse(JSON.stringify(NEW_VENDOR)));
    const [editing, setEditing] = useState<{ id: string; data: any } | null>(null);
    const [confirmDel, setConfirmDel] = useState<any | null>(null);
    const [acked, setAcked] = useState(false);

    async function withBusy(fn: () => Promise<void>): Promise<void> {
      setBusy(true);
      setOpErr('');
      try {
        await fn();
      } finally {
        setBusy(false);
      }
    }
    async function saveVendor(v: any, isEdit: boolean): Promise<void> {
      await withBusy(async () => {
        try {
          const r = await store.call(isEdit ? 'quota.update-vendor' : 'quota.add-vendor', { vendor: v });
          if (r && r.ok) {
            if (!isEdit) setDraft(JSON.parse(JSON.stringify(NEW_VENDOR)));
            else setEditing(null);
            await store.reload();
          } else setOpErr(String((r && r.error) || '保存失败'));
        } catch {
          setOpErr('连接 Host 失败');
        }
      });
    }
    async function delVendor(id: string): Promise<void> {
      await withBusy(async () => {
        try {
          const r = await store.call('quota.delete-vendor', { id });
          if (!(r && r.ok)) setOpErr(String((r && r.error) || '删除失败'));
          await store.reload();
        } catch {
          setOpErr('连接 Host 失败');
        }
      });
    }
    async function toCred(id: string): Promise<void> {
      await withBusy(async () => {
        try {
          const r = await store.call('quota.secret-to-cred', { id });
          if (r && r.ok) await store.reload();
          else setOpErr(String((r && r.error) || '转存失败'));
        } catch {
          setOpErr('连接 Host 失败');
        }
      });
    }
    const pickRange = (v: string): Promise<void> =>
      withBusy(async () => {
        const r = await store.savePrefs({ defaultRange: v });
        if (!r.ok) setOpErr(String(r.error || '保存失败'));
        else notifyPrefs({ defaultRange: v });
      });

    const [tab, setTab] = useState<'stats' | 'quota'>('stats');
    const [statsSnap, setStatsSnap] = useState(null as any);
    const [clearArmed, setClearArmed] = useState(false);
    const [clearMsg, setClearMsg] = useState('');
    React.useEffect(() => {
      let alive = true;
      const tick = (): void => {
        void fetchStats()
          .then((v) => {
            if (alive) setStatsSnap(v);
          })
          .catch(() => {});
      };
      tick();
      const id = window.setInterval(tick, 5000);
      return () => {
        alive = false;
        window.clearInterval(id);
      };
    }, [clearMsg]);

    const commonKids: any[] = [];
    const statsKids: any[] = [];
    const quotaKids: any[] = [];
    if (s.error) commonKids.push(h('p', { key: 'err', className: 'tm-notice tm-notice-err' }, s.error));
    if (opErr) commonKids.push(h('p', { key: 'operr', className: 'tm-notice tm-notice-err' }, opErr));
    if (!s.cfg) {
      commonKids.push(
        h(
          'div',
          { key: 'loading', className: 'tm-loading' },
          h('span', { className: 'tm-spinner' }),
          h('span', { className: 'tm-loadingText' }, s.loading ? '正在读取配置…' : '配置加载失败'),
        ),
      );
      return h('div', { className: 'tm-page' }, commonKids);
    }

    const vendors = s.cfg.vendors || [];
    const activeId = s.cfg.activeVendor || '';
    const a0 = store.activeOf(s);
    const rawSec = s.cfg.refreshSec;
    const curSec =
      rawSec === undefined || rawSec === null || rawSec === ''
        ? 60
        : Number(rawSec) === 0
          ? 0
          : isFinite(Number(rawSec))
            ? Math.min(3600, Math.max(10, Number(rawSec) || 60))
            : 60;
    const defRange = String(s.cfg.defaultRange || 'all');

    // 偏好：额度侧（自动刷新）与统计侧（默认范围、在线阈值）分到各自 tab
    quotaKids.push(
      h(
        'div',
        { key: 'display', className: 'tm-section' },
        h('div', { className: 'tm-sectionHead' }, '偏好'),
        h(
          UI.SecRow,
          {
            key: 'sec',
            label: '自动刷新',
            desc: '每隔这么久自动去平台拉一次额度（只拉「已启用」的供应商，禁用的见下方列表）。选「关闭自动刷新」后不再定时拉取，仍可随时手动点「拉取」。',
          },
          h(UI.PillSelect, {
            disabled: busy,
            value: String(curSec),
            selectedLabel: secLabel(curSec),
            options: (SEC_PRESETS.indexOf(curSec) >= 0 ? SEC_PRESETS : [curSec].concat(SEC_PRESETS)).map(
              (n) => ({ id: String(n), label: secLabel(n) }),
            ),
            onSelect: (id: string) => void withBusy(() => store.setRefresh(Number(id))),
          }),
        ),
      ),
    );

    const snapTotal = statsSnap && typeof statsSnap.total === 'number' ? statsSnap.total : null;
    const snapScanned = statsSnap && typeof statsSnap.scanned === 'number' ? statsSnap.scanned : null;
    const snapErrors = statsSnap && typeof statsSnap.errors === 'number' ? statsSnap.errors : null;
    const snapHits = statsSnap && typeof statsSnap.cacheHits === 'number' ? statsSnap.cacheHits : null;
    const snapReused = statsSnap && typeof statsSnap.reused === 'number' ? statsSnap.reused : null;
    const gapNow = String((s.cfg as any).onlineGapMin ?? 5);
    statsKids.push(
      h(
        'div',
        { key: 'source', className: 'tm-card' },
        h('div', { className: 'tm-title' }, '数据来源：会话记录（唯一真相源）'),
        h(
          'p',
          { className: 'tm-desc', style: { margin: '4px 0 0' } },
          '所有统计（Token 用量、在线时长、模型分布、热力图…）都由 ',
          h('code', { className: 'tm-mono' }, '$DSH_HOME/sessions/'),
          ' 下的会话日志聚合而来。下面的缓存只是**可丢的派生数据**：删掉后会自动凭会话日志重算，但**会话记录本身丢了就再也算不回来**。',
        ),
        h(
          'p',
          { className: 'tm-desc', style: { margin: '4px 0 0' } },
          '迁移 / 备份 / 换机时：**保留 `sessions/` 目录**（体积以本机为例约 250MB）；',
          h('code', { className: 'tm-mono' }, 'storages/token_stats.json'),
          ' 不必备份（重建即可）。',
        ),
        h(
          'div',
          { className: 'tm-toolbar', style: { marginTop: 8 } },
          h(
            Btn,
            {
              variant: 'outline',
              size: 'sm',
              onClick: () => {
                try {
                  void navigator.clipboard.writeText('$DSH_HOME/sessions/');
                  setClearMsg('已复制会话目录路径');
                } catch {
                  setClearMsg('复制失败，请手动复制 $DSH_HOME/sessions/');
                }
              },
            },
            '复制会话目录路径',
          ),
        ),
      ),
    );
    statsKids.push(
      h(
        'div',
        { key: 'cache', className: 'tm-section' },
        h('div', { className: 'tm-sectionHead' }, '缓存与扫描状态'),
        h(
          'div',
          { className: 'tm-card' },
          h(
            'div',
            { className: 'tm-chart-title', style: { marginBottom: 4 } },
            h('span', { className: 'tm-chart-name' }, '派生缓存'),
            h(
              'span',
              { className: 'tm-hint' },
              statsSnap && statsSnap.generatedAt
                ? '更新于 ' + new Date(statsSnap.generatedAt).toLocaleTimeString()
                : '读取中…',
            ),
          ),
          h(
            'div',
            { className: 'tm-cacheRow', style: { marginTop: 0 } },
            h('span', null, '会话 ' + (snapScanned ?? '—') + '/' + (snapTotal ?? '—') + ' 已扫描'),
            h(
              'span',
              null,
              '复用 ' + (snapReused ?? '—') + (snapHits != null ? '（缓存 ' + snapHits + '）' : ''),
            ),
            h('span', null, '扫描失败 ' + (snapErrors ?? '—')),
            h(
              'span',
              null,
              '直读 ' + (statsSnap && statsSnap.directReads != null ? statsSnap.directReads : '—'),
            ),
            h('span', null, '存储 ' + (statsSnap && statsSnap.storage ? statsSnap.storage : '—')),
          ),
          h(
            'p',
            { className: 'tm-desc', style: { margin: '6px 0 0' } },
            '「复用」= 该会话日志没变，直接沿用上次结果（重启后来自持久化缓存，运行中来自内存）；日志变大时只读新增部分。',
          ),
          h(
            'div',
            { className: 'tm-toolbar', style: { marginTop: 8 } },
            clearArmed
              ? h(
                  Btn,
                  {
                    variant: 'outline',
                    size: 'sm',
                    disabled: busy,
                    onClick: () =>
                      void withBusy(async () => {
                        setClearMsg('');
                        const r = await clearStatsCache();
                        setClearMsg(
                          r.ok
                            ? '已清除 ' + (r.removed ?? 0) + ' 行缓存，正在重算…'
                            : String(r.error || '清除失败'),
                        );
                        setClearArmed(false);
                      }),
                  },
                  '确认清除并重算',
                )
              : h(
                  Btn,
                  { variant: 'outline', size: 'sm', disabled: busy, onClick: () => setClearArmed(true) },
                  '清除统计缓存',
                ),
            clearArmed
              ? h(Btn, { variant: 'outline', size: 'sm', onClick: () => setClearArmed(false) }, '取消')
              : null,
            clearMsg ? h('span', { className: 'tm-hint' }, clearMsg) : null,
          ),
          h(
            'p',
            { className: 'tm-desc', style: { margin: '6px 0 0' } },
            '清除后下一次扫描会重新读取全部会话日志（本机约 6 秒），期间面板显示「后台补扫中」。',
          ),
        ),
      ),
    );
    statsKids.push(
      h(
        'div',
        { key: 'statpref', className: 'tm-section' },
        h('div', { className: 'tm-sectionHead' }, '偏好'),
        h(
          UI.SecRow,
          { key: 'range', label: '默认范围', desc: '中心区「用量统计」打开时默认统计多少天的数据。' },
          h(UI.PillSelect, {
            disabled: busy,
            value: defRange,
            selectedLabel: defRange === 'all' ? '全部' : '近 ' + defRange + ' 天',
            options: [
              { id: '7', label: '近 7 天' },
              { id: '30', label: '近 30 天' },
              { id: '90', label: '近 90 天' },
              { id: 'all', label: '全部' },
            ],
            onSelect: (id: string) => void pickRange(id),
          }),
        ),
        h(
          UI.SecRow,
          {
            key: 'gap',
            label: '在线时长空闲阈值',
            desc:
              '在线 = 有事件、且相邻事件间隔不超过它的墙钟时间：间隔 ≤ 阈值则整段计入（含中间空档），' +
              '超过就断开、中间不计；每段只算到最后一个事件，所以任何档位都是下界。推荐 15 分钟' +
              '（能兜住读长回答/想需求的静默期，又不会把开会吃饭算进来）；详细说明与各档实测对比见「在线统计」面板顶部。',
          },
          h(UI.PillSelect, {
            disabled: busy,
            value: gapNow,
            selectedLabel: gapNow + ' 分钟',
            options: [1, 5, 15, 30, 60].map((n) => ({ id: String(n), label: n + ' 分钟' })),
            onSelect: (id: string) =>
              void withBusy(async () => {
                const r = await store.savePrefs({ onlineGapMin: Number(id) } as any);
                if (!r.ok) setOpErr(String(r.error || '保存失败'));
                else notifyPrefs({ onlineGapMin: Number(id) });
              }),
          }),
        ),
      ),
    );

    const vrows: any[] = [
      h(
        UI.SecRow,
        {
          key: '__active',
          label: '当前供应商',
          desc: '侧边栏与中心区额度卡展示哪一家的额度；选「无」= 极简模式（不展示、也不拉取任何额度）。',
        },
        h(UI.PillSelect, {
          disabled: busy,
          value: activeId,
          selectedLabel: a0 ? a0.name + '（' + store.typeLabel(a0.type) + '）' : '无 · 极简模式（不拉取）',
          options: [{ id: '', label: '无 · 极简模式（不拉取）' }].concat(
            vendors.map((v: any) => ({ id: v.id, label: v.name + '（' + store.typeLabel(v.type) + '）' })),
          ),
          onSelect: (id: string) =>
            void withBusy(async () => {
              await store.setActive(id);
              await store.reload();
            }),
        }),
      ),
    ];
    // 与管理页保持一致：已启用优先、组内当前供应商置顶（禁用项沉底便于集中查看/启用）
    const listOn = vendors.filter((v: any) => v.enabled !== false);
    const listOff = vendors.filter((v: any) => v.enabled === false);
    const activeFirstOf = (list: any[]): any[] =>
      list.filter((v: any) => v.id === activeId).concat(list.filter((v: any) => v.id !== activeId));
    activeFirstOf(listOn)
      .concat(activeFirstOf(listOff))
      .forEach((v: any) => {
        const snap = s.snaps[v.id];
        const isCur = v.id === activeId;
        const off = v.enabled === false;
        // 禁用优先：不论有没有快照，都明确显示「已禁用定时拉取」（否则会显示成「拉取正常」，误导）
        const status = off
          ? h('span', { className: 'tm-hint tm-offtxt' }, '已禁用定时拉取')
          : snap && snap.ok
            ? h('span', { className: 'tm-hint' }, '拉取正常')
            : snap
              ? h('span', { className: 'tm-hint', title: snap.error || '拉取失败' }, '拉取失败')
              : h('span', { className: 'tm-hint' }, '未拉取');
        vrows.push(
          h(
            UI.SecRow,
            {
              key: 'v:' + v.id,
              wrap: true,
              label: h(
                'span',
                { style: { display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, maxWidth: '100%' } },
                h('span', { className: 'tm-dot' + (off ? ' off' : snap && !snap.ok ? ' bad' : '') }),
                h('span', { className: 'tm-vname2', style: { maxWidth: 280 } }, v.name),
                h(UI.Badge, { kind: 'info', text: store.typeLabel(v.type) }),
                isCur ? h(UI.Badge, { kind: 'ok', text: '当前' }) : null,
                off ? h(UI.Badge, { kind: 'bad', text: '已禁用' }) : null,
                UI.secretBadge(v.secretKind),
              ),
            },
            h(
              'span',
              { className: 'tm-bar', style: { width: '100%', padding: 0, border: 'none' } },
              status,
              h('span', { style: { flex: 1 } }),
              h(
                Btn,
                {
                  variant: 'outline',
                  size: 'sm',
                  disabled: busy,
                  onClick: () => void withBusy(() => store.refreshVendor(v.id)),
                },
                '拉取',
              ),
              h(
                Btn,
                {
                  variant: 'ghost',
                  size: 'sm',
                  disabled: busy,
                  title: off ? '重新加入 Host 定时拉取' : '退出 Host 定时拉取（手动拉取不受影响）',
                  onClick: () => void withBusy(() => store.setVendorEnabled(v.id, off)),
                },
                off ? '启用' : '禁用',
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
                {
                  variant: 'ghost',
                  size: 'sm',
                  disabled: busy,
                  onClick: () => {
                    setAcked(false);
                    setConfirmDel(v);
                  },
                },
                '删除',
              ),
            ),
          ),
        );
      });
    quotaKids.push(
      h(
        'div',
        { key: 'vendors', className: 'tm-section' },
        h('div', { className: 'tm-sectionHead' }, '供应商（' + vendors.length + '）'),
        h(
          'p',
          { className: 'tm-cardHint', style: { margin: '0 0 4px' } },
          '密钥建议填 $NAME 引用（先存系统凭据，配置文件里看不到明文）；直接填明文也不会被回显。「禁用」只是退出定时拉取，随时可以手动「拉取」，也可再点「启用」恢复。',
        ),
        vrows,
      ),
    );
    if (editing)
      quotaKids.push(
        h(
          'div',
          { key: 'edit', className: 'tm-section' },
          h('div', { className: 'tm-sectionHead' }, '编辑 ' + (editing as { id: string }).id),
          h(
            'p',
            { className: 'tm-cardHint', style: { margin: '0 0 4px' } },
            'ID 是主键，不可修改；密钥留空即保留原值。',
          ),
          h(UI.VendorForm, {
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
    quotaKids.push(
      h(
        'div',
        { key: 'add', className: 'tm-section' },
        h('div', { className: 'tm-sectionHead' }, '添加供应商'),
        h(UI.VendorForm, {
          draft,
          set: setDraft,
          submitLabel: '添加',
          busy,
          onSubmit: () => void saveVendor(draft, false),
        }),
      ),
    );
    if (confirmDel) {
      const target = confirmDel as { id: string; name: string };
      if (P.RiskConfirmation) {
        quotaKids.push(
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
      } else {
        quotaKids.push(
          h(
            'div',
            { key: 'confirm-del', className: 'tm-errbox' },
            h(
              'div',
              { className: 'tm-errtext' },
              '删除供应商「' + target.name + '」？此操作不可撤销。' + (acked ? '' : '请先确认。'),
            ),
            h(
              'div',
              { style: { display: 'flex', gap: 8, marginTop: 6 } },
              acked
                ? h(
                    Btn,
                    {
                      variant: 'outline',
                      size: 'sm',
                      onClick: () => {
                        setConfirmDel(null);
                        setAcked(false);
                        void delVendor(target.id);
                      },
                    },
                    '确认删除',
                  )
                : h(Btn, { variant: 'outline', size: 'sm', onClick: () => setAcked(true) }, '我已了解'),
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
      }
    }
    const tabBtn = (id: 'stats' | 'quota', label: string): any =>
      h(
        'button',
        {
          key: id,
          type: 'button',
          className: 'tm-tab' + (tab === id ? ' tm-tabOn' : ''),
          onClick: () => setTab(id),
        },
        label,
      );
    return h(
      'div',
      { className: 'tm-page' },
      commonKids,
      h('div', { className: 'tm-tabs' }, tabBtn('stats', '统计设置'), tabBtn('quota', '额度配置')),
      h(
        'p',
        { className: 'tm-intro' },
        tab === 'stats'
          ? '统计设置：数据来源、派生缓存与默认口径。详细图表在中心区「' +
              DISPLAY_NAME +
              ' → 用量统计 / 在线统计」。'
          : '额度配置：供应商与拉取偏好。详细额度卡在中心区「' +
              DISPLAY_NAME +
              ' → 额度查询」。配置持久化在 settings.yaml（',
        tab === 'stats'
          ? null
          : h('code', { className: 'tm-mono' }, (s.namespace as string) || 'dshp-token-meter'),
        tab === 'stats' ? null : ' 命名空间），外部编辑热重载。',
      ),
      tab === 'stats' ? statsKids : quotaKids,
    );
  }

  /** 中心区「用量统计」面板：完整统计图表（开关行隐藏，收归设置页） */
  function StatsView(): any {
    const [prefs, setPrefs] = useState<{ showToday: boolean; defaultRange: string }>({
      showToday: false,
      defaultRange: 'all',
    });
    const loadPrefs = async (): Promise<void> => {
      try {
        const s = await fetchState();
        if (s.ok && s.config) {
          setPrefs({
            showToday: s.config.showToday === true,
            defaultRange: String(s.config.defaultRange || 'all'),
          });
        }
      } catch {
        /* ignore */
      }
    };
    React.useEffect(() => {
      void loadPrefs();
      const fn = (): void => {
        void loadPrefs();
      };
      window.addEventListener('tm-prefs-changed', fn);
      return () => window.removeEventListener('tm-prefs-changed', fn);
    }, []);
    return h(
      'div',
      { className: 'tm-page' },
      h(
        'div',
        { className: 'tm-toolbar' },
        h('span', { className: 'tm-hint' }, '小组件'),
        STATS_WIDGET_BTNS.map(([k, t]) =>
          h(
            'span',
            { key: k, className: 'tm-widgetBtn' },
            h('span', { className: 'tm-widgetBtn-label' }, t),
            h(widgets.WidgetToggle, { id: 'stats:' + k }),
          ),
        ),
      ),
      h(
        stats.HiddenWhenFloated,
        { widgets, id: 'stats:today' },
        h(stats.TodayCard, { wide: true, bare: true, name: '今日消耗', widgets, widgetId: 'stats:today' }),
      ),
      h(stats.StatsSettingsPage, {
        defaultRange: prefs.defaultRange,
        showToday: prefs.showToday,
        onPrefs: () => void loadPrefs(),
        showPrefs: false,
        widgets,
      }),
    );
  }

  /** 全局小组件浮层：渲染所有已弹出的 widget（quota:<id> / stats:<kind>）。
   * 浮窗只有定位，没有外框 —— 组件自身的卡片即浮窗外观，与原位完全一致。 */
  function WidgetFloatLayer(): any {
    const list = widgets.useWidgets() as Array<{ id: string; pos: { x: number; y: number } }>;
    if (!list.length) return null;
    return h(
      React.Fragment,
      null,
      list.map((w) => {
        const sep = w.id.indexOf(':');
        const prefix = sep >= 0 ? w.id.slice(0, sep) : '';
        const rest = sep >= 0 ? w.id.slice(sep + 1) : w.id;
        // 统一规格：所有小组件浮窗同一宽度（widgets 常量 FLOAT_W），CSS 统一限高 60vh
        if (w.id === 'peak') {
          return h(
            widgets.WidgetFloat,
            { key: w.id, id: w.id },
            h(quota.PeakIndicator, { widgets, widgetId: w.id }),
          );
        }
        if (prefix === 'quota') {
          return h(
            widgets.WidgetFloat,
            { key: w.id, id: w.id },
            h(quota.QuotaVendorWidget, { vendorId: rest }),
          );
        }
        if (prefix === 'stats') {
          return h(
            widgets.WidgetFloat,
            { key: w.id, id: w.id },
            h(stats.StatsWidget, { kind: rest, widgets, widgetId: w.id }),
          );
        }
        return null;
      }),
    );
  }

  return {
    TokenMeterSettings,
    QuotaView: quota.QuotaView,
    StatsView,
    // 分享面板：中心区 tab 头部「分享」按钮的实际内容（漏了这一项就是 React #130）
    SharePanel: stats.SharePanel,
    WidgetFloatLayer,
    widgetsApi: widgets,
    statsApi: stats,
  };
}
