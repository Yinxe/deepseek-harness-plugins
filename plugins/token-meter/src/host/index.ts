/**
 * @dshp/token-meter —— DSH Bundle 插件 Host 半（Cordis 插件，TS 重写合并版）
 *
 * 挂载：~/.dsh/profiles/<profile>/cordis.patch.yml（自动通过 bundle patch）
 *
 * 职责（二合一）：
 *  - 额度（quota，原 dsh-token-quota）：多供应商滚动额度/按量余额拉取 + 内存快照 +
 *    同源 JSON 路由（state/refresh/set-active/set-refresh/set-enabled/set-vendor-enabled/
 *    add/update/delete/secret-to-cred/config）
 *  - 统计（stats，原 dsh-token-stats）：sessionQuery 扫描本机全部会话日志聚合 TokenUsage，
 *    经 GET /ext/dshp-token-meter/stats（别名 /data）供设置页消费
 *
 * 持久化（标准 settings 存储，对齐 vision-bridge）：
 *  settings.yaml 顶层 `dshp-token-meter` 命名空间（version/activeVendor/refreshSec/
 *  enabled/vendors/showToday/defaultRange），经 ctx.settings 分层解析。
 * 派生缓存（会话指纹聚合）仍走 ctx.storageDomain 域 `token_stats`（域名保持原样——
 *  storageDomain 只允许小写字母/数字/下划线，且改名会废掉已有缓存触发全量重扫），
 *  丢了可后台重扫，不属于用户配置。
 *
 * 原实现：
 *  - quota：~/.dsh/plugins/dsh-token-quota（@dshp-inx/token-quota v1.0.1）
 *    lib/{index,config,secrets,providers/*}.js → src/host/{index,quota,config,secrets,providers/*}.ts
 *  - stats：~/.dsh/plugins/dsh-token-stats（@dshp-inx/token-stats v1.1.3）
 *    lib/{index,engine,fold,fsindex,async,http}.js → src/host/{index,stats/*}.ts
 * 本目录为等价 TS 重写合并：逻辑逐行对齐，路由前缀与 NS 收敛为单一
 * `dshp-token-meter`；历史命名空间与旧文件不再读写、不再迁移。
 *
 * @module @dshp/token-meter
 */
import { homedir } from 'node:os';
import { join } from 'node:path';
import { ConfigSchema, DEFAULT_CONFIG, NS, sanitizePatchConfig } from './config.js';
import { createSecretResolver } from './secrets.js';
import { canonicalType } from './providers/index.js';
import { registerQuotaRoutes, refreshOne } from './quota.js';
import type { QuotaState } from './quota.js';
import { createEngine } from './stats/engine.js';
import { normGapMin } from './stats/online.js';
import { registerStatsRoutes } from './stats/routes.js';
import { registerIdentityRoute } from './identity.js';
import type { AnyCtx, PluginConfig, Vendor } from './types.js';

export const name = '@dshp/token-meter';
export const inject: string[] = ['webServer'];
export { NS, ConfigSchema };

