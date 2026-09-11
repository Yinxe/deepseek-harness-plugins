/**
 * @dshp/token-meter —— DSH Bundle 插件 Host 半（Cordis 插件，TS 重写合并版）
 *
 * 挂载：~/.dsh/profiles/<profile>/cordis.patch.yml（自动通过 bundle patch）
 *
 * 职责（二合一）：
 *  - 额度（quota，原 dsh-token-quota）：多供应商滚动额度/按量余额拉取 + 内存快照 +
 *    同源 JSON 路由（state/refresh/set-active/set-refresh/set-enabled/add/update/delete/secret-to-cred/config）
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
 * 本目录为等价 TS 重写合并：逻辑逐行对齐，仅路由前缀与 NS 由双命名空间收敛为
 * `dshp-token-meter`，行为不变（迁移见 config.ts + 下方 tryMigrate 系列）。
 *
 * @module @dshp/token-meter
 */
import { existsSync, renameSync, unlinkSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import {
  ConfigSchema,
  DEFAULT_CONFIG,
  NS,
  loadPersistedQuota,
  legacyQuotaConfigPath,
  migrateYamlNamespaces,
  sanitizePatchConfig,
} from './config.js';
import { createSecretResolver } from './secrets.js';
import { canonicalType } from './providers/index.js';
import { registerQuotaRoutes } from './quota.js';
import type { QuotaState } from './quota.js';
import { createEngine } from './stats/engine.js';
import { registerStatsRoutes } from './stats/routes.js';
import type { AnyCtx, PluginConfig } from './types.js';

export const name = '@dshp/token-meter';
export const inject: string[] = ['webServer'];
export { NS, ConfigSchema };

export function apply(ctx: AnyCtx, rawConfig: unknown): void {
  try {
    migrateYamlNamespaces();
  } catch {
    /* ignore */
  }

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
  }

  const persistedForMigration = loadPersistedQuota();

  let current: () => PluginConfig = () => entry;
  let hasMigrated = false;

  function tryMigrate(): void {
    if (hasMigrated) return;
    hasMigrated = true;
    if (!persistedForMigration) return;
    let settings: AnyCtx = null;
    try {
      settings = ctx.get('settings') as AnyCtx;
    } catch {
      settings = null;
    }
    if (!settings) return;
    try {
      const list = settings.describe() as Array<{ ns?: string; user?: unknown }>;
      const desc = list.find((d) => d.ns === NS);
      if (desc && desc.user !== undefined) {
        try {
          console.info(
            '[dshp-token-meter] settings.yaml 已存在 dshp-token-meter 用户配置，跳过旧文件自动迁移（旧文件保留，可手动删除 ' +
              persistedForMigration.source +
              '）',
          );
        } catch {
          /* ignore */
        }
        return;
      }
    } catch {
      /* ignore */
    }
    const needPatch: Record<string, unknown> = {};
    let need = false;
    for (const k of ['activeVendor', 'refreshSec', 'enabled', 'vendors'] as Array<keyof PluginConfig>) {
      const pv: unknown = persistedForMigration.config[k];
      const ev: unknown = entry[k];
      if (JSON.stringify(pv) !== JSON.stringify(ev)) {
        needPatch[k] = pv;
        need = true;
      }
    }
    if (!need) {
      try {
        const p = legacyQuotaConfigPath();
        if (existsSync(p)) {
          try {
            unlinkSync(p);
            console.info('[dshp-token-meter] 旧存储文件与默认值一致，已自动清理 ' + p);
          } catch {
            /* ignore */
          }
        }
      } catch {
        /* ignore */
      }
      return;
    }
    Promise.resolve(settings.update(NS, JSON.parse(JSON.stringify(needPatch)) as Record<string, unknown>))
      .then(() => {
        try {
          console.info(
            '[dshp-token-meter] 已自动将旧版 ' +
              persistedForMigration.source +
              ' 迁移至 settings.yaml (dshp-token-meter)',
          );
        } catch {
          /* ignore */
        }
        try {
          const p = persistedForMigration.source;
          const bak = p + '.bak';
          if (existsSync(p)) {
            try {
              renameSync(p, bak);
              console.info('[dshp-token-meter] 旧文件已备份为 ' + bak);
            } catch {
              try {
                unlinkSync(p);
                console.info('[dshp-token-meter] 旧文件已清理 ' + p);
              } catch {
                /* ignore */
              }
            }
          }
        } catch {
          /* ignore */
        }
      })
      .catch((e: unknown) => {
        try {
          console.warn('[dshp-token-meter] 旧文件迁移失败：' + String((e as Error)?.message ?? e));
        } catch {
          /* ignore */
        }
        hasMigrated = false;
      });
  }

  // 旧 params.auth → cookie 一次性改名（opencode 系）：值不变，仅换键
  let hasRenamedAuth = false;
  function tryRenameAuth(): void {
    if (hasRenamedAuth) return;
    let settings: AnyCtx = null;
    try {
      settings = ctx.get('settings') as AnyCtx;
    } catch {
      settings = null;
    }
    if (!settings) return;
    let cfg: PluginConfig | null = null;
    try {
      cfg = getConfig();
    } catch {
      return;
    }
    if (!cfg || !Array.isArray(cfg.vendors)) {
      hasRenamedAuth = true;
      return;
    }
    let changed = false;
    const next = cfg.vendors.map((v) => {
      if (
        v &&
        v.type === 'opencode-go' &&
        v.params &&
        typeof (v.params as Record<string, unknown>)['auth'] === 'string' &&
        ((v.params as Record<string, unknown>)['auth'] as string) !== '' &&
        ((v.params as Record<string, unknown>)['cookie'] === undefined ||
          (v.params as Record<string, unknown>)['cookie'] === '')
      ) {
        changed = true;
        const np: Record<string, unknown> = {
          ...(v.params as Record<string, unknown>),
          cookie: (v.params as Record<string, unknown>)['auth'],
        };
        delete np['auth'];
        return { ...v, params: np };
      }
      return v;
    });
    if (!changed) {
      hasRenamedAuth = true;
      return;
    }
    hasRenamedAuth = true;
    Promise.resolve(updateConfig({ vendors: next }))
      .then(() => {
        try {
          console.info(
            '[dshp-token-meter] 已将 opencode-go 供应商的旧 params.auth 迁移为 params.cookie（值不变）',
          );
        } catch {
          /* ignore */
        }
      })
      .catch((e: unknown) => {
        try {
          console.warn('[dshp-token-meter] auth→cookie 迁移失败：' + String((e as Error)?.message ?? e));
        } catch {
          /* ignore */
        }
        hasRenamedAuth = false;
      });
  }

  // 旧 type → opencode 一次性改名（go/zen 合并后）
  let hasMigratedTypes = false;
  function tryMigrateTypes(): void {
    if (hasMigratedTypes) return;
    let settings: AnyCtx = null;
    try {
      settings = ctx.get('settings') as AnyCtx;
    } catch {
      settings = null;
    }
    if (!settings) return;
    let cfg: PluginConfig | null = null;
    try {
      cfg = getConfig();
    } catch {
      return;
    }
    let raw: PluginConfig | null = null;
    try {
      raw = current() as PluginConfig;
    } catch {
      /* ignore */
    }
    if (!raw || !Array.isArray(raw.vendors)) {
      hasMigratedTypes = true;
      return;
    }
    const legacyTypes = new Set(['opencode-go', 'opencode-zen']);
    if (!raw.vendors.some((v) => v && legacyTypes.has(String(v.type)))) {
      hasMigratedTypes = true;
      return;
    }
    hasMigratedTypes = true;
    const next = (Array.isArray(cfg.vendors) ? cfg.vendors : []).map((v) => ({ ...v }));
    Promise.resolve(updateConfig({ vendors: next }))
      .then(() => {
        try {
          console.info(
            '[dshp-token-meter] 已将旧 type（opencode-go/opencode-zen）迁移为 opencode（其余不变）',
          );
        } catch {
          /* ignore */
        }
      })
      .catch((e: unknown) => {
        try {
          console.warn('[dshp-token-meter] type 迁移失败：' + String((e as Error)?.message ?? e));
        } catch {
          /* ignore */
        }
        hasMigratedTypes = false;
      });
  }

  try {
    ctx.inject(['settings'], (sctx: AnyCtx) => {
      sctx.settings.installSection(ctx, NS, ConfigSchema, entry, {
        setSource: (src: () => PluginConfig) => {
          current = src;
          tryMigrate();
          tryRenameAuth();
          tryMigrateTypes();
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
            ? (r['vendors'] as unknown[]).map((item) => {
                const it = (item ?? {}) as Record<string, unknown>;
                return {
                  id: String(it['id'] !== undefined ? it['id'] : ''),
                  name: String(it['name'] !== undefined ? it['name'] : ''),
                  type: canonicalType(String(it['type'] !== undefined ? it['type'] : 'manual')),
                  params:
                    it['params'] && typeof it['params'] === 'object' && !Array.isArray(it['params'])
                      ? (it['params'] as Record<string, unknown>)
                      : {},
                };
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
      ? createEngine(sessionQuery, dshHome, storageDomain)
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
  try {
    registerStatsRoutes(ctx, engine);
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
