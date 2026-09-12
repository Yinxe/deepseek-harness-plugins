# @dshp/mcwiki-search

DeepSeek Harness（DSH）工具插件：查询**中文 Minecraft Wiki**（MediaWiki API，端点写死 `https://zh.minecraft.wiki/api.php`，不可配置），并把搜索结果与页面全文**完整转换为 AI 可直接阅读的干净文本**。

> 核心承诺：模型看到的永远是清洗后的结果 —— 模板、引用、图片、跨语言链接等噪声在插件内部全部处理完毕，绝不让原始 wikitext / HTML 进入模型上下文。

## 安装（唯一方式：克隆 monorepo + 本地安装）

> 本包尚未发布到 npm（`@dshp/mcwiki-search` 在 npm 上 404），**不要用 `add github:` / `pnpm add`**，唯一入口就是克隆本仓库后本地 `add`。

```sh
# 1. 克隆 monorepo（lib/ 构建产物已提交，clone 下来就能用，无需 build）
git clone git@github.com:Yinxe/deepseek-harness-plugins.git
cd deepseek-harness-plugins
pnpm install

# 2. 本地安装到 profile（路径按你执行命令时的 cwd 解析）
dsh plugin --profile web add ./plugins/mcwiki-search

# 3. 重启生效
dsh web
```

> DSH 是最新版就到此为止。只有 DSH 停在老版本才需要先 `git checkout <历史tag>`（对照根目录 `compat.json`，现在是空的，不用管）。

`dsh plugin` 会把包写进 profile 的 `dsh.profile.bundles` —— **无需手动改配置文件**。

**改源码后**：`src/host` 或 `src/client` 改完跑 `pnpm --filter @dshp/mcwiki-search build` 重新打出 `lib/host.js + lib/client.js`，然后 `dsh web` 重启（client 半强刷页面即可）。

**验证**：打开 web → 设置 → Minecraft Wiki 搜索 能看到卡片；或直接对模型说「用 mcwiki_search 查一下苦力怕」。

**一键 AI 安装**：把下面这段发给你的 DSH AI 即可：

```text
帮我安装 Minecraft Wiki 搜索插件（monorepo Yinxe/deepseek-harness-plugins，子目录 plugins/mcwiki-search，包名 @dshp/mcwiki-search）：
1. git clone monorepo 并 pnpm install
2. dsh plugin --profile web add ./plugins/mcwiki-search
3. dsh web 重启，确认无报错，设置页出现「Minecraft Wiki 搜索」即成功
4. 用 mcwiki_search 帮我查一下「苦力怕」，展示一条结果确认链路通畅
```

## 更新

```sh
cd deepseek-harness-plugins
git pull
pnpm install
# 改过源码才需要：pnpm --filter @dshp/mcwiki-search build
dsh plugin --profile web update "@dshp/mcwiki-search"
dsh web
```

> ⚠️ **不要直接编辑 `node_modules/@dshp/mcwiki-search/`**：pnpm store 硬链接，改坏 store。只改 monorepo 里的 `plugins/mcwiki-search/src`。

## 功能

