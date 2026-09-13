# @dshp/file-change-viewer

DeepSeek Harness（DSH）**文件修改查看器**：接管对话流里的 `edit` / `write` 行——**行的外壳与折叠行为完全沿用官方原生行**（和「思考 / 读取」行同一套样式，默认同样折叠，也可在设置里改成默认展开），展开后每个文件块是一张**代码卡片**：卡头是「文件类型图标 + 文件名 + 增删统计（图标 + 绿增红删）」并带**该块自己的**折叠箭头与「高亮 / ± 差异」切换（各带图标），卡内是**带语法高亮的统一 diff**（新增行绿底、删除行红底、**行号是文件里的真实行号**，删除行不占号）。另外它还注册了一个 **`patch` 工具**：一次调用把**多处零散修改 / 多个文件**的 unified diff 应用下去（全有或全无），批量改文件从此不必退化成 `bash` + `sed`/`python`——那种改法在界面上只留一行 Bash，看不见任何 diff。

全局默认值在**设置 → 左侧导航「文件修改卡片」**（本插件自己的设置节）里配置（展示方式下拉 + 默认展开开关），持久化在 `settings.yaml` 的本插件命名空间。

内置的文件修改行是**默认折叠**且只有 `-`/`+` 行色的：DSH 用 `DisclosureRow` 承载折叠语义，折叠态下 `DiffBlock` 根本不挂载，所以「用 CSS 把行撑开」走不通。本插件按官方扩展点注册 `tool.call.toolview` 的同名 key（官方文档：_a key the shipped composition already covers is replaced, not shared_），用**同一批官方 primitives** 重新组装这一行。

> 设计原则：**只改渲染，不碰数据；能不改的就不改**。不注册工具、不改任何文件——内容全部来自官方 `dsh-tool-fs` 已给出的 `meta.diffs` 与调用参数，行的几何全部来自官方 `DisclosureRow` 默认样式，配色全部来自官方 token。Host 半只多做两件事：把自己的 settings 命名空间注册进设置系统，并提供两条同源 `/ext` 路由供设置节读写这两项偏好。

## 长什么样

```
▸ 编辑 · src/client/index.ts            +58 -43          ← 原生行：默认折叠（可配成默认展开），与读取/思考行一致
   ╭──────────────────────────────────────────────────╮
   │ ▾ 📄 src/client/index.ts          ⊕37 ⊖26  [⌘高亮][⑂± 差异] │  ← 卡头：类型图标 + 文件名 + 图标化统计 + 两块控件
   │    1  const RAW_MAX_CHARS = 4000;                 │
   │    2                                              │
   │    3  /** 生成「按行上底色」的 CSS 规则。 */        │
   │       -  * 官方 CodeBlock 没有逐行样式的 API，      │  ← 红底 = 删除
   │    4  +  * 官方 CodeBlock 在行号模式下…            │  ← 绿底 = 新增
   ╰──────────────────────────────────────────────────╯
```

- **行是原生行**：`DisclosureRow` 默认样式（24px 行高、16px 图标位、13px 标色、hover 图标↔箭头交叉淡出），本插件只把官方 `ToolRow` 里那几条工具专属样式（分隔点、路径链接、摘要、统计、Inspect 药丸）镜像过来——不自造行外壳、不覆盖背景。
- **统计绿增红删**：`+58` 用 `--dsw-alias-state-success-primary`，`-43` 用 `--dsw-alias-state-error-primary`（官方行内是单一灰色，这里按要求分色）。
- **卡片头**：官方 `FileTypeIcon`（按扩展名判类型）+ 文件名 + 图标化增删统计（`IconPlusOutline16` / 一图元减号 SVG，绿增红删）+ 该块自己的折叠箭头 + 该块自己的「高亮 / ± 差异」（`IconCodeOutline16` / `IconBranchOutline16`）。官方代码块自带的语言标签栏与复制按钮继续隐藏（不需要）。
- **编辑行**的 leading 图标沿用官方 `IconEditOutline16`（与内置文件修改行同一个）。
- **失败时** summary 位只显示首行错误（红字，官方 `ToolRow` 同做法），不显示路径与统计。

## `patch` 工具（批量 / 零散修改）

官方的文件工具是 `read` / `write` / `edit`，其中 `edit` **一次只能替换一处**。所以「一个文件里改 8 处、顺带再改 3 个文件」这种活儿，agent 往往会退化成 `bash` + `sed`/`python` 一把梭——改动藏在命令里：界面上只留一行 Bash，没有 diff、也没法整体回滚。本插件补上这个缺口：

```text
patch(patch: "--- a/src/a.ts\n+++ b/src/a.ts\n@@ -12,3 +12,4 @@\n ...
              --- a/src/b.ts\n+++ b/src/b.ts\n@@ -3,2 +3,2 @@\n ...")
```

