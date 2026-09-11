> **Monorepo + TS 版**：本目录是 `deepseek-harness-plugins` monorepo 的标准子项目（`plugins/token-meter`），由 `~/.dsh/plugins/dsh-token-quota`（JS，`@dshp-inx/token-quota` v1.0.1）与 `~/.dsh/plugins/dsh-token-stats`（JS，`@dshp-inx/token-stats` v1.1.3）合并等价 TS 重写移植。
>
> - Host：quota 侧 `lib/{index,config,secrets,providers/*}.js` → `src/host/{types,http,config,secrets,providers/*,quota,index}.ts`；stats 侧 `lib/{index,engine,fold,fsindex,async,http}.js` → `src/host/stats/{engine,fold,fsindex,async,routes}.ts`，tsup 打包为单文件 `lib/host.js`（ESM，schemastery 内联，运行时零依赖），导出 `{ name, inject, NS, ConfigSchema, apply }` 与规范一致。
> - Client：quota 侧手写 `client.js`（1238 行）+ stats 侧手写 `client.js`（1548 行）→ `src/client/{types,styles,api,components,QuotaSection,StatsSection,TokenMeterSection,index}.ts`，tsup 打包为单文件 `lib/client.js`（IIFE，内含 `__ModuleLoader__.load`，react/primitives 运行时注入不打包）。

> 构建：`pnpm --filter @dshp/token-meter build`（tsup）→ `lib/host.js` + `lib/client.js`；包入口 `lib/host.js`，`./client` → `lib/client.js`。`lib/` 已提交（DSH 从 git 直接安装，不跑 build，必须带构建产物）。

# @dshp/token-meter

DeepSeek Harness（DSH）**Token 计量**插件：**额度 + 用量二合一**——一边看“外面还剩多少”（多供应商滚动额度/按量余额：opencode、DeepSeek 系列、手动账本，右侧栏富卡片 + 设置页供应商运维），一边看“里面用了多少”（本机会话日志聚合：累计/峰值/连续天数、日/周趋势、24 小时分布、GitHub 风格热力图、模型分布、今日消耗）。配置通过官方 settings API 持久化到 `$DSH_HOME/settings.yaml`（`dshp-token-meter` 命名空间），支持注释保留与热重载。旧双插件的 `storages/token-quota.json` 与 settings key（`dshp-inx-token-quota` / `dshp-inx-token-stats`）首次启动自动合并迁移。

> 设计原则：**零依赖、零残留、可逆副作用**。密钥只存引用（`$NAME`）或脱敏展示；统计无网络上报、无独立持久化（会话日志即持久层，指纹缓存丢了可重扫）；卸载即干净。

## 界面预览

> 截图在 `images/` 目录（3 张：额度卡片 / 用量统计 / 宽屏面板），对应右侧栏双 Tab 与宽屏布局。

**右侧栏「额度」Tab —— 峰谷提醒 + 供应商富卡片**

部分供应商采用峰谷定价（示例为 9:00–18:00 为峰），顶部横幅提醒当前峰/谷时段与剩余时长；下方为全部供应商的展开富卡片：配额进度条按「5 小时 / 每周 / 每月」分级，标注占比与重置倒计时（如「每月 99% · 最早重置 3 小时后」），余额/充值/订阅状态一目了然；余额不足（如欠费 ¥-0.37）触发红色预警文字与预警线。底部提示「全部供应商额度一览（右侧栏空间更宽，图表完整展开）。增删改请到设置 » Token 计量」。

![额度 Tab：峰谷提醒 + 供应商富卡片](<images/截图 2026-09-11 17-08-15.png>)

**右侧栏「用量」Tab —— 统计仪表盘**

顶部指标卡（模型调用次数 / 首次使用 / 最近使用）+ Token 使用趋势折线（近 24 小时/7 天/30 天，按天聚合，悬浮查看明细）+ Token 活力热力图（1/3/6/12 个月，悬浮查看当日明细：总消耗、会话数、输入/输出构成、缓存读/写与占比）+ 模型用量分布环形图（中心累计 Token，悬浮查看各供应商×模型构成）。

