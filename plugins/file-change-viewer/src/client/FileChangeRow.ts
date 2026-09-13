/**
 * 文件修改卡片：接管 `tool.call.toolview` 的 `edit` / `write` 键
 *
 * ## 为什么必须「接管」而不是「叠加」
 *
 * 官方 `file-mutation-toolview` 的展开态是组件内部的 `useState(false)`，展开体
 * （`DiffBlock`）在收起时**根本不挂载**，所以「用 CSS 把折叠的卡片撑开」这条路走不通。
 * 槽位本身是 keyed 且明确允许替换：「a key the shipped composition already covers is
 * replaced, not shared」。本插件注册同名的 `edit` / `write` 键，用同一套官方 primitives
 * 重新组装这张卡片，唯一的语义差异是 **默认 `open = true`**。
 *
 * ## 与官方内置卡片的差异（刻意的）
 *
 * | 维度         | 内置 `file-mutation-toolview` | 本插件                                          |
 * | ------------ | ----------------------------- | ----------------------------------------------- |
 * | 展开态       | 默认收起                      | **默认展开**                                    |
 * | 进行中的调用 | 只显示摘要                    | 宽容解析半截 JSON，实时显示「正在写入」的内容   |
 * | 失败的调用   | 只显示错误行                  | 错误行 + 参数推导出的 hunk（角标「未应用」）    |
 * | 卡片结构     | ToolRow（含 output/terminal） | 只有变更（本卡片服务的工具只产出 diff）         |
 *
 * 其余一律对齐：`DiffBlock` 渲染 diff、`DisclosureRow` 提供无障碍折叠语义、
 * 路径显示用工作区相对路径 + `~` 缩写、配色全部走官方 token。
 *
 * @module @dshp/file-change-viewer/client/FileChangeRow
 */
import { buildModel, displayPath, toDiffText, unifiedDiffRows } from './diff.js';
import { languageOf } from './lang.js';
import type {
  AnyPrimitives,
  AnyReact,
  DiffBlockLabels,
  FileChangeBadge,
  FileChangeModel,
  FileDiff,
  FileChangeView,
  ToolViewProps,
} from './types.js';
import type { UnifiedDiffKind, UnifiedDiffRow } from './diff.js';

/**
 * 单张卡片一次性展开的行数上限（± 差异视图）。
 *
 * 官方行内卡片给 `DiffBlock` 的是 8 行——它是「消息流要能扫」，而本插件的定位正相反：
 * 默认就把变更摊开。200 行足以完整覆盖绝大多数 edit hunk（每 hunk 只有 3 行上下文），
 * 同时给 write 大文件留一个「… 其余 N 行」的就地展开按钮，不至于把消息流撑到失控。
 * 这是一个 UI 几何常量，不是部署配置。
 */
const DIFF_MAX_LINES = 200;

/**
 * 高亮视图里单侧代码块一次渲染的行数上限。
 *
 * `CodeBlock` 没有 `maxLines`（不像 `DiffBlock` 会折叠中部），有多少行就渲染多少个高亮
 * span，所以这里必须自己封顶：400 行足够覆盖几乎所有 edit hunk 与大多数新文件，超出的
 * 部分在块下面用一行提示说明「改用 ± 视图可展开查看」。
 */
const HIGHLIGHT_MAX_LINES = 400;

/**
 * 卡片主体的默认视图。
 *
 * 官方 `CodeBlock` 是唯一能拿到真 shiki 高亮的入口（配色走 `--shiki-token-*`，随主题切换）。
 * 高亮视图的做法是：把统一 diff 交给它，并利用它的**行号模式**——官方 CSS 在行号模式下会把
 * 每行渲染成块级 `code > .line`（带绝对定位的行号），因此我们能在自己的类作用域内按行区间
 * 给删/增行上整行底色，最终得到「一个代码块 + 行号 + 整行红绿 + 语法高亮」的常见 diff 外观。
 *
 * 逐行 ± 的紧凑视图仍然保留，点卡片头的切换按钮即可。
 *
 * 想反过来（默认 ± 差异、高亮靠点击）把这里改成 `'diff'` 重新 build 即可。
 */
