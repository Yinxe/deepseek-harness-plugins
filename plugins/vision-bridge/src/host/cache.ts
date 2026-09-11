/**
 * 图片缓存（会话级，leaf owned copy）
 *
 * - 只存 attachment 的 owned copy：attachmentId / mediaType / bytes / width / height / name
 * - 每会话最多 20 张（超限丢最旧），最多 50 会话（LRU 丢最旧会话）
 * - 工厂函数：每次 apply() 独立一份，避免多实例串缓存
 */
import type { ImageRef } from './types.js';

const MAX_PER_SESSION = 20;
const MAX_SESSIONS = 50;

function isRecord(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

export function copyAttachment(a: unknown): ImageRef | null {
  if (!isRecord(a)) return null;
  if (typeof a['attachmentId'] !== 'string' || typeof a['mediaType'] !== 'string') return null;
  if (typeof a['bytes'] !== 'number') return null;
  const out: ImageRef = {
    attachmentId: a['attachmentId'],
    mediaType: a['mediaType'],
    bytes: a['bytes'],
  };
  if (typeof a['width'] === 'number') out.width = a['width'];
  if (typeof a['height'] === 'number') out.height = a['height'];
  if (typeof a['name'] === 'string' && a['name'].length > 0) out.name = a['name'].slice(0, 120);
  return out;
}

/** 递归扫 content blocks（含 tool-result 嵌套），收集 image leaf */
export function walkBlocks(blocks: unknown, out: ImageRef[]): void {
  if (!Array.isArray(blocks)) return;
  for (const b of blocks) {
    if (!isRecord(b)) continue;
    if (b['type'] === 'image') {
      const c = copyAttachment(b['attachment']);
      if (c) out.push(c);
    } else if (b['type'] === 'tool-result' && Array.isArray(b['content'])) {
      walkBlocks(b['content'], out);
    }
  }
}

export function sessionIdOf(agent: unknown): string | undefined {
  try {
    if (isRecord(agent)) {
      const s = agent['session'];
      if (isRecord(s) && typeof s['id'] === 'string') return s['id'];
      if (typeof agent['id'] === 'string') return agent['id'];
    }
  } catch {
    /* ignore */
  }
  return undefined;
}

export interface ImageCache {
  push(sessionId: string, refs: ImageRef[]): void;
  get(sessionId: string): ImageRef[];
}

export function createImageCache(): ImageCache {
  const imageCache = new Map<string, ImageRef[]>();

  function push(sessionId: string, refs: ImageRef[]): void {
    if (typeof sessionId !== 'string' || sessionId.length === 0) return;
    if (!Array.isArray(refs) || refs.length === 0) return;
    let list = imageCache.get(sessionId);
    if (!list) {
      list = [];
      imageCache.set(sessionId, list);
    }
    for (const r of refs) list.push(r);
    while (list.length > MAX_PER_SESSION) list.shift();
    while (imageCache.size > MAX_SESSIONS) {
      const it = imageCache.keys().next();
      if (it.done) break;
      imageCache.delete(it.value);
    }
  }

  function get(sessionId: string): ImageRef[] {
    return imageCache.get(sessionId) ?? [];
  }

  return { push, get };
}
