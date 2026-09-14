# 构建与依赖

> 本文承接旧 AGENT.md §4（构建规范）与 §5（依赖规范）的完整细节。规则版总纲见[仓库根 AGENT.md](../AGENT.md)。

## tsup 双 bundle（架构契约）

**机制在 [`shared/tsup.preset.ts`](../shared/tsup.preset.ts) 一处，包内只声明「我是谁」**：

```ts
// plugins/<name>/tsup.config.ts —— 全部内容
import { pluginBuild } from '../../shared/tsup.preset.js';

export default pluginBuild('@dshp/<name>');
```

这是照参考项目 dsh-web 的分层：那边 20 个包的 `tsdown.config.ts` 大多只有 11–22 行，全部委托给
`shared/tsdown.client.ts`。**不要把预设复制进包**——8 份要同步的副本就是 8 个漂移源。有插件专属
需求就加进 `pluginBuild` 的选项（`host` / `client` / `inline` / `external`）。

预设产出两个 bundle：

- **Host**：`src/host/index.ts` → `lib/host.js`；`format esm` / `platform node` / `target node20` / `bundle true` / `splitting false` / `treeshake true` / `dts false` / `sourcemap false` / `minify false` / `clean false`。第三方（schemastery 等）走 `noExternal` **内联进 bundle**——运行时零依赖就靠这一行。默认内联清单 `['@deepseek-ai/schemastery', '@deepseek-ai/cosmokit', '@standard-schema/spec']`（mcp-manager 用 `inline` 选项另加 `'yaml'`）。
- **Client**：`src/client/index.tsx` → `lib/client.js`；`format cjs` / `platform browser` / `target es2020` / `treeshake false`，`external: ['react', 'react/jsx-runtime', '@deepseek-ai/dsh-client-ui-primitives']`，再用 banner / footer 把 loader 注册壳拼出来。三条约束缺一不可：
  - **`format` 必须是 `cjs`**。只有 CJS 才把 external 的 import 编译成 `require('react')`，而 factory 的形参 `require` 正是 shell 冻结模块表给的解析器；`iife` 会去找全局变量，拿不到。
  - **`react/jsx-runtime` 必须在 `external` 里**。源码写 JSX（automatic runtime），编译产物 import 的是它，漏了就会被内联进 bundle。
  - **`treeshake: false`**。它会在 esbuild 产物上再跑一遍 rollup，容易把 banner/footer 拼出来的 CJS 壳搅碎；这个 bundle 只有本插件自己的模块，没什么可摇的。

- `dts: false` 是故意的：tsup 8 的 dts 与 TS 7 不兼容（与 typescript-eslint 同一个病，见 docs/quality-gates.md）。以后补类型用 api-extractor，**不要自己把 `dts` 打开**（打开即挂 build）。
- `clean: false` + 双 entry 分两次写同一 `outDir`：host/client 各写各的文件，`clean true` 会互相删。`minify/sourcemap false`：`lib/` 要可读可审计。
- **`lib/` 已提交是特性不是失误**：DSH `add` 从 git 安装不跑 build。改完 `src` 必须 `pnpm --filter @dshp/<name> build` 重打并把 `lib/` 一起提交；只改 `src` 不提交 `lib/` 的 PR 直接打回。

### CSS Modules 的内联（预设里那块 esbuild 插件）

产物的硬约束是**只有一个 JS 文件**：插件不能带第二个 HTTP 资源。所以 `*.module.css` 由预设里的
`dsh-css-modules-inline` 插件在构建期编译好，把**样式文本与类名映射一起塞进 bundle**，模块被求值时
就地插一条 `<style data-plugin-css>`——与官方插件完全同构（实测 `@deepseek-ai/dsh-client-ui-skill`
等内置包的 `lib/client.js` 就是这么干的，包里没有任何 `.css`）。

用 **lightningcss** 而不是 esbuild 自带的 css loader：后者的 CSS Modules 只会把样式写进独立的 CSS
产物，拿不到「文本 + 类名映射」这一对。`lightningcss` 与 `tsup` 都声明在**仓库根**的
devDependencies（预设位于 `shared/`，依赖解析向上走到根 `node_modules`），各插件不必重复声明。

这块有三个**踩过才知道的坑**，改预设时别踩回去：

