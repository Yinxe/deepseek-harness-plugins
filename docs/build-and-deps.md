# 构建与依赖

> 本文承接旧 AGENT.md §4（构建规范）与 §5（依赖规范）的完整细节。规则版总纲见[仓库根 AGENT.md](../AGENT.md)。

## tsup 双 bundle（架构契约）

`tsup.config.ts` 照抄标杆，只改 entry 注释里的插件名。双 entry 语义不许合并、不许改格式：

- **Host**：`entry { host: 'src/host/index.ts' }` → `lib/host.js`；`format esm` / `platform node` / `target node20` / `bundle true` / `splitting false` / `treeshake true` / `dts false` / `sourcemap false` / `minify false` / `clean false` / `outExtension { js: '.js' }`。第三方（schemastery 等）走 `noExternal: [...]` **内联进 bundle**——运行时零依赖就靠这一行。全仓当前的内联清单：`['@deepseek-ai/schemastery', '@deepseek-ai/cosmokit', '@standard-schema/spec']`（mcp-manager 另加 `'yaml'`）。
- **Client**：`entry { client: 'src/client/index.ts' }` → `lib/client.js`；`format iife` / `platform browser` / `target es2020`，`external: ['react', '@deepseek-ai/dsh-client-ui-primitives']`——这两个由 DSH 运行时注入，**绝不打包**（否则体积爆炸 + 双 React）。
- `dts: false` 是故意的：tsup 8 的 dts 与 TS 7 不兼容（与 typescript-eslint 同一个病，见 docs/quality-gates.md）。以后补类型用 api-extractor，**不要自己把 `dts` 打开**（打开即挂 build）。
- `clean: false` + 双 entry 分两次写同一 `outDir`：host/client 各写各的文件，`clean true` 会互相删。`minify/sourcemap false`：`lib/` 要可读可审计。
- **`lib/` 已提交是特性不是失误**：DSH `add` 从 git 安装不跑 build。改完 `src` 必须 `pnpm --filter @dshp/<name> build` 重打并把 `lib/` 一起提交；只改 `src` 不提交 `lib/` 的 PR 直接打回。

## 依赖规范

- **运行时依赖 = 0**：`dependencies` 保持 `{}`。host 需要的库（schemastery/cosmokit/spec）全部 `noExternal` 内联；client 需要的 react/primitives 全部 `external` 运行时注入。新增第三方先问：能不能不引？标杆 vision-bridge `http.ts`/`cache.ts` 零依赖手写就是答案（json 应答、同源校验、LRU 缓存都没引库）。
- **dev 依赖最小集**：`tsup` + `typescript`（根）+ 按需 `@types/react` / `@deepseek-ai/schemastery`（mcp-manager 另有 `yaml`，见 docs/package-json.md）。**不许加**：typescript-eslint（8.70 明确不支持 TS 7，等上游）、eslint 全家、webpack/rollup（构建只用 tsup）、任何运行时 polyfill。
- **包管理只用 pnpm**：`pnpm install` / `pnpm --filter` / `pnpm -r`。禁用 npm/yarn。`pnpm-workspace.yaml` 的 `storeDir: /tmp/pnpm-store`、`autoInstallPeers: true`、`strictPeerDependencies: false` **不许改**（沙箱 store 只读，改了装不上；peer 两项已从 `.npmrc` 迁入 workspace yaml——`.npmrc` 只留 registry 注释，避免 npm/nx 报 Unknown project config 警告）。
- **版本跟随标杆**：Node `>=20`（开发用 24，见 `.nvmrc`）、pnpm 11（见根 `devEngines`，`onFail: ignore`——`download` 会让 npm 11.12 在仓库内拦截 npx 包装的 dsh）。升大版本（TS/tsup/oxlint）先在单个插件试点，全绿再推广。
- **禁区**：不许直接编辑 `node_modules/`（pnpm store 硬链接，改坏整个 store）；不许把 `lib/` 加入 `.gitignore`；不许在源码里 `require()` 第三方运行时包。

## 何时必须重打 lib

| 改动                                     | 要重打 `lib/`？ |
| ---------------------------------------- | --------------- |
| `src/**`（host 或 client）               | 是              |
| `tsup.config.ts` / `package.json` 构建项 | 是              |
| `scripts/**` / `README.md` / `docs/`     | 否              |
| 根配置（tsconfig / oxlint / prettier）   | 是（保险起见）  |

一句话：**PR 里 `src` 与 `lib` 必须同进同出**。