| 性质     | 说明                                                                                                                    |
| -------- | ----------------------------------------------------------------------------------------------------------------------- |
| 格式     | git / `patch(1)` 的 unified diff：`---` / `+++` 文件头 + `@@` 小节；`a/` `b/` 前缀可省；一次可带**多个文件、多个 hunk** |
| 新建文件 | `--- /dev/null` + `@@ -0,0 +1,N @@`，整段 `+` 行                                                                        |
| 行号     | 必须写在 `@@` 头里，但容差很宽：先按近邻搜，再全文件取**离期望位置最近**的匹配（与 `patch(1)` 报 offset 同思路）        |
| 原子性   | **全有或全无**：先把每个文件读进来、在内存里全部应用成功才落盘；任一处上下文对不上就整体失败，绝不写一半                |
| 后端     | 走 `ctx.fs`：同样吃沙箱模式、`fs/write-intent` 观察策略、`fs/observed` 记账；不绕过 seam                                |
| 范围     | 只做「改 / 建」；**删除文件**明确拒绝（`+++ /dev/null`），与官方工具集一致                                              |
| 渲染     | 结果元数据带 `diffs`，于是这张调用也用它自己的差异卡片显示（多文件各一张卡、统计只算真正变化的行）                      |

> 什么时候用哪个：一处小改动 → `edit`；新建 / 整份重写 → `write`；**多处零散或跨文件 → `patch`**；`bash` 留给构建 / 测试 / git / 探活，不用来改文件（它不产生 diff）。

## 两种展示方式（设置 → 文件修改卡片）

| 方式             | 组件             | 形态                                                                                                                                                                  |
| ---------------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **高亮**（默认） | 官方 `CodeBlock` | 单个代码块里放完整统一 diff（LCS 结果）：未变行只出现一次，删除行红底、新增行绿底，删行不占行号；**代码原样**（不加 `-` / `+` 标记）                                  |
| **± 差异**       | 官方 `DiffBlock` | 逐行 `-`/`+` 红绿文字（紧凑），超长中部折叠；自带复制按钮与 `└ +A -B` 页脚。喂给它的是**语义变更**（只含真正变化的行），所以它的 `+A -B` 与高亮视图、行头统计永远一致 |

两项偏好（展示方式、编辑 / 写入是否默认展开）是**全局默认值**，只有一个入口：**设置 → 左侧导航「文件修改卡片」**一节（展示方式用下拉选择框，默认展开用开关）。改动**立即经 `/ext/dshp-file-change-viewer/config` 写进 `settings.yaml` 的 `dshp-file-change-viewer` 分节**（Host 调 `settings.update`），保存成功 / 失败都在设置节里如实反馈。

「默认展开」的语义是**只影响之后新渲染的编辑 / 写入操作**：打开后新行直接展开显示改动（行内文件块也默认展开），关着就与思考 / 读取行一致、点一下才展开。**已经在会话里的行不受影响**——改开关不会把用户正在看的行抽走或撑开；单行、单块随时可以临时点开 / 收起，那种临时状态不写回。行内不再放全局切换按钮——逐行记忆只会让界面自相矛盾。

## 安装

### 方式一（推荐）：克隆 monorepo 安装 —— 更新只需 `git pull`，旧版 DSH 可 checkout tag

```sh
# 1. 克隆 monorepo（lib/ 构建产物已提交，clone 下来就能用，无需 build）
git clone git@github.com:Yinxe/deepseek-harness-plugins.git
cd deepseek-harness-plugins
pnpm install

# 2. 本地安装到 profile（路径按你执行命令时的 cwd 解析）
dsh plugin --profile web add ./plugins/file-change-viewer

# 3. 重启生效
dsh web
```

- **更新**：仓库内 `git pull` + `dsh web`（最快——lib 已提交，未改 src 无需 build）；兼容旧版 DSH：按 [`compat.json`](../../compat.json) 的 tag `git checkout <tag>` 后重跑上面的 add。

`dsh plugin` 会把包写进 profile 的 `dsh.profile.bundles` —— **无需手动改配置文件**。

**改源码后**：`src/client` 改完跑 `pnpm --filter @dshp/file-change-viewer build` 重新打出 `lib/host.js + lib/client.js`，然后 `dsh web` 重启（client 半强刷页面即可）。

**验证**：`pnpm --filter @dshp/file-change-viewer test` 会跑 `node --check` 两份产物 + Host 冒烟（`scripts/check-host.mjs`，53 项：命名空间、补丁消毒、`/ext` 三条路由、非法补丁不落库、`patch` 工具注册契约与「任一文件对不上就整体不写」、locate 只回行号）+ `patch` 纯函数（`scripts/check-patch.mjs`，41 项：多文件 / 多 hunk / 行号漂移 / 新建 / 无换行 / 各类失败）+ Client 无头渲染断言（`scripts/check-client.mjs`，152 项，含一层迷你 React，能验证「偏好实时作用于行 / 换调用复用实例」这类带生命周期的行为）；界面上让 AI 改任意一个文件，展开「编辑」行后每个文件块应是带语法高亮的卡片、`+A -B` 与路径链接正常，且统计与 ± 视图只报真正变化的行数；在设置 → 「文件修改卡片」里改一次偏好，`settings.yaml` 应立即出现本插件分节。

