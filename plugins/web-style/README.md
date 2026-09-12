# @dshp/web-style

DeepSeek Harness（DSH）**Web 外观定制套件**：**7 套主题画廊**（每套 122 个 `--dsw-*` token 全量映射）+ **设置页一键切换并持久化**；另有 **壁纸取色（Material You / MD3）** 一键生成整套动态配色（可导出 MD3 令牌）与 **全局圆角** 三档。

> 设计原则：**与官方外观系统同轨，不做对抗**。不注册自定义主题 id，而是把每套主题作为官方 `overrideTokens` **覆盖层**叠加在官方亮/暗之上——主题自身 scheme 分支填主题值，对侧分支填官方原样值，因此官方「外观」行（浅色/深色/跟随系统）永远合法可用，「回到官方」= 撤销覆盖层。主题 token 单源 `src/host/themes/`，由 Host 经同源路由下发，client 只存卡片 meta；运行时零依赖。

## 安装

### 方式一（推荐）：克隆 monorepo 安装 —— 更新只需 `git pull`，旧版 DSH 可 checkout tag

```sh
# 1. 克隆 monorepo（lib/ 构建产物已提交，clone 下来就能用，无需 build）
git clone git@github.com:Yinxe/deepseek-harness-plugins.git
cd deepseek-harness-plugins
pnpm install

# 2. 本地安装到 profile（路径按你执行命令时的 cwd 解析）
dsh plugin --profile web add ./plugins/web-style

# 3. 重启生效
dsh web
```

- **更新**：仓库内 `git pull` + `dsh web`（最快——lib 已提交，未改 src 无需 build）；兼容旧版 DSH：按 [`compat.json`](../../compat.json) 的 tag `git checkout <tag>` 后重跑上面的 add。

`dsh plugin` 会把包写进 profile 的 `dsh.profile.bundles` —— **无需手动改配置文件**。

> **从旧包 `@dshp-inx/custom-ui` 换过来**：先移除旧挂载再装新包，否则两个插件会注册同一个设置节（`WEB_DUPLICATE_PROVIDER`）：
>
> ```sh
> dsh plugin --profile web remove "@dshp-inx/custom-ui"   # 旧包（dsh-custom-ui）
> dsh plugin --profile web add ./plugins/web-style
> dsh web
> ```
>
> 配置**不自动迁移**：本插件只读 `settings.yaml` 的 `dshp-web-style` 分节。要把旧包的选择带过来，手工把 `dshp-inx-custom-ui` 段改名即可（字段同名，缩进块原样搬运）：
>
> ```yaml
> # 改名前（旧包，不再被读取）        改之后（本插件读取）
> dshp-inx-custom-ui:               dshp-web-style:
>   themeId: "supabase-dark"          themeId: "supabase-dark"
> ```

**改源码后**：`src/host` 或 `src/client` 改完跑 `pnpm --filter @dshp/web-style build` 重新打出 `lib/host.js + lib/client.js`，然后 `dsh web` 重启（client 半强刷页面即可）。

**验证**：设置 → 外观定制 能看到主题画廊；点任意卡片应立即换色并显示「正在使用」。

**一键 AI 安装**：把下面这段发给你的 DSH AI 即可：

```text
帮我安装 Web 外观定制插件（monorepo Yinxe/deepseek-harness-plugins，子目录 plugins/web-style，包名 @dshp/web-style）：
1. git clone monorepo 并 pnpm install
2. dsh plugin --profile web remove "@dshp-inx/custom-ui"（旧包 dsh-custom-ui，装着才需要；旧 settings 段请手工改名为 dshp-web-style）
3. dsh plugin --profile web add ./plugins/web-style
4. dsh web 重启，确认无报错，设置页「外观定制」出现主题画廊即成功
```

### 方式二：从 Release 安装（无需 clone；更新需手动重跑命令）

