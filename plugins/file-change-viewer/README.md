# @dshp/file-change-viewer

DeepSeek Harness（DSH）**文件修改查看器**：接管对话流里的 `edit` / `write` 工具卡片，让它们**默认展开**——每一次文件改动直接铺开，**代码按文件语言语法高亮**（shiki，随主题切换），配上文件路径、`+A -B` 行数统计与一键打开文件；调用还在进行时，也能看到正在写入的内容。

内置的文件修改卡片是**默认折叠**的：DSH 用 `DisclosureRow` 承载折叠语义，折叠态下 `DiffBlock` 根本不挂载，所以「用 CSS 把卡片撑开」这条路走不通。本插件按官方扩展点注册 `tool.call.toolview` 的同名 key（官方文档：_a key the shipped composition already covers is replaced, not shared_），用**同一批官方 primitives** 重新组装这张卡片，语义差异就三条：`open = true`（默认展开）、进行中的调用也能看到内容、默认用高亮视图。

> 设计原则：**只改渲染，不碰数据**。不注册工具、不写配置、不发请求、不改任何文件——内容全部来自官方 `dsh-tool-fs` 已经在工具结果里给出的 `meta.diffs` 与调用参数，配色全部来自官方 token（`--dsw-alias-*` / `--shiki-token-*`），停止插件即恢复内置卡片。

## 两种视图

卡片头部右上角的切换按钮在两种视图之间切换（每张卡片各自记忆，默认高亮）：

| 视图             | 组件             | 形态                                                                                                                                                                                                            |
| ---------------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **高亮**（默认） | 官方 `CodeBlock` | **一个代码块 + 行号列 + 整行红/绿底色 + 语法高亮**：未变的上下文行只出现一次，删除行（红底，**不占行号**）、新增行（绿底）与上下文交错排列；**代码原样，不带 `-` / `+` 标记**（增删靠底色表达），行号按新文件计 |
| **± 差异**       | 官方 `DiffBlock` | 逐行 `-`/`+` 红绿文字的合并 diff（紧凑），超长中部折叠，自带复制按钮                                                                                                                                            |

高亮视图怎么同时拿到「整行底色」和「真高亮」：

1. `diff.ts` 先把每个 hunk 的旧/新文本用 LCS 算成**真正的统一 diff**（未变行只出现一次，增删交错）；
2. 这些行**原样**拼成一段代码交给官方 `CodeBlock`（刻意不加 `-` / `+` 行首标记：底色已经说明增删，标记是噪声，去掉后高亮器拿到的是原始代码、缩进也零偏移）；
3. 官方 `CodeBlock` 在**行号模式**下会把每行渲染成块级的 `code > .line`（行号是绝对定位的 `:before` + CSS 计数器），于是本插件按行号区间生成规则（`.fcv-lines-<卡片>-<hunk> code > .line:nth-child(...)`）：删/增行上整行底色，**删除行额外把计数器停掉并清空自己的号位**（`counter-increment:none` + `:before{content:""}`）。颜色只用官方 token（`--fcv-del-bg` / `--fcv-add-bg` 两个局部变量，指向官方 danger / success 填充）。
4. 于是行号取的是**新文件视角**：上下文行与新增行依次占号，删除行留空不占号——新文件的行号是连续的，不会被已删除的行顶掉（与 GitHub 统一 diff 的「新列」一致）。

两点如实说明：

- **行号是「块内第几行」，不是文件真实行号**：工具元数据只有 `{path, oldText, newText}`，**没有行偏移**，真实行号拿不到（编号由官方代码块的 CSS 计数器给出）。要绝对行号得先让上游把 hunk 偏移放进 `meta.diffs`。
- **有一处对官方 DOM 的依赖**：行底色规则依赖 `code > .line` 这个结构（`line` 是官方**未哈希**的类名，行号模式让它是块级元素）。上游若改结构，**后果只是底色消失**——代码块、行号、语法高亮、复制都照常，不会报错；`± 差异` 视图完全不依赖它。

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

**验证**：`pnpm --filter @dshp/file-change-viewer test` 会跑 `node --check` 两份产物 + 无头渲染断言（`scripts/check-client.mjs`，74 项）；界面上让 AI 改任意一个文件，卡片应是**展开**的、带语法高亮、`+A -B` 与路径链接。

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

