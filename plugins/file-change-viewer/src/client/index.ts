/**
 * Client 入口（浏览器）
 *
 * 打包后为单文件 lib/client.js，格式与其他 @dshp/* 插件一致：
 *   window.__ModuleLoader__.load({ id, factory: (require) => {...} })
 *
 * - React / primitives 由 factory 的 require 运行时注入，不打包进 bundle（external）
 * - 自有模块（types/api/prefs/styles/FileChangeRow/FileChangeViewerSection）全部内联打包
 *
 * 两处注册，互不干扰：
 *
 * 1. `settings.section`（list 槽位）：设置左侧导航里的「File Change View」一节——本插件**自己的配置区**，
 *    `id` 用本插件的 settings 命名空间（与本仓其它插件一致），而不是往通用页面里塞控件。
 * 2. `tool.call.toolview`（keyed 槽位，按线上工具名分发）：注册 `edit` / `write` 即**替换**官方内置
 *    卡片（官方文档：「a key the shipped composition already covers is replaced, not shared」），
 *    `str_replace_editor` 是同类文件修改工具的兼容项——该工具未挂载时这条注册不渲染任何东西，纯增量。
 * 3. `conversation.session.header.utilities`（list 槽位，session 作用域）：会话页头右侧的两个快捷
 *    开关（一键展开 / 收起所有文件 diff、切换差异视图）。它们改的是**会话级覆盖**（`session.ts`，
 *    只在内存里、换会话即失效），不碰 `settings.yaml` 里的全局偏好。
 *
 * @module @dshp/file-change-viewer/client
 */
import { createFileChangeRow } from './FileChangeRow.js';
import { createLocator } from './locate.js';
import { createFileChangeViewerSection } from './FileChangeViewerSection.js';
import { createPrefs } from './prefs.js';
import { createSessionControls } from './SessionControls.js';
import { createSessionOverrides } from './session.js';
import { CSS } from './styles.js';
import type { AnyCtx, DshRequire, SlotsService } from './types.js';

declare global {
  interface Window {
    __ModuleLoader__?: {
      load: (mod: { id: string; factory: (require: DshRequire) => unknown }) => void;
    };
  }
}

const PLUGIN_ID = '@dshp/file-change-viewer';

/** 会话本地化命名空间：由官方 `dsh-client-ui-conversation` 持有并供工具卡片渲染器共用。 */
const CONVERSATION_NS = 'conversation';

/**
 * 影子化内置卡片所需的注册优先级。
 *
 * keyed 槽位按「key + priority」去重，**同 key 同 priority 会直接抛错**
 * （`keyed slot "…" already has an entry for key "edit" at priority 0 … register at a
 * different priority to shadow it (lowest renders)`）；派发本身把 entries 按 priority 升序
 * 取每个 key 的**第一条**，所以「数值最小者渲染」。官方 `file-mutation-toolview` 注册
 * edit / write 时没有传 priority（即 0），因此这里必须比 0 **更小**才能接管。
 *
 * 取 -1 而不是更小的值是有意的：动态 Cordis 插件（`cordis_define`）的影子优先级由运行时
 * 从 -1 开始逐个分配，取 -1 意味着「两份注册同时存在时会明确撞车并打出日志」，而不是让
 * 其中一份悄悄失效。
 */
const SHADOW_PRIORITY = -1;

/**
 * 接管的行键。
 *
 * - `edit` / `write`：官方内置行，本插件用影子优先级替换；
 * - `str_replace_editor`：同类文件修改工具的兼容项（该工具未挂载时这条注册不渲染任何东西）；
 * - `patch`：**本插件 Host 半自己注册的工具**（一次改多处 / 多文件），同样用这张卡片渲染。
 */
const TOOL_KEYS: readonly string[] = ['edit', 'write', 'str_replace_editor', 'patch'];

/** 设置节 id = settings 命名空间 = cordis 行 id（仓库约定：NS 四处同名）。 */
const SETTINGS_NS = 'dshp-file-change-viewer';

/**
 * 设置节的导航排序。
 *
 * `settings.section` 的 `order` 要与本仓其它插件错开（vision-bridge 25 / mcwiki-search 26 /
 * token-meter 27 / search-provider 28 / skill-manager 29 / mcp-manager 30），31 是下一个空位。
 */
const SETTINGS_ORDER = 31;

/**
 * 设置节在左侧导航里的标题。
 *
 * 英文短语与同一份导航里的 `Skills` / `MCP` 一致（短、一眼扫得到），也正好是这一节的职责：
 * 这一节管的是**文件改动的视图**，不是某个具体卡片的开关。改这一个常量即可换名字，
 * `check-client.mjs` 有断言守着。
 */
const SETTINGS_LABEL = 'File Change View';

/** 会话页头右侧工具区（官方 `open-in-app`、会话日志下载都在这里）。 */
const HEADER_SLOT = 'conversation.session.header.utilities';

