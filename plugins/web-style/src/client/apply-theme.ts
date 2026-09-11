/**
 * apply-theme.ts —— 覆盖层架构：官方亮/暗为唯一偏好，自定义主题作为 token 覆盖层
 *
 * 设计（遵循官方系统，不再与之对抗）：
 *   - 不注册自定义主题 id——官方 ui-theme.preference 只认 light/dark/system，
 *     注册自定义 id 会让守护与 adopt 互相抢夺偏好。
 *   - 每套主题 = 一个 token 覆盖层 { 每 token: {light, dark} }：
 *     · 主题自身 scheme 分支填主题值；
 *     · 对侧分支填官方样式表原始值（var(--dsw-static-…) 引用，无操作覆盖），
 *       用户切官方亮/暗时覆盖层自动呈现对侧（=官方原样）。
 *   - 选主题 = overrideTokens('dshp-web-style', pair) + setTheme(主题 scheme)
 *     ——本质就是「切官方亮/暗 + 换 CSS」，与官方外观行完全同轨。
 *   - 「回到官方默认」= 撤销覆盖层（disposer）。
 *   官方 preference=system 时按 prefers-color-scheme 解析，覆盖层随之自动切换。
 *
 * 原实现：dsh-custom-ui/client.js 的 apply() 内闭包（findTheme / buildPair /
 * renderBodyGradient / applyThemeChoice + 启动恢复），逐行等价，仅改成模块函数
 * 并显式接收 theme / bridge 依赖。
 *
 * @module @dshp/web-style/client
 */
import { buildWallpaperTheme } from './md3.js';
import { OFFICIAL_DARK, OFFICIAL_LIGHT } from './official.js';
import { applyRadius } from './radius.js';
import { state } from './state.js';
import { PHOTO_ID, THEMES } from './themes.js';
import type { Bridge } from './api.js';
import type { ThemeMeta, ThemeService, TokenMap, TokenOverridePair } from './types.js';

/** 覆盖层来源标识（overrideTokens 的 source；撤销对同一 source 生效）。 */
export const OVERRIDE_SOURCE = 'dshp-web-style';

/** body 渐变样式元素 id（photo 主题专用）。 */
const BODY_GRADIENT_ID = 'dshp-web-style-body-gradient';

/**
 * 目录中查找静态主题。
 * photo:custom 是虚拟主题（无目录条目、不走 /themes 下发），由调用方的
 * PHOTO_ID 分支直接处理。
 */
export function findStaticTheme(id: string): ThemeMeta | null {
  for (const t of THEMES) if (t.id === id) return t;
  return null;
}

/**
 * 静态主题 token（单 scheme）→ 官方覆盖层 pair。
 * 主题自身 scheme 分支填主题值，对侧回官方原值（缺则沿用主题值）。
 */
function buildPair(t: ThemeMeta, tokens: TokenMap): TokenOverridePair {
  const officialSide = t.colorScheme === 'dark' ? OFFICIAL_LIGHT : OFFICIAL_DARK;
  const pair: TokenOverridePair = {};
  for (const [name, value] of Object.entries(tokens)) {
    const opposite = name in officialSide ? (officialSide[name] as string) : value;
    pair[name] =
      t.colorScheme === 'dark' ? { light: opposite, dark: value } : { dark: opposite, light: value };
  }
  return pair;
}

/** 壁纸主题：MD3 运行时亮暗双套都在本地，直接成对。 */
function buildPhotoPair(): TokenOverridePair | null {
  const wt = state.photoTheme;
  if (!wt) return null;
  const pair: TokenOverridePair = {};
  for (const [name, value] of Object.entries(wt.dark)) {
    pair[name] = { dark: value, light: wt.light[name] ?? value };
  }
  return pair;
}

/**
 * photo 主题的 body 渐变渲染：--dshp-ws-body-gradient 已在 token 层生效，
 * 这里把 body 背景替换成渐变（官方 body 无渐变概念，需 DOM 层补）。
 * 同步挂到 state 供 Gallery 的 theme/change 监听复调（亮暗切换重渲染）。
 */
