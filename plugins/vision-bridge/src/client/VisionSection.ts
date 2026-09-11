/**
 * VisionSection（设置 → 视觉模型）
 * 由原 client.js VisionSection() 等价改写：React.createElement 写法保留（不用 JSX，
 * 避免引入 jsx 运行时配置），逻辑逐行对齐。
 */
import { checkConnectivity, fetchState, saveConfig } from './api.js';
import { createComponents } from './components.js';
import type {
  AnyPrimitives,
  AnyReact,
  CheckResponse,
  VisionConfig,
  VisionModel,
  VisionRoute,
} from './types.js';

function parseKey(key: string): VisionRoute | null {
  if (typeof key !== 'string' || !key) return null;
  const i = key.indexOf('///');
  if (i < 0) return null;
  const provider = key.slice(0, i);
  const model = key.slice(i + 3);
  if (!provider || !model) return null;
  return { provider, model };
}

function routeLabel(r: VisionRoute & { name?: string }): string {
  let base = r.provider + ' / ' + r.model;
  if (r.name && r.name !== r.model) base += '（' + r.name + '）';
  return base;
}

export function createVisionSection(React: AnyReact, P: AnyPrimitives): () => any {
  const { Badge, Row, Select, Switch } = createComponents(React, P);

  function VisionSection(): any {
    const [models, setModels] = React.useState([] as VisionModel[]);
    const [config, setConfig] = React.useState(null as VisionConfig | null);
    const [loading, setLoading] = React.useState(true as boolean);
    const [saving, setSaving] = React.useState(false as boolean);
    const [error, setError] = React.useState('' as string);
    const [check, setCheck] = React.useState(null as CheckResponse | null);
    const [checkBusy, setCheckBusy] = React.useState(false as boolean);
    const [takeover, setTakeover] = React.useState(false as boolean);

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
    React.useEffect(() => {
      load();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
      return React.createElement(
        'div',
        { className: 'vb-page' },
        React.createElement(
          'div',
          { className: 'vb-loading' },
          React.createElement(P.IconLoadingOutline16, null),
          React.createElement(
            'span',
            { className: 'vb-loadingText' },
            '正在读取 setting.yml 中的多模态模型…',
          ),
        ),
      );
    }

    const primaryKey = config?.primary ? config.primary.provider + '///' + config.primary.model : '';
    const fallbackKey = config?.fallback
      ? config.fallback.provider + '///' + config.fallback.model
      : '__none';

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

    const children: any[] = [];

    children.push(
      React.createElement(
        'p',
        { className: 'vb-intro' },
        '纯文本模型看到图片占位符时自动调用 vision_describe，桥接至此处的视觉模型。主模型失败时用备用模型重试一次。',
      ),
    );

    if (error) children.push(React.createElement('p', { className: 'vb-notice vb-notice-err' }, error));
    if (models.length === 0)
      children.push(
        React.createElement(
          'p',
          { className: 'vb-notice vb-notice-warn' },
          '没有在 setting.yml 里找到 input 含 image 的模型。请在 llm-pi-ai / llm-deepseek → providers → models 里为视觉模型加 input: [text, image]，保存后点「重新读取」。',
        ),
      );

    children.push(
      React.createElement(
        'div',
        { className: 'vb-section' },
        React.createElement(
          Row,
          { label: '启用视觉桥接', desc: '关闭后 vision_describe 将直接报错，纯文本模型无法再看图。' },
          React.createElement(Switch, {
            checked: !!(config && config.enabled),
            disabled: saving,
            label: '启用视觉桥接',
            onChange: () => save({ enabled: !(config && config.enabled) }),
          }),
        ),
        React.createElement(
          Row,
          { label: '发送门禁接管' },
          takeover
            ? React.createElement(Badge, { kind: 'ok', text: '桥接接管中' })
            : React.createElement(Badge, { kind: 'muted', text: '未接管' }),
        ),
        React.createElement(
          Row,
          { label: '候选模型' },
          models.length > 0
            ? React.createElement(Badge, { kind: 'info', text: models.length + ' 个可用' })
            : React.createElement(Badge, { kind: 'muted', text: '0 个可用' }),
        ),
      ),
    );

    const primarySelect = React.createElement(Select, {
      disabled: saving,
      value: primaryKey,
      selectedLabel: config?.primary ? routeLabel(config.primary) : '请选择主模型…',
      options: modelOptions.map((m: VisionModel) => ({
        id: m.provider + '///' + m.model,
        label: routeLabel(m),
      })),
      onSelect: (id: string) => save({ primary: parseKey(id) }),
    });
    const fallbackSelect = React.createElement(Select, {
      disabled: saving,
      value: fallbackKey,
      selectedLabel: config?.fallback ? routeLabel(config.fallback) : '不使用 fallback',
      options: [{ id: '__none', label: '不使用 fallback' }].concat(
        models.map((m: VisionModel) => ({ id: m.provider + '///' + m.model, label: routeLabel(m) })),
      ),
      onSelect: (id: string) => save({ fallback: id === '__none' ? null : parseKey(id) }),
    });
    children.push(
      React.createElement(
        'div',
        { className: 'vb-section' },
        React.createElement('div', { className: 'vb-sectionHead' }, '模型选择'),
        React.createElement(
          Row,
          {
            label: '主视觉模型',
            desc: '候选来自 setting.yml 中 input 含 image 的模型 + 运行时 provider 列表。',
          },
          primarySelect,
        ),
        React.createElement(
          Row,
          { label: '备用模型', desc: '主模型失败时重试一次；不选则不重试。' },
          fallbackSelect,
        ),
      ),
    );

    const detailSelect = React.createElement(Select, {
      disabled: saving,
      value: (config && config.detail) || 'auto',
      selectedLabel:
        config?.detail === 'low'
          ? 'low（简要 2-3 句）'
          : config?.detail === 'high'
            ? 'high（详细转录）'
            : 'auto（常规）',
      options: [
        { id: 'auto', label: 'auto（常规）' },
        { id: 'low', label: 'low（简要 2-3 句）' },
        { id: 'high', label: 'high（详细转录）' },
      ],
      onSelect: (id: string) => save({ detail: id as VisionConfig['detail'] }),
    });
    const maxSelect = React.createElement(Select, {
      disabled: saving,
      value: String((config && config.maxImages) || 4),
      selectedLabel: String((config && config.maxImages) || 4) + ' 张',
      options: ['1', '2', '3', '4', '6', '8'].map((n) => ({ id: n, label: n + ' 张' })),
      onSelect: (id: string) => save({ maxImages: Number(id) }),
    });
    children.push(
      React.createElement(
        'div',
        { className: 'vb-section' },
        React.createElement('div', { className: 'vb-sectionHead' }, '行为'),
        React.createElement(
          Row,
          { label: '描述详细度', desc: 'high 追加「逐字转录」要求，low 追加「2-3 句概括」。' },
          detailSelect,
        ),
        React.createElement(Row, { label: '单次最多图片', desc: '超限时取最新的若干张。' }, maxSelect),
      ),
    );

    children.push(
      React.createElement(
        'div',
        { className: 'vb-section' },
        React.createElement('div', { className: 'vb-sectionHead' }, '追加提示词'),
        React.createElement(
          'div',
          { className: 'vb-rowWrap' },
          React.createElement(
            'div',
            { className: 'vb-rowText' },
            React.createElement('div', { className: 'vb-title' }, '每次识别追加的要求'),
            React.createElement(
              'div',
              { className: 'vb-desc' },
              '失焦自动保存；最多 2000 字符，实际发给视觉模型时截断 500 字符。',
            ),
          ),
          React.createElement('textarea', {
            className: 'vb-textarea',
            disabled: saving,
            placeholder: '可选：例如「重点看报错弹窗里的红字，忽略水印」',
            rows: 3,
            value: config && typeof config.promptTemplate === 'string' ? config.promptTemplate : '',
            onChange: (e: { target: { value: string } }) => {
              const v = e.target.value;
              setConfig((prev: VisionConfig | null) => {
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
            },
            onBlur: (e: { target: { value: string } }) => {
              const cur = (config && config.promptTemplate) || '';
              if (e.target.value !== cur) save({ promptTemplate: e.target.value });
            },
          }),
        ),
      ),
    );

    children.push(
      React.createElement(
        'div',
        { className: 'vb-section' },
        React.createElement(
          'div',
          { className: 'vb-bar' },
          React.createElement(
            P.Button,
            { variant: 'outline', size: 'sm', disabled: saving || checkBusy, onClick: load },
            '重新读取',
          ),
          React.createElement(
            P.Button,
            { variant: 'primary', size: 'sm', disabled: checkBusy, onClick: runCheck },
            checkBusy ? '检查中…' : '检查连通性',
          ),
        ),
        check
          ? React.createElement(
              'div',
              { className: 'vb-section', style: { borderTop: 'none' } },
              React.createElement(
                Row,
                { label: '主模型' },
                React.createElement(
                  'span',
                  { className: 'vb-modelLine' },
                  React.createElement(Badge, {
                    kind: check.primary?.ok ? 'ok' : 'warn',
                    text: check.primary?.ok ? '可达' : '不可用',
                  }),
                  React.createElement(
                    'span',
                    {
                      className: 'vb-hint',
                      style: {
                        marginLeft: 8,
                        textAlign: 'right',
                        maxWidth: 360,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      },
                    },
                    (check.primary && check.primary.message) || '未配置',
                  ),
                ),
              ),
              React.createElement(
                Row,
                { label: '备用模型' },
                React.createElement(
                  'span',
                  { className: 'vb-modelLine' },
                  React.createElement(Badge, {
                    kind: check.fallback?.ok ? 'ok' : 'muted',
                    text: check.fallback?.ok ? '可达' : check.fallback ? '未通过' : '未配置',
                  }),
                  React.createElement(
                    'span',
                    { className: 'vb-hint', style: { marginLeft: 8 } },
                    (check.fallback && check.fallback.message) || '未配置',
                  ),
                ),
              ),
              React.createElement(
                'p',
                { className: 'vb-hint' },
                '连通性仅做提供方/模型路由可解析性探活，非真实推理调用。',
              ),
            )
          : null,
      ),
    );

    children.push(
      React.createElement(
        'p',
        { className: 'vb-hint', style: { marginTop: 4 } },
        '工作方式：图片先缓存在本插件（最近 20 张/会话），vision_describe 把原图引用 + 你的问题一起发给主视觉模型。配置已持久化到 settings.yaml（dshp-vision-bridge 命名空间），支持热重载与注释保留。',
      ),
    );

    return React.createElement('div', { className: 'vb-page' }, children);
  }

  return VisionSection;
}