const DEFAULT_VIEW: FileChangeView = 'highlight';

/** 参数原文兜底展示的截断上限（模型产出的 JSON 不可信，见 AGENT.md §11）。 */
const RAW_MAX_CHARS = 4000;

/**
 * 生成「按行上底色 + 让删除行不占行号」的 CSS 规则。
 *
 * 官方 `CodeBlock` 没有逐行样式的 API，但它的行号模式给了三个可依赖的事实：每行是
 * `code > .line`（类名 `line` 是**未哈希**的固定名）、是块级元素（底色能铺满整行）、
 * 行号由官方 CSS 计数器 `counter-increment: source-line` 逐行自增。于是我们按行区间生成规则：
 * 连续的同类行并成一个区间选择器，正常 diff 一个 hunk 只会产出 2–4 个选择器。
 *
 * **删除行不占行号**：行号取「新文件视角」——上下文行与新增行依次占号，删除行既不显示
 * 数字也不推进计数器（`counter-increment:none` + `:before{content:""}`），于是新文件的
 * 行号是连续的、不会被已删除的行顶掉。这与 GitHub 统一 diff 的「新列」一致。
 *
 * 唯一的耦合点就是 `code > .line` 这个结构与那两个官方属性；上游若改结构，**后果只是底色
 * 与留空消失**（代码块、语法高亮、复制照常），不会报错，也不会影响别的卡片。颜色不在这里
 * 写死：引用 `styles.ts` 里定义的 `--fcv-del-bg` / `--fcv-add-bg`（它们本身又是官方 token）。
 *
 * @param codeClass - 本 hunk 独有的类名（挂在 CodeBlock 根上），避免不同卡片互相串色。
 * @param rows - 该 hunk 实际渲染出来的行。
 * @returns 若干条 CSS 规则（没有变更行时为空串）。
 */
