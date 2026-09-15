# @dshp/token-meter

DeepSeek Harness（DSH）**Token 总览**插件：**额度 + 用量二合一**——一边看“外面还剩多少”（多供应商滚动额度/按量余额：opencode、DeepSeek、Command Code、手动账本，中心区富卡片 + 设置页供应商运维），一边看“里面用了多少”（本机会话日志聚合：累计/峰值/连续天数、日/周趋势、24 小时分布、GitHub 风格热力图、模型分布、今日消耗，**以及在线时长**——在线 / 对话进行中 / 模型 + 工具三口径 + 每日排行）。界面在会话中心区注册一个「Token 总览」tab（与原生「轨迹」同机制），tab 内用左侧菜单切换 **额度查询 / 用量统计 / 在线统计 / 设置**（设置分区与侧边栏 `设置 → Token 总览` 是**同一个组件**，两处改一处同步；额度查询空状态还带一个「去添加供应商」按钮直接跳过去）。配置通过官方 settings API 持久化到 `$DSH_HOME/settings.yaml`（`dshp-token-meter` 命名空间），支持注释保留与热重载。配置**只认** `dshp-token-meter` 一个键：旧双插件的 `storages/token-quota.json` 与 settings key（`dshp-inx-token-quota` / `dshp-inx-token-stats`）不再读取、不再迁移（手工迁移步骤见“常见问题”）。

> 设计原则：**零依赖、零残留、可逆副作用**。密钥只存引用（`$NAME`）或脱敏展示；统计无网络上报、不额外落盘真相数据（会话日志即持久层；`storages/token_stats.json` 只是**可丢的派生缓存**，删了会自动凭日志重算）；卸载即干净。

## 安装

### 方式一（推荐）：克隆 monorepo 安装 —— 更新只需 `git pull`，旧版 DSH 可 checkout tag

```sh
# 1. 克隆 monorepo（lib/ 构建产物已提交，clone 下来就能用，无需 build）
git clone git@github.com:Yinxe/deepseek-harness-plugins.git
cd deepseek-harness-plugins
pnpm install

# 2. 本地安装到 profile（路径按你执行命令时的 cwd 解析）
dsh plugin --profile web add ./plugins/token-meter

# 3. 卸载旧双插件（避免双份侧边栏/设置节重复；旧 settings 段需手工并到 dshp-token-meter，
#    本插件不做任何自动迁移）
dsh plugin --profile web remove "@dshp-inx/token-quota"
dsh plugin --profile web remove "@dshp-inx/token-stats"

# 4. 重启生效
dsh web
```

- **更新**：仓库内 `git pull` + `dsh web`（最快——lib 已提交，未改 src 无需 build）；兼容旧版 DSH：按 [`compat.json`](../../compat.json) 的 tag `git checkout <tag>` 后重跑上面的 add。

> DSH 是最新版就到此为止。只有 DSH 停在老版本才需要先 `git checkout <历史tag>`（对照根目录 `compat.json`，现在是空的，不用管）。

`dsh plugin` 会把包写进 profile 的 `dsh.profile.bundles` —— **无需手动改配置文件**。

**改源码后**：`src/host` 或 `src/client` 改完跑 `pnpm --filter @dshp/token-meter build` 重新打出 `lib/host.js + lib/client.js`，然后 `dsh web` 重启（client 半强刷页面即可）。

**验证**：打开 web → 设置 → Token 总览（统计设置 / 额度配置双 Tab）；打开任一会话，中心区标题栏出现「Token 总览」Tab（与「对话 / 轨迹」并列），点进去用左侧菜单切换额度查询 / 用量统计 / 在线统计 / 设置（配置项不必再绕去侧边栏，界面效果见下文「界面预览」）；或 `curl http://127.0.0.1:3080/ext/dshp-token-meter/state` 返回 `{ok:true, ...}`。

**一键 AI 安装**：把下面这段发给你的 DSH AI 即可：

```text
帮我安装 TokenMeter 插件（monorepo Yinxe/deepseek-harness-plugins，子目录 plugins/token-meter，包名 @dshp/token-meter）：
1. git clone monorepo 并 pnpm install
2. dsh plugin --profile web add ./plugins/token-meter，并卸载旧 @dshp-inx/token-quota 与 @dshp-inx/token-stats
3. dsh web 重启，确认无报错，设置页出现「Token 总览」即成功
4. 打开设置页的 Token 总览，帮我添加一个供应商并刷新一次额度，再告诉我累计 Token 总量和今日用量
```

### 方式二：从 Release 安装（无需 clone；更新需手动重跑命令）

latest 滚动版（跟随 main 最新构建；滚动更新 = 重跑同一条 add 命令）：

```bash
dsh plugin --profile web add \
  https://github.com/Yinxe/deepseek-harness-plugins/releases/download/latest/dshp-token-meter-latest.tgz

dsh web   # 重启生效
```

### 历史版本（兼容旧版 DSH）

