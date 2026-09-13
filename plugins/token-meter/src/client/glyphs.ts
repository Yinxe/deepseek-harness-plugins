/**
 * 语义图标集（纯 SVG 线性风格，零依赖）
 *
 * 与 icons.ts 的分工：那边的四个是**导航图标**（左侧菜单）；这里是**数据语义图标**——
 * 每个指标/图表一个，用来在卡片标题与指标卡上表达「这块讲的是什么」。
 *
 * 同一套 path 在两处复用：
 *  1. `Glyph` 小尺寸（13~14px）画在指标标签前 / 图表标题前；
 *  2. 同一个名字放大成 58px 画在指标卡右下角当**水印底纹**（.tm-stat-bg，低透明度），
 *     让卡片底色带一点与数据意境相符的图形，而不是纯色块。
 *
 * 约定与导航图标一致：viewBox 固定 0 0 24 24、颜色走 currentColor、线性描边圆帽，
 * 与 DSH 官方图标观感统一。名字按语义取，不按外观取。
 */
import type { AnyReact } from './types.js';

export interface GlyphProps {
  /** 语义名（见 GLYPHS）；未知名回退成一个圆点，不会崩 */
  name: string;
  size?: number;
  className?: string;
}

export function svgAttrs(props: { size?: number; className?: string }): Record<string, unknown> {
  const size = props && props.size ? props.size : 16;
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    className: (props && props.className) || undefined,
    'aria-hidden': 'true',
    focusable: 'false',
  };
}

export type Attrs = Record<string, string | number>;
export type El = [string, Attrs];

const S = (d: string, extra?: Attrs): El => ['path', extra ? { d, ...extra } : { d }];
const C = (cx: number, cy: number, r: number, extra?: Attrs): El => [
  'circle',
  extra ? { cx, cy, r, ...extra } : { cx, cy, r },
];

/**
 * 语义名 → 图形元素。命名对照见每条的注释（用在哪些卡片上）。
 * 全部只用 path / circle / line，描边式，保证放大成水印后依然干净。
 */
