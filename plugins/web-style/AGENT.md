# plugins/web-style — 局部规则

> 上层：[根 AGENT.md](../../AGENT.md) → [docs/](../../docs/)。本文只写本插件自己的事实与局部约定。

## 身份

| 项     | 值                                                                                                 |
| ------ | -------------------------------------------------------------------------------------------------- |
| 包名   | `@dshp/web-style`                                                                                  |
| NS     | `dshp-web-style`（四处同名）                                                                       |
| 设置节 | `settings.section` order **50**，label「外观定制」                                                 |
| 能力   | 7 套主题画廊（每套 122 个 `--dsw-*` token 全量映射）+ 壁纸取色（Material You / MD3）+ 全局圆角三档 |
| 原实现 | `~/.dsh/plugins/dsh-custom-ui`（`@dshp-inx/custom-ui`）等价 TS 重写                                |

## 结构与职责

- `src/host/themes/`：主题 token **单源**（每包导出 `{ dark?, light?, meta }`，`index.ts` 的 `expand()` 按定义的 scheme 展开进 `THEME_CATALOG`）；Host 经同源路由全量下发，client 只存卡片 meta。
- `src/client/`：`index.tsx`（**只导出 `inject` / `apply`**，loader 壳由 `shared/tsup.preset.ts` 拼出）/ `GallerySection.tsx`（外观定制节，普通函数组件 + JSX 的范式）/ `apply-theme.ts`（覆盖层）/ `themes.ts`（画廊 meta）/ `md3.ts`（壁纸取色）/ `radius.ts` / `state.ts` / `styles.module.css`（CSS Modules，局部名不再需要前缀）/ `types.ts`（协议 + 领域模型 + 只含实际用到的 `ClientContext` / `SlotsService` 接缝）。
- 路由面：`GET state` / `GET themes` / `POST theme` / `POST config`。

## 本插件的局部规则

1. **与官方外观系统同轨，不做对抗**：不注册自定义主题 id，把每套主题作为官方 `overrideTokens` **覆盖层**叠加在官方亮/暗之上——主题自身 scheme 分支填主题值，对侧分支填官方原样值，因此官方「外观」行（浅色/深色/跟随系统）永远合法可用，「回到官方」= 撤销覆盖层。
2. **主题集精简是决策不是欠账**：曾扩到 33 套，因「同一套布局换色相」区分度不足、每套 122 token 维护线性增长，精简为 7 套：`claude-parchment-light` / `xiaohongshu-light` / `levels-light` / `arc-light` / `sakura-light`（浅色）+ `luxury-dark` / `supabase-dark`（深色）。加回主题要有区分度论据。
3. **有意不覆盖的 token 不许顺手补**：如 `--dsw-alias-markdown-tag`（DSH 里是活动标签页底色，是面不是前景，填中灰实色会把活动标签页压成灰块）——清单见 `themes/shared.ts` 头注释。
4. **画廊按钮文字按亮度择优**：不许写死 `#fff`（浅色主题上不达标）。
5. **目录 ↔ 画廊 meta ↔ 产物一致性由脚本守**：`scripts/check-themes.mjs` 进 `pnpm test`，改主题必须过它。

## 自检

`pnpm --filter @dshp/web-style test` = `node --check` 双 bundle + `scripts/check-themes.mjs` + `shared/scripts/check-css-modules.mjs`（`styles.x` 拼错在类型上是合法的，这个静态检查是唯一会自动红的网）。
