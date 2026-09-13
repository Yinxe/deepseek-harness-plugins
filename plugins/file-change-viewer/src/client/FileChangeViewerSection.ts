/**
 * 设置节「文件修改卡片」——edit / write 行的展示偏好
 *
 * 挂载点 `settings.section`（list 槽位）：`id` = 本插件的 settings 命名空间、`label` 进左侧设置导航。
 * 与本仓既有插件（mcwiki-search / vision-bridge / token-meter / search-provider / skill-manager /
 * mcp-manager / web-style）一致：**每个插件在设置里占自己的一节**，而不是往别人的页面里塞控件。
 *
 * 两项偏好都是**全局默认值**，改完立即写回 Host（`/ext/dshp-file-change-viewer/config` →
 * `settings.yaml` 的 NS 分节），会话里已经渲染的文件块会同步换视图；单个文件块仍可在卡头临时
 * 覆盖折叠态与展示方式，那种覆盖只作用于当前这一个块，不回写。
 *
 * 版式照抄官方设置节的「行」规格（label 14px + desc 12px，行高 16px、行间 `.5px` 细线），
 * 类名换成 `fcv-`：官方那边是模块哈希类名，跨包无法 import。
 *
 * @module @dshp/file-change-viewer/client/FileChangeViewerSection
 */
import type { PrefsFace } from './prefs.js';
import type { AnyPrimitives, AnyReact } from './types.js';

const INTRO =
  '「编辑 / 写入」工具行的默认形态与差异视图。这里改的是全局默认值，立即写入 settings.yaml 的 dshp-file-change-viewer 分节，并只影响**之后新渲染**的编辑 / 写入行；已经在会话里的行保持它当前的样子，单行、单块随时可以临时点开 / 收起（不写回）。';

const EXPAND_LABEL = '编辑 / 写入默认展开';
const EXPAND_HINT =
  '开：新渲染的编辑 / 写入行直接展开显示改动；关：与思考 / 读取行一致，默认收起、点一下才展开。只决定新渲染时的初始状态，行内文件块与单块折叠都可临时点。';

const VIEW_LABEL = '展示方式';
const VIEW_HINT =
  '高亮：单个代码块里放完整统一 diff（整行红绿 + 行号 + 语法高亮）；± 差异：官方逐行 ± 视图，紧凑、超长中部折叠。';

/** 展示方式下拉项（与 Host schema 的 `z.const` 联合逐字对齐）。 */
const VIEW_OPTIONS = [
  { id: 'highlight', label: '高亮' },
  { id: 'diff', label: '± 差异' },
];

/** 下拉项的形状（官方 `Menu` 的 items 契约）。 */
interface SelectOption {
  id: string;
  label: string;
}

/**
 * 造设置节组件。
 *
 * @param React - 运行时注入的 React。
 * @param P - 运行时注入的 primitives（Button / Menu / IconChevronDownOutline14）。
 * @param prefsFace - 偏好读写面（与工具行共用同一个 store）。
 * @returns 可直接交给 `slots.register` 的组件。
 */
