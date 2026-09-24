/**
 * 配置：schemastery schema（volatile 声明）
 *
 * - 官方 settings 命名空间 `dshp-vision-bridge`（与包名/路由前缀/cordis id 一致）
 * - 0.1.7 起配置持久化在 profile 的 `cordis.patch.yml` 条目 `config:` 分节，
 *   全部字段声明 `.volatile()`：设置页/路由写入经 `settings.update` 落到条目后
 *   原地提交进运行中的引用（`loader/volatile-update`），不重启插件 fiber。
 * - 只认 NS：历史命名空间（`vision-bridge` / `dshp-inx-vision-bridge`）与旧文件
 *   （`storages/*.json`）不再读写、不再迁移
 *
 * @module @dshp/vision-bridge
 */
import z from '@deepseek-ai/schemastery';
import { settingsNamespace } from './http.js';

export const NS: string = settingsNamespace('dshp-vision-bridge');

const VisionRouteSchema: any = z.object({
  provider: z.string().required(),
  model: z.string().required(),
});

export const ConfigSchema: any = z.object({
  enabled: z.boolean().default(true).volatile(),
  primary: z
    .union([VisionRouteSchema, z.const(null)])
    .default(null)
    .volatile(),
  fallback: z
    .union([VisionRouteSchema, z.const(null)])
    .default(null)
    .volatile(),
  detail: z
    .union([z.const('auto'), z.const('low'), z.const('high')])
    .default('auto')
    .volatile(),
  maxImages: z.number().step(1).min(1).max(8).default(4).volatile(),
  promptTemplate: z.string().default('').volatile(),
});