export function apply(ctx: AnyCtx, rawConfig: unknown): void {
  const entry: PluginConfig = {
    ...DEFAULT_CONFIG,
    vendors: [],
  };
  const patch = sanitizePatchConfig(rawConfig);
  if (patch) {
    if (Object.hasOwn(patch, 'activeVendor') && patch.activeVendor !== undefined)
      entry.activeVendor = patch.activeVendor;
    if (Object.hasOwn(patch, 'refreshSec') && patch.refreshSec !== undefined)
      entry.refreshSec = patch.refreshSec;
    if (Object.hasOwn(patch, 'enabled') && patch.enabled !== undefined) entry.enabled = patch.enabled;
    if (Object.hasOwn(patch, 'vendors') && patch.vendors !== undefined) entry.vendors = patch.vendors;
    if (Object.hasOwn(patch, 'showToday') && patch.showToday !== undefined) entry.showToday = patch.showToday;
    if (Object.hasOwn(patch, 'defaultRange') && patch.defaultRange !== undefined)
      entry.defaultRange = patch.defaultRange;
    if (Object.hasOwn(patch, 'onlineGapMin') && patch.onlineGapMin !== undefined)
      entry.onlineGapMin = patch.onlineGapMin;
  }

  let current: () => PluginConfig = () => entry;

  try {
    ctx.inject(['settings'], (sctx: AnyCtx) => {
      sctx.settings.installSection(ctx, NS, ConfigSchema, entry, {
        setSource: (src: () => PluginConfig) => {
          current = src;
        },
        onChange: () => {},
      });
    });
  } catch {
    /* ignore */
  }

  function getConfig(): PluginConfig {
    try {
      const v = current() as unknown;
      if (v && typeof v === 'object') {
        const r = v as Record<string, unknown>;
        return {
          version: 1,
          activeVendor:
            typeof r['activeVendor'] === 'string' ? (r['activeVendor'] as string) : entry.activeVendor,
          refreshSec: typeof r['refreshSec'] === 'number' ? (r['refreshSec'] as number) : entry.refreshSec,
          enabled: typeof r['enabled'] === 'boolean' ? (r['enabled'] as boolean) : entry.enabled,
          vendors: Array.isArray(r['vendors'])
            ? (r['vendors'] as unknown[]).map((item): Vendor => {
                const it = (item ?? {}) as Record<string, unknown>;
                const vendor: Vendor = {
                  id: String(it['id'] !== undefined ? it['id'] : ''),
                  name: String(it['name'] !== undefined ? it['name'] : ''),
                  type: canonicalType(String(it['type'] !== undefined ? it['type'] : 'manual')),
                  params:
                    it['params'] && typeof it['params'] === 'object' && !Array.isArray(it['params'])
                      ? (it['params'] as Record<string, unknown>)
                      : {},
                };
                // 余额查询开关：只有显式 false 视为禁用，缺省一律启用
                if (it['enabled'] === false) vendor.enabled = false;
                return vendor;
              })
            : [],
          showToday: (r['showToday'] as boolean) === true,
          defaultRange:
            r['defaultRange'] === '7' ||
            r['defaultRange'] === '30' ||
            r['defaultRange'] === '90' ||
            r['defaultRange'] === 'all'
              ? (r['defaultRange'] as PluginConfig['defaultRange'])
              : entry.defaultRange,
          onlineGapMin: normGapMin(
            typeof r['onlineGapMin'] === 'number' ? (r['onlineGapMin'] as number) : entry.onlineGapMin,
          ),
        };
      }
    } catch {
      /* ignore */
    }
    return JSON.parse(JSON.stringify(entry)) as PluginConfig;
  }

  async function updateConfig(patchObj: Record<string, unknown>): Promise<void> {
    const settings = ctx.get('settings') as AnyCtx;
    if (!settings)
      throw new Error(
        'settings 服务不可用，无法持久化到 settings.yaml（请重启 DSH 或检查 FileSettingsProvider 是否挂载）',
      );
    await settings.update(NS, JSON.parse(JSON.stringify(patchObj)) as Record<string, unknown>);
  }

  const st: QuotaState = { snaps: {} };
  const resolveSecret = createSecretResolver(ctx);

  // ── stats 引擎（sessionQuery/storageDomain 均为可选，缺失时降级）──────────
  let sessionQuery: AnyCtx = null;
  try {
    sessionQuery = ctx.get('sessionQuery') as AnyCtx;
  } catch {
    sessionQuery = null;
  }
  let storageDomain: AnyCtx = null;
  try {
    storageDomain = ctx.get('storageDomain') as AnyCtx;
  } catch {
    storageDomain = null;
  }

  let dshHome = '';
  try {
    dshHome = process.env['DSH_HOME'] || '';
  } catch {
    /* ignore */
  }
  if (!dshHome) {
    try {
      dshHome = join(homedir(), '.dsh');
    } catch {
      dshHome = '/tmp/.dsh';
    }
  }

  const engine =
    sessionQuery &&
    typeof sessionQuery.listSessions === 'function' &&
    typeof sessionQuery.readSession === 'function'
      ? createEngine(sessionQuery, dshHome, storageDomain, () => getConfig().onlineGapMin)
      : null;

  if (engine) {
    try {
      ctx.effect(
        () =>
          ctx.on('session/event', (session: { id?: unknown }) => {
            const id = session && session.id;
            if (typeof id === 'string') engine.invalidate(id);
          }),
        'dshp-token-meter: invalidate on session event',
      );
    } catch {
      /* ignore */
    }
    try {
      ctx.effect(
        () => () => {
          void engine.dispose();
        },
        'dshp-token-meter: close domain on dispose',
      );
    } catch {
      /* ignore */
    }
  } else {
    try {
      console.warn('[dshp-token-meter] sessionQuery 服务不可用，统计暂不可用（额度功能不受影响）');
    } catch {
      /* ignore */
    }
  }

  // ── 同源 JSON 路由 ────────────────────────────────────────────────────
  try {
    registerQuotaRoutes(ctx, { getConfig, updateConfig, resolveSecret, st });
  } catch (e) {
    try {
      console.error('[dshp-token-meter] register quota routes failed: ' + String((e as Error)?.message ?? e));
    } catch {
      /* ignore */
    }
  }

  // ── Host 侧额度自动拉取 ────────────────────────────────────────────────
  // 单一数据源：由 Host 每 refreshSec 拉取全部供应商并写入内存快照（st.snaps），
  // 客户端只 GET /state 同步快照 —— 多个客户端/多个标签页不会重复请求上游。
  // 手动刷新（POST /refresh）会更新 st.lastPullMs，定时器据此顺延，避免刚刷完又自动拉。
  try {
    const clampSec = (raw: unknown): number => {
      const n = Number(raw);
      if (!isFinite(n) || n <= 0) return 0; // 0/非法 = 关闭
      return Math.min(3600, Math.max(10, n));
    };
    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const schedule = (ms: number): void => {
      if (stopped) return;
      timer = setTimeout(
        () => {
          void tick();
        },
        Math.max(1000, ms),
      );
    };
    const tick = async (): Promise<void> => {
      if (stopped) return;
      let sec = 60;
      try {
        const cfg = getConfig();
        sec = clampSec(cfg.refreshSec);
        if (sec > 0) {
          // 距上次拉取不足 60% 间隔时顺延（手动刷新刚发生过）
          const since = st.lastPullMs ? Date.now() - st.lastPullMs : Infinity;
          const budget = sec * 1000;
          if (since < budget * 0.6) {
            schedule(budget - since);
            return;
          }
          const list = Array.isArray(cfg.vendors) ? cfg.vendors : [];
          for (const v of list) {
            if (stopped) return;
            // 被禁用的供应商不参与主动定时拉取（手动 POST /refresh 仍可拉）
            if (v.enabled === false) continue;
            try {
              await refreshOne(st, resolveSecret, v);
            } catch {
              /* 单个供应商失败不影响其它 */
            }
          }
        }
      } catch {
        /* ignore */
      }
      schedule((sec > 0 ? sec : 60) * 1000);
    };
    schedule(4000); // 启动后稍等再拉，避开启动风暴
    try {
      ctx.effect(
        () => () => {
          stopped = true;
          if (timer) clearTimeout(timer);
        },
        'dshp-token-meter: quota auto refresh',
      );
    } catch {
      /* ignore */
    }
  } catch (e) {
    try {
      console.warn('[dshp-token-meter] quota auto refresh 启动失败：' + String((e as Error)?.message ?? e));
    } catch {
      /* ignore */
    }
  }

  try {
    registerStatsRoutes(ctx, engine);
    registerIdentityRoute(ctx);
  } catch (e) {
    try {
      console.error('[dshp-token-meter] register stats routes failed: ' + String((e as Error)?.message ?? e));
    } catch {
      /* ignore */
    }
  }

  if (engine) {
    try {
      engine.start();
    } catch {
      /* ignore */
    }
  }

  try {
    console.log('[dshp-token-meter] settings(dshp-token-meter) quota + stats ready');
  } catch {
    /* ignore */
  }
}