latest 滚动版（跟随 main 最新构建；滚动更新 = 重跑同一条 add 命令）：

```bash
dsh plugin --profile web add \
  https://github.com/Yinxe/deepseek-harness-plugins/releases/download/latest/dshp-web-style-latest.tgz

dsh web   # 重启生效
```

### 历史版本（兼容旧版 DSH）

main 永远跟随最新 DSH。老版本 DSH 用户装**静态历史版本**：按 `compat.json` 记录的兼容 tag，到 [Releases](https://github.com/Yinxe/deepseek-harness-plugins/releases) 找对应版本 Release（`v*` tag 触发，静态存档、永不滚动），资产名 = `dshp-web-style-<tag>.tgz`：

```bash
# 以 v0.1.5-rc.1 为例
dsh plugin --profile web add \
  https://github.com/Yinxe/deepseek-harness-plugins/releases/download/v0.1.5-rc.1/dshp-web-style-v0.1.5-rc.1.tgz

dsh web   # 重启生效
```

## 更新

### 三种安装方式对应的更新方式

| 安装方式             | 更新命令                                                    | 说明                                                      |
| -------------------- | ----------------------------------------------------------- | --------------------------------------------------------- |
| 方式一 clone（推荐） | 仓库内 `git pull` + `dsh web`                               | 最快；未改 src 免 build；旧版 DSH 用 `git checkout <tag>` |
| 方式二 Release       | 重跑同一条 `add` 命令 + `dsh web`                           | URL 直装对 `update` 免疫；两个 pnpm 坑见根 README         |
| 方式三 git 依赖      | `dsh plugin --profile web update @dshp/\<pkg\>` + `dsh web` | 一条命令；git 解析约 35s/插件（实测）                     |

## 功能

| 部分                                          | 内容                                                                                                                                                                                                                                                                                                                                                         |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Host（`src/host/` → `lib/host.js`）**       | 用官方 `ctx.settings` + `schemastery` 持久化到 `settings.yaml`（`dshp-web-style` 命名空间：`themeId` / `photoPalette` / `radius.global`）；主题目录全量 token 下发（单源 `src/host/themes/`，白名单从目录动态派生 + 虚拟 `photo:custom`）；配置只认 `dshp-web-style`（不读历史 key、不迁移）；退役字段 `wallpaper.*` / `glass.*` 仅不透明透传保留。          |
| **Client（`src/client/` → `lib/client.js`）** | 「设置 → 外观定制」一张页面：顶部圆角三档 + 回到官方；中部壁纸取色（上传 → seed → 5 组 ref 调色板 × 亮/暗角色预览 → 启用/复制 MD3/清除）；底部主题列表（当前态条 + 关键词搜索 + 亮/暗过滤 + 自适应 grid 色卡，点击即切）。启动时读 Host 快照恢复覆盖层与圆角；`theme/change` 事件驱动「使用中」徽标与壁纸渐变实时跟随。UI 全部使用官方 `dsw-alias-*` token。 |
| **同源路由**                                  | `GET /ext/dshp-web-style/state`（偏好快照）、`GET /ext/dshp-web-style/themes`（目录全量 token）、`POST /ext/dshp-web-style/theme`（切主题）、`POST /ext/dshp-web-style/config`（圆角 / 取色补丁），全部先过同源校验（`Origin` 与 `Host` 一致或缺失才放行），`no-store`，body 上限 1MB。                                                                      |
| **工具**                                      | 无（纯 UI 插件，不给模型注册任何工具）。                                                                                                                                                                                                                                                                                                                     |

## 主题清单

label / desc / swatch 以 `src/host/themes/*.ts` 的 `meta` 为准（token 同源此处，client 只存 meta）。

| 主题 id                  | 模式 | 风格                                       | 来源        |
| ------------------------ | ---- | ------------------------------------------ | ----------- |
| `claude-parchment-light` | 纯亮 | 羊皮纸 #f5f4ed + 赤陶 #c96442，ring 型深度 | claude      |
| `xiaohongshu-light`      | 纯亮 | 米灰 #f5f5f5 + 种草红 #ff2442              | xiaohongshu |
| `levels-light`           | 纯亮 | 米纸 #fbf7ef + 代谢绿 #2f8f46              | levels      |
| `arc-light`              | 纯亮 | 蜜桃 #fdf3ec + 珊瑚 #ff5f5f                | arc         |
| `sakura-light`           | 纯亮 | 樱白 #fff9fa + 樱粉 #e75480                | 原创        |
| `luxury-dark`            | 纯暗 | 曜石 #080706 + 鎏金 #c6a15b                | luxury      |
| `supabase-dark`          | 纯暗 | 墨黑 #171717 + 翡翠绿 #3ecf8e              | supabase    |

另有一套虚拟主题 `photo:custom`：壁纸取色（MD3 运行时生成，不在目录内，但属于合法持久化值，Host 白名单放行）。

每套 122 个 `--dsw-*` token 全量映射：背景 / 边框 / 品牌 / 按钮 / 交互态 / 文字 / 语义色 / Markdown / 滚动条 / 侧栏 / 气泡 / 浮层 / 阴影 / 字体栈。

`scripts/check-themes.mjs` 强制**全部主题覆盖同一套 token 名**（多写少写都报错），
并校验 `official.ts` 与 DSH 实际值一致 —— 后者是覆盖层的「对侧 scheme 无操作原值」，
漂移会导致选浅色主题再切深色时把 DSH 的旧配色涂回去。基线由
`node scripts/sync-official.mjs` 从已安装的 DSH 重新生成（快照落在
`scripts/dsw-alias-baseline.json`，CI 离线比对）。

### 侧栏选中行跟随品牌色

`--dsw-specific-sidebar-nav-item-active` 是侧栏选中行的胶囊底（DSH 的 `.navCell.active`，
画在 `--dsw-specific-sidebar-fill` 之上）。约定值固化为：

```
rgba(<该主题 --dsw-alias-brand-primary 的 RGB>, 0.22)
```

原来 33 套里 21 套与 `nav-item-hover` 的感知色差 ΔE < 5（其中 8 套**完全相同**、
3 套与侧栏底色几乎无差），选中态基本看不出来。改成品牌色叠色后：

| 指标                         |    改前 |                      改后 |
| ---------------------------- | ------: | ------------------------: |
| ΔE(active, hover) < 5 的主题 | 21 / 33 |                **0 / 33** |
| active 与 hover 完全相同     |  8 / 33 |                **0 / 33** |
| 最小 ΔE(active, hover)       |     0.0 |                   **6.6** |
| 最小 ΔE(active, 侧栏底色)    |     0.0 |                  **11.3** |
| 最小 `label-primary` 对比度  |    8.94 | **8.20**（仍远超 AA 4.5） |

`check-themes.mjs` 固定住这条派生关系；壁纸取色主题（`src/client/md3.ts`）同样走
`withAlpha(brand, 0.22)`。**改主题品牌色后必须同步这个值**，否则 `pnpm test` 会失败。

## 配置项

配置全部落在 `$DSH_HOME/settings.yaml` 的 `dshp-web-style` 命名空间（Host 用官方 settings 服务的 `installSection` 注册，支持热重载与注释保留）：

```yaml
dshp-web-style:
  themeId: supabase-dark # 空串 = 完全跟随官方「外观」（system/light/dark）
  radius:
    global: 0 # -1 跟随主题 / 0 全锐角 / 1–24 统一圆角（px）
  # 壁纸取色：未取色为 null；accent 恒等于 seed（旧数据的 seed 字段也认）
  photoPalette:
    accent: '#8b5cf6'
    companionA: '#5cf6c8'
    companionB: '#4a3a8b'
```

- **切换主题**只需改 `themeId`（白名单外的 id 一律视为空串 = 回官方默认）。
- **删除持久化**：把 `themeId` 置空串即完全跟随官方；再清 `photoPalette` 即丢掉取色数据。
- `wallpaper.*` / `glass.*` 是已退役特性的历史字段，插件只原样透传、不再读写，可手动删除。

## 代码结构

```
web-style/
├── package.json               # @dshp/web-style，dsh.bundle.patch + dsh.client.platform=web
├── tsup.config.ts             # host ESM + client IIFE 双 bundle（运行时零依赖）
├── cordis.patch.yml           # bundle 挂载行（id: dshp-web-style）
├── src/
│   ├── host/                  # Node 半：settings 持久化 + 同源路由 + 主题目录
│   │   ├── index.ts           #   apply 装配：patch → installSection → 4 条路由
│   │   ├── types.ts           #   StyleConfig / PhotoPalette / RadiusConfig / 补丁类型
│   │   ├── config.ts          #   NS / DEFAULT_CONFIG / ConfigSchema / sanitize*（不做迁移）
│   │   ├── http.ts            #   sameOrigin / json / readBody / settingsNamespace
│   │   └── themes/            #   主题 token 单源
│   │       ├── index.ts       #     THEME_CATALOG / THEME_IDS（expand）
│   │       ├── shared.ts      #     字体栈 / fillFontTokens / FLAT_SHADOWS / 类型
│   │       └── <21 个主题模块>  #     每文件导出 { dark?, light?, meta }
│   └── client/                # 浏览器半：设置节 UI + 覆盖层
│       ├── index.ts           #   __ModuleLoader__ 注册 + apply 装配
│       ├── GallerySection.ts  #   外观定制页（画廊 + 壁纸取色 + 圆角）
│       ├── apply-theme.ts     #   覆盖层：buildPair / applyThemeChoice / 启动恢复 / 卸载
│       ├── md3.ts             #   Material You 引擎（seed → 调色板 → sys → --dsw-*，含 MD3 导出）
│       ├── official.ts        #   官方 alias token 原值（对侧「无操作覆盖」用）
│       ├── api.ts             #   /ext/dshp-web-style/* fetch 封装（themes 缓存一次）
│       ├── themes.ts          #   画廊 meta（33 条，与 Host 目录逐项一致）
│       ├── state.ts           #   模块级会话状态
│       ├── radius.ts          #   全局圆角三档（语义属性选择器）
│       ├── clipboard.ts       #   复制 MD3（Clipboard API + execCommand 回落）
│       ├── types.ts           #   路由协议 / 服务类型
│       └── styles.ts          #   画廊 CSS（只走 --dsw-* token）
├── scripts/check-themes.mjs   # 目录 / client meta / 构建产物一致性校验（pnpm test 内跑）
└── lib/                       # 构建产物（已提交）：host.js + client.js
```

### 新增一套主题（三步）

1. `src/host/themes/` 加一个模块（照抄现有文件：`export const dark/light = fillFontTokens({...}, FONT)` + `export const meta: ThemeMetaMap = {...}`）；
2. `src/host/themes/index.ts` 加 `import * as x` + `...expand(x)`（顺序 = 画廊展示顺序）；
3. `src/client/themes.ts` 加一条 meta（id / colorScheme / label / desc / swatch）。

然后 `pnpm --filter @dshp/web-style build && pnpm --filter @dshp/web-style test`：`scripts/check-themes.mjs` 会校验两处 meta 逐项一致、id 唯一、client bundle 未内联 token，不一致直接非零退出。

## 常见问题

- **与其他主题类插件并存报 `WEB_DUPLICATE_PROVIDER`**：动态插件版（会话内 `cordis_define`）与静态挂载版、或旧包 `@dshp-inx/custom-ui` 与新包同时挂载都会撞。只保留一个：`cordis_undefine` 动态版，或 `dsh plugin --profile web remove` 旧包。
- **切换后重启回退到官方配色**：说明 `POST /theme` 保存失败（Host 未起来 / settings 服务不可用）。页面顶部会给出红字提示；检查 `settings.yaml` 是否有 `dshp-web-style` 段落、以及 `dsh web` 日志里有无 `[dshp-web-style]` 报错。
- **壁纸取色重启后丢失**：取色数据只存 seed（`photoPalette.accent`）。配色生效但保存失败时会提示「重启后会丢失取色」。
- **点主题没换色**：静态主题 token 需从 Host `GET /themes` 拉取；Host 半没起来时控制台会打印「主题 token 下发失败」。
- **圆角没生效**：圆角只改「语义面」选择器（`[class*="_card"]` / `_panel` / `_bubble` + 通用控件），圆/胶囊类元素刻意保留。

## 卸载

```sh
dsh plugin --profile web remove "@dshp/web-style"
dsh web
```

再删掉 `settings.yaml` 里的 `dshp-web-style` 段（可选），并把官方「外观」行设回你想要的状态。插件不写任何自有文件、不装运行时依赖，卸载即干净。

## 移植说明

本插件由独立仓库插件 **`@dshp-inx/custom-ui`（`~/.dsh/plugins/dsh-custom-ui`，纯 JS）** 移植而来，按本 monorepo 规范重写为 TypeScript ESM，并更名为 **`@dshp/web-style`**。

| 原 JS                                          | 新 TS                                                      | 说明                                                                                                                        |
| ---------------------------------------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `lib/index.js`（269 行）                       | `src/host/index.ts` + `types.ts` + `config.ts` + `http.ts` | Host 逻辑逐行等价；配置只认 `dshp-web-style`，未保留旧命名空间迁移                                                          |
| `lib/themes/index.js`                          | `src/host/themes/index.ts` + `shared.ts`                   | `expand()` / 顺序 / meta 全等，补类型（`ThemeModule` / `ThemeCatalogEntry`）                                                |
| `lib/themes/<name>.js` × 21                    | `src/host/themes/<name>.ts` × 21                           | 脚本机械转换，token 值逐字未改；补 `ThemeMetaMap` 类型                                                                      |
| `lib/themes/photo.js`（382 行，Host 从未引用） | `src/client/md3.ts`                                        | **双份手工同步的 MD3 引擎合并为一份**：Host 半不再打包 photo 引擎（原来就是死代码），client 侧以 `client.js` 的实时实现为准 |
| `client.js`（997 行）                          | `src/client/*.ts`（11 个模块）                             | 画廊 / 覆盖层 / 圆角 / MD3 / 官方原值 / 样式按层拆分，行为逐行对齐                                                          |
| `scripts/check-themes.mjs`                     | 同名脚本                                                   | 校验点升级：目录自洽 + client meta 逐项一致 + **构建产物**（id 存在、token 未内联、Host 路由与白名单齐全）                  |

**有意的差异**（其余为纯机械等价）：

1. **命名空间**：`dshp-inx-custom-ui` → `dshp-web-style`（settings NS / 路由前缀 / 设置节 id / 覆盖层 source 同名）；**不写迁移代码**，旧段由用户手工改名（本插件首个版本，无历史用户）。
2. **内部 token 改名**：`--dshp-cu-body-gradient` → `--dshp-ws-body-gradient`（仅插件内部使用，不影响用户配置）。
3. **MD3 导出注释**：`exported by dshp-inx-custom-ui` → `exported by dshp-web-style`。
4. **删除死代码**：client 画廊 meta 里从未使用的 `group` 字段、CSS 里从未引用的 `.tg-photoSwatch`、`findTheme()` 中 photo 分支（调用点早已被 `PHOTO_ID` 分支拦掉）。
5. **lint 修正**：`img.onload/onerror` → `addEventListener`；`new Array(12).fill(null).map()` → `Array.from({length:12})`；neobrutalism 未使用的 `FLAT_SHADOWS` import 移除。行为不变。

**等价性验证**（移植时执行，脚本已删）：以原 `lib/themes/*` 与 `client.js` 为基准逐项比对——23 套目录条目（含全部 token）全等、10 个 seed × {palettes, light/dark scheme, `buildPhotoTokens`, `buildM3ExportCss`} 全等、`hexToHsl`/`hslToHex`/`withAlpha`/`extractDominant`/`extractPalette`/`buildWallpaperTheme` 全等、23 条画廊 meta 全等、88 + 88 个 `OFFICIAL_*` token 全等。

> 注：移植期这份手抄的 `OFFICIAL_DARK` 后来被查出**漂移了 65/88 项**（值仍停留在 DSH 0.0.x 的旧暗色调色板），
> 会导致「选浅色主题 → 切深色」时整片回退成旧配色。现已改为由 `scripts/sync-official.mjs`
> 从真实安装重新生成（90 + 90 项，0 漂移），并由 `check-themes.mjs` 常驻校验。

### 主题集精简

曾扩展到 33 套，但实测**大多数主题的视觉区分度不足** —— 基本是「同一套布局换个色相」，
而维护成本随数量线性增长（每套 122 个 token，任何全局约定都要同步几十处）。
现精简为 7 套：`claude-parchment-light` / `xiaohongshu-light` / `levels-light` / `arc-light` /
`sakura-light` / `luxury-dark` / `supabase-dark`。

> ⚠️ **明暗分布**：7 套里 **5 套浅色、只有 2 套深色**（`luxury-dark` / `supabase-dark`）。
> 日常用深色模式的话，实际只有这 2 套可选。

### 同期修复（来自 token 审计）

1. **`OFFICIAL_LIGHT/DARK` 重新生成** —— 暗色分支此前漂移 **65/88** 项（值仍停留在 DSH 0.0.x 的旧暗色调色板），
   会让「选浅色主题 → 切深色」整片回退成旧配色。现由 `scripts/sync-official.mjs` 从真实 DSH 生成
   （90 + 90，0 漂移），`check-themes.mjs` 常驻校验。
2. **补 `--dsw-alias-link`** —— 此前基线与主题都没有它，markdown 链接与文件提及永远是 DeepSeek 蓝。
3. **补 `--dsw-alias-state-business-primary/tertiary`** —— 此前官方 DeepSeek 蓝会渗进每套主题。
4. **删死 token `--dsw-alias-line-secondary`** —— 全 DSH 零引用。
5. **`--dsw-alias-markdown-tag` 交给官方默认** —— DSH 里它是「活动标签页底色」（面不是前景），
   主题按前景语义填中灰实色会把活跃标签压成灰块，故主题一律不覆盖（`check-themes.mjs` 守着这条）。
6. **画廊按钮文字改为按亮度择优** —— 原先写死 `#fff`，在保留的这 7 套上**一套都不达标**
   （最差 Supabase 绿仅 1.91:1）；改为按 accent 相对亮度在白/近黑间择优后 **7/7 达标**。
7. **`.tg-search::placeholder` 换用 `--dsw-alias-label-tertiary`** —— 原用的 `label-quaternary` DSH 并未定义。
8. **`fillFontTokens` 支持自定义等宽栈** —— 传字符串时 markdown 代码块与 `--dsw-font-mono` 同源。

## 免责声明

主题配色参考各品牌公开的设计系统（Claude / 小红书 / Levels / Arc / Supabase / Luxury 等）的**公开色值**，
用于本地界面外观定制；商标与品牌归属各自所有者，本项目与上述公司无任何关联。原创主题（Sakura）为本项目贡献。

本插件只改 CSS 变量与圆角，不修改官方代码、不注入脚本行为、不收集任何数据；壁纸取色在浏览器本地 48×48 采样，图片不上传。
