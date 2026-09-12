/**
 * MCP 设置节 —— 列表 + 表单/JSON 双模式编辑器（ZCode MCP 页同款布局）
 *
 * 状态机与 skill-manager 同形：loading / error / 空 / 正常 四态；保存失败回
 * error notice 不丢本地值；启停/删除即时生效并整体刷新快照。
 * 控件全部经官方 primitives（Button/Input/Switch/Tag/Menu/Modal/Pill），
 * 颜色只用 var(--dsw-alias-*) token。
 */
import type { McpServerView, McpState, AnyPrimitives, AnyReact, EnvValueView, EnvJson } from './types.js';
import { createComponents } from './components.js';
import {
  createServer,
  fetchState,
  probeServer,
  removeServer,
  saveManagerConfig,
  toggleServer,
  updateServer,
} from './api.js';

const SERVER_NAME_RE = /^[A-Za-z0-9_-]{1,32}$/;

/** 编辑器状态（表单 + JSON 双份草稿；切换模式时各自保留） */
interface EditorForm {
  serverName: string;
  transport: 'stdio' | 'streamable-http';
  command: string;
  argsText: string;
  envText: string;
  cwd: string;
  url: string;
  headersText: string;
  timeoutText: string;
  failOnStartup: boolean;
  failProvided: boolean;
  reconnect: unknown;
  /** JSON 模式里看到的自定义键；表单模式下原样保存回传（host 不认识也照写） */
  extras: Record<string, unknown>;
}

interface EditorState {
  mode: 'create' | 'edit';
  id: string;
  tab: 'form' | 'json';
  form: EditorForm;
  jsonText: string;
}

