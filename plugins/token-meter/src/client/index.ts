/**
 * Client 入口（浏览器）
 * 打包后为单文件 lib/client.js，格式与原手写 bundle 一致：
 *   window.__ModuleLoader__.load({ id, factory: (require) => {...} })
 *
 * - React / P 由 factory 的 require 运行时注入，不打包进 bundle（external）
 * - 自有模块（styles/api/components/CenterView/QuotaSection/StatsSection/OnlineSection）全部内联打包
 *
 * 界面收敛为三个入口：
 *  1. settings.section(dshp-token-meter, order 27)：精简偏好 + 供应商增删改（唯一配置入口）
 *  2. conversation.view「展示名见 src/name.ts」(order 40)：中心区 tab，与原生「对话 / 轨迹」并列；
 *     tab 内部用左侧菜单切换 额度查询 / 用量统计 / 在线统计（见 CenterView.ts）
 *  3. shell.overlay：小组件浮层（把某个图表/额度卡单独拖出来常驻）
 *
 * 历史：额度/用量/在线曾各自占一个右侧栏 tab（sidebar.right.pane.tab），2026-09 收敛为
 * 中心区单 tab + 侧边菜单 —— 三个会话级 tab 会盖过产品自带的 对话/轨迹。
 */
import { CSS } from './styles.js';
import { DISPLAY_NAME } from '../name.js';
import { createCenterView } from './CenterView.js';
import { createIcons } from './icons.js';
import { createOnlineSection } from './OnlineSection.js';
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
      document
        .querySelectorAll('style[data-plugin-css="dshp-token-meter/settings.css"]')
        .forEach((n) => n.remove());
    } catch {
      /* ignore */
    }
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
      try {
        ReactDOM = require('react-dom');
      } catch {
        ReactDOM = null;
      }
      const parts = createTokenMeterSection(React, P, ReactDOM);
      const onlineParts = createOnlineSection(React, ReactDOM, parts.statsApi);
      const TokenMeterSettings = parts.TokenMeterSettings;
      const WidgetFloatLayer = parts.WidgetFloatLayer;
      const WidgetsApi = parts.widgetsApi;
      const icons = createIcons(React);

      function useTmStyles(): void {
        React.useEffect(() => {
          const tag = tmEnsureStyles();
          tmStyleUsers++;
          return () => {
            tmStyleUsers--;
            if (tmStyleUsers <= 0 && tag) {
              try {
                if (tag.isConnected) tag.remove();
              } catch {
                /* ignore */
              }
              if (tmStyleEl === tag) tmStyleEl = null;
            }
          };
        }, []);
      }

      // 配置页组件：设置面板（settings.section）与中心区 tab 的「设置」分区共用同一个，
      // 改一处两边同步；两边都走 useTmStyles 保证样式在屏即有。
      function TokenMeterSettingsEntry(props: any): any {
        useTmStyles();
        return React.createElement(TokenMeterSettings, props);
      }
      const TokenMeterCenterView = createCenterView(
        React,
        {
          QuotaView: parts.QuotaView,
          StatsView: parts.StatsView,
          OnlineView: onlineParts.OnlineView,
          OnlineEmbed: onlineParts.OnlineEmbed,
          SettingsView: TokenMeterSettingsEntry,
          SharePanel: parts.SharePanel,
        },
        icons,
      );

      const exportsObj = exportsShim as { inject?: string[]; apply?: (ctx: any) => void };
      // 只依赖 slots：中心区 tab 走 conversation.view 注册，不再需要右侧栏的 registry/controller。
      exportsObj.inject = ['slots'];
      exportsObj.apply = function apply(ctx: any): void {
        const slots = ctx.get('slots') as any;
        if (slots === undefined) return;

        tmEnsureStyles();
        ctx.effect(
          () => () => {
            if (tmStyleUsers <= 0 && tmStyleEl) {
              try {
                tmStyleEl.remove();
              } catch {
                /* ignore */
              }
              tmStyleEl = null;
            }
          },
          'dshp-token-meter: section styles',
        );

        // 在线时长面板已不再支持弹出为浮窗（2026-09 简化）：清掉遗留的 online:* 浮窗记录，
        // 否则 localStorage 里那条会让浮层渲染一个已经不存在的组件。
        try {
          if (WidgetsApi && typeof WidgetsApi.forget === 'function') WidgetsApi.forget('online:');
        } catch {
          /* ignore */
        }

        // 旧 localStorage 一次性清理：左栏开关、旧双浮窗系统、右侧栏 tab 自动展开标记
        // 都已停用，旧键直接删掉，避免残留项影响后续行为。
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
          window.localStorage.removeItem('tm-righttabs-autoopened');
        } catch {
          /* ignore */
        }

        // 设置面板与中心区「设置」分区共用 TokenMeterSettingsEntry（见上）
        slots.inject('settings.section', () =>
          slots.register(
            { name: 'settings.section', id: 'dshp-token-meter', order: 27, label: DISPLAY_NAME },
            TokenMeterSettingsEntry,
          ),
        );

        function TokenMeterFloatEntry(props: any): any {
          useTmStyles();
          // 统一浮层：只有 widget 浮窗（无外框，原封装卡即外观）。
          return React.createElement(WidgetFloatLayer, props);
        }

        slots.inject('shell.overlay', () =>
          slots.register({ name: 'shell.overlay', id: 'dshp-token-meter-float' }, TokenMeterFloatEntry),
        );

        // ── 中心区单 tab（官方模式：inject 声明 + slots.inject 持有）───
        // 与原生「对话 / 轨迹」并列的一个 tab；tab 内用侧边菜单切换三块内容。
        // order 40：排在内置 chat(0) / trajectory(10) 与第三方视图之后。
        const CENTER_VIEW = 'dshp-token-meter';
        function TokenMeterCenterEntry(props: any): any {
          useTmStyles();
          return React.createElement(TokenMeterCenterView, props);
        }
        slots.inject('conversation.view', () =>
          slots.register(
            {
              name: 'conversation.view',
              id: CENTER_VIEW,
              order: 40,
              label: DISPLAY_NAME,
            },
            TokenMeterCenterEntry,
          ),
        );
      };

      return moduleShim.exports;
    },
  });
}

register();
