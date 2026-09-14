/**
 * 样式（前缀 fcv-）
 *
 * 三块，全部只用官方 token（docs/client-basics.md：颜色/字号不写死任何值）：
 *
 * ① **镜像官方 ToolRow 的行内样式**。官方会把这个行渲染成 `ToolRow + DisclosureRow`：行外壳
 *    （高度、图标位、标题字号/颜色、hover 折叠箭头）来自 `DisclosureRow` 的默认 CSS，本插件直接
 *    复用、一个类都不传；而「工具专属」的那几条（分隔点 `sep`、路径链接 `fileLink`、摘要 `summary`、
 *    统计 `diffStat`、失败摘要 `errorSummary`、Inspect 药丸）写在 `ToolRow.module.css` 里，是**模块
 *    哈希类名**，跨包无法 import。所以这里逐条镜像（值照抄，类名换成 `fcv-*`）——这是「让编辑行
 *    跟思考/读取行长得一样」的唯一可行做法。升级 DSH 后若行样式有变，对照上游同一个文件同步即可。
 *
 * ② **差异本体的两处覆盖**：删/增行的整行底色变量、以及代码块在行内的外边距与换行策略。
 *
 * ③ **设置节「File Change View」**（`settings.section`）：官方设置节的「行」版式 + 「展示方式」两张
 *    带真实样张的单选卡。
 *
 * ④ **会话页头的两个快捷开关**（`conversation.session.header.utilities`）：照抄同一槽位上官方
 *    `open-in-app` 的胶囊尺寸。
 *
 * ⚠️ 各段版式的**类名集合必须两两不相交**：本文件里的规则是全局作用域，工具行元素上的类名由
 *    `FileChangeRow.ts` 以字符串传下去（`className` / `rowClassName`），一旦与设置节的类名重名，
 *    设置节的布局就会打到工具行上——曾经设置节的 `.fcv-row{padding:16px 0}` 就把「编辑 / 写入」
 *    行撑高了 32px 并加了一条底边线。工具行用 `fcv-toolRow` / `fcv-rowRoot` / `fcv-card` 等，
 *    设置节一律用 `fcv-setting*` / `fcv-section*` / `fcv-page` / `fcv-viewCard*` / `fcv-pv*`
 *    （样张预览刻意**不**复用工具行那套类名，见下），页头用 `fcv-head*`，
 *    `scripts/check-client.mjs` 有断言守着。
 */
