# AGENT.md — dsh 插件 monorepo 开发规范

> 仓库：`deepseek-harness-plugins`（pnpm workspaces + TypeScript ESM）。
> 唯一标杆实现：`plugins/vision-bridge`（`@dshp/vision-bridge`）。**新插件有疑问时先读它，再读本文。**
> 阅读顺序：本文件 → 根 `README.md` → `plugins/vision-bridge/README.md` → `plugins/vision-bridge/src/host/*.ts` → `src/client/*.ts` → `tsup.config.ts`。

## 0. 一句话总纲

- **运行时零依赖**：`lib/host.js` 单文件 ESM、`lib/client.js` 单文件 IIFE，`dependencies` 永远 `{}`，第三方全部打包时内联或声明为运行时注入。
- **`lib/` 必须提交**：DSH 从 git 直接安装，不跑 build，没有 `lib/` 就装不上。
- **所有副作用可逆**：Host/Client 的一切注册都走 `ctx.effect(..., 'label')`，带可读 label，stop/update 自动清理。
- **外部输入全部消毒**：tool 参数、路由 body、settings patch、文件回读，逐字段校验 + 截断，不信任任何 `any`。
- **门禁全绿才合**：`format:check → lint → typecheck → build → test`，见 §12。

---

## 1. 目录与脚手架规范

### 1.1 固定布局（照抄 vision-bridge）

```
plugins/<name>/
├── package.json          # §3
├── tsconfig.json         # §2.1（extends 固定 ../../tsconfig.base.json）
├── tsup.config.ts        # §4（host + client 双 entry）
├── cordis.patch.yml      # bundle 声明，`- insert: [{ id, name }]`
├── src/
│   ├── host/             # Node 侧：index.ts（apply）+ types.ts + 按职责拆模块
│   │   └── index.ts / types.ts / config.ts / cache.ts / http.ts / vision.ts ……
│   └── client/           # 浏览器侧：index.ts（__ModuleLoader__）+ types.ts + api/styles/components/Section
│       └── index.ts / types.ts / api.ts / styles.ts / components.ts / <X>Section.ts ……
├── lib/                  # 构建产物，必须提交：host.js + client.js
└── README.md             # §13
```

### 1.2 加新插件（5 步）

```bash
mkdir -p plugins/<name>/src/{host,client}
# 1. 照抄 plugins/vision-bridge/{package.json,tsconfig.json,tsup.config.ts}
# 2. 改 package.json：name（@dshp/<name>）、version（从 0.1.0 起）、description、
#    repository.directory、dsh.bundle.patch 路径
# 3. 改 tsup.config.ts 里的 entry 路径与注释（结构不变）
# 4. 写 cordis.patch.yml：id 用短横线小写（与 settings NS 同名，§6.1），name 用包名
# 5. 根 tsconfig.json references 加 { "path": "./plugins/<name>" }
pnpm install
pnpm --filter @dshp/<name> build && pnpm --filter @dshp/<name> typecheck
```

- 目录名用短横线小写（`vision-bridge`），包名用 `@dshp/<目录名>`。
- host 入口永远 `src/host/index.ts`，client 入口永远 `src/client/index.ts`。
- 根 `tsconfig.json` 是 solution 引用聚合，新插件必须登记，否则 `pnpm typecheck` 漏检。

---

## 2. TypeScript 规范

### 2.1 tsconfig（不许自创）