main 永远跟随最新 DSH。老版本 DSH 用户装**静态历史版本**：按 `compat.json` 记录的兼容 tag，到 [Releases](https://github.com/Yinxe/deepseek-harness-plugins/releases) 找对应版本 Release（`v*` tag 触发，静态存档、永不滚动），资产名 = `dshp-token-meter-<tag>.tgz`：

```bash
# 以 v0.1.5-rc.1 为例
dsh plugin --profile web add \
  https://github.com/Yinxe/deepseek-harness-plugins/releases/download/v0.1.5-rc.1/dshp-token-meter-v0.1.5-rc.1.tgz

dsh web   # 重启生效
```

## 更新

### 三种安装方式对应的更新方式

| 安装方式             | 更新命令                                                    | 说明                                                      |
| -------------------- | ----------------------------------------------------------- | --------------------------------------------------------- |
| 方式一 clone（推荐） | 仓库内 `git pull` + `dsh web`                               | 最快；未改 src 免 build；旧版 DSH 用 `git checkout <tag>` |
| 方式二 Release       | 重跑同一条 `add` 命令 + `dsh web`                           | URL 直装对 `update` 免疫；两个 pnpm 坑见根 README         |
| 方式三 git 依赖      | `dsh plugin --profile web update @dshp/\<pkg\>` + `dsh web` | 一条命令；git 解析约 35s/插件（实测）                     |

## 界面预览

> 截图在 `images/` 目录（4 张，`screenshots.json` 同步收录）：**分享面板**（封面）/ 额度查询 / 用量统计 / 在线统计。

![分享面板：用量统计与在线统计内聚成一块，可下载 PNG / 复制图片](images/shared.png)

**中心区 Tab「Token 总览」—— 一个 tab + 左侧菜单**

面板不占右侧栏，而是像原生「轨迹」一样在**会话中心区**注册一个 tab（`conversation.view`，order 40，与「对话 / 轨迹」并列）；tab 内用**左侧菜单**切换四块内容：**额度查询 / 用量统计 / 在线统计**，外加一条分隔线之下的 **设置**（偏好、供应商增删改、数据来源与统计缓存；与侧边栏 `设置 → Token 总览` 共用同一个组件，改一处两边同步）。选中项记在 `localStorage`（`tm-center-section`），下次打开回到上次看的那块；设置分区沿用设置页的行式表单布局，宽屏下收窄到 920px 居中（数据分区才吃满宽度）。

布局按「宽画布仪表板」设计（不是把右侧栏的窄单列搬过来）：

- **滚动**：tab 页自己是滚动的那个——**左菜单与分区标题栏在滚动容器之外**，滚内容时它们一动不动。会话外壳里负责高度的那层（hashed 类 `.wSkVaW_viewArea`，激活态 `flex:1 0 auto; min-height:auto`）会让 `height:100%` 退化成 `auto`，所以插件用官方稳定钩子把它改成确定高度项：`[data-conversation-scroll]:has([data-slot="conversation.view"] .tm-cview) > [data-slot="conversation.session"] > *`。`:has()` 的参数刻意写全以把特异性抬到 `(0,4,0)`，**压过**外壳那条 `(0,3,0)` 的激活态规则 —— 不依赖「插件样式晚于外壳注入」这种时序假设。随后 `.tm-cmain` 内的 `.tm-cbody` 成为唯一滚动容器（`overflow:clip` 而非 `hidden`，滚轮不会被截住）。两个坑：① 左菜单容器必须保持 `overflow:visible`，一旦 `overflow:auto/hidden` 它自己就成了滚动容器，里面的 `position:sticky` 会改为相对它定位、而它永远不滚，于是外层一滚菜单就跟着滚；② 万一钩子失效，会退化成「外层滚动 + 菜单 `position:sticky` 钉住」的旧模型，仍可用（两条路径都已验证）。
- **不显示会话列宽拖拽条**（原生轨迹视图同样不显示，仪表板也用不到窄列）。实现是对「有 `.tm-cview` 后代且直接挂着 `[data-width-handle]`」的那层隐藏。
- **卡片区走 12 栏栅格**，排布按「谁吃横向空间」定：**用量统计**是 基础数据 → 趋势（通栏）→ 热力图（通栏）→ 模型分布（通栏，内部纵向分栏兜底），趋势与热力图都是越宽越好读、并排只会各自被压窄；**在线统计**是 基础数据（在线时长）→ 每日在线图（通栏）→ 每日在线排行（7 栏）与口径表（5 栏）并排。容器窄于 1180px 时并排项自动逐级落回单列。
- **两个分区的「基础数据」是同一套指标卡阵**：`grid-auto-rows:1fr` 让同一行等高，卡片末行 `margin-top:auto` 让数值落在同一条网格线上，说明允许两行（不再被省略号切掉）。在线时长固定列数（≥1320 容器 4 列 / 820~1320 两列 / 更窄一列），7 张卡里让「引擎合计」（= 模型生成 + 工具执行）跨两列，最后一行永远是满的；标题行右侧带 **准确性徽标图例**（精确 = 时间戳直接算出 / 估算 = 由区间推断 / 下界 = 实际只会更多），不用猜颜色含义。
- **额度查询是自适应卡片网格**（4 / 3 / 2 / 1 列随宽度落，每列不窄于约 320px）。
- **图表统一「按容器实测宽度设 viewBox + 固定高度」**，不用「固定 viewBox + `width:100%/height:auto`」——后者会按 viewBox 比例**等比放大**：趋势图原来固定 780×250，铺满中心区（约 1166px）时整幅被放到 **374px 高**，连 10.5px 的轴标签、1px 网格线一起被放大 1.49×，表现就是「图太大、太高、字太大」。改成 1:1 后：高度不再随宽度增长（趋势图 `clamp(150, W*0.24, 230)`，中心区 230px、卡片总高 463 → 319px，字号回到 10.8px）、同样的 30 天拿到更多横向像素。**每日在线图**同理（原固定 320 宽会在宽屏下等比缩到 320px 居中留白，现在真正铺满并自动加高）。
- 中心区拖窄到 620px 以下时左菜单收成图标轨道。
- **分享面板**：tab 头部「分享」按钮把 **用量统计 + 在线统计**里**已经在用的那些组件原样内聚**到一块面板上 —— 基础数据（13 张指标卡，通栏）/ 趋势 | 热力图 / 模型用量分布 / 在线时长（三口径）/ 每日在线 / 每日在线排行（后四块各占一整行）。页头分三层：① 标题区（左）+ 作者区（右，git 著者与邮箱）；② 细线；③ **来源信息条** —— 插件名 / 版本 / 仓库左对齐独占一行，会话数·记录天数·生成时间靠右。插件名、版本、仓库地址**全部由 tsup 的 `define` 在构建期从 `package.json` 注入**（`PKG`，仓库取 `homepage` 去掉协议与 `#readme`），不写死字面量 —— 只注入版本而把包名/仓库写死的话，改包名时就会对不上。**不自绘、不改配色**：颜色、字号、图形、分档全部由组件自己走 `--dsw-alias-*` 主题 token 决定。**尺寸模型**：板宽跟随容器（`width:100%`）→ 组件按真实像素宽度排版、**字号 100%**；高度由内容决定，装不下就在**舞台内滚动**（与视图 `.tm-body` 的滚动模型一致），长图无所谓，不再为了塞进 16:9 而整体缩放。**导出**走 `DOM → SVG <foreignObject> → Image → canvas → toBlob`（零依赖）。这里有两个必须记住的坑：① **必须禁掉动画/过渡**（`animation:none!important`）—— 卡片带入场动画 `.tm-card{animation:tm-fadeup .42s backwards}`，而 `@keyframes tm-fadeup{from{opacity:0}}`，`<img>` 里的 SVG 是静态图像上下文**不会推进 CSS 动画**，于是每张卡片都以 `opacity:0` 被光栅化，导出的图只剩没有动画的页头页脚（「下载/复制出来什么都没有」的真因）；② 导出前要**等两帧**再量尺寸，否则首次导出会拿到还没排定的高度、切掉最后一行。另外导出时要把插件 CSS 与用到的 28 个主题 token 计算值**内联**进 SVG（`SHARE_TOKENS`，`pnpm test` 里有覆盖自检），因为 foreignObject 读不到 DSH 壳层的样式表；输出为板子尺寸的 2×。板子上会隐藏档位/小组件开关（纯 CSS，组件代码一行没改）—— 静态图上的可点控件没有意义。

**「额度查询」—— 峰谷提醒 + 供应商富卡片**

部分供应商采用峰谷定价（示例为 9:00–18:00 为峰），顶部横幅提醒当前峰/谷时段与剩余时长；下方为全部供应商的展开富卡片，**不按启用/禁用分组，全部混排在一个自适应网格里**（按宽度自动 4/3/2/1 列；卡数正好比列数多一张时自动降一档，避免最后一行只剩一张孤卡）：**卡片顺序 = 当前供应商 → 已启用 → 已禁用**（同档保持 settings.yaml 配置顺序）。启用/禁用靠卡片自身的左缘色带、底色与「已禁用」徽标区分，不再插分隔行——那条整行文字会把后面所有卡片挤到下一行、留出半行空洞。配额进度条按「5 小时 / 每周 / 每月」分级，标注占比与重置倒计时（如「每月 99% · 最早重置 3 小时后」），余额/充值/订阅状态一目了然；余额不足（如欠费 ¥-0.37）触发红色预警文字与预警线。**余额卡右上角的可用性徽标与这条余额告警同源**：`可用` = 上游明确说可用；`不足` = 上游明确报不足**或余额已 ≤ 0**；`状态未知` = 上游没给出可用性判断、这里只反映余额数字本身（典型是手动账本）。之所以把「余额 ≤ 0」并入徽标判据，是因为多数 provider 在余额非正时只回 `null`（它们不肯替上游断言「不可用」，见 `host/providers/*.ts` 的 `isAvailable: balance > 0 ? true : null`），旧实现只读 `isAvailable`，于是同一张卡会出现「状态未知」顶着「余额不足」红字的自相矛盾。徽标悬浮有三态释义。卡片内「账户与用量」的两列指标网格按**卡片自身宽度**收放（卡片即尺寸容器），3~4 列时自动落回单列，避免标签被省略号截断。增删改供应商请到 设置 → Token 总览。

**峰谷氛围与状态配色**：卡片观感跟随峰谷 —— **峰**时段暖色左缘 + 极缓呼吸光晕（紧张、消耗加速），**谷**时段冷绿左缘 + 静稳底色（费率低、可从容跑量），峰谷横幅同步换色并给出「错峰跑量」提示；**禁用**余额查询的供应商为红色左缘 + 红色空心状态点 + 红色「已禁用」标签（与「拉取失败」的实心红点区分：禁用是主动选择，失败是异常）。

![额度查询：峰谷提醒 + 供应商富卡片](images/quota.png)

**「用量统计」—— 统计仪表盘**

顶部指标卡（模型调用次数 / 首次使用 / 最近使用）+ Token 使用趋势折线（近 24 小时/7 天/30 天，按天聚合，悬浮查看明细）+ Token 活力热力图（6 / 12 个月两档 —— 卡片够宽自动铺 12 个月、窄了自动退回 6 个月，也可手动切换并记住；悬浮查看当日明细：总消耗、会话数、输入/输出构成、缓存读/写与占比）+ 模型用量分布环形图（中心累计 Token，悬浮查看各供应商×模型构成）。

![用量统计：指标卡 + 趋势折线 + 活力热力图 + 模型分布](images/token-usage.png)

**「在线统计」—— 三口径 + 每日在线 + 排行**

顶部常驻**空闲阈值**说明：三条规则（相邻事件间隔 ≤ 阈值则整段计入含中间空档、超过则断开、每段只算到最后一个事件所以任何档位都是下界）+ **五档实测对比**（1/5/15/30/60 分钟各自的累计在线与边际增量，直接取自快照，点击即切换，推荐 15 分钟并标注）。下方是 7 张三口径指标卡（今日在线 / 累计在线 / 活跃日均 / 对话进行中 / 模型生成 / 工具执行 / 引擎合计，各带 精确 / 估算 / 下界 徽标）、每日在线柱线图（柱 = 对话中 + 空档，虚线 = 引擎合计，峰值标注）、每日在线排行（柱状图与列表合体，悬浮看当日明细）与「口径与准确性」表。

![在线统计：空闲阈值说明与五档对比 + 三口径 + 每日在线 + 排行](images/online.png)

## 功能

| 部分                                          | 内容                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Host（`src/host/` → `lib/host.js`）**       | 额度：provider 注册表委托拉取（`opencode` / `deepseek` 自动选路 / `commandcode` / `manual`，别名 `opencode-go`/`opencode-zen`/`deepseek-api`/`deepseek-web` 读路径自动归一），每个 provider 同时产出**自己的数据与 UI 视图**（`ProviderView` 声明式区块，见「provider 分层渲染」），密钥 `$NAME`/`{env:}`/`{cred:}` 解析（凭据服务优先、环境变量兜底），明文脱敏（只写不读、留空保留）、`secret-to-cred` 一键转存、内存快照（`st.snaps`，失败保旧）。统计：`sessionQuery` 全量扫描 + 文件指纹缓存（`storageDomain` 域 `token_stats`，域名保持不变；记录版本 `v=4`）+ 在线时长估算（`stats/online.ts`）+ 后台分批泵（每批 3 会话——批内并发受内存约束、`setImmediate` 让出、单会话超时 20s 起按次退避至 90s、失败 3 次跳过）+ `session/event` 失效。通过官方 `ctx.settings` + `schemastery` 持久化到 `settings.yaml`（`dshp-token-meter`）；**配置只认该 NS，不读旧文件/旧 key**。 |
| **Client（`src/client/` → `lib/client.js`）** | 「设置 → **Token 总览**」分成两个 Tab：                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |

- **统计设置**：数据来源提示（所有统计都由 `$DSH_HOME/sessions/` 的会话日志重算，**迁移/备份必须保留该目录**；`storages/token_stats.json` 可丢）、缓存与扫描状态（复用 / 缓存命中 / 扫描失败 / 直读 / 存储）、**清除统计缓存**（确认后清空派生缓存，下一次快照全量重算）、默认范围、在线时长空闲阈值；
- **额度配置**：自动刷新间隔 + 供应商添加与管理（当前选择/拉取/启用-禁用/编辑/存凭据/删除）。

图表全部搬到中心区。失效的侧边栏显示开关已移除。中心区注册**一个** tab（官方 `conversation.view`，order 40，与原生「对话 / 轨迹」并列），tab 内用**左侧菜单**切换四块：**额度查询**为全部供应商展开富卡片；**用量统计**为完整统计（指标卡、趋势线、热力图、模型环形图 + 小组件工具条）；**在线统计**为每日/累计时长统计：在线（你 + DSH）/ 对话进行中（DSH 的钟）/ 模型 + 工具（DSH 的活，精确）三口径并列，柱线混合图（柱 = 对话中 + 空档，虚线 = 引擎合计）带**悬浮数据提示**；**每日在线排行**把柱状图与列表合体（每行既是名次也是一根横向堆叠条，悬浮出当日明细，可展开全部活跃日）；另有口径与准确性表（精确/估算/下界徽标，含会话口径分解）。（在线统计面板不支持弹出为浮窗，顶栏抓手已移除。）左栏入口已移除，不再占用侧边栏空间；右侧栏原生 tab 也不再被占用。**供应商级余额查询开关**：每个供应商可单独「禁用」——禁用后卡片显示灰点 +「已禁用」badge，退出 Host 主动定时拉取，但手动「拉取」、已有快照展示与「设为当前」均不受影响（设置页与中心区卡片都可一键切换）。小组件化：每个供应商卡与每张图表（指标卡/趋势/热力/模型分布/今日卡）+ 峰谷显示器都是独立小组件，标题栏的 `⧉` 一键弹出为**可拖拽/缩放/最小化（胶囊）/锁定/关闭**的卡片。装了 [`@dshp/widget-kit`](../widget-kit/README.md) 时窗口由框架画（含吸附预览、主题色玻璃、动效、刷新后原地恢复），没装时自动退回插件自带浮层——两种承载下**原位都会消失**，`回归` 按钮收回原位。详见「[小组件](#小组件框架卡片--自带浮窗)」。UI 全部使用 DSH 官方设计 token（`dsw-alias-*`），与官方设置页风格一致。**图标全部自绘、零依赖**：导航图标在 `src/client/icons.ts`（额度/用量/在线/设置），数据语义图标在 `src/client/glyphs.ts`（23 枚：累计=堆叠、缓存=圆柱、峰值=闪电/山、日均=基准线+起伏、中位=中位线、连续=火苗/奖杯、活跃=日历、调用=芯片、首次=旗、最近/在线=时钟、今日=太阳、累计在线=沙漏、对话=气泡、工具=终端、引擎=齿轮、热力=九宫格、模型分布=圆环、每日在线=柱状、排行=榜单、口径=同心靶…）。**同一枚图标用两处**：13~~14px 贴在指标标签前 / 卡片标题前，以及放大到 58px、约 8% 透明度摆在各指标卡右下角当**水印底纹**（被卡片圆角裁切），让每张基础数据卡带一点与数据意境相符的图形而不是纯色块；色调态卡略强（12%）。未知图标名回退成圆点，不会崩也不会空白。**圆角只用产品默认值，且不覆盖全局角形**：不设私有半径变量层（卡片/浮窗 12px · 按钮/输入 8px · chip 6px · 胶囊 999px · 圆形 50%，与官方组件同一套），也不声明 `corner-shape` —— 主题包已用 `*,:before,:after{corner-shape:var(--dsw-corner-shape)}` 全局接管，插件再写一遍（哪怕写 round）就会把调主题插件的选择顶掉。图表内部的微圆角（点/条/热力格 1.5~~4px、圆环 50%）属于图形几何，不受主题半径影响。无额外依赖。 |
| **同源路由** | `GET /ext/dshp-token-meter/state`（配置脱敏 + 快照 + provider 元数据）、`POST /ext/dshp-token-meter/config`（通用偏好补丁）、`POST /ext/dshp-token-meter/refresh`、`POST /ext/dshp-token-meter/set-active`、`POST /ext/dshp-token-meter/set-refresh`、`POST /ext/dshp-token-meter/set-enabled`、`POST /ext/dshp-token-meter/set-vendor-enabled`（单供应商余额查询开关，`{ id, enabled }`）、`POST /ext/dshp-token-meter/add-vendor`、`POST /ext/dshp-token-meter/update-vendor`、`POST /ext/dshp-token-meter/delete-vendor`、`POST /ext/dshp-token-meter/secret-to-cred`、`GET /ext/dshp-token-meter/stats`（聚合快照，别名 `/data`）、`POST /ext/dshp-token-meter/clear-cache`（清空派生统计缓存 → 下次快照全量重算），均带同源校验（`Origin` 与 `Host` 一致或缺失才放行）+ `no-store`。 || **同源路由** | `GET /ext/dshp-token-meter/state`（配置脱敏 + 快照 + provider 元数据）、`POST /ext/dshp-token-meter/config`（通用偏好补丁）、`POST /ext/dshp-token-meter/refresh`、`POST /ext/dshp-token-meter/set-active`、`POST /ext/dshp-token-meter/set-refresh`、`POST /ext/dshp-token-meter/set-enabled`、`POST /ext/dshp-token-meter/set-vendor-enabled`（单供应商余额查询开关，`{ id, enabled }`）、`POST /ext/dshp-token-meter/add-vendor`、`POST /ext/dshp-token-meter/update-vendor`、`POST /ext/dshp-token-meter/delete-vendor`、`POST /ext/dshp-token-meter/secret-to-cred`、`GET /ext/dshp-token-meter/identity`（分享卡用的 git 身份：先 `ctx.get('shell')` 跑 `git config --get user.name|user.email`，拿不到 shell 服务或命令失败就退化为直接解析 `$XDG_CONFIG_HOME/git/config` / `~/.gitconfig`；可用 `DSHP_TOKEN_METER_GIT_NAME` / `_GIT_EMAIL` 覆盖；结果含失败都会缓存）、`GET /ext/dshp-token-meter/stats`（聚合快照，别名 `/data`）、`POST /ext/dshp-token-meter/clear-cache`（清空派生统计缓存 → 下次快照全量重算），均带同源校验（`Origin` 与 `Host` 一致或缺失才放行）+ `no-store`。 |
| **工具** | 无模型工具（本插件为运维/展示型，不注册 `tools`）。 |

### 小组件（框架卡片 / 自带浮窗）

每张供应商额度卡、每张统计图表（指标卡 / 趋势 / 热力 / 模型分布 / 今日卡）与峰谷显示器都可以从中心区里
「⧉」弹出为独立小组件，原位随之隐藏（`回归` 收回）。**同一份组件、两种承载**：

| 条件                            | 谁画窗口                                                                                   | 你得到什么                                                                                                               |
| ------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| 装了 `@dshp/widget-kit`（推荐） | 框架（`ctx.widgets.register`，`trayIcon: false` 的自由卡片）                               | 拖拽 / 八向缩放 / 最小化成胶囊 / **锁定位置** / 八向吸附与主题色预览 / 外观与动效跟随全局设置 / 刷新后位置与开关原地恢复 |
| 没装（或服务形状不符 / 被停用） | 插件自带浮层（`widgets.tsx` 的 `WidgetFloat` + portal，坐标存 `localStorage: tm-widgets`） | 老行为：任意非交互区域按住可拖，原位让位、`回归` 收回                                                                    |

两条硬约束（也是这套设计的由来）：

1. **可选依赖不能写进顶层 `inject`**：`export const inject = ['slots']`，宿主用
   `ctx.inject(['widgets'], …)` 挂载。否则用户没装框架时，本插件的额度面板与设置页会一起消失 ——
   小组件只是增强，不是本插件的存在前提。
2. **卡片不占活动栏图标**（`trayIcon: false`），所以注册是**常驻**的：启动时与供应商增删时
   由 `syncFloatWidgets()` 把注册表对齐到当前该有的卡片，否则刷新后「还开着」的卡片长不回来。

小组件的 id 有形状要求（`^[a-z0-9-]{2,32}:[a-z0-9-]{2,32}$`），而供应商 id 是用户在 `settings.yaml`
里手写的任意字符串，所以进宿主前统一编码并**钉住哈希**（同一个供应商永远同一个 id = 布局不漂移）：

| 插件内部 id      | 宿主 id（`@dshp/widget-kit`）     |
| ---------------- | --------------------------------- |
| `peak`           | `token-meter:peak`                |
| `stats:trend`    | `token-meter:stats-trend`         |
| `quota:deepseek` | `token-meter:quota-deepseek-fqfx` |

编码/标题是纯函数（`src/client/widget-bridge.ts`），由 `scripts/check-widget-bridge.mjs` 看守
（合法性 / 稳定性 / 不撞车，含 `My_Vendor`、`my.vendor`、200 字符、Unicode、控制字符这类脏输入）；
另有 `scripts/check-widget-kit-bridge.mjs` 把两个插件的真实产物对接起来跑一遍（无浏览器），
确认「注册真的进了框架的注册表、没有框架时也照常退化」。

### 统计口径

- 总 Token = inputTokens + cacheReadTokens + cacheWriteTokens + outputTokens（reasoningTokens 已含在 outputTokens，不重复计）
- 同一 (turn, step) 的 usage chunk 为早期采样、assistant/message usage 为终值，覆盖不重复累计
- fork 会话跳过其继承前缀（`readSession.inheritedEventCount`，即落盘 `seedLength`；父会话已计），不重复计数
- 含子代理会话（它们是真实用量）

数据源是 `sessionQuery` 服务实时扫描会话日志：**会话日志是唯一真相源**，`storages/token_stats.json` 只是可丢的派生缓存（每会话一行，含 token 桶与时长区间），删了会自动重算；因此**备份/迁移请保留 `$DSH_HOME/sessions/`**。设置页提供「清除统计缓存并重算」作为手动兜底。

#### 在线时长口径（`stats/online.ts`）

「在线」= 会话日志里有事件、且**相邻事件间隔不超过阈值**的墙钟时间：

- 跨会话按**区间并集**合并：同一时刻开着多个会话/子代理不重复计时（各会话时长直接相加会虚高约 30%）；
- fork/续接会话的继承前缀按 `inheritedEventCount` 跳过（父会话已计），所以历史对话不会重复计时；
- 「对话进行中」另算一路：`turn/start → turn/end` 的并集（不含轮次之间的空档）；
- 日志**只在有事件时打点** —— 窗口开着但没事件的时间在数据里不存在，所以任何阈值下都是**下界**，不是「坐在电脑前」的时长；
- 阈值的三条规则（面板顶部常驻说明 + `online.stats/online.ts` 文件头同步维护）：**① 间隔 ≤ 阈值 → 整段算在线**（中间空档一并计入，例如 10:00 与 10:50 两个事件、阈值 60 分钟，中间 50 分钟计入）；**② 间隔 > 阈值 → 断开**，中间那段一秒不计，新段从下一个事件重新起算；**③ 每段只算到最后一个事件**，之后的时间（含关窗口前那几分钟、或之后 3 小时没产生事件）都不计 —— 所以任何档位都是**下界**，不是「坐在电脑前」的时长。
- 阈值是**口径**不是精度：同一份日志 1 分钟档与 60 分钟档能差近一倍，所以面板把五档（1/5/15/30/60 分钟）连同**各自实测的累计值与边际增量**一起摆出来（数据来自快照里已有的 `totalMs[gap]`，点卡片即可切换）——只给当前档一个数字，用户没法判断该选哪个。（旧文案里写死过一句「60 分钟档比 1 分钟档多约 90h」，那是某个人的数据，对别人就是错的，已删除。）
- **推荐默认 15 分钟**（`DEFAULT_GAP_MIN`，也是 Host 侧 `onlineGapMin` 的默认值）：DSH 真正在干活时日志里持续有事件（模型 step、工具 call/result、子代理），不依赖大阈值；需要兜的是「读长回答、想下一个需求」这类几分钟量级的静默期。5 分钟以下会把这类静默期切断（偏低），60 分钟会把开会/吃饭整段算成在线（只适合回答「今天开着 DSH 多久」）。用户手动选过的值优先。

实现上分两级合并：`fold` 阶段把每会话的事件时刻按 1 分钟压成区间并随缓存落盘（`on`/`tn` 字段），
快照阶段再按所选阈值合并这些区间 —— 单链聚类可结合，因此**换阈值不需要重扫日志**。
（已用 238 个真实会话、50 万条事件校验：两级合并结果与「直接对全部事件按同一阈值合并」逐档一致。）

#### 引擎时长（模型 / 工具）

与在线时长**同一条扫描路径**（同一个 `readSession`、同一次 `foldSession`、同一行缓存），但算术不同：

- `llmMs`：`Σ(step/start → assistant/message)`，只统计真正组装出消息的步骤（被取消的步骤不计）；
- `toolMs`：`Σ(tool/call → tool/result)`，按 `callId` 配对；`turn/end` 时丢弃未落地的调用。

这两项是**精确**的：已用本机 126 个会话与 DSH 自带 `sessionStats` 投影缓存逐条对账，**126/126 完全一致**（差值 < 1ms）。
它们是**跨会话相加**的（同时开多个会话/子代理会重复计），所以「引擎合计」可能大于墙钟的「对话进行中」——这正是并行度的体现。

#### 读取策略与「最小化重算」

日志会一直长（本机最大会话已 **9.5 万条事件 / 压缩 28MB / 解压 71MB**，按当前用量推 10 个月后可能 95 万条），
所以读取按代价从低到高三级，尽量避免整份重算：

1. **会话级增量流**（`stats/stream.ts`）：日志是 append-only 的多帧 zstd，会话已有流且只是变长时，
   只 `consumeLogTail(file, offset)` 读**新增的那几帧**并推进折叠器；
2. **整份直读**（`stats/logread.ts`）：首读或文件被重写时，逐帧解压 + **切掉 fork 继承前缀**
   （继承段是连续前缀，跳过 `time < createdAt` 的事件），事件解析出来就喂折叠器、
   **不驻留事件数组**；
3. **官方 reader**：只在没有日志文件 / 直读失败 / 需要 live 内存态时使用。

实测（本机 238 会话 / 250MB 日志）：

| 场景                            | 结果                                               |
| ------------------------------- | -------------------------------------------------- |
| 流式首读 vs 整份直读            | 246/246 逐会话聚合**完全一致**                     |
| 追加 867 字节后续读 vs 整份重读 | 结果**完全一致**；耗时 **1ms vs 1190ms（≈1190×）** |
| 流式首读内存峰值（最大日志）    | **0MB**（整份直读构造事件数组是 133MB）            |
| 冷启动全量扫描（238 会话）      | **5.7s**，RSS 峰值 426MB                           |
| 热快照（全部命中缓存）          | **19ms**                                           |
| 删掉缓存文件后重算              | 与首次**完全一致**（缓存是纯派生数据）             |

逐帧解压与 `zstdcat` 在 246 个日志上逐字节一致；直读 238/238 成功；
fork 语义抽查与官方口径一致（整份继承的会话记 0、种子会话只记自己那 1.64 亿）。
`zlib.zstd*` 需要 Node ≥ 22.15/23.8，老版本自动退化为官方 reader。

#### 哪些数据是精确的、哪些是估算的

| 指标               | 来源                           | 聚合方式               | 性质                                                    |
| ------------------ | ------------------------------ | ---------------------- | ------------------------------------------------------- |
| Token（i/o/cr/cw） | 供应商上报的 `usage`           | 按天/小时/模型求和     | 精确（按上报值）；未上报 usage 的步骤算不到 → 略低      |
| 模型 / 工具时长    | 事件时间戳（step / tool 边界） | 逐会话求和（并行相加） | 精确（已与 `sessionStats` 逐会话对账）                  |
| 对话进行中         | 事件时间戳（turn 边界）        | 区间并集（墙钟去重）   | 估算；含少量等你操作的时间（审批等待实测约 0.7h）       |
| 在线时长           | 全部事件时间戳                 | 并集 + 空闲阈值合并    | 估算且是**下界**；阈值（1/5/15/30/60 分钟）直接决定结果 |
| 会话数 / 活跃天数  | `sessionQuery` 会话列表        | 计数                   | 精确（扫描失败的会话会单独报数）                        |

面板的「口径与准确性」卡片把这张表直接渲染出来（精确/估算/下界 三色徽标），无需查文档；
同一张卡还会给出**会话口径**：`有用量 / 总数` 以及其余会话的去向
（请求失败/中断、fork 继承空壳、从没发起请求、供应商未上报 usage、读不出来）。

#### 面板默认值

| 位置                  | 默认           | 说明                                                                                                                                                              |
| --------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| token 用量统计        | **全部**       | 设置页可改 `defaultRange`（7/30/90/全部）                                                                                                                         |
| Token 活动热力图      | **按宽度自动** | 只保留 6 / 12 个月两档；卡片宽 ≥900px 默认 12 个月，否则 6 个月；手动切换后以手动为准并持久化（`localStorage: tm-heat-span`）；格子横竖同一间隙（2/3/4px 随宽度） |
| 在线时长 · 空闲阈值   | **5 分钟**     | `onlineGapMin`，面板上可切 1/5/15/30/60                                                                                                                           |
| 在线时长 · 每日在线图 | **全部**       | 面板上可切 近14天/近30天/近90天/全部                                                                                                                              |

### 配置项

| 字段           | 类型                           | 默认    | 说明                                                                                    |
| -------------- | ------------------------------ | ------- | --------------------------------------------------------------------------------------- |
| `version`      | `number`                       | `1`     | 配置版本号（保留字段）。                                                                |
| `activeVendor` | `string`                       | `''`    | 当前供应商 ID；`''` = 极简模式（不显示任何额度）。                                      |
| `refreshSec`   | `number`                       | `60`    | 自动刷新秒数；Host 按此间隔拉取**已启用**的供应商，`0`=关闭，其余钳制 `10–3600`。       |
| `enabled`      | `boolean`                      | `true`  | 遗留字段（旧左栏开关，已无界面消费，仅保留做存储兼容）。                                |
| `vendors`      | `Vendor[]`                     | `[]`    | 供应商列表（`{ id, name, type, params, enabled? }`，`id` 主键 2–31 位小写/数字/横线）。 |
| `showToday`    | `boolean`                      | `false` | 遗留字段（旧左栏开关，已无界面消费，仅保留做存储兼容）。                                |
| `defaultRange` | `'7' \| '30' \| '90' \| 'all'` | `'all'` | token 用量统计默认时间范围（缺省「全部」）。                                            |
| `onlineGapMin` | `number`                       | `5`     | 在线时长空闲阈值（分钟），吸附到 `1/5/15/30/60`；只影响快照合并，不需要重扫日志。       |

供应商 `type`（`providerTypes` 下发，设置页下拉据此渲染）：

| type          | 说明                                                                                                               | 凭据                                                       |
| ------------- | ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| `opencode`    | Opencode Go+Zen 合并（`/go` 三窗口+订阅、`/billing` 余额，同 workspace 一次拉双页）                                | `workspaceId` + `cookie`                                   |
| `deepseek`    | DeepSeek 单入口自动选路：`sk-` 开头走官方余额接口，会话票据走网页账单（余额+累计消费+趋势），一路 401/403 自动换路 | `apiKey` 和/或 `token`（+可选 `cookie`）                   |
| `commandcode` | Command Code 额度：5 小时/每周滚动窗口 + 剩余额度 + 本计费周期用量/请求数/成功率/tokens                            | `apiKey`（`user_` 开头，缺省回退 `$COMMAND_CODE_API_KEY`） |
| `manual`      | 本地账本，`billing: rolling` 填 total/used，`payg` 填 balance/granted/lowWarn                                      | 无                                                         |

旧 `opencode-go` / `opencode-zen` / `deepseek-api` / `deepseek-web` 均为**别名**：读路径自动归一，新写入只落主 type，不会改写你已有的配置文件。

供应商级 `enabled`（余额查询开关）：**缺省 = 启用**，只有显式 `enabled: false` 才是禁用。禁用后该供应商不参与 Host 的主动定时拉取（含启动后的首拉），但**手动「拉取」、已有快照展示、「设为当前」都不受影响**；设置页与中心区额度卡上的「禁用 / 启用」按钮即写这个字段（走 `POST /set-vendor-enabled`）。启用时字段会被删掉而不是写成 `true`，因此旧配置零迁移、YAML 也不会冒出冗余字段。

## 配置（`settings.yaml`）

`$DSH_HOME/settings.yaml` 的 `dshp-token-meter` 分节（标准 settings 存储，直接改分节即热重载生效）：

```yaml
dshp-token-meter:
  activeVendor: oc-main
  refreshSec: 60
  enabled: true
  showToday: false
  defaultRange: '30'
  vendors:
    - id: oc-main
      name: Opencode 官方
      type: opencode
      params: { workspaceId: wrk_xxx, cookie: $OPENCODE_COOKIE }
    - id: ds-main
      name: DeepSeek 官方
      type: deepseek
      params: { token: $DS_TOKEN, apiKey: $DEEPSEEK_API_KEY, lowWarn: 5 }
    - id: m1
      name: 手动账本
      type: manual
      params: { billing: payg, balance: 50, granted: 100 }
    - id: cc-main
      name: Command Code
      type: commandcode
      params: { apiKey: $COMMAND_CODE_API_KEY, lowWarn: 10 }
      # apiKey 留空即自动回退读 $COMMAND_CODE_API_KEY（与 CLI 同一约定）
    - id: old-main
      name: 不常看的旧账号
      type: opencode
      enabled: false # 禁用余额查询：退出定时拉取，需要时仍可在卡片上手动「拉取」
      params: { workspaceId: wrk_old, cookie: $OPENCODE_COOKIE_OLD }
```

`activeVendor: ""` = 极简模式（不显示任何额度）。

> `cookie` 即浏览器登录态：开发者工具 → Application → Cookies → 复制 `auth` 的值，
> 整段 Cookie（含 `oc_locale` 等）原样粘贴亦可；各参数的含义与获取方式见设置页表单
> 每个字段下方的说明（由 provider 的 `fields[].hint` 下发）。
> 旧写法兼容：`opencode-go`/`opencode-zen`、`deepseek-api`/`deepseek-web` 均为别名，
> 读时自动归一到主 type（不落库、不改写你的文件）；`params.auth`（opencode 系）→ `cookie` 值不变；
> `{cred:}`/`{env:}` → `$NAME`。

## provider 分层渲染（每个 provider 自带数据与自己的 UI）

**Host 侧**：每个适配器 return 自己的数据（`ProviderResult`：`windows`/`billing`/`view`/`extra`）。
**Client 侧**：每个 provider 在 `src/client/providers/ui/<type>.ts` 里有**一套属于自己的完整 UI**，
自己决定怎么排版；通用零件从 `kit.ts` 取，不重复造 —— 这就是「UI 也基于 provider 灵活分层」。

```
Host    src/host/providers/<type>.ts      → return 自己的数据
Client  src/client/providers/ui/<type>.ts → 自己的完整 UI（自由排版）
        src/client/providers/kit.ts       → 通用可复用零件
        src/client/providers/sections.ts  → 声明式区块渲染（无专属 UI 时用）
        src/client/providers/registry.ts  → 调度：专属 UI → 声明式 → legacy 兜底
```

### 通用零件（kit.ts）

| 零件           | 说明                                                                         |
| -------------- | ---------------------------------------------------------------------------- |
| `RollingBar`   | **滚动刷新进度条**：label + 进度 + 占比 + 剩余时长（最常用，一行一个窗口）   |
| `WindowGroup`  | 多条窗口成组，自动附「最高占用 / 最早重置」汇总行                            |
| `BalanceBlock` | 余额主数字块（币种/可用状态/赠送充值拆分/多币种/低余额告警）                 |
| `MetricRows`   | 键值指标行集合                                                               |
| `SplitBar`     | 分段占比条（含图例与百分比）                                                 |
| `NoteLine`     | 提示条（info/warn/bad 三色）                                                 |
| `MiniChart`    | 趋势折线（纯 SVG，零依赖）                                                   |
| `Chips`        | 徽标组（计划/状态/来源等小标签）                                             |
| `ErrorCard`    | 失败卡（结构化结论 + 排查步骤 + 原始信息，见下节）                           |
| 工具           | `num` / `fmt` / `fmtLeft` / `curSymbol` / `remainOf` / `timeAgo` / `levelOf` |

### 内置专属 UI 的差异化表达

| provider      | 专属之处（声明式区块表达不了的）                                                                                             |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `commandcode` | 计划徽标（带订阅状态）；**5 小时 / 每周 / 月度三条额度进度条**；额度构成分解（多来源时）；账户与用量两列网格（成对合并省高） |
| `deepseek`    | **数据来源徽标**（官方余额接口 / 网页账单接口，两套凭据体系不同）；有趋势才画图，官方接口明说「不提供历史趋势」而非留白      |
| `opencode`    | 订阅徽标 + 三窗口；区分「订阅窗口」与「充值余额」（Go/Zen 同源不同形态）                                                     |
| `manual`      | 明确标注**本地手填、非平台实时**，避免误认为真实额度                                                                         |

### 卡片排序

中心区「额度查询」的额度卡按「**已启用优先** → 组内当前供应商置顶 → 其余保持 settings.yaml 配置顺序」排列；
禁用项沉底是刻意设计（多为留档备查，不该占视线），两组同时存在时插入「已禁用 · N 个」分隔标题
说明这不是配置顺序。设置页的供应商列表用同一套排序，两处观感一致。

### 三层兜底

| 层            | 位置                            | 作用                                               |
| ------------- | ------------------------------- | -------------------------------------------------- |
| 1 专属 UI     | `client/providers/ui/<type>.ts` | 该供应商自己的完整实现；**可选**，出错自动降级     |
| 2 声明式区块  | `client/providers/sections.ts`  | 渲染 `ProviderView.sections`；未知 `kind` 静默跳过 |
| 3 legacy 兜底 | `client/providers/registry.ts`  | 旧 Host 只下发 `billingKind`/`extra` 时照样显示    |

适配器**没给 `view` 也不会退化**：Host 用 `defaultView()` 从 `windows`/`billing`/`extra` 兜底推导；
只给 `view` 不给 `extra` 也不会让老客户端空白：`viewToExtra()` 反向补齐。
适配器还可声明 `defaultParams`（新增该类型时的表单初始值），如 commandcode 默认填 `$COMMAND_CODE_API_KEY`。

## 失败提示（apiKey 失效 / Cookie 过期 / 订阅结束…）

拉取失败一律转成**结构化结论**再渲染，不再只丢一句原始报错。分类与文案由 Host 产出
（`src/host/errors.ts`），客户端只按 `kind` 上色渲染 —— 与分层渲染同一思路，客户端不认识任何供应商。

| kind      | 触发场景                                                               | 配色 | 卡片给什么                                                          |
| --------- | ---------------------------------------------------------------------- | ---- | ------------------------------------------------------------------- |
| `auth`    | API Key 无效/被撤销/复制不全                                           | 🔴   | 「密钥无效或已失效」+ 去平台重新生成；明文与 `$NAME` 引用分别给处置 |
| `session` | Cookie / Bearer 会话票据过期（含 HTTP 200 信封 `40003 invalid token`） | 🔴   | 「登录状态已过期」+ 重新登录抓取步骤                                |
| `plan`    | 订阅到期/被取消/扣款失败（`past_due`/`unpaid`）/计划不支持该接口       | 🔴   | 续订升级指引；周期已过但状态未翻转时提前预警                        |
| `balance` | 余额不足（402）                                                        | 🔴   | 充值指引 + 调低预警线建议                                           |
| `rate`    | 限流（429）                                                            | 🟡   | 等待重试 + 调大刷新间隔 / 禁用定时拉取                              |
| `network` | DNS / 代理 / 超时（fetch failed）                                      | 🟡   | 网络与代理排查                                                      |
| `parse`   | 接口改版（结构不符、字段缺失）                                         | 🟡   | 提示需插件适配 + 复制详情反馈                                       |
| `config`  | 凭据或参数没配全（含 `$NAME` 解析为空）                                | 🟡   | 回设置页补齐（标 * 字段提示）                                       |
| `server`  | 上游 5xx                                                               | 🟡   | 稍后重试                                                            |

卡片交互：

- **结论行** —— 图标 + 标题 + 一句话解释，点击展开/收起；
- **处置行** —— `→ 具体去哪改`，配「设置页」快捷入口；
- **重试策略** —— 可直接重试的（限流/网络/5xx）显示「↻ 重试」；需先改配置的（密钥/会话/订阅/余额）
  改显示「✓ 已处理，验证」，避免诱导用户盲目重试；
- **展开详情** —— 分类专属的**有序排查步骤** + 原始信息（等宽、可「复制详情」整段贴给维护者）+ 官方文档链接；
- **状态点同步着色** —— 要人管的失败（密钥/会话/订阅/余额）红点，临时性失败（限流/网络）黄点。

## 扩展新供应商（4 步，前 3 步即可用）

1. 复制模板：`cp src/host/providers/manual.ts src/host/providers/<新type>.ts`
   （抓包型复制 `opencode.ts`，API 型复制 `commandcode.ts` 更接近）；
2. 改适配器：填 `type/label/title/secretField/fields/defaultParams/fetch`，用 `view.ts`
   的构造器产出 `view`（契约见 `src/host/providers/base.ts` 的 `ProviderAdapter` 接口）；
3. 注册一行：在 `src/host/providers/index.ts` 底部 `registerProvider()` 加一行，
   跑 `pnpm --filter @dshp/token-meter build`，重启 `dsh web` —— 设置页下拉、表单与
   额度卡自动出现新类型，`quota.ts` 与 client **零改动**（走声明式层）；
4. （可选）想要专属观感：`cp src/client/providers/ui/manual.ts src/client/providers/ui/<新type>.ts`，
   写自己的完整 UI（通用零件从 `ProviderUIKit` 取），在 `ui/index.ts` 注册一行。

## 代码结构

```
src/host/              Host 半（Node，tsup → lib/host.js 单文件 ESM）
  types.ts             共享类型（Vendor/快照/统计/配置/路由协议）
  http.ts              同源小工具（settingsNamespace/json/sameOrigin/readBody）
  config.ts            默认值/schema/消毒（不做迁移）
  secrets.ts           密钥引用解析（$NAME/{env:}/{cred:}/明文）
  errors.ts            失败分类（auth/session/plan/…）+ 处置指引 + ProviderError
  providers/           供应商适配器（每家一文件，注册即扩展）
    base.ts            契约 + ID/数字工具
    view.ts            provider 自描述视图（区块构造器/defaultView/viewToExtra）
    index.ts           注册表（扩展唯一入口 + 别名 + 脱敏/元数据）
    opencode.ts        官方 /go + /billing 双页合并
    deepseek.ts        统一入口（按密钥格式自动选路并互备，产出各自 view）
    deepseek-api.ts    官方 GET /user/balance（纯通道实现）
    deepseek-web.ts    网页 get_user_summary（纯通道实现）
    commandcode.ts     Command Code /alpha/{billing/credits,usage/summary,...}
    manual.ts          本地数字（rolling/payg）
  quota.ts             额度编排（快照/校验/合并 + 11 个同源路由）
  stats/               统计引擎
    fold.ts            会话折叠（终值覆盖采样、种子跳过、活动区间）
    online.ts          在线时长（区间合并/按日切分/阈值档位，纯函数）
    fsindex.ts         文件索引/指纹（同时认 session.v3.jsonl.zstd 与旧 v0 文件）
    async.ts           超时
    engine.ts          缓存引擎（指纹持久缓存 + 后台渐进扫描，零依赖垫片版）
    routes.ts          GET /stats（别名 /data）
  index.ts             apply 装配（patch→settings→引擎→路由）
src/client/            Client 半（浏览器，tsup → lib/client.js 单文件 CJS，loader 壳由构建预设拼出）
  types.ts             协议类型 + ClientContext/SlotsService 接缝
  api.ts               路由封装
  styles.module.css    CSS Module 样式（官方 token，类名不再带 tm- 前缀）
  components.tsx       Badge/Row/Select/Switch
  providers/          provider 分层渲染（专属 UI → 声明式区块 → legacy 兜底）
    kit.tsx           通用可复用 UI 零件（滚动刷新条/余额块/指标/图表/徽标/失败卡）
    sections.tsx      声明式区块渲染器（按 ProviderSection.kind 分发，复用 kit）
    registry.tsx      调度器：专属 UI → 声明式 → legacy
    ui/               每个 provider 一套属于自己的完整 UI
      commandcode.tsx 三条额度进度 + 额度构成分解 + 两列指标网格
      deepseek.tsx    数据来源徽标 + 有趋势才画图
      opencode.tsx    订阅徽标 + 三窗口/余额分流
      manual.tsx      本地手填标注 + 账本明细
      index.ts        专属 UI 注册表（新增一行即接入）
  ErrorBox.tsx        失败卡（结论/处置/排查步骤/复制详情，按 kind 上色）
  QuotaSection.tsx     额度设置页 + 侧边栏卡 + 浮窗 + 额度查询面板 + QuotaVendorWidget 独立组件
  StatsSection.tsx     独立图表组件（指标卡/趋势/热力/模型分布）+ StatsWidget + 今日卡
  OnlineSection.tsx    在线统计面板（阈值/区间切换 + 每日柱状图 + Top 日明细 + 口径说明卡）
  TokenMeterSection.tsx 精简设置页（开关+供应商管理）+ 用量统计面板 + WidgetFloatLayer
  CenterView.tsx       中心区视图：一个 conversation.view tab + 左侧菜单（额度查询/用量统计/在线统计）
  widgets.tsx          通用小组件浮窗系统（拖拽/坐标持久化/portal）
  glyphs.tsx           数据语义图标（指标卡 / 图表标题 / 水印底纹）
  icons.tsx            五个导航图标（中心区左侧菜单）
  SharePanel.tsx       分享卡板子（导出 PNG 用）
  ShareShell.tsx       分享卡外壳（按钮 + 预览 + 下载/复制）
  index.tsx            只导出 inject / apply（settings.section order 27 + conversation.view order 40 + 浮窗）
lib/                   构建产物（已提交，DSH git 安装必需）
  host.js              后端 bundle（schemastery 内联）
  client.js            前端 bundle（含 __ModuleLoader__.load）
cordis.patch.yml       bundle 声明（id: dshp-token-meter）
```

## 常见问题

- **设置页没有「Token 总览」**：确认 profile 的 `dsh.profile.bundles` 含 `@dshp/token-meter`，旧双插件已卸载（否则会有三个 Token 节重复）；重启 `dsh web` 后硬刷新浏览器。
- **额度报“密钥引用 $X 为空”**：先写入凭据（设置页“存凭据”）或 `export X=...` 后重启 `dsh web`（环境变量由进程继承）。
- **额度显示明文密钥**：state 下发明文已脱敏为空，编辑时留空即保留原值；想持久化引用请点“存凭据”转 `$TMETER_*`。
- **额度卡提示“密钥无效 / 登录状态已过期”**：卡片展开后是一份针对该原因的排查步骤（会区分密钥失效还是会话票据过期，并给出对应的重新生成 / 重新登录路径）；改完配置点卡片上的「✓ 已处理，验证」即可立刻验证，不必等下一个自动刷新周期。
- **额度卡提示“订阅已到期或计划不支持”**：到平台确认订阅状态与支付方式（含扣款失败 `past_due`、未支付 `unpaid`）；续订后等 1–2 分钟再刷新。若窗口数据还在但订阅已取消，卡片会以红条置顶提醒，不等到接口彻底失败。
- **opencode 报“登录失效或被风控”**：`cookie` 过期，重新从浏览器复制 `auth` 并更新（裸 token 会自动补 `auth=`，整段 Cookie 原样透传亦可）。
- **CommandCode 报“apiKey 未配置 / user\_ 开头”**：在 `commandcode.ai` → 工作室（Studio）→ API keys 创建 Key（`user_` 开头，与 CLI 同一把钥匙）；`export COMMAND_CODE_API_KEY=...` 后重启 `dsh web` 即自动生效（`params.apiKey` 可留空），也可直接粘贴明文或点「存凭据」转 `$NAME`。注意额度接口是 `/alpha/*`，网页端内部路径 `/internal/*` 用 API Key 一律 401。
- **DeepSeek 网页报“会话失效(401/403)”**：`token`（`ciYi` 开头 Bearer）过期，重新抓包粘贴；`sk-` 开头的请填 `apiKey` 栏（两套凭据不通用，实测 40003）。
- **统计一直“扫描中”**：会话多时后台分批扫描需时间（每批 8 个），`partial` 为渐进状态，轮询自动补全；单个会话 20s 超时防钉死，失败 3 次计入 `errors` 跳过。
- **某个供应商不想让它定时拉取**：设置页该供应商点「禁用」（或中心区额度卡点「禁用」，亦可直接在该 vendor 下写 `enabled: false`）。禁用后它不再被 Host 主动定时拉取，卡片仍显示上次快照并标注「已禁用」；需要时照常点「拉取」手动查一次，再点「启用」即恢复。
- **统计数字对不上**：口径为终值覆盖（chunk 采样不重复计）+ fork 种子去重（含子代理）； reasoning 已含在 output，不重复加。
- **旧配置没过来**：本插件**不自动迁移**。请手工把 `dshp-inx-token-quota` / `dshp-inx-token-stats` 两个分节的内容并到 `dshp-token-meter`（旧的 `storages/token-quota.json` 也不会被读取，可自行删除）。

## 卸载

```sh
dsh plugin --profile web remove "@dshp/token-meter"
dsh web
```

`remove` 会自动从 `dsh.profile.bundles` 撤下挂载。设置页配置已落盘到 `settings.yaml` 的 `dshp-token-meter` 分节，按需手动清理；指纹缓存（`token_stats` 域）随存储目录保留，不影响重装。

## 移植说明

> **Monorepo + TS 版**：本目录是 `deepseek-harness-plugins` monorepo 的标准子项目（`plugins/token-meter`），由 `~/.dsh/plugins/dsh-token-quota`（JS，`@dshp-inx/token-quota` v1.0.1）与 `~/.dsh/plugins/dsh-token-stats`（JS，`@dshp-inx/token-stats` v1.1.3）合并等价 TS 重写移植。
>
> - Host：quota 侧 `lib/{index,config,secrets,providers/*}.js` → `src/host/{types,http,config,secrets,providers/*,quota,index}.ts`；stats 侧 `lib/{index,engine,fold,fsindex,async,http}.js` → `src/host/stats/{engine,fold,fsindex,async,routes}.ts`，tsup 打包为单文件 `lib/host.js`（ESM，schemastery 内联，运行时零依赖），导出 `{ name, inject, NS, ConfigSchema, apply }` 与规范一致。
> - Client：quota 侧手写 `client.js`（1238 行）+ stats 侧手写 `client.js`（1548 行）→ `src/client/`（`.tsx` + JSX，不再是 `React.createElement` 工厂），构建为单文件 `lib/client.js`（CJS + 构建预设拼的 `__ModuleLoader__.load` 壳；react / react/jsx-runtime / react-dom / primitives 运行时注入不打包）。官方组件的 props 类型直接来自 `@deepseek-ai/dsh-client-ui-primitives`（devDependency，见 [docs/client-basics.md](../../docs/client-basics.md)），样式走 CSS Module（构建期内联，见 [docs/build-and-deps.md](../../docs/build-and-deps.md)）。

> 构建：`pnpm --filter @dshp/token-meter build`（tsup）→ `lib/host.js` + `lib/client.js`；包入口 `lib/host.js`，`./client` → `lib/client.js`。`lib/` 已提交（DSH 从 git 直接安装，不跑 build，必须带构建产物）。

## 免责声明

- 本插件抓取 `opencode.ai` 页面结构，页面改版可能导致解析失败，需更新 `parseGoQuota` 正则；
- DeepSeek 余额走官方 `api.deepseek.com/user/balance` 或网页 `get_user_summary`（无公开文档，基于抓包推断），需有效凭据；
- 统计数据全部来自本机会话日志，无网络上报、无独立持久化；
- 本插件与 OpenAI / DeepSeek / Opencode 官方无隶属关系。
