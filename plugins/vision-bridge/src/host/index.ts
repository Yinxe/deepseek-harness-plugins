/**
 * @dshp/vision-bridge —— DSH Bundle 插件 Host 半（Cordis 插件，TS 重写）
 *
 * 挂载：~/.dsh/profiles/<profile>/cordis.patch.yml（自动通过 bundle patch）
 *
 * 职责：
 *  - 桥接纯文本模型与多模态视觉模型：占位符出现时 vision_describe 把本轮图片 + 提问转交视觉模型，主/备自动重试
 *  - settings.yaml（dshp-vision-bridge）持久化 + 旧文件/旧 key 自动迁移
 *  - 同源 JSON 路由供 Client：GET state / POST config / GET check
 *
 * 原实现：~/.dsh/plugins/vision-bridge/lib/index.js（JS，816 行）
 * 本文件为等价 TS 重写：逻辑逐行对齐，仅拆分为 types/http/config/cache/vision 模块，行为不变。
 *
 * @module @dshp/vision-bridge
 */
import { existsSync, unlinkSync, renameSync } from 'node:fs';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { ConfigSchema, DEFAULT_CONFIG, NS, loadPersisted, migrateYamlNamespaceKey, sanitizePatchConfig } from './config.js';
import { createImageCache, sessionIdOf, walkBlocks } from './cache.js';
import { json, readBody, sameOrigin } from './http.js';
import { buildQuestion, describeWithFallback, listVisionModels, sameRoute } from './vision.js';
import type { AnyCtx, CandidateModel, Detail, ImageRef, PluginConfig, VisionRoute } from './types.js';

export const name = '@dshp/vision-bridge';
export const inject: string[] = ['tools', 'webServer', 'llm'];
export { NS, ConfigSchema };

