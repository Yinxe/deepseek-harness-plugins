/**
 * Client 入口（浏览器）
 * 打包后为单文件 lib/client.js，格式与原手写 bundle 一致：
 *   window.__ModuleLoader__.load({ id, factory: (require) => {...} })
 *
 * - React / P 由 factory 的 require 运行时注入，不打包进 bundle（external）
 * - 自有模块（styles/api/components/VisionSection）全部内联打包
 */
import { CSS } from './styles.js';
import { createVisionSection } from './VisionSection.js';
import type { DshRequire } from './types.js';

declare global {
  interface Window {
    __ModuleLoader__?: {
      load: (mod: { id: string; factory: (require: DshRequire) => unknown }) => void;
    };
  }
}

const PLUGIN_ID = '@dshp/vision-bridge';

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
      const VisionSection = createVisionSection(React, P);

      const exportsObj = exportsShim as { inject?: string[]; apply?: (ctx: any) => void };
      exportsObj.inject = ['slots'];
      exportsObj.apply = function apply(ctx: any): void {
        const slots = ctx.get('slots') as any;
        if (slots === undefined) return;

        const style = document.createElement('style');
        style.setAttribute('data-plugin-css', 'dshp-vision-bridge/settings.css');
        style.textContent = CSS;
        document.head.appendChild(style);
        ctx.effect(() => () => style.remove(), 'dshp-vision-bridge: section styles');

        const Section = VisionSection;
        slots.inject('settings.section', () =>
          slots.register(
            { name: 'settings.section', id: 'dshp-vision-bridge', order: 25, label: '视觉模型' },
            Section,
          ),
        );
      };

      return moduleShim.exports;
    },
  });
}

register();
