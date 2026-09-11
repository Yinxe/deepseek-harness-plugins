/**
 * @dshp/search-provider —— AI 搜索提供方中枢（DSH Bundle 插件 Host 半，TS 重写）
 *
 * 挂载：~/.dsh/profiles/<profile>/cordis.patch.yml（自动通过 bundle patch）
 * 选型：patch 同层把 `web.searchProvider` 设为想用的提供方 id（如 `tavily`），
 *       替换 base 层默认的 `deepseek-official`；只装一个提供方时 seam 自动选中。
 *
 * 职责：把各供应商模块（providers/*.ts）包装成 web seam 的 WebSearchProvider 注册到
 * ctx.web，并对外提供同源 JSON 路由（状态/配置/连接测试）与设置页。
 * API Key 每次操作经 credentials 服务实时解析（如 TAVILY_API_KEY），不在提供方上滞留。
 *
 * 持久化（标准 settings 存储，对齐 vision-bridge / mcwiki-search）：
 *  - settings.yaml 顶层 `dshp-search-provider` 命名空间：provider / maxResults +
 *    各供应商分节（键名 = provider id，如 tavily: { searchDepth }）；
 *  - schema 默认值 → composition base（patch 覆盖）→ 用户文档层，FileSettingsProvider
 *    以 leaf-level diff 保留注释与格式，外部编辑热重载；
 *  - 密钥仍走 credentials 服务，不进 settings.yaml；
 *  - 旧插件 `dshp-inx-tavily-search` 的 maxResults / searchDepth 在新 NS 缺省时一次性采用
 *    （旧键只读不删，见 config.ts planLegacyAdoption）。
 *
 * 原实现：~/.dsh/plugins/dsh-tavily-search（JS，@dshp-inx/tavily-search v2.0.3）
 * 本目录为等价 TS 重写 + 多供应商抽象：lib/index.js → src/host/{index,routes,config,http,types}.ts
 * + src/host/providers/{base,index,tavily}.ts，tsup 打包为单文件 lib/host.js
 * （ESM，schemastery 内联，运行时零依赖）。
 *
 * @module @dshp/search-provider
 */
import {
  NS,
  buildConfigSchema,
  buildDefaultConfig,
  planLegacyAdoption,
  readBlock,
  sanitizeEntryConfig,
} from './config.js';
import { createProviderModules } from './providers/index.js';
import { createWebSearchProvider } from './providers/base.js';
import { registerRoutes } from './routes.js';
import type { AnyCtx, PluginConfig, ProviderDeps, SearchProviderModule } from './types.js';

export const name = '@dshp/search-provider';
export const inject: string[] = ['web', 'webServer'];
export { NS } from './config.js';

/**
 * settings 命名空间 schema（导出契约：插件清单/配置 UI 可读取）。
 * 模块级静态构建一次（纯 schema 构建，无 ctx 副作用）；apply 内另建 apply 级实例。
 */
export const ConfigSchema: unknown = buildConfigSchema(createProviderModules());

