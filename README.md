# deepseek-harness-plugins

DeepSeek Harness（DSH）插件 Monorepo（pnpm workspaces + TypeScript ESM）。

## 结构

```
.
├── plugins/
│   └── dsh-vision-bridge/      # @dshp/vision-bridge（TS 重写，已移植）
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
pnpm format        # prettier 全仓写盘
pnpm format:check  # CI 用，只检查不写
pnpm lint          # oxlint 全仓（--deny-warnings，警告也算挂）
pnpm typecheck     # pnpm -r typecheck
pnpm build         # pnpm -r build
pnpm test          # pnpm -r test

# 单个插件
pnpm --filter @dshp/vision-bridge build
pnpm --filter @dshp/vision-bridge typecheck
```

## 门禁（每次 push/PR 全跑，见 `.github/workflows/ci.yml`）

`format:check → lint → typecheck → build → test`，一步红就拦。工具选型：

- **格式化 = Prettier**（`.prettierrc`：单引号/尾逗号/all/宽 110），编辑器装 Prettier 插件保存自动修
- **质量 = oxlint**（`.oxlintrc.json`，124 条规则，correctness 当 error）。没用 typescript-eslint：它 8.70 明确不支持 TS 7.0（跟之前 tsup dts 一个病），等上游跟上再说
- 全仓两处 rule-off 都是故意的：`unicorn/consistent-function-scoping`（插件按闭包组织，不要为此拆结构）、`eslint/no-underscore-dangle`（`__ModuleLoader__` 是 DSH 写死的全局名）

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

## 版本与 DSH 兼容（git tag）

main 永远跟最新 DSH，**用新版直接 clone 就行，不用 checkout**。历史 tag 是 DSH 上游发新版 breaking 时，回头给旧状态打的——只有你的 DSH 还停在老版本才需要它。

现在 `compat.json` 是空的（DSH 还在 0.1.x，没包袱）。DSH 0.2 来了以后长这样：

| tag      | 仓库版本 | 验过 DSH | 说明              |
| -------- | -------- | -------- | ----------------- |
| `v0.x.y` | 0.x.y    | 0.1.x    | 给 0.1 线留的快照 |

规则：

- 平时不打 tag，main 直接用
- DSH 发新版且有 breaking：先在当前 main 打 `v<根版本>` 留快照（annotated，message 写 DSH 版本），`compat.json` 追加一行，再在 main 上适配新 DSH
- 用老 DSH：查 `compat.json` 找到对应 tag，`git checkout <tag>` 后再按安装节装

## 发布到 npm（可选，当前未发布）

现在 `npm view @dshp/vision-bridge` 是 404，所以上面只能本地装。
以后想一键 `pnpm add @dshp/vision-bridge` 才需要走这一步：

- CI 已就绪：GitHub tag `v*` 触发 `.github/workflows/publish.yml` → `pnpm -r publish --provenance`（Trusted Publishing，免 Token）。
- npm 侧每个包需单独配 Trusted Publisher（包 Settings → Trusted Publisher → workflow `publish.yml`）。
- 发单包：`pnpm --filter @dshp/vision-bridge publish --provenance --access public`

### scope `@dshp` 需要建组织吗？

**要发布才需要，不发布不需要。** npm 规则：`@scope/name` 的 scope 必须归你所有——要么是你自己的用户名 scope（免费，如 `@yinxe/xxx`，啥也不用建），要么是一个你有权限的组织（Organization）。

- 想继续用 `@dshp/*` 发包：去 npmjs.com 建组织 `dshp`（公有包免费，把你自己加为 owner），然后给每个包配 Trusted Publisher 就行。建完之前发包会 403。
- 不想建组织：把包改名发到你自己名下（`@yinxe/vision-bridge`）或发非 scope 名（`deepseek-harness-vision-bridge`），都不用建组织。
- 只本地用：组织、发包都跟你没关系，忽略本节。
