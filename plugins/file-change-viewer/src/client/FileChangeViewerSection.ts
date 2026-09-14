/**
 * 设置节「File Change View」——edit / write 行的展示偏好 + `patch` 工具开关
 *
 * 挂载点 `settings.section`（list 槽位）：`id` = 本插件的 settings 命名空间、`label` 进左侧设置导航。
 * 与本仓既有插件（mcwiki-search / vision-bridge / token-meter / search-provider / skill-manager /
 * mcp-manager / web-style）一致：**每个插件在设置里占自己的一节**，而不是往别人的页面里塞控件。
 *
 * 这一节里都是**全局默认值**，改完立即写回 Host（`/ext/dshp-file-change-viewer/config` →
 * `settings.yaml` 的 NS 分节）。其中两项显示偏好还会被两层更近的东西压过去——会话页头的两个快捷
 * 开关（只作用于当前会话，见 `SessionControls.ts`）与单行 / 单块自己的临时点击；三层合起来是
 * 「块自己的点击 > 会话级覆盖 > 这里的全局偏好」。第三项是 **`patch` 工具开关**（测试版，默认关），
 * 它决定 Host 半注不注册那个工具——改完立即生效，不必重启 `dsh web`。
 *
 * **展示方式不用下拉框，用两张并排的单选卡**（`viewCards.ts`）：每张卡下面用**同一份渲染代码**
 * 画一段真实的样张，挑的时候看到什么，会话里就是什么。
 *
 * 版式照抄官方设置节的「行」规格（label 14px + desc 12px，行高 16px、行间 `.5px` 细线），
 * 类名换成 `fcv-`：官方那边是模块哈希类名，跨包无法 import。
 *
 * @module @dshp/file-change-viewer/client/FileChangeViewerSection
 */
import type { PrefsFace } from './prefs.js';
import type { AnyPrimitives, AnyReact } from './types.js';
import { createViewCards } from './viewCards.js';

const INTRO =
  '「编辑 / 写入」工具行的默认形态与差异视图，以及本插件附带的 patch 工具开关。这里改的是**全局默认值**，立即写入 settings.yaml 的 dshp-file-change-viewer 分节：显示偏好只影响**之后新渲染**的编辑 / 写入行（已经在会话里的行保持它当前的样子，单行、单块随时可以临时点开 / 收起，不写回）。另外，会话页头右侧还有两个只作用于**当前会话**的快捷开关（一键展开 / 收起、切换差异视图），它们不动这里的值。';

const EXPAND_LABEL = '编辑 / 写入默认展开';
const EXPAND_HINT =
  '开：新渲染的编辑 / 写入行直接展开显示改动；关：与思考 / 读取行一致，默认收起、点一下才展开。只决定默认值，行内文件块与单块折叠都可临时点，会话页头的「展开 / 收起」也只压过当前会话。';

const PATCH_LABEL = '启用 patch 工具（测试版）';
const PATCH_HINT =
  '开：模型多出一个 patch 工具，一次调用改多处 / 多文件（*** Begin Patch 信封，只做新建与修改，删除 / 改名仍走 bash）。关（默认）：不注册这个工具，模型只用官方的 read / write / edit。改完立即生效，不必重启 dsh web；取消时正在进行的调用不受影响。';

const VIEW_LABEL = '展示方式';
const VIEW_HINT =
  '两种视图喂给渲染器的都是**同一份语义变更**（只算真正变动的行，未变行不会重复出现），所以增删统计、行号与两边看到的完全一致；下面每张卡直接画出对应效果，选中即生效。单块仍可在卡头临时切换，会话页头也能只给当前会话换一种。';

const CONTEXT_LABEL = '上下文行数';
const CONTEXT_HINT =
  '改动两侧各多显示几行**没受影响**的代码。这几行取自文件当前内容（不是模型在 old_string / 补丁片段里带的那几行），所以模型只圈 1 行上下文时也能看清改动落在哪里；0 = 只显示模型给的内容。文件读不到、或这段改动之后又被改过时，就不补上下文（不编内容）。';

/** 上下文行数下拉项（与 Host schema 的联合逐字对齐：0 / 3 / 5 / 8）。 */
const CONTEXT_OPTIONS = [
  { id: '0', label: '不显示' },
  { id: '3', label: '3 行' },
  { id: '5', label: '5 行' },
  { id: '8', label: '8 行' },
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
 * @param P - 运行时注入的 primitives（Button / Menu / IconChevronDownOutline14 / CodeBlock / DiffBlock）。
 * @param prefsFace - 偏好读写面（与工具行共用同一个 store）。
 * @returns 可直接交给 `slots.register` 的组件。
 */
export function createFileChangeViewerSection(
  React: AnyReact,
  P: AnyPrimitives,
  prefsFace: PrefsFace,
): () => any {
  const { usePrefs, setPref, useSaveState, reload } = prefsFace;
  const ViewCards = createViewCards(React, P);

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

  /**
   * 整幅设置块：label + desc 在上，控件**占满整行**在下。
   *
   * 「展示方式」的两张预览卡不可能塞进 `Row` 右侧那个窄列（预览本身要有宽度才看得出效果），
   * 所以它用这一种版式；其余仍是标准的左文右控件 `Row`。
   */
  function Block(props: { label: string; desc: string; children?: any }): any {
    return React.createElement(
      'div',
      { className: 'fcv-settingBlock' },
      React.createElement(
        'div',
        { className: 'fcv-blockText' },
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
    const pickedContext = CONTEXT_OPTIONS.filter((option) => option.id === String(prefs.contextLines))[0];
    const busy = save.phase === 'loading' || save.phase === 'saving';

    const children: any[] = [
      React.createElement('p', { className: 'fcv-intro' }, INTRO),
      React.createElement(
        'div',
        { className: 'fcv-section' },
        React.createElement('div', { className: 'fcv-sectionHead' }, '显示'),
        React.createElement(
          Block,
          { label: VIEW_LABEL, desc: VIEW_HINT },
          React.createElement(ViewCards, {
            value: prefs.view,
            onSelect: (id: string) => setPref('view', id),
          }),
        ),
        React.createElement(
          Row,
          { label: CONTEXT_LABEL, desc: CONTEXT_HINT },
          React.createElement(Select, {
            value: String(prefs.contextLines),
            selectedLabel:
              pickedContext === undefined ? String(prefs.contextLines) + ' 行' : pickedContext.label,
            options: CONTEXT_OPTIONS,
            onSelect: (id: string) => setPref('contextLines', Number(id)),
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
        { className: 'fcv-section' },
        React.createElement('div', { className: 'fcv-sectionHead' }, '工具'),
        React.createElement(
          Row,
          { label: PATCH_LABEL, desc: PATCH_HINT },
          React.createElement(Switch, {
            checked: prefs.patchTool,
            label: PATCH_LABEL,
            onChange: () => setPref('patchTool', !prefs.patchTool),
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
