/**
 * 同源 JSON 路由（设置节「文件修改卡片」的读写面）
 *
 *   GET  /ext/dshp-file-change-viewer/state   —— 当前生效偏好
 *   POST /ext/dshp-file-change-viewer/config  { view?, sectionsOpen? }
 *
 * 为什么设置节不走客户端 `settingsScope`：那条路要求 Host 先把命名空间注册进 settings 传输层
 * 并在浏览器侧绑定，链路长、时序敏感（服务晚挂载就静默退化成只读默认值）。本仓既有插件
 * （mcwiki-search / vision-bridge / token-meter）统一走「自有 /ext 路由 → Host `settings.update`」，
 * 写的是同一份 `settings.yaml` 的 NS 分节，但少一层时序依赖，设置页与工具行也能共用同一个读源。
 *
 * 业务错误一律 200 + `{ ok:false, error:'中文提示' }`（前端按 `ok` 分支），只有跨站 / 方法错误走 4xx。
 *
 * @module @dshp/file-change-viewer
 */
import type { IncomingMessage } from 'node:http';
import { json, readBody, sameOrigin } from './http.js';
import type { AnyCtx, PluginConfig } from './types.js';

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/** 只回契约字段的配置快照（不回内部携带的其它键）。 */
function snapshotOf(config: PluginConfig): PluginConfig {
  return { view: config.view, sectionsOpen: config.sectionsOpen };
}

/** 允许的展示方式（与 Host schema 的 `z.const` 联合逐字对齐）。 */
const VIEWS: readonly string[] = ['highlight', 'diff'];

/**
 * 注册两条路由。
 *
 * @param ctx - Cordis 插件上下文（需 `webServer`）。
 * @param getConfig - 读当前生效配置的 thunk（每次调用都读 settings 的 getter，热重载即时生效）。
 * @param updateConfig - 写回 `settings.yaml` 的 NS 分节。
 */
export function registerRoutes(
  ctx: AnyCtx,
  getConfig: () => PluginConfig,
  updateConfig: (patch: Record<string, unknown>) => Promise<void>,
): void {
  ctx.effect(
    () =>
      ctx.webServer.register({
        kind: 'exact',
        path: '/ext/dshp-file-change-viewer/state',
        handler: (req: IncomingMessage, res: AnyCtx) => {
          if (!sameOrigin(req)) return json(res, 403, { ok: false, error: 'forbidden' });
          return json(res, 200, { ok: true, config: snapshotOf(getConfig()) });
        },
      }),
    'dshp-file-change-viewer: state route',
  );

  ctx.effect(
    () =>
      ctx.webServer.register({
        kind: 'exact',
        path: '/ext/dshp-file-change-viewer/config',
        handler: async (req: IncomingMessage, res: AnyCtx) => {
          if (!sameOrigin(req)) return json(res, 403, { ok: false, error: 'forbidden' });
          if ((req as { method?: string }).method !== 'POST') {
            return json(res, 405, { ok: false, error: 'method not allowed' });
          }
          let body: unknown = {};
          try {
            body = JSON.parse((await readBody(req)) || '{}') as unknown;
          } catch {
            return json(res, 200, { ok: false, error: '请求体不是合法 JSON' });
          }
          const raw: Record<string, unknown> = isRecord(body) ? body : {};
          try {
            const patch: Record<string, unknown> = {};
            let hasPatch = false;
            if (Object.hasOwn(raw, 'view')) {
              const view = raw['view'];
              if (typeof view !== 'string' || !VIEWS.includes(view)) {
                throw new Error('view 非法，应为 highlight 或 diff');
              }
              patch['view'] = view;
              hasPatch = true;
            }
            if (Object.hasOwn(raw, 'sectionsOpen')) {
              const sectionsOpen = raw['sectionsOpen'];
              if (typeof sectionsOpen !== 'boolean') throw new Error('sectionsOpen 非法，应为布尔值');
              patch['sectionsOpen'] = sectionsOpen;
              hasPatch = true;
            }
            if (hasPatch) await updateConfig(patch);
            return json(res, 200, { ok: true, config: snapshotOf(getConfig()) });
          } catch (error) {
            return json(res, 200, { ok: false, error: String((error as Error)?.message ?? error) });
          }
        },
      }),
    'dshp-file-change-viewer: config route',
  );

  // ── 真实行号：只回行号，不回文件内容 ──────────────────────────────────────
  // 差异卡片的行号默认从 1 开始（官方代码块的 CSS 计数器），而 edit / write 的结果元数据
  // 只有 { path, oldText, newText }、没有行偏移。想知道「这段 hunk 在文件第几行」，只能拿
  // 文件当前内容去定位。响应体里**只有整数**，正文一个字都不回传。
  ctx.effect(
    () =>
      ctx.webServer.register({
        kind: 'exact',
        path: '/ext/dshp-file-change-viewer/locate',
        handler: async (req: IncomingMessage, res: AnyCtx) => {
          if (!sameOrigin(req)) return json(res, 403, { ok: false, error: 'forbidden' });
          if ((req as { method?: string }).method !== 'POST') {
            return json(res, 405, { ok: false, error: 'method not allowed' });
          }
          let body: unknown = {};
          try {
            body = JSON.parse((await readBody(req)) || '{}') as unknown;
          } catch {
            return json(res, 200, { ok: false, error: '请求体不是合法 JSON' });
          }
          const raw: Record<string, unknown> = isRecord(body) ? body : {};
          const cwd = typeof raw['cwd'] === 'string' && raw['cwd'] !== '' ? raw['cwd'] : undefined;
          const items = Array.isArray(raw['items']) ? raw['items'].slice(0, MAX_LOCATE_ITEMS) : [];
          const lines: Array<number | null> = [];
          for (const item of items) {
            lines.push(await locateLine(ctx, item, cwd));
          }
          return json(res, 200, { ok: true, lines });
        },
      }),
    'dshp-file-change-viewer: locate route',
  );
}

