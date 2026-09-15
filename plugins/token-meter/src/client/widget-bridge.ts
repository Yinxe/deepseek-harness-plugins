/**
 * 小组件宿主桥（`@dshp/widget-kit`）的**纯逻辑**：id 编解码 + 标题表。
 *
 * 为什么单独一个文件：这里全是可离线自检的纯函数（`scripts/check-widget-bridge.mjs`），
 * 不 import React、不碰 DOM。React 那半边（注册、订阅、开关按钮）在 `widgets.tsx`。
 *
 * ## 为什么要编码 id
 *
 * 本插件的历史浮窗 id 是 `peak` / `stats:<kind>` / `quota:<vendorId>`（自己起的名字，随便写）。
 * 而 widget-kit 的 id 是有形状要求的（spec v1）：
 *
 * ```
 * /^[a-z0-9-]{2,32}:[a-z0-9-]{2,32}$/
 * ```
 *
 * 两处都对不上：`peak` 没有冒号；供应商 id 来自 settings.yaml（用户可写 `My_Vendor.2` 这种），
 * 冒号、下划线、大写全都不合法。所以进宿主前统一编码成 `token-meter:<suffix>`，
 * 而**本插件内部一律沿用旧 id**（布局记录、`HiddenWhenFloated`、各个 Section 的 props 都不动）。
 *
 * 编码必须**稳定**：宿主按 id 存卡片几何，id 一变就等于所有卡片位置被重置 —— 所以供应商那段用
 * `slug + 原串哈希`，同一个供应商 id 永远得到同一个宿主 id，且不同原串几乎不可能撞车。
 *
 * @module @dshp/token-meter/client/widget-bridge
 */

/** 宿主 id 的 owner 段（widget-kit 从 `:` 前推导 owner，也是设置页列表里的归属）。 */
export const WK_OWNER = 'token-meter';

/** 宿主 id 形状（与 `@dshp/widget-kit` spec v1 的 `WIDGET_ID_PATTERN` 同形）。 */
export const WK_ID_PATTERN = /^[a-z0-9-]{2,32}:[a-z0-9-]{2,32}$/;

/** 宿主 id 的 suffix 段上限（`^...[a-z0-9-]{2,32}$`）。 */
const SUFFIX_MAX = 32;

/** 供应商 slug 的长度上限（给哈希留位置：`quota-` + slug + `-` + 4 位哈希 ≤ 32）。 */
const SLUG_MAX = 20;

/** 统计小组件的种类（与中心区工具条上的按钮一一对应）。 */
export const STATS_KINDS = ['cards', 'trend', 'heat', 'donut', 'today'] as const;

/** 统计小组件种类。 */
export type StatsKind = (typeof STATS_KINDS)[number];

/** 统计小组件的标题（宿主卡片标题栏与托盘菜单都读它）。 */
export const STATS_TITLES: Record<StatsKind, string> = {
  cards: '指标卡',
  trend: '用量趋势',
  heat: '用量热力',
  donut: '模型分布',
  today: '今日消耗',
};

/** 峰谷显示器的 legacy id（没有冒号，是唯一一个「单段」id）。 */
export const PEAK_ID = 'peak';

/** 峰谷显示器的标题。 */
export const PEAK_TITLE = '峰谷定价';

/** 供应商小组件的 legacy id 前缀。 */
export const QUOTA_PREFIX = 'quota:';

/** 统计小组件的 legacy id 前缀。 */
export const STATS_PREFIX = 'stats:';

/**
 * 判断一个 legacy id 是否属于本插件的小组件。
 *
 * 未知 id 一律 `false`：宿主里可能残留别的插件（或本插件旧版本）的 id，
 * 不能拿它们去注册。
 *
 * @param id - legacy id（`peak` / `stats:trend` / `quota:deepseek`）。
 * @returns 是本插件的小组件为 `true`。
 */
export function isFloatId(id: string): boolean {
  if (typeof id !== 'string' || id === '') return false;
  if (id === PEAK_ID) return true;
  if (id.startsWith(STATS_PREFIX)) {
    return (STATS_KINDS as readonly string[]).includes(id.slice(STATS_PREFIX.length));
  }
  if (id.startsWith(QUOTA_PREFIX)) return id.length > QUOTA_PREFIX.length;
  return false;
}

