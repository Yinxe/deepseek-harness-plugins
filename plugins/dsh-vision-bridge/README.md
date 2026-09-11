> **Monorepo + TS 版**：本目录是 `deepseek-harness-plugins` monorepo 的标准子项目（`plugins/dsh-vision-bridge`），由 `~/.dsh/plugins/dsh-vision-bridge`（JS，v1.3.2）等价 TS 重写移植。Host 从单文件 `lib/index.js`（816 行）拆为 `src/{types,http,config,cache,vision,index}.ts`，行为逐行对齐；`client.js`（浏览器预打包 bundle）保持原样作为静态资源。

> 构建：`pnpm --filter @dshp-inx/vision-bridge build` → `dist/`；包入口 `dist/index.js`，导出 `{ name, inject, NS, ConfigSchema, apply }` 与原版一致。

# @dshp-inx/vision-bridge

DeepSeek Harness（DSH）**视觉桥接**插件：让**纯文本模型**也能“看图”——当用户消息中出现图片占位符 ` [image omitted because this model accepts text only…]` 时，模型调用 `vision_describe` 工具，插件把**本轮图片原图引用 + 你的提问**一起转交给**多模态视觉模型**去识别，主模型失败时自动用**备用模型重试**。配置在设置页完成并**通过官方 settings API 持久化到 `$DSH_HOME/settings.yaml`（`dshp-inx-vision-bridge` 命名空间）**，支持注释保留与热重载，重启后不丢。旧版 `storages/dshp-inx-vision-bridge.json` / 旧 settings key `vision-bridge` 会在首次启动时自动迁移并备份为 `.bak`。

> 设计原则：**对模型零侵扰、对用户零残留**。图片只取 leaf 字段的 owned copy，会话级 LRU 缓存；无密钥、无外部依赖；卸载即干净。

## 功能

| 部分 | 内容 |
|---|---|
| **Host（`lib/index.js`）** | 注册 `vision_describe` 模型工具；监听 `agent/inbox/inserted` + `llm/stream` 缓存图片（最近 20 张/会话，至多 50 会话）；发现候选视觉模型（`setting.yml` 中 `input: [text, image]` 的模型 + `llm` 服务实时 provider 列表）；`vision_describe` 执行时完成 hint 过滤（sha 前缀或序号）、`maxImages` 截尾、`buildQuestion` 拼装 `detail` + `promptTemplate`、主→备 fallback；注入系统提示引导纯文本模型何时调用工具；暴露同源 JSON 路由供设置页（见下）。**通过官方 `ctx.settings` + `schemastery` 持久化到 `settings.yaml`（`dshp-inx-vision-bridge`），使用 settings 服务的 `installSection` 方法，支持热重载与注释保留，旧文件/旧 key 自动迁移**；接管发送门禁（启用且配好主模型时纯文本模型可直接发图，关闭即恢复）。 |
| **Client（`client.js`）** | 「设置 → 视觉模型」配置页：启用开关、主/备模型下拉（候选来自 Host 发现）、详细度（`auto`/`low`/`high`）、单次最多图片（`1–8`）、追加提示词（失焦保存）、重新读取、检查连通性。UI 全部使用 DSH 官方设计 token（`dsw-alias-*`），与官方设置页风格一致。无额外依赖。 |
| **同源路由** | `GET /ext/dshp-inx-vision-bridge/state`（模型列表 + 当前配置）、`POST /ext/dshp-inx-vision-bridge/config`（保存补丁）、`GET /ext/dshp-inx-vision-bridge/check`（探活主/备路由），均带同源校验（`Origin` 与 `Host` 一致或缺失才放行）。 |
| **工具** | `vision_describe`（见参数表），输出 `{ description, model, fallback_used }`，模型侧渲染为纯文本（`description`）。 |

### 模型工具：`vision_describe`

当你是**纯文本模型**且用户消息中出现 `[image omitted because this model accepts text only…]` 占位符时**必须调用**，不要猜图、不要让用户换模型。

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `question` | `string` | ✅ | 你想从图片中知道什么，例如“描述这张截图里的报错信息”或“转录图片中的全部文字”。 |
| `image_hint` | `string` |  | 可选：只分析某一张图。填占位符里的 sha 前缀（附件 `attachmentId` 前缀）或从 `1` 开始的序号；留空则分析本轮全部图片（受 `maxImages` 截尾）。 |
| `detail` | `enum` |  | 可选：`auto` 常规描述，`low` 简要概括（2–3 句），`high` 逐字转录级详细。不填用设置页的默认值。 |