| 部分                                          | 内容                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Host（`src/host/` → `lib/host.js`）**       | 只有 `name` / `inject` / `apply`：无 service 依赖、无工具、无路由、无 settings。存在的原因是 DSH **从 Host Loader 的条目里扫描 `dsh.client` 声明**来发现并下发客户端 bundle——没有这一行，`lib/client.js` 不会被加载（详见 `src/host/index.ts` 头注释）。                                                                                                                                                                                                                                                                                                                         |
| **Client（`src/client/` → `lib/client.js`）** | 用 `priority: -1` 注册 `tool.call.toolview` 的 `edit` / `write` / `str_replace_editor` 三个 key（影子化官方内置卡片；同 key 同 priority 会抛错，所以必须比内置的 `0` 更小），带 `locale: 'conversation'` 取文案，用 `DisclosureRow` 组一张**默认展开**的卡片：主体默认是官方 `CodeBlock` 的语法高亮视图（一个代码块里放 LCS 统一 diff），可切到 `DiffBlock` 的逐行 ± 红绿视图；`diff.ts` 把「结果元数据的 `meta.diffs`」与「流式生成中的半截参数 JSON」推导成同一个模型并算出统一 diff，`lang.ts` 把扩展名映射到官方打包了语法的 26 个语言 id；样式只用官方 token，前缀 `fcv-`。 |
| **同源路由**                                  | 无（不读写任何用户数据，天然没有路由）。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| **工具**                                      | 无（不新增模型工具；本插件只改变已有工具调用的**渲染**）。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |

### 卡片行为

| 场景                         | 表现                                                                                                                         |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `write` 新建文件             | 整份内容按绿底列出并高亮，角标「新文件」                                                                                     |
| `write` 覆盖已有文件         | 用结果元数据的真实 hunk（含 3 行上下文），角标「已应用」                                                                     |
| `edit` 改文件                | 同一代码块内交错：红底旧行（不占行号）、绿底新行、上下文行不染色，全部带语法高亮；`replace_all: true` 时额外提示「全部替换」 |
| 调用进行中，参数已完整       | 角标「待应用」，先按参数预览将要写入的内容                                                                                   |
| 调用进行中，参数还在流式生成 | 角标「生成中」，宽容解析半截 JSON，逐帧显示正在写入的内容                                                                    |
| 调用失败（未落盘）           | 红字错误行 + 参数推导出的变更，角标「未应用」                                                                                |
| 窗口截断（读不到调用参数）   | 能解析就交给官方 `JsonBlock` 展示原始参数并截断，解析不了就原样打印（截断 4000 字符）                                        |
| 点击文件路径                 | 打开该文件（`openFile`）；路径按工作区相对化，POSIX home 显示为 `~`                                                          |
| 点击头部 / Enter / Space     | 手动折叠或展开（默认展开，但用户随时可以收起）                                                                               |
| 点击 `± 差异` / `高亮`       | 在高亮视图与逐行 ± 差异视图之间切换（每张卡片各自记忆）                                                                      |
| 高亮视图超过 400 行          | 只渲染前 400 行，下面一行提示剩余行数并指引切到 ± 差异视图（`CodeBlock` 没有 `maxLines`）                                    |
| ± 差异视图超过 200 行        | 由 `DiffBlock` 中部折叠接管，给出「… 其余 N 行」就地展开按钮                                                                 |

### 与内置卡片的差异（刻意的）

| 维度         | 内置 `file-mutation-toolview`         | 本插件                                        |
| ------------ | ------------------------------------- | --------------------------------------------- |
| 展开态       | 默认收起                              | **默认展开**                                  |
| 代码着色     | 无（`DiffBlock` 只有 `-`/`+` 文字色） | **官方 shiki 语法高亮 + 整行红绿底色 + 行号** |
| 进行中的调用 | 只显示一行摘要                        | 实时显示正在写入 / 将要写入的内容             |
| 失败的调用   | 只显示错误行                          | 错误行 + 参数推导出的变更（角标「未应用」）   |
| 卡片内容     | ToolRow（还承载 output / 原始参数等） | 只有变更（这张卡片服务的工具只产出 diff）     |
| 视图         | 固定一种                              | 高亮 / ± 差异两种视图可切                     |

其余一律对齐：两个视图都用官方组件渲染（`CodeBlock` / `DiffBlock`，各自自带复制按钮）、折叠语义交给 `DisclosureRow`（`aria-expanded` / 键盘可达）、配色全部走官方 token。

## 配置项