const GLYPHS: Record<string, El[]> = {
  /* ── 用量统计 · 基础数据 ─────────────────────────────────────────── */
  /** 累计 Token：三层堆叠（"攒起来的量"） */
  layers: [
    S('M12 3.4 20.6 8 12 12.6 3.4 8z'),
    S('m3.4 12.4 8.6 4.6 8.6-4.6'),
    S('m3.4 16.6 8.6 4.6 8.6-4.6'),
  ],
  /** 近 30 天走势：坐标轴 + 折线 */
  trend: [S('M3.6 3.6v16.8h16.8'), S('m6.6 15.4 4-4.6 3.4 2.8 4.8-6.2')],
  /** 缓存 Token：数据库圆柱 */
  database: [
    S('M4 6.6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3z'),
    S('M4 6.6v10.8c0 1.7 3.6 3 8 3s8-1.3 8-3V6.6'),
    S('M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3'),
  ],
  /** 峰值单次请求：闪电 */
  bolt: [S('M13.4 2.6 4.6 13.8h5.8l-1.8 7.6 8.6-11.2h-5.8z')],
  /** 峰值单日：山与旗 */
  mountain: [
    S('M2.8 19.4h18.4'),
    S('m4.6 19.4 5.2-8.6 3.4 4.6 2.2-2.6 4 6.6'),
    S('M12.6 4.6h3.6l-1 1.8 1 1.8h-3.6z'),
  ],
  /** 日均消耗：基准线 + 起伏 */
  wave: [S('M3.4 19.4h17.2'), S('M3.4 13.4c2.4-5.4 4.8-5.4 7.2 0s4.8 5.4 7.2 0')],
  /** 日消耗中位数：数据点 + 中位线 */
  median: [S('M3.4 19.4h17.2'), S('M12 6.4v13', { strokeDasharray: '2.4 2.4' }), C(12, 4.2, 1.9)],
  /** 当前连续使用：火苗 */
  flame: [
    S(
      'M12 2.8c3.4 4.2 6.4 7 6.4 10.9a6.4 6.4 0 0 1-12.8 0c0-2.1 1-3.5 2.2-4.7.5 1.3 1.3 2.1 2.3 2.3-.6-2.7-.2-5.8 1.9-8.5z',
    ),
  ],
  /** 最长连续使用：奖杯 */
  trophy: [
    S('M8 3.8h8v5a4 4 0 0 1-8 0z'),
    S('M8 5.4H4.8a3.2 3.2 0 0 0 3.3 3'),
    S('M16 5.4h3.2a3.2 3.2 0 0 1-3.3 3'),
    S('M12 12.8v3.6'),
    S('M8.6 19.8h6.8l-.7-3.4H9.3z'),
  ],
  /** 活跃天数：日历 */
  calendar: [
    S('M3.6 5.6h16.8v14.4H3.6z'),
    S('M3.6 10.2h16.8'),
    S('M8 3.4v4'),
    S('M16 3.4v4'),
    S('M7.4 14.2h2.2'),
    S('M14.4 14.2h2.2'),
  ],
  /** 模型调用次数 / 模型生成：芯片 */
  chip: [
    S('M7.4 7.4h9.2v9.2H7.4z'),
    S('M10.4 3.8v3.6'),
    S('M13.6 3.8v3.6'),
    S('M10.4 16.6v3.6'),
    S('M13.6 16.6v3.6'),
    S('M3.8 10.4h3.6'),
    S('M3.8 13.6h3.6'),
    S('M16.6 10.4h3.6'),
    S('M16.6 13.6h3.6'),
  ],
  /** 首次使用：旗杆 */
  flag: [S('M6 3.4v17.2'), S('M6 4.6h11.6l-2.7 4 2.7 4H6z')],
  /** 最近使用 / 在线时长：时钟 */
  clock: [C(12, 12, 8.4), S('M12 7.4V12l3.3 2')],

  /* ── 在线统计 ─────────────────────────────────────────────────────── */
  /** 今日在线：太阳 */
  sun: [
    C(12, 12, 4.2),
    S('M12 2.6v2.4'),
    S('M12 19v2.4'),
    S('M2.6 12H5'),
    S('M19 12h2.4'),
    S('m5.4 5.4 1.7 1.7'),
    S('m16.9 16.9 1.7 1.7'),
    S('m18.6 5.4-1.7 1.7'),
    S('m7.1 16.9-1.7 1.7'),
  ],
  /** 累计在线：沙漏 */
  hourglass: [S('M6.6 3.2h10.8v3L13 12l4.4 5.8v3H6.6v-3L11 12 6.6 6.2z'), S('M6.6 3.2h10.8')],
  /** 对话进行中：对话气泡 */
  bubble: [S('M3.6 5.8h16.8v10.6h-7.6L8.4 20.4v-4H3.6z')],
  /** 工具执行：终端提示符 */
  terminal: [S('M3.6 4.4h16.8v15.2H3.6z'), S('m7.4 9.8 2.7 2.7-2.7 2.7'), S('M13 15.2h4.2')],
  /** 引擎合计：齿轮 */
  gear: [
    C(12, 12, 7.2),
    C(12, 12, 3),
    S('M12 2.8v2'),
    S('M12 19.2v2'),
    S('M2.8 12h2'),
    S('M19.2 12h2'),
    S('m5.5 5.5 1.4 1.4'),
    S('m17.1 17.1 1.4 1.4'),
    S('m18.5 5.5-1.4 1.4'),
    S('m6.9 17.1-1.4 1.4'),
  ],

  /* ── 图表卡标题 ───────────────────────────────────────────────────── */
  /** Token 活动热力图：九宫格 */
  grid: [S('M3.6 3.6h7v7h-7z'), S('M13.4 3.6h7v7h-7z'), S('M3.6 13.4h7v7h-7z'), S('M13.4 13.4h7v7h-7z')],
  /** 模型用量分布：圆环 */
  donut: [C(12, 12, 8.4), C(12, 12, 4.2)],
  /** 每日在线：柱状 */
  chartBar: [S('M2.8 20.4h18.4'), S('M5 20.4V11'), S('M10 20.4V6.2'), S('M15 20.4v-6.6'), S('M20 20.4V9.4')],
  /** 每日在线排行：榜单条 */
  list: [S('M4 6.6h16'), S('M4 12h11.6'), S('M4 17.4h7.2')],
  /** 分享卡上的作者位：头像剪影 */
  user: [C(12, 8.6, 3.6), S('M4.8 20.4c1.3-4 3.9-6 7.2-6s5.9 2 7.2 6')],
  /** 口径与准确性：同心靶 */
  target: [C(12, 12, 8.4), C(12, 12, 4.6), C(12, 12, 1.4, { fill: 'currentColor', stroke: 'none' })],
};

/** 未知名回退：一个圆点，保证不会因为拼错名字而崩或空白 */
const FALLBACK: El[] = [C(12, 12, 3)];

/** 原始图元（分享面板把图标内联进同一张 <svg> 时需要 path 数据本身，而不是嵌套组件） */
export function glyphElements(name: string): El[] {
  return GLYPHS[name] || FALLBACK;
}

export function createGlyphs(React: AnyReact): {
  Glyph: (props: GlyphProps) => any;
  /** 语义名是否存在（写测试/校验用） */
  hasGlyph: (name: string) => boolean;
  names: string[];
} {
  const h = React.createElement;
  function Glyph(props: GlyphProps): any {
    const els = GLYPHS[props.name] || FALLBACK;
    return h(
      'svg',
      svgAttrs(props),
      els.map((e, i) => h(e[0], { ...e[1], key: i })),
    );
  }
  return {
    Glyph,
    hasGlyph: (name: string) => Object.prototype.hasOwnProperty.call(GLYPHS, name),
    names: Object.keys(GLYPHS),
  };
}
