/**
 * 差异本体的渲染（工具行与设置页预览共用）
 *
 * 同一个 hunk 有两种画法，而**两个地方**都要用：
 *
 * | 视图        | 组件（官方 primitives） | 谁在用                                          |
 * | ----------- | ----------------------- | ----------------------------------------------- |
 * | `highlight` | `CodeBlock`             | 工具行的文件块、设置页「高亮」卡的预览           |
 * | `diff`      | `DiffBlock`             | 工具行的文件块、设置页「± 差异」卡的预览         |
 *
 * 设置页要把两种效果**直接画出来**给用户挑（见 `viewCards.ts`）。如果那边再写一遍渲染，
 * 两边迟早漂移——「预览里长这样、真正用起来却长那样」比没有预览更糟。所以渲染在这里收口：
 * 工具行与设置预览调的是同一份代码。
 *
 * **类名一律由调用方传入**：工具行与设置节的类名集合必须两两不相交（见 `styles.ts` 的告警，
 * 也见 `scripts/check-client.mjs` 的撞车护卫），所以本模块不硬编码任何类名，只按调用方给的
 * 前缀拼。同理，高亮视图的「按行区间上底色」需要一段**动态** CSS，片段由 {@link tintRules}
 * 生成、由调用方注入到它自己的类名作用域里。
 *
 * @module @dshp/file-change-viewer/client/diffView
 */
import { toDiffText } from './diff.js';
import type {
  AnyPrimitives,
  AnyReact,
  DiffBlockLabels,
  FileDiff,
  UnifiedDiffKind,
  UnifiedDiffRow,
} from './types.js';

/**
 * 高亮视图单块一次渲染的行数上限。
 *
 * `CodeBlock` 没有 `maxLines`（不像 `DiffBlock` 会折叠中部），有多少行就渲染多少个高亮 span，
 * 所以必须自己封顶：400 行足够覆盖几乎所有 edit hunk 与大多数新文件，超出的部分在块下面用
 * 一行提示说明「改用 ± 视图可展开查看」。
 */
export const HIGHLIGHT_MAX_LINES = 400;

/** ± 差异视图交给 `DiffBlock` 的展开上限（超出由它自己折叠中部）。 */
export const DIFF_MAX_LINES = 200;

/** 高亮视图封顶后的去处提示。 */
export const OVERFLOW_HINT = '切换到 ± 差异视图可展开';

/**
 * 把某一类行（删 / 增）合并成尽量少的选择器：连续区间用 `:nth-child(n+a):nth-child(-n+b)`。
 *
 * @param codeClass - 本 hunk 独有的类名。
 * @param rows - 渲染出来的行。
 * @param kind - 要命中的行类型。
 * @returns 选择器数组；没有这种行时为空数组（调用方需要逐个追加伪元素，所以不在这里 join）。
 */
function rangeSelectors(codeClass: string, rows: readonly UnifiedDiffRow[], kind: UnifiedDiffKind): string[] {
  const selectors: string[] = [];
  let start = -1;
  for (let i = 0; i <= rows.length; i += 1) {
    const row = rows[i];
    const matches = row !== undefined && row.kind === kind;
    if (matches && start < 0) start = i;
    if (!matches && start >= 0) {
      const from = start + 1;
      const to = i;
      selectors.push(
        from === to
          ? '.' + codeClass + ' code>.line:nth-child(' + from + ')'
          : '.' + codeClass + ' code>.line:nth-child(n+' + from + '):nth-child(-n+' + to + ')',
      );
      start = -1;
    }
  }
  return selectors;
}

