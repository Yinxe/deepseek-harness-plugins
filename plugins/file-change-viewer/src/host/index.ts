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
 * ## Host 半负责三件事
 *
 * 1. **配置命名空间**：`settings.yaml` 的 `dshp-file-change-viewer` 分节（两项显示偏好 + 一个
 *    `patch` 工具开关）。`installSection` 让这份配置成为 schema 约束的正式用户设置：schema 默认值
 *    → composition patch 的 base 层 → settings.yaml 的用户分节，三层合并，热重载即时生效。
 * 2. **设置节读写路由**（`/ext/dshp-file-change-viewer/{state,config}`）：
 *    Client 的设置节「File Change View」与工具行共用这一份权威配置——读走 `state`、写走 `config`
 *    （Host 调 `settings.update(NS, patch)`）。设置改动因此**真的落进 settings.yaml**，
 *    而不是留在刷新即丢的客户端内存态里。
 * 3. **`patch` 工具（测试版，默认关）**：`patchTool` 一开一关，工具就注册 / 反注册——settings 的
 *    `onChange` 每次提交变更后重新判定一次，所以开关是**动态**的，不必重启 `dsh web`。
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
import { registerPatchTool } from './patch-tool.js';
import { registerRoutes } from './routes.js';
import type { AnyCtx, PluginConfig } from './types.js';

export const name = '@dshp/file-change-viewer';

/** `/ext` 路由需要 webServer；settings / tools / fs 都走 `ctx.inject` 可选注入。 */
export const inject: string[] = ['webServer'];

export { NS, ConfigSchema };

/**
 * 测试 seam：纯函数（`*** Begin Patch` 的解析 / 应用 / 行尾处理）从产物里再导出一次，
 * `scripts/check-patch.mjs` 直接断言它们，不必去戳 `tools.register` 的内部。
 */
export {
  applyChunksToText,
  countLogicalLines,
  detectLineEnding,
  normalizeLineEndings,
  parseApplyPatch,
  previewDiffsOf,
  restoreLineEndings,
} from '../shared/apply-patch.js';
export { assertBatchWritable, assertWritable, writableRootsUnder } from './sandbox-escalation.js';

/**
 * 挂载 Host 半：合并 composition 补丁 → 注册 settings 命名空间 → 挂设置路由 →
 * 按 `patchTool` 开关（默认关）动态注册 / 反注册 `patch` 工具。
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

  // `patch` 工具的注册面：**必须在 ② 之前声明**——settings 服务可能在 installSection 里同步
  // 调一次 `onChange`，那时这两个绑定若还在 TDZ，整个命名空间注册就会被异常打断。
  let toolsScope: AnyCtx | undefined;
  let disposePatchTool: (() => void) | undefined;

  // ── ② 注册 settings 命名空间（偏好落 settings.yaml 的 NS 分节） ──
  let current: () => PluginConfig = () => entry;
  try {
    ctx.inject(['settings'], (sctx: AnyCtx) => {
      sctx.settings.installSection(ctx, NS, ConfigSchema, entry, {
        setSource: (src: () => PluginConfig) => {
          current = src;
        },
        // 每次挂载 / 卸载 / 提交变更后重新判定 `patch` 工具的开关（见 ⑤）。
        onChange: () => {
          syncPatchTool();
        },
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

  // ── ⑤ patch 工具：测试版，默认关；由设置里的开关**动态**决定注册与否 ──
  //
  // 注册面在 `tools` / `fs` 的注入作用域里，而开关值住在 settings（`patchTool`）。两者的挂载顺序
  // 没有保证，所以这里不「注册一次就完」，而是每次 settings 报变更（`onChange`）都重新判定一遍：
  // 需要就注册、取消就反注册。反注册用的是注册那一刻拿到的 disposer（`tools.register` 的返回值，
  // 也是 `ctx.effect` 的清理函数）——于是 stop / update / 关开关，三条路都收得干净。
  /**
   * 开关当前是否打开。
   *
   * **优先问 settings 服务要权威值**（`settings.get(NS)` 解出来的是
   * 「schema 默认 + base 层 + 用户层」的合并结果），而不是只看 `setSource` 交付的那个 thunk：
   * 真实服务在 **attach / detach** 时也会用「只有 base 层」的源调一次 `setSource` + `onChange`
   * （例如浏览器刷新导致设置作用域重新挂载）。只信 thunk 的话，这一刻会读到 `patchTool: false`
   * 而把工具**反注册掉**——表现就是模型随后收到 `unknown tool "patch"`（真实会话里抓到过）。
   *
   * @returns 是否应该注册 patch 工具。
   */
  function patchToolWanted(): boolean {
    const settings = ctx.get('settings') as AnyCtx;
    if (settings !== undefined && settings !== null && typeof settings.get === 'function') {
      try {
        const resolved: unknown = settings.get(NS);
        if (resolved !== null && typeof resolved === 'object') {
          const value = (resolved as { patchTool?: unknown }).patchTool;
          if (typeof value === 'boolean') return value;
        }
      } catch {
        /* 落到 getConfig() */
      }
    }
    return getConfig().patchTool === true;
  }

  /** 让「patch 工具是否注册」与当前配置对齐（幂等，随便调多少次）。 */
  function syncPatchTool(): void {
    const scope = toolsScope;
    if (scope === undefined) return; // tools / fs 还没挂上，等它们挂上时会再调一次
    const wanted = patchToolWanted();
    if (wanted && disposePatchTool === undefined) {
      try {
        const off = scope.effect(() => registerPatchTool(scope), 'dshp-file-change-viewer: patch tool');
        disposePatchTool = () => {
          try {
            off?.();
          } catch (error) {
            console.error('[dshp-file-change-viewer] 反注册 patch 工具失败：', error);
          }
        };
      } catch (error) {
        console.error('[dshp-file-change-viewer] 注册 patch 工具失败：', error);
      }
      return;
    }
    if (!wanted && disposePatchTool !== undefined) {
      disposePatchTool();
      disposePatchTool = undefined;
    }
  }

  try {
    ctx.inject(['tools', 'fs'], (sctx: AnyCtx) => {
      toolsScope = sctx;
      syncPatchTool();
    });
  } catch (error) {
    console.error('[dshp-file-change-viewer] 注入 tools / fs 失败，patch 工具不可用：', error);
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
      ', patchTool=' +
      String(config.patchTool) +
      '）。',
  );
}
