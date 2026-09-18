/**
 * @dshp/web-style —— DSH Bundle 插件 Host 半（Cordis 插件，TS 重写）
 *
 * 挂载：~/.dsh/profiles/<profile>/cordis.patch.yml（bundle patch 自动插入）
 *
 * 职责：
 *  - 主题选择 / 壁纸取色 / 全局圆角的持久化（settings.yaml `dshp-web-style` 命名空间，只认它）
 *  - 主题目录全量 token 下发（token 单源 src/host/themes，client 只存 meta）
 *  - 同源 JSON 路由供 Client：GET state / GET themes / POST theme / POST config
 *
 * 原实现：~/.dsh/plugins/dsh-custom-ui/lib/index.js（JS，269 行，包名 @dshp-inx/custom-ui）
 * 本文件为等价 TS 重写：逻辑逐行对齐，仅拆分为 index/types/config/http/themes 模块，行为不变。
 *
 * @module @dshp/web-style
 */
import type { IncomingMessage, ServerResponse } from 'node:http';
import {
  ConfigSchema,
  DEFAULT_CONFIG,
  NS,
  sanitizeBackgroundId,
  sanitizePhotoPalette,
  sanitizeRadius,
  sanitizeOpaque,
  sanitizePatchConfig,
  sanitizeThemeId,
} from './config.js';
import { json, readBody, sameOrigin } from './http.js';
import { THEME_CATALOG } from './themes/index.js';
import type { AnyCtx, AnySettings, PhotoPalette, StyleConfig, StyleConfigPatch } from './types.js';

export const name = '@dshp/web-style';
export const inject: string[] = ['webServer'];
export { NS, ConfigSchema };
export { BACKGROUND_IDS } from './config.js';
// 目录随插件导出：scripts/check-themes.mjs 以它为准校验 client 画廊 meta
//（-id 唯一性、字段一致性、构建产物未内联 token）。
export { THEME_CATALOG, THEME_IDS } from './themes/index.js';