/**
 * 稳定短哈希（FNV-1a → base36，取 4 位）。
 *
 * 只用来给「同一个供应商 id」在宿主里定一个稳定后缀，不做安全用途。
 *
 * @param text - 原串。
 * @returns 4 位 `[0-9a-z]`。
 */
export function hash32(text: string): string {
  let h = 0x81_1c_9d_c5;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01_00_01_93) >>> 0;
  }
  return h.toString(36).padStart(4, '0').slice(0, 4);
}

/**
 * 供应商 id → 合法 slug（小写、非字母数字压成 `-`、去首尾 `-`、截断）。
 *
 * @param vendorId - settings.yaml 里的供应商 id（用户可写任意字符）。
 * @returns 只含 `[a-z0-9-]` 的非空片段。
 */
export function slugifyVendor(vendorId: string): string {
  const slug = String(vendorId)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+/, '')
    .slice(0, SLUG_MAX)
    .replace(/-+$/, '');
  return slug === '' ? 'v' : slug;
}

/**
 * legacy id → 宿主 id。
 *
 * 映射（`token-meter` 前缀恒定）：
 *
 * | legacy           | 宿主 id                                |
 * | ---------------- | -------------------------------------- |
 * | `peak`           | `token-meter:peak`                     |
 * | `stats:<kind>`   | `token-meter:stats-<kind>`             |
 * | `quota:<vid>`    | `token-meter:quota-<slug>-<hash4>`     |
 * | 其它             | `token-meter:x-<hash4>`（保底合法）    |
 *
 * @param legacy - legacy id。
 * @returns 合法的宿主 id（一定匹配 `WK_ID_PATTERN`）。
 */
export function encodeFloatId(legacy: string): string {
  let suffix: string;
  if (legacy === PEAK_ID) {
    suffix = 'peak';
  } else if (legacy.startsWith(STATS_PREFIX)) {
    const kind = legacy.slice(STATS_PREFIX.length);
    suffix = (STATS_KINDS as readonly string[]).includes(kind) ? `stats-${kind}` : `stats-x-${hash32(kind)}`;
  } else if (legacy.startsWith(QUOTA_PREFIX)) {
    const vendorId = legacy.slice(QUOTA_PREFIX.length);
    suffix = `quota-${slugifyVendor(vendorId)}-${hash32(vendorId)}`;
  } else {
    suffix = `x-${hash32(legacy)}`;
  }
  return `${WK_OWNER}:${suffix.slice(0, SUFFIX_MAX)}`;
}

/**
 * 宿主 id → legacy id（**只对静态族可解**：`peak` 与 `stats-*`）。
 *
 * 供应商那段故意不反解：`slug` 是单向的（`My_Vendor` 与 `my-vendor` 会撞成同一个 slug），
 * 反解会得到错的供应商 id。运行时用 `widgets.tsx` 里的正反向映射表，不靠猜。
 *
 * @param wkId - 宿主 id。
 * @returns 对应的 legacy id；不属于静态族时为 `null`。
 */
export function decodeFloatId(wkId: string): string | null {
  const sep = wkId.indexOf(':');
  if (sep < 0 || wkId.slice(0, sep) !== WK_OWNER) return null;
  const suffix = wkId.slice(sep + 1);
  if (suffix === 'peak') return PEAK_ID;
  if (suffix.startsWith('stats-')) {
    const kind = suffix.slice('stats-'.length);
    return (STATS_KINDS as readonly string[]).includes(kind) ? STATS_PREFIX + kind : null;
  }
  return null;
}

/**
 * 小组件标题。
 *
 * @param legacy - legacy id。
 * @param hint - 调用方给的更具体的名字（供应商名等）；空串/undefined 时用默认表。
 * @returns 人类可读标题。
 */
export function floatTitle(legacy: string, hint?: string | undefined): string {
  if (hint !== undefined && hint !== '') return hint;
  if (legacy === PEAK_ID) return PEAK_TITLE;
  if (legacy.startsWith(STATS_PREFIX)) {
    const kind = legacy.slice(STATS_PREFIX.length) as StatsKind;
    return STATS_TITLES[kind] ?? '用量统计';
  }
  if (legacy.startsWith(QUOTA_PREFIX)) {
    const vendorId = legacy.slice(QUOTA_PREFIX.length);
    return vendorId === '' ? '供应商额度' : `额度 · ${vendorId}`;
  }
  return '小组件';
}

