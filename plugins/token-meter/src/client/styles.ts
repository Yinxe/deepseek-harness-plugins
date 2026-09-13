/** 设置页 + 侧边栏 + 浮窗样式（官方 token，前缀 tm-；由 quota tq- 与 stats ts- 合并重命名而来，效果 1:1 还原） */
export const CSS: string = `
.tm-page{font-size:13px;line-height:1.6;color:var(--dsw-alias-label-primary);max-width:820px;flex-direction:column;display:flex;container-type:inline-size;container-name:tm}
.tm-title{font-size:15px;font-weight:600;margin:0 0 4px;color:var(--dsw-alias-label-primary)}
.tm-desc{color:var(--dsw-alias-label-secondary);margin:0 0 14px}
.tm-intro{color:var(--dsw-alias-label-tertiary);margin:0 0 4px;font-size:14px;line-height:22px}
.tm-section{flex-direction:column;width:100%;display:flex}
.tm-sectionHead{color:var(--dsw-alias-label-secondary);font-size:12px;font-weight:500;line-height:18px;padding:14px 0 2px}
.tm-row{border-bottom:.5px solid var(--dsw-alias-border-l2);align-items:center;gap:8px;padding:16px 0;display:flex}
.tm-rowWrap{border-bottom:.5px solid var(--dsw-alias-border-l2);align-items:flex-start;gap:8px;padding:16px 0;display:flex;flex-direction:column}
.tm-section .tm-row:last-child,.tm-section .tm-rowWrap:last-child,.tm-section .tm-bar:last-child{border-bottom:none}
.tm-rowText{flex-direction:column;flex:1;gap:4px;min-width:0;padding-right:48px;display:flex}
.tm-rowLabel{color:var(--dsw-alias-label-primary);font-size:14px;font-weight:400;line-height:22px;flex:none}
.tm-rowDesc{color:var(--dsw-alias-label-tertiary);font-size:12px;font-weight:400;line-height:18px}
.tm-rowValue{color:var(--dsw-alias-label-primary);font-size:13px;line-height:20px;text-align:right;min-width:0;display:flex;justify-content:flex-end;align-items:center}
/* ── 表单字段（堆叠式）：标签 → 控件 → 说明，各占整行，输入框永不被说明挤压 ── */
.tm-field{display:flex;flex-direction:column;gap:6px;padding:14px 0;border-bottom:.5px solid var(--dsw-alias-border-l2)}
.tm-section>.tm-field:last-of-type{border-bottom:none}
.tm-fieldHead{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.tm-fieldLabel{color:var(--dsw-alias-label-primary);font-size:14px;font-weight:500;line-height:22px}
.tm-fieldReq{flex:none;font-size:10px;line-height:15px;padding:0 6px;border-radius:4px;color:var(--dsw-alias-state-warn-label);background:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 14%,transparent)}
.tm-fieldOpt{flex:none;font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary)}
.tm-fieldControl{display:flex;align-items:center;gap:8px;min-width:0;flex-wrap:wrap}
.tm-fieldControl>.tm-inputWrap{flex:1 1 260px;min-width:0;width:auto}
.tm-fieldControl>.tm-selector{max-width:100%}
.tm-fieldDesc{color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px}
.tm-fieldNote{margin:10px 0 0;padding:8px 10px;border-radius:8px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}
.tm-fieldNote b{color:var(--dsw-alias-label-primary);font-weight:600;margin-right:4px}
.tm-inputReadonly{background:var(--dsw-alias-bg-layer-2);border-style:dashed;cursor:not-allowed}
.tm-inputReadonly .tm-ninput{color:var(--dsw-alias-label-secondary)}
.tm-rowControl{flex:1;min-width:0;display:flex;justify-content:flex-end}
.tm-card{background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l1);border-radius:12px;padding:14px 16px;margin:0 0 8px}
.tm-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;border:1px solid var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-primary);border-radius:8px;padding:6px 12px;font-size:13px;cursor:pointer;font-family:inherit;white-space:nowrap;flex:none}
.tm-btn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover);border-color:color-mix(in srgb,var(--dsw-alias-state-business-primary) 55%,var(--dsw-alias-border-l2))}
.tm-btn:disabled{opacity:.4;cursor:default}
.tm-btnPrimary{background:var(--dsw-alias-brand-primary);border-color:var(--dsw-alias-brand-primary);color:#fff}
.tm-btnDanger{color:var(--dsw-alias-state-error-primary);border-color:var(--dsw-alias-state-error-primary)}
.tm-notice{padding:8px 12px;border-radius:8px;margin:0 0 12px;font-size:12.5px}
.tm-notice-err{background:color-mix(in srgb, var(--dsw-alias-state-error-primary) 12%, transparent);color:var(--dsw-alias-state-error-primary)}
.tm-notice-empty{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary)}
.tm-notice-warn{color:var(--dsw-alias-state-warn-label)}
.tm-notice-ok{color:var(--dsw-alias-state-success-primary)}
.tm-hint{font-size:12px;color:var(--dsw-alias-label-secondary)}
.tm-cardHint{color:var(--dsw-alias-label-tertiary);margin:0;font-size:12px;line-height:18px}
.tm-mono{font-family:var(--ds-font-family-code)}
.tm-toolbar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:0 0 8px}
.tm-selector{background:var(--dsw-alias-bg-module-platform);height:36px;font:inherit;color:var(--dsw-alias-label-primary);cursor:pointer;border:none;border-radius:18px;align-items:center;gap:12px;padding:0 14px;font-size:14px;line-height:22px;display:inline-flex;max-width:100%}
.tm-selector:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}
.tm-selector:disabled{cursor:default;opacity:.4}
.tm-selectorLabel{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.tm-chevron{flex:none}
.tm-tabs{display:inline-flex;gap:2px;border:1px solid var(--dsw-alias-border-l1);border-radius:12px;padding:2px;margin:8px 0 4px}
.tm-tab{border:none;background:transparent;color:var(--dsw-alias-label-tertiary);font-size:13px;font-family:inherit;padding:4px 14px;border-radius:8px;cursor:pointer;line-height:20px}
.tm-tab:hover{color:var(--dsw-alias-label-primary)}
.tm-tabOn{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.tm-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(148px,1fr));gap:8px}
.tm-statGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px;margin:8px 0}
.tm-stat{background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l1);border-radius:12px;padding:10px 12px;display:flex;flex-direction:column;gap:2px;transition:border-color .15s;position:relative;overflow:hidden}
.tm-stat:hover{border-color:var(--dsw-alias-state-business-primary)}
.tm-stat-label{color:var(--dsw-alias-label-caption);font-size:11px;line-height:16px}
.tm-stat-value{color:var(--dsw-alias-label-primary);font-size:17px;font-weight:600;font-variant-numeric:tabular-nums;line-height:24px}
.tm-stat[data-tint="1"] .tm-stat-value{background:linear-gradient(100deg,var(--dsw-alias-state-business-primary),color-mix(in srgb,var(--dsw-alias-state-business-primary) 52%,#34d399));-webkit-background-clip:text;background-clip:text;color:transparent}
.tm-stat-sub{color:var(--dsw-alias-label-secondary);font-size:11px;line-height:16px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.tm-pop{position:fixed;z-index:50;pointer-events:none;background:var(--dsw-specific-menu);border:1px solid var(--dsw-alias-border-l2);border-radius:12px;box-shadow:var(--dsw-shadow-lv3);padding:10px 12px;font-size:12px;line-height:1.5;max-width:300px;color:var(--dsw-alias-label-primary)}
.tm-pop-title{font-weight:600;margin-bottom:6px;font-size:12.5px}
.tm-pop-row{display:flex;align-items:center;gap:6px;white-space:nowrap;margin:2px 0}
.tm-pop-row .tm-dot{width:8px;height:8px;border-radius:2.5px;flex:none}
.tm-pop-k{color:var(--dsw-alias-label-secondary)}
.tm-pop-v{margin-left:auto;font-variant-numeric:tabular-nums;padding-left:12px}
.tm-pop-bar{height:4px;border-radius:2px;background:var(--dsw-alias-interactive-bg-hover);flex:1;min-width:50px;overflow:hidden;display:block}
.tm-pop-fill{height:100%;border-radius:2px;display:block}
.tm-tip{position:fixed;background:var(--dsw-specific-menu);border:1px solid var(--dsw-alias-border-l2);border-radius:8px;box-shadow:var(--dsw-shadow-lv3);padding:7px 10px;font-size:11.5px;line-height:1.5;pointer-events:none;color:var(--dsw-alias-label-primary);z-index:60;max-width:280px}
.tm-tipfixed{position:fixed;background:var(--dsw-specific-menu);border:1px solid var(--dsw-alias-border-l2);border-radius:8px;box-shadow:var(--dsw-shadow-lv3);padding:7px 10px;font-size:11.5px;line-height:1.5;pointer-events:none;color:var(--dsw-alias-label-primary);z-index:60;max-width:280px}
.tm-tipfloat{z-index:500}
/* 浮窗内的图表悬浮提示：上浮到浮窗（z300）与旧浮窗之上，但低于供应商菜单（z400），不被浮窗遮挡 */
.tm-tip-above{z-index:350}
.tm-tiprow{display:flex;align-items:center;gap:6px;white-space:nowrap}
.tm-tip-k{color:var(--dsw-alias-label-secondary)}
.tm-tip-v{font-variant-numeric:tabular-nums;font-weight:500}
.tm-dot{width:10px;height:10px;border-radius:3px;flex:none;display:inline-block;background:var(--dsw-alias-state-success-primary)}
.tm-dot.warn{background:var(--dsw-alias-state-warn-primary)}.tm-dot.bad{background:var(--dsw-alias-state-error-primary)}
/* 禁用：红色空心环。与「拉取失败」的实心红区分开——禁用是主动选择，失败是异常 */
.tm-dot.off{background:transparent;box-sizing:border-box;border:1.5px solid var(--dsw-alias-state-error-primary)}
.tm-muted{color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px}
.tm-chart-title{font-weight:600;font-size:12.5px;color:var(--dsw-alias-label-secondary);margin:0 0 8px;display:flex;align-items:center;justify-content:space-between;gap:6px 8px;flex-wrap:wrap}
.tm-chart-title>span:first-child{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1 1 auto}
.tm-chartWrap{margin:8px 0;overflow-x:auto}
.tm-seg{display:inline-flex;gap:2px;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;padding:2px;flex-wrap:wrap}
.tm-seg-btn{border:none;background:transparent;color:var(--dsw-alias-label-tertiary);font-size:12px;font-family:inherit;padding:2px 8px;border-radius:6px;cursor:pointer;line-height:18px}
.tm-seg-btn:hover{color:var(--dsw-alias-label-primary)}
.tm-seg-on{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--dsw-alias-state-business-primary) 40%,transparent)}
.tm-legend{display:flex;align-items:center;gap:4px;margin-top:8px;flex-wrap:wrap}
.tm-cacheRow{display:flex;align-items:center;gap:5px;margin-top:6px;font-size:11px;color:var(--dsw-alias-label-secondary);flex-wrap:wrap;line-height:16px}
.tm-cacheSep{color:var(--dsw-alias-label-tertiary)}
/* ── 峰谷定价提示（额度面板置顶）：北京时间工作日两个峰段，其余为谷 ── */
.tm-peak{position:relative;display:flex;flex-direction:column;gap:6px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-2);border-radius:12px;padding:10px 12px;margin:0 0 8px;cursor:default}
.tm-peak:focus{outline:none}
.tm-peak:focus-visible{box-shadow:0 0 0 2px color-mix(in srgb,var(--dsw-alias-state-business-primary) 55%,transparent)}
.tm-peakHead{display:flex;align-items:center;gap:6px;min-width:0;flex-wrap:wrap;row-gap:4px}
.tm-peakDot{width:8px;height:8px;border-radius:50%;flex:none}
.tm-peakDot.peak{background:var(--dsw-alias-state-warn-primary);box-shadow:0 0 6px var(--dsw-alias-state-warn-primary)}
.tm-peakDot.valley{background:var(--dsw-alias-state-success-primary)}
/* 标题压到 4 字，状态独立成 chip；时间 flex:none + nowrap —— 三处都不再走省略号裁切 */
.tm-peakTitle{font-size:12px;font-weight:600;color:var(--dsw-alias-label-primary);white-space:nowrap;flex:none}
.tm-peakChip{flex:none;font-size:10.5px;line-height:16px;font-weight:600;padding:0 7px;border-radius:999px;white-space:nowrap}
.tm-peakChip.peak{color:var(--dsw-alias-state-warn-label);background:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 16%,transparent)}
.tm-peakChip.valley{color:var(--dsw-alias-state-success-primary);background:color-mix(in srgb,var(--dsw-alias-state-success-primary) 14%,transparent)}
.tm-peakTime{flex:none;margin-left:auto;text-align:right;font-size:11px;line-height:16px;color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums;white-space:nowrap}
/* 悬浮明细：portal 到 body，position:fixed 由 tm-tipfixed 提供，此处只管外观与动画 */
.tm-tipfixed.tm-peakPop{width:252px;max-width:calc(100vw - 16px);padding:9px 11px;font-size:11px;animation:tm-peakPopIn .18s cubic-bezier(.22,.8,.3,1);box-shadow:0 14px 34px -10px rgba(0,0,0,.42);border-color:color-mix(in srgb,var(--dsw-alias-state-business-primary) 30%,var(--dsw-alias-border-l2))}
.tm-peakPopHead{display:flex;align-items:center;gap:6px;font-weight:600;font-size:11.5px;margin-bottom:6px}
.tm-peakPopDot{width:7px;height:7px;border-radius:50%;flex:none}
.tm-peakPopDot.peak{background:var(--dsw-alias-state-warn-primary);box-shadow:0 0 5px var(--dsw-alias-state-warn-primary)}
.tm-peakPopDot.valley{background:var(--dsw-alias-state-success-primary)}
.tm-peakPopClock{margin-left:auto;font-family:var(--ds-font-family-code);font-variant-numeric:tabular-nums;font-weight:600;color:var(--dsw-alias-label-primary);animation:tm-peakTick .45s ease}
.tm-peakPop .tm-tip-v{font-weight:500}
.tm-peakPopFoot{margin-top:6px;padding-top:6px;border-top:1px dashed var(--dsw-alias-border-l1);font-size:10px;line-height:14px;color:var(--dsw-alias-label-tertiary)}
@keyframes tm-peakPopIn{from{opacity:0;transform:translateY(-6px) scale(.97)}}
@keyframes tm-peakTick{from{opacity:.25;transform:translateY(-4px)}}
.tm-peakBand{display:flex;gap:1.5px;height:10px}
.tm-peakCell{flex:1 1 0;min-width:0;border-radius:2px;background:var(--dsw-alias-interactive-bg-hover)}
.tm-peakCell.on{background:var(--dsw-alias-state-warn-primary);opacity:.85}
.tm-peakCell.now{outline:1.5px solid var(--dsw-alias-label-primary);outline-offset:-1px}
.tm-peakHint{font-size:10.5px;line-height:15px;color:var(--dsw-alias-label-tertiary)}
.tm-peakHint b{color:var(--dsw-alias-label-secondary);font-weight:600}
.tm-modelchip{display:inline-flex;align-items:center;gap:5px;border:1px solid var(--dsw-alias-border-l1);border-radius:999px;padding:2px 9px;font-size:11.5px;cursor:pointer;color:var(--dsw-alias-label-secondary);background:transparent;font-family:inherit;line-height:18px;max-width:180px;position:relative}
.tm-modelchip:hover{border-color:var(--dsw-alias-state-business-primary)}
.tm-modelchip[data-off="1"]{opacity:.38}
.tm-modelchip .tm-dot{width:8px;height:8px}
.tm-mc-name{max-width:130px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.tm-heatwrap{position:relative}
.tm-heatrow{display:flex;flex:1 1 auto;min-width:0}
.tm-hcell{border-radius:2.5px;flex:1 1 0;min-width:0;aspect-ratio:1;cursor:default}
.tm-hcell[data-lv="0"]{background:var(--dsw-alias-interactive-bg-hover);opacity:.45}
.tm-cell{width:9px;height:9px;border-radius:2.5px;display:inline-block;margin:0 2px;flex:none}
.tm-models{display:flex;flex-direction:column;flex:1;min-width:300px}
.tm-model{display:flex;align-items:flex-start;gap:10px;padding:8px 4px;border-bottom:1px solid var(--dsw-alias-border-l1);cursor:default;border-radius:6px}
.tm-model:hover{background:color-mix(in srgb, var(--dsw-alias-state-business-primary) 4%, transparent)}
.tm-model:last-child{border-bottom:none}
.tm-model .tm-dot{margin-top:5px}
.tm-bartrack{height:6px;border-radius:3px;background:var(--dsw-alias-interactive-bg-hover);flex:1;overflow:hidden;min-width:60px}
.tm-barfill{height:100%;border-radius:3px;transition:width .3s ease;display:block}
.tm-modelname{color:var(--dsw-alias-label-primary);font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0;flex:1}
.tm-modelval{color:var(--dsw-alias-label-secondary);font-size:12px;font-variant-numeric:tabular-nums;flex:none}
.tm-flexrow{display:flex;gap:20px;align-items:center;justify-content:center;flex-wrap:wrap}
.tm-empty{color:var(--dsw-alias-label-secondary);font-size:13px;text-align:center;padding:28px 0}
.tm-svgwrap{position:relative}
.tm-spark{display:block;width:100%;height:34px;margin-top:6px}
.tm-compose{display:flex;height:8px;border-radius:4px;overflow:hidden;margin-top:6px;background:var(--dsw-alias-interactive-bg-hover)}
.tm-compose span{display:block;height:100%}
.tm-compose-legend{display:flex;gap:8px;margin-top:5px;font-size:10px;color:var(--dsw-alias-label-caption);flex-wrap:wrap;line-height:14px}
.tm-compose-legend i{display:inline-block;width:7px;height:7px;border-radius:2px;margin-right:3px;vertical-align:-1px}
.tm-statgrow{margin-top:6px;font-size:11px;line-height:14px;display:flex;align-items:center;gap:4px}
.tm-arrow{display:inline-block;width:0;height:0;border-left:4px solid transparent;border-right:4px solid transparent;vertical-align:middle}
.tm-arrow-up{border-bottom:5px solid var(--dsw-alias-state-success-primary)}
.tm-arrow-down{border-top:5px solid var(--dsw-alias-state-error-primary)}
.tm-streakbar{height:8px;border-radius:4px;background:var(--dsw-alias-interactive-bg-hover);margin-top:7px;overflow:hidden}
.tm-streakfill{height:100%;border-radius:4px;display:block}
.tm-dayscroll{display:flex;gap:1.5px;margin-top:7px;height:12px}
.tm-dayscroll span{flex:1 1 0;min-width:0;border-radius:1.5px;display:block}
.tm-axislbl{fill:var(--dsw-alias-label-caption);font-size:10.5px}
.tm-gridln{stroke:var(--dsw-alias-border-l1);stroke-width:1}
.tm-bar{align-items:center;gap:8px;display:flex;flex-wrap:wrap;padding:12px 0;border-bottom:.5px solid var(--dsw-alias-border-l2)}
/* 额度卡 */
.tm-side{background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l1);border-radius:12px;padding:8px 10px;margin:2px 0;position:relative;overflow:visible}
.tm-side.loading{animation:tm-pulse 1.2s ease infinite}
.tm-side.error{border-color:var(--dsw-alias-state-error-primary)}
.tm-in{animation:tm-in .35s ease}
.tm-vendor{display:flex;align-items:center;gap:6px;width:100%;background:transparent;border:none;padding:0;cursor:pointer;text-align:left}
.tm-vname{flex:1;min-width:0;font-size:12px;font-weight:600;color:var(--dsw-alias-label-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.tm-vname2{color:var(--dsw-alias-label-primary);font-size:13px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.tm-vtype{flex:none;font-size:10px;color:var(--dsw-alias-brand-primary)}
.tm-vcaret{flex:none;font-size:10px;color:var(--dsw-alias-label-secondary)}
.tm-backdrop{position:fixed;inset:0;z-index:55;background:transparent;border:none;padding:0;margin:0;cursor:default}
.tm-popmenu{position:fixed;z-index:400;margin:0;min-width:180px;max-width:260px;background:color-mix(in srgb, var(--dsw-alias-bg-layer-1) 78%, transparent);-webkit-backdrop-filter:blur(12px) saturate(1.4);backdrop-filter:blur(12px) saturate(1.4);border:1px solid var(--dsw-alias-border-l2);border-radius:12px;box-shadow:0 12px 32px rgba(0,0,0,.25);padding:6px;max-height:240px;overflow:auto;display:flex;flex-direction:column;gap:2px}
.tm-mitem{display:flex;align-items:center;gap:6px;width:100%;background:transparent;border:1px solid transparent;border-radius:6px;padding:4px 6px;cursor:pointer;font-size:12px;color:var(--dsw-alias-label-secondary);text-align:left}
.tm-mitem:hover{border-color:var(--dsw-alias-border-l1);color:var(--dsw-alias-label-primary)}
.tm-mitem.active{color:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-brand-primary)}
.tm-mitem .grow{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.tm-qrow{display:flex;align-items:center;gap:6px;margin-top:6px}
/* 标签列：定宽让各行的进度条左端对齐；nowrap 保证标签永不换行
   （旧版硬编码 36px，4 字标签如「月度额度」会被挤成两行） */
.tm-qlabel{flex:none;width:52px;min-width:52px;font-size:11px;line-height:16px;color:var(--dsw-alias-label-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tm-qbar{flex:1;min-width:0;height:6px;border-radius:999px;background:var(--dsw-alias-bg-layer-2);overflow:hidden}
/* 占用四档：ok 蓝 / warn 黄(≥70%) / bad 红"快完了"(≥90%) / over 红+脉冲(≥100%) */
.tm-qfill{display:block;height:100%;border-radius:999px;background:var(--dsw-alias-brand-primary);transition:width .8s ease}
.tm-qfill.warn{background:var(--dsw-alias-state-warn-primary)}
.tm-qfill.bad{background:var(--dsw-alias-state-error-primary)}
.tm-qfill.over{background:var(--dsw-alias-state-error-primary);animation:tm-qpulse 1.6s ease-in-out infinite}
.tm-qpct{flex:none;font-size:11px;color:var(--dsw-alias-label-primary);font-variant-numeric:tabular-nums}
.tm-qpct.warn{color:var(--dsw-alias-state-warn-label)}
.tm-qpct.bad,.tm-qpct.over{color:var(--dsw-alias-state-error-primary);font-weight:600}
.tm-qsum-warn{color:var(--dsw-alias-state-warn-label)}
.tm-qsum-bad,.tm-qsum-over{color:var(--dsw-alias-state-error-primary)}
@keyframes tm-qpulse{0%,100%{opacity:1}50%{opacity:.55}}
.tm-qleft{flex:0 1 auto;min-width:0;font-size:10px;color:var(--dsw-alias-label-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
/* 窗口状态徽标：上游非 ok（如 opencode 的 rate-limited）时贴在百分比后，
   因为此时 pct 可能还没到 100%（限流 ≠ 用尽），必须单独说清楚 */
.tm-qstatus{flex:none;font-size:9.5px;line-height:15px;padding:0 6px;border-radius:999px;white-space:nowrap;color:var(--dsw-alias-state-error-primary);background:color-mix(in srgb,var(--dsw-alias-state-error-primary) 14%,transparent)}
.tm-qbal{display:flex;align-items:baseline;justify-content:space-between;margin-top:6px}
.tm-qbal b{font-size:15px;color:var(--dsw-alias-label-primary)}
.tm-qbal span{font-size:10px;color:var(--dsw-alias-label-secondary)}
.tm-body{margin-top:8px;background:transparent;border:none;border-radius:0;padding:0}
.tm-body .tm-qrow:first-child{margin-top:0}
.tm-payg-cur{font-size:12px;font-weight:600;color:var(--dsw-alias-label-secondary);margin-right:6px}
.tm-payg-amt{font-size:22px;font-weight:700;color:var(--dsw-alias-label-primary);font-variant-numeric:tabular-nums;line-height:1.2}
.tm-payg-amt.neg{color:var(--dsw-alias-state-error-primary)}
.tm-payg-top{display:flex;align-items:center;justify-content:space-between;gap:8px}
.tm-payg-sub{margin-top:2px;font-size:11px;color:var(--dsw-alias-label-secondary)}
.tm-avail{flex:none;font-size:11px;line-height:1.6;padding:1px 9px;border-radius:999px;border:1px solid}
.tm-avail.ok{color:var(--dsw-alias-state-success-primary);border-color:var(--dsw-alias-state-success-primary)}
.tm-avail.bad{color:var(--dsw-alias-state-error-primary);border-color:var(--dsw-alias-state-error-primary)}
.tm-avail.unknown{color:var(--dsw-alias-label-secondary);border-color:var(--dsw-alias-border-l1)}
.tm-infos{margin-top:8px;display:flex;flex-direction:column;gap:4px}
.tm-inforow{display:flex;justify-content:space-between;font-size:11px;color:var(--dsw-alias-label-secondary)}
.tm-inforow b{color:var(--dsw-alias-label-primary);font-variant-numeric:tabular-nums}
.tm-warn{margin:8px 0 0;font-size:11px;line-height:1.6;color:var(--dsw-alias-state-warn-primary)}
.tm-warn.bad{color:var(--dsw-alias-state-error-primary)}
.tm-mini.warn{color:var(--dsw-alias-state-warn-primary)}
.tm-xstats{margin-top:8px;display:flex;flex-direction:column;gap:4px}
.tm-xrow{display:flex;justify-content:space-between;font-size:11px;color:var(--dsw-alias-label-secondary)}
.tm-xrow b{color:var(--dsw-alias-label-primary);font-variant-numeric:tabular-nums}
/* 两列紧凑指标网格：单列长列表会把卡片撑高，两列直接减半 */
.tm-xgrid{margin-top:8px}
.tm-xgridBody{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:4px 12px}
.tm-xcell{display:flex;align-items:baseline;justify-content:space-between;gap:8px;min-width:0;font-size:11px;color:var(--dsw-alias-label-secondary)}
.tm-xcellLabel{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.tm-xcellValue{flex:none;color:var(--dsw-alias-label-primary);font-variant-numeric:tabular-nums;white-space:nowrap}
/* 窄卡片（侧边栏/浮窗）退回单列，避免两列后每格太挤 */
@container tm (max-width: 300px){.tm-xgridBody{grid-template-columns:minmax(0,1fr)}}
/* 紧凑余额块：大数字是核心，减少上下留白 */
.tm-payg-compact .tm-payg-amt{font-size:20px}
.tm-payg-compact .tm-payg-sub{margin-top:0}
.tm-payg-compact .tm-warn{margin-top:4px}
/* 分组标题：说明「已禁用沉底」是有意排序，不是配置顺序 */
.tm-xchart{margin-top:8px}
.tm-xtitle{font-size:10px;color:var(--dsw-alias-label-secondary);margin-bottom:2px}
.tm-xsplit{display:flex;height:8px;border-radius:999px;overflow:hidden;background:var(--dsw-alias-bg-layer-2);margin-top:6px}
.tm-xsplit span{display:block;height:100%}
.tm-xdot{display:inline-block;width:7px;height:7px;border-radius:2px;margin-right:5px}
.tm-sections{display:flex;flex-direction:column}
.tm-ui{display:flex;flex-direction:column}
.tm-xprog{margin-top:8px}
.tm-vchips{display:flex;flex-wrap:wrap;gap:4px;margin-top:6px}
.tm-vchip{display:inline-flex;align-items:center;font-size:10.5px;line-height:16px;padding:0 8px;border-radius:999px;border:1px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-layer-2);white-space:nowrap}
.tm-vchip-ok{color:var(--dsw-alias-state-success-primary);border-color:var(--dsw-alias-state-success-primary)}
.tm-vchip-warn{color:var(--dsw-alias-state-warn-primary);border-color:var(--dsw-alias-state-warn-primary)}
.tm-vchip-bad{color:var(--dsw-alias-state-error-primary);border-color:var(--dsw-alias-state-error-primary)}
.tm-vchip-info{color:var(--dsw-alias-state-business-primary);border-color:var(--dsw-alias-state-business-primary)}
/* ── 失败卡：结论 + 处置 + 可展开排查详情（红/黄/蓝三档严重度）── */
.tm-errbox{margin-top:8px;background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l1);border-left:3px solid var(--dsw-alias-state-warn-primary);border-radius:8px;padding:8px 10px}
.tm-errbox-bad{border-color:color-mix(in srgb,var(--dsw-alias-state-error-primary) 45%,var(--dsw-alias-border-l1));border-left-color:var(--dsw-alias-state-error-primary)}
.tm-errbox-warn{border-left-color:var(--dsw-alias-state-warn-primary)}
.tm-errbox-info{border-left-color:var(--dsw-alias-state-business-primary)}
.tm-errhead{display:flex;align-items:flex-start;gap:8px;width:100%;background:transparent;border:none;padding:0;cursor:pointer;text-align:left;font:inherit}
.tm-erricon{flex:none;width:22px;height:22px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:12px;line-height:1;background:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 18%,transparent)}
.tm-erricon-bad{background:color-mix(in srgb,var(--dsw-alias-state-error-primary) 18%,transparent)}
.tm-erricon-info{background:color-mix(in srgb,var(--dsw-alias-state-business-primary) 18%,transparent)}
.tm-errtitlewrap{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.tm-errtitle{font-size:12.5px;font-weight:600;color:var(--dsw-alias-state-warn-label)}
.tm-errbox-bad .tm-errtitle{color:var(--dsw-alias-state-error-primary)}
.tm-errbox-info .tm-errtitle{color:var(--dsw-alias-label-primary)}
.tm-errhint{font-size:11px;line-height:1.6;color:var(--dsw-alias-label-secondary)}
.tm-erraction{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:6px 0 0 30px}
.tm-erractionText{flex:1;min-width:0;font-size:11px;color:var(--dsw-alias-label-secondary)}
.tm-errabtns{display:inline-flex;gap:4px;flex:none}
.tm-errdetail{margin-top:8px;padding-top:8px;border-top:1px solid var(--dsw-alias-border-l1);font-size:11px;line-height:1.7;color:var(--dsw-alias-label-secondary)}
.tm-errsub{font-size:10.5px;font-weight:600;color:var(--dsw-alias-label-secondary);margin:0 0 2px}
.tm-errsteps{margin:0 0 8px;padding-left:18px}
.tm-errsteps li{margin:2px 0}
.tm-errraw{margin:0;padding:6px 8px;border-radius:6px;background:var(--dsw-alias-bg-layer-1);font-family:var(--ds-font-family-code);font-size:10.5px;line-height:1.6;color:var(--dsw-alias-label-secondary);word-break:break-all;white-space:pre-wrap;max-height:160px;overflow:auto}
.tm-errdactions{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:8px}
.tm-errmeta{font-size:10.5px;color:var(--dsw-alias-label-tertiary);margin-left:auto}
.tm-errbox-compact{padding:6px 8px}
.tm-errbox-compact .tm-erraction{margin-left:0}
.tm-qmeta{display:flex;align-items:center;justify-content:space-between;margin-top:6px}
.tm-qmeta span{font-size:10px;color:var(--dsw-alias-label-secondary)}
.tm-mini{background:transparent;border:1px solid transparent;border-radius:6px;cursor:pointer;color:var(--dsw-alias-label-secondary);font-size:11px;padding:2px 6px}
.tm-mini:hover{border-color:var(--dsw-alias-border-l1);color:var(--dsw-alias-label-primary)}
.tm-err{font-size:11px;color:var(--dsw-alias-state-error-primary);margin-top:6px;line-height:1.6}
.tm-codeblock{margin-top:2px}
.tm-codeblock pre{max-height:340px;overflow:auto}
.tm-run{font-size:12px;color:var(--dsw-alias-label-secondary);line-height:1.7}
.tm-run b{color:var(--dsw-alias-label-primary)}
.tm-inputWrap{display:inline-flex;align-items:center;gap:6px;height:32px;padding:0 8px;border:.5px solid var(--dsw-alias-border-l4);border-radius:8px;background:var(--dsw-alias-bg-layer-1);width:100%}
.tm-inputWrap:focus-within{border-color:var(--dsw-alias-brand-primary)}
.tm-input{flex:1;min-width:0;border:none;outline:none;background:transparent;font-size:14px;line-height:22px;color:var(--dsw-alias-label-primary);font-family:inherit}
.tm-input::placeholder{color:var(--dsw-alias-label-dimmed)}
.tm-input:disabled{opacity:.5}
.tm-ninput{flex:1;min-width:0;border:none;outline:none;background:transparent;font-size:14px;line-height:22px;color:var(--dsw-alias-label-primary);font-family:inherit}
.tm-ninput::placeholder{color:var(--dsw-alias-label-dimmed)}
.tm-ninput:disabled{opacity:.5}
.tm-textarea{box-sizing:border-box;border:.5px solid var(--dsw-alias-border-l4);background:var(--dsw-alias-bg-layer-1);font:inherit;color:var(--dsw-alias-label-primary);border-radius:8px;padding:8px 12px;font-size:13px;line-height:20px;outline:none;width:100%;resize:vertical;min-height:64px}
.tm-textarea:focus-visible{border-color:var(--dsw-alias-brand-primary)}
.tm-badge{white-space:nowrap;align-items:center;height:20px;border-radius:999px;padding:0 8px;font-size:11px;font-weight:500;line-height:20px;display:inline-flex;flex:none}
.tm-badge-ok{background:var(--dsw-alias-state-success-tertiary);color:var(--dsw-alias-state-success-primary)}
.tm-badge-warn{background:var(--dsw-alias-state-warn-tertiary);color:var(--dsw-alias-state-warn-label)}
.tm-badge-muted{background:var(--dsw-alias-button-ghost-active-fill);color:var(--dsw-alias-label-caption)}
.tm-badge-info{background:var(--dsw-alias-state-business-tertiary);color:var(--dsw-alias-state-business-primary)}
.tm-loading{align-items:center;gap:8px;display:flex}
.tm-loadingText{color:var(--dsw-alias-label-tertiary);font-size:13px;line-height:20px}
.tm-spinner{box-sizing:border-box;border:1.5px solid var(--dsw-alias-border-l2);border-top-color:var(--dsw-alias-state-business-primary);border-radius:50%;width:12px;height:12px;animation:tm-spin .7s linear infinite;flex:none;display:inline-block}
.tm-formGrid{display:flex;flex-direction:column;gap:8px;width:100%}
.tm-fieldLabel{font-size:12px;color:var(--dsw-alias-label-secondary);margin-bottom:2px}
.tm-footerNote{color:var(--dsw-alias-label-tertiary);font-size:11.5px;line-height:17px;margin:0}
.tm-vendor-row{display:flex;align-items:center;gap:2px}
.tm-vendor-row .tm-vendor{flex:1;min-width:0;width:auto}
/* 今日卡 */
.tm-today{border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);border-radius:12px;padding:10px 12px;margin:8px 0;width:100%;flex:none;cursor:default;box-sizing:border-box;overflow:hidden}
.tm-today:hover{border-color:var(--dsw-alias-state-business-primary)}
.tm-todaylabel{color:var(--dsw-alias-label-caption);font-size:11px;line-height:16px}
.tm-todayval{color:var(--dsw-alias-label-primary);font-size:18px;font-weight:600;font-variant-numeric:tabular-nums;line-height:24px}
.tm-todayhead{display:flex;align-items:baseline;justify-content:space-between;gap:8px}
.tm-todayhead .tm-todayval{font-size:15px;flex:none;margin-left:auto}
.tm-todaymodels{display:flex;flex-direction:column;align-items:stretch;gap:2px;margin-top:5px}
.tm-todaymchip{display:inline-flex;align-items:center;gap:4px;font-size:10px;color:var(--dsw-alias-label-secondary);max-width:100%;line-height:14px}
.tm-todaymchip .tm-dot{width:7px;height:7px}
.tm-todaymchip span:last-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
/* 侧栏 footer actions 垂直布局：与 Cordis 徽章并排会横向溢出被裁（折叠侧栏仅 56px），改为垂直堆叠 */
div:has(> div[data-slot="sidebar.footer.action"]){flex-direction:column;align-items:stretch}
.tm-todayRail{padding:3px 4px;box-sizing:border-box;min-width:0;max-width:100%;width:auto;margin:2px 0 0;display:flex;flex-direction:column;align-items:center;justify-content:center;border-radius:12px;background:var(--dsw-alias-bg-layer-1);cursor:pointer}
.tm-todayRail:hover{border-color:var(--dsw-alias-state-business-primary)}
.tm-todayRail .tm-todaymodels,.tm-todayRail .tm-spark,.tm-todayRail .tm-statgrow{display:none}
.tm-todayRail .tm-todayhead{display:none}
.tm-todayRail .tm-todayval{font-size:9px;line-height:12px;text-align:center;white-space:nowrap;font-weight:600}
.tm-todayRail .tm-todaylabel{font-size:8px;line-height:11px;text-align:center;white-space:nowrap;letter-spacing:.06em}
/* 浮窗：抓手拖出 / 标题栏拖到任意位置 / 双击或📌收回，毛玻璃 */
.tm-grip{flex:none;cursor:grab;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:1;padding:4px 2px;border-radius:6px;user-select:none;-webkit-user-select:none;touch-action:none}
.tm-grip:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-2)}
.tm-grip:active{cursor:grabbing}
.tm-minibtn{flex:none;background:transparent;border:1px solid transparent;border-radius:6px;cursor:pointer;color:var(--dsw-alias-label-secondary);font-size:11px;padding:2px 6px;font-family:inherit;line-height:16px;margin-left:6px}
.tm-minibtn:hover{border-color:var(--dsw-alias-border-l1);color:var(--dsw-alias-label-primary)}
.tm-float{position:fixed;z-index:300;width:300px;max-width:calc(100vw - 16px);background:color-mix(in srgb, var(--dsw-alias-bg-layer-1) 72%, transparent);-webkit-backdrop-filter:blur(16px) saturate(1.4);backdrop-filter:blur(16px) saturate(1.4);border:1px solid var(--dsw-alias-border-l2);border-radius:12px;box-shadow:0 16px 40px rgba(0,0,0,.3);padding:10px 12px;box-sizing:border-box;overflow:hidden}
@supports not ((backdrop-filter:blur(1px)) or (-webkit-backdrop-filter:blur(1px))){.tm-float{background:var(--dsw-alias-bg-layer-1)}.tm-popmenu{background:var(--dsw-alias-bg-layer-1)}}
.tm-floathead{cursor:move;user-select:none;-webkit-user-select:none;touch-action:none}
.tm-float-hd{display:flex;align-items:center;gap:6px;padding:8px 10px;cursor:move;user-select:none;-webkit-user-select:none;touch-action:none;background:transparent;border-bottom:none}
.tm-float-bd{padding:2px 12px 10px}
.tm-float-bd .tm-qmeta{margin-top:8px}
.tm-widget-title{flex:1;min-width:0;font-size:12px;font-weight:600;color:var(--dsw-alias-label-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.tm-widget-bd{padding:2px 12px 10px;max-height:calc(72vh - 48px);overflow:auto}
/* ── widget 浮窗：只做定位，不含任何外框（组件自身卡片即外观，浮出前后视觉一致）。
   统一规格：宽 360px（与 clamp 常量一致）、最大高 60vh、超高内部滚动；
   自身也是 inline-size 容器 —— 浮窗内的窄栏规则（模型分布上下排列等）与中心区一致。 ── */
.tm-widgetFloat{position:fixed;z-index:300;max-width:calc(100vw - 16px);width:360px;max-height:60vh;overflow-y:auto;overscroll-behavior:contain;container-type:inline-size;container-name:tm}
.tm-widgetFloat>.tm-card,.tm-widgetFloat>.tm-today{margin:0;box-sizing:border-box}
/* 浮窗内的 Seg 行：可换行居中，窄时各按钮撑整行宽，不溢出组件 */
.tm-segRow{display:flex;justify-content:center;flex-wrap:wrap;gap:6px;margin-bottom:8px}
@container tm (max-width: 420px){.tm-segRow .tm-seg{width:100%;justify-content:center}.tm-segRow .tm-seg-btn{flex:1 1 auto;text-align:center}}
/* 小组件工具条：标签 + 开关按钮 */
.tm-widgetBtn{display:inline-flex;align-items:center;gap:2px;border:1px solid var(--dsw-alias-border-l1);border-radius:6px;padding:1px 4px 1px 8px;font-size:12px;color:var(--dsw-alias-label-secondary)}
.tm-widgetBtn-label{line-height:20px;white-space:nowrap}
/* 图表标题首段：窄栏省略号，不换行挤高 */
.tm-chart-name{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1 1 auto}
/* 模型行：名称+数值允许换行；明细行窄栏可换行不截断 */
.tm-modelhead{display:flex;justify-content:space-between;gap:8px;min-width:0;flex-wrap:wrap}
.tm-modeldetail{margin-top:2px;font-size:11px;line-height:16px;overflow-wrap:anywhere}
/* 环形图容器：可随宽度缩放，窄栏与模型列表上下排列 */
.tm-donutBox{flex:none;max-width:100%}
.tm-swrow{border-bottom:.5px solid var(--dsw-alias-border-l2);align-items:center;gap:8px;padding:16px 0;display:flex}
.tm-swrowText{flex-direction:column;flex:1;gap:4px;min-width:0;padding-right:48px;display:flex}
.tm-swlabel{font-size:14px;font-weight:400;line-height:22px;color:var(--dsw-alias-label-primary)}
.tm-swhint{font-size:12px;font-weight:400;line-height:18px;color:var(--dsw-alias-label-tertiary)}
.tm-switch{box-sizing:border-box;background:var(--dsw-alias-border-l3);cursor:pointer;border:0;border-radius:999px;flex:none;width:36px;height:20px;padding:2px;position:relative}
.tm-switch[aria-checked="true"]{background:var(--dsw-alias-brand-primary)}
.tm-switch:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}
.tm-switchOn{background:var(--dsw-alias-brand-primary)}
.tm-switch:disabled{cursor:default;opacity:.5}
.tm-knob,.tm-thumb{background:var(--dsw-alias-label-primary-foreground);border-radius:50%;width:16px;height:16px;transition:transform .12s;display:block}
.tm-switch[aria-checked="true"] .tm-knob,.tm-switchOn .tm-thumb,.tm-switchOn .tm-knob{transform:translate(16px)}
.tm-dualbars{display:flex;gap:2px;margin-top:4px;width:100%;justify-content:center}
/* 动画与过渡增强（置于 CSS 末尾：覆盖同特异性前序声明） */
.tm-card{position:relative;transition:border-color .2s,top .2s;animation:tm-fadeup .42s ease backwards}
.tm-card:hover{border-color:color-mix(in srgb,var(--dsw-alias-state-business-primary) 45%,var(--dsw-alias-border-l1));top:-1px}
.tm-stat{animation:tm-fadeup .42s ease backwards}
.tm-stat:hover{top:-1.5px;box-shadow:0 3px 12px -4px rgba(0,0,0,.18)}
.tm-seg-on{box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--dsw-alias-state-business-primary) 40%,transparent)}
.tm-modelchip{transition:border-color .15s,top .15s,opacity .2s}
.tm-modelchip:hover{top:-1px}
.tm-model{transition:background .15s}
.tm-modelval{transition:color .15s}
.tm-today{transition:border-color .18s}
.tm-pop,.tm-tip,.tm-tipfixed{animation:tm-pop .13s ease-out}
.tm-gridln,.tm-axislbl{animation:tm-fade .5s ease backwards}
.tm-barfill,.tm-streakfill,.tm-pop-fill,.tm-compose span,.tm-qfill{transform-origin:left center;animation:tm-groww .55s cubic-bezier(.22,.8,.36,1) backwards}
.tm-barfill{transition:none}
.tm-compose span{animation-delay:.1s}
.tm-streakfill{animation-delay:.12s}
.tm-pop-fill{animation-delay:.06s}
.tm-dayscroll span{animation:tm-fade .4s ease backwards}
.tm-draw{stroke-dasharray:20000;animation:tm-draw 1.05s cubic-bezier(.4,0,.2,1) backwards}
.tm-fadein{animation:tm-fade .45s ease backwards}
.tm-rise{transform-box:fill-box;transform-origin:bottom center;animation:tm-risev .5s cubic-bezier(.22,.8,.36,1) backwards}
.tm-hcell[data-lv]:not([data-lv="0"]){animation:tm-heatin .5s cubic-bezier(.2,.8,.3,1.2) backwards}
.tm-donutseg{animation:tm-donutseg .85s cubic-bezier(.3,.6,.3,1) backwards}
.tm-donut-c{position:absolute;left:50%;top:46%;transform:translate(-50%,-50%);width:110px;text-align:center;font-size:16px;font-weight:600;color:var(--dsw-alias-label-primary);font-variant-numeric:tabular-nums;line-height:20px;pointer-events:none}
.tm-donut-cap{position:absolute;left:50%;top:calc(46% + 18px);transform:translateX(-50%);width:110px;text-align:center;font-size:11px;color:var(--dsw-alias-label-caption);pointer-events:none}
.tm-spin{display:inline-block;animation:tm-rot 1s linear infinite}
@keyframes tm-in{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
@keyframes tm-fadeup{from{opacity:0;transform:translateY(6px)}}
@keyframes tm-fade{from{opacity:0}}
@keyframes tm-draw{from{stroke-dashoffset:20000}to{stroke-dashoffset:0}}
@keyframes tm-groww{from{transform:scaleX(0)}}
@keyframes tm-risev{from{transform:scaleY(0)}}
@keyframes tm-heatin{from{opacity:0;transform:scale(.4)}}
@keyframes tm-donutseg{from{stroke-dashoffset:0}}
@keyframes tm-rot{to{transform:rotate(360deg)}}
@keyframes tm-pop{from{opacity:0;transform:scale(.96)}}
@keyframes tm-pulse{0%,100%{opacity:1}50%{opacity:.5}}
@keyframes tm-spin{to{transform:rotate(360deg)}}
@media (prefers-reduced-motion:reduce){.tm-page *,.tm-today *,.tm-pop,.tm-tip,.tm-tipfixed{animation:none!important;transition:none!important}.tm-spinner{animation:none}.tm-thumb,.tm-knob{transition:none}}
/* ── 窄栏适配（中心区拉到最窄时）：容器查询，卡片收紧、标题不截断按钮不换行 ── */
@container tm (max-width: 480px){
.tm-card{padding:10px 12px}
.tm-intro{font-size:13px}
.tm-vname2{max-width:150px!important}
.tm-models{min-width:0;width:100%}
.tm-flexrow{flex-direction:column;gap:10px;align-items:center}
.tm-donutBox{width:148px!important;height:148px!important}
.tm-legend{gap:3px}
.tm-modelchip{max-width:140px}
.tm-qrow{gap:4px}
.tm-qlabel{width:48px;min-width:48px}
.tm-qpct{font-size:10px}
.tm-qleft{font-size:9px}
.tm-qstatus{font-size:9px;padding:0 5px}
.tm-minibtn{padding:2px 4px}
.tm-btn{padding:5px 9px;font-size:12px}
.tm-selector{font-size:13px;padding:0 12px}
.tm-rowText{padding-right:12px}
.tm-swrowText{padding-right:12px}
}
@container tm (max-width: 340px){
.tm-vname2{max-width:110px!important}
.tm-grid{grid-template-columns:repeat(auto-fill,minmax(128px,1fr))}
.tm-statGrid{grid-template-columns:repeat(auto-fill,minmax(128px,1fr))}
.tm-payg-amt{font-size:18px}
.tm-hint{font-size:11px}
.tm-cardHint{font-size:11px}
.tm-pop-row{white-space:normal}
.tm-donutBox{width:128px!important;height:128px!important}
.tm-modelval{font-size:11px}
.tm-modelname{font-size:12px}
}
/* ── 圆角：只用产品默认值，不自定义、不覆盖全局角形 ─────────────────────
 * 两条纪律：
 *  1) 不设私有半径变量层（旧版有 :root{--tm-r-*} 与 .tm-cview 覆盖）。产品没有
 *     半径 token，半径由各组件自定；插件直接写与官方组件同一套默认值即可：
 *       12px 大面（卡片/浮窗/浮出菜单）· 8px 控件（按钮/输入/提示块）
 *       6px 小件（chip/迷你按钮/分段按钮）· 999px 胶囊 · 50% 圆形
 *     这样任何调主题/半径的插件用普通规则即可覆盖，不必知道本插件的私有变量。
 *  2) 不声明 corner-shape。产品主题包（dsh-client-ui-theme/corner-shape.css）已经
 *     用 *,:before,:after 上的 corner-shape:var(--dsw-corner-shape) 全局接管角形；
 *     插件再写一遍（哪怕写 round）就会把那层的主题选择顶掉 —— 正是要避免的。
 * 图表内部的微圆角（点/条/热力格 1.5~4px、圆环 50%）属于图形几何，不在此列。 */

/* ── 分享卡（16:9，内聚真组件）────────────────────────────────────────────
 * 舞台用 aspect-ratio 锁死 16:9；板子按**逻辑尺寸 1920×1080** 排版（组件在那一层量到的
 * 宽度就是它的真实布局宽度，响应式分栏照常生效），再用 transform 整体缩进舞台，
 * 所以卡内版式与窗口尺寸无关。遮罩本身不进入卡片，直接系统截图也只会截到卡。 */
.tm-shareBtn{flex:none;display:inline-flex;align-items:center;gap:5px;height:26px;padding:0 10px;margin-left:6px;border-radius:8px;border:1px solid var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;cursor:pointer}
.tm-shareBtn:hover{color:var(--dsw-alias-label-primary);border-color:color-mix(in srgb,var(--dsw-alias-state-business-primary) 55%,var(--dsw-alias-border-l2))}
.tm-shareBtn>svg{flex:none;display:block}
.tm-shareVeil{position:fixed;inset:0;z-index:600;display:flex;flex-direction:column;align-items:center;gap:12px;padding:18px;box-sizing:border-box;background:color-mix(in srgb,var(--dsw-alias-bg-base) 88%,transparent);-webkit-backdrop-filter:blur(14px) saturate(1.3);backdrop-filter:blur(14px) saturate(1.3);overflow:auto}
.tm-shareBar{flex:none;width:min(96vw,calc(86vh * 16 / 9));display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.tm-shareBarTitle{font-size:13px;font-weight:600;color:var(--dsw-alias-label-primary)}
.tm-shareBarHint{font-size:12px;color:var(--dsw-alias-label-tertiary);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1 1 auto}
.tm-shareToggle{display:inline-flex;align-items:center;gap:5px;font-size:12px;color:var(--dsw-alias-label-secondary);white-space:nowrap;cursor:pointer}
.tm-shareToggle input{accent-color:var(--dsw-alias-state-business-primary)}
/* 舞台：**一屏大小 + 可滚动**。不锁 16:9 —— 六块内容的自然高度就是一千多像素，
   硬塞进 1.78 的画幅只能整体缩到 0.55 倍（字糊、两侧大片空白），这正是之前的问题。
   宽度取 96vw / 1680px 的较小者，高度吃满剩余视口；板子按容器实际宽度 1:1 排版。 */
.tm-shareStage{flex:1 1 auto;width:min(96vw,1680px);max-height:calc(100vh - 150px);min-height:320px;border-radius:16px;overflow:auto;overscroll-behavior:contain;box-shadow:var(--dsw-shadow-lv3);position:relative;background:var(--dsw-alias-bg-base)}
.tm-shareLoading{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:8px;color:var(--dsw-alias-label-tertiary);font-size:13px}
/* 缩放层：板子 1920×1080 → scale(舞台宽/1920)，缩放系数由 ResizeObserver 写进 inline style */
/* 板子直接铺在舞台里：宽度 100% 跟随容器（组件按真实像素宽度排版，响应式分栏照常生效） */
.tm-shareZoom{width:100%}
/* ── 板子本体 ─────────────────────────────────────────────────────────── */
.tm-shareBoard.tm-shareBoard{width:100%;height:auto;box-sizing:border-box;padding:20px 24px 14px;display:flex;flex-direction:column;align-items:stretch;gap:12px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font-size:13px;line-height:1.6;overflow:hidden;min-height:0}
/* 页头分三层，各自成块，避免"全都堆在右上角"：
   ① 标题区（左）＋ 作者区（右） ② 细线 ③ 来源信息条（插件/版本/仓库左，生成信息右） */
.tm-shareHead{flex:none;display:flex;flex-direction:column;gap:8px;padding:0 2px 9px;border-bottom:.5px solid var(--dsw-alias-border-l2)}
.tm-shareTop{display:flex;align-items:flex-start;justify-content:space-between;gap:20px}
.tm-shareTitleBox{display:flex;flex-direction:column;gap:2px;min-width:0}
.tm-shareBrandRow{display:flex;align-items:center;gap:8px;min-width:0}
.tm-shareLogo{flex:none;display:block;color:var(--dsw-alias-state-business-primary)}
.tm-shareAuthorBox{display:flex;flex-direction:column;align-items:flex-end;gap:1px;flex:none;text-align:right}
.tm-shareAuthor{font-size:15.5px;font-weight:600;line-height:21px;color:var(--dsw-alias-label-primary)}
.tm-shareMail{font-size:12.5px;line-height:17px;color:var(--dsw-alias-label-caption)}
/* 来源信息条：左对齐一行，与标题层之间有细线；仓库地址不再和作者挤在一起右对齐 */
.tm-shareMeta{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;padding-top:7px;border-top:.5px solid var(--dsw-alias-border-l1)}
.tm-sharePlug{font-size:14px;font-weight:600;line-height:19px;color:var(--dsw-alias-state-business-primary);white-space:nowrap}
.tm-sharePlug em{font-style:normal;font-weight:400;font-size:12px;opacity:.8;margin-left:4px}
.tm-shareMetaSep{font-size:12.5px;color:var(--dsw-alias-label-dimmed)}
.tm-shareRepo{font-size:12.5px;line-height:18px;color:var(--dsw-alias-label-secondary);white-space:nowrap}
.tm-shareMetaR{margin-left:auto;font-size:12px;line-height:18px;color:var(--dsw-alias-label-caption)}
.tm-shareBrand{font-size:21px;font-weight:700;line-height:28px;color:var(--dsw-alias-label-primary)}
.tm-shareSub{font-size:12.5px;line-height:18px;color:var(--dsw-alias-label-caption)}
/* 两列栅格：① 用量基础数据（通栏）② 趋势 | 热力图 ③ 每日在线 | 模型分布 ④ 在线三口径（通栏） */
/* 四栏栅格。为什么不是均分三栏：趋势图与热力图是两块"吃宽度"的图（趋势图高度 = 宽度*0.24
   且有 230px 上限；热力格子是 1:1 方格，宽度直接决定格子大小），各占半幅（764px）才接近
   视图里的观感；余下两栏放模型分布与在线三口径。 */
.tm-shareGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;align-content:start}
.tm-shareCell{min-width:0;display:flex;flex-direction:column}
.tm-shareCell>*{margin:0!important;flex:1 1 auto;min-width:0}
.tm-sr6{grid-column:1/-1}
/* 分享卡是静态图：不显示任何档位/小组件开关。组件本身一行没改，只是控件不出现 ——
   否则卡上会出现一堆点了才有反应的按钮，截图出去更乱，而且会写进用户的偏好存储。 */
.tm-shareBoard .tm-seg,
.tm-shareBoard .tm-widgetBtn,
.tm-shareBoard .tm-toolbar>button{display:none!important}
/* 栅格列数不再写死：板子根节点自带 .tm-cview（见上），所以 .tm-cview .tm-grid /
   .tm-cview .tm-statGrid / @container tmc 那一整套响应式规则在板子里同样命中，
   列数与视图里保持一致 —— 这正是"在分享面板里也应当是响应式的"。 */
/* 指标卡栅格不写死列数：板宽是跟随容器的，13 张卡在窄容器里自然折成多行才是对的
   （视图自己就是这么响应的）。写死列数只在"必须塞进固定画幅"时才有意义。 */
.tm-shareBoard .tm-dash{display:block}
.tm-shareBoard .tm-card{box-shadow:none}

/* ── 语义图标与卡片底纹（glyphs.ts）────────────────────────────────────────
 * 同一枚语义图标用两处：
 *  · .tm-stat-ico / .tm-cico —— 13~14px 小图标，贴在指标标签前、卡片标题前；
 *  · .tm-stat-bg —— 同一个名字放大到 58px、低透明度，摆在指标卡右下角当水印底纹，
 *    让「累计 / 缓存 / 连续 / 峰值…」各带一点与数据意境相符的图形，而不是纯色块。
 * 颜色都走 currentColor，这里只管尺寸、颜色与层级。 */
.tm-stat-ico,.tm-cico{flex:none;display:block;color:var(--dsw-alias-label-tertiary)}
.tm-stat[data-tint="1"] .tm-stat-ico{color:color-mix(in srgb,var(--dsw-alias-state-business-primary) 70%,var(--dsw-alias-label-tertiary))}
/* 水印：卡片第一个子元素 + absolute 右下"出血"，必须在文字之下 */
.tm-stat-bg{position:absolute;right:-10px;bottom:-12px;z-index:0;pointer-events:none;user-select:none;color:var(--dsw-alias-state-business-primary);opacity:.075}
.tm-stat[data-tint="1"] .tm-stat-bg{opacity:.12}
/* 文字层压在底纹之上 */
.tm-stat-label,.tm-stat-value,.tm-stat-sub,.tm-stat .tm-spark,.tm-stat .tm-compose,.tm-stat .tm-streakbar,.tm-stat .tm-dayscroll{position:relative;z-index:1}
/* 标题行里的图标 + 文本：文本负责省略号，图标不参与压缩 */
.tm-chart-name{display:flex;align-items:center;gap:6px;min-width:0;flex:1 1 auto}
.tm-titledIco{display:inline-flex;align-items:center;gap:6px;min-width:0}
.tm-cname-txt,.tm-titledIco>span:last-child{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
/* ── 峰谷氛围（置于末尾以覆盖前序同特异性声明）─────────────────────────
 * 峰（工作日 9:00–18:00）：暖色左缘 + 极缓呼吸光晕 —— 紧张、消耗加速；
 * 谷：冷绿左缘 + 静稳底色 —— 费率低、可从从容容跑量；
 * 禁用（enabled:false）：红色左缘 —— 不参与定时拉取。 */
.tm-card.mood-peak,.tm-side.mood-peak{border-left:3px solid var(--dsw-alias-state-warn-primary);background:linear-gradient(180deg,color-mix(in srgb,var(--dsw-alias-state-warn-primary) 10%,transparent),transparent 64%),var(--dsw-alias-bg-layer-1)}
.tm-card.mood-valley,.tm-side.mood-valley{border-left:3px solid var(--dsw-alias-state-success-primary);background:linear-gradient(180deg,color-mix(in srgb,var(--dsw-alias-state-success-primary) 8%,transparent),transparent 64%),var(--dsw-alias-bg-layer-1)}
.tm-card.tm-off,.tm-side.tm-off{border-left:3px solid var(--dsw-alias-state-error-primary);background:linear-gradient(180deg,color-mix(in srgb,var(--dsw-alias-state-error-primary) 8%,transparent),transparent 64%),var(--dsw-alias-bg-layer-1)}
.tm-card.mood-peak{animation:tm-fadeup .42s ease backwards,tm-peak-breathe 2.4s ease-in-out .5s infinite}
@keyframes tm-peak-breathe{0%,100%{box-shadow:0 0 0 0 transparent}50%{box-shadow:0 0 0 3px color-mix(in srgb,var(--dsw-alias-state-warn-primary) 16%,transparent)}}
.tm-badge-bad{background:color-mix(in srgb,var(--dsw-alias-state-error-primary) 16%,transparent);color:var(--dsw-alias-state-error-primary)}
.tm-offtxt{color:var(--dsw-alias-state-error-primary)}
.tm-peak.peak{border-color:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 46%,var(--dsw-alias-border-l1));background:linear-gradient(180deg,color-mix(in srgb,var(--dsw-alias-state-warn-primary) 9%,transparent),transparent 70%),var(--dsw-alias-bg-layer-2);animation:tm-peak-breathe 2.6s ease-in-out infinite}
.tm-peak.valley{border-color:color-mix(in srgb,var(--dsw-alias-state-success-primary) 32%,var(--dsw-alias-border-l1));background:linear-gradient(180deg,color-mix(in srgb,var(--dsw-alias-state-success-primary) 8%,transparent),transparent 70%),var(--dsw-alias-bg-layer-2)}
.tm-peak.peak .tm-peakTitle{color:var(--dsw-alias-state-warn-label)}
.tm-peak.valley .tm-peakTitle{color:var(--dsw-alias-state-success-primary)}
.tm-peakCell.von{background:color-mix(in srgb,var(--dsw-alias-state-success-primary) 24%,var(--dsw-alias-interactive-bg-hover))}
@media (prefers-reduced-motion:reduce){.tm-card.mood-peak,.tm-peak.peak{animation:none}}
/* ── 在线时长面板：档位组字段式布局 + 准确度徽标 ────────────────────── */
.tm-segField{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:3px 0;border-top:.5px solid var(--dsw-alias-border-l2)}
.tm-segField:first-child{border-top:none}
.tm-segFieldKey{font-size:12px;color:var(--dsw-alias-label-secondary);min-width:58px;flex:none}
.tm-segFieldCtl{display:inline-flex;flex:none}
.tm-segFieldHint{font-size:11px;line-height:15px;color:var(--dsw-alias-label-caption);flex:1 1 190px;min-width:130px}
/* ── 空闲阈值：完整说明 + 五档对比 ──────────────────────────────────────
   说明文字比一般 hint 长得多（三条规则 + 五档对比 + 推荐理由），所以这一栏改成纵向排：
   标题与档位选择器一行，说明整幅在下面，不再挤在右侧那一列里。 */
.tm-segField:has(.tm-gapHint){align-items:flex-start}
.tm-segField:has(.tm-gapHint) .tm-segFieldHint{flex:1 1 100%}
.tm-gapHint{display:flex;flex-direction:column;gap:5px;font-size:11.5px;line-height:17px;color:var(--dsw-alias-label-secondary);min-width:0}
.tm-gapRules{margin:0;padding-left:17px;display:flex;flex-direction:column;gap:3px;color:var(--dsw-alias-label-tertiary)}
.tm-gapRules b{color:var(--dsw-alias-label-secondary);font-weight:600}
.tm-gapRules em{font-style:normal;font-weight:600;color:var(--dsw-alias-state-warn-primary)}
.tm-gapCmpTitle{color:var(--dsw-alias-label-caption);margin-top:3px}
.tm-gapCmp{display:flex;gap:8px;flex-wrap:wrap}
.tm-gapCmpItem{display:flex;flex-direction:column;gap:1px;min-width:88px;padding:5px 9px;box-sizing:border-box;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-2);cursor:pointer;transition:border-color .15s}
.tm-gapCmpItem:hover{border-color:var(--dsw-alias-border-l3)}
.tm-gapCmpItem b{font-size:11px;font-weight:600;color:var(--dsw-alias-label-secondary)}
.tm-gapCmpItem i{font-style:normal;font-size:13px;font-weight:600;color:var(--dsw-alias-label-primary);font-variant-numeric:tabular-nums}
.tm-gapCmpItem em{font-style:normal;font-size:10.5px;color:var(--dsw-alias-label-caption)}
.tm-gapCmpOn{border-color:color-mix(in srgb,var(--dsw-alias-state-business-primary) 55%,var(--dsw-alias-border-l2));background:color-mix(in srgb,var(--dsw-alias-state-business-primary) 10%,var(--dsw-alias-bg-layer-2))}
.tm-gapCmpOn b,.tm-gapCmpOn i{color:var(--dsw-alias-state-business-primary)}
/* 推荐档：在标签后面缀一个绿色「推荐」，而不是另起一块说明 */
.tm-gapCmpRec b:after{content:' · 推荐';color:var(--dsw-alias-state-success-primary)}
.tm-gapRec{color:var(--dsw-alias-label-tertiary)}
.tm-gapRec b{color:var(--dsw-alias-state-success-primary);font-weight:600}
.tm-acc{font-size:10px;line-height:15px;padding:0 4px;border-radius:4px;border:1px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-label-caption);flex:none;font-weight:400}
.tm-acc.exact{color:var(--dsw-alias-state-success-primary);border-color:color-mix(in srgb,var(--dsw-alias-state-success-primary) 45%,transparent);background:color-mix(in srgb,var(--dsw-alias-state-success-primary) 10%,transparent)}
.tm-acc.estimate{color:var(--dsw-alias-state-warn-primary);border-color:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 45%,transparent);background:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 10%,transparent)}
.tm-acc.bound{color:var(--dsw-alias-label-tertiary);background:var(--dsw-alias-interactive-bg-hover)}
/* ── 每日在线排行（柱状 + 列表合体）────────────────────────────────── */
.tm-rankHead{display:grid;grid-template-columns:20px minmax(84px,1fr) minmax(64px,1.7fr) 60px 54px;gap:8px;align-items:center;font-size:11px;line-height:15px;color:var(--dsw-alias-label-caption);padding:0 0 5px;border-bottom:.5px solid var(--dsw-alias-border-l2)}
.tm-rankRow{display:grid;grid-template-columns:20px minmax(84px,1fr) minmax(64px,1.7fr) 60px 54px;gap:8px;align-items:center;padding:6px 4px;margin:0 -4px;border-radius:6px;border-bottom:.5px solid var(--dsw-alias-border-l2);cursor:default;transition:background .12s ease}
.tm-rankRow:last-of-type{border-bottom:none}
.tm-rankRow:hover{background:var(--dsw-alias-interactive-bg-hover)}
.tm-rankNo{font-size:11px;line-height:16px;text-align:right;color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums}
.tm-rankRow.top3 .tm-rankNo{color:var(--dsw-alias-state-business-primary);font-weight:700}
.tm-rankRow.top3 .tm-rankDate{font-weight:600}
.tm-rankDate{font-size:12.5px;line-height:17px;color:var(--dsw-alias-label-primary);font-variant-numeric:tabular-nums}
.tm-rankBarTrack{display:flex;height:11px;border-radius:6px;overflow:hidden;background:var(--dsw-alias-interactive-bg-hover);box-shadow:inset 0 0 0 1px var(--dsw-alias-border-l2)}
.tm-rankFillTurn{display:block;height:100%;background:var(--dsw-alias-state-business-primary);opacity:.85}
.tm-rankFillIdle{display:block;height:100%;background:var(--dsw-alias-state-business-primary);opacity:.26}
.tm-rankVal{font-size:12.5px;text-align:right;font-variant-numeric:tabular-nums;font-weight:600;color:var(--dsw-alias-label-primary)}
.tm-rankTok{font-size:11px;text-align:right;color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums}
@container tm (max-width: 420px){.tm-rankHead,.tm-rankRow{grid-template-columns:18px minmax(70px,1fr) minmax(48px,1.4fr) 54px}.tm-rankTok,.tm-rankHead>span:last-child{display:none}}
/* ── 统一数据提示（替代原生 title）：标题 + 键值行 + 多行说明 ───────────── */
.tm-tip-title{font-weight:600;margin-bottom:3px;color:var(--dsw-alias-label-primary)}
.tm-tip-text{white-space:normal;max-width:236px;line-height:1.5;margin-top:3px;color:var(--dsw-alias-label-secondary)}
.tm-tipfixed .tm-tiprow+.tm-tiprow{margin-top:1px}
/* ══ 中心区视图（conversation.view「Token 总览」）══════════════════════════════
 * 滚动模型：**只有右半的 .tm-cbody 滚动**，左菜单与分区标题栏在滚动容器之外，
 * 结构上就不可能跟着滚（不依赖 position:sticky 的可见性）。
 *
 * 要做到这点，视图必须先有「确定高度」。会话外壳里这一层是 hashed 类
 * .wSkVaW_viewArea，且激活态是 flex:1 0 auto + min-height:auto —— 高度由内容
 * 撑开，子元素的 height:100% 会退化成 auto。所以下面第一条规则用官方**稳定钩子**
 * （[data-conversation-scroll] / [data-slot="conversation.session"]，不碰哈希类名）
 * 把那层改成可收缩的确定高度项。选择器刻意把 :has() 的参数写成
 * [data-slot="conversation.view"] .tm-cview，把特异性抬到 (0,4,0)，**压过**外壳那条
 * .wSkVaW_root[data-phase=active] .wSkVaW_viewArea 的 (0,3,0) —— 不再依赖
 * 「插件样式晚于外壳样式注入」这种时序假设；同时仍然只影响本视图，对话/轨迹不受影响。
 *
 * 兜底：万一这条没生效（外壳结构变动），.tm-cview 的 height:100% 会退化成 auto，
 * 于是回到「外层 scrollBody 滚动 + 左菜单/标题栏 sticky 钉住」的老模型，仍然可用。 */
[data-conversation-scroll]:has([data-slot="conversation.view"] .tm-cview)>[data-slot="conversation.session"]>*{flex:1 1 0;min-height:0;overflow:clip}
/* overflow:clip（而不是 hidden）——它不会把自己变成滚动容器，鼠标滚轮不会在这里
 * 被截住，照常落到 .tm-cbody 上。 */
.tm-cview{box-sizing:border-box;width:100%;height:100%;min-height:0;display:flex;align-items:stretch;overflow:clip;container-type:inline-size;container-name:tmc;background:var(--dsw-alias-bg-base)}
/* 列宽拖拽条对本视图没有意义（原生轨迹视图同样不显示）——对「有 .tm-cview 后代、
 * 且直接挂着 [data-width-handle]」的那层（即会话 body）隐藏。 */
*:has(.tm-cview)>[data-width-handle]{display:none}
/* 左菜单：整列铺满高度（背景 + 右分隔线覆盖整列）。
 * ⚠ .tm-cnav 必须保持 overflow:visible —— 一旦给它 overflow:auto/hidden，它自己就
 * 成了滚动容器，里面 sticky 的 .tm-cnavInner 会「相对 .tm-cnav 定位」而不是相对外层
 * 会话滚动区；.tm-cnav 自己又永远不滚，于是外层一滚，菜单就跟着滚走了（踩过这个坑）。 */
.tm-cnav{flex:none;width:190px;min-width:190px;display:flex;flex-direction:column;padding:16px 10px 12px;border-right:.5px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);overflow:visible}
/* sticky 只是兜底（正常情况下菜单整块都在滚动容器之外，根本不会移动）；菜单比
 * 视口还高时（极矮窗口）由它自己的 max-height + overflow 兜住。 */
.tm-cnavInner{position:sticky;top:0;display:flex;flex-direction:column;gap:2px;max-height:100vh;overflow-y:auto}
.tm-cnavHead{font-size:12px;font-weight:600;line-height:18px;color:var(--dsw-alias-label-secondary);padding:2px 8px 10px;letter-spacing:.02em}
.tm-cnavList{display:flex;flex-direction:column;gap:2px}
.tm-cnavItem{display:flex;align-items:center;gap:8px;width:100%;background:transparent;border:none;border-radius:6px;padding:8px 10px;font-family:inherit;font-size:13px;line-height:20px;color:var(--dsw-alias-label-secondary);cursor:pointer;text-align:left}
.tm-cnavItem:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.tm-cnavItem:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:-2px}
.tm-cnavItem>svg{flex:none;display:block}
.tm-cnavOn,.tm-cnavOn:hover{color:var(--dsw-alias-label-primary);font-weight:500;background:color-mix(in srgb,var(--dsw-alias-state-business-primary) 12%,transparent)}
.tm-cnavOn>svg{color:var(--dsw-alias-state-business-primary)}
.tm-cnavLabel{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
/* 「设置」与上面三个数据分区之间画一条分隔线：它不是「看数据」，是「改配置」 */
.tm-cnavItemSep{margin-top:8px;position:relative}
.tm-cnavItemSep:before{content:'';position:absolute;left:8px;right:8px;top:-5px;height:1px;background:var(--dsw-alias-border-l2)}
/* 设置分区沿用设置页的行式表单布局（label + 控件左右成对），宽屏下拉满整幅会很难扫读，
   所以收窄居中；数据分区才吃满宽度。 */
.tm-cview .tm-cset .tm-page{max-width:min(920px,100%)}
/* 右半：固定的分区标题栏 + 唯一的滚动容器 .tm-cbody */
.tm-cmain{flex:1;min-width:0;min-height:0;display:flex;flex-direction:column}
.tm-chead{position:sticky;top:0;z-index:3;flex:none;display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;padding:14px 24px 11px;border-bottom:.5px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-base)}
.tm-cheadTitle{font-size:15px;font-weight:600;line-height:22px;color:var(--dsw-alias-label-primary);flex:none}
.tm-cheadHint{font-size:12px;line-height:18px;color:var(--dsw-alias-label-tertiary);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1 1 auto}
.tm-cbody{flex:1;min-width:0;min-height:0;overflow-y:auto;overflow-x:clip;scrollbar-gutter:stable;padding:18px 24px 56px;box-sizing:border-box}
/* 分区组件未装配时的就地提示：把「整个 tab 崩掉」降级成一条可读的说明（见 CenterView.isComponent） */
.tm-sectMiss{margin:0 auto;max-width:560px;padding:14px 16px;box-sizing:border-box;border:.5px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-secondary);font-size:13px;line-height:20px}
/* 中心区比侧栏宽得多：内容吃满可用宽度（只留一个防超宽屏的上限），不再是窄单列 */
.tm-cview .tm-page{max-width:min(1760px,100%);margin:0 auto;width:100%}
/* 用量统计面板是「外层 tm-page（工具栏 + 今日卡）+ 内层 tm-page（StatsSettingsPage）」，
   内层不再重复加宽度约束与居中，避免出现两层容器互相压缩 */
.tm-page .tm-page{max-width:none;margin:0;width:100%}

/* ── 仪表板栅格：宽屏下把卡片并排，窄了自动落回单列 ─────────────────────── */
.tm-dash{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:14px;align-items:start;width:100%}
.tm-dash>*{min-width:0}
.tm-c12{grid-column:span 12}
.tm-c8{grid-column:span 8}
.tm-c7{grid-column:span 7}
.tm-c6{grid-column:span 6}
.tm-c5{grid-column:span 5}
.tm-c4{grid-column:span 4}
/* 卡片进栅格后不再自己带外边距（间距由 gap 负责） */
.tm-dash .tm-card{margin:0}
.tm-dash .tm-statGrid{margin:0}
/* 模型分布卡（通栏、放最后）：环形图钉在左，模型列表向右分栏铺开 —— 这是纵向结构，
   横过来只会拉成一条很长的单列。窄了自动落回上下排列。 */
.tm-donutWide .tm-flexrow{flex-direction:row;align-items:flex-start;gap:24px}
.tm-donutWide .tm-donutBox{margin:0;flex:none}
.tm-donutWide .tm-models{flex:1;min-width:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:0 28px;align-content:start}
.tm-donutWide .tm-models .tm-model:last-child{border-bottom:1px solid var(--dsw-alias-border-l1)}
@container tmc (max-width:900px){
.tm-donutWide .tm-flexrow{flex-direction:column;align-items:stretch}
.tm-donutWide .tm-donutBox{margin:0 auto}
.tm-donutWide .tm-models{grid-template-columns:minmax(0,1fr)}
}
@container tmc (max-width:1180px){
.tm-c8,.tm-c7,.tm-c6,.tm-c5,.tm-c4{grid-column:span 12}
}

/* ── 仪表板观感：卡片更宽松、指标更厚实（只在中心区生效，浮窗/设置页保持原样）── */
.tm-cview .tm-card{padding:16px 18px}
.tm-cview .tm-toolbar{margin-bottom:12px}
.tm-cview .tm-page>.tm-toolbar:last-child{margin-bottom:0}
.tm-cview .tm-statGrid{grid-template-columns:repeat(auto-fill,minmax(198px,1fr));gap:12px;grid-auto-rows:1fr}
.tm-cview .tm-statGrid>.tm-stat{min-height:92px;padding:12px 14px;gap:3px}
.tm-cview .tm-statGrid .tm-stat-value{font-size:19px;line-height:26px}
.tm-cview .tm-chart-title{font-size:13px;margin-bottom:10px}
.tm-cview .tm-empty{padding:44px 0}
.tm-cview .tm-segField{padding:5px 0}
.tm-cview .tm-intro{margin-bottom:10px}

/* ── 基础数据 / 在线时长：同一套「指标卡阵」规格 ──────────────────────────
 * 用量统计的 .tm-grid 与在线统计的 .tm-statGrid 共用卡片规格：
 *  grid-auto-rows:1fr  → 同一行卡片等高；
 *  末行 margin-top:auto → 说明文字/迷你图顶到底部，数值在网格线上对齐；
 *  说明允许两行       → 不再被 nowrap + 省略号切掉（如「输入 4.1亿 · 输出 185…」）。 */
.tm-cview .tm-grid,
.tm-cview .tm-statGrid{grid-auto-rows:1fr;gap:12px;margin:0}
.tm-cview .tm-grid{grid-template-columns:repeat(auto-fill,minmax(214px,1fr))}
.tm-cview .tm-statGrid{grid-template-columns:repeat(auto-fill,minmax(198px,1fr))}
.tm-cview .tm-grid>.tm-stat,
.tm-cview .tm-statGrid>.tm-stat{min-height:106px;padding:14px 16px;justify-content:flex-start;gap:4px;border-radius:12px}
.tm-cview .tm-grid>.tm-stat>*:last-child,
.tm-cview .tm-statGrid>.tm-stat>*:last-child{margin-top:auto}
.tm-cview .tm-grid .tm-stat-label,
.tm-cview .tm-statGrid .tm-stat-label{font-size:11.5px;line-height:16px;letter-spacing:.02em;color:var(--dsw-alias-label-caption);flex-wrap:wrap}
.tm-cview .tm-grid .tm-stat-value,
.tm-cview .tm-statGrid .tm-stat-value{font-size:22px;line-height:30px;font-weight:600}
.tm-cview .tm-grid .tm-stat-sub,
.tm-cview .tm-statGrid .tm-stat-sub{font-size:11.5px;line-height:16px;color:var(--dsw-alias-label-tertiary);white-space:normal;overflow:hidden;text-overflow:clip;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
/* 指标卡里的迷你图/构成条：贴着说明文字下方，留一点空隙 */
.tm-cview .tm-grid .tm-spark,
.tm-cview .tm-statGrid .tm-spark{margin-top:4px}
@container tmc (max-width:1000px){
.tm-cview .tm-grid{grid-template-columns:repeat(auto-fill,minmax(180px,1fr))}
.tm-cview .tm-grid .tm-stat-value,
.tm-cview .tm-statGrid .tm-stat-value{font-size:20px;line-height:28px}
}

/* 在线时长：固定列数（而不是 auto-fill），最后一行才排得整齐 —— 7 张卡里让
   「引擎合计」跨 2 列补满。阈值保证每列不窄于约 250px（值是「143 小时 48 分」
   这种长中文时长串，再窄就得折行）：容器 ≥1320 → 4 列；820~1320 → 2 列；更窄 1 列。 */
.tm-cview .tm-statGrid.tm-onlineGrid{grid-template-columns:repeat(4,minmax(0,1fr))}
.tm-cview .tm-onlineGrid>.tm-statWide{grid-column:span 2}
@container tmc (max-width:1320px){
.tm-cview .tm-statGrid.tm-onlineGrid{grid-template-columns:repeat(2,minmax(0,1fr))}
}
@container tmc (max-width:820px){
.tm-cview .tm-statGrid.tm-onlineGrid{grid-template-columns:minmax(0,1fr)}
.tm-cview .tm-onlineGrid>.tm-statWide{grid-column:auto}
}
/* 准确性徽标图例（标题行右侧）：绿=精确 / 黄=估算 / 灰=下界 */
.tm-accLegend{display:inline-flex;align-items:center;flex-wrap:wrap;gap:4px 12px;flex:none}
.tm-accLegendItem{display:inline-flex;align-items:center;gap:5px;font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary)}
.tm-cview .tm-accLegend .tm-acc{font-size:10px}
/* ── 额度查询：供应商卡片自适应网格（4/3/2/1 列随宽度落） ───────────────
 * 阈值按「容器宽 - 左菜单 - 左右内边距」反推，保证每列不窄于约 320px
 * （卡片里有标题+徽标+按钮行、三条进度条、两列指标网格）。 */
.tm-vgrid{display:grid;gap:12px;align-items:start;width:100%;grid-template-columns:repeat(4,minmax(0,1fr))}
.tm-vgrid>*{min-width:0}
/* 卡片进网格后不再自带上/下外边距（行距由 gap 决定），并且**自己成为一个尺寸容器**：
   卡片里的「账户与用量」两列指标网格必须按卡片宽度收放（3~4 列时卡片只有 300 出头，
   两列会把标签和数值挤到换行）。旧写法挂在页面级容器 tm 上，中心区页面有一千多像素，
   于是卡片再窄也不会触发收放。 */
.tm-vgrid .tm-card{margin:0;container-type:inline-size;container-name:tmvc}
@container tmvc (max-width:400px){
.tm-xgridBody{grid-template-columns:minmax(0,1fr)}
}
@container tmc (max-width:1560px){.tm-vgrid{grid-template-columns:repeat(3,minmax(0,1fr))}}
@container tmc (max-width:1240px){.tm-vgrid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@container tmc (max-width:890px){.tm-vgrid{grid-template-columns:minmax(0,1fr)}}
/* 避免「最后一行只剩一张卡」的孤行：卡数正好比列数多一张时降一档列数重排
   （3 列 4 张 → 2×2；4 列 5 张 → 3+2；4 列 9 张 → 3×3）。纯 :has() 判定，
   不需要 JS 量宽度，也不会影响其它卡数。 */
@container tmc (min-width:1240px) and (max-width:1560px){
.tm-vgrid:has(>.tm-card:nth-child(4):last-child){grid-template-columns:repeat(2,minmax(0,1fr))}
}
@container tmc (min-width:1560px){
.tm-vgrid:has(>.tm-card:nth-child(5):last-child){grid-template-columns:repeat(3,minmax(0,1fr))}
.tm-vgrid:has(>.tm-card:nth-child(9):last-child){grid-template-columns:repeat(3,minmax(0,1fr))}
}
/* 窄中心区（把中间栏拖窄）：左菜单收成图标轨道，只留 tooltip */
@container tmc (max-width:620px){
.tm-cnav{width:46px;min-width:46px;padding:12px 6px;align-items:center}
.tm-cnavInner{width:100%}
.tm-cnavHead{display:none}
.tm-cnavItem{justify-content:center;padding:8px 0;gap:0}
.tm-cnavLabel{display:none}
.tm-chead{padding:12px 14px 10px}
.tm-cheadHint{display:none}
.tm-cbody{padding:14px 14px 40px}
}
`;
