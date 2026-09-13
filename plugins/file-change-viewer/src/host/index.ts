/**
 * @dshp/file-change-viewer —— DSH Bundle 插件 Host 半（Cordis 插件）
 *
 * 挂载：由 bundle patch 自动 insert 一行（`cordis.patch.yml`，id 同名）
 *
 * ## 本插件的渲染几乎全在 Client 半
 *
 * 「文件修改行怎么渲染」是**纯渲染行为**：数据（`meta.diffs`）由官方 `dsh-tool-fs` 的 edit / write
 * 工具在结果元数据里给出，客户端的 `tool.call.toolview` 槽位就是官方留给插件接管这行的扩展点。
 *
 * ## Host 半负责两件事
 *
 * 1. **配置命名空间**：`settings.yaml` 的 `dshp-file-change-viewer` 分节（两项显示偏好）。
 *    `installSection` 让这份配置成为 schema 约束的正式用户设置：schema 默认值 → composition
 *    patch 的 base 层 → settings.yaml 的用户分节，三层合并，热重载即时生效。
 * 2. **设置节读写路由**（`/ext/dshp-file-change-viewer/{state,config}`）：
 *    Client 的设置节「文件修改卡片」与工具行共用这一份权威配置——读走 `state`、写走 `config`
 *    （Host 调 `settings.update(NS, patch)`）。设置改动因此**真的落进 settings.yaml**，
 *    而不是留在刷新即丢的客户端内存态里。
 *
 * ## 为什么不用客户端 `settingsScope`
 *
 * 官方 `settingsScope.bind({ namespace })` 也能读写同一个分节，但它要求 Host 已注册命名空间、
 * 浏览器侧服务已挂载、写操作按 revision 设栅；任一环时序不对（服务晚挂载 / 页面非 loopback）
 * 就会静默退化成只读默认值——表现正是「下拉和开关点了没反应，settings.yaml 里也没有分节」。
 * 本仓既有插件（mcwiki-search / vision-bridge / token-meter）统一走自有 `/ext` 路由，这里对齐。
 *
 * `apply` 顶层不抛（composition 半途失败会拖垮整个 profile）：外部输入就地消毒，出错只打日志。
 *
 * @module @dshp/file-change-viewer
 */
import { applyPatch, ConfigSchema, DEFAULT_CONFIG, NS, sanitizePatchConfig } from './config.js';
import { registerRoutes } from './routes.js';
import type { AnyCtx, PluginConfig } from './types.js';

export const name = '@dshp/file-change-viewer';

/** `/ext` 路由需要 webServer；settings / tools / fs 都走 `ctx.inject` 可选注入。 */
export const inject: string[] = ['webServer'];

export { NS, ConfigSchema };


/**
 * 挂载 Host 半：合并 composition 补丁 → 注册 settings 命名空间 → 挂两条设置路由 → 注册 patch 工具。
 *
 * @param ctx - Cordis 插件上下文。
 * @param rawConfig - composition 的 `config:` 层（未消毒的外部输入）。
 */
export function apply(ctx: AnyCtx, rawConfig: unknown): void {
  // ── ① 合并 composition 补丁（settings 的 base 层） ──
  const entry: PluginConfig = { ...DEFAULT_CONFIG };
  try {
    applyPatch(entry, sanitizePatchConfig(rawConfig));
  } catch (error) {
    console.error('[dshp-file-change-viewer] composition config 消毒失败，改用默认值：', error);
  }

  // ── ② 注册 settings 命名空间（偏好落 settings.yaml 的 NS 分节） ──
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
  } catch (error) {
    console.error('[dshp-file-change-viewer] 注册 settings 命名空间失败，偏好将回默认值：', error);
  }

  // ── ③ 内部 helpers ──
  /** 当前生效配置（热重载靠 settings 服务的 setSource getter）。 */
  function getConfig(): PluginConfig {
    try {
      const value: unknown = current();
      if (value !== null && typeof value === 'object')
        return { ...entry, ...(value as Partial<PluginConfig>) };
    } catch {
      /* ignore */
    }
    return { ...entry };
  }

  /** 写回 settings.yaml 的 NS 分节（路由层已逐字段消毒；这里只兜 settings 服务缺失）。 */
  async function updateConfig(patch: Record<string, unknown>): Promise<void> {
    const settings = ctx.get('settings') as AnyCtx;
    if (!settings) {
      throw new Error(
        'settings 服务不可用，无法持久化到 settings.yaml（请重启 DSH 或检查 FileSettingsProvider 是否挂载）',
      );
    }
    await settings.update(NS, patch);
  }

  // ── ④ 设置节路由（读当前偏好 / 保存偏好） ──
  try {
    registerRoutes(ctx, getConfig, updateConfig);
  } catch (error) {
    console.error('[dshp-file-change-viewer] 注册设置路由失败，设置节将只能读默认值：', error);
  }

  // 启动路径上只留一行日志，顺带把当前生效值打出来便于排查。
  const config = getConfig();
  console.info(
    '[dshp-file-change-viewer] Host 半已就绪：渲染逻辑在 Client 半；显示偏好命名空间 ' +
      NS +
      '（view=' +
      config.view +
      ', sectionsOpen=' +
      String(config.sectionsOpen) +
      '）。',
  );
}