export function apply(ctx: AnyCtx, rawConfig: unknown): void {
  try {
    migrateYamlNamespaceKey();
  } catch { /* ignore */ }

  const entry: PluginConfig = { ...DEFAULT_CONFIG };
  const patch = sanitizePatchConfig(rawConfig);
  if (patch) {
    if (Object.hasOwn(patch, 'enabled') && patch.enabled !== undefined) entry.enabled = patch.enabled;
    if (Object.hasOwn(patch, 'primary') && patch.primary !== undefined) entry.primary = patch.primary;
    if (Object.hasOwn(patch, 'fallback') && patch.fallback !== undefined) entry.fallback = patch.fallback;
    if (Object.hasOwn(patch, 'detail') && patch.detail !== undefined) entry.detail = patch.detail;
    if (Object.hasOwn(patch, 'maxImages') && patch.maxImages !== undefined) entry.maxImages = patch.maxImages;
    if (Object.hasOwn(patch, 'promptTemplate') && patch.promptTemplate !== undefined) entry.promptTemplate = patch.promptTemplate;
  }

  const persistedForMigration = loadPersisted();

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
          console.info('[dshp-vision-bridge] settings.yaml 已存在 dshp-vision-bridge 用户配置，跳过旧文件自动迁移（旧文件保留，可手动删除 ' + persistedForMigration.source + '）');
        } catch { /* ignore */ }
        return;
      }
    } catch { /* ignore */ }
    const needPatch: Record<string, unknown> = {};
    let need = false;
    for (const k of Object.keys(persistedForMigration.config) as Array<keyof PluginConfig>) {
      const pv: unknown = persistedForMigration.config[k];
      const ev: unknown = entry[k];
      if (JSON.stringify(pv) !== JSON.stringify(ev)) {
        needPatch[k] = pv;
        need = true;
      }
    }
    if (!need) {
      try {
        const p = persistedForMigration.source;
        if (existsSync(p)) {
          try {
            unlinkSync(p);
            console.info('[dshp-vision-bridge] 旧存储文件与默认值一致，已自动清理 ' + p);
          } catch { /* ignore */ }
        }
      } catch { /* ignore */ }
      return;
    }
    Promise.resolve(settings.update(NS, needPatch))
      .then(() => {
        try {
          console.info('[dshp-vision-bridge] 已自动将旧版 ' + persistedForMigration.source + ' 迁移至 settings.yaml (dshp-vision-bridge)');
        } catch { /* ignore */ }
        try {
          const p = persistedForMigration.source;
          const bak = p + '.bak';
          if (existsSync(p)) {
            try {
              renameSync(p, bak);
              console.info('[dshp-vision-bridge] 旧文件已备份为 ' + bak);
            } catch {
              try {
                unlinkSync(p);
                console.info('[dshp-vision-bridge] 旧文件已清理 ' + p);
              } catch { /* ignore */ }
            }
          }
        } catch { /* ignore */ }
      })
      .catch((e: unknown) => {
        try {
          console.warn('[dshp-vision-bridge] 旧文件迁移失败：' + String((e as Error)?.message ?? e));
        } catch { /* ignore */ }
        hasMigrated = false;
      });
  }

  ctx.inject(['settings'], (sctx: AnyCtx) => {
    sctx.settings.installSection(ctx, NS, ConfigSchema, entry, {
      setSource: (src: () => PluginConfig) => {
        current = src;
        tryMigrate();
      },
      onChange: () => {},
    });
  });

  function getConfig(): PluginConfig {
    try {
      const v = current() as unknown;
      if (v && typeof v === 'object') return v as PluginConfig;
    } catch { /* ignore */ }
    return entry;
  }

  async function updateConfig(patchObj: Record<string, unknown>): Promise<void> {
    const settings = ctx.get('settings') as AnyCtx;
    if (!settings) throw new Error('settings 服务不可用，无法持久化到 settings.yaml（请重启 DSH 或检查 FileSettingsProvider 是否挂载）');
    await settings.update(NS, patchObj);
  }

  function snapshotConfig(): PluginConfig {
    const c = getConfig();
    return {
      enabled: c.enabled === true,
      primary: c.primary ? { provider: c.primary.provider, model: c.primary.model } : null,
      fallback: c.fallback ? { provider: c.fallback.provider, model: c.fallback.model } : null,
      detail: c.detail,
      maxImages: c.maxImages,
      promptTemplate: c.promptTemplate,
    };
  }

  async function ensureDefaults(models: CandidateModel[]): Promise<void> {
    if (!Array.isArray(models) || models.length === 0) return;
    const c = getConfig();
    const patchObj: Record<string, unknown> = {};
    let need = false;
    const first = models[0] as CandidateModel;
    if (!c.primary) {
      patchObj['primary'] = { provider: first.provider, model: first.model };
      need = true;
    }
    if (!c.fallback && models.length > 1) {
      const second = models[1] as CandidateModel;
      const primary: VisionRoute | null = (patchObj['primary'] as VisionRoute | undefined) ?? c.primary;
      if (primary && (second.provider !== primary.provider || second.model !== primary.model)) {
        patchObj['fallback'] = { provider: second.provider, model: second.model };
        need = true;
      }
    }
    if (need) {
      try {
        await updateConfig(patchObj);
      } catch (e) {
        try {
          console.warn('[dshp-vision-bridge] ensureDefaults 写入 settings.yaml 失败：' + String((e as Error)?.message ?? e));
        } catch { /* ignore */ }
      }
    }
  }

  let seq = 0;
  function nextId(prefix: string): string {
    seq += 1;
    return prefix + '-' + String(seq);
  }

  const images = createImageCache();

  // ── 监听 inbox + llm/stream，缓存图片 leaf ────────────────────────────
  try {
    ctx.effect(
      () =>
        ctx.on('agent/inbox/inserted', (payload: unknown) => {
          try {
            if (!payload || typeof payload !== 'object') return;
            const p = payload as { agent?: unknown; message?: { content?: unknown } };
            const sid = sessionIdOf(p.agent);
            const msg = p.message;
            if (typeof sid !== 'string' || !msg || typeof msg !== 'object') return;
            const found: ImageRef[] = [];
            walkBlocks((msg as { content?: unknown }).content, found);
            if (found.length > 0) images.push(sid, found);
          } catch { /* ignore */ }
        }),
      'dshp-vision-bridge: cache inbox images',
    );
  } catch { /* ignore */ }
  try {
    ctx.effect(
      () =>
        ctx.on('llm/stream', (options: { sessionId?: unknown; messages?: unknown }, next: () => unknown) => {
          try {
            const sid = options?.sessionId;
            const msgs = options?.messages;
            if (typeof sid === 'string' && Array.isArray(msgs)) {
              const found: ImageRef[] = [];
              for (const m of msgs as Array<{ content?: unknown }>) {
                if (m && typeof m === 'object') walkBlocks(m.content, found);
              }
              if (found.length > 0) images.push(sid, found);
            }
          } catch { /* ignore */ }
          return next();
        }),
      'dshp-vision-bridge: cache llm.stream images',
    );
  } catch { /* ignore */ }

  // ── 发送门禁接管 ──────────────────────────────────────────────────────
  function bridgeTakeoverArmed(): boolean {
    const c = getConfig();
    return c.enabled === true && c.primary !== null && typeof c.primary === 'object';
  }

  function withBridgeImageCapability<T extends object>(info: T): T {
    if (!info || typeof info !== 'object') return info;
    const mods = (info as { inputModalities?: unknown }).inputModalities;
    if (!Array.isArray(mods) || (mods as unknown[]).indexOf('image') >= 0) return info;
    return { ...info, inputModalities: [...(mods as string[]), 'image'] };
  }

  try {
    const llmSvc = ctx.get('llm') as AnyCtx;
    if (llmSvc && typeof llmSvc.resolveModelInfo === 'function') {
      const origResolve = llmSvc.resolveModelInfo.bind(llmSvc) as (...args: unknown[]) => Promise<AnyCtx>;
      const patchedResolve = async (...args: unknown[]): Promise<AnyCtx> => {
        const info = await origResolve(...args);
        try {
          if (bridgeTakeoverArmed()) return withBridgeImageCapability(info);
        } catch { /* ignore */ }
        return info;
      };
      llmSvc.resolveModelInfo = patchedResolve;
      ctx.effect(
        () => () => {
          try {
            if (llmSvc.resolveModelInfo === patchedResolve) llmSvc.resolveModelInfo = origResolve;
          } catch { /* ignore */ }
        },
        'dshp-vision-bridge: admission takeover',
      );
      try {
        console.info('[dshp-vision-bridge] admission takeover armed (text-only models may send images while bridge is enabled with a primary vision model)');
      } catch { /* ignore */ }
    } else {
      try {
        console.warn('[dshp-vision-bridge] llm service unavailable, admission takeover skipped (text-only models still cannot send images)');
      } catch { /* ignore */ }
    }
  } catch { /* ignore */ }

  // ── 系统提示 ──────────────────────────────────────────────────────────
  try {
    const sys = ctx.get('systemPrompt') as AnyCtx;
    if (sys && typeof sys.section === 'function') {
      ctx.effect(
        () =>
          sys.section({
            name: 'dshp-vision-bridge',
            order: 80,
            text: '视觉能力说明：你是纯文本模型，无法直接看图。当用户消息中出现“[image omitted because this model accepts text only”占位符时，说明本轮附带了图片，你必须调用 vision_describe 工具来识别（不要猜测图片内容，不要让用户换模型）。参数 question 写清你需要从图片中获得什么信息；如有多个图片可用 image_hint 指定（附件 sha 前缀或从 1 开始的序号），不确定就留空分析全部图片。工具会自动选用设置 → 视觉模型 里配置的主模型，失败时用备用模型重试。',
          }),
        'dshp-vision-bridge: prompt section',
      );
    }
  } catch { /* ignore */ }

  // ── 模型工具：vision_describe ─────────────────────────────────────────
  try {
    ctx.tools.register({
      name: 'vision_describe',
      description: '当你无法直接看到图片时调用：把用户本轮的图片交给视觉模型去识别，返回中文描述。看到 [image omitted because this model accepts text only] 占位符时必须用它，不要猜图。',
      parameters: {
        type: 'object',
        additionalProperties: false,
        properties: {
          question: { type: 'string', description: '你想从图片中知道什么，例如“描述这张截图里的报错信息”或“转录图片中的全部文字”。' },
          image_hint: { type: 'string', description: '可选：只分析某一张图。填附件 sha 前缀（占位符里的那串字符）或从 1 开始的序号；留空则分析本轮全部图片。' },
          detail: { type: 'string', enum: ['auto', 'low', 'high'], description: '可选：auto 常规描述，low 简要概括，high 逐字转录级详细。不填用设置页的默认值。' },
        },
        required: ['question'],
      },
      output: {
        schema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            description: { type: 'string' },
            model: { type: 'string' },
            fallback_used: { type: 'boolean' },
          },
          required: ['description', 'model', 'fallback_used'],
        },
        render: (_args: unknown, value: { description: unknown }) => [{ type: 'text', text: String(value.description) }],
      },
      isConcurrencySafe: () => false,
      async execute(args: Record<string, unknown>, exec: { agent?: unknown; signal?: AbortSignal }) {
        const cfg = getConfig();
        if (cfg.enabled !== true) throw new Error('视觉桥接已在设置页关闭，请先启用后再调用');
        const q = typeof args?.['question'] === 'string' ? (args['question'] as string).trim() : '';
        if (!q) throw new Error('question 不能为空：请说明你想从图片中获得什么信息');
        const hint = typeof args?.['image_hint'] === 'string' ? (args['image_hint'] as string).trim() : '';
        let detail: Detail;
        const argDetail = args?.['detail'];
        if (argDetail === 'low' || argDetail === 'high') detail = argDetail;
        else detail = cfg.detail === 'low' || cfg.detail === 'high' ? cfg.detail : 'auto';
        let sid: string | undefined;
        try {
          if (exec?.agent) sid = sessionIdOf(exec.agent);
        } catch { /* ignore */ }
        const cached = (typeof sid === 'string' && images.get(sid)) || [];
        let list: ImageRef[] = cached.slice();
        if (hint) {
          const h = hint.toLowerCase();
          const bySha = list.filter((r) => r.attachmentId.toLowerCase().indexOf(h) >= 0);
          if (bySha.length > 0) {
            list = bySha;
          } else {
            const n = parseInt(h, 10);
            if (!Number.isNaN(n) && n >= 1 && n <= list.length) {
              const one = list[n - 1] as ImageRef;
              list = [one];
            }
          }
        }
        const maxN = typeof cfg.maxImages === 'number' && cfg.maxImages >= 1 ? Math.min(cfg.maxImages, 8) : 4;
        if (list.length > maxN) list = list.slice(list.length - maxN);
        if (list.length === 0) {
          throw new Error('本轮没有找到可用的图片：请确认图片已作为附件发送（重试一次），或把占位符里的 sha 前缀填进 image_hint');
        }
        const question = buildQuestion(q, detail, cfg.promptTemplate);
        const signal = exec?.signal;
        const res = await describeWithFallback(imagesCtx(), cfg, list, question, signal, sid, nextId);
        return {
          description: res.text,
          model: res.route.provider + '/' + res.route.model,
          fallback_used: res.fallbackUsed === true,
        };

        function imagesCtx(): AnyCtx {
          return ctx;
        }
      },
    });
  } catch (e) {
    try {
      console.error('[dshp-vision-bridge] register tool failed: ' + String((e as Error)?.message ?? e));
    } catch { /* ignore */ }
  }

  // ── 同源 JSON 路由 ────────────────────────────────────────────────────

  ctx.effect(
    () =>
      ctx.webServer.register({
        kind: 'exact',
        path: '/ext/dshp-vision-bridge/state',
        handler: async (_req: IncomingMessage, res: ServerResponse) => {
          const req = _req as IncomingMessage;
          if (!sameOrigin(req)) return json(res, 403, { ok: false, error: 'forbidden' });
          try {
            const models = await listVisionModels(ctx);
            await ensureDefaults(models);
            return json(res, 200, { ok: true, models, config: snapshotConfig(), visionModelCount: models.length, admissionTakeover: bridgeTakeoverArmed() });
          } catch (e) {
            return json(res, 200, { ok: false, error: String((e as Error)?.message ?? e) });
          }
        },
      }),
    'dshp-vision-bridge: state route',
  );

  ctx.effect(
    () =>
      ctx.webServer.register({
        kind: 'exact',
        path: '/ext/dshp-vision-bridge/check',
        handler: async (_req: IncomingMessage, res: ServerResponse) => {
          const req = _req as IncomingMessage;
          if (!sameOrigin(req)) return json(res, 403, { ok: false, error: 'forbidden' });
          let llm: AnyCtx = null;
          try {
            llm = ctx.get('llm') as AnyCtx;
          } catch {
            llm = null;
          }
          if (!llm) {
            return json(res, 200, {
              ok: false,
              error: 'llm 服务不可用',
              primary: { ok: false, message: 'llm 服务不可用' },
              fallback: { ok: false, message: 'llm 服务不可用' },
            });
          }
          async function probe(route: VisionRoute | null): Promise<{ ok: boolean; message: string }> {
            if (!route) return { ok: false, message: '未配置' };
            try {
              if (typeof llm.resolveModelInfo === 'function') {
                await llm.resolveModelInfo(route.provider, route.model);
                return { ok: true, message: route.provider + '/' + route.model + ' 路由可解析' };
              }
              const ps = (llm.listProviders() as Array<{ id?: string }> | undefined) ?? [];
              const has = Array.isArray(ps) && ps.some((p) => p?.id === route.provider);
              return has
                ? { ok: true, message: route.provider + '/' + route.model + '（提供方已注册，未做模型级校验）' }
                : { ok: false, message: '提供方 ' + route.provider + ' 未注册' };
            } catch (e) {
              return { ok: false, message: String((e as Error)?.message ?? e).slice(0, 300) };
            }
          }
          const cfg = getConfig();
          return json(res, 200, { ok: true, primary: await probe(cfg.primary), fallback: await probe(cfg.fallback) });
        },
      }),
    'dshp-vision-bridge: check route',
  );

  ctx.effect(
    () =>
      ctx.webServer.register({
        kind: 'exact',
        path: '/ext/dshp-vision-bridge/config',
        handler: async (_req: IncomingMessage, res: ServerResponse) => {
          const req = _req as IncomingMessage;
          if (!sameOrigin(req)) return json(res, 403, { ok: false, error: 'forbidden' });
          if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'method not allowed' });
          let body: unknown = {};
          try {
            body = JSON.parse((await readBody(req)) || '{}') as unknown;
          } catch {
            return json(res, 200, { ok: false, error: '请求体不是合法 JSON' });
          }
          const a: Record<string, unknown> = body && typeof body === 'object' && !Array.isArray(body) ? (body as Record<string, unknown>) : {};
          function asRoute(v: unknown): VisionRoute | null {
            if (!v || typeof v !== 'object') return null;
            const r = v as Record<string, unknown>;
            if (typeof r['provider'] !== 'string' || typeof r['model'] !== 'string') return null;
            if (!r['provider'] || !r['model']) return null;
            return { provider: (r['provider'] as string).slice(0, 120), model: (r['model'] as string).slice(0, 200) };
          }
          try {
            const patchObj: Record<string, unknown> = {};
            let hasPatch = false;
            if (Object.hasOwn(a, 'primary')) {
              if (a['primary'] === null) {
                patchObj['primary'] = null;
                hasPatch = true;
              } else {
                const p = asRoute(a['primary']);
                if (!p) throw new Error('primary 非法，应为 {provider, model} 或 null');
                patchObj['primary'] = p;
                hasPatch = true;
              }
            }
            if (Object.hasOwn(a, 'fallback')) {
              if (a['fallback'] === null) {
                patchObj['fallback'] = null;
                hasPatch = true;
              } else {
                const f = asRoute(a['fallback']);
                if (!f) throw new Error('fallback 非法，应为 {provider, model} 或 null');
                patchObj['fallback'] = f;
                hasPatch = true;
              }
            }
            if (Object.hasOwn(a, 'enabled')) {
              patchObj['enabled'] = a['enabled'] === true;
              hasPatch = true;
            }
            if (Object.hasOwn(a, 'detail')) {
              if (a['detail'] === 'low' || a['detail'] === 'high' || a['detail'] === 'auto') {
                patchObj['detail'] = a['detail'];
                hasPatch = true;
              } else throw new Error('detail 非法，应为 auto/low/high');
            }
            if (Object.hasOwn(a, 'maxImages')) {
              const n = a['maxImages'];
              if (typeof n !== 'number' || !(n >= 1 && n <= 8)) throw new Error('maxImages 非法，应为 1-8 的数字');
              patchObj['maxImages'] = Math.floor(n);
              hasPatch = true;
            }
            if (Object.hasOwn(a, 'promptTemplate')) {
              if (typeof a['promptTemplate'] !== 'string') throw new Error('promptTemplate 非法，应为字符串');
              patchObj['promptTemplate'] = (a['promptTemplate'] as string).slice(0, 2000);
              hasPatch = true;
            }
            if (hasPatch) await updateConfig(patchObj);
            return json(res, 200, { ok: true, config: snapshotConfig() });
          } catch (e) {
            return json(res, 200, { ok: false, error: String((e as Error)?.message ?? e) });
          }
        },
      }),
    'dshp-vision-bridge: config route',
  );

  // 避免 TS `sameRoute` 未使用告警（fallback 去重在 vision.ts 内已用，此处探活也用）
  void sameRoute;
}