| 部分                                          | 内容                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Host（`src/host/` → `lib/host.js`）**       | 注册 3 个模型工具（见下）；wikitext→Markdown 转换管线（`convert.ts`：模板整块展开/丢弃、标签块剥离、内外链归一、标题/引号/列表/表格扁平化）；MediaWiki API 客户端（`api.ts`：固定中文端点 `API_BASE`、UA/超时/取消、搜索/引言/全文/随机）；**通过官方 `ctx.settings` + `schemastery` 持久化到 `settings.yaml`（`dshp-mcwiki-search`），使用 settings 服务的 `installSection` 方法，支持热重载与注释保留，**配置只认 `dshp-mcwiki-search`，不读历史 key**；注入系统提示引导模型何时调用工具。运行时零依赖（schemastery 内联）。 |
| **Client（`src/client/` → `lib/client.js`）** | 「设置 → Minecraft Wiki 搜索」配置页：数据源状态、**配置卡**（超时 / 搜索条数 / 全文与引言上限，直接保存到 `settings.yaml` 即时生效）、搜索测试、页面转换测试（直接看转换后的文本）。UI 全部使用 DSH 官方设计 token（`dsw-alias-*`），与官方设置页风格一致。无额外依赖。                                                                                                                                                                                                                                                       |
| **同源路由**                                  | `GET /ext/dshp-mcwiki-search/state`（数据源状态 + 当前生效配置快照）、`POST /ext/dshp-mcwiki-search/config`（保存配置补丁）、`POST /ext/dshp-mcwiki-search/test`（连接测试：搜索 + 页面抓取），均带同源校验（`Origin` 与 `Host` 一致或缺失才放行）。                                                                                                                                                                                                                                                                           |
| **工具**                                      | `mcwiki_search`（全文搜索）、`mcwiki_get_page`（抓取页面：引言/全文）、`mcwiki_random`（随机条目），见参数表。输出全部为清洗后的 AI 可读文本，默认**完整输出、不截断**。                                                                                                                                                                                                                                                                                                                                                       |
| **斜杠命令**                                  | `/mcwiki`（人用，不经模型）：搜索 / 看引言 / 随机条目，结果直接回显到会话。commands 为可选服务，未挂载自动跳过。                                                                                                                                                                                                                                                                                                                                                                                                               |

> **完整性承诺**：搜索摘要、引言、全文（含表格）默认**完整输出、绝不截断** —— 所有信息与细节都保留给 AI。只有显式传 `maxChars`（正整数）或部署配置设限时才会截断，且输出末尾会明确标注。设置页中的转换测试为 UI 预览（最多 6000 字符），与模型工具无关。

### 斜杠命令 `/mcwiki`

在会话输入框直接调用，结果以文本回显（注册形态对齐官方 `@deepseek-ai/dsh-command-goal`；走 `ctx.commands`，**不经模型、不占工具轮次**）：

| 写法                      | 作用                                                                                                   |
| ------------------------- | ------------------------------------------------------------------------------------------------------ |
| `/mcwiki <搜索词>`        | 全文搜索并**附第一条结果的引言详情**（多数查询第一条就是答案，一次给全；详情抓取失败自动降级为纯列表） |
| `/mcwiki read <条目标题>` | 抓取条目引言（长度取设置的引言上限）                                                                   |
| `/mcwiki random`          | 随机条目引言                                                                                           |
| `/mcwiki`                 | 显示用法                                                                                               |

搜索与抓取的条数/上限沿用设置页配置（`searchMaxResults` / `introMaxChars` / `timeoutMs`）；请求跟随命令的取消信号。

### 模型工具

