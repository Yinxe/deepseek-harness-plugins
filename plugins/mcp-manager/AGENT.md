# plugins/mcp-manager — 局部规则

> 上层：[根 AGENT.md](../../AGENT.md) → [docs/](../../docs/)。本文只写本插件自己的事实与局部约定。

## 身份

| 项       | 值                                                                      |
| -------- | ----------------------------------------------------------------------- |
| 包名     | `@dshp/mcp-manager`                                                     |
| NS       | `dshp-mcp-manager`（四处同名）                                          |
| 设置节   | `settings.section` order **30**，label「MCP」                           |
| 管理对象 | profile 的 `cordis.patch.yml` 里 `@deepseek-ai/dsh-mcp-client` 实例条目 |
| 原实现   | 无（本仓原生）                                                          |

## 结构与职责

- `src/host/`：`patchdoc.ts` / `patchfile.ts`（定位/回写 patch 文件）/ `probe.ts`（探活）/ `config.ts` / `http.ts` / `index.ts` / `types.ts`。
- 路由面：`GET state` + `POST config / create / update / toggle / remove / probe`（见 [docs/ext-routes.md](../../docs/ext-routes.md) 一览）。
- Client：设置页表单 + JSON 双模式编辑。

## 本插件的局部规则

1. **回写保注释**：patch 文件是用户可手工维护的装配清单，回写必须保留文件其余内容（注释、`!!js`、排版）——整文件重新序列化不可接受。
2. **原子落盘三步**：先备份 `.bak` → 写临时文件 + rename → 回写前序列化自校验（不可重解析或条目数变化即拒绝写盘）。
3. **故意不注册模型工具**：patch 文件是 DSH 的装配清单，增删 MCP 实例必须由人完成（见 [docs/security.md](../../docs/security.md) 写路径防护节）。
4. **探活只碰 streamable-http**：发一次 initialize 握手即止；stdio 不 spawn（子进程有副作用）。
5. **唯一允许的额外 dev 依赖**：`yaml`（解析/回写 patch 文件必需，构建期内联进 lib，运行时仍零依赖）——其他插件不得效仿（见 [docs/package-json.md](../../docs/package-json.md)）。

## 自检

`pnpm --filter @dshp/mcp-manager test` = `node --check` 双 bundle + `scripts/patchdoc.test.mjs`（patch 定位/回写/自校验）。
