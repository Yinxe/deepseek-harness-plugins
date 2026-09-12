(function () {
  'use strict';

  // src/client/styles.ts
  var CSS = `

.mc-page{max-width:860px;color:var(--dsw-alias-label-primary);flex-direction:column;display:flex}
.mc-intro{color:var(--dsw-alias-label-tertiary);margin:0 0 4px;font-size:14px;line-height:22px}
.mc-rootPath{color:var(--dsw-alias-label-dimmed);font-family:var(--ds-font-family-code);font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}
/* \u5DE5\u5177\u680F\uFF1A\u8BA1\u6570 + \u641C\u7D22 + \u52A8\u4F5C\uFF08ZCode MCP \u9875\u540C\u6B3E\u5E03\u5C40\uFF09 */
.mc-toolbar{align-items:center;gap:10px;display:flex;flex-wrap:wrap;padding:10px 0 12px;border-bottom:.5px solid var(--dsw-alias-border-l2)}
.mc-toolbarSpacer{flex:1;min-width:0}
.mc-count{color:var(--dsw-alias-label-tertiary);font-size:13px;line-height:20px;white-space:nowrap}
.mc-searchW{width:230px}
/* \u670D\u52A1\u5668\u884C\uFF1A\u56FE\u6807\u5757 + \u540D\u79F0/\u5355\u884C\u6458\u8981 + \u884C\u5185\u63A7\u4EF6 */
.mc-list{display:flex;flex-direction:column}
.mc-row{border-bottom:.5px solid var(--dsw-alias-border-l2);align-items:center;gap:10px;padding:12px 0;display:flex;flex-wrap:wrap}
.mc-list .mc-row:last-child{border-bottom:none}
.mc-rowDisabled .mc-title,.mc-rowDisabled .mc-line{opacity:.55}
.mc-rowText{flex-direction:column;flex:1;gap:2px;min-width:200px;display:flex}
.mc-title{color:var(--dsw-alias-label-primary);font-size:14px;font-weight:400;line-height:22px;display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.mc-nameBtn{cursor:pointer;background:none;border:none;padding:0;color:inherit;font:inherit;text-align:left}
.mc-nameBtn:hover{text-decoration:underline}
.mc-line{color:var(--dsw-alias-label-tertiary);font-size:12px;font-weight:400;line-height:18px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.mc-mono{font-family:var(--ds-font-family-code);font-size:13px}
.mc-tile{width:28px;height:28px;border-radius:8px;background:var(--dsw-alias-button-ghost-active-fill);color:var(--dsw-alias-label-secondary);align-items:center;justify-content:center;display:flex;flex:none;font-size:9px;font-weight:600;letter-spacing:.4px;position:relative}
/* \u72B6\u6001\u70B9\uFF1A\u7EFF=\u63A2\u6D3B\u901A\u8FC7\uFF0C\u7EA2=\u63A2\u6D3B\u5931\u8D25\uFF0C\u84DD=\u672A\u77E5/\u672A\u63A2\u6D3B\uFF0C\u7070=\u5DF2\u7981\u7528 */
.mc-dot{width:8px;height:8px;border-radius:50%;position:absolute;right:-2px;bottom:-2px;border:2px solid var(--dsw-alias-bg-layer-1);background:var(--dsw-alias-label-dimmed)}
.mc-dot-ok{background:var(--dsw-alias-state-success-primary)}
.mc-dot-fail{background:var(--dsw-alias-state-error-primary)}
.mc-dot-unknown{background:var(--dsw-alias-brand-primary)}
.mc-controls{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-left:auto;justify-content:flex-end}
.mc-danger{color:var(--dsw-alias-state-error-primary)}
/* \u5F39\u7A97\uFF1A\u539F\u751F Modal \u9ED8\u8BA4 380px\uFF0C\u8868\u5355\u7F16\u8F91\u5668\u9700\u8981\u66F4\u5BBD\uFF08div \u524D\u7F00\u62AC\u9AD8\u4F18\u5148\u7EA7\u538B\u8FC7\u6A21\u5757\u7C7B\uFF09 */
div.mc-wideModal{width:min(760px,94vw)}
/* \u8868\u5355\uFF08\u539F\u751F Modal \u7684\u5185\u5BB9/\u5E95\u90E8\uFF09 */
.mc-form{display:flex;flex-direction:column;gap:8px}
.mc-fieldLabel{color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:16px}
.mc-modeRow{display:flex;align-items:center;gap:6px;margin-bottom:4px}
.mc-modeSpacer{flex:1}
.mc-textarea{box-sizing:border-box;border:.5px solid var(--dsw-alias-border-l4);background:var(--dsw-alias-bg-layer-1);font:inherit;color:var(--dsw-alias-label-primary);border-radius:8px;padding:8px 12px;font-size:13px;line-height:20px;outline:none;width:100%;resize:vertical;min-height:64px}
.mc-textarea:focus-visible{border-color:var(--dsw-alias-brand-primary)}
.mc-textarea::placeholder{color:var(--dsw-alias-label-dimmed)}
.mc-textarea:disabled{opacity:.5}
.mc-textareaMono{font-family:var(--ds-font-family-code);font-size:12px;line-height:19px}
.mc-bar{align-items:center;gap:8px;display:flex;flex-wrap:wrap}
.mc-twoCol{display:flex;gap:12px;flex-wrap:wrap}
.mc-twoCol>*{flex:1;min-width:200px}
/* \u72B6\u6001\u4E0E\u63D0\u793A */
.mc-notice{margin:0;font-size:12px;line-height:18px}
.mc-notice-err{color:var(--dsw-alias-state-error-primary)}
.mc-notice-warn{color:var(--dsw-alias-state-warn-label)}
.mc-notice-ok{color:var(--dsw-alias-state-success-primary)}
.mc-hint{color:var(--dsw-alias-label-tertiary);margin:0;font-size:12px;line-height:18px}
.mc-loading{align-items:center;gap:8px;display:flex}
.mc-loadingText{color:var(--dsw-alias-label-tertiary);font-size:13px;line-height:20px}
.mc-empty{padding:32px 0 24px;display:flex;flex-direction:column;align-items:center;gap:8px}
.mc-emptyTitle{color:var(--dsw-alias-label-secondary);font-size:14px;line-height:22px}
.mc-probeLine{color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:16px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
`;

  // src/client/components.ts
  var KIND_TO_TONE = {
    ok: "success",
    warn: "warning",
    muted: "neutral",
    info: "info",
    err: "danger"
  };
  function createComponents(React, P) {
    function Badge(props) {
      return React.createElement(P.Tag, { tone: KIND_TO_TONE[props.kind] }, props.text);
    }
    function Switch(props) {
      return React.createElement(P.Switch, {
        checked: props.checked === true,
        disabled: props.disabled,
        label: props.label,
        title: props.title,
        onChange: props.onChange
      });
    }
    function Selector(props) {
      const [open, setOpen] = React.useState(false);
      const anchor = React.createElement(
        P.Button,
        {
          variant: "toolbar",
          disabled: props.disabled,
          "aria-haspopup": "menu",
          "aria-expanded": open,
          onClick: () => setOpen((v) => !v)
        },
        React.createElement("span", { className: "mc-selectorLabel" }, props.selectedLabel),
        React.createElement(P.IconChevronDownOutline14, null)
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
        align: "start",
        portal: true,
        anchor
      });
    }
    return { Badge, Switch, Selector };
  }

  // src/client/api.ts
  var BASE = "/ext/dshp-mcp-manager";
  async function postJson(path, payload) {
    const r = await fetch(BASE + path, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    });
    return await r.json();
  }
  async function fetchState() {
    const r = await fetch(`${BASE}/state`, { cache: "no-store" });
    return await r.json();
  }
  function saveManagerConfig(patch) {
    return postJson("/config", patch);
  }
  function createServer(config) {
    return postJson("/create", { config });
  }
  function updateServer(id, config) {
    return postJson("/update", { id, config });
  }
  function toggleServer(id, disabled) {
    return postJson("/toggle", { id, disabled });
  }
  function removeServer(id) {
    return postJson("/remove", { id });
  }
  function probeServer(id) {
    return postJson("/probe", { id });
  }

  // src/client/McpSection.ts
  var SERVER_NAME_RE = /^[A-Za-z0-9_-]{1,32}$/;
  function createMcpSection(React, P) {
    const h = React.createElement.bind(React);
    const { Badge, Switch, Selector } = createComponents(React, P);
    function envToJson(map) {
      const out = {};
      for (const [k, v] of Object.entries(map)) out[k] = v.js ? "js: " + v.source : v.source;
      return out;
    }
    function parseEnvJson(text, field) {
      if (!text.trim()) return {};
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch {
        throw new Error(field + ' \u4E0D\u662F\u5408\u6CD5 JSON\uFF08\u503C\u82E5\u4E3A\u8868\u8FBE\u5F0F\u8BF7\u5199 "js: \u8868\u8FBE\u5F0F"\uFF09');
      }
      if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed))
        throw new Error(field + ' \u5E94\u4E3A\u5BF9\u8C61\uFF08\u5982 { "KEY": "value" }\uFF09');
      const out = {};
      for (const [k, v] of Object.entries(parsed)) {
        if (typeof v !== "string") throw new Error(`${field} \u7684 ${k} \u5E94\u4E3A\u5B57\u7B26\u4E32\uFF08\u8868\u8FBE\u5F0F\u7528 "js: " \u524D\u7F00\uFF09`);
        out[k.slice(0, 120)] = v.slice(0, 4096);
      }
      return out;
    }
    function splitArgs(text) {
      const matches = text.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g);
      if (!matches) return [];
      return matches.map((m) => m.length >= 2 && (m[0] === '"' || m[0] === "'") ? m.slice(1, -1) : m).slice(0, 64);
    }
    function argsToText(args) {
      return args.map((a) => /\s/.test(a) ? '"' + a + '"' : a).join(" ");
    }
    function summaryOf(v) {
      if (v.transport === "stdio") {
        const cmd = [v.command, ...v.args].join(" ").trim();
        return "stdio \xB7 " + (cmd || "\uFF08\u7F3A\u5C11 command\uFF09");
      }
      if (v.transport === "streamable-http") return "http \xB7 " + (v.url || "\uFF08\u7F3A\u5C11 url\uFF09");
      return "\uFF08transport \u672A\u8BC6\u522B\uFF09";
    }
    function formFromView(v) {
      return {
        serverName: v.serverName,
        transport: v.transport === "streamable-http" ? "streamable-http" : "stdio",
        command: v.command,
        argsText: argsToText(v.args),
        envText: JSON.stringify(envToJson(v.env), null, 2),
        cwd: v.cwd,
        url: v.url,
        headersText: JSON.stringify(envToJson(v.headers), null, 2),
        timeoutText: v.toolCallTimeoutMs === null ? "" : String(v.toolCallTimeoutMs),
        failOnStartup: v.failOnStartupError === true,
        failProvided: v.failOnStartupError !== null,
        reconnect: v.reconnect ?? null,
        extras: { ...v.extras }
      };
    }
    function emptyForm() {
      return {
        serverName: "",
        transport: "stdio",
        command: "",
        argsText: "",
        envText: "",
        cwd: "",
        url: "",
        headersText: "",
        timeoutText: "",
        failOnStartup: false,
        failProvided: false,
        reconnect: null,
        extras: {}
      };
    }
    function viewToJsonText(v) {
      const cfg = {};
      if (v.serverName) cfg["serverName"] = v.serverName;
      if (v.transport) cfg["transport"] = v.transport;
      if (v.transport === "stdio") {
        if (v.command) cfg["command"] = v.command;
        if (v.args.length > 0) cfg["args"] = v.args;
        if (Object.keys(v.env).length > 0) cfg["env"] = envToJson(v.env);
        if (v.cwd) cfg["cwd"] = v.cwd;
      }
      if (v.transport === "streamable-http") {
        if (v.url) cfg["url"] = v.url;
        if (Object.keys(v.headers).length > 0) cfg["headers"] = envToJson(v.headers);
      }
      if (v.toolCallTimeoutMs !== null) cfg["toolCallTimeoutMs"] = v.toolCallTimeoutMs;
      if (v.failOnStartupError !== null) cfg["failOnStartupError"] = v.failOnStartupError;
      if (v.reconnect !== null && v.reconnect !== void 0) cfg["reconnect"] = v.reconnect;
      for (const [k, val] of Object.entries(v.extras)) cfg[k] = val;
      return JSON.stringify(cfg, null, 2);
    }
    function createJsonText() {
      return JSON.stringify(
        {
          serverName: "my-server",
          transport: "stdio",
          command: "npx",
          args: ["-y", "@modelcontextprotocol/server-memory"]
        },
        null,
        2
      );
    }
    function configFromForm(f) {
      const name = f.serverName.trim();
      if (!SERVER_NAME_RE.test(name)) throw new Error("\u540D\u79F0\u975E\u6CD5\uFF1A1-32 \u4F4D\u5B57\u6BCD/\u6570\u5B57/\u4E0B\u5212\u7EBF/\u8FDE\u5B57\u7B26");
      const cfg = { serverName: name, transport: f.transport };
      if (f.transport === "stdio") {
        const command = f.command.trim();
        if (!command) throw new Error("\u547D\u4EE4\u4E0D\u80FD\u4E3A\u7A7A\uFF08stdio \u4F20\u8F93\u8981\u7ED9\u51FA\u53EF\u6267\u884C\u6587\u4EF6\uFF09");
        cfg["command"] = command;
        const args = splitArgs(f.argsText);
        if (args.length > 0) cfg["args"] = args;
        const env = parseEnvJson(f.envText, "\u73AF\u5883\u53D8\u91CF");
        if (Object.keys(env).length > 0) cfg["env"] = env;
        const cwd = f.cwd.trim();
        if (cwd) cfg["cwd"] = cwd;
      } else {
        const url = f.url.trim();
        if (!/^https?:\/\//.test(url)) throw new Error("URL \u975E\u6CD5\uFF1A\u5E94\u4EE5 http:// \u6216 https:// \u5F00\u5934");
        cfg["url"] = url;
        const headers = parseEnvJson(f.headersText, "\u8BF7\u6C42\u5934");
        if (Object.keys(headers).length > 0) cfg["headers"] = headers;
      }
      const t = f.timeoutText.trim();
      if (t) {
        const n = Number(t);
        if (!Number.isFinite(n) || Math.floor(n) !== n) throw new Error("\u8D85\u65F6 MS \u5E94\u4E3A\u6574\u6570\uFF08\u6BEB\u79D2\uFF09");
        cfg["toolCallTimeoutMs"] = Math.min(36e5, Math.max(1e3, n));
      }
      if (f.failOnStartup || f.failProvided) cfg["failOnStartupError"] = f.failOnStartup;
      if (f.reconnect !== null && f.reconnect !== void 0) cfg["reconnect"] = f.reconnect;
      for (const [k, v] of Object.entries(f.extras)) cfg[k] = v;
      return cfg;
    }
    const KNOWN_FORM_KEYS = /* @__PURE__ */ new Set([
      "serverName",
      "transport",
      "command",
      "args",
      "env",
      "cwd",
      "url",
      "headers",
      "toolCallTimeoutMs",
      "failOnStartupError",
      "reconnect"
    ]);
    function asTextMax(v, max) {
      return typeof v === "string" ? v.slice(0, max) : "";
    }
    function jsonTextOf(v) {
      if (v === void 0 || v === null) return "";
      try {
        return JSON.stringify(v, null, 2);
      } catch {
        return "";
      }
    }
    function formFromConfig(cfg) {
      const f = emptyForm();
      f.serverName = asTextMax(cfg["serverName"], 32);
      f.transport = cfg["transport"] === "streamable-http" ? "streamable-http" : "stdio";
      f.command = asTextMax(cfg["command"], 600);
      const args = cfg["args"];
      f.argsText = Array.isArray(args) ? argsToText(args.map((a) => asTextMax(a, 600))) : "";
      f.envText = jsonTextOf(cfg["env"]);
      f.cwd = asTextMax(cfg["cwd"], 1024);
      f.url = asTextMax(cfg["url"], 2048);
      f.headersText = jsonTextOf(cfg["headers"]);
      const t = cfg["toolCallTimeoutMs"];
      f.timeoutText = typeof t === "number" && Number.isFinite(t) ? String(t) : "";
      f.failOnStartup = cfg["failOnStartupError"] === true;
      f.failProvided = Object.hasOwn(cfg, "failOnStartupError");
      const r = cfg["reconnect"];
      f.reconnect = r !== null && typeof r === "object" && !Array.isArray(r) ? r : null;
      const extras = {};
      for (const [k, v] of Object.entries(cfg)) {
        if (!KNOWN_FORM_KEYS.has(k)) extras[k.slice(0, 120)] = v;
      }
      f.extras = extras;
      return f;
    }
    function FieldLabel(props) {
      return h("div", { className: "mc-fieldLabel", key: props.key }, props.text);
    }
    function TextInput(props) {
      return h(P.Input, {
        key: props.key,
        className: props.mono ? "mc-mono" : void 0,
        placeholder: props.placeholder,
        value: props.value,
        onChange: (e) => props.onChange(e.target.value)
      });
    }
    function statusClassOf(v, probe) {
      if (v.disabled) return "mc-dot";
      if (v.toolCount !== null && v.toolCount > 0) return "mc-dot mc-dot-ok";
      if (probe?.state === "ok") return "mc-dot mc-dot-ok";
      if (probe?.state === "fail") return "mc-dot mc-dot-fail";
      return "mc-dot mc-dot-unknown";
    }
    function ServerRow(props) {
      const v = props.view;
      const probeLine = props.probe ? props.probe.state === "ok" ? "\u2713 \u63E1\u624B\u6210\u529F" + (props.probe.latencyMs !== null ? " \xB7 " + props.probe.latencyMs + "ms" : "") + (props.probe.serverInfoName ? " \xB7 " + props.probe.serverInfoName : "") + (props.probe.serverInfoVersion ? " " + props.probe.serverInfoVersion : "") : props.probe.state === "fail" ? "\u2717 " + props.probe.detail : props.probe.detail : "";
      return h(
        "div",
        { className: "mc-row" + (v.disabled ? " mc-rowDisabled" : ""), key: props.key },
        h(
          "div",
          { className: "mc-tile", title: "MCP" },
          "MCP",
          h("span", { className: statusClassOf(v, props.probe) })
        ),
        h(
          "div",
          { className: "mc-rowText" },
          h(
            "div",
            { className: "mc-title" },
            h(
              "button",
              { className: "mc-nameBtn", title: "\u70B9\u51FB\u7F16\u8F91", onClick: props.onEdit },
              v.serverName || v.id
            ),
            v.disabled ? Badge({ kind: "muted", text: "\u5DF2\u7981\u7528" }) : null,
            v.dup ? Badge({ kind: "err", text: "\u91CD\u590D id" }) : null,
            v.unmanageable ? Badge({ kind: "warn", text: "\u590D\u6742\u503C" }) : null,
            v.disabledIsJs ? Badge({ kind: "warn", text: "disabled \u4E3A !!js" }) : null,
            v.toolCount !== null && v.toolCount > 0 ? Badge({ kind: "info", text: v.toolCount + " \u5DE5\u5177" }) : null,
            v.issues.length > 0 ? h(
              "span",
              { className: "mc-notice mc-notice-warn", title: v.issues.join("\n") },
              "\u26A0 " + v.issues.length
            ) : null
          ),
          h("div", { className: "mc-line mc-mono", title: summaryOf(v) }, summaryOf(v)),
          // 已启用但注册表里没有该服务器的工具：低调的诊断行（不跟名字抢视觉），
          // 轮询刷新后如果热重连完成、工具注册上来，这行会自动消失
          !v.disabled && v.toolCount === 0 ? h(
            "div",
            {
              className: "mc-probeLine",
              title: "\u8FDE\u63A5\u6210\u529F\u7684\u670D\u52A1\u5668\u4F1A\u628A\u5DE5\u5177\u6CE8\u518C\u6210 mcp__" + (v.serverName || "\u2026") + "__*\u3002\u672A\u53D1\u73B0\u53EF\u80FD\u662F\uFF1A\u8FDE\u63A5\u5931\u8D25 / \u91CD\u8FDE\u9884\u7B97\u8017\u5C3D / \u670D\u52A1\u5668\u4E0D\u63D0\u4F9B\u5DE5\u5177\u3002\u521A\u4FDD\u5B58\u7684\u8BDD\u7B49\u51E0\u79D2\u70ED\u91CD\u8FDE\uFF08\u672C\u9875\u6BCF 5 \u79D2\u81EA\u52A8\u5237\u65B0\uFF09\u3002\u6392\u67E5\u770B dsh web \u7EC8\u7AEF\u91CC mcp-client(" + (v.serverName || "\u2026") + ") \u7684\u65E5\u5FD7\u884C\u3002"
            },
            "\u8FD0\u884C\u65F6\u672A\u53D1\u73B0 mcp__" + (v.serverName || "\u2026") + "__* \u5DE5\u5177\uFF08\u672A\u8FDE\u63A5\u6216\u670D\u52A1\u5668\u65E0\u5DE5\u5177\uFF09"
          ) : null,
          probeLine ? h("div", { className: "mc-probeLine", title: props.probe?.detail }, probeLine) : null
        ),
        h(
          "div",
          { className: "mc-controls" },
          v.transport === "streamable-http" ? h(
            P.Button,
            {
              variant: "toolbar",
              disabled: props.busy,
              title: "\u63A2\u6D3B\uFF08initialize \u63E1\u624B\uFF09",
              onClick: props.onProbe
            },
            props.busy ? h(P.IconLoadingOutline16, null) : h(P.IconRefreshOutline14, null)
          ) : null,
          h(
            P.Button,
            {
              variant: "toolbar",
              disabled: props.saving || v.dup || v.unmanageable,
              title: "\u7F16\u8F91",
              onClick: props.onEdit
            },
            h(P.IconEditOutline16, null)
          ),
          h(
            P.Button,
            {
              variant: "toolbar",
              className: "mc-danger",
              disabled: props.saving || v.dup,
              title: "\u5220\u9664 " + (v.serverName || v.id),
              onClick: props.onDelete
            },
            h(P.IconTrashOutline16, null)
          ),
          Switch({
            checked: !v.disabled,
            disabled: props.saving || v.dup,
            label: v.disabled ? "\u542F\u7528\u8BE5\u670D\u52A1\u5668" : "\u7981\u7528\u8BE5\u670D\u52A1\u5668",
            onChange: props.onToggle
          })
        )
      );
    }
    function Section() {
      const [loading, setLoading] = React.useState(true);
      const [state, setState] = React.useState(null);
      const [error, setError] = React.useState("");
      const [saving, setSaving] = React.useState(false);
      const [search, setSearch] = React.useState("");
      const [editor, setEditor] = React.useState(null);
      const [editorError, setEditorError] = React.useState("");
      const [confirmDel, setConfirmDel] = React.useState(null);
      const [acked, setAcked] = React.useState(false);
      const [confirmToggle, setConfirmToggle] = React.useState(
        null
      );
      const [probeBusy, setProbeBusy] = React.useState("");
      const load = React.useCallback(async () => {
        try {
          const r = await fetchState();
          if (r.ok && r.state) {
            setState(r.state);
            setError("");
          } else {
            setError(r.error || "\u8BFB\u53D6\u72B6\u6001\u5931\u8D25");
          }
        } catch (e) {
          setError(String(e?.message ?? e));
        } finally {
          setLoading(false);
        }
      }, []);
      React.useEffect(() => {
        void load();
      }, [load]);
      React.useEffect(() => {
        const timer = setInterval(() => {
          void (async () => {
            try {
              const r = await fetchState();
              if (r.ok && r.state) setState(r.state);
            } catch {
            }
          })();
        }, 5e3);
        return () => clearInterval(timer);
      }, []);
      function openCreate() {
        setEditorError("");
        setEditor({ mode: "create", id: "", tab: "form", form: emptyForm(), jsonText: createJsonText() });
      }
      function openEdit(v) {
        setEditorError("");
        setEditor({ mode: "edit", id: v.id, tab: "form", form: formFromView(v), jsonText: viewToJsonText(v) });
      }
      async function runToggle(view, enabled) {
        setSaving(true);
        try {
          const r = await toggleServer(view.id, !enabled);
          if (r.ok && r.state) setState(r.state);
          else setError(r.error || "\u5207\u6362\u5931\u8D25");
        } catch (e) {
          setError(String(e?.message ?? e));
        } finally {
          setSaving(false);
        }
      }
      function onToggle(view, enabled) {
        if (view.disabledIsJs) setConfirmToggle({ view, next: enabled });
        else void runToggle(view, enabled);
      }
      async function runProbe(view) {
        setProbeBusy(view.id);
        try {
          const r = await probeServer(view.id);
          if (r.ok && r.probe && state) {
            setState({ ...state, probes: { ...state.probes, [view.id]: r.probe } });
          } else if (!r.ok) {
            setError(r.error || "\u63A2\u6D3B\u5931\u8D25");
          }
        } catch (e) {
          setError(String(e?.message ?? e));
        } finally {
          setProbeBusy("");
        }
      }
      async function runDelete(view) {
        setSaving(true);
        try {
          const r = await removeServer(view.id);
          if (r.ok && r.state) setState(r.state);
          else setError(r.error || "\u5220\u9664\u5931\u8D25");
        } catch (e) {
          setError(String(e?.message ?? e));
        } finally {
          setSaving(false);
        }
      }
      async function saveEditor() {
        if (!editor) return;
        setEditorError("");
        let cfg;
        try {
          cfg = editor.tab === "json" ? JSON.parse(editor.jsonText) : configFromForm(editor.form);
        } catch (e) {
          setEditorError(String(e?.message ?? e));
          return;
        }
        setSaving(true);
        try {
          const r = editor.mode === "create" ? await createServer(cfg) : await updateServer(editor.id, cfg);
          if (r.ok && r.state) {
            setState(r.state);
            setEditor(null);
          } else {
            setEditorError(r.error || "\u4FDD\u5B58\u5931\u8D25");
          }
        } catch (e) {
          setEditorError(String(e?.message ?? e));
        } finally {
          setSaving(false);
        }
      }
      async function savePatchFile(v) {
        setSaving(true);
        try {
          const r = await saveManagerConfig({ patchFile: v });
          if (!r.ok) setError(r.error || "\u4FDD\u5B58\u5931\u8D25");
          await load();
        } catch (e) {
          setError(String(e?.message ?? e));
        } finally {
          setSaving(false);
        }
      }
      if (loading) {
        return h(
          "div",
          { className: "mc-page" },
          h(
            "div",
            { className: "mc-loading" },
            h(P.IconLoadingOutline16, null),
            h("span", { className: "mc-loadingText" }, "\u6B63\u5728\u8BFB\u53D6 MCP \u670D\u52A1\u5668\u2026")
          )
        );
      }
      if (error && !state) {
        return h("div", { className: "mc-page" }, h("div", { className: "mc-notice mc-notice-err" }, error));
      }
      const st = state;
      const keyword = search.trim().toLowerCase();
      const servers = st.servers.filter((v) => {
        if (!keyword) return true;
        const hay = [v.id, v.serverName, v.command, v.url, v.args.join(" "), v.cwd].join(" ").toLowerCase();
        return hay.includes(keyword);
      });
      const editorBody = editor === null ? null : editor.tab === "form" ? renderEditorForm(editor) : renderEditorJson(editor);
      function switchTab(ed, next) {
        setEditorError("");
        if (next === ed.tab) return;
        if (next === "json") {
          try {
            const cfg = configFromForm(ed.form);
            setEditor({ ...ed, tab: "json", jsonText: JSON.stringify(cfg, null, 2) });
          } catch (e) {
            setEditorError(String(e?.message ?? e) + "\uFF08\u4FEE\u6B63\u540E\u518D\u5207\u5230 JSON\uFF09");
          }
          return;
        }
        try {
          const parsed = JSON.parse(ed.jsonText);
          if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
            throw new Error("config \u5E94\u4E3A JSON \u5BF9\u8C61");
          }
          setEditor({ ...ed, tab: "form", form: formFromConfig(parsed) });
        } catch (e) {
          setEditorError(String(e?.message ?? e) + "\uFF08\u4FEE\u6B63\u540E\u518D\u5207\u5230\u8868\u5355\uFF09");
        }
      }
      function modeRow() {
        return h(
          "div",
          { className: "mc-modeRow" },
          h(
            P.Pill,
            { active: editor?.tab === "form", onClick: () => editor && switchTab(editor, "form") },
            "\u8868\u5355"
          ),
          h(
            P.Pill,
            { active: editor?.tab === "json", onClick: () => editor && switchTab(editor, "json") },
            "JSON"
          ),
          h("div", { className: "mc-modeSpacer" }),
          h("span", { className: "mc-fieldLabel" }, '\u8868\u8FBE\u5F0F\u5199\u6CD5\uFF1A\u503C\u524D\u52A0 "js: " \u524D\u7F00\uFF08\u7B49\u4EF7 YAML \u7684 !!js\uFF09')
        );
      }
      function renderEditorForm(ed) {
        const f = ed.form;
        const setF = (patch) => setEditor({ ...ed, form: { ...f, ...patch } });
        const kids = [];
        kids.push(
          FieldLabel({
            text: "\u540D\u79F0\uFF08\u6A21\u578B\u5DE5\u5177\u524D\u7F00 mcp__\u540D\u79F0__\u5DE5\u5177\uFF1B1-32 \u4F4D\u5B57\u6BCD/\u6570\u5B57/\u4E0B\u5212\u7EBF/\u8FDE\u5B57\u7B26\uFF09",
            key: "ln"
          })
        );
        kids.push(
          TextInput({
            key: "name",
            value: f.serverName,
            placeholder: "my-mcp-server",
            mono: true,
            onChange: (v) => setF({ serverName: v })
          })
        );
        kids.push(FieldLabel({ text: "\u7C7B\u578B", key: "lt" }));
        kids.push(
          h(Selector, {
            key: "transport",
            value: f.transport,
            selectedLabel: f.transport === "stdio" ? "stdio\uFF08\u672C\u5730\u547D\u4EE4\uFF09" : "streamable-http\uFF08HTTP\uFF09",
            options: [
              { id: "stdio", label: "stdio\uFF08\u672C\u5730\u547D\u4EE4\uFF09" },
              { id: "streamable-http", label: "streamable-http\uFF08HTTP\uFF09" }
            ],
            onSelect: (id) => setF({ transport: id === "stdio" ? "stdio" : "streamable-http" })
          })
        );
        if (f.transport === "stdio") {
          kids.push(FieldLabel({ text: "\u547D\u4EE4", key: "lc" }));
          kids.push(
            TextInput({
              key: "cmd",
              value: f.command,
              placeholder: "npx",
              mono: true,
              onChange: (v) => setF({ command: v })
            })
          );
          kids.push(FieldLabel({ text: "\u53C2\u6570\uFF08\u7A7A\u683C\u5206\u9694\uFF0C\u5F15\u53F7\u53EF\u5305\u88F9\u542B\u7A7A\u683C\u7684\u9879\uFF09", key: "la" }));
          kids.push(
            TextInput({
              key: "args",
              value: f.argsText,
              placeholder: "-y @modelcontextprotocol/server-memory",
              mono: true,
              onChange: (v) => setF({ argsText: v })
            })
          );
          kids.push(FieldLabel({ text: '\u73AF\u5883\u53D8\u91CF\uFF08\u53EF\u9009\uFF0CJSON\uFF1B\u8868\u8FBE\u5F0F\u7528 "js: " \u524D\u7F00\uFF09', key: "le" }));
          kids.push(
            h("textarea", {
              key: "env",
              className: "mc-textarea mc-textareaMono",
              rows: 4,
              spellCheck: false,
              placeholder: '{\n  "MY_API_KEY": "js: process.env.MY_API_KEY"\n}',
              value: f.envText,
              onChange: (e) => setF({ envText: e.target.value })
            })
          );
          kids.push(FieldLabel({ text: "\u5DE5\u4F5C\u76EE\u5F55\uFF08\u53EF\u9009\uFF09", key: "lw" }));
          kids.push(
            TextInput({
              key: "cwd",
              value: f.cwd,
              placeholder: "/absolute/path",
              mono: true,
              onChange: (v) => setF({ cwd: v })
            })
          );
        } else {
          kids.push(FieldLabel({ text: "URL", key: "lu" }));
          kids.push(
            TextInput({
              key: "url",
              value: f.url,
              placeholder: "https://mcp.example.com/mcp",
              mono: true,
              onChange: (v) => setF({ url: v })
            })
          );
          kids.push(
            h(
              "p",
              { className: "mc-hint", key: "ssehint" },
              "\u4EC5\u652F\u6301 Streamable HTTP\u3002\u65E7\u5F0F\u7EAF SSE \u7AEF\u70B9\uFF08/sse\uFF09\u5B98\u65B9 dsh-mcp-client \u4E0D\u652F\u6301\uFF0C\u53EF\u6539\u7528 stdio \u7C7B\u578B\u586B npx mcp-remote https://\u2026 \u6865\u63A5\u3002"
            )
          );
          kids.push(FieldLabel({ text: '\u8BF7\u6C42\u5934\uFF08\u53EF\u9009\uFF0CJSON\uFF1B\u8868\u8FBE\u5F0F\u7528 "js: " \u524D\u7F00\uFF09', key: "lh" }));
          kids.push(
            h("textarea", {
              key: "headers",
              className: "mc-textarea mc-textareaMono",
              rows: 4,
              spellCheck: false,
              placeholder: '{\n  "Authorization": "js: `Bearer ${process.env.MCP_TOKEN}`"\n}',
              value: f.headersText,
              onChange: (e) => setF({ headersText: e.target.value })
            })
          );
        }
        kids.push(FieldLabel({ text: "\u9AD8\u7EA7", key: "lv" }));
        kids.push(
          h(
            "div",
            { className: "mc-twoCol", key: "adv" },
            h(
              "div",
              { key: "tw" },
              FieldLabel({ text: "\u5DE5\u5177\u8C03\u7528\u8D85\u65F6 MS\uFF08\u9ED8\u8BA4 60000\uFF09" }),
              TextInput({
                value: f.timeoutText,
                placeholder: "60000",
                mono: true,
                onChange: (v) => setF({ timeoutText: v })
              })
            ),
            h(
              "div",
              { key: "fs" },
              FieldLabel({ text: "\u542F\u52A8\u5931\u8D25\u65F6\u62D2\u7EDD\u6FC0\u6D3B\uFF08\u9ED8\u8BA4\u5173\u95ED\uFF1A\u5931\u8D25\u53EA\u8BB0\u65E5\u5FD7\uFF09" }),
              Switch({
                checked: f.failOnStartup,
                label: "failOnStartupError",
                onChange: (next) => setF({ failOnStartup: next })
              })
            )
          )
        );
        return kids;
      }
      function renderEditorJson(ed) {
        return [
          h("textarea", {
            key: "json",
            className: "mc-textarea mc-textareaMono",
            rows: 18,
            spellCheck: false,
            value: ed.jsonText,
            onChange: (e) => setEditor({ ...ed, jsonText: e.target.value })
          }),
          h(
            "p",
            { className: "mc-hint", key: "jh" },
            '\u5B8C\u6574 config\uFF08\u4F1A\u6574\u4F53\u66FF\u6362\u5DF2\u77E5\u5B57\u6BB5\uFF09\u3002\u672A\u8BC6\u522B\u7684\u81EA\u5B9A\u4E49\u952E\u4E0D\u4F1A\u88AB\u5220\u9664\uFF1B"js: " \u524D\u7F00\u7684\u503C\u56DE\u5199\u4E3A !!js \u8868\u8FBE\u5F0F\u3002'
          )
        ];
      }
      return h(
        "div",
        { className: "mc-page" },
        // 简介与 patch 文件位置
        h(
          "p",
          { className: "mc-intro" },
          "\u7BA1\u7406 cordis.patch.yml \u91CC\u7684 @deepseek-ai/dsh-mcp-client \u5B9E\u4F8B\uFF1B\u4FDD\u5B58\u540E DSH \u81EA\u52A8\u70ED\u91CD\u8FDE\u5BF9\u5E94\u670D\u52A1\u5668\u3002\u72B6\u6001\u70B9\u4E0E\u300CN \u5DE5\u5177\u300D\u5FBD\u6807\u6765\u81EA\u8FD0\u884C\u65F6\u5DE5\u5177\u6CE8\u518C\u8868\uFF0C\u6BCF 5 \u79D2\u81EA\u52A8\u5237\u65B0\u3002"
        ),
        h(
          "div",
          { className: "mc-rootPath", title: st.patchFile.path },
          (st.patchFile.exists ? "" : "\uFF08\u6587\u4EF6\u4E0D\u5B58\u5728\uFF09") + st.patchFile.path + "\uFF08" + patchSourceLabel(st.patchFile.source) + "\uFF09"
        ),
        st.fileIssue ? h("p", { className: "mc-notice mc-notice-warn" }, st.fileIssue) : null,
        // 工具栏
        h(
          "div",
          { className: "mc-toolbar" },
          h("span", { className: "mc-count" }, "MCP " + st.servers.length),
          h("div", { className: "mc-toolbarSpacer" }),
          h(
            "div",
            { className: "mc-searchW" },
            h(P.Input, {
              placeholder: "\u641C\u7D22 MCP \u670D\u52A1\u5668\u2026",
              value: search,
              onChange: (e) => setSearch(e.target.value)
            })
          ),
          h(
            P.Button,
            { variant: "toolbar", title: "\u5237\u65B0\uFF08\u91CD\u65B0\u8BFB\u53D6 patch \u6587\u4EF6\uFF09", onClick: () => void load() },
            h(P.IconRefreshOutline14, null)
          ),
          h(
            P.Button,
            { variant: "primary", disabled: st.patchFile.exists === false, onClick: openCreate },
            h(P.IconPlusOutline16, null),
            "\u65B0\u5EFA"
          )
        ),
        error ? h("p", { className: "mc-notice mc-notice-err" }, error) : null,
        // 列表
        st.servers.length === 0 ? h(
          "div",
          { className: "mc-empty" },
          h("div", { className: "mc-emptyTitle" }, "\u8FD8\u6CA1\u6709 MCP \u670D\u52A1\u5668"),
          h(
            "p",
            { className: "mc-hint" },
            "\u65B0\u5EFA\u4E00\u4E2A\u6761\u76EE\uFF0C\u6216\u6309\u5B98\u65B9 dsh-mcp-client \u7684\u8BF4\u660E\u624B\u5199 - insert: \u5B9E\u4F8B\uFF08\u5199\u597D\u540E\u56DE\u6765\u8FD9\u91CC\u7BA1\u7406\uFF09\u3002"
          ),
          h(
            P.Button,
            { variant: "primary", disabled: st.patchFile.exists === false, onClick: openCreate },
            "\u65B0\u5EFA MCP \u670D\u52A1\u5668"
          )
        ) : h(
          "div",
          { className: "mc-list" },
          servers.map(
            (v) => h(ServerRow, {
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
              }
            })
          )
        ),
        // 编辑器弹窗
        editor === null ? null : h(
          P.Modal,
          {
            open: true,
            onClose: () => setEditor(null),
            className: "mc-wideModal",
            title: editor.mode === "create" ? "\u65B0\u5EFA MCP \u670D\u52A1\u5668" : "\u7F16\u8F91 MCP \u670D\u52A1\u5668 \xB7 " + editor.id,
            closeLabel: "\u5173\u95ED",
            description: "\u4FDD\u5B58\u540E\u5199\u5165 cordis.patch.yml\uFF0CDSH \u4F1A\u70ED\u91CD\u8FDE\u5BF9\u5E94\u5B9E\u4F8B\u3002",
            footer: h(
              "div",
              { className: "mc-bar" },
              h(
                P.Button,
                { variant: "primary", disabled: saving, onClick: () => void saveEditor() },
                "\u4FDD\u5B58"
              ),
              h(P.Button, { disabled: saving, onClick: () => setEditor(null) }, "\u53D6\u6D88"),
              editorError ? h("span", { className: "mc-notice mc-notice-err" }, editorError) : null
            )
          },
          modeRow(),
          h("div", { className: "mc-form" }, editorBody)
        ),
        // 删除确认
        confirmDel === null ? null : P.RiskConfirmation ? h(P.RiskConfirmation, {
          key: "confirm-del",
          open: true,
          title: "\u5220\u9664 MCP \u670D\u52A1\u5668\u300C" + (confirmDel.serverName || confirmDel.id) + "\u300D\uFF1F",
          description: "\u5C06\u4ECE cordis.patch.yml \u79FB\u9664\u5B9E\u4F8B " + confirmDel.id + "\uFF0C\u5176\u5DE5\u5177\uFF08mcp__" + (confirmDel.serverName || "\u2026") + "__*\uFF09\u968F\u4E4B\u6CE8\u9500\u3002\u6B64\u64CD\u4F5C\u4E0D\u53EF\u64A4\u9500\uFF08\u6700\u8FD1\u4E00\u6B21\u6539\u52A8\u6709 .bak \u5907\u4EFD\uFF09\u3002",
          acknowledgeLabel: "\u6211\u5DF2\u4E86\u89E3\uFF0C\u5220\u9664\u8BE5\u670D\u52A1\u5668",
          cancelLabel: "\u53D6\u6D88",
          confirmLabel: "\u5220\u9664",
          acknowledged: acked,
          onAcknowledgedChange: setAcked,
          onCancel: () => setConfirmDel(null),
          onConfirm: () => {
            const v = confirmDel;
            setConfirmDel(null);
            void runDelete(v);
          }
        }) : h(
          P.Modal,
          {
            key: "confirm-del-fallback",
            open: true,
            onClose: () => setConfirmDel(null),
            title: "\u5220\u9664 MCP \u670D\u52A1\u5668\u300C" + (confirmDel.serverName || confirmDel.id) + "\u300D\uFF1F",
            closeLabel: "\u5173\u95ED",
            footer: h(
              "div",
              { className: "mc-bar" },
              h(
                P.Button,
                {
                  variant: "primary",
                  disabled: saving,
                  onClick: () => {
                    const v = confirmDel;
                    setConfirmDel(null);
                    void runDelete(v);
                  }
                },
                "\u5220\u9664"
              ),
              h(P.Button, { onClick: () => setConfirmDel(null) }, "\u53D6\u6D88")
            )
          },
          h("p", { className: "mc-hint" }, "\u5C06\u4ECE cordis.patch.yml \u79FB\u9664\u5B9E\u4F8B\u6761\u76EE\uFF0C\u5DE5\u5177\u968F\u4E4B\u6CE8\u9500\u3002")
        ),
        // disabled 为 !!js 表达式时的覆盖确认
        confirmToggle === null ? null : P.RiskConfirmation ? h(P.RiskConfirmation, {
          key: "confirm-toggle",
          open: true,
          title: "\u8986\u76D6 disabled \u8868\u8FBE\u5F0F\uFF1F",
          description: "\u6761\u76EE " + confirmToggle.view.id + " \u7684 disabled \u5F53\u524D\u662F !!js \u8868\u8FBE\u5F0F\uFF0C\u5207\u6362\u540E\u4F1A\u5199\u6210\u666E\u901A\u5E03\u5C14\u503C " + String(!confirmToggle.next) + "\u3002",
          acknowledgeLabel: "\u6211\u5DF2\u4E86\u89E3\uFF0C\u8986\u76D6\u8868\u8FBE\u5F0F",
          cancelLabel: "\u53D6\u6D88",
          confirmLabel: "\u7EE7\u7EED\u5207\u6362",
          acknowledged: acked,
          onAcknowledgedChange: setAcked,
          onCancel: () => setConfirmToggle(null),
          onConfirm: () => {
            const { view, next } = confirmToggle;
            setConfirmToggle(null);
            void runToggle(view, next);
          }
        }) : null,
        // patch 文件位置修正（不存在时给一行入口）
        st.patchFile.exists === false ? h(PatchFileFix, {
          key: "patchfix",
          disabled: saving,
          onSubmit: (v) => void savePatchFile(v)
        }) : null
      );
    }
    function PatchFileFix(props) {
      const [val, setVal] = React.useState("");
      return h(
        "div",
        { className: "mc-bar", style: { marginTop: "10px" } },
        h("span", { className: "mc-notice mc-notice-warn" }, "patch \u6587\u4EF6\u4E0D\u5B58\u5728\uFF0C\u53EF\u5728\u6B64\u586B\u7EDD\u5BF9\u8DEF\u5F84\uFF1A"),
        h(
          "div",
          { className: "mc-searchW" },
          h(P.Input, {
            placeholder: "/home/me/.dsh/profiles/web/cordis.patch.yml",
            value: val,
            onChange: (e) => setVal(e.target.value)
          })
        ),
        h(
          P.Button,
          {
            variant: "toolbar",
            disabled: props.disabled || !val.trim(),
            onClick: () => props.onSubmit(val.trim())
          },
          "\u4FDD\u5B58\u8DEF\u5F84"
        )
      );
    }
    return Section;
  }
  function patchSourceLabel(source) {
    if (source === "settings") return "\u8BBE\u7F6E\u9875\u6307\u5B9A";
    if (source === "env") return "DSH_PROFILE_DIR";
    if (source === "module-path") return "\u6309\u5B89\u88C5\u4F4D\u7F6E\u5B9A\u4F4D";
    if (source === "profile-scan") return "\u6309 profile \u767B\u8BB0\u5B9A\u4F4D";
    return "\u9ED8\u8BA4\u8DEF\u5F84";
  }

  // src/client/index.ts
  var PLUGIN_ID = "@dshp/mcp-manager";
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
        const Section = createMcpSection(React, P);
        const exportsObj = exportsShim;
        exportsObj.inject = ["slots"];
        exportsObj.apply = function apply(ctx) {
          const slots = ctx.get("slots");
          if (slots === void 0) return;
          const style = document.createElement("style");
          style.setAttribute("data-plugin-css", "dshp-mcp-manager/settings.css");
          style.textContent = CSS;
          document.head.appendChild(style);
          ctx.effect(() => () => style.remove(), "dshp-mcp-manager: section styles");
          ctx.effect(
            () => slots.inject(
              "settings.section",
              () => slots.register(
                { name: "settings.section", id: "dshp-mcp-manager", order: 30, label: "MCP" },
                Section
              )
            ),
            "dshp-mcp-manager: settings section"
          );
        };
        return moduleShim.exports;
      }
    });
  }
  register();

})();