- 根 `tsconfig.base.json` 是唯一真实配置：`target ES2022` / `module+moduleResolution NodeNext` / `strict` 全开 + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes` + `noFallthroughCasesInSwitch` + `noImplicitOverride` + `isolatedModules` + `verbatimModuleSyntax` + `noEmitOnError`。**不许在插件里放宽任何一项**，有报错就修代码，不改配置。
- 插件 `tsconfig.json` 只允许比标杆多两行（client 需要）：
  ```json
  {
    "extends": "../../tsconfig.base.json",
    "compilerOptions": { "noEmit": true, "jsx": "react-jsx", "lib": ["ES2022", "DOM", "DOM.Iterable"] },
    "include": ["src", "tsup.config.ts"],
    "exclude": ["node_modules", "lib", "dist"]
  }
  ```
  纯 host 插件可以不要 `jsx`，但 `noEmit/include/exclude` 格式照抄。

### 2.2 类型策略（AnyCtx + 自有类型严格）

DSH 运行时（`ctx / tools / llm / settings / webServer / slots`）**暂无官方 npm 类型包**，统一约定：

```ts
// src/host/types.ts（每个插件必须有）
export type AnyCtx = any;
export type AnySettings = any;
export type AnyLlm = any;
```

- `AnyCtx` 只用于**运行时透传对象**（ctx、service、event payload）。**自有数据结构必须严格建模**：`PluginConfig`、`VisionRoute`、`ImageRef`、tool 参数、路由协议（参考 `host/types.ts` + `client/types.ts`，client 与 host 的路由协议类型保持对齐）。
- `noUncheckedIndexedAccess` 下，`arr[0]` 是 `T | undefined`：用 `as` 收窄前先判空，或写 `const first = models[0] as CandidateModel` 并前置 `length` 检查（照抄 `vision.ts` / `index.ts` 的写法）。
- `exactOptionalPropertyTypes` 下，可选字段赋值 `undefined` 即错：用 `Object.hasOwn` 逐字段覆盖（照抄 `index.ts` 的 patch 合并），不要 `{...patch}` 一把梭。
- 类型守卫就地写：`isRecord(v): v is Record<string, unknown>`，每个 host 模块各持一份，不跨包共享（见 `config.ts`/`cache.ts`/`vision.ts` 顶部）。

### 2.3 import / 模块风格

- 全仓 ESM：`package.json` 必须 `"type": "module"`；**相对导入一律带 `.js` 后缀**（`from './config.js'`），哪怕源文件是 `.ts`。这是 NodeNext 的硬要求，漏后缀 build 能过、运行时挂。
- `verbatimModuleSyntax`：类型导入必须 `import type { X } from ...`，值和类型混写会被打回。
- `isolatedModules`：不许 `export =` / 常量枚举，`const enum` 禁用。
- host 按职责拆文件：`index.ts` 只做装配（apply + 注册），`types.ts` 类型，`config.ts` 默认值+schema+迁移，`http.ts` 路由小工具，`cache.ts` 状态，业务逻辑独立文件。**单个文件超过 ~600 行就拆**（标杆 `index.ts` 627 行是上限，不是目标）。
- client 按层拆：`types.ts`（协议）/ `api.ts`（fetch 封装）/ `styles.ts`（CSS 字符串）/ `components.ts`（Badge/Row/Select/Switch）/ `<X>Section.ts`（业务）/ `index.ts`（loader 注册）。通用小构件进 `components.ts`，别在 Section 里重复造。

### 2.4 代码风格（Prettier 即法律）

`.prettierrc`：`singleQuote` / `trailingComma: all` / `printWidth: 110` / `endOfLine: lf`。`.editorconfig`：utf-8、lf、2 空格、尾换行、去行尾空格。

- 跑 `pnpm format` 写盘，不要手调格式；CI 跑 `format:check`，格式不对直接红。
- 字符串拼接用 `+`（标杆风格，oxlint 下稳定），还是模板字符串——**以所改文件现有风格为准，不混用**。
- 注释：文件头写职责 + 挂载点 + 与标杆/原版的对应关系（照抄 `host/index.ts` 头注释格式）；hack 处写清原因（如 opencode sessionId 透传、`__ModuleLoader__` 全局名）。

---

## 3. package.json 规范（逐字段）

以 `plugins/vision-bridge/package.json` 为模板，只改值不改结构：

| 字段                   | 规范                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`                 | `@dshp/<目录名>`。发包前确认 scope 可用（§14）。                                                                                                                                                                                                                                                                                                                                                                                 |
| `version`              | 新插件 `0.1.0` 起；遵循 semver，breaking 才升 major。                                                                                                                                                                                                                                                                                                                                                                            |
| `type`                 | 必须是 `"module"`。                                                                                                                                                                                                                                                                                                                                                                                                              |
| `main`                 | `"./lib/host.js"`（DSH 加载后端 bundle 的入口）。                                                                                                                                                                                                                                                                                                                                                                                |
| `exports`              | 三项固定：`"."` → `./lib/host.js`，`"./client"` → `./lib/client.js`，`"./package.json"` → `./package.json`。                                                                                                                                                                                                                                                                                                                     |
| `files`                | `["lib", "cordis.patch.yml", "README.md"]`，不多不少。LICENSE 全仓只在仓库根保留一份（MIT），不进子包也不进 `files`。                                                                                                                                                                                                                                                                                                            |
| `engines`              | `"node": ">=20"`。                                                                                                                                                                                                                                                                                                                                                                                                               |
| `scripts`              | 六件套照抄：`dev: tsup --watch` / `build: tsup` / `typecheck: tsc --noEmit` / `clean: rm -rf lib *.tsbuildinfo` / `test: node --check lib/host.js && node --check lib/client.js && echo "syntax ok"` / `prepublishOnly: pnpm typecheck && pnpm build`，外加 `lint: oxlint --deny-warnings --config ../../.oxlintrc.json src tsup.config.ts`。test 有真实逻辑时可追加，但 `node --check` 两行不许删（lib 提交完整性的最后防线）。 |
| `dependencies`         | **永远 `{}`**。运行时零依赖是架构红线，见 §5。                                                                                                                                                                                                                                                                                                                                                                                   |
| `devDependencies`      | 只放构建/类型：`tsup`、`@types/react`（有 client 才要）、`@deepseek-ai/schemastery`（用 settings 才要）。版本用 `^` 跟随标杆。                                                                                                                                                                                                                                                                                                   |
| `repository.directory` | `plugins/<name>`，别忘改（clone 出来的模板指向旧目录是常见 bug）。                                                                                                                                                                                                                                                                                                                                                               |
| `publishConfig`        | `{ "access": "public", "provenance": true }` 照抄（Trusted Publishing 用）。                                                                                                                                                                                                                                                                                                                                                     |
| `dsh.bundle.patch`     | `"./cordis.patch.yml"`；`dsh.client.platform` 为 `"web"`（有 client 才保留整个 `dsh` 块，纯 host 插件删掉 `dsh.client`）。                                                                                                                                                                                                                                                                                                       |

