/**
 * 文件修改行：接管 `tool.call.toolview` 的 `edit` / `write` 键
 *
 * ## 为什么必须「接管」而不是「叠加」
 *
 * 官方 `file-mutation-toolview` 的展开态是组件内部的 `useState(false)`，折叠态下展开体
 * （`DiffBlock`）根本不挂载，所以「用 CSS 把卡片撑开」走不通。槽位本身是 keyed 且明确允许
 * 替换：「a key the shipped composition already covers is replaced, not shared」。
 *
 * ## 本行怎么做到「跟思考 / 读取行一样」
 *
 * 行的外壳直接用官方 `DisclosureRow` 的**默认样式**（不传任何布局类名）：它的 CSS 模块就是原生
 * 行的几何——`.row{height:24px;display:flex;align-items:center}`、`.leading{16px;margin-right:6px}`、
 * `.title{13px;label-secondary}`、hover 时图标与折叠箭头交叉淡出。官方 `ToolRow` 也只是在这套默认
 * 之上加了几条**工具专属**样式（分隔点、路径链接、统计、Inspect 药丸），所以本插件把那几条逐条
 * 镜像进 `styles.ts`（`fcv-` 前缀、全部走官方 token），不再自造卡片：没有边框、没有底色、没有圆角、
 * 没有自定义背景，行高与间距完全由官方行样式决定。
 *
 * ## 结构
 *
 * ```
 * ▸ 编辑 · src/x.ts            +58 -43        ← 原生行（默认折叠，与读取/思考行一致）
 *    ▾ src/x.ts                +37 -26        ← 每个文件块自己的折叠（默认走用户偏好）
 *         [差异本体：高亮视图 / ± 差异视图]
 * ```
 *
 * 视图（高亮 / ± 差异）与「编辑 / 写入是否默认展开」都是**全局用户偏好**（见 `prefs.ts`，入口在设置页
 * 「通用 → 文件修改卡片」）；单块仍可临时点开/收起，不改变偏好。
 *
 * @module @dshp/file-change-viewer/client/FileChangeRow
 */
import { buildModel, displayPath, hasChange, toDiffText } from './diff.js';
import { languageOf } from './lang.js';
import type { LocatorFace } from './locate.js';
import type { PrefsFace } from './prefs.js';
import type {
  AnyPrimitives,
  AnyReact,
  ChangeHunk,
  DiffBlockLabels,
  FileChangeModel,
  FileChangeView,
  FileDiff,
  ToolViewProps,
} from './types.js';
import type { UnifiedDiffKind, UnifiedDiffRow } from './diff.js';

/**
 * 高亮视图单块一次渲染的行数上限。
 *
 * `CodeBlock` 没有 `maxLines`（不像 `DiffBlock` 会折叠中部），有多少行就渲染多少个高亮 span，
 * 所以必须自己封顶：400 行足够覆盖几乎所有 edit hunk 与大多数新文件，超出的部分在块下面用
 * 一行提示说明「改用 ± 视图可展开查看」。
 */
const HIGHLIGHT_MAX_LINES = 400;

/** ± 差异视图交给 `DiffBlock` 的展开上限（超出由它自己折叠中部）。 */
const DIFF_MAX_LINES = 200;

/** 参数原文兜底展示的截断上限（模型产出的 JSON 不可信，见 docs/security.md）。 */
const RAW_MAX_CHARS = 4000;

const RAW_ARGS_LABEL = '原始参数';
const WAITING_TEXT = '等待参数…';
const OVERFLOW_HINT = '切换到 ± 差异视图可展开';
const NEW_FILE_LABEL = '新文件';
const REPLACE_ALL_LABEL = '全部替换';
/** `patch` 工具的标题。conversation 命名空间里没有这个键（它不是官方工具），所以用字面量。 */
const PATCH_TITLE = '补丁';
const UNAVAILABLE_TEXT = '参数不可用';
const ICON_SIZE = 12;
const FILE_ICON_SIZE = 14;
const VIEW_GROUP_LABEL = '差异展示方式';
const VIEW_HIGHLIGHT_LABEL = '高亮';
const VIEW_DIFF_LABEL = '± 差异';
const VIEW_HIGHLIGHT_TITLE = '单代码块统一 diff：整行红绿底色 + 行号 + 语法高亮';
const VIEW_DIFF_TITLE = '官方 ± 差异视图：逐行红绿文字，紧凑，超长中部折叠';

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
 * 消失**（代码块、语法高亮、复制照常），不会报错。颜色不在这里写死：引用 `styles.ts` 定义的
 * `--fcv-del-bg` / `--fcv-add-bg`（它们本身又是官方 token）。
 *
 * @param codeClass - 本 hunk 独有的类名（挂在 CodeBlock 根上），避免不同行互相串色。
 * @param rows - 该 hunk 实际渲染出来的行。
 * @returns 若干条 CSS 规则（没有变更行时为空串）。
 */
