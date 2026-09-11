/**
 * 「设置 → AI 搜索」配置页（单页多供应商）
 *
 * 分区（与官方设置页行规范一致，见 styles.ts）：
 *  1. 状态：选型徽章 / 提供方 id / 密钥状态 / 接管前
 *  2. 供应商切换（多个提供方并存时才出现；写 settings 的 provider 字段）
 *  3. 密钥配置：写入/显示/清除（走 api 网关 credentials 域，按 state 给出的引用名）
 *  4. 搜索行为：默认结果数 + 供应商自定义字段（控件由 state.providers[].fields 驱动）
 *  5. 供应商附加区（如 Tavily 用量与配额；由 providers/index.ts 注册）
 *  6. 连接测试：输入查询 → 结果列表
 *
 * 原实现：dsh-tavily-search/client.js 的 TavilySettingsSection（JS）
 * → 本文件为等价 TS 重写 + 多供应商泛化：控件与文案跟随状态接口元数据，
 *   新增供应商不改本文件（除附加区已自动注册外）。
 *
 * @module @dshp/search-provider/client
 */
import { createComponents } from './components.js';
import { createProviderExtras } from './providers/index.js';
import type { Bridge } from './api.js';
import type { Components } from './components.js';
import type { ConfigSnapshot, ProviderField, ProviderState, StateResponse, TestResponse } from './types.js';

interface Notice {
  kind: 'ok' | 'err';
  text: string;
}

interface FocusedView {
  provider: ProviderState;
  block: Record<string, unknown>;
}