---

## 4. 构建规范（tsup 双 bundle）

`tsup.config.ts` 照抄标杆，只改 entry 注释里的插件名。双 entry 语义是**架构契约**，不许合并、不许改格式：

- **Host**：`entry { host: 'src/host/index.ts' }` → `lib/host.js`；`format esm` / `platform node` / `target node20` / `bundle true` / `splitting false` / `treeshake true` / `dts false` / `sourcemap false` / `minify false` / `clean false` / `outExtension { js: '.js' }`。第三方（如 schemastery）走 `noExternal: [...]` **内联进 bundle**——运行时零依赖就靠这一行。
- **Client**：`entry { client: 'src/client/index.ts' }` → `lib/client.js`；`format iife` / `platform browser` / `target es2020`，`external: ['react', '@deepseek-ai/dsh-client-ui-primitives']`——这两个由 DSH 运行时注入，**绝不打包**（否则体积爆炸 + 双 React）。
- `dts: false` 是故意的：tsup 8 的 dts 与 TS 7 不兼容（与 typescript-eslint 同一个病，见 §12）。以后补类型用 api-extractor，**不要自己把 `dts` 打开**（打开即挂 build）。
- `clean: false` + 双 entry 分两次写同一 `outDir`：host/client 各写各的文件，`clean true` 会互相删。`minify/sourcemap false`：`lib/` 要可读可审计。
- **`lib/` 已提交是特性不是失误**：DSH `add` 从 git 安装不跑 build。改完 `src` 必须 `pnpm --filter @dshp/<name> build` 重打并把 `lib/` 一起提交；只改 `src` 不提交 `lib/` 的 PR 直接打回。

---

## 5. 依赖规范

- **运行时依赖 = 0**：`dependencies` 保持 `{}`。host 需要的库（schemastery/cosmokit/spec）全部 `noExternal` 内联；client 需要的 react/primitives 全部 `external` 运行时注入。新增第三方先问：能不能不引？标杆 `http.ts`/`cache.ts` 零依赖手写就是答案（json 应答、同源校验、LRU 缓存都没引库）。
- **dev 依赖最小集**：`tsup` + `typescript`（根）+ 按需 `@types/react` / `@deepseek-ai/schemastery`。**不许加**：typescript-eslint（8.70 明确不支持 TS 7，等上游）、eslint 全家、webpack/rollup（构建只用 tsup）、任何运行时 polyfill。
- **包管理只用 pnpm**：`pnpm install` / `pnpm --filter` / `pnpm -r`。禁用 npm/yarn。`pnpm-workspace.yaml` 的 `storeDir: /tmp/pnpm-store` 和 `.npmrc`（`auto-install-peers=true`，`strict-peer-dependencies=false`）**不许改**（沙箱 store 只读，改了装不上）。
- **版本跟随标杆**：Node `>=20`（开发用 24，见 `.nvmrc`）、pnpm 11（见根 `devEngines`，`onFail: download`）。升大版本（TS/tsup/oxlint）先在单个插件试点，全绿再推广。
- **禁区**：不许直接编辑 `node_modules/`（pnpm store 硬链接，改坏整个 store）；不许把 `lib/` 加入 `.gitignore`；不许在源码里 `require()` 第三方运行时包。

---

## 6. Cordis Host 插件规范

### 6.1 导出契约（5 件套）

