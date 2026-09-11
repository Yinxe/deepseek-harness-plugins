/**
 * Tavily 供应商的设置页附加区（用量与配额卡片）
 *
 * 数据来自 Host 的 `GET /ext/dshp-search-provider/tavily/usage`（60s 服务端缓存，
 * `?force=1` 强制刷新；429 时返回 ok:false + stale 旧快照）。
 *
 * 原实现：dsh-tavily-search/client.js 的「用量与配额」段（JS）
 * → 本文件为等价 TS 重写并搬进供应商目录：新增供应商各自提供自己的附加区，
 * 由 providers/index.ts 注册，SearchSection 只按 id 取组件渲染。
 *
 * @module @dshp/search-provider/client
 */
import type { Bridge } from '../api.js';
import type { Components } from '../components.js';
import type { ProviderState, UsageResponse } from '../types.js';

/** 附加区组件入参：宿主状态 + 该供应商的 stateExtras.usageMeta */
export interface ProviderExtraProps {
  provider: ProviderState;
  usageMeta: Record<string, unknown>;
}

export type ProviderExtraComponent = (props: ProviderExtraProps) => any;

function asRec(v: unknown): Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
}

function asNum(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}

function asStr(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

/** 已用 / 上限文本（上限 null = 未单独设限，用 limitText 兜底说明） */
function fmtCount(used: number | null, limit: number | null): string {
  if (used === null) return '—';
  if (limit === null) return String(used);
  return String(used) + ' / ' + String(limit);
}

function fmtNumber(v: number | null): string {
  return v === null ? '—' : String(v);
}

function pctOf(used: number | null, limit: number | null): number {
  if (used === null || limit === null || limit <= 0) return 0;
  return Math.min(100, Math.round((used / limit) * 100));
}

function fmtTime(ts: unknown): string {
  if (typeof ts !== 'number') return '未知';
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return String(ts);
  }
}