**本插件没有配置项**，也不需要设置页：它只有一个行为——「别折叠，并且把代码说清楚」。每多一个配置项就多一份文档、一个控件、一处校验，而这里没有用户真的会改的东西（想临时收起某张卡片，点卡片头部即可）。

几个刻意的内置常量（属于 UI 几何常量，不是部署配置，改完需要重新 build）：

| 常量                            | 位置                          | 值                                      | 含义                                                        |
| ------------------------------- | ----------------------------- | --------------------------------------- | ----------------------------------------------------------- |
| `DEFAULT_VIEW`                  | `src/client/FileChangeRow.ts` | `'highlight'`                           | 默认视图；改成 `'diff'` 即默认逐行 ±、高亮靠点击            |
| `HIGHLIGHT_MAX_LINES`           | `src/client/FileChangeRow.ts` | `400`                                   | 高亮视图单块渲染上限（`CodeBlock` 没有 `maxLines`）         |
| `DIFF_MAX_LINES`                | `src/client/FileChangeRow.ts` | `200`                                   | ± 差异视图交给 `DiffBlock` 的展开上限（超出它自己折叠中部） |
| `RAW_MAX_CHARS`                 | `src/client/FileChangeRow.ts` | `4000`                                  | 原始参数兜底展示的截断长度                                  |
| `LANG_BY_EXTENSION`             | `src/client/lang.ts`          | 26 个官方语法 id                        | 扩展名 → 语法 id；不在表里的扩展名退化成纯文本              |
| `--fcv-del-bg` / `--fcv-add-bg` | `src/client/styles.ts`        | 官方 danger / success 填充              | 高亮视图删/增行的**整行底色**（动态规则只引用这两个变量）   |
| `TOOL_KEYS`                     | `src/client/index.ts`         | `edit` / `write` / `str_replace_editor` | 接管哪些工具卡片                                            |
| `SHADOW_PRIORITY`               | `src/client/index.ts`         | `-1`                                    | 影子化内置卡片所需优先级（必须小于内置的 `0`）              |

不写 `settings.yaml`、不建自有配置文件、不碰任何用户数据（AGENT.md §7.3 / §11）。

## 代码结构

```
plugins/file-change-viewer/
├── cordis.patch.yml            # bundle 层 patch：只 insert 一行挂载
├── package.json                # 包描述 + DSH bundle 声明（dsh.bundle.patch / dsh.client.platform）
├── src/host/index.ts           # Host 半：name / inject / apply（bundle 入口 + dsh.client 发现锚点）
├── src/host/types.ts           # Host 半类型（只有 AnyCtx）
├── src/client/index.ts         # Client 入口：__ModuleLoader__ + styles 注入 + 三个 key 的槽位注册
├── src/client/FileChangeRow.ts # 卡片组件（DisclosureRow + CodeBlock 高亮视图 / DiffBlock ± 视图）
├── src/client/diff.ts          # 变更推导（纯函数：meta.diffs / 半截参数 JSON / LCS 统一 diff / 路径显示）
├── src/client/lang.ts          # 扩展名 → 官方语法 id（镜像 DSH 高亮别名表，26 个语言）
├── src/client/styles.ts        # 卡片样式（前缀 fcv-，颜色字号只用官方 token）
├── src/client/types.ts         # Client 半类型（与官方 RunningToolCall / ToolResultNode / CodeBlock 契约对齐）
├── scripts/check-client.mjs    # 无头冒烟测试：加载 lib/client.js，断言注册结果与渲染树
└── lib/{host,client}.js        # 单文件构建产物（已提交，DSH git 安装必需）
```

## 常见问题

