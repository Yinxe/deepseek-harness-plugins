(function () {
  'use strict';

  // src/client/styles.ts
  var CSS = `

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
/* \u4E0B\u62C9\u80F6\u56CA\uFF08\u5B98\u65B9 TranscriptViewRow / PermissionRow \u540C\u6B3E\uFF09 */
.vb-selector{background:var(--dsw-alias-bg-module-platform);height:36px;font:inherit;color:var(--dsw-alias-label-primary);cursor:pointer;border:none;border-radius:18px;align-items:center;gap:12px;padding:0 14px;font-size:14px;line-height:22px;display:inline-flex;max-width:100%}
.vb-selector:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}
.vb-selector:disabled{cursor:default;opacity:.4}
.vb-selectorLabel{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.vb-chevron{flex:none}
/* \u5F00\u5173\uFF08\u5B98\u65B9 ui-settings-plugins \u540C\u6B3E\u89C4\u683C\uFF09 */
.vb-switch{box-sizing:border-box;background:var(--dsw-alias-border-l3);cursor:pointer;border:0;border-radius:10px;flex:none;width:36px;height:20px;padding:2px;position:relative}
.vb-switchOn{background:var(--dsw-alias-brand-primary)}
.vb-switch:disabled{cursor:default;opacity:.5}
.vb-switch:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}
.vb-thumb{corner-shape:round;background:var(--dsw-alias-label-primary-foreground);border-radius:50%;width:16px;height:16px;transition:transform .12s;display:block}
.vb-switchOn .vb-thumb{transform:translate(16px)}
/* \u6587\u672C\u8F93\u5165\uFF08\u5B98\u65B9 Input \u540C\u6B3E\u89C4\u683C\uFF09 */
.vb-inputWrap{display:inline-flex;align-items:center;gap:6px;height:32px;padding:0 8px;border:.5px solid var(--dsw-alias-border-l4);border-radius:8px;background:var(--dsw-alias-bg-layer-1);width:100%}
.vb-inputWrap:focus-within{border-color:var(--dsw-alias-brand-primary)}
.vb-input{flex:1;min-width:0;border:none;outline:none;background:transparent;font-size:14px;line-height:22px;color:var(--dsw-alias-label-primary);font-family:inherit}
.vb-input::placeholder{color:var(--dsw-alias-label-dimmed)}
.vb-input:disabled{opacity:.5}
.vb-textarea{box-sizing:border-box;border:.5px solid var(--dsw-alias-border-l4);background:var(--dsw-alias-bg-layer-1);font:inherit;color:var(--dsw-alias-label-primary);border-radius:8px;padding:8px 12px;font-size:13px;line-height:20px;outline:none;width:100%;resize:vertical;min-height:72px}
.vb-textarea:focus-visible{border-color:var(--dsw-alias-brand-primary)}
.vb-textarea::placeholder{color:var(--dsw-alias-label-dimmed)}
.vb-textarea:disabled{opacity:.5}
/* \u5FBD\u7AE0\uFF08\u5B98\u65B9\u8272\u677F\uFF09 */
.vb-badge{white-space:nowrap;align-items:center;height:20px;border-radius:10px;padding:0 8px;font-size:11px;font-weight:500;line-height:20px;display:inline-flex}
.vb-badge-ok{background:var(--dsw-alias-state-success-tertiary);color:var(--dsw-alias-state-success-primary)}
.vb-badge-warn{background:var(--dsw-alias-state-warn-tertiary);color:var(--dsw-alias-state-warn-label)}
.vb-badge-muted{background:var(--dsw-alias-button-ghost-active-fill);color:var(--dsw-alias-label-caption)}
.vb-badge-info{background:var(--dsw-alias-state-business-tertiary);color:var(--dsw-alias-state-business-primary)}
/* \u72B6\u6001\u884C\u3001\u63D0\u793A\u3001\u52A0\u8F7D */
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
`;

  // src/client/api.ts
  var BASE = "/ext/dshp-vision-bridge";
  async function fetchState() {
    const r = await fetch(`${BASE}/state`, { cache: "no-store" });
    return await r.json();
  }
  async function saveConfig(patch) {
    const r = await fetch(`${BASE}/config`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(patch)
    });
    return await r.json();
  }
  async function checkConnectivity() {
    const r = await fetch(`${BASE}/check`, { cache: "no-store" });
    return await r.json();
  }

  // src/client/components.ts
  function createComponents(React, P) {
    function Badge(props) {
      return React.createElement("span", { className: "vb-badge vb-badge-" + props.kind }, props.text);
    }
    function Row(props) {
      return React.createElement(
        "div",
        { className: "vb-row" },
        React.createElement(
          "div",
          { className: "vb-rowText" },
          React.createElement("div", { className: "vb-title" }, props.label),
          props.desc ? React.createElement("div", { className: "vb-desc" }, props.desc) : null
        ),
        props.children
      );
    }
    function Select(props) {
      const [open, setOpen] = React.useState(false);
      const selector = React.createElement(
        "button",
        {
          type: "button",
          className: "vb-selector",
          "aria-haspopup": "menu",
          "aria-expanded": open,
          disabled: props.disabled,
          onClick: () => setOpen((v) => !v)
        },
        React.createElement("span", { className: "vb-selectorLabel" }, props.selectedLabel),
        React.createElement(P.IconChevronDownOutline14, { className: "vb-chevron" })
      );
      return React.createElement(P.Menu, {
        open,
        onClose: () => setOpen(false),
        items: props.options,
        selectedId: props.value,
        onSelect: (id) => {
          setOpen(false);
          props.onSelect(id);
        },
        align: "end",
        portal: true,
        anchor: selector
      });
    }
    function Switch(props) {
      return React.createElement(
        "button",
        {
          type: "button",
          role: "switch",
          "aria-checked": props.checked === true,
          "aria-label": props.label,
          className: "vb-switch" + (props.checked ? " vb-switchOn" : ""),
          disabled: props.disabled,
          onClick: props.onChange
        },
        React.createElement("span", { className: "vb-thumb" })
      );
    }
    return { Badge, Row, Select, Switch };
  }

  // src/client/VisionSection.ts
  function parseKey(key) {
    if (typeof key !== "string" || !key) return null;
    const i = key.indexOf("///");
    if (i < 0) return null;
    const provider = key.slice(0, i);
    const model = key.slice(i + 3);
    if (!provider || !model) return null;
    return { provider, model };
  }
  function routeLabel(r) {
    let base = r.provider + " / " + r.model;
    if (r.name && r.name !== r.model) base += "\uFF08" + r.name + "\uFF09";
    return base;
  }
  function createVisionSection(React, P) {
    const { Badge, Row, Select, Switch } = createComponents(React, P);
    function VisionSection() {
      const [models, setModels] = React.useState([]);
      const [config, setConfig] = React.useState(null);
      const [loading, setLoading] = React.useState(true);
      const [saving, setSaving] = React.useState(false);
      const [error, setError] = React.useState("");
      const [check, setCheck] = React.useState(null);
      const [checkBusy, setCheckBusy] = React.useState(false);
      const [takeover, setTakeover] = React.useState(false);
      function load() {
        setLoading(true);
        setError("");
        fetchState().then((res) => {
          if (res && res.ok) {
            setModels(Array.isArray(res.models) ? res.models : []);
            setConfig(res.config || null);
            setTakeover(!!(res && res.admissionTakeover));
          } else {
            setError(res && res.error || "\u65E0\u6CD5\u8BFB\u53D6\u89C6\u89C9\u6A21\u578B\u5217\u8868");
            setModels([]);
          }
          setLoading(false);
        }).catch((e) => {
          setError("\u8BFB\u53D6\u89C6\u89C9\u6A21\u578B\u5217\u8868\u5931\u8D25\uFF1A" + String(e?.message ?? e));
          setLoading(false);
        });
      }
      React.useEffect(() => {
        load();
      }, []);
      function save(patch) {
        setSaving(true);
        setError("");
        saveConfig(patch).then((res) => {
          if (res && res.ok) {
            setConfig(res.config ?? null);
          } else {
            setError("\u4FDD\u5B58\u5931\u8D25\uFF1A" + String(res?.error || "\u672A\u77E5\u9519\u8BEF"));
          }
          setSaving(false);
        }).catch((e) => {
          setError("\u4FDD\u5B58\u5931\u8D25\uFF1A" + String(e?.message ?? e));
          setSaving(false);
        });
      }
      function runCheck() {
        setCheckBusy(true);
        setCheck(null);
        setError("");
        checkConnectivity().then((res) => {
          setCheck(res);
          setCheckBusy(false);
        }).catch((e) => {
          setError("\u8FDE\u901A\u6027\u68C0\u67E5\u5931\u8D25\uFF1A" + String(e?.message ?? e));
          setCheckBusy(false);
        });
      }
      if (loading) {
        return React.createElement(
          "div",
          { className: "vb-page" },
          React.createElement(
            "div",
            { className: "vb-loading" },
            React.createElement(P.IconLoadingOutline16, null),
            React.createElement(
              "span",
              { className: "vb-loadingText" },
              "\u6B63\u5728\u8BFB\u53D6 setting.yml \u4E2D\u7684\u591A\u6A21\u6001\u6A21\u578B\u2026"
            )
          )
        );
      }
      const primaryKey = config?.primary ? config.primary.provider + "///" + config.primary.model : "";
      const fallbackKey = config?.fallback ? config.fallback.provider + "///" + config.fallback.model : "__none";
      const modelOptions = models.slice();
      if (config?.primary) {
        const hasP = modelOptions.some(
          (m) => m.provider === config.primary.provider && m.model === config.primary.model
        );
        if (!hasP) {
          const cur = config.primary;
          modelOptions.unshift({
            provider: cur.provider,
            model: cur.model,
            name: cur.model + "\uFF08\u5F53\u524D\u9009\u62E9\uFF0C\u4E0D\u5728\u5217\u8868\u4E2D\uFF09"
          });
        }
      }
      const children = [];
      children.push(
        React.createElement(
          "p",
          { className: "vb-intro" },
          "\u7EAF\u6587\u672C\u6A21\u578B\u770B\u5230\u56FE\u7247\u5360\u4F4D\u7B26\u65F6\u81EA\u52A8\u8C03\u7528 vision_describe\uFF0C\u6865\u63A5\u81F3\u6B64\u5904\u7684\u89C6\u89C9\u6A21\u578B\u3002\u4E3B\u6A21\u578B\u5931\u8D25\u65F6\u7528\u5907\u7528\u6A21\u578B\u91CD\u8BD5\u4E00\u6B21\u3002"
        )
      );
      if (error) children.push(React.createElement("p", { className: "vb-notice vb-notice-err" }, error));
      if (models.length === 0)
        children.push(
          React.createElement(
            "p",
            { className: "vb-notice vb-notice-warn" },
            "\u6CA1\u6709\u5728 setting.yml \u91CC\u627E\u5230 input \u542B image \u7684\u6A21\u578B\u3002\u8BF7\u5728 llm-pi-ai / llm-deepseek \u2192 providers \u2192 models \u91CC\u4E3A\u89C6\u89C9\u6A21\u578B\u52A0 input: [text, image]\uFF0C\u4FDD\u5B58\u540E\u70B9\u300C\u91CD\u65B0\u8BFB\u53D6\u300D\u3002"
          )
        );
      children.push(
        React.createElement(
          "div",
          { className: "vb-section" },
          React.createElement(
            Row,
            { label: "\u542F\u7528\u89C6\u89C9\u6865\u63A5", desc: "\u5173\u95ED\u540E vision_describe \u5C06\u76F4\u63A5\u62A5\u9519\uFF0C\u7EAF\u6587\u672C\u6A21\u578B\u65E0\u6CD5\u518D\u770B\u56FE\u3002" },
            React.createElement(Switch, {
              checked: !!(config && config.enabled),
              disabled: saving,
              label: "\u542F\u7528\u89C6\u89C9\u6865\u63A5",
              onChange: () => save({ enabled: !(config && config.enabled) })
            })
          ),
          React.createElement(
            Row,
            { label: "\u53D1\u9001\u95E8\u7981\u63A5\u7BA1" },
            takeover ? React.createElement(Badge, { kind: "ok", text: "\u6865\u63A5\u63A5\u7BA1\u4E2D" }) : React.createElement(Badge, { kind: "muted", text: "\u672A\u63A5\u7BA1" })
          ),
          React.createElement(
            Row,
            { label: "\u5019\u9009\u6A21\u578B" },
            models.length > 0 ? React.createElement(Badge, { kind: "info", text: models.length + " \u4E2A\u53EF\u7528" }) : React.createElement(Badge, { kind: "muted", text: "0 \u4E2A\u53EF\u7528" })
          )
        )
      );
      const primarySelect = React.createElement(Select, {
        disabled: saving,
        value: primaryKey,
        selectedLabel: config?.primary ? routeLabel(config.primary) : "\u8BF7\u9009\u62E9\u4E3B\u6A21\u578B\u2026",
        options: modelOptions.map((m) => ({
          id: m.provider + "///" + m.model,
          label: routeLabel(m)
        })),
        onSelect: (id) => save({ primary: parseKey(id) })
      });
      const fallbackSelect = React.createElement(Select, {
        disabled: saving,
        value: fallbackKey,
        selectedLabel: config?.fallback ? routeLabel(config.fallback) : "\u4E0D\u4F7F\u7528 fallback",
        options: [{ id: "__none", label: "\u4E0D\u4F7F\u7528 fallback" }].concat(
          models.map((m) => ({ id: m.provider + "///" + m.model, label: routeLabel(m) }))
        ),
        onSelect: (id) => save({ fallback: id === "__none" ? null : parseKey(id) })
      });
      children.push(
        React.createElement(
          "div",
          { className: "vb-section" },
          React.createElement("div", { className: "vb-sectionHead" }, "\u6A21\u578B\u9009\u62E9"),
          React.createElement(
            Row,
            {
              label: "\u4E3B\u89C6\u89C9\u6A21\u578B",
              desc: "\u5019\u9009\u6765\u81EA setting.yml \u4E2D input \u542B image \u7684\u6A21\u578B + \u8FD0\u884C\u65F6 provider \u5217\u8868\u3002"
            },
            primarySelect
          ),
          React.createElement(
            Row,
            { label: "\u5907\u7528\u6A21\u578B", desc: "\u4E3B\u6A21\u578B\u5931\u8D25\u65F6\u91CD\u8BD5\u4E00\u6B21\uFF1B\u4E0D\u9009\u5219\u4E0D\u91CD\u8BD5\u3002" },
            fallbackSelect
          )
        )
      );
      const detailSelect = React.createElement(Select, {
        disabled: saving,
        value: config && config.detail || "auto",
        selectedLabel: config?.detail === "low" ? "low\uFF08\u7B80\u8981 2-3 \u53E5\uFF09" : config?.detail === "high" ? "high\uFF08\u8BE6\u7EC6\u8F6C\u5F55\uFF09" : "auto\uFF08\u5E38\u89C4\uFF09",
        options: [
          { id: "auto", label: "auto\uFF08\u5E38\u89C4\uFF09" },
          { id: "low", label: "low\uFF08\u7B80\u8981 2-3 \u53E5\uFF09" },
          { id: "high", label: "high\uFF08\u8BE6\u7EC6\u8F6C\u5F55\uFF09" }
        ],
        onSelect: (id) => save({ detail: id })
      });
      const maxSelect = React.createElement(Select, {
        disabled: saving,
        value: String(config && config.maxImages || 4),
        selectedLabel: String(config && config.maxImages || 4) + " \u5F20",
        options: ["1", "2", "3", "4", "6", "8"].map((n) => ({ id: n, label: n + " \u5F20" })),
        onSelect: (id) => save({ maxImages: Number(id) })
      });
      children.push(
        React.createElement(
          "div",
          { className: "vb-section" },
          React.createElement("div", { className: "vb-sectionHead" }, "\u884C\u4E3A"),
          React.createElement(
            Row,
            { label: "\u63CF\u8FF0\u8BE6\u7EC6\u5EA6", desc: "high \u8FFD\u52A0\u300C\u9010\u5B57\u8F6C\u5F55\u300D\u8981\u6C42\uFF0Clow \u8FFD\u52A0\u300C2-3 \u53E5\u6982\u62EC\u300D\u3002" },
            detailSelect
          ),
          React.createElement(Row, { label: "\u5355\u6B21\u6700\u591A\u56FE\u7247", desc: "\u8D85\u9650\u65F6\u53D6\u6700\u65B0\u7684\u82E5\u5E72\u5F20\u3002" }, maxSelect)
        )
      );
      children.push(
        React.createElement(
          "div",
          { className: "vb-section" },
          React.createElement("div", { className: "vb-sectionHead" }, "\u8FFD\u52A0\u63D0\u793A\u8BCD"),
          React.createElement(
            "div",
            { className: "vb-rowWrap" },
            React.createElement(
              "div",
              { className: "vb-rowText" },
              React.createElement("div", { className: "vb-title" }, "\u6BCF\u6B21\u8BC6\u522B\u8FFD\u52A0\u7684\u8981\u6C42"),
              React.createElement(
                "div",
                { className: "vb-desc" },
                "\u5931\u7126\u81EA\u52A8\u4FDD\u5B58\uFF1B\u6700\u591A 2000 \u5B57\u7B26\uFF0C\u5B9E\u9645\u53D1\u7ED9\u89C6\u89C9\u6A21\u578B\u65F6\u622A\u65AD 500 \u5B57\u7B26\u3002"
              )
            ),
            React.createElement("textarea", {
              className: "vb-textarea",
              disabled: saving,
              placeholder: "\u53EF\u9009\uFF1A\u4F8B\u5982\u300C\u91CD\u70B9\u770B\u62A5\u9519\u5F39\u7A97\u91CC\u7684\u7EA2\u5B57\uFF0C\u5FFD\u7565\u6C34\u5370\u300D",
              rows: 3,
              value: config && typeof config.promptTemplate === "string" ? config.promptTemplate : "",
              onChange: (e) => {
                const v = e.target.value;
                setConfig((prev) => {
                  if (!prev) return prev;
                  return {
                    enabled: prev.enabled,
                    primary: prev.primary,
                    fallback: prev.fallback,
                    detail: prev.detail,
                    maxImages: prev.maxImages,
                    promptTemplate: v
                  };
                });
              },
              onBlur: (e) => {
                const cur = config && config.promptTemplate || "";
                if (e.target.value !== cur) save({ promptTemplate: e.target.value });
              }
            })
          )
        )
      );
      children.push(
        React.createElement(
          "div",
          { className: "vb-section" },
          React.createElement(
            "div",
            { className: "vb-bar" },
            React.createElement(
              P.Button,
              { variant: "outline", size: "sm", disabled: saving || checkBusy, onClick: load },
              "\u91CD\u65B0\u8BFB\u53D6"
            ),
            React.createElement(
              P.Button,
              { variant: "primary", size: "sm", disabled: checkBusy, onClick: runCheck },
              checkBusy ? "\u68C0\u67E5\u4E2D\u2026" : "\u68C0\u67E5\u8FDE\u901A\u6027"
            )
          ),
          check ? React.createElement(
            "div",
            { className: "vb-section", style: { borderTop: "none" } },
            React.createElement(
              Row,
              { label: "\u4E3B\u6A21\u578B" },
              React.createElement(
                "span",
                { className: "vb-modelLine" },
                React.createElement(Badge, {
                  kind: check.primary?.ok ? "ok" : "warn",
                  text: check.primary?.ok ? "\u53EF\u8FBE" : "\u4E0D\u53EF\u7528"
                }),
                React.createElement(
                  "span",
                  {
                    className: "vb-hint",
                    style: {
                      marginLeft: 8,
                      textAlign: "right",
                      maxWidth: 360,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap"
                    }
                  },
                  check.primary && check.primary.message || "\u672A\u914D\u7F6E"
                )
              )
            ),
            React.createElement(
              Row,
              { label: "\u5907\u7528\u6A21\u578B" },
              React.createElement(
                "span",
                { className: "vb-modelLine" },
                React.createElement(Badge, {
                  kind: check.fallback?.ok ? "ok" : "muted",
                  text: check.fallback?.ok ? "\u53EF\u8FBE" : check.fallback ? "\u672A\u901A\u8FC7" : "\u672A\u914D\u7F6E"
                }),
                React.createElement(
                  "span",
                  { className: "vb-hint", style: { marginLeft: 8 } },
                  check.fallback && check.fallback.message || "\u672A\u914D\u7F6E"
                )
              )
            ),
            React.createElement(
              "p",
              { className: "vb-hint" },
              "\u8FDE\u901A\u6027\u4EC5\u505A\u63D0\u4F9B\u65B9/\u6A21\u578B\u8DEF\u7531\u53EF\u89E3\u6790\u6027\u63A2\u6D3B\uFF0C\u975E\u771F\u5B9E\u63A8\u7406\u8C03\u7528\u3002"
            )
          ) : null
        )
      );
      children.push(
        React.createElement(
          "p",
          { className: "vb-hint", style: { marginTop: 4 } },
          "\u5DE5\u4F5C\u65B9\u5F0F\uFF1A\u56FE\u7247\u5148\u7F13\u5B58\u5728\u672C\u63D2\u4EF6\uFF08\u6700\u8FD1 20 \u5F20/\u4F1A\u8BDD\uFF09\uFF0Cvision_describe \u628A\u539F\u56FE\u5F15\u7528 + \u4F60\u7684\u95EE\u9898\u4E00\u8D77\u53D1\u7ED9\u4E3B\u89C6\u89C9\u6A21\u578B\u3002\u914D\u7F6E\u5DF2\u6301\u4E45\u5316\u5230 settings.yaml\uFF08dshp-vision-bridge \u547D\u540D\u7A7A\u95F4\uFF09\uFF0C\u652F\u6301\u70ED\u91CD\u8F7D\u4E0E\u6CE8\u91CA\u4FDD\u7559\u3002"
        )
      );
      return React.createElement("div", { className: "vb-page" }, children);
    }
    return VisionSection;
  }

  // src/client/index.ts
  var PLUGIN_ID = "@dshp/vision-bridge";
  function register() {
    const loader = typeof window !== "undefined" ? window.__ModuleLoader__ : void 0;
    if (!loader || typeof loader.load !== "function") return;
    loader.load({
      id: PLUGIN_ID,
      factory: (require2) => {
        const moduleShim = { exports: {} };
        const exportsShim = moduleShim.exports;
        Object.defineProperty(exportsShim, Symbol.toStringTag, { value: "Module" });
        const React = require2("react");
        const P = require2("@deepseek-ai/dsh-client-ui-primitives");
        const VisionSection = createVisionSection(React, P);
        const exportsObj = exportsShim;
        exportsObj.inject = ["slots"];
        exportsObj.apply = function apply(ctx) {
          const slots = ctx.get("slots");
          if (slots === void 0) return;
          const style = document.createElement("style");
          style.setAttribute("data-plugin-css", "dshp-vision-bridge/settings.css");
          style.textContent = CSS;
          document.head.appendChild(style);
          ctx.effect(() => () => style.remove(), "dshp-vision-bridge: section styles");
          const Section = VisionSection;
          slots.inject(
            "settings.section",
            () => slots.register(
              { name: "settings.section", id: "dshp-vision-bridge", order: 25, label: "\u89C6\u89C9\u6A21\u578B" },
              Section
            )
          );
        };
        return moduleShim.exports;
      }
    });
  }
  register();

})();
