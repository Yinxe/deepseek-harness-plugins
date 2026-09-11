/**
 * Client 入口（浏览器）
 * 打包后为单文件 lib/client.js，格式与原手写 bundle 一致：
 *   window.__ModuleLoader__.load({ id, factory: (require) => {...} })
 *
 * - React / P 由 factory 的 require 运行时注入，不打包进 bundle（external）
 * - 自有模块（styles/api/components/QuotaSection/StatsSection/TokenMeterSection）全部内联打包
 *
 * 合并来源：
 *  - quota：sidebar.footer.action + shell.overlay(供应商菜单+额度浮窗) +
 *    settings.section + tool.view.cordis(self)
 *  - stats：settings.section(order 27) + sidebar.footer.action(today) + shell.overlay(今日浮窗)
 * 新插件收敛为：settings.section(dshp-token-meter, order 27，精简开关+供应商管理) +
 * shell.overlay(额度浮窗+今日浮窗+widget 浮层) + sidebar.right.pane.tab 双 tab
 * （kind token-meter-quota 额度富卡片 / token-meter-stats 完整图表，官方 inject 模式注册，
 * 首次自动打开）。左栏 sidebar.footer.action 已移除，全部搬到右栏。
 */
import { CSS } from './styles.js';
import { createTokenMeterSection } from './TokenMeterSection.js';
import type { DshRequire } from './types.js';

declare global {
  interface Window {
    __ModuleLoader__?: {
      load: (mod: { id: string; factory: (require: DshRequire) => unknown }) => void;
    };
  }
}

const PLUGIN_ID = '@dshp/token-meter';

/* 样式自愈：标签曾绑在 Cordis fiber 上（apply 插、释放删），与 slot 组件挂载时序错开就会“有组件无样式”。
   改为组件挂载兜底——只要任一界面在屏，style 标签必存在；fiber 释放时仅无人使用才删。 */