export function createFileChangeViewerSection(
  React: AnyReact,
  P: AnyPrimitives,
  prefsFace: PrefsFace,
): () => any {
  const { usePrefs, setPref, useSaveState, reload } = prefsFace;

  /** 官方设置行：左列 label + desc，右侧控件。 */
  function Row(props: { label: string; desc: string; children?: any }): any {
    return React.createElement(
      'div',
      { className: 'fcv-settingRow' },
      React.createElement(
        'div',
        { className: 'fcv-rowText' },
        React.createElement('div', { className: 'fcv-title' }, props.label),
        React.createElement('div', { className: 'fcv-desc' }, props.desc),
      ),
      props.children,
    );
  }

  /** 小圆角状态徽标（读 / 写状态用）。 */
  function Badge(props: { kind: 'ok' | 'warn' | 'muted'; text: string }): any {
    return React.createElement('span', { className: 'fcv-badge fcv-badge-' + props.kind }, props.text);
  }

  /**
   * 开关：自绘 `<button role="switch">`。
   *
   * 用自绘而不是 primitives 的 Switch，是因为这里必须**零歧义**：视觉态、aria 态、点击回调都在
   * 同一个元素上（开关状态由偏好缓存驱动，点一下必然改值），不依赖上游组件对 `checked/onChange`
   * 的参数约定。写法与 vision-bridge 的 Switch 一致。
   */
  function Switch(props: { checked: boolean; label: string; onChange: () => void }): any {
    return React.createElement(
      'button',
      {
        type: 'button',
        role: 'switch',
        'aria-checked': props.checked === true,
        'aria-label': props.label,
        className: 'fcv-switch' + (props.checked ? ' fcv-switchOn' : ''),
        onClick: props.onChange,
      },
      React.createElement('span', { className: 'fcv-thumb' }),
    );
  }

  /** 下拉胶囊 + 官方 Menu（写法与 vision-bridge 的 Select 一致）。 */
  function Select(props: {
    value: string;
    selectedLabel: string;
    options: SelectOption[];
    onSelect: (id: string) => void;
  }): any {
    const [open, setOpen] = React.useState(false) as [
      boolean,
      (next: boolean | ((prev: boolean) => boolean)) => void,
    ];
    const selector = React.createElement(
      'button',
      {
        type: 'button',
        className: 'fcv-selector',
        'aria-haspopup': 'menu',
        'aria-expanded': open,
        onClick: () => setOpen((prev: boolean) => !prev),
      },
      React.createElement('span', { className: 'fcv-selectorLabel' }, props.selectedLabel),
      React.createElement(P.IconChevronDownOutline14, { className: 'fcv-chevron' }),
    );
    return React.createElement(P.Menu, {
      open,
      onClose: () => setOpen(false),
      items: props.options,
      selectedId: props.value,
      onSelect: (id: string) => {
        setOpen(false);
        props.onSelect(id);
      },
      align: 'end',
      portal: true,
      anchor: selector,
    });
  }

  /** 保存状态徽标（读 / 写都在这一处反馈，绝不在失败时假装成功）。 */
  function statusBadge(phase: string): any {
    if (phase === 'loading') return React.createElement(Badge, { kind: 'muted', text: '正在读取配置…' });
    if (phase === 'saving') return React.createElement(Badge, { kind: 'muted', text: '正在保存…' });
    if (phase === 'ready') return React.createElement(Badge, { kind: 'ok', text: '已同步 settings.yaml' });
    if (phase === 'error') return React.createElement(Badge, { kind: 'warn', text: '未保存' });
    return null;
  }

  return function FileChangeViewerSection(): any {
    const prefs = usePrefs();
    const save = useSaveState();
    const picked = VIEW_OPTIONS.filter((option) => option.id === prefs.view)[0];
    const busy = save.phase === 'loading' || save.phase === 'saving';

    const children: any[] = [
      React.createElement('p', { className: 'fcv-intro' }, INTRO),
      React.createElement(
        'div',
        { className: 'fcv-section' },
        React.createElement('div', { className: 'fcv-sectionHead' }, '显示'),
        React.createElement(
          Row,
          { label: VIEW_LABEL, desc: VIEW_HINT },
          React.createElement(Select, {
            value: prefs.view,
            selectedLabel: picked === undefined ? prefs.view : picked.label,
            options: VIEW_OPTIONS,
            onSelect: (id: string) => setPref('view', id),
          }),
        ),
        React.createElement(
          Row,
          { label: EXPAND_LABEL, desc: EXPAND_HINT },
          React.createElement(Switch, {
            checked: prefs.sectionsOpen,
            label: EXPAND_LABEL,
            onChange: () => setPref('sectionsOpen', !prefs.sectionsOpen),
          }),
        ),
      ),
      React.createElement(
        'div',
        { className: 'fcv-barEnd' },
        statusBadge(save.phase),
        React.createElement(
          P.Button,
          { variant: 'outline', size: 'sm', disabled: busy, onClick: reload },
          save.phase === 'loading' ? '读取中…' : '重新读取',
        ),
      ),
    ];

    if (save.phase === 'error' && save.error !== null) {
      children.push(React.createElement('p', { className: 'fcv-notice fcv-notice-err' }, save.error));
    }

    return React.createElement('div', { className: 'fcv-page' }, children);
  };
}
