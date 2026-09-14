window.__ModuleLoader__.load({ id: "@dshp/vision-bridge", factory: (require) => { var module = { exports: {} }; var exports = module.exports;
"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client/index.tsx
var client_exports = {};
__export(client_exports, {
  apply: () => apply,
  inject: () => inject
});
module.exports = __toCommonJS(client_exports);

// src/client/VisionSection.tsx
var import_react2 = require("react");
var import_dsh_client_ui_primitives2 = require("@deepseek-ai/dsh-client-ui-primitives");

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

// src/client/components.tsx
var import_react = require("react");
var import_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");

// dsh-css-module:dsh-css:src/client/styles.module.css.mjs
var css = "._0K34_a_page{max-width:720px;color:var(--dsw-alias-label-primary);flex-direction:column;display:flex}._0K34_a_section{flex-direction:column;width:100%;display:flex}._0K34_a_sectionHead{color:var(--dsw-alias-label-secondary);padding:14px 0 2px;font-size:12px;font-weight:500;line-height:18px}._0K34_a_row{border-bottom:.5px solid var(--dsw-alias-border-l2);align-items:center;gap:8px;padding:16px 0;display:flex}._0K34_a_section ._0K34_a_row:last-child{border-bottom:none}._0K34_a_rowWrap{border-bottom:.5px solid var(--dsw-alias-border-l2);flex-direction:column;align-items:flex-start;gap:8px;padding:16px 0;display:flex}._0K34_a_rowText{flex-direction:column;flex:1;gap:4px;min-width:0;padding-right:48px;display:flex}._0K34_a_title{color:var(--dsw-alias-label-primary);font-size:14px;font-weight:400;line-height:22px}._0K34_a_desc{color:var(--dsw-alias-label-tertiary);font-size:12px;font-weight:400;line-height:18px}._0K34_a_intro{color:var(--dsw-alias-label-tertiary);margin:0 0 4px;font-size:14px;line-height:22px}._0K34_a_selector{background:var(--dsw-alias-bg-module-platform);height:36px;font:inherit;color:var(--dsw-alias-label-primary);cursor:pointer;border:none;border-radius:18px;align-items:center;gap:12px;max-width:100%;padding:0 14px;font-size:14px;line-height:22px;display:inline-flex}._0K34_a_selector:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}._0K34_a_selector:disabled{cursor:default;opacity:.4}._0K34_a_selectorLabel{text-overflow:ellipsis;white-space:nowrap;min-width:0;overflow:hidden}._0K34_a_chevron{flex:none}._0K34_a_switch{box-sizing:border-box;background:var(--dsw-alias-border-l3);cursor:pointer;border:0;border-radius:10px;flex:none;width:36px;height:20px;padding:2px;position:relative}._0K34_a_switchOn{background:var(--dsw-alias-brand-primary)}._0K34_a_switch:disabled{cursor:default;opacity:.5}._0K34_a_switch:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}._0K34_a_thumb{corner-shape:round;background:var(--dsw-alias-label-primary-foreground);border-radius:50%;width:16px;height:16px;transition:transform .12s;display:block}._0K34_a_switchOn ._0K34_a_thumb{transform:translate(16px)}._0K34_a_textarea{box-sizing:border-box;border:.5px solid var(--dsw-alias-border-l4);background:var(--dsw-alias-bg-layer-1);font:inherit;color:var(--dsw-alias-label-primary);resize:vertical;border-radius:8px;outline:none;width:100%;min-height:72px;padding:8px 12px;font-size:13px;line-height:20px}._0K34_a_textarea:focus-visible{border-color:var(--dsw-alias-brand-primary)}._0K34_a_textarea::placeholder{color:var(--dsw-alias-label-dimmed)}._0K34_a_textarea:disabled{opacity:.5}._0K34_a_badge{white-space:nowrap;border-radius:10px;align-items:center;height:20px;padding:0 8px;font-size:11px;font-weight:500;line-height:20px;display:inline-flex}._0K34_a_badgeOk{background:var(--dsw-alias-state-success-tertiary);color:var(--dsw-alias-state-success-primary)}._0K34_a_badgeWarn{background:var(--dsw-alias-state-warn-tertiary);color:var(--dsw-alias-state-warn-label)}._0K34_a_badgeMuted{background:var(--dsw-alias-button-ghost-active-fill);color:var(--dsw-alias-label-caption)}._0K34_a_badgeInfo{background:var(--dsw-alias-state-business-tertiary);color:var(--dsw-alias-state-business-primary)}._0K34_a_notice{margin:0;font-size:12px;line-height:18px}._0K34_a_noticeErr{color:var(--dsw-alias-state-error-primary)}._0K34_a_noticeWarn{color:var(--dsw-alias-state-warn-label)}._0K34_a_hint{color:var(--dsw-alias-label-tertiary);margin:0;font-size:12px;line-height:18px}._0K34_a_loading{align-items:center;gap:8px;display:flex}._0K34_a_loadingText{color:var(--dsw-alias-label-tertiary);font-size:13px;line-height:20px}._0K34_a_bar{border-bottom:.5px solid var(--dsw-alias-border-l2);flex-wrap:wrap;align-items:center;gap:8px;padding:16px 0;display:flex}._0K34_a_section ._0K34_a_bar{border-bottom:none}._0K34_a_modelLine{justify-content:flex-end;align-items:center;gap:6px;min-width:0;max-width:100%;display:inline-flex}@media (prefers-reduced-motion:reduce){._0K34_a_thumb{transition:none}}";
var tagId = "@dshp/vision-bridge/src/client/styles.module.css";
if (typeof document !== "undefined" && document.querySelector(`style[data-plugin-css="${tagId}"]`) === null) {
  const tag = document.createElement("style");
  tag.setAttribute("data-plugin", "@dshp/vision-bridge");
  tag.setAttribute("data-plugin-css", tagId);
  tag.textContent = css;
  document.head.appendChild(tag);
}
var styles_module_css_default = { "badge": "_0K34_a_badge", "badgeInfo": "_0K34_a_badgeInfo", "badgeMuted": "_0K34_a_badgeMuted", "badgeOk": "_0K34_a_badgeOk", "badgeWarn": "_0K34_a_badgeWarn", "bar": "_0K34_a_bar", "chevron": "_0K34_a_chevron", "desc": "_0K34_a_desc", "hint": "_0K34_a_hint", "intro": "_0K34_a_intro", "loading": "_0K34_a_loading", "loadingText": "_0K34_a_loadingText", "modelLine": "_0K34_a_modelLine", "notice": "_0K34_a_notice", "noticeErr": "_0K34_a_noticeErr", "noticeWarn": "_0K34_a_noticeWarn", "page": "_0K34_a_page", "row": "_0K34_a_row", "rowText": "_0K34_a_rowText", "rowWrap": "_0K34_a_rowWrap", "section": "_0K34_a_section", "sectionHead": "_0K34_a_sectionHead", "selector": "_0K34_a_selector", "selectorLabel": "_0K34_a_selectorLabel", "switch": "_0K34_a_switch", "switchOn": "_0K34_a_switchOn", "textarea": "_0K34_a_textarea", "thumb": "_0K34_a_thumb", "title": "_0K34_a_title" };

// src/client/components.tsx
var import_jsx_runtime = require("react/jsx-runtime");
function cx(...names) {
  return names.filter((name) => name !== void 0).join(" ");
}
var BADGE_CLASS = {
  ok: styles_module_css_default.badgeOk,
  warn: styles_module_css_default.badgeWarn,
  muted: styles_module_css_default.badgeMuted,
  info: styles_module_css_default.badgeInfo
};
function Badge({ kind, text }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cx(styles_module_css_default.badge, BADGE_CLASS[kind]), children: text });
}
function Row({ label, desc, children }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: styles_module_css_default.row, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: styles_module_css_default.rowText, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: styles_module_css_default.title, children: label }),
      desc ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: styles_module_css_default.desc, children: desc }) : null
    ] }),
    children
  ] });
}
function Select({ disabled, value, selectedLabel, options, onSelect }) {
  const [open, setOpen] = (0, import_react.useState)(false);
  const anchor = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    "button",
    {
      type: "button",
      className: styles_module_css_default.selector,
      "aria-haspopup": "menu",
      "aria-expanded": open,
      disabled,
      onClick: () => setOpen((current) => !current),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: styles_module_css_default.selectorLabel, children: selectedLabel }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.IconChevronDownOutline14, { className: styles_module_css_default.chevron })
      ]
    }
  );
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    import_dsh_client_ui_primitives.Menu,
    {
      open,
      onClose: () => setOpen(false),
      items: options,
      selectedId: value,
      onSelect: (id) => {
        setOpen(false);
        onSelect(id);
      },
      align: "end",
      portal: true,
      anchor
    }
  );
}
function Switch({ checked, disabled, label, onChange }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "button",
    {
      type: "button",
      role: "switch",
      "aria-checked": checked === true,
      "aria-label": label,
      className: cx(styles_module_css_default.switch, checked ? styles_module_css_default.switchOn : void 0),
      disabled,
      onClick: onChange,
      children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: styles_module_css_default.thumb })
    }
  );
}

