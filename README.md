# deepseek-harness-plugins

DeepSeek Harness（DSH）插件 Monorepo（pnpm workspaces + TypeScript ESM）。

## 结构

```
.
├── plugins/
│   └── dsh-vision-bridge/      # @dshp-inx/vision-bridge（TS 重写，已移植）
│       ├── src/host/           # Host TS：types/http/config/cache/vision/index
│       ├── src/client/         # Client TS：types/styles/api/components/VisionSection/index
│       ├── lib/                # 单文件构建产物（已提交，DSH git 安装必需）
│       │   ├── host.js         # 后端 bundle（ESM，schemastery 内联）
│       │   └── client.js       # 前端 bundle（含 __ModuleLoader__.load）
│       ├── cordis.patch.yml
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
pnpm typecheck   # pnpm -r typecheck
pnpm build       # pnpm -r build
pnpm test        # pnpm -r test

# 单个插件
pnpm --filter @dshp-inx/vision-bridge build
pnpm --filter @dshp-inx/vision-bridge typecheck
```

## 加新插件

```bash
mkdir -p plugins/<name>/src
# 照抄 plugins/dsh-vision-bridge/{package.json,tsconfig.json}，改 name/version/description
# tsconfig.json 里 extends 保持 ../../tsconfig.base.json
# 根 tsconfig.json references 加一条 { "path": "./plugins/<name>" }
pnpm install
```

## 发布（Trusted Publishing，免 Token）

- GitHub tag `v*` 触发 `.github/workflows/publish.yml` → `pnpm -r publish --provenance`
- npm 侧每个包需单独配 Trusted Publisher（Settings -> Trusted Publisher -> workflow `publish.yml`）
- 发单包：`pnpm --filter @dshp-inx/vision-bridge publish --provenance --access public`
