/**
 * 本插件在活动栏上的**唯一入口**：一个图标 + 点开是一片「小组件菜单」。
 *
 * 为什么要有它：本插件的卡片全是 `trayIcon: false` 的自由卡片（不占活动栏），
 * 而它们本来只能从中心区「Token 总览 → 用量统计」的工具条上弹出 —— 换句话说，
 * 想开一张图得先钻进那个 tab。这里按 `@dshp/widget-kit` 的「一个所有者 = 一个图标 + 多张自由卡片」
 * 模式补上入口：图标点开是一片面板，面板里逐个开合本插件注册的小组件。
 *
 * 用的是宿主自己的形态能力，没有新契约：`presentation: 'popover'` +
 * `content.render` 里读 `widgets.listFloats()` / `useWidgets()` 快照。
 * 面板状态是实时的 —— 框架任何变化（别的入口开了卡、用户关掉卡、启停组件）都会经
 * `ctx.widgets.subscribe` 传到 `widgets.useWidgets()`，所以这里不需要自己轮询。
 *
 * @module @dshp/token-meter/client/MenuPanel
 */
import type { ReactNode } from 'react';
import { UsageIcon } from './icons.js';
import styles from './styles.module.css';
import { DISPLAY_NAME } from '../name.js';
import type { WidgetDescriptor } from '@dshp/widget-kit/spec';

/** 菜单要用到的外观接口（`widgets.tsx` 的产出；只声明用到的成员）。 */
export interface MenuWidgetsApi {
  /** 当前开着的卡片（订阅式）。 */
  useWidgets(): Array<{ id: string }>;
  /** 当前在册的卡片（legacy id + 标题）。 */
  listFloats(): Array<{ id: string; title: string }>;
  /** 开 / 关某张卡片。 */
  openWidget(id: string): void;
  closeWidget(id: string): void;
}

/**
 * 一条小组件记录（面板里的一行）。
 *
 * @param props - 卡片 id / 标题 / 是否开着 / 外观接口。
 * @returns 一行：标题 + 开合按钮。
 */
function MenuRow(props: { id: string; title: string; open: boolean; widgets: MenuWidgetsApi }): ReactNode {
  return (
    <div className={styles.menuRow} data-open={props.open ? '1' : '0'}>
      <span className={styles.menuDot} />
      <span className={styles.menuLabel} title={props.id}>
        {props.title}
      </span>
      <button
        type="button"
        className={styles.menuBtn}
        title={
          props.open
            ? '收起「' + props.title + '」（布局里保留位置与尺寸）'
            : '打开「' + props.title + '」为独立卡片'
        }
        onClick={() => {
          if (props.open) props.widgets.closeWidget(props.id);
          else props.widgets.openWidget(props.id);
        }}
      >
        {props.open ? '收起' : '打开'}
      </button>
    </div>
  );
}

/**
 * 小组件菜单（托盘图标点开的面板内容）。
 *
 * @param props - `widgets`：本插件的小组件外观接口。
 * @returns 面板内容：一行「全部收起」+ 每张卡片一行。
 */
export function TokenMeterMenu(props: { widgets: MenuWidgetsApi }): ReactNode {
  const open = props.widgets.useWidgets();
  const rows = props.widgets.listFloats();
  const openIds = new Set(open.map((entry) => entry.id));
  const openCount = rows.filter((row) => openIds.has(row.id)).length;
  return (
    <div className={styles.menu}>
      <div className={styles.menuHead}>
        <span className={styles.menuHint}>{'小组件：点「打开」弹出为可拖动卡片，位置与尺寸会记住。'}</span>
      </div>
      {rows.length === 0 ? (
        <div className={styles.menuEmpty}>{'还没有可弹出的小组件（供应商列表为空？）'}</div>
      ) : (
        <div className={styles.menuList}>
          {rows.map((row) => (
            <MenuRow
              key={row.id}
              id={row.id}
              title={row.title}
              open={openIds.has(row.id)}
              widgets={props.widgets}
            />
          ))}
        </div>
      )}
      <div className={styles.menuFoot}>
        <span className={styles.menuCount}>{openCount + ' / ' + rows.length + ' 已打开'}</span>
        <button
          type="button"
          className={styles.menuBtn}
          disabled={openCount === 0}
          title={'收起全部小组件（位置与尺寸保留，下次打开原位恢复）'}
          onClick={() => {
            for (const row of rows) if (openIds.has(row.id)) props.widgets.closeWidget(row.id);
          }}
        >
          {'全部收起'}
        </button>
      </div>
    </div>
  );
}

/**
 * 菜单描述符：`presentation: 'popover'` + 活动栏图标（本插件唯一的托盘入口）。
 *
 * `persistent: false`（默认）——菜单是「点开办事、点外面就收起」的一次性面板；
 * 面板内部点击不会收起（外部点击才算外部），所以连开几张卡片不用反复点图标。
 *
 * @param widgets - 本插件的小组件外观接口。
 * @returns 可直接交给 `widgets.registerHost()` 的描述符。
 */
export function createMenuWidget(widgets: MenuWidgetsApi): WidgetDescriptor {
  return {
    id: 'token-meter:menu',
    title: DISPLAY_NAME,
    subtitle: '小组件',
    icon: <UsageIcon size={16} />,
    presentation: 'popover',
    popover: { trigger: 'click', width: 320, maxHeight: 520 },
    content: {
      render: () => <TokenMeterMenu widgets={widgets} />,
    },
  };
}
