/**
 * 统计引擎：会话列表 → 指纹缓存（storageDomain 持久化）→ 后台分批渐进扫描 → 合并快照
 *
 * 原实现：dsh-token-stats/lib/engine.js（逻辑逐行对齐，仅两处适配）：
 *  1. 去掉 `zod` / `@deepseek-ai/dsh-storage-domain` 运行时导入（运行时零依赖红线）：
 *     本文件自带最小 `defineDomain` / `domainTable` 垫片（仅校验名/版本/表名，
 *     形状与官方一致）+ 手写 `parseCachedSession`（等价 zod schema 的 parse 语义，
 *     非法即抛 invalid-record，触发同样的降级路径）。缓存域名保持 `token_stats`
 *     （改名会废掉已有缓存触发全量重扫），不随新 NS 改名。
 *  2. 加 TS 类型；其余后台泵/指纹/合并/降级策略与原版 100% 对齐。
 *
 * 两级性能：
 *  1. 持久化聚合缓存（$DSH_HOME/storages/token_stats.json）——每会话聚合结果按
 *     「日志文件 size+mtime 指纹」缓存；重启后指纹命中零重算。活跃（live）会话
 *     不走指纹快路径——事件监听负责失效，永远实时。
 *  2. 后台异步分批扫描——每批 8 个会话，批间 setImmediate 让出事件循环；
 *     快照返回渐进状态（scanned/total），页面轮询逐步补全。
 */
import { join } from 'node:path';
import { compactAgg, foldSession, reviveAgg } from './fold.js';
import type { CompactAgg, FoldBucket, FoldPeak } from './fold.js';
import { buildFileIndex, fileFingerprint } from './fsindex.js';
import { withTimeout } from './async.js';
import type { AnyCtx, StatsRecord, StatsSnapshot } from '../types.js';

/** 后台每批扫描的会话数。 */
const BATCH_SIZE = 8;
/** 单会话读取失败的最大重试次数，超过则跳过并计入 errors。 */
const MAX_ATTEMPTS = 3;
/** 单会话读取超时（防个别会话卡住钉死后台泵 → partial 永真 → 前端空转）。 */
const READ_TIMEOUT_MS = 20000;

// ── domain 垫片（零依赖版 defineDomain/domainTable，形状与官方一致）────────
// 官方实现见 @deepseek-ai/dsh-storage-domain：defineDomain 仅校验名/版本/表名，
// domainTable 仅包一层 { valueSchema }；运行时校验走 valueSchema.parse(raw)。
// 这里用手写 parse 代替 zod schema，语义等价（非法即抛，触发 invalid-record 降级）。

const UNIT_NAME_RE = /^[a-z][a-z0-9_]*$/;

interface ValueSchema {
  parse: (raw: unknown) => CachedSession;
}

function domainTable(schema: ValueSchema): { valueSchema: ValueSchema } {
  return { valueSchema: schema };
}

function defineDomain<T extends { name: string; version: number; tables: Record<string, unknown> }>(
  spec: T,
): T {
  if (!UNIT_NAME_RE.test(spec.name))
    throw new Error(`domain name '${spec.name}' must match ${String(UNIT_NAME_RE)}`);
  if (!Number.isInteger(spec.version) || spec.version < 0)
    throw new Error(`domain '${spec.name}' version must be a non-negative integer, got ${spec.version}`);
  for (const table of Object.keys(spec.tables))
    if (!UNIT_NAME_RE.test(table))
      throw new Error(`domain '${spec.name}' table name '${table}' must match ${String(UNIT_NAME_RE)}`);
  return spec;
}

// ── 缓存记录校验（等价原 zod cachedSessionSchema 的 parse 语义）────────────

interface CachedSession extends CompactAgg {
  fp: string;
  skip: number;
  v?: number;
}

function isNonNegInt(v: unknown): v is number {
  return typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= Number.MAX_SAFE_INTEGER;
}

function parseBucket(raw: unknown): FoldBucket {
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('invalid bucket');
  const r = raw as Record<string, unknown>;
  if (typeof r['d'] !== 'string' || (r['d'] as string).length < 1) throw new Error('invalid bucket.d');
  if (typeof r['m'] !== 'string' || (r['m'] as string).length < 1) throw new Error('invalid bucket.m');
  if (!isNonNegInt(r['h'])) throw new Error('invalid bucket.h');
  for (const k of ['i', 'o', 'cr', 'cw', 'n'] as const) {
    if (!isNonNegInt(r[k])) throw new Error('invalid bucket.' + k);
  }
  return {
    d: r['d'] as string,
    h: r['h'] as number,
    m: r['m'] as string,
    i: r['i'] as number,
    o: r['o'] as number,
    cr: r['cr'] as number,
    cw: r['cw'] as number,
    n: r['n'] as number,
  };
}

