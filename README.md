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
pnpm typecheck   # pnpm -r typecheck
pnpm build       # pnpm -r build
pnpm test        # pnpm -r test

# 单个插件
pnpm --filter @dshp/vision-bridge build
pnpm --filter @dshp/vision-bridge typecheck
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

## 版本与 DSH 兼容（git tag）

插件版本跟着 DSH 走：每个发布 tag 都钉着它验过的 DSH 版本，装之前先 checkout，装错版本不背锅。

| tag | 插件 | 验过 DSH | 说明 |
|---|---|---|---|
| `vision-bridge-v1.4.0` | 1.4.0 | 0.1.5-rc.1 起，同 0.1.x | 首个 monorepo 版本 |
| `vision-bridge/dsh-0.1` | （移动别名） | 0.1.x 最新验证版 | 懒人直达：`git checkout vision-bridge/dsh-0.1` |

规则（加新插件照抄）：

- 发布 tag：`<插件目录名>-v<插件版本>`（如 `vision-bridge-v1.4.0`），annotated，message 里写验过的 DSH 版本；CI 会校验 tag 后缀 = `package.json` 版本，不一致拒绝发布
- 移动别名：`<插件目录名>/dsh-<大>.<小>`（如 `vision-bridge/dsh-0.1`），新版本在该 DSH 小版本上验过就 `git tag -f` 前移
- 机器可读矩阵：`plugins/<名>/compat.json`，`./scripts/resolve-tag.sh <名> <dsh-version>` 直接吐 tag，找不到就非零退出

```sh
TAG=$(./scripts/resolve-tag.sh vision-bridge "$(dsh --version)")
git checkout "$TAG"
```

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