export function renderBodyGradient(theme: ThemeService): void {
  state.renderBodyGradient = () => renderBodyGradient(theme);
  const old = document.getElementById(BODY_GRADIENT_ID);
  if (old) old.remove();
  const active = theme.getTheme();
  if (!active || !active.active || !active.active.tokens) return;
  const grad = active.active.tokens['--dshp-ws-body-gradient'];
  if (!grad) return;
  const style = document.createElement('style');
  style.id = BODY_GRADIENT_ID;
  style.textContent = 'body{background:' + grad + ' !important}';
  document.head.appendChild(style);
}

/**
 * 应用主题覆盖层 + 官方偏好切到主题 scheme。空 id = 撤销覆盖（回官方）。
 * 静态主题 token 问 Host 要（/themes，一次缓存）；photo 本地即有。
 * 异步到达时若用户已改选（state.desiredId 变化）则丢弃，避免后到覆盖先到。
 */
export function applyThemeChoice(theme: ThemeService, bridge: Bridge, themeId: string): void {
  try {
    if (state.overrideDispose) {
      state.overrideDispose();
      state.overrideDispose = null;
    }
    if (!themeId) {
      renderBodyGradient(theme);
      return;
    }
    if (themeId === PHOTO_ID) {
      const pair = buildPhotoPair();
      if (!pair) {
        renderBodyGradient(theme);
        return;
      }
      state.overrideDispose = theme.overrideTokens(OVERRIDE_SOURCE, pair);
      // photo 主题亮暗双套都在 pair 里，官方 preference 保持用户原选（system 由覆盖层自动跟随）
      renderBodyGradient(theme);
      return;
    }
    const t = findStaticTheme(themeId);
    if (!t) {
      console.warn('[dshp-web-style] 未知主题 id，已回官方: ' + themeId);
      state.desiredId = '';
      renderBodyGradient(theme);
      return;
    }
    bridge
      .themes()
      .then((map) => {
        if (state.desiredId !== themeId) return; // 已改选，丢弃
        const tokens = map[themeId];
        if (!tokens) {
          console.error('[dshp-web-style] 主题下发缺失: ' + themeId);
          return;
        }
        try {
          if (state.overrideDispose) {
            state.overrideDispose();
            state.overrideDispose = null;
          }
          state.overrideDispose = theme.overrideTokens(OVERRIDE_SOURCE, buildPair(t, tokens));
          const pref = theme.getTheme().preference;
          if (pref !== t.colorScheme) theme.setTheme(t.colorScheme);
        } catch (e) {
          console.error('[dshp-web-style] 主题覆盖失败: ' + String((e as Error)?.message ?? e));
        }
        renderBodyGradient(theme);
      })
      .catch((e: unknown) => {
        console.error('[dshp-web-style] 主题 token 下发失败: ' + String((e as Error)?.message ?? e));
      });
  } catch (e) {
    console.error('[dshp-web-style] 主题覆盖失败: ' + String((e as Error)?.message ?? e));
  }
}

/**
 * 启动恢复：读 settings 持久化的 themeId 重建覆盖层；壁纸 MD3 从持久化
 * seed（= photoPalette.accent，兼容旧数据的 seed 字段）重建 token；
 * 同时恢复全局圆角。
 */
export function restoreFromHost(theme: ThemeService, bridge: Bridge): void {
  bridge
    .state()
    .then((reply) => {
      if (!reply || reply.ok !== true) return;
      const saved = typeof reply.themeId === 'string' ? reply.themeId : '';
      const pal = reply.photoPalette;
      if (pal && typeof pal.accent === 'string') {
        state.photoTheme = buildWallpaperTheme(pal.seed ?? pal.accent);
      }
      state.desiredId = saved;
      if (saved.length > 0) applyThemeChoice(theme, bridge, saved);
      applyRadius(reply.radius);
      state.desiredRadius =
        reply.radius && typeof reply.radius.global === 'number' ? reply.radius.global : -1;
    })
    .catch((e: unknown) => {
      console.log('[dshp-web-style] 读取持久化配置失败: ' + String((e as Error)?.message ?? e));
    });
}

/** 插件停止时清覆盖层（由 ctx.effect 的清理函数调用）。 */
export function disposeOverride(): void {
  if (state.overrideDispose) {
    try {
      state.overrideDispose();
    } catch {
      /* 进程停止，忽略 */
    }
    state.overrideDispose = null;
  }
}