/**
 * 生成「按行上底色 + 让删除行不占行号」的 CSS 规则。
 *
 * 官方 `CodeBlock` 没有逐行样式的 API，但它的行号模式给了三个可依赖的事实：每行是
 * `code > .line`（类名 `line` 是**未哈希**的固定名）、是块级元素（底色能铺满整行）、行号由官方
 * CSS 计数器 `counter-increment: source-line` 逐行自增。于是按行区间生成规则：连续的同类行并成
 * 一个区间选择器，正常 diff 一个 hunk 只会产出 2–4 条。
 *
 * **删除行不占行号**：行号取「新文件视角」——上下文行与新增行依次占号，删除行既不显示数字也不
 * 推进计数器（`counter-increment:none` + `:before{content:""}`），于是新文件行号连续、不会被已
 * 删除的行顶掉（与 GitHub 统一 diff 的「新列」一致）。
 *
 * 唯一的耦合点就是 `code > .line` 这个结构与那两个官方属性；上游若改结构，**后果只是底色与留空
 * 消失**（代码块、语法高亮、复制照常），不会报错。颜色不在这里写死：引用调用方作用域里定义的
 * `--fcv-del-bg` / `--fcv-add-bg`（它们本身又是官方 token）。
 *
 * @param codeClass - 本 hunk 独有的类名（挂在 CodeBlock 根上），避免不同行互相串色。
 * @param rows - 该 hunk 实际渲染出来的行。
 * @param startLine - 该 hunk 首行在文件里的真实行号（1 起）。
 * @returns 若干条 CSS 规则（没有变更行时为空串）。
 */
export function tintRules(codeClass: string, rows: readonly UnifiedDiffRow[], startLine: number): string {
  const rules: string[] = [];

  // 真实行号：官方把 `counter-reset:source-line` 放在 code 上（`._numbered_ :where(pre) code`，
  // 特异性 0,1,0），默认从 1 数起。这里在本 hunk 独有的类名下标一次（特异性 0,1,1 更胜），
  // 于是首行编号就是它在文件里的真实行号；删除行照旧不占号、不推进计数器。
  if (startLine > 1) rules.push('.' + codeClass + ' code{counter-reset:source-line ' + (startLine - 1) + '}');

  const del = rangeSelectors(codeClass, rows, 'del');
  if (del.length > 0) {
    rules.push(del.join(',') + '{counter-increment:none;background:var(--fcv-del-bg)}');
    // 官方行号是绝对定位的 :before（content:counter(source-line)），清空即留空号位，不挤动代码。
    rules.push(del.map((selector) => selector + ':before').join(',') + '{content:""}');
  }

  const add = rangeSelectors(codeClass, rows, 'add');
  if (add.length > 0) rules.push(add.join(',') + '{background:var(--fcv-add-bg)}');

  return rules.join('\n');
}

/** 一个 hunk 在高亮视图里要用的全部素材（含它自己的行底色规则）。 */
export interface HighlightMaterial {
  /** 该 hunk 的完整行（调用方已把上下文并进来）。 */
  rows: readonly UnifiedDiffRow[];
  /** 实际渲染出去的行（超出 {@link HIGHLIGHT_MAX_LINES} 时是它的前缀）。 */
  shown: readonly UnifiedDiffRow[];
  /** 是否被封顶截断。 */
  overflow: boolean;
  /** 本 hunk 独有的类名（行底色规则挂在它上面）。 */
  codeClass: string;
  /** 官方语法 id；`null` = 不传 lang，让 CodeBlock 退化成纯文本。 */
  language: string | null;
  /** 首行的真实行号。 */
  startLine: number;
  /** 本 hunk 的动态 CSS（行底色 + 行号起点）；没有内容时为空串。 */
  css: string;
}

/**
 * 为一个 hunk 算好高亮视图的素材（封顶 + 行底色规则）。
 *
 * @param args - 行、真实起始行号、语法 id、以及本 hunk 独有的类名。
 * @returns 可直接交给 {@link createDiffBody} 的 `code` 渲染。
 */
export function buildHighlight(args: {
  rows: readonly UnifiedDiffRow[];
  startLine: number;
  language: string | null;
  codeClass: string;
}): HighlightMaterial {
  const overflow = args.rows.length > HIGHLIGHT_MAX_LINES;
  const shown = overflow ? args.rows.slice(0, HIGHLIGHT_MAX_LINES) : args.rows;
  return {
    rows: args.rows,
    shown,
    overflow,
    codeClass: args.codeClass,
    language: args.language,
    startLine: args.startLine,
    css: args.rows.length === 0 ? '' : tintRules(args.codeClass, shown, args.startLine),
  };
}

/**
 * 两套版式各自的类名。
 *
 * 工具行传 `fcv-*`（`fcv-code` / `fcv-diff` / `fcv-diffWrap` / `fcv-ctx` / `fcv-ctxLine` /
 * `fcv-muted`），设置页预览传 `fcv-pv*`——**必须不同**，否则设置节的 CSS 会打到会话里的
 * 工具行上（`styles.ts` 头部解释了为什么这是硬约束）。
 */