export const CSS: string = `

/* ── ① 行内样式（镜像官方 ToolRow.module.css，类名换成 fcv-） ───────────── */
.fcv-sep{background:var(--dsw-alias-label-caption);border-radius:1px;flex:none;width:2px;height:2px;margin:0 8px}
.fcv-summary{text-overflow:ellipsis;white-space:nowrap;min-width:0;font-size:var(--dsh-content-font-size-secondary,13px);line-height:calc(24px + var(--dsh-content-font-delta,0px));color:var(--dsw-alias-label-tertiary);flex:auto;overflow:hidden}
.fcv-path{text-overflow:ellipsis;white-space:nowrap;min-width:0;font:inherit;text-align:left;font-size:var(--dsh-content-font-size-secondary,13px);line-height:calc(24px + var(--dsh-content-font-delta,0px));color:var(--dsw-alias-label-secondary);text-decoration:underline dotted;text-decoration-color:var(--dsw-alias-label-tertiary);text-underline-offset:3px;text-decoration-thickness:1px;cursor:pointer;background:0 0;border:none;flex:0 auto;margin:0;padding:0;overflow:hidden}
.fcv-path:hover{color:var(--dsw-alias-label-primary);text-decoration-color:currentColor}
.fcv-stat{white-space:nowrap;flex:none;margin-left:10px;font-family:var(--ds-font-family-code);font-size:calc(var(--dsh-content-font-size-secondary,13px) - 2px);transform:translateY(.5px);display:inline-flex;align-items:center;gap:10px}
.fcv-statPart{display:inline-flex;align-items:center;gap:3px}
.fcv-add{color:var(--dsw-alias-state-success-primary)}
.fcv-del{color:var(--dsw-alias-state-error-primary)}
.fcv-note{color:var(--dsw-alias-label-caption)}
.fcv-errorSummary{font-size:var(--dsh-content-font-size-secondary,13px);line-height:calc(24px + var(--dsh-content-font-delta,0px));color:var(--dsw-alias-state-error-primary);text-overflow:ellipsis;white-space:nowrap;min-width:0;overflow:hidden}
.fcv-body{--fcv-del-bg:var(--dsw-alias-interactive-bg-hover-danger);--fcv-add-bg:var(--dsw-alias-state-success-tertiary);flex-direction:column;display:flex}
/* 官方 Inspect 药丸：默认透明，hover 行（或键盘聚焦）时浮现 */
.fcv-inspect{border:.5px solid var(--dsw-alias-border-l3);corner-shape:round;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-secondary);cursor:pointer;opacity:0;border-radius:999px;align-self:flex-start;align-items:center;gap:4px;margin:4px 0 2px 4px;padding:2px 8px;font-size:11px;line-height:16px;transition:opacity .1s;display:inline-flex}
.fcv-rowRoot:hover .fcv-inspect,.fcv-inspect:focus-visible{opacity:1}
.fcv-inspect:hover{background:var(--dsw-alias-interactive-bg-hover-solid);color:var(--dsw-alias-label-primary)}

/* ── ② 差异卡片：一个 card 包住「卡头 + 代码」 ───────────────────────────── */
/* 卡头就是 card 里的那一行 row：左边折叠箭头 + 文件名，右边增删统计 + 单块视图切换。
   卡头底色用官方 banner 色（与官方代码块的 banner 同色），代码区用官方代码块底色，
   于是整体看起来就是「官方代码卡片，只是把 banner 换成了文件名 + 统计 + 控件」。
   官方 CodeBlock 自带的 banner（语言名 + 复制按钮）继续隐藏；它自己的底色/圆角/内边距也继续
   清掉——盒子由本插件的 .fcv-card 提供，避免套两层卡片。
   选择器一律带 .fcv-card 两级（0,2,x），既能压过官方同级规则，又不依赖样式注入顺序。 */
.fcv-card{border:.5px solid var(--dsw-alias-border-l2);border-radius:12px;background:var(--dsw-alias-markdown-code-block);overflow:hidden;margin:6px 0 8px 4px}
.fcv-card .fcv-cardRow{height:auto;min-height:30px;gap:4px;padding:0 10px;background:var(--dsw-alias-markdown-code-block-banner);border-bottom:.5px solid var(--dsw-alias-border-l1)}
.fcv-card .fcv-cardTitle{flex:1;min-width:0;display:inline-flex;align-items:center;font-size:12px;color:var(--dsw-alias-label-secondary)}
.fcv-cardName{display:inline-flex;align-items:center;gap:6px;min-width:0;max-width:100%}
.fcv-cardNameText{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:var(--ds-font-family-code)}
.fcv-fileIcon{flex:none;display:inline-flex;align-items:center}
.fcv-card .fcv-cardRow:hover .fcv-cardTitle{color:var(--dsw-alias-label-primary)}
/* 单块视图切换：两个官方 Pill 组成的小分段控件（Pill 高 24px，卡头 30px 刚好放得下） */
.fcv-viewGroup{display:inline-flex;align-items:center;gap:4px;flex:none;margin-left:6px}
.fcv-viewPill{height:20px;padding:0 8px;border-radius:10px;font-size:11px;line-height:18px;gap:4px}
.fcv-viewPill svg{flex:none}
/* 代码区：去掉官方代码块自己的外壳（盒子由 .fcv-card 给），只在上下留一点内边距让底色不贴边 */
.fcv-card .fcv-code{--dsl-code-block-line-white-space:pre;background:none!important;border-radius:0;margin:0}
.fcv-card .fcv-code>div:has([data-code-block-banner]){display:none}
.fcv-card .fcv-code [data-code-block-banner]{display:none}
.fcv-card .fcv-code pre{background:none!important;padding:8px 0;border-radius:0}
/* ± 差异视图同样摊平进这张卡：去掉它自己的外边距与圆角，底色与卡片一致 */
.fcv-card .fcv-diff{margin:0;border-radius:0}
/* ± 视图的上下文行：官方 DiffBlock 只画得出 del / add 两种行（见 FileChangeRow.renderContext），
   所以没受影响的上下文由本插件单独渲染成中性行，贴在 DiffBlock 上下，颜色/行高与它保持一致。 */
.fcv-diffWrap{display:flex;flex-direction:column}
.fcv-ctx{font-family:var(--ds-font-family-code);font-size:12px;line-height:18px;color:var(--dsw-alias-label-tertiary);padding:0 10px;white-space:pre;overflow-x:auto}
.fcv-ctxLine{white-space:pre}
.fcv-card .fcv-ctx:first-child{padding-top:8px}
.fcv-card .fcv-ctx:last-child{padding-bottom:8px}
.fcv-muted{margin:0;padding:6px 10px 8px;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px}

/* ── ③ 设置节「File Change View」（settings.section） ─────────────────────────────── */
/* 版式照抄官方设置节的「行」规格，值取自本仓标杆 vision-bridge / mcwiki-search：一页
   max-width 720px，每节一小段标题，行内左列 label 14px + desc 12px、右侧控件，行间 .5px 细线。 */
.fcv-page{max-width:720px;color:var(--dsw-alias-label-primary);flex-direction:column;display:flex}
.fcv-intro{color:var(--dsw-alias-label-tertiary);margin:0 0 4px;font-size:14px;line-height:22px}
.fcv-section{flex-direction:column;width:100%;display:flex}
.fcv-sectionHead{color:var(--dsw-alias-label-secondary);font-size:12px;font-weight:500;line-height:18px;padding:14px 0 2px}
/* 类名刻意与工具行（fcv-toolRow / fcv-rowRoot）分开：两套版式的同名类会互相串味 */
.fcv-settingRow{border-bottom:.5px solid var(--dsw-alias-border-l2);align-items:center;gap:8px;padding:16px 0;display:flex}
.fcv-section .fcv-settingRow:last-child{border-bottom:none}
.fcv-rowText{flex-direction:column;flex:1;gap:4px;min-width:0;padding-right:48px;display:flex}
/* 整幅设置块（label / desc 在上、控件占满整行在下）：展示方式的预览卡塞不进 Row 右侧那个窄列 */
.fcv-settingBlock{border-bottom:.5px solid var(--dsw-alias-border-l2);flex-direction:column;gap:12px;padding:16px 0;display:flex}
.fcv-section .fcv-settingBlock:last-child{border-bottom:none}
.fcv-blockText{flex-direction:column;gap:4px;display:flex}
.fcv-title{color:var(--dsw-alias-label-primary);font-size:14px;font-weight:400;line-height:22px}
.fcv-desc{color:var(--dsw-alias-label-tertiary);font-size:12px;font-weight:400;line-height:18px}
.fcv-barEnd{align-items:center;gap:8px;display:flex;flex-wrap:wrap;padding:12px 0;justify-content:flex-end}
.fcv-notice{margin:0;font-size:12px;line-height:18px}
.fcv-notice-err{color:var(--dsw-alias-state-error-primary)}
.fcv-badge{white-space:nowrap;align-items:center;height:20px;border-radius:10px;padding:0 8px;font-size:11px;font-weight:500;line-height:20px;display:inline-flex}
.fcv-badge-ok{background:var(--dsw-alias-state-success-tertiary);color:var(--dsw-alias-state-success-primary)}
.fcv-badge-warn{background:var(--dsw-alias-state-warn-tertiary);color:var(--dsw-alias-state-warn-label)}
.fcv-badge-muted{background:var(--dsw-alias-button-ghost-active-fill);color:var(--dsw-alias-label-caption)}
/* 下拉胶囊（官方行内选择器同款，值照抄标杆 vision-bridge 的 Select 样式） */
.fcv-selector{background:var(--dsw-alias-bg-module-platform);height:36px;font:inherit;color:var(--dsw-alias-label-primary);cursor:pointer;border:none;border-radius:18px;align-items:center;gap:12px;padding:0 14px;font-size:14px;line-height:22px;display:inline-flex;max-width:100%}
.fcv-selector:hover{background:var(--dsw-alias-interactive-bg-hover)}
.fcv-selector:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}
.fcv-selectorLabel{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.fcv-chevron{flex:none}
/* 自绘开关（36x20 胶囊 + 16px 圆点，官方 Switch 同尺寸；颜色全走 token） */
.fcv-switch{box-sizing:border-box;background:var(--dsw-alias-border-l3);cursor:pointer;border:0;border-radius:10px;flex:none;width:36px;height:20px;padding:2px;position:relative}
.fcv-switchOn{background:var(--dsw-alias-brand-primary)}
.fcv-switch:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}
.fcv-thumb{background:var(--dsw-alias-label-primary-foreground);border-radius:50%;width:16px;height:16px;transition:transform .12s;display:block}
.fcv-switchOn .fcv-thumb{transform:translate(16px)}
@media (prefers-reduced-motion:reduce){.fcv-thumb{transition:none}}

/* ── ③b 展示方式：两张带真实样张的单选卡 ─────────────────────────────────────── */
/* 窄屏（<2×240px + gap）自动落成单列；设置页本身 max-width 720px，所以常态是并排两张。 */
.fcv-viewCards{grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px;display:grid}
.fcv-viewCard{background:var(--dsw-alias-bg-base);cursor:pointer;border:.5px solid var(--dsw-alias-border-l2);border-radius:12px;flex-direction:column;gap:8px;padding:12px;display:flex;transition:border-color .12s,background .12s}
.fcv-viewCard:hover{border-color:var(--dsw-alias-border-l4);background:var(--dsw-alias-interactive-bg-hover)}
.fcv-viewCardOn,.fcv-viewCardOn:hover{border-color:var(--dsw-alias-brand-primary)}
.fcv-viewCard:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}
.fcv-viewCardHead{align-items:center;gap:8px;display:flex}
.fcv-viewCardName{color:var(--dsw-alias-label-primary);font-size:14px;font-weight:500;line-height:22px}
.fcv-viewCardDesc{color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px}
.fcv-radio{box-sizing:border-box;border:1.5px solid var(--dsw-alias-border-l4);border-radius:50%;flex:none;width:16px;height:16px;position:relative}
.fcv-viewCardOn .fcv-radio{border-color:var(--dsw-alias-brand-primary)}
.fcv-viewCardOn .fcv-radio:after{content:"";background:var(--dsw-alias-brand-primary);border-radius:50%;position:absolute;inset:3px}
/* 样张整块不响应指针事件：点它任意位置都算「选这张卡」，而官方代码块 / 差异块自带的复制、折叠
   等按钮在样张里没有意义，也不该把整卡的点击吃掉。 */
.fcv-pvBody{pointer-events:none;--fcv-del-bg:var(--dsw-alias-interactive-bg-hover-danger);--fcv-add-bg:var(--dsw-alias-state-success-tertiary);background:var(--dsw-alias-markdown-code-block);border:.5px solid var(--dsw-alias-border-l1);border-radius:8px;flex-direction:column;overflow:hidden;display:flex}
.fcv-pvCodeBox{flex-direction:column;display:flex}
/* 样张里的两个官方组件都摊平进 .fcv-pvBody：盒子由它给，语言栏（复制在其中）照旧隐藏。
   类名刻意不复用工具行的 fcv-code / fcv-diff —— 两套版式的类名集合必须不相交。 */
.fcv-pvCode{--dsl-code-block-line-white-space:pre;background:none!important;border-radius:0;margin:0}
.fcv-pvCode>div:has([data-code-block-banner]){display:none}
.fcv-pvCode [data-code-block-banner]{display:none}
.fcv-pvCode pre{background:none!important;padding:8px 0;border-radius:0}
.fcv-pvDiff{margin:0;border-radius:0}
.fcv-pvDiffWrap{flex-direction:column;display:flex}
.fcv-pvCtx{font-family:var(--ds-font-family-code);font-size:12px;line-height:18px;color:var(--dsw-alias-label-tertiary);padding:0 10px;white-space:pre}
.fcv-pvCtxLine{white-space:pre}
.fcv-pvMuted{margin:0;padding:6px 10px 8px;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px}

/* ── ④ 会话页头快捷开关（conversation.session.header.utilities） ───────────────── */
/* 形态照抄同一槽位上的官方 open-in-app：.5px 边框 + 14px 圆角的胶囊、11px 字号。
   只有「当前会话已被覆盖」时才把边框换成品牌色，并多出一个「恢复跟随偏好」按钮。 */
.fcv-headCtl{border:.5px solid var(--dsw-alias-border-l4);border-radius:14px;align-items:stretch;height:28px;display:inline-flex;overflow:hidden}
.fcv-headCtlOverridden{border-color:var(--dsw-alias-brand-primary)}
.fcv-headBtn{color:var(--dsw-alias-label-primary);cursor:pointer;white-space:nowrap;background:0 0;border:0;align-items:center;gap:5px;padding:5px 8px;font-family:var(--dsw-font-family);font-size:11px;font-weight:400;line-height:16px;display:inline-flex}
.fcv-headBtn:hover,.fcv-headBtn:focus-visible{background:var(--dsw-alias-interactive-bg-hover)}
.fcv-headBtn:focus-visible{outline:none}
.fcv-headSep{background:var(--dsw-alias-border-l4);flex:none;width:.5px}
.fcv-headLabel{color:var(--dsw-alias-label-secondary)}
.fcv-headChevron{flex:none;transition:transform .12s}
/* 「展开」态把折叠箭头转成朝右，一个图标表达两种状态 */
.fcv-headChevronShut{transform:rotate(-90deg)}
.fcv-headReset{color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:0;border-left:.5px solid var(--dsw-alias-border-l4);align-items:center;padding:5px 7px;display:inline-flex}
.fcv-headReset:hover,.fcv-headReset:focus-visible{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.fcv-headReset:focus-visible{outline:none}
@media (prefers-reduced-motion:reduce){.fcv-headChevron{transition:none}}
`;
