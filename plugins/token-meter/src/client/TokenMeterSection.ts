/**
 * TokenMeter 设置页（精简版）+ 右侧栏双面板
 *
 * 布局分工：
 *  - 设置页（settings.section）：偏好（自动刷新/默认范围）+ 供应商添加与管理
 *    （当前选择/拉取/编辑/存凭据/删除）。图表与展示全部搬到右侧栏，
 *    设置页不再展示趋势/热力/模型分布；失效的侧边栏显示开关已移除。
 *  - 右侧栏 tab「额度」：全部供应商展开富卡片（空间更宽，图表完整展开）。
 *  - 右侧栏 tab「用量」：完整用量统计（StatsSettingsPage，开关行隐藏，收归设置页）。
 *
 * 状态经 quota 共享 store 即时同步（设置/右栏同一数据源）；偏好变更后广播
 * tm-prefs-changed，右栏用量面板跟进重载。
 */
import { fetchState } from './api.js';
import { createQuotaSection } from './QuotaSection.js';
import { createStatsSection } from './StatsSection.js';
import { createWidgetSystem } from './widgets.js';
import type { AnyPrimitives, AnyReact } from './types.js';

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

export function createTokenMeterSection(React: AnyReact, P: AnyPrimitives, ReactDOM: any): any {
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

    const kids: any[] = [];
    kids.push(
      h(
        'p',
        { key: 'd', className: 'tm-intro' },
        '额度供应商与偏好。详细额度与用量图表请到右侧栏「额度 / 用量」面板查看（空间更宽）。配置持久化在 settings.yaml（',
        h('code', { className: 'tm-mono' }, (s.namespace as string) || 'dshp-token-meter'),
        ' 命名空间），外部编辑热重载。',
      ),
    );
    if (s.error) kids.push(h('p', { key: 'err', className: 'tm-notice tm-notice-err' }, s.error));
    if (opErr) kids.push(h('p', { key: 'operr', className: 'tm-notice tm-notice-err' }, opErr));
    if (!s.cfg) {
      kids.push(
        h(
          'div',
          { key: 'loading', className: 'tm-loading' },
          h('span', { className: 'tm-spinner' }),
          h('span', { className: 'tm-loadingText' }, s.loading ? '正在读取配置…' : '配置加载失败'),
        ),
      );
      return h('div', { className: 'tm-page' }, kids);
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
    const defRange = String(s.cfg.defaultRange || '30');

    // 偏好（右栏常驻展示，无需显示开关；失效的侧边栏开关已移除）
    kids.push(
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
        h(
          UI.SecRow,
          { key: 'range', label: '默认范围', desc: '右侧栏「用量」面板打开时默认统计多少天的数据。' },
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
      ),
    );

    const vrows: any[] = [
      h(
        UI.SecRow,
        {
          key: '__active',
          label: '当前供应商',
          desc: '侧边栏与右侧栏额度卡展示哪一家的额度；选「无」= 极简模式（不展示、也不拉取任何额度）。',
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
    kids.push(
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
    kids.push(
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
      } else {
        kids.push(
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
    return h('div', { className: 'tm-page' }, kids);
  }

  /** 右侧栏「用量」面板：完整统计图表（开关行隐藏，收归设置页） */
  function StatsRightPane(): any {
    const [prefs, setPrefs] = useState<{ showToday: boolean; defaultRange: string }>({
      showToday: false,
      defaultRange: '30',
    });
    const loadPrefs = async (): Promise<void> => {
      try {
        const s = await fetchState();
        if (s.ok && s.config) {
          setPrefs({
            showToday: s.config.showToday === true,
            defaultRange: String(s.config.defaultRange || '30'),
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
    QuotaRightPane: quota.QuotaRightPane,
    StatsRightPane,
    WidgetFloatLayer,
    widgetsApi: widgets,
  };
}