/** 一次定位请求最多处理几项（屏幕上一屏的块数量级）。 */
const MAX_LOCATE_ITEMS = 20;

/** 超过这个大小的文件不参与定位（读全文只为算一个行号，不值当）。 */
const MAX_LOCATE_BYTES = 4 * 1024 * 1024;

/**
 * 求「`newText` 这段文本在文件里的第几行」。
 *
 * @param ctx - Cordis 上下文（用 `ctx.fs` 读）。
 * @param item - `{ path, newText }`（不透明输入，逐字段收窄）。
 * @param cwd - 会话工作目录，用于解析相对路径。
 * @returns 1 起的行号；文件不存在、太大、或这段文本已经不在文件里时返回 null。
 */
async function locateLine(ctx: AnyCtx, item: unknown, cwd: string | undefined): Promise<number | null> {
  if (!isRecord(item)) return null;
  const path = item['path'];
  const newText = item['newText'];
  if (typeof path !== 'string' || path === '' || typeof newText !== 'string' || newText === '') return null;
  // 路由是挂在插件自己的 ctx 上的，这里显式取服务：fs 未挂载（或后端不支持读）就老实回 null。
  const fs = typeof ctx.get === 'function' ? ctx.get('fs') : undefined;
  if (fs === undefined || fs === null) return null;
  try {
    const target = await fs.resolve(path, cwd === undefined ? {} : { cwd });
    const info = await fs.stat(target);
    if (info === undefined || info.type !== 'file') return null;
    if (typeof info.size === 'number' && info.size > MAX_LOCATE_BYTES) return null;
    const content = (await fs.readText(target)) as string;
    const haystack = content.replace(/\r\n/g, '\n').split('\n');
    const needle = newText.replace(/\r\n/g, '\n').split('\n');
    for (let at = 0; at + needle.length <= haystack.length; at += 1) {
      let hit = true;
      for (let k = 0; k < needle.length; k += 1) {
        if (haystack[at + k] !== needle[k]) {
          hit = false;
          break;
        }
      }
      if (hit) return at + 1;
    }
    return null;
  } catch {
    return null;
  }
}
