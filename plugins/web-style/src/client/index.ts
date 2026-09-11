/**
 * Client 入口（浏览器）
 * 打包后为单文件 lib/client.js，格式与原手写 bundle 一致：
 *   window.__ModuleLoader__.load({ id, factory: (require) => {...} })
 *
 * - React 由 factory 的 require 运行时注入，不打包进 bundle（external）
 * - 自有模块（types/state/api/styles/themes/md3/official/apply-theme/radius/Gallery）全部内联打包
 *
 * 原实现：dsh-custom-ui/client.js（JS，997 行，id 为 @dshp-inx/custom-ui）
 * 本文件为等价 TS 重写：apply 装配顺序与副作用清理逐行对齐。
 *
 * @module @dshp/web-style/client
 */
import { disposeOverride, restoreFromHost } from './apply-theme.js';
import { createBridge, type Bridge } from './api.js';
import { createGallery } from './GallerySection.js';
import { CSS } from './styles.js';
import type { AnyCtx, DshRequire, SlotsService, ThemeService } from './types.js';

declare global {
  interface Window {
    __ModuleLoader__?: {
      load: (mod: { id: string; factory: (require: DshRequire) => unknown }) => void;
    };
  }
}

const PLUGIN_ID = '@dshp/web-style';

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

      const exportsObj = exportsShim as { inject?: string[]; apply?: (ctx: any) => void };
      exportsObj.inject = ['slots', 'theme'];
      exportsObj.apply = function apply(ctx: AnyCtx): void {
        const slots = ctx.get('slots') as SlotsService | undefined;
        const theme = ctx.get('theme') as ThemeService | undefined;
        if (slots === undefined || theme === undefined) return;

        // 画廊设置页样式
        const style = document.createElement('style');
        style.setAttribute('data-plugin-css', 'dshp-web-style/gallery.css');
        style.textContent = CSS;
        document.head.appendChild(style);
        ctx.effect(() => () => style.remove(), 'dshp-web-style: section styles');

        const bridge: Bridge = createBridge();

        // 启动恢复：读 settings 持久化的 themeId 重建覆盖层（壁纸 MD3 从 seed 重建），同时恢复圆角
        restoreFromHost(theme, bridge);

        // 插件停止时清覆盖层（ctx.effect 自动收回）
        ctx.effect(() => () => disposeOverride(), 'dshp-web-style: override teardown');

        const Gallery = createGallery(React, ctx, theme, bridge);

        // 外观定制页 = 主题画廊（全局圆角等仍在画廊尾部）
        ctx.effect(
          () =>
            slots.inject('settings.section', () =>
              slots.register(
                { name: 'settings.section', id: 'dshp-web-style', order: 50, label: '外观定制' },
                Gallery,
              ),
            ),
          'dshp-web-style: settings section',
        );
      };

      return moduleShim.exports;
    },
  });
}

register();