返回（`output.schema`）：

```json
{
  "description": "视觉模型返回的中文描述（已拼装 detail 后缀与追加提示词）",
  "model": "provider/model",
  "fallback_used": false
}
```

模型侧 `render` 直接展示 `description`，便于在对话流中继续推理。

### 配置项（Host 状态）

| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `enabled` | `boolean` | `true` | 总开关，关闭后 `vision_describe` 直接抛错提示去设置页启用。 |
| `primary` | `{provider, model} \| null` | `null`（首次发现后自动选列表首项） | 主视觉模型。 |
| `fallback` | `{provider, model} \| null` | `null`（自动选第二项） | 备用模型，主失败时重试一次。设为 `null` 表示不重试。 |
| `detail` | `'auto' \| 'low' \| 'high'` | `'auto'` | 默认详细度；`high` 会追加“逐字转录”后缀，`low` 追加“简要概括”。 |
| `maxImages` | `1–8` | `4` | 单次 `vision_describe` 最多喂给视觉模型的图片张数，超出取末尾若干张（最新）。 |
| `promptTemplate` | `string` | `''` | 可选追加提示词，每次识别都会拼在问题末尾（截断 500 字符，存储上限 2000）。例如“重点看报错弹窗里的红字”。 |

> **与动态版的区别**：动态（`cordis_define`）版本的配置只在内存中，重启进程后恢复默认；**标准包版本通过官方 `settings` API 持久化到 `settings.yaml`（`dshp-inx-vision-bridge`）**，重启后不丢，且外部手工编辑 `settings.yaml` 可热重载。

## 安装（推荐：GitHub）

```sh
dsh plugin --profile web add github:Yinxe/dsh-vision-bridge
```

`dsh plugin` 把参数转发给 profile 目录里的 `pnpm`，装完自动把插件写进 profile 的 `dsh.profile.bundles` 挂载列表 —— **无需手动改任何配置文件**。

**一键 AI 安装**：把下面这段直接发给你的 DSH AI（复制即用，无需修改）：

```text
帮我安装视觉桥接插件（GitHub 仓库 Yinxe/dsh-vision-bridge，包名 @dshp-inx/vision-bridge）：
1. 执行 dsh plugin --profile web add github:Yinxe/dsh-vision-bridge
2. 重启 web 服务（dsh web），确认重启无报错
3. 验证插件已生效（设置页出现「视觉模型」卡片，或注册出 vision_describe 工具）
4. 告诉我如何在 setting.yml 里给视觉模型加上 input: [text, image]，并用 vision_test.png 做一次端到端测试（我会发一张图，你用 vision_describe 识别）
```

重启生效：

```sh
dsh web
```

**验证**：打开 web 页面 → 设置 → 视觉模型 能看到「视觉模型」卡片；或直接对模型说「这张图里有什么？」（先发一张图，文本模型应自动调用 `vision_describe`）。

## 更新

```sh
dsh plugin --profile web update "@dshp-inx/vision-bridge" --latest
dsh web
```

`update --latest` 会让 `pnpm` 重新解析 GitHub 仓库的最新 commit 并更新 lockfile；重启后生效。

## 安装（备选：clone 源码 + 本地 link）

适合想改源码、或 GitHub 不可达的场景。`clone` 后用 `add ./<目录>` 安装 —— **依赖按插件真实包名（`@dshp-inx/vision-bridge`）登记**，后续 `update` / `remove` 与 GitHub 安装完全一致。`link` 安装的源码改动**即时生效**（`client` 半刷新页面即可，`host` 半需重启 `dsh web`）：

```sh
git clone git@github.com:Yinxe/dsh-vision-bridge.git ~/.dsh/plugins/dsh-vision-bridge
cd ~/.dsh/plugins
dsh plugin --profile web add ./dsh-vision-bridge
dsh web
```

> `add ./<目录>` 的相对路径按**你执行命令时所在的目录**解析，先 `cd` 到插件目录的父级再执行。
> ⚠️ **不要直接编辑 `node_modules/@dshp-inx/vision-bridge/` 里的文件**：`pnpm` 的安装文件与内容寻址 store 硬链接，直接覆盖会连带改坏 store。改源码请改 `clone` 出来的源码目录。