function tintRules(codeClass: string, rows: readonly UnifiedDiffRow[]): string {
  const rules: string[] = [];

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

/** 匿名调用（没有 callId）时的兜底序号，避免不同卡片共用同一个类名互相串色。 */
let anonymousCardSeq = 0;

/**
 * 取本张卡片的类名后缀：优先用工具调用 id（稳定、同一张卡片每次渲染都一致）。
 *
 * @param callId - 槽位给的调用 id。
 * @returns 只含 `[A-Za-z0-9_-]` 的短标识。
 */
function cardKeyOf(callId: unknown): string {
  const cleaned = typeof callId === 'string' ? callId.replace(/[^A-Za-z0-9_-]/g, '') : '';
  if (cleaned !== '') return cleaned.slice(0, 40);
  anonymousCardSeq += 1;
  return 'anon' + anonymousCardSeq;
}

/** 角标文案：插件自有文案沿用仓库惯例的中文直写（见 AGENT.md §10.1 的 label 写法）。 */
const BADGE_TEXT: Record<FileChangeBadge, string> = {
  applied: '已应用',
  pending: '待应用',
  streaming: '生成中',
  rejected: '未应用',
};

const NEW_FILE_TEXT = '新文件';
const REPLACE_ALL_TEXT = '全部替换';
const RAW_ARGS_LABEL = '原始参数';
const WAITING_TEXT = '等待参数…';
const VIEW_TOGGLE_TO_DIFF = '± 差异';
const VIEW_TOGGLE_TO_HIGHLIGHT = '高亮';
const VIEW_TOGGLE_TO_DIFF_TITLE = '切换到 ± 逐行差异视图（紧凑，红绿逐行）';
const VIEW_TOGGLE_TO_HIGHLIGHT_TITLE = '切换到语法高亮视图（按文件语言着色，带行号）';

/**
 * 数一份文本的行数（空串 0 行；末尾换行不算一行）——与官方 `DiffBlock` 内部口径一致，
 * 所以 hunk 头部的 `+N -M` 与卡片头部的 `+A -B` 统计永远对得上。
 *
 * @param text - 旧/新文本。
 * @returns 行数。
 */
function countLines(text: string): number {
  if (text === '') return 0;
  const body = text.endsWith('\n') ? text.slice(0, -1) : text;
  return body.split('\n').length;
}

/**
 * 造一个卡片组件（工厂形态，对齐 vision-bridge 的 `createVisionSection`）。
 *
 * @param React - 运行时注入的 React。
 * @param P - 运行时注入的 primitives（DiffBlock / DisclosureRow / StateDot / IconEditOutline16 / JsonBlock / diffTotals）。
 * @returns 可直接交给 `slots.register` 的组件。
 */
export function createFileChangeRow(React: AnyReact, P: AnyPrimitives): (props: ToolViewProps) => any {
  /**
   * DiffBlock 的本地化文案。键来自会话命名空间（含 common 回退），
   * 字段名与官方 `diffBlockLabels(t)` 完全一致，缺一个就会渲染出 undefined。
   */
  function diffLabels(t: (key: string, params?: Record<string, unknown>) => string): DiffBlockLabels {
    return {
      copy: t('copy'),
      copied: t('copied'),
      collapseAria: t('diff.collapseAria'),
      expandAria: (hidden: number) => t('diff.expandAria', { count: hidden }),
      collapse: t('collapse'),
      expand: (hidden: number) => t('diff.expandRest', { count: hidden }),
      files: (count: number) => t(count === 1 ? 'diff.files.one' : 'diff.files.other', { count }),
    };
  }

  function FileChangeRow(props: ToolViewProps): any {
    // t 由注册时的 `locale: 'conversation'` 注入；万一宿主换了契约，退化成显示键名而不是让整张卡片抛错。
    const t = typeof props.t === 'function' ? props.t : (key: string): string => key;
    // 默认展开——官方卡片这里是 useState(false)，本插件的全部意义就在这一行。
    const [open, setOpen] = React.useState(true) as [boolean, (next: boolean) => void];
    // 主体视图：默认高亮（官方 shiki），可切回逐行 ± 差异；每张卡片各自记忆。
    const [view, setView] = React.useState(DEFAULT_VIEW) as [FileChangeView, (next: FileChangeView) => void];
    const model: FileChangeModel = buildModel(props.toolName, props.block);
    const totals = P.diffTotals(model.diffs) as { added: number; removed: number };
    const first = model.diffs[0];
    const rawPath = first === undefined ? undefined : first.path;

    // 行内按钮（路径 / 查看）不得触发行点击的折叠：官方 ToolRow 对文件链接做同样处理。
    const stopKeyToggle = (event: { key?: string; stopPropagation: () => void }): void => {
      if (event.key === 'Enter' || event.key === ' ') event.stopPropagation();
    };

    /** 路径：有 openFile 时是可点按钮，否则只是文本。 */
    const renderPath = (): any => {
      if (rawPath === undefined) return null;
      const label = displayPath(rawPath, props.cwd, props.home);
      const openFile = props.openFile;
      if (typeof openFile !== 'function') {
        return React.createElement('span', { className: 'fcv-pathStatic' }, label);
      }
      return React.createElement(
        'button',
        {
          type: 'button',
          className: 'fcv-path',
          title: rawPath,
          onClick: (event: { stopPropagation: () => void }) => {
            event.stopPropagation();
            openFile(rawPath);
          },
          onKeyDown: stopKeyToggle,
        },
        React.createElement('span', { className: 'fcv-pathText' }, label),
      );
    };

    const badge = (kind: string, text: string): any =>
      React.createElement('span', { className: 'fcv-badge fcv-badge-' + kind }, text);

    const renderInspect = (): any => {
      const inspect = props.inspect;
      if (typeof inspect !== 'function') return null;
      return React.createElement(
        'button',
        {
          type: 'button',
          className: 'fcv-inspect',
          onClick: (event: { stopPropagation: () => void }) => {
            event.stopPropagation();
            inspect();
          },
          onKeyDown: stopKeyToggle,
        },
        t('row.inspect'),
      );
    };

    /** 视图切换按钮：没有可渲染的变更时不出现（那张卡片只有原始参数兜底）。 */
    const renderViewToggle = (): any => {
      if (model.diffs.length === 0) return null;
      const toHighlight = view === 'diff';
      return React.createElement(
        'button',
        {
          type: 'button',
          className: 'fcv-viewToggle',
          title: toHighlight ? VIEW_TOGGLE_TO_HIGHLIGHT_TITLE : VIEW_TOGGLE_TO_DIFF_TITLE,
          'aria-label': toHighlight ? VIEW_TOGGLE_TO_HIGHLIGHT_TITLE : VIEW_TOGGLE_TO_DIFF_TITLE,
          onClick: (event: { stopPropagation: () => void }) => {
            event.stopPropagation();
            setView(toHighlight ? 'highlight' : 'diff');
          },
          onKeyDown: stopKeyToggle,
        },
        toHighlight ? VIEW_TOGGLE_TO_HIGHLIGHT : VIEW_TOGGLE_TO_DIFF,
      );
    };

    const summary = React.createElement(
      'span',
      { className: 'fcv-summary' },
      renderPath(),
      model.newFile ? badge('newfile', NEW_FILE_TEXT) : null,
      model.replaceAll
        ? React.createElement('span', { className: 'fcv-replaceAll' }, REPLACE_ALL_TEXT)
        : null,
      model.diffs.length > 0
        ? React.createElement('span', { className: 'fcv-stat' }, '+' + totals.added + ' -' + totals.removed)
        : null,
      badge(model.badge, BADGE_TEXT[model.badge]),
      renderViewToggle(),
      renderInspect(),
    );

    // 没有可推导的变更时（窗口截断 / 未知的工具参数形态）退到原始参数：
    // 能解析成对象就交给官方 JsonBlock（自带截断保护），否则原样打印并截断。
    const fallback =
      model.parsedArgs !== null
        ? React.createElement(P.JsonBlock, {
            label: RAW_ARGS_LABEL,
            payload: model.parsedArgs,
            defaultOpen: true,
            truncatedLabel: (total: number) => '已截断，共 ' + total + ' 字符',
          })
        : React.createElement(
            'div',
            { className: 'fcv-muted' },
            model.rawArgs === ''
              ? WAITING_TEXT
              : model.rawArgs.slice(0, RAW_MAX_CHARS) + (model.rawArgs.length > RAW_MAX_CHARS ? '…' : ''),
          );

    /** 本张卡片生成的行底色规则要挂在哪个类名上（同一张卡片每次渲染都相同）。 */
    const cardKey = cardKeyOf(props.callId);

    /** 单 hunk 时卡片头部已经写了路径与总统计，hunk 头就是重复信息；多 hunk 才需要它来区分。 */
    const renderHunkHead = (diff: FileDiff): any =>
      React.createElement(
        'div',
        { className: 'fcv-hunkhead' },
        React.createElement(
          'span',
          { className: 'fcv-hunkpath' },
          displayPath(diff.path, props.cwd, props.home),
        ),
        React.createElement(
          'span',
          { className: 'fcv-hunkstat' },
          '+' + countLines(diff.newText) + ' -' + countLines(diff.oldText === null ? '' : diff.oldText),
        ),
      );

    /**
     * 高亮视图：每个 hunk 用**一个**官方 `CodeBlock` 渲染完整统一 diff。
     *
     * 删除行与新增行交错在同一个代码块里（未变的上下文行只出现一次），行首是 git 那种
     * 单字符标记 `-` / `+` / 空格；因为每行只多一个字符，相对缩进不变，所以高亮器仍按
     * 文件语言正常着色。整行红/绿底色靠 {@link tintRules} 生成的区间规则叠在行号模式的
     * 块级 `.line` 上——于是「一个代码块 + 行号 + 整行红绿 + 语法高亮」可以同时成立。
     *
     * 必须传 `lineNumbers`：官方只有在行号模式下才把 `.line` 变成**块级**元素（否则它是
     * 行内元素，底色只能盖住文字本身，铺不满整行）。代价是编号由官方的 CSS 计数器给出，
     * 是**块内第几行**而不是文件真实行号——工具元数据里只有 `{path, oldText, newText}`，
     * 没有行偏移，拿不到真实行号（README 的常见问题里有说明）。
     *
     * 不传 `streaming`：流式增量渲染是给「一段正在生成的长代码」用的，这里每帧重算整块
     * 更简单也更稳（hunk 都不大）。语言取不到时传 undefined，官方会退化成纯文本块。
     */
    const highlightHunks = model.diffs.map((diff, index) => {
      const rows = unifiedDiffRows(diff.oldText, diff.newText);
      const overflow = rows.length > HIGHLIGHT_MAX_LINES;
      const shown = overflow ? rows.slice(0, HIGHLIGHT_MAX_LINES) : rows;
      const codeClass = 'fcv-lines-' + cardKey + '-' + index;
      return {
        diff,
        rows,
        shown,
        overflow,
        codeClass,
        language: languageOf(diff.path),
        css: rows.length === 0 ? '' : tintRules(codeClass, shown),
      };
    });

    const tintCss = highlightHunks
      .map((hunk) => hunk.css)
      .filter((css) => css !== '')
      .join('\n');

    const renderHighlight = (): any[] => {
      const nodes: any[] = [];
      // 一条 <style> 承担整张卡片所有 hunk 的行底色，随卡片一起卸载；规则都用本卡片的类名限定。
      if (tintCss !== '') nodes.push(React.createElement('style', { key: 'fcv-tint' }, tintCss));
      for (const hunk of highlightHunks) {
        if (hunk.rows.length === 0) continue;
        nodes.push(
          React.createElement(
            'div',
            { className: 'fcv-hunk', key: 'highlight' + hunk.codeClass },
            model.diffs.length > 1 ? renderHunkHead(hunk.diff) : null,
            React.createElement(P.CodeBlock, {
              code: toDiffText(hunk.shown),
              lang: hunk.language === null ? undefined : hunk.language,
              className: 'fcv-code ' + hunk.codeClass,
              lineNumbers: true,
              copyLabel: t('copy'),
              copiedLabel: t('copied'),
            }),
            hunk.overflow
              ? React.createElement(
                  'div',
                  { className: 'fcv-muted' },
                  '… 其余 ' + (hunk.rows.length - HIGHLIGHT_MAX_LINES) + ' 行未显示（切到 ± 差异视图可展开）',
                )
              : null,
          ),
        );
      }
      return nodes;
    };

    /** ± 差异视图：官方 `DiffBlock` 的逐行红绿合并 diff（紧凑，超长中部折叠）。 */
    const renderDiff = (): any =>
      React.createElement(P.DiffBlock, {
        diffs: model.diffs,
        labels: diffLabels(t),
        maxLines: DIFF_MAX_LINES,
        className: 'fcv-diff',
      });

    const body = React.createElement(
      'div',
      { className: 'fcv-body' },
      model.errorText !== null
        ? React.createElement('div', { className: 'fcv-error' }, model.errorText)
        : null,
      model.diffs.length === 0 ? fallback : view === 'highlight' ? renderHighlight() : renderDiff(),
    );

    return React.createElement(
      'div',
      // data-state 是给样式与 scripts/check-client.mjs 的无头断言用的稳定钩子。
      { className: 'fcv-card', 'data-state': model.state },
      React.createElement(
        P.DisclosureRow,
        {
          rowClassName: 'fcv-head',
          leadingClassName: 'fcv-leading',
          titleClassName: 'fcv-title',
          icon:
            model.state === 'error'
              ? React.createElement(P.StateDot, { state: 'error' })
              : React.createElement(P.IconEditOutline16, { size: 14 }),
          title: t(props.toolName === 'write' ? 'tool.title.write' : 'tool.title.edit'),
          open,
          expandable: true,
          expandOnRowClick: true,
          keepContentWhenOpen: true,
          onToggle: () => setOpen(!open),
          collapsedContent: summary,
        },
        body,
      ),
    );
  }

  return FileChangeRow;
}