// src/client/VisionSection.tsx
var import_jsx_runtime2 = require("react/jsx-runtime");
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
var NO_FALLBACK = "__none";
function VisionSection() {
  const [models, setModels] = (0, import_react2.useState)([]);
  const [config, setConfig] = (0, import_react2.useState)(null);
  const [loading, setLoading] = (0, import_react2.useState)(true);
  const [saving, setSaving] = (0, import_react2.useState)(false);
  const [error, setError] = (0, import_react2.useState)("");
  const [check, setCheck] = (0, import_react2.useState)(null);
  const [checkBusy, setCheckBusy] = (0, import_react2.useState)(false);
  const [takeover, setTakeover] = (0, import_react2.useState)(false);
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
  (0, import_react2.useEffect)(() => {
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
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: styles_module_css_default.page, children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: styles_module_css_default.loading, children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_dsh_client_ui_primitives2.IconLoadingOutline16, {}),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: styles_module_css_default.loadingText, children: "\u6B63\u5728\u8BFB\u53D6 setting.yml \u4E2D\u7684\u591A\u6A21\u6001\u6A21\u578B\u2026" })
    ] }) });
  }
  const primaryKey = config?.primary ? config.primary.provider + "///" + config.primary.model : "";
  const fallbackKey = config?.fallback ? config.fallback.provider + "///" + config.fallback.model : NO_FALLBACK;
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
  const toggleEnabled = () => save({ enabled: !(config && config.enabled) });
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: styles_module_css_default.page, children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { className: styles_module_css_default.intro, children: "\u7EAF\u6587\u672C\u6A21\u578B\u770B\u5230\u56FE\u7247\u5360\u4F4D\u7B26\u65F6\u81EA\u52A8\u8C03\u7528 vision_describe\uFF0C\u6865\u63A5\u81F3\u6B64\u5904\u7684\u89C6\u89C9\u6A21\u578B\u3002\u4E3B\u6A21\u578B\u5931\u8D25\u65F6\u7528\u5907\u7528\u6A21\u578B\u91CD\u8BD5\u4E00\u6B21\u3002" }),
    error ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { className: styles_module_css_default.notice + " " + styles_module_css_default.noticeErr, children: error }) : null,
    models.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { className: styles_module_css_default.notice + " " + styles_module_css_default.noticeWarn, children: "\u6CA1\u6709\u5728 setting.yml \u91CC\u627E\u5230 input \u542B image \u7684\u6A21\u578B\u3002\u8BF7\u5728 llm-pi-ai / llm-deepseek \u2192 providers \u2192 models \u91CC\u4E3A\u89C6\u89C9\u6A21\u578B\u52A0 input: [text, image]\uFF0C\u4FDD\u5B58\u540E\u70B9\u300C\u91CD\u65B0\u8BFB\u53D6\u300D\u3002" }) : null,
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: styles_module_css_default.section, children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Row, { label: "\u542F\u7528\u89C6\u89C9\u6865\u63A5", desc: "\u5173\u95ED\u540E vision_describe \u5C06\u76F4\u63A5\u62A5\u9519\uFF0C\u7EAF\u6587\u672C\u6A21\u578B\u65E0\u6CD5\u518D\u770B\u56FE\u3002", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        Switch,
        {
          checked: config?.enabled === true,
          disabled: saving,
          label: "\u542F\u7528\u89C6\u89C9\u6865\u63A5",
          onChange: toggleEnabled
        }
      ) }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Row, { label: "\u53D1\u9001\u95E8\u7981\u63A5\u7BA1", children: takeover ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Badge, { kind: "ok", text: "\u6865\u63A5\u63A5\u7BA1\u4E2D" }) : /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Badge, { kind: "muted", text: "\u672A\u63A5\u7BA1" }) }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Row, { label: "\u5019\u9009\u6A21\u578B", children: models.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Badge, { kind: "info", text: models.length + " \u4E2A\u53EF\u7528" }) : /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Badge, { kind: "muted", text: "0 \u4E2A\u53EF\u7528" }) })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: styles_module_css_default.section, children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: styles_module_css_default.sectionHead, children: "\u6A21\u578B\u9009\u62E9" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Row, { label: "\u4E3B\u89C6\u89C9\u6A21\u578B", desc: "\u5019\u9009\u6765\u81EA setting.yml \u4E2D input \u542B image \u7684\u6A21\u578B + \u8FD0\u884C\u65F6 provider \u5217\u8868\u3002", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        Select,
        {
          disabled: saving,
          value: primaryKey,
          selectedLabel: config?.primary ? routeLabel(config.primary) : "\u8BF7\u9009\u62E9\u4E3B\u6A21\u578B\u2026",
          options: modelOptions.map((m) => ({
            id: m.provider + "///" + m.model,
            label: routeLabel(m)
          })),
          onSelect: (id) => save({ primary: parseKey(id) })
        }
      ) }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Row, { label: "\u5907\u7528\u6A21\u578B", desc: "\u4E3B\u6A21\u578B\u5931\u8D25\u65F6\u91CD\u8BD5\u4E00\u6B21\uFF1B\u4E0D\u9009\u5219\u4E0D\u91CD\u8BD5\u3002", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        Select,
        {
          disabled: saving,
          value: fallbackKey,
          selectedLabel: config?.fallback ? routeLabel(config.fallback) : "\u4E0D\u4F7F\u7528 fallback",
          options: [{ id: NO_FALLBACK, label: "\u4E0D\u4F7F\u7528 fallback" }].concat(
            models.map((m) => ({ id: m.provider + "///" + m.model, label: routeLabel(m) }))
          ),
          onSelect: (id) => save({ fallback: id === NO_FALLBACK ? null : parseKey(id) })
        }
      ) })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: styles_module_css_default.section, children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: styles_module_css_default.sectionHead, children: "\u884C\u4E3A" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Row, { label: "\u63CF\u8FF0\u8BE6\u7EC6\u5EA6", desc: "high \u8FFD\u52A0\u300C\u9010\u5B57\u8F6C\u5F55\u300D\u8981\u6C42\uFF0Clow \u8FFD\u52A0\u300C2-3 \u53E5\u6982\u62EC\u300D\u3002", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        Select,
        {
          disabled: saving,
          value: config && config.detail || "auto",
          selectedLabel: config?.detail === "low" ? "low\uFF08\u7B80\u8981 2-3 \u53E5\uFF09" : config?.detail === "high" ? "high\uFF08\u8BE6\u7EC6\u8F6C\u5F55\uFF09" : "auto\uFF08\u5E38\u89C4\uFF09",
          options: [
            { id: "auto", label: "auto\uFF08\u5E38\u89C4\uFF09" },
            { id: "low", label: "low\uFF08\u7B80\u8981 2-3 \u53E5\uFF09" },
            { id: "high", label: "high\uFF08\u8BE6\u7EC6\u8F6C\u5F55\uFF09" }
          ],
          onSelect: (id) => save({ detail: id })
        }
      ) }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Row, { label: "\u5355\u6B21\u6700\u591A\u56FE\u7247", desc: "\u8D85\u9650\u65F6\u53D6\u6700\u65B0\u7684\u82E5\u5E72\u5F20\u3002", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        Select,
        {
          disabled: saving,
          value: String(config && config.maxImages || 4),
          selectedLabel: String(config && config.maxImages || 4) + " \u5F20",
          options: ["1", "2", "3", "4", "6", "8"].map((n) => ({ id: n, label: n + " \u5F20" })),
          onSelect: (id) => save({ maxImages: Number(id) })
        }
      ) })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: styles_module_css_default.section, children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: styles_module_css_default.sectionHead, children: "\u8FFD\u52A0\u63D0\u793A\u8BCD" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: styles_module_css_default.rowWrap, children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: styles_module_css_default.rowText, children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: styles_module_css_default.title, children: "\u6BCF\u6B21\u8BC6\u522B\u8FFD\u52A0\u7684\u8981\u6C42" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: styles_module_css_default.desc, children: "\u5931\u7126\u81EA\u52A8\u4FDD\u5B58\uFF1B\u6700\u591A 2000 \u5B57\u7B26\uFF0C\u5B9E\u9645\u53D1\u7ED9\u89C6\u89C9\u6A21\u578B\u65F6\u622A\u65AD 500 \u5B57\u7B26\u3002" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          "textarea",
          {
            className: styles_module_css_default.textarea,
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
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: styles_module_css_default.section, children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: styles_module_css_default.bar, children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_dsh_client_ui_primitives2.Button, { variant: "outline", size: "sm", disabled: saving || checkBusy, onClick: load, children: "\u91CD\u65B0\u8BFB\u53D6" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_dsh_client_ui_primitives2.Button, { variant: "primary", size: "sm", disabled: checkBusy, onClick: runCheck, children: checkBusy ? "\u68C0\u67E5\u4E2D\u2026" : "\u68C0\u67E5\u8FDE\u901A\u6027" })
      ] }),
      check ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: styles_module_css_default.section, style: { borderTop: "none" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Row, { label: "\u4E3B\u6A21\u578B", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { className: styles_module_css_default.modelLine, children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
            Badge,
            {
              kind: check.primary?.ok ? "ok" : "warn",
              text: check.primary?.ok ? "\u53EF\u8FBE" : "\u4E0D\u53EF\u7528"
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
            "span",
            {
              className: styles_module_css_default.hint,
              style: {
                marginLeft: 8,
                textAlign: "right",
                maxWidth: 360,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
              },
              children: check.primary && check.primary.message || "\u672A\u914D\u7F6E"
            }
          )
        ] }) }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Row, { label: "\u5907\u7528\u6A21\u578B", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { className: styles_module_css_default.modelLine, children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
            Badge,
            {
              kind: check.fallback?.ok ? "ok" : "muted",
              text: check.fallback?.ok ? "\u53EF\u8FBE" : check.fallback ? "\u672A\u901A\u8FC7" : "\u672A\u914D\u7F6E"
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: styles_module_css_default.hint, style: { marginLeft: 8 }, children: check.fallback && check.fallback.message || "\u672A\u914D\u7F6E" })
        ] }) }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { className: styles_module_css_default.hint, children: "\u8FDE\u901A\u6027\u4EC5\u505A\u63D0\u4F9B\u65B9/\u6A21\u578B\u8DEF\u7531\u53EF\u89E3\u6790\u6027\u63A2\u6D3B\uFF0C\u975E\u771F\u5B9E\u63A8\u7406\u8C03\u7528\u3002" })
      ] }) : null
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { className: styles_module_css_default.hint, style: { marginTop: 4 }, children: "\u5DE5\u4F5C\u65B9\u5F0F\uFF1A\u56FE\u7247\u5148\u7F13\u5B58\u5728\u672C\u63D2\u4EF6\uFF08\u6700\u8FD1 20 \u5F20/\u4F1A\u8BDD\uFF09\uFF0Cvision_describe \u628A\u539F\u56FE\u5F15\u7528 + \u4F60\u7684\u95EE\u9898\u4E00\u8D77\u53D1\u7ED9\u4E3B\u89C6\u89C9\u6A21\u578B\u3002\u914D\u7F6E\u5DF2\u6301\u4E45\u5316\u5230 settings.yaml\uFF08dshp-vision-bridge \u547D\u540D\u7A7A\u95F4\uFF09\uFF0C\u652F\u6301\u70ED\u91CD\u8F7D\u4E0E\u6CE8\u91CA\u4FDD\u7559\u3002" })
  ] });
}

// src/client/index.tsx
var SETTINGS_NS = "dshp-vision-bridge";
var SETTINGS_ORDER = 25;
var SETTINGS_LABEL = "\u89C6\u89C9\u6A21\u578B";
var inject = ["slots"];
function apply(ctx) {
  const slots = ctx.get("slots");
  if (slots === void 0) return;
  try {
    ctx.effect(
      () => slots.inject(
        "settings.section",
        () => slots.register(
          { name: "settings.section", id: SETTINGS_NS, order: SETTINGS_ORDER, label: SETTINGS_LABEL },
          VisionSection
        )
      ),
      "dshp-vision-bridge: settings section"
    );
  } catch (error) {
    console.error("[dshp-vision-bridge] \u6CE8\u518C\u8BBE\u7F6E\u8282\u5931\u8D25\uFF0C\u8BBE\u7F6E\u9875\u5C06\u770B\u4E0D\u5230\u89C6\u89C9\u6A21\u578B\u914D\u7F6E\uFF1A", error);
  }
}
return module.exports; } });
