# @dshp/file-change-viewer

DeepSeek Harness（DSH）**文件修改查看器**：接管对话流里的 `edit` / `write` 工具卡片，让它们**默认展开**——每一次文件改动直接铺开成行级 diff（`+` 增 / `-` 删），配上文件路径、`+A -B` 行数统计与一键打开文件；调用还在进行时，也能看到正在写入的内容。

内置的文件修改卡片是**默认折叠**的：DSH 用 `DisclosureRow` 承载折叠语义，折叠态下 `DiffBlock` 根本不挂载，所以「用 CSS 把卡片撑开」这条路走不通。本插件按官方扩展点注册 `tool.call.toolview` 的同名 key（官方文档：_a key the shipped composition already covers is replaced, not shared_），用**同一批官方 primitives** 重新组装这张卡片，唯一的语义差异就是 `open = true`。

> 设计原则：**只改渲染，不碰数据**。不注册工具、不写配置、不发请求、不改任何文件——diff 内容全部来自官方 `dsh-tool-fs` 已经在工具结果里给出的 `meta.diffs`，配色全部来自官方 token（`--dsw-alias-*`），停止插件即恢复内置卡片。

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

**验证**：`pnpm --filter @dshp/file-change-viewer test` 会跑 `node --check` 两份产物 + 无头渲染断言（`scripts/check-client.mjs`，48 项）；界面上让 AI 改任意一个文件，卡片应是**展开**的、带 `+A -B` 与路径链接。

**一键 AI 安装**：把下面这段发给你的 DSH AI 即可：