```ts
export const name = '@dshp/<name>'; // = package.json name
export const inject: string[] = ['tools', 'webServer', 'llm']; // 按需删减，只声明真需要的
export { NS, ConfigSchema }; // 用 settings 才导出
export function apply(ctx: AnyCtx, rawConfig: unknown): void {
  /* §6.2–6.6 */
}
```

- `name` 必须等于包名；`cordis.patch.yml` 的 `id` 用短横线小写（`dshp-<name>`），与 settings NS 同名（§7.1）。
- `inject` 只声明**硬依赖**（缺了插件无法工作的 service）。可选 service 一律 `ctx.get()` + 判空，不进 `inject`（否则 service 未挂载时插件无限 waiting）。

### 6.2 apply 结构（顺序固定）

照抄 `host/index.ts` 的分段顺序：① 迁移旧状态（try/catch 包裹）→ ② 合并 `rawConfig` patch → ③ 读持久化做延迟迁移 → ④ `ctx.inject(['settings'], ... installSection ...)` → ⑤ 内部 helpers（getConfig/snapshot/ensureDefaults）→ ⑥ 缓存/监听 → ⑦ 门禁/补丁 → ⑧ systemPrompt → ⑨ tools.register → ⑩ webServer.register。每段一个 `// ── 中文标题 ──` 分隔注释。

### 6.3 服务访问：get 优先，ctx.xxx 只在 inject 后

```ts
const settings = ctx.get('settings') as AnyCtx;   // 可选依赖：判空
if (!settings) throw new Error('中文可操作提示…'); // 或降级，见 §6.6
ctx.inject(['settings'], (sctx) => { sctx.settings.installSection(...); }); // 硬依赖才用
```

- 绝不 `JSON.stringify` 整个 ctx/service（live 对象，dump 即爆栈或泄漏）；只取 leaf 字段，构造成最小 owned 对象（标杆 `copyAttachment` 只取 6 个字段）。
- 运行时 monkey-patch（如 vision-bridge 的 `resolveModelInfo` 接管）必须：保存原函数、`ctx.effect` 返回恢复函数、启动时 `console.info` 一行说明。能用官方事件/hook 就不用 patch。

### 6.4 副作用全部进 ctx.effect（带 label）

```ts
ctx.effect(() => ctx.on('agent/inbox/inserted', handler), 'dshp-<name>: cache inbox images');
ctx.effect(() => slotsOrServerRegister(...), 'dshp-<name>: state route');
```

- 每个 `ctx.on` / `tools.register` / `webServer.register` / `systemPrompt.section` / 样式注入 / 函数 patch 都必须包在 `ctx.effect` 里，label 格式 `'dshp-<name>: 动词 + 对象'`。无 label 的 effect 打回。
- `apply` 顶层**不许抛**：每个注册块独立 `try/catch`，失败 `console.error/warn` 一行中文可操作信息，插件其余功能继续工作（照抄标杆每段末尾的 `catch {/* ignore */}` + 日志）。

### 6.5 数据消毒（sanitize* 是强制函数）

每个插件的 `config.ts` 必须有（照抄标杆签名风格）：

- `sanitizePersisted(raw)`：旧文件回读用——类型不对回默认值，字符串一律 `.slice(0, N)`（route provider 120 / model 200 / 模板 2000），数字 `Math.floor` + 范围夹。
- `sanitizePatchConfig(raw)`：`rawConfig`/路由 body 用——`Object.hasOwn` 逐字段，只收合法值，非法字段静默丢弃（路由场景则抛中文 Error，见 §9）。
- tool `execute` 参数同样逐字段校验：必填缺失/类型不对抛中文 Error，写清“去哪里改”（标杆：`'视觉桥接已在设置页关闭，请先启用后再调用'`）。

### 6.6 日志与错误信息

- 日志前缀统一 `[dshp-<name>]`，`console.info` 记迁移/接管成功，`console.warn` 记降级/重试，`console.error` 记注册失败。启动路径上不超过 3 行日志，别刷屏。
- 抛给模型/用户的 Error 必须中文、可操作、指路（设置页路径 / setting.yml 写法 / 重试动作）。英文技术细节可附在冒号后，但首句必须是人话。

---

## 7. 配置与 settings 持久化规范

### 7.1 命名空间（配置键名唯一范式）

- 配置键名 = NS = `dshp-<name>`（kebab-case，`^[a-z][a-z0-9-]*$`，`http.ts` 的 `settingsNamespace()` 做运行时校验）。
- NS 四处同名：settings 命名空间 / 路由前缀 `/ext/dshp-<name>/*` / `cordis.patch.yml` id / settings.section id。这是定位插件状态的唯一钥匙，改名即 breaking。
- **读写一律以新键名为准**：`installSection(ctx, NS, ...)` 注册、`settings.update(NS, patch)` 写入、`describe()` 里只认 `d.ns === NS`、`getConfig()` 只读 `setSource` 存下的 getter。除 `NS` 定义处与 `LEGACY_SETTINGS_KEYS` 外，**禁止硬编码任何键名字符串**；稳态禁止读写自有文件存配置（`storages/*.json` 只允许一次性迁移读，见 §7.3）。

