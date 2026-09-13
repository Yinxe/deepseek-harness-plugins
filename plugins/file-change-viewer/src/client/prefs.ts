/**
 * 显示偏好：一份进程内权威缓存 + 与 Host 的读写往返
 *
 * 偏好真正的家在 **`settings.yaml` 的 `dshp-file-change-viewer` 分节**（Host 半 `installSection`
 * 注册的 settings 命名空间）。客户端不自己造第二事实源：
 *
 * | 操作     | 路径                                                              |
 * | -------- | ----------------------------------------------------------------- |
 * | 首次读   | `GET  /ext/dshp-file-change-viewer/state`（`apply` 时拉一次）      |
 * | 写一项   | `POST /ext/dshp-file-change-viewer/config` → Host `settings.update` |
 * | 订阅     | 内存缓存变更通知（工具行与设置节订阅同一个 store）                 |
 *
 * 写是**乐观**的：先把新值挂上缓存让界面立刻响应，Host 应答后再采纳回写的权威值；失败则回滚到
 * 上一次的值并把错误挂给设置节显示（绝不假装保存成功）。
 *
 * 这座 store 是设置节「文件修改卡片」与每个工具行共用的同一份订阅源，所以改完偏好，已经渲染在
 * 会话里的文件块也会跟着换视图；同时它只依赖 `/ext` 路由，不依赖 `settingsScope` 的挂载时序
 * （服务晚挂载时那条路会静默退化成只读默认值）。
 *
 * @module @dshp/file-change-viewer/client/prefs
 */
import { fetchState, saveConfig } from './api.js';
import type { AnyReact, ConfigPatch, PrefField, SavePhase, ViewerPrefs } from './types.js';

/** 默认值（与 Host 的 `DEFAULT_CONFIG` 同值；Host 读不到时的兜底）。 */
export const DEFAULT_PREFS: ViewerPrefs = { view: 'highlight', sectionsOpen: false };

/** 偏好读写面：设置节与工具行共用。 */
export interface PrefsFace {
  /** 订阅 + 读取当前偏好（组件内用）。 */
  usePrefs: () => ViewerPrefs;
  /** 写一项偏好（乐观更新 + 落 settings.yaml）。 */
  setPref: (field: PrefField, value: unknown) => void;
  /** 订阅保存态（设置节显示「已保存 / 保存失败」）。 */
  useSaveState: () => { phase: SavePhase; error: string | null };
  /** 重新从 Host 读一次（设置节的「重新读取」按钮）。 */
  reload: () => void;
}

/**
 * 外部存储不可信：逐字段校验，坏值回默认。
 *
 * @param raw - `settings.yaml` 里这一节的值（不透明）。
 * @returns 合法偏好。
 */
export function sanitizePrefs(raw: unknown): ViewerPrefs {
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) return { ...DEFAULT_PREFS };
  const record = raw as Record<string, unknown>;
  return {
    view: record['view'] === 'diff' ? 'diff' : 'highlight',
    sectionsOpen: record['sectionsOpen'] === true,
  };
}

/**
 * 造偏好读写面。
 *
 * @param React - 运行时注入的 React。
 * @returns 可直接交给设置节与工具行的 `PrefsFace`。
 */
export function createPrefs(React: AnyReact): PrefsFace {
  let prefs: ViewerPrefs = { ...DEFAULT_PREFS };
  let phase: SavePhase = 'idle';
  let error: string | null = null;
  const listeners = new Set<() => void>();

  function notify(): void {
    for (const listener of Array.from(listeners)) {
      try {
        listener();
      } catch {
        /* 订阅者自己的异常不该影响其它订阅者 */
      }
    }
  }

  function messageOf(cause: unknown): string {
    return String((cause as Error)?.message ?? cause);
  }

  function read(): void {
    phase = 'loading';
    error = null;
    notify();
    fetchState()
      .then((response) => {
        if (response && response.ok) {
          prefs = sanitizePrefs(response.config);
          phase = 'ready';
        } else {
          phase = 'error';
          error = (response && response.error) || '读取配置失败';
        }
        notify();
      })
      .catch((cause: unknown) => {
        phase = 'error';
        error = '读取配置失败：' + messageOf(cause);
        notify();
      });
  }

  function write(field: PrefField, previous: ViewerPrefs): void {
    const patch: ConfigPatch = {};
    if (field === 'view') patch.view = prefs.view;
    else patch.sectionsOpen = prefs.sectionsOpen;
    saveConfig(patch)
      .then((response) => {
        if (response && response.ok) {
          prefs = sanitizePrefs(response.config);
          phase = 'ready';
          error = null;
        } else {
          prefs = previous;
          phase = 'error';
          error = '保存失败：' + ((response && response.error) || '未知错误');
        }
        notify();
      })
      .catch((cause: unknown) => {
        prefs = previous;
        phase = 'error';
        error = '保存失败：' + messageOf(cause);
        notify();
      });
  }

  function setPref(field: PrefField, value: unknown): void {
    const candidate = sanitizePrefs({ ...prefs, [field]: value });
    if (candidate[field] === prefs[field]) return;
    const previous = prefs;
    prefs = candidate;
    phase = 'saving';
    error = null;
    notify();
    write(field, previous);
  }

  function useSnapshot<T>(pick: () => T): T {
    const [, bump] = React.useState(0) as [number, (next: number | ((prev: number) => number)) => void];
    React.useEffect(() => {
      const listener = (): void => bump((tick: number) => tick + 1);
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    }, []);
    return pick();
  }

  // 首次读取：`apply` 阶段就发起，工具行与设置节挂载时通常已经有值。
  if (typeof fetch === 'function') read();

  return {
    usePrefs: () => useSnapshot(() => prefs),
    useSaveState: () => useSnapshot(() => ({ phase, error })),
    setPref,
    reload: read,
  };
}
