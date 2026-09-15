/**
 * @dshp/widget-kit —— Host 半（Cordis 插件）
 *
 * 这个插件**不含业务**：它只提供小组件规范与宿主。Host 半的职责因此也很窄 ——
 *
 *  1. 声明自己的 settings 命名空间 `dshp-widget-kit`（框架偏好：托盘开关、图标上限、徽标间隔…）；
 *  2. 提供两条同源路由给 Client 半读/写偏好；
 *  3. 不碰用户文件、不注册模型工具、不在启动路径上做任何重活。
 *
 * 「本机布局」（托盘顺序、卡片位置尺寸、隐藏集合）刻意**不进 settings.yaml** —— 它是每台浏览器
 * 的临时状态，存在 localStorage；这条边界写在 docs/widget-spec.md。
 *
 * @module @dshp/widget-kit
 */
import type { IncomingMessage, ServerResponse } from 'node:http';
import { ConfigSchema, DEFAULT_CONFIG, NS, sanitizePatchConfig } from './config.js';
import { registerRoutes } from './routes.js';
import type { AnyCtx, AnySettings, FrameworkConfig, FrameworkConfigPatch } from './types.js';

export const name = '@dshp/widget-kit';
/** webServer 是硬依赖（没有它设置页读不到配置）；settings 走可选获取 + 降级。 */
export const inject: string[] = ['webServer'];
export { NS, ConfigSchema };

export function apply(ctx: AnyCtx, rawConfig: unknown): void {
  const patchFromLoader = sanitizePatchConfig(rawConfig);
  const entry: FrameworkConfig = { ...DEFAULT_CONFIG, ...patchFromLoader };

  let current: () => FrameworkConfig = () => entry;

  // ── settings 命名空间（可选服务：缺了就退化成「只读默认值」）──────────
  try {
    ctx.inject(['settings'], (sctx: AnyCtx) => {
      try {
        sctx.settings.installSection(ctx, NS, ConfigSchema, entry, {
          setSource: (src: () => FrameworkConfig) => {
            current = src;
          },
          onChange: () => {},
        });
      } catch (error) {
        console.error(
          '[dshp-widget-kit] 注册 settings 分节失败，偏好将使用默认值：' +
            String((error as Error)?.message ?? error),
        );
      }
    });
  } catch (error) {
    console.error('[dshp-widget-kit] settings 服务注入失败：' + String((error as Error)?.message ?? error));
  }

  function getConfig(): FrameworkConfig {
    try {
      const value = current() as unknown;
      if (value !== null && typeof value === 'object') return value as FrameworkConfig;
    } catch {
      /* ignore */
    }
    return entry;
  }

  function snapshot(): FrameworkConfig {
    const config = getConfig();
    // 逐字段消毒后再交出去：settings 里的值来自用户手改的 YAML，不能直接信
    const patch = sanitizePatchConfig(config) ?? {};
    return { ...DEFAULT_CONFIG, ...patch };
  }

  async function update(patchObj: FrameworkConfigPatch): Promise<void> {
    let settings: AnySettings = null;
    try {
      settings = ctx.get('settings') as AnySettings;
    } catch {
      settings = null;
    }
    if (!settings) {
      throw new Error(
        'settings 服务不可用，无法持久化小组件偏好（请重启 DSH 或检查 FileSettingsProvider 是否挂载）',
      );
    }
    await settings.update(NS, patchObj);
  }

  // ── 同源 JSON 路由：GET state / POST config ──────────────────────────
  try {
    registerRoutes(ctx, { snapshot, update });
  } catch (error) {
    console.error(
      '[dshp-widget-kit] 注册 /ext 路由失败，设置页将看不到配置：' +
        String((error as Error)?.message ?? error),
    );
  }

  // 启动路径上只留一行日志（本仓规范：不超过 3 行）
  console.info(`[dshp-widget-kit] 小组件宿主已就绪（NS=${NS}）`);
}

/** 让 TS 不把仅类型用到的 import 视为未使用。 */
export type { FrameworkConfig, IncomingMessage, ServerResponse };
