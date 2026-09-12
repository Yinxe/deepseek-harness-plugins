/**
 * @dshp/skill-manager —— Client 入口（浏览器）
 *
 * 打包后为单文件 lib/client.js（IIFE），与原手写 bundle 一致：
 *  - window.__ModuleLoader__.load({ id, factory }) 注册模块
 *  - React / P 由 factory 的 require 运行时注入，不打包进 bundle（external）
 *  - 自有模块（styles/components/SkillSection）全部内联打包
 *
 * 除设置页外还向 conversation.input.right（list 槽，纯附加）挂一个零尺寸探针，
 * 接收会话标准 props（inputActions/sessionId），供「新建技能」在当前工作区的
 * 新会话输入框里程序化写入 /skill-creator（InputActions.setDraft 为官方认可入口）。
 */
import { CSS } from './styles.js';
import { createSessionInputProbe, createSkillSection, ctxHolder } from './SkillSection.js';
import type { DshRequire } from './types.js';

declare global {
  interface Window {
    __ModuleLoader__?: {
      load: (mod: { id: string; factory: (require: DshRequire) => unknown }) => void;
    };
  }
}

const PLUGIN_ID = '@dshp/skill-manager';

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
      const Section = createSkillSection(React, P);
      const InputProbe = createSessionInputProbe(React);

      const exportsObj = exportsShim as { inject?: string[]; apply?: (ctx: any) => void };
      exportsObj.inject = ['slots'];
      exportsObj.apply = function apply(ctx: any): void {
        ctxHolder.current = ctx;
        const slots = ctx.get('slots') as any;
        if (slots === undefined) return;

        const style = document.createElement('style');
        style.setAttribute('data-plugin-css', 'dshp-skill-manager/settings.css');
        style.textContent = CSS;
        document.head.appendChild(style);
        ctx.effect(() => () => style.remove(), 'dshp-skill-manager: section styles');

        ctx.effect(
          () =>
            slots.inject('settings.section', () =>
              slots.register(
                { name: 'settings.section', id: 'dshp-skill-manager', order: 29, label: 'Skills' },
                Section,
              ),
            ),
          'dshp-skill-manager: settings section',
        );

        // 零尺寸探针：只为接收 inputActions/sessionId；ui-conversation 未挂载时静默跳过
        try {
          ctx.effect(
            () =>
              slots.inject('conversation.input.right', () =>
                slots.register(
                  { name: 'conversation.input.right', id: 'dshp-skill-manager', order: 90 },
                  InputProbe,
                ),
              ),
            'dshp-skill-manager: input right probe',
          );
        } catch {
          /* ignore */
        }
      };

      return moduleShim.exports;
    },
  });
}

register();