const cachedSessionSchema: ValueSchema = {
  parse(raw: unknown): CachedSession {
    if (raw === null || typeof raw !== 'object' || Array.isArray(raw))
      throw new Error('invalid-record: not object');
    const r = raw as Record<string, unknown>;
    if (typeof r['fp'] !== 'string' || (r['fp'] as string).length < 1) throw new Error('invalid-record: fp');
    if (!isNonNegInt(r['skip'])) throw new Error('invalid-record: skip');
    if (r['v'] !== undefined && !(typeof r['v'] === 'number' && Number.isInteger(r['v'] as number)))
      throw new Error('invalid-record: v');
    if (!Array.isArray(r['r'])) throw new Error('invalid-record: r');
    const buckets: Array<[string, FoldBucket]> = [];
    for (const entry of r['r'] as unknown[]) {
      if (!Array.isArray(entry) || entry.length !== 2) throw new Error('invalid-record: r entry');
      const k = entry[0];
      if (typeof k !== 'string' || k.length < 1) throw new Error('invalid-record: r key');
      buckets.push([k, parseBucket(entry[1])]);
    }
    let p: FoldPeak | null = null;
    if (r['p'] !== null && r['p'] !== undefined) {
      const pr = r['p'] as Record<string, unknown>;
      if (typeof pr !== 'object' || Array.isArray(pr)) throw new Error('invalid-record: p');
      if (!isNonNegInt(pr['tokens'])) throw new Error('invalid-record: p.tokens');
      if (typeof pr['d'] !== 'string' || (pr['d'] as string).length < 1)
        throw new Error('invalid-record: p.d');
      if (typeof pr['model'] !== 'string' || (pr['model'] as string).length < 1)
        throw new Error('invalid-record: p.model');
      p = { tokens: pr['tokens'] as number, d: pr['d'] as string, model: pr['model'] as string };
    }
    const f = r['f'] as unknown;
    const l = r['l'] as unknown;
    if (f !== null && typeof f !== 'string') throw new Error('invalid-record: f');
    if (l !== null && typeof l !== 'string') throw new Error('invalid-record: l');
    if (typeof r['u'] !== 'boolean') throw new Error('invalid-record: u');
    return {
      fp: r['fp'] as string,
      skip: r['skip'] as number,
      ...(r['v'] !== undefined ? { v: r['v'] as number } : {}),
      r: buckets,
      p,
      f: (f as string | null) ?? null,
      l: (l as string | null) ?? null,
      u: r['u'] as boolean,
    };
  },
};

/** token-stats 持久化缓存域：sessions 表，key = sessionId（域名保持不变）。 */
export const tokenStatsDomainSpec = defineDomain({
  name: 'token_stats',
  version: 0,
  tables: { sessions: domainTable(cachedSessionSchema) },
});

/**
 * readSession 快照 → 可信的种子跳过数。
 */
function clampSkip(inheritedEventCount: unknown, events: unknown): number {
  const n = typeof inheritedEventCount === 'number' ? Math.floor(inheritedEventCount) : NaN;
  if (!Number.isSafeInteger(n) || n < 0) return 0;
  const len = Array.isArray(events) ? events.length : 0;
  return n > len ? len : n;
}

export interface SessionQueryLike {
  listSessions: () => Promise<Array<{ header?: unknown; live?: unknown }>>;
  readSession: (
    id: string,
  ) => Promise<{ inheritedEventCount?: unknown; events?: unknown[] } & Record<string, unknown>>;
}

export interface Engine {
  invalidate: (sessionId: string) => void;
  snapshot: () => Promise<StatsSnapshot>;
  start: () => void;
  drain: () => Promise<void>;
  dispose: () => Promise<void>;
}

/**
 * 创建统计引擎。
 */
