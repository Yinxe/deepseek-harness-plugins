/**
 * 参考组件之二：注册表诊断（不是业务，是这个插件的「规范示例」）
 *
 * 它示范两件事：
 *  1. 组件提供方自己的界面**也能**用框架的公开面（`useFramework` 快照）看运行时状态；
 *  2. 同样的 `sizeClass` 分档：紧凑只报数量，常规逐条列出，宽档再显示来源与呈现方式。
 *
 * @module @dshp/widget-kit/client/widgets/diagnostics
 */
import type { ReactNode } from 'react';
import { FRAMEWORK_VERSION } from '../spec.js';
import type { WidgetContentProps, WidgetDescriptor } from '../spec.js';
import { RegistryGlyph } from '../glyphs.js';
import { useFramework } from '../hooks.js';
import type { WidgetRuntime } from '../service.js';
import styles from '../styles.module.css';

export const DIAGNOSTICS_WIDGET_ID = 'dshp-widget-kit:registry';

interface DiagData {
  count: number;
  openCards: number;
  frameworkVersion: string;
}

function DiagnosticsView({
  runtime,
  props,
}: {
  runtime: WidgetRuntime;
  props: WidgetContentProps<DiagData>;
}): ReactNode {
  const snapshot = useFramework(runtime);
  const compact = props.sizeClass === 'compact';

  return (
    <div className={styles.diag}>
      <div className={styles.diagSummary}>
        已注册 {String(snapshot.widgets.length)} 个组件 · 打开{' '}
        {String(Object.values(snapshot.layout.cards).filter((card) => card.open).length)} 张卡片 · v
        {FRAMEWORK_VERSION}
        {snapshot.degraded ? ' · 本机布局未持久化' : ''}
      </div>
      {snapshot.widgets.length === 0 ? (
        <div className={styles.diagEmpty}>还没有任何插件注册组件。</div>
      ) : (
        <div className={styles.diagList}>
          {snapshot.widgets.map((widget) => (
            <div key={widget.id} className={styles.diagRow}>
              <div className={styles.diagMain}>
                <span className={styles.diagId}>{widget.id}</span>
                {!compact && (
                  <span className={styles.diagMeta}>
                    来源 {widget.owner} · {widget.presentation}
                    {widget.tray.badge === null ? '' : ' · 有徽标'}
                    {widget.presentation === 'card'
                      ? ` · ${String(widget.card?.defaultSize.w ?? 0)}×${String(widget.card?.defaultSize.h ?? 0)}`
                      : ''}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {props.error !== undefined && (
        <div className={styles.diagError}>数据刷新失败：{props.error.message}</div>
      )}
    </div>
  );
}

/** 诊断组件描述符。 */
export function createDiagnosticsWidget(runtime: WidgetRuntime): WidgetDescriptor<DiagData> {
  return {
    id: DIAGNOSTICS_WIDGET_ID,
    title: '组件诊断',
    subtitle: '已注册的组件与框架状态',
    icon: <RegistryGlyph />,
    order: 110,
    presentation: 'card',
    tray: {
      badge: () => {
        const count = runtime.list().length;
        return { text: String(count), tone: 'info', title: `${String(count)} 个已注册组件` };
      },
      badgeIntervalMs: 30000,
    },
    content: {
      title: '组件诊断',
      load: async (): Promise<DiagData> => ({
        count: runtime.list().length,
        openCards: Object.values(runtime.getSnapshot().layout.cards).filter((card) => card.open).length,
        frameworkVersion: runtime.frameworkVersion,
      }),
      refreshMs: 10000,
      render: (props) => <DiagnosticsView runtime={runtime} props={props} />,
    },
    card: {
      defaultSize: { w: 420, h: 300 },
      minSize: { w: 280, h: 180 },
      sizeClassBreakpoints: { compact: 340, wide: 520 },
    },
  };
}