![用量 Tab：指标卡 + 趋势折线 + 活力热力图 + 模型分布](<images/截图 2026-09-11 17-09-40.png>)

**宽屏：今日消耗 + 指标卡网格**

今日消耗面板（总量 + 对比昨日涨幅 + 回归）+ 两列指标卡：累计 Token（输入/输出/缓存读/写构成条）、缓存 Token（命中/写入）、峰值单日、日消耗中位数、最长连续使用、模型调用次数、近 30 天走势（对比前 7 天涨幅）、峰值单次请求、日均消耗、当前连续使用、活跃天数、首次/最近使用；悬浮可见单供应商用量构成弹窗（输入/输出/缓存读/缓存写）。任意图表均可 `⠿` 拖拽或 `⧉` 弹出为全局浮窗。

![宽屏：今日消耗 + 指标卡网格](<images/截图 2026-09-11 17-10-48.png>)

## 功能

| 部分                                          | 内容                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Host（`src/host/` → `lib/host.js`）**       | 额度：provider 注册表委托拉取（`opencode` / `deepseek` 自动选路 / `deepseek-api` / `deepseek-web` / `manual`，别名 `opencode-go`/`opencode-zen` 兼容），密钥 `$NAME`/`{env:}`/`{cred:}` 解析（凭据服务优先、环境变量兜底），明文脱敏（只写不读、留空保留）、`secret-to-cred` 一键转存、内存快照（`st.snaps`，失败保旧）。统计：`sessionQuery` 全量扫描 + 文件指纹缓存（`storageDomain` 域 `token_stats`，域名保持不变）+ 后台分批泵（每批 8 会话、`setImmediate` 让出、单会话 20s 超时、失败 3 次跳过）+ `session/event` 失效。通过官方 `ctx.settings` + `schemastery` 持久化到 `settings.yaml`（`dshp-token-meter`），旧文件/旧 key 自动合并迁移。                                                                                                                                                                                  |
| **Client（`src/client/` → `lib/client.js`）** | 「设置 → Token 计量」精简页：偏好（自动刷新/默认范围）+ 供应商添加与管理（当前选择/拉取/编辑/存凭据/删除），图表全部搬到右侧栏。失效的侧边栏显示开关已移除（右栏常驻展示）。右侧栏双 tab（官方 `sidebarRightTabs` 注册，首次自动打开）：「额度」为全部供应商展开富卡片，「用量」为完整统计（指标卡、趋势线、热力图、模型环形图 + 小组件工具条）。左栏入口已移除，不再占用侧边栏空间。小组件化：每个供应商卡与每张图表（指标卡/趋势/热力/模型分布/今日卡）都是独立组件，标题栏 `⠿` 抓手拖拽或 `⧉` 一键弹出为全局浮窗。浮窗**只有定位、没有任何外框**——组件自身的卡片即浮窗外观，浮出前后视觉完全一致；浮出后**原位自动消失**，浮窗内的 `回归` 按钮（或原位工具条开关）收回后原位恢复。坐标 `localStorage` 持久化，浮窗内任意非交互区域按住可拖动。UI 全部使用 DSH 官方设计 token（`dsw-alias-*`），与官方设置页风格一致。无额外依赖。 |
| **同源路由**                                  | `GET /ext/dshp-token-meter/state`（配置脱敏 + 快照 + provider 元数据）、`POST /ext/dshp-token-meter/config`（通用偏好补丁）、`POST /ext/dshp-token-meter/refresh`、`POST /ext/dshp-token-meter/set-active`、`POST /ext/dshp-token-meter/set-refresh`、`POST /ext/dshp-token-meter/set-enabled`、`POST /ext/dshp-token-meter/add-vendor`、`POST /ext/dshp-token-meter/update-vendor`、`POST /ext/dshp-token-meter/delete-vendor`、`POST /ext/dshp-token-meter/secret-to-cred`、`GET /ext/dshp-token-meter/stats`（聚合快照，别名 `/data`），均带同源校验（`Origin` 与 `Host` 一致或缺失才放行）+ `no-store`。                                                                                                                                                                                                                         |
| **工具**                                      | 无模型工具（本插件为运维/展示型，不注册 `tools`）。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |

