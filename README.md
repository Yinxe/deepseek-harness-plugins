# deepseek-harness-plugins

DeepSeek Harness（DSH）插件 Monorepo（pnpm workspaces + TypeScript ESM）。

## 结构

```
.
├── plugins/
│   ├── dsh-vision-bridge/      # @dshp/vision-bridge（图像识别桥：vision_describe 工具 + 设置页）
│   │   ├── src/host/           # Host TS：types/http/config/cache/vision/index
│   │   ├── src/client/         # Client TS：types/styles/api/components/VisionSection/index
│   │   ├── lib/                # 单文件构建产物（已提交，DSH git 安装必需）
│   │   │   ├── host.js         # 后端 bundle（ESM，schemastery 内联）
│   │   │   └── client.js       # 前端 bundle（含 __ModuleLoader__.load）
│   │   ├── cordis.patch.yml
│   │   └── package.json        # main ./lib/host.js，./client → ./lib/client.js
│   ├── mcwiki-search/          # @dshp/mcwiki-search（Minecraft Wiki 查询工具：搜索/引言/全文）
│   ├── search-provider/        # @dshp/search-provider（web_search 供应商中枢，Tavily 等，动态选型）
│   └── token-meter/            # @dshp/token-meter（Token 额度 + 用量统计，右栏双面板 + 小组件）
│       ├── src/host/           # Host TS：providers/{opencode,deepseek,deepseek-api,deepseek-web,manual} + stats/
│       ├── src/client/         # Client TS：QuotaSection/StatsSection/TokenMeterSection/widgets + icons
│       ├── images/             # 界面截图（插件 README「界面预览」用）
│       ├── lib/                # 单文件构建产物（已提交，DSH git 安装必需）
│       │   ├── host.js         # 后端 bundle（ESM，schemastery 内联）
│       │   └── client.js       # 前端 bundle（含 __ModuleLoader__.load）
│       ├── cordis.patch.yml    # bundle 声明（id: dshp-token-meter）
│       └── package.json        # main ./lib/host.js，./client → ./lib/client.js
├── tsconfig.base.json          # 共享 TS 配置（NodeNext + strict）
├── tsconfig.json               # solution 引用
├── pnpm-workspace.yaml         # packages: plugins/* + storeDir
└── .github/workflows/
    └── publish.yml             # tag v* 触发，OIDC 免 Token（pnpm -r publish）
```

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
pnpm --filter @dshp/vision-bridge build
pnpm --filter @dshp/vision-bridge typecheck
pnpm --filter @dshp/token-meter build
pnpm --filter @dshp/token-meter typecheck
```

## 加新插件

```bash
mkdir -p plugins/<name>/src
# 照抄 plugins/vision-bridge/{package.json,tsconfig.json}，改 name/version/description
# tsconfig.json 里 extends 保持 ../../tsconfig.base.json
# 根 tsconfig.json references 加一条 { "path": "./plugins/<name>" }
pnpm install
```

## 安装到 DSH（唯一方式：克隆本仓库 + 本地安装）

> 包尚未发布到 npm，**只能本地装**，不能 `pnpm add @dshp/*`。

```bash
git clone git@github.com:Yinxe/deepseek-harness-plugins.git
cd deepseek-harness-plugins
pnpm install
# lib/ 已提交，clone 下来就能用；改了 src 才需要 pnpm build

dsh plugin --profile web add ./plugins/vision-bridge
dsh web
```
