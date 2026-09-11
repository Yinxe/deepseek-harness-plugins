/** 设置页样式（官方 token，与原 client.js 逐字一致，前缀 vb-） */
export const CSS: string = `

.vb-page{max-width:720px;color:var(--dsw-alias-label-primary);flex-direction:column;display:flex}
.vb-section{flex-direction:column;width:100%;display:flex}
.vb-sectionHead{color:var(--dsw-alias-label-secondary);font-size:12px;font-weight:500;line-height:18px;padding:14px 0 2px}
.vb-row{border-bottom:.5px solid var(--dsw-alias-border-l2);align-items:center;gap:8px;padding:16px 0;display:flex}
.vb-section .vb-row:last-child{border-bottom:none}
.vb-rowWrap{border-bottom:.5px solid var(--dsw-alias-border-l2);align-items:flex-start;gap:8px;padding:16px 0;display:flex;flex-direction:column}
.vb-rowText{flex-direction:column;flex:1;gap:4px;min-width:0;padding-right:48px;display:flex}
.vb-title{color:var(--dsw-alias-label-primary);font-size:14px;font-weight:400;line-height:22px}
.vb-desc{color:var(--dsw-alias-label-tertiary);font-size:12px;font-weight:400;line-height:18px}
.vb-intro{color:var(--dsw-alias-label-tertiary);margin:0 0 4px;font-size:14px;line-height:22px}
.vb-mono{font-family:var(--ds-font-family-code)}
/* 下拉胶囊（官方 TranscriptViewRow / PermissionRow 同款） */
.vb-selector{background:var(--dsw-alias-bg-module-platform);height:36px;font:inherit;color:var(--dsw-alias-label-primary);cursor:pointer;border:none;border-radius:18px;align-items:center;gap:12px;padding:0 14px;font-size:14px;line-height:22px;display:inline-flex;max-width:100%}
.vb-selector:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}
.vb-selector:disabled{cursor:default;opacity:.4}
.vb-selectorLabel{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.vb-chevron{flex:none}
/* 开关（官方 ui-settings-plugins 同款规格） */
.vb-switch{box-sizing:border-box;background:var(--dsw-alias-border-l3);cursor:pointer;border:0;border-radius:10px;flex:none;width:36px;height:20px;padding:2px;position:relative}
.vb-switchOn{background:var(--dsw-alias-brand-primary)}
.vb-switch:disabled{cursor:default;opacity:.5}
.vb-switch:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}
.vb-thumb{corner-shape:round;background:var(--dsw-alias-label-primary-foreground);border-radius:50%;width:16px;height:16px;transition:transform .12s;display:block}
.vb-switchOn .vb-thumb{transform:translate(16px)}
/* 文本输入（官方 Input 同款规格） */
.vb-inputWrap{display:inline-flex;align-items:center;gap:6px;height:32px;padding:0 8px;border:.5px solid var(--dsw-alias-border-l4);border-radius:8px;background:var(--dsw-alias-bg-layer-1);width:100%}
.vb-inputWrap:focus-within{border-color:var(--dsw-alias-brand-primary)}
.vb-input{flex:1;min-width:0;border:none;outline:none;background:transparent;font-size:14px;line-height:22px;color:var(--dsw-alias-label-primary);font-family:inherit}
.vb-input::placeholder{color:var(--dsw-alias-label-dimmed)}
.vb-input:disabled{opacity:.5}
.vb-textarea{box-sizing:border-box;border:.5px solid var(--dsw-alias-border-l4);background:var(--dsw-alias-bg-layer-1);font:inherit;color:var(--dsw-alias-label-primary);border-radius:8px;padding:8px 12px;font-size:13px;line-height:20px;outline:none;width:100%;resize:vertical;min-height:72px}
.vb-textarea:focus-visible{border-color:var(--dsw-alias-brand-primary)}
.vb-textarea::placeholder{color:var(--dsw-alias-label-dimmed)}
.vb-textarea:disabled{opacity:.5}
/* 徽章（官方色板） */
.vb-badge{white-space:nowrap;align-items:center;height:20px;border-radius:10px;padding:0 8px;font-size:11px;font-weight:500;line-height:20px;display:inline-flex}
.vb-badge-ok{background:var(--dsw-alias-state-success-tertiary);color:var(--dsw-alias-state-success-primary)}
.vb-badge-warn{background:var(--dsw-alias-state-warn-tertiary);color:var(--dsw-alias-state-warn-label)}
.vb-badge-muted{background:var(--dsw-alias-button-ghost-active-fill);color:var(--dsw-alias-label-caption)}
.vb-badge-info{background:var(--dsw-alias-state-business-tertiary);color:var(--dsw-alias-state-business-primary)}
/* 状态行、提示、加载 */
.vb-notice{margin:0;font-size:12px;line-height:18px}
.vb-notice-err{color:var(--dsw-alias-state-error-primary)}
.vb-notice-warn{color:var(--dsw-alias-state-warn-label)}
.vb-notice-ok{color:var(--dsw-alias-state-success-primary)}
.vb-hint{color:var(--dsw-alias-label-tertiary);margin:0;font-size:12px;line-height:18px}
.vb-loading{align-items:center;gap:8px;display:flex}
.vb-loadingText{color:var(--dsw-alias-label-tertiary);font-size:13px;line-height:20px}
.vb-bar{align-items:center;gap:8px;display:flex;flex-wrap:wrap;padding:16px 0;border-bottom:.5px solid var(--dsw-alias-border-l2)}
.vb-section .vb-bar{border-bottom:none}
.vb-modelLine{display:inline-flex;align-items:center;gap:6px;max-width:100%;justify-content:flex-end;min-width:0}
.vb-modelName{font-family:var(--ds-font-family-code);font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:260px}
.vb-dot{width:7px;height:7px;border-radius:50%;display:inline-block;flex:none}
@media (prefers-reduced-motion:reduce){.vb-thumb{transition:none}}
`;