- **装完了但卡片还是折叠的**：先硬刷新浏览器（client 半是页面脚本）；再确认 profile 的 `dsh.profile.bundles` 里有 `@dshp/file-change-viewer`；最后看 `dsh web` 日志有没有 `[dshp-file-change-viewer]` 的报错行。
- **某个文件没有高亮**：DSH 的高亮器（shiki）只打包了 26 个语言的语法；官方没有 `.vue` / `.svelte` / `.diff` / `.txt` 这些，本插件对它们传「无语言」，`CodeBlock` 会渲染成正常颜色的纯文本块（**不会**硬塞一个近似的语言，那只会给你看错误的着色）。想看语言清单见 `src/client/lang.ts`。
- **高亮视图的增删为什么是「一个代码块里交错」**：先把每个 hunk 的旧/新文本用 LCS 算成真正的统一 diff（未变行只出现一次），再把这些行**原样**喂给官方 `CodeBlock`，并在自己的类作用域内按行区间给删/增行上整行底色。代码本身一个字符都没改，所以语法高亮与缩进完全是原文的样子。
- **复制到的是没有标记的混合文本**：高亮视图的代码块刻意不加 `-` / `+`，复制出来的是「旧行与新行交错、只靠顺序无法区分」的文本。想要能直接用的 patch（带 `-` / `+` 标记）就切到 `± 差异` 视图再复制。
- **高亮视图的整行红绿底色是怎么来的**：官方 `CodeBlock` 没有「按行上色」的接口，但它在行号模式下把每行渲染成块级 `code > .line`。本插件按行号区间生成规则给删/增行上底色（连续同类行并成一个区间选择器，一个 hunk 通常只有 2–4 条），颜色引用 `styles.ts` 里的 `--fcv-del-bg` / `--fcv-add-bg`（官方 danger / success 填充）。所以**行号模式是必须开的**——关掉它 `.line` 会变回行内元素，底色只能盖住文字本身、铺不满整行。
- **行号为什么不是文件真实行号**：编号由官方代码块的 CSS 计数器给出，是**从本 hunk 开头起算的新文件行号**（删行不占号）。工具元数据只有 `{path, oldText, newText}`、没有行偏移，所以拿不到真实起始行号；要绝对行号得先让上游把 hunk 偏移放进 `meta.diffs`。
- **底色会突然消失吗**：规则依赖官方的 `code > .line` 结构（`line` 是未哈希的固定类名）。上游若改名/改结构，底色消失但代码块、行号、语法高亮、复制都照常，`± 差异` 视图也完全不受影响——是纯装饰性降级。
- **两个视图都看不到完整内容**：高亮视图单块封顶 400 行（`CodeBlock` 没有 `maxLines`，不封顶会把消息流撑爆），超出会在块下面提示剩余行数；± 差异视图由 `DiffBlock` 管 200 行并自带「… 其余 N 行」展开。
- **同一张卡片出现两份 / 互相顶替**：这个会话里可能还有一份**动态注册**的同名插件（用 `cordis_define` 定义的进程内扩展，`@` 引用能列出）。两者都用 `priority: -1` 抢同一个 key，**同 key 同优先级会直接抛错**，所以日志里会出现 `keyed slot "tool.call.toolview" already has an entry for key "edit" … register at a different priority to shadow it`，其中一份注册被跳过（页面不会坏）。装标准包后请把动态版 `cordis_undefine` 掉。
- **为什么要 `priority: -1`（改代码的人必读）**：keyed 槽位的派发是「按 priority 升序取每个 key 的第一条」，官方内置卡片占着 `0`，所以接管必须用**比 0 更小**的值；同 key 同 priority 不是覆盖而是抛错（否则内置卡片自己就会互相冲突）。这条约束有断言守着（`scripts/check-client.mjs`）。
- **想默认用 ± 差异视图**：把 `src/client/FileChangeRow.ts` 的 `DEFAULT_VIEW` 从 `'highlight'` 改成 `'diff'`，重新 build 后 `dsh web`。
- **只有 `edit` / `write` 变了，`bash` 里的文件改动没变**：本插件只接管这两个（以及兼容项 `str_replace_editor`）。用 shell 重定向改文件属于 `bash` 卡片，不在范围内。
- **`str_replace_editor` 是什么**：官方另一个文件编辑工具的兼容项。该工具没挂载时这条注册不会渲染任何东西（keyed 槽位没有对应调用就永远不触发），装了也不会有副作用。
- **某个工具的卡片突然变成「原始参数」**：说明这次调用的 `meta.diffs` 为空且参数推导不出变更（例如窗口截断把调用头切掉了）。这是兜底路径：能解析成对象就交给官方 `JsonBlock`，否则原样打印并截断。
- **想回到内置卡片**：`dsh plugin --profile web remove "@dshp/file-change-viewer"` + `dsh web`，无需清理任何配置（本插件不落盘）。

## 卸载

```sh
dsh plugin --profile web remove "@dshp/file-change-viewer"
dsh web
```

`remove` 会自动从 `dsh.profile.bundles` 撤下挂载（monorepo 本体不用删）。本插件不写 `settings.yaml`、不建自有文件、不缓存任何数据，卸载即干净。