let tmStyleEl: HTMLStyleElement | null = null;
let tmStyleUsers = 0;
function tmEnsureStyles(): HTMLStyleElement | null {
  try {
    if (tmStyleEl && tmStyleEl.isConnected) return tmStyleEl;
    try {
      document.querySelectorAll('style[data-plugin-css="dshp-token-meter/settings.css"]').forEach((n) => n.remove());
    } catch { /* ignore */ }
    const tag = document.createElement('style');
    tag.setAttribute('data-plugin-css', 'dshp-token-meter/settings.css');
    tag.textContent = CSS;
    document.head.appendChild(tag);
    tmStyleEl = tag;
    return tag;
  } catch {
    return null;
  }
}

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
      let ReactDOM: any = null;
      try { ReactDOM = require('react-dom'); } catch { ReactDOM = null; }
      const parts = createTokenMeterSection(React, P, ReactDOM);
      const TokenMeterSettings = parts.TokenMeterSettings;
      const QuotaRightPane = parts.QuotaRightPane;
      const StatsRightPane = parts.StatsRightPane;
      const WidgetFloatLayer = parts.WidgetFloatLayer;

      function useTmStyles(): void {
        React.useEffect(() => {
          const tag = tmEnsureStyles();
          tmStyleUsers++;
          return () => {
            tmStyleUsers--;
            if (tmStyleUsers <= 0 && tag) {
              try { if (tag.isConnected) tag.remove(); } catch { /* ignore */ }
              if (tmStyleEl === tag) tmStyleEl = null;
            }
          };
        }, []);
      }

      const exportsObj = exportsShim as { inject?: string[]; apply?: (ctx: any) => void };
      // 官方右栏模式（对照 dsh-client-ui-sidebar-documentpreview）：
      // registry 与 controller 由右栏包提供，硬依赖声明后经 ctx 属性访问。
      exportsObj.inject = ['slots', 'sidebarRightTabs', 'sidebarRight'];
      exportsObj.apply = function apply(ctx: any): void {
        const slots = ctx.get('slots') as any;
        if (slots === undefined) return;

        tmEnsureStyles();
        ctx.effect(() => () => {
          if (tmStyleUsers <= 0 && tmStyleEl) {
            try { tmStyleEl.remove(); } catch { /* ignore */ }
            tmStyleEl = null;
          }
        }, 'dshp-token-meter: section styles');

        // 旧 localStorage 一次性清理：左栏开关已并入右侧栏；旧双浮窗系统已停用（widget 浮窗无外框、原位隐藏），
        // 旧键直接删掉，避免残留 floatOpen 导致幽灵浮窗。
        try {
          window.localStorage.removeItem('token-stats.sidebar-today');
          window.localStorage.removeItem('tquota.float.open');
          window.localStorage.removeItem('tquota.float.pos');
          window.localStorage.removeItem('tm-quota-float');
          window.localStorage.removeItem('tm-quota-float-pos');
          window.localStorage.removeItem('ts-today.float.open');
          window.localStorage.removeItem('ts-today.float.pos');
          window.localStorage.removeItem('tm-today.float.open');
          window.localStorage.removeItem('tm-today.float.pos');
        } catch {
          /* ignore */
        }

        function SettingsEntry(p: any): any {
          useTmStyles();
          return React.createElement(TokenMeterSettings, p);
        }

        slots.inject('settings.section', () =>
          slots.register(
            { name: 'settings.section', id: 'dshp-token-meter', order: 27, label: 'Token 计量' },
            SettingsEntry,
          ),
        );

        function TokenMeterFloatEntry(props: any): any {
          useTmStyles();
          // 统一浮层：只有 widget 浮窗（无外框，原封装卡即外观）。旧额度/今日浮窗已停用。
          return React.createElement(WidgetFloatLayer, props);
        }

        slots.inject('shell.overlay', () =>
          slots.register({ name: 'shell.overlay', id: 'dshp-token-meter-float' }, TokenMeterFloatEntry),
        );

        // ── 右侧栏双 tab（官方模式：inject 声明 + ctx 属性 + ctx.effect 持有）───
        // 「额度」：全部供应商展开富卡片；「用量」：完整统计图表。左栏入口已移除，全部搬到右栏。
        const QUOTA_TAB = '@dshp/token-meter-quota';
        const STATS_TAB = '@dshp/token-meter-stats';
        {
            ctx.effect(
              () =>
                ctx.sidebarRightTabs.register({
                  id: QUOTA_TAB,
                  kind: 'token-meter-quota',
                  title: () => 'Token 额度',
                  guide: [
                    {
                      order: 20,
                      title: () => 'Token 额度',
                      description: () => '全部供应商额度一览',
                    },
                  ],
                }),
              'dshp-token-meter: right tab quota',
            );
            ctx.effect(
              () =>
                ctx.sidebarRightTabs.register({
                  id: STATS_TAB,
                  kind: 'token-meter-stats',
                  title: () => 'Token 用量',
                  guide: [
                    {
                      order: 21,
                      title: () => 'Token 用量',
                      description: () => '用量趋势与模型分布',
                    },
                  ],
                }),
              'dshp-token-meter: right tab stats',
            );
            const QuotaPane = function QuotaPane(p: any): any {
              useTmStyles();
              return React.createElement(
                'div',
                { style: { height: '100%', minHeight: 0, overflow: 'auto', padding: '12px 14px' } },
                React.createElement(QuotaRightPane, p),
              );
            };
            const QuotaPaneTitle = function QuotaPaneTitle(): any {
              return React.createElement('span', null, 'Token 额度');
            };
            const StatsPane = function StatsPane(p: any): any {
              useTmStyles();
              return React.createElement(
                'div',
                { style: { height: '100%', minHeight: 0, overflow: 'auto', padding: '12px 14px' } },
                React.createElement(StatsRightPane, p),
              );
            };
            const StatsPaneTitle = function StatsPaneTitle(): any {
              return React.createElement('span', null, 'Token 用量');
            };
            slots.inject('sidebar.right.pane.tab', () =>
              slots.register({ name: 'sidebar.right.pane.tab', key: QUOTA_TAB }, QuotaPane),
            );
            slots.inject('sidebar.right.pane.tab.title', () =>
              slots.register({ name: 'sidebar.right.pane.tab.title', key: QUOTA_TAB }, QuotaPaneTitle),
            );
            slots.inject('sidebar.right.pane.tab', () =>
              slots.register({ name: 'sidebar.right.pane.tab', key: STATS_TAB }, StatsPane),
            );
            slots.inject('sidebar.right.pane.tab.title', () =>
              slots.register({ name: 'sidebar.right.pane.tab.title', key: STATS_TAB }, StatsPaneTitle),
            );
        }

        // 首次自动打开双 tab（仅一次；用户关闭后不再打扰）。
        // 右栏 seat 挂载晚于插件 apply 时重试几次（无 seat 的 openTab 会抛错，此时静默等下一次）。
        try {
          let done = false;
          try {
            done = window.localStorage.getItem('tm-righttabs-autoopened') === '1';
          } catch { /* ignore */ }
          if (!done) {
            let attempts = 0;
            const tryOpen = (): void => {
              attempts++;
              try {
                ctx.sidebarRight.openTab('token-meter-quota');
                ctx.sidebarRight.openTab('token-meter-stats');
                try {
                  window.localStorage.setItem('tm-righttabs-autoopened', '1');
                } catch { /* ignore */ }
              } catch {
                if (attempts < 5) window.setTimeout(tryOpen, attempts * 2000);
              }
            };
            window.setTimeout(tryOpen, 1500);
          }
        } catch { /* ignore */ }
      };

      return moduleShim.exports;
    },
  });
}

register();
