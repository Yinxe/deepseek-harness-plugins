/**
 * 设置页样式（CSS 字符串，随 client bundle 内联）
 *
 * 规范（见仓库 docs/client-basics.md）：
 *  - 控件样式与官方设置页一致：16px 行距 + .5px 底分割线 + 左标题/描述右控件；
 *  - 颜色/字号只用 `var(--dsw-alias-*)` token（深浅主题自动跟随），不写死色值；
 *  - 类前缀 `sp-`（search-provider）。
 *
 * 原实现：dsh-tavily-search/client.js 的 CSS 常量（tv- 前缀）→ 等价重写并改名。
 *
 * @module @dshp/search-provider/client
 */
export const CSS = `
.sp-page{max-width:720px;color:var(--dsw-alias-label-primary);flex-direction:column;display:flex}
.sp-section{flex-direction:column;width:100%;display:flex}
.sp-sectionHead{color:var(--dsw-alias-label-secondary);font-size:12px;font-weight:500;line-height:18px;padding:14px 0 2px}
.sp-row{border-bottom:.5px solid var(--dsw-alias-border-l2);align-items:center;gap:8px;padding:16px 0;display:flex}
.sp-rowWrap{border-bottom:.5px solid var(--dsw-alias-border-l2);align-items:flex-start;gap:8px;padding:16px 0;display:flex;flex-direction:column}
.sp-section .sp-row:last-child,.sp-section .sp-rowWrap:last-child{border-bottom:none}
.sp-rowText{flex-direction:column;flex:1;gap:4px;min-width:0;padding-right:48px;display:flex}
.sp-title{color:var(--dsw-alias-label-primary);font-size:14px;font-weight:400;line-height:22px}
.sp-desc{color:var(--dsw-alias-label-tertiary);font-size:12px;font-weight:400;line-height:18px}
.sp-intro{color:var(--dsw-alias-label-tertiary);margin:0 0 4px;font-size:14px;line-height:22px}
.sp-mono{font-family:var(--ds-font-family-code)}
.sp-selector{background:var(--dsw-alias-bg-module-platform);height:36px;font:inherit;color:var(--dsw-alias-label-primary);cursor:pointer;border:none;border-radius:18px;align-items:center;gap:12px;padding:0 14px;font-size:14px;line-height:22px;display:inline-flex;max-width:100%}
.sp-selector:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}
.sp-selector:disabled{cursor:default;opacity:.4}
.sp-selectorLabel{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.sp-chevron{flex:none}
.sp-inputWrap{display:inline-flex;align-items:center;gap:6px;height:32px;padding:0 8px;border:.5px solid var(--dsw-alias-border-l4);border-radius:8px;background:var(--dsw-alias-bg-layer-1);flex:1;min-width:0}
.sp-inputWrap:focus-within{border-color:var(--dsw-alias-brand-primary)}
.sp-input{flex:1;min-width:0;border:none;outline:none;background:transparent;font-size:14px;line-height:22px;color:var(--dsw-alias-label-primary);font-family:inherit}
.sp-input::placeholder{color:var(--dsw-alias-label-dimmed)}
.sp-input:disabled{opacity:.5}
.sp-badge{white-space:nowrap;align-items:center;height:20px;border-radius:10px;padding:0 8px;font-size:11px;font-weight:500;line-height:20px;display:inline-flex}
.sp-badge-ok{background:var(--dsw-alias-state-success-tertiary);color:var(--dsw-alias-state-success-primary)}
.sp-badge-warn{background:var(--dsw-alias-state-warn-tertiary);color:var(--dsw-alias-state-warn-label)}
.sp-badge-muted{background:var(--dsw-alias-button-ghost-active-fill);color:var(--dsw-alias-label-caption)}
.sp-bar{align-items:center;gap:8px;display:flex;flex-wrap:wrap;padding:12px 0}
.sp-notice{margin:0;font-size:12px;line-height:18px}
.sp-notice-ok{color:var(--dsw-alias-state-success-primary)}
.sp-notice-err{color:var(--dsw-alias-state-error-primary)}
.sp-hint{color:var(--dsw-alias-label-tertiary);margin:0;font-size:12px;line-height:18px}
.sp-loading{align-items:center;gap:8px;display:flex}
.sp-loadingText{color:var(--dsw-alias-label-tertiary);font-size:13px;line-height:20px}
.sp-results{flex-direction:column;gap:8px;display:flex}
.sp-result-item{border:.5px solid var(--dsw-alias-border-l4);border-radius:8px;flex-direction:column;gap:4px;padding:10px 12px;display:flex}
.sp-result-item a{color:var(--dsw-alias-state-business-primary);font-size:13px;font-weight:500;line-height:20px;text-decoration:none}
.sp-result-item a:hover{text-decoration:underline}
.sp-result-item a:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px;border-radius:4px}
.sp-result-snippet{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}
.sp-result-meta{color:var(--dsw-alias-label-tertiary);font-family:var(--ds-font-family-code);font-size:11px;line-height:16px;word-break:break-all}
.sp-meter{height:6px;border-radius:3px;background:var(--dsw-alias-button-ghost-active-fill);overflow:hidden;margin-top:6px}
.sp-meter-fill{height:100%;background:var(--dsw-alias-brand-primary);border-radius:3px;transition:width .2s}
.sp-meter-fill-high{background:var(--dsw-alias-state-error-primary)}
.sp-break{flex-direction:column;gap:4px;display:flex;margin-top:8px}
.sp-break-row{justify-content:space-between;gap:8px;font-size:12px;line-height:18px;display:flex}
.sp-break-label{color:var(--dsw-alias-label-tertiary)}
.sp-break-value{color:var(--dsw-alias-label-secondary);font-family:var(--ds-font-family-code)}
.sp-sub{color:var(--dsw-alias-label-tertiary);margin:6px 0 0;font-size:12px;line-height:18px}
.sp-foot{justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;display:flex;margin-top:8px}
@media (prefers-reduced-motion:reduce){.sp-meter-fill{transition:none}}
`;