export function createTavilyExtras(
  React: any,
  P: any,
  C: Components,
  bridge: Bridge,
): ProviderExtraComponent {
  return function TavilyUsage(props: ProviderExtraProps) {
    const { provider, usageMeta } = props;
    const [usage, setUsage] = React.useState(null as UsageResponse | null);
    const [usageErr, setUsageErr] = React.useState(null as string | null);
    const [busy, setBusy] = React.useState(null as null | 'usage' | 'usage-force');

    const refresh = React.useCallback(
      (force: boolean) => {
        setBusy(force ? 'usage-force' : 'usage');
        setUsageErr(null);
        bridge
          .getUsage(provider.id, force)
          .then((u: UsageResponse) => {
            setBusy(null);
            if (u && u.ok) {
              setUsage(u);
              setUsageErr(null);
            } else if (u && u.stale) {
              setUsage({
                ok: true,
                usage: u.stale.usage,
                fetchedAt: u.stale.fetchedAt,
                cached: true,
                stale: true,
              });
              setUsageErr(u.error ?? '用量读取失败');
            } else {
              setUsageErr((u && u.error) || '用量读取失败');
            }
          })
          .catch((error: unknown) => {
            setBusy(null);
            setUsageErr(String((error as Error)?.message ?? error));
          });
      },
      [provider.id],
    );

    React.useEffect(() => {
      if (provider.configured) refresh(false);
      else {
        setUsage(null);
        setUsageErr(null);
      }
    }, [provider.configured, refresh]);

    const rows: any[] = [];
    if (!provider.configured) {
      rows.push(
        React.createElement(
          C.Hint,
          {
            key: 'na',
            text: '先配置 API Key 后再查看用量。配额由 Tavily 账号提供，官方限流 10 次 / 10 分钟，服务端已做 60 秒缓存。',
          },
          null,
        ),
      );
    } else if (busy !== null) {
      rows.push(React.createElement(C.Loading, { key: 'busy', text: '正在请求 api.tavily.com/usage …' }));
    } else if (usage !== null && usage.usage) {
      const data = asRec(usage.usage);
      const k = asRec(data['key']);
      const a = asRec(data['account']);
      const keyUsage = asNum(k['usage']);
      const keyLimit = asNum(k['limit']);
      const planUsage = asNum(a['plan_usage']);
      const planLimit = asNum(a['plan_limit']);
      const paygoUsage = asNum(a['paygo_usage']);
      const paygoLimit = asNum(a['paygo_limit']);
      const keyRemain = keyLimit !== null && keyUsage !== null ? keyLimit - keyUsage : null;
      const planRemain = planLimit !== null && planUsage !== null ? planLimit - planUsage : null;
      const paygoRemain = paygoLimit !== null && paygoUsage !== null ? paygoLimit - paygoUsage : null;

      // 生效上限取 Key 与账号计划的最小值（null 视为未设限/无穷大）；实际可用取两者较小剩余
      const keyLimited = keyLimit !== null;
      const planLimited = planLimit !== null;
      const effLimit =
        keyLimited && planLimited
          ? Math.min(keyLimit as number, planLimit as number)
          : keyLimited
            ? (keyLimit as number)
            : planLimited
              ? (planLimit as number)
              : null;
      const effSource =
        keyLimited && planLimited
          ? (keyLimit as number) < (planLimit as number)
            ? 'Key 更小'
            : (planLimit as number) < (keyLimit as number)
              ? '账号计划更小'
              : '两者一致'
          : keyLimited
            ? 'Key（账号计划未设限）'
            : planLimited
              ? '账号计划（Key 未设限）'
              : null;
      const effRemain =
        keyRemain !== null && planRemain !== null
          ? Math.min(keyRemain, planRemain)
          : keyRemain !== null
            ? keyRemain
            : planRemain;
      const bindPct = Math.max(
        keyLimited ? pctOf(keyUsage, keyLimit) : 0,
        planLimited ? pctOf(planUsage, planLimit) : 0,
      );
      const planName = asStr(a['current_plan']);

      const keyLine =
        fmtCount(keyUsage, keyLimit) +
        (keyRemain !== null ? ' · 剩余 ' + keyRemain : '') +
        (keyLimited ? '' : ' · Key 未设限（受账号套餐约束）');

      rows.push(
        React.createElement(
          'div',
          { key: 'rows' },
          React.createElement(
            C.Row,
            { label: '生效上限（取小值）' },
            React.createElement(
              'span',
              { className: 'sp-mono' },
              effLimit !== null ? String(effLimit) + (effSource ? ' · ' + effSource : '') : '不限',
            ),
          ),
          React.createElement(
            C.Row,
            { label: '账号计划用量（总量约束）' },
            React.createElement(
              'span',
              { className: 'sp-mono' },
              fmtCount(planUsage, planLimit) + (planRemain !== null ? ' · 剩余 ' + planRemain : ''),
            ),
          ),
          React.createElement(
            C.Row,
            { label: '当前 Key 用量' },
            React.createElement('span', { className: 'sp-mono' }, keyLine),
          ),
          React.createElement(
            C.Row,
            { label: '账号套餐' },
            planName.length > 0
              ? React.createElement(C.Badge, { kind: 'ok', text: planName })
              : React.createElement(C.Badge, { kind: 'muted', text: '未知' }),
          ),
          React.createElement(
            C.Row,
            { label: 'PAYGO 用量' },
            React.createElement(
              'span',
              { className: 'sp-mono' },
              fmtCount(paygoUsage, paygoLimit) + (paygoRemain !== null ? ' · 剩余 ' + paygoRemain : ''),
            ),
          ),
          React.createElement(C.Meter, { pct: bindPct }),
          effRemain !== null
            ? React.createElement(
                'p',
                { className: 'sp-sub' },
                '实际可用（取 Key 与账号较小剩余）：剩余 ' + effRemain,
              )
            : null,
          !keyLimited
            ? React.createElement(
                'p',
                { className: 'sp-hint' },
                '该 Key 未单独设限，不代表无限：仍受上方账号计划总量约束。',
              )
            : null,
          React.createElement(
            'div',
            { className: 'sp-break' },
            React.createElement(C.BreakRow, {
              label: 'Key search',
              value: fmtCount(asNum(k['search_usage']), null),
            }),
            React.createElement(C.BreakRow, {
              label: 'Key extract',
              value: fmtCount(asNum(k['extract_usage']), null),
            }),
            React.createElement(C.BreakRow, {
              label: 'Key crawl',
              value: fmtCount(asNum(k['crawl_usage']), null),
            }),
            React.createElement(C.BreakRow, {
              label: 'Key map',
              value: fmtCount(asNum(k['map_usage']), null),
            }),
            React.createElement(C.BreakRow, {
              label: 'Key research',
              value: fmtCount(asNum(k['research_usage']), null),
            }),
          ),
          React.createElement('p', { className: 'sp-sub' }, '账号各端点分项（本计费周期）：'),
          React.createElement(
            'div',
            { className: 'sp-break' },
            React.createElement(C.BreakRow, {
              label: '账号 search',
              value: fmtNumber(asNum(a['search_usage'])),
            }),
            React.createElement(C.BreakRow, {
              label: '账号 extract',
              value: fmtNumber(asNum(a['extract_usage'])),
            }),
            React.createElement(C.BreakRow, {
              label: '账号 crawl',
              value: fmtNumber(asNum(a['crawl_usage'])),
            }),
            React.createElement(C.BreakRow, { label: '账号 map', value: fmtNumber(asNum(a['map_usage'])) }),
            React.createElement(C.BreakRow, {
              label: '账号 research',
              value: fmtNumber(asNum(a['research_usage'])),
            }),
          ),
          React.createElement(
            'div',
            { className: 'sp-foot' },
            React.createElement(
              'span',
              { className: 'sp-hint' },
              '更新于 ' +
                fmtTime(usage.fetchedAt) +
                (usage.cached ? ' · 缓存' : ' · 实时') +
                (usage.stale ? ' · 旧数据（最新查询失败）' : ''),
            ),
            React.createElement(
              'a',
              { href: provider.homepage, target: '_blank', rel: 'noreferrer', className: 'sp-hint' },
              '官方文档',
            ),
          ),
        ),
      );
    } else {
      rows.push(
        React.createElement(C.Notice, {
          key: 'err',
          kind: 'err',
          text: '用量读取失败：' + (usageErr || '未知错误'),
        }),
      );
    }

    const rateLimit = asStr(usageMeta['rateLimit']);
    return React.createElement(
      'div',
      { className: 'sp-section' },
      React.createElement('div', { className: 'sp-sectionHead' }, '用量与配额（GET /usage）'),
      React.createElement(
        'div',
        { className: 'sp-bar' },
        React.createElement('span', { style: { flex: 1 } }),
        React.createElement(
          P.Button,
          {
            variant: 'outline',
            size: 'sm',
            disabled: busy !== null || !provider.configured,
            onClick: () => refresh(false),
          },
          busy === 'usage' ? '读取中…' : '刷新',
        ),
        React.createElement(
          P.Button,
          {
            variant: 'outline',
            size: 'sm',
            disabled: busy !== null || !provider.configured,
            onClick: () => refresh(true),
          },
          busy === 'usage-force' ? '刷新中…' : '强制刷新',
        ),
      ),
      rows,
      usageErr && usage && usage.usage
        ? React.createElement(C.Notice, { kind: 'err', text: '最新查询失败，已显示缓存：' + usageErr })
        : null,
      usageErr && !(usage && usage.usage) && provider.configured
        ? React.createElement(C.Notice, { kind: 'err', text: String(usageErr) })
        : null,
      React.createElement(
        C.Hint,
        {
          text:
            '鉴权为 Authorization: Bearer <Key>（与 /search 的 body.api_key 不同）；401 表示 Key 无效、429 表示触发限流' +
            (rateLimit.length > 0 ? '（' + rateLimit + '）' : '') +
            '。计费按 credits：basic 搜索 1/次、advanced 2/次。',
        },
        null,
      ),
    );
  };
}