| 工具              | 作用     | 返回                                                                                                                                                                    |
| ----------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mcwiki_search`   | 全文搜索 | 清洗后的标题 / 摘要（命中词加粗）/ URL / 更新时间                                                                                                                       |
| `mcwiki_get_page` | 抓取页面 | `section=intro` 纯文本引言（默认）；`section=full` 全文 → Markdown（默认）/ 纯文本 / wikitext。**默认完整输出、不截断**；可传 `maxChars`（0=不截断，正数=上限）按需设限 |
| `mcwiki_random`   | 随机条目 | 条目标题 + 引言纯文本（完整、不截断）                                                                                                                                   |

#### `mcwiki_search`

| 参数    | 类型      | 必填 | 说明                                                  |
| ------- | --------- | ---- | ----------------------------------------------------- |
| `query` | `string`  | ✅   | 搜索关键词，例如「钻石」「苦力怕」或 "Ancient City"。 |
| `limit` | `integer` |      | 返回条数，1–20，默认 8。                              |

#### `mcwiki_get_page`

| 参数       | 类型      | 必填 | 说明                                                                                        |
| ---------- | --------- | ---- | ------------------------------------------------------------------------------------------- |
| `title`    | `string`  | △    | 页面标题，例如「苦力怕」或 "Diamond"。与 `pageid` 二选一。                                  |
| `pageid`   | `integer` | △    | 页面 ID（来自 `mcwiki_search` 结果）。与 `title` 二选一。                                   |
| `section`  | `enum`    |      | `intro`=引言纯文本；`full`=全文转换。默认 `intro`。                                         |
| `format`   | `enum`    |      | `full` 时的输出格式：`markdown`/`text`/`wikitext`。默认 `markdown`。                        |
| `maxChars` | `integer` |      | 可选输出上限（字符）。0 或缺省 = 不截断、完整输出；传正整数才截断（如上下文紧张时 20000）。 |

#### `mcwiki_random`

| 参数    | 类型      | 必填 | 说明                       |
| ------- | --------- | ---- | -------------------------- |
| `limit` | `integer` |      | 返回条目数，1–10，默认 3。 |

### 配置项（Host 状态）

| 字段               | 类型     | 默认    | 说明                                         |
| ------------------ | -------- | ------- | -------------------------------------------- |
| `timeoutMs`        | `number` | `15000` | 单次请求的等待上限，≥1000（毫秒）。          |
| `maxChars`         | `number` | `0`     | 全文输出上限：0 = 不截断（默认，完整输出）。 |
| `introMaxChars`    | `number` | `0`     | 引言上限：0 = 不截断（默认）。               |
| `searchMaxResults` | `number` | `8`     | 搜索默认条数，≥1。                           |

> **与动态版的区别**：动态（`cordis_define`）版本的配置只在内存中，重启进程后恢复默认；**标准包版本通过官方 `settings` API 持久化到 `settings.yaml`（`dshp-mcwiki-search`）**，重启后不丢，且外部手工编辑 `settings.yaml` 可热重载。

## 数据转换管线

```
MediaWiki API JSON
  └─ cleanSearchSnippet()   搜索摘要：searchmatch 高亮 → **加粗**，实体解码，
  │                         空白折叠，修复中文 bigram 拆词（「苦力 怕」→「苦力怕」）
  ├─ extracts plaintext     引言：MediaWiki 官方纯文本输出 + 收尾清洗
  └─ wikitextToMarkdown()   全文：
       ├─ {{模板}} 整块处理 —— 信息框/历史/音效/导航等噪声整块丢弃；
       │                     {{tr|简体|…}} 取简体、*Link/*Sprite 取条目名、
       │                     {{droptable|dropline}} 保留掉落表、{{only/in/el}} 渲染版本、
       │                     {{quote}} 保留引言、{{cd/cmd}} 保留代码
       ├─ <ref>/<gallery>/<syntaxhighlight> 等标签块丢弃
       ├─ [[File:…]]/[[Category:…]]/[[w:…]]/跨语言链接 丢弃；[[目标|显示名]] → 显示名
       ├─ == 标题 == → ## 标题；'''粗体''' → **粗体**；''斜体'' → *斜体*
       ├─ 列表 * # : ; 归一化；{|…|} 表格扁平化为 Markdown 表格（完整保留）
       └─ 输出完整不截断（默认）；传 maxChars 正整数才设上限并标注
```

## 发布到 npm（可选，当前未发布）

现在没发 npm，所以上面只能本地装。以后想 `pnpm add @dshp/mcwiki-search` 一键装，才需要发包：先建 npm 组织 `@dshp`（见根 README），再打 tag 走 CI 的 Trusted Publishing。发完这里的安装方式会同步更新。

## 配置（`settings.yaml` 示例）

持久化到 `settings.yaml` 的 `dshp-mcwiki-search` 命名空间，设置页可直接改，外部编辑热重载。
`config:` patch 层仍可覆盖默认值（settings 的 base 层），即开即用：

```yaml
dshp-mcwiki-search:
  timeoutMs: 15000
  maxChars: 0 # 全文输出上限：0 = 不截断（默认，完整输出）
  introMaxChars: 0 # 引言上限：0 = 不截断（默认）
  searchMaxResults: 8 # 搜索默认条数
```

`cordis.patch.yml` 覆盖（可选，设置页保存后持久化会覆盖此处）：

```yaml
- id: dshp-mcwiki-search
  name: '@dshp/mcwiki-search'
  config:
    timeoutMs: 15000
    maxChars: 0
    introMaxChars: 0
    searchMaxResults: 8
```

## 代码结构

```
src/host/           Host 半 TS：types（契约）/ http（同源小工具）/ config（默认值+schema+消毒）
                    / api（MediaWiki 客户端）/ convert（清洗管线）/ tools（3 工具注册）
                    / routes（3 同源路由）/ index（apply 装配）
src/client/         Client 半 TS：types（协议）/ styles（mw- 前缀 CSS）/ api（fetch 封装）
                    / components（Badge/Row）/ McWikiSection（设置节）/ index（loader 注册）
lib/                构建产物（已提交）：host.js（后端 ESM）+ client.js（前端 IIFE）
cordis.patch.yml    bundle 层 patch：仅 insert 挂载行
package.json        包描述 + DSH bundle 声明（dsh.bundle.patch / dsh.client.platform）
README.md           本文件
```

## 验证（不依赖 DSH 运行时）

- **语法自检**：

  ```sh
  pnpm --filter @dshp/mcwiki-search test # node --check lib/host.js + lib/client.js
  ```

- **设置页自检**：打开 `http://127.0.0.1:3080`（或你的 `dsh web` 端口）→ 设置 → Minecraft Wiki 搜索，查看数据源、改配置保存后刷新仍保持（持久化），搜索测试能看到清洗后的摘要。

- **端到端**：对模型说「用 mcwiki_search 查一下苦力怕」，应返回标题/摘要/URL/更新时间；再说「用 mcwiki_get_page 抓苦力怕全文」，应返回完整 Markdown。

## 更新日志

- **v1.2.0**：**移除历史 key 迁移**——不再把 `dshp-inx-mcwiki-search` 重命名为 `dshp-mcwiki-search`。配置只认 `dshp-mcwiki-search`，老用户请手工改名旧分节。

- **v1.1.0**：组织规范化 + TS 重写——包名由 `@dshp-inx/mcwiki-search` 改为 `@dshp/mcwiki-search`（monorepo `plugins/mcwiki-search`），cordis 行 id / settings 命名空间 / `/ext/*` 路由同步为 `dshp-mcwiki-search`。当时提供 `settings.yaml` 里 `dshp-inx-mcwiki-search` 自动重命名（**该自动迁移已在 v1.2.0 移除，见上**）。Host 由 `lib/{index,api,convert}.js` 拆为 `src/host/` 8 模块，Client 由手写 `client.js` 拆为 `src/client/` 6 模块，`lib/host.js + lib/client.js` 由 tsup 重打。另修正两处与文档不一致的默认值：`mcwiki_get_page` full 默认 `format` 由 `text` 改为 `markdown`（与工具描述一致）；`mcwiki_random` 默认条数由 `5` 改为 `3`（与参数描述一致）。

- **v1.0.1**（JS 旧版）：`~/.dsh/plugins/dsh-mcwiki-search` 最终版，`mcwiki_search / mcwiki_get_page / mcwiki_random` 三工具 + 设置页 + 同源路由。

## 移植说明

> **Monorepo + TS 版**：本目录是 `deepseek-harness-plugins` monorepo 的标准子项目（`plugins/mcwiki-search`），由 `~/.dsh/plugins/dsh-mcwiki-search`（JS，@dshp-inx/mcwiki-search v1.0.1）等价 TS 重写移植。
>
> - Host：原 `lib/{index,api,convert}.js`（共约 1400 行）→ `src/host/{types,http,config,api,convert,tools,routes,index}.ts`，tsup 打包为单文件 `lib/host.js`（ESM，schemastery 内联，运行时零依赖），导出 `{ name, inject, NS, ConfigSchema, apply }` 与原版一致。
> - Client：原手写 `client.js`（326 行）→ `src/client/{types,styles,api,components,McWikiSection,index}.ts`，tsup 打包为单文件 `lib/client.js`（IIFE，内含 `__ModuleLoader__.load`，react/primitives 运行时注入不打包）。
>
> 构建：`pnpm --filter @dshp/mcwiki-search build`（tsup）→ `lib/host.js` + `lib/client.js`；包入口 `lib/host.js`，`./client` → `lib/client.js`。`lib/` 已提交（DSH 从 git 直接安装，不跑 build，必须带构建产物）。

## 免责声明

- 数据来源：[zh.minecraft.wiki](https://zh.minecraft.wiki) / [minecraft.wiki](https://minecraft.wiki)，内容按 CC BY-NC-SA 3.0 授权，引用请注明出处；
- 本插件与 Mojang Studios / Microsoft 无任何隶属关系；
- 使用公开 MediaWiki API，无密钥、无配额申请。
