/**
 * Client 入口（浏览器）
 * 打包后为单文件 lib/client.js，格式与原手写 bundle 一致：
 *   window.__ModuleLoader__.load({ id, factory: (require) => {...} })
 *
 * - React / P 由 factory 的 require 运行时注入，不打包进 bundle（external）
 * - 自有模块（styles/api/components/providers/SearchSection）全部内联打包
 * - 设置页密钥读写走 api 网关 remote.credentials 域，故 inject 里声明 remote
 *
 * 原实现：dsh-tavily-search/client.js（手写 __ModuleLoader__ bundle）
 * → 本文件为等价 TS 重写：section id / order 更新为 @dshp/search-provider 时代。
 *
 * @module @dshp/search-provider/client
 */
import { createBridge } from './api.js';
import { CSS } from './styles.js';
import { createSearchSection } from './SearchSection.js';
import type { DshRequire } from './types.js';

const PLUGIN_ID = '@dshp/search-provider';

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
      exportsObj.inject = ['slots', 'remote', 'remote.credentials'];
      exportsObj.apply = function apply(ctx: any): void {
        const slots = ctx.get('slots') as any;
        if (slots === undefined) return;

        const style = document.createElement('style');
        style.setAttribute('data-plugin-css', 'dshp-search-provider/settings.css');
        style.textContent = CSS;
        document.head.appendChild(style);
        ctx.effect(() => () => style.remove(), 'dshp-search-provider: section styles');

        const bridge = createBridge(ctx.get('remote'));
        const Section = createSearchSection(React, P, bridge);
        slots.inject('settings.section', () =>
          slots.register(
            { name: 'settings.section', id: 'dshp-search-provider', order: 27, label: 'AI 搜索' },
            Section,
          ),
        );
      };

      return moduleShim.exports;
    },
  });
}

register();