export function apply(ctx: AnyCtx, rawConfig: unknown): void {
  // ── composition entry 默认值 ← patch 覆盖（settings 的 base 层）──
  const entry: StyleConfig = {
    ...DEFAULT_CONFIG,
    radius: { ...DEFAULT_CONFIG.radius },
    wallpaper: {},
    glass: {},
  };
  const patch = sanitizePatchConfig(rawConfig);
  if (patch) {
    if (patch.themeId !== undefined) entry.themeId = patch.themeId;
    if (patch.backgroundId !== undefined) entry.backgroundId = patch.backgroundId;
    if (patch.photoPalette !== undefined) entry.photoPalette = patch.photoPalette;
    if (patch.radius?.global !== undefined) entry.radius = { ...entry.radius, global: patch.radius.global };
  }

  // ── 官方 settings：当前生效配置源（DSH 0.1.2-rc.1+ 的官方接线方式）──
  let current: () => StyleConfig = () => entry;
  ctx.inject(['settings'], (sctx: AnyCtx) => {
    sctx.settings.installSection(ctx, NS, ConfigSchema, entry, {
      setSource: (src: () => StyleConfig) => {
        current = src;
      },
      onChange: () => {},
    });
  });

  function readConfig(): StyleConfig {
    try {
      const v = current() as unknown;
      if (v && typeof v === 'object') {
        const rec = v as Record<string, unknown>;
        return {
          themeId: typeof rec['themeId'] === 'string' ? sanitizeThemeId(rec['themeId']) : '',
          backgroundId:
            typeof rec['backgroundId'] === 'string' ? sanitizeBackgroundId(rec['backgroundId']) : '',
          photoPalette: sanitizePhotoPalette(rec['photoPalette']),
          radius: rec['radius'] && typeof rec['radius'] === 'object' ? (rec['radius'] as any) : entry.radius,
          wallpaper: sanitizeOpaque(rec['wallpaper']),
          glass: sanitizeOpaque(rec['glass']),
        };
      }
    } catch {
      /* 读失败按默认 */
    }
    return { ...entry, radius: { ...entry.radius } };
  }

  function snapshot(): StyleConfig {
    const cfg = readConfig();
    return {
      themeId: cfg.themeId,
      backgroundId: cfg.backgroundId,
      photoPalette: cfg.photoPalette,
      radius: cfg.radius,
      wallpaper: cfg.wallpaper,
      glass: cfg.glass,
    };
  }

  async function writeConfig(patchObj: StyleConfigPatch): Promise<void> {
    let settings: AnySettings = null;
    try {
      settings = ctx.get('settings') as AnySettings;
    } catch {
      settings = null;
    }
    if (!settings) throw new Error('settings 服务不可用，无法持久化定制 UI 配置');
    await settings.update(NS, patchObj);
  }

  // ── 同源 JSON 路由（小工具见 http.ts）──
  //
  // `apply` 顶层不许抛（docs/cordis-host.md）：注册动作包进 try/catch，webServer 没挂载或
  // 路径被占用时只坏掉这一条路由并记一行中文，其余路由与主题/圆角照常工作。
  function effectRoute(routeName: string, register: () => unknown): void {
    ctx.effect(
      () => {
        try {
          return register();
        } catch (e) {
          console.error(
            '[dshp-web-style] 路由注册失败（' +
              routeName +
              '），这项设置本次启动不生效：' +
              String((e as Error)?.message ?? e),
          );
          return undefined;
        }
      },
      'dshp-web-style: ' + routeName + ' route',
    );
  }

  effectRoute('state', () =>
    ctx.webServer.register({
      kind: 'exact',
      path: '/ext/dshp-web-style/state',
      handler: async (req: IncomingMessage, res: ServerResponse) => {
        if (!sameOrigin(req)) return json(res, 403, { ok: false, error: 'forbidden' });
        if (req.method !== 'GET') return json(res, 405, { ok: false, error: 'method not allowed' });
        return json(res, 200, { ok: true, ...snapshot() });
      },
    }),
  );

  effectRoute('themes', () =>
    ctx.webServer.register({
      kind: 'exact',
      path: '/ext/dshp-web-style/themes',
      handler: async (req: IncomingMessage, res: ServerResponse) => {
        if (!sameOrigin(req)) return json(res, 403, { ok: false, error: 'forbidden' });
        if (req.method !== 'GET') return json(res, 405, { ok: false, error: 'method not allowed' });
        return json(res, 200, { ok: true, count: THEME_CATALOG.length, themes: THEME_CATALOG });
      },
    }),
  );

  effectRoute('theme', () =>
    ctx.webServer.register({
      kind: 'exact',
      path: '/ext/dshp-web-style/theme',
      handler: async (req: IncomingMessage, res: ServerResponse) => {
        if (!sameOrigin(req)) return json(res, 403, { ok: false, error: 'forbidden' });
        if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'method not allowed' });
        let body: Record<string, unknown> = {};
        try {
          const parsed = JSON.parse((await readBody(req)) || '{}') as unknown;
          body = parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? (parsed as any) : {};
        } catch (e) {
          const msg = String((e as Error)?.message ?? e);
          return json(res, 200, {
            ok: false,
            error: msg === 'payload-too-large' ? '请求体过大' : '请求体不是合法 JSON',
          });
        }
        const raw = body['themeId'];
        const themeId = sanitizeThemeId(raw);
        if (typeof raw !== 'string' || (raw.trim().length > 0 && themeId === '')) {
          return json(res, 200, { ok: false, error: '未知主题 id，请更新插件后重试' });
        }
        try {
          await writeConfig({ themeId });
          return json(res, 200, { ok: true, ...snapshot() });
        } catch (e) {
          return json(res, 200, { ok: false, error: String((e as Error)?.message ?? e) });
        }
      },
    }),
  );

  effectRoute('config', () =>
    ctx.webServer.register({
      kind: 'exact',
      path: '/ext/dshp-web-style/config',
      handler: async (req: IncomingMessage, res: ServerResponse) => {
        if (!sameOrigin(req)) return json(res, 403, { ok: false, error: 'forbidden' });
        if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'method not allowed' });
        let a: Record<string, unknown> = {};
        try {
          const parsed = JSON.parse((await readBody(req)) || '{}') as unknown;
          a = parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? (parsed as any) : {};
        } catch (e) {
          const msg = String((e as Error)?.message ?? e);
          return json(res, 200, {
            ok: false,
            error: msg === 'payload-too-large' ? '请求体过大' : '请求体不是合法 JSON',
          });
        }
        const out: StyleConfigPatch = {};
        const rd = sanitizeRadius(a['radius']);
        if (rd) out.radius = rd;
        if (typeof a['backgroundId'] === 'string') {
          out.backgroundId = sanitizeBackgroundId(a['backgroundId']);
        }
        if (Object.hasOwn(a, 'photoPalette')) {
          const pal: PhotoPalette | null = sanitizePhotoPalette(a['photoPalette']);
          if (pal === null && a['photoPalette'] !== null) {
            return json(res, 200, { ok: false, error: 'photoPalette 非法（需三个 #rrggbb 色值）' });
          }
          out.photoPalette = pal;
        }
        try {
          if (Object.keys(out).length > 0) await writeConfig(out);
          return json(res, 200, { ok: true, ...snapshot() });
        } catch (e) {
          return json(res, 200, { ok: false, error: String((e as Error)?.message ?? e) });
        }
      },
    }),
  );
}
