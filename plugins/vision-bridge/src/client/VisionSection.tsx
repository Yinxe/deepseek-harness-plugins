/**
 * VisionSection（设置 → 视觉模型）
 *
 * 四段式设置页：桥接开关 / 模型选择 / 行为 / 追加提示词，末尾是运维条（重新读取 + 连通性检查）
 * 与一段「工作方式」说明。状态机五件套 `models` / `config` / `loading` / `saving` / `error`，
 * 外加连通性检查的 `check` / `checkBusy` 与门禁接管的 `takeover`。
 *
 * 组件是**普通函数组件**，不再是 `createVisionSection(React, P)` 工厂：`useState` / `useEffect`
 * 直接从 `react` import，官方构件从 primitives import（都是 devDependency，只参与类型检查与构建，
 * 运行时由 shell 的冻结模块表注入）。
 *
 * @module @dshp/vision-bridge/client/VisionSection
 */
import { useEffect, useState } from 'react';
import { Button, IconLoadingOutline16 } from '@deepseek-ai/dsh-client-ui-primitives';
import type { ReactNode } from 'react';
import { checkConnectivity, fetchState, saveConfig } from './api.js';
import { Badge, Row, Select, Switch } from './components.js';
import styles from './styles.module.css';
import type { CheckResponse, VisionConfig, VisionModel, VisionRoute } from './types.js';

/**
 * 解析下拉选项 id（`provider///model`）。
 *
 * @param key - `provider///model`；约定分隔符是三个斜杠。
 * @returns 路由；格式不对时 null（视为「不设置」）。
 */
function parseKey(key: string): VisionRoute | null {
  if (typeof key !== 'string' || !key) return null;
  const i = key.indexOf('///');
  if (i < 0) return null;
  const provider = key.slice(0, i);
  const model = key.slice(i + 3);
  if (!provider || !model) return null;
  return { provider, model };
}

/**
 * 路由的显示文案。
 *
 * @param r - 路由（可带展示名）。
 * @returns `provider / model`，展示名与模型名不同时补一个「（展示名）」。
 */
function routeLabel(r: VisionRoute & { name?: string }): string {
  let base = r.provider + ' / ' + r.model;
  if (r.name && r.name !== r.model) base += '（' + r.name + '）';
  return base;
}

/** 下拉里表示「不使用 fallback」的哨兵 id。 */
const NO_FALLBACK = '__none';