### 7.2 Schema（schemastery）

```ts
export const ConfigSchema: any = z.object({
  enabled: z.boolean().default(true),
  primary: z.union([VisionRouteSchema, z.const(null)]).default(null),
  detail: z.union([z.const('auto'), z.const('low'), z.const('high')]).default('auto'),
  maxImages: z.number().step(1).min(1).max(8).default(4),
  promptTemplate: z.string().default(''),
});
```

- 每个字段都要 `.default(...)`（与 `DEFAULT_CONFIG` 同值），`installSection(ctx, NS, ConfigSchema, entry, ...)` 四件套照抄。
- 约束进 schema（`min/max/step`、enum 用 `z.const` 联合），不要只在路由里判——settings 页和外部编辑 settings.yaml 都走 schema。
- `setSource` 回调里保存最新 getter（`current = src`），业务永远经 `getConfig()` 读，不直接持有对象（热重载靠它）。
- **固定不变的东西不进 settings**：外部端点、版本号、魔法数字一律写死为具名常量（如 mcwiki-search 的 `API_BASE = 'https://zh.minecraft.wiki/api.php'`，注释写“不可配置，换站改这里重 build”）。settings 只放用户真的会改的东西——每多一个配置项，就是多一份文档、多一个设置页控件、多一处校验。

### 7.3 迁移（一次性，只删不写）

- 新版**不再写任何自有文件**：旧 `storages/*.json` 只读一次 → `settings.update(NS, patch)` → 成功后改名 `.bak`（失败则 `hasMigrated=false` 下次重试）。与默认值一致的旧文件直接 `unlink`。
- settings.yaml 顶层 key 重命名走文本级行替换（保留注释与缩进），新 key 已存在时以新为准、只提示不覆盖（照抄 `migrateYamlNamespaceKey`）。
- 历史 key 记 `LEGACY_SETTINGS_KEYS` 数组（新→旧排序），注释写清每个 key 的版本来源。

---

## 8. 模型工具（tools.register）规范

```ts
ctx.tools.register({
  name: 'vision_describe',            // 动词_名词，全小写下划线
  description: '…何时必须调用…',       // 首句写触发条件（含占位符原文），模型靠它决策
  parameters: { type: 'object', additionalProperties: false, properties: {...}, required: [...] },
  output: { schema: {...}, render: (_args, value) => [{ type: 'text', text: String(...) }] },
  isConcurrencySafe: () => false,     // 除非证明无共享可变状态，否则 false
  async execute(args, exec) { /* 校验 → 取缓存 → 截尾 → 调用 → 返回最小对象 */ },
});
```

- `description` 必须包含触发信号原文（如占位符 `[image omitted because this model accepts text only]`）+ “不要猜图”禁令，否则纯文本模型不会调。
- `parameters`/`output.schema` 都要 `additionalProperties: false` + `required` 显式列；输出只返回契约字段（`{ description, model, fallback_used }`），`render` 转纯文本块。
- `execute` 内：先判总开关 → 校验必填 → `sessionIdOf(exec.agent)` 取会话 → hint 过滤（sha 前缀优先、序号其次，非法 hint 忽略不抛）→ `maxImages` 截尾取最新 → 主→备 fallback（备与主相同则跳过）→ 空结果/调用失败抛中文 Error。
- 图片/附件只存 **owned copy**（`attachmentId/mediaType/bytes/width/height/name`），会话级 LRU（每会话 ≤20 张、全内存 ≤50 会话，超限丢最旧）。不存原图 bytes，不落盘。
- 监听补缓存双通道：`agent/inbox/inserted`（同步扫 `message.content`）+ `llm/stream`（扫 `messages[].content`，记得 `return next()`）。扫块递归要处理 `tool-result` 嵌套（照抄 `walkBlocks`）。

---

## 9. 同源 JSON 路由规范（/ext/dshp-<name>/*）