**一键 AI 安装**：把下面这段发给你的 DSH AI 即可：

```text
帮我安装文件修改查看器插件（monorepo Yinxe/deepseek-harness-plugins，子目录 plugins/file-change-viewer，包名 @dshp/file-change-viewer）：
1. git clone monorepo 并 pnpm install
2. dsh plugin --profile web add ./plugins/file-change-viewer
3. dsh web 重启，然后改一个文件，确认 edit / write 卡片默认就是展开的、代码有语法高亮
4. 如果这个会话里还有动态注册的同名插件（cordis_define 定义的，@ 引用能列出），用 cordis_undefine 卸掉，避免两份注册互相顶替
```

### 方式二：从 Release 安装（无需 clone；更新需手动重跑命令）

latest 滚动版（跟随 main 最新构建；滚动更新 = 重跑同一条 add 命令）：

```bash
dsh plugin --profile web add \
  https://github.com/Yinxe/deepseek-harness-plugins/releases/download/latest/dshp-file-change-viewer-latest.tgz

dsh web   # 重启生效
```

### 历史版本（兼容旧版 DSH）

main 永远跟随最新 DSH。老版本 DSH 用户装**静态历史版本**：按 `compat.json` 记录的兼容 tag，到 [Releases](https://github.com/Yinxe/deepseek-harness-plugins/releases) 找对应版本 Release，资产名 = `dshp-file-change-viewer-<tag>.tgz`：

```bash
dsh plugin --profile web add \
  https://github.com/Yinxe/deepseek-harness-plugins/releases/download/<tag>/dshp-file-change-viewer-<tag>.tgz

dsh web   # 重启生效
```

## 更新

### 三种安装方式对应的更新方式

| 安装方式             | 更新命令                                                               | 说明                                                      |
| -------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------- |
| 方式一 clone（推荐） | 仓库内 `git pull` + `dsh web`                                          | 最快；未改 src 免 build；旧版 DSH 用 `git checkout <tag>` |
| 方式二 Release       | 重跑同一条 `add` 命令 + `dsh web`                                      | URL 直装对 `update` 免疫                                  |
| 方式三 git 依赖      | `dsh plugin --profile web update @dshp/file-change-viewer` + `dsh web` | 一条命令；git 解析约 35s/插件（实测）                     |

## 功能

| 部分                                          | 内容                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Host（`src/host/` → `lib/host.js`）**       | `name` / `inject: ['webServer']` / `apply`：① `installSection` 本插件的 settings 命名空间（两条偏好的权威存储 + schema 校验 + base 层补丁）；② 两条同源路由 `/ext/dshp-file-change-viewer/{state,config}` 供设置节读写；③ `patch` 工具（`ctx.inject(['tools','fs'])` 才注册，缺任一个只是少个工具）。没有工具、没有事件；这一行同时是 DSH **从 Host Loader 的条目里扫描 `dsh.client` 声明**来发现并下发客户端 bundle 的入口——没有它，`lib/client.js` 不会被加载（详见 `src/host/index.ts` 头注释）。                                                                                                                                                                                                                                                              |
| **Client（`src/client/` → `lib/client.js`）** | 用 `priority: -1` 注册 `tool.call.toolview` 的 `edit` / `write` / `str_replace_editor` 三个 key（影子化官方内置行；同 key 同 priority 会抛错，所以必须比内置的 `0` 更小），带 `locale: 'conversation'` 取文案；行外壳用官方 `DisclosureRow` **默认样式**（不自造卡片），展开后每个 hunk 一个自己的折叠块，块内是**纯高亮代码**（官方 `CodeBlock` 去掉语言栏/复制/外壳）；`diff.ts` 推导模型与 LCS 统一 diff，`lang.ts` 映射 26 个官方语法 id，行内没内容时给等待 / 截断兜底文案；`diff.ts` 把每个 hunk 跑一次 LCS（`raw` / `rows` / `changed` 三种口径），统计与 ± 视图都用语义变更；`prefs.ts` 管全局偏好的读写往返与订阅（设置节与工具行共用同一个 store），`FileChangeViewerSection.ts` 是设置 → 「文件修改卡片」这一节的内容，`api.ts` 封装两条 `/ext` 路由。 |
| **同源路由**                                  | `GET /ext/dshp-file-change-viewer/state`（当前生效偏好）/ `POST …/config`（保存补丁 → `settings.update`）/ `POST …/locate`（真实行号定位，只回整数、不回文件内容）。业务错误一律 200 + `ok:false`，跨站 / 方法错误 4xx。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| **工具**                                      | 注册一个 `patch` 工具（unified diff，一次可改多处 / 多文件，全有或全无）：经 `ctx.fs` 读写，吃沙箱模式与观察策略，结果元数据带 `diffs` 交给卡片渲染。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |

### 行与文件块行为

| 场景                           | 表现                                                                                                                                                          |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 行的默认状态                   | 渲染那一刻的偏好：默认**折叠**（与思考 / 读取行一致），打开「编辑 / 写入默认展开」后新渲染的行直接展开；点行任意处或 Enter / Space 可随时切换（临时，不写回） |
| `write` 新建文件               | 整份内容绿底 + 高亮，行头统计显示 `+N -0`                                                                                                                     |
| `write` 覆盖已有文件           | 用结果元数据的真实 hunk（含 3 行上下文）                                                                                                                      |
| `edit` 改文件                  | 一个代码块内交错：红底旧行（不占行号）、绿底新行、上下文行不染色，全部带语法高亮；`replace_all` 在行头提示                                                    |
| 调用进行中（参数已完整）       | 行头先按参数给出预览                                                                                                                                          |
| 调用进行中（参数还在流式生成） | 宽容解析半截 JSON，逐帧显示正在写入的内容                                                                                                                     |
| 调用失败（未落盘）             | summary 位只显示首行错误（红字），不显示路径与统计                                                                                                            |
| 窗口截断（读不到调用参数）     | summary 位显示「参数不可用」；参数能解析时交给官方 `JsonBlock`（自带截断），否则原样打印并截断 4000 字符                                                      |
| 点击文件路径                   | 打开该文件（`openFile`）；路径按工作区相对化，POSIX home 显示为 `~`                                                                                           |
| 每个文件块                     | 自己一条原生折叠行（路径 + 该块统计），默认开合跟随用户偏好（单独点过的块由用户说了算），可临时点开 / 收起                                                    |
| `patch` 调用                   | 与 `edit` / `write` 完全同一张卡片：标题「补丁」，多文件各占一张卡；流式生成时先用参数里的 patch 文本预览                                                     |
| 高亮视图超过 400 行            | 只渲染前 400 行，下面一行提示剩余行数并指引切到 ± 差异视图（`CodeBlock` 没有 `maxLines`）                                                                     |
| ± 差异视图超过 200 行          | 由 `DiffBlock` 中部折叠接管，给出「… 其余 N 行」就地展开按钮                                                                                                  |

### 与内置行的差异（刻意的）

| 维度         | 内置 `file-mutation-toolview`       | 本插件                                                                                                                                                                                     |
| ------------ | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 展开态       | 默认收起                            | 默认收起；可在设置里把**编辑 / 写入**改成默认展开（只影响之后新渲染的行）                                                                                                                  |
| 展开后的内容 | 摘要 + `-`/`+` 文字色的 `DiffBlock` | **语法高亮 + 整行红绿 + 行号**，每个文件块可独立折叠                                                                                                                                       |
| 代码块外壳   | 无（裸 `DiffBlock`）                | **一张自制代码卡片**：卡头是「类型图标 + 文件名 + 统计 + 逐块控件」，官方那个语言栏（含复制）隐藏，卡内是插件自己的盒子（不套两层）；代价是高亮视图没有复制入口，要复制补丁就切到 `± 差异` |
| 统计         | 灰色 `+A -B`，按工具**原文**行数    | **绿增红删**，按 LCS 后的**语义变更**行数（一次单行替换就是 `+1 -1`，不是原文的 `+7 -7`）                                                                                                  |
| 进行中的调用 | 只显示一行摘要                      | 实时显示正在写入 / 将要写入的内容                                                                                                                                                          |
| 行外壳       | 官方 `ToolRow`（含 output 等分区）  | 官方 `DisclosureRow` 默认样式 + 那几条工具专属样式                                                                                                                                         |

## 配置项

两项**全局显示偏好**，落 `settings.yaml` 的 `dshp-file-change-viewer` 分节，界面入口是
**设置 → 左侧导航「文件修改卡片」**（`settings.section`，id = 该命名空间）：

| 偏好           | 控件       | 默认        | 说明                                                                                                                                                                                                                                                                                |
| -------------- | ---------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `view`         | 下拉选择框 | `highlight` | `highlight` = 单代码块统一 diff（整行红绿 + 行号 + shiki 高亮）；`diff` = 逐行 ± 视图                                                                                                                                                                                               |
| `sectionsOpen` | 开关       | `false`     | **新渲染的「编辑 / 写入」操作是否默认展开**（开 = 直接看到改动，行内文件块也默认展开；关 = 与思考 / 读取行一致，点一下才展开）。键名是历史遗留，含义已收敛为「这一行要不要默认展开」；只作用于**新渲染**的行，且只作用于本插件接管的编辑 / 写入行，`bash` / `read` 等其它行不受影响 |

```yaml
# settings.yaml（只认这一个 NS；改完热重载，无需重启）
dshp-file-change-viewer:
  view: highlight # highlight | diff
  sectionsOpen: false # 新渲染的编辑 / 写入行是否默认展开
```

> **设置节的读写为什么不走客户端 `settingsScope`**：官方 `settingsScope.bind({ namespace })` 也能读写同一分节，
> 但它要求 Host 已注册命名空间、浏览器侧服务已挂载、写操作按 revision 设栅；任一环时序不对（服务晚挂载、
> 页面非 loopback）就会**静默退化成只读默认值**——症状正是「下拉和开关点了没反应、`settings.yaml` 里也没有分节」。
> 本仓既有插件（mcwiki-search / vision-bridge / token-meter）统一走「自有 `/ext` 路由 → Host `settings.update`」：
> 写的是同一份文件，但少一层时序依赖。设置节与工具行共用同一个客户端 store（`src/client/prefs.ts`），
> 读走 `state`、写走 `config`；写是乐观的，失败一定回滚并报错，绝不假装保存成功。
> `scripts/check-host.mjs` 守着「NS = cordis 行 id + 真的 installSection + 非法补丁不落库」，
> `scripts/check-client.mjs` 守着「注册了 `settings.section` 且 id / order 正确 + 点控件真的 POST 出去 + 失败会回滚」。

几个刻意的内置常量（UI 几何常量，不是部署配置，改完需要重新 build）：

| 常量                            | 位置                          | 值 / 来源                                     | 含义                                                                           |
| ------------------------------- | ----------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------ |
| `DEFAULT_CONFIG`                | `src/host/config.ts`          | 与 schema 默认同值                            | 出厂默认（`highlight` / `sectionsOpen: false` = 保持原生折叠）                 |
| `HIGHLIGHT_MAX_LINES`           | `src/client/FileChangeRow.ts` | `400`                                         | 高亮视图单块渲染上限（`CodeBlock` 没有 `maxLines`）                            |
| `DIFF_MAX_LINES`                | `src/client/FileChangeRow.ts` | `200`                                         | ± 差异视图交给 `DiffBlock` 的展开上限                                          |
| `RAW_MAX_CHARS`                 | `src/client/FileChangeRow.ts` | `4000`                                        | 原始参数兜底展示的截断长度                                                     |
| `LANG_BY_EXTENSION`             | `src/client/lang.ts`          | 26 个官方语法 id                              | 扩展名 → 语法 id；不在表里的扩展名退化成纯文本                                 |
| `--fcv-del-bg` / `--fcv-add-bg` | `src/client/styles.ts`        | 官方 danger / success 填充                    | 删 / 增行的**整行底色**（动态规则只引用这两个变量）                            |
| 图标                            | primitives                    | `FileTypeIcon` / `IconPlusOutline16` …        | 文件类型、增删、视图切换各用官方图标；官方图标集没有减号，减号用一图元内联 SVG |
| `TOOL_KEYS` / `SHADOW_PRIORITY` | `src/client/index.ts`         | `edit` / `write` / `str_replace_editor`，`-1` | 接管哪些工具行、影子化优先级                                                   |

不建自有配置文件、不碰任何用户数据；**唯一的写入是 `settings.yaml` 的 `dshp-file-change-viewer` 分节**（经官方 `settings.update`，AGENT.md §7 / §11）。

## 代码结构

```
plugins/file-change-viewer/
├── cordis.patch.yml             # bundle 层 patch：只 insert 一行挂载（id = dshp-file-change-viewer）
├── package.json                 # 包描述 + DSH bundle 声明（dsh.bundle.patch / dsh.client.platform）
├── src/host/index.ts            # Host 半：name / inject ['webServer'] / apply（settings 命名空间 + 两条路由 + bundle 入口）
├── src/host/config.ts           # Host 配置：NS / ConfigSchema / 默认值 / 补丁消毒
├── src/host/routes.ts           # /ext 三条路由：state / config（偏好）+ locate（真实行号）
├── src/host/http.ts             # 路由小工具：json / sameOrigin / readBody
├── src/host/patch-tool.ts       # patch 工具：unified diff → ctx.fs（全有或全无 + 差异元数据）
├── src/host/types.ts            # Host 半类型（PluginConfig / PluginConfigPatch / AnyCtx）
├── src/shared/patch.ts          # unified diff 解析 / 应用（纯函数，Host 与 Client 两份产物共用）
├── src/client/index.ts          # Client 入口：__ModuleLoader__ + 样式注入 + 槽位注册（设置节 + 3 个工具 key）
├── src/client/FileChangeRow.ts  # 工具行：原生 DisclosureRow + 每文件块折叠 + 高亮视图（行区间底色）/ ± 视图
├── src/client/FileChangeViewerSection.ts # 设置 → 「文件修改卡片」一节（展示方式下拉 + 默认展开开关）
├── src/client/prefs.ts          # 偏好：客户端 store（订阅 + 乐观写 + 失败回滚）↔ /ext 路由
├── src/client/api.ts            # /ext 路由封装（fetchState / saveConfig）
├── src/client/locate.ts         # 真实行号：批量问 Host + 缓存 + 订阅（定位不到就回 1 起）
├── src/client/diff.ts           # 变更推导（纯函数：meta.diffs / 半截参数 JSON / LCS 统一 diff / 路径显示）
├── src/client/lang.ts           # 扩展名 → 官方语法 id（镜像 DSH 高亮别名表，26 个语言）
├── src/client/styles.ts         # 样式（前缀 fcv-：镜像官方行内样式 + 差异底色 + 设置节版式）
├── src/client/types.ts          # Client 半类型（与官方 RunningToolCall / ToolResultNode / CodeBlock 契约对齐）
├── scripts/check-host.mjs       # Host 冒烟测试：installSection + /ext 两条路由 + patch 工具落盘
├── scripts/check-patch.mjs      # patch 纯函数测试：解析 / 应用 / 各种失败姿势
├── scripts/check-client.mjs     # Client 冒烟测试：加载 lib/client.js，断言注册结果与渲染树
└── lib/{host,client}.js         # 单文件构建产物（已提交，DSH git 安装必需）
```

## 常见问题

- **装完了但行没变化**：先硬刷新浏览器（client 半是页面脚本）；再确认 profile 的 `dsh.profile.bundles` 里有 `@dshp/file-change-viewer`；最后看 `dsh web` 日志有没有 `[dshp-file-change-viewer]` 的报错行。
- **编辑行默认是折叠的，我要一眼看到**：到 **设置 → 文件修改卡片** 打开「编辑 / 写入默认展开」即可；之后新渲染的编辑 / 写入行会直接展开显示改动（已经在会话里的行保持原样，滚动重挂 / 新调用才采用新值）。
- **偏好设置在哪**：**设置 → 左侧导航「文件修改卡片」**（本插件自己的一节：展示方式用下拉选择框，编辑 / 写入默认展开用开关；改完立即写入 `settings.yaml` 的 `dshp-file-change-viewer` 分节）。
- **设置里看不到「文件修改卡片」这一节**：这一节由客户端半注册（`settings.section`），先**硬刷新页面**（client 半是页面脚本）。若节在、但一改就显示「未保存」+ 红字，那是 Host 半没挂载：`dsh web` 没重启时 `lib/host.js` 还是旧的、没有 `/ext` 路由（探一下就知道：`curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3080/ext/dshp-file-change-viewer/state`，404 = 没重启）。改完 Host 半**必须重启** `dsh web`（只改 client 半强刷即可）。两条护栏：`scripts/check-host.mjs`（NS = 行 id + 真的 installSection + 路由真的写库 + 非法补丁不落库）、`scripts/check-client.mjs`（设置节的 id / order + 点控件真的 POST + 保存失败会回滚）。
- **为什么统计不是内置行那种 `+7 -7`（只改了一行却报 7 行）**：`edit` 写进 `meta.diffs` 的 `oldText` / `newText` 是模型这次给的 `old_string` / `new_string` **原文**——为了让 `old_string` 在文件里唯一，模型通常会把上下几行一起圈进来。官方 `diffTotals` 与官方 `DiffBlock` 都按这份原文算，于是「只改一行」被报成 `+7 -7`，± 视图里看起来像整段删、整段加。本插件对每个 hunk 跑一次 LCS，然后**三个地方统一用它的结果**：行头 / 卡头统计、高亮视图、± 差异视图（喂给 `DiffBlock` 的也是只含变化行的 hunk），所以三处永远说同一件事。想要原文口径的话，切到内置行即可（`dsh plugin --profile web remove`）。
- **打开「编辑 / 写入默认展开」后，老的行还是折叠的？**：这是**有意的**——这项偏好只决定「**新渲染**的编辑 / 写入操作长什么样」，不会回头去改已经渲染出来的行（否则你正在读的 diff 会被开关抽走）。新调用、或列表滚动重挂后采用新值。
- **同一个会话里为什么有的行展开、有的折叠**：行的开合状态跟它「渲染那一刻的偏好 + 之后用户自己的临时点开 / 收起」走，所以改过偏好之后新出现的行与之前的行看起来会不一样。另外，临时覆盖绑定在 `callId` 上——宿主用 `react.memo(ToolCall)` 且列表没有显式 key，会在同一位置复用组件实例渲染另一次调用，早期版本因此把上一行「我手动折叠过第 0 块」漏给了新行。
- **卡片头为什么只有文件名和增删，没有复制**：卡头是插件按官方 banner 版式自绘的一行（文件名 + 统计 + 该块控件），官方代码块自带的语言标签栏与复制按钮用 `[data-code-block-banner]` 隐藏。代价是**高亮方式没有复制入口**——要复制带 `-`/`+` 的 patch 请把该块切到 `± 差异`（`DiffBlock` 自带复制）。
- **单块能不能不听全局设置**：能。卡头的「高亮 / ± 差异」与折叠箭头都是**该块自己的**临时状态（不写回偏好，切走即回全局默认）；想让某一块默认就是另一种方式，请改全局默认（设置 → 插件）。
- **某个文件没有高亮**：DSH 的高亮器（shiki）只打包了 26 个语言的语法；官方没有 `.vue` / `.svelte` / `.diff` / `.txt` 这些，本插件对它们传「无语言」，`CodeBlock` 会渲染成正常颜色的纯文本（**不会**硬塞一个近似的语言，那只会给你看错误的着色）。语言清单见 `src/client/lang.ts`。
- **高亮视图的增删为什么是「一个代码块里交错」**：先用 LCS 把每个 hunk 的旧/新文本算成真正的统一 diff（未变行只出现一次），再把这些行**原样**喂给官方 `CodeBlock`，并在自己的类作用域内按行区间给删/增行上整行底色。代码一个字符都没改，所以高亮与缩进就是原文的样子。
- **整行红绿底色是怎么来的**：官方 `CodeBlock` 没有「按行上色」接口，但它在行号模式下把每行渲染成块级 `code > .line`。本插件按行号区间生成规则（连续同类行并成一个区间选择器，一个 hunk 通常 2–4 条），颜色引用 `--fcv-del-bg` / `--fcv-add-bg`（官方 danger / success 填充）。所以**行号模式必须开**——关掉后 `.line` 变回行内元素，底色盖不满整行。
- **行号是文件里的真实行号吗**：是。官方代码块的行号由 CSS 计数器给出、默认从 1 数起（`counter-reset:source-line` 挂在 `code` 上），本插件在这一块自己的类名下标一次（特异性更高）：`counter-reset:source-line <起始行号 - 1>`，于是首行编号就是它在文件里的真实行号；删除行照旧不占号、不推进计数器。起始行号有三个来源，按可靠度取：① 本插件 `patch` 工具的 `@@ -a,b +c,d @@` 头（确切）；② edit / write 的元数据里**没有**偏移（官方 `computeHunkDiffs` 只给 `{path, oldText, newText}`），于是向 Host 的 `/ext/dshp-file-change-viewer/locate` 问一次——Host 拿文件当前内容定位这段 hunk 的首行，**响应里只有整数、不回文件内容**，结果按 `path + newText` 缓存；③ 定位不到（文件之后又被改过）就老老实实从 1 开始，不编一个错的数字。行头的路径链接也会带上这个行号，点开直接落在改动处。
- **上游改版会不会把样式改坏**：两处依赖官方的 DOM 约定——行底色用 `code > .line`（未哈希固定类名）、去外壳用 `[data-code-block-banner]` 与 `pre`。任一处改名/改结构，后果都只是**装饰性降级**（底色或"无外壳"失效，代码、行号、语法高亮照常），`± 差异` 视图完全不依赖它们。行内样式里那几条 ToolRow 专属样式（分隔点、路径链接、统计、Inspect 药丸）是逐条镜像的，升级后对照上游同名文件同步即可。
- **同一行出现两份 / 互相顶替**：这个会话里可能还有一份**动态注册**的同名插件（`cordis_define` 定义的进程内扩展，`@` 引用能列出）。两者都用 `priority: -1` 抢同一个 key，**同 key 同优先级会直接抛错**，日志里会出现 `keyed slot "tool.call.toolview" already has an entry for key "edit" … register at a different priority to shadow it`，其中一份注册被跳过（页面不会坏）。装标准包后请把动态版 `cordis_undefine` 掉。
- **改了设置节的样式，结果「编辑 / 写入」行也被改了（改代码的人必读）**：`styles.ts` 里的规则是**全局作用域**，而工具行元素上的类名是 `FileChangeRow.ts` 用字符串传下去的（`className: 'fcv-rowRoot'` / `rowClassName: 'fcv-toolRow'` / 卡头 `'fcv-cardRow'`）。两套版式一旦类名重名，设置节的布局就会打到工具行上——曾经设置节的 `.fcv-row{padding:16px 0}` 把编辑 / 写入行撑高 32px 还加了一条底边线。约定：工具行用 `fcv-toolRow` / `fcv-rowRoot` / `fcv-card*`，设置节用 `fcv-setting*` / `fcv-section*` / `fcv-page`；`scripts/check-client.mjs` 有一条断言扫「工具行整棵子树的类名 ∩ 设置节版式类名 = ∅」。
- **为什么要 `priority: -1`（改代码的人必读）**：keyed 槽位派发是「按 priority 升序取每个 key 的第一条」，官方内置行占着 `0`，所以接管必须用**比 0 更小**的值；同 key 同 priority 不是覆盖而是抛错。这条有断言守着。
- **只有 `edit` / `write` 变了，`bash` 里的文件改动没变**：本插件只接管这两个（以及兼容项 `str_replace_editor`）。用 shell 重定向改文件属于 `bash` 行，不在范围内。**读取（`read`）/ `read_image` / 其它工具行完全没被注册、也没被改样式**（可用 `Slots.listSubTree` 查 `tool.call.toolview` 的占用者核对）。
- **某个工具的行突然显示「原始参数」/「参数不可用」**：说明这次调用的 `meta.diffs` 为空且参数推导不出变更（例如窗口截断把调用头切掉了）。这是兜底路径：能解析成对象就交给官方 `JsonBlock`，否则原样打印并截断。
- **想回到内置行**：`dsh plugin --profile web remove "@dshp/file-change-viewer"` + `dsh web`；偏好存在 `settings.yaml` 的 `dshp-file-change-viewer` 分节，删掉该分节即回默认值。

## 卸载

```sh
dsh plugin --profile web remove "@dshp/file-change-viewer"
dsh web
```

`remove` 会自动从 `dsh.profile.bundles` 撤下挂载（monorepo 本体不用删）。本插件不建自有文件、不缓存任何数据；唯一的落盘是 `settings.yaml` 的 `dshp-file-change-viewer` 分节，卸载后该分节可自行删除。

## 移植说明

> **动态版 → Monorepo + TS 标准包**：本目录是 `deepseek-harness-plugins` monorepo 的标准子项目（`plugins/file-change-viewer`），由一次动态会话里用 `cordis_define` 创建的 client-only package（`filech-1/pkg-1`）等价重写而来。
>
> - **Host**：动态版没有 Host 半（只有 client）；标准包必须有一条 Host Loader 条目（`cordis.patch.yml` 的 insert + `lib/host.js`），因为 DSH 是从 Host Loader 的条目里扫描 `dsh.client` 声明来发现客户端 bundle 的。因此 `src/host/index.ts` 是**有意的极简**：`name` / `inject: []` / 一行就绪日志。
> - **Client**：动态版的单文件 JS → `src/client/{types,diff,styles,FileChangeRow,index}.ts`，tsup 打包为单文件 `lib/client.js`（IIFE，内含 `__ModuleLoader__.load`，react/primitives 运行时注入不打包）。
> - **五处实质性升级**：
>   1. diff 渲染从「手写 LCS 行级 diff + 自绘 DOM」换成官方组件：高亮方式把 LCS 统一 diff（未变行只出现一次、增删交错、代码原样）交给官方 `CodeBlock`，再借行号模式的块级 `.line` 按行区间叠整行红/绿底色并让删除行不占行号；可切到 `DiffBlock` 的逐行 ± 视图；
>   2. 颜色从写死的 `rgba(248,81,73,.10)` 换成官方 token（`--dsw-alias-*` / `--shiki-token-*`）；
>   3. **必须显式传 `priority: -1`**：动态注册走 Guard 的 `allocatePriority()`，静态插件没有这层保护，用默认优先级注册会直接抛错（症状是「装上了但界面毫无变化」）；
>   4. 行从「自造卡片」收敛成**原生行**：外壳改用官方 `DisclosureRow` 默认样式，工具专属样式逐条镜像；只在展开体里放差异，并把代码块的语言栏/复制/外壳也去掉，只留纯高亮代码；
>   5. 新增**全局偏好**（展示方式下拉 + 编辑 / 写入是否默认展开），注册成设置里**独立的一节**（`settings.section`「文件修改卡片」），读写走自有 `/ext` 路由 → Host `settings.update`，落 `settings.yaml` 的 NS 分节；不再有行内切换按钮，也不占用「插件」tab。默认展开只影响**新渲染**的行。
> - **新增验证**：动态版只能靠肉眼看；标准包把它变成可执行断言——`scripts/check-client.mjs` 直接加载构建产物，用 stub React/primitives（`useState` 带状态，所以能「点一下再渲染」）跑组件函数并遍历元素树，覆盖 loader 契约、三个工具 key 与设置节的注册（id / order）、影子优先级、设置节控件的读写往返（含读回 Host 权威值、保存失败回滚 + 报错）、「偏好只影响新渲染的行」、换 `callId` 后临时覆盖不泄漏、类名撞车护卫（工具行整棵子树的类名 ∩ 设置节版式 = ∅）、行底色的语义统计（真实案例：一次单行替换必须是 `+1 -1` 而不是原文的 `+7 -7`）、区间选择器（含删行不占号）、去代码块外壳的样式、以及 `meta.diffs` / 半截 JSON / 失败 / 截断四条推导路径。

> 构建：`pnpm --filter @dshp/file-change-viewer build`（tsup）→ `lib/host.js` + `lib/client.js`；包入口 `lib/host.js`，`./client` → `lib/client.js`。`lib/` 已提交（DSH `add github:` 直接从 git 安装，不跑 build，必须带构建产物）。

## 免责声明

- 本插件只改变工具调用在**界面上的渲染方式**，不修改任何文件内容、不干预模型行为；文件改动的正确性仍由官方 `edit` / `write` 工具与你的沙箱策略负责。
- 不联网、不上传；唯一的落盘是 `settings.yaml` 的 `dshp-file-change-viewer` 分节（经官方 settings 服务写入）。
- 它接管了官方内置卡片的渲染。如果 DSH 上游改了 `DiffBlock` / `DisclosureRow` / `CodeBlock` 的 props 契约、或高亮别名表（`lang.ts` 镜像的那张），卡片可能渲染异常或高亮失效；如果改了代码块 `code > .line` 的结构，删/增行的整行底色会消失（其余照常）。以上情况卸载本插件即恢复内置卡片。
