/**
 * 视觉模型发现 + 调用 + fallback
 *
 * 候选来源（并集去重，按 provider/model 字典序）：
 *  1. settings 中 llm-pi-ai / llm-deepseek 命名空间下 providers[].models[] 里 input 含 image 的
 *  2. llm.listProviders() + llm.listModels(provider) 里 inputModalities 含 image 的
 */
import type {
  AnyLlm,
  AnySettings,
  CandidateModel,
  Detail,
  ImageRef,
  PluginConfig,
  VisionRoute,
} from './types.js';

function isRecord(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

export function sameRoute(a: VisionRoute | null, b: VisionRoute | null): boolean {
  if (!a || !b) return false;
  return a.provider === b.provider && a.model === b.model;
}

interface SectionModel {
  provider: string;
  model: string;
  name: string;
}

function candidatesFromSection(sec: unknown): SectionModel[] {
  const out: SectionModel[] = [];
  if (!isRecord(sec)) return out;
  const providers = sec['providers'];
  if (!isRecord(providers)) return out;
  for (const prov of Object.keys(providers)) {
    const prof = providers[prov];
    if (!isRecord(prof)) continue;
    const models = prof['models'];
    if (!Array.isArray(models)) continue;
    for (const m of models) {
      if (!isRecord(m) || typeof m['id'] !== 'string' || (m['id'] as string).length === 0) continue;
      const input = m['input'];
      if (!Array.isArray(input) || (input as unknown[]).indexOf('image') < 0) continue;
      out.push({
        provider: prov,
        model: m['id'] as string,
        name:
          typeof m['name'] === 'string' && (m['name'] as string).length > 0
            ? (m['name'] as string)
            : (m['id'] as string),
      });
    }
  }
  return out;
}

export async function listVisionModels(ctx: {
  get: (k: string) => AnySettings | AnyLlm;
}): Promise<CandidateModel[]> {
  const merged: CandidateModel[] = [];
  const seen = new Set<string>();
  function add(provider: string, model: string, name: string): void {
    if (typeof provider !== 'string' || typeof model !== 'string') return;
    const key = provider + '/' + model;
    if (seen.has(key)) return;
    seen.add(key);
    merged.push({ provider, model, name: typeof name === 'string' && name ? name : model });
  }

  let settings: AnySettings | null = null;
  try {
    settings = ctx.get('settings') as AnySettings;
  } catch {
    settings = null;
  }
  if (settings) {
    for (const ns of ['llm-pi-ai', 'llm-deepseek']) {
      try {
        const sec = settings.get(ns) as unknown;
        for (const c of candidatesFromSection(sec)) add(c.provider, c.model, c.name);
      } catch {
        /* ignore */
      }
    }
  }

  let llm: AnyLlm | null = null;
  try {
    llm = ctx.get('llm') as AnyLlm;
  } catch {
    llm = null;
  }
  if (llm && typeof llm.listProviders === 'function') {
    let providers: unknown[] = [];
    try {
      providers = (llm.listProviders() as unknown[] | undefined) ?? [];
    } catch {
      providers = [];
    }
    if (Array.isArray(providers)) {
      for (const prov of providers) {
        const pid = isRecord(prov) && typeof prov['id'] === 'string' ? (prov['id'] as string) : undefined;
        if (!pid) continue;
        try {
          if (typeof llm.listModels !== 'function') continue;
          const models = (await llm.listModels(pid)) as unknown;
          if (!Array.isArray(models)) continue;
          for (const info of models) {
            if (!isRecord(info)) continue;
            if (typeof info['id'] !== 'string' || typeof info['provider'] !== 'string') continue;
            const mods = info['inputModalities'];
            if (!Array.isArray(mods) || (mods as unknown[]).indexOf('image') < 0) continue;
            add(
              info['provider'] as string,
              info['id'] as string,
              typeof info['name'] === 'string' ? (info['name'] as string) : (info['id'] as string),
            );
          }
        } catch {
          /* ignore */
        }
      }
    }
  }

  merged.sort((a, b) => {
    if (a.provider < b.provider) return -1;
    if (a.provider > b.provider) return 1;
    if (a.model < b.model) return -1;
    if (a.model > b.model) return 1;
    return 0;
  });
  return merged;
}

export interface VisionAttempt {
  text: string;
  route: VisionRoute;
  fallbackUsed: boolean;
}

async function runOneVision(
  llm: AnyLlm,
  route: VisionRoute,
  images: ImageRef[],
  question: string,
  signal: AbortSignal | undefined,
  sessionId: string | undefined,
  nextId: (prefix: string) => string,
): Promise<string> {
  const content: unknown[] = [];
  for (const img of images) content.push({ type: 'image', attachment: img });
  content.push({ type: 'text', text: question });
  const messages = [
    {
      id: nextId('vision-msg'),
      role: 'user',
      content,
      source: { kind: 'user' },
    },
  ];
  const opts: Record<string, unknown> = { provider: route.provider, model: route.model, messages };
  // 透传会话 ID：opencode 系自 2026-09-06 起强制要求会话头，缺失报 MissingSessionID；非 opencode 忽略
  if (typeof sessionId === 'string' && sessionId.length > 0) {
    try {
      opts['sessionId'] = sessionId;
    } catch {
      /* ignore */
    }
  }
  if (signal && typeof signal === 'object' && (signal as AbortSignal).aborted !== true) {
    try {
      opts['signal'] = signal;
    } catch {
      /* ignore */
    }
  }
  let out = '';
  let sawDelta = false;
  const stream = llm.stream(opts) as AsyncIterable<Record<string, unknown>>;
  for await (const chunk of stream) {
    if (!chunk || typeof chunk !== 'object') continue;
    if (chunk['type'] === 'text-delta' && typeof chunk['text'] === 'string') {
      sawDelta = true;
      out += chunk['text'] as string;
    } else if (
      chunk['type'] === 'block-end' &&
      isRecord(chunk['block']) &&
      chunk['block']['type'] === 'text'
    ) {
      if (!sawDelta && typeof chunk['block']['text'] === 'string') out += chunk['block']['text'] as string;
    } else if (chunk['type'] === 'finish' && isRecord(chunk['reason'])) {
      const kind = chunk['reason']['kind'];
      if (kind === 'error') {
        const failure = chunk['reason']['failure'];
        const msg = (
          isRecord(failure) && typeof failure['message'] === 'string'
            ? (failure['message'] as string)
            : '视觉模型调用失败'
        ).slice(0, 500);
        throw new Error(String(msg));
      }
      if (kind === 'aborted') throw new Error('视觉模型调用被中止');
    }
  }
  if (out.trim().length === 0) throw new Error('视觉模型返回为空');
  return out;
}

export async function describeWithFallback(
  ctx: { get: (k: string) => AnyLlm },
  cfg: PluginConfig,
  images: ImageRef[],
  question: string,
  signal: AbortSignal | undefined,
  sessionId: string | undefined,
  nextId: (prefix: string) => string,
): Promise<VisionAttempt> {
  let llm: AnyLlm | null = null;
  try {
    llm = ctx.get('llm') as AnyLlm;
  } catch {
    llm = null;
  }
  if (!llm || typeof llm.stream !== 'function') throw new Error('当前环境没有可用的 llm 服务');
  const attempts: Array<{ route: VisionRoute; fallback: boolean }> = [];
  if (cfg.primary) attempts.push({ route: cfg.primary, fallback: false });
  if (cfg.fallback && !sameRoute(cfg.fallback, cfg.primary))
    attempts.push({ route: cfg.fallback, fallback: true });
  if (attempts.length === 0) {
    const models = await listVisionModels(ctx as { get: (k: string) => AnySettings | AnyLlm });
    if (models.length === 0)
      throw new Error(
        '没有可用的视觉模型：请先在设置 → 视觉模型 中选择（需要在 setting.yml 里给模型加上 input: [text, image]）',
      );
    const first = models[0] as CandidateModel;
    attempts.push({ route: { provider: first.provider, model: first.model }, fallback: false });
  }
  let lastError: unknown = null;
  for (const a of attempts) {
    try {
      const text = await runOneVision(llm, a.route, images, question, signal, sessionId, nextId);
      return { text, route: a.route, fallbackUsed: a.fallback };
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError instanceof Error ? lastError : new Error('视觉模型调用失败');
}

/** buildQuestion(question, detail, promptTemplate)：detail 后缀 + 追加提示词 */
export function buildQuestion(base: string, detail: Detail, promptTemplate: string): string {
  let q = (typeof base === 'string' ? base : '').trim();
  if (!q) q = '请描述这张图片的内容。';
  let suffix = '';
  if (detail === 'high')
    suffix = '\n\n请尽可能详细：主体、文字、数字、颜色、位置关系都不要遗漏。如有文字请逐字转录。';
  else if (detail === 'low') suffix = '\n\n请用 2-3 句话简要概括。';
  const extra =
    typeof promptTemplate === 'string' && promptTemplate.trim().length > 0
      ? '\n\n补充要求：' + promptTemplate.trim().slice(0, 500)
      : '';
  return q + suffix + extra;
}
