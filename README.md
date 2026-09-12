# deepseek-harness-plugins

DeepSeek Harness（DSH）插件 Monorepo（pnpm workspaces + TypeScript ESM）。

> **运行时零依赖 · 构建产物已提交**：所有插件 `dependencies` 恒为 `{}`，`lib/host.js` / `lib/client.js` 随仓库提交 —— clone 下来即可直接安装，无需先 build。

## 插件一览

| 插件                                                           | 一句话                                                                                                                            | 文档                                        |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| **[@dshp/token-meter](plugins/token-meter/README.md)**         | Token 额度 + 用量统计：多供应商额度卡（opencode / DeepSeek / Command Code / 手动） + 本机会话日志聚合（趋势 / 热力图 / 模型分布） | [README](plugins/token-meter/README.md)     |
| **[@dshp/vision-bridge](plugins/vision-bridge/README.md)**     | 视觉桥接：让纯文本模型也能“看图”（`vision_describe` 工具 + 主/备模型自动降级）                                                    | [README](plugins/vision-bridge/README.md)   |
| **[@dshp/mcwiki-search](plugins/mcwiki-search/README.md)**     | Minecraft Wiki 查询工具（搜索 / 引言 / 全文，含模板清理的 AI 可读转换）                                                           | [README](plugins/mcwiki-search/README.md)   |
| **[@dshp/search-provider](plugins/search-provider/README.md)** | `web_search` 供应商中枢：Tavily 等可插拔接入，动态选型                                                                            | [README](plugins/search-provider/README.md) |
| **[@dshp/web-style](plugins/web-style/README.md)**             | Web 外观定制：23 套主题画廊一键切换并持久化 + 壁纸取色（Material You）+ 全局圆角                                                  | [README](plugins/web-style/README.md)       |
| **[@dshp/skill-manager](plugins/skill-manager/README.md)**     | 技能管理：设置页统一管理全局（`~/.dsh/skills`、`~/.agents/skills`）与工作区技能——新建/编辑/启停/复制移动/删除                     | [README](plugins/skill-manager/README.md)   |
| **[@dshp/mcp-manager](plugins/mcp-manager/README.md)**         | MCP 服务器管理：设置页管理 cordis.patch.yml 里的官方 dsh-mcp-client 实例——新建/编辑/启停/删除/探活，表单+JSON 双模式，回写保注释  | [README](plugins/mcp-manager/README.md)     |

## 截图预览

### `@dshp/token-meter` — Token 额度 + 用量

**右侧栏「额度」Tab**：峰谷提醒横幅 + 全部供应商富卡片（配额进度条按 5 小时 / 每周 / 每月分级，标注占比与重置倒计时，余额不足触发红色预警，禁用项沉底并加分组标题）。

**右侧栏「用量」Tab**：指标卡 + Token 趋势折线 + 活力热力图 + 模型用量分布环形图。

| 额度 Tab                                                               | 用量 Tab                                                               |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| ![额度 Tab](<plugins/token-meter/images/截图 2026-09-11 17-08-15.png>) | ![用量 Tab](<plugins/token-meter/images/截图 2026-09-11 17-09-40.png>) |

**宽屏布局**：今日消耗面板 + 指标卡网格；任意图表可 `⠿` 拖拽或 `⧉` 弹出为独立浮窗。

![宽屏：今日消耗 + 指标卡网格](<plugins/token-meter/images/截图 2026-09-11 17-10-48.png>)

> 其余插件暂无界面截图；使用说明与配置见各自的 README（上表「文档」列）。

## 安装到 DSH

### 方式一：从 GitHub Releases 直接安装（推荐，无需 clone）

CI 把每个插件打包成 tgz 发布到 Releases，`latest` 滚动发布固定跟随 main 最新构建（持 Latest 徽标、始终置顶）：

```bash
# macOS / Linux
dsh --profile web add \
  https://github.com/Yinxe/deepseek-harness-plugins/releases/download/latest/dshp-mcwiki-search-latest.tgz
```

```powershell
# Windows PowerShell
dsh --profile web add `
  'https://github.com/Yinxe/deepseek-harness-plugins/releases/download/latest/dshp-mcwiki-search-latest.tgz'
