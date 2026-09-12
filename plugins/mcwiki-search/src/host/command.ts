/**
 * /mcwiki 人用斜杠命令 —— 在会话输入框直接查询中文 Minecraft Wiki，
 * 结果以文本回显给用户，不经模型、不占用工具调用轮次。
 *
 * 语法（USAGE）：
 *   /mcwiki <搜索词>          全文搜索（数量取 settings 的 searchMaxResults）
 *   /mcwiki read <条目标题>    抓取条目引言（长度取 introMaxChars）
 *   /mcwiki random            随机条目引言
 *
 * 注册形态对齐官方 @deepseek-ai/dsh-command-goal：ctx.commands.register +
 * definitionId + input.hint；handler 返回 CommandResult（success/error + text），
 * 支持 Promise（本命令走网络，异步）。commands 服务按可选依赖处理
 * （ctx.get + 判空，未挂载时跳过注册，插件其余功能不受影响）。
 *
 * @module @dshp/mcwiki-search
 */
import { fetchPageIntro, fetchRandomPages, pageUrl, searchWiki } from './api.js';
import type { AnyCtx, PageIntroResult, PluginConfig, RandomPagesResult, SearchWikiResult } from './types.js';

const USAGE = [
  '用法：/mcwiki <搜索词>',
  '　　　/mcwiki read <条目标题>　查看条目引言',
  '　　　/mcwiki random　　　　　随机条目',
].join('\n');

/** 统一的成功文本结果（CommandResult 形态，零类型依赖手写对齐）。 */
function ok(text: string): { kind: 'success'; text: string } {
  return { kind: 'success', text };
}

/** 统一的失败文本结果。 */
function fail(text: string): { kind: 'error'; text: string } {
  return { kind: 'error', text };
}

/** ISO 时间串 → 日期（YYYY-MM-DD）；非该形态原样返回。 */
function shortDate(v: string): string {
  return /^\d{4}-\d{2}-\d{2}T/.test(v) ? v.slice(0, 10) : v;
}

/** 搜索结果 → 人读文本（编号列表 + URL + 更新日期，附后续用法提示）。 */
function renderSearch(r: SearchWikiResult): string {
  if (r.results.length === 0) {
    return `「${r.query}」没有命中任何条目；换个更短的关键词试试。\n${USAGE}`;
  }
  const head = `「${r.query}」共 ${r.totalHits} 条命中（显示前 ${r.results.length} 条${r.truncated ? '，已按设置截断' : ''}），第一条详情附后：`;
  const items = r.results.map(
    (item, i) =>
      `${i + 1}. ${item.title}\n   ${item.snippet}\n   ${item.url}${item.updated ? `（更新于 ${shortDate(item.updated)}）` : ''}`,
  );
  return [head, ...items, '', '看其他条目：/mcwiki read <标题>；需要全文就让模型调用 mcwiki_get_page。'].join(
    '\n',
  );
}

/** 引言 → 人读文本（标题 + 正文 + 来源链接）。 */
function renderIntro(title: string, text: string, url: string, truncated: boolean): string {
  return [
    `${title}${truncated ? '（引言已按设置截断）' : ''}`,
    '',
    text,
    '',
    `来源：${url || pageUrl(title)}`,
  ].join('\n');
}

/** 解析并执行一条 /mcwiki（网络调用按 invocation.signal 取消）。 */
async function executeMcwikiCommand(
  getConfig: () => PluginConfig,
  invocation: { rawInput?: unknown; signal?: unknown },
): Promise<{ kind: 'success' | 'error'; text: string }> {
  const cfg = getConfig();
  const raw = typeof invocation?.rawInput === 'string' ? invocation.rawInput.trim() : '';
  if (raw.length === 0) return ok(USAGE);
  const signal = invocation?.signal instanceof AbortSignal ? invocation.signal : undefined;

  const lower = raw.toLowerCase();
  if (lower === 'random' || lower === '随机') {
    const r = (await fetchRandomPages({
      limit: 1,
      maxIntroChars: cfg.introMaxChars,
      signal,
      timeoutMs: cfg.timeoutMs,
    })) as RandomPagesResult;
    const first = r.results[0];
    if (!first) return fail('Wiki 没有返回随机条目，请重试');
    return ok(renderIntro(first.title, first.text, first.url, false));
  }

  if (lower === 'read' || lower.startsWith('read ') || lower.startsWith('引言 ')) {
    const title = lower === 'read' ? '' : raw.slice(raw.indexOf(' ') + 1).trim();
    if (title.length === 0) return fail('read 需要条目标题：/mcwiki read <条目标题>');
    const r = (await fetchPageIntro({
      title,
      maxChars: cfg.introMaxChars,
      signal,
      timeoutMs: cfg.timeoutMs,
    })) as PageIntroResult;
    return ok(renderIntro(r.title, r.text, r.url, r.truncated));
  }

  const r = (await searchWiki({
    query: raw,
    limit: cfg.searchMaxResults,
    signal,
    timeoutMs: cfg.timeoutMs,
  })) as SearchWikiResult;
  if (r.results.length === 0) return ok(renderSearch(r));

  // 命中即附第一条的引言详情（多数查询「第一条就是答案」，一次给全；
  // 详情抓取失败只降级为纯列表，不影响已拿到的搜索结果）
  const first = r.results[0];
  if (first === undefined) return ok(renderSearch(r));
  let detail: string;
  try {
    const intro = (await fetchPageIntro({
      pageid: first.pageid,
      maxChars: cfg.introMaxChars,
      signal,
      timeoutMs: cfg.timeoutMs,
    })) as PageIntroResult;
    detail = renderIntro(intro.title, intro.text, intro.url, intro.truncated);
  } catch (e) {
    detail =
      '—— 第一条详情获取失败（' +
      String((e as Error)?.message ?? e).slice(0, 120) +
      '），可用 /mcwiki read ' +
      first.title +
      ' 重试 ——';
  }
  return ok([renderSearch(r), '', '—— 第一条「' + first.title + '」详情 ——', detail].join('\n'));
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
        description: '直接查询中文 Minecraft Wiki（搜索 / 条目引言 / 随机条目），结果回显到会话',
        input: { hint: '<搜索词> | read <条目标题> | random' },
        handler: (invocation: { rawInput?: unknown; signal?: unknown }) =>
          executeMcwikiCommand(getConfig, invocation).catch((e: unknown) =>
            fail('Minecraft Wiki 查询失败：' + String((e as Error)?.message ?? e).slice(0, 300)),
          ),
      }),
    'dshp-mcwiki-search: /mcwiki command',
  );
}
