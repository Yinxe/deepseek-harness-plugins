/**
 * 设置页样式 —— 只做布局（行/工具栏/间距/截断），控件全部用
 * @deepseek-ai/dsh-client-ui-primitives 原语（Button/Input/Switch/Tag/Menu/Modal/Pill），
 * 颜色一律 var(--dsw-alias-*) token。
 */
export const CSS: string = `

.mc-page{max-width:860px;color:var(--dsw-alias-label-primary);flex-direction:column;display:flex}
.mc-intro{color:var(--dsw-alias-label-tertiary);margin:0 0 4px;font-size:14px;line-height:22px}
.mc-rootPath{color:var(--dsw-alias-label-dimmed);font-family:var(--ds-font-family-code);font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}
/* 工具栏：计数 + 搜索 + 动作（ZCode MCP 页同款布局） */
.mc-toolbar{align-items:center;gap:10px;display:flex;flex-wrap:wrap;padding:10px 0 12px;border-bottom:.5px solid var(--dsw-alias-border-l2)}
.mc-toolbarSpacer{flex:1;min-width:0}
.mc-count{color:var(--dsw-alias-label-tertiary);font-size:13px;line-height:20px;white-space:nowrap}
.mc-searchW{width:230px}
/* 服务器行：图标块 + 名称/单行摘要 + 行内控件 */
.mc-list{display:flex;flex-direction:column}
.mc-row{border-bottom:.5px solid var(--dsw-alias-border-l2);align-items:center;gap:10px;padding:12px 0;display:flex;flex-wrap:wrap}
.mc-list .mc-row:last-child{border-bottom:none}
.mc-rowDisabled .mc-title,.mc-rowDisabled .mc-line{opacity:.55}
.mc-rowText{flex-direction:column;flex:1;gap:2px;min-width:200px;display:flex}
.mc-title{color:var(--dsw-alias-label-primary);font-size:14px;font-weight:400;line-height:22px;display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.mc-nameBtn{cursor:pointer;background:none;border:none;padding:0;color:inherit;font:inherit;text-align:left}
.mc-nameBtn:hover{text-decoration:underline}
.mc-line{color:var(--dsw-alias-label-tertiary);font-size:12px;font-weight:400;line-height:18px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.mc-mono{font-family:var(--ds-font-family-code);font-size:13px}
.mc-tile{width:28px;height:28px;border-radius:8px;background:var(--dsw-alias-button-ghost-active-fill);color:var(--dsw-alias-label-secondary);align-items:center;justify-content:center;display:flex;flex:none;font-size:9px;font-weight:600;letter-spacing:.4px;position:relative}
/* 状态点：绿=探活通过，红=探活失败，蓝=未知/未探活，灰=已禁用 */
.mc-dot{width:8px;height:8px;border-radius:50%;position:absolute;right:-2px;bottom:-2px;border:2px solid var(--dsw-alias-bg-layer-1);background:var(--dsw-alias-label-dimmed)}
.mc-dot-ok{background:var(--dsw-alias-state-success-primary)}
.mc-dot-fail{background:var(--dsw-alias-state-error-primary)}
.mc-dot-unknown{background:var(--dsw-alias-brand-primary)}
.mc-controls{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-left:auto;justify-content:flex-end}
.mc-danger{color:var(--dsw-alias-state-error-primary)}
/* 弹窗：原生 Modal 默认 380px，表单编辑器需要更宽（div 前缀抬高优先级压过模块类） */
div.mc-wideModal{width:min(760px,94vw)}
/* 表单（原生 Modal 的内容/底部） */
.mc-form{display:flex;flex-direction:column;gap:8px}
.mc-fieldLabel{color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:16px}
.mc-modeRow{display:flex;align-items:center;gap:6px;margin-bottom:4px}
.mc-modeSpacer{flex:1}
.mc-textarea{box-sizing:border-box;border:.5px solid var(--dsw-alias-border-l4);background:var(--dsw-alias-bg-layer-1);font:inherit;color:var(--dsw-alias-label-primary);border-radius:8px;padding:8px 12px;font-size:13px;line-height:20px;outline:none;width:100%;resize:vertical;min-height:64px}
.mc-textarea:focus-visible{border-color:var(--dsw-alias-brand-primary)}
.mc-textarea::placeholder{color:var(--dsw-alias-label-dimmed)}
.mc-textarea:disabled{opacity:.5}
.mc-textareaMono{font-family:var(--ds-font-family-code);font-size:12px;line-height:19px}
.mc-bar{align-items:center;gap:8px;display:flex;flex-wrap:wrap}
.mc-twoCol{display:flex;gap:12px;flex-wrap:wrap}
.mc-twoCol>*{flex:1;min-width:200px}
/* 状态与提示 */
.mc-notice{margin:0;font-size:12px;line-height:18px}
.mc-notice-err{color:var(--dsw-alias-state-error-primary)}
.mc-notice-warn{color:var(--dsw-alias-state-warn-label)}
.mc-notice-ok{color:var(--dsw-alias-state-success-primary)}
.mc-hint{color:var(--dsw-alias-label-tertiary);margin:0;font-size:12px;line-height:18px}
.mc-loading{align-items:center;gap:8px;display:flex}
.mc-loadingText{color:var(--dsw-alias-label-tertiary);font-size:13px;line-height:20px}
.mc-empty{padding:32px 0 24px;display:flex;flex-direction:column;align-items:center;gap:8px}
.mc-emptyTitle{color:var(--dsw-alias-label-secondary);font-size:14px;line-height:22px}
.mc-probeLine{color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:16px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
`;