/**
 * 页头开关在工具区里的位置。
 *
 * 该槽位按 `order` 升序排列（官方 `open-in-app` 是 -10，会话日志下载默认 0），20 让它落在最右侧。
 */
const HEADER_ORDER = 20;

function register(): void {
  const loader = (
    typeof window !== 'undefined' ? window.__ModuleLoader__ : undefined
  ) as Window['__ModuleLoader__'];
  if (!loader || typeof loader.load !== 'function') return;
  loader.load({
    id: PLUGIN_ID,
    factory: (require: DshRequire) => {
      const moduleShim = { exports: {} as Record<string, unknown> };
      const exportsShim = moduleShim.exports;
      Object.defineProperty(exportsShim, Symbol.toStringTag, { value: 'Module' });

      const React = require('react');
      const P = require('@deepseek-ai/dsh-client-ui-primitives');

      const exportsObj = exportsShim as { inject?: string[]; apply?: (ctx: any) => void };
      exportsObj.inject = ['slots'];
      exportsObj.apply = function apply(ctx: AnyCtx): void {
        const slots = ctx.get('slots') as SlotsService | undefined;
        if (slots === undefined) return;

        // 偏好缓存：设置节与工具行共用同一个（改完偏好，已渲染的文件块同步换视图）。
        const prefsFace = createPrefs(React);
        // 会话级覆盖：页头两个快捷开关与所有工具行共用（不落盘，换会话即失效）。
        const sessionFace = createSessionOverrides(React);
        // 真实行号：patch 自带 `@@` 偏移；edit / write 的元数据里没有，靠 locator 问 Host 定位。
        const locator = createLocator(React);
        const FileChangeRow = createFileChangeRow(React, P, prefsFace, locator, sessionFace);
        const FileChangeViewerSection = createFileChangeViewerSection(React, P, prefsFace);
        const SessionControls = createSessionControls(React, P, prefsFace, sessionFace);

        // ── 样式（卸载时随 effect 收回） ──
        try {
          const style = document.createElement('style');
          style.setAttribute('data-plugin-css', 'dshp-file-change-viewer/settings.css');
          style.textContent = CSS;
          document.head.appendChild(style);
          ctx.effect(() => () => style.remove(), 'dshp-file-change-viewer: styles');
        } catch (error) {
          console.error('[dshp-file-change-viewer] 注入样式失败，行内统计与差异底色会缺失：', error);
        }

        // ── 设置节（设置 → 左侧导航「File Change View」）：展示方式两卡 + 上下文行数 + 默认展开 + patch 开关 ──
        try {
          ctx.effect(
            () =>
              slots.inject('settings.section', () =>
                slots.register(
                  { name: 'settings.section', id: SETTINGS_NS, order: SETTINGS_ORDER, label: SETTINGS_LABEL },
                  FileChangeViewerSection,
                ),
              ),
            'dshp-file-change-viewer: settings section',
          );
        } catch (error) {
          console.error(
            '[dshp-file-change-viewer] 注册设置节失败，两项偏好将只能手改 settings.yaml：',
            error,
          );
        }

        // ── 会话页头快捷开关（只影响当前会话，不碰 settings.yaml） ──
        try {
          ctx.effect(
            () =>
              slots.inject(HEADER_SLOT, () =>
                slots.register({ name: HEADER_SLOT, id: SETTINGS_NS, order: HEADER_ORDER }, SessionControls),
              ),
            'dshp-file-change-viewer: session header controls',
          );
        } catch (error) {
          console.error('[dshp-file-change-viewer] 注册会话页头快捷开关失败，设置页仍然可用：', error);
        }

        // ── 工具行接管（原生行 + 每个文件块的差异视图） ──
        // 注意：inject 的回调可能在槽位声明时才被调用（异步），所以逐 key 的 try/catch
        // 必须写在回调**内部**——外层 try/catch 只挡得住 inject 本身的同步失败。
        try {
          ctx.effect(
            () =>
              slots.inject('tool.call.toolview', function* () {
                for (const key of TOOL_KEYS) {
                  try {
                    yield slots.register(
                      {
                        name: 'tool.call.toolview',
                        key,
                        locale: CONVERSATION_NS,
                        priority: SHADOW_PRIORITY,
                      },
                      FileChangeRow,
                    );
                  } catch (error) {
                    // 例如同一 key 的同一优先级被别的插件（动态注册）占了：这一行沿用内置渲染，其余照常接管。
                    console.error(
                      '[dshp-file-change-viewer] 接管 ' + key + ' 行失败，该工具将沿用内置行：',
                      error,
                    );
                  }
                }
              }),
            'dshp-file-change-viewer: edit/write tool cards',
          );
        } catch (error) {
          console.error('[dshp-file-change-viewer] 注册文件修改行失败，edit / write 将回落到内置行：', error);
        }
      };

      return moduleShim.exports;
    },
  });
}

register();
