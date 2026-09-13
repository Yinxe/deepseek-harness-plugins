/**
 * Client 入口（浏览器）
 *
 * 打包后为单文件 lib/client.js，格式与其他 @dshp/* 插件一致：
 *   window.__ModuleLoader__.load({ id, factory: (require) => {...} })
 *
 * - React / primitives 由 factory 的 require 运行时注入，不打包进 bundle（external）
 * - 自有模块（types/diff/styles/FileChangeRow）全部内联打包
 *
 * 挂载点：`slots` 服务的 `tool.call.toolview` 槽位（keyed，按线上工具名分发）。
 * 注册 `edit` / `write` 即**替换**官方内置卡片（官方文档：「a key the shipped composition
 * already covers is replaced, not shared」），`str_replace_editor` 是同类文件修改工具的
 * 兼容项——该工具未挂载时这条注册不会渲染任何东西，纯增量。
 *
 * @module @dshp/file-change-viewer/client
 */
import { createFileChangeRow } from './FileChangeRow.js';
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

/** 接管的卡片键：edit / write 为主目标，str_replace_editor 为同类工具兼容项。 */
const TOOL_KEYS: readonly string[] = ['edit', 'write', 'str_replace_editor'];

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
      const FileChangeRow = createFileChangeRow(React, P);

      const exportsObj = exportsShim as { inject?: string[]; apply?: (ctx: any) => void };
      exportsObj.inject = ['slots'];
      exportsObj.apply = function apply(ctx: AnyCtx): void {
        const slots = ctx.get('slots') as SlotsService | undefined;
        if (slots === undefined) return;

        // ── 卡片样式（卸载时随 effect 收回） ──
        try {
          const style = document.createElement('style');
          style.setAttribute('data-plugin-css', 'dshp-file-change-viewer/cards.css');
          style.textContent = CSS;
          document.head.appendChild(style);
          ctx.effect(() => () => style.remove(), 'dshp-file-change-viewer: card styles');
        } catch (error) {
          console.error('[dshp-file-change-viewer] 注入卡片样式失败，工具卡片将缺少边框与角标样式：', error);
        }

        // ── 工具卡片接管（默认展开的文件变更视图） ──
        // 注意：inject 的回调可能在槽位声明时才被调用（异步），所以逐 key 的 try/catch
        // 必须写在回调**内部**——外层 try/catch 只挡得住 inject 本身的同步失败。
        try {
          ctx.effect(
            () =>
              slots.inject('tool.call.toolview', function* () {
                for (const key of TOOL_KEYS) {
                  try {
                    yield slots.register(
                      { name: 'tool.call.toolview', key, locale: CONVERSATION_NS, priority: SHADOW_PRIORITY },
                      FileChangeRow,
                    );
                  } catch (error) {
                    // 例如同一 key 的同一优先级被别的插件（动态注册）占了：这一张卡片沿用内置渲染，其余照常接管。
                    console.error(
                      '[dshp-file-change-viewer] 接管 ' + key + ' 卡片失败，该工具将沿用内置卡片：',
                      error,
                    );
                  }
                }
              }),
            'dshp-file-change-viewer: edit/write tool cards',
          );
        } catch (error) {
          console.error(
            '[dshp-file-change-viewer] 注册文件修改卡片失败，edit / write 将回落到内置卡片：',
            error,
          );
        }
      };

      return moduleShim.exports;
    },
  });
}

register();
