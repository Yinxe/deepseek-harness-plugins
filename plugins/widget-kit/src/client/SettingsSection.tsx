/**
 * 设置节：`设置 → 小组件`
 *
 * 这里放的是**用户配置**（进 settings.yaml 的 `dshp-widget-kit` 分节）；**本机布局**（托盘顺序、
 * 卡片位置尺寸、隐藏集合）留在浏览器 localStorage，只提供一个「清空本机布局」的动作 ——
 * 这条边界写在 docs/widget-spec.md 里。
 *
 * @module @dshp/widget-kit/client/SettingsSection
 */
import { Button, Switch } from '@deepseek-ai/dsh-client-ui-primitives';
import { useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { fetchState } from './api.js';
import { Notice, PrefSelect, SettingRow } from './components.js';
import { useFramework } from './hooks.js';
import type { WidgetRuntime } from './service.js';
import type { ConfigPatch } from './types.js';
import styles from './styles.module.css';

const ICON_LIMIT_OPTIONS: ReadonlyArray<{ value: number; label: string }> = [
  { value: 2, label: '2 个' },
  { value: 3, label: '3 个' },
  { value: 4, label: '4 个' },
  { value: 5, label: '5 个' },
  { value: 6, label: '6 个' },
  { value: 8, label: '8 个' },
];

const BADGE_INTERVAL_OPTIONS: ReadonlyArray<{ value: number; label: string }> = [
  { value: 5000, label: '5 秒' },
  { value: 15000, label: '15 秒' },
  { value: 30000, label: '30 秒' },
  { value: 60000, label: '1 分钟' },
  { value: 300000, label: '5 分钟' },
];

export function SettingsSection({
  runtime,
  onPrefsApplied,
}: {
  runtime: WidgetRuntime;
  onPrefsApplied?: (prefs: ReturnType<WidgetRuntime['getSnapshot']>['prefs']) => void;
}): ReactNode {
  const snapshot = useFramework(runtime);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const prefs = snapshot.prefs;

  useEffect(() => {
    let cancelled = false;
    void fetchState()
      .then((state) => {
        if (cancelled) return;
        if (state.config !== undefined) runtime.applyPrefs(state.config);
        setLoaded(true);
      })
      .catch((cause: unknown) => {
        if (cancelled) return;
        setError(`读取配置失败（Host 半可能没挂载）：${String((cause as Error)?.message ?? cause)}`);
        setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [runtime]);

  const save = useCallback(
    (patch: ConfigPatch): void => {
      setSaving(true);
      setError(null);
      setNotice(null);
      void runtime.setPrefs(patch).then((result) => {
        setSaving(false);
        if (!result.ok) {
          setError(result.error ?? '保存失败，配置未改动');
          return;
        }
        onPrefsApplied?.(runtime.getSnapshot().prefs);
        setNotice('已保存');
      });
    },
    [onPrefsApplied, runtime],
  );

  return (
    <div className={styles.section}>
      <div>
        <h2 className={styles.sectionTitle}>小组件</h2>
        <p className={styles.sectionHint}>
          本插件只是**小组件的宿主与规范**，自身不含业务组件（下面两个参考组件可以关掉）。 其他插件按{' '}
          <code>docs/widget-spec.md</code> 注册组件后，会自动出现在会话顶部托盘里。
        </p>
      </div>

      {error !== null && <Notice tone="bad">{error}</Notice>}
      {notice !== null && <Notice tone="ok">{notice}</Notice>}
      {!loaded && <Notice>正在读取配置…</Notice>}

      <div className={styles.group}>
        <SettingRow title="会话顶部托盘" hint="关掉后所有组件图标都会隐藏（卡片也会一并收起）。">
          <Switch
            checked={prefs.trayEnabled}
            disabled={saving}
            label="显示会话顶部托盘"
            onChange={(next) => {
              save({ trayEnabled: next });
            }}
          />
        </SettingRow>
        <SettingRow title="可见图标上限" hint="超出的组件进溢出菜单（⋯），仍可用键盘打开、排序与隐藏。">
          <PrefSelect
            label="可见图标上限"
            value={prefs.maxVisibleIcons}
            options={ICON_LIMIT_OPTIONS}
            disabled={saving}
            onChange={(next) => {
              save({ maxVisibleIcons: next });
            }}
          />
        </SettingRow>
        <SettingRow
          title="徽标刷新间隔"
          hint="框架统一调度：页面不可见时暂停，单组件失败按 5s→10s→30s→60s 退避。"
        >
          <PrefSelect
            label="徽标刷新间隔"
            value={prefs.badgeIntervalMs}
            options={BADGE_INTERVAL_OPTIONS}
            disabled={saving}
            onChange={(next) => {
              save({ badgeIntervalMs: next });
            }}
          />
        </SettingRow>
        <SettingRow title="图标悬停预览" hint="悬停托盘图标时显示组件名与徽标说明。">
          <Switch
            checked={prefs.hoverPreview}
            disabled={saving}
            label="显示图标悬停预览"
            onChange={(next) => {
              save({ hoverPreview: next });
            }}
          />
        </SettingRow>
        <SettingRow
          title="参考组件"
          hint="本插件自带的四个规范示例（不是业务）：两张卡片「时钟 / 组件诊断」，两个小面板「快速设置（点击展开）/ 状态速览（悬停展开）」。"
        >
          <Switch
            checked={prefs.referenceWidgets}
            disabled={saving}
            label="装载参考组件"
            onChange={(next) => {
              save({ referenceWidgets: next });
            }}
          />
        </SettingRow>
      </div>

      <div>
        <h3 className={styles.sectionTitle}>已注册组件（{String(snapshot.widgets.length)}）</h3>
        <p className={styles.sectionHint}>
          本机布局（托盘顺序、卡片位置与尺寸、隐藏集合）只存在这台浏览器里；换设备或清缓存会回到默认布局。
        </p>
        {snapshot.widgets.length === 0 ? (
          <div className={styles.empty}>暂无插件注册小组件。</div>
        ) : (
          <div className={styles.list}>
            {snapshot.widgets.map((widget) => {
              const title = typeof widget.title === 'function' ? widget.title() : widget.title;
              const open = runtime.isOpen(widget.id);
              return (
                <div key={widget.id} className={styles.listRow}>
                  <div className={styles.listMain}>
                    <span className={styles.listId}>{widget.id}</span>
                    <span className={styles.listMeta}>
                      {title} · 来源 {widget.owner} · {widget.presentation}
                    </span>
                  </div>
                  <div className={styles.listActions}>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={widget.presentation === 'tray'}
                      onClick={() => {
                        runtime.toggle(widget.id);
                      }}
                    >
                      {open ? '收起' : '打开'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className={styles.footer}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const ok = runtime.resetLocal();
            setNotice(
              ok
                ? '本机布局已清空：托盘顺序、卡片位置与尺寸都回到默认。'
                : '本机布局存储不可用（隐私模式或配额满），已经在用默认布局。',
            );
          }}
        >
          清空本机布局
        </Button>
        <span className={styles.rowHint}>
          框架 v{runtime.frameworkVersion} · 契约 SPEC v{String(runtime.specVersion)}
        </span>
      </div>
    </div>
  );
}