export interface DiffBodyClasses {
  /** `CodeBlock` 根上的类（外壳/底色由调用方的卡片提供）。 */
  code: string;
  /** `DiffBlock` 根上的类。 */
  diff: string;
  /** ± 视图的最外层（上下文 + DiffBlock + 上下文）。 */
  diffWrap: string;
  /** ± 视图里中性上下文的容器。 */
  ctx: string;
  /** ± 视图里单行上下文。 */
  ctxLine: string;
  /** 封顶提示那一行。 */
  muted: string;
}

/** 差异正文渲染器（`createDiffBody` 的产物）。 */
export interface DiffBody {
  /**
   * 高亮视图：官方 `CodeBlock` + 按行区间叠的整行红绿底色（一个代码块里看增删）。
   *
   * @param material - {@link buildHighlight} 的产物。
   * @param copyLabel - 复制按钮文案（官方按钮不传就是空标签）。
   * @param copiedLabel - 复制成功文案。
   * @returns 代码块与（可能有的）封顶提示；没有内容时为空数组。
   */
  code: (material: HighlightMaterial, copyLabel: string, copiedLabel: string) => any[];
  /**
   * ± 差异视图：官方 `DiffBlock` 的逐行红绿合并 diff（紧凑，超长中部折叠）。
   *
   * 喂进去的是**语义变更**（只有删除行与新增行），所以它给出的 `+A -B` 与高亮视图、行头统计一致。
   * 上下文单独渲染成中性行贴在它上下：官方 DiffBlock 的行 kind 只有 `path | del | add | gap`，
   * **画不了中性的上下文行**，塞进 `diffs` 只会变成绿色 `+` 或红色 `-`，把没改的行说成改了。
   *
   * @param args - 变更本体、前后上下文、本地化文案与（可选的）展开上限。
   * @returns 差异视图元素。
   */
  lines: (args: {
    diff: FileDiff;
    before: readonly string[];
    after: readonly string[];
    labels: DiffBlockLabels;
    maxLines?: number | undefined;
    key?: string | undefined;
  }) => any;
}

/**
 * 造差异正文渲染器。
 *
 * @param React - 运行时注入的 React。
 * @param P - 运行时注入的 primitives（`CodeBlock` / `DiffBlock`）。
 * @param cn - 调用方那套类名。
 * @returns 高亮 / ± 两个视图的渲染函数。
 */
export function createDiffBody(React: AnyReact, P: AnyPrimitives, cn: DiffBodyClasses): DiffBody {
  /** ± 视图的中性上下文行（官方 DiffBlock 画不了，见 {@link DiffBody.lines}）。 */
  function context(lines: readonly string[], key: string): any {
    if (lines.length === 0) return null;
    return React.createElement(
      'div',
      { className: cn.ctx, key },
      lines.map((text, at) =>
        React.createElement('div', { className: cn.ctxLine, key: at }, text === '' ? ' ' : text),
      ),
    );
  }

  return {
    code(material, copyLabel, copiedLabel) {
      if (material.rows.length === 0) return [];
      return [
        React.createElement(P.CodeBlock, {
          key: 'code',
          code: toDiffText(material.shown),
          lang: material.language === null ? undefined : material.language,
          className: cn.code + ' ' + material.codeClass,
          lineNumbers: true,
          copyLabel,
          copiedLabel,
        }),
        material.overflow
          ? React.createElement(
              'div',
              { className: cn.muted, key: 'overflow' },
              '… 其余 ' + (material.rows.length - HIGHLIGHT_MAX_LINES) + ' 行未显示（' + OVERFLOW_HINT + '）',
            )
          : null,
      ];
    },

    lines(args) {
      return React.createElement(
        'div',
        { className: cn.diffWrap, key: args.key },
        context(args.before, 'before'),
        React.createElement(P.DiffBlock, {
          diffs: [args.diff],
          labels: args.labels,
          maxLines: args.maxLines ?? DIFF_MAX_LINES,
          className: cn.diff,
        }),
        context(args.after, 'after'),
      );
    },
  };
}
