/* @dshp-inx/vision-bridge client half — hand-authored __ModuleLoader__ bundle.
 * 设置页：视觉模型桥接 —— 主/备多模态模型选择、详细度、图片上限、追加提示词、连通性检查。
 *
 * UI 规范（见 ~/.dsh/plugins/README.md「设置 UI 规范」）：
 *  - 控件全部 require 官方 @deepseek-ai/dsh-client-ui-primitives（浏览器种子模块）；
 *  - 布局用官方设置行（padding:16px 0 + .5px 底分割线 + 左标题/描述右控件），无卡片包行；
 *  - 下拉 = 胶囊按钮 + P.Menu(portal)；开关 = 官方规格 role="switch"；输入 = 官方 Input 规格；
 *  - 颜色只用 --dsw-alias-* token，深色模式自动适配；reduced-motion 全关。
 *
 * Host 通信（同源 JSON 路由）：
 *  - GET  /ext/dshp-inx-vision-bridge/state   → { ok, models[], config, visionModelCount, admissionTakeover }
 *  - POST /ext/dshp-inx-vision-bridge/config  { primary?, fallback?, enabled?, detail?, maxImages?, promptTemplate? }
 *  - GET  /ext/dshp-inx-vision-bridge/check   → { ok, primary:{ok,message}, fallback:{...} }
 */
