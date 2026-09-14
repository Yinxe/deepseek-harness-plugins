# provider 型插件：分层渲染与失败提示

> 本文承接旧 AGENT.md §10.3–10.4（多供应商分层渲染 / 失败提示结构化）的完整细节，标杆 `plugins/token-meter`。规则版总纲见[仓库根 AGENT.md](../AGENT.md)。

## 什么时候读这篇

插件若按「供应商/后端类型」维度扩展（token-meter 的额度、search-provider 的搜索源），**数据与 UI 都按 provider 分层**：Host 适配器 return 自己的数据，Client 侧每个 provider 有**一套属于自己的完整 UI**，通用零件抽出来复用。

```
Host    host/providers/<type>.ts      适配器 return 自己的数据（view/billing/windows/extra）
Client  client/providers/ui/<type>.ts **该供应商专属的完整 UI**（自由排版，可选）
        client/providers/kit.ts       通用可复用零件（进度条/余额块/指标/图表/失败卡…）
        client/providers/sections.ts  声明式区块渲染（无专属 UI 的 type 零代码可用）
        client/providers/registry.ts  调度：专属 UI → 声明式 → legacy 兜底
```

## 通用零件（kit，不要重复造）

`RollingBar`（滚动刷新进度条）、`WindowGroup`、`BalanceBlock`、`MetricRows`、`SplitBar`、`NoteLine`、`MiniChart`、`Chips`、`ErrorCard` + `num/fmt/fmtLeft/curSymbol/remainOf/timeAgo/levelOf`。专属 UI 只写「自己特有的表达」。

## Host 侧 view 契约

- 适配器产出 `view`（`windowsSection/balanceSection/metricsSection/progressSection/splitSection/noteSection/chartSection` + `makeView`）；`quota.ts` 快照前必须过 `sanitizeView()`（区块数/条目数/字符串长度夹紧，与外部输入同等对待）。
- **双轨兼容**：`defaultView()` 从 legacy 字段兜底推导 view（老适配器零改动升级），`viewToExtra()` 把 view 反向补成 legacy extra（新适配器只写 view 也不让旧客户端空白）。
- 专属 UI **出错必须降级**：调度器 try/catch，异常时回落到声明式/legacy，不能白屏。
- 适配器可声明 `defaultParams` 声明「新增该类型时的表单初始值」（如 commandcode 默认填 `$COMMAND_CODE_API_KEY`）；**表单字段一律来自 provider 元数据 `fields[]`，禁止在 client 里按 type 硬编码字段**（会与适配器悄悄漂移）。
- 同类 provider 能合并就合并：token-meter 的 `deepseek-api`/`deepseek-web` 已并入 `deepseek`（按凭据形态自动选路），旧 type 只留**别名**（`registerAlias`，读路径归一并不落库、不改写用户文件），不给用户增加无谓选择。

## search-provider 的变体

search-provider 是同一思想的搜索版：`host/providers/<id>.ts` 实现 `SearchProviderModule`（注册进 `ctx.web` 的 WebSearchProvider），样板（路由/消毒/错误抽取）由 `providers/base.ts` 提供。API Key 每次操作经 credentials 服务实时解析（如 `TAVILY_API_KEY`），不在提供方上滞留、不进 settings.yaml。

## 失败提示必须结构化、可操作

拉取失败不能只把原始异常丢给用户。标杆：token-meter 的 `host/errors.ts` + `client/ErrorBox.ts`。要点：

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