function tintRules(codeClass: string, rows: readonly UnifiedDiffRow[], startLine: number): string {
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

/** 匿名调用（没有 callId）时的兜底序号，避免不同行共用同一个类名互相串色。 */
let anonymousCardSeq = 0;

/**
 * 取本行的类名后缀：优先用工具调用 id（稳定、同一行每次渲染都一致）。
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

/**
 * 数一份文本的行数（空串 0 行；末尾换行不算一行）——与官方 `DiffBlock` 内部口径一致，
 * 所以文件块头部的 `+N -M` 与行头部的 `+A -B` 统计永远对得上。
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
 * 造行组件（工厂形态，对齐 vision-bridge 的 `createVisionSection`）。
 *
 * @param React - 运行时注入的 React。
 * @param P - 运行时注入的 primitives（DisclosureRow / CodeBlock / DiffBlock / StateDot / IconEditOutline16 / JsonBlock / diffTotals）。
 * @param prefsFace - 用户偏好的读写面。
 * @param locator - 真实行号查询（`patch` 自带行号；edit / write 靠它向 Host 定位）。
 * @returns 可直接交给 `slots.register` 的组件。
 */
export function createFileChangeRow(
  React: AnyReact,
  P: AnyPrimitives,
  prefsFace: PrefsFace,
  locator: LocatorFace,
): (props: ToolViewProps) => any {
  const { usePrefs } = prefsFace;
  const { locateOf, useLines } = locator;

  /** DiffBlock 的本地化文案（字段名与官方 `diffBlockLabels(t)` 一致）。 */
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

  /** 一次调用的临时覆盖（行开合 / 每块开合 / 每块展示方式），跟 callId 绑死。 */
  interface UiState {
    callId: string;
    /**
     * 行自己的临时开合；`null` = 用户没点过这一行 → **实时跟随用户偏好**。
     *
     * 「跟随」而不是「渲染时快照」：设置里把开关打开，会话里这些编辑 / 写入行应当立刻展开
     * （用户要的就是一眼看到代码），而不是只对之后新出现的行生效。用户手动点过的那一行例外——
     * 那一刻起由用户说了算，开关不再动它。
     */
    row: boolean | null;
    sections: Record<number, boolean>;
    views: Record<number, FileChangeView>;
  }

  /** 新调用 = 一份干净的覆盖（一切跟随用户偏好）。 */
  function newUiState(callId: string): UiState {
    return { callId, row: null, sections: {}, views: {} };
  }

  function FileChangeRow(props: ToolViewProps): any {
    // t 由注册时的 `locale: 'conversation'` 注入；万一宿主换了契约，退化成显示键名而不是让行抛错。
    const t = typeof props.t === 'function' ? props.t : (key: string): string => key;
    const prefs = usePrefs();
    // 订阅行号缓存：定位结果回来了（或新一批发出去了）就重渲染，把真实行号填上。
    useLines();

    /**
     * 临时覆盖（都不落盘）：行自己的开合 + 每个文件块的开合与展示方式。
     *
     * 三样东西一起挂在**这次调用的 callId** 上，原因是宿主渲染工具行时用的是
     * `react.memo(ToolCall)`、列表上又没有显式 key：窗口滚动 / 截断 / 新调用插入时，React 可能
     * 在同一个位置**复用组件实例**去渲染另一次调用。若覆盖状态只按 `index` 存，上一行「我手动
     * 折叠过第 0 块」就会漏到新行上——表现正是「新出现的编辑 / 写入行不跟随偏好」。
     */
    const [ui, setUi] = React.useState(() => newUiState(props.callId));
    const bound = ui.callId === props.callId ? ui : newUiState(props.callId);
    const patchUi = (fields: Partial<UiState>): void => {
      setUi((prev: UiState) => {
        const base = prev.callId === props.callId ? prev : newUiState(props.callId);
        return { ...base, ...fields };
      });
    };
    // 行的开合：没手动点过 → 跟随偏好（关 = 与思考 / 读取行一致的原生折叠）；点过 → 按用户点的来。
    const rowOpen = bound.row === null ? prefs.sectionsOpen : bound.row;

    const model: FileChangeModel = buildModel(props.toolName, props.block);
    // 统计口径 = **语义变更**（LCS 之后真正变化的行），不是工具原文的行数：
    // `edit` 写进 meta.diffs 的 oldText / newText 是模型的 old_string / new_string 原文，
    // 为了让 old_string 唯一，里面常常带着未变的上下文行——直接计数会把一次单行替换报成 +7 -7，
    // 与高亮视图看到的「只改了一行」自相矛盾。hunks 已经在 buildModel 里跑过一次 LCS。
    const changed = model.hunks.some(hasChange);
    const statDiffs: FileDiff[] = changed
      ? model.hunks.map((hunk) => hunk.changed)
      : model.hunks.map((hunk) => hunk.raw);
    const totals = P.diffTotals(statDiffs) as { added: number; removed: number };
    const first = model.hunks[0];
    const rawPath = first === undefined ? undefined : first.raw.path;

    /**
     * 每个 hunk 的定位结果（真实起始行号 + 两侧上下文），一次查询两处都用。
     *
     * 行号有三条来源，优先用最确定的：
     * 1. `hunk.raw.startLine` —— 本插件 `patch` 工具落盘时算出的确切行号；
     * 2. `locate.ts` 的缓存 —— edit / write 的元数据没有偏移，靠 Host 拿文件内容定位（异步，
     *    拿到后经订阅重渲染填上）；
     * 3. 都还没有 → 1（老老实实从 1 开始，不编数字）。
     *
     * 上下文则**只**来自第 2 条（文件当前内容），与模型在 `old_string` / 补丁片段里带了多少行无关。
     */
    const locatedHunks = model.hunks.map((hunk) =>
      locateOf(hunk.raw.path, hunk.raw.newText, hunk.raw.oldText, props.cwd),
    );
    const startLines = model.hunks.map((hunk, index) => {
      if (typeof hunk.raw.startLine === 'number' && hunk.raw.startLine > 0) return hunk.raw.startLine;
      const located = locatedHunks[index];
      const line = located === null || located === undefined ? null : located.line;
      return typeof line === 'number' && line > 0 ? line : 1;
    });

    /**
     * 每个 hunk 要**额外补**的上下文（按偏好截；0 行 = 不补）。
     *
     * Host 一次给足 8 行，这里截成偏好值——所以改「上下文行数」不必重新问 Host，只是重渲染。
     */
    const contexts = model.hunks.map((_hunk, index) => {
      const located = locatedHunks[index];
      const want = prefs.contextLines;
      if (located === null || located === undefined || want === 0) return { before: [], after: [] };
      return { before: located.before.slice(-want), after: located.after.slice(0, want) };
    });

    /**
     * 渲染用的行 = 上文 + 本 hunk 的 LCS 结果 + 下文；起始行号相应前移，于是行号仍然是真的。
     *
     * 高亮视图与 ± 差异视图共用这一份素材：前者把它当代码块（行号 + 可着色区间），后者把
     * 上下文单独渲染成中性行（官方 `DiffBlock` 只有 `del` / `add` 两种行，画不了中性上下文）。
     */
    const rowsOf = (index: number): UnifiedDiffRow[] => {
      const hunk = model.hunks[index];
      if (hunk === undefined) return [];
      const context = contexts[index] ?? { before: [], after: [] };
      return [
        ...context.before.map((text): UnifiedDiffRow => ({ kind: 'ctx', text })),
        ...hunk.rows,
        ...context.after.map((text): UnifiedDiffRow => ({ kind: 'ctx', text })),
      ];
    };
    const startOf = (index: number): number =>
      Math.max(1, (startLines[index] ?? 1) - (contexts[index]?.before.length ?? 0));

    // 行内按钮（路径 / 查看）不得触发行点击的折叠：官方 ToolRow 对文件链接做同样处理。
    const stopKeyToggle = (event: { key?: string; stopPropagation: () => void }): void => {
      if (event.key === 'Enter' || event.key === ' ') event.stopPropagation();
    };

    /**
     * 绿增红删的统计：每侧一个图标 + 数字。
     *
     * `+` 用官方 `IconPlusOutline16`。官方图标集里**没有减号**，所以减号用一个同 16px 网格、
     * `currentColor` 的一图元内联 SVG（一条圆角横杠），颜色仍由父级的 token 决定。
     */
    const renderStat = (added: number, removed: number): any =>
      React.createElement(
        'span',
        { className: 'fcv-stat' },
        React.createElement(
          'span',
          { className: 'fcv-statPart fcv-add' },
          React.createElement(P.IconPlusOutline16, { size: ICON_SIZE }),
          String(added),
        ),
        React.createElement(
          'span',
          { className: 'fcv-statPart fcv-del' },
          React.createElement(
            'svg',
            { width: ICON_SIZE, height: ICON_SIZE, viewBox: '0 0 16 16', 'aria-hidden': true },
            React.createElement('rect', {
              x: 3,
              y: 7.25,
              width: 10,
              height: 1.5,
              rx: 0.75,
              fill: 'currentColor',
            }),
          ),
          String(removed),
        ),
      );

    /** 单块视图切换：两个官方 Pill 组成的小分段控件（状态可见，点一下就换，不写回偏好）。 */
    const renderViewSwitch = (index: number, current: FileChangeView): any => {
      const pill = (view: FileChangeView, label: string, icon: any): any =>
        React.createElement(
          P.Pill,
          {
            key: view,
            active: current === view,
            className: 'fcv-viewPill',
            title: view === 'highlight' ? VIEW_HIGHLIGHT_TITLE : VIEW_DIFF_TITLE,
            onClick: (event: { stopPropagation: () => void }) => {
              // 卡头整行是可折叠按钮，控件必须挡住冒泡，否则点一下顺带折叠。
              event.stopPropagation();
              patchUi({ views: { ...bound.views, [index]: view } });
            },
          },
          icon,
          label,
        );
      return React.createElement(
        'span',
        { className: 'fcv-viewGroup', role: 'group', 'aria-label': VIEW_GROUP_LABEL },
        pill(
          'highlight',
          VIEW_HIGHLIGHT_LABEL,
          React.createElement(P.IconCodeOutline16, { size: ICON_SIZE }),
        ),
        pill('diff', VIEW_DIFF_LABEL, React.createElement(P.IconBranchOutline16, { size: ICON_SIZE })),
      );
    };

    /**
     * 路径：有 openFile 时是可点链接（官方 fileLink 样式），否则是普通 summary 文本。
     *
     * @param path - 工具参数里的原始路径。
     * @param line - 已知的真实起始行号时一并带上，点开就落在改动处。
     */
    const renderPath = (path: string, line?: number): any => {
      const label = displayPath(path, props.cwd, props.home);
      const openFile = props.openFile;
      if (typeof openFile !== 'function') {
        return React.createElement('span', { className: 'fcv-summary' }, label);
      }
      return React.createElement(
        'button',
        {
          type: 'button',
          className: 'fcv-path',
          title: path,
          onClick: (event: { stopPropagation: () => void }) => {
            event.stopPropagation();
            if (typeof line === 'number' && line > 1) openFile(path, { line });
            else openFile(path);
          },
          onKeyDown: stopKeyToggle,
        },
        label,
      );
    };

    // 没有路径可显示时的兜底文案：还在跑 = 参数没开始流；已结算却读不到 = 调用头被窗口截断。
    const unavailableText = model.state === 'running' ? WAITING_TEXT : UNAVAILABLE_TEXT;

    // ── 行头（原生行）：[图标] 编辑 [· 路径] [+58 -43] ──────────────────────────
    const failed = model.state === 'error' && model.errorText !== null;
    const summaryChildren: any[] = failed
      ? [React.createElement('span', { className: 'fcv-errorSummary' }, model.errorText)]
      : [
          React.createElement('span', { className: 'fcv-sep' }),
          rawPath === undefined
            ? React.createElement('span', { className: 'fcv-summary' }, unavailableText)
            : renderPath(rawPath, startLines[0]),
          model.hunks.length > 0 ? renderStat(totals.added, totals.removed) : null,
          model.newFile
            ? React.createElement('span', { className: 'fcv-stat fcv-note' }, NEW_FILE_LABEL)
            : null,
          model.replaceAll
            ? React.createElement('span', { className: 'fcv-stat fcv-note' }, REPLACE_ALL_LABEL)
            : null,
        ];

    // ── 每个文件块：自己的折叠（默认走用户偏好，单块可临时覆盖） ────────────────
    const cardKey = cardKeyOf(props.callId);

    /**
     * 高亮视图每个 hunk 的素材（含它自己的行底色规则）。
     *
     * `rows` = 上文 + buildModel 的 LCS 结果 + 下文；`startLine` 也一并前移，所以代码块左侧的
     * 行号仍然是文件里的真实行号（上下文行照常占号，删除行不占号）。
     */
    const highlightHunks = model.hunks.map((_hunk, index) => {
      const rows = rowsOf(index);
      const startLine = startOf(index);
      const overflow = rows.length > HIGHLIGHT_MAX_LINES;
      const shown = overflow ? rows.slice(0, HIGHLIGHT_MAX_LINES) : rows;
      const codeClass = 'fcv-lines-' + cardKey + '-' + index;
      return {
        rows,
        shown,
        overflow,
        codeClass,
        language: languageOf(model.hunks[index]?.raw.path ?? ''),
        startLine,
        css: rows.length === 0 ? '' : tintRules(codeClass, shown, startLine),
      };
    });

    const tintCss = highlightHunks
      .map((hunk) => hunk.css)
      .filter((css) => css !== '')
      .join('\n');

    /** 高亮视图：官方 CodeBlock + 按行区间叠的整行红绿底色（一个代码块里看增删）。 */
    const renderHighlight = (index: number): any[] => {
      const hunk = highlightHunks[index];
      if (hunk === undefined || hunk.rows.length === 0) return [];
      return [
        React.createElement(P.CodeBlock, {
          key: 'code',
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
              { className: 'fcv-muted', key: 'overflow' },
              '… 其余 ' + (hunk.rows.length - HIGHLIGHT_MAX_LINES) + ' 行未显示（' + OVERFLOW_HINT + '）',
            )
          : null,
      ];
    };

    /**
     * ± 差异视图：官方 DiffBlock 的逐行红绿合并 diff（紧凑，超长中部折叠）。
     *
     * 喂给它的是**语义变更**（只有删除行与新增行），所以它给出的 `+A -B` 与高亮视图、行头统计一致；
     * 官方自己的做法是把原文整段列成 `-`、整段列成 `+`（一次单行替换看起来像整段重写）。
     * 每张卡只喂自己那一个 hunk——官方 DiffBlock 会把 `diffs` 里所有文件都渲染出来。
     *
     * 上下文单独渲染成中性行贴在它上下：官方 DiffBlock 的行 kind 只有 `path | del | add | gap`
     * （另外的那个 kind 直接 throw），**画不了中性的上下文行**，所以上下文不能塞进 `diffs`——
     * 塞进去只会变成绿色的 `+` 或红色的 `-`，把没改的行说成改了。
     */
    const renderContext = (lines: readonly string[], key: string): any =>
      lines.length === 0
        ? null
        : React.createElement(
            'div',
            { className: 'fcv-ctx', key },
            lines.map((text, at) =>
              React.createElement('div', { className: 'fcv-ctxLine', key: at }, text === '' ? ' ' : text),
            ),
          );

    const renderDiff = (index: number, fallback: FileDiff): any => {
      const context = contexts[index] ?? { before: [], after: [] };
      return React.createElement(
        'div',
        { className: 'fcv-diffWrap', key: 'diff' + index },
        renderContext(context.before, 'before'),
        React.createElement(P.DiffBlock, {
          diffs: [statDiffs[index] ?? fallback],
          labels: diffLabels(t),
          maxLines: DIFF_MAX_LINES,
          className: 'fcv-diff',
        }),
        renderContext(context.after, 'after'),
      );
    };

    const renderSections = (): any[] => {
      const nodes: any[] = [];
      const viewOf = (index: number): FileChangeView => {
        const override = bound.views[index];
        return override === undefined ? prefs.view : override;
      };
      // 一条 <style> 承担整行所有文件块的行底色，随行一起卸载；规则都用本行的类名限定。
      // 只要还有块用高亮视图就注入（切到 ± 差异的块用不到，规则是惰性的）。
      if (tintCss !== '' && model.hunks.some((_hunk, index) => viewOf(index) === 'highlight')) {
        nodes.push(React.createElement('style', { key: 'fcv-tint' }, tintCss));
      }
      model.hunks.forEach((hunk: ChangeHunk, index: number) => {
        const shown = statDiffs[index] ?? hunk.raw;
        const collapseOverride = bound.sections[index];
        // 文件块同理：没单独点过就跟随偏好，点过就按用户点的来。
        const open = collapseOverride === undefined ? prefs.sectionsOpen : collapseOverride;
        const view = viewOf(index);
        nodes.push(
          React.createElement(
            'div',
            { className: 'fcv-card', key: 'card' + index },
            React.createElement(
              P.DisclosureRow,
              {
                // 卡头就是这一行的 row：文件名作标题、统计与视图切换放右侧，整行仍可点着折叠。
                rowClassName: 'fcv-cardRow',
                titleClassName: 'fcv-cardTitle',
                // 文件名前挂官方「按文件类型」图标（FileTypeIcon 自己从扩展名判类型）。
                title: React.createElement(
                  'span',
                  { className: 'fcv-cardName' },
                  React.createElement(P.FileTypeIcon, {
                    path: hunk.raw.path,
                    size: FILE_ICON_SIZE,
                    className: 'fcv-fileIcon',
                  }),
                  React.createElement(
                    'span',
                    { className: 'fcv-cardNameText' },
                    // 改名 / 移动（本插件 patch 的 `*** Move to:`）显示成「旧 → 新」；
                    // 其余工具没有 oldPath，行为与以前完全一样。
                    hunk.raw.oldPath === undefined
                      ? displayPath(hunk.raw.path, props.cwd, props.home)
                      : displayPath(hunk.raw.oldPath, props.cwd, props.home) +
                          ' → ' +
                          displayPath(hunk.raw.path, props.cwd, props.home),
                  ),
                ),
                open,
                expandable: true,
                expandOnRowClick: true,
                keepContentWhenOpen: true,
                onToggle: () => patchUi({ sections: { ...bound.sections, [index]: !open } }),
                collapsedContent: [
                  // 卡头统计与行头同口径（语义变更），所以卡头数字和它自己的高亮 / ± 视图永远对得上。
                  renderStat(countLines(shown.newText), countLines(shown.oldText ?? '')),
                  renderViewSwitch(index, view),
                ],
              },
              view === 'highlight' ? renderHighlight(index) : renderDiff(index, hunk.raw),
            ),
          ),
        );
      });
      return nodes;
    };

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
            { className: 'fcv-summary' },
            model.rawArgs === ''
              ? unavailableText
              : model.rawArgs.slice(0, RAW_MAX_CHARS) + (model.rawArgs.length > RAW_MAX_CHARS ? '…' : ''),
          );

    const inspectNode =
      typeof props.inspect === 'function'
        ? React.createElement(
            'button',
            {
              type: 'button',
              className: 'fcv-inspect',
              onClick: (event: { stopPropagation: () => void }) => {
                event.stopPropagation();
                if (typeof props.inspect === 'function') props.inspect();
              },
              onKeyDown: stopKeyToggle,
            },
            t('row.inspect'),
          )
        : null;

    const body = React.createElement(
      'div',
      { className: 'fcv-body' },
      model.hunks.length === 0 ? fallback : renderSections(),
      inspectNode,
    );

    return React.createElement(
      P.DisclosureRow,
      {
        // 只挂一个类用于「hover 行时显示查看药丸」，不改任何布局/配色（行样式仍全部来自官方默认）。
        className: 'fcv-rowRoot',
        rowClassName: 'fcv-toolRow',
        icon:
          model.state === 'error'
            ? React.createElement(P.StateDot, { state: 'error' })
            : React.createElement(P.IconEditOutline16, { size: 14 }),
        title:
          props.toolName === 'patch'
            ? PATCH_TITLE
            : t(props.toolName === 'write' ? 'tool.title.write' : 'tool.title.edit'),
        open: rowOpen,
        expandable: true,
        expandOnRowClick: true,
        keepContentWhenOpen: true,
        onToggle: () => patchUi({ row: !rowOpen }),
        collapsedContent: summaryChildren,
      },
      body,
    );
  }

  return FileChangeRow;
}