`link` 方式的更新就是 `git pull`（源码目录）+ 刷新页面/重启。

## 配置视觉模型（`setting.yml`）

本插件的候选来自**两个来源的并集去重**（按 `provider/model` 字典序）：

1. **配置层**：`settings` 服务中 `llm-pi-ai` / `llm-deepseek` 命名空间下，`providers[].models[]` 里 `input` 含 `image` 的模型。
2. **运行时**：`llm.listProviders()` + `llm.listModels(provider)` 中 `inputModalities` 含 `image` 的模型。

因此你只需在 `setting.yml` 里给**多模态模型**加上 `input: [text, image]`，保存后在设置页点“重新读取”即可出现。请参考现有 `setting.yml` 中 `llm-pi-ai` 的写法：

```yaml
llm-pi-ai:
  providers:
    openrouter:
      models:
        - id: qwen/qwen2.5-vl-32b-instruct
          name: Qwen2.5 VL 32B
          input: [text, image]   # ← 关键：声明支持图片输入
        - id: openai/gpt-4o-mini
          name: GPT-4o mini
          input: [text, image]
```

> 未配置 `input: [text, image]` 时，设置页会提示“没有在 setting.yml 里找到 input 含 image 的模型”，且 `vision_describe` 在无 `primary`/`fallback` 时会尝试自动选列表首项；若列表为空会抛“没有可用的视觉模型”并指引去设置页。

**推荐**：至少配两个视觉模型，一个作 `primary`，一个作 `fallback`，主失败时自动重试一次。

## 使用

1. **发图**：在对话里直接粘贴或上传图片（支持一次多张，最多 8 张，受 `maxImages` 限制）。
2. **提问**：纯文本模型看到占位符 `[image omitted because this model accepts text only…]` 后，会自动调用 `vision_describe`，把你的问题（如“这里报错是什么意思？”、“把图里的文字都转录出来”）连同图片一起发给视觉模型。
3. **查看结果**：`vision_describe` 返回的 `description` 会以 `tool-result` 形式回到模型上下文，模型据此继续回答。你也可以在设置页手动点“检查连通性”验证主/备路由是否可达。

**进阶**：

- 多图时可用 `image_hint` 指定某一张：填占位符里显示的 sha 前缀（如 `a1b2c3`）或序号（`1` 表示本轮第一张）。
- 需要更详细或更简要时，传 `detail: high`（逐字转录）或 `detail: low`（2–3 句概括），或在设置页改默认 `detail`。
- 有固定偏好（如“总是关注右上角的水印”“转录时保留换行”）可写进设置页的“追加提示词”，每次识别自动拼在问题末尾。

## 验证（不依赖手工发图）

- **语法自检**：

  ```sh
  node --check ~/.dsh/plugins/dsh-vision-bridge/lib/index.js && echo "host syntax ok"
  node --check ~/.dsh/plugins/dsh-vision-bridge/client.js && echo "client syntax ok"
  ```

- **设置页自检**：打开 `http://127.0.0.1:3080`（或你的 `dsh web` 端口）→ 设置 → 视觉模型，查看：
  - 模型列表是否出现你配置的 `input: [text, image]` 模型；
  - 保存主/备后刷新页面是否仍保持（持久化）；
  - 点“检查连通性”是否显示 `✅ … 路由可解析`。

- **端到端**：发一张 `vision_test.png`（仓库根有示例）并问“这张图里有什么？”，观察模型是否调用 `vision_describe` 且返回非空 `description`。

## 工作原理

```
用户发图（attachment + content: [{type: 'image'}, {type:'text'}]）
  ├─ agent/inbox/inserted 事件 ─┐
  └─ llm/stream 请求消息 ───────┼─→ vision-bridge Host 缓存
                                │   imageCache: Map<sessionId, Array<leafAttachment>>
                                │   仅取 leaf 字段（attachmentId/mediaType/bytes/width/height/name）
                                │   会话 LRU 20 张/50 会话
                                │
纯文本模型看到占位符 → 必须调用 vision_describe({question, image_hint?, detail?})
                                │
                                ├─ 读 sessionId → 取缓存 → hint 过滤（sha 前缀 / 序号） → maxImages 截尾
                                ├─ buildQuestion(question, detail) = question + detail 后缀 + promptTemplate
                                └─ describeWithFallback(images, question)
                                     ├─ 无 primary/fallback 时 → listVisionModels() 首项兜底
                                     ├─ runOneVision(primary) → llm.stream({provider,model,messages:[{image…,text}]})
                                     └─ 失败则 runOneVision(fallback) 重试一次
                                         stream 归一：text-delta 优先，兼容 block-end，finish {kind:error/aborted} 抛错
```

