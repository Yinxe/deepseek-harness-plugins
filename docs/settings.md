# 配置与 settings 持久化

> 本文承接旧 AGENT.md §7（配置与 settings 持久化规范）的完整细节。规则版总纲见[仓库根 AGENT.md](../AGENT.md)。

## 命名空间（配置键名唯一范式）

- 配置键名 = NS = `dshp-<name>`（kebab-case，`^[a-z][a-z0-9-]*$`，vision-bridge `http.ts` 的 `settingsNamespace()` 做运行时校验）。
- NS 四处同名：settings 命名空间 / 路由前缀 `/ext/dshp-<name>/*` / `cordis.patch.yml` id / settings.section id。这是定位插件状态的唯一钥匙，改名即 breaking。
- **只认 NS、只有一个键名**：`installSection(ctx, NS, ...)` 注册、`settings.update(NS, patch)` 写入、`describe()` 里只认 `d.ns === NS`、`getConfig()` 只读 `setSource` 存下的 getter。除 `NS` 定义处外**禁止硬编码任何键名字符串**；历史旧键（`dshp-inx-*`、改名前的旧 NS）**不得出现在代码里**，也不许为它写兼容读写。

## Schema（schemastery）

```ts
export const ConfigSchema: any = z.object({
  enabled: z.boolean().default(true),
  primary: z.union([VisionRouteSchema, z.const(null)]).default(null),
  detail: z.union([z.const('auto'), z.const('low'), z.const('high')]).default('auto'),
  maxImages: z.number().step(1).min(1).max(8).default(4),
  promptTemplate: z.string().default(''),
});
```

- 每个字段都要 `.default(...)`（与 `DEFAULT_CONFIG` 同值），`installSection(ctx, NS, ConfigSchema, entry, ...)` 四件套照抄。
- 约束进 schema（`min/max/step`、enum 用 `z.const` 联合），不要只在路由里判——settings 页和外部编辑 settings.yaml 都走 schema。
- `setSource` 回调里保存最新 getter（`current = src`），业务永远经 `getConfig()` 读，不直接持有对象（热重载靠它）。
- **固定不变的东西不进 settings**：外部端点、版本号、魔法数字一律写死为具名常量（如 mcwiki-search 的 `API_BASE = 'https://zh.minecraft.wiki/api.php'`，注释写「不可配置，换站改这里重 build」）。settings 只放用户真的会改的东西——每多一个配置项，就是多一份文档、多一个设置页控件、多一处校验。

## 不做迁移（改名/重构由用户手动完成）

**插件永不迁移历史配置**：不扫 settings.yaml，不读 `storages/*.json`，不认旧 key，不写回用户文件。

- 配置来源只有三处：schema 默认值 → composition `base`（patch）→ settings.yaml 的 **NS 分节**。缺字段就回默认值，多字段原样保留（schema 之外的键不动、不删）。
- 改名（NS / 包名 / 路由）是 **breaking**：老用户要么手动把旧分节改名/重配，要么接受回默认值。迁移步骤只写在 README 的更新日志里，**不写进代码**。
- 禁止出现：`LEGACY_SETTINGS_KEYS` / `migrateYamlNamespaceKey(s)` / `loadPersisted` / `planLegacyAdoption` / `sanitizePersisted` 这类为旧版服务的东西，以及任何 `readFileSync(settings.yaml)`、`existsSync(storages/…)`、`settings.update` 回写历史值的路径。
- 旧插件目录、旧 key、旧 `storages/*.json` 都由用户自行删除；插件启动不因它们存在或不存在改变行为。
- 只读的**值级兼容**仍可保留（例：token-meter provider `type` 别名 `registerAlias`、legacy 渲染兜底），但必须写在读路径上、**不落库、不改写用户文件**。

## 派生缓存不是用户配置（唯一的例外形态）

token-meter 的统计聚合缓存走 `ctx.storageDomain` 域 `token_stats`：域名只允许小写字母/数字/下划线，且**改名会废掉已有缓存触发全量重扫**，所以域名保持原样、不随 NS 改名。要点：

- 缓存 = **可丢的派生数据**（丢了凭会话日志自动重算），不是配置；
- 域名一旦定了不改（改名即缓存全废）；
- 写入范围仍限 `$DSH_HOME/storages/`，不碰用户其他文件。