| 坑                                                  | 症状                                                                                                                                                                                                                                     | 解法                                                                                                                                                                                                                                                       |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 在 `esbuildOptions` 里往 `options.plugins` 追加插件 | 插件**完全不生效**且不报错                                                                                                                                                                                                               | 必须用 tsup 顶层的 `esbuildPlugins`。`esbuildOptions` 是在一个名为 `modify-options` 的插件里执行的，那时 esbuild 的插件列表已经定下来了                                                                                                                    |
| 虚拟模块 id 以 `.css` 结尾                          | tsup 内置的 postcss 插件（注册的是**不带 namespace** 的 `onLoad`，而 esbuild 里不写 namespace = 匹配任意 namespace，且它排在前面）把模块抢走，按普通 CSS 输出成 `lib/client.css`，全程不报错                                             | 虚拟 id 后缀用 `.mjs`。dsh-web 的预设里有同一句注释                                                                                                                                                                                                        |
| 喂给 lightningcss 的 `filename` 里**没有插件 id**   | 8 个插件的样式表相对路径都是 `src/client/styles.module.css`，`[hash]` 于是**每个插件都算出同一个** `<hash>_<local>`；而 `.card` / `.title` / `.body` / `.stat` / `.desc` 这种局部名天然重名 → **谁后注入谁覆盖，样式在插件之间互相串味** | `filename` 用 `<包名>/<相对路径>`（`id + '/' + assetId`）。别退回成只传相对路径——真实踩过：token-meter 的 `.stat{display:flex;flex-direction:column;border-radius:12px}` 把 file-change-viewer 行头那对 `+N -M` 统计打成了上下两行，还带上了别人的卡片边框 |

> 第三个坑是**结构性的**：只要 `filename` 相同，`[hash]_[local]` 就一定产出相同类名，而插件之间
> 局部名重名是常态（8 个插件里有 6 个同时定义了 `.title`）。它是「注入顺序决定样式」的隐蔽 bug，
> 页面看起来只是「某个角落长得不对」，很难往构建配置上想。改了预设里的 `hashName` 之后，
> 各插件的类名互不相同（可以用 `node .migration/collide.mjs` 那种脚本扫一遍产物验证：跨插件完全同名的类名应为 0）。

另：虚拟 id 的前缀**不要用 rollup 惯例的 `\0`**——esbuild 会把模块 id 原样写进产物的模块分界注释，控制字符就跟着进 `lib/client.js` 了。

## 依赖规范

- **运行时依赖 = 0**：`dependencies` 保持 `{}`。host 需要的库（schemastery/cosmokit/spec）全部 `noExternal` 内联；client 需要的 react/primitives 全部 `external` 运行时注入。新增第三方先问：能不能不引？标杆 vision-bridge `http.ts`/`cache.ts` 零依赖手写就是答案（json 应答、同源校验、LRU 缓存都没引库）。
- **dev 依赖最小集**：插件自己的 `package.json` 只放**该插件用到的东西**：`tsup` + 按需 `@deepseek-ai/schemastery`（mcp-manager 另有 `yaml`，见 docs/package-json.md）。
  写 client UI 的插件另加**类型来源**三件套：`react` / `@types/react`（**跟随运行时**，当前 DSH 内置 React **18.3.1**，故锁 `~18.3.1`；写 19.x 的类型与运行时对不上）/ `@deepseek-ai/dsh-client-ui-primitives`
  （版本**锁死**与运行时同号，如 `0.1.5-rc.1`，不要写 `^`——`^0.1.5-rc.1` 会解析到 rc.2，类型与实际注入的那份可能不同）。
  这些**只参与类型检查与构建**，运行时由 shell 的冻结模块表注入，`dependencies` 仍是 `{}`。
- **构建工具在仓库根，不在插件里**：`typescript` / `tsup` / `lightningcss` 都是 `shared/tsup.preset.ts` 的依赖，声明在根 `package.json`。插件里那个 `tsup` 是给 `pnpm --filter ... build` 用的 bin，**不要**在插件里重复声明 `lightningcss`。
  **不许加**：typescript-eslint（8.70 明确不支持 TS 7，等上游）、eslint 全家、webpack/rollup/vite（构建只用 tsup，见下）、任何运行时 polyfill。
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
