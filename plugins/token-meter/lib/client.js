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
.tm-qlabel{flex:none;width:36px;font-size:11px;color:var(--dsw-alias-label-secondary)}
.tm-qbar{flex:1;min-width:0;height:6px;border-radius:99px;background:var(--dsw-alias-bg-layer-2);overflow:hidden}
.tm-qfill{display:block;height:100%;border-radius:99px;background:var(--dsw-alias-brand-primary);transition:width .8s ease}
.tm-qfill.warn{background:var(--dsw-alias-state-warn-primary)}.tm-qfill.bad{background:var(--dsw-alias-state-error-primary)}
.tm-qpct{flex:none;font-size:11px;color:var(--dsw-alias-label-primary);font-variant-numeric:tabular-nums}
.tm-qleft{flex:none;font-size:10px;color:var(--dsw-alias-label-secondary)}
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
.tm-xchart{margin-top:8px}
.tm-xtitle{font-size:10px;color:var(--dsw-alias-label-secondary);margin-bottom:2px}
.tm-xsplit{display:flex;height:8px;border-radius:99px;overflow:hidden;background:var(--dsw-alias-bg-layer-2);margin-top:6px}
.tm-xsplit span{display:block;height:100%}
.tm-xdot{display:inline-block;width:7px;height:7px;border-radius:2px;margin-right:5px}
.tm-errbox{margin-top:8px;background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-state-error-primary);border-radius:8px;padding:6px 8px}
.tm-errbtn{display:flex;align-items:center;gap:8px;width:100%;background:transparent;border:none;padding:0;cursor:pointer;text-align:left}
.tm-erricon{flex:none;width:18px;height:18px;border-radius:50%;background:var(--dsw-alias-state-error-primary);color:#fff;font-size:12px;font-weight:700;line-height:18px;text-align:center}
.tm-errtext{flex:1;min-width:0;font-size:12px;color:var(--dsw-alias-state-error-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.tm-errdetail{margin-top:6px;padding-top:6px;border-top:1px solid var(--dsw-alias-border-l1);font-size:11px;line-height:1.7;color:var(--dsw-alias-label-secondary);word-break:break-all;white-space:pre-wrap}
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
.tm-qpct{font-size:10px}
.tm-qleft{font-size:9px}
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
`;

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
  async function fetchStats() {
    const r = await fetch(`${BASE}/stats`, { cache: "no-store" });
    return await r.json();
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
  function levelOf(pct) {
    return pct >= 100 ? "bad" : pct >= 80 ? "warn" : "ok";
  }
  var TYPE_LABEL_FALLBACK = {
    opencode: "OC",
    "opencode-go": "Go",
    "opencode-zen": "Zen",
    deepseek: "DS",
    manual: "\u624B\u52A8"
  };
  var TYPE_TITLE_FALLBACK = [
    { type: "opencode", title: "opencode\uFF08Go+Zen \u5408\u5E76\uFF09" },
    { type: "opencode-go", title: "opencode-go\uFF08\u6293\u5305\uFF09" },
    { type: "deepseek", title: "deepseek\uFF08API\uFF09" },
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
      if (pos) window.localStorage.setItem(FLOAT_LS_POS, JSON.stringify({ x: Math.round(pos.x), y: Math.round(pos.y) }));
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
      const r = await fetch(path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(args || {}), cache: "no-store" });
      return r.json();
    }
    async function ensureLoad() {
      if (loaded) return;
      loaded = true;
      store.set({ loading: true });
      try {
        const r = await call("quota.load");
        if (r && r.ok) {
          store.set({ loading: false, cfg: r.config, snaps: r.snaps || {}, namespace: r.namespace || "", docPath: r.docPath || "", providers: r.providers || null, error: r.error || "" });
          const av = r.config && r.config.activeVendor || "";
          const en = !r.config || r.config.enabled !== false;
          if (en && av && !(r.snaps && r.snaps[av] && r.snaps[av].ok)) void refreshVendor(av);
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
      return cur + " " ;
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
    function QRow(props) {
      const w = props.w;
      const lvl = levelOf(w.pct);
      return h(
        "div",
        { className: "tm-qrow" },
        h("span", { className: "tm-qlabel" }, w.label),
        h(
          "div",
          { className: "tm-qbar" },
          h("span", { className: "tm-qfill" + (lvl === "ok" ? "" : " " + lvl), style: { width: Math.min(100, w.pct) + "%" } })
        ),
        h("span", { className: "tm-qpct" }, Math.round(w.pct) + "%"),
        props.left ? h("span", { className: "tm-qleft" }, props.left) : null
      );
    }
    function RollingBody(props) {
      const snap = props.snap;
      const now = props.now;
      const wins = Array.isArray(snap.windows) ? snap.windows : [];
      if (!wins.length) return h("div", { className: "tm-qmeta" }, h("span", null, "\u6682\u65E0\u6EDA\u52A8\u7A97\u53E3"));
      const worst = wins.reduce((m, w) => w.pct > m.pct ? w : m, wins[0]);
      const minRem = wins.reduce((m, w) => Math.min(m, remainOf(w, snap, now)), Infinity);
      return h(
        "div",
        { className: "tm-body" },
        wins.map((w) => h(QRow, { key: w.key, w, left: fmtLeft(remainOf(w, snap, now)) })),
        h("div", { className: "tm-payg-sub" }, "\u6700\u9AD8\u5360\u7528 " + worst.label + " " + Math.round(worst.pct) + "% \xB7 \u6700\u65E9\u91CD\u7F6E" + fmtLeft(minRem))
      );
    }
    function PaygBody(props) {
      const snap = props.snap;
      const b = snap.billing || {};
      const vendorName = snap.vendorName || b.plan || "\u6309\u91CF\u8BA1\u8D39";
      const amt = num(b.balance, 0);
      const cur = b.currency || "CNY";
      const granted = b.granted !== void 0 && b.granted !== null ? num(b.granted, 0) : null;
      const topped = b.toppedUp !== void 0 && b.toppedUp !== null ? num(b.toppedUp, 0) : null;
      const avail = b.isAvailable;
      const availCls = avail === true ? "ok" : avail === false ? "bad" : "unknown";
      const availTxt = avail === true ? "\u53EF\u7528" : avail === false ? "\u4E0D\u8DB3" : "\u72B6\u6001\u672A\u77E5";
      const warnLine = b.lowWarn !== void 0 && b.lowWarn !== null && b.lowWarn !== "" ? num(b.lowWarn, 0) : null;
      const empty = amt <= 0 || avail === false;
      const low = !empty && warnLine !== null && amt <= warnLine;
      const infos = Array.isArray(b.infos) ? b.infos : [];
      const kids = [];
      kids.push(h(
        "div",
        { key: "top", className: "tm-payg-top" },
        h(
          "div",
          null,
          h("span", { className: "tm-payg-cur" }, curSymbol(cur) + cur),
          h("span", { className: "tm-payg-amt" + (amt < 0 ? " neg" : "") }, fmt(amt))
        ),
        h("span", { className: "tm-avail " + availCls }, availTxt)
      ));
      kids.push(h("div", { key: "sub", className: "tm-payg-sub" }, vendorName + (snap.at ? " \xB7 \u66F4\u65B0" + timeAgo(snap.at) : "")));
      const parts = [];
      if (granted !== null) parts.push("\u8D60\u9001 " + fmt(granted));
      if (topped !== null) parts.push("\u5145\u503C " + fmt(topped));
      if (warnLine !== null) parts.push("\u9884\u8B66\u7EBF " + fmt(warnLine));
      if (parts.length) kids.push(h("div", { key: "parts", className: "tm-payg-sub" }, parts.join(" \xB7 ")));
      if (infos.length > 1) kids.push(h("div", { key: "infos", className: "tm-infos" }, infos.map((x) => h(
        "div",
        { key: x.currency || "?", className: "tm-inforow" },
        h("span", null, x.currency || "?"),
        h("b", null, fmt(x.total))
      ))));
      if (empty) kids.push(h("div", { key: "warn", className: "tm-warn bad" }, vendorName + "\u4F59\u989D\u4E0D\u8DB3\uFF0CAPI \u8C03\u7528\u53EF\u80FD\u88AB\u62D2\u7EDD\uFF0C\u8BF7\u53CA\u65F6\u5145\u503C\u3002"));
      else if (low) kids.push(h("div", { key: "warn", className: "tm-warn" }, vendorName + "\u4F59\u989D\u4F4E\u4E8E\u9884\u8B66\u7EBF " + fmt(warnLine) + "\uFF0C\u5EFA\u8BAE\u53CA\u65F6\u5145\u503C\u3002"));
      return h("div", { className: "tm-payg" }, kids);
    }
    const X_PAL = ["#4c7ef3", "#2fb261", "#f5a623", "#e05e4e", "#9a6ef1", "#25b8c4"];
    function ExtraBody(props) {
      const extra = props && props.extra || {};
      const kids = [];
      const stats = Array.isArray(extra.stats) ? extra.stats.slice(0, 6) : [];
      if (stats.length) kids.push(h("div", { key: "s", className: "tm-xstats" }, stats.map((r, i) => h(
        "div",
        { key: "r" + i, className: "tm-xrow" },
        h("span", null, String(r && r.label || "")),
        h("b", null, String(r && r.value || ""))
      ))));
      const blocks = Array.isArray(extra.blocks) ? extra.blocks.slice(0, 8) : [];
      blocks.forEach((b, bi) => {
        if (!b || typeof b !== "object") return;
        if (b.kind === "kv" && b.label) {
          kids.push(h(
            "div",
            { key: "xb" + bi, className: "tm-xstats" },
            h(
              "div",
              { className: "tm-xrow" },
              h("span", null, String(b.label)),
              h("b", null, String(b.value !== void 0 && b.value !== null ? b.value : ""))
            )
          ));
        } else if (b.kind === "progress" && isFinite(Number(b.used)) && Number(b.total) > 0) {
          const used = Number(b.used), total = Number(b.total);
          const pct = Math.min(100, Math.max(0, used / total * 100));
          const left = b.left !== void 0 && b.left !== null && b.left !== "" ? String(b.left) : "\u5269\u4F59 " + (total - used);
          kids.push(h(
            "div",
            { key: "xb" + bi, className: "tm-xprog" },
            h(QRow, { w: { key: "xb" + bi, label: String(b.label || "\u989D\u5EA6"), pct }, left })
          ));
        } else if (b.kind === "split" && Array.isArray(b.segments)) {
          const segs = b.segments.filter((sg) => sg && isFinite(Number(sg.value)) && Number(sg.value) > 0).slice(0, 6);
          if (!segs.length) return;
          const sum = segs.reduce((s2, x) => s2 + Number(x.value), 0);
          kids.push(h(
            "div",
            { key: "xb" + bi },
            b.label ? h("div", { className: "tm-xtitle" }, String(b.label)) : null,
            h("div", { className: "tm-xsplit" }, segs.map((sg, si) => h("span", { key: "xg" + si, style: { flexGrow: Number(sg.value), background: sg.color || X_PAL[si % X_PAL.length] } }))),
            h("div", { className: "tm-xstats" }, segs.map((sg, si) => h(
              "div",
              { key: "xl" + si, className: "tm-xrow" },
              h(
                "span",
                null,
                h("span", { className: "tm-xdot", style: { background: sg.color || X_PAL[si % X_PAL.length] } }),
                String(sg.label || "")
              ),
              h("b", null, String(Math.round(Number(sg.value) * 100 / sum)) + "%")
            )))
          ));
        } else if (b.kind === "note" && b.text) {
          const tone = b.tone === "bad" ? "tm-warn bad" : b.tone === "warn" ? "tm-warn" : "tm-payg-sub";
          kids.push(h("div", { key: "xb" + bi, className: tone }, String(b.text)));
        }
      });
      const ch = extra.chart;
      if (ch && Array.isArray(ch.values) && ch.values.length > 1) {
        const vals = ch.values.map((v) => isFinite(Number(v)) ? Number(v) : 0).slice(-60);
        const W = 248, Hh = 52, Pd = 3;
        const max = Math.max.apply(null, vals.concat([1]));
        const step = vals.length > 1 ? (W - Pd * 2) / (vals.length - 1) : 0;
        const pts = vals.map((v, i) => [Pd + step * i, Hh - Pd - v / max * (Hh - Pd * 2)]);
        const line = pts.map((p) => p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" ");
        const area = Pd + "," + (Hh - Pd) + " " + line + " " + (W - Pd) + "," + (Hh - Pd);
        kids.push(h(
          "div",
          { key: "c", className: "tm-xchart" },
          ch.title ? h("div", { className: "tm-xtitle" }, String(ch.title)) : null,
          h(
            "svg",
            { viewBox: "0 0 " + W + " " + Hh, preserveAspectRatio: "none", style: { display: "block", width: "100%", height: Hh + "px" } },
            h("polygon", { points: area, style: { fill: "var(--dsw-alias-state-business-primary)", opacity: 0.15 } }),
            h("polyline", { points: line, fill: "none", style: { stroke: "var(--dsw-alias-state-business-primary)", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" } })
          )
        ));
      }
      if (!kids.length) return null;
      return h("div", null, kids);
    }
    function ErrBox(props) {
      const msg = props.msg || "\u62C9\u53D6\u5931\u8D25";
      const meta = props.meta || "";
      const open = !!store.get().errOpen;
      return h(
        "div",
        { className: "tm-errbox" },
        h(
          "button",
          { className: "tm-errbtn", title: "\u70B9\u51FB\u67E5\u770B\u5931\u8D25\u8BE6\u60C5", onClick: () => store.set({ errOpen: !store.get().errOpen }) },
          h("span", { className: "tm-erricon" }, "!"),
          h("span", { className: "tm-errtext" }, "\u8BF7\u6C42\u5931\u8D25\uFF0C\u70B9\u51FB\u67E5\u770B\u8BE6\u60C5"),
          h("span", { className: "tm-vcaret" }, open ? "\u25B4" : "\u25BE")
        ),
        open ? h("div", { className: "tm-errdetail" }, msg + (meta ? "\n" + meta : "")) : null
      );
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
      return tmPortal(h(
        "div",
        null,
        h("button", { className: "tm-backdrop", "aria-label": "\u5173\u95ED\u4F9B\u5E94\u5546\u83DC\u5355", onClick: () => store.set({ menuOpen: false, menuAt: null }) }),
        h(
          "div",
          { className: "tm-popmenu tm-in", style },
          vendors.map((v) => h(
            "button",
            {
              key: v.id,
              className: "tm-mitem" + (v.id === curId ? " active" : ""),
              onClick: () => void setActive(v.id)
            },
            h("span", { className: "grow" }, v.name),
            h("span", { className: "tm-vtype" }, typeLabel(v.type))
          )),
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
      ));
    }
    function quotaContent(s, a, snap, now) {
      const stale = s.lastErr && (!s.lastErr.id || s.lastErr.id === a.id) && snap && snap.ok ? s.lastErr : null;
      let cbody = null;
      if (snap && snap.ok) {
        cbody = snap.billingKind === "payg" ? h(PaygBody, { snap }) : h(RollingBody, { snap, now });
      } else if (s.loading) {
        cbody = h("div", { className: "tm-qmeta" }, h("span", null, "\u62C9\u53D6\u4E2D\u2026"));
      } else {
        const le0 = s.lastErr && (!s.lastErr.id || s.lastErr.id === a.id) ? s.lastErr : null;
        const msg = snap && snap.error || (le0 ? le0.msg : "") || s.error || "\u6682\u65E0\u6570\u636E\uFF0C\u70B9\u51FB\u21BB\u5237\u65B0";
        const meta = a.name + (snap && snap.at ? " \xB7 \u5931\u8D25\u4E8E" + timeAgo(snap.at) : le0 && le0.at ? " \xB7 \u5931\u8D25\u4E8E" + timeAgo(le0.at) : "") + (snap && snap.secretKind ? " \xB7 \u5BC6\u94A5:" + snap.secretKind : "");
        cbody = h(ErrBox, { msg, meta });
      }
      return [
        s.error ? h("div", { key: "e", className: "tm-err" }, s.error) : null,
        h("div", { key: "b" }, cbody),
        snap && snap.ok && snap.extra ? h(ExtraBody, { key: "x", extra: snap.extra }) : null,
        h(
          "div",
          { key: "m", className: "tm-qmeta" },
          h("span", null, (snap && snap.at ? "\u66F4\u65B0" + timeAgo(snap.at) : "\u672A\u62C9\u53D6") + (snap && snap.ok && snap.via ? " \xB7 " + snap.via : "")),
          h(
            "span",
            null,
            stale ? h("button", { className: "tm-mini warn", title: stale.msg + "\uFF08\u65E7\u6570\u636E\u4ECD\u53EF\u7528\uFF09", onClick: () => store.set({ errOpen: !store.get().errOpen }) }, "\u26A0\u65E7\u6570\u636E") : null,
            h("button", { className: "tm-mini", title: "\u5237\u65B0\u5F53\u524D\u4F9B\u5E94\u5546", onClick: () => void refreshVendor(a.id) }, "\u21BB \u5237\u65B0")
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
      return tmPortal(h(
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
          h("span", { className: "tm-dot" + (snap && !snap.ok ? " bad" : "") }),
          h("span", { className: "tm-vname" }, a.name),
          h("span", { className: "tm-vtype" }, typeLabel(a.type)),
          h("button", { className: "tm-mini", title: "\u5207\u6362\u4F9B\u5E94\u5546", onClick: (e) => {
            if (e.stopPropagation) e.stopPropagation();
            openMenu(e);
          } }, "\u25BE"),
          h("button", { className: "tm-mini", title: "\u5237\u65B0\u5F53\u524D\u4F9B\u5E94\u5546", onClick: (e) => {
            if (e.stopPropagation) e.stopPropagation();
            void refreshVendor(a.id);
          } }, "\u21BB"),
          h("button", { className: "tm-mini", title: "\u6536\u56DE\u4FA7\u8FB9\u680F", onClick: (e) => {
            if (e.stopPropagation) e.stopPropagation();
            setFloatOpen(false);
          } }, "\u{1F4CC}")
        ),
        h("div", { className: "tm-float-bd" }, quotaContent(s, a, snap, now))
      ));
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
      if (!s.cfg) return h("div", { className: "tm-side" }, h("div", { className: "tm-qmeta" }, h("span", null, s.loading ? "\u989D\u5EA6\u52A0\u8F7D\u4E2D\u2026" : s.error || "\u989D\u5EA6\u52A0\u8F7D\u5931\u8D25")));
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
            { className: "tm-vendor", title: "\u70B9\u51FB\u9009\u62E9\u8BA1\u8D39\u4F9B\u5E94\u5546\uFF08\u5F53\u524D\uFF1A\u65E0\uFF09", onClick: (e) => openMenu(e) },
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
        { className: "tm-side tm-in" + (s.loading ? " loading" : "") + (failed && !s.loading ? " error" : "") },
        h(
          "div",
          { className: "tm-vendor-row" },
          h("span", { className: "tm-grip", title: "\u6309\u4F4F\u62D6\u51FA\u4E3A\u6D6E\u7A97\uFF0C\u70B9\u6309\u76F4\u63A5\u5F39\u51FA", onPointerDown: gripDragOut }, "\u283F"),
          h(
            "button",
            { className: "tm-vendor", title: "\u70B9\u51FB\u5207\u6362\u8BA1\u8D39\u4F9B\u5E94\u5546", onClick: (e) => openMenu(e) },
            h("span", { className: "tm-dot" + (snap && !snap.ok ? " bad" : "") }),
            h("span", { className: "tm-vname" }, a.name),
            h("span", { className: "tm-vtype" }, typeLabel(a.type)),
            h("span", { className: "tm-vcaret" }, s.menuOpen ? "\u25B4" : "\u25BE")
          ),
          h("button", { className: "tm-mini", title: "\u5F39\u51FA\u4E3A\u6D6E\u7A97\uFF08\u53EF\u62D6\u5230\u5C4F\u5E55\u4EFB\u610F\u4F4D\u7F6E\uFF09", onClick: () => setFloatOpen(true) }, "\u29C9")
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
        { className: "tm-row", style: props.wrap ? { flexWrap: "wrap", flexDirection: "column", alignItems: "stretch" } : null },
        h(
          "div",
          { className: "tm-rowText" },
          h("div", { className: "tm-rowLabel" }, props.label),
          props.desc ? h("div", { className: "tm-rowDesc" }, props.desc) : null
        ),
        h("span", { className: props.wrap ? "tm-rowValue" : void 0, style: props.wrap ? { flexBasis: "100%", justifyContent: "flex-start" } : null }, props.children)
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
            props.options.map((o) => h("button", { key: o.id, className: "tm-mitem" + (o.id === props.value ? " active" : ""), onClick: () => {
              setOpen(false);
              props.onSelect(o.id);
            } }, o.label))
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
      const inputWrap = (opts, inner) => h("div", { className: "tm-inputWrap", style: opts && opts.maxWidth ? { maxWidth: opts.maxWidth } : null }, inner);
      const textInput = (opts) => inputWrap(opts, h("input", {
        className: "tm-ninput" + (opts && opts.mono ? " tm-mono" : ""),
        style: opts && opts.alignRight ? { textAlign: "right", fontVariantNumeric: "tabular-nums" } : null,
        value: opts.value,
        placeholder: opts.placeholder || "",
        autoComplete: "off",
        inputMode: opts.inputMode,
        disabled: busy,
        onChange: opts.onChange
      }));
      const rows = [];
      rows.push(h(
        SecRow,
        { key: "name", label: "\u663E\u793A\u540D\u5B57 *", desc: "\u4FA7\u8FB9\u680F\u5361\u7247\u5C55\u793A\u7684\u4F9B\u5E94\u5546\u540D\u79F0\u3002" },
        textInput({ value: d.name || "", placeholder: "\u5982\uFF1AOpencode GO \u4E3B\u53F7", onChange: (e) => put("name")(e.target.value) })
      ));
      const typeSel = h(PillSelect, {
        disabled: busy,
        value: d.type,
        selectedLabel: (typeOptions().filter((o) => o.type === d.type)[0] || {}).title || d.type,
        options: typeOptions().map((o) => ({ id: o.type, label: o.title })),
        onSelect: (id) => put("type")(id)
      });
      rows.push(h(
        SecRow,
        { key: "idtype", label: isEdit ? "ID\uFF08\u4E0D\u53EF\u6539\uFF09" : "ID * / \u7C7B\u578B", desc: isEdit ? "ID \u662F\u4F9B\u5E94\u5546\u4E3B\u952E\uFF0C\u4E0D\u53EF\u4FEE\u6539\u3002" : "\u5C0F\u5199\u5B57\u6BCD/\u6570\u5B57/\u6A2A\u7EBF\uFF0C2-31 \u4F4D\u3002" },
        isEdit ? h("span", { className: "tm-mono", style: { color: "var(--dsw-alias-label-primary)" }, title: "ID \u662F\u4F9B\u5E94\u5546\u4E3B\u952E\uFF0C\u4E0D\u53EF\u4FEE\u6539" }, d.id) : h(
          "span",
          { style: { display: "flex", gap: 8, alignItems: "center", flex: 1, minWidth: 0, justifyContent: "flex-end" } },
          inputWrap({}, h("input", {
            className: "tm-ninput tm-mono",
            value: d.id || "",
            placeholder: "\u5982\uFF1Ago-main",
            autoComplete: "off",
            disabled: busy,
            onChange: (e) => put("id")(e.target.value)
          })),
          typeSel
        )
      ));
      if (!isEdit && !idOk && (d.id || "")) rows.push(h("p", { key: "idhint", className: "tm-cardHint" }, "ID \u89C4\u5219\uFF1A\u5C0F\u5199\u5B57\u6BCD/\u6570\u5B57/\u6A2A\u7EBF\uFF0C2\u201331 \u4F4D\u3002"));
      const dynMeta = providerMetaOf(d.type);
      if (dynMeta && Array.isArray(dynMeta.fields)) {
        const dynFields = dynMeta.fields.filter((f) => {
          if (!f || !f.showWhen) return true;
          let cur = p[f.showWhen.key];
          if (cur === void 0 || cur === null || cur === "") cur = f.showWhen.key === "billing" ? "rolling" : "";
          return String(cur) === String(f.showWhen.eq);
        });
        dynFields.forEach((f, idx) => {
          const val = p[f.key];
          const key = "dyn:" + f.key + ":" + idx;
          if (f.kind === "select") {
            const selVal = val === void 0 || val === null || val === "" ? f.key === "billing" ? "rolling" : "" : String(val);
            rows.push(h(
              SecRow,
              { key, label: f.label || f.key },
              h(PillSelect, {
                disabled: busy,
                value: selVal,
                selectedLabel: ((f.options || []).filter((o) => o.value === selVal)[0] || {}).label || selVal,
                options: (f.options || []).map((o) => ({ id: o.value, label: o.label })),
                onSelect: /* @__PURE__ */ ((k) => (id) => putP(k)(id))(f.key)
              })
            ));
          } else if (f.kind === "number") {
            rows.push(h(
              SecRow,
              { key, label: f.label || f.key },
              textInput({
                maxWidth: 170,
                inputMode: "decimal",
                placeholder: f.placeholder || "",
                value: val === void 0 || val === null ? "" : String(val),
                onChange: /* @__PURE__ */ ((k) => (e) => putP(k)(e.target.value))(f.key)
              })
            ));
          } else {
            const isSecret = f.kind === "secret";
            rows.push(h(
              SecRow,
              { key, label: f.label || f.key },
              textInput({
                mono: !!f.mono,
                placeholder: f.placeholder || (isSecret ? secretPh : ""),
                value: val === void 0 || val === null ? "" : String(val),
                onChange: /* @__PURE__ */ ((k) => (e) => putP(k)(e.target.value))(f.key)
              })
            ));
          }
          if (f.hint) rows.push(h("p", { key: key + ":hint", className: "tm-cardHint" }, f.hint));
        });
        if (dynMeta.hint) rows.push(h("p", { key: "dyn:hint", className: "tm-cardHint" }, dynMeta.hint));
      } else if (d.type === "opencode" || d.type === "opencode-go") {
        rows.push(h(
          SecRow,
          { key: "wid", label: "workspaceId *" },
          textInput({ mono: true, value: p.workspaceId || "", placeholder: "\u5982\uFF1Awrk_xxx", onChange: (e) => putP("workspaceId")(e.target.value) })
        ));
        rows.push(h(
          SecRow,
          { key: "auth", label: "cookie *" },
          textInput({ mono: true, value: p.cookie || p.auth || "", placeholder: secretPh, onChange: (e) => putP("cookie")(e.target.value) })
        ));
      } else if (d.type === "deepseek") {
        rows.push(h(
          SecRow,
          { key: "key", label: "apiKey / token *" },
          textInput({ mono: true, value: p.apiKey || p.token || "", placeholder: secretPh, onChange: (e) => putP("apiKey")(e.target.value) })
        ));
        rows.push(h(
          SecRow,
          { key: "low", label: "\u4F4E\u4F59\u989D\u9884\u8B66\u7EBF" },
          textInput({ maxWidth: 140, inputMode: "decimal", value: p.lowWarn || "", placeholder: "\u5982\uFF1A20", onChange: (e) => putP("lowWarn")(e.target.value) })
        ));
        rows.push(h("p", { key: "dshint", className: "tm-cardHint" }, "\u5B98\u65B9\u63A5\u53E3 GET /user/balance\uFF0C\u5E01\u79CD\u81EA\u52A8\u5F52\u4E00\uFF08CNY \u4F18\u5148\uFF09\uFF0C\u6B64\u5904\u65E0\u9700\u586B\u5199\u3002"));
      } else {
        const billing = p.billing || "rolling";
        rows.push(h(
          SecRow,
          { key: "billing", label: "\u8BA1\u8D39\u5F62\u6001" },
          h(PillSelect, {
            disabled: busy,
            value: billing,
            selectedLabel: billing === "payg" ? "\u6309\u91CF\u4ED8\u8D39" : "\u6EDA\u52A8\u5237\u65B0",
            options: [{ id: "rolling", label: "\u6EDA\u52A8\u5237\u65B0" }, { id: "payg", label: "\u6309\u91CF\u4ED8\u8D39" }],
            onSelect: (id) => putP("billing")(id)
          })
        ));
        if (billing === "rolling") {
          rows.push(h(
            SecRow,
            { key: "total", label: "\u603B\u989D\u5EA6" },
            textInput({ maxWidth: 170, inputMode: "decimal", value: p.total !== void 0 ? String(p.total) : "", placeholder: "\u5982\uFF1A1000", onChange: (e) => putP("total")(e.target.value) })
          ));
          rows.push(h(
            SecRow,
            { key: "used", label: "\u5DF2\u7528" },
            textInput({ maxWidth: 170, inputMode: "decimal", value: p.used !== void 0 ? String(p.used) : "", placeholder: "\u5982\uFF1A100", onChange: (e) => putP("used")(e.target.value) })
          ));
        } else {
          rows.push(h(
            SecRow,
            { key: "bal", label: "\u4F59\u989D" },
            textInput({ maxWidth: 170, inputMode: "decimal", value: p.balance !== void 0 ? String(p.balance) : "", placeholder: "\u5982\uFF1A50", onChange: (e) => putP("balance")(e.target.value) })
          ));
          rows.push(h(
            SecRow,
            { key: "granted", label: "\u603B\u989D\u5EA6" },
            textInput({ maxWidth: 170, inputMode: "decimal", value: p.granted !== void 0 ? String(p.granted) : "", placeholder: "\u5982\uFF1A100", onChange: (e) => putP("granted")(e.target.value) })
          ));
          rows.push(h(
            SecRow,
            { key: "mlow", label: "\u9884\u8B66\u7EBF" },
            textInput({ maxWidth: 170, inputMode: "decimal", value: p.lowWarn !== void 0 ? String(p.lowWarn) : "", placeholder: "\u5982\uFF1A10", onChange: (e) => putP("lowWarn")(e.target.value) })
          ));
        }
      }
      const Btn = P.Button || (({ children, ...rest }) => h("button", { type: "button", className: "tm-btn", ...rest }, children));
      rows.push(h(
        "div",
        { key: "actions", className: "tm-bar" },
        h(Btn, { variant: "primary", size: "sm", disabled: !canSubmit, onClick: props.onSubmit }, busy ? "\u4FDD\u5B58\u4E2D\u2026" : props.submitLabel || "\u4FDD\u5B58"),
        props.onCancel ? h(Btn, { variant: "outline", size: "sm", disabled: busy, onClick: props.onCancel }, "\u53D6\u6D88") : null,
        !idOk || !nameOk ? h("span", { className: "tm-hint" }, "\u8BF7\u5148\u586B\u5199\u663E\u793A\u540D\u5B57\u4E0E\u5408\u6CD5 ID\u3002") : null
      ));
      return h("div", { className: "tm-section" }, rows);
    }
    const NEW_VENDOR2 = { id: "", name: "", type: "opencode", params: { workspaceId: "", cookie: "" } };
    const SEC_PRESETS2 = [0, 30, 60, 120, 300, 600, 1800, 3600];
    function secLabel2(n) {
      return n === 0 ? "\u5173\u95ED\u81EA\u52A8\u5237\u65B0" : n + " \u79D2";
    }
    function aiManual(namespace, docPath) {
      let types = "opencode / deepseek / deepseek-api / deepseek-web / manual";
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
        "      # deepseek \u6309\u5BC6\u94A5\u683C\u5F0F\u81EA\u52A8\u9009\u8DEF\uFF1Ask- \u5F00\u5934\u8D70\u5B98\u65B9\u4F59\u989D\uFF0C\u5176\u4F59\u8D70\u7F51\u9875\u8D26\u5355\uFF08\u542B\u5386\u53F2\uFF09\uFF1B\u4E00\u8DEF\u5931\u6548\u81EA\u52A8\u6362\u8DEF",
        "      # \u7EAF\u901A\u9053\uFF1Atype: deepseek-api\uFF08\u53EA\u8981 apiKey\uFF09/ deepseek-web\uFF08\u53EA\u8981 token\uFF0C\u53EF\u9009 cookie\uFF09",
        "    - id: m1",
        "      name: \u624B\u52A8\u8D26\u672C",
        "      type: manual",
        "      params: { billing: payg, balance: 50, granted: 100, lowWarn: 10 }",
        "\u5BC6\u94A5\uFF1A$NAME\uFF08\u63A8\u8350\uFF1A\u5148\u8BFB ~/.dsh/.credentials.yaml\uFF0C\u518D\u8BFB\u73AF\u5883\u53D8\u91CF\uFF09/ \u660E\u6587\uFF08\u8BBE\u7F6E\u9875\u4E0D\u660E\u6587\u56DE\u663E\uFF0C\u7F16\u8F91\u7559\u7A7A\u5373\u4FDD\u7559\uFF09/ {env:}/{cred:}\uFF08\u65E7\u5199\u6CD5\uFF0C\u4EC5\u517C\u5BB9\uFF09",
        "cookie\uFF1A\u6D4F\u89C8\u5668\u5F00\u53D1\u8005\u5DE5\u5177 \u2192 Application \u2192 Cookies \u2192 \u590D\u5236 auth \u7684\u503C\uFF0C\u6574\u6BB5 Cookie \u539F\u6837\u7C98\u8D34\u4EA6\u53EF\uFF1BworkspaceId \u89C1\u5404\u5B57\u6BB5\u4E0B\u65B9\u7684\u83B7\u53D6\u8BF4\u660E",
        "deepseek \u4E09\u7C7B\u578B\uFF1Adeepseek\uFF08\u81EA\u52A8\u9009\u8DEF\uFF0C\u63A8\u8350\uFF09/ deepseek-api\uFF08\u7EAF apiKey\uFF09/ deepseek-web\uFF08\u7EAF\u4F1A\u8BDD token\uFF09\uFF1BapiKey \u4E0E\u4F1A\u8BDD\u7968\u636E\u4E0D\u901A\u7528\uFF08\u5B9E\u6D4B 40003\uFF09\uFF0C\u4E0D\u8981\u6DF7\u586B\u5230\u5BF9\u65B9\u5B57\u6BB5",
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
      kids.push(h(
        "p",
        { key: "d", className: "tm-intro" },
        "\u591A\u4F9B\u5E94\u5546\u6EDA\u52A8\u989D\u5EA6 / \u6309\u91CF\u4F59\u989D\uFF0C\u4FA7\u8FB9\u680F\u5B9E\u65F6\u5361\u7247\u5C55\u793A\u3002\u914D\u7F6E\u6301\u4E45\u5316\u5728 settings.yaml\uFF08",
        h("code", { className: "tm-mono" }, s.namespace || "dshp-token-meter"),
        " \u547D\u540D\u7A7A\u95F4" + (s.docPath ? "\uFF0C\u6587\u4EF6 " + s.docPath : "") + "\uFF09\uFF0C\u5916\u90E8\u7F16\u8F91\u70ED\u91CD\u8F7D\uFF1B\u5BC6\u94A5\u7528 $NAME \u5F15\u7528\u6216\u660E\u6587\u3002"
      ));
      if (s.error) kids.push(h("p", { key: "err", className: "tm-notice tm-notice-err" }, s.error));
      if (!s.cfg) {
        kids.push(h(
          "div",
          { key: "loading", className: "tm-loading" },
          h("span", { className: "tm-spinner" }),
          h("span", { className: "tm-loadingText" }, s.loading ? "\u6B63\u5728\u8BFB\u53D6\u989D\u5EA6\u914D\u7F6E\u2026" : "\u989D\u5EA6\u914D\u7F6E\u52A0\u8F7D\u5931\u8D25")
        ));
        return h("div", { className: "tm-page" }, kids);
      }
      const a0 = activeOf(s);
      const aSnap = a0 && s.snaps[a0.id];
      kids.push(h(
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
            h(Btn, { variant: "outline", size: "sm", disabled: busy, onClick: () => setFloatOpen(false) }, "\u6536\u56DE\u4FA7\u8FB9\u680F")
          ) : h("span", { className: "tm-hint" }, "\u5728\u4FA7\u8FB9\u680F\u4E2D\uFF08\u5361\u7247\u6807\u9898\u680F \u283F \u53EF\u62D6\u51FA\uFF09")
        )
      ));
      kids.push(h(
        "div",
        { key: "display", className: "tm-section" },
        h(
          SecRow,
          { key: "sw", label: "\u4FA7\u8FB9\u680F\u989D\u5EA6\u5361", desc: "\u5173\u95ED\u540E\u4FA7\u8FB9\u680F\u4EC5\u4FDD\u7559\u5360\u4F4D\u63D0\u793A\uFF0C\u4E0D\u518D\u81EA\u52A8\u62C9\u53D6\uFF1B\u4F9B\u5E94\u5546\u914D\u7F6E\u4E0E\u624B\u52A8\u62C9\u53D6\u4E0D\u53D7\u5F71\u54CD\u3002" },
          h("button", {
            className: "tm-switch" + (shown ? " tm-switchOn" : ""),
            role: "switch",
            "aria-checked": shown,
            disabled: busy,
            "aria-label": "\u4FA7\u8FB9\u680F\u989D\u5EA6\u5361",
            onClick: () => void toggleEnabled()
          }, h("span", { className: "tm-knob" }))
        )
      ));
      const activeSelect = h(PillSelect, {
        disabled: busy,
        value: activeId,
        selectedLabel: a0 ? a0.name + "\uFF08" + typeLabel(a0.type) + "\uFF09" : "\u65E0 \xB7 \u6781\u7B80\u6A21\u5F0F\uFF08\u4E0D\u62C9\u53D6\uFF09",
        options: [{ id: "", label: "\u65E0 \xB7 \u6781\u7B80\u6A21\u5F0F\uFF08\u4E0D\u62C9\u53D6\uFF09" }].concat(vendors.map((v) => ({ id: v.id, label: v.name + "\uFF08" + typeLabel(v.type) + "\uFF09" }))),
        onSelect: (id) => void applyActive(id)
      });
      const vrows = [h(SecRow, { key: "__active", label: "\u5F53\u524D\u4F9B\u5E94\u5546", desc: "\u70B9\u5F00\u9009\u62E9\u4FA7\u8FB9\u680F\u5C55\u793A\u7684\u4F9B\u5E94\u5546\uFF1B\u65E0 = \u6781\u7B80\u6A21\u5F0F\u3002" }, activeSelect)];
      vendors.forEach((v) => {
        const snap = s.snaps[v.id];
        const isCur = v.id === activeId;
        const status = snap && snap.ok ? h("span", { className: "tm-hint" }, "\u66F4\u65B0" + timeAgo(snap.at)) : snap ? P.Tooltip ? h(P.Tooltip, { label: snap.error || "\u62C9\u53D6\u5931\u8D25", side: "top" }, h("span", { className: "tm-hint" }, "\u62C9\u53D6\u5931\u8D25")) : h("span", { className: "tm-hint", title: snap.error || "\u62C9\u53D6\u5931\u8D25" }, "\u62C9\u53D6\u5931\u8D25") : h("span", { className: "tm-hint" }, "\u672A\u62C9\u53D6");
        vrows.push(h(
          SecRow,
          {
            key: "v:" + v.id,
            wrap: true,
            label: h(
              "span",
              { style: { display: "flex", alignItems: "center", gap: 6, minWidth: 0, maxWidth: "100%" } },
              h("span", { className: "tm-dot" + (snap && !snap.ok ? " bad" : "") }),
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
            h(Btn, { variant: "outline", size: "sm", disabled: busy, onClick: () => void refreshVendor(v.id) }, "\u62C9\u53D6"),
            h(Btn, { variant: "outline", size: "sm", disabled: busy, onClick: () => setEditing({ id: v.id, data: JSON.parse(JSON.stringify(v)) }) }, "\u7F16\u8F91"),
            v.secretKind === "plain" ? h(Btn, { variant: "ghost", size: "sm", disabled: busy, title: "\u660E\u6587\u8F6C\u5B58\u7CFB\u7EDF\u51ED\u636E\uFF0C\u6539\u5199\u4E3A $NAME \u5F15\u7528", onClick: () => void toCred(v.id) }, "\u5B58\u51ED\u636E") : null,
            h(Btn, { variant: "ghost", size: "sm", disabled: busy, onClick: () => requestDelVendor(v) }, "\u5220\u9664")
          )
        ));
      });
      kids.push(h(
        "div",
        { key: "vendors", className: "tm-section" },
        h("div", { className: "tm-sectionHead" }, "\u4F9B\u5E94\u5546"),
        h("p", { className: "tm-cardHint", style: { margin: "0 0 4px" } }, "\u4FA7\u8FB9\u680F\u5361\u7247\u70B9\u4F9B\u5E94\u5546\u540D\u4E5F\u53EF\u5207\u6362\u3002\u5BC6\u94A5 $NAME \u5F15\u7528\u4F18\u5148\uFF0C\u660E\u6587\u4FDD\u5B58\u540E\u4E0D\u660E\u6587\u56DE\u663E\u3002"),
        vrows
      ));
      if (editing) kids.push(h(
        "div",
        { key: "edit", className: "tm-section" },
        h("div", { className: "tm-sectionHead" }, "\u7F16\u8F91 " + editing.id),
        h("p", { className: "tm-cardHint", style: { margin: "0 0 4px" } }, "ID \u662F\u4E3B\u952E\uFF0C\u4E0D\u53EF\u4FEE\u6539\uFF1B\u5BC6\u94A5\u7559\u7A7A\u5373\u4FDD\u7559\u539F\u503C\u3002"),
        h(VendorForm, {
          draft: editing.data,
          set: (nd) => setEditing({ id: editing.id, data: nd }),
          submitLabel: "\u4FDD\u5B58\u4FEE\u6539",
          busy,
          isEdit: true,
          onCancel: () => setEditing(null),
          onSubmit: () => void saveVendor(editing.data, true)
        })
      ));
      kids.push(h(
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
      ));
      const allSecs = SEC_PRESETS2.indexOf(curSec) >= 0 ? SEC_PRESETS2 : [curSec].concat(SEC_PRESETS2);
      kids.push(h(
        "div",
        { key: "refresh", className: "tm-section" },
        h("div", { className: "tm-sectionHead" }, "\u81EA\u52A8\u5237\u65B0"),
        h(
          SecRow,
          { key: "sec", label: "\u5237\u65B0\u95F4\u9694", desc: "\u5F53\u524D\u4F9B\u5E94\u5546\u6309\u95F4\u9694\u81EA\u52A8\u62C9\u53D6\uFF1B\u5207\u6362\u4F9B\u5E94\u5546\u4F1A\u7ACB\u5373\u5237\u65B0\u4E00\u6B21\uFF1B\u5931\u8D25\u65F6\u4FDD\u7559\u65E7\u6570\u636E\u5E76\u5728\u5361\u7247\u6807\u6CE8\u3002" },
          h(PillSelect, {
            disabled: busy,
            value: String(curSec),
            selectedLabel: secLabel2(curSec),
            options: allSecs.map((n) => ({ id: String(n), label: secLabel2(n) })),
            onSelect: (id) => void saveSecVal(Number(id))
          })
        )
      ));
      kids.push(h(
        "div",
        { key: "tools", className: "tm-section" },
        h(
          "div",
          { className: "tm-bar", style: { borderBottom: "none" } },
          h(Btn, { variant: "outline", size: "sm", disabled: busy, onClick: () => void withBusy(() => reload()) }, busy ? "\u8BFB\u53D6\u4E2D\u2026" : "\u91CD\u65B0\u8BFB\u53D6"),
          h(Btn, { variant: "outline", size: "sm", disabled: busy, onClick: () => void withBusy(() => refreshVendor()) }, "\u5168\u90E8\u62C9\u53D6")
        )
      ));
      const manual = aiManual(s.namespace || "dshp-token-meter", s.docPath || "");
      kids.push(h(
        "div",
        { key: "manual", className: "tm-section" },
        h("div", { className: "tm-sectionHead" }, "\u7ED9 AI \u7684\u914D\u7F6E\u8BF4\u660E\u4E66"),
        h("p", { className: "tm-cardHint", style: { margin: "0 0 4px" } }, "AI \u53EF\u76F4\u63A5\u7F16\u8F91 settings.yaml \u7684 ", h("code", { className: "tm-mono" }, s.namespace || "dshp-token-meter"), " \u5206\u8282\uFF0C\u4FDD\u5B58\u5373\u751F\u6548\uFF08\u70ED\u91CD\u8F7D\uFF09\uFF0C\u65E0\u9700\u8D70\u8868\u5355\u3002\u5BC6\u94A5\u4F18\u5148\u7528 $NAME \u5F15\u7528\u5199\u6CD5\u3002"),
        P.CodeBlock ? h(P.CodeBlock, { code: manual, lang: "yaml", copyLabel: "\u590D\u5236", copiedLabel: "\u5DF2\u590D\u5236", className: "tm-codeblock" }) : h("pre", { className: "tm-mono", style: { fontSize: 11, whiteSpace: "pre-wrap", wordBreak: "break-all" } }, manual)
      ));
      kids.push(h("p", { key: "foot", className: "tm-footerNote", style: { marginTop: 4 } }, "manual \u7C7B\u578B\u76F4\u63A5\u5199\u6570\u5B57\uFF0C\u65E0\u9700\u62C9\u53D6\uFF1BactiveVendor \u4E3A\u7A7A\u5B57\u7B26\u4E32\u65F6\u8FDB\u5165\u6781\u7B80\u6A21\u5F0F\u3002"));
      if (confirmDel) {
        const target = confirmDel;
        if (P.RiskConfirmation) {
          kids.push(h(P.RiskConfirmation, {
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
          }));
        } else if (acked) {
          kids.push(h(
            "div",
            { key: "confirm-del", className: "tm-errbox" },
            h("div", { className: "tm-errtext" }, "\u786E\u8BA4\u5220\u9664\u300C" + target.name + "\u300D\uFF1F"),
            h(
              "div",
              { style: { display: "flex", gap: 8, marginTop: 6 } },
              h(Btn, { variant: "outline", size: "sm", onClick: () => {
                setConfirmDel(null);
                void delVendor(target.id);
              } }, "\u786E\u8BA4\u5220\u9664"),
              h(Btn, { variant: "outline", size: "sm", onClick: () => {
                setConfirmDel(null);
                setAcked(false);
              } }, "\u53D6\u6D88")
            )
          ));
        } else {
          kids.push(h(
            "div",
            { key: "confirm-del", className: "tm-errbox" },
            h("div", { className: "tm-errtext" }, "\u5220\u9664\u4F9B\u5E94\u5546\u300C" + target.name + "\u300D\uFF1F\u6B64\u64CD\u4F5C\u4E0D\u53EF\u64A4\u9500\u3002"),
            h(
              "div",
              { style: { display: "flex", gap: 8, marginTop: 6 } },
              h(Btn, { variant: "outline", size: "sm", onClick: () => setAcked(true) }, "\u6211\u5DF2\u4E86\u89E3"),
              h(Btn, { variant: "outline", size: "sm", onClick: () => setConfirmDel(null) }, "\u53D6\u6D88")
            )
          ));
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
      const v = (s.cfg && s.cfg.vendors || []).filter((x) => x.id === props.vendorId)[0];
      if (!s.cfg) return h("div", { className: "tm-card" }, h("div", { className: "tm-hint" }, s.loading ? "\u989D\u5EA6\u52A0\u8F7D\u4E2D\u2026" : s.error || "\u989D\u5EA6\u52A0\u8F7D\u5931\u8D25"));
      if (!v) return h("div", { className: "tm-card" }, h("div", { className: "tm-hint" }, "\u4F9B\u5E94\u5546\u5DF2\u5220\u9664\uFF0C\u5173\u95ED\u672C\u6D6E\u7A97\u5373\u53EF\u3002"));
      const snap = s.snaps[v.id];
      const isCur = v.id === s.cfg.activeVendor;
      const failed = !!(snap && !snap.ok);
      const wid = "quota:" + v.id;
      return h(
        "div",
        { className: "tm-card" + (failed && !s.loading ? " tm-side error" : ""), style: { marginBottom: 12 } },
        h(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 6, minWidth: 0, flexWrap: "wrap" } },
          h("span", { className: "tm-dot" + (snap && !snap.ok ? " bad" : "") }),
          h("span", { className: "tm-vname2", style: { maxWidth: 220 } }, v.name),
          h(Badge, { kind: "info", text: typeLabel(v.type) }),
          secretBadge(v.secretKind),
          isCur ? h(Badge, { kind: "ok", text: "\u5F53\u524D" }) : null,
          h("span", { style: { flex: "1 1 auto" } }),
          h(
            "span",
            { style: { display: "inline-flex", gap: 6, alignItems: "center", flexWrap: "wrap" } },
            isCur ? null : h(Btn, { variant: "outline", size: "sm", disabled: s.loading, onClick: () => void setActive(v.id) }, "\u8BBE\u4E3A\u5F53\u524D"),
            h(Btn, { variant: "outline", size: "sm", disabled: s.loading, onClick: () => void refreshVendor(v.id) }, "\u62C9\u53D6"),
            WG ? h(WG.WidgetToggle, { id: wid }) : null
          )
        ),
        snap ? snap.ok ? h(
          "div",
          { style: { marginTop: 6 } },
          snap.billingKind === "payg" ? h(PaygBody, { snap }) : h(RollingBody, { snap, now }),
          snap.extra ? h(ExtraBody, { extra: snap.extra }) : null,
          h(
            "div",
            { className: "tm-qmeta" },
            h("span", null, "\u66F4\u65B0" + timeAgo(snap.at) + (snap.via ? " \xB7 " + snap.via : "")),
            h("span", null, "")
          )
        ) : h(ErrBox, { msg: snap.error || "\u62C9\u53D6\u5931\u8D25", meta: v.name + " \xB7 \u5931\u8D25\u4E8E" + timeAgo(snap.at) }) : h("div", { className: "tm-hint", style: { marginTop: 6 } }, "\u5C1A\u672A\u62C9\u53D6\uFF0C\u70B9\u51FB\u62C9\u53D6\u83B7\u53D6\u6700\u65B0\u989D\u5EA6\u3002")
      );
    }
    function QuotaRightPane() {
      const s = useStore();
      React.useEffect(() => {
        void ensureLoad();
      }, []);
      const floats = WG && typeof WG.useWidgets === "function" ? WG.useWidgets() : [];
      const rawSec = s.cfg ? s.cfg.refreshSec : void 0;
      const numSec = rawSec === void 0 || rawSec === null || rawSec === "" ? 60 : Number(rawSec);
      const effSec = numSec === 0 ? 0 : isFinite(numSec) ? Math.min(3600, Math.max(10, numSec || 60)) : 60;
      const effId = s.cfg ? s.cfg.activeVendor || "" : "";
      React.useEffect(() => {
        if (!effId || !(effSec > 0)) return void 0;
        const id = window.setInterval(() => {
          if (store.get().loading) return;
          const curA = activeOf(store.get());
          if (curA && curA.id === effId) void refreshVendor(effId);
        }, effSec * 1e3);
        return () => window.clearInterval(id);
      }, [effId, effSec]);
      const kids = [];
      kids.push(h("p", { key: "d", className: "tm-intro" }, "\u5168\u90E8\u4F9B\u5E94\u5546\u989D\u5EA6\u4E00\u89C8\uFF08\u53F3\u4FA7\u680F\u7A7A\u95F4\u66F4\u5BBD\uFF0C\u56FE\u8868\u5B8C\u6574\u5C55\u5F00\uFF09\u3002\u589E\u5220\u6539\u8BF7\u5230 \u8BBE\u7F6E \u2192 Token \u8BA1\u91CF\u3002"));
      if (s.error) kids.push(h("p", { key: "err", className: "tm-notice tm-notice-err" }, s.error));
      if (!s.cfg) {
        kids.push(h(
          "div",
          { key: "loading", className: "tm-loading" },
          h("span", { className: "tm-spinner" }),
          h("span", { className: "tm-loadingText" }, s.loading ? "\u6B63\u5728\u8BFB\u53D6\u989D\u5EA6\u914D\u7F6E\u2026" : "\u989D\u5EA6\u914D\u7F6E\u52A0\u8F7D\u5931\u8D25")
        ));
        return h("div", { className: "tm-page" }, kids);
      }
      const vendors = s.cfg.vendors || [];
      if (!vendors.length) {
        kids.push(h("div", { key: "empty", className: "tm-card tm-empty" }, "\u6682\u65E0\u4F9B\u5E94\u5546\uFF0C\u53BB \u8BBE\u7F6E \u2192 Token \u8BA1\u91CF \u6DFB\u52A0\u7B2C\u4E00\u4E2A\u3002"));
        return h("div", { className: "tm-page" }, kids);
      }
      const activeId = s.cfg.activeVendor || "";
      const ordered = vendors.filter((v) => v.id === activeId).concat(vendors.filter((v) => v.id !== activeId));
      for (const v of ordered) {
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
      quotaStore: {
        useStore,
        useNow,
        ensureLoad,
        reload,
        refreshVendor,
        setActive,
        setEnabled,
        setRefresh,
        setFloatOpen,
        openMenu,
        savePrefs,
        activeOf,
        typeLabel,
        remainOf,
        call
      },
      quotaUI: { Badge, SecRow, PillSelect, VendorForm, secretBadge }
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
  var keyOf = (t) => {
    const d = new Date(t);
    const M = String(d.getMonth() + 1);
    const D = String(d.getDate());
    return d.getFullYear() + "-" + (M.length < 2 ? "0" + M : M) + "-" + (D.length < 2 ? "0" + D : D);
  };
  var fromKey = (k) => {
    const p = k.split("-");
    return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]), 12).getTime();
  };
  var dispDay = (k) => k ? k.slice(5).replace("-", "/") : "";
  var cnDate = (k) => {
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
    return { byDay, byModel, byHour, i: si, o: so, cr: scr, cw: scw, n: sn, total: si + so + scr + scw, first, last };
  }
  function streaks(byDay) {
    const set = new Set(byDay.keys());
    const today = keyOf(Date.now());
    const yKey = keyOf(fromKey(today) - 864e5);
    let cur = 0;
    let cursor = set.has(today) ? today : set.has(yKey) ? yKey : null;
    while (cursor !== null && set.has(cursor)) {
      cur++;
      cursor = keyOf(fromKey(cursor) - 864e5);
    }
    const keys = sorted(Array.from(set));
    let longest = 0, run = 0, prev = null;
    for (const k of keys) {
      run = prev !== null && keyOf(fromKey(prev) + 864e5) === k ? run + 1 : 1;
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
      c = keyOf(fromKey(c) + 864e5);
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
  function smoothPath(pts) {
    const n = pts.length;
    if (n === 0) return "";
    if (n === 1) return "M " + pts[0][0] + " " + pts[0][1];
    if (n === 2) return "M " + pts[0][0] + " " + pts[0][1] + " L " + pts[1][0] + " " + pts[1][1];
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
      const v = JSON.parse(window.localStorage.getItem(TM_TODAY_LS_POS) || window.localStorage.getItem(TS_TODAY_LS_POS) || "null");
      if (v && isFinite(v.x) && isFinite(v.y)) return { x: Number(v.x), y: Number(v.y) };
    } catch {
    }
    return null;
  }
  function tmTodaySave(open, pos) {
    try {
      window.localStorage.setItem(TM_TODAY_LS_OPEN, open ? "1" : "0");
      if (pos) window.localStorage.setItem(TM_TODAY_LS_POS, JSON.stringify({ x: Math.round(pos.x), y: Math.round(pos.y) }));
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
      return h("div", { className: props.className || "", style: props.style || void 0 }, format(disp));
    }
    function Seg(props) {
      return h("div", { className: "tm-seg" }, (props.options || []).map((o) => h("button", {
        key: o.v,
        className: "tm-seg-btn" + (props.current === o.v ? " tm-seg-on" : ""),
        "aria-pressed": props.current === o.v ? "true" : "false",
        onClick: () => props.onPick(o.v)
      }, o.t)));
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
        parts.map((p) => h(
          "div",
          { key: p[0], className: "tm-pop-row" },
          h("span", { className: "tm-pop-k" }, p[0]),
          h("span", { className: "tm-pop-v" }, fmtFull(p[1]) + " \xB7 " + (p[3] > 0 ? (p[1] / p[3] * 100).toFixed(1) : "0.0") + "%")
        ))
      );
    }
    function ComposeBar(props) {
      const parts = props.parts || [];
      const total = parts.reduce((s, p) => s + p[1], 0);
      if (total <= 0) return null;
      return h(
        "div",
        null,
        h("div", { className: "tm-compose" }, parts.filter((p) => p[1] > 0).map((p) => {
          const w = p[1] / total * 100;
          return h("span", { key: p[0], style: { width: w.toFixed(2) + "%", background: p[2] } });
        })),
        h(
          "div",
          { className: "tm-compose-legend" },
          parts.map((p) => h(
            "span",
            { key: p[0] },
            h("i", { style: { background: p[2] } }),
            p[0]
          ))
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
        h("path", { d: area, className: "tm-fadein", style: { fill: c, fillOpacity: 0.13, animationDelay: ".18s" } }),
        h("path", { d: line, className: "tm-draw", fill: "none", style: { stroke: c, strokeWidth: 1.5, strokeLinecap: "round", animationDelay: ".12s" } }),
        h("circle", { cx: xs(vals.length - 1), cy: ys(vals[vals.length - 1]), r: 1.8, className: "tm-fadein", style: { fill: c, animationDelay: ".55s" } })
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
        h("span", { className: "tm-streakfill", style: { width: pct.toFixed(1) + "%", background: "linear-gradient(90deg, var(--dsw-alias-state-business-primary), color-mix(in srgb, var(--dsw-alias-state-business-primary) 55%, transparent))" } })
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
        if (byDay.has(keyOf(m))) buckets[b].active++;
      }
      return h(
        "div",
        { className: "tm-dayscroll" },
        buckets.map((b, i) => {
          const ratio = b.total > 0 ? b.active / b.total : 0;
          return h("span", { key: i, style: { background: BP, opacity: ratio === 0 ? 0.08 : 0.15 + ratio * 0.8, animationDelay: i * 26 + "ms" } });
        })
      );
    }
    function DualBars(props) {
      const { a, b, height } = props;
      const max = Math.max(a, b) || 1;
      const H = height || 14;
      return h(
        "div",
        { className: props.className || "", style: { display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 3, height: H + 2, marginTop: 3 } },
        h("span", { className: "tm-rise", style: { width: 9, borderRadius: "2px 2px 0 0", background: BP, display: "block", height: Math.max(2, a / max * H).toFixed(1) + "px", animationDelay: "60ms" } }),
        h("span", { className: "tm-rise", style: { width: 9, borderRadius: "2px 2px 0 0", background: BP, opacity: 0.28, display: "block", height: Math.max(2, b / max * H).toFixed(1) + "px", animationDelay: "150ms" } })
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
        kids.push(h("text", { key: "gt" + fr, x: pl - 8, y: yy + 4, textAnchor: "end", className: "tm-axislbl" }, fmt2(top * fr)));
      }
      const tickCount = Math.min(n, 9);
      const xt = [];
      for (let j = 0; j < tickCount; j++) {
        const idx = tickCount <= 1 ? 0 : Math.round(j * (n - 1) / (tickCount - 1));
        if (xt.length === 0 || xt[xt.length - 1] !== idx) xt.push(idx);
      }
      for (const i of xt) {
        kids.push(h("text", { key: "x" + i, x: xs(i), y: H - 9, textAnchor: i === 0 ? "start" : i === n - 1 ? "end" : "middle", className: "tm-axislbl" }, labels[i]));
      }
      if (hover !== null) {
        kids.push(h("line", { key: "ch", x1: xs(hover.i), x2: xs(hover.i), y1: pt, y2: H - pb, style: { stroke: BP, strokeWidth: 1, strokeDasharray: "3 3", opacity: 0.7 } }));
        for (const s of vis) {
          if (s.values[hover.i] === void 0) continue;
          kids.push(h("circle", { key: "d" + s.name, cx: xs(hover.i), cy: ys(s.values[hover.i]), r: 3.5, style: { fill: s.color, stroke: "var(--dsw-alias-bg-layer-1)", strokeWidth: 1.5 } }));
        }
      }
      let li = 0;
      for (const s of seriesList) {
        if (!s.visible) continue;
        kids.push(h("path", {
          key: "ln" + s.name,
          className: "tm-draw",
          d: smoothPath(s.values.map((v, i) => [xs(i), ys(v)])),
          fill: "none",
          style: { stroke: s.color, strokeWidth: s.isTotal ? 2.6 : 1.9, strokeLinecap: "round", strokeLinejoin: "round", opacity: s.isTotal ? 1 : 0.92, animationDelay: 0.15 + li * 0.09 + "s" }
        }));
        li++;
      }
      kids.push(h("rect", { key: "cap", x: 0, y: 0, width: W, height: H, fill: "transparent", style: { cursor: "crosshair" }, onMouseMove: onMove, onMouseLeave: () => setHover(null) }));
      const tip = hover !== null ? (() => {
        const active = vis.filter((s) => (s.values[hover.i] || 0) > 0);
        const rows = sorted(active, (a, b) => (b.values[hover.i] || 0) - (a.values[hover.i] || 0));
        const comp = props.comp ? props.comp[hover.i] : void 0;
        const compTotal = comp ? comp.i + comp.o + comp.cr + comp.cw : 0;
        const pos = tipPos(hover.mx, hover.my, 270, (comp ? 98 : 44) + rows.length * 18);
        return tmPortal(h(
          "div",
          { className: "tm-tipfixed" + (props.above ? " tm-tip-above" : ""), style: pos },
          h("div", { className: "tm-tiprow", style: { fontWeight: 600, marginBottom: 2 } }, titles[hover.i]),
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
          rows.length > 0 ? rows.map((s) => h(
            "div",
            { key: s.name, className: "tm-tiprow" },
            h("span", { className: "tm-dot", style: { background: s.color, width: 8, height: 8 } }),
            h("span", { className: "tm-tip-k", style: { flex: "1 1 auto", overflow: "hidden", textOverflow: "ellipsis" } }, s.shortName),
            h("span", { className: "tm-tip-v" }, fmt2(s.values[hover.i] || 0))
          )) : comp ? null : h("div", { className: "tm-tiprow", style: { color: "var(--dsw-alias-label-tertiary)" } }, emptyText)
        ));
      })() : null;
      return h(
        "div",
        { className: "tm-svgwrap" },
        h("svg", { viewBox: "0 0 " + W + " " + H, style: { width: "100%", height: "auto", display: "block" }, ref: svgRef }, kids),
        tip
      );
    }
    function Heatmap(props) {
      const byDay = props.byDay;
      const daySessions = props.daySessions || {};
      const months = props.months || 6;
      const today = keyOf(Date.now());
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
          const k = keyOf(startW + w * 6048e5 + r * 864e5);
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
          cells.push(h("div", {
            key: w,
            className: "tm-hcell",
            "data-lv": cell === null || cell.v <= 0 ? "0" : String(levelOf2(cell.v)),
            style: cell === null ? { visibility: "hidden" } : cell.v > 0 ? { background: BP, opacity: OPS[levelOf2(cell.v)], animationDelay: w * 45 % 480 + "ms" } : void 0,
            onMouseEnter: cell ? (e) => onCell(cell, e) : void 0,
            onMouseMove: cell ? (e) => onCell(cell, e) : void 0,
            onMouseLeave: () => setHover(null)
          }));
        }
        rows.push(h(
          "div",
          { key: r, style: { display: "flex", gap: 4, alignItems: "center" } },
          h("span", { style: { width: 14, fontSize: 9, color: "var(--dsw-alias-label-caption)", flex: "none", textAlign: "center", lineHeight: "14px" } }, r % 2 === 0 ? WL[r] : ""),
          h("div", { className: "tm-heatrow", style: { gap: cellGap + "px" } }, cells)
        ));
      }
      const monthLabels = [];
      let prevM = null;
      for (let w = 0; w < weeks; w++) {
        const mo = Number(keyOf(startW + w * 6048e5).slice(5, 7));
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
          monthLabels.map((m, i) => h("span", { key: i, style: { fontSize: 9.5, color: "var(--dsw-alias-label-caption)", width: (100 / weeks).toFixed(3) + "%", flex: "none", overflow: "hidden", whiteSpace: "nowrap" } }, m.mo + "\u6708"))
        )
      );
      let pop = null;
      if (hover !== null) {
        const d = hover.day;
        const entries = sorted(Object.entries(d.byModel || {}), (a, b) => b[1] - a[1]);
        const tot = d.t;
        const cache = (d.cr || 0) + (d.cw || 0);
        const cachePct = tot > 0 ? cache / tot * 100 : 0;
        const pos = tipPos(hover.mx, hover.my, 300, 134 + Math.min(entries.length, 8) * 18);
        pop = tmPortal(h(
          "div",
          { className: "tm-pop" + (props.above ? " tm-tip-above" : ""), style: pos },
          h("div", { className: "tm-pop-title" }, cnDate(hover.k)),
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
            h("span", { className: "tm-pop-bar" }, h("span", { className: "tm-pop-fill", style: { width: (tot > 0 ? (d.cr || 0) / tot * 100 : 0).toFixed(1) + "%", background: "#f5a623" } })),
            h("span", { className: "tm-pop-v" }, fmt2(d.cr || 0) + " \xB7 " + (tot > 0 ? ((d.cr || 0) / tot * 100).toFixed(0) : 0) + "%")
          ),
          h(
            "div",
            { className: "tm-pop-row", style: { marginBottom: entries.length > 0 ? 4 : 0 } },
            h("span", { className: "tm-pop-k" }, "\u7F13\u5B58\u5199"),
            h("span", { className: "tm-pop-bar" }, h("span", { className: "tm-pop-fill", style: { width: (tot > 0 ? (d.cw || 0) / tot * 100 : 0).toFixed(1) + "%", background: "#9a6ef1" } })),
            h("span", { className: "tm-pop-v" }, fmt2(d.cw || 0) + " \xB7 \u5360\u6BD4 " + cachePct.toFixed(1) + "%")
          ),
          tot > 0 ? entries.slice(0, 8).map(([mk, v]) => {
            const info = (props.models || {})[mk];
            const color = modelColor(mk);
            return h(
              "div",
              { key: mk, className: "tm-pop-row" },
              h("span", { className: "tm-dot", style: { background: color } }),
              h("span", { style: { maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, info ? info.model : mk),
              h("span", { className: "tm-pop-bar" }, h("span", { className: "tm-pop-fill", style: { width: (tot > 0 ? v / tot * 100 : 0).toFixed(1) + "%", background: color } })),
              h("span", { className: "tm-pop-v" }, fmt2(v) + " \xB7 " + (tot > 0 ? (v / tot * 100).toFixed(0) : 0) + "%")
            );
          }) : h("div", { className: "tm-pop-k" }, "\u5F53\u65E5\u65E0\u7528\u91CF"),
          entries.length > 8 ? h("div", { className: "tm-pop-k", style: { marginTop: 4 } }, "\u2026\u53E6\u6709 " + (entries.length - 8) + " \u4E2A\u6A21\u578B") : null
        ));
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
      const kids = [h("circle", { key: "bg", cx, cy, r, fill: "none", style: { stroke: "var(--dsw-alias-interactive-bg-hover)", strokeWidth: 18 } })];
      let acc = 0;
      for (let i = 0; i < entries.length; i++) {
        const it = entries[i];
        const len = total > 0 ? it.t / total * C : 0;
        kids.push(h("circle", {
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
        }));
        acc += len;
      }
      return h(
        "div",
        { className: "tm-donutBox", style: { position: "relative", width: size, height: size } },
        h("svg", { viewBox: "0 0 " + size + " " + size, style: { width: "100%", height: "100%", display: "block" } }, kids),
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
        kids.push(h("line", { key: "ch", x1: xs(hover.i), x2: xs(hover.i), y1: PAD, y2: H - PAD, style: { stroke: BP, strokeWidth: 1, strokeDasharray: "2 2", opacity: 0.7 } }));
      }
      for (let si = 0; si < seriesList.length; si++) {
        const s = seriesList[si];
        kids.push(h("path", {
          key: "l" + s.name,
          className: "tm-draw",
          d: smoothPath(s.values.map((v, i) => [xs(i), ys(v)])),
          fill: "none",
          style: { stroke: s.color, strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round", opacity: 0.9, animationDelay: 0.1 + si * 0.12 + "s" }
        }));
        kids.push(h("circle", { key: "e" + s.name, cx: xs(n - 1), cy: ys(s.values[n - 1] || 0), r: 1.8, className: "tm-fadein", style: { fill: s.color, animationDelay: 0.55 + si * 0.12 + "s" } }));
        if (hover !== null) {
          kids.push(h("circle", { key: "h" + s.name, cx: xs(hover.i), cy: ys(s.values[hover.i] || 0), r: 2.2, style: { fill: s.color, stroke: "var(--dsw-alias-bg-layer-1)", strokeWidth: 1 } }));
        }
      }
      kids.push(h("rect", { key: "cap", x: 0, y: 0, width: W, height: H, fill: "transparent", style: { cursor: "crosshair" }, onMouseMove: onMove, onMouseLeave: () => setHover(null) }));
      const tip = hover !== null ? (() => {
        const active = seriesList.filter((s) => (s.values[hover.i] || 0) > 0);
        const pos = tipPos(hover.mx, hover.my, 170, 34 + active.length * 16);
        return tmPortal(h(
          "div",
          { className: "tm-tipfixed" + (props.floatTip === true ? " tm-tipfloat" : ""), style: { ...pos, fontSize: 10.5 } },
          h("div", { style: { fontWeight: 600 } }, tickLabels !== null ? tickLabels[hover.i] : hover.i + ":00"),
          active.length > 0 ? sorted(active, (a, b) => (b.values[hover.i] || 0) - (a.values[hover.i] || 0)).map((s) => h(
            "div",
            { key: s.name, className: "tm-tiprow" },
            h("span", { className: "tm-dot", style: { background: s.color, width: 6, height: 6 } }),
            h("span", { className: "tm-tip-k", style: { overflow: "hidden", textOverflow: "ellipsis", maxWidth: 80 } }, s.shortName),
            h("span", { className: "tm-tip-v" }, fmt2(s.values[hover.i] || 0))
          )) : h("div", { style: { color: "var(--dsw-alias-label-tertiary)" } }, "\u8BE5\u5C0F\u65F6\u65E0\u6D88\u8017")
        ));
      })() : null;
      return h(
        "div",
        { className: "tm-svgwrap" },
        h("svg", { className: "tm-spark", viewBox: "0 0 " + W + " " + H, preserveAspectRatio: "none", ref: svgRef }, kids),
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
      if (shared.data && Date.now() - shared.at < 45e3) return Promise.resolve(shared.data);
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
      const [, force] = React.useReducer((x) => x + 1, 0);
      React.useEffect(() => {
        const fn = () => force();
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
      return { data: shared.data, err: shared.err, loading: !shared.data && !!shared.inflight };
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
      const todayK = keyOf(Date.now());
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
      cards.push(h(StatCard, {
        label: "\u7D2F\u8BA1 Token",
        count: aggAll.total,
        tint: true,
        sub: "\u8F93\u5165 " + fmt2(aggAll.i) + " \xB7 \u8F93\u51FA " + fmt2(aggAll.o),
        delay: cards.length * 45,
        onHover: (e) => setPop({ mx: e.clientX, my: e.clientY, content: breakdown("\u7D2F\u8BA1\u6784\u6210", [["\u8F93\u5165", aggAll.i, 1, aggAll.total], ["\u8F93\u51FA", aggAll.o, 1, aggAll.total], ["\u7F13\u5B58\u8BFB", aggAll.cr, 1, aggAll.total], ["\u7F13\u5B58\u5199", aggAll.cw, 1, aggAll.total]]) }),
        onLeave: leave,
        visual: [h(ComposeBar, { parts: [["\u8F93\u5165", aggAll.i, CI], ["\u8F93\u51FA", aggAll.o, CO], ["\u7F13\u5B58\u8BFB", aggAll.cr, CC], ["\u7F13\u5B58\u5199", aggAll.cw, "#9a6ef1"]] })]
      }));
      cards.push(h(StatCard, {
        label: "\u8FD1 30 \u5929\u8D70\u52BF",
        count: sparkVals.reduce((s, v) => s + v, 0),
        sub: "\u6BCF\u65E5\u7528\u91CF\u8FF7\u4F60\u56FE",
        delay: cards.length * 45,
        visual: [h(Sparkline, { values: sparkVals }), h(TrendDelta, { recent: last7, before: prev7 })]
      }));
      cards.push(h(StatCard, {
        label: "\u7F13\u5B58 Token",
        count: aggAll.cr + aggAll.cw,
        sub: "\u547D\u4E2D " + fmt2(aggAll.cr) + " \xB7 \u5199\u5165 " + fmt2(aggAll.cw),
        delay: cards.length * 45,
        onHover: (e) => setPop({ mx: e.clientX, my: e.clientY, content: breakdown("\u7F13\u5B58\u6784\u6210 \xB7 \u547D\u4E2D\u7387 " + (aggAll.total > 0 ? (aggAll.cr / aggAll.total * 100).toFixed(1) : "0.0") + "%", [["\u7F13\u5B58\u8BFB\uFF08\u547D\u4E2D\uFF09", aggAll.cr, 1, aggAll.total], ["\u7F13\u5B58\u5199", aggAll.cw, 1, aggAll.total]]) }),
        onLeave: leave,
        visual: [h(ComposeBar, { parts: [["\u7F13\u5B58\u8BFB", aggAll.cr, CC], ["\u7F13\u5B58\u5199", aggAll.cw, "#9a6ef1"]] })]
      }));
      cards.push(data.peakStep ? h(StatCard, {
        label: "\u5CF0\u503C\u5355\u6B21\u8BF7\u6C42",
        count: data.peakStep.tokens,
        sub: data.peakStep.model + " \xB7 " + dispDay(data.peakStep.d),
        delay: cards.length * 45
      }) : null);
      cards.push(peakDay ? h(StatCard, {
        label: "\u5CF0\u503C\u5355\u65E5",
        count: peakDay.t,
        sub: dispDay(peakDay.d),
        delay: cards.length * 45,
        onHover: (e) => setPop({ mx: e.clientX, my: e.clientY, content: breakdown(peakDay.d + " \u5404\u6A21\u578B", sorted(Object.entries(peakDay.byModel || {}), (a, b) => b[1] - a[1]).slice(0, 6).map(([mk, v]) => [mk, v, 1, peakDay.t])) }),
        onLeave: leave,
        visual: [h(ComposeBar, { parts: sorted(Object.entries(peakDay.byModel || {}), (a, b) => b[1] - a[1]).slice(0, 4).map(([mk, v]) => {
          const info = data.models[mk];
          return [info ? info.model : mk, v, modelColor(mk)];
        }) })]
      }) : null);
      cards.push(h(StatCard, {
        label: "\u65E5\u5747\u6D88\u8017",
        count: avgDay,
        sub: "\u6309\u6D3B\u8DC3\u65E5\u5E73\u5747",
        delay: cards.length * 45,
        visual: [h(Sparkline, { values: sparkVals, color: CO })]
      }));
      cards.push(h(StatCard, { label: "\u65E5\u6D88\u8017\u4E2D\u4F4D\u6570", count: medDay, sub: "\u6309\u6D3B\u8DC3\u65E5\u53D6\u4E2D\u4F4D", delay: cards.length * 45 }));
      cards.push(h(StatCard, {
        label: "\u5F53\u524D\u8FDE\u7EED\u4F7F\u7528",
        count: st.current,
        fmt: (v) => fmt2(v) + " \u5929",
        sub: "\u6309\u81EA\u7136\u65E5\u7EDF\u8BA1",
        delay: cards.length * 45,
        visual: [h(StreakBar, { current: st.current, best: st.longest })]
      }));
      cards.push(h(StatCard, {
        label: "\u6700\u957F\u8FDE\u7EED\u4F7F\u7528",
        count: st.longest,
        fmt: (v) => fmt2(v) + " \u5929",
        sub: "\u5386\u53F2\u6700\u4F73\u7EAA\u5F55",
        delay: cards.length * 45,
        visual: [h(StreakBar, { current: st.current, best: st.longest })]
      }));
      cards.push(h(StatCard, {
        label: "\u6D3B\u8DC3\u5929\u6570",
        count: aggAll.byDay.size,
        fmt: (v) => fmt2(v) + " \u5929",
        sub: "\u5171 " + data.sessions + " \u4E2A\u4F1A\u8BDD",
        delay: cards.length * 45,
        visual: [h(DaysRibbon, { byDay: aggAll.byDay })]
      }));
      cards.push(h(StatCard, { label: "\u6A21\u578B\u8C03\u7528\u6B21\u6570", count: aggAll.n, sub: data.active + " \u4E2A\u4F1A\u8BDD\u6709\u7528\u91CF", delay: cards.length * 45 }));
      cards.push(h(StatCard, { label: "\u9996\u6B21\u4F7F\u7528", value: dispDay(aggAll.first), sub: aggAll.first }));
      cards.push(h(StatCard, { label: "\u6700\u8FD1\u4F7F\u7528", value: dispDay(aggAll.last), sub: aggAll.last }));
      const toolbar = props.widgets && props.widgetId ? h("div", { style: { display: "flex", justifyContent: "flex-end", marginBottom: 6 } }, widgetBtns(props.widgets, props.widgetId)) : null;
      return h(
        "div",
        { className: "tm-card" },
        toolbar,
        h("div", { className: "tm-grid" }, cards),
        pop !== null ? tmPortal(h("div", { className: "tm-pop" + (props.inFloat ? " tm-tip-above" : ""), style: tipPos(pop.mx, pop.my, 280, 60) }, pop.content)) : null
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
      const todayK = keyOf(Date.now());
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
          slots.push({ d: keyOf(t), h: new Date(t).getHours() });
        }
        trendLabels = slots.map((s) => s.d === todayK ? s.h + ":00" : "\u6628\u65E5" + s.h + ":00");
        trendTitles = slots.map((s) => cnDate(s.d) + " " + s.h + ":00\u2013" + (s.h + 1) + ":00");
        trendEmpty = "\u8BE5\u5C0F\u65F6\u65E0\u6D88\u8017";
        const slotIdx = /* @__PURE__ */ new Map();
        for (let i = 0; i < slots.length; i++) slotIdx.set(slots[i].d + "|" + slots[i].h, i);
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
        trendSeries.push({ name: "__total__", shortName: "\u603B Token", color: "#8a94a6", isTotal: true, values: hourTotal, visible: showTotal });
      } else {
        const N = trendRange === "7d" ? 7 : 30;
        const dayList = buildDayList(keyOf(fromKey(todayK) - (N - 1) * 864e5), todayK);
        trendLabels = dayList.map(dispDay);
        trendTitles = dayList.map(cnDate);
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
          h("span", { className: "tm-chart-name" }, "Token \u4F7F\u7528\u8D8B\u52BF\uFF08" + (trendRange === "24h" ? "\u8FD124\u5C0F\u65F6\u6309\u5C0F\u65F6" : trendRange === "7d" ? "\u8FD17\u5929\u6309\u5929" : "\u8FD130\u5929\u6309\u5929") + " \xB7 \u60AC\u6D6E\u67E5\u770B\u660E\u7EC6\uFF09"),
          h(
            "span",
            { style: { display: "inline-flex", gap: 6, alignItems: "center" } },
            h(Seg, { options: [{ v: "24h", t: "\u8FD124\u5C0F\u65F6" }, { v: "7d", t: "\u8FD17\u5929" }, { v: "30d", t: "\u8FD130\u5929" }], current: trendRange, onPick: setTrendRange }),
            widgetBtns(props.widgets, props.widgetId)
          )
        ),
        h(
          "div",
          { className: "tm-legend", style: { marginBottom: 2, marginTop: 0 } },
          trendSeries.map((s) => h("button", {
            key: s.name,
            className: "tm-modelchip",
            "data-off": s.visible ? "0" : "1",
            "aria-pressed": s.visible ? "true" : "false",
            onClick: () => {
              if (s.name === "__total__") setShowTotal(!showTotal);
              else setModelOff({ ...modelOff, [s.name]: !modelOff[s.name] });
            }
          }, h("span", { className: "tm-dot", style: { background: s.color } }), h("span", { className: "tm-mc-name" }, s.shortName))),
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
            h(Seg, { options: [{ v: "1", t: "1\u4E2A\u6708" }, { v: "3", t: "3\u4E2A\u6708" }, { v: "6", t: "6\u4E2A\u6708" }, { v: "12", t: "12\u4E2A\u6708" }], current: heatSpan, onPick: setHeatSpan }),
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
          HEAT_OPS.map((o, i) => h("span", { key: i, className: "tm-cell", style: { background: BP, opacity: o } })),
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
          h("span", null, "\u7F13\u5B58\u5360\u6BD4 " + (aggAll.total > 0 ? ((aggAll.cr + aggAll.cw) / aggAll.total * 100).toFixed(1) : "0.0") + "%")
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
      if (rest.length > 0) donutEntries.push({ name: "\u5176\u4ED6", t: rest.reduce((s, m) => s + m.t, 0), color: "#8a94a6" });
      const modelRows = arr.map((m, i) => {
        const info = data.models[m.m] || null;
        const name = info ? info.model : m.m;
        const color = modelColor(m.m);
        const pct = sc.total > 0 ? m.t / sc.total * 100 : 0;
        const hoverContent = () => breakdown(m.m + " \u7528\u91CF\u6784\u6210", [["\u8F93\u5165", m.i, 1, m.t], ["\u8F93\u51FA", m.o, 1, m.t], ["\u7F13\u5B58\u8BFB", m.cr, 1, m.t], ["\u7F13\u5B58\u5199", m.cw, 1, m.t]]);
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
              h("span", { className: "tm-barfill", style: { width: (m.t / arr[0].t * 100).toFixed(1) + "%", background: color, animationDelay: i * 40 + 120 + "ms" } })
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
        pop !== null ? tmPortal(h("div", { className: "tm-pop" + (props.inFloat ? " tm-tip-above" : ""), style: tipPos(pop.mx, pop.my, 280, 60) }, pop.content)) : null
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
        return h("div", { className: "tm-hint" }, err ? "\u7EDF\u8BA1\u52A0\u8F7D\u5931\u8D25\uFF1A" + err : loading ? "\u6B63\u5728\u805A\u5408\u4F1A\u8BDD\u65E5\u5FD7\u2026" : "\u6682\u65E0\u6570\u636E\uFF08\u6253\u5F00\u53F3\u4FA7\u680F\u7528\u91CF\u9762\u677F\u53EF\u52A0\u901F\u52A0\u8F7D\uFF09");
      }
      const aa = aggAll;
      const w = { widgets: props.widgets, widgetId: props.widgetId };
      if (props.kind === "trend") return h(TrendSection, { data, aggAll: aa, inFloat: true, ...w });
      if (props.kind === "heat") return h(HeatSection, { data, aggAll: aa, inFloat: true, ...w });
      if (props.kind === "donut") {
        const tk = keyOf(Date.now());
        const cut = range === "all" ? null : keyOf(fromKey(tk) - (Number(range) - 1) * 864e5);
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
            h(Seg, { options: [{ v: "7", t: "\u8FD17\u5929" }, { v: "30", t: "\u8FD130\u5929" }, { v: "90", t: "\u8FD190\u5929" }, { v: "all", t: "\u5168\u90E8" }], current: range, onPick: setRange })
          )
        });
      }
      if (props.kind === "today") return h(TodayCard, { wide: true, bare: true, name: "\u4ECA\u65E5\u6D88\u8017", inFloat: true, ...w });
      return h(StatCardsSection, { aggAll: aa, data, inFloat: true, ...w });
    }
    function StatsSettingsPage(props) {
      const showPrefs = props.showPrefs !== false;
      const Btn = P.Button || (({ children: children2, ...rest }) => h("button", { type: "button", className: "tm-btn", ...rest }, children2));
      const [data, setData] = useState(null);
      const [err, setErr] = useState(null);
      const [loading, setLoading] = useState(true);
      const [range, setRange] = useState(props.defaultRange || "30");
      const [todayOn, setTodayOn] = useState(false);
      const fl = useTmTodayFloat();
      React.useEffect(() => {
        setRange(props.defaultRange || "30");
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
          timer = window.setTimeout(() => {
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
          }, st.same >= 8 ? 12e3 : 2e3);
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
        const tk = keyOf(Date.now());
        const c = range === "all" ? null : keyOf(fromKey(tk) - (Number(range) - 1) * 864e5);
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
        children.push(h(
          "p",
          { className: "tm-desc" },
          "\u805A\u5408\u672C\u673A\u5168\u90E8\u4F1A\u8BDD\u65E5\u5FD7\uFF08\u542B\u5B50\u4EE3\u7406\u4F1A\u8BDD\uFF1Bfork/resume \u79CD\u5B50\u4E8B\u4EF6\u5DF2\u53BB\u91CD\uFF09\u3002\u6570\u636E\u6BCF 60 \u79D2\u81EA\u52A8\u5237\u65B0\uFF1B\u65F6\u95F4\u8303\u56F4\u4F5C\u7528\u4E8E\u5F53\u524D\u8303\u56F4\u5361\u7247\u4E0E\u6A21\u578B\u5206\u5E03\uFF0C\u8D8B\u52BF\u56FE\u7528\u81EA\u5E26\u7684\u8FD124\u5C0F\u65F6 / \u8FD17\u5929 / \u8FD130\u5929\u5207\u6362\uFF0C\u603B\u89C8\u4E0E\u70ED\u529B\u56FE\u4E3A\u5168\u91CF\u6570\u636E\u3002"
        ));
      }
      if (showPrefs) {
        children.push(h(
          "div",
          { className: "tm-swrow" },
          h(
            "div",
            { className: "tm-swrowText" },
            h("div", { className: "tm-swlabel" }, "\u5728\u4FA7\u8FB9\u680F\u663E\u793A\u4ECA\u65E5\u7528\u91CF"),
            h("div", { className: "tm-swhint" }, "\u5F00\u542F\u540E\u5DE6\u4FA7\u8FB9\u680F\u5E95\u90E8\u663E\u793A\u4ECA\u65E5 Token \u6D88\u8017\u5C0F\u5361\u7247\uFF08\u542B\u5206\u8272\u5C0F\u65F6\u66F2\u7EBF\u4E0E\u6628\u65E5\u5BF9\u6BD4\uFF1B\u504F\u597D\u5B58 settings.yaml \xB7 dshp-token-meter\uFF09")
          ),
          h("button", {
            className: "tm-switch",
            role: "switch",
            "aria-checked": todayOn ? "true" : "false",
            "aria-label": "\u5728\u4FA7\u8FB9\u680F\u663E\u793A\u4ECA\u65E5\u7528\u91CF",
            onClick: () => void setToday(!todayOn)
          }, h("span", { className: "tm-knob" }))
        ));
        children.push(h(
          "div",
          { className: "tm-swrow" },
          h(
            "div",
            { className: "tm-swrowText" },
            h("div", { className: "tm-swlabel" }, "\u4ECA\u65E5\u5361\u7247\u6D6E\u7A97"),
            h("div", { className: "tm-swhint" }, "\u5F39\u51FA\u540E\u53EF\u62D6\u5230\u5C4F\u5E55\u4EFB\u610F\u4F4D\u7F6E\uFF0C\u4FA7\u8FB9\u680F\u4E0D\u518D\u5360\u4F4D\uFF1B\u5F00\u5173\u4E0E\u5750\u6807\u5B58\u672C\u673A localStorage")
          ),
          fl.open ? h(Btn, { variant: "outline", size: "sm", onClick: () => tmTodaySet(false) }, "\u6536\u56DE\u4FA7\u8FB9\u680F") : h("div", { className: "tm-hint" }, "\u5728\u4FA7\u8FB9\u680F\u4E2D\uFF08\u5361\u7247\u6807\u9898\u680F \u283F \u53EF\u62D6\u51FA\uFF09")
        ));
      }
      if (err) {
        children.push(h("div", { className: "tm-notice tm-notice-err" }, "\u8BFB\u53D6\u5931\u8D25\uFF1A" + err));
        children.push(h(Btn, { variant: "outline", size: "sm", onClick: () => refresh(true) }, "\u91CD\u8BD5"));
        return h("div", { className: "tm-page" }, children);
      }
      if (data === null) {
        children.push(h("div", { className: "tm-notice tm-notice-empty" }, loading ? "\u6B63\u5728\u7EDF\u8BA1\u4F1A\u8BDD\u65E5\u5FD7\u2026" : "\u6682\u65E0\u6570\u636E"));
        return h("div", { className: "tm-page" }, children);
      }
      const dd = derived;
      const scoped = dd.scoped;
      const aggAll = dd.aggAll;
      const hasData = aggAll.first !== null;
      children.push(h(
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
          { label: "\u7EDF\u8BA1\u4ECD\u6B63\u5E38\u8FD0\u884C\uFF1B\u91CD\u542F\u540E\u9700\u5168\u91CF\u91CD\u626B\u3002\u8BE6\u60C5\u89C1\u5BBF\u4E3B\u65E5\u5FD7 [dshp-token-meter] storage domain", side: "bottom" },
          h("span", { className: "tm-hint", style: { cursor: "help" } }, "\u26A0 \u65E0\u6301\u4E45\u7F13\u5B58")
        ) : h("span", { className: "tm-hint", title: "\u7EDF\u8BA1\u4ECD\u6B63\u5E38\u8FD0\u884C\uFF1B\u91CD\u542F\u540E\u9700\u5168\u91CF\u91CD\u626B" }, "\u26A0 \u65E0\u6301\u4E45\u7F13\u5B58") : null,
        h(Btn, {
          variant: "outline",
          size: "sm",
          onClick: () => refresh(),
          disabled: loading,
          icon: loading && P.IconLoadingOutline16 ? h(P.IconLoadingOutline16) : P.IconRefreshOutline14 ? h(P.IconRefreshOutline14) : void 0
        }, loading ? "\u5237\u65B0\u4E2D\u2026" : "\u5237\u65B0")
      ));
      {
        const pct = data.total > 0 ? Math.round(data.scanned / data.total * 100) : 0;
        children.push(data.partial === true ? h(
          "div",
          { className: "tm-notice tm-notice-empty", style: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" } },
          h("span", null, "\u540E\u53F0\u7EDF\u8BA1\u4E2D " + pct + "%\uFF08" + data.scanned + "/" + data.total + " \u4E2A\u4F1A\u8BDD\uFF09\u2014\u2014 \u5DF2\u626B\u63CF\u90E8\u5206\u5148\u5C55\u793A\uFF0C\u5B8C\u6210\u540E\u81EA\u52A8\u8865\u5168\u3002"),
          data.errors > 0 ? h("span", { className: "tm-muted" }, data.errors + " \u4E2A\u4F1A\u8BDD\u8BFB\u53D6\u5931\u8D25\u5DF2\u8DF3\u8FC7") : null
        ) : null);
      }
      if (!hasData) {
        children.push(h(
          "div",
          { className: "tm-empty" },
          "\u6682\u65E0 Token \u7528\u91CF\u6570\u636E \u2014 \u53D1\u8D77\u4E00\u6B21\u5BF9\u8BDD\u540E\u4F1A\u81EA\u52A8\u7EDF\u8BA1\uFF08\u5DF2\u626B\u63CF " + data.sessions + " \u4E2A\u4F1A\u8BDD\uFF09"
        ));
        return h("div", { className: "tm-page" }, children);
      }
      children.push(h(StatCardsSection, {
        aggAll,
        data,
        widgets: props.widgets || null,
        widgetId: "stats:cards",
        inPlace: true
      }));
      children.push(scoped !== null ? h(
        "div",
        { className: "tm-card" },
        h(
          "div",
          { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" } },
          h("span", { className: "tm-muted" }, "\u5F53\u524D\u8303\u56F4\uFF08" + rangeText(range) + "\uFF09"),
          h(
            "span",
            { style: { fontVariantNumeric: "tabular-nums" } },
            fmt2(scoped.total) + " tokens \xB7 \u8F93\u5165 " + fmt2(scoped.i) + " \xB7 \u8F93\u51FA " + fmt2(scoped.o) + " \xB7 " + fmtFull(scoped.n) + " \u6B21\u8C03\u7528"
          )
        )
      ) : null);
      children.push(h(TrendSection, {
        data,
        aggAll,
        widgets: props.widgets || null,
        widgetId: "stats:trend",
        inPlace: true
      }));
      children.push(h(HeatSection, {
        data,
        aggAll,
        widgets: props.widgets || null,
        widgetId: "stats:heat",
        inPlace: true
      }));
      children.push(h(DonutSection, {
        data,
        agg: scoped !== null ? scoped : aggAll,
        rangeLabel: rangeText(range),
        widgets: props.widgets || null,
        widgetId: "stats:donut",
        inPlace: true
      }));
      children.push(h(
        "div",
        { className: "tm-muted", style: { margin: "4px 2px 0" } },
        "\u7EDF\u8BA1\u53E3\u5F84\uFF1A\u603B Token = \u8F93\u5165 + \u7F13\u5B58\u8BFB + \u7F13\u5B58\u5199 + \u8F93\u51FA\uFF08reasoning \u5DF2\u542B\u5728\u8F93\u51FA\u5185\uFF09\uFF1B\u540C\u4E00\u8BF7\u6C42\u7684\u91C7\u6837 usage \u88AB\u7EC8\u503C\u8986\u76D6\uFF0C\u4E0D\u91CD\u590D\u7D2F\u8BA1\uFF1Bfork/resume \u79CD\u5B50\u4E8B\u4EF6\u5DF2\u53BB\u91CD\u3002"
      ));
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
            { className: "tm-float", style: { left: floatXY.x + "px", top: floatXY.y + "px" } },
            h(
              "div",
              { className: "tm-todayhead tm-floathead", title: "\u6309\u4F4F\u62D6\u5230\u4EFB\u610F\u4F4D\u7F6E \xB7 \u53CC\u51FB\u6536\u56DE\u4FA7\u8FB9\u680F", onPointerDown: tmFloatDrag, onDoubleClick: () => tmTodaySet(false) },
              h("span", { className: "tm-todaylabel" }, "\u4ECA\u65E5\u7528\u91CF"),
              h("span", { className: "tm-todayval", style: { opacity: 0.5 } }, "\u2026"),
              h("button", { className: "tm-minibtn", title: "\u6536\u56DE\u4FA7\u8FB9\u680F", onClick: (e) => {
                if (e.stopPropagation) e.stopPropagation();
                tmTodaySet(false);
              } }, "\u{1F4CC}")
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
      const todayK = keyOf(Date.now());
      const yK = keyOf(fromKey(todayK) - 864e5);
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
            const pos = tipPos(tip.mx, tip.my, 190, 82);
            return tmPortal(h(
              "div",
              { className: "tm-tipfixed", style: pos },
              h("div", { className: "tm-tiprow", style: { fontWeight: 600, marginBottom: 2 } }, "\u4ECA\u65E5\u7528\u91CF"),
              h("div", { className: "tm-tiprow" }, h("span", { className: "tm-tip-k" }, "\u4ECA\u65E5"), h("span", { className: "tm-tip-v" }, fmt2(todayTotal))),
              h("div", { className: "tm-tiprow" }, h("span", { className: "tm-tip-k" }, "\u6628\u65E5"), h("span", { className: "tm-tip-v" }, fmt2(yTotal))),
              h("div", { className: "tm-tiprow" }, h("span", { className: "tm-tip-k" }, "\u5BF9\u6BD4"), h("span", { className: "tm-tip-v" }, dTxt))
            ));
          })()
        );
      }
      const endH = /* @__PURE__ */ new Date();
      endH.setMinutes(0, 0, 0);
      const hourSlots = [];
      for (let k = 23; k >= 0; k--) {
        const t = endH.getTime() - k * 36e5;
        hourSlots.push({ d: keyOf(t), h: new Date(t).getHours() });
      }
      const hourLabels = hourSlots.map((s) => s.d === todayK ? s.h + ":00" : "\u6628\u65E5" + s.h + ":00");
      const hourIdx = /* @__PURE__ */ new Map();
      for (let i = 0; i < hourSlots.length; i++) hourIdx.set(hourSlots[i].d + "|" + hourSlots[i].h, i);
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
        isFloat ? { className: "tm-float", style: { left: floatXY.x + "px", top: floatXY.y + "px" } } : { className: "tm-today" },
        h(
          "div",
          isFloat ? { className: "tm-todayhead tm-floathead", title: "\u6309\u4F4F\u62D6\u5230\u4EFB\u610F\u4F4D\u7F6E \xB7 \u53CC\u51FB\u6536\u56DE\u4FA7\u8FB9\u680F", onPointerDown: tmFloatDrag, onDoubleClick: () => tmTodaySet(false) } : { className: "tm-todayhead" },
          isFloat || bare ? null : h("span", { className: "tm-grip", title: "\u6309\u4F4F\u62D6\u51FA\u4E3A\u6D6E\u7A97\uFF0C\u70B9\u6309\u76F4\u63A5\u5F39\u51FA", onPointerDown: tmGripDragOut }, "\u283F"),
          h("span", { className: "tm-todaylabel" }, props.name || "\u4ECA\u65E5 Token"),
          h(AnimatedNumber, { className: "tm-todayval", value: todayTotal, format: fmt2 }),
          bare ? widgetBtns(props.widgets, props.widgetId) : h("button", {
            className: "tm-minibtn",
            title: isFloat ? "\u6536\u56DE\u4FA7\u8FB9\u680F" : "\u5F39\u51FA\u4E3A\u6D6E\u7A97\uFF08\u53EF\u62D6\u5230\u5C4F\u5E55\u4EFB\u610F\u4F4D\u7F6E\uFF09",
            onClick: (e) => {
              if (e.stopPropagation) e.stopPropagation();
              tmTodaySet(!isFloat);
            }
          }, isFloat ? "\u{1F4CC}" : "\u29C9")
        ),
        h(TodayChart, { series: modelHourSeries, n: 24, labels: hourLabels, floatTip: isFloat || props.inFloat === true }),
        modelHourSeries.length > 0 ? h(
          "div",
          { className: "tm-todaymodels" },
          modelHourSeries.map((s, si) => h(
            "span",
            { key: s.name, className: "tm-todaymchip tm-fadein", style: { animationDelay: si * 60 + "ms" } },
            h("span", { className: "tm-dot", style: { background: s.color } }),
            h("span", null, s.shortName)
          ))
        ) : null,
        delta !== null ? h(
          "div",
          { className: "tm-statgrow tm-fadein", style: { marginTop: 4, color: delta >= 0 ? "var(--dsw-alias-state-success-primary)" : "var(--dsw-alias-state-error-primary)", fontSize: 10.5 } },
          h("span", { className: "tm-arrow " + (delta >= 0 ? "tm-arrow-up" : "tm-arrow-down") }),
          h("span", null, (delta >= 0 ? "+" : "") + delta.toFixed(0) + "% vs \u6628\u65E5")
        ) : h("div", { className: "tm-muted", style: { fontSize: 10, marginTop: 4 } }, todayTotal > 0 ? "\u6628\u65E5\u65E0\u6D88\u8017" : "\u5F00\u59CB\u4F7F\u7528\u540E\u7EDF\u8BA1")
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
      HiddenWhenFloated
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
    function useWidgets() {
      const [, force] = React.useReducer((x) => x + 1, 0);
      React.useEffect(() => {
        const fn = () => force();
        listeners.add(fn);
        return () => {
          listeners.delete(fn);
        };
      }, []);
      return Object.keys(open).map((id) => ({ id, pos: open[id] }));
    }
    function isOpen(id) {
      return Object.hasOwn(open, id);
    }
    function openWidget(id, at) {
      const pos = clampPos(at || open[id] || cascadePos(Object.keys(open).length));
      open = Object.assign({}, open, { [id]: pos });
      emit(true);
    }
    function closeWidget(id) {
      if (!Object.hasOwn(open, id)) return;
      const next = Object.assign({}, open);
      delete next[id];
      open = next;
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
      if (!cur) return null;
      return portal(
        h(
          "div",
          {
            className: "tm-widgetFloat tm-in",
            style: { left: cur.pos.x + "px", top: cur.pos.y + "px", width: FLOAT_W + "px" },
            onPointerDown: (e) => {
              const t = e.target;
              if (t && t.closest && t.closest("button, input, select, textarea, a, .tm-grip, .tm-seg, .tm-modelchip, .tm-switch")) return;
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
      return h(
        "span",
        { style: { display: "inline-flex", gap: 2, alignItems: "center", marginLeft: 6, flex: "none" } },
        h("span", Object.assign(
          { className: "tm-grip", title: opened ? "\u5DF2\u5F39\u51FA\u4E3A\u72EC\u7ACB\u6D6E\u7A97\uFF08\u53EF\u62D6\u52A8\uFF09" : "\u6309\u4F4F\u62D6\u51FA\u4E3A\u72EC\u7ACB\u6D6E\u7A97\uFF0C\u70B9\u6309\u76F4\u63A5\u5F39\u51FA" },
          gripProps(props.id)
        ), "\u283F"),
        opened ? h("button", { className: "tm-minibtn", title: "\u56DE\u5F52\u4FA7\u680F\uFF08\u5173\u95ED\u6D6E\u7A97\uFF0C\u5185\u5BB9\u4ECD\u5728\u539F\u4F4D\uFF09", onClick: () => closeWidget(props.id) }, "\u56DE\u5F52") : h("button", { className: "tm-minibtn", title: "\u5F39\u51FA\u4E3A\u72EC\u7ACB\u6D6E\u7A97", onClick: () => openWidget(props.id) }, "\u29C9")
      );
    }
    return { useWidgets, isOpen, openWidget, closeWidget, moveWidget, commitWidget, gripProps, WidgetFloat, WidgetToggle };
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
      const kids = [];
      kids.push(h(
        "p",
        { key: "d", className: "tm-intro" },
        "\u989D\u5EA6\u4F9B\u5E94\u5546\u4E0E\u504F\u597D\u3002\u8BE6\u7EC6\u989D\u5EA6\u4E0E\u7528\u91CF\u56FE\u8868\u8BF7\u5230\u53F3\u4FA7\u680F\u300C\u989D\u5EA6 / \u7528\u91CF\u300D\u9762\u677F\u67E5\u770B\uFF08\u7A7A\u95F4\u66F4\u5BBD\uFF09\u3002\u914D\u7F6E\u6301\u4E45\u5316\u5728 settings.yaml\uFF08",
        h("code", { className: "tm-mono" }, s.namespace || "dshp-token-meter"),
        " \u547D\u540D\u7A7A\u95F4\uFF09\uFF0C\u5916\u90E8\u7F16\u8F91\u70ED\u91CD\u8F7D\u3002"
      ));
      if (s.error) kids.push(h("p", { key: "err", className: "tm-notice tm-notice-err" }, s.error));
      if (opErr) kids.push(h("p", { key: "operr", className: "tm-notice tm-notice-err" }, opErr));
      if (!s.cfg) {
        kids.push(h(
          "div",
          { key: "loading", className: "tm-loading" },
          h("span", { className: "tm-spinner" }),
          h("span", { className: "tm-loadingText" }, s.loading ? "\u6B63\u5728\u8BFB\u53D6\u914D\u7F6E\u2026" : "\u914D\u7F6E\u52A0\u8F7D\u5931\u8D25")
        ));
        return h("div", { className: "tm-page" }, kids);
      }
      const vendors = s.cfg.vendors || [];
      const activeId = s.cfg.activeVendor || "";
      const a0 = store.activeOf(s);
      const rawSec = s.cfg.refreshSec;
      const curSec = rawSec === void 0 || rawSec === null || rawSec === "" ? 60 : Number(rawSec) === 0 ? 0 : isFinite(Number(rawSec)) ? Math.min(3600, Math.max(10, Number(rawSec) || 60)) : 60;
      const defRange = String(s.cfg.defaultRange || "30");
      kids.push(h(
        "div",
        { key: "display", className: "tm-section" },
        h("div", { className: "tm-sectionHead" }, "\u504F\u597D"),
        h(
          UI.SecRow,
          { key: "sec", label: "\u81EA\u52A8\u5237\u65B0", desc: "\u53F3\u680F\u6253\u5F00\u65F6\uFF0C\u5F53\u524D\u4F9B\u5E94\u5546\u6309\u95F4\u9694\u81EA\u52A8\u62C9\u53D6\uFF1B0=\u5173\u95ED\u3002" },
          h(UI.PillSelect, {
            disabled: busy,
            value: String(curSec),
            selectedLabel: secLabel(curSec),
            options: (SEC_PRESETS.indexOf(curSec) >= 0 ? SEC_PRESETS : [curSec].concat(SEC_PRESETS)).map((n) => ({ id: String(n), label: secLabel(n) })),
            onSelect: (id) => void withBusy(() => store.setRefresh(Number(id)))
          })
        ),
        h(
          UI.SecRow,
          { key: "range", label: "\u9ED8\u8BA4\u8303\u56F4", desc: "\u7528\u91CF\u9762\u677F\u6253\u5F00\u65F6\u7684\u9ED8\u8BA4\u65F6\u95F4\u8303\u56F4\u3002" },
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
        )
      ));
      const vrows = [
        h(UI.SecRow, {
          key: "__active",
          label: "\u5F53\u524D\u4F9B\u5E94\u5546",
          desc: "\u4FA7\u8FB9\u680F/\u53F3\u680F\u989D\u5EA6\u5361\u5C55\u793A\u7684\u989D\u5EA6\u6765\u6E90\uFF1B\u65E0 = \u6781\u7B80\u6A21\u5F0F\u3002"
        }, h(UI.PillSelect, {
          disabled: busy,
          value: activeId,
          selectedLabel: a0 ? a0.name + "\uFF08" + store.typeLabel(a0.type) + "\uFF09" : "\u65E0 \xB7 \u6781\u7B80\u6A21\u5F0F\uFF08\u4E0D\u62C9\u53D6\uFF09",
          options: [{ id: "", label: "\u65E0 \xB7 \u6781\u7B80\u6A21\u5F0F\uFF08\u4E0D\u62C9\u53D6\uFF09" }].concat(vendors.map((v) => ({ id: v.id, label: v.name + "\uFF08" + store.typeLabel(v.type) + "\uFF09" }))),
          onSelect: (id) => void withBusy(async () => {
            await store.setActive(id);
            await store.reload();
          })
        }))
      ];
      vendors.forEach((v) => {
        const snap = s.snaps[v.id];
        const isCur = v.id === activeId;
        const status = snap && snap.ok ? h("span", { className: "tm-hint" }, "\u62C9\u53D6\u6B63\u5E38") : snap ? h("span", { className: "tm-hint", title: snap.error || "\u62C9\u53D6\u5931\u8D25" }, "\u62C9\u53D6\u5931\u8D25") : h("span", { className: "tm-hint" }, "\u672A\u62C9\u53D6");
        vrows.push(h(
          UI.SecRow,
          {
            key: "v:" + v.id,
            wrap: true,
            label: h(
              "span",
              { style: { display: "flex", alignItems: "center", gap: 6, minWidth: 0, maxWidth: "100%" } },
              h("span", { className: "tm-dot" + (snap && !snap.ok ? " bad" : "") }),
              h("span", { className: "tm-vname2", style: { maxWidth: 280 } }, v.name),
              h(UI.Badge, { kind: "info", text: store.typeLabel(v.type) }),
              isCur ? h(UI.Badge, { kind: "ok", text: "\u5F53\u524D" }) : null,
              UI.secretBadge(v.secretKind)
            )
          },
          h(
            "span",
            { className: "tm-bar", style: { width: "100%", padding: 0, border: "none" } },
            status,
            h("span", { style: { flex: 1 } }),
            h(Btn, { variant: "outline", size: "sm", disabled: busy, onClick: () => void withBusy(() => store.refreshVendor(v.id)) }, "\u62C9\u53D6"),
            h(Btn, { variant: "outline", size: "sm", disabled: busy, onClick: () => setEditing({ id: v.id, data: JSON.parse(JSON.stringify(v)) }) }, "\u7F16\u8F91"),
            v.secretKind === "plain" ? h(Btn, { variant: "ghost", size: "sm", disabled: busy, title: "\u660E\u6587\u8F6C\u5B58\u7CFB\u7EDF\u51ED\u636E\uFF0C\u6539\u5199\u4E3A $NAME \u5F15\u7528", onClick: () => void toCred(v.id) }, "\u5B58\u51ED\u636E") : null,
            h(Btn, { variant: "ghost", size: "sm", disabled: busy, onClick: () => {
              setAcked(false);
              setConfirmDel(v);
            } }, "\u5220\u9664")
          )
        ));
      });
      kids.push(h(
        "div",
        { key: "vendors", className: "tm-section" },
        h("div", { className: "tm-sectionHead" }, "\u4F9B\u5E94\u5546\uFF08" + vendors.length + "\uFF09"),
        h("p", { className: "tm-cardHint", style: { margin: "0 0 4px" } }, "\u5BC6\u94A5 $NAME \u5F15\u7528\u4F18\u5148\uFF0C\u660E\u6587\u4FDD\u5B58\u540E\u4E0D\u660E\u6587\u56DE\u663E\u3002"),
        vrows
      ));
      if (editing) kids.push(h(
        "div",
        { key: "edit", className: "tm-section" },
        h("div", { className: "tm-sectionHead" }, "\u7F16\u8F91 " + editing.id),
        h("p", { className: "tm-cardHint", style: { margin: "0 0 4px" } }, "ID \u662F\u4E3B\u952E\uFF0C\u4E0D\u53EF\u4FEE\u6539\uFF1B\u5BC6\u94A5\u7559\u7A7A\u5373\u4FDD\u7559\u539F\u503C\u3002"),
        h(UI.VendorForm, {
          draft: editing.data,
          set: (nd) => setEditing({ id: editing.id, data: nd }),
          submitLabel: "\u4FDD\u5B58\u4FEE\u6539",
          busy,
          isEdit: true,
          onCancel: () => setEditing(null),
          onSubmit: () => void saveVendor(editing.data, true)
        })
      ));
      kids.push(h(
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
      ));
      if (confirmDel) {
        const target = confirmDel;
        if (P.RiskConfirmation) {
          kids.push(h(P.RiskConfirmation, {
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
          }));
        } else {
          kids.push(h(
            "div",
            { key: "confirm-del", className: "tm-errbox" },
            h("div", { className: "tm-errtext" }, "\u5220\u9664\u4F9B\u5E94\u5546\u300C" + target.name + "\u300D\uFF1F\u6B64\u64CD\u4F5C\u4E0D\u53EF\u64A4\u9500\u3002" + (acked ? "" : "\u8BF7\u5148\u786E\u8BA4\u3002")),
            h(
              "div",
              { style: { display: "flex", gap: 8, marginTop: 6 } },
              acked ? h(Btn, { variant: "outline", size: "sm", onClick: () => {
                setConfirmDel(null);
                setAcked(false);
                void delVendor(target.id);
              } }, "\u786E\u8BA4\u5220\u9664") : h(Btn, { variant: "outline", size: "sm", onClick: () => setAcked(true) }, "\u6211\u5DF2\u4E86\u89E3"),
              h(Btn, { variant: "outline", size: "sm", onClick: () => {
                setConfirmDel(null);
                setAcked(false);
              } }, "\u53D6\u6D88")
            )
          ));
        }
      }
      return h("div", { className: "tm-page" }, kids);
    }
    function StatsRightPane() {
      const [prefs, setPrefs] = useState({ showToday: false, defaultRange: "30" });
      const loadPrefs = async () => {
        try {
          const s = await fetchState();
          if (s.ok && s.config) {
            setPrefs({ showToday: s.config.showToday === true, defaultRange: String(s.config.defaultRange || "30") });
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
          STATS_WIDGET_BTNS.map(([k, t]) => h(
            "span",
            { key: k, className: "tm-widgetBtn" },
            h("span", { className: "tm-widgetBtn-label" }, t),
            h(widgets.WidgetToggle, { id: "stats:" + k })
          ))
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
      widgetsApi: widgets
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
        const TokenMeterSettings = parts.TokenMeterSettings;
        const QuotaRightPane = parts.QuotaRightPane;
        const StatsRightPane = parts.StatsRightPane;
        const WidgetFloatLayer = parts.WidgetFloatLayer;
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
          ctx.effect(() => () => {
            if (tmStyleUsers <= 0 && tmStyleEl) {
              try {
                tmStyleEl.remove();
              } catch {
              }
              tmStyleEl = null;
            }
          }, "dshp-token-meter: section styles");
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
              { name: "settings.section", id: "dshp-token-meter", order: 27, label: "Token \u8BA1\u91CF" },
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
                    description: () => "\u5168\u90E8\u4F9B\u5E94\u5546\u989D\u5EA6\u4E00\u89C8"
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
                    description: () => "\u7528\u91CF\u8D8B\u52BF\u4E0E\u6A21\u578B\u5206\u5E03"
                  }
                ]
              }),
              "dshp-token-meter: right tab stats"
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
              return React.createElement("span", null, "Token \u989D\u5EA6");
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
              return React.createElement("span", null, "Token \u7528\u91CF");
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