- 路由三件套按需提供：`GET state`（模型列表+配置快照）/ `POST config`（保存补丁）/ `GET check`（探活）。kind 一律 `'exact'`，逐个 `ctx.effect` 注册。
- 每个 handler 第一行 `if (!sameOrigin(req)) return json(res, 403, ...)`。`sameOrigin`/`json`/`readBody` 从自有 `http.ts` 导入（各插件独立持有，不跨包 import）。
- `json()` 必须带 `cache-control: no-store`；`readBody` 默认 1MB 上限，超限 `payload-too-large`。
- `POST config` 流程：`readBody` → `JSON.parse` 失败回 `{ ok:false, error:'请求体不是合法 JSON' }` → `Object.hasOwn` 逐字段校验（非法抛中文 Error 如 `'maxImages 非法，应为 1-8 的数字'`）→ 有补丁才 `settings.update` → 回 `{ ok:true, config: snapshotConfig() }`。**业务错误走 200 + `ok:false`**（前端 `fetchState` 按 `ok` 分支），只把跨站/方法错误走 4xx。
- 字符串截断：provider 120 / model 200 / 模板 2000 / 错误信息 300–500。数字 `Math.floor` 后夹范围。

---

## 10. Client 规范

### 10.1 loader 骨架（照抄 index.ts，一字不改结构）

```ts
loader.load({
  id: PLUGIN_ID,
  factory: (require) => {
    const React = require('react');
    const P = require('@deepseek-ai/dsh-client-ui-primitives');
    // 自有模块内联，react/primitives 绝不打包
    exportsObj.inject = ['slots'];
    exportsObj.apply = (ctx) => {
      /* 样式注入 + slots.inject('settings.section', ...) */
    };
  },
});
```

- `PLUGIN_ID` 必须等于 host 的 `name`（`@dshp/<name>`）。
- **不用 JSX**：全部 `React.createElement`（避免 jsx 运行时配置漂移）。`React`/`P` 由 factory 参数传入，**禁止顶层 `import React`**（打包器会把它打进 bundle）。
- 样式：`document.createElement('style')` + `data-plugin-css="dshp-<name>/settings.css"` + `textContent = CSS`，`ctx.effect(() => () => style.remove(), ...)` 清理。CSS 类前缀用插件缩写（`vb-`），**颜色/字号只用 `var(--dsw-alias-*)` token**（见 `styles.ts`），不许写死色值（深浅主题靠 token 切换）。
- 设置节注册：`slots.inject('settings.section', () => slots.register({ name:'settings.section', id:'dshp-<name>', order: 25, label:'中文名' }, Section))`。`order` 找空位（vision-bridge 占 25，新插件顺延，别撞车）。

### 10.2 Section 组件状态机

`createVisionSection(React, P)` 工厂形态照抄：`useState` 五件套（models/config/loading/saving/error）+ `useEffect` 初次 `load()`。必须覆盖四态：loading（Icon + “正在读取…”）/ error（红字 notice）/ 空列表（warn notice + setting.yml 改法指引）/ 正常表单。

- 下拉用 `components.ts` 的 `Select`（胶囊 `P.Menu`），开关用 `Switch`，状态用 `Badge(kind: ok/warn/muted/info)`。新插件缺构件先看 primitives 有没有，没有才在 `components.ts` 加。
- 保存：即时项直接 `save(patch)`；长文本（textarea）`onChange` 只改本地、`onBlur` 才保存（标杆 promptTemplate 写法）。保存中 `disabled`，失败回 error notice 不丢本地值。
- `api.ts` 三函数形态照抄：`fetchState`（`cache: no-store`）/ `saveConfig`（POST json）/ `checkConnectivity`。BASE 常量 `/ext/dshp-<name>` 与 host 对齐，类型从 `client/types.ts` 来。

### 10.3 多供应商插件的分层渲染（provider 型插件必读）

插件若按「供应商/后端类型」维度扩展（token-meter 的额度、search-provider 的搜索源），
**数据与 UI 都按 provider 分层**：Host 适配器 return 自己的数据，Client 侧每个 provider
有**一套属于自己的完整 UI**，通用零件抽出来复用。标杆：`plugins/token-meter`
（`src/host/providers/*` + `src/client/providers/*`）。

```
Host    host/providers/<type>.ts      适配器 return 自己的数据（view/billing/windows/extra）
Client  client/providers/ui/<type>.ts **该供应商专属的完整 UI**（自由排版，可选）
        client/providers/kit.ts       通用可复用零件（进度条/余额块/指标/图表/失败卡…）
        client/providers/sections.ts  声明式区块渲染（无专属 UI 的 type 零代码可用）
        client/providers/registry.ts  调度：专属 UI → 声明式 → legacy 兜底
```

- **通用零件进 kit，不要重复造**：`RollingBar`（滚动刷新进度条）、`WindowGroup`、
  `BalanceBlock`、`MetricRows`、`SplitBar`、`NoteLine`、`MiniChart`、`Chips`、`ErrorCard`
  - `num/fmt/fmtLeft/curSymbol/remainOf/timeAgo/levelOf`。专属 UI 只写「自己特有的表达」。
