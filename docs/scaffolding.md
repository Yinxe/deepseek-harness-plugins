# 脚手架与目录布局

> 本文承接旧 AGENT.md §1（目录与脚手架规范）的完整细节。规则版总纲见[仓库根 AGENT.md](../AGENT.md)。

## 固定布局（照抄 vision-bridge）

```
plugins/<name>/
├── package.json          # 见 docs/package-json.md
├── tsconfig.json         # 见下文 tsconfig 节
├── tsup.config.ts        # 见 docs/build-and-deps.md
├── cordis.patch.yml      # bundle 声明，`- insert: [{ id, name }]`
├── src/
│   ├── host/             # Node 侧：index.ts（apply）+ types.ts + 按职责拆模块
│   │   └── index.ts / types.ts / config.ts / cache.ts / http.ts / vision.ts ……
│   └── client/           # 浏览器侧：index.ts（__ModuleLoader__）+ types.ts + api/styles/components/Section
│       └── index.ts / types.ts / api.ts / styles.ts / components.ts / <X>Section.ts ……
├── lib/                  # 构建产物，必须提交：host.js + client.js
└── README.md             # 见 docs/documentation.md
```

可选目录（按需，均为约定）：

| 目录          | 用途                                                      | 现有使用者                                                   |
| ------------- | --------------------------------------------------------- | ------------------------------------------------------------ |
| `src/shared/` | Host 与 Client 两份产物都要内联的**纯函数**（如补丁解析） | file-change-viewer                                           |
| `scripts/`    | 无头自检脚本，挂进 `pnpm test`                            | file-change-viewer / mcp-manager / token-meter / web-style   |
| `images/`     | README 截图（配合 `screenshots.json` 清单）               | mcwiki-search / token-meter / web-style / file-change-viewer |

命名约定：

- 目录名用短横线小写（`vision-bridge`），包名用 `@dshp/<目录名>`。
- host 入口永远 `src/host/index.ts`，client 入口永远 `src/client/index.ts`。
- 根 `tsconfig.json` 是 solution 引用聚合，新插件必须登记，否则 `pnpm typecheck` 漏检。

## 加新插件（5 步）

```bash
mkdir -p plugins/<name>/src/{host,client}
# 1. 照抄 plugins/vision-bridge/{package.json,tsconfig.json,tsup.config.ts}
# 2. 改 package.json：name（@dshp/<name>）、version（从 0.1.0 起）、description、
#    repository.directory、dsh.bundle.patch 路径
# 3. 改 tsup.config.ts 里的 entry 路径与注释（结构不变）
# 4. 写 cordis.patch.yml：id 用短横线小写（与 settings NS 同名，见 docs/settings.md），
#    name 用包名
# 5. 根 tsconfig.json references 加 { "path": "./plugins/<name>" }
pnpm install
pnpm --filter @dshp/<name> build && pnpm --filter @dshp/<name> typecheck
```

## 客户端注册槽位与 order 全景

新插件往槽位注册前先看占位，撞车要协商：

| 槽位                            | 谁在用（order / id）                                                                                                                                 |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `settings.section`              | vision-bridge 25 / mcwiki-search 26 / token-meter 27 / search-provider 28 / skill-manager 29 / mcp-manager 30 / file-change-viewer 31 / web-style 50 |
| `conversation.view`             | token-meter 40（中心区 tab，与原生「对话 / 轨迹」并列）                                                                                              |
| `conversation.input.right`      | skill-manager 90（输入框右侧技能按钮）                                                                                                               |
| `conversation.chat.commandview` | mcwiki-search（按命令名 keyed：`/mcwiki`）                                                                                                           |
| `shell.overlay`                 | token-meter（小组件浮层）                                                                                                                            |
| `tool.call.toolview`            | file-change-viewer（keyed：`edit` / `write` / `str_replace_editor` / `patch`，影子化优先级 `-1`）                                                    |

## 标杆与阅读顺序

- 唯一标杆实现：`plugins/vision-bridge`（`@dshp/vision-bridge`）。**新插件有疑问时先读它，再读规范。**
- 阅读顺序：根 `AGENT.md` → 根 `README.md` → `plugins/vision-bridge/README.md` → `plugins/vision-bridge/src/host/*.ts` → `src/client/*.ts` → `tsup.config.ts`。
- provider 型插件（多供应商分层）的第二标杆：`plugins/token-meter`；接管工具行渲染的标杆：`plugins/file-change-viewer`。