function isRecord(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

export function apply(ctx: AnyCtx, rawConfig: unknown): void {
  const modules: SearchProviderModule[] = createProviderModules();
  const configSchema: unknown = buildConfigSchema(modules);

  // composition entry：默认值 ← patch 覆盖（settings 的 base 层；供应商分节深合并）
  const entry: PluginConfig = buildDefaultConfig(modules);
  const patch = sanitizeEntryConfig(rawConfig, modules);
  if (Object.hasOwn(patch, 'provider')) entry.provider = patch['provider'] as string;
  if (Object.hasOwn(patch, 'maxResults')) entry.maxResults = patch['maxResults'] as number;
  for (const m of modules) {
    if (!Object.hasOwn(patch, m.id)) continue;
    const block = patch[m.id];
    entry[m.id] = { ...m.defaultConfig, ...(isRecord(block) ? block : {}) };
  }

  // 官方 settings：当前生效配置源（有 settings 时指向 scope.get()，否则指向 entry）
  let current: () => PluginConfig = () => entry;

  function getConfig(): PluginConfig {
    try {
      const v = current() as unknown;
      if (v && typeof v === 'object') return v as PluginConfig;
    } catch {
      /* ignore */
    }
    return entry;
  }

  async function updateConfig(configPatch: Record<string, unknown>): Promise<void> {
    const settings = ctx.get('settings') as AnyCtx;
    if (!settings) {
      throw new Error(
        'settings 服务不可用，无法持久化到 settings.yaml（请重启 DSH 或检查 FileSettingsProvider 是否挂载）',
      );
    }
    await settings.update(NS, configPatch);
  }

  const providerDeps: ProviderDeps = {
    ctx,
    async resolveKey(credentialRef: string): Promise<string | undefined> {
      const creds = ctx.get('credentials') as AnyCtx;
      if (creds === undefined) return undefined;
      try {
        const resolved = await creds.resolve(credentialRef);
        const value = resolved?.value;
        return typeof value === 'string' && value.length > 0 ? value : undefined;
      } catch {
        return undefined;
      }
    },
    getConfig,
    providerConfig(providerId: string): Record<string, unknown> {
      const module = modules.find((m) => m.id === providerId);
      const defaults = module !== undefined ? module.defaultConfig : {};
      return { ...defaults, ...readBlock(getConfig(), providerId) };
    },
    updateConfig,
  };

  // ── 动态注册状态（installSection 的 onChange 同步回调会用到 registerActiveProvider，
  //    故状态与函数须定义在 settings 段之前；getConfig 为函数声明可后置）──
  let registeredId: string | null = null;
  let disposeRegistered: (() => void) | null = null;
  let registerAttempts = 0;

  /**
   * 只注册 settings 里选中的提供方（config.provider）：
   * web seam 在「恰好一个已注册提供方 && 无 patch 固定」时自动选中它，
   * 切换 = 解绑旧提供方 → 注册新提供方，设置页改配置即生效，无需重启。
   * profile patch 若固定了 searchProvider（旧插件时代遗留），须与 config.provider
   * 一致才不报 WEB_PROVIDER_CONFIGURED_MISSING（state 路由会给出中文提示）。
   * 解绑→注册之间存在一瞬无提供方窗口，并发搜索可能报 WEB_PROVIDER_UNAVAILABLE，
   * 优先于「新旧并存 → WEB_PROVIDER_AMBIGUOUS」的旧提供方继续服务，更诚实。
   */
  function registerActiveProvider(): void {
    const id = getConfig().provider;
    if (registeredId === id && id !== null) return;
    if (disposeRegistered !== null) {
      try {
        disposeRegistered();
      } catch {
        /* ignore */
      }
      disposeRegistered = null;
      registeredId = null;
    }
    const module = modules.find((m) => m.id === id);
    if (module === undefined) {
      try {
        console.warn(`[dshp-search-provider] settings 里选了未知提供方「${id}」，未注册任何提供方`);
      } catch {
        /* ignore */
      }
      return;
    }
    try {
      disposeRegistered = ctx.web.registerSearchProvider(createWebSearchProvider(module, providerDeps));
      registeredId = id;
      try {
        console.info(`[dshp-search-provider] 已注册提供方「${id}」，搜索即时走该提供方`);
      } catch {
        /* ignore */
      }
    } catch (error) {
      // 常见原因：旧插件 @dshp-inx/tavily-search 仍装着，提供方 id 冲突（WEB_DUPLICATE_PROVIDER）
      registerAttempts += 1;
      if (registerAttempts <= 3) {
        try {
          console.warn(
            `[dshp-search-provider] 注册提供方「${id}」失败（若旧插件 @dshp-inx/tavily-search 仍装着请先移除）：${String(
              (error as Error)?.message ?? error,
            )}`,
          );
        } catch {
          /* ignore */
        }
      }
    }
  }

  try {
    ctx.inject(['settings'], (sctx: AnyCtx) => {
      sctx.settings.installSection(ctx, NS, configSchema, entry, {
        setSource: (src: () => PluginConfig) => {
          current = src;
        },
        // 每次 settings 提交都回调：驱动「动态选型」——切换 provider 即时解绑旧提供方并注册新提供方
        onChange: () => {
          try {
            registerActiveProvider();
          } catch {
            /* ignore */
          }
        },
      });
    });
  } catch (error) {
    try {
      console.warn(
        `[dshp-search-provider] settings 段注册失败：${String((error as Error)?.message ?? error)}`,
      );
    } catch {
      /* ignore */
    }
  }

  // ── 旧插件配置一次性采用（新 NS 缺省 + 旧 NS 存在时；只读不删旧键）──
  const legacyPatch = planLegacyAdoption(modules);
  if (legacyPatch !== null) {
    void updateConfig(legacyPatch)
      .then(() => {
        try {
          console.info(
            '[dshp-search-provider] 已采用旧插件 dshp-inx-tavily-search 的配置，旧段落保留未删（可手动清理）',
          );
        } catch {
          /* ignore */
        }
      })
      .catch((error: unknown) => {
        try {
          console.warn(
            `[dshp-search-provider] 旧插件配置采用失败：${String((error as Error)?.message ?? error)}`,
          );
        } catch {
          /* ignore */
        }
      });
  }

  // ── 供应商专属路由（静态注册：所有模块的 /usage 之类路由与本插件生命周期一致）──
  for (const m of modules) {
    if (typeof m.registerRoutes === 'function') {
      try {
        m.registerRoutes(providerDeps);
      } catch (error) {
        try {
          console.warn(
            `[dshp-search-provider] 提供方「${m.id}」专属路由注册失败：${String((error as Error)?.message ?? error)}`,
          );
        } catch {
          /* ignore */
        }
      }
    }
  }

  ctx.effect(() => {
    // 初次注册（此时 web 服务已就绪：web/webServer 是硬依赖，apply 后才执行）
    registerActiveProvider();
    return () => {
      // 插件 stop/update/卸载时清理当前注册
      if (disposeRegistered !== null) {
        try {
          disposeRegistered();
        } catch {
          /* ignore */
        }
        disposeRegistered = null;
        registeredId = null;
      }
    };
  }, 'dshp-search-provider: active provider registration');

  // ── 同源 JSON 路由：状态 / 配置 / 连接测试 ──
  registerRoutes({
    ctx,
    modules,
    getConfig,
    updateConfig,
    providerDeps,
    selectedProviderId(): string | null {
      const web = ctx.get('web') as AnyCtx;
      const id = web?.searchProviderId;
      return typeof id === 'string' && id.length > 0 ? id : null;
    },
    registeredProviderId(): string | null {
      return registeredId;
    },
  });

  try {
    console.info(`[dshp-search-provider] 动态选型就绪：当前提供方 ${registeredId ?? '（未注册）'}`);
  } catch {
    /* ignore */
  }
}
