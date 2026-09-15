/**
 * 卡片层 —— 注册进 `shell.overlay` 的那一个条目
 *
 * 一次注册渲染全部卡片与当前 popover：卡片层自建层叠上下文（`isolation: isolate`），
 * 卡片之间只用**层内**相对 z-index，不跟官方层抢序。
 *
 * @module @dshp/widget-kit/client/CardLayer
 */
import type { ReactNode } from 'react';
import { Card } from './Card.js';
import { Popover } from './Popover.js';
import { useFramework } from './hooks.js';
import type { WidgetRuntime } from './service.js';
import styles from './styles.module.css';

export function CardLayer({
  runtime,
  onError,
}: {
  runtime: WidgetRuntime;
  onError?: ((message: string, error?: unknown) => void) | undefined;
}): ReactNode {
  const snapshot = useFramework(runtime);
  const byId = new Map(snapshot.widgets.map((widget) => [widget.id, widget]));
  // 禁用的组件不渲染（运行时在 setEnabled 时已经把它们收起来了，这里是第二道闸：
  // 刷新后恢复出来的布局里也可能留着一个刚被禁用的 id）
  const disabled = new Set(snapshot.layout.disabled);

  const cards = snapshot.zOrder
    .map((id) => byId.get(id))
    .filter(
      (widget): widget is NonNullable<typeof widget> =>
        widget !== undefined && widget.presentation === 'card' && !disabled.has(widget.id),
    );

  const popoverWidget = snapshot.openId === null ? undefined : byId.get(snapshot.openId);
  // `snapshot.ready` 之前托盘还没渲染（偏好没到），此刻挂面板只会在兜底位闪一下
  const popover =
    snapshot.ready &&
    popoverWidget !== undefined &&
    popoverWidget.presentation === 'popover' &&
    !disabled.has(popoverWidget.id)
      ? popoverWidget
      : undefined;

  return (
    <div className={styles.layer} data-plugin-widget-kit-layer="">
      {cards.map((widget) => (
        <Card key={widget.id} runtime={runtime} widget={widget} onError={onError} />
      ))}
      {popover !== undefined && <Popover runtime={runtime} widget={popover} onError={onError} />}
    </div>
  );
}