/* ─────────────────────────────── 每张卡的初始尺寸 ─────────────────────────────── */

/** 一张卡片进宿主时的初始 / 最小尺寸（外层 px：含框架标题栏与内容内边距）。 */
export interface FloatSize {
  defaultSize: { w: number; h: number };
  minSize: { w: number; h: number };
}

/** 尺寸表的键：按「内容形状」分组，不是按 id（同一族的卡片共用一套）。 */
export type FloatFamily = StatsKind | 'peak' | 'quota';

/** 框架地板（`@dshp/widget-kit` spec v1 的 `cardFloorSize`）：minSize 不得低于它，否则注册被拒。 */
export const WK_CARD_FLOOR = { w: 240, h: 140 } as const;

/**
 * **每张卡各自的初始尺寸**（一张总表，改尺寸只改这里）。
 *
 * 为什么不能一套尺寸打天下：这些小组件的内容形状差得很远 ——
 * 热力图是「宽而扁」的周 × 日网格，给它 240 高度纯属浪费；模型分布是圆环 + 多列列表，
 * 矮了会把列表压成滚动条；今日消耗只有一张卡，天生就该小。
 *
 * 宽度按 `styles.module.css` 里的容器查询断点挑（`@container tm (max-width: 300px / 340 / 420 / 480)`）：
 * 取到断点之上，内容才是「宽屏那套排版」，而不是把窄屏排版塞进一个宽窗里。
 *
 * | 族        | 初始        | 最小        | 依据                                                       |
 * | --------- | ----------- | ----------- | ---------------------------------------------------------- |
 * | `cards`   | 460 × 360   | 300 × 220   | 指标卡 3 列 `minmax(148px)` 网格 + 三段（全量/可视化/构成） |
 * | `trend`   | 520 × 320   | 340 × 200   | 折线图：横向空间直接决定可读性                              |
 * | `heat`    | 560 × 230   | 360 × 170   | 周 × 日热力网格**宽而扁**，不需要高度                       |
 * | `donut`   | 460 × 420   | 320 × 320   | 圆环 + 多列模型列表；窄于 480 会塌成一列，底部必须留高       |
 * | `today`   | 320 × 200   | 260 × 150   | 单张「今日消耗」卡，天生小                                  |
 * | `peak`    | 440 × 200   | 320 × 160   | 一行峰谷标题 + 24 小时色带 + 两行说明                       |
 * | `quota`   | 400 × 320   | 320 × 220   | 供应商标题行（名称 / 徽标 / 三个按钮）+ 若干窗口进度条        |
 */
export const FLOAT_SIZES: Record<FloatFamily, FloatSize> = {
  cards: { defaultSize: { w: 460, h: 360 }, minSize: { w: 300, h: 220 } },
  trend: { defaultSize: { w: 520, h: 320 }, minSize: { w: 340, h: 200 } },
  heat: { defaultSize: { w: 560, h: 230 }, minSize: { w: 360, h: 170 } },
  donut: { defaultSize: { w: 460, h: 420 }, minSize: { w: 320, h: 320 } },
  today: { defaultSize: { w: 320, h: 200 }, minSize: { w: 260, h: 150 } },
  peak: { defaultSize: { w: 440, h: 200 }, minSize: { w: 320, h: 160 } },
  quota: { defaultSize: { w: 400, h: 320 }, minSize: { w: 320, h: 220 } },
};

/**
 * legacy id → 尺寸族。
 *
 * 未知 id 归到 `cards`（保守：最宽松的那套），不会因为少写一个分支就没有尺寸。
 *
 * @param legacy - legacy id。
 * @returns 尺寸族。
 */
export function floatFamily(legacy: string): FloatFamily {
  if (legacy === PEAK_ID) return 'peak';
  if (legacy.startsWith(QUOTA_PREFIX)) return 'quota';
  if (legacy.startsWith(STATS_PREFIX)) {
    const kind = legacy.slice(STATS_PREFIX.length) as StatsKind;
    if ((STATS_KINDS as readonly string[]).includes(kind)) return kind;
  }
  return 'cards';
}

/**
 * legacy id → 该卡的初始 / 最小尺寸。
 *
 * @param legacy - legacy id。
 * @returns 尺寸（每次返回同一个对象，调用方不要改它）。
 */
export function floatSize(legacy: string): FloatSize {
  return FLOAT_SIZES[floatFamily(legacy)];
}