### 统计口径

- 总 Token = inputTokens + cacheReadTokens + cacheWriteTokens + outputTokens（reasoningTokens 已含在 outputTokens，不重复计）
- 同一 (turn, step) 的 usage chunk 为早期采样、assistant/message usage 为终值，覆盖不重复累计
- fork 会话跳过其继承前缀（`readSession.inheritedEventCount`，即落盘 `seedLength`；父会话已计），不重复计数
- 含子代理会话（它们是真实用量）

数据源是 `sessionQuery` 服务实时扫描会话日志，无独立持久化——会话日志本身就是持久层；指纹缓存丢了后台重扫即可。

### 配置项

| 字段           | 类型                           | 默认    | 说明                                                                          |
| -------------- | ------------------------------ | ------- | ----------------------------------------------------------------------------- |
| `version`      | `number`                       | `1`     | 配置版本号（保留字段）。                                                      |
| `activeVendor` | `string`                       | `''`    | 当前供应商 ID；`''` = 极简模式（不显示任何额度）。                            |
| `refreshSec`   | `number`                       | `60`    | 自动刷新秒数；右栏打开时当前供应商按间隔拉取，`0`=关闭，其余钳制 `10–3600`。  |
| `enabled`      | `boolean`                      | `true`  | 遗留字段（旧左栏开关，已无界面消费，仅保留做存储兼容）。                      |
| `vendors`      | `Vendor[]`                     | `[]`    | 供应商列表（`{ id, name, type, params }`，`id` 主键 2–31 位小写/数字/横线）。 |
| `showToday`    | `boolean`                      | `false` | 遗留字段（旧左栏开关，已无界面消费，仅保留做存储兼容）。                      |
| `defaultRange` | `'7' \| '30' \| '90' \| 'all'` | `'30'`  | 用量统计默认时间范围。                                                        |

供应商 `type`（`providerTypes` 下发，设置页下拉据此渲染）：`opencode`（Go+Zen 合并，双页拉取）、`deepseek`（按密钥格式自动选路并互备）、`deepseek-api`（官方余额接口）、`deepseek-web`（网页账单，余额+趋势）、`manual`（本地账本，rolling/payg 自选）；旧 `opencode-go`/`opencode-zen` 为别名，读时归一、后台自动改写。

## 安装（唯一方式：克隆 monorepo + 本地安装）

> 本包尚未发布到 npm（`@dshp/token-meter` 在 npm 上 404），**不要用 `add github:` / `pnpm add`**，唯一入口就是克隆本仓库后本地 `add`。

```sh
# 1. 克隆 monorepo（lib/ 构建产物已提交，clone 下来就能用，无需 build）
git clone git@github.com:Yinxe/deepseek-harness-plugins.git
cd deepseek-harness-plugins
pnpm install

# 2. 本地安装到 profile（路径按你执行命令时的 cwd 解析）
dsh plugin --profile web add ./plugins/token-meter

# 3. 卸载旧双插件（避免双份侧边栏/设置节重复）
dsh plugin --profile web remove "@dshp-inx/token-quota"
dsh plugin --profile web remove "@dshp-inx/token-stats"

# 4. 重启生效
dsh web
```

> DSH 是最新版就到此为止。只有 DSH 停在老版本才需要先 `git checkout <历史tag>`（对照根目录 `compat.json`，现在是空的，不用管）。

`dsh plugin` 会把包写进 profile 的 `dsh.profile.bundles` —— **无需手动改配置文件**。

**改源码后**：`src/host` 或 `src/client` 改完跑 `pnpm --filter @dshp/token-meter build` 重新打出 `lib/host.js + lib/client.js`，然后 `dsh web` 重启（client 半强刷页面即可）。

**验证**：打开 web → 设置 → Token 计量（额度/用量统计双 Tab）；右侧栏出现「额度 / 用量」双面板（界面效果见上文「界面预览」及 `images/` 目录）；或 `curl http://127.0.0.1:3080/ext/dshp-token-meter/state` 返回 `{ok:true, ...}`。

**一键 AI 安装**：把下面这段发给你的 DSH AI 即可：

