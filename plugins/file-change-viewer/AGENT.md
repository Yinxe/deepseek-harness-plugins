# plugins/file-change-viewer — 局部规则

> 接管工具行渲染（keyed 槽位影子化）的标杆。上层：[根 AGENT.md](../../AGENT.md) → [docs/](../../docs/)。本文只写本插件自己的事实与局部约定。

## 身份

| 项       | 值                                                                                                    |
| -------- | ----------------------------------------------------------------------------------------------------- |
| 包名     | `@dshp/file-change-viewer`                                                                            |
| NS       | `dshp-file-change-viewer`（四处同名）                                                                 |
| 设置节   | `settings.section` order **31**，label「文件修改卡片」                                                |
| 接管槽位 | `tool.call.toolview` keyed：`edit` / `write` / `str_replace_editor` / `patch`，影子化 priority **-1** |
| inject   | `['webServer']`（settings/tools/fs 走可选注入）                                                       |
| 原实现   | 无（本仓原生），`patch` 工具语法移植自 opencode `apply_patch`                                         |

## 结构与职责

- `src/host/`：`index.ts`（apply：settings NS + 三路由 + patch 工具动态开关）/ `config.ts` / `routes.ts`（state / config / locate）/ `patch-tool.ts`（`*** Begin Patch` 工具）/ `sandbox-escalation.ts`（官方沙箱逻辑的等价移植，**不 import 官方包**，只依赖 `ctx.get('sandboxPolicy')` / `ctx.get('approval')` 服务接缝）。
- `src/shared/apply-patch.ts`：补丁解析/应用纯函数——Host 落盘与 Client 预览**共用同一解析器**，保证「模型看到的预览」与「真正写进去的」一致。
- `src/client/`：`FileChangeRow.ts`（工具行）/ `diff.ts`（LCS 三口径：raw/rows/changed）/ `locate.ts`（真实行号 + 上下文批量查询）/ `prefs.ts`（偏好 store）。

## 本插件的局部规则

1. **影子化优先级取 `-1` 是有意的**：官方内置行注册 priority 0，接管必须更小；但动态 Cordis 插件的影子优先级也从 -1 起分配——同值撞车会明确抛错打日志，而不是悄悄失效。同 key 同 priority 直接抛错是槽位语义，不是 bug。
2. **统计三口径统一**：行头/卡头统计、高亮视图、± 差异视图永远用同一次 LCS 的结果（`changed` 口径），「只改一行」报 `+1 -1` 而不是工具原文的 `+7 -7`。
3. **行号不许编**：patch 工具带真实 `startLine`；edit/write 靠 `locate` 路由拿文件内容定位；都拿不到退回 1 起。定位不到就不补上下文（宁可朴素，不编内容）。
4. **`patch` 工具只做新建/修改**：`*** Delete File:` / `*** Move to:` 解析层认识、执行层明确拒绝并指路 `bash rm/mv`（删除改名不可逆，且「全有或全无」只覆盖验证阶段）；落盘前全量内存应用（一处失败一个字节不写），写前批量预检越界目标。
5. **删除/改名段落在客户端仍画出来**（卡头 `旧 → 新` + rejected 角标）——用户要看到模型想干什么。
6. **`patchTool` 开关的时序护栏**：判定注册与否要问 settings 服务权威值（`settings.get(NS)`），不能只信 `setSource` thunk——attach/detach 时服务会用「只有 base 层」的源回调一次，只看 thunk 会误反注册（真实会话表现为 `unknown tool "patch"`）。`scripts/check-host.mjs` 有断言守着。
7. **BOM 与行尾保持**：CRLF 归一后应用、写回恢复整份 CRLF；带 BOM 的文件改完 BOM 还在（readText 会吃掉 BOM，写回前探测补上，且不补第二个）。
8. **失败诊断给「最像的真实行」**：`applyChunksToText` 失败时在文件里找相似度最高的行，回行号 + 原文 + 差在哪（缩进/行内空白/标点），让模型照抄就能过；只在失败路径跑、有行数上限（2 万行以上不扫）。

## 自检

`pnpm --filter @dshp/file-change-viewer test` = `node --check` 双 bundle + `check-host.mjs`（158 项：NS/路由/工具动态开关/全有或全无/locate 单次读）+ `check-patch.mjs`（74 项：五级模糊定位/信封诊断/失败诊断）+ `check-client.mjs`（167 项：无头渲染含迷你 React，验证偏好生命周期）。
