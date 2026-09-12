/** 设置页样式（官方 token，与原 client.js 逐字一致，前缀 mw-） */
export const CSS: string = `
.mw-page{max-width:720px;color:var(--dsw-alias-label-primary);flex-direction:column;display:flex}
.mw-section{flex-direction:column;width:100%;display:flex}
.mw-sectionHead{color:var(--dsw-alias-label-secondary);font-size:12px;font-weight:500;line-height:18px;padding:14px 0 2px}
.mw-row{border-bottom:.5px solid var(--dsw-alias-border-l2);align-items:center;gap:8px;padding:16px 0;display:flex}
.mw-rowWrap{border-bottom:.5px solid var(--dsw-alias-border-l2);align-items:flex-start;gap:8px;padding:16px 0;display:flex;flex-direction:column}
.mw-section .mw-row:last-child,.mw-section .mw-rowWrap:last-child,.mw-section .mw-bar:last-child{border-bottom:none}
.mw-rowText{flex-direction:column;flex:1;gap:4px;min-width:0;padding-right:48px;display:flex}
.mw-control{align-items:center;gap:8px;display:inline-flex;flex:none}
.mw-unit{color:var(--dsw-alias-label-secondary);font-size:14px;line-height:22px;flex:none}
.mw-title{color:var(--dsw-alias-label-primary);font-size:14px;font-weight:400;line-height:22px}
.mw-desc{color:var(--dsw-alias-label-tertiary);font-size:12px;font-weight:400;line-height:18px}
.mw-intro{color:var(--dsw-alias-label-tertiary);margin:0 0 4px;font-size:14px;line-height:22px}
.mw-mono{font-family:var(--ds-font-family-code)}
.mw-results{flex-direction:column;gap:8px;display:flex;padding:8px 0}
.mw-inputWrap{display:inline-flex;align-items:center;gap:6px;height:32px;padding:0 8px;border:.5px solid var(--dsw-alias-border-l4);border-radius:8px;background:var(--dsw-alias-bg-layer-1);width:100%}
.mw-inputWrap:focus-within{border-color:var(--dsw-alias-brand-primary)}
.mw-input{flex:1;min-width:0;border:none;outline:none;background:transparent;font-size:14px;line-height:22px;color:var(--dsw-alias-label-primary);font-family:inherit}
.mw-input::placeholder{color:var(--dsw-alias-label-dimmed)}
.mw-input:disabled{opacity:.5}
.mw-badge{white-space:nowrap;align-items:center;height:20px;border-radius:10px;padding:0 8px;font-size:11px;font-weight:500;line-height:20px;display:inline-flex}
.mw-badge-ok{background:var(--dsw-alias-state-success-tertiary);color:var(--dsw-alias-state-success-primary)}
.mw-badge-muted{background:var(--dsw-alias-button-ghost-active-fill);color:var(--dsw-alias-label-caption)}
.mw-notice{margin:0;font-size:12px;line-height:18px}
.mw-notice-err{color:var(--dsw-alias-state-error-primary)}
.mw-notice-ok{color:var(--dsw-alias-state-success-primary)}
.mw-hint{font-size:12px;color:var(--dsw-alias-label-tertiary);margin:0;line-height:18px}
.mw-bar{align-items:center;gap:8px;display:flex;flex-wrap:wrap;padding:12px 0;border-bottom:.5px solid var(--dsw-alias-border-l2)}
.mw-barEnd{align-items:center;gap:8px;display:flex;flex-wrap:wrap;padding:12px 0;border-bottom:.5px solid var(--dsw-alias-border-l2);justify-content:flex-end}
.mw-loading{align-items:center;gap:8px;display:flex}
.mw-loadingText{color:var(--dsw-alias-label-tertiary);font-size:13px;line-height:20px}
.mw-result-item{border:.5px solid var(--dsw-alias-border-l4);border-radius:8px;flex-direction:column;gap:4px;padding:10px 12px;display:flex}
.mw-result-item a{color:var(--dsw-alias-state-business-primary);text-decoration:none;font-weight:500}
.mw-result-item a:hover{text-decoration:underline}
.mw-result-snippet{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px;margin-top:4px}
.mw-result-meta{color:var(--dsw-alias-label-tertiary);font-size:12px;margin-top:4px;word-break:break-all}
.mw-codeblock{margin-top:8px}
.mw-codeblock pre{max-height:320px;overflow:auto}
/* /mcwiki 命令卡片（conversation.chat.commandview 槽位；布局only，颜色走官方 token） */
.mw-cmdRoot{width:100%}
.mw-cmdRow{width:100%}
.mw-cmdTitle{font-size:13px}
.mw-cmdSummary{color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.mw-cmdSummaryErr{color:var(--dsw-alias-state-error-primary)}
.mw-cmdBody{font-size:13px;line-height:20px;color:var(--dsw-alias-label-primary);padding:4px 0 8px}
`;