```text
帮我安装 TokenMeter 插件（monorepo Yinxe/deepseek-harness-plugins，子目录 plugins/token-meter，包名 @dshp/token-meter）：
1. git clone monorepo 并 pnpm install
2. dsh plugin --profile web add ./plugins/token-meter，并卸载旧 @dshp-inx/token-quota 与 @dshp-inx/token-stats
3. dsh web 重启，确认无报错，设置页出现「Token 计量」即成功
4. 打开设置页的 Token 计量，帮我添加一个供应商并刷新一次额度，再告诉我累计 Token 总量和今日用量
```

## 更新

```sh
cd deepseek-harness-plugins
git pull
pnpm install
# 改过源码才需要：pnpm --filter @dshp/token-meter build
dsh plugin --profile web update "@dshp/token-meter"
dsh web
```

> ⚠️ **不要直接编辑 `node_modules/@dshp/token-meter/`**：pnpm store 硬链接，改坏 store。只改 monorepo 里的 `plugins/token-meter/src`。

## 配置（`settings.yaml`）

`$DSH_HOME/settings.yaml` 的 `dshp-token-meter` 分节（标准 settings 存储，直接改分节即热重载生效）：

```yaml
dshp-token-meter:
  activeVendor: oc-main
  refreshSec: 60
  enabled: true
  showToday: false
  defaultRange: '30'
  vendors:
    - id: oc-main
      name: Opencode 官方
      type: opencode
      params: { workspaceId: wrk_xxx, cookie: $OPENCODE_COOKIE }
    - id: ds-main
      name: DeepSeek 官方
      type: deepseek
      params: { token: $DS_TOKEN, apiKey: $DEEPSEEK_API_KEY, lowWarn: 5 }
    - id: m1
      name: 手动账本
      type: manual
      params: { billing: payg, balance: 50, granted: 100 }
```

`activeVendor: ""` = 极简模式（不显示任何额度）。

> `cookie` 即浏览器登录态：开发者工具 → Application → Cookies → 复制 `auth` 的值，
> 整段 Cookie（含 `oc_locale` 等）原样粘贴亦可；各参数的含义与获取方式见设置页表单
> 每个字段下方的说明（由 provider 的 `fields[].hint` 下发）。
> 旧写法兼容并自动迁移：`opencode-go`/`opencode-zen` type → `opencode`（值不变）；
> `params.auth`（opencode 系）→ `cookie`（值不变）；`{cred:}`/`{env:}` → `$NAME`。

## 扩展新供应商（3 步）

1. 复制模板：`cp src/host/providers/manual.ts src/host/providers/<新type>.ts`
   （抓包型复制 `opencode.ts`，API 型复制 `deepseek.ts` 更接近）；
2. 改适配器：填 `type/label/title/secretField/fields/sanitizeParams/fetch`
   （契约见 `src/host/providers/base.ts` 的 `ProviderAdapter` 接口）；
3. 注册一行：在 `src/host/providers/index.ts` 底部 `registerProvider()` 加一行，
   跑 `pnpm --filter @dshp/token-meter build`，重启 `dsh web` —— 设置页下拉与表单自动出现新类型，`quota.ts` 与 client 零改动。

## 代码结构

