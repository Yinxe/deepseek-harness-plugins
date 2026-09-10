# deepseek-harness-plugins

TypeScript + pnpm + Node ESM 项目模板。

## 环境要求

- Node.js >= 20（推荐 24，见 `.nvmrc`）
- pnpm >= 10（当前 11.7.0，见 `package.json > devEngines`）
- Git

## 快速开始

```bash
# 安装依赖
pnpm install

# 开发（热重载）
pnpm dev

# 类型检查
pnpm typecheck

# 构建
pnpm build

# 运行构建产物
pnpm start

# 清理
pnpm clean
```

## 目录结构

```
.
├── src/
│   └── index.ts          # 入口
├── dist/                 # 构建产物（gitignored）
├── tsconfig.json         # TS 配置（NodeNext + ESM + strict）
├── package.json          # pnpm + scripts
├── pnpm-workspace.yaml   # pnpm 工作区 + storeDir + allowBuilds
├── .npmrc                # npm registry 等配置
└── .nvmrc
```

## pnpm 说明（重要）

本沙箱全局 store（`~/.local/share/pnpm/store`）只读，已在 `pnpm-workspace.yaml` 中设置：

```yaml
storeDir: /tmp/pnpm-store
```

- pnpm v11 项目级 `store-dir` 必须写在 `pnpm-workspace.yaml` 里（`storeDir` 驼峰），写在 `.npmrc` 里会被忽略。
- 在你本地机器（全局 store 可写）可删除此行恢复默认。

## TS 说明

- `type: module` + `module/moduleResolution: NodeNext`，原生 ESM
- `strict` 全开 + `noUncheckedIndexedAccess` 等
- `types: ["node"]` + `lib: ["ES2022", "DOM"]`（TS7 + pnpm 下需显式指定 types）
- 输出 `dist/`，含 `.d.ts` + `sourceMap`
