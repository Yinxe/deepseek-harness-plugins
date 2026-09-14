# TypeScript 与代码风格

> 本文承接旧 AGENT.md §2（TypeScript 规范）的完整细节。规则版总纲见[仓库根 AGENT.md](../AGENT.md)。

## tsconfig（不许自创）

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

## 类型策略（AnyCtx + 自有类型严格）

DSH 运行时（`ctx / tools / llm / settings / webServer / slots`）**暂无官方 npm 类型包**，统一约定：

```ts
// src/host/types.ts（每个插件必须有）
export type AnyCtx = any;
export type AnySettings = any;
export type AnyLlm = any;
```

- `AnyCtx` 只用于**运行时透传对象**（ctx、service、event payload）。**自有数据结构必须严格建模**：`PluginConfig`、`VisionRoute`、`ImageRef`、tool 参数、路由协议（参考 `host/types.ts` + `client/types.ts`，client 与 host 的路由协议类型保持对齐）。
- `noUncheckedIndexedAccess` 下，`arr[0]` 是 `T | undefined`：用 `as` 收窄前先判空，或写 `const first = models[0] as CandidateModel` 并前置 `length` 检查（照抄 vision-bridge `vision.ts` / `index.ts` 的写法）。
- `exactOptionalPropertyTypes` 下，可选字段赋值 `undefined` 即错：用 `Object.hasOwn` 逐字段覆盖（照抄 `index.ts` 的 patch 合并），不要 `{...patch}` 一把梭。
- 类型守卫就地写：`isRecord(v): v is Record<string, unknown>`，每个 host 模块各持一份，不跨包共享（见 vision-bridge `config.ts`/`cache.ts`/`vision.ts` 顶部）。

## import / 模块风格

- 全仓 ESM：`package.json` 必须 `"type": "module"`；**相对导入一律带 `.js` 后缀**（`from './config.js'`），哪怕源文件是 `.ts`。这是 NodeNext 的硬要求，漏后缀 build 能过、运行时挂。
- `verbatimModuleSyntax`：类型导入必须 `import type { X } from ...`，值和类型混写会被打回。
- `isolatedModules`：不许 `export =` / 常量枚举，`const enum` 禁用。
- host 按职责拆文件：`index.ts` 只做装配（apply + 注册），`types.ts` 类型，`config.ts` 默认值+schema+消毒，`http.ts` 路由小工具，`cache.ts` 状态，业务逻辑独立文件。**单个文件超过 ~600 行就拆**（标杆 `index.ts` 627 行是上限，不是目标）。
- client 按层拆：`types.ts`（协议）/ `api.ts`（fetch 封装）/ `styles.ts`（CSS 字符串）/ `components.ts`（Badge/Row/Select/Switch）/ `<X>Section.ts`（业务）/ `index.ts`（loader 注册）。通用小构件进 `components.ts`，别在 Section 里重复造。

## 代码风格（Prettier 即法律）

`.prettierrc`：`singleQuote` / `trailingComma: all` / `printWidth: 110` / `endOfLine: lf`。`.editorconfig`：utf-8、lf、2 空格、尾换行、去行尾空格。

- 跑 `pnpm format` 写盘，不要手调格式；CI 跑 `format:check`，格式不对直接红。
- 字符串拼接用 `+`（标杆风格，oxlint 下稳定），还是模板字符串——**以所改文件现有风格为准，不混用**。
- 注释：文件头写职责 + 挂载点 + 与标杆/原版的对应关系（照抄 `host/index.ts` 头注释格式）；hack 处写清原因（如 opencode sessionId 透传、`__ModuleLoader__` 全局名）。

## oxlint

- 配置在根 `.oxlintrc.json`：correctness 当 error、suspicious 当 warn，`--deny-warnings` 下两者都算挂。
- 全仓仅有的两处 rule-off（`unicorn/consistent-function-scoping`、`eslint/no-underscore-dangle`）是故意的，新插件不许加第三处——需要的先提 issue 讨论。