```
src/host/              Host 半（Node，tsup → lib/host.js 单文件 ESM）
  types.ts             共享类型（Vendor/快照/统计/配置/路由协议）
  http.ts              同源小工具（settingsNamespace/json/sameOrigin/readBody）
  config.ts            默认值/schema/双命名空间合并迁移/旧文件迁移
  secrets.ts           密钥引用解析（$NAME/{env:}/{cred:}/明文）
  providers/           供应商适配器（每家一文件，注册即扩展）
    base.ts            契约 + ID/数字工具
    index.ts           注册表（扩展唯一入口 + 别名 + 脱敏/元数据）
    opencode.ts        官方 /go + /billing 双页合并
    deepseek.ts        统一入口（按密钥格式自动选路并互备）
    deepseek-api.ts    官方 GET /user/balance
    deepseek-web.ts    网页 get_user_summary
    manual.ts          本地数字（rolling/payg）
  quota.ts             额度编排（快照/校验/合并 + 10 个同源路由）
  stats/               统计引擎
    fold.ts            会话折叠（终值覆盖采样、种子跳过）
    fsindex.ts         文件索引/指纹
    async.ts           超时
    engine.ts          缓存引擎（指纹持久缓存 + 后台渐进扫描，零依赖垫片版）
    routes.ts          GET /stats（别名 /data）
  index.ts             apply 装配（迁移→settings→引擎→路由）
src/client/            Client 半（浏览器，tsup → lib/client.js 单文件 IIFE）
  types.ts             协议类型
  api.ts               路由封装
  styles.ts            tm- 前缀样式（官方 token）
  components.ts        Badge/Row/Select/Switch
  QuotaSection.ts      额度设置页 + 侧边栏卡 + 浮窗 + 右栏富卡 + QuotaVendorWidget 独立组件
  StatsSection.ts      独立图表组件（指标卡/趋势/热力/模型分布）+ StatsWidget + 今日卡
  TokenMeterSection.ts 精简设置页（开关+供应商管理）+ 右栏双面板 + WidgetFloatLayer
  widgets.ts           通用小组件浮窗系统（拖拽/坐标持久化/portal）
  index.ts             loader（settings.section order 27 + 双侧边栏 + 右栏双 tab + 浮窗）
lib/                   构建产物（已提交，DSH git 安装必需）
  host.js              后端 bundle（schemastery 内联）
  client.js            前端 bundle（含 __ModuleLoader__.load）
cordis.patch.yml       bundle 声明（id: dshp-token-meter）
```

## 常见问题

- **设置页没有「Token 计量」**：确认 profile 的 `dsh.profile.bundles` 含 `@dshp/token-meter`，旧双插件已卸载（否则会有三个 Token 节重复）；重启 `dsh web` 后硬刷新浏览器。
- **额度报“密钥引用 $X 为空”**：先写入凭据（设置页“存凭据”）或 `export X=...` 后重启 `dsh web`（环境变量由进程继承）。
- **额度显示明文密钥**：state 下发明文已脱敏为空，编辑时留空即保留原值；想持久化引用请点“存凭据”转 `$TMETER_*`。
- **opencode 报“登录失效或被风控”**：`cookie` 过期，重新从浏览器复制 `auth` 并更新（裸 token 会自动补 `auth=`，整段 Cookie 原样透传亦可）。
- **DeepSeek 网页报“会话失效(401/403)”**：`token`（`ciYi` 开头 Bearer）过期，重新抓包粘贴；`sk-` 开头的请填 `apiKey` 栏（两套凭据不通用，实测 40003）。
- **统计一直“扫描中”**：会话多时后台分批扫描需时间（每批 8 个），`partial` 为渐进状态，轮询自动补全；单个会话 20s 超时防钉死，失败 3 次计入 `errors` 跳过。
- **统计数字对不上**：口径为终值覆盖（chunk 采样不重复计）+ fork 种子去重（含子代理）； reasoning 已含在 output，不重复加。
- **旧配置没过来**：首次启动会自动把 `dshp-inx-token-quota` + `dshp-inx-token-stats` 合并为 `dshp-token-meter`（旧段落保留，确认后手动删除）；`storages/token-quota.json` 会迁移并备份 `.bak`；新 key 已存在时以新为准。

## 卸载

```sh
dsh plugin --profile web remove "@dshp/token-meter"
dsh web
```

`remove` 会自动从 `dsh.profile.bundles` 撤下挂载。设置页配置已落盘到 `settings.yaml` 的 `dshp-token-meter` 分节，按需手动清理；指纹缓存（`token_stats` 域）随存储目录保留，不影响重装。

## 免责声明

- 本插件抓取 `opencode.ai` 页面结构，页面改版可能导致解析失败，需更新 `parseGoQuota` 正则；
- DeepSeek 余额走官方 `api.deepseek.com/user/balance` 或网页 `get_user_summary`（无公开文档，基于抓包推断），需有效凭据；
- 统计数据全部来自本机会话日志，无网络上报、无独立持久化；
- 本插件与 OpenAI / DeepSeek / Opencode 官方无隶属关系。