- Host 适配器产出 `view`（`windowsSection/balanceSection/metricsSection/progressSection/
splitSection/noteSection/chartSection` + `makeView`）；`quota.ts` 快照前必须过
  `sanitizeView()`（区块数/条目数/字符串长度夹紧，与外部输入同等对待）。
- **双轨兼容**：`defaultView()` 从 legacy 字段兜底推导 view（老适配器零改动升级），
  `viewToExtra()` 把 view 反向补成 legacy extra（新适配器只写 view 也不让旧客户端空白）。
- 专属 UI **出错必须降级**：调度器 try/catch，异常时回落到声明式/legacy，不能白屏。
- 适配器可声明 `defaultParams` 声明「新增该类型时的表单初始值」（如 commandcode 默认
  填 `$COMMAND_CODE_API_KEY`）；**表单字段一律来自 provider 元数据 `fields[]`，禁止在
  client 里按 type 硬编码字段**（会与适配器悄悄漂移）。
- 同类 provider 能合并就合并：token-meter 的 `deepseek-api`/`deepseek-web` 已并入
  `deepseek`（按凭据形态自动选路），旧 type 只留**别名**（`registerAlias`，读路径归一并
  不落库、不改写用户文件），不给用户增加无谓选择。

### 10.4 失败提示必须结构化、可操作（provider 型插件必读）

拉取失败不能只把原始异常丢给用户。标杆：`token-meter` 的 `host/errors.ts` +
`client/ErrorBox.ts`。要点：

- **适配器抛 `ProviderError(kind, msg, opts)`** 显式声明原因，`kind` 取
  `auth | session | plan | balance | rate | network | parse | config | server | unknown`；
  不要在适配器里写用户可见的长文案 —— 分类由 `toErrorInfo()` 统一补齐
  「标题 + 解释 + 去哪改 + 排查步骤 + 严重度 + 是否可重试」。
- **分类优先于文案**：老适配器/未知错误走 `classifyMessage()` 正则兜底。易错点：
  HTTP 200 + 错误信封（如 DeepSeek 的 `40003 invalid token`）必须显式识别，否则会被
  宽泛的 `invalid.*token` 正则误判成「密钥失效」——`session` 的判定要排在 `auth` 前面。
- **重试语义要克制**：`retriable` 表示「不改任何东西、直接重试有意义」。
  密钥/会话/订阅/余额类 = `false`（UI 显示「已处理，验证」而非「重试」）；限流/网络/5xx = `true`。
  默认值由分类决定，`ProviderError` 未显式声明时**不要**强行置 true。
- **异常包装不要吞分类**：`catch (e) { throw new Error(msg) }` 会丢掉 `kind`，必须
  `if (e instanceof ProviderError) throw e;` 原样透出。
- 结构化信息随快照下发（`snap.errorInfo`），客户端只按 `kind` 上色渲染，不认识供应商；
  状态点着色与卡片配色同源（要人管的红、临时性黄）。

---

## 11. 安全规范

- 同源：所有 `/ext/*` 先 `sameOrigin`；state 接口 `no-store`。
- 输入：路由 body 限 1MB；一切字符串入库前截断；`maxImages` 类数字夹范围；非法 hint/补丁宁可忽略/报错，不可拼进 prompt 或文件名。
- 密钥：**不许在代码/注释里放任何密钥、token、内网地址**；插件配置只存路由选择（provider/model），不存口令。
- 最小暴露：缓存只存 leaf owned copy；tool 输出只给 `{ description, model, fallback_used }`；日志不打图片内容、prompt 全文、用户原文（最多打长度/计数）。
- 卸载干净：`ctx.effect` 清理一切（样式、路由、patch、section）；不在 DSH 目录外写文件；迁移备份只留一个 `.bak`。

---

## 12. 质量门禁（CI 顺序即本地顺序）

本地提交前跑全套（与 `.github/workflows/ci.yml` 同序）：

```bash
pnpm format:check   # prettier 只检查不写；红了跑 pnpm format
pnpm lint           # oxlint --deny-warnings，警告也算挂
pnpm typecheck      # pnpm -r typecheck（solution 引用全跑）
pnpm build          # pnpm -r build（确认 lib/ 重新打出）
pnpm test           # pnpm -r test（至少 node --check 双 bundle）
```

