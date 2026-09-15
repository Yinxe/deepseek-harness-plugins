/**
 * 参考组件之五：组件箱（**常驻/临时菜单里挂多个自由卡片**的参考实现）
 *
 * 它示范这个插件的「一菜单多卡片」模式，也正是 `trayIcon: false` 的用途：
 *
 *  1. 一个插件只注册**一个**菜单图标（这里是一个点击展开的小面板），菜单里列出若干个自由卡片；
 *  2. 那些卡片自己**不出现在活动栏**（`trayIcon: false`），由这个菜单用 `runtime.toggle(id)` 打开 ——
 *     可以同时开好几个（卡片本来就是多开的），所以「在一个迷你菜单里同时使用多个自由组件」成立；
 *  3. 提供方不需要新的框架能力：菜单内容拿得到 `runtime`（或者宿主自己的 `ctx.widgets` 服务），
 *     `register` 返回 disposer、`list()` 给出 id、`toggle/open/close` 控制开关。
 *
 * 顺带演示活动栏的文字扩展点：它给图标配了一段 `tray.label`（「组件箱」压到两个字）。
 *
 * @module @dshp/widget-kit/client/widgets/box
 */
import { Button } from '@deepseek-ai/dsh-client-ui-primitives';
import type { ReactNode } from 'react';
import type { WidgetDescriptor } from '../spec.js';
import { BoxGlyph } from '../glyphs.js';
import { useFramework } from '../hooks.js';
import type { WidgetRuntime } from '../service.js';
import styles from '../styles.module.css';

export const BOX_WIDGET_ID = 'dshp-widget-kit:box';

function BoxView({ runtime }: { runtime: WidgetRuntime }): ReactNode {
  const snapshot = useFramework(runtime);
  // 只列「自由卡片」：常驻/临时面板本身是入口，不在这里再列一遍
  const cards = snapshot.widgets.filter((widget) => widget.presentation === 'card');

  return (
    <div className={styles.box}>
      {cards.length === 0 ? (
        <div className={styles.boxEmpty}>还没有插件注册自由卡片。</div>
      ) : (
        <div className={styles.boxList}>
          {cards.map((widget) => {
            const title = typeof widget.title === 'function' ? widget.title() : widget.title;
            const open = runtime.isOpen(widget.id);
            return (
              <div key={widget.id} className={styles.boxRow}>
                <div className={styles.boxMain}>
                  <span className={styles.boxTitle}>{title}</span>
                  <span className={styles.boxMeta}>
                    {widget.id}
                    {widget.trayIcon ? '' : ' · 不在活动栏'}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    runtime.toggle(widget.id);
                  }}
                >
                  {open ? '收起' : '打开'}
                </Button>
              </div>
            );
          })}
        </div>
      )}
      <span className={styles.boxHint}>
        一个菜单图标就能挂多个自由卡片：卡片本身设 <code>trayIcon: false</code>，这里用{' '}
        <code>ctx.widgets.toggle(id)</code> 开关（可以同时开好几张）。
      </span>
    </div>
  );
}

/**
 * 组件箱描述符：点击展开的临时小面板 + 活动栏文字「组件箱」。
 *
 * @param runtime - 框架运行时（列卡片、开关卡片）。
 */
export function createBoxWidget(runtime: WidgetRuntime): WidgetDescriptor {
  return {
    id: BOX_WIDGET_ID,
    title: '组件箱',
    subtitle: '自由卡片的统一入口',
    icon: <BoxGlyph />,
    order: 95,
    presentation: 'popover',
    // 活动栏文字扩展点：图标旁边压两个字（最多 6 个）
    tray: { label: '组件箱' },
    popover: { trigger: 'click', width: 320 },
    content: {
      title: '组件箱',
      render: () => <BoxView runtime={runtime} />,
    },
  };
}
