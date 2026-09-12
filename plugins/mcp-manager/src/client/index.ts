/**
 * @dshp/mcp-manager —— Client 入口（浏览器）
 *
 * 打包后为单文件 lib/client.js（IIFE）：
 *  - window.__ModuleLoader__.load({ id, factory }) 注册模块
 *  - React / P 由 factory 的 require 运行时注入，不打包进 bundle（external）
 *  - 自有模块（styles/components/McpSection）全部内联打包
 */
import { CSS } from './styles.js';
import { createMcpSection } from './McpSection.js';
import type { DshRequire } from './types.js';

declare global {
  interface Window {
    __ModuleLoader__?: {
      load: (mod: { id: string; factory: (require: DshRequire) => unknown }) => void;
    };
  }
}

const PLUGIN_ID = '@dshp/mcp-manager';

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
      const Section = createMcpSection(React, P);

      const exportsObj = exportsShim as { inject?: string[]; apply?: (ctx: any) => void };
      exportsObj.inject = ['slots'];
      exportsObj.apply = function apply(ctx: any): void {
        const slots = ctx.get('slots') as any;
        if (slots === undefined) return;

        const style = document.createElement('style');
        style.setAttribute('data-plugin-css', 'dshp-mcp-manager/settings.css');
        style.textContent = CSS;
        document.head.appendChild(style);
        ctx.effect(() => () => style.remove(), 'dshp-mcp-manager: section styles');

        ctx.effect(
          () =>
            slots.inject('settings.section', () =>
              slots.register(
                { name: 'settings.section', id: 'dshp-mcp-manager', order: 30, label: 'MCP' },
                Section,
              ),
            ),
          'dshp-mcp-manager: settings section',
        );
      };

      return moduleShim.exports;
    },
  });
}

register();