export function createSearchSection(React: any, P: any, bridge: Bridge): () => any {
  const C: Components = createComponents(React, P);
  const EXTRAS = createProviderExtras(React, P, C, bridge);

  return function SearchSection() {
    const [info, setInfo] = React.useState(null as StateResponse | null);
    const [config, setConfig] = React.useState(null as ConfigSnapshot | null);
    const [stateErr, setStateErr] = React.useState(null as string | null);
    const [saving, setSaving] = React.useState(false);
    const [keyDraft, setKeyDraft] = React.useState('');
    const [keyShown, setKeyShown] = React.useState(false);
    const [busy, setBusy] = React.useState(null as null | 'saving' | 'clearing' | 'testing');
    const [notice, setNotice] = React.useState(null as Notice | null);
    const [query, setQuery] = React.useState('');
    const [result, setResult] = React.useState(null as TestResponse | null);

    const applyState = React.useCallback((value: StateResponse | null | undefined) => {
      if (value && value.ok) {
        setInfo(value);
        if (value.config) setConfig(value.config);
        setStateErr(null);
      } else {
        setStateErr((value && value.error) || '状态读取失败');
      }
    }, []);

    const load = React.useCallback(() => {
      bridge
        .getState()
        .then((value) => applyState(value))
        .catch((error: unknown) => setStateErr(String((error as Error)?.message ?? error)));
    }, [applyState]);

    React.useEffect(() => {
      load();
    }, [load]);

    const saveConfig = React.useCallback((patch: Record<string, unknown>, okText?: string) => {
      setSaving(true);
      setNotice(null);
      bridge
        .saveConfig(patch)
        .then((reply) => {
          setSaving(false);
          if (reply && reply.ok) {
            if (reply.config) setConfig(reply.config);
            setNotice({
              kind: 'ok',
              text: okText || '搜索行为已保存到 settings.yaml（dshp-search-provider），即时生效。',
            });
          } else {
            setNotice({ kind: 'err', text: (reply && reply.error) || '保存失败' });
          }
        })
        .catch((error: unknown) => {
          setSaving(false);
          setNotice({ kind: 'err', text: String((error as Error)?.message ?? error) });
        });
    }, []);

    const providers: ProviderState[] = (info && info.providers) || [];
    const providerId = (config && config.provider) || (providers[0] ? providers[0].id : '');
    const focusedProvider =
      providers.find((p) => p.id === providerId) ||
      (providers.length > 0 ? (providers[0] as ProviderState) : null);
    const focused: FocusedView | null =
      focusedProvider === null
        ? null
        : { provider: focusedProvider, block: readBlock(config, focusedProvider.id) };
    const selectedId = info ? (info.selectedProviderId ?? null) : null;
    const extras = (info && info.extras) || {};

    const saveKey = () => {
      if (focused === null) return;
      const value = keyDraft.trim();
      if (value.length === 0) {
        setNotice({ kind: 'err', text: '请输入 API Key 后再保存。' });
        return;
      }
      setBusy('saving');
      setNotice(null);
      bridge
        .saveKey(focused.provider.credentialRef, value)
        .then((reply) => {
          setBusy(null);
          if (reply && reply.ok) {
            setKeyDraft('');
            setNotice({ kind: 'ok', text: '密钥已保存到凭证库，搜索即时生效。' });
            applyState(reply.state);
          } else {
            setNotice({ kind: 'err', text: (reply && reply.error) || '保存失败' });
          }
        })
        .catch((error: unknown) => {
          setBusy(null);
          setNotice({ kind: 'err', text: String((error as Error)?.message ?? error) });
        });
    };

    const clearKey = () => {
      if (focused === null) return;
      setBusy('clearing');
      setNotice(null);
      bridge
        .clearKey(focused.provider.credentialRef)
        .then((reply) => {
          setBusy(null);
          if (reply && reply.ok) {
            setNotice({ kind: 'ok', text: '密钥已从凭证库移除。' });
            applyState(reply.state);
          } else {
            setNotice({ kind: 'err', text: (reply && reply.error) || '清除失败' });
          }
        })
        .catch((error: unknown) => {
          setBusy(null);
          setNotice({ kind: 'err', text: String((error as Error)?.message ?? error) });
        });
    };

    const runTest = () => {
      if (focused === null) return;
      const q = query.trim();
      if (q.length === 0) {
        setNotice({ kind: 'err', text: '先输入一个测试查询。' });
        return;
      }
      setBusy('testing');
      setNotice(null);
      setResult(null);
      bridge
        .runTest(focused.provider.id, q)
        .then((value) => {
          setBusy(null);
          setResult(value || { ok: false, error: '无响应' });
        })
        .catch((error: unknown) => {
          setBusy(null);
          setResult({ ok: false, error: String((error as Error)?.message ?? error) });
        });
    };

    const children: any[] = [];

    // ── 说明 ──
    children.push(
      React.createElement(
        'p',
        { className: 'sp-intro', key: 'intro' },
        focused === null
          ? '用 AI 搜索提供方接管模型的 web_search，替换 DeepSeek 官方搜索——官方搜索每次触发都消耗一轮模型调用，第三方搜索更便宜、更快。密钥写入凭证库，保存后立即生效。'
          : '用 ' +
              focused.provider.label +
              ' 接管模型的 web_search，替换 DeepSeek 官方搜索——官方搜索每次触发都消耗一轮模型调用，' +
              focused.provider.label +
              ' 更便宜、更快。密钥写入凭证库，保存后立即生效；下方可查看配额与连接测试。',
      ),
    );
    if (focused !== null && focused.provider.description.length > 0) {
      children.push(React.createElement(C.Hint, { key: 'pdesc', text: focused.provider.description }));
    }
    if (stateErr)
      children.push(
        React.createElement(C.Notice, { key: 'stateErr', kind: 'err', text: '状态读取失败：' + stateErr }),
      );
    if (notice)
      children.push(React.createElement(C.Notice, { key: 'notice', kind: notice.kind, text: notice.text }));

    // ── 状态 ──
    // 生效判定：插件已注册该提供方（selected）且 patch 固定选型为空或与其一致
    const effective =
      focused !== null &&
      focused.provider.selected &&
      (selectedId === null || selectedId === focused.provider.id);
    const selectedBadge =
      focused === null
        ? React.createElement(C.Badge, { kind: 'muted', text: '读取中…' })
        : effective
          ? React.createElement(C.Badge, { kind: 'ok', text: focused.provider.label + ' · 当前生效' })
          : selectedId !== null
            ? React.createElement(C.Badge, { kind: 'warn', text: 'patch 固定为 ' + selectedId })
            : React.createElement(C.Badge, { kind: 'warn', text: '等待接管' });
    const keyBadge =
      focused === null
        ? React.createElement(C.Badge, { kind: 'muted', text: '读取中…' })
        : focused.provider.configured
          ? React.createElement(C.Badge, {
              kind: 'ok',
              text: '已配置 · ' + (focused.provider.source || '凭证库'),
            })
          : React.createElement(C.Badge, { kind: 'warn', text: '未配置密钥' });
    const statusRows: any[] = [
      React.createElement(
        C.Row,
        { label: '搜索引擎', desc: '接管 web_search 的提供方。', key: 'engine' },
        selectedBadge,
      ),
      React.createElement(
        C.Row,
        { label: '提供方 ID', key: 'pid' },
        React.createElement('span', { className: 'sp-mono' }, focused === null ? '—' : focused.provider.id),
      ),
      React.createElement(
        C.Row,
        { label: 'API Key', key: 'key' },
        React.createElement(
          'span',
          { className: 'sp-mono' },
          focused === null ? '—' : focused.provider.credentialRef,
        ),
      ),
      React.createElement(C.Row, { label: '密钥状态', key: 'keystate' }, keyBadge),
      React.createElement(
        C.Row,
        { label: '接管前', key: 'before' },
        React.createElement('span', { className: 'sp-hint' }, 'DeepSeek 官方'),
      ),
    ];
    children.push(React.createElement('div', { className: 'sp-section', key: 'status' }, statusRows));
    if (info && info.selectionHint) {
      children.push(React.createElement(C.Hint, { key: 'selhint', text: info.selectionHint }));
    }

    // ── 供应商切换（多个并存时才出现）──
    if (providers.length > 1 && focused !== null) {
      const options = providers.map((p) => ({
        id: p.id,
        label: p.label + (p.selected ? '（当前生效）' : p.configured ? '' : '（未配置密钥）'),
      }));
      const current = providers.find((p) => p.id === providerId) || focused.provider;
      children.push(
        React.createElement(
          'div',
          { className: 'sp-section', key: 'switch' },
          React.createElement('div', { className: 'sp-sectionHead' }, '供应商'),
          React.createElement(
            C.Row,
            {
              label: '生效提供方',
              desc: '切换后立即解绑旧提供方并注册新提供方，搜索即时生效（无需重启）；若 profile patch 固定了其他 id，需先删除 web.searchProvider 一行。',
            },
            React.createElement(C.Select, {
              disabled: saving,
              value: current.id,
              selectedLabel: current.label,
              options,
              onSelect: (id: string) => {
                const picked = providers.find((x) => x.id === id);
                saveConfig(
                  { provider: id },
                  '已切换提供方为 ' + (picked !== undefined ? picked.label : id) + '，注册即时生效',
                );
                bridge
                  .getState()
                  .then((v) => applyState(v))
                  .catch(() => {});
              },
            }),
          ),
        ),
      );
    }

    // ── 密钥配置 ──
    if (focused !== null) {
      const keyInput = React.createElement(
        'div',
        { className: 'sp-inputWrap' },
        React.createElement(P.IconSearchOutline16, null),
        React.createElement('input', {
          className: 'sp-input',
          type: keyShown ? 'text' : 'password',
          placeholder:
            '粘贴 ' + focused.provider.label + ' API Key（' + focused.provider.credentialRef + '）',
          value: keyDraft,
          autoComplete: 'off',
          onChange: (event: any) => setKeyDraft(event.target.value),
          onKeyDown: (event: any) => {
            if (event.key === 'Enter') saveKey();
          },
        }),
      );
      children.push(
        React.createElement(
          'div',
          { className: 'sp-section', key: 'creds' },
          React.createElement('div', { className: 'sp-sectionHead' }, '密钥配置'),
          React.createElement(
            'div',
            { className: 'sp-bar' },
            keyInput,
            React.createElement(
              P.Button,
              {
                variant: 'outline',
                size: 'sm',
                disabled: busy !== null,
                onClick: () => setKeyShown(!keyShown),
              },
              keyShown ? '隐藏' : '显示',
            ),
            React.createElement(
              P.Button,
              { variant: 'primary', size: 'sm', disabled: busy !== null, onClick: saveKey },
              busy === 'saving' ? '保存中…' : '保存密钥',
            ),
          ),
          React.createElement(C.Hint, {
            key: 'credhint',
            text: '密钥通过 credentials 服务持久化到凭证库（~/.dsh/.credentials.yaml），不会被回显；启动终端里存在同名环境变量时以环境变量为准。',
          }),
          React.createElement(
            'div',
            { className: 'sp-bar', key: 'clearbar' },
            React.createElement(
              P.Button,
              {
                variant: 'ghost',
                size: 'sm',
                disabled: busy !== null || !focused.provider.configured,
                onClick: clearKey,
              },
              '清除密钥',
            ),
          ),
        ),
      );
    }

    // ── 搜索行为（通用字段 + 供应商自定义字段）──
    if (focused !== null) {
      const maxOptions: { id: string; label: string }[] = [];
      for (let n = 1; n <= 10; n += 1) maxOptions.push({ id: String(n), label: n + ' 条' });
      const maxValue = String((config && config.maxResults) || 5);
      const behaviorRows: any[] = [
        React.createElement(
          C.Row,
          { label: '默认结果数', desc: '单次调用传 maxResults 时优先用调用方的值。', key: 'max' },
          React.createElement(C.Select, {
            disabled: saving || config === null,
            value: maxValue,
            selectedLabel: maxValue + ' 条',
            options: maxOptions,
            onSelect: (id: string) => saveConfig({ maxResults: Number(id) }),
          }),
        ),
      ];
      for (const field of focused.provider.fields) {
        behaviorRows.push(fieldControl(React, C, field, focused, saving || config === null, saveConfig));
      }
      children.push(
        React.createElement(
          'div',
          { className: 'sp-section', key: 'behavior' },
          React.createElement('div', { className: 'sp-sectionHead' }, '搜索行为'),
          behaviorRows,
          React.createElement(C.Hint, {
            key: 'behint',
            text: '持久化到 settings.yaml（dshp-search-provider 命名空间），保存即时生效。',
          }),
        ),
      );
    }

    // ── 供应商附加区（如 Tavily 用量与配额）──
    if (focused !== null) {
      const Extra = EXTRAS[focused.provider.id];
      if (Extra !== undefined) {
        const extraMeta = extras[focused.provider.id] || {};
        children.push(
          React.createElement(Extra, {
            key: 'extra-' + focused.provider.id,
            provider: focused.provider,
            usageMeta: (extraMeta['usageMeta'] as Record<string, unknown>) || {},
          }),
        );
      }
    }

    // ── 连接测试 ──
    if (focused !== null) {
      const testInput = React.createElement(
        'div',
        { className: 'sp-inputWrap' },
        React.createElement('input', {
          className: 'sp-input',
          placeholder: '输入查询，例如：DeepSeek 最新发布',
          value: query,
          onChange: (event: any) => setQuery(event.target.value),
          onKeyDown: (event: any) => {
            if (event.key === 'Enter') runTest();
          },
        }),
      );
      children.push(
        React.createElement(
          'div',
          { className: 'sp-section', key: 'test' },
          React.createElement('div', { className: 'sp-sectionHead' }, '连接测试'),
          React.createElement(
            'div',
            { className: 'sp-bar' },
            testInput,
            React.createElement(
              P.Button,
              { variant: 'primary', size: 'sm', disabled: busy !== null, onClick: runTest },
              busy === 'testing' ? '搜索中…' : '运行测试',
            ),
          ),
        ),
      );
    }

    if (result !== null) {
      if (result.ok) {
        const items: any[] = [];
        for (const source of result.sources || []) {
          const meta = [source.url]
            .concat(source.publishedAt ? ['发布于 ' + source.publishedAt] : [])
            .join(' · ');
          items.push(
            React.createElement(
              'div',
              { className: 'sp-result-item', key: source.url },
              React.createElement(
                P.Tooltip,
                { label: source.url, side: 'top' },
                React.createElement(
                  'a',
                  { href: source.url, target: '_blank', rel: 'noreferrer' },
                  source.title || source.url,
                ),
              ),
              source.snippet
                ? React.createElement('div', { className: 'sp-result-snippet' }, source.snippet)
                : null,
              React.createElement('div', { className: 'sp-result-meta' }, meta),
            ),
          );
        }
        children.push(
          React.createElement(
            'div',
            { className: 'sp-section', key: 'result' },
            React.createElement(
              'div',
              { className: 'sp-sectionHead' },
              '测试成功 · ' + (result.sources || []).length + ' 条结果 · ' + result.takenMs + ' ms',
            ),
            React.createElement('div', { className: 'sp-results' }, items),
          ),
        );
      } else {
        children.push(
          React.createElement(C.Notice, {
            key: 'testerr',
            kind: 'err',
            text: '测试失败' + (result.takenMs ? '（' + result.takenMs + ' ms）' : '') + '：' + result.error,
          }),
        );
      }
    }

    return React.createElement('div', { className: 'sp-page' }, children);
  };
}

