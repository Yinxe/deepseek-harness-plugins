/**
 * 会话日志文件索引 —— 纯 node:fs，无外部依赖，可独立单测
 *
 * 原实现：dsh-token-stats/lib/fsindex.js（逐行对齐，仅加 TS 类型）
 *
 * 设计：每次 snapshot 只做一次目录遍历 + 每个日志文件一次 stat，
 * 索引条目直接携带 size/mtimeMs；指纹与排序复用条目，不再重复 stat。
 */
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

export interface FileIndexEntry {
  file: string;
  size: number;
  mtimeMs: number;
}

/**
 * 扫描 sessions 目录建立 sessionId → { file, size, mtimeMs } 索引。
 * 布局变化时返回空，调用方退化为全读。
 */
export function buildFileIndex(sessionsDir: string): Map<string, FileIndexEntry> {
  const idx = new Map<string, FileIndexEntry>();
  try {
    for (const entry of readdirSync(sessionsDir)) {
      const full = join(sessionsDir, entry);
      let st;
      try {
        st = statSync(full);
      } catch {
        continue;
      }
      if (!st.isDirectory()) continue;
      for (const sess of readdirSync(full)) {
        if (!sess.startsWith('session-')) continue;
        const file = join(full, sess, 'session.jsonl.zstd');
        try {
          const s = statSync(file);
          if (s.isFile()) idx.set(sess, { file, size: s.size, mtimeMs: s.mtimeMs });
        } catch {
          /* 无日志文件的会话跳过 */
        }
      }
    }
  } catch {
    /* sessions 目录不存在 → 空索引 */
  }
  return idx;
}

/** 日志文件指纹（size:mtime）；索引缺失时返回 null（调用方退化为重扫）。 */
export function fileFingerprint(index: Map<string, FileIndexEntry>, id: string): string | null {
  const e = index.get(id);
  if (e === undefined) return null;
  return e.size + ':' + Math.floor(e.mtimeMs);
}
