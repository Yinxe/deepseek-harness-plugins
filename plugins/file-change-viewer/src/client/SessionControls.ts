/**
 * 会话页头的两个快捷开关：一键展开 / 收起所有文件 diff、一键切换差异视图
 *
 * 挂在 `conversation.session.header.utilities`（list 槽位，session 作用域，右侧会话工具栏）。
 * 它改的是 `session.ts` 的**会话级覆盖**——不写 `settings.yaml`、不动全局偏好，换一个会话就
 * 回落到偏好值（真要改全局默认，去设置页那一节）。
 *
 * 形态照抄同一个槽位上的官方 `open-in-app`：`.5px` 边框 + 14px 圆角的胶囊、11px 字号，
 * 一行放下两个按钮；只有「已经覆盖」时才多出一个「恢复跟随偏好」的小按钮，平常不占地方。
 *
 * 三个状态都如实反映**当前生效值**（覆盖优先、其次全局偏好），所以按钮上的字就是用户接下来会
 * 看到的东西，不需要猜：
 *
 * ```
 * [ ⌄ 收起 ] | [ </> 高亮 ]  ↺        ← 覆盖生效中（↺ 只在此时出现）
 * [ › 展开 ] | [ ⑂ ± 差异 ]           ← 跟随全局偏好
 * ```
 *
 * @module @dshp/file-change-viewer/client/SessionControls
 */
import type { PrefsFace } from './prefs.js';
import type { SessionOverrideFace } from './session.js';
import type { AnyPrimitives, AnyReact, FileChangeView } from './types.js';

const GROUP_LABEL = '文件改动的展开与差异视图（仅当前会话）';

const EXPAND_TEXT = '展开改动';
const COLLAPSE_TEXT = '收起改动';
const EXPAND_TITLE = '展开本会话的所有文件改动（只影响当前会话，不改全局偏好）';
const COLLAPSE_TITLE = '收起本会话的所有文件改动（只影响当前会话，不改全局偏好）';

const VIEW_HIGHLIGHT_TEXT = '高亮';
const VIEW_DIFF_TEXT = '± 差异';
const VIEW_TITLE =
  '切换本会话文件改动的展示方式（高亮 = 单代码块统一 diff，± 差异 = 官方逐行视图；只影响当前会话）';

const RESET_TEXT = '恢复跟随偏好';
const RESET_TITLE = '撤掉本会话的临时设置，回到设置页里的全局默认';

/** 页头图标尺寸（与官方 `open-in-app` 的 11px 一致）。 */
const ICON_SIZE = 11;

/**
 * 造页头开关组件。
 *
 * @param React - 运行时注入的 React。
 * @param P - 运行时注入的 primitives（图标用）。
 * @param prefsFace - 全局偏好（没有覆盖时显示的就是它）。
 * @param sessionFace - 会话级覆盖的读写面（与工具行共用同一个 store）。
 * @returns 可直接交给 `slots.register` 的组件。
 */
export function createSessionControls(
  React: AnyReact,
  P: AnyPrimitives,
  prefsFace: PrefsFace,
  sessionFace: SessionOverrideFace,
): (props: { sessionId?: string | undefined }) => any {
  const { usePrefs } = prefsFace;
  const { useOverride, setExpanded, setView, reset } = sessionFace;

  return function SessionControls(props: { sessionId?: string | undefined }): any {
    const prefs = usePrefs();
    const override = useOverride(props.sessionId);
    // 生效值：覆盖优先，其次全局偏好（与 FileChangeRow 里的口径逐字一致）。
    const expanded = override.expanded ?? prefs.sectionsOpen;
    const view: FileChangeView = override.view ?? prefs.view;
    const overridden = override.expanded !== null || override.view !== null;

    const button = (key: string, onClick: () => void, title: string, children: any[]): any =>
      React.createElement(
        'button',
        {
          key,
          type: 'button',
          className: 'fcv-headBtn',
          title,
          'aria-label': title,
          onClick,
        },
        children,
      );

    const children: any[] = [
      button(
        'expand',
        () => setExpanded(props.sessionId, !expanded),
        expanded ? COLLAPSE_TITLE : EXPAND_TITLE,
        [
          React.createElement(P.IconChevronDownOutline14, {
            key: 'icon',
            size: ICON_SIZE,
            className: 'fcv-headChevron' + (expanded ? '' : ' fcv-headChevronShut'),
          }),
          React.createElement(
            'span',
            { key: 'text', className: 'fcv-headLabel' },
            expanded ? COLLAPSE_TEXT : EXPAND_TEXT,
          ),
        ],
      ),
      React.createElement('span', { key: 'sep', className: 'fcv-headSep' }),
      button(
        'view',
        () => setView(props.sessionId, view === 'highlight' ? 'diff' : 'highlight'),
        VIEW_TITLE,
        [
          view === 'highlight'
            ? React.createElement(P.IconCodeOutline16, { key: 'icon', size: ICON_SIZE })
            : React.createElement(P.IconBranchOutline16, { key: 'icon', size: ICON_SIZE }),
          React.createElement(
            'span',
            { key: 'text', className: 'fcv-headLabel' },
            view === 'highlight' ? VIEW_HIGHLIGHT_TEXT : VIEW_DIFF_TEXT,
          ),
        ],
      ),
    ];

    // 只有真被覆盖过才出现：它存在的意义就是「怎么回去」，没覆盖时回去是空操作。
    if (overridden) {
      children.push(
        React.createElement(
          'button',
          {
            key: 'reset',
            type: 'button',
            className: 'fcv-headReset',
            title: RESET_TITLE,
            'aria-label': RESET_TEXT,
            onClick: () => reset(props.sessionId),
          },
          React.createElement(P.IconRefreshOutline14, { size: ICON_SIZE }),
        ),
      );
    }

    return React.createElement(
      'div',
      {
        className: 'fcv-headCtl' + (overridden ? ' fcv-headCtlOverridden' : ''),
        role: 'group',
        'aria-label': GROUP_LABEL,
      },
      children,
    );
  };
}