/** 设置节组件（无 props，由槽位直接渲染）。 */
export function VisionSection(): ReactNode {
  const [models, setModels] = useState<VisionModel[]>([]);
  const [config, setConfig] = useState<VisionConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [check, setCheck] = useState<CheckResponse | null>(null);
  const [checkBusy, setCheckBusy] = useState(false);
  const [takeover, setTakeover] = useState(false);

  /** 读一次模型候选 + 配置。 */
  function load(): void {
    setLoading(true);
    setError('');
    fetchState()
      .then((res) => {
        if (res && res.ok) {
          setModels(Array.isArray(res.models) ? res.models : []);
          setConfig(res.config || null);
          setTakeover(!!(res && res.admissionTakeover));
        } else {
          setError((res && res.error) || '无法读取视觉模型列表');
          setModels([]);
        }
        setLoading(false);
      })
      .catch((e: unknown) => {
        setError('读取视觉模型列表失败：' + String((e as Error)?.message ?? e));
        setLoading(false);
      });
  }

  useEffect(() => {
    load();
    // 只在挂载时读一次：load() 每次渲染都是新函数，进依赖数组会变成无限循环。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * 存一项配置。
   *
   * @param patch - 要覆盖的字段（Host 侧逐字段校验后写回 settings.yaml）。
   */
  function save(patch: Partial<VisionConfig>): void {
    setSaving(true);
    setError('');
    saveConfig(patch)
      .then((res) => {
        if (res && res.ok) {
          setConfig(res.config ?? null);
        } else {
          setError('保存失败：' + String(res?.error || '未知错误'));
        }
        setSaving(false);
      })
      .catch((e: unknown) => {
        setError('保存失败：' + String((e as Error)?.message ?? e));
        setSaving(false);
      });
  }

  /** 探活主备路由（只做可解析性检查，不是真实推理调用）。 */
  function runCheck(): void {
    setCheckBusy(true);
    setCheck(null);
    setError('');
    checkConnectivity()
      .then((res) => {
        setCheck(res);
        setCheckBusy(false);
      })
      .catch((e: unknown) => {
        setError('连通性检查失败：' + String((e as Error)?.message ?? e));
        setCheckBusy(false);
      });
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>
          <IconLoadingOutline16 />
          <span className={styles.loadingText}>正在读取 setting.yml 中的多模态模型…</span>
        </div>
      </div>
    );
  }

  const primaryKey = config?.primary ? config.primary.provider + '///' + config.primary.model : '';
  const fallbackKey = config?.fallback
    ? config.fallback.provider + '///' + config.fallback.model
    : NO_FALLBACK;

  // 候选来自 setting.yml；当前选中的路由可能已经不在候选里（模型改名 / 用户改了配置），
  // 那就把它补到列表最前面，否则下拉里看不到当前值、一打开就等于逼用户重选。
  const modelOptions: VisionModel[] = models.slice();
  if (config?.primary) {
    const hasP = modelOptions.some(
      (m) =>
        m.provider === (config.primary as VisionRoute).provider &&
        m.model === (config.primary as VisionRoute).model,
    );
    if (!hasP) {
      const cur = config.primary as VisionRoute;
      modelOptions.unshift({
        provider: cur.provider,
        model: cur.model,
        name: cur.model + '（当前选择，不在列表中）',
      });
    }
  }

  const toggleEnabled = (): void => save({ enabled: !(config && config.enabled) });

  return (
    <div className={styles.page}>
      <p className={styles.intro}>
        纯文本模型看到图片占位符时自动调用
        vision_describe，桥接至此处的视觉模型。主模型失败时用备用模型重试一次。
      </p>

      {error ? <p className={styles.notice + ' ' + styles.noticeErr}>{error}</p> : null}
      {models.length === 0 ? (
        <p className={styles.notice + ' ' + styles.noticeWarn}>
          没有在 setting.yml 里找到 input 含 image 的模型。请在 llm-pi-ai / llm-deepseek → providers → models
          里为视觉模型加 input: [text, image]，保存后点「重新读取」。
        </p>
      ) : null}

      <div className={styles.section}>
        <Row label="启用视觉桥接" desc="关闭后 vision_describe 将直接报错，纯文本模型无法再看图。">
          <Switch
            checked={config?.enabled === true}
            disabled={saving}
            label="启用视觉桥接"
            onChange={toggleEnabled}
          />
        </Row>
        <Row label="发送门禁接管">
          {takeover ? <Badge kind="ok" text="桥接接管中" /> : <Badge kind="muted" text="未接管" />}
        </Row>
        <Row label="候选模型">
          {models.length > 0 ? (
            <Badge kind="info" text={models.length + ' 个可用'} />
          ) : (
            <Badge kind="muted" text="0 个可用" />
          )}
        </Row>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHead}>模型选择</div>
        <Row label="主视觉模型" desc="候选来自 setting.yml 中 input 含 image 的模型 + 运行时 provider 列表。">
          <Select
            disabled={saving}
            value={primaryKey}
            selectedLabel={config?.primary ? routeLabel(config.primary) : '请选择主模型…'}
            options={modelOptions.map((m) => ({
              id: m.provider + '///' + m.model,
              label: routeLabel(m),
            }))}
            onSelect={(id) => save({ primary: parseKey(id) })}
          />
        </Row>
        <Row label="备用模型" desc="主模型失败时重试一次；不选则不重试。">
          <Select
            disabled={saving}
            value={fallbackKey}
            selectedLabel={config?.fallback ? routeLabel(config.fallback) : '不使用 fallback'}
            options={[{ id: NO_FALLBACK, label: '不使用 fallback' }].concat(
              models.map((m) => ({ id: m.provider + '///' + m.model, label: routeLabel(m) })),
            )}
            onSelect={(id) => save({ fallback: id === NO_FALLBACK ? null : parseKey(id) })}
          />
        </Row>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHead}>行为</div>
        <Row label="描述详细度" desc="high 追加「逐字转录」要求，low 追加「2-3 句概括」。">
          <Select
            disabled={saving}
            value={(config && config.detail) || 'auto'}
            selectedLabel={
              config?.detail === 'low'
                ? 'low（简要 2-3 句）'
                : config?.detail === 'high'
                  ? 'high（详细转录）'
                  : 'auto（常规）'
            }
            options={[
              { id: 'auto', label: 'auto（常规）' },
              { id: 'low', label: 'low（简要 2-3 句）' },
              { id: 'high', label: 'high（详细转录）' },
            ]}
            onSelect={(id) => save({ detail: id as VisionConfig['detail'] })}
          />
        </Row>
        <Row label="单次最多图片" desc="超限时取最新的若干张。">
          <Select
            disabled={saving}
            value={String((config && config.maxImages) || 4)}
            selectedLabel={String((config && config.maxImages) || 4) + ' 张'}
            options={['1', '2', '3', '4', '6', '8'].map((n) => ({ id: n, label: n + ' 张' }))}
            onSelect={(id) => save({ maxImages: Number(id) })}
          />
        </Row>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHead}>追加提示词</div>
        <div className={styles.rowWrap}>
          <div className={styles.rowText}>
            <div className={styles.title}>每次识别追加的要求</div>
            <div className={styles.desc}>失焦自动保存；最多 2000 字符，实际发给视觉模型时截断 500 字符。</div>
          </div>
          <textarea
            className={styles.textarea}
            disabled={saving}
            placeholder="可选：例如「重点看报错弹窗里的红字，忽略水印」"
            rows={3}
            value={config && typeof config.promptTemplate === 'string' ? config.promptTemplate : ''}
            onChange={(e) => {
              const v = e.target.value;
              // 只改本地：输入过程中不发请求，失焦才存。
              setConfig((prev) => {
                if (!prev) return prev;
                return {
                  enabled: prev.enabled,
                  primary: prev.primary,
                  fallback: prev.fallback,
                  detail: prev.detail,
                  maxImages: prev.maxImages,
                  promptTemplate: v,
                };
              });
            }}
            onBlur={(e) => {
              const cur = (config && config.promptTemplate) || '';
              if (e.target.value !== cur) save({ promptTemplate: e.target.value });
            }}
          />
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.bar}>
          <Button variant="outline" size="sm" disabled={saving || checkBusy} onClick={load}>
            重新读取
          </Button>
          <Button variant="primary" size="sm" disabled={checkBusy} onClick={runCheck}>
            {checkBusy ? '检查中…' : '检查连通性'}
          </Button>
        </div>
        {check ? (
          <div className={styles.section} style={{ borderTop: 'none' }}>
            <Row label="主模型">
              <span className={styles.modelLine}>
                <Badge
                  kind={check.primary?.ok ? 'ok' : 'warn'}
                  text={check.primary?.ok ? '可达' : '不可用'}
                />
                <span
                  className={styles.hint}
                  style={{
                    marginLeft: 8,
                    textAlign: 'right',
                    maxWidth: 360,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {(check.primary && check.primary.message) || '未配置'}
                </span>
              </span>
            </Row>
            <Row label="备用模型">
              <span className={styles.modelLine}>
                <Badge
                  kind={check.fallback?.ok ? 'ok' : 'muted'}
                  text={check.fallback?.ok ? '可达' : check.fallback ? '未通过' : '未配置'}
                />
                <span className={styles.hint} style={{ marginLeft: 8 }}>
                  {(check.fallback && check.fallback.message) || '未配置'}
                </span>
              </span>
            </Row>
            <p className={styles.hint}>连通性仅做提供方/模型路由可解析性探活，非真实推理调用。</p>
          </div>
        ) : null}
      </div>

      <p className={styles.hint} style={{ marginTop: 4 }}>
        工作方式：图片先缓存在本插件（最近 20 张/会话），vision_describe 把原图引用 +
        你的问题一起发给主视觉模型。配置已持久化到 settings.yaml（dshp-vision-bridge
        命名空间），支持热重载与注释保留。
      </p>
    </div>
  );
}
