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
import { buildModel, displayPath } from './diff.js';
import type {
  AnyPrimitives,
  AnyReact,
  DiffBlockLabels,
  FileChangeBadge,
  FileChangeModel,
  ToolViewProps,
} from './types.js';

/**
 * 单张卡片一次性展开的行数上限。
 *
 * 官方行内卡片给 `DiffBlock` 的是 8 行——它是「消息流要能扫」，而本插件的定位正相反：
 * 默认就把变更摊开。200 行足以完整覆盖绝大多数 edit hunk（每 hunk 只有 3 行上下文），
 * 同时给 write 大文件留一个「… 其余 N 行」的就地展开按钮，不至于把消息流撑到失控。
 * 这是一个 UI 几何常量，不是部署配置。
 */
const DIFF_MAX_LINES = 200;

/** 参数原文兜底展示的截断上限（模型产出的 JSON 不可信，见 AGENT.md §11）。 */
const RAW_MAX_CHARS = 4000;

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

    const body = React.createElement(
      'div',
      { className: 'fcv-body' },
      model.errorText !== null
        ? React.createElement('div', { className: 'fcv-error' }, model.errorText)
        : null,
      model.diffs.length > 0
        ? React.createElement(P.DiffBlock, {
            diffs: model.diffs,
            labels: diffLabels(t),
            maxLines: DIFF_MAX_LINES,
            className: 'fcv-diff',
          })
        : fallback,
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