/** 读某供应商分节配置（非法结构按空对象处理） */
function readBlock(config: ConfigSnapshot | null, providerId: string): Record<string, unknown> {
  const raw = config === null ? undefined : config[providerId];
  return raw !== null && typeof raw === 'object' && !Array.isArray(raw)
    ? (raw as Record<string, unknown>)
    : {};
}

/**
 * 按字段元数据渲染一个供应商自定义配置控件（select / number / text）。
 * 新增供应商只需在 host 模块里声明 fields，这里自动跟随。
 */
function fieldControl(
  React: any,
  C: Components,
  field: ProviderField,
  focused: FocusedView,
  disabled: boolean,
  save: (patch: Record<string, unknown>, okText?: string) => void,
): any {
  const current = focused.block[field.key];
  const desc = field.hint !== undefined && field.hint.length > 0 ? field.hint : undefined;

  if (field.kind === 'select') {
    const options = field.options || [];
    const first = options[0];
    const hit = options.find((o) => o.value === current);
    const value = hit !== undefined ? hit.value : first !== undefined ? first.value : '';
    const label = hit !== undefined ? hit.label : first !== undefined ? first.label : value;
    return React.createElement(
      C.Row,
      { label: field.label, key: 'field-' + field.key, ...(desc !== undefined ? { desc } : {}) },
      React.createElement(C.Select, {
        disabled,
        value,
        selectedLabel: label,
        options: options.map((o) => ({ id: o.value, label: o.label })),
        onSelect: (id: string) => save({ [focused.provider.id]: { [field.key]: id } }),
      }),
    );
  }

  const text = typeof current === 'string' || typeof current === 'number' ? String(current) : '';
  const input = React.createElement('input', {
    className: 'sp-input',
    type: field.kind === 'number' ? 'number' : 'text',
    placeholder: field.placeholder || '',
    defaultValue: text,
    disabled,
    onBlur: (event: any) => {
      const raw = String(event.target.value);
      if (raw === text) return;
      if (field.kind === 'number') {
        const n = Number(raw);
        if (!Number.isFinite(n)) return;
        save({ [focused.provider.id]: { [field.key]: n } });
        return;
      }
      save({ [focused.provider.id]: { [field.key]: raw } });
    },
  });
  return React.createElement(
    C.Row,
    { label: field.label, key: 'field-' + field.key, ...(desc !== undefined ? { desc } : {}) },
    React.createElement('div', { className: 'sp-inputWrap' }, input),
  );
}
