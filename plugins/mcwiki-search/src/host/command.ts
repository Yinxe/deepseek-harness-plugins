/**
 * /mcwiki 人用斜杠命令 —— 在会话输入框直接查询中文 Minecraft Wiki，
 * 结果以文本回显给用户，不经模型、不占用工具调用轮次。
 *
 * 设计约束（对齐输入框现实）：
 *  - 单命令单动作，**不做子命令**：input.hint 只是静态文字，输入框不会为
 *    子命令做补全，用户发现不了。想看别的条目就 /mcwiki <条目名> 再搜。
 *  - 第一条详情**完整输出**（不传 maxChars 上限）：人看的详情不该按给模型
 *    的紧凑设置来截断（对齐 README 的「完整性承诺」）；详情抓取失败降级
 *    为纯列表。
 *
 * 注册形态对齐官方 @deepseek-ai/dsh-command-goal：ctx.commands.register +
 * definitionId + input.hint，handler 返回 CommandResult，支持 Promise。
 * commands 服务按可选依赖处理（ctx.get + 判空，未挂载时跳过注册）。
 *
 * @module @dshp/mcwiki-search
 */
import { fetchPageIntro, pageUrl, searchWiki } from './api.js';
import type { AnyCtx, PageIntroResult, PluginConfig, SearchWikiResult } from './types.js';

/** ISO 时间串 → 日期（YYYY-MM-DD）；非该形态原样返回。 */
function shortDate(v: string): string {
  return /^\d{4}-\d{2}-\d{2}T/.test(v) ? v.slice(0, 10) : v;
}

/** 统一的成功文本结果（CommandResult 形态，零类型依赖手写对齐）。 */
function ok(text: string): { kind: 'success'; text: string } {
  return { kind: 'success', text };
}

/** 统一的失败文本结果。 */
function fail(text: string): { kind: 'error'; text: string } {
  return { kind: 'error', text };
}

/** 引言 → 人读文本（标题 + 正文 + 来源链接）。 */
function renderIntro(title: string, text: string, url: string): string {
  return [`${title}`, '', text, '', `来源：${url || pageUrl(title)}`].join('\n');
}

/** 解析并执行一条 /mcwiki（网络调用按 invocation.signal 取消）。 */
async function executeMcwikiCommand(
  getConfig: () => PluginConfig,
  invocation: { rawInput?: unknown; signal?: unknown },
): Promise<{ kind: 'success' | 'error'; text: string }> {
  const cfg = getConfig();
  const raw = typeof invocation?.rawInput === 'string' ? invocation.rawInput.trim() : '';
  if (raw.length === 0) return ok('用法：/mcwiki <搜索词或条目名>——回显搜索列表与第一条详情');
  const signal = invocation?.signal instanceof AbortSignal ? invocation.signal : undefined;

  const r = (await searchWiki({
    query: raw,
    limit: cfg.searchMaxResults,
    signal,
    timeoutMs: cfg.timeoutMs,
  })) as SearchWikiResult;
  if (r.results.length === 0) {
    return ok(`「${r.query}」没有命中任何条目；换个更短的关键词试试。`);
  }

  // 命中即附第一条的完整引言（多数查询「第一条就是答案」，一次给全；
  // 详情抓取失败只降级为纯列表，不影响已拿到的搜索结果）
  const first = r.results[0];
  if (first === undefined) return ok(`「${r.query}」没有命中任何条目。`);
  let detail: string;
  try {
    // 整页纯文本前 6000 字（wiki 的 exintro 引言往往只有一两句，没料；
    // 整页才有分节正文，6000 与设置页转换测试同量级，刷屏可控）
    const intro = (await fetchPageIntro({
      pageid: first.pageid,
      wholePage: true,
      maxChars: 6000,
      signal,
      timeoutMs: cfg.timeoutMs,
    })) as PageIntroResult;
    detail = renderIntro(intro.title, intro.text, intro.url);
  } catch (e) {
    detail =
      '—— 详情获取失败（' +
      String((e as Error)?.message ?? e).slice(0, 120) +
      '），可再试一次 /mcwiki ' +
      first.title +
      ' ——';
  }
  return ok(
    [
      renderList(r),
      '',
      '—— 第一条「' + first.title + '」详情 ——',
      detail,
      '',
      '（详情为条目全文前 6000 字；需要完整内容就让模型调用 mcwiki_get_page，section=full 读 Markdown 全文）',
    ].join('\n'),
  );
}

/** 搜索结果 → 编号列表（标题 + 摘要 + URL + 更新日期）。 */
function renderList(r: SearchWikiResult): string {
  if (r.results.length === 0) {
    return `「${r.query}」没有命中任何条目；换个更短的关键词试试。`;
  }
  const head = `「${r.query}」共 ${r.totalHits} 条命中（显示前 ${r.results.length} 条${r.truncated ? '，已按设置截断' : ''}），第一条详情附后：`;
  const items = r.results.map(
    (item, i) =>
      `${i + 1}. ${item.title}\n   ${item.snippet}\n   ${item.url}${item.updated ? `（更新于 ${shortDate(item.updated)}）` : ''}`,
  );
  return [head, ...items].join('\n');
}

/** 注册 /mcwiki（commands 为可选服务；未挂载时静默跳过并记一行 info）。 */
export function registerCommand(ctx: AnyCtx, getConfig: () => PluginConfig): void {
  const commands = ctx.get('commands') as AnyCtx;
  if (!commands || typeof commands.register !== 'function') {
    try {
      console.info('[dshp-mcwiki-search] commands 服务未挂载，跳过 /mcwiki 命令注册');
    } catch {
      /* ignore */
    }
    return;
  }
  ctx.effect(
    () =>
      commands.register({
        // definitionId 为品牌字符串（官方包用包名）；AnyCtx 体系下直接传同值
        definitionId: '@dshp/mcwiki-search',
        name: 'mcwiki',
        description: '查询中文 Minecraft Wiki：回显搜索列表与第一条条目的完整引言',
        input: { hint: '<搜索词或条目名>' },
        handler: (invocation: { rawInput?: unknown; signal?: unknown }) =>
          executeMcwikiCommand(getConfig, invocation).catch((e: unknown) =>
            fail('Minecraft Wiki 查询失败：' + String((e as Error)?.message ?? e).slice(0, 300)),
          ),
      }),
    'dshp-mcwiki-search: /mcwiki command',
  );
}