window.__ModuleLoader__.load({
  id: '@dshp-inx/vision-bridge',
  factory: (require) => {
    var module = { exports: {} }
    var exports = module.exports
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' })
    const React = require('react')
    const P = require('@deepseek-ai/dsh-client-ui-primitives')

    /* 官方设置行规格 CSS（提取自 ui-permission-presets / ui-theme / ui-chat，
     * 逐 token 一致；仅类名前缀 vb- 归本插件命名空间） */
    const CSS = `
.vb-page{max-width:720px;color:var(--dsw-alias-label-primary);flex-direction:column;display:flex}
.vb-section{flex-direction:column;width:100%;display:flex}
.vb-sectionHead{color:var(--dsw-alias-label-secondary);font-size:12px;font-weight:500;line-height:18px;padding:14px 0 2px}
.vb-row{border-bottom:.5px solid var(--dsw-alias-border-l2);align-items:center;gap:8px;padding:16px 0;display:flex}
.vb-section .vb-row:last-child{border-bottom:none}
.vb-rowWrap{border-bottom:.5px solid var(--dsw-alias-border-l2);align-items:flex-start;gap:8px;padding:16px 0;display:flex;flex-direction:column}
.vb-rowText{flex-direction:column;flex:1;gap:4px;min-width:0;padding-right:48px;display:flex}
.vb-title{color:var(--dsw-alias-label-primary);font-size:14px;font-weight:400;line-height:22px}
.vb-desc{color:var(--dsw-alias-label-tertiary);font-size:12px;font-weight:400;line-height:18px}
.vb-intro{color:var(--dsw-alias-label-tertiary);margin:0 0 4px;font-size:14px;line-height:22px}
.vb-mono{font-family:var(--ds-font-family-code)}
/* 下拉胶囊（官方 TranscriptViewRow / PermissionRow 同款） */
.vb-selector{background:var(--dsw-alias-bg-module-platform);height:36px;font:inherit;color:var(--dsw-alias-label-primary);cursor:pointer;border:none;border-radius:18px;align-items:center;gap:12px;padding:0 14px;font-size:14px;line-height:22px;display:inline-flex;max-width:100%}
.vb-selector:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}
.vb-selector:disabled{cursor:default;opacity:.4}
.vb-selectorLabel{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.vb-chevron{flex:none}
/* 开关（官方 ui-settings-plugins 同款规格） */
.vb-switch{box-sizing:border-box;background:var(--dsw-alias-border-l3);cursor:pointer;border:0;border-radius:10px;flex:none;width:36px;height:20px;padding:2px;position:relative}
.vb-switchOn{background:var(--dsw-alias-brand-primary)}
.vb-switch:disabled{cursor:default;opacity:.5}
.vb-switch:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}
.vb-thumb{corner-shape:round;background:var(--dsw-alias-label-primary-foreground);border-radius:50%;width:16px;height:16px;transition:transform .12s;display:block}
.vb-switchOn .vb-thumb{transform:translate(16px)}
/* 文本输入（官方 Input 同款规格） */
.vb-inputWrap{display:inline-flex;align-items:center;gap:6px;height:32px;padding:0 8px;border:.5px solid var(--dsw-alias-border-l4);border-radius:8px;background:var(--dsw-alias-bg-layer-1);width:100%}
.vb-inputWrap:focus-within{border-color:var(--dsw-alias-brand-primary)}
.vb-input{flex:1;min-width:0;border:none;outline:none;background:transparent;font-size:14px;line-height:22px;color:var(--dsw-alias-label-primary);font-family:inherit}
.vb-input::placeholder{color:var(--dsw-alias-label-dimmed)}
.vb-input:disabled{opacity:.5}
.vb-textarea{box-sizing:border-box;border:.5px solid var(--dsw-alias-border-l4);background:var(--dsw-alias-bg-layer-1);font:inherit;color:var(--dsw-alias-label-primary);border-radius:8px;padding:8px 12px;font-size:13px;line-height:20px;outline:none;width:100%;resize:vertical;min-height:72px}
.vb-textarea:focus-visible{border-color:var(--dsw-alias-brand-primary)}
.vb-textarea::placeholder{color:var(--dsw-alias-label-dimmed)}
.vb-textarea:disabled{opacity:.5}
/* 徽章（官方色板） */
.vb-badge{white-space:nowrap;align-items:center;height:20px;border-radius:10px;padding:0 8px;font-size:11px;font-weight:500;line-height:20px;display:inline-flex}
.vb-badge-ok{background:var(--dsw-alias-state-success-tertiary);color:var(--dsw-alias-state-success-primary)}
.vb-badge-warn{background:var(--dsw-alias-state-warn-tertiary);color:var(--dsw-alias-state-warn-label)}
.vb-badge-muted{background:var(--dsw-alias-button-ghost-active-fill);color:var(--dsw-alias-label-caption)}
.vb-badge-info{background:var(--dsw-alias-state-business-tertiary);color:var(--dsw-alias-state-business-primary)}
/* 状态行、提示、加载 */
.vb-notice{margin:0;font-size:12px;line-height:18px}
.vb-notice-err{color:var(--dsw-alias-state-error-primary)}
.vb-notice-warn{color:var(--dsw-alias-state-warn-label)}
.vb-notice-ok{color:var(--dsw-alias-state-success-primary)}
.vb-hint{color:var(--dsw-alias-label-tertiary);margin:0;font-size:12px;line-height:18px}
.vb-loading{align-items:center;gap:8px;display:flex}
.vb-loadingText{color:var(--dsw-alias-label-tertiary);font-size:13px;line-height:20px}
.vb-bar{align-items:center;gap:8px;display:flex;flex-wrap:wrap;padding:16px 0;border-bottom:.5px solid var(--dsw-alias-border-l2)}
.vb-section .vb-bar{border-bottom:none}
.vb-modelLine{display:inline-flex;align-items:center;gap:6px;max-width:100%;justify-content:flex-end;min-width:0}
.vb-modelName{font-family:var(--ds-font-family-code);font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:260px}
.vb-dot{width:7px;height:7px;border-radius:50%;display:inline-block;flex:none}
@media (prefers-reduced-motion:reduce){.vb-thumb{transition:none}}
`

    function Badge(props) {
      return React.createElement('span', { className: 'vb-badge vb-badge-' + props.kind }, props.text)
    }

    /* 官方设置行：左 标题+描述 / 右 控件 */
    function Row(props) {
      return React.createElement('div', { className: 'vb-row' },
        React.createElement('div', { className: 'vb-rowText' },
          React.createElement('div', { className: 'vb-title' }, props.label),
          props.desc ? React.createElement('div', { className: 'vb-desc' }, props.desc) : null),
        props.children)
    }

    /* 胶囊下拉：label + chevron，点开 P.Menu（portal 到 body） */
    function Select(props) {
      const [open, setOpen] = React.useState(false)
      const selector = React.createElement('button', {
        type: 'button',
        className: 'vb-selector',
        'aria-haspopup': 'menu',
        'aria-expanded': open,
        disabled: props.disabled,
        onClick: () => setOpen((v) => !v)
      },
        React.createElement('span', { className: 'vb-selectorLabel' }, props.selectedLabel),
        React.createElement(P.IconChevronDownOutline14, { className: 'vb-chevron' }))
      return React.createElement(P.Menu, {
        open,
        onClose: () => setOpen(false),
        items: props.options,
        selectedId: props.value,
        onSelect: (id) => { setOpen(false); props.onSelect(id) },
        align: 'end',
        portal: true,
        anchor: selector
      })
    }

    /* 官方规格开关 */
    function Switch(props) {
      return React.createElement('button', {
        type: 'button',
        role: 'switch',
        'aria-checked': props.checked === true,
        'aria-label': props.label,
        className: 'vb-switch' + (props.checked ? ' vb-switchOn' : ''),
        disabled: props.disabled,
        onClick: props.onChange
      }, React.createElement('span', { className: 'vb-thumb' }))
    }

    function VisionSection() {
      const [models, setModels] = React.useState([])
      const [config, setConfig] = React.useState(null)
      const [loading, setLoading] = React.useState(true)
      const [saving, setSaving] = React.useState(false)
      const [error, setError] = React.useState('')
      const [check, setCheck] = React.useState(null)
      const [checkBusy, setCheckBusy] = React.useState(false)
      const [takeover, setTakeover] = React.useState(false)

      function load() {
        setLoading(true)
        setError('')
        fetch('/ext/dshp-inx-vision-bridge/state', { cache: 'no-store' })
          .then((r) => r.json())
          .then((res) => {
            if (res && res.ok) {
              setModels(Array.isArray(res.models) ? res.models : [])
              setConfig(res.config || null)
              setTakeover(!!(res && res.admissionTakeover))
            } else {
              setError((res && res.error) || '无法读取视觉模型列表')
              setModels([])
            }
            setLoading(false)
          })
          .catch((e) => {
            setError('读取视觉模型列表失败：' + String((e && e.message) || e))
            setLoading(false)
          })
      }
      React.useEffect(() => { load() }, [])

      function save(patch) {
        setSaving(true)
        setError('')
        fetch('/ext/dshp-inx-vision-bridge/config', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(patch)
        })
          .then((r) => r.json())
          .then((res) => {
            if (res && res.ok) {
              setConfig(res.config)
            } else {
              setError('保存失败：' + String((res && res.error) || '未知错误'))
            }
            setSaving(false)
          })
          .catch((e) => {
            setError('保存失败：' + String((e && e.message) || e))
            setSaving(false)
          })
      }
      function runCheck() {
        setCheckBusy(true)
        setCheck(null)
        setError('')
        fetch('/ext/dshp-inx-vision-bridge/check', { cache: 'no-store' })
          .then((r) => r.json())
          .then((res) => { setCheck(res); setCheckBusy(false) })
          .catch((e) => { setError('连通性检查失败：' + String((e && e.message) || e)); setCheckBusy(false) })
      }

      if (loading) {
        return React.createElement('div', { className: 'vb-page' },
          React.createElement('div', { className: 'vb-loading' },
            React.createElement(P.IconLoadingOutline16, null),
            React.createElement('span', { className: 'vb-loadingText' }, '正在读取 setting.yml 中的多模态模型…')))
      }

      const primaryKey = config && config.primary ? (config.primary.provider + '///' + config.primary.model) : ''
      const fallbackKey = config && config.fallback ? (config.fallback.provider + '///' + config.fallback.model) : '__none'

      function parseKey(key) {
        if (typeof key !== 'string' || !key) return null
        const i = key.indexOf('///')
        if (i < 0) return null
        const provider = key.slice(0, i)
        const model = key.slice(i + 3)
        if (!provider || !model) return null
        return { provider, model }
      }
      function routeLabel(r) {
        let base = r.provider + ' / ' + r.model
        if (r.name && r.name !== r.model) base += '（' + r.name + '）'
        return base
      }

      const modelOptions = models.slice()
      if (config && config.primary) {
        const hasP = modelOptions.some((m) => m.provider === config.primary.provider && m.model === config.primary.model)
        if (!hasP) modelOptions.unshift({ provider: config.primary.provider, model: config.primary.model, name: config.primary.model + '（当前选择，不在列表中）' })
      }

      const children = []

      children.push(React.createElement('p', { className: 'vb-intro' },
        '纯文本模型看到图片占位符时自动调用 vision_describe，桥接至此处的视觉模型。主模型失败时用备用模型重试一次。'))

      if (error) children.push(React.createElement('p', { className: 'vb-notice vb-notice-err' }, error))
      if (models.length === 0) children.push(React.createElement('p', { className: 'vb-notice vb-notice-warn' },
        '没有在 setting.yml 里找到 input 含 image 的模型。请在 llm-pi-ai / llm-deepseek → providers → models 里为视觉模型加 input: [text, image]，保存后点「重新读取」。'))

      /* ── 开关 + 状态（官方行） ── */
      children.push(React.createElement('div', { className: 'vb-section' },
        React.createElement(Row, { label: '启用视觉桥接', desc: '关闭后 vision_describe 将直接报错，纯文本模型无法再看图。' },
          React.createElement(Switch, {
            checked: !!(config && config.enabled),
            disabled: saving,
            label: '启用视觉桥接',
            onChange: () => save({ enabled: !(config && config.enabled) })
          })),
        React.createElement(Row, { label: '发送门禁接管' },
          takeover
            ? React.createElement(Badge, { kind: 'ok', text: '桥接接管中' })
            : React.createElement(Badge, { kind: 'muted', text: '未接管' })),
        React.createElement(Row, { label: '候选模型' },
          models.length > 0
            ? React.createElement(Badge, { kind: 'info', text: models.length + ' 个可用' })
            : React.createElement(Badge, { kind: 'muted', text: '0 个可用' }))))

      /* ── 模型选择（官方行 + 胶囊下拉） ── */
      const primarySelect = React.createElement(Select, {
        disabled: saving,
        value: primaryKey,
        selectedLabel: config && config.primary ? routeLabel(config.primary) : '请选择主模型…',
        options: modelOptions.map((m) => ({ id: m.provider + '///' + m.model, label: routeLabel(m) })),
        onSelect: (id) => save({ primary: parseKey(id) })
      })
      const fallbackSelect = React.createElement(Select, {
        disabled: saving,
        value: fallbackKey,
        selectedLabel: config && config.fallback ? routeLabel(config.fallback) : '不使用 fallback',
        options: [{ id: '__none', label: '不使用 fallback' }]
          .concat(models.map((m) => ({ id: m.provider + '///' + m.model, label: routeLabel(m) }))),
        onSelect: (id) => save({ fallback: id === '__none' ? null : parseKey(id) })
      })
      children.push(React.createElement('div', { className: 'vb-section' },
        React.createElement('div', { className: 'vb-sectionHead' }, '模型选择'),
        React.createElement(Row, { label: '主视觉模型', desc: '候选来自 setting.yml 中 input 含 image 的模型 + 运行时 provider 列表。' }, primarySelect),
        React.createElement(Row, { label: '备用模型', desc: '主模型失败时重试一次；不选则不重试。' }, fallbackSelect)))

      /* ── 行为（官方行） ── */
      const detailSelect = React.createElement(Select, {
        disabled: saving,
        value: (config && config.detail) || 'auto',
        selectedLabel: (config && config.detail) === 'low' ? 'low（简要 2-3 句）' : (config && config.detail) === 'high' ? 'high（详细转录）' : 'auto（常规）',
        options: [
          { id: 'auto', label: 'auto（常规）' },
          { id: 'low', label: 'low（简要 2-3 句）' },
          { id: 'high', label: 'high（详细转录）' }
        ],
        onSelect: (id) => save({ detail: id })
      })
      const maxSelect = React.createElement(Select, {
        disabled: saving,
        value: String((config && config.maxImages) || 4),
        selectedLabel: String((config && config.maxImages) || 4) + ' 张',
        options: ['1', '2', '3', '4', '6', '8'].map((n) => ({ id: n, label: n + ' 张' })),
        onSelect: (id) => save({ maxImages: Number(id) })
      })
      children.push(React.createElement('div', { className: 'vb-section' },
        React.createElement('div', { className: 'vb-sectionHead' }, '行为'),
        React.createElement(Row, { label: '描述详细度', desc: 'high 追加「逐字转录」要求，low 追加「2-3 句概括」。' }, detailSelect),
        React.createElement(Row, { label: '单次最多图片', desc: '超限时取最新的若干张。' }, maxSelect)))

      /* ── 追加提示词（整行文本域） ── */
      children.push(React.createElement('div', { className: 'vb-section' },
        React.createElement('div', { className: 'vb-sectionHead' }, '追加提示词'),
        React.createElement('div', { className: 'vb-rowWrap' },
          React.createElement('div', { className: 'vb-rowText' },
            React.createElement('div', { className: 'vb-title' }, '每次识别追加的要求'),
            React.createElement('div', { className: 'vb-desc' }, '失焦自动保存；最多 2000 字符，实际发给视觉模型时截断 500 字符。')),
          React.createElement('textarea', {
            className: 'vb-textarea',
            disabled: saving,
            placeholder: '可选：例如「重点看报错弹窗里的红字，忽略水印」',
            rows: 3,
            value: (config && typeof config.promptTemplate === 'string') ? config.promptTemplate : '',
            onChange: (e) => {
              const v = e.target.value
              setConfig((prev) => {
                if (!prev) return prev
                return { enabled: prev.enabled, primary: prev.primary, fallback: prev.fallback, detail: prev.detail, maxImages: prev.maxImages, promptTemplate: v }
              })
            },
            onBlur: (e) => {
              const cur = config && config.promptTemplate || ''
              if (e.target.value !== cur) save({ promptTemplate: e.target.value })
            }
          }))))

      /* ── 工具（官方按钮） ── */
      children.push(React.createElement('div', { className: 'vb-section' },
        React.createElement('div', { className: 'vb-bar' },
          React.createElement(P.Button, {
            variant: 'outline', size: 'sm', disabled: saving || checkBusy, onClick: load
          }, '重新读取'),
          React.createElement(P.Button, {
            variant: 'primary', size: 'sm', disabled: checkBusy, onClick: runCheck
          }, checkBusy ? '检查中…' : '检查连通性')),
        check ? React.createElement('div', { className: 'vb-section', style: { borderTop: 'none' } },
          React.createElement(Row, { label: '主模型' },
            React.createElement('span', { className: 'vb-modelLine' },
              React.createElement(Badge, { kind: (check.primary && check.primary.ok) ? 'ok' : 'warn', text: (check.primary && check.primary.ok) ? '可达' : '不可用' }),
              React.createElement('span', { className: 'vb-hint', style: { marginLeft: 8, textAlign: 'right', maxWidth: 360, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, (check.primary && check.primary.message) || '未配置'))),
          React.createElement(Row, { label: '备用模型' },
            React.createElement('span', { className: 'vb-modelLine' },
              React.createElement(Badge, { kind: (check.fallback && check.fallback.ok) ? 'ok' : 'muted', text: (check.fallback && check.fallback.ok) ? '可达' : (check.fallback ? '未通过' : '未配置') }),
              React.createElement('span', { className: 'vb-hint', style: { marginLeft: 8 } }, (check.fallback && check.fallback.message) || '未配置'))),
          React.createElement('p', { className: 'vb-hint' }, '连通性仅做提供方/模型路由可解析性探活，非真实推理调用。')) : null))

      children.push(React.createElement('p', { className: 'vb-hint', style: { marginTop: 4 } },
        '工作方式：图片先缓存在本插件（最近 20 张/会话），vision_describe 把原图引用 + 你的问题一起发给主视觉模型。配置已持久化到 settings.yaml（dshp-inx-vision-bridge 命名空间），支持热重载与注释保留。'))

      return React.createElement('div', { className: 'vb-page' }, children)
    }

    exports.inject = ['slots']
    exports.apply = function apply(ctx) {
      const slots = ctx.get('slots')
      if (slots === undefined) return

      const style = document.createElement('style')
      style.setAttribute('data-plugin-css', 'dshp-inx-vision-bridge/settings.css')
      style.textContent = CSS
      document.head.appendChild(style)
      ctx.effect(() => () => style.remove(), 'dshp-inx-vision-bridge: section styles')

      const Section = VisionSection
      slots.inject('settings.section', () => slots.register(
        { name: 'settings.section', id: 'dshp-inx-vision-bridge', order: 25, label: '视觉模型' },
        Section
      ))
    }

    return module.exports
  }
})
