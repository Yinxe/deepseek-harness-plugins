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

## 安装到 DSH（唯一方式：克隆本仓库 + 本地安装）

> 包尚未发布到 npm，**只能本地装**，不能 `pnpm add @dshp/*` / `add github:`。

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
│   └── search-provider/        # @dshp/search-provider（web_search 供应商中枢）
├── AGENT.md                    # 插件开发规范（新插件必读）
├── tsconfig.base.json          # 共享 TS 配置（NodeNext + strict）
├── tsconfig.json               # solution 引用
├── pnpm-workspace.yaml         # packages: plugins/* + storeDir
├── compat.json                 # DSH 版本兼容矩阵（空 = 暂无历史包袱）
└── .github/workflows/ci.yml    # format → lint → typecheck → build → test
```

每个插件内部一律是同一套布局：`src/host/`（Node 半）+ `src/client/`（浏览器半）+ `lib/`（已提交的单文件产物）+ `cordis.patch.yml`。

## 环境

- Node >= 20（推荐 24，见 `.nvmrc`）
- pnpm 11.7.0（见 `devEngines`）
- 本沙箱全局 store 只读，`pnpm-workspace.yaml` 已设 `storeDir: /tmp/pnpm-store`（pnpm v11 必须写这里，`.npmrc` 会被忽略）

## 常用命令

```bash
pnpm install
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

提交前跑齐上面 5 条门禁（与 `ci.yml` 同序）；改了 `src/` 必须重新 build 并把 `lib/` 一起提交。

## 加新插件

```bash
mkdir -p plugins/<name>/src
# 照抄 plugins/vision-bridge/{package.json,tsconfig.json}，改 name/version/description
# tsconfig.json 里 extends 保持 ../../tsconfig.base.json
# 根 tsconfig.json references 加一条 { "path": "./plugins/<name>" }
pnpm install
```

规范细节（目录布局、TS 策略、package.json 逐字段、Cordis 契约、多供应商分层渲染、门禁）见 **[AGENT.md](AGENT.md)**。