```

全部插件的下载与安装命令见 [Releases](https://github.com/Yinxe/deepseek-harness-plugins/releases) 各预发布说明；**滚动更新 = 重跑同一条命令 + `dsh web` 重启**（`latest` 资产随 main 每次构建滚动重建）。

### 历史版本（兼容旧版 DSH）

main 永远跟随最新 DSH。老版本 DSH 用户装**静态历史版本**：按 [`compat.json`](compat.json) 记录的兼容 tag（「DSH 版本 → 推荐 tag」矩阵），到 [Releases](https://github.com/Yinxe/deepseek-harness-plugins/releases) 找对应版本 Release（`v*` tag 触发，静态存档、永不滚动），资产名 = `dshp-<插件名>-<tag>.tgz`：

```bash
# 以 v0.1.5-rc.1 为例
dsh --profile web add \
  https://github.com/Yinxe/deepseek-harness-plugins/releases/download/v0.1.5-rc.1/dshp-mcwiki-search-v0.1.5-rc.1.tgz
```

### 卸载

```bash
dsh plugin --profile web remove "@dshp/<插件名>"
dsh web   # 重启生效
```

`remove` 直接转发 pnpm（参数 = 包名），并自动从 `dsh.profile.bundles` 撤下挂载；写入 `settings.yaml` 的配置分节按需手动清理。各插件的详细安装/更新/卸载说明见各自 README。

### 方式二：克隆仓库本地安装（开发 / 定制）

> 包尚未发布到 npm，不能 `pnpm add @dshp/*` / `add github:`。

```bash
git clone git@github.com:Yinxe/deepseek-harness-plugins.git
cd deepseek-harness-plugins
pnpm install
# lib/ 已提交，clone 下来就能用；改了 src 才需要 pnpm build

# 安装你需要的插件（按目录名，可多个）
dsh plugin --profile web add ./plugins/token-meter
dsh plugin --profile web add ./plugins/vision-bridge
dsh plugin --profile web add ./plugins/mcwiki-search
dsh plugin --profile web add ./plugins/search-provider
dsh plugin --profile web add ./plugins/web-style
dsh plugin --profile web add ./plugins/skill-manager
dsh plugin --profile web add ./plugins/mcp-manager

dsh web   # 重启生效
```

`dsh plugin add` 会把包写进 profile 的 `dsh.profile.bundles` —— **无需手动改配置文件**。
各插件的详细安装说明、配置与常见问题见对应 README（上表）。

### 一键 AI 安装

把下面这段发给你的 DSH AI，让它代你装：

```text
帮我从 monorepo Yinxe/deepseek-harness-plugins 安装插件（按需选择子目录）：
1. git clone 仓库并 pnpm install
2. dsh plugin --profile web add ./plugins/<子目录名>
3. 重启 dsh web，确认无报错、设置页出现对应条目
```

### 发布与更新约定（CI 自动执行）

| 通道         | 触发          | 行为                                                             |
| ------------ | ------------- | ---------------------------------------------------------------- |
| `latest`     | 推送 `main`   | 滚动重建到最新提交（正式渠道，持 Latest 徽标置顶），下载地址固定 |
| 版本 Release | 推送 `v*` tag | 静态存档，永不随构建变化                                         |
| 分支预发布   | 推送其他分支  | 以分支名命名的预发布（`release/1.0` → `release-1.0`）            |
| 自定义后缀   | 手动触发      | 勾选 rolling = 预发布随滚动；不勾 = 静态正式版                   |

- **滚动约定**：所有**预发布**（以及 notes 首行带 `<!-- rolling: true -->` 标记的 release）都跟随 main——每次 main 推送成功后整体重建到最新提交；停止跟随 = 取消 Pre-release 勾选或删除标记行。`latest` 每次最后重建并授予 Latest 徽标，始终置顶 Releases 列表。
- **数量约束**：除 `latest` 外同时最多允许 **1 个**滚动项；出现多个时 CI 立即报错终止（不动任何现有 Release），处理后再推送即可。
- `dev` 与 `feature/*` 分支、PR 只跑 CI 门禁，不产出发布物。
- Release 说明由 `scripts/gen-release-notes.cjs` 生成：逐插件列出包名、版本、双语描述、下载与安装命令。

## 结构

```
.
├── plugins/
│   ├── token-meter/            # @dshp/token-meter（Token 额度 + 用量统计）
│   │   ├── src/host/           #   Host TS：providers/{opencode,deepseek,commandcode,manual} + view/errors + stats/
│   │   ├── src/client/         #   Client TS：providers/{kit,sections,registry,ui/*} + Quota/Stats/TokenMeter Section
│   │   ├── images/             #   界面截图（README「截图预览」用）
│   │   ├── lib/                #   单文件构建产物（已提交，DSH git 安装必需）
│   │   └── cordis.patch.yml    #   bundle 声明（id: dshp-token-meter）
│   ├── vision-bridge/          # @dshp/vision-bridge（视觉桥接）
│   │   ├── src/host/           #   Host TS：types/http/config/cache/vision/index
│   │   ├── src/client/         #   Client TS：types/styles/api/components/VisionSection/index
│   │   └── lib/                #   单文件构建产物（已提交）
│   ├── mcwiki-search/          # @dshp/mcwiki-search（Minecraft Wiki 查询）
│   ├── search-provider/        # @dshp/search-provider（web_search 供应商中枢）
│   ├── skill-manager/          # @dshp/skill-manager（全局 + 工作区技能管理）
│   ├── mcp-manager/            # @dshp/mcp-manager（MCP 服务器管理：patch 条目 CRUD + 探活）
│   └── web-style/              # @dshp/web-style（23 套主题画廊 + 壁纸取色 + 全局圆角）
│       ├── src/host/           #   Host TS：types/http/config + themes/（token 单源，21 个主题模块）
│       ├── src/client/         #   Client TS：GallerySection/apply-theme/md3/official/radius/themes/api/state
│       ├── scripts/            #   check-themes.mjs（目录 ↔ 画廊 meta ↔ 产物一致性）
│       └── lib/                #   单文件构建产物（已提交）
├── AGENT.md                    # 插件开发规范（新插件必读）
├── tsconfig.base.json          # 共享 TS 配置（NodeNext + strict）
├── tsconfig.json               # solution 引用
├── pnpm-workspace.yaml         # packages: plugins/* + storeDir
├── compat.json                 # DSH 版本兼容矩阵（空 = 暂无历史包袱）
└── .github/workflows/CICD.yml  # 门禁 + 打包发布：main→latest 滚动发布，v* tag→版本 Release，其他分支→同名预发布；dev 与 feature/* 仅门禁
```

每个插件内部一律是同一套布局：`src/host/`（Node 半）+ `src/client/`（浏览器半）+ `lib/`（已提交的单文件产物）+ `cordis.patch.yml`。

### 设置键名约定（全仓统一，改名即 breaking）

每个插件只有一个配置键，四处同名，等于 `dshp-<目录名>`：

| 位置                                                           | 值（以 token-meter 为例） |
| -------------------------------------------------------------- | ------------------------- |
| settings.yaml 命名空间（`installSection` / `settings.update`） | `dshp-token-meter`        |
| 同源路由前缀                                                   | `/ext/dshp-token-meter/*` |
| `cordis.patch.yml` 的 `id`                                     | `dshp-token-meter`        |
| 设置页 `settings.section` 的 `id`                              | `dshp-token-meter`        |

**插件只读自己的键，不做任何历史键兼容与迁移**：不读 `dshp-inx-*` 等旧命名空间、不读 `storages/*.json`、不改写 `settings.yaml`（规范见 [AGENT.md](AGENT.md) §7.1 / §7.3）。升级时若键名有变，请按各插件 README 的更新日志**手工**把旧分节改名或重配；配置键改名属 breaking 变更。

## 环境

- Node >= 20（推荐 24，见 `.nvmrc`）
- pnpm 11.7.0（见 `devEngines`）
- 本沙箱全局 store 只读，`pnpm-workspace.yaml` 已设 `storeDir: /tmp/pnpm-store`（pnpm v11 必须写这里，`.npmrc` 会被忽略）

## 常用命令

```bash
pnpm install
pnpm check         # 一条流程：build → typecheck → lint → format（提交前跑这个）
pnpm format        # prettier 全仓写盘
pnpm format:check  # CI 用，只检查不写
pnpm lint          # oxlint 全仓（--deny-warnings，警告也算挂）
pnpm typecheck     # pnpm -r typecheck
pnpm build         # pnpm -r build
pnpm test          # pnpm -r test

# 单个插件
pnpm --filter @dshp/token-meter build
pnpm --filter @dshp/token-meter typecheck
```

提交前跑 `pnpm check`（构建 → 类型检查 → 质量检查 → 格式化一步完成）；CI 仍按严格检查序把关；改了 `src/` 必须重新 build 并把 `lib/` 一起提交。

## 加新插件

```bash
mkdir -p plugins/<name>/src
# 照抄 plugins/vision-bridge/{package.json,tsconfig.json}，改 name/version/description
# tsconfig.json 里 extends 保持 ../../tsconfig.base.json
# 根 tsconfig.json references 加一条 { "path": "./plugins/<name>" }
pnpm install
```

规范细节（目录布局、TS 策略、package.json 逐字段、Cordis 契约、多供应商分层渲染、门禁）见 **[AGENT.md](AGENT.md)**。
