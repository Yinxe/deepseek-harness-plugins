(function () {
  'use strict';

  // src/client/styles.ts
  var CSS = `
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
/* \u2500\u2500 \u8868\u5355\u5B57\u6BB5\uFF08\u5806\u53E0\u5F0F\uFF09\uFF1A\u6807\u7B7E \u2192 \u63A7\u4EF6 \u2192 \u8BF4\u660E\uFF0C\u5404\u5360\u6574\u884C\uFF0C\u8F93\u5165\u6846\u6C38\u4E0D\u88AB\u8BF4\u660E\u6324\u538B \u2500\u2500 */
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
/* \u6D6E\u7A97\u5185\u7684\u56FE\u8868\u60AC\u6D6E\u63D0\u793A\uFF1A\u4E0A\u6D6E\u5230\u6D6E\u7A97\uFF08z300\uFF09\u4E0E\u65E7\u6D6E\u7A97\u4E4B\u4E0A\uFF0C\u4F46\u4F4E\u4E8E\u4F9B\u5E94\u5546\u83DC\u5355\uFF08z400\uFF09\uFF0C\u4E0D\u88AB\u6D6E\u7A97\u906E\u6321 */
.tm-tip-above{z-index:350}
.tm-tiprow{display:flex;align-items:center;gap:6px;white-space:nowrap}
.tm-tip-k{color:var(--dsw-alias-label-secondary)}
.tm-tip-v{font-variant-numeric:tabular-nums;font-weight:500}
.tm-dot{width:10px;height:10px;border-radius:3px;flex:none;display:inline-block;background:var(--dsw-alias-state-success-primary)}
.tm-dot.warn{background:var(--dsw-alias-state-warn-primary)}.tm-dot.bad{background:var(--dsw-alias-state-error-primary)}
/* \u7981\u7528\uFF1A\u7EA2\u8272\u7A7A\u5FC3\u73AF\u3002\u4E0E\u300C\u62C9\u53D6\u5931\u8D25\u300D\u7684\u5B9E\u5FC3\u7EA2\u533A\u5206\u5F00\u2014\u2014\u7981\u7528\u662F\u4E3B\u52A8\u9009\u62E9\uFF0C\u5931\u8D25\u662F\u5F02\u5E38 */
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
/* \u2500\u2500 \u5CF0\u8C37\u5B9A\u4EF7\u63D0\u793A\uFF08\u989D\u5EA6\u9762\u677F\u7F6E\u9876\uFF09\uFF1A\u5317\u4EAC\u65F6\u95F4\u5DE5\u4F5C\u65E5\u4E24\u4E2A\u5CF0\u6BB5\uFF0C\u5176\u4F59\u4E3A\u8C37 \u2500\u2500 */
.tm-peak{position:relative;display:flex;flex-direction:column;gap:6px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-2);border-radius:var(--tm-r-card);padding:10px 12px;margin:0 0 8px;cursor:default}
.tm-peak:focus{outline:none}
.tm-peak:focus-visible{box-shadow:0 0 0 2px color-mix(in srgb,var(--dsw-alias-state-business-primary) 55%,transparent)}
.tm-peakHead{display:flex;align-items:center;gap:6px;min-width:0;flex-wrap:wrap;row-gap:4px}
.tm-peakDot{width:8px;height:8px;border-radius:50%;flex:none}
.tm-peakDot.peak{background:var(--dsw-alias-state-warn-primary);box-shadow:0 0 6px var(--dsw-alias-state-warn-primary)}
.tm-peakDot.valley{background:var(--dsw-alias-state-success-primary)}
/* \u6807\u9898\u538B\u5230 4 \u5B57\uFF0C\u72B6\u6001\u72EC\u7ACB\u6210 chip\uFF1B\u65F6\u95F4 flex:none + nowrap \u2014\u2014 \u4E09\u5904\u90FD\u4E0D\u518D\u8D70\u7701\u7565\u53F7\u88C1\u5207 */
.tm-peakTitle{font-size:12px;font-weight:600;color:var(--dsw-alias-label-primary);white-space:nowrap;flex:none}
.tm-peakChip{flex:none;font-size:10.5px;line-height:16px;font-weight:600;padding:0 7px;border-radius:99px;white-space:nowrap}
.tm-peakChip.peak{color:var(--dsw-alias-state-warn-label);background:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 16%,transparent)}
.tm-peakChip.valley{color:var(--dsw-alias-state-success-primary);background:color-mix(in srgb,var(--dsw-alias-state-success-primary) 14%,transparent)}
.tm-peakTime{flex:none;margin-left:auto;text-align:right;font-size:11px;line-height:16px;color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums;white-space:nowrap}
/* \u60AC\u6D6E\u660E\u7EC6\uFF1Aportal \u5230 body\uFF0Cposition:fixed \u7531 tm-tipfixed \u63D0\u4F9B\uFF0C\u6B64\u5904\u53EA\u7BA1\u5916\u89C2\u4E0E\u52A8\u753B */
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
/* \u989D\u5EA6\u5361 */
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
/* \u6807\u7B7E\u5217\uFF1A\u5B9A\u5BBD\u8BA9\u5404\u884C\u7684\u8FDB\u5EA6\u6761\u5DE6\u7AEF\u5BF9\u9F50\uFF1Bnowrap \u4FDD\u8BC1\u6807\u7B7E\u6C38\u4E0D\u6362\u884C
   \uFF08\u65E7\u7248\u786C\u7F16\u7801 36px\uFF0C4 \u5B57\u6807\u7B7E\u5982\u300C\u6708\u5EA6\u989D\u5EA6\u300D\u4F1A\u88AB\u6324\u6210\u4E24\u884C\uFF09 */
.tm-qlabel{flex:none;width:52px;min-width:52px;font-size:11px;line-height:16px;color:var(--dsw-alias-label-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tm-qbar{flex:1;min-width:0;height:6px;border-radius:99px;background:var(--dsw-alias-bg-layer-2);overflow:hidden}
/* \u5360\u7528\u56DB\u6863\uFF1Aok \u84DD / warn \u9EC4(\u226570%) / bad \u7EA2"\u5FEB\u5B8C\u4E86"(\u226590%) / over \u7EA2+\u8109\u51B2(\u2265100%) */
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
/* \u7A97\u53E3\u72B6\u6001\u5FBD\u6807\uFF1A\u4E0A\u6E38\u975E ok\uFF08\u5982 opencode \u7684 rate-limited\uFF09\u65F6\u8D34\u5728\u767E\u5206\u6BD4\u540E\uFF0C
   \u56E0\u4E3A\u6B64\u65F6 pct \u53EF\u80FD\u8FD8\u6CA1\u5230 100%\uFF08\u9650\u6D41 \u2260 \u7528\u5C3D\uFF09\uFF0C\u5FC5\u987B\u5355\u72EC\u8BF4\u6E05\u695A */
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
/* \u4E24\u5217\u7D27\u51D1\u6307\u6807\u7F51\u683C\uFF1A\u5355\u5217\u957F\u5217\u8868\u4F1A\u628A\u5361\u7247\u6491\u9AD8\uFF0C\u4E24\u5217\u76F4\u63A5\u51CF\u534A */
.tm-xgrid{margin-top:8px}
.tm-xgridBody{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:4px 12px}
.tm-xcell{display:flex;align-items:baseline;justify-content:space-between;gap:8px;min-width:0;font-size:11px;color:var(--dsw-alias-label-secondary)}
.tm-xcellLabel{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.tm-xcellValue{flex:none;color:var(--dsw-alias-label-primary);font-variant-numeric:tabular-nums;white-space:nowrap}
/* \u7A84\u5361\u7247\uFF08\u4FA7\u8FB9\u680F/\u6D6E\u7A97\uFF09\u9000\u56DE\u5355\u5217\uFF0C\u907F\u514D\u4E24\u5217\u540E\u6BCF\u683C\u592A\u6324 */
@container tm (max-width: 300px){.tm-xgridBody{grid-template-columns:minmax(0,1fr)}}
/* \u7D27\u51D1\u4F59\u989D\u5757\uFF1A\u5927\u6570\u5B57\u662F\u6838\u5FC3\uFF0C\u51CF\u5C11\u4E0A\u4E0B\u7559\u767D */
.tm-payg-compact .tm-payg-amt{font-size:20px}
.tm-payg-compact .tm-payg-sub{margin-top:0}
.tm-payg-compact .tm-warn{margin-top:4px}
/* \u5206\u7EC4\u6807\u9898\uFF1A\u8BF4\u660E\u300C\u5DF2\u7981\u7528\u6C89\u5E95\u300D\u662F\u6709\u610F\u6392\u5E8F\uFF0C\u4E0D\u662F\u914D\u7F6E\u987A\u5E8F */
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
/* \u2500\u2500 \u5931\u8D25\u5361\uFF1A\u7ED3\u8BBA + \u5904\u7F6E + \u53EF\u5C55\u5F00\u6392\u67E5\u8BE6\u60C5\uFF08\u7EA2/\u9EC4/\u84DD\u4E09\u6863\u4E25\u91CD\u5EA6\uFF09\u2500\u2500 */
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
/* \u4ECA\u65E5\u5361 */
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
/* \u4FA7\u680F footer actions \u5782\u76F4\u5E03\u5C40\uFF1A\u4E0E Cordis \u5FBD\u7AE0\u5E76\u6392\u4F1A\u6A2A\u5411\u6EA2\u51FA\u88AB\u88C1\uFF08\u6298\u53E0\u4FA7\u680F\u4EC5 56px\uFF09\uFF0C\u6539\u4E3A\u5782\u76F4\u5806\u53E0 */
div:has(> div[data-slot="sidebar.footer.action"]){flex-direction:column;align-items:stretch}
.tm-todayRail{padding:3px 4px;box-sizing:border-box;min-width:0;max-width:100%;width:auto;margin:2px 0 0;display:flex;flex-direction:column;align-items:center;justify-content:center;border-radius:12px;background:var(--dsw-alias-bg-layer-1);cursor:pointer}
.tm-todayRail:hover{border-color:var(--dsw-alias-state-business-primary)}
.tm-todayRail .tm-todaymodels,.tm-todayRail .tm-spark,.tm-todayRail .tm-statgrow{display:none}
.tm-todayRail .tm-todayhead{display:none}
.tm-todayRail .tm-todayval{font-size:9px;line-height:12px;text-align:center;white-space:nowrap;font-weight:600}
.tm-todayRail .tm-todaylabel{font-size:8px;line-height:11px;text-align:center;white-space:nowrap;letter-spacing:.06em}
/* \u6D6E\u7A97\uFF1A\u6293\u624B\u62D6\u51FA / \u6807\u9898\u680F\u62D6\u5230\u4EFB\u610F\u4F4D\u7F6E / \u53CC\u51FB\u6216\u{1F4CC}\u6536\u56DE\uFF0C\u6BDB\u73BB\u7483 */
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
/* \u2500\u2500 widget \u6D6E\u7A97\uFF1A\u53EA\u505A\u5B9A\u4F4D\uFF0C\u4E0D\u542B\u4EFB\u4F55\u5916\u6846\uFF08\u7EC4\u4EF6\u81EA\u8EAB\u5361\u7247\u5373\u5916\u89C2\uFF0C\u6D6E\u51FA\u524D\u540E\u89C6\u89C9\u4E00\u81F4\uFF09\u3002
   \u7EDF\u4E00\u89C4\u683C\uFF1A\u5BBD 360px\uFF08\u4E0E clamp \u5E38\u91CF\u4E00\u81F4\uFF09\u3001\u6700\u5927\u9AD8 60vh\u3001\u8D85\u9AD8\u5185\u90E8\u6EDA\u52A8\uFF1B
   \u81EA\u8EAB\u4E5F\u662F inline-size \u5BB9\u5668 \u2014\u2014 \u6D6E\u7A97\u5185\u7684\u7A84\u680F\u89C4\u5219\uFF08\u6A21\u578B\u5206\u5E03\u4E0A\u4E0B\u6392\u5217\u7B49\uFF09\u4E0E\u53F3\u4FA7\u680F\u4E00\u81F4\u3002 \u2500\u2500 */
.tm-widgetFloat{position:fixed;z-index:300;max-width:calc(100vw - 16px);width:360px;max-height:60vh;overflow-y:auto;overscroll-behavior:contain;container-type:inline-size;container-name:tm}
.tm-widgetFloat>.tm-card,.tm-widgetFloat>.tm-today{margin:0;box-sizing:border-box}
/* \u6D6E\u7A97\u5185\u7684 Seg \u884C\uFF1A\u53EF\u6362\u884C\u5C45\u4E2D\uFF0C\u7A84\u65F6\u5404\u6309\u94AE\u6491\u6574\u884C\u5BBD\uFF0C\u4E0D\u6EA2\u51FA\u7EC4\u4EF6 */
.tm-segRow{display:flex;justify-content:center;flex-wrap:wrap;gap:6px;margin-bottom:8px}
@container tm (max-width: 420px){.tm-segRow .tm-seg{width:100%;justify-content:center}.tm-segRow .tm-seg-btn{flex:1 1 auto;text-align:center}}
/* \u5C0F\u7EC4\u4EF6\u5DE5\u5177\u6761\uFF1A\u6807\u7B7E + \u5F00\u5173\u6309\u94AE */
.tm-widgetBtn{display:inline-flex;align-items:center;gap:2px;border:1px solid var(--dsw-alias-border-l1);border-radius:var(--tm-r-chip);padding:1px 4px 1px 8px;font-size:12px;color:var(--dsw-alias-label-secondary)}
.tm-widgetBtn-label{line-height:20px;white-space:nowrap}
/* \u53F3\u680F tab chip\uFF1A\u56FE\u6807 + \u6587\u672C\uFF08\u56FE\u6807\u989C\u8272\u8DDF\u968F chip \u6587\u5B57\u8272\uFF09 */
.tm-tabChip{display:inline-flex;align-items:center;gap:5px;min-width:0}
.tm-tabChip>svg{flex:none;display:block}
/* \u56FE\u8868\u6807\u9898\u9996\u6BB5\uFF1A\u7A84\u680F\u7701\u7565\u53F7\uFF0C\u4E0D\u6362\u884C\u6324\u9AD8 */
.tm-chart-name{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1 1 auto}
/* \u6A21\u578B\u884C\uFF1A\u540D\u79F0+\u6570\u503C\u5141\u8BB8\u6362\u884C\uFF1B\u660E\u7EC6\u884C\u7A84\u680F\u53EF\u6362\u884C\u4E0D\u622A\u65AD */
.tm-modelhead{display:flex;justify-content:space-between;gap:8px;min-width:0;flex-wrap:wrap}
.tm-modeldetail{margin-top:2px;font-size:11px;line-height:16px;overflow-wrap:anywhere}
/* \u73AF\u5F62\u56FE\u5BB9\u5668\uFF1A\u53EF\u968F\u5BBD\u5EA6\u7F29\u653E\uFF0C\u7A84\u680F\u4E0E\u6A21\u578B\u5217\u8868\u4E0A\u4E0B\u6392\u5217 */
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
/* \u52A8\u753B\u4E0E\u8FC7\u6E21\u589E\u5F3A\uFF08\u7F6E\u4E8E CSS \u672B\u5C3E\uFF1A\u8986\u76D6\u540C\u7279\u5F02\u6027\u524D\u5E8F\u58F0\u660E\uFF09 */
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
/* \u2500\u2500 \u7A84\u680F\u9002\u914D\uFF08\u53F3\u680F\u62C9\u5230\u6700\u7A84\u65F6\uFF09\uFF1A\u5BB9\u5668\u67E5\u8BE2\uFF0C\u5361\u7247\u6536\u7D27\u3001\u6807\u9898\u4E0D\u622A\u65AD\u6309\u94AE\u4E0D\u6362\u884C \u2500\u2500 */
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
/* \u2500\u2500 \u5706\u89D2\u8DDF\u968F\u5168\u5C40 \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
 * \u4EA7\u54C1\u6CA1\u6709\u534A\u5F84 token\uFF08\u534A\u5F84\u7531\u5404\u7EC4\u4EF6\u81EA\u5B9A\uFF09\uFF0C\u4F46\u6709\u5168\u5C40\u89D2\u5F62 token\uFF1A
 * @supports \u751F\u6548\u65F6 :root \u4E0B --dsw-corner-shape:superellipse(1.5)\uFF0C
 * \u5E76\u7ECF\u901A\u7528\u9009\u62E9\u5668\u4F5C\u7528\u4E8E\u5168\u6587\u6863\u3002\u672C\u63D2\u4EF6\u534A\u5F84\u6536\u5F52\u4E0B\u65B9\u53D8\u91CF\uFF08\u9ED8\u8BA4\u503C\u4E0E\u73B0\u6709\u89C6\u89C9\u4E00\u81F4\uFF09\uFF0C
 * \u5361\u7247/\u6D6E\u7A97/\u56FE\u8868\u5185\u5143\u7D20\u5168\u90E8\u5F15\u7528\uFF1B\u89D2\u5F62\u663E\u5F0F\u914D\u5BF9\u5168\u5C40\uFF08\u77E9\u5F62\u5361\u7247\u8DDF\u968F\u8D85\u692D\u5706\uFF0C
 * pill/\u5706\u5F62\u6309\u4EA7\u54C1\u89C4\u8303\u914D\u5BF9 round\uFF09\uFF0C\u4E0E\u5B98\u65B9 UI \u540C\u5F62\u3002\u540E\u7EED\u4EA7\u54C1\u82E5\u53D1\u5E03\u534A\u5F84 token\uFF0C
 * \u53EA\u9700\u5728\u6B64\u4E00\u5904\u91CD\u6620\u5C04\u3002 */
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
/* \u2500\u2500 \u5CF0\u8C37\u6C1B\u56F4\uFF08\u7F6E\u4E8E\u672B\u5C3E\u4EE5\u8986\u76D6\u524D\u5E8F\u540C\u7279\u5F02\u6027\u58F0\u660E\uFF09\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
 * \u5CF0\uFF08\u5DE5\u4F5C\u65E5 9:00\u201318:00\uFF09\uFF1A\u6696\u8272\u5DE6\u7F18 + \u6781\u7F13\u547C\u5438\u5149\u6655 \u2014\u2014 \u7D27\u5F20\u3001\u6D88\u8017\u52A0\u901F\uFF1B
 * \u8C37\uFF1A\u51B7\u7EFF\u5DE6\u7F18 + \u9759\u7A33\u5E95\u8272 \u2014\u2014 \u8D39\u7387\u4F4E\u3001\u53EF\u4ECE\u4ECE\u5BB9\u5BB9\u8DD1\u91CF\uFF1B
 * \u7981\u7528\uFF08enabled:false\uFF09\uFF1A\u7EA2\u8272\u5DE6\u7F18 \u2014\u2014 \u4E0D\u53C2\u4E0E\u5B9A\u65F6\u62C9\u53D6\u3002 */
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
/* \u2500\u2500 \u5728\u7EBF\u65F6\u957F\u9762\u677F\uFF1A\u6863\u4F4D\u7EC4\u5B57\u6BB5\u5F0F\u5E03\u5C40 + \u51C6\u786E\u5EA6\u5FBD\u6807 \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.tm-segField{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:3px 0;border-top:.5px solid var(--dsw-alias-border-l2)}
.tm-segField:first-child{border-top:none}
.tm-segFieldKey{font-size:12px;color:var(--dsw-alias-label-secondary);min-width:58px;flex:none}
.tm-segFieldCtl{display:inline-flex;flex:none}
.tm-segFieldHint{font-size:11px;line-height:15px;color:var(--dsw-alias-label-caption);flex:1 1 190px;min-width:130px}
.tm-acc{font-size:10px;line-height:15px;padding:0 4px;border-radius:4px;border:1px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-label-caption);flex:none;font-weight:400}
.tm-acc.exact{color:var(--dsw-alias-state-success-primary);border-color:color-mix(in srgb,var(--dsw-alias-state-success-primary) 45%,transparent);background:color-mix(in srgb,var(--dsw-alias-state-success-primary) 10%,transparent)}
.tm-acc.estimate{color:var(--dsw-alias-state-warn-primary);border-color:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 45%,transparent);background:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 10%,transparent)}
.tm-acc.bound{color:var(--dsw-alias-label-tertiary);background:var(--dsw-alias-interactive-bg-hover)}
/* \u2500\u2500 \u6BCF\u65E5\u5728\u7EBF\u6392\u884C\uFF08\u67F1\u72B6 + \u5217\u8868\u5408\u4F53\uFF09\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
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
/* \u2500\u2500 \u7EDF\u4E00\u6570\u636E\u63D0\u793A\uFF08\u66FF\u4EE3\u539F\u751F title\uFF09\uFF1A\u6807\u9898 + \u952E\u503C\u884C + \u591A\u884C\u8BF4\u660E \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.tm-tip-title{font-weight:600;margin-bottom:3px;color:var(--dsw-alias-label-primary)}
.tm-tip-text{white-space:normal;max-width:236px;line-height:1.5;margin-top:3px;color:var(--dsw-alias-label-secondary)}
.tm-tipfixed .tm-tiprow+.tm-tiprow{margin-top:1px}
`;

  // src/client/icons.ts
  function createIcons(React) {
    const h = React.createElement;
    function svgProps(props) {
      const size = props && props.size ? props.size : 16;
      return {
        width: size,
        height: size,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 1.8,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        className: props && props.className || void 0,
        "aria-hidden": "true",
        focusable: "false"
      };
    }
    function QuotaIcon(props) {
      return h(
        "svg",
        svgProps(props),
        h("rect", { key: "body", x: 2.5, y: 7, width: 16, height: 10, rx: 2.6 }),
        h("path", { key: "cap", d: "M21.2 10.4v3.2" }),
        h("rect", {
          key: "level",
          x: 5,
          y: 9.4,
          width: 6.4,
          height: 5.2,
          rx: 1.3,
          fill: "currentColor",
          stroke: "none"
        })
      );
    }
    function UsageIcon(props) {
      return h(
        "svg",
        svgProps(props),
        h("path", { key: "a", d: "M4.6 20v-6.4", strokeWidth: 2.6 }),
        h("path", { key: "b", d: "M12 20V5.4", strokeWidth: 2.6 }),
        h("path", { key: "c", d: "M19.4 20v-9.6", strokeWidth: 2.6 })
      );
    }
    function OnlineIcon(props) {
      return h(
        "svg",
        svgProps(props),
        h("circle", { key: "face", cx: 12, cy: 12, r: 8.4 }),
        h("path", { key: "hand", d: "M12 7.6V12l3.2 2" })
      );
    }
    return { QuotaIcon, UsageIcon, OnlineIcon };
  }

  // src/client/api.ts
  var BASE = "/ext/dshp-token-meter";
  async function post(path, body) {
    const r = await fetch(`${BASE}${path}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body ?? {})
    });
    return await r.json();
  }
  async function fetchState() {
    const r = await fetch(`${BASE}/state`, { cache: "no-store" });
    return await r.json();
  }
  async function saveConfig(patch) {
    return await post("/config", patch);
  }
  async function clearStatsCache() {
    return await post("/clear-cache", {});
  }
  async function fetchStats() {
    const r = await fetch(`${BASE}/stats`, { cache: "no-store" });
    return await r.json();
  }

  // src/client/OnlineSection.ts
  var GAP_LABELS = [
    [1, "1 \u5206\u949F"],
    [5, "5 \u5206\u949F"],
    [15, "15 \u5206\u949F"],
    [30, "30 \u5206\u949F"],
    [60, "60 \u5206\u949F"]
  ];
  var RANGE_LABELS = [
    [14, "\u8FD1 14 \u5929"],
    [30, "\u8FD1 30 \u5929"],
    [90, "\u8FD1 90 \u5929"],
    [0, "\u5168\u90E8"]
  ];
  var OUTCOME_LABELS = {
    usage: "\u6709\u7528\u91CF",
    "fork-empty": "\u7EE7\u627F\u7A7A\u58F3\uFF08fork \u540E\u6CA1\u5E72\u6D3B\uFF09",
    "no-request": "\u4ECE\u6CA1\u53D1\u8D77\u6A21\u578B\u8BF7\u6C42",
    failed: "\u8BF7\u6C42\u5931\u8D25/\u4E2D\u65AD\uFF08\u6A21\u578B\u6CA1\u56DE\u7B54\uFF09",
    "no-usage": "\u6709\u56DE\u7B54\u4F46\u4F9B\u5E94\u5546\u6CA1\u4E0A\u62A5 usage",
    unreadable: "\u65E5\u5FD7\u8BFB\u4E0D\u51FA\u6765\uFF08\u5DF2\u515C\u5E95\uFF0C\u82E5\u4ECD\u6709\u5219\u4E3A\u7591\u96BE\u65E5\u5FD7\uFF09"
  };
  var C_MAIN = "var(--dsw-alias-state-business-primary)";
  var C_BUSY = "#f5a623";
  var CHART_W = 320;
  var CHART_H = 150;
  function fmtDur(ms) {
    const s = Math.max(0, Math.round((ms || 0) / 1e3));
    if (s < 60) return s + "s";
    const m = Math.floor(s / 60);
    if (m < 60) return m + "m";
    const h = Math.floor(m / 60);
    const rest = m % 60;
    return rest === 0 ? h + "h" : h + "h" + String(rest).padStart(2, "0") + "m";
  }
  function fmtDurCn(ms) {
    const m = Math.max(0, Math.round((ms || 0) / 6e4));
    if (m < 1) return "<1 \u5206";
    if (m < 60) return m + " \u5206";
    const h = Math.floor(m / 60);
    const rest = m % 60;
    return rest === 0 ? h + " \u5C0F\u65F6" : h + " \u5C0F\u65F6 " + rest + " \u5206";
  }
  var fmtTok = (n) => {
    const v = Math.round(n || 0);
    if (v >= 1e8) return (v / 1e8).toFixed(2) + " \u4EBF";
    if (v >= 1e4) return (v / 1e4).toFixed(1) + " \u4E07";
    return String(v);
  };
  var keyOf = (t) => {
    const d = new Date(t);
    const M = String(d.getMonth() + 1);
    const D = String(d.getDate());
    return d.getFullYear() + "-" + (M.length < 2 ? "0" + M : M) + "-" + (D.length < 2 ? "0" + D : D);
  };
  var dispDay = (k) => k ? k.slice(5).replace("-", "/") : "";
  var cnDate = (k) => {
    const p = k.split("-");
    return Number(p[0]) + "\u5E74" + Number(p[1]) + "\u6708" + Number(p[2]) + "\u65E5";
  };
  function lastNDays(n, now = Date.now()) {
    const out = [];
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (n - 1));
    for (let i = 0; i < n; i++) {
      out.push(keyOf(d.getTime()));
      d.setDate(d.getDate() + 1);
    }
    return out;
  }
  function tipPos(mx, my, w, h) {
    const vw = typeof window !== "undefined" ? window.innerWidth || 1024 : 1024;
    const vh = typeof window !== "undefined" ? window.innerHeight || 768 : 768;
    const flipX = mx + w + 28 > vw;
    const flipY = my + h + 28 > vh;
    return {
      left: flipX ? void 0 : mx + 14 + "px",
      right: flipX ? vw - mx + 14 + "px" : void 0,
      top: flipY ? void 0 : my + 16 + "px",
      bottom: flipY ? vh - my + 16 + "px" : void 0
    };
  }
  var WEEKDAYS = ["\u65E5", "\u4E00", "\u4E8C", "\u4E09", "\u56DB", "\u4E94", "\u516D"];
  function weekdayOf(k) {
    const p = k.split("-");
    const d = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]), 12);
    return "\u5468" + (WEEKDAYS[d.getDay()] ?? "");
  }
  function sortByMsDesc(arr) {
    const out = arr.slice();
    return out.sort((a, b) => b.ms - a.ms);
  }
  function deriveOnlineView(online, gap, rangeDays, now = Date.now()) {
    const g = String(gap);
    const byKey = /* @__PURE__ */ new Map();
    for (const day of online.days) byKey.set(day.d, day);
    const series = [];
    const keys = rangeDays > 0 ? lastNDays(rangeDays, now) : online.days.map((x) => x.d);
    for (const k of keys) {
      const day = byKey.get(k);
      const ms = day ? day.byGap[g] ?? 0 : 0;
      const turnMs = day ? day.turnMs : 0;
      series.push({
        d: k,
        ms,
        turnMs,
        idleMs: Math.max(0, ms - turnMs),
        llmMs: day ? day.llmMs || 0 : 0,
        toolMs: day ? day.toolMs || 0 : 0,
        busyMs: day ? (day.llmMs || 0) + (day.toolMs || 0) : 0,
        tokens: day ? day.tokens : 0,
        sessions: day ? day.sessions : 0,
        seg: day ? day.segByGap ? day.segByGap[g] ?? 0 : 0 : 0,
        actual: day !== void 0
      });
    }
    let peak = null;
    const actualItems = [];
    for (const it of series) {
      if (!it.actual) continue;
      if (peak === null || it.ms > peak.ms) peak = it;
      actualItems.push(it);
    }
    const ranked = sortByMsDesc(actualItems);
    const top = ranked.slice(0, 8);
    const total = online.totalMs[g] ?? 0;
    const turn = online.turnMs;
    const llm = online.llmMs || 0;
    const tool = online.toolMs || 0;
    return {
      gap,
      total,
      turn,
      idle: Math.max(0, total - turn),
      llm,
      tool,
      busy: llm + tool,
      activeDays: online.activeDays,
      avg: online.activeDays > 0 ? total / online.activeDays : 0,
      today: byKey.get(keyOf(now))?.byGap[g] ?? 0,
      segments: online.segments[g] ?? 0,
      series,
      peak,
      ranked,
      top
    };
  }
  function createOnlineSection(React, ReactDOM, statsApi) {
    const h = React.createElement;
    function portal(node) {
      if (node === null || node === void 0) return null;
      try {
        if (ReactDOM && typeof ReactDOM.createPortal === "function" && typeof document !== "undefined" && document.body)
          return ReactDOM.createPortal(node, document.body);
      } catch {
      }
      return node;
    }
    const tipStore = { cur: null, subs: /* @__PURE__ */ new Set() };
    function tipEmit() {
      for (const fn of tipStore.subs) {
        try {
          fn();
        } catch {
        }
      }
    }
    function useTip() {
      return {
        bind: (c) => ({
          onMouseEnter: (e) => {
            tipStore.cur = { x: e.clientX, y: e.clientY, c };
            tipEmit();
          },
          onMouseMove: (e) => {
            const cur = tipStore.cur;
            if (cur !== null && cur.c.k === c.k && cur.x === e.clientX && cur.y === e.clientY) return;
            tipStore.cur = { x: e.clientX, y: e.clientY, c };
            tipEmit();
          },
          onMouseLeave: () => {
            tipStore.cur = null;
            tipEmit();
          }
        })
      };
    }
    function TipHost() {
      const [, force] = React.useReducer((x) => x + 1, 0);
      React.useEffect(() => {
        tipStore.subs.add(force);
        return () => {
          tipStore.subs.delete(force);
        };
      }, [force]);
      const tip = tipStore.cur;
      if (tip === null) return null;
      return portal(
        h(
          "div",
          {
            className: "tm-tipfixed",
            style: tipPos(
              tip.x,
              tip.y,
              250,
              30 + (tip.c.rows ? tip.c.rows.length * 18 : 0) + (tip.c.text ? 36 : 0)
            )
          },
          tip.c.title ? h("div", { className: "tm-tip-title" }, tip.c.title) : null,
          (tip.c.rows ?? []).map(
            ([k, v]) => h(
              "div",
              { key: k, className: "tm-tiprow" },
              h("span", { className: "tm-tip-k" }, k),
              h("span", { className: "tm-tip-v" }, v)
            )
          ),
          tip.c.text ? h("div", { className: "tm-tip-text" }, tip.c.text) : null
        )
      );
    }
    function useOnlineLocal(pollMs) {
      const [snap, setSnap] = React.useState(null);
      const [err, setErr] = React.useState("");
      const load = React.useCallback(() => {
        void fetchStats().then((s) => {
          setSnap(s);
          setErr(s && s.error ? String(s.error) : "");
        }).catch((e) => setErr(String(e?.message ?? e)));
      }, []);
      React.useEffect(() => {
        load();
        const id = window.setInterval(() => {
          if (document.visibilityState !== "hidden") load();
        }, pollMs);
        const onVis = () => {
          if (document.visibilityState === "visible") load();
        };
        document.addEventListener("visibilitychange", onVis);
        return () => {
          window.clearInterval(id);
          document.removeEventListener("visibilitychange", onVis);
        };
      }, [load, pollMs]);
      return { snap, err, reload: load };
    }
    const useShared = statsApi && typeof statsApi.useSharedStats === "function" ? statsApi.useSharedStats : null;
    function useSnapshot() {
      if (useShared !== null) {
        const sharedSnap = useShared();
        return { snap: sharedSnap.data, err: sharedSnap.err, reload: () => sharedSnap.reload(true) };
      }
      return useOnlineLocal(2e4);
    }
    function Seg(props) {
      return h(
        "span",
        { className: "tm-seg" },
        props.items.map(
          ([v, t]) => h(
            "button",
            {
              key: String(v),
              type: "button",
              className: "tm-seg-btn" + (v === props.value ? " tm-seg-on" : ""),
              onClick: () => props.onPick(v)
            },
            t
          )
        )
      );
    }
    function Acc(props) {
      const map = {
        exact: ["tm-badge-ok", "\u7CBE\u786E"],
        estimate: ["tm-badge-warn", "\u4F30\u7B97"],
        bound: ["tm-badge-muted", "\u4E0B\u754C"]
      };
      const picked = map[props.kind];
      return h("span", { className: "tm-badge " + picked[0] }, picked[1]);
    }
    function Stat(props) {
      const t = useTip();
      return h(
        "div",
        {
          className: "tm-stat",
          ...props.tint ? { "data-tint": "1" } : {},
          ...props.tip ? t.bind(props.tip) : {}
        },
        h(
          "div",
          { className: "tm-stat-label", style: { display: "flex", alignItems: "center", gap: 4 } },
          props.label,
          props.acc ? h(
            "span",
            { className: "tm-acc " + props.acc },
            props.acc === "exact" ? "\u7CBE\u786E" : props.acc === "estimate" ? "\u4F30\u7B97" : "\u4E0B\u754C"
          ) : null
        ),
        h("div", { className: "tm-stat-value" }, props.value),
        props.sub ? h("div", { className: "tm-stat-sub" }, props.sub) : null
      );
    }
    function Dot(props) {
      return h("span", {
        className: "tm-dot",
        style: { background: props.color, opacity: props.faint ? 0.35 : 1, marginTop: 0 }
      });
    }
    function Legend() {
      return h(
        "div",
        { className: "tm-legend" },
        h(Dot, { color: C_MAIN }),
        h("span", { className: "tm-hint" }, "\u5BF9\u8BDD\u8FDB\u884C\u4E2D"),
        h(Dot, { color: C_MAIN, faint: true }),
        h("span", { className: "tm-hint" }, "\u7A7A\u6863\uFF08\u2264 \u9608\u503C\u7684\u8FFD\u95EE/\u6536\u5C3E\uFF0C\u7B97\u5728\u7EBF\u4E0D\u7B97\u5BF9\u8BDD\uFF09"),
        h(Dot, { color: C_BUSY }),
        h("span", { className: "tm-hint" }, "\u6A21\u578B + \u5DE5\u5177\uFF08\u5E76\u884C\u76F8\u52A0\uFF0C\u53EF\u9AD8\u4E8E\u67F1\u9AD8\uFF09")
      );
    }
    function Chart(props) {
      const items = props.items;
      const W = CHART_W;
      const H = CHART_H;
      const padT = 12;
      const padB = 18;
      const innerH = H - padT - padB;
      const [hover, setHover] = React.useState(null);
      if (items.length === 0) return h("div", { className: "tm-empty" }, "\u6682\u65E0\u6570\u636E");
      let max = 0;
      for (const it of items) {
        if (it.ms > max) max = it.ms;
        if (it.busyMs > max) max = it.busyMs;
      }
      if (max <= 0) max = 1;
      const bw = W / items.length;
      const barW = Math.max(1.4, Math.min(20, bw * 0.6));
      const yOf = (v) => padT + innerH * (1 - v / max);
      const step = Math.max(1, Math.ceil(items.length / 6));
      const today = keyOf(Date.now());
      const children = [];
      children.push(
        h("line", { key: "ax", x1: 0, y1: padT + innerH, x2: W, y2: padT + innerH, className: "tm-gridln" })
      );
      children.push(
        h("line", {
          key: "mid",
          x1: 0,
          y1: padT + innerH / 2,
          x2: W,
          y2: padT + innerH / 2,
          className: "tm-gridln",
          strokeDasharray: "3 3"
        })
      );
      children.push(
        h("text", { key: "ymax", x: 0, y: padT - 3, className: "tm-axislbl" }, (max / 36e5).toFixed(1) + "h")
      );
      items.forEach((it, i) => {
        const x = i * bw + (bw - barW) / 2;
        const turnH = it.turnMs > 0 ? Math.max(1, it.turnMs / max * innerH) : 0;
        const idleH = it.idleMs > 0 ? Math.max(1, it.idleMs / max * innerH) : 0;
        const yTurn = padT + innerH - turnH;
        const yIdle = yTurn - idleH;
        if (turnH > 0)
          children.push(
            h("rect", {
              key: "t" + it.d,
              x,
              y: yTurn,
              width: barW,
              height: turnH,
              rx: 2,
              fill: C_MAIN,
              opacity: it.d === today ? 0.95 : 0.72
            })
          );
        if (idleH > 0)
          children.push(
            h("rect", {
              key: "i" + it.d,
              x,
              y: yIdle,
              width: barW,
              height: idleH,
              rx: 2,
              fill: C_MAIN,
              opacity: 0.26
            })
          );
        if (i % step === 0)
          children.push(
            h(
              "text",
              { key: "l" + it.d, x: x + barW / 2, y: H - 5, textAnchor: "middle", className: "tm-axislbl" },
              dispDay(it.d)
            )
          );
      });
      if (items.some((it) => it.busyMs > 0))
        children.push(
          h("polyline", {
            key: "busy",
            points: items.map((it, i) => (i * bw + bw / 2).toFixed(1) + "," + yOf(it.busyMs).toFixed(1)).join(" "),
            fill: "none",
            stroke: C_BUSY,
            strokeWidth: 1.6,
            strokeDasharray: "4 3",
            strokeLinejoin: "round"
          })
        );
      const hovered = hover !== null ? items[hover.i] : void 0;
      if (hover !== null && hovered)
        children.push(
          h("rect", {
            key: "hv",
            x: hover.i * bw,
            y: padT,
            width: bw,
            height: innerH,
            fill: "currentColor",
            opacity: 0.08,
            pointerEvents: "none"
          })
        );
      items.forEach((it, i) => {
        children.push(
          h("rect", {
            key: "hit" + it.d,
            x: i * bw,
            y: padT,
            width: bw,
            height: innerH,
            fill: "transparent",
            style: { pointerEvents: "all", cursor: "crosshair" },
            onMouseEnter: (e) => setHover({ i, mx: e.clientX, my: e.clientY })
          })
        );
      });
      const rows = [];
      if (hovered) {
        const line = (k, v) => h(
          "div",
          { key: k, className: "tm-tiprow" },
          h("span", { className: "tm-tip-k" }, k),
          h("span", { className: "tm-tip-v" }, v)
        );
        rows.push(line("\u5728\u7EBF", fmtDur(hovered.ms)));
        rows.push(line("\u5BF9\u8BDD\u8FDB\u884C\u4E2D", fmtDur(hovered.turnMs)));
        rows.push(line("\u7A7A\u6863", fmtDur(hovered.idleMs)));
        rows.push(line("\u6A21\u578B + \u5DE5\u5177", fmtDur(hovered.busyMs)));
        rows.push(line("\u6D3B\u52A8\u6BB5\u6570", String(hovered.seg)));
        rows.push(line("\u4F1A\u8BDD\u6570", String(hovered.sessions)));
        rows.push(line("Token", fmtTok(hovered.tokens)));
      }
      const pop = hover !== null && hovered ? portal(
        h(
          "div",
          { className: "tm-tipfixed", style: tipPos(hover.mx, hover.my, 200, 40 + rows.length * 18) },
          h("div", { style: { fontWeight: 600, marginBottom: 3 } }, cnDate(hovered.d)),
          rows
        )
      ) : null;
      return h(
        "div",
        { className: "tm-svgwrap" },
        h(
          "div",
          { style: { cursor: "crosshair" } },
          h(
            "svg",
            {
              viewBox: "0 0 " + W + " " + H,
              width: "100%",
              height: H,
              role: "img",
              // 下标由每根柱的透明命中区给出（DOM 决定，不做坐标换算 → 不会因留边/缩放偏移）；
              // 容器这里只负责让浮层跟随鼠标。
              onMouseMove: (e) => {
                setHover(
                  (prev) => prev === null || prev.mx === e.clientX && prev.my === e.clientY ? prev : { i: prev.i, mx: e.clientX, my: e.clientY }
                );
              },
              onMouseLeave: () => setHover(null)
            },
            children
          )
        ),
        pop
      );
    }
    function ProportionBars(props) {
      const v = props.view;
      const tip = useTip();
      const max = Math.max(v.total, v.busy, 1);
      const bar = (label, ms, color, note, faint) => h(
        "div",
        { key: label, className: "tm-bar", style: { padding: "7px 0" } },
        h(
          "div",
          { style: { flex: "1 1 118px", minWidth: 118 } },
          h("div", { className: "tm-title" }, label),
          h("div", { className: "tm-desc" }, note)
        ),
        h(
          "div",
          Object.assign(
            { className: "tm-bartrack" },
            tip.bind({
              k: label,
              title: label,
              rows: [
                ["\u65F6\u957F", fmtDur(ms)],
                ["\u5360\u5728\u7EBF", v.total > 0 ? Math.round(ms / v.total * 100) + "%" : "\u2014"]
              ],
              text: note
            })
          ),
          h("span", {
            className: "tm-barfill",
            style: {
              width: Math.round(ms / max * 100) + "%",
              background: color,
              opacity: faint ? 0.42 : 1
            }
          })
        ),
        h(
          "div",
          { className: "tm-mono", style: { fontSize: 12.5, minWidth: 62, textAlign: "right" } },
          fmtDur(ms)
        )
      );
      return h(
        "div",
        null,
        bar("\u5728\u7EBF\uFF08\u4F60 + DSH\uFF09", v.total, C_MAIN, "\u542B\u4F60\u81EA\u5DF1\u7684\u8FFD\u95EE/\u9605\u8BFB\u7A7A\u6863", true),
        bar("\u5BF9\u8BDD\u8FDB\u884C\u4E2D\uFF08DSH \u7684\u949F\uFF09", v.turn, C_MAIN, "turn \u533A\u95F4\u5E76\u96C6\uFF0C\u5899\u949F\u53BB\u91CD"),
        bar("\u6A21\u578B + \u5DE5\u5177\uFF08DSH \u7684\u6D3B\uFF09", v.busy, C_BUSY, "\u5E76\u884C\u4F1A\u8BDD\u76F8\u52A0\uFF0C\u53EF\u9AD8\u4E8E\u5899\u949F", true)
      );
    }
    function Accuracy(props) {
      const tip = useTip();
      const v = props.view;
      const snap = props.snap;
      const windowTokens = v.series.reduce((a, b) => a + b.tokens, 0);
      const row = (name, val, kind, note) => h(
        "tr",
        { key: name },
        h("td", { style: { padding: "6px 8px 6px 0", whiteSpace: "nowrap" } }, name),
        h("td", { style: { padding: "6px 8px 6px 0", whiteSpace: "nowrap" } }, h(Acc, { kind })),
        h(
          "td",
          { style: { padding: "6px 8px 6px 0", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" } },
          val
        ),
        h("td", { style: { padding: "6px 0", color: "var(--dsw-alias-label-secondary)" } }, note)
      );
      return h(
        "div",
        { className: "tm-card" },
        h("div", { className: "tm-title" }, "\u53E3\u5F84\u4E0E\u51C6\u786E\u6027"),
        h(ProportionBars, { view: v }),
        h(
          "div",
          { style: { overflowX: "auto" } },
          h(
            "table",
            { style: { width: "100%", borderCollapse: "collapse", fontSize: 12, marginTop: 4 } },
            h(
              "thead",
              null,
              h(
                "tr",
                { style: { color: "var(--dsw-alias-label-caption)", textAlign: "left" } },
                h("th", { style: { padding: "0 8px 4px 0", fontWeight: 500 } }, "\u6307\u6807"),
                h("th", { style: { padding: "0 8px 4px 0", fontWeight: 500 } }, "\u6027\u8D28"),
                h("th", { style: { padding: "0 8px 4px 0", fontWeight: 500 } }, "\u5F53\u524D\u503C"),
                h("th", { style: { padding: "0 0 4px", fontWeight: 500 } }, "\u8BF4\u660E")
              )
            ),
            h(
              "tbody",
              null,
              row(
                "\u5728\u7EBF\u65F6\u957F",
                fmtDur(v.total),
                "bound",
                "\u65E5\u5FD7\u53EA\u5728\u6709\u4E8B\u4EF6\u65F6\u6253\u70B9\uFF1A\u7A97\u53E3\u5F00\u7740\u4F46\u6CA1\u4E8B\u4EF6\u7684\u65F6\u95F4\u4E0D\u53EF\u89C1\uFF0C\u6240\u4EE5\u662F\u4E0B\u754C\uFF1B\u9608\u503C\uFF08\u5F53\u524D " + v.gap + " \u5206\u949F\uFF09\u76F4\u63A5\u51B3\u5B9A\u7ED3\u679C"
              ),
              row(
                "\u5BF9\u8BDD\u8FDB\u884C\u4E2D",
                fmtDur(v.turn),
                "estimate",
                "turn/start\u2192turn/end \u5E76\u96C6\uFF08\u5899\u949F\u53BB\u91CD\uFF09\uFF1B\u542B\u5C11\u91CF\u7B49\u4F60\u64CD\u4F5C\u7684\u65F6\u95F4\uFF08\u5B9E\u6D4B\u5BA1\u6279\u7B49\u5F85\u7EA6 0.7h\uFF09"
              ),
              row(
                "\u6A21\u578B\u751F\u6210",
                fmtDur(v.llm),
                "exact",
                "step/start\u2192assistant/message\uFF1B\u5DF2\u4E0E DSH \u81EA\u5E26 sessionStats \u6295\u5F71\u9010\u4F1A\u8BDD\u5BF9\u8D26\u4E00\u81F4"
              ),
              row("\u5DE5\u5177\u6267\u884C", fmtDur(v.tool), "exact", "tool/call\u2192tool/result \u6309 callId \u914D\u5BF9"),
              row(
                "\u5F15\u64CE\u5408\u8BA1",
                fmtDur(v.busy),
                "exact",
                "\u4E0A\u4E24\u8005\u76F8\u52A0\uFF1B\u540C\u65F6\u5F00\u591A\u4E2A\u4F1A\u8BDD/\u5B50\u4EE3\u7406\u4F1A\u91CD\u590D\u8BA1\uFF0C\u6240\u4EE5\u53EF\u80FD\u5927\u4E8E\u5899\u949F"
              ),
              row("\u6D3B\u8DC3\u5929\u6570", String(v.activeDays), "exact", "\u6709\u4E8B\u4EF6\u6216\u6709\u7528\u91CF\u7684\u81EA\u7136\u65E5\u6570"),
              row(
                "Token \u7528\u91CF",
                fmtTok(windowTokens),
                "exact",
                "\u5F53\u524D\u533A\u95F4\u7684\u4E0A\u62A5\u503C\uFF1B\u53EA\u7EDF\u8BA1\u4F9B\u5E94\u5546\u7ED9\u4E86 usage \u7684\u6B65\u9AA4\uFF0C\u672A\u4E0A\u62A5\u7684\u7B97\u4E0D\u5230\uFF0C\u56E0\u6B64\u7565\u4F4E"
              ),
              row(
                "\u4F1A\u8BDD\u53E3\u5F84",
                snap ? (snap.sessionOutcomes?.["usage"] ?? 0) + " / " + snap.total : String(v.activeDays),
                "exact",
                snap ? "\u5171 " + snap.total + " \u4E2A\u4F1A\u8BDD\uFF1A" + Object.entries(snap.sessionOutcomes ?? {}).map(([k, n]) => (OUTCOME_LABELS[k] ?? k) + " " + n + " \u4E2A").join(" \xB7 ") : "\u4F1A\u8BDD\u5217\u8868\u6765\u81EA sessionQuery"
              )
            )
          )
        ),
        snap ? h(
          "div",
          { className: "tm-cacheRow" },
          h("span", { className: "tm-muted" }, "\u6570\u636E\u6E90"),
          h(
            "span",
            null,
            snap.scanned + "/" + snap.total + " \u4E2A\u4F1A\u8BDD\u5DF2\u626B\u63CF" + (snap.partial ? "\uFF08\u540E\u53F0\u8865\u626B\u4E2D\uFF09" : "")
          ),
          (snap.directReads ?? 0) > 0 ? h(
            "span",
            Object.assign(
              {},
              tip.bind({
                k: "direct",
                title: "\u76F4\u8BFB\u65E5\u5FD7",
                rows: [["\u4F1A\u8BDD\u6570", String(snap.directReads)]],
                text: "\u975E live \u4F1A\u8BDD\u9ED8\u8BA4\u76F4\u63A5\u8BFB\u65E5\u5FD7\u6587\u4EF6\uFF08\u9010\u5E27\u89E3\u538B + \u5207\u6389 fork \u7EE7\u627F\u524D\u7F00\uFF09\uFF0C\u6BD4\u5B98\u65B9 reader \u5FEB\u4E00\u5230\u4E24\u4E2A\u6570\u91CF\u7EA7\uFF1Blive \u4F1A\u8BDD\u4ECD\u8D70\u5B98\u65B9 reader\u3002"
              })
            ),
            "\u76F4\u8BFB " + snap.directReads + " \u4E2A"
          ) : null,
          snap.errors > 0 ? h(
            "span",
            Object.assign(
              {},
              tip.bind({
                k: "errors",
                title: "\u626B\u63CF\u5931\u8D25 " + snap.errors + " \u4E2A",
                text: (snap.errorSamples ?? []).length > 0 ? (snap.errorSamples ?? []).map((x) => x.id + "\uFF1A" + x.message).join("\uFF1B") : "\u6CA1\u6709\u53EF\u7528\u7684\u539F\u56E0\u6837\u672C"
              })
            ),
            "\u626B\u63CF\u5931\u8D25 " + snap.errors + " \u4E2A"
          ) : null,
          h("span", null, "\u7F13\u5B58 " + snap.storage),
          h("span", null, "fork/\u7EED\u63A5\u7684\u7EE7\u627F\u524D\u7F00\u4E0D\u91CD\u590D\u8BA1\u65F6")
        ) : null
      );
    }
    function tipLine(k, v, key) {
      return h(
        "div",
        { key: key ?? k, className: "tm-tiprow" },
        h("span", { className: "tm-tip-k" }, k),
        h("span", { className: "tm-tip-v" }, v)
      );
    }
    function RankingList(props) {
      const [showAll, setShowAll] = React.useState(false);
      const [hover, setHover] = React.useState(null);
      const ranked = props.ranked;
      if (ranked.length === 0) return h("div", { className: "tm-empty" }, "\u6682\u65E0\u6570\u636E");
      const items = showAll ? ranked : ranked.slice(0, 8);
      let max = 1;
      for (const it of items) if (it.ms > max) max = it.ms;
      const rows = items.map((it, i) => {
        const wTurn = Math.round(it.turnMs / max * 100);
        const wIdle = Math.round(it.idleMs / max * 100);
        return h(
          "div",
          {
            key: it.d,
            className: "tm-rankRow" + (i < 3 ? " top3" : ""),
            onMouseMove: (e) => setHover({ i, mx: e.clientX, my: e.clientY }),
            onMouseLeave: () => setHover(null)
          },
          h("span", { className: "tm-rankNo" }, String(i + 1)),
          h(
            "div",
            { style: { minWidth: 0 } },
            h("div", { className: "tm-rankDate" }, dispDay(it.d) + " " + weekdayOf(it.d)),
            h(
              "div",
              { className: "tm-desc", style: { margin: 0, fontSize: 11, whiteSpace: "nowrap" } },
              it.sessions + " \u4F1A\u8BDD \xB7 \u6BB5 " + it.seg
            )
          ),
          h(
            "div",
            { className: "tm-rankBarTrack" },
            h("span", { className: "tm-rankFillTurn", style: { width: wTurn + "%" } }),
            h("span", { className: "tm-rankFillIdle", style: { width: wIdle + "%" } })
          ),
          h("span", { className: "tm-rankVal" }, fmtDur(it.ms)),
          h("span", { className: "tm-rankTok" }, fmtTok(it.tokens))
        );
      });
      const hovered = hover !== null ? items[hover.i] : void 0;
      const pop = hover !== null && hovered ? portal(
        h(
          "div",
          { className: "tm-tipfixed", style: tipPos(hover.mx, hover.my, 220, 190) },
          h(
            "div",
            { style: { fontWeight: 600, marginBottom: 3 } },
            cnDate(hovered.d) + "\uFF08\u7B2C " + (hover.i + 1) + " \u540D\uFF09"
          ),
          tipLine("\u5728\u7EBF", fmtDur(hovered.ms), "a"),
          tipLine("\u5BF9\u8BDD\u8FDB\u884C\u4E2D", fmtDur(hovered.turnMs), "b"),
          tipLine("\u7A7A\u6863", fmtDur(hovered.idleMs), "c"),
          tipLine("\u6A21\u578B + \u5DE5\u5177", fmtDur(hovered.busyMs), "d"),
          tipLine("\u6D3B\u52A8\u6BB5\u6570", String(hovered.seg), "e"),
          tipLine("\u4F1A\u8BDD\u6570", String(hovered.sessions), "f"),
          tipLine("Token", fmtTok(hovered.tokens), "g")
        )
      ) : null;
      return h(
        "div",
        null,
        h(
          "div",
          { className: "tm-rankHead" },
          h("span", null, "#"),
          h("span", null, "\u65E5\u671F"),
          h("span", null, "\u5728\u7EBF\u6784\u6210 \xB7 \u5B9E\u8272 \u5BF9\u8BDD\u4E2D / \u6D45\u8272 \u7A7A\u6863"),
          h("span", { style: { textAlign: "right" } }, "\u5728\u7EBF"),
          h("span", { style: { textAlign: "right" } }, "Token")
        ),
        rows,
        pop,
        ranked.length > 8 ? h(
          "div",
          { className: "tm-toolbar", style: { margin: "8px 0 0", justifyContent: "center" } },
          h(
            "button",
            {
              type: "button",
              className: "tm-mini",
              onClick: () => setShowAll((v) => !v)
            },
            showAll ? "\u53EA\u770B\u524D 8 \u540D" : "\u5C55\u5F00\u5168\u90E8 " + ranked.length + " \u5929"
          )
        ) : null
      );
    }
    function Body(props) {
      const tip = useTip();
      const data = props.data;
      const online = data && data.ready && data.online ? data.online : null;
      if (!online) {
        return h(
          "div",
          { className: "tm-card" },
          h("div", { className: "tm-title" }, "\u5728\u7EBF\u65F6\u957F"),
          h(
            "div",
            { className: "tm-desc" },
            props.err ? "\u8BFB\u53D6\u5931\u8D25\uFF1A" + props.err : data && data.ready ? "\u5F53\u524D Host \u672A\u63D0\u4F9B\u5728\u7EBF\u65F6\u957F\u6570\u636E\uFF08\u63D2\u4EF6\u9700\u91CD\u542F\u4EE5\u52A0\u8F7D\u65B0\u7248 Host \u534A\uFF09\u3002" : "\u7EDF\u8BA1\u5C1A\u672A\u5C31\u7EEA\uFF0C\u6B63\u5728\u626B\u63CF\u4F1A\u8BDD\u65E5\u5FD7\u2026"
          ),
          h(
            "div",
            { className: "tm-toolbar", style: { marginTop: 8 } },
            h("button", { type: "button", className: "tm-mini", onClick: props.onReload }, "\u91CD\u8BD5")
          )
        );
      }
      const view = deriveOnlineView(online, props.gap, props.rangeDays);
      const gapSeg = h(Seg, {
        items: GAP_LABELS.filter(([v]) => online.gaps.indexOf(v) >= 0),
        value: online.gaps.indexOf(props.gap) >= 0 ? props.gap : online.gaps[0],
        onPick: props.onGap
      });
      const segRow = (label, hint, control, rows) => h(
        "div",
        { className: "tm-segField" },
        h(
          "div",
          Object.assign(
            { className: "tm-segFieldKey" },
            tip.bind({ k: label, title: label, text: hint, ...rows ? { rows } : {} })
          ),
          label
        ),
        h("div", { className: "tm-segFieldCtl" }, control),
        h("div", { className: "tm-segFieldHint" }, hint)
      );
      return h(
        "div",
        null,
        h(TipHost, null),
        h(
          "div",
          { className: "tm-card", style: { padding: "10px 12px" } },
          segRow(
            "\u7A7A\u95F2\u9608\u503C",
            "\u76F8\u90BB\u4E8B\u4EF6\u95F4\u9694\u8D85\u8FC7\u5B83\u5C31\u7B97\u300C\u79BB\u5F00\u300D\u3002\u5B83\u662F\u53E3\u5F84\u4E0D\u662F\u7CBE\u5EA6\uFF1A\u8C03\u5927\u5728\u7EBF\u65F6\u957F\u53D8\u591A\uFF0860 \u5206\u949F\u6863\u6BD4 1 \u5206\u949F\u6863\u591A\u7EA6 90h\uFF09\u3002",
            gapSeg,
            [
              ["\u5F53\u524D", props.gap + " \u5206\u949F"],
              ["\u6D3B\u8DC3\u6BB5\u6570", String(view.segments)]
            ]
          ),
          segRow(
            "\u65F6\u95F4\u8303\u56F4",
            "\u300C\u6BCF\u65E5\u5728\u7EBF\u300D\u56FE\u8868\u4E0E\u4E0B\u65B9\u300C\u5728\u7EBF\u6700\u591A\u7684\u65E5\u5B50\u300D\u660E\u7EC6\u7684\u7EDF\u8BA1\u7A97\u53E3\uFF1B\u4E0A\u9762\u7684\u7D2F\u8BA1/\u65E5\u5747\u59CB\u7EC8\u6309\u5168\u90E8\u6D3B\u8DC3\u65E5\u8BA1\u7B97\u3002",
            h(Seg, { items: RANGE_LABELS, value: props.rangeDays, onPick: props.onRange }),
            [["\u5F53\u524D\u533A\u95F4", props.rangeDays === 0 ? "\u5168\u90E8\u6D3B\u8DC3\u65E5" : "\u8FD1 " + props.rangeDays + " \u5929"]]
          ),
          h(
            "div",
            { className: "tm-toolbar", style: { margin: "2px 0 0" } },
            h("span", { className: "tm-hint" }, online.activeDays + " \u4E2A\u6D3B\u8DC3\u65E5 \xB7 \u9ED8\u8BA4\u6309\u5168\u90E8\u663E\u793A")
          )
        ),
        h(
          "div",
          { className: "tm-statGrid" },
          h(Stat, {
            label: "\u4ECA\u65E5\u5728\u7EBF",
            value: fmtDurCn(view.today),
            tint: true,
            sub: "\u622A\u81F3\u6B64\u523B",
            acc: "bound",
            tip: {
              k: "today",
              title: "\u4ECA\u65E5\u5728\u7EBF \xB7 \u4E0B\u754C",
              text: "\u6709\u4E8B\u4EF6\u8986\u76D6\u3001\u4E14\u7A7A\u6863 \u2264 " + view.gap + " \u5206\u949F\u7684\u65F6\u95F4\u3002\u65E5\u5FD7\u53EA\u5728\u6709\u4E8B\u4EF6\u65F6\u6253\u70B9\uFF0C\u6240\u4EE5\u662F\u4E0B\u754C\u3002"
            }
          }),
          h(Stat, {
            label: "\u7D2F\u8BA1\u5728\u7EBF",
            value: fmtDurCn(view.total),
            sub: (online.firstDay ? dispDay(online.firstDay) + " \u8D77" : "") + " \xB7 \u5171 " + view.activeDays + " \u4E2A\u6D3B\u8DC3\u65E5",
            acc: "bound",
            tip: {
              k: "total",
              title: "\u7D2F\u8BA1\u5728\u7EBF \xB7 \u4E0B\u754C",
              rows: [
                ["\u6D3B\u8DC3\u65E5", String(view.activeDays)],
                ["\u65E5\u5747", fmtDur(view.avg)],
                ["\u5F53\u524D\u53E3\u5F84", view.gap + " \u5206\u949F"]
              ],
              text: "\u53E3\u5F84\u4F9D\u8D56\u9608\u503C\uFF1A60 \u5206\u949F\u6863\u6BD4 1 \u5206\u949F\u6863\u7EA6\u591A 90 \u5C0F\u65F6\u3002"
            }
          }),
          h(Stat, {
            label: "\u6D3B\u8DC3\u65E5\u5747",
            value: fmtDurCn(view.avg),
            sub: "\u4EC5\u6309\u6709\u6D3B\u52A8\u7684\u65E5\u5B50\u5E73\u5747",
            tip: {
              k: "avg",
              title: "\u6D3B\u8DC3\u65E5\u5747",
              rows: [
                ["\u7D2F\u8BA1", fmtDur(view.total)],
                ["\u6D3B\u8DC3\u65E5", String(view.activeDays)]
              ],
              text: "\u53EA\u6309\u6709\u6D3B\u52A8\u7684\u65E5\u5B50\u5E73\u5747\uFF0C\u4E0D\u542B\u7A7A\u767D\u5929\u3002"
            }
          }),
          h(Stat, {
            label: "\u5BF9\u8BDD\u8FDB\u884C\u4E2D",
            value: fmtDurCn(view.turn),
            sub: "\u5360\u5728\u7EBF " + (view.total > 0 ? Math.round(view.turn / view.total * 100) : 0) + "%",
            acc: "estimate",
            tip: {
              k: "turn",
              title: "\u5BF9\u8BDD\u8FDB\u884C\u4E2D \xB7 \u4F30\u7B97",
              rows: [
                ["\u65F6\u957F", fmtDur(view.turn)],
                ["\u5360\u5728\u7EBF", (view.total > 0 ? Math.round(view.turn / view.total * 100) : 0) + "%"]
              ],
              text: "turn/start\u2192turn/end \u7684\u5E76\u96C6\uFF08\u5899\u949F\u53BB\u91CD\uFF09\uFF1ADSH \u5728\u4E3A\u4F60\u5E72\u6D3B\u7684\u949F\uFF0C\u542B\u5C11\u91CF\u7B49\u4F60\u64CD\u4F5C\u7684\u65F6\u95F4\u3002"
            }
          })
        ),
        h(
          "div",
          { className: "tm-statGrid" },
          h(Stat, {
            label: "\u6A21\u578B\u751F\u6210",
            value: fmtDurCn(view.llm),
            sub: "\u5DF2\u4E0E\u5B98\u65B9\u6295\u5F71\u5BF9\u8D26",
            acc: "exact",
            tip: {
              k: "llm",
              title: "\u6A21\u578B\u751F\u6210 \xB7 \u7CBE\u786E",
              text: "step/start\u2192assistant/message\uFF1B\u5DF2\u4E0E DSH \u81EA\u5E26 sessionStats \u6295\u5F71\u9010\u4F1A\u8BDD\u5BF9\u8D26\uFF08126/126 \u4E00\u81F4\uFF09\u3002"
            }
          }),
          h(Stat, {
            label: "\u5DE5\u5177\u6267\u884C",
            value: fmtDurCn(view.tool),
            sub: "call\u2192result",
            acc: "exact",
            tip: {
              k: "tool",
              title: "\u5DE5\u5177\u6267\u884C \xB7 \u7CBE\u786E",
              text: "tool/call\u2192tool/result \u6309 callId \u914D\u5BF9\uFF1Bturn/end \u65F6\u4E22\u5F03\u672A\u843D\u5730\u7684\u8C03\u7528\u3002"
            }
          }),
          h(Stat, {
            label: "\u5F15\u64CE\u5408\u8BA1",
            value: fmtDurCn(view.busy),
            sub: "\u5E76\u884C\u76F8\u52A0\uFF0C\u53EF\u9AD8\u4E8E\u5899\u949F",
            acc: "exact",
            tip: {
              k: "busy",
              title: "\u5F15\u64CE\u5408\u8BA1 \xB7 \u7CBE\u786E",
              rows: [
                ["\u6A21\u578B\u751F\u6210", fmtDur(view.llm)],
                ["\u5DE5\u5177\u6267\u884C", fmtDur(view.tool)]
              ],
              text: "\u4E24\u8005\u76F8\u52A0\uFF1B\u540C\u65F6\u5F00\u591A\u4E2A\u4F1A\u8BDD/\u5B50\u4EE3\u7406\u4F1A\u91CD\u590D\u8BA1\uFF0C\u6240\u4EE5\u53EF\u80FD\u5927\u4E8E\u5899\u949F\u7684\u300C\u5BF9\u8BDD\u8FDB\u884C\u4E2D\u300D\u3002"
            }
          })
        ),
        h(
          "div",
          { className: "tm-card" },
          h(
            "div",
            { className: "tm-toolbar" },
            h("span", { className: "tm-title" }, "\u6BCF\u65E5\u5728\u7EBF"),
            h(
              "span",
              { className: "tm-hint" },
              view.peak ? "\u5CF0\u503C " + cnDate(view.peak.d) + " " + fmtDur(view.peak.ms) : ""
            )
          ),
          h(Chart, { items: view.series, gap: view.gap }),
          h(Legend, null)
        ),
        h(Accuracy, { view, snap: data }),
        h(
          "div",
          { className: "tm-card" },
          h(
            "div",
            { className: "tm-toolbar", style: { margin: "0 0 2px" } },
            h("span", { className: "tm-title", style: { margin: 0 } }, "\u6BCF\u65E5\u5728\u7EBF\u6392\u884C"),
            h(
              "span",
              { className: "tm-hint" },
              "\u5F53\u524D\u533A\u95F4 " + view.ranked.length + " \u4E2A\u6D3B\u8DC3\u65E5 \xB7 \u6309\u5728\u7EBF\u65F6\u957F\u6392\u5E8F \xB7 \u9F20\u6807\u60AC\u6D6E\u770B\u5F53\u65E5\u660E\u7EC6"
            )
          ),
          h(RankingList, { ranked: view.ranked, gap: view.gap })
        )
      );
    }
    function OnlineRightPane() {
      const [gapState, setGapState] = React.useState(null);
      const [rangeDays, setRangeDays] = React.useState(0);
      const { snap, err, reload } = useSnapshot();
      const online = snap && snap.ready && snap.online ? snap.online : null;
      const gap = gapState !== null ? gapState : online ? online.defaultGapMin : 5;
      const onGap = React.useCallback(
        (g) => {
          setGapState(g);
          void saveConfig({ onlineGapMin: g }).catch(() => {
          });
          try {
            window.dispatchEvent(new Event("tm-prefs-changed"));
          } catch {
          }
        },
        [setGapState]
      );
      return h(Body, {
        data: snap,
        err,
        gap,
        rangeDays,
        onGap,
        onRange: setRangeDays,
        onReload: reload
      });
    }
    return { OnlineRightPane };
  }

  // src/client/ErrorBox.ts
  var ICONS = {
    auth: "\u{1F511}",
    session: "\u23F3",
    plan: "\u{1F4C5}",
    balance: "\u{1F4B0}",
    rate: "\u{1F422}",
    network: "\u{1F310}",
    parse: "\u{1F9E9}",
    config: "\u2699\uFE0F",
    server: "\u{1F6E0}\uFE0F",
    unknown: "\u26A0\uFE0F"
  };
  var FALLBACK_RULES = [
    [/未配置|凭据未配置|必填|参数非法|workspaceId 非法/, "config"],
    [/会话失效|会话已过期|登录失效|登录态|被风控|logged out/i, "session"],
    [/密钥无效|密钥已失效|密钥引用.*为空|Invalid 'Authorization'|401|403/i, "auth"],
    [/upgrade_required|订阅.*(到期|结束|失败|取消)|计划.*(不含|不支持)/, "plan"],
    [/余额不足|insufficient|402/, "balance"],
    [/限流|429|rate.?limit/i, "rate"],
    [/fetch failed|ENOTFOUND|ECONNREFUSED|ETIMEDOUT|network|超时|timeout/i, "network"],
    [/非 JSON|结构异常|字段缺失|解析失败|改版|未命中/, "parse"],
    [/\b5\d\d\b/, "server"]
  ];
  var FALLBACK_TITLES = {
    auth: "\u5BC6\u94A5\u65E0\u6548\u6216\u5DF2\u5931\u6548",
    session: "\u767B\u5F55\u72B6\u6001\u5DF2\u8FC7\u671F",
    plan: "\u8BA2\u9605\u5DF2\u5230\u671F\u6216\u8BA1\u5212\u4E0D\u652F\u6301",
    balance: "\u4F59\u989D\u4E0D\u8DB3",
    rate: "\u8BF7\u6C42\u8FC7\u4E8E\u9891\u7E41\uFF08\u88AB\u9650\u6D41\uFF09",
    network: "\u7F51\u7EDC\u4E0D\u53EF\u8FBE",
    parse: "\u63A5\u53E3\u8FD4\u56DE\u7ED3\u6784\u5F02\u5E38",
    config: "\u4F9B\u5E94\u5546\u914D\u7F6E\u4E0D\u5B8C\u6574",
    server: "\u4E0A\u6E38\u670D\u52A1\u5F02\u5E38",
    unknown: "\u62C9\u53D6\u5931\u8D25"
  };
  function fallbackErrorInfo(message) {
    const msg = String(message || "\u62C9\u53D6\u5931\u8D25");
    let kind = "unknown";
    for (const [re, k] of FALLBACK_RULES) {
      if (re.test(msg)) {
        kind = k;
        break;
      }
    }
    const tone = kind === "auth" || kind === "session" || kind === "plan" || kind === "balance" ? "bad" : "warn";
    return {
      kind,
      title: FALLBACK_TITLES[kind],
      hint: "\u672C\u6B21\u62C9\u53D6\u6CA1\u6709\u6210\u529F\uFF0C\u5C55\u5F00\u53EF\u89C1\u539F\u59CB\u4FE1\u606F\u3002",
      action: "\u70B9\u300C\u5237\u65B0\u300D\u91CD\u8BD5\uFF1B\u82E5\u6301\u7EED\u5931\u8D25\u8BF7\u628A\u8BE6\u60C5\u53CD\u9988\u7ED9\u7EF4\u62A4\u8005",
      steps: ["\u70B9\u300C\u5237\u65B0\u300D\u91CD\u8BD5\u4E00\u6B21", "\u82E5\u6301\u7EED\u5931\u8D25\uFF0C\u628A\u300C\u539F\u59CB\u4FE1\u606F\u300D\u53CD\u9988\u7ED9\u63D2\u4EF6\u7EF4\u62A4\u8005"],
      detail: msg,
      retriable: true,
      tone
    };
  }
  function createErrorBox(React, deps) {
    const h = React.createElement;
    const useState = React.useState;
    function copy(text, done) {
      try {
        const nav = typeof navigator !== "undefined" ? navigator : null;
        if (nav && nav.clipboard && typeof nav.clipboard.writeText === "function") {
          void nav.clipboard.writeText(text).then(
            () => done(true),
            () => done(false)
          );
          return;
        }
      } catch {
      }
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand && document.execCommand("copy");
        document.body.removeChild(ta);
        done(!!ok);
      } catch {
        done(false);
      }
    }
    return function ErrorBox(props) {
      const raw = props.info || null;
      const info = raw || fallbackErrorInfo(props.msg || "\u62C9\u53D6\u5931\u8D25");
      const open = deps.isOpen();
      const [copied, setCopied] = useState("");
      const tone = info.tone || "warn";
      const steps = Array.isArray(info.steps) ? info.steps.slice(0, 6) : [];
      const detailText = info.detail + (props.meta ? "\n" + props.meta : "") + (info.status ? "\nHTTP " + info.status : "") + (info.docs ? "\n\u6587\u6863\uFF1A" + info.docs : "");
      const icon = ICONS[info.kind] || ICONS.unknown;
      const head = h(
        "button",
        {
          key: "h",
          type: "button",
          className: "tm-errhead",
          title: open ? "\u6536\u8D77\u8BE6\u60C5" : "\u5C55\u5F00\u6392\u67E5\u8BE6\u60C5",
          "aria-expanded": open,
          onClick: () => deps.toggle()
        },
        h("span", { key: "i", className: "tm-erricon tm-erricon-" + tone }, icon),
        h(
          "span",
          { key: "t", className: "tm-errtitlewrap" },
          h("span", { key: "a", className: "tm-errtitle" }, info.title),
          h("span", { key: "b", className: "tm-errhint" }, info.hint)
        ),
        h("span", { key: "c", className: "tm-vcaret" }, open ? "\u25B4" : "\u25BE")
      );
      const actionRow = h(
        "div",
        { key: "a", className: "tm-erraction" },
        info.action ? h("span", { key: "p", className: "tm-erractionText" }, "\u2192 " + info.action) : null,
        h(
          "span",
          { key: "btns", className: "tm-errabtns" },
          props.onRetry && info.retriable ? h(
            "button",
            {
              key: "retry",
              type: "button",
              className: "tm-mini",
              title: "\u7ACB\u5373\u91CD\u65B0\u62C9\u53D6\u4E00\u6B21",
              onClick: () => props.onRetry && props.onRetry()
            },
            "\u21BB \u91CD\u8BD5"
          ) : props.onRetry && !info.retriable ? h(
            "button",
            {
              key: "recheck",
              type: "button",
              className: "tm-mini",
              title: "\u6309\u4E0A\u9762\u6B65\u9AA4\u5904\u7406\u5B8C\u540E\uFF0C\u70B9\u8FD9\u91CC\u7ACB\u5373\u9A8C\u8BC1\u4E00\u6B21",
              onClick: () => props.onRetry && props.onRetry()
            },
            "\u2713 \u5DF2\u5904\u7406\uFF0C\u9A8C\u8BC1"
          ) : null,
          deps.openSettings ? h(
            "button",
            {
              key: "settings",
              type: "button",
              className: "tm-mini",
              title: "\u524D\u5F80\u8BBE\u7F6E\u9875\u4FEE\u6539\u8BE5\u4F9B\u5E94\u5546\u914D\u7F6E",
              onClick: () => deps.openSettings && deps.openSettings()
            },
            "\u8BBE\u7F6E\u9875"
          ) : null
        )
      );
      const body = open ? h(
        "div",
        { key: "d", className: "tm-errdetail" },
        steps.length ? h(
          "div",
          { key: "steps" },
          h("div", { className: "tm-errsub" }, "\u6392\u67E5\u6B65\u9AA4"),
          h(
            "ol",
            { className: "tm-errsteps" },
            steps.map((s, i) => h("li", { key: "s" + i }, s))
          )
        ) : null,
        h(
          "div",
          { key: "raw" },
          h("div", { className: "tm-errsub" }, "\u539F\u59CB\u4FE1\u606F"),
          h("pre", { className: "tm-errraw" }, detailText)
        ),
        h(
          "div",
          { key: "acts", className: "tm-errdactions" },
          h(
            "button",
            {
              type: "button",
              className: "tm-mini",
              onClick: () => copy(detailText, (ok) => {
                setCopied(ok ? "\u5DF2\u590D\u5236" : "\u590D\u5236\u5931\u8D25");
                window.setTimeout(() => setCopied(""), 1600);
              })
            },
            copied || "\u590D\u5236\u8BE6\u60C5"
          ),
          info.docs ? h(
            "a",
            {
              className: "tm-mini",
              href: info.docs,
              target: "_blank",
              rel: "noreferrer noopener"
            },
            "\u5B98\u65B9\u6587\u6863"
          ) : null,
          props.meta ? h("span", { className: "tm-errmeta" }, props.meta) : null
        )
      ) : null;
      return h(
        "div",
        { className: "tm-errbox tm-errbox-" + tone + (props.compact ? " tm-errbox-compact" : "") },
        head,
        actionRow,
        body
      );
    };
  }

  // src/client/providers/kit.ts
  var X_PAL = ["#4c7ef3", "#2fb261", "#f5a623", "#e05e4e", "#9a6ef1", "#25b8c4"];
  function createProviderKit(React, deps) {
    const h = React.createElement;
    const { num: num2, fmt: fmt3, fmtLeft: fmtLeft2, curSymbol, remainOf, timeAgo: timeAgo2, levelOf: levelOf2, levelTip: levelTip2 } = deps;
    function SectionTitle(props) {
      return props.text ? h("div", { className: "tm-xtitle" }, props.text) : null;
    }
    function statusText(st) {
      const k = st.toLowerCase().replace(/[\s_-]/g, "");
      const MAP = {
        ratelimited: "\u5DF2\u9650\u6D41",
        throttled: "\u5DF2\u9650\u6D41",
        exceeded: "\u5DF2\u8D85\u9650",
        overlimit: "\u5DF2\u8D85\u9650",
        disabled: "\u5DF2\u505C\u7528",
        paused: "\u5DF2\u6682\u505C",
        expired: "\u5DF2\u8FC7\u671F"
      };
      return MAP[k] || st;
    }
    function RollingBar(props) {
      const pct = Number(props.pct) || 0;
      const lvl = levelOf2(pct);
      const cls = lvl === "ok" ? "" : " " + lvl;
      const bad = props.status && props.status !== "ok" ? props.status : "";
      const barTitle = levelTip2(lvl) + "\uFF08" + Math.round(pct) + "%\uFF09" + (bad ? " \xB7 \u4E0A\u6E38\u72B6\u6001\uFF1A" + bad : "");
      return h(
        "div",
        { className: "tm-qrow", key: props.barKey },
        h("span", { className: "tm-qlabel" }, props.label),
        h(
          "div",
          { className: "tm-qbar", title: barTitle },
          h("span", { className: "tm-qfill" + cls, style: { width: Math.min(100, pct) + "%" } })
        ),
        h("span", { className: "tm-qpct" + cls }, Math.round(pct) + "%"),
        bad ? h("span", { className: "tm-qstatus", title: "\u4E0A\u6E38\u7A97\u53E3\u72B6\u6001\uFF1A" + bad }, statusText(bad)) : null,
        props.left ? h("span", { className: "tm-qleft" }, props.left) : null
      );
    }
    function WindowGroup(props) {
      const wins = (Array.isArray(props.windows) ? props.windows : []).filter(
        (w) => w && w.label !== void 0
      );
      if (!wins.length) return null;
      const kids = [];
      if (props.title) kids.push(h(SectionTitle, { key: "t", text: props.title }));
      wins.forEach((w, i) => {
        const left = w.resetInSec > 0 ? fmtLeft2(remainOf(w, props.snap, props.now)) : void 0;
        kids.push(
          h(RollingBar, {
            key: w.key || "w" + i,
            label: w.label,
            pct: w.pct,
            ...left ? { left } : {},
            ...w.status ? { status: w.status } : {}
          })
        );
      });
      if (wins.length > 1 && !props.noSummary) {
        const worst = wins.reduce((m, w) => w.pct > m.pct ? w : m, wins[0]);
        const minRem = wins.reduce((m, w) => Math.min(m, remainOf(w, props.snap, props.now)), Infinity);
        kids.push(
          h(
            "div",
            { key: "sum", className: "tm-payg-sub" },
            "\u6700\u9AD8\u5360\u7528 " + worst.label + " " + Math.round(worst.pct) + "% \xB7 \u6700\u65E9\u91CD\u7F6E" + fmtLeft2(minRem)
          )
        );
      }
      return h("div", { className: "tm-body" }, kids);
    }
    function BalanceBlock(props) {
      const b = props.billing || {};
      if (!Object.keys(b).length) return null;
      const amt = num2(b["balance"], 0);
      const cur = String(b["currency"] || "CNY");
      const granted = b["granted"] !== void 0 && b["granted"] !== null ? num2(b["granted"], 0) : null;
      const topped = b["toppedUp"] !== void 0 && b["toppedUp"] !== null ? num2(b["toppedUp"], 0) : null;
      const avail = b["isAvailable"];
      const availCls = avail === true ? "ok" : avail === false ? "bad" : "unknown";
      const availTxt = avail === true ? "\u53EF\u7528" : avail === false ? "\u4E0D\u8DB3" : "\u72B6\u6001\u672A\u77E5";
      const warnLine = b["lowWarn"] !== void 0 && b["lowWarn"] !== null && b["lowWarn"] !== "" ? num2(b["lowWarn"], 0) : null;
      const infos = Array.isArray(b["infos"]) ? b["infos"] : [];
      const kids = [];
      if (props.title) kids.push(h(SectionTitle, { key: "t", text: props.title }));
      kids.push(
        h(
          "div",
          { key: "top", className: "tm-payg-top" },
          h(
            "div",
            null,
            h("span", { className: "tm-payg-cur" }, curSymbol(cur) + cur),
            h("span", { className: "tm-payg-amt" + (amt < 0 ? " neg" : "") }, fmt3(amt))
          ),
          h("span", { className: "tm-avail " + availCls }, availTxt)
        )
      );
      const parts = [];
      if (granted !== null && granted > 0) parts.push("\u8D60\u9001 " + fmt3(granted));
      if (topped !== null && topped > 0) parts.push("\u5145\u503C " + fmt3(topped));
      if (warnLine !== null) parts.push("\u9884\u8B66\u7EBF " + fmt3(warnLine));
      if (parts.length) kids.push(h("div", { key: "parts", className: "tm-payg-sub" }, parts.join(" \xB7 ")));
      if (infos.length > 1)
        kids.push(
          h(
            "div",
            { key: "infos", className: "tm-infos" },
            infos.map(
              (x, i) => h(
                "div",
                { key: String(x["currency"] || i), className: "tm-inforow" },
                h("span", null, String(x["currency"] || "?")),
                h("b", null, fmt3(x["total"]))
              )
            )
          )
        );
      const empty = amt <= 0 || avail === false;
      const low = !empty && warnLine !== null && amt <= warnLine;
      if (empty)
        kids.push(
          h("div", { key: "warn", className: "tm-warn bad" }, "\u4F59\u989D\u4E0D\u8DB3\uFF0CAPI \u8C03\u7528\u53EF\u80FD\u88AB\u62D2\u7EDD\uFF0C\u8BF7\u53CA\u65F6\u5145\u503C\u3002")
        );
      else if (low)
        kids.push(
          h(
            "div",
            { key: "warn", className: "tm-warn" },
            "\u4F59\u989D\u4F4E\u4E8E\u9884\u8B66\u7EBF " + fmt3(warnLine) + "\uFF0C\u5EFA\u8BAE\u53CA\u65F6\u5145\u503C\u3002"
          )
        );
      return h("div", { className: "tm-payg" + (props.compact ? " tm-payg-compact" : "") }, kids);
    }
    function MetricRows(props) {
      const items = (Array.isArray(props.items) ? props.items : []).filter((it) => it && it.label);
      if (!items.length) return null;
      return h(
        "div",
        { className: "tm-xstats" },
        props.title ? h(SectionTitle, { key: "t", text: props.title }) : null,
        items.map(
          (it, i) => h(
            "div",
            { key: "r" + i, className: "tm-xrow" },
            h("span", null, String(it.label)),
            h("b", null, String(it.value))
          )
        )
      );
    }
    function MetricGrid(props) {
      const items = (Array.isArray(props.items) ? props.items : []).filter((it) => it && it.label);
      if (!items.length) return null;
      const cells = [];
      if (props.mergePairs) {
        for (let i = 0; i < items.length; i += 2) {
          const a = items[i];
          const b = items[i + 1];
          if (b) cells.push({ label: a.label + " / " + b.label, value: a.value + " \xB7 " + b.value });
          else cells.push(a);
        }
      } else {
        for (const it of items) cells.push(it);
      }
      return h(
        "div",
        { className: "tm-xgrid" },
        props.title ? h(SectionTitle, { key: "t", text: props.title }) : null,
        h(
          "div",
          { key: "g", className: "tm-xgridBody" },
          cells.map(
            (c, i) => h(
              "div",
              { key: "c" + i, className: "tm-xcell", title: c.label + "\uFF1A" + c.value },
              h("span", { className: "tm-xcellLabel" }, c.label),
              h("b", { className: "tm-xcellValue" }, c.value)
            )
          )
        )
      );
    }
    function SplitBar(props) {
      const segs = (Array.isArray(props.segments) ? props.segments : []).filter((sg) => sg && isFinite(Number(sg.value)) && Number(sg.value) > 0).slice(0, 8);
      if (!segs.length) return null;
      const sum = segs.reduce((acc, x) => acc + Number(x.value), 0);
      const color = (i) => segs[i]?.color || X_PAL[i % X_PAL.length];
      return h(
        "div",
        null,
        props.title ? h(SectionTitle, { key: "t", text: props.title }) : null,
        h(
          "div",
          { className: "tm-xsplit" },
          segs.map(
            (sg, i) => h("span", { key: "g" + i, style: { flexGrow: Number(sg.value), background: color(i) } })
          )
        ),
        h(
          "div",
          { className: "tm-xstats" },
          segs.map(
            (sg, i) => h(
              "div",
              { key: "l" + i, className: "tm-xrow" },
              h(
                "span",
                null,
                h("span", { className: "tm-xdot", style: { background: color(i) } }),
                String(sg.label || "")
              ),
              h("b", null, String(Math.round(Number(sg.value) * 100 / sum)) + "%")
            )
          )
        )
      );
    }
    function NoteLine(props) {
      const t = typeof props.text === "string" ? props.text : "";
      if (!t) return null;
      const tone = props.tone === "bad" ? "tm-warn bad" : props.tone === "warn" ? "tm-warn" : "tm-payg-sub";
      return h("div", { className: tone }, t);
    }
    function MiniChart(props) {
      const ch = props.chart;
      const vals = (ch && Array.isArray(ch.values) ? ch.values : []).map((v) => isFinite(Number(v)) ? Number(v) : 0).slice(-60);
      if (vals.length < 2) return null;
      const W = 248;
      const Hh = 52;
      const Pd = 3;
      const max = Math.max.apply(null, vals.concat([1]));
      const step = vals.length > 1 ? (W - Pd * 2) / (vals.length - 1) : 0;
      const pts = vals.map((v, i) => [Pd + step * i, Hh - Pd - v / max * (Hh - Pd * 2)]);
      const line = pts.map((p) => p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" ");
      const area = Pd + "," + (Hh - Pd) + " " + line + " " + (W - Pd) + "," + (Hh - Pd);
      return h(
        "div",
        { className: "tm-xchart" },
        ch && ch.title ? h("div", { className: "tm-xtitle" }, String(ch.title)) : null,
        h(
          "svg",
          {
            viewBox: "0 0 " + W + " " + Hh,
            preserveAspectRatio: "none",
            style: { display: "block", width: "100%", height: Hh + "px" }
          },
          h("polygon", {
            points: area,
            style: { fill: "var(--dsw-alias-state-business-primary)", opacity: 0.15 }
          }),
          h("polyline", {
            points: line,
            fill: "none",
            style: {
              stroke: "var(--dsw-alias-state-business-primary)",
              strokeWidth: 1.6,
              strokeLinecap: "round",
              strokeLinejoin: "round"
            }
          })
        )
      );
    }
    function Chips(props) {
      const chips = (Array.isArray(props.chips) ? props.chips : []).filter((c) => c && c.text);
      if (!chips.length) return null;
      return h(
        "div",
        { className: "tm-vchips" },
        chips.map(
          (c, i) => h("span", { key: i, className: "tm-vchip" + (c.tone ? " tm-vchip-" + c.tone : "") }, c.text)
        )
      );
    }
    const ErrorCard = createErrorBox(React, {
      isOpen: deps.errOpen,
      toggle: deps.toggleErr,
      ...deps.openSettings ? { openSettings: deps.openSettings } : {}
    });
    return {
      h,
      React,
      RollingBar,
      WindowGroup,
      BalanceBlock,
      MetricRows,
      MetricGrid,
      SplitBar,
      NoteLine,
      MiniChart,
      SectionTitle,
      Chips,
      ErrorCard,
      num: num2,
      fmt: fmt3,
      fmtLeft: fmtLeft2,
      curSymbol,
      remainOf,
      timeAgo: timeAgo2,
      levelOf: levelOf2
    };
  }

  // src/client/providers/sections.ts
  function createSectionRenderer(K) {
    const h = K.h;
    function renderSection(s, ctx, i) {
      if (!s || typeof s !== "object") return null;
      const key = "sec:" + (s.key || s.kind) + ":" + i;
      switch (s.kind) {
        case "windows":
          return h(K.WindowGroup, { key, windows: s.windows, snap: ctx.snap, now: ctx.now, title: s.title });
        case "balance":
          return h(K.BalanceBlock, { key, billing: s.billing, title: s.title });
        case "metrics":
          return h(K.MetricRows, { key, items: s.items, title: s.title });
        case "progress": {
          const p = s.progress;
          if (!p) return null;
          const total = Number(p.total);
          const used = Number(p.used);
          if (!isFinite(total) || total <= 0 || !isFinite(used)) return null;
          const pct = Math.min(100, Math.max(0, used / total * 100));
          const left = p.left !== void 0 && p.left !== "" ? String(p.left) : "\u5269\u4F59 " + (total - used);
          return h("div", { key, className: "tm-xprog" }, [
            h(K.SectionTitle, { key: "t", text: s.title }),
            h(K.RollingBar, {
              key: "bar",
              label: String(p.label || s.title || "\u989D\u5EA6"),
              pct,
              left
            })
          ]);
        }
        case "split":
          return h(K.SplitBar, { key, segments: s.split && s.split.segments, title: s.title });
        case "note":
          return h(K.NoteLine, { key, text: s.note && s.note.text, tone: s.note && s.note.tone });
        case "chart":
          return h(K.MiniChart, { key, chart: s.chart });
        default:
          return null;
      }
    }
    function renderSections(sections, ctx) {
      if (!Array.isArray(sections) || !sections.length) return null;
      const kids = sections.map((s, i) => renderSection(s, ctx, i)).filter((n) => n !== null && n !== void 0 && n !== false);
      if (!kids.length) return null;
      return h("div", { className: "tm-sections" }, kids);
    }
    return { renderSection, renderSections };
  }

  // src/client/providers/ui/commandcode.ts
  function commandcodeUI(ctx, K) {
    const h = K.h;
    const snap = ctx.snap;
    const b = snap.billing || {};
    const plan = b["plan"] ? String(b["plan"]) : "";
    const wins = Array.isArray(snap.windows) ? snap.windows : [];
    const notes = (snap.extra && Array.isArray(snap.extra.blocks) ? snap.extra.blocks : []).filter(
      (x) => x && x.kind === "note" && x.text
    );
    const alerts = notes.filter((n) => n.tone === "bad" || n.tone === "warn");
    const kids = [];
    const metrics = (snap.extra && Array.isArray(snap.extra.stats) ? snap.extra.stats : []).slice(0, 12);
    const planMetric = metrics.filter((m) => m && m.label === "\u8BA2\u9605\u8BA1\u5212")[0];
    const planStatus = planMetric ? String(planMetric.value).replace(/^[^（(]*[（(]/, "").replace(/[）)]\s*$/, "") : "";
    const restMetrics = metrics.filter((m) => m && m.label !== "\u8BA2\u9605\u8BA1\u5212");
    const chips = [];
    if (plan)
      chips.push({
        text: planStatus ? plan + " \xB7 " + planStatus : plan,
        tone: /active|生效/i.test(planStatus) ? "ok" : "info"
      });
    if (alerts.length) chips.push({ text: "\u9700\u5904\u7406", tone: "bad" });
    else if (wins.some((w) => Number(w.pct) >= 100)) chips.push({ text: "\u7A97\u53E3\u5DF2\u6EE1", tone: "bad" });
    if (chips.length) kids.push(h(K.Chips, { key: "chips", chips }));
    kids.push(h(K.BalanceBlock, { key: "bal", billing: b, compact: true }));
    if (wins.length)
      kids.push(
        h(K.WindowGroup, {
          key: "win",
          windows: wins,
          snap,
          now: ctx.now,
          title: "\u989D\u5EA6\u7A97\u53E3",
          noSummary: true
        })
      );
    const monthly = K.num(b["monthlyCredits"], 0);
    const purchased = K.num(b["purchasedCredits"], 0);
    const free = K.num(b["freeCredits"], 0);
    const segs = [
      { label: "\u6708\u5EA6\u989D\u5EA6", value: monthly, color: "#4c7ef3" },
      { label: "\u5145\u503C\u989D\u5EA6", value: purchased, color: "#2fb261" },
      { label: "\u8D60\u9001\u989D\u5EA6", value: free, color: "#f5a623" }
    ].filter((s) => s.value > 0);
    if (segs.length > 1) kids.push(h(K.SplitBar, { key: "split", segments: segs, title: "\u989D\u5EA6\u6784\u6210" }));
    const items = [];
    for (const it of restMetrics) items.push({ label: it.label, value: it.value });
    if (!items.length) {
      if (plan) items.push({ label: "\u8BA2\u9605\u8BA1\u5212", value: plan });
      if (b["periodEnd"]) items.push({ label: "\u5F53\u524D\u5468\u671F\u81F3", value: String(b["periodEnd"]) });
    }
    kids.push(h(K.MetricGrid, { key: "metrics", items, title: "\u8D26\u6237\u4E0E\u7528\u91CF", mergePairs: true }));
    for (let i = 0; i < alerts.length && i < 2; i++) {
      const n = alerts[i];
      kids.push(h(K.NoteLine, { key: "note" + i, text: n.text, tone: n.tone || "warn" }));
    }
    return h("div", { className: "tm-ui tm-ui-commandcode" }, kids);
  }

  // src/client/providers/ui/deepseek.ts
  function deepseekUI(ctx, K) {
    const h = K.h;
    const snap = ctx.snap;
    const b = snap.billing || {};
    const via = String(snap.via || "");
    const isWeb = via.indexOf("\u7F51\u9875") >= 0;
    const kids = [];
    const chips = [];
    if (via) chips.push({ text: isWeb ? "\u7F51\u9875\u8D26\u5355\u63A5\u53E3" : "\u5B98\u65B9\u4F59\u989D\u63A5\u53E3", tone: isWeb ? "info" : "ok" });
    if (snap.secretKind)
      chips.push({ text: "\u51ED\u636E " + K.curSymbol("") + String(snap.secretKind), tone: "info" });
    if (isWeb) chips.push({ text: "\u7968\u636E\u4F1A\u8FC7\u671F", tone: "warn" });
    if (chips.length) kids.push(h(K.Chips, { key: "chips", chips }));
    kids.push(h(K.BalanceBlock, { key: "bal", billing: b, title: "\u8D26\u6237\u4F59\u989D" }));
    const granted = b["granted"] !== void 0 && b["granted"] !== null ? K.num(b["granted"], 0) : null;
    const topped = b["toppedUp"] !== void 0 && b["toppedUp"] !== null ? K.num(b["toppedUp"], 0) : null;
    const totalQuota = (granted || 0) + (topped || 0);
    const balance = K.num(b["balance"], 0);
    if (totalQuota > 0) {
      const used = Math.max(0, totalQuota - balance);
      const segs = [
        { label: "\u8D60\u9001\u989D\u5EA6", value: granted || 0, color: "#4c7ef3" },
        { label: "\u5145\u503C\u989D\u5EA6", value: topped || 0, color: "#2fb261" }
      ].filter((s) => s.value > 0);
      if (segs.length > 1) kids.push(h(K.SplitBar, { key: "split", segments: segs, title: "\u989D\u5EA6\u6784\u6210" }));
      kids.push(
        h("div", { key: "prog", className: "tm-xprog" }, [
          h(K.SectionTitle, { key: "t", text: "\u603B\u989D\u5EA6\u6D88\u8017" }),
          h(K.RollingBar, {
            key: "bar",
            label: "\u603B\u989D\u5EA6",
            pct: totalQuota > 0 ? Math.min(100, used / totalQuota * 100) : 0,
            left: "\u5DF2\u7528 " + K.fmt(used) + " / \u5171 " + K.fmt(totalQuota)
          })
        ])
      );
    }
    const items = (snap.extra && Array.isArray(snap.extra.stats) ? snap.extra.stats : []).slice(0, 8);
    if (items.length) kids.push(h(K.MetricRows, { key: "metrics", items, title: "\u6D88\u8D39\u7EDF\u8BA1" }));
    const chart = snap.extra && snap.extra.chart ? snap.extra.chart : null;
    if (chart && Array.isArray(chart.values) && chart.values.length > 1) {
      kids.push(h(K.MiniChart, { key: "chart", chart }));
    } else if (!isWeb) {
      kids.push(
        h(K.NoteLine, {
          key: "nochart",
          text: "\u5B98\u65B9\u4F59\u989D\u63A5\u53E3\u4E0D\u63D0\u4F9B\u5386\u53F2\u8D8B\u52BF\uFF1B\u5982\u9700\u8D8B\u52BF\u56FE\uFF0C\u53EF\u5728\u300C\u7F16\u8F91\u300D\u91CC\u540C\u65F6\u586B\u5165\u7F51\u9875 token\uFF08\u4F1A\u8BDD\u7968\u636E\uFF09\uFF0C\u63D2\u4EF6\u4F1A\u81EA\u52A8\u6539\u7528\u7F51\u9875\u8D26\u5355\u63A5\u53E3\u3002",
          tone: "info"
        })
      );
    }
    if (isWeb) {
      kids.push(
        h(K.NoteLine, {
          key: "note",
          text: "\u5F53\u524D\u8D70\u7F51\u9875\u8D26\u5355\u63A5\u53E3\uFF08\u542B\u8D8B\u52BF\uFF09\uFF0C\u4F9D\u8D56\u767B\u5F55\u4F1A\u8BDD\u7968\u636E\uFF1B\u7968\u636E\u8FC7\u671F\u540E\u5361\u7247\u4F1A\u63D0\u793A\u91CD\u65B0\u6293\u53D6\u3002\u5B98\u65B9 sk- \u5BC6\u94A5\u957F\u671F\u6709\u6548\u4F46\u65E0\u8D8B\u52BF\u3002",
          tone: "info"
        })
      );
    }
    return h("div", { className: "tm-ui tm-ui-deepseek" }, kids);
  }

  // src/client/providers/ui/opencode.ts
  function opencodeUI(ctx, K) {
    const h = K.h;
    const snap = ctx.snap;
    const b = snap.billing || {};
    const plan = b["plan"] ? String(b["plan"]) : "";
    const wins = Array.isArray(snap.windows) ? snap.windows : [];
    const balance = b["balance"] !== void 0 && b["balance"] !== null ? K.num(b["balance"], 0) : null;
    const kids = [];
    const chips = [];
    if (plan) chips.push({ text: "\u8BA2\u9605 " + plan, tone: "info" });
    for (const w of wins) {
      const pct = Math.round(Number(w.pct) || 0);
      chips.push({ text: w.label + " " + pct + "%", tone: pct >= 90 ? "bad" : pct >= 70 ? "warn" : "ok" });
    }
    if (!wins.length && balance !== null) chips.push({ text: "\u6309\u91CF\u8BA1\u8D39", tone: "info" });
    if (chips.length) kids.push(h(K.Chips, { key: "chips", chips }));
    if (wins.length) {
      kids.push(h(K.WindowGroup, { key: "win", windows: wins, snap, now: ctx.now, title: "\u8BA2\u9605\u7A97\u53E3" }));
    }
    if (balance !== null && balance !== void 0) {
      const onlyBalance = !wins.length;
      kids.push(
        h(K.BalanceBlock, {
          key: "bal",
          billing: b,
          title: onlyBalance ? "\u8D26\u6237\u4F59\u989D" : "\u5145\u503C\u4F59\u989D"
        })
      );
    }
    const notes = (snap.extra && Array.isArray(snap.extra.blocks) ? snap.extra.blocks : []).filter(
      (x) => x && x.kind === "note" && x.text
    );
    if (notes.length) {
      kids.push(h(K.NoteLine, { key: "note", text: notes[0].text, tone: "info" }));
    } else if (wins.length) {
      const monthly = wins.filter((w) => w.key === "monthly")[0];
      if (monthly && monthly.resetInSec > 0) {
        kids.push(
          h(K.NoteLine, {
            key: "note",
            text: "\u8BA2\u9605\u7EA6 " + K.fmtLeft(monthly.resetInSec) + "\u540E\u91CD\u7F6E/\u5230\u671F\uFF08\u4EE5\u6BCF\u6708\u7A97\u53E3\u4E3A\u51C6\uFF09\u3002",
            tone: "info"
          })
        );
      }
    }
    return h("div", { className: "tm-ui tm-ui-opencode" }, kids);
  }

  // src/client/providers/ui/manual.ts
  function manualUI(ctx, K) {
    const h = K.h;
    const snap = ctx.snap;
    const b = snap.billing || {};
    const wins = Array.isArray(snap.windows) ? snap.windows : [];
    const kids = [];
    kids.push(h(K.Chips, { key: "chips", chips: [{ text: "\u672C\u5730\u624B\u586B", tone: "info" }] }));
    if (wins.length) {
      kids.push(h(K.WindowGroup, { key: "win", windows: wins, snap, now: ctx.now, title: "\u989D\u5EA6" }));
    }
    if (Object.keys(b).length) {
      const isPayg = !wins.length;
      kids.push(h(K.BalanceBlock, { key: "bal", billing: b, title: isPayg ? "\u5F53\u524D\u4F59\u989D" : void 0 }));
    }
    const items = [];
    const total = wins.length ? K.num(wins[0]?.limit, 0) : 0;
    const used = wins.length ? K.num(wins[0]?.used, 0) : 0;
    if (wins.length) {
      items.push({ label: "\u603B\u989D\u5EA6", value: K.fmt(total) });
      items.push({ label: "\u5DF2\u7528", value: K.fmt(used) });
      items.push({ label: "\u5269\u4F59", value: K.fmt(Math.max(0, total - used)) });
    }
    if (items.length) kids.push(h(K.MetricRows, { key: "metrics", items, title: "\u8D26\u672C\u660E\u7EC6" }));
    kids.push(
      h(K.NoteLine, {
        key: "note",
        text: "\u6570\u636E\u6765\u81EA\u672C\u5730\u624B\u586B\uFF08\u975E\u5E73\u53F0\u5B9E\u65F6\u63A5\u53E3\uFF09\uFF1A\u5728\u300C\u8BBE\u7F6E \u2192 Token \u8BA1\u91CF \u2192 \u7F16\u8F91\u300D\u91CC\u66F4\u65B0\uFF0C\u6539\u5B8C\u70B9\u300C\u5237\u65B0\u300D\u5373\u53EF\u3002",
        tone: "info"
      })
    );
    return h("div", { className: "tm-ui tm-ui-manual" }, kids);
  }

  // src/client/providers/ui/index.ts
  var UIS = /* @__PURE__ */ new Map();
  function registerProviderUI(type, ui) {
    if (typeof type === "string" && type && typeof ui === "function") UIS.set(type, ui);
  }
  function getProviderUI(type) {
    return UIS.get(type);
  }
  function hasProviderUI(type) {
    return UIS.has(type);
  }
  function providerUITypes() {
    return [...UIS.keys()];
  }
  registerProviderUI("commandcode", commandcodeUI);
  registerProviderUI("deepseek", deepseekUI);
  registerProviderUI("opencode", opencodeUI);
  registerProviderUI("manual", manualUI);

  // src/client/providers/registry.ts
  function legacySections(snap) {
    const out = [];
    if (snap.billingKind === "payg")
      out.push({ kind: "balance", key: "balance", title: "\u8D26\u6237\u4F59\u989D", billing: snap.billing || {} });
    else if (Array.isArray(snap.windows) && snap.windows.length)
      out.push({ kind: "windows", key: "windows", windows: snap.windows });
    const extra = snap.extra;
    if (extra) {
      const stats = Array.isArray(extra.stats) ? extra.stats.slice(0, 6) : [];
      if (stats.length) out.push({ kind: "metrics", key: "stats", items: stats });
      const blocks = Array.isArray(extra.blocks) ? extra.blocks.slice(0, 8) : [];
      for (let i = 0; i < blocks.length; i++) {
        const b = blocks[i];
        if (!b || typeof b !== "object") continue;
        if (b.kind === "kv" && b.label)
          out.push({
            kind: "metrics",
            key: "kv" + i,
            items: [{ label: String(b.label), value: String(b.value ?? "") }]
          });
        else if (b.kind === "progress" && isFinite(Number(b.used)) && Number(b.total) > 0) {
          const p = { used: Number(b.used), total: Number(b.total) };
          if (b.label) p.label = String(b.label);
          if (b.left !== void 0 && b.left !== null && b.left !== "") p.left = String(b.left);
          out.push({ kind: "progress", key: "pg" + i, progress: p });
        } else if (b.kind === "split" && Array.isArray(b.segments))
          out.push({ kind: "split", key: "sp" + i, split: { segments: b.segments } });
        else if (b.kind === "note" && b.text) {
          const n = { text: String(b.text) };
          if (b.tone) n.tone = b.tone;
          out.push({ kind: "note", key: "nt" + i, note: n });
        }
      }
      if (extra.chart && Array.isArray(extra.chart.values) && extra.chart.values.length > 1)
        out.push({ kind: "chart", key: "chart", chart: extra.chart });
    }
    return out;
  }
  function createProviderRenderers(React, K) {
    const { renderSections } = createSectionRenderer(K);
    function generic(ctx) {
      const sections = ctx.snap.view && Array.isArray(ctx.snap.view.sections) ? ctx.snap.view.sections : null;
      const rendered = sections ? renderSections(sections, ctx) : null;
      if (rendered) return rendered;
      return renderSections(legacySections(ctx.snap), ctx);
    }
    function renderBody(type, snap, now) {
      const ctx = { snap, now, type, vendorName: snap.vendorName || "" };
      const ui = getProviderUI(type);
      if (ui) {
        try {
          const out = ui(ctx, K);
          if (out !== null && out !== void 0) return out;
        } catch {
        }
      }
      return generic(ctx);
    }
    return {
      renderBody,
      hasBespoke: (type) => hasProviderUI(type),
      bespokeTypes: () => providerUITypes()
    };
  }

  // src/client/QuotaSection.ts
  var BASE2 = "/ext/dshp-token-meter";
  var ID_RE = /^[a-z0-9][a-z0-9-]{1,30}$/;
  function num(v, d) {
    const n = Number(v);
    return isFinite(n) ? n : d;
  }
  function fmt(n) {
    try {
      return Number(n).toLocaleString("zh-CN", { maximumFractionDigits: 2 });
    } catch {
      return String(n);
    }
  }
  function fmtLeft(sec) {
    sec = Math.max(0, Math.round(sec));
    if (sec >= 86400) return Math.floor(sec / 86400) + "\u5929\u540E";
    if (sec >= 3600) return Math.floor(sec / 3600) + "\u5C0F\u65F6\u540E";
    if (sec >= 60) return Math.floor(sec / 60) + "\u5206\u540E";
    return sec + "\u79D2\u540E";
  }
  function timeAgo(iso) {
    const t = Date.parse(iso);
    if (isNaN(t)) return "\u672A\u77E5";
    const s = Math.floor((Date.now() - t) / 1e3);
    if (s < 60) return s + " \u79D2\u524D";
    const m = Math.floor(s / 60);
    if (m < 60) return m + " \u5206\u949F\u524D";
    const hh = Math.floor(m / 60);
    if (hh < 24) return hh + " \u5C0F\u65F6\u524D";
    return Math.floor(hh / 24) + " \u5929\u524D";
  }
  var QUOTA_LEVEL = { warn: 70, bad: 90, over: 100 };
  function levelOf(pct) {
    if (pct >= QUOTA_LEVEL.over) return "over";
    if (pct >= QUOTA_LEVEL.bad) return "bad";
    if (pct >= QUOTA_LEVEL.warn) return "warn";
    return "ok";
  }
  function levelTip(lvl) {
    if (lvl === "over") return "\u989D\u5EA6\u5DF2\u7528\u5C3D\uFF08\u6216\u8D85\u51FA\uFF09\uFF0C\u53EF\u80FD\u88AB\u9650\u6D41/\u62D2\u7EDD";
    if (lvl === "bad") return "\u989D\u5EA6\u5FEB\u7528\u5B8C\u4E86\uFF0C\u6CE8\u610F\u540E\u7EED\u8C03\u7528";
    if (lvl === "warn") return "\u989D\u5EA6\u5360\u7528\u504F\u9AD8";
    return "\u989D\u5EA6\u5145\u8DB3";
  }
  var TYPE_LABEL_FALLBACK = {
    opencode: "OC",
    deepseek: "DS",
    commandcode: "CC",
    manual: "\u624B\u52A8"
  };
  var TYPE_TITLE_FALLBACK = [
    { type: "opencode", title: "opencode\uFF08Go+Zen \u5408\u5E76\uFF09" },
    { type: "deepseek", title: "deepseek\uFF08\u5B98\u65B9\xB7\u81EA\u52A8\u9009\u8DEF\uFF09" },
    { type: "commandcode", title: "commandcode\uFF08Command Code\uFF09" },
    { type: "manual", title: "manual\uFF08\u624B\u52A8\uFF09" }
  ];
  var FLOAT_LS_OPEN = "tm-quota-float";
  var FLOAT_LS_POS = "tm-quota-float-pos";
  var OLD_FLOAT_LS_OPEN = "tquota.float.open";
  var OLD_FLOAT_LS_POS = "tquota.float.pos";
  function loadFloatOpen() {
    try {
      if (window.localStorage.getItem(FLOAT_LS_OPEN) === "1") return true;
      if (window.localStorage.getItem(OLD_FLOAT_LS_OPEN) === "1") return true;
    } catch {
    }
    return false;
  }
  function loadFloatPos() {
    try {
      const raw = window.localStorage.getItem(FLOAT_LS_POS) || window.localStorage.getItem(OLD_FLOAT_LS_POS) || "null";
      const v = JSON.parse(raw);
      if (v && isFinite(v.x) && isFinite(v.y)) return { x: Number(v.x), y: Number(v.y) };
    } catch {
    }
    return null;
  }
  function saveFloat(open, pos) {
    try {
      window.localStorage.setItem(FLOAT_LS_OPEN, open ? "1" : "0");
      if (pos)
        window.localStorage.setItem(
          FLOAT_LS_POS,
          JSON.stringify({ x: Math.round(pos.x), y: Math.round(pos.y) })
        );
    } catch {
    }
  }
  function defaultFloatPos() {
    try {
      const vw = window.innerWidth || 1024, vh = window.innerHeight || 768;
      return { x: Math.max(8, vw - 320), y: Math.max(8, Math.min(120, vh - 320)) };
    } catch {
      return { x: 100, y: 100 };
    }
  }
  function clampFloatPos(p) {
    try {
      const vw = window.innerWidth || 1024, vh = window.innerHeight || 768;
      return { x: Math.max(8, Math.min(p.x, vw - 304)), y: Math.max(8, Math.min(p.y, vh - 140)) };
    } catch {
      return p;
    }
  }
  function createQuotaSection(React, P, ReactDOM, widgets) {
    const h = React.createElement;
    const useState = React.useState;
    const WG = widgets || null;
    function tmPortal(node) {
      if (node === null || node === void 0) return null;
      try {
        if (ReactDOM && typeof ReactDOM.createPortal === "function" && typeof document !== "undefined" && document.body) {
          return ReactDOM.createPortal(node, document.body);
        }
      } catch {
      }
      return node;
    }
    const store = {
      state: {
        cfg: null,
        snaps: {},
        loading: false,
        error: "",
        menuOpen: false,
        errOpen: false,
        menuAt: null,
        lastErr: null,
        namespace: "",
        docPath: "",
        providers: null,
        floatOpen: typeof window !== "undefined" ? loadFloatOpen() : false,
        floatPos: typeof window !== "undefined" ? loadFloatPos() : null
      },
      listeners: /* @__PURE__ */ new Set(),
      get() {
        return this.state;
      },
      subscribe(fn) {
        this.listeners.add(fn);
        return () => {
          this.listeners.delete(fn);
        };
      },
      set(patch) {
        this.state = Object.assign({}, this.state, patch);
        this.listeners.forEach((fn) => {
          try {
            fn();
          } catch {
          }
        });
      }
    };
    let loaded = false;
    async function call(method, args) {
      const MAP = {
        "quota.load": ["GET", "/state"],
        "quota.refresh": ["POST", "/refresh"],
        "quota.set-active": ["POST", "/set-active"],
        "quota.set-refresh": ["POST", "/set-refresh"],
        "quota.set-enabled": ["POST", "/set-enabled"],
        "quota.set-vendor-enabled": ["POST", "/set-vendor-enabled"],
        "quota.add-vendor": ["POST", "/add-vendor"],
        "quota.update-vendor": ["POST", "/update-vendor"],
        "quota.delete-vendor": ["POST", "/delete-vendor"],
        "quota.secret-to-cred": ["POST", "/secret-to-cred"],
        "config.save": ["POST", "/config"]
      };
      const ent = MAP[method];
      if (!ent) throw new Error("unknown quota method: " + method);
      const m = ent[0], path = BASE2 + ent[1];
      if (m === "GET") {
        const r2 = await fetch(path, { cache: "no-store" });
        return r2.json();
      }
      const r = await fetch(path, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(args || {}),
        cache: "no-store"
      });
      return r.json();
    }
    let syncRefs = 0;
    let syncTimer = null;
    let syncMsCur = 0;
    function startSyncLoop(ms) {
      syncRefs++;
      if (syncTimer === null || syncMsCur !== ms) {
        if (syncTimer !== null) window.clearInterval(syncTimer);
        syncMsCur = ms;
        syncTimer = window.setInterval(() => {
          if (document.visibilityState === "visible") void syncState();
        }, ms);
      }
    }
    function stopSyncLoop() {
      syncRefs--;
      if (syncRefs <= 0 && syncTimer !== null) {
        window.clearInterval(syncTimer);
        syncTimer = null;
        syncMsCur = 0;
      }
    }
    async function ensureLoad() {
      if (loaded) return;
      loaded = true;
      store.set({ loading: true });
      try {
        const r = await call("quota.load");
        if (r && r.ok) {
          store.set({
            loading: false,
            cfg: r.config,
            snaps: r.snaps || {},
            namespace: r.namespace || "",
            docPath: r.docPath || "",
            providers: r.providers || null,
            error: r.error || ""
          });
        } else store.set({ loading: false, error: r && r.error || "\u52A0\u8F7D\u5931\u8D25" });
      } catch {
        store.set({ loading: false, error: "\u8FDE\u63A5 Host \u5931\u8D25" });
      }
    }
    async function reload() {
      loaded = false;
      store.set({ menuOpen: false, errOpen: false, menuAt: null, lastErr: null });
      await ensureLoad();
    }
    async function syncState() {
      if (store.get().loading) return;
      try {
        const r = await call("quota.load");
        if (!(r && r.ok)) return;
        const cur = store.get();
        store.set({
          cfg: r.config || cur.cfg,
          snaps: r.snaps || cur.snaps,
          namespace: r.namespace || cur.namespace,
          docPath: r.docPath || cur.docPath,
          providers: r.providers || cur.providers
        });
      } catch {
      }
    }
    async function refreshVendor(id) {
      store.set({ loading: true });
      try {
        const r = await call("quota.refresh", id ? { id } : {});
        if (r && r.ok) {
          const snaps = Object.assign({}, store.get().snaps);
          let failMsg = "";
          Object.keys(r.snaps || {}).forEach((k) => {
            const s2 = r.snaps[k];
            if (!s2) return;
            if (s2.ok) snaps[k] = s2;
            else if (!id || k === id) failMsg = s2.error || "\u5237\u65B0\u5931\u8D25";
          });
          const patch = { loading: false, snaps };
          if (failMsg) patch.lastErr = { id: id || "", msg: failMsg, at: (/* @__PURE__ */ new Date()).toISOString() };
          else {
            patch.lastErr = null;
            patch.error = "";
          }
          store.set(patch);
        } else store.set({ loading: false, error: r && r.error || "\u5237\u65B0\u5931\u8D25" });
      } catch {
        store.set({ loading: false, error: "\u8FDE\u63A5 Host \u5931\u8D25" });
      }
    }
    async function setActive(id) {
      try {
        const r = await call("quota.set-active", { id });
        if (r && r.ok) {
          const cfg = Object.assign({}, store.get().cfg, { activeVendor: id });
          store.set({ cfg, menuOpen: false, errOpen: false, menuAt: null, lastErr: null, error: "" });
          if (id && cfg && cfg.enabled !== false) void refreshVendor(id);
        } else {
          store.set({ menuOpen: false, menuAt: null, error: r && r.error || "\u5207\u6362\u4F9B\u5E94\u5546\u5931\u8D25" });
        }
      } catch {
        store.set({ menuOpen: false, menuAt: null, error: "\u8FDE\u63A5 Host \u5931\u8D25\uFF0C\u4F9B\u5E94\u5546\u672A\u5207\u6362" });
      }
    }
    function setFloatOpen(open) {
      const pos = clampFloatPos(store.get().floatPos || loadFloatPos() || defaultFloatPos());
      store.set({ floatOpen: open, floatPos: pos });
      saveFloat(open, pos);
    }
    async function savePrefs(patch) {
      try {
        const r = await call("config.save", patch);
        if (r && r.ok) {
          const cfg = Object.assign({}, store.get().cfg, r.config || patch);
          store.set({ cfg, error: "" });
          return { ok: true };
        }
        return { ok: false, error: r && r.error || "\u4FDD\u5B58\u5931\u8D25" };
      } catch {
        return { ok: false, error: "\u8FDE\u63A5 Host \u5931\u8D25" };
      }
    }
    async function setEnabled(enabled) {
      try {
        const r = await call("quota.set-enabled", { enabled });
        if (r && r.ok) await reload();
        else store.set({ error: r && r.error || "\u4FDD\u5B58\u5931\u8D25" });
      } catch {
        store.set({ error: "\u8FDE\u63A5 Host \u5931\u8D25" });
      }
    }
    async function setVendorEnabled(id, enabled) {
      try {
        const r = await call("quota.set-vendor-enabled", { id, enabled });
        if (!(r && r.ok)) {
          store.set({ error: r && r.error || "\u4FDD\u5B58\u5931\u8D25" });
          return;
        }
        const cur = store.get();
        const cfg = cur.cfg ? Object.assign({}, cur.cfg, {
          vendors: (cur.cfg.vendors || []).map((v) => {
            if (v.id !== id) return v;
            const nv = { ...v };
            if (enabled) delete nv.enabled;
            else nv.enabled = false;
            return nv;
          })
        }) : cur.cfg;
        store.set({ cfg, error: "" });
      } catch {
        store.set({ error: "\u8FDE\u63A5 Host \u5931\u8D25" });
      }
    }
    async function setRefresh(sec) {
      try {
        const r = await call("quota.set-refresh", { sec });
        if (r && r.ok) await reload();
        else store.set({ error: r && r.error || "\u4FDD\u5B58\u5931\u8D25" });
      } catch {
        store.set({ error: "\u8FDE\u63A5 Host \u5931\u8D25" });
      }
    }
    function useStore() {
      const force = useState(0)[1];
      React.useEffect(() => store.subscribe(() => force((x) => x + 1)), []);
      return store.get();
    }
    function useNow(step) {
      const st = useState(Date.now());
      React.useEffect(() => {
        const id = window.setInterval(() => st[1](Date.now()), step || 1e3);
        return () => window.clearInterval(id);
      }, []);
      return st[0];
    }
    function remainOf(w, snap, nowMs) {
      const f = snap.fetchedAtMs || nowMs;
      return Math.max(0, w.resetInSec - (nowMs - f) / 1e3);
    }
    function activeOf(s) {
      if (!s.cfg) return null;
      const vs = s.cfg.vendors || [];
      const av = s.cfg.activeVendor;
      if (av === "") return null;
      if (av === void 0 || av === null) return vs[0] || null;
      return vs.filter((v) => v.id === av)[0] || vs[0] || null;
    }
    function curSymbol(cur) {
      if (cur === "CNY") return "\xA5";
      if (cur === "USD") return "$";
      return cur ? cur + " " : "";
    }
    function providerMetas() {
      try {
        const ps = store.get().providers;
        if (Array.isArray(ps) && ps.length) return ps;
      } catch {
      }
      return null;
    }
    function typeLabel(type) {
      const ps = providerMetas();
      if (ps) {
        const hit = ps.filter((x) => x && x.type === type)[0];
        if (hit && hit.label) return hit.label;
      }
      return TYPE_LABEL_FALLBACK[type] || type;
    }
    function typeOptions() {
      const ps = providerMetas();
      if (ps) return ps.map((x) => ({ type: x.type, title: x.title || x.type }));
      return TYPE_TITLE_FALLBACK.slice();
    }
    function providerMetaOf(type) {
      const ps = providerMetas();
      if (ps) return ps.filter((x) => x && x.type === type)[0] || null;
      return null;
    }
    const kit = createProviderKit(React, {
      num,
      fmt,
      fmtLeft,
      curSymbol,
      remainOf,
      timeAgo,
      levelOf,
      levelTip,
      errOpen: () => !!store.get().errOpen,
      toggleErr: () => store.set({ errOpen: !store.get().errOpen })
    });
    const providerViews = createProviderRenderers(React, kit);
    const ErrBox = kit.ErrorCard;
    function SnapBody(props) {
      return providerViews.renderBody(props.type || "", props.snap, props.now);
    }
    function errInfoOf(snap, fallbackMsg) {
      const info = snap && snap.errorInfo;
      if (info && typeof info === "object" && typeof info.title === "string") return info;
      return fallbackErrorInfo(snap && snap.error || fallbackMsg);
    }
    function dotToneOf(snap) {
      if (!snap) return "";
      if (snap.ok) return "";
      const info = snap.errorInfo;
      const tone = info && info.tone ? String(info.tone) : "warn";
      return tone === "bad" ? " bad" : " warn";
    }
    function openMenu(e) {
      const open = !store.get().menuOpen;
      let at = null;
      if (open) {
        let x = 160, y = 220;
        if (e && typeof e.clientX === "number" && typeof e.clientY === "number") {
          x = e.clientX + 4;
          y = e.clientY + 4;
        }
        try {
          const vw = window.innerWidth || 1024, vh = window.innerHeight || 768;
          x = Math.max(8, Math.min(x, vw - 280));
          y = Math.max(8, Math.min(y, vh - 260));
        } catch {
          x = Math.max(8, x);
          y = Math.max(8, y);
        }
        at = { x, y };
      }
      store.set({ menuOpen: open, menuAt: open ? at : null, error: "" });
    }
    function VendorPopOverlay() {
      const s = useStore();
      if (!s.menuOpen || !s.menuAt) return null;
      const vendors = s.cfg && s.cfg.vendors || [];
      const a0 = activeOf(s);
      const curId = a0 ? a0.id : "";
      let mx = s.menuAt.x, my = s.menuAt.y;
      try {
        const vw = window.innerWidth || 1024, vh = window.innerHeight || 768;
        mx = Math.max(8, Math.min(mx, vw - 280));
        my = Math.max(8, Math.min(my, vh - 260));
      } catch {
        mx = Math.max(8, mx);
        my = Math.max(8, my);
      }
      const style = { left: mx + "px", top: my + "px" };
      return tmPortal(
        h(
          "div",
          null,
          h("button", {
            className: "tm-backdrop",
            "aria-label": "\u5173\u95ED\u4F9B\u5E94\u5546\u83DC\u5355",
            onClick: () => store.set({ menuOpen: false, menuAt: null })
          }),
          h(
            "div",
            { className: "tm-popmenu tm-in", style },
            vendors.map(
              (v) => h(
                "button",
                {
                  key: v.id,
                  className: "tm-mitem" + (v.id === curId ? " active" : ""),
                  onClick: () => void setActive(v.id)
                },
                h("span", { className: "grow" }, v.name),
                h("span", { className: "tm-vtype" }, typeLabel(v.type))
              )
            ),
            h(
              "button",
              {
                key: "__none",
                className: "tm-mitem" + (!curId ? " active" : ""),
                title: "\u4E0D\u663E\u793A\u4EFB\u4F55\u4F9B\u5E94\u5546\u989D\u5EA6\uFF0C\u4FDD\u6301\u6781\u7B80",
                onClick: () => void setActive("")
              },
              h("span", { className: "grow" }, "\u65E0 \xB7 \u6781\u7B80\u6A21\u5F0F"),
              h("span", { className: "tm-vtype" }, "\u9690\u85CF")
            )
          )
        )
      );
    }
    function quotaContent(s, a, snap, now) {
      const stale = s.lastErr && (!s.lastErr.id || s.lastErr.id === a.id) && snap && snap.ok ? s.lastErr : null;
      let cbody = null;
      if (snap && snap.ok) {
        cbody = h(SnapBody, { snap, type: a.type, now });
      } else if (s.loading) {
        cbody = h("div", { className: "tm-qmeta" }, h("span", null, "\u62C9\u53D6\u4E2D\u2026"));
      } else {
        const le0 = s.lastErr && (!s.lastErr.id || s.lastErr.id === a.id) ? s.lastErr : null;
        const msg = snap && snap.error || (le0 ? le0.msg : "") || s.error || "\u6682\u65E0\u6570\u636E\uFF0C\u70B9\u51FB\u21BB\u5237\u65B0";
        const meta = a.name + (snap && snap.at ? " \xB7 \u5931\u8D25\u4E8E" + timeAgo(snap.at) : le0 && le0.at ? " \xB7 \u5931\u8D25\u4E8E" + timeAgo(le0.at) : "") + (snap && snap.secretKind ? " \xB7 \u51ED\u636E:" + snap.secretKind : "");
        cbody = h(ErrBox, {
          info: snap ? errInfoOf(snap, msg) : fallbackErrorInfo(msg),
          msg,
          meta,
          onRetry: () => void refreshVendor(a.id)
        });
      }
      return [
        s.error ? h("div", { key: "e", className: "tm-err" }, s.error) : null,
        h("div", { key: "b" }, cbody),
        h(
          "div",
          { key: "m", className: "tm-qmeta" },
          h(
            "span",
            null,
            (snap && snap.at ? "\u66F4\u65B0" + timeAgo(snap.at) : "\u672A\u62C9\u53D6") + (snap && snap.ok && snap.via ? " \xB7 " + snap.via : "")
          ),
          h(
            "span",
            null,
            stale ? h(
              "button",
              {
                className: "tm-mini warn",
                title: stale.msg + "\uFF08\u65E7\u6570\u636E\u4ECD\u53EF\u7528\uFF09",
                onClick: () => store.set({ errOpen: !store.get().errOpen })
              },
              "\u26A0\u65E7\u6570\u636E"
            ) : null,
            h(
              "button",
              { className: "tm-mini", title: "\u5237\u65B0\u5F53\u524D\u4F9B\u5E94\u5546", onClick: () => void refreshVendor(a.id) },
              "\u21BB \u5237\u65B0"
            )
          )
        ),
        stale && s.errOpen ? h("div", { key: "d", className: "tm-errdetail" }, stale.msg) : null
      ];
    }
    function gripDragOut(e) {
      if (e.button !== void 0 && e.button !== 0) return;
      if (e.preventDefault) e.preventDefault();
      const sx = e.clientX, sy = e.clientY;
      let out = false;
      function mv(ev) {
        if (!out && Math.hypot(ev.clientX - sx, ev.clientY - sy) < 8) return;
        out = true;
        store.set({ floatOpen: true, floatPos: clampFloatPos({ x: ev.clientX - 60, y: ev.clientY - 20 }) });
      }
      function up() {
        try {
          window.removeEventListener("pointermove", mv);
        } catch {
        }
        try {
          window.removeEventListener("pointerup", up);
        } catch {
        }
        if (out) saveFloat(true, store.get().floatPos);
        else setFloatOpen(true);
      }
      try {
        window.addEventListener("pointermove", mv);
      } catch {
      }
      try {
        window.addEventListener("pointerup", up);
      } catch {
      }
    }
    function startFloatDrag(e) {
      if (e.button !== void 0 && e.button !== 0) return;
      if (e.target && e.target.closest && e.target.closest("button")) return;
      if (e.preventDefault) e.preventDefault();
      const p0 = clampFloatPos(store.get().floatPos || loadFloatPos() || defaultFloatPos());
      const ox = e.clientX - p0.x, oy = e.clientY - p0.y;
      function mv(ev) {
        store.set({ floatPos: clampFloatPos({ x: ev.clientX - ox, y: ev.clientY - oy }) });
      }
      function up() {
        try {
          window.removeEventListener("pointermove", mv);
        } catch {
        }
        try {
          window.removeEventListener("pointerup", up);
        } catch {
        }
        saveFloat(store.get().floatOpen, store.get().floatPos);
      }
      try {
        window.addEventListener("pointermove", mv);
      } catch {
      }
      try {
        window.addEventListener("pointerup", up);
      } catch {
      }
    }
    function FloatingQuota() {
      const s = useStore();
      const now = useNow(1e3);
      React.useEffect(() => {
        void ensureLoad();
      }, []);
      if (!s.floatOpen) return null;
      const a = activeOf(s);
      if (!s.cfg || s.cfg.enabled === false || !a) return null;
      const pos = clampFloatPos(s.floatPos || loadFloatPos() || defaultFloatPos());
      const snap = s.snaps[a.id];
      return tmPortal(
        h(
          "div",
          { className: "tm-float tm-in", style: { left: pos.x + "px", top: pos.y + "px" } },
          h(
            "div",
            {
              className: "tm-float-hd",
              title: "\u6309\u4F4F\u62D6\u5230\u4EFB\u610F\u4F4D\u7F6E \xB7 \u53CC\u51FB\u6536\u56DE\u4FA7\u8FB9\u680F",
              onPointerDown: startFloatDrag,
              onDoubleClick: () => setFloatOpen(false)
            },
            h("span", { className: "tm-dot" + (snap && !snap.ok ? dotToneOf(snap) : "") }),
            h("span", { className: "tm-vname" }, a.name),
            h("span", { className: "tm-vtype" }, typeLabel(a.type)),
            h(
              "button",
              {
                className: "tm-mini",
                title: "\u5207\u6362\u4F9B\u5E94\u5546",
                onClick: (e) => {
                  if (e.stopPropagation) e.stopPropagation();
                  openMenu(e);
                }
              },
              "\u25BE"
            ),
            h(
              "button",
              {
                className: "tm-mini",
                title: "\u5237\u65B0\u5F53\u524D\u4F9B\u5E94\u5546",
                onClick: (e) => {
                  if (e.stopPropagation) e.stopPropagation();
                  void refreshVendor(a.id);
                }
              },
              "\u21BB"
            ),
            h(
              "button",
              {
                className: "tm-mini",
                title: "\u6536\u56DE\u4FA7\u8FB9\u680F",
                onClick: (e) => {
                  if (e.stopPropagation) e.stopPropagation();
                  setFloatOpen(false);
                }
              },
              "\u{1F4CC}"
            )
          ),
          h("div", { className: "tm-float-bd" }, quotaContent(s, a, snap, now))
        )
      );
    }
    function QuotaFloatEntry() {
      return h(React.Fragment, null, h(VendorPopOverlay, null), h(FloatingQuota, null));
    }
    function QuotaSidebar(props) {
      const s = useStore();
      const now = useNow(1e3);
      React.useEffect(() => {
        void ensureLoad();
      }, []);
      const vendors0 = s.cfg && s.cfg.vendors || [];
      const av0 = s.cfg ? s.cfg.activeVendor : void 0;
      const effA = av0 === "" ? null : av0 === void 0 || av0 === null ? vendors0[0] || null : vendors0.filter((v) => v.id === av0)[0] || vendors0[0] || null;
      const effId = effA ? effA.id : "";
      const rawSec = s.cfg ? s.cfg.refreshSec : void 0;
      const numSec = rawSec === void 0 || rawSec === null || rawSec === "" ? 60 : Number(rawSec);
      const effSec = numSec === 0 ? 0 : isFinite(numSec) ? Math.min(3600, Math.max(10, numSec || 60)) : 60;
      const effShown = !s.cfg || s.cfg.enabled !== false;
      React.useEffect(() => {
        if (!effShown || !effId || !(effSec > 0)) return void 0;
        const id = window.setInterval(() => {
          const cur = store.get();
          if (cur.loading) return;
          const curA = activeOf(cur);
          if (curA && curA.id === effId) void refreshVendor(effId);
        }, effSec * 1e3);
        return () => window.clearInterval(id);
      }, [effShown, effId, effSec]);
      const wide = !(props && props.wide === false);
      if (!wide) {
        const a2 = activeOf(s);
        const snap2 = a2 && s.snaps[a2.id];
        const bad = snap2 && !snap2.ok;
        return h(
          "div",
          { title: a2 ? a2.name : "Token \u989D\u5EA6\uFF08\u5DF2\u9690\u85CF\uFF09" },
          h("span", { className: "tm-dot" + (bad ? " bad" : "") })
        );
      }
      const vendors = s.cfg && s.cfg.vendors || [];
      const a = activeOf(s);
      if (!s.cfg)
        return h(
          "div",
          { className: "tm-side" },
          h(
            "div",
            { className: "tm-qmeta" },
            h("span", null, s.loading ? "\u989D\u5EA6\u52A0\u8F7D\u4E2D\u2026" : s.error || "\u989D\u5EA6\u52A0\u8F7D\u5931\u8D25")
          )
        );
      if (s.cfg.enabled === false) {
        return h(
          "div",
          { className: "tm-side tm-in" },
          h(
            "div",
            { className: "tm-qmeta" },
            h("span", null, "\u989D\u5EA6\u663E\u793A\u5DF2\u5173\u95ED"),
            h("span", null, "\u8BBE\u7F6E\u9875\u53EF\u91CD\u65B0\u6253\u5F00")
          )
        );
      }
      if (!a) {
        return h(
          "div",
          { className: "tm-side tm-in" },
          h(
            "button",
            {
              className: "tm-vendor",
              title: "\u70B9\u51FB\u9009\u62E9\u8BA1\u8D39\u4F9B\u5E94\u5546\uFF08\u5F53\u524D\uFF1A\u65E0\uFF09",
              onClick: (e) => openMenu(e)
            },
            h("span", { className: "tm-dot" }),
            h("span", { className: "tm-vname" }, "\u989D\u5EA6\u5DF2\u9690\u85CF"),
            h("span", { className: "tm-vtype" }, "\u6781\u7B80"),
            h("span", { className: "tm-vcaret" }, s.menuOpen ? "\u25B4" : "\u25BE")
          ),
          h(
            "div",
            { className: "tm-qmeta" },
            h("span", null, "\u6781\u7B80\u6A21\u5F0F \xB7 \u4E0D\u62C9\u53D6\u989D\u5EA6"),
            h("span", null, vendors.length ? vendors.length + " \u4E2A\u4F9B\u5E94\u5546" : "")
          )
        );
      }
      if (s.floatOpen) return null;
      const snap = s.snaps[a.id];
      const failed = !!(snap && !snap.ok);
      return h(
        "div",
        {
          className: "tm-side tm-in" + (s.loading ? " loading" : "") + (failed && !s.loading ? " error" : "") + moodClass(a.enabled === false, isPeakHour(new Date(now)))
        },
        h(
          "div",
          { className: "tm-vendor-row" },
          h(
            "span",
            { className: "tm-grip", title: "\u6309\u4F4F\u62D6\u51FA\u4E3A\u6D6E\u7A97\uFF0C\u70B9\u6309\u76F4\u63A5\u5F39\u51FA", onPointerDown: gripDragOut },
            "\u283F"
          ),
          h(
            "button",
            { className: "tm-vendor", title: "\u70B9\u51FB\u5207\u6362\u8BA1\u8D39\u4F9B\u5E94\u5546", onClick: (e) => openMenu(e) },
            h("span", { className: "tm-dot" + (snap && !snap.ok ? dotToneOf(snap) : "") }),
            h("span", { className: "tm-vname" }, a.name),
            h("span", { className: "tm-vtype" }, typeLabel(a.type)),
            h("span", { className: "tm-vcaret" }, s.menuOpen ? "\u25B4" : "\u25BE")
          ),
          h(
            "button",
            {
              className: "tm-mini",
              title: "\u5F39\u51FA\u4E3A\u6D6E\u7A97\uFF08\u53EF\u62D6\u5230\u5C4F\u5E55\u4EFB\u610F\u4F4D\u7F6E\uFF09",
              onClick: () => setFloatOpen(true)
            },
            "\u29C9"
          )
        ),
        quotaContent(s, a, snap, now)
      );
    }
    function Badge(props) {
      return h("span", { className: "tm-badge tm-badge-" + (props.kind || "muted") }, props.text);
    }
    function SecRow(props) {
      return h(
        "div",
        {
          className: "tm-row",
          style: props.wrap ? { flexWrap: "wrap", flexDirection: "column", alignItems: "stretch" } : null
        },
        h(
          "div",
          { className: "tm-rowText" },
          h("div", { className: "tm-rowLabel" }, props.label),
          props.desc ? h("div", { className: "tm-rowDesc" }, props.desc) : null
        ),
        h(
          "span",
          {
            className: props.wrap ? "tm-rowValue" : void 0,
            style: props.wrap ? { flexBasis: "100%", justifyContent: "flex-start" } : null
          },
          props.children
        )
      );
    }
    function FormField(props) {
      return h(
        "div",
        { className: "tm-field" },
        h(
          "div",
          { className: "tm-fieldHead" },
          h("span", { className: "tm-fieldLabel" }, props.label),
          props.required ? h("span", { className: "tm-fieldReq" }, "\u5FC5\u586B") : null,
          props.hint ? h("span", { className: "tm-fieldOpt" }, props.hint) : null
        ),
        h("div", { className: "tm-fieldControl" }, props.children),
        props.desc ? h("div", { className: "tm-fieldDesc" }, props.desc) : null
      );
    }
    function PillSelect(props) {
      const [open, setOpen] = useState(false);
      const selector = h(
        "button",
        {
          type: "button",
          className: "tm-selector",
          "aria-haspopup": "menu",
          "aria-expanded": open,
          disabled: props.disabled,
          onClick: () => setOpen((v) => !v)
        },
        h("span", { className: "tm-selectorLabel" }, props.selectedLabel),
        P.IconChevronDownOutline14 ? h(P.IconChevronDownOutline14, { className: "tm-chevron" }) : h("span", { className: "tm-chevron" }, "\u25BE")
      );
      if (!P.Menu) {
        if (!open) return selector;
        return h(
          "div",
          null,
          selector,
          h(
            "div",
            { className: "tm-popmenu", style: { position: "absolute" } },
            props.options.map(
              (o) => h(
                "button",
                {
                  key: o.id,
                  className: "tm-mitem" + (o.id === props.value ? " active" : ""),
                  onClick: () => {
                    setOpen(false);
                    props.onSelect(o.id);
                  }
                },
                o.label
              )
            )
          )
        );
      }
      return h(P.Menu, {
        open,
        onClose: () => setOpen(false),
        items: props.options,
        selectedId: props.value,
        onSelect: (id) => {
          setOpen(false);
          props.onSelect(id);
        },
        align: "end",
        portal: true,
        anchor: selector
      });
    }
    function secretBadge(kind) {
      if (kind === "ref") return h(Badge, { kind: "ok", text: "\u5BC6\u94A5:$\u5F15\u7528" });
      if (kind === "plain") return h(Badge, { kind: "warn", text: "\u5BC6\u94A5:\u660E\u6587" });
      if (kind === "env" || kind === "cred") return h(Badge, { kind: "info", text: "\u5BC6\u94A5:" + kind + "(\u65E7)" });
      if (kind === "empty") return h(Badge, { kind: "warn", text: "\u5BC6\u94A5:\u672A\u586B" });
      return null;
    }
    function VendorForm(props) {
      const d = props.draft;
      const set = props.set;
      const busy = !!props.busy;
      const isEdit = !!props.isEdit;
      const put = (k) => (v) => set(Object.assign({}, d, { [k]: v }));
      const putP = (k) => (v) => set(Object.assign({}, d, { params: Object.assign({}, d.params, { [k]: v }) }));
      const p = d.params || {};
      const idOk = ID_RE.test(d.id || "");
      const nameOk = !!(d.name && String(d.name).trim());
      const canSubmit = idOk && nameOk && !busy;
      const secretPh = isEdit ? "\u7559\u7A7A=\u4FDD\u7559\u539F\u503C\uFF0C\u6216\u586B $NAME \u5F15\u7528 / \u65B0\u660E\u6587" : "\u586B $NAME \u5F15\u7528\uFF08\u63A8\u8350\uFF09\u6216\u7C98\u8D34\u660E\u6587";
      const inputWrap = (opts, inner) => h(
        "div",
        { className: "tm-inputWrap", style: opts && opts.maxWidth ? { maxWidth: opts.maxWidth } : null },
        inner
      );
      const textInput = (opts) => inputWrap(
        opts,
        h("input", {
          className: "tm-ninput" + (opts && opts.mono ? " tm-mono" : ""),
          style: opts && opts.alignRight ? { textAlign: "right", fontVariantNumeric: "tabular-nums" } : null,
          value: opts.value,
          placeholder: opts.placeholder || "",
          autoComplete: "off",
          inputMode: opts.inputMode,
          disabled: busy,
          onChange: opts.onChange
        })
      );
      const rows = [];
      rows.push(
        h(
          FormField,
          {
            key: "name",
            label: "\u663E\u793A\u540D\u79F0",
            required: true,
            desc: "\u53EA\u7ED9\u4F60\u81EA\u5DF1\u770B\u7684\u540D\u5B57\uFF1A\u663E\u793A\u5728\u4FA7\u8FB9\u680F\u989D\u5EA6\u5361\u3001\u4F9B\u5E94\u5546\u5217\u8868\u548C\u5207\u6362\u83DC\u5355\u91CC\uFF0C\u4E0D\u53C2\u4E0E\u4EFB\u4F55\u8BF7\u6C42\u3002\u540C\u540D\u4E5F\u6CA1\u5173\u7CFB\uFF0C\u968F\u4FBF\u586B\uFF08\u652F\u6301\u4E2D\u6587\uFF09\uFF0C\u4F8B\u5982\u300CDeepSeek \u4E3B\u53F7\u300D\u300C\u516C\u53F8\u8D26\u53F7\u300D\u3002"
          },
          textInput({
            value: d.name || "",
            placeholder: "\u5982\uFF1ADeepSeek \u4E3B\u53F7",
            onChange: (e) => put("name")(e.target.value)
          })
        )
      );
      const typeSel = h(PillSelect, {
        disabled: busy,
        value: d.type,
        selectedLabel: (typeOptions().filter((o) => o.type === d.type)[0] || {}).title || d.type,
        options: typeOptions().map((o) => ({ id: o.type, label: o.title })),
        onSelect: (id) => {
          const meta = providerMetaOf(id);
          const defaults = meta && meta.defaultParams && typeof meta.defaultParams === "object" ? JSON.parse(JSON.stringify(meta.defaultParams)) : {};
          const keep = {};
          for (const k of ["lowWarn", "currency", "billing", "total", "used", "balance", "granted"]) {
            if (p[k] !== void 0 && p[k] !== "") keep[k] = p[k];
          }
          set(Object.assign({}, d, { type: id, params: Object.assign({}, defaults, keep) }));
        }
      });
      rows.push(
        h(
          FormField,
          {
            key: "id",
            label: "ID\uFF08\u914D\u7F6E\u6807\u8BC6\uFF09",
            required: !isEdit,
            hint: isEdit ? "\u6DFB\u52A0\u540E\u4E0D\u53EF\u4FEE\u6539" : void 0,
            desc: isEdit ? "\u8FD9\u662F\u8BE5\u4F9B\u5E94\u5546\u5728\u914D\u7F6E\u91CC\u7684\u552F\u4E00\u6807\u8BC6\uFF08\u4E3B\u952E\uFF09\uFF0C\u7528\u6765\u5728 settings.yaml \u4E2D\u533A\u5206\u4E0D\u540C\u8D26\u53F7\uFF0C\u4E5F\u88AB\u300C\u8BBE\u4E3A\u5F53\u524D\u300D\u7B49\u64CD\u4F5C\u5F15\u7528\u3002\u5DF2\u6DFB\u52A0\u7684\u4F9B\u5E94\u5546\u4E0D\u80FD\u6539 ID\uFF0C\u9700\u8981\u522B\u7684 ID \u8BF7\u5220\u6389\u91CD\u65B0\u6DFB\u52A0\u3002" : "\u8BE5\u4F9B\u5E94\u5546\u5728\u914D\u7F6E\u91CC\u7684\u552F\u4E00\u6807\u8BC6\uFF08\u4E3B\u952E\uFF09\uFF1A\u7528\u4E8E\u5728 settings.yaml \u4E2D\u533A\u5206\u4E0D\u540C\u8D26\u53F7\uFF0C\u4E5F\u88AB\u300C\u8BBE\u4E3A\u5F53\u524D\u300D\u7B49\u64CD\u4F5C\u5F15\u7528\u3002\u586B\u7B80\u77ED\u82F1\u6587/\u6570\u5B57\u5373\u53EF\uFF0C\u4F8B\u5982 ds-main\u3001cc-work\u3001go-2\u3002\u89C4\u5219\uFF1A\u5C0F\u5199\u5B57\u6BCD\u3001\u6570\u5B57\u3001\u6A2A\u7EBF\uFF0C2\u201331 \u4F4D\uFF0C\u5B57\u6BCD\u6216\u6570\u5B57\u5F00\u5934\uFF1B\u6DFB\u52A0\u540E\u4E0D\u53EF\u4FEE\u6539\u3002"
          },
          isEdit ? h(
            "span",
            {
              className: "tm-inputWrap tm-inputReadonly",
              title: "ID \u662F\u914D\u7F6E\u4E3B\u952E\uFF0C\u4E0D\u53EF\u4FEE\u6539"
            },
            h("span", { className: "tm-ninput tm-mono" }, d.id)
          ) : inputWrap(
            {},
            h("input", {
              className: "tm-ninput tm-mono",
              value: d.id || "",
              placeholder: "\u5982\uFF1Ads-main",
              autoComplete: "off",
              disabled: busy,
              onChange: (e) => put("id")(e.target.value)
            })
          )
        )
      );
      if (!isEdit && !idOk && (d.id || ""))
        rows.push(
          h(
            "p",
            { key: "idhint", className: "tm-notice tm-notice-warn" },
            "ID \u4E0D\u5408\u6CD5\uFF1A\u9700\u5C0F\u5199\u5B57\u6BCD\u3001\u6570\u5B57\u6216\u6A2A\u7EBF\uFF0C2\u201331 \u4F4D\uFF0C\u4E14\u4EE5\u5B57\u6BCD\u6216\u6570\u5B57\u5F00\u5934\uFF08\u4E0D\u80FD\u6709\u7A7A\u683C\u3001\u4E0B\u5212\u7EBF\u3001\u4E2D\u6587\uFF09\u3002"
          )
        );
      rows.push(
        h(
          FormField,
          {
            key: "type",
            label: "\u7C7B\u578B",
            required: true,
            desc: "\u51B3\u5B9A\u53BB\u54EA\u4E2A\u5E73\u53F0\u3001\u7528\u54EA\u4E2A\u63A5\u53E3\u62C9\u53D6\u989D\u5EA6\u3002\u5207\u6362\u7C7B\u578B\u4F1A\u540C\u65F6\u91CD\u7F6E\u8BE5\u7C7B\u578B\u7684\u53C2\u6570\uFF08\u5DF2\u586B\u7684\u9884\u8B66\u7EBF\u3001\u5E01\u79CD\u7B49\u901A\u7528\u9879\u4F1A\u4FDD\u7559\uFF09\u3002"
          },
          typeSel
        )
      );
      const dynMeta = providerMetaOf(d.type);
      if (dynMeta && Array.isArray(dynMeta.fields)) {
        const dynFields = dynMeta.fields.filter((f) => {
          if (!f || !f.showWhen) return true;
          let cur = p[f.showWhen.key];
          if (cur === void 0 || cur === null || cur === "")
            cur = f.showWhen.key === "billing" ? "rolling" : "";
          return String(cur) === String(f.showWhen.eq);
        });
        dynFields.forEach((f, idx) => {
          const val = p[f.key];
          const key = "dyn:" + f.key + ":" + idx;
          if (f.kind === "select") {
            const selVal = val === void 0 || val === null || val === "" ? f.key === "billing" ? "rolling" : "" : String(val);
            rows.push(
              h(
                FormField,
                {
                  key,
                  label: f.label || f.key,
                  required: f.required === true,
                  desc: f.hint || void 0
                },
                h(PillSelect, {
                  disabled: busy,
                  value: selVal,
                  selectedLabel: ((f.options || []).filter((o) => o.value === selVal)[0] || {}).label || selVal,
                  options: (f.options || []).map((o) => ({ id: o.value, label: o.label })),
                  onSelect: /* @__PURE__ */ ((k) => (id) => putP(k)(id))(f.key)
                })
              )
            );
          } else if (f.kind === "number") {
            rows.push(
              h(
                FormField,
                { key, label: f.label || f.key, required: f.required === true, desc: f.hint || void 0 },
                textInput({
                  maxWidth: 220,
                  inputMode: "decimal",
                  placeholder: f.placeholder || "",
                  value: val === void 0 || val === null ? "" : String(val),
                  onChange: /* @__PURE__ */ ((k) => (e) => putP(k)(e.target.value))(f.key)
                })
              )
            );
          } else {
            const isSecret = f.kind === "secret";
            rows.push(
              h(
                FormField,
                {
                  key,
                  label: f.label || f.key,
                  required: f.required === true,
                  hint: isSecret ? "\u586B $NAME \u5F15\u7528\u6216\u660E\u6587\uFF1B\u660E\u6587\u4FDD\u5B58\u540E\u4E0D\u56DE\u663E" : void 0,
                  desc: f.hint || void 0
                },
                textInput({
                  mono: !!f.mono,
                  placeholder: f.placeholder || (isSecret ? secretPh : ""),
                  value: val === void 0 || val === null ? "" : String(val),
                  onChange: /* @__PURE__ */ ((k) => (e) => putP(k)(e.target.value))(f.key)
                })
              )
            );
          }
        });
        if (dynMeta.hint)
          rows.push(
            h("p", { key: "dyn:hint", className: "tm-fieldNote" }, h("b", null, "\u5173\u4E8E\u8BE5\u7C7B\u578B\uFF1A"), dynMeta.hint)
          );
      } else {
        rows.push(
          h(
            "p",
            { key: "nometa", className: "tm-notice tm-notice-warn" },
            "Host \u672A\u4E0A\u62A5\u7C7B\u578B\u300C" + String(d.type) + "\u300D\u7684\u5B57\u6BB5\u5B9A\u4E49\uFF1A\u8BF7\u91CD\u542F dsh web \u8BA9\u63D2\u4EF6\u91CD\u65B0\u6CE8\u518C\uFF0C\u7136\u540E\u5237\u65B0\u672C\u9875\u3002"
          )
        );
      }
      const Btn = P.Button || (({ children, ...rest }) => h("button", { type: "button", className: "tm-btn", ...rest }, children));
      rows.push(
        h(
          "div",
          { key: "actions", className: "tm-bar" },
          h(
            Btn,
            { variant: "primary", size: "sm", disabled: !canSubmit, onClick: props.onSubmit },
            busy ? "\u4FDD\u5B58\u4E2D\u2026" : props.submitLabel || "\u4FDD\u5B58"
          ),
          props.onCancel ? h(Btn, { variant: "outline", size: "sm", disabled: busy, onClick: props.onCancel }, "\u53D6\u6D88") : null,
          !idOk || !nameOk ? h(
            "span",
            { className: "tm-hint" },
            !nameOk ? "\u8BF7\u5148\u586B\u5199\u663E\u793A\u540D\u79F0\u3002" : "ID \u4E0D\u5408\u6CD5\uFF1A\u9700\u5C0F\u5199\u5B57\u6BCD/\u6570\u5B57/\u6A2A\u7EBF\uFF0C2\u201331 \u4F4D\uFF0C\u5B57\u6BCD\u6216\u6570\u5B57\u5F00\u5934\u3002"
          ) : null
        )
      );
      return h("div", { className: "tm-section" }, rows);
    }
    const NEW_VENDOR2 = { id: "", name: "", type: "opencode", params: { workspaceId: "", cookie: "" } };
    const SEC_PRESETS2 = [0, 30, 60, 120, 300, 600, 1800, 3600];
    function secLabel2(n) {
      return n === 0 ? "\u5173\u95ED\u81EA\u52A8\u5237\u65B0" : n + " \u79D2";
    }
    function aiManual(namespace, docPath) {
      let types = "opencode / deepseek / commandcode / manual";
      try {
        const ps = providerMetas();
        if (ps && ps.length) types = ps.map((x) => x.type).join(" / ");
      } catch {
      }
      return [
        "\u3010\u7ED9 AI \u7684\u914D\u7F6E\u8BF4\u660E\u4E66\u3011\u76F4\u63A5\u6539 settings.yaml \u7684 " + namespace + " \u5206\u8282" + (docPath ? "\uFF08\u6587\u4EF6\uFF1A" + docPath + "\uFF09" : "") + "\uFF0C\u4FDD\u5B58\u5373\u70ED\u91CD\u8F7D\u751F\u6548\uFF0C\u65E0\u9700\u70B9\u4EFB\u4F55\u6309\u94AE\u3002",
        "dshp-token-meter:",
        '  activeVendor: "ds-main"   # "" = \u6781\u7B80\u6A21\u5F0F\uFF0C\u4FA7\u8FB9\u680F\u53EA\u5360\u4F4D\u3001\u4E0D\u62C9\u53D6',
        "  refreshSec: 60            # \u5F53\u524D\u4F9B\u5E94\u5546\u81EA\u52A8\u5237\u65B0\u79D2\u6570\uFF0C0=\u5173\u95ED\uFF08\u5176\u4F59 10~3600\uFF09",
        "  enabled: true             # false=\u9690\u85CF\u4FA7\u8FB9\u680F\u989D\u5EA6\u5361\uFF08\u4EC5\u5360\u4F4D\uFF0C\u4E0D\u62C9\u53D6\uFF09",
        "  vendors:",
        "    - id: go-main           # \u5C0F\u5199\u5B57\u6BCD/\u6570\u5B57/\u6A2A\u7EBF\uFF0C2-31 \u4F4D\uFF08\u4E3B\u952E\uFF0C\u4E0D\u53EF\u6539\uFF09",
        "      name: \u663E\u793A\u540D",
        "      type: opencode",
        '      params: { workspaceId: "wrk_xxx", cookie: "$TQUOTA_GO" }',
        "    - id: ds-main",
        "      name: DeepSeek \u5B98\u65B9",
        "      type: deepseek",
        '      params: { token: "$DS_TOKEN", apiKey: "$DEEPSEEK_API_KEY", lowWarn: 5 }',
        "      # deepseek \u4E00\u4E2A\u7C7B\u578B\u641E\u5B9A\u4E24\u79CD\u51ED\u636E\uFF1Ask- \u5F00\u5934\u7684 apiKey \u8D70\u5B98\u65B9\u4F59\u989D\uFF0C\u4F1A\u8BDD token \u8D70\u7F51\u9875\u8D26\u5355\uFF08\u542B\u5386\u53F2\uFF09\uFF1B\u4E00\u8DEF\u5931\u6548\u81EA\u52A8\u6362\u8DEF",
        "      # \u65E7 type deepseek-api / deepseek-web \u5DF2\u5408\u5E76\u4E3A\u522B\u540D\uFF0C\u8001\u914D\u7F6E\u539F\u6837\u53EF\u7528\uFF08\u8BFB\u8DEF\u5F84\u81EA\u52A8\u5F52\u4E00\uFF0C\u4E0D\u4F1A\u6539\u5199\u4F60\u7684\u6587\u4EF6\uFF09",
        "    - id: cc-main",
        "      name: Command Code",
        "      type: commandcode",
        '      params: { apiKey: "$COMMAND_CODE_API_KEY", lowWarn: 10 }',
        "      # apiKey \u7559\u7A7A\u65F6\u81EA\u52A8\u56DE\u9000\u8BFB $COMMAND_CODE_API_KEY\uFF08\u4E0E CLI \u540C\u4E00\u7EA6\u5B9A\uFF09",
        "    - id: m1",
        "      name: \u624B\u52A8\u8D26\u672C",
        "      type: manual",
        "      params: { billing: payg, balance: 50, granted: 100, lowWarn: 10 }",
        "\u5BC6\u94A5\uFF1A$NAME\uFF08\u63A8\u8350\uFF1A\u5148\u8BFB ~/.dsh/.credentials.yaml\uFF0C\u518D\u8BFB\u73AF\u5883\u53D8\u91CF\uFF09/ \u660E\u6587\uFF08\u8BBE\u7F6E\u9875\u4E0D\u660E\u6587\u56DE\u663E\uFF0C\u7F16\u8F91\u7559\u7A7A\u5373\u4FDD\u7559\uFF09/ {env:}/{cred:}\uFF08\u65E7\u5199\u6CD5\uFF0C\u4EC5\u517C\u5BB9\uFF09",
        "cookie\uFF1A\u6D4F\u89C8\u5668\u5F00\u53D1\u8005\u5DE5\u5177 \u2192 Application \u2192 Cookies \u2192 \u590D\u5236 auth \u7684\u503C\uFF0C\u6574\u6BB5 Cookie \u539F\u6837\u7C98\u8D34\u4EA6\u53EF\uFF1BworkspaceId \u89C1\u5404\u5B57\u6BB5\u4E0B\u65B9\u7684\u83B7\u53D6\u8BF4\u660E",
        "deepseek\uFF1A\u5355\u7C7B\u578B\u81EA\u52A8\u9009\u8DEF\uFF08\u65E7 deepseek-api / deepseek-web \u4E3A\u522B\u540D\uFF09\uFF1BapiKey \u4E0E\u4F1A\u8BDD\u7968\u636E\u4E0D\u901A\u7528\uFF08\u5B9E\u6D4B 40003\uFF09\uFF0C\u4E0D\u8981\u6DF7\u586B\u5230\u5BF9\u65B9\u5B57\u6BB5",
        "manual\uFF1Abilling=rolling \u586B total/used\uFF1Bbilling=payg \u586B balance/granted/lowWarn",
        "\u53EF\u7528 type\uFF08\u672C\u673A Host \u5DF2\u6CE8\u518C\uFF09\uFF1A" + types + "\uFF08\u65B0\u589E\u4F9B\u5E94\u5546\u53EA\u9700 Host \u6CE8\u518C\uFF0C\u65B0 type \u81EA\u52A8\u51FA\u73B0\u5728\u6B64\uFF09"
      ].join("\n");
    }
    function QuotaSettingsPage() {
      const Btn = P.Button || (({ children, ...rest }) => h("button", { type: "button", className: "tm-btn", ...rest }, children));
      const s = useStore();
      React.useEffect(() => {
        void ensureLoad();
      }, []);
      const ds = useState(JSON.parse(JSON.stringify(NEW_VENDOR2)));
      const draft = ds[0];
      const setDraft = ds[1];
      const es = useState(null);
      const editing = es[0];
      const setEditing = es[1];
      const bs = useState(false);
      const busy = bs[0];
      const setBusy = bs[1];
      const cs = useState(null);
      const confirmDel = cs[0];
      const setConfirmDel = cs[1];
      const ackS = useState(false);
      const acked = ackS[0];
      const setAcked = ackS[1];
      async function withBusy(fn) {
        setBusy(true);
        try {
          await fn();
        } finally {
          setBusy(false);
        }
      }
      async function saveVendor(v, isEdit) {
        await withBusy(async () => {
          try {
            const r = await call(isEdit ? "quota.update-vendor" : "quota.add-vendor", { vendor: v });
            if (r && r.ok) {
              if (!isEdit) setDraft(JSON.parse(JSON.stringify(NEW_VENDOR2)));
              else setEditing(null);
              await reload();
            } else store.set({ error: r && r.error || "\u4FDD\u5B58\u5931\u8D25" });
          } catch {
            store.set({ error: "\u8FDE\u63A5 Host \u5931\u8D25" });
          }
        });
      }
      async function delVendor(id) {
        await withBusy(async () => {
          try {
            const r = await call("quota.delete-vendor", { id });
            if (!(r && r.ok)) store.set({ error: r && r.error || "\u5220\u9664\u5931\u8D25" });
            await reload();
          } catch {
            store.set({ error: "\u8FDE\u63A5 Host \u5931\u8D25" });
          }
        });
      }
      const requestDelVendor = (v) => {
        setAcked(false);
        setConfirmDel(v);
      };
      async function toCred(id) {
        await withBusy(async () => {
          try {
            const r = await call("quota.secret-to-cred", { id });
            if (r && r.ok) await reload();
            else store.set({ error: r && r.error || "\u8F6C\u5B58\u5931\u8D25" });
          } catch {
            store.set({ error: "\u8FDE\u63A5 Host \u5931\u8D25" });
          }
        });
      }
      async function applyActive(id) {
        await withBusy(async () => {
          await setActive(id);
          await reload();
        });
      }
      async function saveSecVal(n) {
        await withBusy(async () => {
          try {
            const r = await call("quota.set-refresh", { sec: n });
            if (r && r.ok) await reload();
            else store.set({ error: r && r.error || "\u4FDD\u5B58\u5931\u8D25" });
          } catch {
            store.set({ error: "\u8FDE\u63A5 Host \u5931\u8D25" });
          }
        });
      }
      async function toggleEnabled() {
        const next = s.cfg ? s.cfg.enabled === false : false;
        await withBusy(async () => {
          try {
            const r = await call("quota.set-enabled", { enabled: next });
            if (r && r.ok) await reload();
            else store.set({ error: r && r.error || "\u4FDD\u5B58\u5931\u8D25" });
          } catch {
            store.set({ error: "\u8FDE\u63A5 Host \u5931\u8D25" });
          }
        });
      }
      const vendors = s.cfg && s.cfg.vendors || [];
      const activeId = s.cfg ? s.cfg.activeVendor || "" : "";
      const shown = s.cfg ? s.cfg.enabled !== false : true;
      const rawSec = s.cfg ? s.cfg.refreshSec : void 0;
      const curSec = rawSec === void 0 || rawSec === null || rawSec === "" ? 60 : Number(rawSec) === 0 ? 0 : isFinite(Number(rawSec)) ? Math.min(3600, Math.max(10, Number(rawSec) || 60)) : 60;
      const kids = [];
      kids.push(
        h(
          "p",
          { key: "d", className: "tm-intro" },
          "\u591A\u4F9B\u5E94\u5546\u6EDA\u52A8\u989D\u5EA6 / \u6309\u91CF\u4F59\u989D\uFF0C\u4FA7\u8FB9\u680F\u5B9E\u65F6\u5361\u7247\u5C55\u793A\u3002\u914D\u7F6E\u6301\u4E45\u5316\u5728 settings.yaml\uFF08",
          h("code", { className: "tm-mono" }, s.namespace || "dshp-token-meter"),
          " \u547D\u540D\u7A7A\u95F4" + (s.docPath ? "\uFF0C\u6587\u4EF6 " + s.docPath : "") + "\uFF09\uFF0C\u5916\u90E8\u7F16\u8F91\u70ED\u91CD\u8F7D\uFF1B\u5BC6\u94A5\u7528 $NAME \u5F15\u7528\u6216\u660E\u6587\u3002"
        )
      );
      if (s.error) kids.push(h("p", { key: "err", className: "tm-notice tm-notice-err" }, s.error));
      if (!s.cfg) {
        kids.push(
          h(
            "div",
            { key: "loading", className: "tm-loading" },
            h("span", { className: "tm-spinner" }),
            h("span", { className: "tm-loadingText" }, s.loading ? "\u6B63\u5728\u8BFB\u53D6\u989D\u5EA6\u914D\u7F6E\u2026" : "\u989D\u5EA6\u914D\u7F6E\u52A0\u8F7D\u5931\u8D25")
          )
        );
        return h("div", { className: "tm-page" }, kids);
      }
      const a0 = activeOf(s);
      const aSnap = a0 && s.snaps[a0.id];
      kids.push(
        h(
          "div",
          { key: "status", className: "tm-section" },
          h(
            SecRow,
            { key: "a", label: "\u5F53\u524D\u4F9B\u5E94\u5546", desc: "\u4FA7\u8FB9\u680F\u5361\u7247\u5C55\u793A\u7684\u989D\u5EA6\u6765\u6E90\u3002" },
            a0 ? h("span", null, a0.name, " ", h(Badge, { kind: "info", text: typeLabel(a0.type) })) : h(Badge, { kind: "muted", text: "\u6781\u7B80\u6A21\u5F0F\uFF08\u65E0\uFF09" })
          ),
          h(
            SecRow,
            { key: "n", label: "\u4F9B\u5E94\u5546\u6570\u91CF" },
            h(Badge, { kind: vendors.length ? "info" : "muted", text: vendors.length + " \u4E2A" })
          ),
          h(
            SecRow,
            { key: "v", label: "\u989D\u5EA6\u663E\u793A" },
            shown ? h(Badge, { kind: "ok", text: "\u663E\u793A\u4E2D" }) : h(Badge, { kind: "muted", text: "\u5DF2\u9690\u85CF" })
          ),
          h(
            SecRow,
            { key: "r", label: "\u81EA\u52A8\u5237\u65B0" },
            curSec === 0 ? h(Badge, { kind: "muted", text: "\u5DF2\u5173\u95ED" }) : h(Badge, { kind: "ok", text: "\u6BCF " + curSec + " \u79D2" })
          ),
          h(
            SecRow,
            { key: "u", label: "\u6700\u8FD1\u62C9\u53D6" },
            aSnap && aSnap.at ? h("span", { className: "tm-hint" }, timeAgo(aSnap.at)) : h("span", { className: "tm-hint" }, a0 ? "\u672A\u62C9\u53D6" : "\u2014")
          ),
          h(
            SecRow,
            { key: "f", label: "\u6D6E\u7A97" },
            s.floatOpen ? h(
              "span",
              { className: "tm-bar", style: { padding: 0, border: "none" } },
              h(Badge, { kind: "info", text: "\u5DF2\u5F39\u51FA" }),
              h(
                Btn,
                { variant: "outline", size: "sm", disabled: busy, onClick: () => setFloatOpen(false) },
                "\u6536\u56DE\u4FA7\u8FB9\u680F"
              )
            ) : h("span", { className: "tm-hint" }, "\u5728\u4FA7\u8FB9\u680F\u4E2D\uFF08\u5361\u7247\u6807\u9898\u680F \u283F \u53EF\u62D6\u51FA\uFF09")
          )
        )
      );
      kids.push(
        h(
          "div",
          { key: "display", className: "tm-section" },
          h(
            SecRow,
            {
              key: "sw",
              label: "\u4FA7\u8FB9\u680F\u989D\u5EA6\u5361",
              desc: "\u5173\u95ED\u540E\u4FA7\u8FB9\u680F\u4EC5\u4FDD\u7559\u5360\u4F4D\u63D0\u793A\uFF0C\u4E0D\u518D\u81EA\u52A8\u62C9\u53D6\uFF1B\u4F9B\u5E94\u5546\u914D\u7F6E\u4E0E\u624B\u52A8\u62C9\u53D6\u4E0D\u53D7\u5F71\u54CD\u3002"
            },
            h(
              "button",
              {
                className: "tm-switch" + (shown ? " tm-switchOn" : ""),
                role: "switch",
                "aria-checked": shown,
                disabled: busy,
                "aria-label": "\u4FA7\u8FB9\u680F\u989D\u5EA6\u5361",
                onClick: () => void toggleEnabled()
              },
              h("span", { className: "tm-knob" })
            )
          )
        )
      );
      const activeSelect = h(PillSelect, {
        disabled: busy,
        value: activeId,
        selectedLabel: a0 ? a0.name + "\uFF08" + typeLabel(a0.type) + "\uFF09" : "\u65E0 \xB7 \u6781\u7B80\u6A21\u5F0F\uFF08\u4E0D\u62C9\u53D6\uFF09",
        options: [{ id: "", label: "\u65E0 \xB7 \u6781\u7B80\u6A21\u5F0F\uFF08\u4E0D\u62C9\u53D6\uFF09" }].concat(
          vendors.map((v) => ({ id: v.id, label: v.name + "\uFF08" + typeLabel(v.type) + "\uFF09" }))
        ),
        onSelect: (id) => void applyActive(id)
      });
      const vrows = [
        h(
          SecRow,
          { key: "__active", label: "\u5F53\u524D\u4F9B\u5E94\u5546", desc: "\u70B9\u5F00\u9009\u62E9\u4FA7\u8FB9\u680F\u5C55\u793A\u7684\u4F9B\u5E94\u5546\uFF1B\u65E0 = \u6781\u7B80\u6A21\u5F0F\u3002" },
          activeSelect
        )
      ];
      vendors.forEach((v) => {
        const snap = s.snaps[v.id];
        const isCur = v.id === activeId;
        const status = snap && snap.ok ? h("span", { className: "tm-hint" }, "\u66F4\u65B0" + timeAgo(snap.at)) : snap ? P.Tooltip ? h(
          P.Tooltip,
          { label: snap.error || "\u62C9\u53D6\u5931\u8D25", side: "top" },
          h("span", { className: "tm-hint" }, "\u62C9\u53D6\u5931\u8D25")
        ) : h("span", { className: "tm-hint", title: snap.error || "\u62C9\u53D6\u5931\u8D25" }, "\u62C9\u53D6\u5931\u8D25") : h("span", { className: "tm-hint" }, "\u672A\u62C9\u53D6");
        vrows.push(
          h(
            SecRow,
            {
              key: "v:" + v.id,
              wrap: true,
              label: h(
                "span",
                { style: { display: "flex", alignItems: "center", gap: 6, minWidth: 0, maxWidth: "100%" } },
                h("span", { className: "tm-dot" + (snap && !snap.ok ? dotToneOf(snap) : "") }),
                h("span", { className: "tm-vname2", style: { maxWidth: 280 } }, v.name),
                h(Badge, { kind: "info", text: typeLabel(v.type) }),
                isCur ? h(Badge, { kind: "ok", text: "\u5F53\u524D" }) : null,
                secretBadge(v.secretKind)
              )
            },
            h(
              "span",
              { className: "tm-bar", style: { width: "100%", padding: 0, border: "none" } },
              status,
              h("span", { style: { flex: 1 } }),
              h(
                Btn,
                { variant: "outline", size: "sm", disabled: busy, onClick: () => void refreshVendor(v.id) },
                "\u62C9\u53D6"
              ),
              h(
                Btn,
                {
                  variant: "outline",
                  size: "sm",
                  disabled: busy,
                  onClick: () => setEditing({ id: v.id, data: JSON.parse(JSON.stringify(v)) })
                },
                "\u7F16\u8F91"
              ),
              v.secretKind === "plain" ? h(
                Btn,
                {
                  variant: "ghost",
                  size: "sm",
                  disabled: busy,
                  title: "\u660E\u6587\u8F6C\u5B58\u7CFB\u7EDF\u51ED\u636E\uFF0C\u6539\u5199\u4E3A $NAME \u5F15\u7528",
                  onClick: () => void toCred(v.id)
                },
                "\u5B58\u51ED\u636E"
              ) : null,
              h(
                Btn,
                { variant: "ghost", size: "sm", disabled: busy, onClick: () => requestDelVendor(v) },
                "\u5220\u9664"
              )
            )
          )
        );
      });
      kids.push(
        h(
          "div",
          { key: "vendors", className: "tm-section" },
          h("div", { className: "tm-sectionHead" }, "\u4F9B\u5E94\u5546"),
          h(
            "p",
            { className: "tm-cardHint", style: { margin: "0 0 4px" } },
            "\u4FA7\u8FB9\u680F\u5361\u7247\u70B9\u4F9B\u5E94\u5546\u540D\u4E5F\u53EF\u5207\u6362\u3002\u5BC6\u94A5 $NAME \u5F15\u7528\u4F18\u5148\uFF0C\u660E\u6587\u4FDD\u5B58\u540E\u4E0D\u660E\u6587\u56DE\u663E\u3002"
          ),
          vrows
        )
      );
      if (editing)
        kids.push(
          h(
            "div",
            { key: "edit", className: "tm-section" },
            h("div", { className: "tm-sectionHead" }, "\u7F16\u8F91 " + editing.id),
            h(
              "p",
              { className: "tm-cardHint", style: { margin: "0 0 4px" } },
              "ID \u662F\u4E3B\u952E\uFF0C\u4E0D\u53EF\u4FEE\u6539\uFF1B\u5BC6\u94A5\u7559\u7A7A\u5373\u4FDD\u7559\u539F\u503C\u3002"
            ),
            h(VendorForm, {
              draft: editing.data,
              set: (nd) => setEditing({ id: editing.id, data: nd }),
              submitLabel: "\u4FDD\u5B58\u4FEE\u6539",
              busy,
              isEdit: true,
              onCancel: () => setEditing(null),
              onSubmit: () => void saveVendor(editing.data, true)
            })
          )
        );
      kids.push(
        h(
          "div",
          { key: "add", className: "tm-section" },
          h("div", { className: "tm-sectionHead" }, "\u6DFB\u52A0\u4F9B\u5E94\u5546"),
          h(VendorForm, {
            draft,
            set: setDraft,
            submitLabel: "\u6DFB\u52A0",
            busy,
            onSubmit: () => void saveVendor(draft, false)
          })
        )
      );
      const allSecs = SEC_PRESETS2.indexOf(curSec) >= 0 ? SEC_PRESETS2 : [curSec].concat(SEC_PRESETS2);
      kids.push(
        h(
          "div",
          { key: "refresh", className: "tm-section" },
          h("div", { className: "tm-sectionHead" }, "\u81EA\u52A8\u5237\u65B0"),
          h(
            SecRow,
            {
              key: "sec",
              label: "\u5237\u65B0\u95F4\u9694",
              desc: "\u5F53\u524D\u4F9B\u5E94\u5546\u6309\u95F4\u9694\u81EA\u52A8\u62C9\u53D6\uFF1B\u5207\u6362\u4F9B\u5E94\u5546\u4F1A\u7ACB\u5373\u5237\u65B0\u4E00\u6B21\uFF1B\u5931\u8D25\u65F6\u4FDD\u7559\u65E7\u6570\u636E\u5E76\u5728\u5361\u7247\u6807\u6CE8\u3002"
            },
            h(PillSelect, {
              disabled: busy,
              value: String(curSec),
              selectedLabel: secLabel2(curSec),
              options: allSecs.map((n) => ({ id: String(n), label: secLabel2(n) })),
              onSelect: (id) => void saveSecVal(Number(id))
            })
          )
        )
      );
      kids.push(
        h(
          "div",
          { key: "tools", className: "tm-section" },
          h(
            "div",
            { className: "tm-bar", style: { borderBottom: "none" } },
            h(
              Btn,
              { variant: "outline", size: "sm", disabled: busy, onClick: () => void withBusy(() => reload()) },
              busy ? "\u8BFB\u53D6\u4E2D\u2026" : "\u91CD\u65B0\u8BFB\u53D6"
            ),
            h(
              Btn,
              {
                variant: "outline",
                size: "sm",
                disabled: busy,
                onClick: () => void withBusy(() => refreshVendor())
              },
              "\u5168\u90E8\u62C9\u53D6"
            )
          )
        )
      );
      const manual = aiManual(s.namespace || "dshp-token-meter", s.docPath || "");
      kids.push(
        h(
          "div",
          { key: "manual", className: "tm-section" },
          h("div", { className: "tm-sectionHead" }, "\u7ED9 AI \u7684\u914D\u7F6E\u8BF4\u660E\u4E66"),
          h(
            "p",
            { className: "tm-cardHint", style: { margin: "0 0 4px" } },
            "AI \u53EF\u76F4\u63A5\u7F16\u8F91 settings.yaml \u7684 ",
            h("code", { className: "tm-mono" }, s.namespace || "dshp-token-meter"),
            " \u5206\u8282\uFF0C\u4FDD\u5B58\u5373\u751F\u6548\uFF08\u70ED\u91CD\u8F7D\uFF09\uFF0C\u65E0\u9700\u8D70\u8868\u5355\u3002\u5BC6\u94A5\u4F18\u5148\u7528 $NAME \u5F15\u7528\u5199\u6CD5\u3002"
          ),
          P.CodeBlock ? h(P.CodeBlock, {
            code: manual,
            lang: "yaml",
            copyLabel: "\u590D\u5236",
            copiedLabel: "\u5DF2\u590D\u5236",
            className: "tm-codeblock"
          }) : h(
            "pre",
            {
              className: "tm-mono",
              style: { fontSize: 11, whiteSpace: "pre-wrap", wordBreak: "break-all" }
            },
            manual
          )
        )
      );
      kids.push(
        h(
          "p",
          { key: "foot", className: "tm-footerNote", style: { marginTop: 4 } },
          "manual \u7C7B\u578B\u76F4\u63A5\u5199\u6570\u5B57\uFF0C\u65E0\u9700\u62C9\u53D6\uFF1BactiveVendor \u4E3A\u7A7A\u5B57\u7B26\u4E32\u65F6\u8FDB\u5165\u6781\u7B80\u6A21\u5F0F\u3002"
        )
      );
      if (confirmDel) {
        const target = confirmDel;
        if (P.RiskConfirmation) {
          kids.push(
            h(P.RiskConfirmation, {
              key: "confirm-del",
              open: true,
              title: "\u5220\u9664\u4F9B\u5E94\u5546\u300C" + target.name + "\u300D\uFF1F",
              description: "\u8BE5\u4F9B\u5E94\u5546\u7684\u914D\u7F6E\u4E0E\u4FA7\u8FB9\u680F\u5FEB\u7167\u5C06\u4E00\u5E76\u6E05\u9664\uFF0C\u6B64\u64CD\u4F5C\u4E0D\u53EF\u64A4\u9500\u3002",
              acknowledgeLabel: "\u6211\u5DF2\u4E86\u89E3\uFF0C\u5220\u9664\u8BE5\u4F9B\u5E94\u5546",
              cancelLabel: "\u53D6\u6D88",
              closeLabel: "\u5173\u95ED",
              confirmLabel: "\u5220\u9664",
              acknowledged: acked,
              onAcknowledgedChange: setAcked,
              onCancel: () => setConfirmDel(null),
              onConfirm: () => {
                setConfirmDel(null);
                void delVendor(target.id);
              }
            })
          );
        } else if (acked) {
          kids.push(
            h(
              "div",
              { key: "confirm-del", className: "tm-errbox" },
              h("div", { className: "tm-errtext" }, "\u786E\u8BA4\u5220\u9664\u300C" + target.name + "\u300D\uFF1F"),
              h(
                "div",
                { style: { display: "flex", gap: 8, marginTop: 6 } },
                h(
                  Btn,
                  {
                    variant: "outline",
                    size: "sm",
                    onClick: () => {
                      setConfirmDel(null);
                      void delVendor(target.id);
                    }
                  },
                  "\u786E\u8BA4\u5220\u9664"
                ),
                h(
                  Btn,
                  {
                    variant: "outline",
                    size: "sm",
                    onClick: () => {
                      setConfirmDel(null);
                      setAcked(false);
                    }
                  },
                  "\u53D6\u6D88"
                )
              )
            )
          );
        } else {
          kids.push(
            h(
              "div",
              { key: "confirm-del", className: "tm-errbox" },
              h("div", { className: "tm-errtext" }, "\u5220\u9664\u4F9B\u5E94\u5546\u300C" + target.name + "\u300D\uFF1F\u6B64\u64CD\u4F5C\u4E0D\u53EF\u64A4\u9500\u3002"),
              h(
                "div",
                { style: { display: "flex", gap: 8, marginTop: 6 } },
                h(Btn, { variant: "outline", size: "sm", onClick: () => setAcked(true) }, "\u6211\u5DF2\u4E86\u89E3"),
                h(Btn, { variant: "outline", size: "sm", onClick: () => setConfirmDel(null) }, "\u53D6\u6D88")
              )
            )
          );
        }
      }
      return h("div", { className: "tm-page" }, kids);
    }
    function QuotaVendorWidget(props) {
      const Btn = P.Button || (({ children, ...rest }) => h("button", { type: "button", className: "tm-btn", ...rest }, children));
      const s = useStore();
      const now = useNow(1e3);
      React.useEffect(() => {
        void ensureLoad();
      }, []);
      const rawSec = s.cfg ? s.cfg.refreshSec : void 0;
      const numSec = rawSec === void 0 || rawSec === null || rawSec === "" ? 60 : Number(rawSec);
      const effSec2 = numSec === 0 ? 0 : isFinite(numSec) ? Math.min(3600, Math.max(10, numSec || 60)) : 60;
      const syncMs = effSec2 > 0 ? Math.max(10, Math.min(30, effSec2)) * 1e3 : 0;
      React.useEffect(() => {
        if (!(syncMs > 0)) return void 0;
        startSyncLoop(syncMs);
        return () => stopSyncLoop();
      }, [syncMs]);
      const v = (s.cfg && s.cfg.vendors || []).filter((x) => x.id === props.vendorId)[0];
      if (!s.cfg)
        return h(
          "div",
          { className: "tm-card" },
          h("div", { className: "tm-hint" }, s.loading ? "\u989D\u5EA6\u52A0\u8F7D\u4E2D\u2026" : s.error || "\u989D\u5EA6\u52A0\u8F7D\u5931\u8D25")
        );
      if (!v)
        return h(
          "div",
          { className: "tm-card" },
          h("div", { className: "tm-hint" }, "\u4F9B\u5E94\u5546\u5DF2\u5220\u9664\uFF0C\u5173\u95ED\u672C\u6D6E\u7A97\u5373\u53EF\u3002")
        );
      const snap = s.snaps[v.id];
      const isCur = v.id === s.cfg.activeVendor;
      const failed = !!(snap && !snap.ok);
      const off = v.enabled === false;
      const peakNow = isPeakHour(new Date(now));
      const wid = "quota:" + v.id;
      return h(
        "div",
        {
          className: "tm-card" + (failed && !s.loading ? " tm-side error" : "") + moodClass(off, peakNow),
          style: { marginBottom: 12 }
        },
        h(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 6, minWidth: 0, flexWrap: "wrap" } },
          h("span", { className: "tm-dot" + (off ? " off" : snap && !snap.ok ? dotToneOf(snap) : "") }),
          h("span", { className: "tm-vname2", style: { maxWidth: 220 } }, v.name),
          h(Badge, { kind: "info", text: typeLabel(v.type) }),
          secretBadge(v.secretKind),
          isCur ? h(Badge, { kind: "ok", text: "\u5F53\u524D" }) : null,
          off ? h(Badge, { kind: "bad", text: "\u5DF2\u7981\u7528" }) : null,
          h("span", { style: { flex: "1 1 auto" } }),
          h(
            "span",
            { style: { display: "inline-flex", gap: 6, alignItems: "center", flexWrap: "wrap" } },
            isCur ? null : h(
              Btn,
              { variant: "outline", size: "sm", disabled: s.loading, onClick: () => void setActive(v.id) },
              "\u8BBE\u4E3A\u5F53\u524D"
            ),
            h(
              Btn,
              {
                variant: "outline",
                size: "sm",
                disabled: s.loading,
                title: off ? "\u5DF2\u7981\u7528\u5B9A\u65F6\u62C9\u53D6\uFF0C\u624B\u52A8\u62C9\u53D6\u4ECD\u7136\u53EF\u7528" : void 0,
                onClick: () => void refreshVendor(v.id)
              },
              "\u62C9\u53D6"
            ),
            h(
              Btn,
              {
                variant: "ghost",
                size: "sm",
                disabled: s.loading,
                title: off ? "\u91CD\u65B0\u52A0\u5165 Host \u5B9A\u65F6\u62C9\u53D6" : "\u9000\u51FA Host \u5B9A\u65F6\u62C9\u53D6\uFF08\u624B\u52A8\u62C9\u53D6\u4E0D\u53D7\u5F71\u54CD\uFF09",
                onClick: () => void setVendorEnabled(v.id, off)
              },
              off ? "\u542F\u7528" : "\u7981\u7528"
            ),
            WG ? h(WG.WidgetToggle, { id: wid }) : null
          )
        ),
        snap ? snap.ok ? h(
          "div",
          { style: { marginTop: 6 } },
          h(SnapBody, { snap, type: v.type, now }),
          h(
            "div",
            { className: "tm-qmeta" },
            h(
              "span",
              null,
              "\u66F4\u65B0" + timeAgo(snap.at) + (snap.via ? " \xB7 " + snap.via : "")
            ),
            h("span", null, "")
          )
        ) : h(ErrBox, {
          info: errInfoOf(snap, snap.error || "\u62C9\u53D6\u5931\u8D25"),
          msg: snap.error || "\u62C9\u53D6\u5931\u8D25",
          meta: v.name + " \xB7 \u5931\u8D25\u4E8E" + timeAgo(snap.at),
          onRetry: () => void refreshVendor(v.id)
        }) : h("div", { className: "tm-hint", style: { marginTop: 6 } }, "\u5C1A\u672A\u62C9\u53D6\uFF0C\u70B9\u51FB\u62C9\u53D6\u83B7\u53D6\u6700\u65B0\u989D\u5EA6\u3002")
      );
    }
    const CN_OFFSET_MS = 8 * 36e5;
    const PEAK_SEGMENTS = [
      [9, 12],
      // ← UTC 01:00–04:00
      [14, 18]
      // ← UTC 06:00–10:00
    ];
    const PEAK_WEEKDAYS = [1, 2, 3, 4, 5];
    const CN_WEEK_LABEL = ["\u5468\u65E5", "\u5468\u4E00", "\u5468\u4E8C", "\u5468\u4E09", "\u5468\u56DB", "\u5468\u4E94", "\u5468\u516D"];
    function pad2(n) {
      return String(n).padStart(2, "0");
    }
    function cnAt(ms) {
      const d = new Date(ms + CN_OFFSET_MS);
      return { day: d.getUTCDay(), hour: d.getUTCHours(), min: d.getUTCMinutes() };
    }
    function cnHm(ms) {
      const c = cnAt(ms);
      return pad2(c.hour) + ":" + pad2(c.min);
    }
    function cnDayKey(ms) {
      return Math.floor((ms + CN_OFFSET_MS) / 864e5);
    }
    function cnWhen(targetMs, nowMs) {
      const diff = cnDayKey(targetMs) - cnDayKey(nowMs);
      const d = new Date(targetMs + CN_OFFSET_MS);
      const hm = pad2(d.getUTCHours()) + ":" + pad2(d.getUTCMinutes());
      if (diff <= 0) return "\u4ECA\u5929 " + hm;
      if (diff === 1) return "\u660E\u5929 " + hm;
      if (diff === 2) return "\u540E\u5929 " + hm;
      return CN_WEEK_LABEL[d.getUTCDay()] + " " + hm;
    }
    function isPeakMs(ms) {
      const c = cnAt(ms);
      if (!PEAK_WEEKDAYS.includes(c.day)) return false;
      return PEAK_SEGMENTS.some(([s, e]) => c.hour >= s && c.hour < e);
    }
    function isPeakHour(t) {
      return isPeakMs(t.getTime());
    }
    function moodClass(off, peak) {
      if (off) return " tm-off";
      return peak ? " mood-peak" : " mood-valley";
    }
    function nextPeakSwitch(nowMs, peak) {
      const step = 6e4;
      for (let i = 1; i < 8 * 24 * 60; i++) {
        if (isPeakMs(nowMs + i * step) !== peak) return { ms: i * step, toPeak: !peak };
      }
      return { ms: 7 * 24 * 36e5, toPeak: peak };
    }
    function fmtDur2(ms) {
      const m = Math.round(ms / 6e4);
      const hh = Math.floor(m / 60);
      const mm = m % 60;
      if (hh >= 24) return Math.floor(hh / 24) + " \u5929 " + hh % 24 + " \u5C0F\u65F6";
      if (hh > 0) return hh + " \u5C0F\u65F6 " + mm + " \u5206";
      return mm + " \u5206";
    }
    function fmtDurShort(ms) {
      const m = Math.max(1, Math.round(ms / 6e4));
      const hh = Math.floor(m / 60);
      if (hh >= 24) return Math.floor(hh / 24) + "d" + hh % 24 + "h";
      if (hh > 0) return hh + "h" + pad2(m % 60) + "m";
      return m + "m";
    }
    function PeakPopover(props) {
      const now = props.now;
      const ns = nextPeakSwitch(now, props.peak);
      const segTxt = PEAK_SEGMENTS.map(([s, e]) => pad2(s) + ":00\u2013" + pad2(e) + ":00").join("\u3001");
      return h(
        "div",
        {
          className: "tm-tipfixed tm-peakPop",
          style: { left: props.at.left + "px", top: props.at.top, bottom: props.at.bottom }
        },
        h(
          "div",
          { className: "tm-peakPopHead" },
          h("span", { className: "tm-peakPopDot " + (props.peak ? "peak" : "valley") }),
          h("span", null, "\u5CF0\u8C37\u5B9A\u4EF7 \xB7 \u5317\u4EAC\u65F6\u95F4"),
          h("span", { key: cnHm(now), className: "tm-peakPopClock" }, cnHm(now))
        ),
        h(
          "div",
          { className: "tm-tiprow" },
          h("span", { className: "tm-tip-k" }, "\u5F53\u524D"),
          h(
            "span",
            { className: "tm-tip-v" },
            (props.peak ? "\u5CF0\u65F6\u6BB5" : "\u8C37\u65F6\u6BB5") + (props.isWeekend ? "\uFF08\u5468\u672B\uFF09" : "")
          )
        ),
        h(
          "div",
          { className: "tm-tiprow" },
          h("span", { className: "tm-tip-k" }, "\u5CF0\u6BB5"),
          h("span", { className: "tm-tip-v" }, segTxt)
        ),
        h(
          "div",
          { className: "tm-tiprow" },
          h("span", { className: "tm-tip-k" }, "\u5CF0\u65E5"),
          h("span", { className: "tm-tip-v" }, "\u5468\u4E00\u81F3\u5468\u4E94")
        ),
        h(
          "div",
          { className: "tm-tiprow" },
          h("span", { className: "tm-tip-k" }, ns.toPeak ? "\u8F6C\u5165\u5CF0" : "\u8F6C\u5165\u8C37"),
          h("span", { className: "tm-tip-v" }, cnWhen(now + ns.ms, now))
        ),
        h(
          "div",
          { className: "tm-tiprow" },
          h("span", { className: "tm-tip-k" }, "\u5012\u8BA1\u65F6"),
          h("span", { className: "tm-tip-v" }, fmtDur2(ns.ms))
        ),
        h("div", { className: "tm-peakPopFoot" }, "\u6298\u7B97\u81EA 01-04 & 06-10 UTC, Mon-Fri \xB7 \u6BCF\u65E5 7h \u5CF0 / 17h \u8C37")
      );
    }
    function PeakIndicator(props) {
      const now = useNow(6e4);
      const [popAt, setPopAt] = useState(null);
      const c = cnAt(now);
      const peak = isPeakMs(now);
      const isWeekend = c.day === 0 || c.day === 6;
      const ns = nextPeakSwitch(now, peak);
      const segTxt = PEAK_SEGMENTS.map(([s, e]) => pad2(s) + ":00\u2013" + pad2(e) + ":00").join("\u3001");
      const cells = [];
      for (let hr = 0; hr < 24; hr++) {
        const on = !isWeekend && PEAK_SEGMENTS.some(([s, e]) => hr >= s && hr < e);
        cells.push(
          h("span", {
            key: hr,
            className: "tm-peakCell" + (on ? " on" : " von") + (hr === c.hour ? " now" : ""),
            title: pad2(hr) + ":00\u2013" + pad2((hr + 1) % 24) + ":00 " + (on ? "\u5CF0" : "\u8C37") + "\uFF08\u5317\u4EAC\u65F6\u95F4\uFF09"
          })
        );
      }
      const curTxt = peak ? "\u5CF0" : "\u8C37";
      const nextTxt = (ns.toPeak ? "\u8DDD\u5CF0 " : "\u8DDD\u8C37 ") + fmtDurShort(ns.ms);
      const openPop = (el) => {
        try {
          if (!el || typeof el.getBoundingClientRect !== "function") return;
          const r = el.getBoundingClientRect();
          const W = 252;
          const H = 168;
          const vw = window.innerWidth || 1024;
          const vh = window.innerHeight || 768;
          const left = Math.max(8, Math.min(r.left, vw - W - 8));
          const below = r.bottom + 8;
          if (below + H <= vh - 8) setPopAt({ left, top: below + "px", bottom: void 0 });
          else setPopAt({ left, top: void 0, bottom: Math.max(8, vh - r.top + 8) + "px" });
        } catch {
        }
      };
      return h(
        "div",
        {
          className: "tm-peak " + (peak ? "peak" : "valley"),
          tabIndex: 0,
          "aria-label": "\u5CF0\u8C37\u5B9A\u4EF7\uFF1A\u5F53\u524D" + (peak ? "\u5CF0\u65F6\u6BB5" : "\u8C37\u65F6\u6BB5") + "\uFF0C" + nextTxt,
          onMouseEnter: (e) => openPop(e.currentTarget),
          onMouseLeave: () => setPopAt(null),
          onFocus: (e) => openPop(e.currentTarget),
          onBlur: () => setPopAt(null)
        },
        h(
          "div",
          { className: "tm-peakHead", key: "hd" },
          h("span", { className: "tm-peakDot " + (peak ? "peak" : "valley") }),
          h("span", { className: "tm-peakTitle" }, "\u5CF0\u8C37\u5B9A\u4EF7"),
          h("span", { className: "tm-peakChip " + (peak ? "peak" : "valley") }, curTxt),
          h(
            "span",
            {
              className: "tm-peakTime",
              title: "\u5317\u4EAC\u65F6\u95F4 " + cnHm(now) + " \xB7 " + nextTxt + "\uFF08" + cnWhen(now + ns.ms, now) + "\uFF09"
            },
            nextTxt
          ),
          props.widgets && props.widgetId ? h(props.widgets.WidgetToggle, { id: props.widgetId }) : null
        ),
        h("div", { className: "tm-peakBand", key: "band" }, cells),
        h(
          "div",
          { className: "tm-peakHint", key: "hint" },
          isWeekend ? "\u5CF0\u8C37\u5B9A\u4EF7\uFF08\u5317\u4EAC\u65F6\u95F4\uFF09\uFF1A\u5468\u672B\u5168\u5929\u4E3A\u8C37\uFF0C" : "\u5CF0\u8C37\u5B9A\u4EF7\uFF08\u5317\u4EAC\u65F6\u95F4\uFF09\uFF1A\u5468\u4E00\u81F3\u5468\u4E94 " + segTxt + " \u4E3A\u5CF0\uFF0C",
          h(
            "b",
            null,
            peak ? "\u5F53\u524D\u4E3A\u5CF0\uFF0C\u7528\u91CF\u6D88\u8017\u52A0\u901F\u3001\u989D\u5EA6\u8D70\u5F97\u66F4\u5FEB\uFF0C\u5EFA\u8BAE\u9519\u5CF0\u8DD1\u91CF\u6216\u7559\u610F\u4F59\u989D\u3002" : "\u5F53\u524D\u4E3A\u8C37\uFF0C\u8D39\u7387\u76F8\u5BF9\u4F4E\uFF0C\u9002\u5408\u6279\u91CF\u4E0E\u957F\u4EFB\u52A1\u8DD1\u91CF\u3002"
          )
        ),
        popAt === null ? null : tmPortal(h(PeakPopover, { now, peak, isWeekend, at: popAt }))
      );
    }
    function QuotaRightPane() {
      const s = useStore();
      React.useEffect(() => {
        void ensureLoad();
      }, []);
      const floats = WG && typeof WG.useWidgets === "function" ? WG.useWidgets() : [];
      const kids = [];
      if (!floats.some((w) => w.id === "peak")) {
        kids.push(h(PeakIndicator, { key: "peak", widgets: WG || void 0, widgetId: "peak" }));
      }
      kids.push(
        h(
          "p",
          { key: "d", className: "tm-intro" },
          "\u5168\u90E8\u4F9B\u5E94\u5546\u989D\u5EA6\u4E00\u89C8\uFF08\u53F3\u4FA7\u680F\u7A7A\u95F4\u66F4\u5BBD\uFF0C\u56FE\u8868\u5B8C\u6574\u5C55\u5F00\uFF09\u3002\u589E\u5220\u6539\u8BF7\u5230 \u8BBE\u7F6E \u2192 Token \u8BA1\u91CF\u3002"
        )
      );
      if (s.error) kids.push(h("p", { key: "err", className: "tm-notice tm-notice-err" }, s.error));
      if (!s.cfg) {
        kids.push(
          h(
            "div",
            { key: "loading", className: "tm-loading" },
            h("span", { className: "tm-spinner" }),
            h("span", { className: "tm-loadingText" }, s.loading ? "\u6B63\u5728\u8BFB\u53D6\u989D\u5EA6\u914D\u7F6E\u2026" : "\u989D\u5EA6\u914D\u7F6E\u52A0\u8F7D\u5931\u8D25")
          )
        );
        return h("div", { className: "tm-page" }, kids);
      }
      const vendors = s.cfg.vendors || [];
      if (!vendors.length) {
        kids.push(
          h(
            "div",
            { key: "empty", className: "tm-card tm-empty" },
            "\u6682\u65E0\u4F9B\u5E94\u5546\uFF0C\u53BB \u8BBE\u7F6E \u2192 Token \u8BA1\u91CF \u6DFB\u52A0\u7B2C\u4E00\u4E2A\u3002"
          )
        );
        return h("div", { className: "tm-page" }, kids);
      }
      const activeId = s.cfg.activeVendor || "";
      const activeFirst = (list) => list.filter((v) => v.id === activeId).concat(list.filter((v) => v.id !== activeId));
      const on = vendors.filter((v) => v.enabled !== false);
      const off = vendors.filter((v) => v.enabled === false);
      const ordered = activeFirst(on).concat(activeFirst(off));
      const bothGroups = on.length > 0 && off.length > 0;
      let shownOffLabel = false;
      for (const v of ordered) {
        if (bothGroups && v.enabled === false && !shownOffLabel) {
          shownOffLabel = true;
          kids.push(h("div", { key: "grp-off", className: "tm-grouplabel" }, "\u5DF2\u7981\u7528 \xB7 " + off.length + " \u4E2A"));
        }
        if (floats.some((w) => w.id === "quota:" + v.id)) continue;
        kids.push(h(QuotaVendorWidget, { key: v.id, vendorId: v.id }));
      }
      return h("div", { className: "tm-page" }, kids);
    }
    return {
      QuotaSettingsPage,
      QuotaSidebar,
      QuotaFloatEntry,
      QuotaRightPane,
      QuotaVendorWidget,
      PeakIndicator,
      quotaStore: {
        useStore,
        useNow,
        ensureLoad,
        reload,
        refreshVendor,
        syncState,
        setActive,
        setEnabled,
        setVendorEnabled,
        setRefresh,
        setFloatOpen,
        openMenu,
        savePrefs,
        activeOf,
        typeLabel,
        remainOf,
        call
      },
      quotaUI: { Badge, SecRow, FormField, PillSelect, VendorForm, secretBadge }
    };
  }

  // src/client/StatsSection.ts
  var BP = "var(--dsw-alias-state-business-primary)";
  var PALETTE = [
    "#4c7ef3",
    "#2fb261",
    "#f5a623",
    "#e05e4e",
    "#9a6ef1",
    "#25b8c4",
    "#d557a8",
    "#8a94a6",
    "#6b7280",
    "#34d399",
    "#f472b6",
    "#a3e635"
  ];
  var RANGES = [
    { v: "7", t: "\u8FD17\u5929" },
    { v: "30", t: "\u8FD130\u5929" },
    { v: "90", t: "\u8FD190\u5929" },
    { v: "all", t: "\u5168\u90E8" }
  ];
  var rangeText = (rv) => {
    for (const r of RANGES) if (r.v === rv) return r.t;
    return "";
  };
  var keyOf2 = (t) => {
    const d = new Date(t);
    const M = String(d.getMonth() + 1);
    const D = String(d.getDate());
    return d.getFullYear() + "-" + (M.length < 2 ? "0" + M : M) + "-" + (D.length < 2 ? "0" + D : D);
  };
  var fromKey = (k) => {
    const p = k.split("-");
    return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]), 12).getTime();
  };
  var dispDay2 = (k) => k ? k.slice(5).replace("-", "/") : "";
  var cnDate2 = (k) => {
    const p = k.split("-");
    return Number(p[0]) + "\u5E74" + Number(p[1]) + "\u6708" + Number(p[2]) + "\u65E5";
  };
  var hhmm = (t) => {
    const d = new Date(t);
    const H = String(d.getHours());
    const Mi = String(d.getMinutes());
    return (H.length < 2 ? "0" + H : H) + ":" + (Mi.length < 2 ? "0" + Mi : Mi);
  };
  var tok = (r) => (r.i || 0) + (r.o || 0) + (r.cr || 0) + (r.cw || 0);
  var fmt2 = (n) => {
    n = Math.round(n || 0);
    if (n >= 1e8) return (n / 1e8).toFixed(1).replace(/\.0$/, "") + "\u4EBF";
    if (n >= 1e4) return (n / 1e4).toFixed(1).replace(/\.0$/, "") + "\u4E07";
    return n.toLocaleString("en-US");
  };
  var fmtFull = (n) => Math.round(n || 0).toLocaleString("en-US");
  var fmtRail = (n) => {
    n = Math.round(n || 0);
    if (n >= 1e8) return (n / 1e8).toFixed(1).replace(/\.0$/, "") + "\u4EBF";
    if (n >= 1e4) return String(Math.round(n / 1e4)) + "\u4E07";
    return String(n);
  };
  var niceMax = (m) => {
    if (m <= 0) return 1;
    const p = Math.pow(10, Math.floor(Math.log(m) / Math.LN10));
    const c = [1, 1.1, 1.2, 1.25, 1.5, 1.75, 2, 2.5, 3, 4, 5, 6, 8, 10];
    for (const v of c) if (v * p >= m) return v * p;
    return 10 * p;
  };
  function sorted(arr, cmp) {
    return [...arr].sort(cmp);
  }
  var median = (arr) => {
    if (!arr.length) return 0;
    const s = sorted(arr, (a, b) => a - b);
    const mid = Math.floor(s.length / 2);
    return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
  };
  function aggregate(records, cutoff) {
    const byDay = /* @__PURE__ */ new Map();
    const byModel = /* @__PURE__ */ new Map();
    const byHour = [];
    for (let i = 0; i < 24; i++) byHour.push(0);
    let si = 0, so = 0, scr = 0, scw = 0, sn = 0;
    let first = null, last = null;
    for (const r of records) {
      if (cutoff !== null && r.d < cutoff) continue;
      const t = tok(r);
      si += r.i || 0;
      so += r.o || 0;
      scr += r.cr || 0;
      scw += r.cw || 0;
      sn += r.n || 0;
      byHour[r.h] += t;
      let day = byDay.get(r.d);
      if (day === void 0) {
        day = { d: r.d, i: 0, o: 0, cr: 0, cw: 0, n: 0, t: 0, byModel: {} };
        byDay.set(r.d, day);
      }
      day.i += r.i || 0;
      day.o += r.o || 0;
      day.cr += r.cr || 0;
      day.cw += r.cw || 0;
      day.n += r.n || 0;
      day.t += t;
      day.byModel[r.m] = (day.byModel[r.m] || 0) + t;
      let mo = byModel.get(r.m);
      if (mo === void 0) {
        mo = { m: r.m, i: 0, o: 0, cr: 0, cw: 0, n: 0, t: 0 };
        byModel.set(r.m, mo);
      }
      mo.i += r.i || 0;
      mo.o += r.o || 0;
      mo.cr += r.cr || 0;
      mo.cw += r.cw || 0;
      mo.n += r.n || 0;
      mo.t += t;
      if (first === null || r.d < first) first = r.d;
      if (last === null || r.d > last) last = r.d;
    }
    return {
      byDay,
      byModel,
      byHour,
      i: si,
      o: so,
      cr: scr,
      cw: scw,
      n: sn,
      total: si + so + scr + scw,
      first,
      last
    };
  }
  function streaks(byDay) {
    const set = new Set(byDay.keys());
    const today = keyOf2(Date.now());
    const yKey = keyOf2(fromKey(today) - 864e5);
    let cur = 0;
    let cursor = set.has(today) ? today : set.has(yKey) ? yKey : null;
    while (cursor !== null && set.has(cursor)) {
      cur++;
      cursor = keyOf2(fromKey(cursor) - 864e5);
    }
    const keys = sorted(Array.from(set));
    let longest = 0, run = 0, prev = null;
    for (const k of keys) {
      run = prev !== null && keyOf2(fromKey(prev) + 864e5) === k ? run + 1 : 1;
      if (run > longest) longest = run;
      prev = k;
    }
    return { current: cur, longest };
  }
  function buildDayList(startKey, endKey) {
    const out = [];
    let c = startKey;
    let guard = 0;
    while (c <= endKey && guard < 3e3) {
      out.push(c);
      c = keyOf2(fromKey(c) + 864e5);
      guard++;
    }
    return out;
  }
  var MODEL_COLORS = /* @__PURE__ */ new Map();
  function buildModelColors(models) {
    const map = /* @__PURE__ */ new Map();
    sorted(Object.keys(models || {})).forEach((k, i) => map.set(k, PALETTE[i % PALETTE.length]));
    MODEL_COLORS = map;
  }
  var modelColor = (mk) => MODEL_COLORS.get(mk) || "#8a94a6";
  function tipPos2(mx, my, w, h) {
    const vw = typeof window !== "undefined" ? window.innerWidth || 1024 : 1024;
    const vh = typeof window !== "undefined" ? window.innerHeight || 768 : 768;
    const flipX = mx + w + 28 > vw;
    const flipY = my + h + 28 > vh;
    return {
      left: flipX ? void 0 : mx + 14 + "px",
      right: flipX ? vw - mx + 14 + "px" : void 0,
      top: flipY ? void 0 : my + 16 + "px",
      bottom: flipY ? vh - my + 16 + "px" : void 0
    };
  }
  function smoothPath(pts) {
    const n = pts.length;
    if (n === 0) return "";
    if (n === 1) return "M " + pts[0][0] + " " + pts[0][1];
    if (n === 2)
      return "M " + pts[0][0] + " " + pts[0][1] + " L " + pts[1][0] + " " + pts[1][1];
    let d = "M " + pts[0][0].toFixed(1) + " " + pts[0][1].toFixed(1);
    for (let i = 0; i < n - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[Math.min(n - 1, i + 2)];
      const c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
      const c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
      d += " C " + c1x.toFixed(1) + " " + c1y.toFixed(1) + " " + c2x.toFixed(1) + " " + c2y.toFixed(1) + " " + p2[0].toFixed(1) + " " + p2[1].toFixed(1);
    }
    return d;
  }
  var TM_TODAY_LS_OPEN = "tm-today.float.open";
  var TM_TODAY_LS_POS = "tm-today.float.pos";
  var TS_TODAY_LS_OPEN = "ts-today.float.open";
  var TS_TODAY_LS_POS = "ts-today.float.pos";
  function tmTodayLoadOpen() {
    try {
      if (window.localStorage.getItem(TM_TODAY_LS_OPEN) === "1") return true;
      if (window.localStorage.getItem(TS_TODAY_LS_OPEN) === "1") return true;
    } catch {
    }
    return false;
  }
  function tmTodayLoadPos() {
    try {
      const v = JSON.parse(
        window.localStorage.getItem(TM_TODAY_LS_POS) || window.localStorage.getItem(TS_TODAY_LS_POS) || "null"
      );
      if (v && isFinite(v.x) && isFinite(v.y)) return { x: Number(v.x), y: Number(v.y) };
    } catch {
    }
    return null;
  }
  function tmTodaySave(open, pos) {
    try {
      window.localStorage.setItem(TM_TODAY_LS_OPEN, open ? "1" : "0");
      if (pos)
        window.localStorage.setItem(
          TM_TODAY_LS_POS,
          JSON.stringify({ x: Math.round(pos.x), y: Math.round(pos.y) })
        );
    } catch {
    }
  }
  function tmTodayDefaultPos() {
    try {
      const vw = window.innerWidth || 1024, vh = window.innerHeight || 768;
      return { x: Math.max(8, vw - 332), y: Math.max(8, Math.min(120, vh - 340)) };
    } catch {
      return { x: 100, y: 100 };
    }
  }
  function tmTodayClamp(p) {
    try {
      const vw = window.innerWidth || 1024, vh = window.innerHeight || 768;
      return { x: Math.max(8, Math.min(p.x, vw - 316)), y: Math.max(8, Math.min(p.y, vh - 140)) };
    } catch {
      return p;
    }
  }
  var tmTodayFloat = {
    open: typeof window !== "undefined" ? tmTodayLoadOpen() : false,
    pos: typeof window !== "undefined" ? tmTodayLoadPos() : null
  };
  var tmTodayListeners = /* @__PURE__ */ new Set();
  var tmTodayEmit = () => {
    for (const fn of tmTodayListeners) {
      try {
        fn({ open: tmTodayFloat.open, pos: tmTodayFloat.pos });
      } catch {
      }
    }
  };
  function tmTodaySet(open) {
    tmTodayFloat.open = open;
    if (open) tmTodayFloat.pos = tmTodayClamp(tmTodayFloat.pos || tmTodayLoadPos() || tmTodayDefaultPos());
    tmTodaySave(tmTodayFloat.open, tmTodayFloat.pos);
    tmTodayEmit();
  }
  function createStatsSection(React, P, ReactDOM) {
    const h = React.createElement;
    const useState = React.useState;
    function tmPortal(node) {
      if (node === null || node === void 0) return null;
      try {
        if (ReactDOM && typeof ReactDOM.createPortal === "function" && typeof document !== "undefined" && document.body) {
          return ReactDOM.createPortal(node, document.body);
        }
      } catch {
      }
      return node;
    }
    const hoverIndex = (svgRef, e, W, pl, pr, n) => {
      const node = svgRef.current;
      if (node === null || node === void 0) return null;
      const rect = node.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width * W;
      let i = n <= 1 ? 0 : Math.round((relX - pl) / (W - pl - pr) * (n - 1));
      if (i < 0) i = 0;
      if (i > n - 1) i = n - 1;
      return i;
    };
    function useTmTodayFloat() {
      const [, force] = React.useReducer((x) => x + 1, 0);
      React.useEffect(() => {
        const fn = () => force();
        tmTodayListeners.add(fn);
        return () => {
          tmTodayListeners.delete(fn);
        };
      }, []);
      return tmTodayFloat;
    }
    function tmGripDragOut(e) {
      if (e.button !== void 0 && e.button !== 0) return;
      if (e.preventDefault) e.preventDefault();
      if (e.stopPropagation) e.stopPropagation();
      const sx = e.clientX, sy = e.clientY;
      let out = false;
      function mv(ev) {
        if (!out && Math.hypot(ev.clientX - sx, ev.clientY - sy) < 8) return;
        out = true;
        tmTodayFloat.open = true;
        tmTodayFloat.pos = tmTodayClamp({ x: ev.clientX - 60, y: ev.clientY - 20 });
        tmTodayEmit();
      }
      function up() {
        try {
          window.removeEventListener("pointermove", mv);
        } catch {
        }
        try {
          window.removeEventListener("pointerup", up);
        } catch {
        }
        if (out) tmTodaySave(true, tmTodayFloat.pos);
        else tmTodaySet(true);
      }
      try {
        window.addEventListener("pointermove", mv);
      } catch {
      }
      try {
        window.addEventListener("pointerup", up);
      } catch {
      }
    }
    function tmFloatDrag(e) {
      if (e.button !== void 0 && e.button !== 0) return;
      if (e.target && e.target.closest && e.target.closest("button")) return;
      if (e.preventDefault) e.preventDefault();
      const p0 = tmTodayClamp(tmTodayFloat.pos || tmTodayLoadPos() || tmTodayDefaultPos());
      const ox = e.clientX - p0.x, oy = e.clientY - p0.y;
      function mv(ev) {
        tmTodayFloat.pos = tmTodayClamp({ x: ev.clientX - ox, y: ev.clientY - oy });
        tmTodayEmit();
      }
      function up() {
        try {
          window.removeEventListener("pointermove", mv);
        } catch {
        }
        try {
          window.removeEventListener("pointerup", up);
        } catch {
        }
        tmTodaySave(tmTodayFloat.open, tmTodayFloat.pos);
      }
      try {
        window.addEventListener("pointermove", mv);
      } catch {
      }
      try {
        window.addEventListener("pointerup", up);
      } catch {
      }
    }
    function AnimatedNumber(props) {
      const [disp, setDisp] = useState(0);
      const ref = React.useRef(0);
      const played = React.useRef(false);
      React.useEffect(() => {
        const to = Number(props.value) || 0;
        if (played.current) {
          if (ref.current !== to) {
            ref.current = to;
            setDisp(to);
          }
          return void 0;
        }
        played.current = true;
        const from = ref.current;
        if (from === to) return void 0;
        const dur = props.duration || 650;
        const t0 = performance.now();
        let raf = 0;
        const step = (t) => {
          const p = Math.min(1, (t - t0) / dur);
          const e2 = 1 - Math.pow(1 - p, 3);
          const v = from + (to - from) * e2;
          ref.current = v;
          setDisp(v);
          if (p < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
        return () => cancelAnimationFrame(raf);
      }, [props.value]);
      const format = props.format || ((v) => Math.round(v).toLocaleString("en-US"));
      return h(
        "div",
        { className: props.className || "", style: props.style || void 0 },
        format(disp)
      );
    }
    function Seg(props) {
      return h(
        "div",
        { className: "tm-seg" },
        (props.options || []).map(
          (o) => h(
            "button",
            {
              key: o.v,
              className: "tm-seg-btn" + (props.current === o.v ? " tm-seg-on" : ""),
              "aria-pressed": props.current === o.v ? "true" : "false",
              onClick: () => props.onPick(o.v)
            },
            o.t
          )
        )
      );
    }
    function StatCard(props) {
      const valueNode = props.count !== void 0 ? h(AnimatedNumber, { className: "tm-stat-value", value: props.count, format: props.fmt || fmt2 }) : h("div", { className: "tm-stat-value" }, props.value);
      return h(
        "div",
        {
          className: "tm-stat",
          "data-tint": props.tint ? "1" : "0",
          style: props.delay !== void 0 ? { animationDelay: props.delay + "ms" } : void 0,
          onMouseEnter: props.onHover || void 0,
          onMouseMove: props.onHover || void 0,
          onMouseLeave: props.onLeave || void 0
        },
        h("div", { className: "tm-stat-label" }, props.label),
        valueNode,
        props.sub ? h("div", { className: "tm-stat-sub" }, props.sub) : null,
        ...props.visual || []
      );
    }
    function breakdown(title, parts) {
      return h(
        "div",
        null,
        h("div", { className: "tm-pop-title" }, title),
        parts.map(
          (p) => h(
            "div",
            { key: p[0], className: "tm-pop-row" },
            h("span", { className: "tm-pop-k" }, p[0]),
            h(
              "span",
              { className: "tm-pop-v" },
              fmtFull(p[1]) + " \xB7 " + (p[3] > 0 ? (p[1] / p[3] * 100).toFixed(1) : "0.0") + "%"
            )
          )
        )
      );
    }
    function ComposeBar(props) {
      const parts = props.parts || [];
      const total = parts.reduce((s, p) => s + p[1], 0);
      if (total <= 0) return null;
      return h(
        "div",
        null,
        h(
          "div",
          { className: "tm-compose" },
          parts.filter((p) => p[1] > 0).map((p) => {
            const w = p[1] / total * 100;
            return h("span", { key: p[0], style: { width: w.toFixed(2) + "%", background: p[2] } });
          })
        ),
        h(
          "div",
          { className: "tm-compose-legend" },
          parts.map((p) => h("span", { key: p[0] }, h("i", { style: { background: p[2] } }), p[0]))
        )
      );
    }
    function Sparkline(props) {
      const vals = props.values || [];
      const W = 150, H = 34, PAD = 2;
      if (vals.length < 2) return null;
      const min = Math.min(...vals), max = Math.max(...vals);
      const span = max - min || 1;
      const xs = (i) => PAD + (W - PAD * 2) * i / (vals.length - 1);
      const ys = (v) => H - PAD - (v - min) / span * (H - PAD * 2);
      const line = smoothPath(vals.map((v, i) => [xs(i), ys(v)]));
      const area = line + " L " + xs(vals.length - 1).toFixed(1) + " " + (H - PAD) + " L " + xs(0).toFixed(1) + " " + (H - PAD) + " Z";
      const c = props.color || BP;
      return h(
        "svg",
        { className: "tm-spark", viewBox: "0 0 " + W + " " + H, preserveAspectRatio: "none" },
        h("path", {
          d: area,
          className: "tm-fadein",
          style: { fill: c, fillOpacity: 0.13, animationDelay: ".18s" }
        }),
        h("path", {
          d: line,
          className: "tm-draw",
          fill: "none",
          style: { stroke: c, strokeWidth: 1.5, strokeLinecap: "round", animationDelay: ".12s" }
        }),
        h("circle", {
          cx: xs(vals.length - 1),
          cy: ys(vals[vals.length - 1]),
          r: 1.8,
          className: "tm-fadein",
          style: { fill: c, animationDelay: ".55s" }
        })
      );
    }
    function TrendDelta(props) {
      const recent = props.recent, before = props.before;
      if (before === 0 && recent === 0) return null;
      const delta = before === 0 ? null : (recent - before) / before * 100;
      let arrow = "flat", color = "var(--dsw-alias-label-tertiary)", text = "\u6301\u5E73";
      if (delta === null) {
        arrow = "up";
        text = "\u65B0\u589E";
      } else if (delta > 2) {
        arrow = "up";
        color = "var(--dsw-alias-state-success-primary)";
        text = "+" + delta.toFixed(0) + "%";
      } else if (delta < -2) {
        arrow = "down";
        color = "var(--dsw-alias-state-error-primary)";
        text = delta.toFixed(0) + "%";
      }
      return h(
        "div",
        { className: "tm-statgrow tm-fadein", style: { color } },
        h("span", { className: "tm-arrow tm-arrow-" + arrow }),
        h("span", null, text + "\uFF08\u5BF9\u6BD4\u524D 7 \u5929\uFF09")
      );
    }
    function StreakBar(props) {
      const pct = props.best > 0 ? Math.min(100, props.current / props.best * 100) : 0;
      return h(
        "div",
        { className: "tm-streakbar" },
        h("span", {
          className: "tm-streakfill",
          style: {
            width: pct.toFixed(1) + "%",
            background: "linear-gradient(90deg, var(--dsw-alias-state-business-primary), color-mix(in srgb, var(--dsw-alias-state-business-primary) 55%, transparent))"
          }
        })
      );
    }
    function DaysRibbon(props) {
      const byDay = props.byDay;
      if (byDay === void 0 || byDay.size === 0) return null;
      const keys = sorted(Array.from(byDay.keys()));
      const firstT = fromKey(keys[0]), lastT = fromKey(keys[keys.length - 1]);
      const NB = Math.min(Math.max(1, Math.round((lastT - firstT) / (30.44 * 864e5)) + 1), 24);
      const buckets = [];
      for (let i = 0; i < NB; i++) buckets.push({ active: 0, total: 0 });
      for (let m = firstT; m <= lastT; m += 864e5) {
        const b = Math.min(NB - 1, Math.floor((m - firstT) / (lastT - firstT || 1) * NB));
        buckets[b].total++;
        if (byDay.has(keyOf2(m))) buckets[b].active++;
      }
      return h(
        "div",
        { className: "tm-dayscroll" },
        buckets.map((b, i) => {
          const ratio = b.total > 0 ? b.active / b.total : 0;
          return h("span", {
            key: i,
            style: {
              background: BP,
              opacity: ratio === 0 ? 0.08 : 0.15 + ratio * 0.8,
              animationDelay: i * 26 + "ms"
            }
          });
        })
      );
    }
    function DualBars(props) {
      const { a, b, height } = props;
      const max = Math.max(a, b) || 1;
      const H = height || 14;
      return h(
        "div",
        {
          className: props.className || "",
          style: {
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            gap: 3,
            height: H + 2,
            marginTop: 3
          }
        },
        h("span", {
          className: "tm-rise",
          style: {
            width: 9,
            borderRadius: "2px 2px 0 0",
            background: BP,
            display: "block",
            height: Math.max(2, a / max * H).toFixed(1) + "px",
            animationDelay: "60ms"
          }
        }),
        h("span", {
          className: "tm-rise",
          style: {
            width: 9,
            borderRadius: "2px 2px 0 0",
            background: BP,
            opacity: 0.28,
            display: "block",
            height: Math.max(2, b / max * H).toFixed(1) + "px",
            animationDelay: "150ms"
          }
        })
      );
    }
    function TrendChart(props) {
      const seriesList = props.series;
      const labels = props.labels;
      const titles = props.titles || labels;
      const emptyText = props.emptyText || "\u5F53\u65E5\u65E0\u6D88\u8017";
      const W = 780, H = 250, pl = 54, pr = 14, pt = 6, pb = 28;
      const n = labels.length;
      const vis = seriesList.filter((s) => s.visible);
      const top = niceMax(vis.length > 0 ? Math.max(1, ...vis.flatMap((s) => s.values)) : 1);
      const xs = (i) => n <= 1 ? pl + (W - pl - pr) / 2 : pl + (W - pl - pr) * i / (n - 1);
      const ys = (v) => H - pb - v / top * (H - pb - pt);
      const [hover, setHover] = useState(null);
      const svgRef = React.useRef(null);
      const onMove = (e) => {
        const i = hoverIndex(svgRef, e, W, pl, pr, n);
        if (i !== null) setHover({ i, mx: e.clientX, my: e.clientY });
      };
      const kids = [];
      for (const fr of [0, 0.25, 0.5, 0.75, 1]) {
        const yy = ys(top * fr);
        kids.push(h("line", { key: "g" + fr, x1: pl, x2: W - pr, y1: yy, y2: yy, className: "tm-gridln" }));
        kids.push(
          h(
            "text",
            { key: "gt" + fr, x: pl - 8, y: yy + 4, textAnchor: "end", className: "tm-axislbl" },
            fmt2(top * fr)
          )
        );
      }
      const tickCount = Math.min(n, 9);
      const xt = [];
      for (let j = 0; j < tickCount; j++) {
        const idx = tickCount <= 1 ? 0 : Math.round(j * (n - 1) / (tickCount - 1));
        if (xt.length === 0 || xt[xt.length - 1] !== idx) xt.push(idx);
      }
      for (const i of xt) {
        kids.push(
          h(
            "text",
            {
              key: "x" + i,
              x: xs(i),
              y: H - 9,
              textAnchor: i === 0 ? "start" : i === n - 1 ? "end" : "middle",
              className: "tm-axislbl"
            },
            labels[i]
          )
        );
      }
      if (hover !== null) {
        kids.push(
          h("line", {
            key: "ch",
            x1: xs(hover.i),
            x2: xs(hover.i),
            y1: pt,
            y2: H - pb,
            style: { stroke: BP, strokeWidth: 1, strokeDasharray: "3 3", opacity: 0.7 }
          })
        );
        for (const s of vis) {
          if (s.values[hover.i] === void 0) continue;
          kids.push(
            h("circle", {
              key: "d" + s.name,
              cx: xs(hover.i),
              cy: ys(s.values[hover.i]),
              r: 3.5,
              style: { fill: s.color, stroke: "var(--dsw-alias-bg-layer-1)", strokeWidth: 1.5 }
            })
          );
        }
      }
      let li = 0;
      for (const s of seriesList) {
        if (!s.visible) continue;
        kids.push(
          h("path", {
            key: "ln" + s.name,
            className: "tm-draw",
            d: smoothPath(s.values.map((v, i) => [xs(i), ys(v)])),
            fill: "none",
            style: {
              stroke: s.color,
              strokeWidth: s.isTotal ? 2.6 : 1.9,
              strokeLinecap: "round",
              strokeLinejoin: "round",
              opacity: s.isTotal ? 1 : 0.92,
              animationDelay: 0.15 + li * 0.09 + "s"
            }
          })
        );
        li++;
      }
      kids.push(
        h("rect", {
          key: "cap",
          x: 0,
          y: 0,
          width: W,
          height: H,
          fill: "transparent",
          style: { cursor: "crosshair" },
          onMouseMove: onMove,
          onMouseLeave: () => setHover(null)
        })
      );
      const tip = hover !== null ? (() => {
        const active = vis.filter((s) => (s.values[hover.i] || 0) > 0);
        const rows = sorted(
          active,
          (a, b) => (b.values[hover.i] || 0) - (a.values[hover.i] || 0)
        );
        const comp = props.comp ? props.comp[hover.i] : void 0;
        const compTotal = comp ? comp.i + comp.o + comp.cr + comp.cw : 0;
        const pos = tipPos2(hover.mx, hover.my, 270, (comp ? 98 : 44) + rows.length * 18);
        return tmPortal(
          h(
            "div",
            { className: "tm-tipfixed" + (props.above ? " tm-tip-above" : ""), style: pos },
            h(
              "div",
              { className: "tm-tiprow", style: { fontWeight: 600, marginBottom: 2 } },
              titles[hover.i]
            ),
            comp ? h(
              "div",
              { className: "tm-tiprow" },
              h("span", { className: "tm-tip-k" }, "\u603B Token"),
              h("span", { className: "tm-tip-v" }, fmt2(compTotal))
            ) : null,
            comp ? h(
              "div",
              { className: "tm-tiprow" },
              h("span", { className: "tm-tip-k" }, "\u8F93\u5165 / \u8F93\u51FA"),
              h("span", { className: "tm-tip-v" }, fmt2(comp.i) + " / " + fmt2(comp.o))
            ) : null,
            comp ? h(
              "div",
              { className: "tm-tiprow", style: { marginBottom: rows.length > 0 ? 4 : 0 } },
              h("span", { className: "tm-tip-k" }, "\u7F13\u5B58\u8BFB / \u5199"),
              h("span", { className: "tm-tip-v" }, fmt2(comp.cr) + " / " + fmt2(comp.cw))
            ) : null,
            rows.length > 0 ? rows.map(
              (s) => h(
                "div",
                { key: s.name, className: "tm-tiprow" },
                h("span", {
                  className: "tm-dot",
                  style: { background: s.color, width: 8, height: 8 }
                }),
                h(
                  "span",
                  {
                    className: "tm-tip-k",
                    style: { flex: "1 1 auto", overflow: "hidden", textOverflow: "ellipsis" }
                  },
                  s.shortName
                ),
                h("span", { className: "tm-tip-v" }, fmt2(s.values[hover.i] || 0))
              )
            ) : comp ? null : h(
              "div",
              { className: "tm-tiprow", style: { color: "var(--dsw-alias-label-tertiary)" } },
              emptyText
            )
          )
        );
      })() : null;
      return h(
        "div",
        { className: "tm-svgwrap" },
        h(
          "svg",
          {
            viewBox: "0 0 " + W + " " + H,
            style: { width: "100%", height: "auto", display: "block" },
            ref: svgRef
          },
          kids
        ),
        tip
      );
    }
    function Heatmap(props) {
      const byDay = props.byDay;
      const daySessions = props.daySessions || {};
      const months = props.months || 6;
      const today = keyOf2(Date.now());
      const todayT = fromKey(today);
      let startW = todayT - Math.max(1, months) * 31 * 864e5;
      const dow0 = new Date(startW).getDay();
      startW = startW - (dow0 + 6) % 7 * 864e5;
      const weeks = Math.max(1, Math.ceil((todayT - startW) / 6048e5));
      const cols = [];
      let max = 1;
      for (let w = 0; w < weeks; w++) {
        const col = [];
        for (let r = 0; r < 7; r++) {
          const k = keyOf2(startW + w * 6048e5 + r * 864e5);
          if (k > today) {
            col.push(null);
            continue;
          }
          const day = byDay.get(k);
          const v = day === void 0 ? 0 : day.t;
          col.push({ k, v, day, sess: daySessions[k] || 0 });
          if (v > max) max = v;
        }
        cols.push(col);
      }
      const OPS = [0.16, 0.3, 0.5, 0.72, 0.95];
      const levelOf2 = (v) => v <= 0 ? 0 : v <= max * 0.25 ? 1 : v <= max * 0.5 ? 2 : v <= max * 0.75 ? 3 : 4;
      const cellGap = months >= 12 ? 2.5 : months >= 6 ? 3 : 4;
      const rowGap = months >= 12 ? 0 : cellGap;
      const [hover, setHover] = useState(null);
      const onCell = (cell, e) => {
        if (cell === null || cell.day === void 0) {
          setHover(null);
          return;
        }
        setHover({ k: cell.k, day: cell.day, sess: cell.sess, mx: e.clientX, my: e.clientY });
      };
      const WL = ["\u4E00", "\u4E8C", "\u4E09", "\u56DB", "\u4E94", "\u516D", "\u65E5"];
      const rows = [];
      for (let r = 0; r < 7; r++) {
        const cells = [];
        for (let w = 0; w < weeks; w++) {
          const cell = cols[w][r];
          cells.push(
            h("div", {
              key: w,
              className: "tm-hcell",
              "data-lv": cell === null || cell.v <= 0 ? "0" : String(levelOf2(cell.v)),
              style: cell === null ? { visibility: "hidden" } : cell.v > 0 ? {
                background: BP,
                opacity: OPS[levelOf2(cell.v)],
                animationDelay: w * 45 % 480 + "ms"
              } : void 0,
              onMouseEnter: cell ? (e) => onCell(cell, e) : void 0,
              onMouseMove: cell ? (e) => onCell(cell, e) : void 0,
              onMouseLeave: () => setHover(null)
            })
          );
        }
        rows.push(
          h(
            "div",
            { key: r, style: { display: "flex", gap: 4, alignItems: "center" } },
            h(
              "span",
              {
                style: {
                  width: 14,
                  fontSize: 9,
                  color: "var(--dsw-alias-label-caption)",
                  flex: "none",
                  textAlign: "center",
                  lineHeight: "14px"
                }
              },
              r % 2 === 0 ? WL[r] : ""
            ),
            h("div", { className: "tm-heatrow", style: { gap: cellGap + "px" } }, cells)
          )
        );
      }
      const monthLabels = [];
      let prevM = null;
      for (let w = 0; w < weeks; w++) {
        const mo = Number(keyOf2(startW + w * 6048e5).slice(5, 7));
        if (mo !== prevM) {
          monthLabels.push({ w, mo });
          prevM = mo;
        }
      }
      const monthRow = h(
        "div",
        { style: { display: "flex", gap: 4, marginBottom: 3 } },
        h("span", { style: { width: 14, flex: "none" } }),
        h(
          "div",
          { style: { display: "flex", gap: cellGap + "px", flex: "1 1 auto", minHeight: 12 } },
          monthLabels.map(
            (m, i) => h(
              "span",
              {
                key: i,
                style: {
                  fontSize: 9.5,
                  color: "var(--dsw-alias-label-caption)",
                  width: (100 / weeks).toFixed(3) + "%",
                  flex: "none",
                  overflow: "hidden",
                  whiteSpace: "nowrap"
                }
              },
              m.mo + "\u6708"
            )
          )
        )
      );
      let pop = null;
      if (hover !== null) {
        const d = hover.day;
        const entries = sorted(Object.entries(d.byModel || {}), (a, b) => b[1] - a[1]);
        const tot = d.t;
        const cache = (d.cr || 0) + (d.cw || 0);
        const cachePct = tot > 0 ? cache / tot * 100 : 0;
        const pos = tipPos2(hover.mx, hover.my, 300, 134 + Math.min(entries.length, 8) * 18);
        pop = tmPortal(
          h(
            "div",
            { className: "tm-pop" + (props.above ? " tm-tip-above" : ""), style: pos },
            h("div", { className: "tm-pop-title" }, cnDate2(hover.k)),
            h(
              "div",
              { className: "tm-pop-row", style: { marginBottom: 2 } },
              h("span", { className: "tm-pop-k" }, "\u603B\u6D88\u8017"),
              h("span", { className: "tm-pop-v" }, fmt2(tot)),
              h("span", { className: "tm-pop-k", style: { paddingLeft: 12 } }, "\u4F1A\u8BDD"),
              h("span", { className: "tm-pop-v" }, String(hover.sess))
            ),
            h(
              "div",
              { className: "tm-pop-row" },
              h("span", { className: "tm-pop-k" }, "\u8F93\u5165 / \u8F93\u51FA"),
              h("span", { className: "tm-pop-v" }, fmt2(d.i || 0) + " / " + fmt2(d.o || 0))
            ),
            // 缓存：读/写各自占比条（与模型占比条同样式），数值 + 占当日总量比例
            h(
              "div",
              { className: "tm-pop-row" },
              h("span", { className: "tm-pop-k" }, "\u7F13\u5B58\u8BFB"),
              h(
                "span",
                { className: "tm-pop-bar" },
                h("span", {
                  className: "tm-pop-fill",
                  style: {
                    width: (tot > 0 ? (d.cr || 0) / tot * 100 : 0).toFixed(1) + "%",
                    background: "#f5a623"
                  }
                })
              ),
              h(
                "span",
                { className: "tm-pop-v" },
                fmt2(d.cr || 0) + " \xB7 " + (tot > 0 ? ((d.cr || 0) / tot * 100).toFixed(0) : 0) + "%"
              )
            ),
            h(
              "div",
              { className: "tm-pop-row", style: { marginBottom: entries.length > 0 ? 4 : 0 } },
              h("span", { className: "tm-pop-k" }, "\u7F13\u5B58\u5199"),
              h(
                "span",
                { className: "tm-pop-bar" },
                h("span", {
                  className: "tm-pop-fill",
                  style: {
                    width: (tot > 0 ? (d.cw || 0) / tot * 100 : 0).toFixed(1) + "%",
                    background: "#9a6ef1"
                  }
                })
              ),
              h("span", { className: "tm-pop-v" }, fmt2(d.cw || 0) + " \xB7 \u5360\u6BD4 " + cachePct.toFixed(1) + "%")
            ),
            tot > 0 ? entries.slice(0, 8).map(([mk, v]) => {
              const info = (props.models || {})[mk];
              const color = modelColor(mk);
              return h(
                "div",
                { key: mk, className: "tm-pop-row" },
                h("span", { className: "tm-dot", style: { background: color } }),
                h(
                  "span",
                  {
                    style: {
                      maxWidth: 120,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap"
                    }
                  },
                  info ? info.model : mk
                ),
                h(
                  "span",
                  { className: "tm-pop-bar" },
                  h("span", {
                    className: "tm-pop-fill",
                    style: {
                      width: (tot > 0 ? v / tot * 100 : 0).toFixed(1) + "%",
                      background: color
                    }
                  })
                ),
                h(
                  "span",
                  { className: "tm-pop-v" },
                  fmt2(v) + " \xB7 " + (tot > 0 ? (v / tot * 100).toFixed(0) : 0) + "%"
                )
              );
            }) : h("div", { className: "tm-pop-k" }, "\u5F53\u65E5\u65E0\u7528\u91CF"),
            entries.length > 8 ? h(
              "div",
              { className: "tm-pop-k", style: { marginTop: 4 } },
              "\u2026\u53E6\u6709 " + (entries.length - 8) + " \u4E2A\u6A21\u578B"
            ) : null
          )
        );
      }
      return h(
        "div",
        { className: "tm-heatwrap" },
        monthRow,
        h("div", { style: { display: "flex", flexDirection: "column", gap: rowGap + "px" } }, rows),
        pop
      );
    }
    function Donut(props) {
      const entries = props.entries;
      const total = props.total;
      const size = 168, cx = 84, cy = 84, r = 57, C = 2 * Math.PI * r;
      const kids = [
        h("circle", {
          key: "bg",
          cx,
          cy,
          r,
          fill: "none",
          style: { stroke: "var(--dsw-alias-interactive-bg-hover)", strokeWidth: 18 }
        })
      ];
      let acc = 0;
      for (let i = 0; i < entries.length; i++) {
        const it = entries[i];
        const len = total > 0 ? it.t / total * C : 0;
        kids.push(
          h("circle", {
            key: "s" + i,
            cx,
            cy,
            r,
            fill: "none",
            className: "tm-donutseg",
            strokeDasharray: len.toFixed(2) + " " + (C - len).toFixed(2),
            strokeDashoffset: (-acc).toFixed(2),
            style: { stroke: it.color, strokeWidth: 18, animationDelay: i * 70 + "ms" },
            transform: "rotate(-90 " + cx + " " + cy + ")"
          })
        );
        acc += len;
      }
      return h(
        "div",
        { className: "tm-donutBox", style: { position: "relative", width: size, height: size } },
        h(
          "svg",
          { viewBox: "0 0 " + size + " " + size, style: { width: "100%", height: "100%", display: "block" } },
          kids
        ),
        h(AnimatedNumber, { className: "tm-donut-c", value: total, format: fmt2 }),
        h("div", { className: "tm-donut-cap" }, "\u7D2F\u8BA1 Token")
      );
    }
    function TodayChart(props) {
      const seriesList = props.series;
      const n = props.n;
      const tickLabels = props.labels || null;
      const W = 160, H = 44, PAD = 3;
      const [hover, setHover] = useState(null);
      const svgRef = React.useRef(null);
      if (n < 2 || seriesList.length === 0) return null;
      const maxV = Math.max(1, ...seriesList.flatMap((s) => s.values));
      const xs = (i) => PAD + (W - PAD * 2) * i / (n - 1);
      const ys = (v) => H - PAD - v / maxV * (H - PAD * 2);
      const onMove = (e) => {
        const i = hoverIndex(svgRef, e, W, PAD, PAD, n);
        if (i !== null) setHover({ i, mx: e.clientX, my: e.clientY });
      };
      const kids = [];
      if (hover !== null) {
        kids.push(
          h("line", {
            key: "ch",
            x1: xs(hover.i),
            x2: xs(hover.i),
            y1: PAD,
            y2: H - PAD,
            style: { stroke: BP, strokeWidth: 1, strokeDasharray: "2 2", opacity: 0.7 }
          })
        );
      }
      for (let si = 0; si < seriesList.length; si++) {
        const s = seriesList[si];
        kids.push(
          h("path", {
            key: "l" + s.name,
            className: "tm-draw",
            d: smoothPath(s.values.map((v, i) => [xs(i), ys(v)])),
            fill: "none",
            style: {
              stroke: s.color,
              strokeWidth: 1.6,
              strokeLinecap: "round",
              strokeLinejoin: "round",
              opacity: 0.9,
              animationDelay: 0.1 + si * 0.12 + "s"
            }
          })
        );
        kids.push(
          h("circle", {
            key: "e" + s.name,
            cx: xs(n - 1),
            cy: ys(s.values[n - 1] || 0),
            r: 1.8,
            className: "tm-fadein",
            style: { fill: s.color, animationDelay: 0.55 + si * 0.12 + "s" }
          })
        );
        if (hover !== null) {
          kids.push(
            h("circle", {
              key: "h" + s.name,
              cx: xs(hover.i),
              cy: ys(s.values[hover.i] || 0),
              r: 2.2,
              style: { fill: s.color, stroke: "var(--dsw-alias-bg-layer-1)", strokeWidth: 1 }
            })
          );
        }
      }
      kids.push(
        h("rect", {
          key: "cap",
          x: 0,
          y: 0,
          width: W,
          height: H,
          fill: "transparent",
          style: { cursor: "crosshair" },
          onMouseMove: onMove,
          onMouseLeave: () => setHover(null)
        })
      );
      const tip = hover !== null ? (() => {
        const active = seriesList.filter((s) => (s.values[hover.i] || 0) > 0);
        const pos = tipPos2(hover.mx, hover.my, 170, 34 + active.length * 16);
        return tmPortal(
          h(
            "div",
            {
              className: "tm-tipfixed" + (props.floatTip === true ? " tm-tipfloat" : ""),
              style: { ...pos, fontSize: 10.5 }
            },
            h(
              "div",
              { style: { fontWeight: 600 } },
              tickLabels !== null ? tickLabels[hover.i] : hover.i + ":00"
            ),
            active.length > 0 ? sorted(
              active,
              (a, b) => (b.values[hover.i] || 0) - (a.values[hover.i] || 0)
            ).map(
              (s) => h(
                "div",
                { key: s.name, className: "tm-tiprow" },
                h("span", {
                  className: "tm-dot",
                  style: { background: s.color, width: 6, height: 6 }
                }),
                h(
                  "span",
                  {
                    className: "tm-tip-k",
                    style: { overflow: "hidden", textOverflow: "ellipsis", maxWidth: 80 }
                  },
                  s.shortName
                ),
                h("span", { className: "tm-tip-v" }, fmt2(s.values[hover.i] || 0))
              )
            ) : h("div", { style: { color: "var(--dsw-alias-label-tertiary)" } }, "\u8BE5\u5C0F\u65F6\u65E0\u6D88\u8017")
          )
        );
      })() : null;
      return h(
        "div",
        { className: "tm-svgwrap" },
        h(
          "svg",
          { className: "tm-spark", viewBox: "0 0 " + W + " " + H, preserveAspectRatio: "none", ref: svgRef },
          kids
        ),
        tip
      );
    }
    function RangeSelect(props) {
      const [open, setOpen] = useState(false);
      const hit = (props.options || []).filter((o) => o.v === props.value)[0];
      const selector = h(
        "button",
        {
          type: "button",
          className: "tm-selector",
          "aria-haspopup": "menu",
          "aria-expanded": open,
          onClick: () => setOpen((v) => !v)
        },
        h("span", { className: "tm-selectorLabel" }, hit ? hit.t : props.value),
        P.IconChevronDownOutline14 ? h(P.IconChevronDownOutline14, { className: "tm-chevron" }) : h("span", { className: "tm-chevron" }, "\u25BE")
      );
      return h(P.Menu, {
        open,
        onClose: () => setOpen(false),
        items: (props.options || []).map((o) => ({ id: o.v, label: o.t })),
        selectedId: props.value,
        onSelect: (id) => {
          setOpen(false);
          props.onPick(id);
        },
        align: "end",
        portal: true,
        anchor: selector
      });
    }
    const shared = { data: null, err: "", at: 0, inflight: null, subs: /* @__PURE__ */ new Set() };
    function notifyShared() {
      for (const fn of shared.subs) {
        try {
          fn();
        } catch {
        }
      }
    }
    function writeShared(data) {
      shared.data = data;
      shared.err = "";
      shared.at = Date.now();
      notifyShared();
    }
    function ensureSharedStats(force) {
      if (!force && shared.data && Date.now() - shared.at < 45e3) return Promise.resolve(shared.data);
      if (shared.inflight) return shared.inflight;
      const p = fetchStats().then((v) => {
        shared.inflight = null;
        if (v && v.ready === true) writeShared(v);
        else {
          shared.err = String(v?.error || "\u7EDF\u8BA1\u670D\u52A1\u4E0D\u53EF\u7528");
          notifyShared();
        }
        return shared.data;
      }).catch(() => {
        shared.inflight = null;
        shared.err = "\u8FDE\u63A5\u5931\u8D25";
        notifyShared();
        return shared.data;
      });
      shared.inflight = p;
      return p;
    }
    function useSharedStats() {
      const [, forceUpdate] = React.useReducer((x) => x + 1, 0);
      React.useEffect(() => {
        const fn = () => forceUpdate();
        shared.subs.add(fn);
        if (!shared.data && !shared.inflight) void ensureSharedStats();
        const id = window.setInterval(() => {
          if (document.visibilityState === "visible") void ensureSharedStats();
        }, 6e4);
        return () => {
          shared.subs.delete(fn);
          window.clearInterval(id);
        };
      }, []);
      return {
        data: shared.data,
        err: shared.err,
        loading: !shared.data && !!shared.inflight,
        reload: (force) => void ensureSharedStats(force)
      };
    }
    function widgetBtns(widgets, widgetId) {
      if (!widgets || !widgetId || !widgets.WidgetToggle) return null;
      return h(widgets.WidgetToggle, { id: widgetId });
    }
    function useWidgetOpen(widgets, widgetId) {
      const list = widgets && typeof widgets.useWidgets === "function" ? widgets.useWidgets() : [];
      return !!(widgetId && list.some((w) => w.id === widgetId));
    }
    function HiddenWhenFloated(props) {
      const open = useWidgetOpen(props.widgets, props.id);
      if (open) return null;
      return props.children === void 0 ? null : props.children;
    }
    function StatCardsSection(props) {
      const aggAll = props.aggAll;
      const data = props.data;
      const [pop, setPop] = useState(null);
      const open = useWidgetOpen(props.widgets, props.widgetId);
      if (props.inPlace && open) return null;
      const leave = () => setPop(null);
      const todayK = keyOf2(Date.now());
      const st = streaks(aggAll.byDay);
      let peakDay = null;
      for (const day of aggAll.byDay.values()) {
        if (peakDay === null || day.t > peakDay.t) peakDay = day;
      }
      const dayVals = Array.from(aggAll.byDay.values()).map((d) => d.t);
      const avgDay = dayVals.length > 0 ? aggAll.total / dayVals.length : 0;
      const medDay = median(dayVals);
      const allDays = buildDayList(aggAll.first, todayK);
      const dayVal = (k) => {
        const d = aggAll.byDay.get(k);
        return d === void 0 ? 0 : d.t;
      };
      const sparkVals = allDays.slice(-30).map(dayVal);
      const last7 = allDays.slice(-7).reduce((s, k) => s + dayVal(k), 0);
      const prev7 = allDays.slice(-14, -7).reduce((s, k) => s + dayVal(k), 0);
      const CI = "#4c7ef3", CO = "#2fb261", CC = "#f5a623";
      const cards = [];
      cards.push(
        h(StatCard, {
          label: "\u7D2F\u8BA1 Token",
          count: aggAll.total,
          tint: true,
          sub: "\u8F93\u5165 " + fmt2(aggAll.i) + " \xB7 \u8F93\u51FA " + fmt2(aggAll.o),
          delay: cards.length * 45,
          onHover: (e) => setPop({
            mx: e.clientX,
            my: e.clientY,
            content: breakdown("\u7D2F\u8BA1\u6784\u6210", [
              ["\u8F93\u5165", aggAll.i, 1, aggAll.total],
              ["\u8F93\u51FA", aggAll.o, 1, aggAll.total],
              ["\u7F13\u5B58\u8BFB", aggAll.cr, 1, aggAll.total],
              ["\u7F13\u5B58\u5199", aggAll.cw, 1, aggAll.total]
            ])
          }),
          onLeave: leave,
          visual: [
            h(ComposeBar, {
              parts: [
                ["\u8F93\u5165", aggAll.i, CI],
                ["\u8F93\u51FA", aggAll.o, CO],
                ["\u7F13\u5B58\u8BFB", aggAll.cr, CC],
                ["\u7F13\u5B58\u5199", aggAll.cw, "#9a6ef1"]
              ]
            })
          ]
        })
      );
      cards.push(
        h(StatCard, {
          label: "\u8FD1 30 \u5929\u8D70\u52BF",
          count: sparkVals.reduce((s, v) => s + v, 0),
          sub: "\u6BCF\u65E5\u7528\u91CF\u8FF7\u4F60\u56FE",
          delay: cards.length * 45,
          visual: [h(Sparkline, { values: sparkVals }), h(TrendDelta, { recent: last7, before: prev7 })]
        })
      );
      cards.push(
        h(StatCard, {
          label: "\u7F13\u5B58 Token",
          count: aggAll.cr + aggAll.cw,
          sub: "\u547D\u4E2D " + fmt2(aggAll.cr) + " \xB7 \u5199\u5165 " + fmt2(aggAll.cw),
          delay: cards.length * 45,
          onHover: (e) => setPop({
            mx: e.clientX,
            my: e.clientY,
            content: breakdown(
              "\u7F13\u5B58\u6784\u6210 \xB7 \u547D\u4E2D\u7387 " + (aggAll.total > 0 ? (aggAll.cr / aggAll.total * 100).toFixed(1) : "0.0") + "%",
              [
                ["\u7F13\u5B58\u8BFB\uFF08\u547D\u4E2D\uFF09", aggAll.cr, 1, aggAll.total],
                ["\u7F13\u5B58\u5199", aggAll.cw, 1, aggAll.total]
              ]
            )
          }),
          onLeave: leave,
          visual: [
            h(ComposeBar, {
              parts: [
                ["\u7F13\u5B58\u8BFB", aggAll.cr, CC],
                ["\u7F13\u5B58\u5199", aggAll.cw, "#9a6ef1"]
              ]
            })
          ]
        })
      );
      cards.push(
        data.peakStep ? h(StatCard, {
          label: "\u5CF0\u503C\u5355\u6B21\u8BF7\u6C42",
          count: data.peakStep.tokens,
          sub: data.peakStep.model + " \xB7 " + dispDay2(data.peakStep.d),
          delay: cards.length * 45
        }) : null
      );
      cards.push(
        peakDay ? h(StatCard, {
          label: "\u5CF0\u503C\u5355\u65E5",
          count: peakDay.t,
          sub: dispDay2(peakDay.d),
          delay: cards.length * 45,
          onHover: (e) => setPop({
            mx: e.clientX,
            my: e.clientY,
            content: breakdown(
              peakDay.d + " \u5404\u6A21\u578B",
              sorted(
                Object.entries(peakDay.byModel || {}),
                (a, b) => b[1] - a[1]
              ).slice(0, 6).map(
                ([mk, v]) => [mk, v, 1, peakDay.t]
              )
            )
          }),
          onLeave: leave,
          visual: [
            h(ComposeBar, {
              parts: sorted(
                Object.entries(peakDay.byModel || {}),
                (a, b) => b[1] - a[1]
              ).slice(0, 4).map(([mk, v]) => {
                const info = data.models[mk];
                return [info ? info.model : mk, v, modelColor(mk)];
              })
            })
          ]
        }) : null
      );
      cards.push(
        h(StatCard, {
          label: "\u65E5\u5747\u6D88\u8017",
          count: avgDay,
          sub: "\u6309\u6D3B\u8DC3\u65E5\u5E73\u5747",
          delay: cards.length * 45,
          visual: [h(Sparkline, { values: sparkVals, color: CO })]
        })
      );
      cards.push(
        h(StatCard, { label: "\u65E5\u6D88\u8017\u4E2D\u4F4D\u6570", count: medDay, sub: "\u6309\u6D3B\u8DC3\u65E5\u53D6\u4E2D\u4F4D", delay: cards.length * 45 })
      );
      cards.push(
        h(StatCard, {
          label: "\u5F53\u524D\u8FDE\u7EED\u4F7F\u7528",
          count: st.current,
          fmt: (v) => fmt2(v) + " \u5929",
          sub: "\u6309\u81EA\u7136\u65E5\u7EDF\u8BA1",
          delay: cards.length * 45,
          visual: [h(StreakBar, { current: st.current, best: st.longest })]
        })
      );
      cards.push(
        h(StatCard, {
          label: "\u6700\u957F\u8FDE\u7EED\u4F7F\u7528",
          count: st.longest,
          fmt: (v) => fmt2(v) + " \u5929",
          sub: "\u5386\u53F2\u6700\u4F73\u7EAA\u5F55",
          delay: cards.length * 45,
          visual: [h(StreakBar, { current: st.current, best: st.longest })]
        })
      );
      cards.push(
        h(StatCard, {
          label: "\u6D3B\u8DC3\u5929\u6570",
          count: aggAll.byDay.size,
          fmt: (v) => fmt2(v) + " \u5929",
          sub: "\u5171 " + data.sessions + " \u4E2A\u4F1A\u8BDD",
          delay: cards.length * 45,
          visual: [h(DaysRibbon, { byDay: aggAll.byDay })]
        })
      );
      cards.push(
        h(StatCard, {
          label: "\u6A21\u578B\u8C03\u7528\u6B21\u6570",
          count: aggAll.n,
          sub: data.active + " \u4E2A\u4F1A\u8BDD\u6709\u7528\u91CF",
          delay: cards.length * 45
        })
      );
      cards.push(h(StatCard, { label: "\u9996\u6B21\u4F7F\u7528", value: dispDay2(aggAll.first), sub: aggAll.first }));
      cards.push(h(StatCard, { label: "\u6700\u8FD1\u4F7F\u7528", value: dispDay2(aggAll.last), sub: aggAll.last }));
      const toolbar = props.widgets && props.widgetId ? h(
        "div",
        { style: { display: "flex", justifyContent: "flex-end", marginBottom: 6 } },
        widgetBtns(props.widgets, props.widgetId)
      ) : null;
      return h(
        "div",
        { className: "tm-card" },
        toolbar,
        h("div", { className: "tm-grid" }, cards),
        pop !== null ? tmPortal(
          h(
            "div",
            {
              className: "tm-pop" + (props.inFloat ? " tm-tip-above" : ""),
              style: tipPos2(pop.mx, pop.my, 280, 60)
            },
            pop.content
          )
        ) : null
      );
    }
    function TrendSection(props) {
      const data = props.data;
      const aggAll = props.aggAll;
      const [trendRange, setTrendRange] = useState("30d");
      const [modelOff, setModelOff] = useState({});
      const [showTotal, setShowTotal] = useState(false);
      const open = useWidgetOpen(props.widgets, props.widgetId);
      if (props.inPlace && open) return null;
      const todayK = keyOf2(Date.now());
      const newComp = () => ({ i: 0, o: 0, cr: 0, cw: 0 });
      let trendLabels, trendTitles, trendEmpty;
      let slotComp;
      const trendSeries = [];
      if (trendRange === "24h") {
        const endH = /* @__PURE__ */ new Date();
        endH.setMinutes(0, 0, 0);
        const slots = [];
        for (let k = 23; k >= 0; k--) {
          const t = endH.getTime() - k * 36e5;
          slots.push({ d: keyOf2(t), h: new Date(t).getHours() });
        }
        trendLabels = slots.map((s) => s.d === todayK ? s.h + ":00" : "\u6628\u65E5" + s.h + ":00");
        trendTitles = slots.map((s) => cnDate2(s.d) + " " + s.h + ":00\u2013" + (s.h + 1) + ":00");
        trendEmpty = "\u8BE5\u5C0F\u65F6\u65E0\u6D88\u8017";
        const slotIdx = /* @__PURE__ */ new Map();
        for (let i = 0; i < slots.length; i++)
          slotIdx.set(
            slots[i].d + "|" + slots[i].h,
            i
          );
        slotComp = Array.from({ length: 24 }, newComp);
        const hourVals = /* @__PURE__ */ new Map();
        for (const r of data.records || []) {
          const idx = slotIdx.get(r.d + "|" + r.h);
          if (idx === void 0) continue;
          let arr = hourVals.get(r.m);
          if (arr === void 0) {
            arr = Array.from({ length: 24 }, () => 0);
            hourVals.set(r.m, arr);
          }
          arr[idx] += tok(r);
          const c = slotComp[idx];
          c.i += r.i || 0;
          c.o += r.o || 0;
          c.cr += r.cr || 0;
          c.cw += r.cw || 0;
        }
        const hourTotal = Array.from({ length: 24 }, () => 0);
        for (const arr of hourVals.values()) {
          for (let i = 0; i < 24; i++) hourTotal[i] += arr[i];
        }
        for (const mk of sorted(Array.from(hourVals.keys()))) {
          trendSeries.push({
            name: mk,
            shortName: (data.models[mk] || {}).model || mk,
            color: modelColor(mk),
            isTotal: false,
            values: hourVals.get(mk),
            visible: !modelOff[mk]
          });
        }
        trendSeries.push({
          name: "__total__",
          shortName: "\u603B Token",
          color: "#8a94a6",
          isTotal: true,
          values: hourTotal,
          visible: showTotal
        });
      } else {
        const N = trendRange === "7d" ? 7 : 30;
        const dayList = buildDayList(keyOf2(fromKey(todayK) - (N - 1) * 864e5), todayK);
        trendLabels = dayList.map(dispDay2);
        trendTitles = dayList.map(cnDate2);
        trendEmpty = "\u5F53\u65E5\u65E0\u6D88\u8017";
        const dayIdx = /* @__PURE__ */ new Map();
        for (let i = 0; i < dayList.length; i++) dayIdx.set(dayList[i], i);
        slotComp = dayList.map(newComp);
        for (const r of data.records || []) {
          const idx = dayIdx.get(r.d);
          if (idx === void 0) continue;
          const c = slotComp[idx];
          c.i += r.i || 0;
          c.o += r.o || 0;
          c.cr += r.cr || 0;
          c.cw += r.cw || 0;
        }
        for (const mk of sorted(Array.from(aggAll.byModel.keys()))) {
          trendSeries.push({
            name: mk,
            shortName: (data.models[mk] || {}).model || mk,
            color: modelColor(mk),
            isTotal: false,
            values: dayList.map((k) => {
              const d = aggAll.byDay.get(k);
              return d !== void 0 && d.byModel[mk] !== void 0 ? d.byModel[mk] : 0;
            }),
            visible: !modelOff[mk]
          });
        }
        trendSeries.push({
          name: "__total__",
          shortName: "\u603B Token",
          color: "#8a94a6",
          isTotal: true,
          values: dayList.map((k) => {
            const d = aggAll.byDay.get(k);
            return d === void 0 ? 0 : d.t;
          }),
          visible: showTotal
        });
      }
      const anyVisible = trendSeries.some((s) => s.visible);
      return h(
        "div",
        { className: "tm-card" },
        h(
          "div",
          { className: "tm-chart-title" },
          h(
            "span",
            { className: "tm-chart-name" },
            "Token \u4F7F\u7528\u8D8B\u52BF\uFF08" + (trendRange === "24h" ? "\u8FD124\u5C0F\u65F6\u6309\u5C0F\u65F6" : trendRange === "7d" ? "\u8FD17\u5929\u6309\u5929" : "\u8FD130\u5929\u6309\u5929") + " \xB7 \u60AC\u6D6E\u67E5\u770B\u660E\u7EC6\uFF09"
          ),
          h(
            "span",
            { style: { display: "inline-flex", gap: 6, alignItems: "center" } },
            h(Seg, {
              options: [
                { v: "24h", t: "\u8FD124\u5C0F\u65F6" },
                { v: "7d", t: "\u8FD17\u5929" },
                { v: "30d", t: "\u8FD130\u5929" }
              ],
              current: trendRange,
              onPick: setTrendRange
            }),
            widgetBtns(props.widgets, props.widgetId)
          )
        ),
        h(
          "div",
          { className: "tm-legend", style: { marginBottom: 2, marginTop: 0 } },
          trendSeries.map(
            (s) => h(
              "button",
              {
                key: s.name,
                className: "tm-modelchip",
                "data-off": s.visible ? "0" : "1",
                "aria-pressed": s.visible ? "true" : "false",
                onClick: () => {
                  if (s.name === "__total__") setShowTotal(!showTotal);
                  else setModelOff({ ...modelOff, [s.name]: !modelOff[s.name] });
                }
              },
              h("span", { className: "tm-dot", style: { background: s.color } }),
              h("span", { className: "tm-mc-name" }, s.shortName)
            )
          ),
          h("span", { className: "tm-hint", style: { marginLeft: 6 } }, "\u9ED8\u8BA4\u9690\u85CF\u603B\u66F2\u7EBF")
        ),
        anyVisible ? h(TrendChart, {
          key: trendRange,
          series: trendSeries,
          labels: trendLabels,
          titles: trendTitles,
          emptyText: trendEmpty,
          comp: slotComp,
          above: props.inFloat === true
        }) : h("div", { className: "tm-empty" }, "\u5168\u90E8\u66F2\u7EBF\u5DF2\u9690\u85CF \u2014\u2014 \u70B9\u51FB\u4E0A\u65B9\u6807\u7B7E\u6062\u590D")
      );
    }
    function HeatSection(props) {
      const data = props.data;
      const aggAll = props.aggAll;
      const [heatSpan, setHeatSpan] = useState("6");
      const open = useWidgetOpen(props.widgets, props.widgetId);
      if (props.inPlace && open) return null;
      const HEAT_OPS = [0.16, 0.3, 0.5, 0.72, 0.95];
      return h(
        "div",
        { className: "tm-card" },
        h(
          "div",
          { className: "tm-chart-title" },
          h("span", { className: "tm-chart-name" }, "Token \u6D3B\u52A8\u70ED\u529B\u56FE\uFF08\u60AC\u6D6E\u67E5\u770B\u5F53\u65E5\u660E\u7EC6\uFF09"),
          h(
            "span",
            { style: { display: "inline-flex", gap: 6, alignItems: "center" } },
            h(Seg, {
              options: [
                { v: "1", t: "1\u4E2A\u6708" },
                { v: "3", t: "3\u4E2A\u6708" },
                { v: "6", t: "6\u4E2A\u6708" },
                { v: "12", t: "12\u4E2A\u6708" }
              ],
              current: heatSpan,
              onPick: setHeatSpan
            }),
            widgetBtns(props.widgets, props.widgetId)
          )
        ),
        h(Heatmap, {
          key: heatSpan,
          byDay: aggAll.byDay,
          daySessions: data.daySessions || {},
          models: data.models,
          months: Number(heatSpan),
          above: props.inFloat === true
        }),
        h(
          "div",
          { className: "tm-legend" },
          h("span", { className: "tm-muted" }, "\u5C11"),
          HEAT_OPS.map(
            (o, i) => h("span", { key: i, className: "tm-cell", style: { background: BP, opacity: o } })
          ),
          h("span", { className: "tm-muted" }, "\u591A")
        ),
        // 缓存汇总行（全量）：不悬停也能直接看到缓存读/写与占比
        h(
          "div",
          { className: "tm-cacheRow" },
          h("span", { className: "tm-xdot", style: { background: "#f5a623" } }),
          h("span", null, "\u7F13\u5B58\u8BFB " + fmt2(aggAll.cr)),
          h("span", { className: "tm-cacheSep" }, "\xB7"),
          h("span", { className: "tm-xdot", style: { background: "#9a6ef1" } }),
          h("span", null, "\u7F13\u5B58\u5199 " + fmt2(aggAll.cw)),
          h("span", { className: "tm-cacheSep" }, "\xB7"),
          h(
            "span",
            null,
            "\u7F13\u5B58\u5360\u6BD4 " + (aggAll.total > 0 ? ((aggAll.cr + aggAll.cw) / aggAll.total * 100).toFixed(1) : "0.0") + "%"
          )
        )
      );
    }
    function DonutSection(props) {
      const data = props.data;
      const sc = props.agg;
      const [pop, setPop] = useState(null);
      const open = useWidgetOpen(props.widgets, props.widgetId);
      if (props.inPlace && open) return null;
      const leave = () => setPop(null);
      const arr = sorted(Array.from(sc.byModel.values()), (a, b) => b.t - a.t);
      if (arr.length === 0) return h("div", { className: "tm-card tm-empty" }, "\u8BE5\u8303\u56F4\u5185\u6682\u65E0\u6A21\u578B\u7528\u91CF");
      const donutEntries = arr.slice(0, 7).map((m) => ({ name: m.m, t: m.t, color: modelColor(m.m) }));
      const rest = arr.slice(7);
      if (rest.length > 0)
        donutEntries.push({ name: "\u5176\u4ED6", t: rest.reduce((s, m) => s + m.t, 0), color: "#8a94a6" });
      const modelRows = arr.map((m, i) => {
        const info = data.models[m.m] || null;
        const name = info ? info.model : m.m;
        const color = modelColor(m.m);
        const pct = sc.total > 0 ? m.t / sc.total * 100 : 0;
        const hoverContent = () => breakdown(m.m + " \u7528\u91CF\u6784\u6210", [
          ["\u8F93\u5165", m.i, 1, m.t],
          ["\u8F93\u51FA", m.o, 1, m.t],
          ["\u7F13\u5B58\u8BFB", m.cr, 1, m.t],
          ["\u7F13\u5B58\u5199", m.cw, 1, m.t]
        ]);
        return h(
          "div",
          {
            key: m.m,
            className: "tm-model",
            onMouseEnter: (e) => setPop({ mx: e.clientX, my: e.clientY, content: hoverContent() }),
            onMouseMove: (e) => setPop({ mx: e.clientX, my: e.clientY, content: hoverContent() }),
            onMouseLeave: leave
          },
          h("span", { className: "tm-dot", style: { background: color } }),
          h(
            "div",
            { style: { minWidth: 0, flex: "1" } },
            h(
              "div",
              { className: "tm-modelhead" },
              h("span", { className: "tm-modelname" }, name),
              h("span", { className: "tm-modelval" }, fmt2(m.t) + " \xB7 " + pct.toFixed(1) + "%")
            ),
            h(
              "div",
              { className: "tm-bartrack" },
              h("span", {
                className: "tm-barfill",
                style: {
                  width: (m.t / arr[0].t * 100).toFixed(1) + "%",
                  background: color,
                  animationDelay: i * 40 + 120 + "ms"
                }
              })
            ),
            h(
              "div",
              { className: "tm-muted tm-modeldetail" },
              (info && info.provider ? info.provider + " \xB7 " : "") + "\u8F93\u5165 " + fmt2(m.i) + " \xB7 \u8F93\u51FA " + fmt2(m.o) + " \xB7 \u7F13\u5B58 " + fmt2(m.cr + m.cw) + " \xB7 " + fmtFull(m.n) + " \u6B21"
            )
          )
        );
      });
      return h(
        "div",
        { className: "tm-card" },
        props.prepend ? props.prepend : null,
        h(
          "div",
          { className: "tm-chart-title" },
          h("span", { className: "tm-chart-name" }, "\u6A21\u578B\u7528\u91CF\u5206\u5E03\uFF08" + props.rangeLabel + " \xB7 \u60AC\u6D6E\u67E5\u770B\u6784\u6210\uFF09"),
          widgetBtns(props.widgets, props.widgetId)
        ),
        h(
          "div",
          { className: "tm-flexrow" },
          h(Donut, { entries: donutEntries, total: sc.total }),
          h("div", { className: "tm-models" }, modelRows)
        ),
        pop !== null ? tmPortal(
          h(
            "div",
            {
              className: "tm-pop" + (props.inFloat ? " tm-tip-above" : ""),
              style: tipPos2(pop.mx, pop.my, 280, 60)
            },
            pop.content
          )
        ) : null
      );
    }
    function StatsWidget(props) {
      const { data, err, loading } = useSharedStats();
      const [range, setRange] = useState("30");
      const aggAll = React.useMemo(() => {
        if (!data) return null;
        buildModelColors(data.models || {});
        return aggregate(data.records || [], null);
      }, [data]);
      if (!data || !aggAll) {
        return h(
          "div",
          { className: "tm-hint" },
          err ? "\u7EDF\u8BA1\u52A0\u8F7D\u5931\u8D25\uFF1A" + err : loading ? "\u6B63\u5728\u805A\u5408\u4F1A\u8BDD\u65E5\u5FD7\u2026" : "\u6682\u65E0\u6570\u636E\uFF08\u6253\u5F00\u53F3\u4FA7\u680F\u7528\u91CF\u9762\u677F\u53EF\u52A0\u901F\u52A0\u8F7D\uFF09"
        );
      }
      const aa = aggAll;
      const w = { widgets: props.widgets, widgetId: props.widgetId };
      if (props.kind === "trend") return h(TrendSection, { data, aggAll: aa, inFloat: true, ...w });
      if (props.kind === "heat") return h(HeatSection, { data, aggAll: aa, inFloat: true, ...w });
      if (props.kind === "donut") {
        const tk = keyOf2(Date.now());
        const cut = range === "all" ? null : keyOf2(fromKey(tk) - (Number(range) - 1) * 864e5);
        const scoped = cut === null ? null : aggregate(data.records || [], cut);
        return h(DonutSection, {
          data,
          agg: scoped !== null ? scoped : aa,
          rangeLabel: rangeText(range),
          inFloat: true,
          ...w,
          prepend: h(
            "div",
            { className: "tm-segRow" },
            h(Seg, {
              options: [
                { v: "7", t: "\u8FD17\u5929" },
                { v: "30", t: "\u8FD130\u5929" },
                { v: "90", t: "\u8FD190\u5929" },
                { v: "all", t: "\u5168\u90E8" }
              ],
              current: range,
              onPick: setRange
            })
          )
        });
      }
      if (props.kind === "today")
        return h(TodayCard, { wide: true, bare: true, name: "\u4ECA\u65E5\u6D88\u8017", inFloat: true, ...w });
      return h(StatCardsSection, { aggAll: aa, data, inFloat: true, ...w });
    }
    function StatsSettingsPage(props) {
      const showPrefs = props.showPrefs !== false;
      const Btn = P.Button || (({ children: children2, ...rest }) => h("button", { type: "button", className: "tm-btn", ...rest }, children2));
      const [data, setData] = useState(null);
      const [err, setErr] = useState(null);
      const [loading, setLoading] = useState(true);
      const [range, setRange] = useState(props.defaultRange || "all");
      const [todayOn, setTodayOn] = useState(false);
      const fl = useTmTodayFloat();
      React.useEffect(() => {
        setRange(props.defaultRange || "all");
      }, [props.defaultRange]);
      React.useEffect(() => {
        setTodayOn(props.showToday === true);
      }, [props.showToday]);
      const inflight = React.useRef(false);
      const lastSig = React.useRef(null);
      const spinTimer = React.useRef(0);
      const dataRef = React.useRef(null);
      dataRef.current = data;
      const stallRef = React.useRef({ scanned: -1, same: 0 });
      const sigOf = (v) => v.scanned + "/" + v.total + "/" + v.errors + "/" + (v.partial ? 1 : 0) + "/" + v.records.length + "/" + v.records.reduce((s, r) => s + tok(r), 0);
      const refresh = React.useCallback((force) => {
        if (inflight.current && force !== true) return;
        inflight.current = true;
        window.clearTimeout(spinTimer.current);
        spinTimer.current = window.setTimeout(() => setLoading(true), 400);
        fetchStats().then((value) => {
          window.clearTimeout(spinTimer.current);
          inflight.current = false;
          setLoading(false);
          if (value && value.ready === true) {
            writeShared(value);
            const sig = sigOf(value);
            if (sig !== lastSig.current) {
              lastSig.current = sig;
              setData(value);
              setErr(null);
            }
          } else setErr(value && value.error || "\u7EDF\u8BA1\u670D\u52A1\u4E0D\u53EF\u7528");
        }).catch((e) => {
          window.clearTimeout(spinTimer.current);
          inflight.current = false;
          setLoading(false);
          setErr(String(e?.message ?? e));
        });
      }, []);
      React.useEffect(() => {
        refresh(true);
      }, [refresh]);
      React.useEffect(() => {
        const tick = () => {
          if (document.visibilityState === "visible") refresh();
        };
        const id = window.setInterval(tick, 6e4);
        const onVis = () => {
          if (document.visibilityState === "visible") refresh();
        };
        document.addEventListener("visibilitychange", onVis);
        return () => {
          window.clearInterval(id);
          document.removeEventListener("visibilitychange", onVis);
          window.clearTimeout(spinTimer.current);
        };
      }, [refresh]);
      React.useEffect(() => {
        if (data === null || data.partial !== true) {
          stallRef.current.same = 0;
          return void 0;
        }
        let alive = true;
        let timer = 0;
        const st = stallRef.current;
        if (data.scanned === st.scanned) st.same++;
        else {
          st.same = 0;
          st.scanned = data.scanned;
        }
        const arm = () => {
          if (!alive) return;
          timer = window.setTimeout(
            () => {
              if (!alive) return;
              const d = dataRef.current;
              if (d !== null && d.partial === true) {
                if (d.scanned === st.scanned) st.same++;
                else {
                  st.same = 0;
                  st.scanned = d.scanned;
                }
                if (document.visibilityState === "visible") refresh();
              }
              arm();
            },
            st.same >= 8 ? 12e3 : 2e3
          );
        };
        arm();
        return () => {
          alive = false;
          window.clearTimeout(timer);
        };
      }, [data, refresh]);
      const derived = React.useMemo(() => {
        if (data === null) return null;
        buildModelColors(data.models || {});
        const tk = keyOf2(Date.now());
        const c = range === "all" ? null : keyOf2(fromKey(tk) - (Number(range) - 1) * 864e5);
        return {
          todayK: tk,
          cut: c,
          scoped: c === null ? null : aggregate(data.records || [], c),
          aggAll: aggregate(data.records || [], null)
        };
      }, [data, range]);
      const setToday = async (on) => {
        setTodayOn(on);
        try {
          await saveConfig({ showToday: on });
        } catch {
        }
        try {
          window.dispatchEvent(new CustomEvent("tm-today-toggle", { detail: { on } }));
        } catch {
        }
        props.onPrefs();
      };
      const children = [];
      children.push(h("h3", { className: "tm-title" }, "Token \u7528\u91CF\u7EDF\u8BA1"));
      if (showPrefs) {
        children.push(
          h(
            "p",
            { className: "tm-desc" },
            "\u805A\u5408\u672C\u673A\u5168\u90E8\u4F1A\u8BDD\u65E5\u5FD7\uFF08\u542B\u5B50\u4EE3\u7406\u4F1A\u8BDD\uFF1Bfork/resume \u79CD\u5B50\u4E8B\u4EF6\u5DF2\u53BB\u91CD\uFF09\u3002\u6570\u636E\u6BCF 60 \u79D2\u81EA\u52A8\u5237\u65B0\uFF1B\u65F6\u95F4\u8303\u56F4\u4F5C\u7528\u4E8E\u5F53\u524D\u8303\u56F4\u5361\u7247\u4E0E\u6A21\u578B\u5206\u5E03\uFF0C\u8D8B\u52BF\u56FE\u7528\u81EA\u5E26\u7684\u8FD124\u5C0F\u65F6 / \u8FD17\u5929 / \u8FD130\u5929\u5207\u6362\uFF0C\u603B\u89C8\u4E0E\u70ED\u529B\u56FE\u4E3A\u5168\u91CF\u6570\u636E\u3002"
          )
        );
      }
      if (showPrefs) {
        children.push(
          h(
            "div",
            { className: "tm-swrow" },
            h(
              "div",
              { className: "tm-swrowText" },
              h("div", { className: "tm-swlabel" }, "\u5728\u4FA7\u8FB9\u680F\u663E\u793A\u4ECA\u65E5\u7528\u91CF"),
              h(
                "div",
                { className: "tm-swhint" },
                "\u5F00\u542F\u540E\u5DE6\u4FA7\u8FB9\u680F\u5E95\u90E8\u663E\u793A\u4ECA\u65E5 Token \u6D88\u8017\u5C0F\u5361\u7247\uFF08\u542B\u5206\u8272\u5C0F\u65F6\u66F2\u7EBF\u4E0E\u6628\u65E5\u5BF9\u6BD4\uFF1B\u504F\u597D\u5B58 settings.yaml \xB7 dshp-token-meter\uFF09"
              )
            ),
            h(
              "button",
              {
                className: "tm-switch",
                role: "switch",
                "aria-checked": todayOn ? "true" : "false",
                "aria-label": "\u5728\u4FA7\u8FB9\u680F\u663E\u793A\u4ECA\u65E5\u7528\u91CF",
                onClick: () => void setToday(!todayOn)
              },
              h("span", { className: "tm-knob" })
            )
          )
        );
        children.push(
          h(
            "div",
            { className: "tm-swrow" },
            h(
              "div",
              { className: "tm-swrowText" },
              h("div", { className: "tm-swlabel" }, "\u4ECA\u65E5\u5361\u7247\u6D6E\u7A97"),
              h(
                "div",
                { className: "tm-swhint" },
                "\u5F39\u51FA\u540E\u53EF\u62D6\u5230\u5C4F\u5E55\u4EFB\u610F\u4F4D\u7F6E\uFF0C\u4FA7\u8FB9\u680F\u4E0D\u518D\u5360\u4F4D\uFF1B\u5F00\u5173\u4E0E\u5750\u6807\u5B58\u672C\u673A localStorage"
              )
            ),
            fl.open ? h(Btn, { variant: "outline", size: "sm", onClick: () => tmTodaySet(false) }, "\u6536\u56DE\u4FA7\u8FB9\u680F") : h("div", { className: "tm-hint" }, "\u5728\u4FA7\u8FB9\u680F\u4E2D\uFF08\u5361\u7247\u6807\u9898\u680F \u283F \u53EF\u62D6\u51FA\uFF09")
          )
        );
      }
      if (err) {
        children.push(h("div", { className: "tm-notice tm-notice-err" }, "\u8BFB\u53D6\u5931\u8D25\uFF1A" + err));
        children.push(h(Btn, { variant: "outline", size: "sm", onClick: () => refresh(true) }, "\u91CD\u8BD5"));
        return h("div", { className: "tm-page" }, children);
      }
      if (data === null) {
        children.push(
          h("div", { className: "tm-notice tm-notice-empty" }, loading ? "\u6B63\u5728\u7EDF\u8BA1\u4F1A\u8BDD\u65E5\u5FD7\u2026" : "\u6682\u65E0\u6570\u636E")
        );
        return h("div", { className: "tm-page" }, children);
      }
      const dd = derived;
      const scoped = dd.scoped;
      const aggAll = dd.aggAll;
      const hasData = aggAll.first !== null;
      children.push(
        h(
          "div",
          { className: "tm-toolbar" },
          h("label", { className: "tm-hint" }, "\u65F6\u95F4\u8303\u56F4"),
          h(RangeSelect, { options: RANGES, value: range, onPick: (v) => setRange(v) }),
          h(
            "span",
            { className: "tm-hint", style: { marginLeft: "auto" } },
            "\u66F4\u65B0\u4E8E " + hhmm(data.generatedAt) + (loading ? " \xB7 \u5237\u65B0\u4E2D\u2026" : "")
          ),
          data.storage === "disabled" ? P.Tooltip ? h(
            P.Tooltip,
            {
              label: "\u7EDF\u8BA1\u4ECD\u6B63\u5E38\u8FD0\u884C\uFF1B\u91CD\u542F\u540E\u9700\u5168\u91CF\u91CD\u626B\u3002\u8BE6\u60C5\u89C1\u5BBF\u4E3B\u65E5\u5FD7 [dshp-token-meter] storage domain",
              side: "bottom"
            },
            h("span", { className: "tm-hint", style: { cursor: "help" } }, "\u26A0 \u65E0\u6301\u4E45\u7F13\u5B58")
          ) : h("span", { className: "tm-hint", title: "\u7EDF\u8BA1\u4ECD\u6B63\u5E38\u8FD0\u884C\uFF1B\u91CD\u542F\u540E\u9700\u5168\u91CF\u91CD\u626B" }, "\u26A0 \u65E0\u6301\u4E45\u7F13\u5B58") : null,
          h(
            Btn,
            {
              variant: "outline",
              size: "sm",
              onClick: () => refresh(),
              disabled: loading,
              icon: loading && P.IconLoadingOutline16 ? h(P.IconLoadingOutline16) : P.IconRefreshOutline14 ? h(P.IconRefreshOutline14) : void 0
            },
            loading ? "\u5237\u65B0\u4E2D\u2026" : "\u5237\u65B0"
          )
        )
      );
      {
        const pct = data.total > 0 ? Math.round(data.scanned / data.total * 100) : 0;
        children.push(
          data.partial === true ? h(
            "div",
            {
              className: "tm-notice tm-notice-empty",
              style: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }
            },
            h(
              "span",
              null,
              "\u540E\u53F0\u7EDF\u8BA1\u4E2D " + pct + "%\uFF08" + data.scanned + "/" + data.total + " \u4E2A\u4F1A\u8BDD\uFF09\u2014\u2014 \u5DF2\u626B\u63CF\u90E8\u5206\u5148\u5C55\u793A\uFF0C\u5B8C\u6210\u540E\u81EA\u52A8\u8865\u5168\u3002"
            ),
            data.errors > 0 ? h(
              "span",
              { className: "tm-muted" },
              data.errors + " \u4E2A\u4F1A\u8BDD\u8BFB\u53D6\u5931\u8D25\u5DF2\u8DF3\u8FC7"
            ) : null
          ) : null
        );
      }
      if (!hasData) {
        children.push(
          h(
            "div",
            { className: "tm-empty" },
            "\u6682\u65E0 Token \u7528\u91CF\u6570\u636E \u2014 \u53D1\u8D77\u4E00\u6B21\u5BF9\u8BDD\u540E\u4F1A\u81EA\u52A8\u7EDF\u8BA1\uFF08\u5DF2\u626B\u63CF " + data.sessions + " \u4E2A\u4F1A\u8BDD\uFF09"
          )
        );
        return h("div", { className: "tm-page" }, children);
      }
      children.push(
        h(StatCardsSection, {
          aggAll,
          data,
          widgets: props.widgets || null,
          widgetId: "stats:cards",
          inPlace: true
        })
      );
      children.push(
        scoped !== null ? h(
          "div",
          { className: "tm-card" },
          h(
            "div",
            {
              style: {
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                flexWrap: "wrap"
              }
            },
            h("span", { className: "tm-muted" }, "\u5F53\u524D\u8303\u56F4\uFF08" + rangeText(range) + "\uFF09"),
            h(
              "span",
              { style: { fontVariantNumeric: "tabular-nums" } },
              fmt2(scoped.total) + " tokens \xB7 \u8F93\u5165 " + fmt2(scoped.i) + " \xB7 \u8F93\u51FA " + fmt2(scoped.o) + " \xB7 " + fmtFull(scoped.n) + " \u6B21\u8C03\u7528"
            )
          )
        ) : null
      );
      children.push(
        h(TrendSection, {
          data,
          aggAll,
          widgets: props.widgets || null,
          widgetId: "stats:trend",
          inPlace: true
        })
      );
      children.push(
        h(HeatSection, {
          data,
          aggAll,
          widgets: props.widgets || null,
          widgetId: "stats:heat",
          inPlace: true
        })
      );
      children.push(
        h(DonutSection, {
          data,
          agg: scoped !== null ? scoped : aggAll,
          rangeLabel: rangeText(range),
          widgets: props.widgets || null,
          widgetId: "stats:donut",
          inPlace: true
        })
      );
      children.push(
        h(
          "div",
          { className: "tm-muted", style: { margin: "4px 2px 0" } },
          "\u7EDF\u8BA1\u53E3\u5F84\uFF1A\u603B Token = \u8F93\u5165 + \u7F13\u5B58\u8BFB + \u7F13\u5B58\u5199 + \u8F93\u51FA\uFF08reasoning \u5DF2\u542B\u5728\u8F93\u51FA\u5185\uFF09\uFF1B\u540C\u4E00\u8BF7\u6C42\u7684\u91C7\u6837 usage \u88AB\u7EC8\u503C\u8986\u76D6\uFF0C\u4E0D\u91CD\u590D\u7D2F\u8BA1\uFF1Bfork/resume \u79CD\u5B50\u4E8B\u4EF6\u5DF2\u53BB\u91CD\u3002"
        )
      );
      return h("div", { className: "tm-page" }, children);
    }
    function TodayCard(props) {
      const wide = !(props && props.wide === false);
      const isFloat = !!(props && props.float === true);
      const bare = !!(props && props.bare === true);
      const floatPos = props && props.floatPos || null;
      const floatXY = isFloat ? tmTodayClamp(floatPos || tmTodayLoadPos() || tmTodayDefaultPos()) : null;
      const [data, setData] = useState(null);
      const [tip, setTip] = useState(null);
      const doRefresh = React.useCallback(() => {
        fetchStats().then((v) => {
          if (v && v.ready === true) setData(v);
        }).catch(() => {
        });
      }, []);
      React.useEffect(() => {
        doRefresh();
        const id = window.setInterval(() => {
          if (document.visibilityState === "visible") doRefresh();
        }, 6e4);
        return () => {
          window.clearInterval(id);
        };
      }, [doRefresh]);
      if (data === null) {
        if (isFloat) {
          return h(
            "div",
            {
              className: "tm-float",
              style: { left: floatXY.x + "px", top: floatXY.y + "px" }
            },
            h(
              "div",
              {
                className: "tm-todayhead tm-floathead",
                title: "\u6309\u4F4F\u62D6\u5230\u4EFB\u610F\u4F4D\u7F6E \xB7 \u53CC\u51FB\u6536\u56DE\u4FA7\u8FB9\u680F",
                onPointerDown: tmFloatDrag,
                onDoubleClick: () => tmTodaySet(false)
              },
              h("span", { className: "tm-todaylabel" }, "\u4ECA\u65E5\u7528\u91CF"),
              h("span", { className: "tm-todayval", style: { opacity: 0.5 } }, "\u2026"),
              h(
                "button",
                {
                  className: "tm-minibtn",
                  title: "\u6536\u56DE\u4FA7\u8FB9\u680F",
                  onClick: (e) => {
                    if (e.stopPropagation) e.stopPropagation();
                    tmTodaySet(false);
                  }
                },
                "\u{1F4CC}"
              )
            )
          );
        }
        return h(
          "div",
          { className: "tm-today" + (wide ? "" : " tm-todayRail") },
          h("div", { className: "tm-todaylabel" }, "\u4ECA\u65E5\u7528\u91CF"),
          h("div", { className: "tm-todayval", style: { opacity: 0.5 } }, "\u2026")
        );
      }
      buildModelColors(data.models || {});
      const todayK = keyOf2(Date.now());
      const yK = keyOf2(fromKey(todayK) - 864e5);
      const both = aggregate(data.records || [], yK);
      const dayTotal = (k) => {
        const d = both.byDay.get(k);
        return d === void 0 ? 0 : d.t;
      };
      const todayTotal = dayTotal(todayK);
      const yTotal = dayTotal(yK);
      const delta = yTotal > 0 ? (todayTotal - yTotal) / yTotal * 100 : null;
      if (!wide) {
        const showTip = (e) => setTip({ mx: e.clientX, my: e.clientY });
        const hideTip = () => setTip(null);
        const dTxt = delta === null ? todayTotal > 0 ? "\u6628\u65E5\u65E0\u6D88\u8017" : "\u2014" : (delta >= 0 ? "+" : "") + delta.toFixed(0) + "% vs \u6628\u65E5";
        return h(
          "div",
          {
            className: "tm-today tm-todayRail",
            onMouseEnter: showTip,
            onMouseMove: showTip,
            onMouseLeave: hideTip
          },
          h("div", { className: "tm-todaylabel" }, "\u4ECA\u65E5"),
          h(AnimatedNumber, { className: "tm-todayval", value: todayTotal, format: fmtRail }),
          h(DualBars, { className: "tm-dualbars", a: todayTotal, b: yTotal }),
          tip === null ? null : (() => {
            const pos = tipPos2(tip.mx, tip.my, 190, 82);
            return tmPortal(
              h(
                "div",
                { className: "tm-tipfixed", style: pos },
                h(
                  "div",
                  { className: "tm-tiprow", style: { fontWeight: 600, marginBottom: 2 } },
                  "\u4ECA\u65E5\u7528\u91CF"
                ),
                h(
                  "div",
                  { className: "tm-tiprow" },
                  h("span", { className: "tm-tip-k" }, "\u4ECA\u65E5"),
                  h("span", { className: "tm-tip-v" }, fmt2(todayTotal))
                ),
                h(
                  "div",
                  { className: "tm-tiprow" },
                  h("span", { className: "tm-tip-k" }, "\u6628\u65E5"),
                  h("span", { className: "tm-tip-v" }, fmt2(yTotal))
                ),
                h(
                  "div",
                  { className: "tm-tiprow" },
                  h("span", { className: "tm-tip-k" }, "\u5BF9\u6BD4"),
                  h("span", { className: "tm-tip-v" }, dTxt)
                )
              )
            );
          })()
        );
      }
      const endH = /* @__PURE__ */ new Date();
      endH.setMinutes(0, 0, 0);
      const hourSlots = [];
      for (let k = 23; k >= 0; k--) {
        const t = endH.getTime() - k * 36e5;
        hourSlots.push({ d: keyOf2(t), h: new Date(t).getHours() });
      }
      const hourLabels = hourSlots.map((s) => s.d === todayK ? s.h + ":00" : "\u6628\u65E5" + s.h + ":00");
      const hourIdx = /* @__PURE__ */ new Map();
      for (let i = 0; i < hourSlots.length; i++)
        hourIdx.set(
          hourSlots[i].d + "|" + hourSlots[i].h,
          i
        );
      const hourArrs = /* @__PURE__ */ new Map();
      for (const r of data.records || []) {
        const idx = hourIdx.get(r.d + "|" + r.h);
        if (idx === void 0) continue;
        let arr = hourArrs.get(r.m);
        if (arr === void 0) {
          arr = Array.from({ length: 24 }, () => 0);
          hourArrs.set(r.m, arr);
        }
        arr[idx] += tok(r);
      }
      const modelHourSeries = [];
      for (const mk of sorted(Array.from(hourArrs.keys()))) {
        modelHourSeries.push({
          name: mk,
          shortName: (data.models[mk] || {}).model || mk,
          color: modelColor(mk),
          values: hourArrs.get(mk),
          visible: true
        });
      }
      return h(
        "div",
        isFloat ? {
          className: "tm-float",
          style: { left: floatXY.x + "px", top: floatXY.y + "px" }
        } : { className: "tm-today" },
        h(
          "div",
          isFloat ? {
            className: "tm-todayhead tm-floathead",
            title: "\u6309\u4F4F\u62D6\u5230\u4EFB\u610F\u4F4D\u7F6E \xB7 \u53CC\u51FB\u6536\u56DE\u4FA7\u8FB9\u680F",
            onPointerDown: tmFloatDrag,
            onDoubleClick: () => tmTodaySet(false)
          } : { className: "tm-todayhead" },
          isFloat || bare ? null : h(
            "span",
            { className: "tm-grip", title: "\u6309\u4F4F\u62D6\u51FA\u4E3A\u6D6E\u7A97\uFF0C\u70B9\u6309\u76F4\u63A5\u5F39\u51FA", onPointerDown: tmGripDragOut },
            "\u283F"
          ),
          h("span", { className: "tm-todaylabel" }, props.name || "\u4ECA\u65E5 Token"),
          h(AnimatedNumber, { className: "tm-todayval", value: todayTotal, format: fmt2 }),
          bare ? widgetBtns(props.widgets, props.widgetId) : h(
            "button",
            {
              className: "tm-minibtn",
              title: isFloat ? "\u6536\u56DE\u4FA7\u8FB9\u680F" : "\u5F39\u51FA\u4E3A\u6D6E\u7A97\uFF08\u53EF\u62D6\u5230\u5C4F\u5E55\u4EFB\u610F\u4F4D\u7F6E\uFF09",
              onClick: (e) => {
                if (e.stopPropagation) e.stopPropagation();
                tmTodaySet(!isFloat);
              }
            },
            isFloat ? "\u{1F4CC}" : "\u29C9"
          )
        ),
        h(TodayChart, {
          series: modelHourSeries,
          n: 24,
          labels: hourLabels,
          floatTip: isFloat || props.inFloat === true
        }),
        modelHourSeries.length > 0 ? h(
          "div",
          { className: "tm-todaymodels" },
          modelHourSeries.map(
            (s, si) => h(
              "span",
              {
                key: s.name,
                className: "tm-todaymchip tm-fadein",
                style: { animationDelay: si * 60 + "ms" }
              },
              h("span", { className: "tm-dot", style: { background: s.color } }),
              h("span", null, s.shortName)
            )
          )
        ) : null,
        delta !== null ? h(
          "div",
          {
            className: "tm-statgrow tm-fadein",
            style: {
              marginTop: 4,
              color: delta >= 0 ? "var(--dsw-alias-state-success-primary)" : "var(--dsw-alias-state-error-primary)",
              fontSize: 10.5
            }
          },
          h("span", { className: "tm-arrow " + (delta >= 0 ? "tm-arrow-up" : "tm-arrow-down") }),
          h("span", null, (delta >= 0 ? "+" : "") + delta.toFixed(0) + "% vs \u6628\u65E5")
        ) : h(
          "div",
          { className: "tm-muted", style: { fontSize: 10, marginTop: 4 } },
          todayTotal > 0 ? "\u6628\u65E5\u65E0\u6D88\u8017" : "\u5F00\u59CB\u4F7F\u7528\u540E\u7EDF\u8BA1"
        )
      );
    }
    function TodayFloatEntry() {
      React.useRef(true);
      const fl = useTmTodayFloat();
      const [showToday, setShowToday] = useState(null);
      React.useEffect(() => {
        fetch("/ext/dshp-token-meter/state", { cache: "no-store" }).then((r) => r.json()).then((s) => {
          if (s && s.ok && s.config) setShowToday(s.config.showToday === true);
        }).catch(() => {
        });
        const fn = (ev) => {
          if (ev && ev.detail) setShowToday(!!ev.detail.on);
        };
        const wrap = (ev) => fn(ev.detail ? { detail: ev.detail } : ev);
        window.addEventListener("tm-today-toggle", wrap);
        return () => window.removeEventListener("tm-today-toggle", wrap);
      }, []);
      if (showToday !== true || !fl.open) return null;
      const pos = tmTodayClamp(fl.pos || tmTodayLoadPos() || tmTodayDefaultPos());
      return h(TodayCard, { wide: true, float: true, floatPos: pos });
    }
    return {
      StatsSettingsPage,
      TodayCard,
      TodayFloatEntry,
      useTmTodayFloat,
      tmTodayFloat,
      tmTodaySet,
      StatsWidget,
      StatCardsSection,
      TrendSection,
      HeatSection,
      DonutSection,
      HiddenWhenFloated,
      /** 共享统计快照（60s 可见即刷）：在线时长面板复用它，避免两套轮询各打一次 /stats */
      useSharedStats
    };
  }

  // src/client/widgets.ts
  var LS_KEY = "tm-widgets";
  var FLOAT_W = 360;
  var FLOAT_H = Math.round(FLOAT_W * 0.6);
  function loadAll() {
    try {
      const raw = window.localStorage.getItem(LS_KEY) || "null";
      const v = JSON.parse(raw);
      if (v && typeof v === "object") {
        const out = {};
        for (const k of Object.keys(v)) {
          const p = v[k];
          if (p && isFinite(p.x) && isFinite(p.y)) out[k] = { x: Number(p.x), y: Number(p.y) };
        }
        return out;
      }
    } catch {
    }
    return {};
  }
  function saveAll(open) {
    try {
      window.localStorage.setItem(LS_KEY, JSON.stringify(open));
    } catch {
    }
  }
  function clampPos(p) {
    try {
      const vw = window.innerWidth || 1024;
      const vh = window.innerHeight || 768;
      return {
        x: Math.max(8, Math.min(p.x, vw - FLOAT_W)),
        y: Math.max(8, Math.min(p.y, vh - FLOAT_H))
      };
    } catch {
      return p;
    }
  }
  function cascadePos(count) {
    try {
      const vw = window.innerWidth || 1024;
      const vh = window.innerHeight || 768;
      const step = count % 8 * 36;
      return {
        x: Math.max(8, Math.min(vw - FLOAT_W - 24 - step, vw - FLOAT_W)),
        y: Math.max(8, Math.min(96 + step, vh - FLOAT_H))
      };
    } catch {
      return { x: 120, y: 120 };
    }
  }
  function createWidgetSystem(React, ReactDOM) {
    const h = React.createElement;
    let open = typeof window !== "undefined" ? loadAll() : {};
    let order = Object.keys(open);
    const listeners = /* @__PURE__ */ new Set();
    function emit(save) {
      if (save) saveAll(open);
      for (const fn of listeners) {
        try {
          fn();
        } catch {
        }
      }
    }
    function portal(node) {
      if (node === null || node === void 0) return null;
      try {
        if (ReactDOM && typeof ReactDOM.createPortal === "function" && typeof document !== "undefined" && document.body) {
          return ReactDOM.createPortal(node, document.body);
        }
      } catch {
      }
      return node;
    }
    function raise(id) {
      const i = order.indexOf(id);
      if (i < 0 || i === order.length - 1) return;
      order = order.filter((x) => x !== id).concat(id);
      emit(false);
    }
    function zOf(id) {
      const i = order.indexOf(id);
      return 300 + (i < 0 ? 0 : i);
    }
    function useWidgets() {
      const [, force] = React.useReducer((x) => x + 1, 0);
      React.useEffect(() => {
        const fn = () => force();
        listeners.add(fn);
        return () => {
          listeners.delete(fn);
        };
      }, []);
      return Object.keys(open).map((id) => ({
        id,
        pos: open[id]
      }));
    }
    function isOpen(id) {
      return Object.hasOwn(open, id);
    }
    function openWidget(id, at) {
      const pos = clampPos(
        at || open[id] || cascadePos(Object.keys(open).length)
      );
      open = Object.assign({}, open, { [id]: pos });
      order = order.filter((x) => x !== id).concat(id);
      emit(true);
    }
    function forget(prefix) {
      const next = Object.assign({}, open);
      let changed = false;
      for (const id of Object.keys(next)) {
        if (!id.startsWith(prefix)) continue;
        delete next[id];
        order = order.filter((x) => x !== id);
        changed = true;
      }
      if (!changed) return;
      open = next;
      emit(true);
    }
    function closeWidget(id) {
      if (!Object.hasOwn(open, id)) return;
      const next = Object.assign({}, open);
      delete next[id];
      open = next;
      order = order.filter((x) => x !== id);
      emit(true);
    }
    function moveWidget(id, pos) {
      if (!Object.hasOwn(open, id)) return;
      open = Object.assign({}, open, { [id]: clampPos(pos) });
      emit(false);
    }
    function commitWidget() {
      emit(true);
    }
    function clampAllToViewport() {
      let changed = false;
      const next = Object.assign({}, open);
      for (const id of Object.keys(next)) {
        const c = clampPos(next[id]);
        if (c.x !== next[id].x || c.y !== next[id].y) {
          next[id] = c;
          changed = true;
        }
      }
      if (changed) {
        open = next;
        emit(true);
      }
    }
    function gripOut(id, e) {
      if (e.button !== void 0 && e.button !== 0) return;
      if (e.preventDefault) e.preventDefault();
      if (e.stopPropagation) e.stopPropagation();
      if (Object.hasOwn(open, id)) {
        startDrag(id, open[id], e, true);
        return;
      }
      const sx = e.clientX;
      const sy = e.clientY;
      let ox = -60, oy = -20;
      try {
        const t = e.target;
        if (t && t.closest) {
          const card = t.closest("[data-tm-widget], .tm-card, .tm-today");
          if (card) {
            const r = card.getBoundingClientRect();
            ox = e.clientX - r.left;
            oy = e.clientY - r.top;
          }
        }
      } catch {
      }
      let out = false;
      function mv(ev) {
        if (!out && Math.hypot(ev.clientX - sx, ev.clientY - sy) < 8) return;
        out = true;
        openWidget(id, { x: ev.clientX - ox, y: ev.clientY - oy });
      }
      function up() {
        try {
          window.removeEventListener("pointermove", mv);
        } catch {
        }
        try {
          window.removeEventListener("pointerup", up);
        } catch {
        }
        if (!out) openWidget(id);
      }
      try {
        window.addEventListener("pointermove", mv);
      } catch {
      }
      try {
        window.addEventListener("pointerup", up);
      } catch {
      }
    }
    function gripProps(id) {
      return { onPointerDown: (e) => gripOut(id, e) };
    }
    function startDrag(id, cur, e, fromGrip) {
      if (e.button !== void 0 && e.button !== 0) return;
      if (e.target && e.target.closest) {
        const skip = e.target.closest("button, input, select, textarea, a, .tm-seg, .tm-modelchip, .tm-switch") || !fromGrip && e.target.closest(".tm-grip");
        if (skip) return;
      }
      if (e.preventDefault) e.preventDefault();
      const ox = e.clientX - cur.x;
      const oy = e.clientY - cur.y;
      function mv(ev) {
        moveWidget(id, { x: ev.clientX - ox, y: ev.clientY - oy });
      }
      function up() {
        try {
          window.removeEventListener("pointermove", mv);
        } catch {
        }
        try {
          window.removeEventListener("pointerup", up);
        } catch {
        }
        commitWidget();
      }
      try {
        window.addEventListener("pointermove", mv);
      } catch {
      }
      try {
        window.addEventListener("pointerup", up);
      } catch {
      }
    }
    function WidgetFloat(props) {
      const list = useWidgets();
      const cur = list.filter((w) => w.id === props.id)[0];
      React.useEffect(() => {
        const onR = () => {
          const p = open[props.id];
          if (!p) return;
          const c = clampPos(p);
          if (c.x !== p.x || c.y !== p.y) moveWidget(props.id, c);
        };
        window.addEventListener("resize", onR);
        return () => window.removeEventListener("resize", onR);
      }, [props.id]);
      if (!cur) return null;
      return portal(
        h(
          "div",
          {
            className: "tm-widgetFloat tm-in",
            style: {
              left: cur.pos.x + "px",
              top: cur.pos.y + "px",
              width: FLOAT_W + "px",
              zIndex: zOf(props.id)
            },
            onPointerDown: (e) => {
              raise(props.id);
              const t = e.target;
              if (t && t.closest && t.closest("button, input, select, textarea, a, .tm-grip, .tm-seg, .tm-modelchip, .tm-switch"))
                return;
              startDrag(props.id, cur.pos, e);
            }
          },
          props.children
        )
      );
    }
    function WidgetToggle(props) {
      const list = useWidgets();
      const opened = list.some((w) => w.id === props.id);
      const what = props.name ? "\u300C" + props.name + "\u300D" : "\u672C\u5361\u7247";
      return h(
        "span",
        { style: { display: "inline-flex", gap: 2, alignItems: "center", marginLeft: 6, flex: "none" } },
        h(
          "span",
          Object.assign(
            {
              className: "tm-grip",
              title: opened ? what + " \u5DF2\u5F39\u51FA\u4E3A\u72EC\u7ACB\u6D6E\u7A97\uFF08\u53EF\u62D6\u52A8\uFF09" : "\u6309\u4F4F\u62D6\u51FA " + what + " \u4E3A\u72EC\u7ACB\u6D6E\u7A97\uFF0C\u70B9\u6309\u76F4\u63A5\u5F39\u51FA",
              "aria-label": "\u62D6\u52A8\u6216\u5F39\u51FA " + what
            },
            gripProps(props.id)
          ),
          "\u283F"
        ),
        opened ? h(
          "button",
          {
            className: "tm-minibtn",
            title: "\u628A " + what + " \u6536\u56DE\u539F\u4F4D\uFF08\u5173\u95ED\u6D6E\u7A97\uFF09",
            onClick: () => closeWidget(props.id)
          },
          "\u56DE\u5F52"
        ) : h(
          "button",
          {
            className: "tm-minibtn",
            title: "\u5F39\u51FA " + what + " \u4E3A\u72EC\u7ACB\u6D6E\u7A97",
            onClick: () => openWidget(props.id)
          },
          "\u29C9"
        )
      );
    }
    return {
      useWidgets,
      isOpen,
      openWidget,
      closeWidget,
      forget,
      moveWidget,
      commitWidget,
      gripProps,
      WidgetFloat,
      WidgetToggle,
      raise,
      zOf,
      clampAllToViewport
    };
  }

  // src/client/TokenMeterSection.ts
  var STATS_WIDGET_BTNS = [
    ["cards", "\u6307\u6807\u5361"],
    ["trend", "\u8D8B\u52BF"],
    ["heat", "\u70ED\u529B"],
    ["donut", "\u6A21\u578B"],
    ["today", "\u4ECA\u65E5"]
  ];
  var SEC_PRESETS = [0, 30, 60, 120, 300, 600, 1800, 3600];
  function secLabel(n) {
    return n === 0 ? "\u5173\u95ED\u81EA\u52A8\u5237\u65B0" : n + " \u79D2";
  }
  var NEW_VENDOR = { id: "", name: "", type: "opencode", params: { workspaceId: "", cookie: "" } };
  function createTokenMeterSection(React, P, ReactDOM) {
    const h = React.createElement;
    const useState = React.useState;
    const widgets = createWidgetSystem(React, ReactDOM);
    const quota = createQuotaSection(React, P, ReactDOM, widgets);
    const stats = createStatsSection(React, P, ReactDOM);
    const store = quota.quotaStore;
    const UI = quota.quotaUI;
    const Btn = P.Button || (({ children, ...rest }) => h("button", { type: "button", className: "tm-btn", ...rest }, children));
    function notifyPrefs(patch) {
      try {
        window.dispatchEvent(new CustomEvent("tm-prefs-changed", { detail: patch }));
      } catch {
      }
    }
    function TokenMeterSettings() {
      const s = store.useStore();
      React.useEffect(() => {
        void store.ensureLoad();
      }, []);
      const [busy, setBusy] = useState(false);
      const [opErr, setOpErr] = useState("");
      const [draft, setDraft] = useState(JSON.parse(JSON.stringify(NEW_VENDOR)));
      const [editing, setEditing] = useState(null);
      const [confirmDel, setConfirmDel] = useState(null);
      const [acked, setAcked] = useState(false);
      async function withBusy(fn) {
        setBusy(true);
        setOpErr("");
        try {
          await fn();
        } finally {
          setBusy(false);
        }
      }
      async function saveVendor(v, isEdit) {
        await withBusy(async () => {
          try {
            const r = await store.call(isEdit ? "quota.update-vendor" : "quota.add-vendor", { vendor: v });
            if (r && r.ok) {
              if (!isEdit) setDraft(JSON.parse(JSON.stringify(NEW_VENDOR)));
              else setEditing(null);
              await store.reload();
            } else setOpErr(String(r && r.error || "\u4FDD\u5B58\u5931\u8D25"));
          } catch {
            setOpErr("\u8FDE\u63A5 Host \u5931\u8D25");
          }
        });
      }
      async function delVendor(id) {
        await withBusy(async () => {
          try {
            const r = await store.call("quota.delete-vendor", { id });
            if (!(r && r.ok)) setOpErr(String(r && r.error || "\u5220\u9664\u5931\u8D25"));
            await store.reload();
          } catch {
            setOpErr("\u8FDE\u63A5 Host \u5931\u8D25");
          }
        });
      }
      async function toCred(id) {
        await withBusy(async () => {
          try {
            const r = await store.call("quota.secret-to-cred", { id });
            if (r && r.ok) await store.reload();
            else setOpErr(String(r && r.error || "\u8F6C\u5B58\u5931\u8D25"));
          } catch {
            setOpErr("\u8FDE\u63A5 Host \u5931\u8D25");
          }
        });
      }
      const pickRange = (v) => withBusy(async () => {
        const r = await store.savePrefs({ defaultRange: v });
        if (!r.ok) setOpErr(String(r.error || "\u4FDD\u5B58\u5931\u8D25"));
        else notifyPrefs({ defaultRange: v });
      });
      const [tab, setTab] = useState("stats");
      const [statsSnap, setStatsSnap] = useState(null);
      const [clearArmed, setClearArmed] = useState(false);
      const [clearMsg, setClearMsg] = useState("");
      React.useEffect(() => {
        let alive = true;
        const tick = () => {
          void fetchStats().then((v) => {
            if (alive) setStatsSnap(v);
          }).catch(() => {
          });
        };
        tick();
        const id = window.setInterval(tick, 5e3);
        return () => {
          alive = false;
          window.clearInterval(id);
        };
      }, [clearMsg]);
      const commonKids = [];
      const statsKids = [];
      const quotaKids = [];
      if (s.error) commonKids.push(h("p", { key: "err", className: "tm-notice tm-notice-err" }, s.error));
      if (opErr) commonKids.push(h("p", { key: "operr", className: "tm-notice tm-notice-err" }, opErr));
      if (!s.cfg) {
        commonKids.push(
          h(
            "div",
            { key: "loading", className: "tm-loading" },
            h("span", { className: "tm-spinner" }),
            h("span", { className: "tm-loadingText" }, s.loading ? "\u6B63\u5728\u8BFB\u53D6\u914D\u7F6E\u2026" : "\u914D\u7F6E\u52A0\u8F7D\u5931\u8D25")
          )
        );
        return h("div", { className: "tm-page" }, commonKids);
      }
      const vendors = s.cfg.vendors || [];
      const activeId = s.cfg.activeVendor || "";
      const a0 = store.activeOf(s);
      const rawSec = s.cfg.refreshSec;
      const curSec = rawSec === void 0 || rawSec === null || rawSec === "" ? 60 : Number(rawSec) === 0 ? 0 : isFinite(Number(rawSec)) ? Math.min(3600, Math.max(10, Number(rawSec) || 60)) : 60;
      const defRange = String(s.cfg.defaultRange || "all");
      quotaKids.push(
        h(
          "div",
          { key: "display", className: "tm-section" },
          h("div", { className: "tm-sectionHead" }, "\u504F\u597D"),
          h(
            UI.SecRow,
            {
              key: "sec",
              label: "\u81EA\u52A8\u5237\u65B0",
              desc: "\u6BCF\u9694\u8FD9\u4E48\u4E45\u81EA\u52A8\u53BB\u5E73\u53F0\u62C9\u4E00\u6B21\u989D\u5EA6\uFF08\u53EA\u62C9\u300C\u5DF2\u542F\u7528\u300D\u7684\u4F9B\u5E94\u5546\uFF0C\u7981\u7528\u7684\u89C1\u4E0B\u65B9\u5217\u8868\uFF09\u3002\u9009\u300C\u5173\u95ED\u81EA\u52A8\u5237\u65B0\u300D\u540E\u4E0D\u518D\u5B9A\u65F6\u62C9\u53D6\uFF0C\u4ECD\u53EF\u968F\u65F6\u624B\u52A8\u70B9\u300C\u62C9\u53D6\u300D\u3002"
            },
            h(UI.PillSelect, {
              disabled: busy,
              value: String(curSec),
              selectedLabel: secLabel(curSec),
              options: (SEC_PRESETS.indexOf(curSec) >= 0 ? SEC_PRESETS : [curSec].concat(SEC_PRESETS)).map(
                (n) => ({ id: String(n), label: secLabel(n) })
              ),
              onSelect: (id) => void withBusy(() => store.setRefresh(Number(id)))
            })
          )
        )
      );
      const snapTotal = statsSnap && typeof statsSnap.total === "number" ? statsSnap.total : null;
      const snapScanned = statsSnap && typeof statsSnap.scanned === "number" ? statsSnap.scanned : null;
      const snapErrors = statsSnap && typeof statsSnap.errors === "number" ? statsSnap.errors : null;
      const snapHits = statsSnap && typeof statsSnap.cacheHits === "number" ? statsSnap.cacheHits : null;
      const snapReused = statsSnap && typeof statsSnap.reused === "number" ? statsSnap.reused : null;
      const gapNow = String(s.cfg.onlineGapMin ?? 5);
      statsKids.push(
        h(
          "div",
          { key: "source", className: "tm-card" },
          h("div", { className: "tm-title" }, "\u6570\u636E\u6765\u6E90\uFF1A\u4F1A\u8BDD\u8BB0\u5F55\uFF08\u552F\u4E00\u771F\u76F8\u6E90\uFF09"),
          h(
            "p",
            { className: "tm-desc", style: { margin: "4px 0 0" } },
            "\u6240\u6709\u7EDF\u8BA1\uFF08Token \u7528\u91CF\u3001\u5728\u7EBF\u65F6\u957F\u3001\u6A21\u578B\u5206\u5E03\u3001\u70ED\u529B\u56FE\u2026\uFF09\u90FD\u7531 ",
            h("code", { className: "tm-mono" }, "$DSH_HOME/sessions/"),
            " \u4E0B\u7684\u4F1A\u8BDD\u65E5\u5FD7\u805A\u5408\u800C\u6765\u3002\u4E0B\u9762\u7684\u7F13\u5B58\u53EA\u662F**\u53EF\u4E22\u7684\u6D3E\u751F\u6570\u636E**\uFF1A\u5220\u6389\u540E\u4F1A\u81EA\u52A8\u51ED\u4F1A\u8BDD\u65E5\u5FD7\u91CD\u7B97\uFF0C\u4F46**\u4F1A\u8BDD\u8BB0\u5F55\u672C\u8EAB\u4E22\u4E86\u5C31\u518D\u4E5F\u7B97\u4E0D\u56DE\u6765**\u3002"
          ),
          h(
            "p",
            { className: "tm-desc", style: { margin: "4px 0 0" } },
            "\u8FC1\u79FB / \u5907\u4EFD / \u6362\u673A\u65F6\uFF1A**\u4FDD\u7559 `sessions/` \u76EE\u5F55**\uFF08\u4F53\u79EF\u4EE5\u672C\u673A\u4E3A\u4F8B\u7EA6 250MB\uFF09\uFF1B",
            h("code", { className: "tm-mono" }, "storages/token_stats.json"),
            " \u4E0D\u5FC5\u5907\u4EFD\uFF08\u91CD\u5EFA\u5373\u53EF\uFF09\u3002"
          ),
          h(
            "div",
            { className: "tm-toolbar", style: { marginTop: 8 } },
            h(
              Btn,
              {
                variant: "outline",
                size: "sm",
                onClick: () => {
                  try {
                    void navigator.clipboard.writeText("$DSH_HOME/sessions/");
                    setClearMsg("\u5DF2\u590D\u5236\u4F1A\u8BDD\u76EE\u5F55\u8DEF\u5F84");
                  } catch {
                    setClearMsg("\u590D\u5236\u5931\u8D25\uFF0C\u8BF7\u624B\u52A8\u590D\u5236 $DSH_HOME/sessions/");
                  }
                }
              },
              "\u590D\u5236\u4F1A\u8BDD\u76EE\u5F55\u8DEF\u5F84"
            )
          )
        )
      );
      statsKids.push(
        h(
          "div",
          { key: "cache", className: "tm-section" },
          h("div", { className: "tm-sectionHead" }, "\u7F13\u5B58\u4E0E\u626B\u63CF\u72B6\u6001"),
          h(
            "div",
            { className: "tm-card" },
            h(
              "div",
              { className: "tm-chart-title", style: { marginBottom: 4 } },
              h("span", { className: "tm-chart-name" }, "\u6D3E\u751F\u7F13\u5B58"),
              h(
                "span",
                { className: "tm-hint" },
                statsSnap && statsSnap.generatedAt ? "\u66F4\u65B0\u4E8E " + new Date(statsSnap.generatedAt).toLocaleTimeString() : "\u8BFB\u53D6\u4E2D\u2026"
              )
            ),
            h(
              "div",
              { className: "tm-cacheRow", style: { marginTop: 0 } },
              h("span", null, "\u4F1A\u8BDD " + (snapScanned ?? "\u2014") + "/" + (snapTotal ?? "\u2014") + " \u5DF2\u626B\u63CF"),
              h(
                "span",
                null,
                "\u590D\u7528 " + (snapReused ?? "\u2014") + (snapHits != null ? "\uFF08\u7F13\u5B58 " + snapHits + "\uFF09" : "")
              ),
              h("span", null, "\u626B\u63CF\u5931\u8D25 " + (snapErrors ?? "\u2014")),
              h(
                "span",
                null,
                "\u76F4\u8BFB " + (statsSnap && statsSnap.directReads != null ? statsSnap.directReads : "\u2014")
              ),
              h("span", null, "\u5B58\u50A8 " + (statsSnap && statsSnap.storage ? statsSnap.storage : "\u2014"))
            ),
            h(
              "p",
              { className: "tm-desc", style: { margin: "6px 0 0" } },
              "\u300C\u590D\u7528\u300D= \u8BE5\u4F1A\u8BDD\u65E5\u5FD7\u6CA1\u53D8\uFF0C\u76F4\u63A5\u6CBF\u7528\u4E0A\u6B21\u7ED3\u679C\uFF08\u91CD\u542F\u540E\u6765\u81EA\u6301\u4E45\u5316\u7F13\u5B58\uFF0C\u8FD0\u884C\u4E2D\u6765\u81EA\u5185\u5B58\uFF09\uFF1B\u65E5\u5FD7\u53D8\u5927\u65F6\u53EA\u8BFB\u65B0\u589E\u90E8\u5206\u3002"
            ),
            h(
              "div",
              { className: "tm-toolbar", style: { marginTop: 8 } },
              clearArmed ? h(
                Btn,
                {
                  variant: "outline",
                  size: "sm",
                  disabled: busy,
                  onClick: () => void withBusy(async () => {
                    setClearMsg("");
                    const r = await clearStatsCache();
                    setClearMsg(
                      r.ok ? "\u5DF2\u6E05\u9664 " + (r.removed ?? 0) + " \u884C\u7F13\u5B58\uFF0C\u6B63\u5728\u91CD\u7B97\u2026" : String(r.error || "\u6E05\u9664\u5931\u8D25")
                    );
                    setClearArmed(false);
                  })
                },
                "\u786E\u8BA4\u6E05\u9664\u5E76\u91CD\u7B97"
              ) : h(
                Btn,
                { variant: "outline", size: "sm", disabled: busy, onClick: () => setClearArmed(true) },
                "\u6E05\u9664\u7EDF\u8BA1\u7F13\u5B58"
              ),
              clearArmed ? h(Btn, { variant: "outline", size: "sm", onClick: () => setClearArmed(false) }, "\u53D6\u6D88") : null,
              clearMsg ? h("span", { className: "tm-hint" }, clearMsg) : null
            ),
            h(
              "p",
              { className: "tm-desc", style: { margin: "6px 0 0" } },
              "\u6E05\u9664\u540E\u4E0B\u4E00\u6B21\u626B\u63CF\u4F1A\u91CD\u65B0\u8BFB\u53D6\u5168\u90E8\u4F1A\u8BDD\u65E5\u5FD7\uFF08\u672C\u673A\u7EA6 6 \u79D2\uFF09\uFF0C\u671F\u95F4\u9762\u677F\u663E\u793A\u300C\u540E\u53F0\u8865\u626B\u4E2D\u300D\u3002"
            )
          )
        )
      );
      statsKids.push(
        h(
          "div",
          { key: "statpref", className: "tm-section" },
          h("div", { className: "tm-sectionHead" }, "\u504F\u597D"),
          h(
            UI.SecRow,
            { key: "range", label: "\u9ED8\u8BA4\u8303\u56F4", desc: "\u53F3\u4FA7\u680F\u300C\u7528\u91CF\u300D\u9762\u677F\u6253\u5F00\u65F6\u9ED8\u8BA4\u7EDF\u8BA1\u591A\u5C11\u5929\u7684\u6570\u636E\u3002" },
            h(UI.PillSelect, {
              disabled: busy,
              value: defRange,
              selectedLabel: defRange === "all" ? "\u5168\u90E8" : "\u8FD1 " + defRange + " \u5929",
              options: [
                { id: "7", label: "\u8FD1 7 \u5929" },
                { id: "30", label: "\u8FD1 30 \u5929" },
                { id: "90", label: "\u8FD1 90 \u5929" },
                { id: "all", label: "\u5168\u90E8" }
              ],
              onSelect: (id) => void pickRange(id)
            })
          ),
          h(
            UI.SecRow,
            {
              key: "gap",
              label: "\u5728\u7EBF\u65F6\u957F\u7A7A\u95F2\u9608\u503C",
              desc: "\u300C\u5728\u7EBF\u65F6\u957F\u300D\u9762\u677F\u9ED8\u8BA4\u53E3\u5F84\uFF1A\u76F8\u90BB\u4E8B\u4EF6\u95F4\u9694\u8D85\u8FC7\u5B83\u5C31\u7B97\u300C\u79BB\u5F00\u300D\u3002\u5B83\u662F\u53E3\u5F84\u4E0D\u662F\u7CBE\u5EA6\uFF0C\u8C03\u5927\u5728\u7EBF\u65F6\u957F\u53D8\u591A\u3002"
            },
            h(UI.PillSelect, {
              disabled: busy,
              value: gapNow,
              selectedLabel: gapNow + " \u5206\u949F",
              options: [1, 5, 15, 30, 60].map((n) => ({ id: String(n), label: n + " \u5206\u949F" })),
              onSelect: (id) => void withBusy(async () => {
                const r = await store.savePrefs({ onlineGapMin: Number(id) });
                if (!r.ok) setOpErr(String(r.error || "\u4FDD\u5B58\u5931\u8D25"));
                else notifyPrefs({ onlineGapMin: Number(id) });
              })
            })
          )
        )
      );
      const vrows = [
        h(
          UI.SecRow,
          {
            key: "__active",
            label: "\u5F53\u524D\u4F9B\u5E94\u5546",
            desc: "\u4FA7\u8FB9\u680F\u4E0E\u53F3\u4FA7\u680F\u989D\u5EA6\u5361\u5C55\u793A\u54EA\u4E00\u5BB6\u7684\u989D\u5EA6\uFF1B\u9009\u300C\u65E0\u300D= \u6781\u7B80\u6A21\u5F0F\uFF08\u4E0D\u5C55\u793A\u3001\u4E5F\u4E0D\u62C9\u53D6\u4EFB\u4F55\u989D\u5EA6\uFF09\u3002"
          },
          h(UI.PillSelect, {
            disabled: busy,
            value: activeId,
            selectedLabel: a0 ? a0.name + "\uFF08" + store.typeLabel(a0.type) + "\uFF09" : "\u65E0 \xB7 \u6781\u7B80\u6A21\u5F0F\uFF08\u4E0D\u62C9\u53D6\uFF09",
            options: [{ id: "", label: "\u65E0 \xB7 \u6781\u7B80\u6A21\u5F0F\uFF08\u4E0D\u62C9\u53D6\uFF09" }].concat(
              vendors.map((v) => ({ id: v.id, label: v.name + "\uFF08" + store.typeLabel(v.type) + "\uFF09" }))
            ),
            onSelect: (id) => void withBusy(async () => {
              await store.setActive(id);
              await store.reload();
            })
          })
        )
      ];
      const listOn = vendors.filter((v) => v.enabled !== false);
      const listOff = vendors.filter((v) => v.enabled === false);
      const activeFirstOf = (list) => list.filter((v) => v.id === activeId).concat(list.filter((v) => v.id !== activeId));
      activeFirstOf(listOn).concat(activeFirstOf(listOff)).forEach((v) => {
        const snap = s.snaps[v.id];
        const isCur = v.id === activeId;
        const off = v.enabled === false;
        const status = off ? h("span", { className: "tm-hint tm-offtxt" }, "\u5DF2\u7981\u7528\u5B9A\u65F6\u62C9\u53D6") : snap && snap.ok ? h("span", { className: "tm-hint" }, "\u62C9\u53D6\u6B63\u5E38") : snap ? h("span", { className: "tm-hint", title: snap.error || "\u62C9\u53D6\u5931\u8D25" }, "\u62C9\u53D6\u5931\u8D25") : h("span", { className: "tm-hint" }, "\u672A\u62C9\u53D6");
        vrows.push(
          h(
            UI.SecRow,
            {
              key: "v:" + v.id,
              wrap: true,
              label: h(
                "span",
                { style: { display: "flex", alignItems: "center", gap: 6, minWidth: 0, maxWidth: "100%" } },
                h("span", { className: "tm-dot" + (off ? " off" : snap && !snap.ok ? " bad" : "") }),
                h("span", { className: "tm-vname2", style: { maxWidth: 280 } }, v.name),
                h(UI.Badge, { kind: "info", text: store.typeLabel(v.type) }),
                isCur ? h(UI.Badge, { kind: "ok", text: "\u5F53\u524D" }) : null,
                off ? h(UI.Badge, { kind: "bad", text: "\u5DF2\u7981\u7528" }) : null,
                UI.secretBadge(v.secretKind)
              )
            },
            h(
              "span",
              { className: "tm-bar", style: { width: "100%", padding: 0, border: "none" } },
              status,
              h("span", { style: { flex: 1 } }),
              h(
                Btn,
                {
                  variant: "outline",
                  size: "sm",
                  disabled: busy,
                  onClick: () => void withBusy(() => store.refreshVendor(v.id))
                },
                "\u62C9\u53D6"
              ),
              h(
                Btn,
                {
                  variant: "ghost",
                  size: "sm",
                  disabled: busy,
                  title: off ? "\u91CD\u65B0\u52A0\u5165 Host \u5B9A\u65F6\u62C9\u53D6" : "\u9000\u51FA Host \u5B9A\u65F6\u62C9\u53D6\uFF08\u624B\u52A8\u62C9\u53D6\u4E0D\u53D7\u5F71\u54CD\uFF09",
                  onClick: () => void withBusy(() => store.setVendorEnabled(v.id, off))
                },
                off ? "\u542F\u7528" : "\u7981\u7528"
              ),
              h(
                Btn,
                {
                  variant: "outline",
                  size: "sm",
                  disabled: busy,
                  onClick: () => setEditing({ id: v.id, data: JSON.parse(JSON.stringify(v)) })
                },
                "\u7F16\u8F91"
              ),
              v.secretKind === "plain" ? h(
                Btn,
                {
                  variant: "ghost",
                  size: "sm",
                  disabled: busy,
                  title: "\u660E\u6587\u8F6C\u5B58\u7CFB\u7EDF\u51ED\u636E\uFF0C\u6539\u5199\u4E3A $NAME \u5F15\u7528",
                  onClick: () => void toCred(v.id)
                },
                "\u5B58\u51ED\u636E"
              ) : null,
              h(
                Btn,
                {
                  variant: "ghost",
                  size: "sm",
                  disabled: busy,
                  onClick: () => {
                    setAcked(false);
                    setConfirmDel(v);
                  }
                },
                "\u5220\u9664"
              )
            )
          )
        );
      });
      quotaKids.push(
        h(
          "div",
          { key: "vendors", className: "tm-section" },
          h("div", { className: "tm-sectionHead" }, "\u4F9B\u5E94\u5546\uFF08" + vendors.length + "\uFF09"),
          h(
            "p",
            { className: "tm-cardHint", style: { margin: "0 0 4px" } },
            "\u5BC6\u94A5\u5EFA\u8BAE\u586B $NAME \u5F15\u7528\uFF08\u5148\u5B58\u7CFB\u7EDF\u51ED\u636E\uFF0C\u914D\u7F6E\u6587\u4EF6\u91CC\u770B\u4E0D\u5230\u660E\u6587\uFF09\uFF1B\u76F4\u63A5\u586B\u660E\u6587\u4E5F\u4E0D\u4F1A\u88AB\u56DE\u663E\u3002\u300C\u7981\u7528\u300D\u53EA\u662F\u9000\u51FA\u5B9A\u65F6\u62C9\u53D6\uFF0C\u968F\u65F6\u53EF\u4EE5\u624B\u52A8\u300C\u62C9\u53D6\u300D\uFF0C\u4E5F\u53EF\u518D\u70B9\u300C\u542F\u7528\u300D\u6062\u590D\u3002"
          ),
          vrows
        )
      );
      if (editing)
        quotaKids.push(
          h(
            "div",
            { key: "edit", className: "tm-section" },
            h("div", { className: "tm-sectionHead" }, "\u7F16\u8F91 " + editing.id),
            h(
              "p",
              { className: "tm-cardHint", style: { margin: "0 0 4px" } },
              "ID \u662F\u4E3B\u952E\uFF0C\u4E0D\u53EF\u4FEE\u6539\uFF1B\u5BC6\u94A5\u7559\u7A7A\u5373\u4FDD\u7559\u539F\u503C\u3002"
            ),
            h(UI.VendorForm, {
              draft: editing.data,
              set: (nd) => setEditing({ id: editing.id, data: nd }),
              submitLabel: "\u4FDD\u5B58\u4FEE\u6539",
              busy,
              isEdit: true,
              onCancel: () => setEditing(null),
              onSubmit: () => void saveVendor(editing.data, true)
            })
          )
        );
      quotaKids.push(
        h(
          "div",
          { key: "add", className: "tm-section" },
          h("div", { className: "tm-sectionHead" }, "\u6DFB\u52A0\u4F9B\u5E94\u5546"),
          h(UI.VendorForm, {
            draft,
            set: setDraft,
            submitLabel: "\u6DFB\u52A0",
            busy,
            onSubmit: () => void saveVendor(draft, false)
          })
        )
      );
      if (confirmDel) {
        const target = confirmDel;
        if (P.RiskConfirmation) {
          quotaKids.push(
            h(P.RiskConfirmation, {
              key: "confirm-del",
              open: true,
              title: "\u5220\u9664\u4F9B\u5E94\u5546\u300C" + target.name + "\u300D\uFF1F",
              description: "\u8BE5\u4F9B\u5E94\u5546\u7684\u914D\u7F6E\u4E0E\u4FA7\u8FB9\u680F\u5FEB\u7167\u5C06\u4E00\u5E76\u6E05\u9664\uFF0C\u6B64\u64CD\u4F5C\u4E0D\u53EF\u64A4\u9500\u3002",
              acknowledgeLabel: "\u6211\u5DF2\u4E86\u89E3\uFF0C\u5220\u9664\u8BE5\u4F9B\u5E94\u5546",
              cancelLabel: "\u53D6\u6D88",
              closeLabel: "\u5173\u95ED",
              confirmLabel: "\u5220\u9664",
              acknowledged: acked,
              onAcknowledgedChange: setAcked,
              onCancel: () => setConfirmDel(null),
              onConfirm: () => {
                setConfirmDel(null);
                void delVendor(target.id);
              }
            })
          );
        } else {
          quotaKids.push(
            h(
              "div",
              { key: "confirm-del", className: "tm-errbox" },
              h(
                "div",
                { className: "tm-errtext" },
                "\u5220\u9664\u4F9B\u5E94\u5546\u300C" + target.name + "\u300D\uFF1F\u6B64\u64CD\u4F5C\u4E0D\u53EF\u64A4\u9500\u3002" + (acked ? "" : "\u8BF7\u5148\u786E\u8BA4\u3002")
              ),
              h(
                "div",
                { style: { display: "flex", gap: 8, marginTop: 6 } },
                acked ? h(
                  Btn,
                  {
                    variant: "outline",
                    size: "sm",
                    onClick: () => {
                      setConfirmDel(null);
                      setAcked(false);
                      void delVendor(target.id);
                    }
                  },
                  "\u786E\u8BA4\u5220\u9664"
                ) : h(Btn, { variant: "outline", size: "sm", onClick: () => setAcked(true) }, "\u6211\u5DF2\u4E86\u89E3"),
                h(
                  Btn,
                  {
                    variant: "outline",
                    size: "sm",
                    onClick: () => {
                      setConfirmDel(null);
                      setAcked(false);
                    }
                  },
                  "\u53D6\u6D88"
                )
              )
            )
          );
        }
      }
      const tabBtn = (id, label) => h(
        "button",
        {
          key: id,
          type: "button",
          className: "tm-tab" + (tab === id ? " tm-tabOn" : ""),
          onClick: () => setTab(id)
        },
        label
      );
      return h(
        "div",
        { className: "tm-page" },
        commonKids,
        h("div", { className: "tm-tabs" }, tabBtn("stats", "\u7EDF\u8BA1\u8BBE\u7F6E"), tabBtn("quota", "\u989D\u5EA6\u914D\u7F6E")),
        h(
          "p",
          { className: "tm-intro" },
          tab === "stats" ? "\u7EDF\u8BA1\u8BBE\u7F6E\uFF1A\u6570\u636E\u6765\u6E90\u3001\u6D3E\u751F\u7F13\u5B58\u4E0E\u9ED8\u8BA4\u53E3\u5F84\u3002\u8BE6\u7EC6\u56FE\u8868\u5728\u53F3\u4FA7\u680F\u300C\u7528\u91CF / \u5728\u7EBF\u65F6\u957F\u300D\u9762\u677F\u3002" : "\u989D\u5EA6\u914D\u7F6E\uFF1A\u4F9B\u5E94\u5546\u4E0E\u62C9\u53D6\u504F\u597D\u3002\u8BE6\u7EC6\u989D\u5EA6\u5361\u5728\u53F3\u4FA7\u680F\u300C\u989D\u5EA6\u300D\u9762\u677F\u3002\u914D\u7F6E\u6301\u4E45\u5316\u5728 settings.yaml\uFF08",
          tab === "stats" ? null : h("code", { className: "tm-mono" }, s.namespace || "dshp-token-meter"),
          tab === "stats" ? null : " \u547D\u540D\u7A7A\u95F4\uFF09\uFF0C\u5916\u90E8\u7F16\u8F91\u70ED\u91CD\u8F7D\u3002"
        ),
        tab === "stats" ? statsKids : quotaKids
      );
    }
    function StatsRightPane() {
      const [prefs, setPrefs] = useState({
        showToday: false,
        defaultRange: "all"
      });
      const loadPrefs = async () => {
        try {
          const s = await fetchState();
          if (s.ok && s.config) {
            setPrefs({
              showToday: s.config.showToday === true,
              defaultRange: String(s.config.defaultRange || "all")
            });
          }
        } catch {
        }
      };
      React.useEffect(() => {
        void loadPrefs();
        const fn = () => {
          void loadPrefs();
        };
        window.addEventListener("tm-prefs-changed", fn);
        return () => window.removeEventListener("tm-prefs-changed", fn);
      }, []);
      return h(
        "div",
        { className: "tm-page" },
        h(
          "div",
          { className: "tm-toolbar" },
          h("span", { className: "tm-hint" }, "\u5C0F\u7EC4\u4EF6"),
          STATS_WIDGET_BTNS.map(
            ([k, t]) => h(
              "span",
              { key: k, className: "tm-widgetBtn" },
              h("span", { className: "tm-widgetBtn-label" }, t),
              h(widgets.WidgetToggle, { id: "stats:" + k })
            )
          )
        ),
        h(
          stats.HiddenWhenFloated,
          { widgets, id: "stats:today" },
          h(stats.TodayCard, { wide: true, bare: true, name: "\u4ECA\u65E5\u6D88\u8017", widgets, widgetId: "stats:today" })
        ),
        h(stats.StatsSettingsPage, {
          defaultRange: prefs.defaultRange,
          showToday: prefs.showToday,
          onPrefs: () => void loadPrefs(),
          showPrefs: false,
          widgets
        })
      );
    }
    function WidgetFloatLayer() {
      const list = widgets.useWidgets();
      if (!list.length) return null;
      return h(
        React.Fragment,
        null,
        list.map((w) => {
          const sep = w.id.indexOf(":");
          const prefix = sep >= 0 ? w.id.slice(0, sep) : "";
          const rest = sep >= 0 ? w.id.slice(sep + 1) : w.id;
          if (w.id === "peak") {
            return h(
              widgets.WidgetFloat,
              { key: w.id, id: w.id },
              h(quota.PeakIndicator, { widgets, widgetId: w.id })
            );
          }
          if (prefix === "quota") {
            return h(
              widgets.WidgetFloat,
              { key: w.id, id: w.id },
              h(quota.QuotaVendorWidget, { vendorId: rest })
            );
          }
          if (prefix === "stats") {
            return h(
              widgets.WidgetFloat,
              { key: w.id, id: w.id },
              h(stats.StatsWidget, { kind: rest, widgets, widgetId: w.id })
            );
          }
          return null;
        })
      );
    }
    return {
      TokenMeterSettings,
      QuotaRightPane: quota.QuotaRightPane,
      StatsRightPane,
      WidgetFloatLayer,
      widgetsApi: widgets,
      statsApi: stats
    };
  }

  // src/client/index.ts
  var PLUGIN_ID = "@dshp/token-meter";
  var tmStyleEl = null;
  var tmStyleUsers = 0;
  function tmEnsureStyles() {
    try {
      if (tmStyleEl && tmStyleEl.isConnected) return tmStyleEl;
      try {
        document.querySelectorAll('style[data-plugin-css="dshp-token-meter/settings.css"]').forEach((n) => n.remove());
      } catch {
      }
      const tag = document.createElement("style");
      tag.setAttribute("data-plugin-css", "dshp-token-meter/settings.css");
      tag.textContent = CSS;
      document.head.appendChild(tag);
      tmStyleEl = tag;
      return tag;
    } catch {
      return null;
    }
  }
  function register() {
    const loader = typeof window !== "undefined" ? window.__ModuleLoader__ : void 0;
    if (!loader || typeof loader.load !== "function") return;
    loader.load({
      id: PLUGIN_ID,
      factory: (require2) => {
        const moduleShim = { exports: {} };
        const exportsShim = moduleShim.exports;
        Object.defineProperty(exportsShim, Symbol.toStringTag, { value: "Module" });
        const React = require2("react");
        const P = require2("@deepseek-ai/dsh-client-ui-primitives");
        let ReactDOM = null;
        try {
          ReactDOM = require2("react-dom");
        } catch {
          ReactDOM = null;
        }
        const parts = createTokenMeterSection(React, P, ReactDOM);
        const onlineParts = createOnlineSection(React, ReactDOM, parts.statsApi);
        const TokenMeterSettings = parts.TokenMeterSettings;
        const QuotaRightPane = parts.QuotaRightPane;
        const StatsRightPane = parts.StatsRightPane;
        const WidgetFloatLayer = parts.WidgetFloatLayer;
        const WidgetsApi = parts.widgetsApi;
        const OnlineRightPane = onlineParts.OnlineRightPane;
        const { QuotaIcon, UsageIcon, OnlineIcon } = createIcons(React);
        function useTmStyles() {
          React.useEffect(() => {
            const tag = tmEnsureStyles();
            tmStyleUsers++;
            return () => {
              tmStyleUsers--;
              if (tmStyleUsers <= 0 && tag) {
                try {
                  if (tag.isConnected) tag.remove();
                } catch {
                }
                if (tmStyleEl === tag) tmStyleEl = null;
              }
            };
          }, []);
        }
        const exportsObj = exportsShim;
        exportsObj.inject = ["slots", "sidebarRightTabs", "sidebarRight"];
        exportsObj.apply = function apply(ctx) {
          const slots = ctx.get("slots");
          if (slots === void 0) return;
          tmEnsureStyles();
          ctx.effect(
            () => () => {
              if (tmStyleUsers <= 0 && tmStyleEl) {
                try {
                  tmStyleEl.remove();
                } catch {
                }
                tmStyleEl = null;
              }
            },
            "dshp-token-meter: section styles"
          );
          try {
            if (WidgetsApi && typeof WidgetsApi.forget === "function") WidgetsApi.forget("online:");
          } catch {
          }
          try {
            window.localStorage.removeItem("token-stats.sidebar-today");
            window.localStorage.removeItem("tquota.float.open");
            window.localStorage.removeItem("tquota.float.pos");
            window.localStorage.removeItem("tm-quota-float");
            window.localStorage.removeItem("tm-quota-float-pos");
            window.localStorage.removeItem("ts-today.float.open");
            window.localStorage.removeItem("ts-today.float.pos");
            window.localStorage.removeItem("tm-today.float.open");
            window.localStorage.removeItem("tm-today.float.pos");
          } catch {
          }
          function SettingsEntry(p) {
            useTmStyles();
            return React.createElement(TokenMeterSettings, p);
          }
          slots.inject(
            "settings.section",
            () => slots.register(
              { name: "settings.section", id: "dshp-token-meter", order: 27, label: "Token \u7EDF\u8BA1\u4E0E\u989D\u5EA6" },
              SettingsEntry
            )
          );
          function TokenMeterFloatEntry(props) {
            useTmStyles();
            return React.createElement(WidgetFloatLayer, props);
          }
          slots.inject(
            "shell.overlay",
            () => slots.register({ name: "shell.overlay", id: "dshp-token-meter-float" }, TokenMeterFloatEntry)
          );
          const QUOTA_TAB = "@dshp/token-meter-quota";
          const STATS_TAB = "@dshp/token-meter-stats";
          const ONLINE_TAB = "@dshp/token-meter-online";
          {
            ctx.effect(
              () => ctx.sidebarRightTabs.register({
                id: QUOTA_TAB,
                kind: "token-meter-quota",
                title: () => "Token \u989D\u5EA6",
                guide: [
                  {
                    order: 20,
                    title: () => "Token \u989D\u5EA6",
                    description: () => "\u5168\u90E8\u4F9B\u5E94\u5546\u989D\u5EA6\u4E00\u89C8",
                    icon: QuotaIcon
                  }
                ]
              }),
              "dshp-token-meter: right tab quota"
            );
            ctx.effect(
              () => ctx.sidebarRightTabs.register({
                id: STATS_TAB,
                kind: "token-meter-stats",
                title: () => "Token \u7528\u91CF",
                guide: [
                  {
                    order: 21,
                    title: () => "Token \u7528\u91CF",
                    description: () => "\u7528\u91CF\u8D8B\u52BF\u4E0E\u6A21\u578B\u5206\u5E03",
                    icon: UsageIcon
                  }
                ]
              }),
              "dshp-token-meter: right tab stats"
            );
            ctx.effect(
              () => ctx.sidebarRightTabs.register({
                id: ONLINE_TAB,
                kind: "token-meter-online",
                title: () => "\u5728\u7EBF\u65F6\u957F",
                guide: [
                  {
                    order: 22,
                    title: () => "\u5728\u7EBF\u65F6\u957F",
                    description: () => "\u6BCF\u65E5/\u7D2F\u8BA1\u5728\u7EBF\u65F6\u957F\u4F30\u7B97",
                    icon: OnlineIcon
                  }
                ]
              }),
              "dshp-token-meter: right tab online"
            );
            const QuotaPane = function QuotaPane2(p) {
              useTmStyles();
              return React.createElement(
                "div",
                { style: { height: "100%", minHeight: 0, overflow: "auto", padding: "12px 14px" } },
                React.createElement(QuotaRightPane, p)
              );
            };
            const QuotaPaneTitle = function QuotaPaneTitle2() {
              return React.createElement(
                "span",
                { className: "tm-tabChip" },
                React.createElement(QuotaIcon, { size: 14 }),
                React.createElement("span", null, "Token \u989D\u5EA6")
              );
            };
            const StatsPane = function StatsPane2(p) {
              useTmStyles();
              return React.createElement(
                "div",
                { style: { height: "100%", minHeight: 0, overflow: "auto", padding: "12px 14px" } },
                React.createElement(StatsRightPane, p)
              );
            };
            const StatsPaneTitle = function StatsPaneTitle2() {
              return React.createElement(
                "span",
                { className: "tm-tabChip" },
                React.createElement(UsageIcon, { size: 14 }),
                React.createElement("span", null, "Token \u7528\u91CF")
              );
            };
            const OnlinePane = function OnlinePane2(p) {
              useTmStyles();
              return React.createElement(
                "div",
                { style: { height: "100%", minHeight: 0, overflow: "auto", padding: "12px 14px" } },
                React.createElement(OnlineRightPane, p)
              );
            };
            const OnlinePaneTitle = function OnlinePaneTitle2() {
              return React.createElement(
                "span",
                { className: "tm-tabChip" },
                React.createElement(OnlineIcon, { size: 14 }),
                React.createElement("span", null, "\u5728\u7EBF\u65F6\u957F")
              );
            };
            slots.inject(
              "sidebar.right.pane.tab",
              () => slots.register({ name: "sidebar.right.pane.tab", key: QUOTA_TAB }, QuotaPane)
            );
            slots.inject(
              "sidebar.right.pane.tab.title",
              () => slots.register({ name: "sidebar.right.pane.tab.title", key: QUOTA_TAB }, QuotaPaneTitle)
            );
            slots.inject(
              "sidebar.right.pane.tab",
              () => slots.register({ name: "sidebar.right.pane.tab", key: STATS_TAB }, StatsPane)
            );
            slots.inject(
              "sidebar.right.pane.tab.title",
              () => slots.register({ name: "sidebar.right.pane.tab.title", key: STATS_TAB }, StatsPaneTitle)
            );
            slots.inject(
              "sidebar.right.pane.tab",
              () => slots.register({ name: "sidebar.right.pane.tab", key: ONLINE_TAB }, OnlinePane)
            );
            slots.inject(
              "sidebar.right.pane.tab.title",
              () => slots.register({ name: "sidebar.right.pane.tab.title", key: ONLINE_TAB }, OnlinePaneTitle)
            );
          }
          try {
            let done = false;
            try {
              done = window.localStorage.getItem("tm-righttabs-autoopened") === "1";
            } catch {
            }
            if (!done) {
              let attempts = 0;
              const tryOpen = () => {
                attempts++;
                try {
                  ctx.sidebarRight.openTab("token-meter-quota");
                  ctx.sidebarRight.openTab("token-meter-stats");
                  try {
                    window.localStorage.setItem("tm-righttabs-autoopened", "1");
                  } catch {
                  }
                } catch {
                  if (attempts < 5) window.setTimeout(tryOpen, attempts * 2e3);
                }
              };
              window.setTimeout(tryOpen, 1500);
            }
          } catch {
          }
        };
        return moduleShim.exports;
      }
    });
  }
  register();

})();
