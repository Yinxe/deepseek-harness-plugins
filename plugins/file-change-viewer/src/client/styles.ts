/**
 * 卡片样式（前缀 fcv-）
 *
 * 约束（AGENT.md §10.1）：颜色/字号只用官方 token（`--dsw-alias-*` / `--ds-font-family-code`），
 * 不写死任何色值——深浅主题跟随官方 token 层切换。
 *
 * 只写「卡片外壳」：两种视图的本体都由官方 primitives 渲染——
 * - 高亮视图用 `CodeBlock`：自带 `--shiki-*` 着色、语言标签栏、复制按钮与行号；
 * - ± 差异视图用 `DiffBlock`：自带 `--dsw-alias-markdown-code-block` 背景与红绿行色。
 * 这里只补外壳（边框、头部、角标）与两处外边距覆盖（`.fcv-card .fcv-*` 两级选择器压过
 * primitives 的同级规则），不给它们的内部结构写选择器。
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
.fcv-inspect,.fcv-viewToggle{flex:none;padding:0 2px;border:none;background:none;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px;cursor:pointer;white-space:nowrap}
.fcv-inspect:hover,.fcv-viewToggle:hover{color:var(--dsw-alias-label-primary)}
.fcv-viewToggle{font-family:var(--ds-font-family-code)}
.fcv-body{border-top:.5px solid var(--dsw-alias-border-l2)}
.fcv-card .fcv-diff{margin:10px 12px}
.fcv-error{margin:0;padding:8px 12px;color:var(--dsw-alias-state-error-primary);font-size:12px;line-height:18px;white-space:pre-wrap;word-break:break-word}
.fcv-muted{margin:0;padding:8px 12px;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px}
.fcv-raw{margin:0;padding:8px 12px;background:var(--dsw-alias-markdown-code-block);color:var(--dsw-alias-label-secondary);font-family:var(--ds-font-family-code);font-size:12px;line-height:18px;white-space:pre-wrap;word-break:break-all}
/* 高亮视图：每个 hunk 一个代码块，块内是带 - / + 行首标记的统一 diff */
.fcv-hunk+.fcv-hunk{border-top:.5px solid var(--dsw-alias-border-l2)}
.fcv-hunkhead{display:flex;align-items:baseline;gap:8px;padding:8px 12px 0;font-size:12px;line-height:18px;color:var(--dsw-alias-label-tertiary)}
.fcv-hunkpath{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-secondary);font-family:var(--ds-font-family-code)}
.fcv-hunkstat{flex:none;margin-left:auto;font-family:var(--ds-font-family-code)}
/* 官方给行号模式留了自定义属性 --dsl-code-block-line-white-space（默认 pre-wrap）：
   改成 pre，让长行横向滚动而不是折行——与官方 ± 视图（DiffBlock 是 white-space:pre + overflow-x:auto）
   一致，也避免 pre 上的 word-break:break-all 把代码从中间断开。 */
.fcv-card .fcv-code{--dsl-code-block-line-white-space:pre;margin:8px 12px}
/* 高亮视图的「按行上底色」：颜色在这里集中定义（只有 token），由组件生成的动态规则按行区间引用。
   删除行用官方 danger 填充（浅色主题 5%/深色 15% 半透明红），新增行用官方 success 三级填充。 */
.fcv-card{--fcv-del-bg:var(--dsw-alias-interactive-bg-hover-danger);--fcv-add-bg:var(--dsw-alias-state-success-tertiary)}
`;
