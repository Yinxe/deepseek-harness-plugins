/**
 * @dshp/mcwiki-search —— DSH Bundle 插件 Host 半（Cordis 插件，TS 重写）
 *
 * 挂载：~/.dsh/profiles/<profile>/cordis.patch.yml（自动通过 bundle patch）
 *
 * 提供三个模型工具（数据全部经 convert.ts 清洗后输出，模型只看到干净文本）：
 *   - mcwiki_search      —— 全文搜索，返回清洗后的结果列表（标题/摘要/URL/更新时间）
 *   - mcwiki_get_page    —— 抓取页面：intro（extracts 纯文本）或 full（wikitext→Markdown/纯文本）
 *   - mcwiki_random      —— 随机条目 + 引言纯文本
 *
 * 以及三个同源 JSON 路由（设置页状态 / 配置持久化 / 连接测试）：
 *   GET  /ext/dshp-mcwiki-search/state
 *   POST /ext/dshp-mcwiki-search/config  { timeoutMs?, maxChars?, introMaxChars?, searchMaxResults? }
 *   POST /ext/dshp-mcwiki-search/test    { query, title?, section? }
 *
 * 持久化（标准 settings 存储，对齐 vision-bridge 与官方插件）：
 *  settings.yaml 顶层 `dshp-mcwiki-search` 命名空间，工具与路由每次调用都读
 *  当前生效配置，外部编辑热重载无需重启。配置只认该命名空间，不做历史 key 迁移。
 *
 * 原实现：~/.dsh/plugins/dsh-mcwiki-search（JS，@dshp-inx/mcwiki-search v1.0.1）
 * 本目录为等价 TS 重写：lib/{index,api,convert}.js → src/host/{index,tools,routes,api,convert,config,http,types}.ts，
 * tsup 打包为单文件 lib/host.js（ESM，schemastery 内联，运行时零依赖）。
 *
 * @module @dshp/mcwiki-search
 */
import { ConfigSchema, DEFAULT_CONFIG, NS, sanitizePatchConfig } from './config.js';
import { registerRoutes } from './routes.js';
import { registerTools } from './tools.js';
import type { AnyCtx, PluginConfig } from './types.js';

export const name = '@dshp/mcwiki-search';
export const inject: string[] = ['tools', 'webServer'];
export { NS, ConfigSchema };

export function apply(ctx: AnyCtx, rawConfig: unknown): void {
  // composition entry：默认值 ← patch 覆盖（settings 的 base 层）
  const entry: PluginConfig = { ...DEFAULT_CONFIG };
  const patch = sanitizePatchConfig(rawConfig);
  if (patch) {
    if (Object.hasOwn(patch, 'timeoutMs') && patch.timeoutMs !== undefined) entry.timeoutMs = patch.timeoutMs;
    if (Object.hasOwn(patch, 'maxChars') && patch.maxChars !== undefined) entry.maxChars = patch.maxChars;
    if (Object.hasOwn(patch, 'introMaxChars') && patch.introMaxChars !== undefined)
      entry.introMaxChars = patch.introMaxChars;
    if (Object.hasOwn(patch, 'searchMaxResults') && patch.searchMaxResults !== undefined)
      entry.searchMaxResults = patch.searchMaxResults;
  }

  // 官方 settings：当前生效配置源（有 settings 时指向 scope.get()，否则指向 entry）
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
      if (v && typeof v === 'object') return { ...entry, ...(v as Partial<PluginConfig>) };
    } catch {
      /* ignore */
    }
    return { ...entry };
  }

  async function updateConfig(configPatch: Record<string, unknown>): Promise<void> {
    const settings = ctx.get('settings') as AnyCtx;
    if (!settings)
      throw new Error(
        'settings 服务不可用，无法持久化到 settings.yaml（请重启 DSH 或检查 FileSettingsProvider 是否挂载）',
      );
    await settings.update(NS, configPatch);
  }

  registerTools(ctx, getConfig);
  registerRoutes(ctx, getConfig, updateConfig);

  // 系统提示引导（可选服务；不存在则跳过，工具本身仍可用）
  try {
    const systemPrompt = ctx.get('systemPrompt') as AnyCtx;
    if (systemPrompt !== undefined && typeof systemPrompt.section === 'function') {
      ctx.effect(
        () =>
          systemPrompt.section({
            name: 'tool:mcwiki',
            order: 112,
            text: 'Minecraft Wiki 查询工具（mcwiki_search / mcwiki_get_page / mcwiki_random）：查询 Minecraft 官方知识库，返回已清洗的 AI 可读文本。搜到结果后如需详情，用 mcwiki_get_page 抓取页面；引用内容时附上页面 URL。',
          }),
        'dshp-mcwiki-search: prompt section',
      );
    }
  } catch {
    /* ignore */
  }
}
