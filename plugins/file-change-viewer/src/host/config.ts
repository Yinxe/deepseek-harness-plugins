/**
 * 配置：默认值 / schemastery schema / 补丁消毒
 *
 * - 官方 settings 命名空间 `dshp-file-change-viewer`（与 cordis 行 id 同名，仓库约定）
 * - 只认 NS：不读历史 key、不写自有文件（AGENT.md §7.1 / §7.3）
 *
 * @module @dshp/file-change-viewer
 */
import z from '@deepseek-ai/schemastery';
import type { PluginConfig, PluginConfigPatch } from './types.js';

/** settings 命名空间，也是「设置 → 插件」配置卡片的槽位 key。 */
export const NS = 'dshp-file-change-viewer';

/** schema 默认值（与 `DEFAULT_CONFIG` 同值，AGENT.md §7.2）。 */
export const DEFAULT_CONFIG: PluginConfig = {
  view: 'highlight',
  sectionsOpen: false,
};

/** settings 服务的命名空间 schema（约束进 schema，设置页与手工编辑 settings.yaml 都走它）。 */
export const ConfigSchema: any = z.object({
  view: z.union([z.const('highlight'), z.const('diff')]).default('highlight'),
  sectionsOpen: z.boolean().default(false),
});

/**
 * 消毒 composition 传来的 `config:` 补丁（或任意外部对象）。
 *
 * 逐字段 `Object.hasOwn` + 类型校验，非法字段静默丢弃（AGENT.md §6.5）。
 *
 * @param raw - 外部补丁。
 * @returns 只含合法字段的补丁。
 */
export function sanitizePatchConfig(raw: unknown): PluginConfigPatch {
  const patch: PluginConfigPatch = {};
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) return patch;
  const record = raw as Record<string, unknown>;
  if (Object.hasOwn(record, 'view') && (record['view'] === 'highlight' || record['view'] === 'diff')) {
    patch.view = record['view'];
  }
  if (Object.hasOwn(record, 'sectionsOpen') && typeof record['sectionsOpen'] === 'boolean') {
    patch.sectionsOpen = record['sectionsOpen'];
  }
  return patch;
}

/**
 * 把补丁合并进配置对象（`exactOptionalPropertyTypes` 下不能 `{...patch}` 一把梭）。
 *
 * @param entry - 目标配置（就地修改）。
 * @param patch - 已消毒的补丁。
 */
export function applyPatch(entry: PluginConfig, patch: PluginConfigPatch): void {
  if (patch.view !== undefined) entry.view = patch.view;
  if (patch.sectionsOpen !== undefined) entry.sectionsOpen = patch.sectionsOpen;
}