关键细节：

- **系统提示**：`systemPrompt.section('dshp-inx-vision-bridge', order: 80)` 注入视觉能力说明，模型无需用户提醒即可知道何时调用工具。
- **图片引用**：`vision_describe` 内部把缓存的 `attachment` 原样作为 `content: [{type:'image', attachment}]` 发给视觉模型，复用 DSH 附件管线，无需 base64 重编码。
- **流式归一**：兼容 `text-delta` 增量与 `block-end` 全量，并在 `finish` 中处理 `error`/`aborted`，空返回视为失败以触发 fallback。
- **持久化（官方推荐）**：`POST /ext/dshp-inx-vision-bridge/config` 每次保存后通过 `ctx.settings.update('dshp-inx-vision-bridge', patch)` 写入 `settings.yaml`（`FileSettingsProvider` 以 `leaf-level diff` 保留注释与格式），启动时通过 settings 服务的 `installSection` + `schemastery` 注册 `dshp-inx-vision-bridge` 命名空间并自动合并 `settings.yaml` 用户层、`cordis.patch.yml` 的 `config`（`base`）与 `schema` 默认值；旧版 `storages/dshp-inx-vision-bridge.json` / 旧 key `vision-bridge` 首次启动时自动迁移并备份为 `.bak`，此后不再读写。

## 配置（`cordis.patch.yml` 覆盖）

`patch` 层可覆盖默认值（可选，设置页保存后持久化会覆盖此处）：

```yaml
- id: dshp-inx-vision-bridge
  name: "@dshp-inx/vision-bridge"
  config:
    enabled: true
    primary: { provider: "openrouter", model: "qwen/qwen2.5-vl-32b-instruct" }
    fallback: { provider: "openrouter", model: "openai/gpt-4o-mini" }
    detail: auto        # auto | low | high
    maxImages: 4        # 1–8
    promptTemplate: "重点看报错弹窗"   # 可选，≤2000 字符
```

> 设置页的保存会覆盖同名字段并落盘到 `settings.yaml` 的 `dshp-inx-vision-bridge` 分节；旧 `storages/dshp-inx-vision-bridge.json` 已不再读写，首次启动后会备份为 `.bak`。

## 代码结构

```
lib/index.js        Host 半：顶部同源小工具（settingsNamespace/json/sameOrigin/readBody，本包自有）+ 图片缓存 + 模型发现 + vision_describe 工具 + 系统提示 + 同源路由 + 持久化
client.js           Client 半：__ModuleLoader__ bundle，设置页 UI（DSH token 样式，fetch 同源路由）
cordis.patch.yml    bundle 层 patch：仅 insert 挂载行
package.json        包描述 + DSH bundle 声明（dsh.bundle.patch / dsh.client.platform）
README.md           本文件
LICENSE             MIT
```

## 常见问题

