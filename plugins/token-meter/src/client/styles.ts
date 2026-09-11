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
.tm-card{background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l1);border-radius:10px;padding:14px 16px;margin:0 0 8px}
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
.tm-tabs{display:inline-flex;gap:2px;border:1px solid var(--dsw-alias-border-l1);border-radius:10px;padding:2px;margin:8px 0 4px}
.tm-tab{border:none;background:transparent;color:var(--dsw-alias-label-tertiary);font-size:13px;font-family:inherit;padding:4px 14px;border-radius:7px;cursor:pointer;line-height:20px}
.tm-tab:hover{color:var(--dsw-alias-label-primary)}
.tm-tabOn{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.tm-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(148px,1fr));gap:8px}
.tm-statGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px;margin:8px 0}
.tm-stat{background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l1);border-radius:10px;padding:10px 12px;display:flex;flex-direction:column;gap:2px;transition:border-color .15s;position:relative}
.tm-stat:hover{border-color:var(--dsw-alias-state-business-primary)}
.tm-stat-label{color:var(--dsw-alias-label-caption);font-size:11px;line-height:16px}
.tm-stat-value{color:var(--dsw-alias-label-primary);font-size:17px;font-weight:600;font-variant-numeric:tabular-nums;line-height:24px}
.tm-stat[data-tint="1"] .tm-stat-value{background:linear-gradient(100deg,var(--dsw-alias-state-business-primary),color-mix(in srgb,var(--dsw-alias-state-business-primary) 52%,#34d399));-webkit-background-clip:text;background-clip:text;color:transparent}
.tm-stat-sub{color:var(--dsw-alias-label-secondary);font-size:11px;line-height:16px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.tm-pop{position:fixed;z-index:50;pointer-events:none;background:var(--dsw-specific-menu);border:1px solid var(--dsw-alias-border-l2);border-radius:10px;box-shadow:var(--dsw-shadow-lv3);padding:10px 12px;font-size:12px;line-height:1.5;max-width:300px;color:var(--dsw-alias-label-primary)}
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
/* ── 峰谷显示器（额度面板置顶）：工作时间=峰，其余=谷 ── */
.tm-peak{display:flex;flex-direction:column;gap:6px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-2);border-radius:var(--tm-r-card);padding:10px 12px;margin:0 0 8px}
.tm-peakHead{display:flex;align-items:center;gap:6px;min-width:0}
.tm-peakDot{width:8px;height:8px;border-radius:50%;flex:none}
.tm-peakDot.peak{background:var(--dsw-alias-state-warn-primary);box-shadow:0 0 6px var(--dsw-alias-state-warn-primary)}
.tm-peakDot.valley{background:var(--dsw-alias-state-success-primary)}
.tm-peakTitle{font-size:12px;font-weight:600;color:var(--dsw-alias-label-primary);white-space:nowrap}
.tm-peakTime{flex:1;min-width:0;text-align:right;font-size:11px;color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
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
.tm-heat{display:flex;gap:2px;margin:6px 0}
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
.tm-side{background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l1);border-radius:10px;padding:8px 10px;margin:2px 0;position:relative;overflow:visible}
.tm-side.loading{animation:tm-pulse 1.2s ease infinite}
.tm-side.error{border-color:var(--dsw-alias-state-error-primary)}
.tm-in{animation:tm-in .35s ease}
.tm-vendor{display:flex;align-items:center;gap:6px;width:100%;background:transparent;border:none;padding:0;cursor:pointer;text-align:left}
.tm-vname{flex:1;min-width:0;font-size:12px;font-weight:600;color:var(--dsw-alias-label-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.tm-vname2{color:var(--dsw-alias-label-primary);font-size:13px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.tm-vtype{flex:none;font-size:10px;color:var(--dsw-alias-brand-primary)}
.tm-vcaret{flex:none;font-size:10px;color:var(--dsw-alias-label-secondary)}
.tm-backdrop{position:fixed;inset:0;z-index:55;background:transparent;border:none;padding:0;margin:0;cursor:default}
.tm-popmenu{position:fixed;z-index:400;margin:0;min-width:180px;max-width:260px;background:color-mix(in srgb, var(--dsw-alias-bg-layer-1) 78%, transparent);-webkit-backdrop-filter:blur(12px) saturate(1.4);backdrop-filter:blur(12px) saturate(1.4);border:1px solid var(--dsw-alias-border-l2);border-radius:10px;box-shadow:0 12px 32px rgba(0,0,0,.25);padding:6px;max-height:240px;overflow:auto;display:flex;flex-direction:column;gap:2px}
.tm-mitem{display:flex;align-items:center;gap:6px;width:100%;background:transparent;border:1px solid transparent;border-radius:6px;padding:4px 6px;cursor:pointer;font-size:12px;color:var(--dsw-alias-label-secondary);text-align:left}
.tm-mitem:hover{border-color:var(--dsw-alias-border-l1);color:var(--dsw-alias-label-primary)}
.tm-mitem.active{color:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-brand-primary)}
.tm-mitem .grow{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.tm-qrow{display:flex;align-items:center;gap:6px;margin-top:6px}
/* 标签列：定宽让各行的进度条左端对齐；nowrap 保证标签永不换行
   （旧版硬编码 36px，4 字标签如「月度额度」会被挤成两行） */
.tm-qlabel{flex:none;width:52px;min-width:52px;font-size:11px;line-height:16px;color:var(--dsw-alias-label-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tm-qbar{flex:1;min-width:0;height:6px;border-radius:99px;background:var(--dsw-alias-bg-layer-2);overflow:hidden}
/* 占用四档：ok 蓝 / warn 黄(≥70%) / bad 红"快完了"(≥90%) / over 红+脉冲(≥100%) */
.tm-qfill{display:block;height:100%;border-radius:99px;background:var(--dsw-alias-brand-primary);transition:width .8s ease}
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
.tm-qstatus{flex:none;font-size:9.5px;line-height:15px;padding:0 6px;border-radius:99px;white-space:nowrap;color:var(--dsw-alias-state-error-primary);background:color-mix(in srgb,var(--dsw-alias-state-error-primary) 14%,transparent)}
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
.tm-avail{flex:none;font-size:11px;line-height:1.6;padding:1px 9px;border-radius:99px;border:1px solid}
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
.tm-grouplabel{margin:2px 0 6px;font-size:11px;font-weight:500;color:var(--dsw-alias-label-tertiary);letter-spacing:.02em}
.tm-xchart{margin-top:8px}
.tm-xtitle{font-size:10px;color:var(--dsw-alias-label-secondary);margin-bottom:2px}
.tm-xsplit{display:flex;height:8px;border-radius:99px;overflow:hidden;background:var(--dsw-alias-bg-layer-2);margin-top:6px}
.tm-xsplit span{display:block;height:100%}
.tm-xdot{display:inline-block;width:7px;height:7px;border-radius:2px;margin-right:5px}
.tm-sections{display:flex;flex-direction:column}
.tm-ui{display:flex;flex-direction:column}
.tm-xprog{margin-top:8px}
.tm-vchips{display:flex;flex-wrap:wrap;gap:4px;margin-top:6px}
.tm-vchip{display:inline-flex;align-items:center;font-size:10.5px;line-height:16px;padding:0 8px;border-radius:99px;border:1px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-layer-2);white-space:nowrap}
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
.tm-badge{white-space:nowrap;align-items:center;height:20px;border-radius:10px;padding:0 8px;font-size:11px;font-weight:500;line-height:20px;display:inline-flex;flex:none}
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
.tm-today{border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);border-radius:10px;padding:10px 12px;margin:8px 0;width:100%;flex:none;cursor:default;box-sizing:border-box;overflow:hidden}
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
   自身也是 inline-size 容器 —— 浮窗内的窄栏规则（模型分布上下排列等）与右侧栏一致。 ── */
.tm-widgetFloat{position:fixed;z-index:300;max-width:calc(100vw - 16px);width:360px;max-height:60vh;overflow-y:auto;overscroll-behavior:contain;container-type:inline-size;container-name:tm}
.tm-widgetFloat>.tm-card,.tm-widgetFloat>.tm-today{margin:0;box-sizing:border-box}
/* 浮窗内的 Seg 行：可换行居中，窄时各按钮撑整行宽，不溢出组件 */
.tm-segRow{display:flex;justify-content:center;flex-wrap:wrap;gap:6px;margin-bottom:8px}
@container tm (max-width: 420px){.tm-segRow .tm-seg{width:100%;justify-content:center}.tm-segRow .tm-seg-btn{flex:1 1 auto;text-align:center}}
/* 小组件工具条：标签 + 开关按钮 */
.tm-widgetBtn{display:inline-flex;align-items:center;gap:2px;border:1px solid var(--dsw-alias-border-l1);border-radius:var(--tm-r-chip);padding:1px 4px 1px 8px;font-size:12px;color:var(--dsw-alias-label-secondary)}
.tm-widgetBtn-label{line-height:20px;white-space:nowrap}
/* 右栏 tab chip：图标 + 文本（图标颜色跟随 chip 文字色） */
.tm-tabChip{display:inline-flex;align-items:center;gap:5px;min-width:0}
.tm-tabChip>svg{flex:none;display:block}
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
.tm-switch{box-sizing:border-box;background:var(--dsw-alias-border-l3);cursor:pointer;border:0;border-radius:10px;flex:none;width:36px;height:20px;padding:2px;position:relative}
.tm-switch[aria-checked="true"]{background:var(--dsw-alias-brand-primary)}
.tm-switch:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}
.tm-switchOn{background:var(--dsw-alias-brand-primary)}
.tm-switch:disabled{cursor:default;opacity:.5}
.tm-knob,.tm-thumb{corner-shape:round;background:var(--dsw-alias-label-primary-foreground);border-radius:50%;width:16px;height:16px;transition:transform .12s;display:block}
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
/* ── 窄栏适配（右栏拉到最窄时）：容器查询，卡片收紧、标题不截断按钮不换行 ── */
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
/* ── 圆角跟随全局 ───────────────────────────────────────────────
 * 产品没有半径 token（半径由各组件自定），但有全局角形 token：
 * @supports 生效时 :root 下 --dsw-corner-shape:superellipse(1.5)，
 * 并经通用选择器作用于全文档。本插件半径收归下方变量（默认值与现有视觉一致），
 * 卡片/浮窗/图表内元素全部引用；角形显式配对全局（矩形卡片跟随超椭圆，
 * pill/圆形按产品规范配对 round），与官方 UI 同形。后续产品若发布半径 token，
 * 只需在此一处重映射。 */
:root{--tm-r-card:10px;--tm-r-float:12px;--tm-r-pop:10px;--tm-r-tip:8px;--tm-r-btn:8px;--tm-r-input:8px;--tm-r-chip:6px;--tm-r-tabs:10px;--tm-r-rail:12px}
.tm-card,.tm-side,.tm-today,.tm-stat{border-radius:var(--tm-r-card)}
.tm-todayRail{border-radius:var(--tm-r-rail)}
.tm-float{border-radius:var(--tm-r-float)}
.tm-pop{border-radius:var(--tm-r-pop)}
.tm-tip,.tm-tipfixed{border-radius:var(--tm-r-tip)}
.tm-popmenu{border-radius:var(--tm-r-pop)}
.tm-errbox{border-radius:var(--tm-r-chip)}
.tm-btn{border-radius:var(--tm-r-btn)}
.tm-inputWrap,.tm-ninput,.tm-textarea{border-radius:var(--tm-r-input)}
.tm-seg{border-radius:var(--tm-r-chip)}
.tm-seg-btn{border-radius:var(--tm-r-chip)}
.tm-tabs{border-radius:var(--tm-r-tabs)}
@supports (corner-shape:superellipse(1.5)){
.tm-card,.tm-side,.tm-today,.tm-stat,.tm-float,.tm-pop,.tm-tip,.tm-tipfixed,.tm-popmenu,.tm-errbox,.tm-btn,.tm-inputWrap,.tm-textarea,.tm-seg,.tm-tabs{corner-shape:var(--dsw-corner-shape)}
.tm-modelchip,.tm-qbar,.tm-qfill,.tm-xsplit,.tm-compose,.tm-bartrack,.tm-barfill,.tm-streakbar,.tm-streakfill,.tm-pop-fill,.tm-switch,.tm-badge,.tm-dot,.tm-spinner,.tm-knob,.tm-thumb,.tm-xdot,.tm-cell,.tm-hcell,.tm-selector{corner-shape:round}
}
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
`;