```text
帮我安装文件修改查看器插件（monorepo Yinxe/deepseek-harness-plugins，子目录 plugins/file-change-viewer，包名 @dshp/file-change-viewer）：
1. git clone monorepo 并 pnpm install
2. dsh plugin --profile web add ./plugins/file-change-viewer
3. dsh web 重启，然后改一个文件，确认 edit / write 卡片默认就是展开的、能看到绿加红减的变更行
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

| 部分                                          | 内容                                                                                                                                                                                                                                                                                                                                                                                                              |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Host（`src/host/` → `lib/host.js`）**       | 只有 `name` / `inject` / `apply`：无 service 依赖、无工具、无路由、无 settings。存在的原因是 DSH **从 Host Loader 的条目里扫描 `dsh.client` 声明**来发现并下发客户端 bundle——没有这一行，`lib/client.js` 不会被加载（详见 `src/host/index.ts` 头注释）。                                                                                                                                                          |
| **Client（`src/client/` → `lib/client.js`）** | 用 `priority: -1` 注册 `tool.call.toolview` 的 `edit` / `write` / `str_replace_editor` 三个 key（影子化官方内置卡片；同 key 同 priority 会抛错，所以必须比内置的 `0` 更小），带 `locale: 'conversation'` 取文案，用 `DisclosureRow` + `DiffBlock` 渲染一张**默认展开**的变更卡片；`diff.ts` 负责把「结果元数据的 `meta.diffs`」与「流式生成中的半截参数 JSON」推导成同一个模型；样式只用官方 token，前缀 `fcv-`。 |
| **同源路由**                                  | 无（不读写任何用户数据，天然没有路由）。                                                                                                                                                                                                                                                                                                                                                                          |
| **工具**                                      | 无（不新增模型工具；本插件只改变已有工具调用的**渲染**）。                                                                                                                                                                                                                                                                                                                                                        |

### 卡片行为

| 场景                         | 表现                                                                                  |
| ---------------------------- | ------------------------------------------------------------------------------------- |
| `write` 新建文件             | 整份内容按 `+` 行列出，角标「新文件」                                                 |
| `write` 覆盖已有文件         | 用结果元数据的真实 hunk（含 3 行上下文），角标「已应用」                              |
| `edit` 改文件                | `-` 旧文本 / `+` 新文本，`replace_all: true` 时额外提示「全部替换」                   |
| 调用进行中，参数已完整       | 角标「待应用」，先按参数预览将要写入的内容                                            |
| 调用进行中，参数还在流式生成 | 角标「生成中」，宽容解析半截 JSON，逐帧显示正在写入的内容                             |
| 调用失败（未落盘）           | 红字错误行 + 参数推导出的变更，角标「未应用」                                         |
| 窗口截断（读不到调用参数）   | 能解析就交给官方 `JsonBlock` 展示原始参数并截断，解析不了就原样打印（截断 4000 字符） |
| 点击文件路径                 | 打开该文件（`openFile`）；路径按工作区相对化，POSIX home 显示为 `~`                   |
| 点击卡片头部 / Enter / Space | 手动折叠或展开（默认展开，但用户随时可以收起）                                        |
| 变更行数超过 200 行          | 由 `DiffBlock` 中部折叠接管，给出「… 其余 N 行」就地展开按钮                          |

### 与内置卡片的差异（刻意的）

| 维度         | 内置 `file-mutation-toolview`         | 本插件                                      |
| ------------ | ------------------------------------- | ------------------------------------------- |
| 展开态       | 默认收起                              | **默认展开**                                |
| 进行中的调用 | 只显示一行摘要                        | 实时显示正在写入 / 将要写入的内容           |
| 失败的调用   | 只显示错误行                          | 错误行 + 参数推导出的变更（角标「未应用」） |
| 卡片内容     | ToolRow（还承载 output / 原始参数等） | 只有变更（这张卡片服务的工具只产出 diff）   |

其余一律对齐：diff 交给 `DiffBlock` 渲染（自带复制按钮、`⋯` 折叠与 `└ +A -B · N files` 页脚）、折叠语义交给 `DisclosureRow`（`aria-expanded` / 键盘可达）、配色全部走官方 token。

## 配置项

**本插件没有配置项**，也不需要设置页：它只有一个行为——「别折叠」。每多一个配置项就多一份文档、一个控件、一处校验，而这里没有用户真的会改的东西（想改行为就是不要装它；想临时收起某张卡片，点卡片头部即可）。

几个刻意的内置常量（属于 UI 几何常量，不是部署配置，改完需要重新 build）：

| 常量             | 位置                          | 值                                      | 含义                                         |
| ---------------- | ----------------------------- | --------------------------------------- | -------------------------------------------- |
| `DIFF_MAX_LINES` | `src/client/FileChangeRow.ts` | `200`                                   | 单张卡片一次性展开的行数上限（超出交给折叠） |
| `RAW_MAX_CHARS`  | `src/client/FileChangeRow.ts` | `4000`                                  | 原始参数兜底展示的截断长度                   |
| `TOOL_KEYS`      | `src/client/index.ts`         | `edit` / `write` / `str_replace_editor` | 接管哪些工具卡片                             |

不写 `settings.yaml`、不建自有配置文件、不碰任何用户数据（AGENT.md §7.3 / §11）。

## 代码结构

```
plugins/file-change-viewer/
├── cordis.patch.yml            # bundle 层 patch：只 insert 一行挂载
├── package.json                # 包描述 + DSH bundle 声明（dsh.bundle.patch / dsh.client.platform）
├── src/host/index.ts           # Host 半：name / inject / apply（bundle 入口 + dsh.client 发现锚点）
├── src/host/types.ts           # Host 半类型（只有 AnyCtx）
├── src/client/index.ts         # Client 入口：__ModuleLoader__ + styles 注入 + 三个 key 的槽位注册
├── src/client/FileChangeRow.ts # 卡片组件（DisclosureRow + DiffBlock，默认展开）
├── src/client/diff.ts          # 变更推导（纯函数：meta.diffs / 半截参数 JSON / 路径显示）
├── src/client/styles.ts        # 卡片样式（前缀 fcv-，颜色字号只用官方 token）
├── src/client/types.ts         # Client 半类型（与官方 RunningToolCall / ToolResultNode / DiffBlock 契约对齐）
├── scripts/check-client.mjs    # 无头冒烟测试：加载 lib/client.js，断言注册结果与渲染树
└── lib/{host,client}.js        # 单文件构建产物（已提交，DSH git 安装必需）
```

## 常见问题

- **装完了但卡片还是折叠的**：先硬刷新浏览器（client 半是页面脚本）；再确认 profile 的 `dsh.profile.bundles` 里有 `@dshp/file-change-viewer`；最后看 `dsh web` 日志有没有 `[dshp-file-change-viewer]` 的报错行。
- **同一张卡片出现两份 / 互相顶替**：这个会话里可能还有一份**动态注册**的同名插件（用 `cordis_define` 定义的进程内扩展，`@` 引用能列出）。两者都用 `priority: -1` 抢同一个 key，**同 key 同优先级会直接抛错**，所以日志里会出现 `keyed slot "tool.call.toolview" already has an entry for key "edit" … register at a different priority to shadow it`，其中一份注册被跳过（页面不会坏）。装标准包后请把动态版 `cordis_undefine` 掉。
- **为什么要 `priority: -1`（改代码的人必读）**：keyed 槽位的派发是「按 priority 升序取每个 key 的第一条」，官方内置卡片占着 `0`，所以接管必须用**比 0 更小**的值；同 key 同 priority 不是覆盖而是抛错（否则内置卡片自己就会互相冲突）。这条约束有断言守着（`scripts/check-client.mjs`）。
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
> - **三处实质性升级**：
>   1. diff 渲染从「手写 LCS 行级 diff + 自绘 DOM」换成官方 `DiffBlock`（与内置卡片同源同色，自带复制按钮与 `⋯` 中部折叠），自绘版本已删除；
>   2. 颜色从写死的 `rgba(248,81,73,.10)` 换成官方 token（`--dsw-alias-*`），深浅主题自动跟随——动态版那两行硬编码色值在标准包里是打回项（AGENT.md §15.4）；
>   3. **必须显式传 `priority: -1`**：动态注册走的是 Guard 的 `allocatePriority()`（运行时自动从 -1 递减，所以它能悄悄盖住内置卡片，甚至不需要知道优先级这回事）；静态插件没有这层保护，用默认 priority 注册会**直接抛错**——这一条是移植时最容易踩、且症状是「插件加载了但界面毫无变化」的坑，现在由断言守着。
> - **新增验证**：动态版只能靠肉眼看；标准包把它变成可执行断言——`scripts/check-client.mjs` 直接加载构建产物，用 stub React/primitives 跑组件函数并遍历元素树，覆盖 loader 契约、三个 key 的注册、影子优先级、`open === true` 的默认展开、以及 `meta.diffs` / 半截 JSON / 失败 / 截断四条推导路径。

> 构建：`pnpm --filter @dshp/file-change-viewer build`（tsup）→ `lib/host.js` + `lib/client.js`；包入口 `lib/host.js`，`./client` → `lib/client.js`。`lib/` 已提交（DSH `add github:` 直接从 git 安装，不跑 build，必须带构建产物）。

## 免责声明

- 本插件只改变工具调用在**界面上的渲染方式**，不修改任何文件内容、不干预模型行为；文件改动的正确性仍由官方 `edit` / `write` 工具与你的沙箱策略负责。
- 不联网、不上传、不落盘：没有路由、没有配置、没有缓存。
- 它接管了官方内置卡片的渲染。如果 DSH 上游改了 `DiffBlock` / `DisclosureRow` 的 props 契约，卡片可能渲染异常——此时卸载本插件即恢复内置卡片。
