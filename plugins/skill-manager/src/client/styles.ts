/**
 * 设置页样式 —— 只做布局（行/工具栏/间距/截断），控件全部用
 * @deepseek-ai/dsh-client-ui-primitives 原语（Button/Input/Switch/Tag/Menu/Modal），
 * 颜色一律 var(--dsw-alias-*) token。
 */
export const CSS: string = `

.sm-page{max-width:860px;color:var(--dsw-alias-label-primary);flex-direction:column;display:flex}
.sm-intro{color:var(--dsw-alias-label-tertiary);margin:0 0 4px;font-size:14px;line-height:22px}
/* 工具栏：范围切换 + 计数 + 搜索 + 动作（ZCode 技能页同款布局） */
.sm-toolbar{align-items:center;gap:10px;display:flex;flex-wrap:wrap;padding:10px 0 12px;border-bottom:.5px solid var(--dsw-alias-border-l2)}
.sm-toolbarSpacer{flex:1;min-width:0}
.sm-count{color:var(--dsw-alias-label-tertiary);font-size:13px;line-height:20px;white-space:nowrap}
.sm-searchW{width:230px}
/* 紧凑列表行：图标块 + 名称/单行描述 + 行内控件 */
.sm-list{display:flex;flex-direction:column}
.sm-row{border-bottom:.5px solid var(--dsw-alias-border-l2);align-items:center;gap:10px;padding:12px 0;display:flex;flex-wrap:wrap}
.sm-list .sm-row:last-child{border-bottom:none}
.sm-rowText{flex-direction:column;flex:1;gap:2px;min-width:200px;display:flex}
.sm-title{color:var(--dsw-alias-label-primary);font-size:14px;font-weight:400;line-height:22px;display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.sm-line{color:var(--dsw-alias-label-tertiary);font-size:12px;font-weight:400;line-height:18px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.sm-mono{font-family:var(--ds-font-family-code);font-size:13px}
.sm-tile{width:28px;height:28px;border-radius:8px;background:var(--dsw-alias-button-ghost-active-fill);color:var(--dsw-alias-label-secondary);align-items:center;justify-content:center;display:flex;flex:none}
.sm-controls{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-left:auto;justify-content:flex-end}
.sm-ctlLabel{color:var(--dsw-alias-label-tertiary);font-size:11px;display:inline-flex;align-items:center;gap:5px}
.sm-danger{color:var(--dsw-alias-state-error-primary)}
/* 弹窗：原生 Modal 默认 380px，编辑/新建需要更宽（div 前缀抬高优先级压过模块类） */
div.sm-wideModal{width:min(760px,94vw)}
/* 弹窗表单（原生 Modal 的内容/底部） */
.sm-form{display:flex;flex-direction:column;gap:8px}
.sm-fieldLabel{color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:16px}
.sm-surfaceRow{display:flex;align-items:center;gap:16px;flex-wrap:wrap}
.sm-textarea{box-sizing:border-box;border:.5px solid var(--dsw-alias-border-l4);background:var(--dsw-alias-bg-layer-1);font:inherit;color:var(--dsw-alias-label-primary);border-radius:8px;padding:8px 12px;font-size:13px;line-height:20px;outline:none;width:100%;resize:vertical;min-height:64px}
.sm-textarea:focus-visible{border-color:var(--dsw-alias-brand-primary)}
.sm-textarea::placeholder{color:var(--dsw-alias-label-dimmed)}
.sm-textarea:disabled{opacity:.5}
.sm-textareaMono{font-family:var(--ds-font-family-code);font-size:12px;line-height:19px}
.sm-bar{align-items:center;gap:8px;display:flex;flex-wrap:wrap}
/* 状态与提示 */
.sm-notice{margin:0;font-size:12px;line-height:18px}
.sm-notice-err{color:var(--dsw-alias-state-error-primary)}
.sm-notice-warn{color:var(--dsw-alias-state-warn-label)}
.sm-notice-ok{color:var(--dsw-alias-state-success-primary)}
.sm-hint{color:var(--dsw-alias-label-tertiary);margin:0;font-size:12px;line-height:18px}
.sm-loading{align-items:center;gap:8px;display:flex}
.sm-loadingText{color:var(--dsw-alias-label-tertiary);font-size:13px;line-height:20px}
.sm-rootPath{color:var(--dsw-alias-label-dimmed);font-family:var(--ds-font-family-code);font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}
.sm-empty{padding:32px 0 24px;display:flex;flex-direction:column;align-items:center;gap:8px}
.sm-emptyTitle{color:var(--dsw-alias-label-secondary);font-size:14px;line-height:22px}
`;