## 移植说明

> **动态版 → Monorepo + TS 标准包**：本目录是 `deepseek-harness-plugins` monorepo 的标准子项目（`plugins/file-change-viewer`），由一次动态会话里用 `cordis_define` 创建的 client-only package（`filech-1/pkg-1`）等价重写而来。
>
> - **Host**：动态版没有 Host 半（只有 client）；标准包必须有一条 Host Loader 条目（`cordis.patch.yml` 的 insert + `lib/host.js`），因为 DSH 是从 Host Loader 的条目里扫描 `dsh.client` 声明来发现客户端 bundle 的。因此 `src/host/index.ts` 是**有意的极简**：`name` / `inject: []` / 一行就绪日志。
> - **Client**：动态版的单文件 JS → `src/client/{types,diff,styles,FileChangeRow,index}.ts`，tsup 打包为单文件 `lib/client.js`（IIFE，内含 `__ModuleLoader__.load`，react/primitives 运行时注入不打包）。
> - **四处实质性升级**：
>   1. diff 渲染从「手写 LCS 行级 diff + 自绘 DOM」换成官方组件：默认 `CodeBlock`——把 LCS 统一 diff（未变行只出现一次、增删交错、代码原样不带标记）交给官方高亮器，再借行号模式的块级 `.line` 按行区间叠整行红/绿底色并让删除行不占行号，于是**一个代码块里同时有增删底色、行号与 shiki 语法高亮**（配色走 `--shiki-token-*`，随主题切换）；可切到 `DiffBlock`（与内置卡片同源同色的逐行 ±）；自绘 DOM 全部删除，颜色全部来自官方 token；
>   2. 颜色从写死的 `rgba(248,81,73,.10)` 换成官方 token（`--dsw-alias-*` / `--shiki-token-*`），深浅主题自动跟随——动态版那两行硬编码色值在标准包里是打回项（AGENT.md §15.4）；
>   3. **必须显式传 `priority: -1`**：动态注册走的是 Guard 的 `allocatePriority()`（运行时自动从 -1 递减，所以它能悄悄盖住内置卡片，甚至不需要知道优先级这回事）；静态插件没有这层保护，用默认 priority 注册会**直接抛错**——这一条是移植时最容易踩、且症状是「插件加载了但界面毫无变化」的坑，现在由断言守着；
>   4. 高亮不是「多引一个库」而是**接上官方同一个高亮器**：`lang.ts` 逐条镜像官方别名表（`ts/tsx/js/jsx → typescript`、`sh/bash/zsh → shellscript`…），所以着色口径与对话里的代码块完全一致；官方没打包语法的扩展名（`.vue` / `.svelte` / `.diff`）一律传 undefined，退化成纯文本而不是错的高亮。
> - **新增验证**：动态版只能靠肉眼看；标准包把它变成可执行断言——`scripts/check-client.mjs` 直接加载构建产物，用 stub React/primitives（`useState` 带状态，所以能点按钮再渲染）跑组件函数并遍历元素树，覆盖 loader 契约、三个 key 的注册、影子优先级、`open === true` 的默认展开、默认高亮视图的 `code`（LCS 统一 diff 的增删交错）/ `lang` / 复制文案、切到 ± 视图后 `DiffBlock` 仍可达、超长封顶，以及 `meta.diffs` / 半截 JSON / 失败 / 截断四条推导路径。

> 构建：`pnpm --filter @dshp/file-change-viewer build`（tsup）→ `lib/host.js` + `lib/client.js`；包入口 `lib/host.js`，`./client` → `lib/client.js`。`lib/` 已提交（DSH `add github:` 直接从 git 安装，不跑 build，必须带构建产物）。

## 免责声明

- 本插件只改变工具调用在**界面上的渲染方式**，不修改任何文件内容、不干预模型行为；文件改动的正确性仍由官方 `edit` / `write` 工具与你的沙箱策略负责。
- 不联网、不上传、不落盘：没有路由、没有配置、没有缓存。
- 它接管了官方内置卡片的渲染。如果 DSH 上游改了 `DiffBlock` / `DisclosureRow` / `CodeBlock` 的 props 契约、或高亮别名表（`lang.ts` 镜像的那张），卡片可能渲染异常或高亮失效；如果改了代码块 `code > .line` 的结构，删/增行的整行底色会消失（其余照常）。以上情况卸载本插件即恢复内置卡片。
