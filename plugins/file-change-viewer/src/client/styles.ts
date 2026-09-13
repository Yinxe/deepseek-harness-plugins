/**
 * 卡片样式（前缀 fcv-）
 *
 * 约束（AGENT.md §10.1）：颜色/字号只用官方 token（`--dsw-alias-*` / `--ds-font-family-code`），
 * 不写死任何色值——深浅主题跟随官方 token 层切换。
 *
 * 只写「卡片外壳」：diff 本体由官方 `DiffBlock` 渲染，它自带
 * `--dsw-alias-markdown-code-block` 背景、行色与复制按钮，这里只覆盖它在设置页里
 * 不合适的外边距（`.fcv-card .fcv-diff` 用两级选择器压过 primitives 的同级规则）。
 */
export const CSS: string = `

.fcv-card{margin:4px 0;border:.5px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);border-radius:10px;overflow:hidden}
.fcv-card .fcv-head{display:flex;align-items:center;gap:8px;padding:6px 10px;cursor:pointer}
.fcv-card .fcv-head:hover{background:var(--dsw-alias-interactive-bg-hover)}
.fcv-card .fcv-head:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:-2px}
.fcv-leading{display:inline-flex;align-items:center;flex:none;color:var(--dsw-alias-label-tertiary)}
.fcv-title{flex:none;color:var(--dsw-alias-label-primary);font-size:14px;line-height:22px}
.fcv-summary{display:inline-flex;align-items:center;gap:8px;flex:1;min-width:0}
.fcv-path{display:inline-flex;align-items:center;gap:6px;min-width:0;padding:0;border:none;background:none;color:var(--dsw-alias-label-secondary);font-family:var(--ds-font-family-code);font-size:12px;line-height:18px;cursor:pointer}
.fcv-path:hover{color:var(--dsw-alias-label-primary);text-decoration:underline}
.fcv-pathText{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.fcv-pathStatic{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-secondary);font-family:var(--ds-font-family-code);font-size:12px;line-height:18px}
.fcv-badge{display:inline-flex;align-items:center;flex:none;height:20px;padding:0 8px;border-radius:10px;font-size:11px;font-weight:500;line-height:20px;white-space:nowrap}
.fcv-badge-applied{background:var(--dsw-alias-state-success-tertiary);color:var(--dsw-alias-state-success-primary)}
.fcv-badge-pending,.fcv-badge-streaming{background:var(--dsw-alias-state-warn-tertiary);color:var(--dsw-alias-state-warn-label)}
.fcv-badge-newfile{background:var(--dsw-alias-button-ghost-active-fill);color:var(--dsw-alias-label-caption)}
.fcv-badge-rejected{background:var(--dsw-alias-button-ghost-active-fill);color:var(--dsw-alias-state-error-primary)}
.fcv-replaceAll{color:var(--dsw-alias-label-tertiary);font-size:11px;white-space:nowrap}
.fcv-stat{flex:none;margin-left:auto;color:var(--dsw-alias-label-tertiary);font-family:var(--ds-font-family-code);font-size:12px}
.fcv-inspect{flex:none;padding:0 2px;border:none;background:none;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px;cursor:pointer}
.fcv-inspect:hover{color:var(--dsw-alias-label-primary)}
.fcv-body{border-top:.5px solid var(--dsw-alias-border-l2)}
.fcv-card .fcv-diff{margin:10px 12px}
.fcv-error{margin:0;padding:8px 12px;color:var(--dsw-alias-state-error-primary);font-size:12px;line-height:18px;white-space:pre-wrap;word-break:break-word}
.fcv-muted{margin:0;padding:8px 12px;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px}
.fcv-raw{margin:0;padding:8px 12px;background:var(--dsw-alias-markdown-code-block);color:var(--dsw-alias-label-secondary);font-family:var(--ds-font-family-code);font-size:12px;line-height:18px;white-space:pre-wrap;word-break:break-all}
`;
