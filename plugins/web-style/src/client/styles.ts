/**
 * styles.ts —— 设置节样式（全部走 --dsw-* 主题 token，随主题自适应；紧凑版）
 *
 * 原实现：dsh-custom-ui/client.js 内联 CSS。逐行保留，仅删掉没有任何 JS 引用的
 * 死规则 .tg-photoSwatch（改色只改 token，颜色不写死）。
 *
 * @module @dshp/web-style/client
 */
export const CSS = `.tg-page{max-width:800px;display:flex;flex-direction:column;gap:8px;color:var(--dsw-alias-label-primary)}
/* 顶部简单配置区：状态 + 圆角 + 快捷操作，一张小面板收拢 */
.tg-topbar{display:flex;flex-direction:column;gap:6px;padding:8px 10px;border-radius:12px;background:var(--dsw-alias-bg-module-platform);border:.5px solid var(--dsw-alias-border-l2)}
.tg-status{display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary)}
.tg-status b{color:var(--dsw-alias-label-primary);font-weight:600}
.tg-release{border:none;background:none;padding:0;font:inherit;font-size:12px;cursor:pointer;color:var(--dsw-alias-state-business-primary)}
.tg-release:hover{text-decoration:underline}
.tg-release:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px;border-radius:2px}
.tg-ctl{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.tg-ctlLabel{font-size:12px;color:var(--dsw-alias-label-tertiary);flex:none}
.tg-ctlSep{width:1px;height:16px;background:var(--dsw-alias-border-l2);flex:none}
.tg-head{color:var(--dsw-alias-label-tertiary);margin:0;font-size:12px;line-height:18px}
.tg-headErr{color:var(--dsw-alias-state-error-primary)}
.tg-headOk{color:var(--dsw-alias-state-success-primary)}
/* 主题色列表（最后一项）：无分组，grid 密铺默认 4 列自适应 */
.tg-list{display:flex;flex-direction:column;gap:8px;padding-top:8px}
.tg-now{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:12px;background:var(--dsw-alias-bg-module-platform);border:.5px solid var(--dsw-alias-border-l2)}
.tg-nowMosaic{display:flex;width:76px;height:30px;border-radius:7px;overflow:hidden;flex:none;border:.5px solid var(--dsw-alias-border-l2)}
.tg-nowMosaic i{display:block;height:100%;min-width:0}
.tg-nowMeta{display:flex;flex-direction:column;gap:0;min-width:0;flex:1}
.tg-nowTitle{font-size:12px;font-weight:700;line-height:17px;color:var(--dsw-alias-label-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tg-nowSub{font-size:11px;line-height:15px;color:var(--dsw-alias-label-tertiary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tg-nowDots{display:flex;gap:5px;align-items:center;flex:none}
.tg-nowDots i{width:12px;height:12px;border-radius:50%;border:.5px solid var(--dsw-alias-border-l2);display:block}
.tg-toolbar{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.tg-search{box-sizing:border-box;height:26px;width:170px;max-width:100%;padding:0 11px;border-radius:13px;border:.5px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font-size:12px;line-height:26px;outline:none}
.tg-search::placeholder{color:var(--dsw-alias-label-quaternary)}
.tg-search:focus{border-color:var(--dsw-alias-brand-primary)}
.tg-count{margin-left:auto;font-size:11px;color:var(--dsw-alias-label-tertiary);white-space:nowrap}
/* 壁纸取色独立配置区（MD3 整套配色预览 + 操作） */
.tg-wall{display:flex;flex-direction:column;gap:8px;padding:10px;border-radius:12px;background:var(--dsw-alias-bg-module-platform);border:.5px solid var(--dsw-alias-border-l2)}
.tg-wallHead{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.tg-wallTitle{font-size:12px;font-weight:700;line-height:18px;color:var(--dsw-alias-label-primary)}
.tg-seedChip{display:inline-flex;align-items:center;gap:5px;height:22px;padding:0 9px;border-radius:11px;background:var(--dsw-alias-bg-layer-1);font-size:11px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--dsw-alias-label-secondary)}
.tg-seedChip i{width:11px;height:11px;border-radius:50%;display:block;border:.5px solid var(--dsw-alias-border-l2)}
.tg-wallActions{margin-left:auto;display:flex;gap:6px;flex-wrap:wrap;align-items:center}
.tg-wallBody{display:flex;flex-direction:column;gap:6px}
.tg-toneRow{display:flex;align-items:center;gap:6px}
.tg-toneName{width:88px;flex:none;font-size:10px;line-height:14px;color:var(--dsw-alias-label-tertiary);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tg-toneCells{display:flex;flex:1;gap:2px;min-width:0}
.tg-toneCells i{flex:1;height:20px;border-radius:4px;min-width:0;display:block}
.tg-roles{display:flex;flex-direction:column;gap:3px}
.tg-roleRow{display:flex;align-items:flex-start;gap:6px}
.tg-chips{display:flex;flex:1;gap:4px;flex-wrap:wrap;min-width:0}
.tg-chip{display:inline-flex;align-items:center;gap:4px;height:20px;padding:0 7px;border-radius:10px;background:var(--dsw-alias-bg-layer-1);font-size:10px;line-height:20px;color:var(--dsw-alias-label-secondary);white-space:nowrap}
.tg-chip i{width:10px;height:10px;border-radius:3px;display:block;flex:none}
.tg-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;align-items:stretch}
@media (max-width:720px){.tg-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media (max-width:520px){.tg-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.tg-search{width:130px}}
/* 截图式主题卡·小尺寸：顶部拼接色块 + 编号 + 标签标题描述 + 底部胶囊按钮 + Live 态（grid 子项） */
.tg-card{box-sizing:border-box;display:flex;flex-direction:column;padding:0;overflow:hidden;cursor:pointer;text-align:left;border-radius:12px;font:inherit;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-module-platform);border:.5px solid var(--dsw-alias-border-l2);min-width:0;width:100%;transition:border-color .15s,box-shadow .15s,transform .15s}
.tg-card:hover:not(.tg-active){border-color:var(--dsw-alias-border-l4)}
.tg-card:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}
.tg-card.tg-active{background:var(--dsw-alias-bg-module-platform)}
.tg-mosaic{position:relative;display:flex;height:44px;flex:none}
.tg-mosaic i{display:block;height:100%;min-width:0}
.tg-mA{flex:5}
.tg-mB{flex:3}
.tg-mC{flex:2}
.tg-idx{position:absolute;top:4px;right:6px;font-size:9px;line-height:12px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:rgba(255,255,255,.88);text-shadow:0 1px 3px rgba(0,0,0,.45);letter-spacing:.04em}
.tg-body{display:flex;flex-direction:column;gap:1px;padding:7px 9px 8px;min-width:0}
.tg-tag{font-size:10px;font-weight:600;line-height:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tg-title{font-size:13px;font-weight:700;line-height:18px;color:var(--dsw-alias-label-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tg-desc{font-size:10px;line-height:14px;color:var(--dsw-alias-label-tertiary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tg-foot{display:flex;align-items:center;gap:6px;margin-top:6px}
.tg-use{display:inline-flex;align-items:center;justify-content:center;height:22px;padding:0 10px;border:none;border-radius:11px;font-size:11px;font-weight:600;line-height:22px;color:#fff;cursor:pointer;flex:none}
.tg-use:hover{filter:brightness(1.08)}
.tg-live{display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:500;line-height:14px;white-space:nowrap}
.tg-live i{width:5px;height:5px;border-radius:50%;background:currentColor;display:inline-block;flex:none}
.tg-check{margin-left:auto;font-size:11px;font-weight:700;flex:none}
/* 紧凑胶囊按钮（圆角档 + 上传取色共用小尺寸） */
.tg-radiusBtns{display:flex;gap:6px;flex-wrap:wrap;align-items:center}
.tg-radiusBtn{box-sizing:border-box;background:var(--dsw-alias-bg-layer-1);height:24px;font:inherit;color:var(--dsw-alias-label-primary);cursor:pointer;border:none;border-radius:12px;align-items:center;gap:6px;padding:0 10px;font-size:11px;line-height:24px;display:inline-flex}
.tg-radiusBtn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}
.tg-radiusBtn.tg-active{background:var(--dsw-alias-bg-multi-select);box-shadow:inset 0 0 0 1px var(--dsw-alias-button-ghost-active-border)}
@media (prefers-reduced-motion:reduce){.tg-card{transition:none}}`;