export function createMcpSection(React: AnyReact, P: AnyPrimitives): () => any {
  const h = React.createElement.bind(React);
  const { Badge, Switch, Selector } = createComponents(React, P);

  // ── 纯函数小工具 ────────────────────────────────────────────────────

  /** env/headers 视图 → 文本框 JSON（js 值序列化为 "js: <源码>"） */
  function envToJson(map: Record<string, EnvValueView>): EnvJson {
    const out: EnvJson = {};
    for (const [k, v] of Object.entries(map)) out[k] = v.js ? 'js: ' + v.source : v.source;
    return out;
  }

  /** 文本框 JSON → 字符串映射（含 "js: " 前缀原样传递；非法抛中文 Error） */
  function parseEnvJson(text: string, field: string): EnvJson {
    if (!text.trim()) return {};
    let parsed: unknown;
    try {
      parsed = JSON.parse(text) as unknown;
    } catch {
      throw new Error(field + ' 不是合法 JSON（值若为表达式请写 "js: 表达式"）');
    }
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed))
      throw new Error(field + ' 应为对象（如 { "KEY": "value" }）');
    const out: EnvJson = {};
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof v !== 'string') throw new Error(`${field} 的 ${k} 应为字符串（表达式用 "js: " 前缀）`);
      out[k.slice(0, 120)] = v.slice(0, 4096);
    }
    return out;
  }

  /** 空格分隔参数 → 数组（支持 'a b' / "c d" 引号） */
  function splitArgs(text: string): string[] {
    const matches = text.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g);
    if (!matches) return [];
    return matches
      .map((m) => (m.length >= 2 && (m[0] === '"' || m[0] === "'") ? m.slice(1, -1) : m))
      .slice(0, 64);
  }

  /** 参数数组 → 空格分隔文本（含空白的项用双引号包裹，保证 splitArgs 往返无损；含引号的异类值走 JSON 模式） */
  function argsToText(args: string[]): string {
    return args.map((a) => (/\s/.test(a) ? '"' + a + '"' : a)).join(' ');
  }

  /** 视图 → 列表摘要行（Zcode 风格：transport · 命令/URL） */
  function summaryOf(v: McpServerView): string {
    if (v.transport === 'stdio') {
      const cmd = [v.command, ...v.args].join(' ').trim();
      return 'stdio · ' + (cmd || '（缺少 command）');
    }
    if (v.transport === 'streamable-http') return 'http · ' + (v.url || '（缺少 url）');
    return '（transport 未识别）';
  }

  /** 视图 → 表单草稿 */
  function formFromView(v: McpServerView): EditorForm {
    return {
      serverName: v.serverName,
      transport: v.transport === 'streamable-http' ? 'streamable-http' : 'stdio',
      command: v.command,
      argsText: argsToText(v.args),
      envText: JSON.stringify(envToJson(v.env), null, 2),
      cwd: v.cwd,
      url: v.url,
      headersText: JSON.stringify(envToJson(v.headers), null, 2),
      timeoutText: v.toolCallTimeoutMs === null ? '' : String(v.toolCallTimeoutMs),
      failOnStartup: v.failOnStartupError === true,
      failProvided: v.failOnStartupError !== null,
      reconnect: v.reconnect ?? null,
      extras: { ...v.extras },
    };
  }

  function emptyForm(): EditorForm {
    return {
      serverName: '',
      transport: 'stdio',
      command: '',
      argsText: '',
      envText: '',
      cwd: '',
      url: '',
      headersText: '',
      timeoutText: '',
      failOnStartup: false,
      failProvided: false,
      reconnect: null,
      extras: {},
    };
  }

  /** 视图 → JSON 模式初始文本（完整 config；自定义键原样带回） */
  function viewToJsonText(v: McpServerView): string {
    const cfg: Record<string, unknown> = {};
    if (v.serverName) cfg['serverName'] = v.serverName;
    if (v.transport) cfg['transport'] = v.transport;
    if (v.transport === 'stdio') {
      if (v.command) cfg['command'] = v.command;
      if (v.args.length > 0) cfg['args'] = v.args;
      if (Object.keys(v.env).length > 0) cfg['env'] = envToJson(v.env);
      if (v.cwd) cfg['cwd'] = v.cwd;
    }
    if (v.transport === 'streamable-http') {
      if (v.url) cfg['url'] = v.url;
      if (Object.keys(v.headers).length > 0) cfg['headers'] = envToJson(v.headers);
    }
    if (v.toolCallTimeoutMs !== null) cfg['toolCallTimeoutMs'] = v.toolCallTimeoutMs;
    if (v.failOnStartupError !== null) cfg['failOnStartupError'] = v.failOnStartupError;
    if (v.reconnect !== null && v.reconnect !== undefined) cfg['reconnect'] = v.reconnect;
    for (const [k, val] of Object.entries(v.extras)) cfg[k] = val;
    return JSON.stringify(cfg, null, 2);
  }

  function createJsonText(): string {
    return JSON.stringify(
      {
        serverName: 'my-server',
        transport: 'stdio',
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-memory'],
      },
      null,
      2,
    );
  }

  /** 表单草稿 → config 载荷（校验失败抛中文 Error） */
  function configFromForm(f: EditorForm): Record<string, unknown> {
    const name = f.serverName.trim();
    if (!SERVER_NAME_RE.test(name)) throw new Error('名称非法：1-32 位字母/数字/下划线/连字符');
    const cfg: Record<string, unknown> = { serverName: name, transport: f.transport };
    if (f.transport === 'stdio') {
      const command = f.command.trim();
      if (!command) throw new Error('命令不能为空（stdio 传输要给出可执行文件）');
      cfg['command'] = command;
      const args = splitArgs(f.argsText);
      if (args.length > 0) cfg['args'] = args;
      const env = parseEnvJson(f.envText, '环境变量');
      if (Object.keys(env).length > 0) cfg['env'] = env;
      const cwd = f.cwd.trim();
      if (cwd) cfg['cwd'] = cwd;
    } else {
      const url = f.url.trim();
      if (!/^https?:\/\//.test(url)) throw new Error('URL 非法：应以 http:// 或 https:// 开头');
      cfg['url'] = url;
      const headers = parseEnvJson(f.headersText, '请求头');
      if (Object.keys(headers).length > 0) cfg['headers'] = headers;
    }
    const t = f.timeoutText.trim();
    if (t) {
      const n = Number(t);
      if (!Number.isFinite(n) || Math.floor(n) !== n) throw new Error('超时 MS 应为整数（毫秒）');
      cfg['toolCallTimeoutMs'] = Math.min(3600000, Math.max(1000, n));
    }
    if (f.failOnStartup || f.failProvided) cfg['failOnStartupError'] = f.failOnStartup;
    if (f.reconnect !== null && f.reconnect !== undefined) cfg['reconnect'] = f.reconnect;
    for (const [k, v] of Object.entries(f.extras)) cfg[k] = v;
    return cfg;
  }

  /** 表单能编辑的已知键（与 host 的 KNOWN_CONFIG_KEYS 对齐；其余都算自定义键） */
  const KNOWN_FORM_KEYS: ReadonlySet<string> = new Set([
    'serverName',
    'transport',
    'command',
    'args',
    'env',
    'cwd',
    'url',
    'headers',
    'toolCallTimeoutMs',
    'failOnStartupError',
    'reconnect',
  ]);

  function asTextMax(v: unknown, max: number): string {
    return typeof v === 'string' ? v.slice(0, max) : '';
  }

  /** JSON 值 → 文本框内容（undefined/null → 空串；其余尽力 pretty JSON） */
  function jsonTextOf(v: unknown): string {
    if (v === undefined || v === null) return '';
    try {
      return JSON.stringify(v, null, 2);
    } catch {
      return '';
    }
  }

  /** JSON 模式文本 → 表单草稿（尽力映射；非法值留给表单保存时给出中文报错） */
  function formFromConfig(cfg: Record<string, unknown>): EditorForm {
    const f = emptyForm();
    f.serverName = asTextMax(cfg['serverName'], 32);
    f.transport = cfg['transport'] === 'streamable-http' ? 'streamable-http' : 'stdio';
    f.command = asTextMax(cfg['command'], 600);
    const args = cfg['args'];
    f.argsText = Array.isArray(args) ? argsToText(args.map((a) => asTextMax(a, 600))) : '';
    f.envText = jsonTextOf(cfg['env']);
    f.cwd = asTextMax(cfg['cwd'], 1024);
    f.url = asTextMax(cfg['url'], 2048);
    f.headersText = jsonTextOf(cfg['headers']);
    const t = cfg['toolCallTimeoutMs'];
    f.timeoutText = typeof t === 'number' && Number.isFinite(t) ? String(t) : '';
    f.failOnStartup = cfg['failOnStartupError'] === true;
    f.failProvided = Object.hasOwn(cfg, 'failOnStartupError');
    const r = cfg['reconnect'];
    f.reconnect = r !== null && typeof r === 'object' && !Array.isArray(r) ? r : null;
    const extras: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(cfg)) {
      if (!KNOWN_FORM_KEYS.has(k)) extras[k.slice(0, 120)] = v;
    }
    f.extras = extras;
    return f;
  }

  // ── 子组件 ─────────────────────────────────────────────────────────

  function FieldLabel(props: { text: string; key?: string }): any {
    return h('div', { className: 'mc-fieldLabel', key: props.key }, props.text);
  }

  function TextInput(props: {
    value: string;
    placeholder?: string;
    mono?: boolean;
    onChange: (v: string) => void;
    key?: string;
  }): any {
    return h(P.Input, {
      key: props.key,
      className: props.mono ? 'mc-mono' : undefined,
      placeholder: props.placeholder,
      value: props.value,
      onChange: (e: { target: { value: string } }) => props.onChange(e.target.value),
    });
  }

  /**
   * 状态点：已注册工具 > 0 是最真实的连接信号（连接 + 工具同步成功才会注册），
   * 其次是 HTTP 探活结果；禁用灰、其余未知蓝。
   */
  function statusClassOf(v: McpServerView, probe: { state: string } | undefined): string {
    if (v.disabled) return 'mc-dot';
    if (v.toolCount !== null && v.toolCount > 0) return 'mc-dot mc-dot-ok';
    if (probe?.state === 'ok') return 'mc-dot mc-dot-ok';
    if (probe?.state === 'fail') return 'mc-dot mc-dot-fail';
    return 'mc-dot mc-dot-unknown';
  }

  function ServerRow(props: {
    view: McpServerView;
    probe:
      | {
          state: string;
          detail: string;
          serverInfoName: string;
          serverInfoVersion: string;
          latencyMs: number | null;
        }
      | undefined;
    busy: boolean;
    saving: boolean;
    onEdit: () => void;
    onToggle: () => void;
    onProbe: () => void;
    onDelete: () => void;
    key?: string;
  }): any {
    const v = props.view;
    const probeLine = props.probe
      ? props.probe.state === 'ok'
        ? '✓ 握手成功' +
          (props.probe.latencyMs !== null ? ' · ' + props.probe.latencyMs + 'ms' : '') +
          (props.probe.serverInfoName ? ' · ' + props.probe.serverInfoName : '') +
          (props.probe.serverInfoVersion ? ' ' + props.probe.serverInfoVersion : '')
        : props.probe.state === 'fail'
          ? '✗ ' + props.probe.detail
          : props.probe.detail
      : '';
    return h(
      'div',
      { className: 'mc-row' + (v.disabled ? ' mc-rowDisabled' : ''), key: props.key },
      h(
        'div',
        { className: 'mc-tile', title: 'MCP' },
        'MCP',
        h('span', { className: statusClassOf(v, props.probe) }),
      ),
      h(
        'div',
        { className: 'mc-rowText' },
        h(
          'div',
          { className: 'mc-title' },
          h(
            'button',
            { className: 'mc-nameBtn', title: '点击编辑', onClick: props.onEdit },
            v.serverName || v.id,
          ),
          v.disabled ? Badge({ kind: 'muted', text: '已禁用' }) : null,
          v.dup ? Badge({ kind: 'err', text: '重复 id' }) : null,
          v.unmanageable ? Badge({ kind: 'warn', text: '复杂值' }) : null,
          v.disabledIsJs ? Badge({ kind: 'warn', text: 'disabled 为 !!js' }) : null,
          v.toolCount !== null && v.toolCount > 0
            ? Badge({ kind: 'info', text: v.toolCount + ' 工具' })
            : null,
          v.issues.length > 0
            ? h(
                'span',
                { className: 'mc-notice mc-notice-warn', title: v.issues.join('\n') },
                '⚠ ' + v.issues.length,
              )
            : null,
        ),
        h('div', { className: 'mc-line mc-mono', title: summaryOf(v) }, summaryOf(v)),
        // 已启用但注册表里没有该服务器的工具：低调的诊断行（不跟名字抢视觉），
        // 轮询刷新后如果热重连完成、工具注册上来，这行会自动消失
        !v.disabled && v.toolCount === 0
          ? h(
              'div',
              {
                className: 'mc-probeLine',
                title:
                  '连接成功的服务器会把工具注册成 mcp__' +
                  (v.serverName || '…') +
                  '__*。未发现可能是：连接失败 / 重连预算耗尽 / 服务器不提供工具。刚保存的话等几秒热重连（本页每 5 秒自动刷新）。排查看 dsh web 终端里 mcp-client(' +
                  (v.serverName || '…') +
                  ') 的日志行。',
              },
              '运行时未发现 mcp__' + (v.serverName || '…') + '__* 工具（未连接或服务器无工具）',
            )
          : null,
        probeLine ? h('div', { className: 'mc-probeLine', title: props.probe?.detail }, probeLine) : null,
      ),
      h(
        'div',
        { className: 'mc-controls' },
        v.transport === 'streamable-http'
          ? h(
              P.Button,
              {
                variant: 'toolbar',
                disabled: props.busy,
                title: '探活（initialize 握手）',
                onClick: props.onProbe,
              },
              props.busy ? h(P.IconLoadingOutline16, null) : h(P.IconRefreshOutline14, null),
            )
          : null,
        h(
          P.Button,
          {
            variant: 'toolbar',
            disabled: props.saving || v.dup || v.unmanageable,
            title: '编辑',
            onClick: props.onEdit,
          },
          h(P.IconEditOutline16, null),
        ),
        h(
          P.Button,
          {
            variant: 'toolbar',
            className: 'mc-danger',
            disabled: props.saving || v.dup,
            title: '删除 ' + (v.serverName || v.id),
            onClick: props.onDelete,
          },
          h(P.IconTrashOutline16, null),
        ),
        Switch({
          checked: !v.disabled,
          disabled: props.saving || v.dup,
          label: v.disabled ? '启用该服务器' : '禁用该服务器',
          onChange: props.onToggle,
        }),
      ),
    );
  }

  // ── 主组件 ─────────────────────────────────────────────────────────

  function Section(): any {
    const [loading, setLoading] = React.useState(true);
    const [state, setState] = React.useState(null as McpState | null);
    const [error, setError] = React.useState('');
    const [saving, setSaving] = React.useState(false);
    const [search, setSearch] = React.useState('');
    const [editor, setEditor] = React.useState(null as EditorState | null);
    const [editorError, setEditorError] = React.useState('');
    const [confirmDel, setConfirmDel] = React.useState(null as McpServerView | null);
    const [acked, setAcked] = React.useState(false);
    const [confirmToggle, setConfirmToggle] = React.useState(
      null as { view: McpServerView; next: boolean } | null,
    );
    const [probeBusy, setProbeBusy] = React.useState('');

    const load = React.useCallback(async (): Promise<void> => {
      try {
        const r = await fetchState();
        if (r.ok && r.state) {
          setState(r.state);
          setError('');
        } else {
          setError(r.error || '读取状态失败');
        }
      } catch (e) {
        setError(String((e as Error)?.message ?? e));
      } finally {
        setLoading(false);
      }
    }, []);

    React.useEffect(() => {
      void load();
    }, [load]);

    // 静默轮询：状态点 / 「N 工具」徽标跟随运行时注册表自动变化，
    // 服务器热重连（通常几秒）完成后最迟 5 秒反映到列表；失败保留上次快照
    React.useEffect(() => {
      const timer = setInterval(() => {
        void (async () => {
          try {
            const r = await fetchState();
            if (r.ok && r.state) setState(r.state);
          } catch {
            /* 轮询失败不打扰当前画面 */
          }
        })();
      }, 5000);
      return () => clearInterval(timer);
    }, []);

    function openCreate(): void {
      setEditorError('');
      setEditor({ mode: 'create', id: '', tab: 'form', form: emptyForm(), jsonText: createJsonText() });
    }

    function openEdit(v: McpServerView): void {
      setEditorError('');
      setEditor({ mode: 'edit', id: v.id, tab: 'form', form: formFromView(v), jsonText: viewToJsonText(v) });
    }

    async function runToggle(view: McpServerView, enabled: boolean): Promise<void> {
      setSaving(true);
      try {
        const r = await toggleServer(view.id, !enabled);
        if (r.ok && r.state) setState(r.state);
        else setError(r.error || '切换失败');
      } catch (e) {
        setError(String((e as Error)?.message ?? e));
      } finally {
        setSaving(false);
      }
    }

    function onToggle(view: McpServerView, enabled: boolean): void {
      if (view.disabledIsJs) setConfirmToggle({ view, next: enabled });
      else void runToggle(view, enabled);
    }

    async function runProbe(view: McpServerView): Promise<void> {
      setProbeBusy(view.id);
      try {
        const r = await probeServer(view.id);
        if (r.ok && r.probe && state) {
          setState({ ...state, probes: { ...state.probes, [view.id]: r.probe } });
        } else if (!r.ok) {
          setError(r.error || '探活失败');
        }
      } catch (e) {
        setError(String((e as Error)?.message ?? e));
      } finally {
        setProbeBusy('');
      }
    }

    async function runDelete(view: McpServerView): Promise<void> {
      setSaving(true);
      try {
        const r = await removeServer(view.id);
        if (r.ok && r.state) setState(r.state);
        else setError(r.error || '删除失败');
      } catch (e) {
        setError(String((e as Error)?.message ?? e));
      } finally {
        setSaving(false);
      }
    }

    async function saveEditor(): Promise<void> {
      if (!editor) return;
      setEditorError('');
      let cfg: unknown;
      try {
        cfg = editor.tab === 'json' ? (JSON.parse(editor.jsonText) as unknown) : configFromForm(editor.form);
      } catch (e) {
        setEditorError(String((e as Error)?.message ?? e));
        return;
      }
      setSaving(true);
      try {
        const r = editor.mode === 'create' ? await createServer(cfg) : await updateServer(editor.id, cfg);
        if (r.ok && r.state) {
          setState(r.state);
          setEditor(null);
        } else {
          setEditorError(r.error || '保存失败');
        }
      } catch (e) {
        setEditorError(String((e as Error)?.message ?? e));
      } finally {
        setSaving(false);
      }
    }

    async function savePatchFile(v: string): Promise<void> {
      setSaving(true);
      try {
        const r = await saveManagerConfig({ patchFile: v });
        if (!r.ok) setError(r.error || '保存失败');
        await load();
      } catch (e) {
        setError(String((e as Error)?.message ?? e));
      } finally {
        setSaving(false);
      }
    }

    // ── 渲染 ─────────────────────────────────────────────────────────

    if (loading) {
      return h(
        'div',
        { className: 'mc-page' },
        h(
          'div',
          { className: 'mc-loading' },
          h(P.IconLoadingOutline16, null),
          h('span', { className: 'mc-loadingText' }, '正在读取 MCP 服务器…'),
        ),
      );
    }

    if (error && !state) {
      return h('div', { className: 'mc-page' }, h('div', { className: 'mc-notice mc-notice-err' }, error));
    }

    const st = state as McpState;
    const keyword = search.trim().toLowerCase();
    const servers = st.servers.filter((v) => {
      if (!keyword) return true;
      const hay = [v.id, v.serverName, v.command, v.url, v.args.join(' '), v.cwd].join(' ').toLowerCase();
      return hay.includes(keyword);
    });

    const editorBody =
      editor === null ? null : editor.tab === 'form' ? renderEditorForm(editor) : renderEditorJson(editor);

    /**
     * 切换表单/JSON：以当前编辑侧为唯一事实来源，把草稿转换过去（两侧永远同步）。
     * 当前侧非法时不切换，把中文报错显示在底部（避免半成品数据静默丢失）。
     */
    function switchTab(ed: EditorState, next: 'form' | 'json'): void {
      setEditorError('');
      if (next === ed.tab) return;
      if (next === 'json') {
        try {
          const cfg = configFromForm(ed.form);
          setEditor({ ...ed, tab: 'json', jsonText: JSON.stringify(cfg, null, 2) });
        } catch (e) {
          setEditorError(String((e as Error)?.message ?? e) + '（修正后再切到 JSON）');
        }
        return;
      }
      try {
        const parsed = JSON.parse(ed.jsonText) as unknown;
        if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
          throw new Error('config 应为 JSON 对象');
        }
        setEditor({ ...ed, tab: 'form', form: formFromConfig(parsed as Record<string, unknown>) });
      } catch (e) {
        setEditorError(String((e as Error)?.message ?? e) + '（修正后再切到表单）');
      }
    }

    function modeRow(): any {
      return h(
        'div',
        { className: 'mc-modeRow' },
        h(
          P.Pill,
          { active: editor?.tab === 'form', onClick: () => editor && switchTab(editor, 'form') },
          '表单',
        ),
        h(
          P.Pill,
          { active: editor?.tab === 'json', onClick: () => editor && switchTab(editor, 'json') },
          'JSON',
        ),
        h('div', { className: 'mc-modeSpacer' }),
        h('span', { className: 'mc-fieldLabel' }, '表达式写法：值前加 "js: " 前缀（等价 YAML 的 !!js）'),
      );
    }

    function renderEditorForm(ed: EditorState): any[] {
      const f = ed.form;
      const setF = (patch: Partial<EditorForm>): void => setEditor({ ...ed, form: { ...f, ...patch } });
      const kids: any[] = [];
      kids.push(
        FieldLabel({
          text: '名称（模型工具前缀 mcp__名称__工具；1-32 位字母/数字/下划线/连字符）',
          key: 'ln',
        }),
      );
      kids.push(
        TextInput({
          key: 'name',
          value: f.serverName,
          placeholder: 'my-mcp-server',
          mono: true,
          onChange: (v) => setF({ serverName: v }),
        }),
      );
      kids.push(FieldLabel({ text: '类型', key: 'lt' }));
      // Selector 内部有 useState——必须作为元素（h(Selector, …)）渲染，让它持有独立
      // 的 hook 空间；普通函数调用会把 hook 记到 Section 头上，弹窗开合即触发
      // React #310（Rendered more hooks than during the previous render）
      kids.push(
        h(Selector, {
          key: 'transport',
          value: f.transport,
          selectedLabel: f.transport === 'stdio' ? 'stdio（本地命令）' : 'streamable-http（HTTP）',
          options: [
            { id: 'stdio', label: 'stdio（本地命令）' },
            { id: 'streamable-http', label: 'streamable-http（HTTP）' },
          ],
          onSelect: (id: string) => setF({ transport: id === 'stdio' ? 'stdio' : 'streamable-http' }),
        }),
      );
      if (f.transport === 'stdio') {
        kids.push(FieldLabel({ text: '命令', key: 'lc' }));
        kids.push(
          TextInput({
            key: 'cmd',
            value: f.command,
            placeholder: 'npx',
            mono: true,
            onChange: (v) => setF({ command: v }),
          }),
        );
        kids.push(FieldLabel({ text: '参数（空格分隔，引号可包裹含空格的项）', key: 'la' }));
        kids.push(
          TextInput({
            key: 'args',
            value: f.argsText,
            placeholder: '-y @modelcontextprotocol/server-memory',
            mono: true,
            onChange: (v) => setF({ argsText: v }),
          }),
        );
        kids.push(FieldLabel({ text: '环境变量（可选，JSON；表达式用 "js: " 前缀）', key: 'le' }));
        kids.push(
          h('textarea', {
            key: 'env',
            className: 'mc-textarea mc-textareaMono',
            rows: 4,
            spellCheck: false,
            placeholder: '{\n  "MY_API_KEY": "js: process.env.MY_API_KEY"\n}',
            value: f.envText,
            onChange: (e: { target: { value: string } }) => setF({ envText: e.target.value }),
          }),
        );
        kids.push(FieldLabel({ text: '工作目录（可选）', key: 'lw' }));
        kids.push(
          TextInput({
            key: 'cwd',
            value: f.cwd,
            placeholder: '/absolute/path',
            mono: true,
            onChange: (v) => setF({ cwd: v }),
          }),
        );
      } else {
        kids.push(FieldLabel({ text: 'URL', key: 'lu' }));
        kids.push(
          TextInput({
            key: 'url',
            value: f.url,
            placeholder: 'https://mcp.example.com/mcp',
            mono: true,
            onChange: (v) => setF({ url: v }),
          }),
        );
        kids.push(
          h(
            'p',
            { className: 'mc-hint', key: 'ssehint' },
            '仅支持 Streamable HTTP。旧式纯 SSE 端点（/sse）官方 dsh-mcp-client 不支持，可改用 stdio 类型填 npx mcp-remote https://… 桥接。',
          ),
        );
        kids.push(FieldLabel({ text: '请求头（可选，JSON；表达式用 "js: " 前缀）', key: 'lh' }));
        kids.push(
          h('textarea', {
            key: 'headers',
            className: 'mc-textarea mc-textareaMono',
            rows: 4,
            spellCheck: false,
            placeholder: '{\n  "Authorization": "js: `Bearer ${process.env.MCP_TOKEN}`"\n}',
            value: f.headersText,
            onChange: (e: { target: { value: string } }) => setF({ headersText: e.target.value }),
          }),
        );
      }
      kids.push(FieldLabel({ text: '高级', key: 'lv' }));
      kids.push(
        h(
          'div',
          { className: 'mc-twoCol', key: 'adv' },
          h(
            'div',
            { key: 'tw' },
            FieldLabel({ text: '工具调用超时 MS（默认 60000）' }),
            TextInput({
              value: f.timeoutText,
              placeholder: '60000',
              mono: true,
              onChange: (v) => setF({ timeoutText: v }),
            }),
          ),
          h(
            'div',
            { key: 'fs' },
            FieldLabel({ text: '启动失败时拒绝激活（默认关闭：失败只记日志）' }),
            Switch({
              checked: f.failOnStartup,
              label: 'failOnStartupError',
              onChange: (next: boolean) => setF({ failOnStartup: next }),
            }),
          ),
        ),
      );
      return kids;
    }

    function renderEditorJson(ed: EditorState): any[] {
      return [
        h('textarea', {
          key: 'json',
          className: 'mc-textarea mc-textareaMono',
          rows: 18,
          spellCheck: false,
          value: ed.jsonText,
          onChange: (e: { target: { value: string } }) => setEditor({ ...ed, jsonText: e.target.value }),
        }),
        h(
          'p',
          { className: 'mc-hint', key: 'jh' },
          '完整 config（会整体替换已知字段）。未识别的自定义键不会被删除；"js: " 前缀的值回写为 !!js 表达式。',
        ),
      ];
    }

    return h(
      'div',
      { className: 'mc-page' },
      // 简介与 patch 文件位置
      h(
        'p',
        { className: 'mc-intro' },
        '管理 cordis.patch.yml 里的 @deepseek-ai/dsh-mcp-client 实例；保存后 DSH 自动热重连对应服务器。状态点与「N 工具」徽标来自运行时工具注册表，每 5 秒自动刷新。',
      ),
      h(
        'div',
        { className: 'mc-rootPath', title: st.patchFile.path },
        (st.patchFile.exists ? '' : '（文件不存在）') +
          st.patchFile.path +
          '（' +
          patchSourceLabel(st.patchFile.source) +
          '）',
      ),
      st.fileIssue ? h('p', { className: 'mc-notice mc-notice-warn' }, st.fileIssue) : null,
      // 工具栏
      h(
        'div',
        { className: 'mc-toolbar' },
        h('span', { className: 'mc-count' }, 'MCP ' + st.servers.length),
        h('div', { className: 'mc-toolbarSpacer' }),
        h(
          'div',
          { className: 'mc-searchW' },
          h(P.Input, {
            placeholder: '搜索 MCP 服务器…',
            value: search,
            onChange: (e: { target: { value: string } }) => setSearch(e.target.value),
          }),
        ),
        h(
          P.Button,
          { variant: 'toolbar', title: '刷新（重新读取 patch 文件）', onClick: () => void load() },
          h(P.IconRefreshOutline14, null),
        ),
        h(
          P.Button,
          { variant: 'primary', disabled: st.patchFile.exists === false, onClick: openCreate },
          h(P.IconPlusOutline16, null),
          '新建',
        ),
      ),
      error ? h('p', { className: 'mc-notice mc-notice-err' }, error) : null,
      // 列表
      st.servers.length === 0
        ? h(
            'div',
            { className: 'mc-empty' },
            h('div', { className: 'mc-emptyTitle' }, '还没有 MCP 服务器'),
            h(
              'p',
              { className: 'mc-hint' },
              '新建一个条目，或按官方 dsh-mcp-client 的说明手写 - insert: 实例（写好后回来这里管理）。',
            ),
            h(
              P.Button,
              { variant: 'primary', disabled: st.patchFile.exists === false, onClick: openCreate },
              '新建 MCP 服务器',
            ),
          )
        : h(
            'div',
            { className: 'mc-list' },
            servers.map((v) =>
              h(ServerRow, {
                key: v.id,
                view: v,
                probe: st.probes[v.id],
                busy: probeBusy === v.id,
                saving,
                onEdit: () => openEdit(v),
                onToggle: () => onToggle(v, v.disabled),
                onProbe: () => void runProbe(v),
                onDelete: () => {
                  setAcked(false);
                  setConfirmDel(v);
                },
              }),
            ),
          ),
      // 编辑器弹窗
      editor === null
        ? null
        : h(
            P.Modal,
            {
              open: true,
              onClose: () => setEditor(null),
              className: 'mc-wideModal',
              title: editor.mode === 'create' ? '新建 MCP 服务器' : '编辑 MCP 服务器 · ' + editor.id,
              closeLabel: '关闭',
              description: '保存后写入 cordis.patch.yml，DSH 会热重连对应实例。',
              footer: h(
                'div',
                { className: 'mc-bar' },
                h(
                  P.Button,
                  { variant: 'primary', disabled: saving, onClick: () => void saveEditor() },
                  '保存',
                ),
                h(P.Button, { disabled: saving, onClick: () => setEditor(null) }, '取消'),
                editorError ? h('span', { className: 'mc-notice mc-notice-err' }, editorError) : null,
              ),
            },
            modeRow(),
            h('div', { className: 'mc-form' }, editorBody),
          ),
      // 删除确认
      confirmDel === null
        ? null
        : P.RiskConfirmation
          ? h(P.RiskConfirmation, {
              key: 'confirm-del',
              open: true,
              title: '删除 MCP 服务器「' + (confirmDel.serverName || confirmDel.id) + '」？',
              description:
                '将从 cordis.patch.yml 移除实例 ' +
                confirmDel.id +
                '，其工具（mcp__' +
                (confirmDel.serverName || '…') +
                '__*）随之注销。此操作不可撤销（最近一次改动有 .bak 备份）。',
              acknowledgeLabel: '我已了解，删除该服务器',
              cancelLabel: '取消',
              confirmLabel: '删除',
              acknowledged: acked,
              onAcknowledgedChange: setAcked,
              onCancel: () => setConfirmDel(null),
              onConfirm: () => {
                const v = confirmDel;
                setConfirmDel(null);
                void runDelete(v);
              },
            })
          : h(
              P.Modal,
              {
                key: 'confirm-del-fallback',
                open: true,
                onClose: () => setConfirmDel(null),
                title: '删除 MCP 服务器「' + (confirmDel.serverName || confirmDel.id) + '」？',
                closeLabel: '关闭',
                footer: h(
                  'div',
                  { className: 'mc-bar' },
                  h(
                    P.Button,
                    {
                      variant: 'primary',
                      disabled: saving,
                      onClick: () => {
                        const v = confirmDel;
                        setConfirmDel(null);
                        void runDelete(v);
                      },
                    },
                    '删除',
                  ),
                  h(P.Button, { onClick: () => setConfirmDel(null) }, '取消'),
                ),
              },
              h('p', { className: 'mc-hint' }, '将从 cordis.patch.yml 移除实例条目，工具随之注销。'),
            ),
      // disabled 为 !!js 表达式时的覆盖确认
      confirmToggle === null
        ? null
        : P.RiskConfirmation
          ? h(P.RiskConfirmation, {
              key: 'confirm-toggle',
              open: true,
              title: '覆盖 disabled 表达式？',
              description:
                '条目 ' +
                confirmToggle.view.id +
                ' 的 disabled 当前是 !!js 表达式，切换后会写成普通布尔值 ' +
                String(!confirmToggle.next) +
                '。',
              acknowledgeLabel: '我已了解，覆盖表达式',
              cancelLabel: '取消',
              confirmLabel: '继续切换',
              acknowledged: acked,
              onAcknowledgedChange: setAcked,
              onCancel: () => setConfirmToggle(null),
              onConfirm: () => {
                const { view, next } = confirmToggle;
                setConfirmToggle(null);
                void runToggle(view, next);
              },
            })
          : null,
      // patch 文件位置修正（不存在时给一行入口）
      st.patchFile.exists === false
        ? h(PatchFileFix, {
            key: 'patchfix',
            disabled: saving,
            onSubmit: (v: string) => void savePatchFile(v),
          })
        : null,
    );
  }

  /** patch 文件不存在时的路径修正行 */
  function PatchFileFix(props: { disabled: boolean; onSubmit: (v: string) => void }): any {
    const [val, setVal] = React.useState('');
    return h(
      'div',
      { className: 'mc-bar', style: { marginTop: '10px' } },
      h('span', { className: 'mc-notice mc-notice-warn' }, 'patch 文件不存在，可在此填绝对路径：'),
      h(
        'div',
        { className: 'mc-searchW' },
        h(P.Input, {
          placeholder: '/home/me/.dsh/profiles/web/cordis.patch.yml',
          value: val,
          onChange: (e: { target: { value: string } }) => setVal(e.target.value),
        }),
      ),
      h(
        P.Button,
        {
          variant: 'toolbar',
          disabled: props.disabled || !val.trim(),
          onClick: () => props.onSubmit(val.trim()),
        },
        '保存路径',
      ),
    );
  }

  return Section;
}

function patchSourceLabel(source: string): string {
  if (source === 'settings') return '设置页指定';
  if (source === 'env') return 'DSH_PROFILE_DIR';
  if (source === 'module-path') return '按安装位置定位';
  if (source === 'profile-scan') return '按 profile 登记定位';
  return '默认路径';
}