export function createEngine(
  sessionQuery: SessionQueryLike,
  dshHome: string,
  storageDomain: AnyCtx | null,
): Engine {
  const sessionsDir = join(dshHome, 'sessions');

  const aggMemo = new Map<string, ReturnType<typeof foldSession>>();
  const fpMemo = new Map<string, string>();
  const dirty = new Set<string>();
  const attempts = new Map<string, number>();
  const errored = new Set<string>();
  let queue: Array<{ id: string; mtime: number }> = [];
  let pumping = false;
  let listedIds = new Set<string>();
  let currentIndex = buildFileIndex(sessionsDir);

  let storageOk = true;
  let storageWarned = false;
  const noteStorageError = (label: string, error: unknown): void => {
    storageOk = false;
    const msg = label + ': ' + String((error as Error)?.message ?? error);
    void msg;
    if (!storageWarned) {
      storageWarned = true;
      try {
        console.warn(
          '[dshp-token-meter] storage domain ' + msg + ' — 缓存持久化不可用，统计仍正常运行（仅重启后重扫）',
        );
      } catch {
        /* ignore */
      }
    }
  };

  /** 空表桩：降级模式下的 no-op 写入面。 */
  const nullTable = {
    get: (_k: string): undefined => undefined,
    put: async (_k: string, _v: unknown): Promise<void> => {},
  };

  let openAttempt = 0;
  const openDomain = (): Promise<{ table: AnyCtx; close: () => Promise<void>; degraded?: boolean }> => {
    if (!storageDomain || typeof storageDomain.open !== 'function') {
      noteStorageError('open failed', new Error('storageDomain 服务不可用'));
      return Promise.resolve({ table: nullTable, close: async () => {}, degraded: true });
    }
    return storageDomain
      .open(tokenStatsDomainSpec)
      .then((domain: AnyCtx) => {
        storageOk = true;
        storageWarned = false;
        return { table: domain.table('sessions'), close: () => domain.close() };
      })
      .catch((error: unknown) => {
        noteStorageError('open failed', error);
        return { table: nullTable, close: async () => {}, degraded: true };
      });
  };

  let tableReady = openDomain();

  /** 事件失效：只标记，下次 snapshot 处理。 */
  function invalidate(sessionId: string): void {
    if (typeof sessionId === 'string') {
      dirty.add(sessionId);
      errored.delete(sessionId);
      attempts.delete(sessionId);
    }
  }

  /** 后台泵：分批扫描队列，批间让出事件循环。 */
  async function pump(): Promise<void> {
    if (pumping) return;
    pumping = true;
    try {
      while (queue.length > 0) {
        const batch = queue.splice(0, BATCH_SIZE);
        const tbl = await tableReady;
        await Promise.all(
          batch.map(async (job) => {
            try {
              const snap = await withTimeout(
                sessionQuery.readSession(job.id),
                READ_TIMEOUT_MS,
                'readSession ' + job.id,
              );
              const skip = clampSkip(
                (snap as { inheritedEventCount?: unknown })?.inheritedEventCount,
                (snap as { events?: unknown })?.events,
              );
              const agg = foldSession(((snap as { events?: [] })?.events as []) || [], skip);
              aggMemo.set(job.id, agg);
              attempts.delete(job.id);
              errored.delete(job.id);
              dirty.delete(job.id);
              const fp = fileFingerprint(currentIndex, job.id);
              if (fp !== null) {
                fpMemo.set(job.id, fp);
                try {
                  await tbl.table.put(job.id, { fp, skip, v: 1, ...compactAgg(agg) });
                } catch (error) {
                  noteStorageError('put failed', error);
                }
              }
            } catch {
              const n = (attempts.get(job.id) || 0) + 1;
              attempts.set(job.id, n);
              if (n >= MAX_ATTEMPTS) {
                aggMemo.set(job.id, { records: new Map(), peak: null, first: null, last: null, used: false });
                errored.add(job.id);
              }
            }
          }),
        );
        if (queue.length > 0) await new Promise((resolve) => setImmediate(resolve));
      }
    } finally {
      pumping = false;
    }
  }

  /**
   * 汇总快照：列出全部会话 → 增量判定（指纹缓存/事件失效）→ 后台泵扫 →
   * 合并当前已物化结果。可随时调用，返回当前渐进状态。
   */
  async function snapshot(): Promise<StatsSnapshot> {
    await maybeReopenStorage();
    const list = await sessionQuery.listSessions();
    listedIds = new Set<string>();
    const jobs: Array<{ id: string; mtime: number }> = [];
    let scanned = 0;

    currentIndex = buildFileIndex(sessionsDir);

    for (const rec of list) {
      const header = (rec && (rec as { header?: unknown }).header) as
        Record<string, unknown> | null | undefined;
      if (header === null || typeof header !== 'object') continue;
      const id = (header as Record<string, unknown>)['id'];
      if (typeof id !== 'string') continue;
      listedIds.add(id);

      const live = (rec as { live?: unknown }).live === true;
      const isDirty = dirty.has(id);

      let need = false;
      const entry = currentIndex.get(id);
      const mtime = entry === undefined ? 0 : entry.mtimeMs;

      if (live) {
        need = isDirty || !aggMemo.has(id);
      } else {
        const fp = fileFingerprint(currentIndex, id);
        if (isDirty || !aggMemo.has(id)) {
          let hit: CachedSession | undefined;
          try {
            hit = (await tableReady).table.get(id) as CachedSession | undefined;
          } catch {
            hit = undefined;
          }
          if (!isDirty && hit !== undefined && hit.fp === fp && hit.v === 1) {
            aggMemo.set(id, reviveAgg(hit));
            if (fp !== null) fpMemo.set(id, fp);
            dirty.delete(id);
          } else {
            need = true;
          }
        } else if (fp !== null && fpMemo.get(id) !== fp) {
          need = true;
        }
      }

      if (need && !errored.has(id)) {
        const job = { id, mtime };
        if (isDirty) job.mtime = Infinity;
        jobs.push(job);
      }
      if (aggMemo.has(id)) scanned++;
    }

    jobs.sort((a, b) => b.mtime - a.mtime);
    if (jobs.length > 0) {
      const queued = new Set(queue.map((j) => j.id));
      for (const j of jobs) {
        if (!queued.has(j.id)) {
          queued.add(j.id);
          queue.push(j);
        }
      }
      queue.sort((a, b) => b.mtime - a.mtime);
      void pump();
    }

    const merged = new Map<string, StatsRecord>();
    const models: Record<string, { provider: string; model: string }> = {};
    const daySessions: Record<string, number> = {};
    let peak: FoldPeak | null = null;
    let first: string | null = null;
    let last: string | null = null;
    let active = 0;

    for (const id of listedIds) {
      const agg = aggMemo.get(id);
      if (agg === undefined) continue;
      if (agg.used) {
        active++;
        const days = new Set<string>();
        for (const r of agg.records.values()) days.add(r.d);
        for (const d of days) daySessions[d] = (daySessions[d] || 0) + 1;
      }
      for (const r of agg.records.values()) {
        const k = r.d + '|' + r.h + '|' + r.m;
        let m = merged.get(k);
        if (m === undefined) {
          m = { d: r.d, h: r.h, m: r.m, i: 0, o: 0, cr: 0, cw: 0, n: 0 };
          merged.set(k, m);
        }
        m.i += r.i;
        m.o += r.o;
        m.cr += r.cr;
        m.cw += r.cw;
        m.n += r.n;
        if (models[r.m] === undefined) {
          const slash = r.m.indexOf('/');
          models[r.m] =
            slash > 0
              ? { provider: r.m.slice(0, slash), model: r.m.slice(slash + 1) }
              : { provider: 'unknown', model: r.m };
        }
      }
      if (agg.peak !== null && (peak === null || agg.peak.tokens > peak.tokens)) peak = agg.peak;
      if (agg.first !== null && (first === null || agg.first < first)) first = agg.first;
      if (agg.last !== null && (last === null || agg.last > last)) last = agg.last;
    }

    for (const id of aggMemo.keys()) {
      if (listedIds.has(id)) continue;
      aggMemo.delete(id);
      fpMemo.delete(id);
      attempts.delete(id);
      errored.delete(id);
      dirty.delete(id);
      try {
        const t = await tableReady;
        if (t.table !== nullTable && typeof t.table.delete === 'function') await t.table.delete(id);
      } catch {
        /* 缓存清理失败不影响统计 */
      }
    }

    const records = Array.from(merged.values());
    records.sort((a, b) => (a.d < b.d ? -1 : a.d > b.d ? 1 : a.h - b.h));

    const total = listedIds.size;
    return {
      ready: true,
      records,
      models,
      daySessions,
      peakStep: peak,
      range: first === null ? null : { first, last: last as string },
      sessions: total,
      active,
      partial: total - scanned > 0,
      scanned,
      total,
      errors: errored.size,
      storage: storageOk ? 'ok' : 'disabled',
      generatedAt: Date.now(),
    };
  }

  /** 启动即开始后台扫描（不阻塞启动）。 */
  function start(): void {
    const t = setTimeout(() => {
      void snapshot().catch(() => {});
    }, 100);
    if (typeof (t as { unref?: () => void }).unref === 'function')
      (t as unknown as { unref: () => void }).unref();
  }

  /** 等待后台队列清空（测试用）。 */
  async function drain(): Promise<void> {
    for (;;) {
      if (!pumping && queue.length === 0) break;
      await new Promise((resolve) => setImmediate(resolve));
    }
    await tableReady;
    await new Promise((resolve) => setImmediate(resolve));
  }

  /** 插件卸载：关闭域。 */
  async function dispose(): Promise<void> {
    try {
      const t = await tableReady;
      await t.close();
    } catch {
      /* 域未开成功则无需关闭 */
    }
  }

  async function maybeReopenStorage(): Promise<void> {
    if (storageOk) return;
    openAttempt++;
    if (openAttempt % 5 !== 0) return;
    const prev = await tableReady;
    if ((prev as { degraded?: boolean }).degraded === true) tableReady = openDomain();
  }

  return { invalidate, snapshot, start, drain, dispose };
}