- 工具选型已定：格式化 Prettier、质量 oxlint（`.oxlintrc.json`，correctness 当 error）。**不要引入 typescript-eslint**（8.70 不支持 TS 7，等上游跟上再说）。全仓仅有的两处 rule-off（`unicorn/consistent-function-scoping`、`eslint/no-underscore-dangle`）是故意的，新插件不许加第三处——需要的先提 issue 讨论。
- 单个插件迭代：`pnpm --filter @dshp/<name> build/typecheck`；编辑器装 Prettier + oxlint 插件，保存自动修。
- `pnpm install` 用 `--frozen-lockfile`（CI 语义）；改依赖必须提交 `pnpm-lock.yaml`。

---

## 13. 文档规范（每个插件 README.md）

**章节顺序（安装前置，用户第一眼就能装上）**：

````
# @dshp/<name>                  标题 = 包名
简介段（一句话说清「干什么、解决什么」）+ 设计原则 blockquote
## 安装（唯一方式：克隆 monorepo + 本地安装）   ← 必须紧跟简介，不许后置
    克隆/install/add/重启四步 + 「改源码后」+「验证」+ 一键 AI 安装话术块（```text）
## 更新
## 界面预览        （有 images/ 才写：截图 + 说明，用 <images/xxx.png> 尖括号语法吃空格）
## 功能            四行表：Host / Client / 同源路由 / 工具
## 配置项 / tool 参数表 / setting.yml 示例
## 代码结构 → 常见问题 → 卸载
## 移植说明        （monorepo 定位 + 原版逐文件对应关系，开发向信息后置）
## 免责声明
````

- 安装四步固定文案：`git clone … && pnpm install` → `dsh plugin --profile web add ./plugins/<name>` → `dsh web`；注明「lib/ 已提交，无需 build」与「唯一方式：本地装，不能 `pnpm add`」。
- 移植说明（原 JS 仓库 → TS 文件的逐文件对应、构建命令）**放文末**，不要占开头位置。
- 一键 AI 安装话术块给 ```text 代码块，写清子目录名与包名，便于直接粘给 DSH AI。

**根 README** 负责「找插件 + 装插件」：插件一览表（每行链到该插件 README）→ 截图预览（引用 `plugins/<name>/images/*`）→ 安装到 DSH（含一键 AI 安装）→ 结构 → 环境 → 常用命令 → 加新插件。不写单个插件的功能细节（细节归各自 README；门禁以 ci.yml 为准，版本/tag 政策见 §14，发布流已下线不写）。

---

## 14. 版本、兼容与发布

- main 永远跟最新 DSH。`compat.json` 为空是正常态（暂无历史包袱）。
- DSH 发新版且有 breaking：当前 main 打 annotated tag `v<根版本>`（message 写 DSH 版本）→ `compat.json` 追加一行 → 再在 main 上适配。平时不打 tag。老 DSH 用户按 `compat.json` `git checkout <tag>`。
- 发 npm（已下线，暂不做）：发布流在 `de6ab3c` 下线，当前 `.github/workflows/` 只有 `ci.yml`，README 安装节写的是“只能本地装”。将来要重新启用：重建 `.github/workflows/publish.yml`（tag `v*` 触发 → `pnpm -r publish --provenance`，Trusted Publishing 免 Token），npm 建组织 `dshp`（公有包免费）或改名到个人 scope，每个包配 Trusted Publisher。未重建前不要写“打 tag 即发布”。
- 发版 checklist：`format/lint/typecheck/build/test` 全绿 → `lib/` 已重打并提交 → 插件 README 安装/更新节已同步 → 版本号已升 →（发包时）tag 已打。

---

## 15. 禁止事项（打回清单）

1. `dependencies` 非空；把 react/primitives 打进 client bundle。
2. `lib/` 未提交、或 `src` 改了 `lib` 没重打。
3. 自创 tsconfig / 放宽 strict / 新加 oxlint rule-off。
4. 用 JSX、顶层 `import React`、写死颜色值、不用 `dsw-alias-*` token。
5. 副作用不用 `ctx.effect`、effect 无 label、`apply` 顶层可抛。
6. `JSON.stringify` 整个 ctx/service；缓存原图 bytes；日志打用户原文。
7. 路由无 `sameOrigin`、body 无上限、字符串入库不截断。
8. 直接改 `node_modules`、改 `storeDir`/`.npmrc`、用 npm/yarn 安装。
9. 不跑门禁就 push；`pnpm-lock.yaml` 没提交。
10. 在代码里放密钥；新增自有配置文件（配置只进 settings.yaml NS）。
11. 子包自带 LICENSE / `files` 含 LICENSE（LICENSE 只在仓库根保留一份，全仓 MIT 共用）。
12. 稳态读写用旧配置键名、硬编码键名字符串、写自有文件存配置（读写一律 `NS` 常量 + settings.yaml 新键，见 §7.1）。