- **纯文本模型下发不出图片（“当前模型不支持图片”）**：拦的是服务端发送门禁（`MODEL_DOES_NOT_SUPPORT_IMAGES`），不是输入框禁用粘贴。本插件 v1.1.0+ 在“启用且配好主视觉模型”时自动接管该门禁（状态卡“发送门禁”显示“桥接接管中”），纯文本模型可直接发图；若显示“未接管”，请先启用桥接并选择主模型。接管只负责放行，真实请求仍按文本模型投影为占位符，再由 `vision_describe` 桥接。
- **设置页没有“视觉模型”卡片**：确认 profile `package.json` 的 `dsh.profile.bundles` 含 `@dshp-inx/vision-bridge`，且依赖已装上；重启 `dsh web` 后硬刷新浏览器。
- **报“本轮没有找到可用的图片”**：图片未作为附件发送（重试一次），或模型连续调用时会话 `sessionId` 未正确传递。确认图片是“上传/粘贴”而非“图片 URL 文本”，并让模型把占位符里的 sha 前缀填进 `image_hint` 重试。
- **报“视觉桥接已在设置页关闭”**：设置页把“启用视觉桥接”勾上并保存。
- **报“没有可用的视觉模型”**：见“配置视觉模型”一节，给视觉模型加 `input: [text, image]`，然后点“重新读取”。
- **“检查连通性”报“提供方未注册”**：`provider` 拼写错误或该 provider 未在 `setting.yml` 中配置。
- **图片识别总是走 fallback**：主模型名/路由错误或余额不足，查看 `dsh web` 日志中 `[dshp-inx-vision-bridge]` 相关错误；保存后主模型会在 `settings.yaml` 的 `dshp-inx-vision-bridge` 下持久化，改对后重新检查。
- **`WEB_DUPLICATE_PROVIDER` / 工具重复**：同一插件同时存在动态（`cordis_define` 的 `dshp-inx-vision-bridge`）与静态（本包）两份，请 `cordis_undefine` 掉动态版本，再重启 `dsh web`。
- **报 `MissingSessionID`（`x-opencode-session` 缺失）**：opencode 系（go/zen）自 2026-09-06 起强制要求会话头。v1.3.1+ 已把会话 ID 透传给 `llm.stream`；但 `openai-completions` 协议的提供方还需在 `settings.yaml` 里为 `opencode-go` / `opencode-zen` 打开会话亲和头，否则透传的 ID 不会被发到网关：
  ```yaml
  llm-pi-ai:
    providers:
      opencode-go:
        compat:
          sendSessionAffinityHeaders: true
      opencode-zen:
        compat:
          sendSessionAffinityHeaders: true
  ```
  保存后重试。等不及可先把主视觉模型切到 `bigmodel-vision / glm-4.6v-flash`（不走 opencode，不过审此限制）。
- **想改识别风格**：设置页“追加提示词”写偏好（如“用中文分点、保留表格”），或调用时传 `detail: high` / `low`。

## 卸载

```sh
dsh plugin --profile web remove "@dshp-inx/vision-bridge"
dsh web
```

`remove` 会自动从 `dsh.profile.bundles` 撤下挂载；`clone` 安装的再删掉 `~/.dsh/plugins/dsh-vision-bridge` 目录即可。设置页配置已落盘到 `settings.yaml` 的 `dshp-inx-vision-bridge` 分节，按需手动清理；旧 `storages/dshp-inx-vision-bridge.json` 已迁移为 `.bak`。

## 更新日志

- **v1.3.0**：settings 命名空间跟上插件前缀——`settings.yaml` key 由 `vision-bridge` 改为 `dshp-inx-vision-bridge`，与包名 `@dshp-inx/vision-bridge` / 路由 `/ext/dshp-inx-vision-bridge/*` / cordis 行 id / 日志前缀保持一致；启动时自动把旧 `vision-bridge` 顶层 key 重命名（新旧并存时以新为准），旧 `storages/dshp-inx-vision-bridge.json` 迁移逻辑不变。

- **v1.2.0**：命名空间化——cordis 行 id、`/ext/*` 路由、effect label、日志前缀、系统提示 section、设置 section id、持久化文件统一加 `dshp-inx-vision-bridge` 前缀（旧 `vision_bridge.json` 不再读取，可手动删除；默认启用，首次发现模型后自动选中主/备并落盘新文件）；包名 `@dshp-inx/vision-bridge` 与工具名 `vision_describe` 保持不变。

- **v1.1.0**：接管发送门禁——启用且配好主模型时，纯文本模型可直接发送图片（此前被 `MODEL_DOES_NOT_SUPPORT_IMAGES` 拒收）；设置页状态卡新增“发送门禁”行；`GET /ext/dshp-inx-vision-bridge/state` 新增 `admissionTakeover` 字段。

## 免责声明

- 本插件与所有视觉模型提供方（OpenRouter、OpenAI 等）无隶属关系；模型能力与计费以提供方为准。
- 图片仅在本地会话缓存中短暂留存（最近 20 张/会话），随进程重启清空；除转发给视觉模型外不上传至其他远端。
- 请遵守各模型提供方的内容政策与隐私要求，勿发送敏感信息。

