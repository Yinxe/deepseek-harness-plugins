(function () {
  'use strict';

  // src/client/types.ts
  var ROUTE_BASE = "/ext/dshp-search-provider";

  // src/client/api.ts
  async function readJson(response) {
    const text = await response.text();
    if (text.trim().length === 0) {
      return {
        ok: false,
        error: "\u63A5\u53E3\u8FD4\u56DE\u7A7A\u54CD\u5E94\uFF08Host \u53EF\u80FD\u662F\u65E7\u7248\u672C\uFF09\uFF1A\u8BF7\u91CD\u542F dsh web \u540E\u5237\u65B0\u9875\u9762\u91CD\u8BD5\u3002",
        needsRestart: true
      };
    }
    try {
      return JSON.parse(text);
    } catch {
      return {
        ok: false,
        error: `\u63A5\u53E3\u8FD4\u56DE\u4E86\u975E JSON \u54CD\u5E94\uFF08HTTP ${response.status}\uFF09\uFF1A\u8BF7\u91CD\u542F dsh web \u540E\u5237\u65B0\u9875\u9762\u91CD\u8BD5\u3002`,
        needsRestart: true
      };
    }
  }
  function friendlyCredError(action, ref, error) {
    const raw = String(error?.message ?? error);
    if (/launching environment|shadowed|read-only/i.test(raw)) {
      if (action === "clear") {
        return `\u5F53\u524D Key \u6765\u81EA\u542F\u52A8 dsh \u7684\u7EC8\u7AEF\u73AF\u5883\uFF08\u73AF\u5883\u53D8\u91CF\u4F18\u5148\uFF0C\u9875\u9762\u65E0\u6CD5\u6E05\u9664\uFF09\u3002\u5982\u9700\u6539\u8D70\u6587\u4EF6\u7BA1\u7406\uFF1Aunset ${ref} \u540E\u91CD\u542F dsh web\u3002`;
      }
      return `\u4FDD\u5B58\u672A\u751F\u6548\uFF1A\u542F\u52A8 dsh \u7684\u7EC8\u7AEF\u73AF\u5883\u91CC\u5DF2\u6709 ${ref}\uFF0C\u73AF\u5883\u53D8\u91CF\u4F18\u5148\u4E8E\u51ED\u8BC1\u5E93\uFF0C\u5B58\u4E86\u4E5F\u4E0D\u4F1A\u88AB\u8BFB\u53D6\u3002\u5982\u9700\u6539\u8D70\u6587\u4EF6\u7BA1\u7406\uFF1Aunset ${ref} \u540E\u91CD\u542F dsh web\uFF0C\u518D\u56DE\u6765\u4FDD\u5B58\uFF1B\u6216\u76F4\u63A5\u6D4B\u8BD5\uFF0C\u73AF\u5883\u91CC\u7684 Key \u5DF2\u53EF\u7528\u3002`;
    }
    return raw;
  }
  function createBridge(remote) {
    const fetchJson = async (path, init) => {
      const response = await fetch(ROUTE_BASE + path, { cache: "no-store", ...init });
      if (response.status === 404) {
        return {
          ok: false,
          error: `\u63A5\u53E3 404\uFF1AHost \u8FD8\u662F\u65E7\u7248\u672C\uFF08\u65B0\u8DEF\u7531\u672A\u52A0\u8F7D\uFF09\uFF0C\u8BF7\u91CD\u542F dsh web \u540E\u5237\u65B0\u9875\u9762\u91CD\u8BD5\u3002`,
          needsRestart: true
        };
      }
      return readJson(response);
    };
    return {
      getState: () => fetchJson("/state"),
      saveConfig: (patch) => fetchJson("/config", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(patch || {})
      }),
      runTest: (providerId, query) => fetchJson("/test", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ provider: providerId, query })
      }),
      getUsage: (providerId, force) => fetchJson(`/${providerId}/usage${force ? "?force=1" : ""}`),
      /**
       * 写入密钥：官方形态 remote.credentials.set(ref, value) → { ok:true } /
       * { ok:false, error:{ message } }；成功后回读状态，界面即时反映。
       */
      saveKey: async (ref, value) => {
        try {
          const response = await remote?.credentials?.set(ref, value);
          if (response && response.ok === true)
            return { ok: true, state: await fetchJson("/state") };
          const message = response?.error?.message ? String(response.error.message) : "\u51ED\u8BC1\u5199\u5165\u5931\u8D25";
          return { ok: false, error: friendlyCredError("save", ref, message) };
        } catch (error) {
          return { ok: false, error: friendlyCredError("save", ref, error) };
        }
      },
      clearKey: async (ref) => {
        try {
          const response = await remote?.credentials?.unset(ref);
          if (response && response.ok === true)
            return { ok: true, state: await fetchJson("/state") };
          const message = response?.error?.message ? String(response.error.message) : "\u51ED\u8BC1\u6E05\u9664\u5931\u8D25";
          return { ok: false, error: friendlyCredError("clear", ref, message) };
        } catch (error) {
          return { ok: false, error: friendlyCredError("clear", ref, error) };
        }
      }
    };
  }

  // src/client/styles.ts
  var CSS = `
.sp-page{max-width:720px;color:var(--dsw-alias-label-primary);flex-direction:column;display:flex}
.sp-section{flex-direction:column;width:100%;display:flex}
.sp-sectionHead{color:var(--dsw-alias-label-secondary);font-size:12px;font-weight:500;line-height:18px;padding:14px 0 2px}
.sp-row{border-bottom:.5px solid var(--dsw-alias-border-l2);align-items:center;gap:8px;padding:16px 0;display:flex}
.sp-rowWrap{border-bottom:.5px solid var(--dsw-alias-border-l2);align-items:flex-start;gap:8px;padding:16px 0;display:flex;flex-direction:column}
.sp-section .sp-row:last-child,.sp-section .sp-rowWrap:last-child{border-bottom:none}
.sp-rowText{flex-direction:column;flex:1;gap:4px;min-width:0;padding-right:48px;display:flex}
.sp-title{color:var(--dsw-alias-label-primary);font-size:14px;font-weight:400;line-height:22px}
.sp-desc{color:var(--dsw-alias-label-tertiary);font-size:12px;font-weight:400;line-height:18px}
.sp-intro{color:var(--dsw-alias-label-tertiary);margin:0 0 4px;font-size:14px;line-height:22px}
.sp-mono{font-family:var(--ds-font-family-code)}
.sp-selector{background:var(--dsw-alias-bg-module-platform);height:36px;font:inherit;color:var(--dsw-alias-label-primary);cursor:pointer;border:none;border-radius:18px;align-items:center;gap:12px;padding:0 14px;font-size:14px;line-height:22px;display:inline-flex;max-width:100%}
.sp-selector:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}
.sp-selector:disabled{cursor:default;opacity:.4}
.sp-selectorLabel{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.sp-chevron{flex:none}
.sp-inputWrap{display:inline-flex;align-items:center;gap:6px;height:32px;padding:0 8px;border:.5px solid var(--dsw-alias-border-l4);border-radius:8px;background:var(--dsw-alias-bg-layer-1);flex:1;min-width:0}
.sp-inputWrap:focus-within{border-color:var(--dsw-alias-brand-primary)}
.sp-input{flex:1;min-width:0;border:none;outline:none;background:transparent;font-size:14px;line-height:22px;color:var(--dsw-alias-label-primary);font-family:inherit}
.sp-input::placeholder{color:var(--dsw-alias-label-dimmed)}
.sp-input:disabled{opacity:.5}
.sp-badge{white-space:nowrap;align-items:center;height:20px;border-radius:10px;padding:0 8px;font-size:11px;font-weight:500;line-height:20px;display:inline-flex}
.sp-badge-ok{background:var(--dsw-alias-state-success-tertiary);color:var(--dsw-alias-state-success-primary)}
.sp-badge-warn{background:var(--dsw-alias-state-warn-tertiary);color:var(--dsw-alias-state-warn-label)}
.sp-badge-muted{background:var(--dsw-alias-button-ghost-active-fill);color:var(--dsw-alias-label-caption)}
.sp-bar{align-items:center;gap:8px;display:flex;flex-wrap:wrap;padding:12px 0}
.sp-notice{margin:0;font-size:12px;line-height:18px}
.sp-notice-ok{color:var(--dsw-alias-state-success-primary)}
.sp-notice-err{color:var(--dsw-alias-state-error-primary)}
.sp-hint{color:var(--dsw-alias-label-tertiary);margin:0;font-size:12px;line-height:18px}
.sp-loading{align-items:center;gap:8px;display:flex}
.sp-loadingText{color:var(--dsw-alias-label-tertiary);font-size:13px;line-height:20px}
.sp-results{flex-direction:column;gap:8px;display:flex}
.sp-result-item{border:.5px solid var(--dsw-alias-border-l4);border-radius:8px;flex-direction:column;gap:4px;padding:10px 12px;display:flex}
.sp-result-item a{color:var(--dsw-alias-state-business-primary);font-size:13px;font-weight:500;line-height:20px;text-decoration:none}
.sp-result-item a:hover{text-decoration:underline}
.sp-result-item a:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px;border-radius:4px}
.sp-result-snippet{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}
.sp-result-meta{color:var(--dsw-alias-label-tertiary);font-family:var(--ds-font-family-code);font-size:11px;line-height:16px;word-break:break-all}
.sp-meter{height:6px;border-radius:3px;background:var(--dsw-alias-button-ghost-active-fill);overflow:hidden;margin-top:6px}
.sp-meter-fill{height:100%;background:var(--dsw-alias-brand-primary);border-radius:3px;transition:width .2s}
.sp-meter-fill-high{background:var(--dsw-alias-state-error-primary)}
.sp-break{flex-direction:column;gap:4px;display:flex;margin-top:8px}
.sp-break-row{justify-content:space-between;gap:8px;font-size:12px;line-height:18px;display:flex}
.sp-break-label{color:var(--dsw-alias-label-tertiary)}
.sp-break-value{color:var(--dsw-alias-label-secondary);font-family:var(--ds-font-family-code)}
.sp-sub{color:var(--dsw-alias-label-tertiary);margin:6px 0 0;font-size:12px;line-height:18px}
.sp-foot{justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;display:flex;margin-top:8px}
@media (prefers-reduced-motion:reduce){.sp-meter-fill{transition:none}}
`;

  // src/client/components.ts
  function createComponents(React, P) {
    function Badge(props) {
      return React.createElement("span", { className: "sp-badge sp-badge-" + props.kind }, props.text);
    }
    function Row(props) {
      return React.createElement(
        "div",
        { className: "sp-row" },
        React.createElement(
          "div",
          { className: "sp-rowText" },
          React.createElement("div", { className: "sp-title" }, props.label),
          props.desc ? React.createElement("div", { className: "sp-desc" }, props.desc) : null
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
          className: "sp-selector",
          "aria-haspopup": "menu",
          "aria-expanded": open,
          disabled: props.disabled,
          onClick: () => setOpen((v) => !v)
        },
        React.createElement("span", { className: "sp-selectorLabel" }, props.selectedLabel),
        React.createElement(P.IconChevronDownOutline14, { className: "sp-chevron" })
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
    function Notice(props) {
      return React.createElement("p", { className: "sp-notice sp-notice-" + props.kind }, props.text);
    }
    function Hint(props) {
      return React.createElement("p", { className: "sp-hint" }, props.text);
    }
    function Loading(props) {
      return React.createElement(
        "div",
        { className: "sp-loading" },
        React.createElement(P.IconLoadingOutline16, null),
        React.createElement("span", { className: "sp-loadingText" }, props.text)
      );
    }
    function Meter(props) {
      const v = typeof props.pct === "number" && Number.isFinite(props.pct) ? Math.min(100, Math.max(0, Math.round(props.pct))) : 0;
      return React.createElement(
        "div",
        { className: "sp-meter" },
        React.createElement("div", {
          className: "sp-meter-fill" + (v >= 90 ? " sp-meter-fill-high" : ""),
          style: { width: v + "%" }
        })
      );
    }
    function BreakRow(props) {
      return React.createElement(
        "div",
        { className: "sp-break-row", key: props.label },
        React.createElement("span", { className: "sp-break-label" }, props.label),
        React.createElement("span", { className: "sp-break-value" }, props.value)
      );
    }
    return { Badge, Row, Select, Notice, Hint, Loading, Meter, BreakRow };
  }

  // src/client/providers/tavily.ts
  function asRec(v) {
    return v !== null && typeof v === "object" && !Array.isArray(v) ? v : {};
  }
  function asNum(v) {
    return typeof v === "number" && Number.isFinite(v) ? v : null;
  }
  function asStr(v) {
    return typeof v === "string" ? v : "";
  }
  function fmtCount(used, limit) {
    if (used === null) return "\u2014";
    if (limit === null) return String(used);
    return String(used) + " / " + String(limit);
  }
  function fmtNumber(v) {
    return v === null ? "\u2014" : String(v);
  }
  function pctOf(used, limit) {
    if (used === null || limit === null || limit <= 0) return 0;
    return Math.min(100, Math.round(used / limit * 100));
  }
  function fmtTime(ts) {
    if (typeof ts !== "number") return "\u672A\u77E5";
    try {
      return new Date(ts).toLocaleString();
    } catch {
      return String(ts);
    }
  }
  function createTavilyExtras(React, P, C, bridge) {
    return function TavilyUsage(props) {
      const { provider, usageMeta } = props;
      const [usage, setUsage] = React.useState(null);
      const [usageErr, setUsageErr] = React.useState(null);
      const [busy, setBusy] = React.useState(null);
      const refresh = React.useCallback(
        (force) => {
          setBusy(force ? "usage-force" : "usage");
          setUsageErr(null);
          bridge.getUsage(provider.id, force).then((u) => {
            setBusy(null);
            if (u && u.ok) {
              setUsage(u);
              setUsageErr(null);
            } else if (u && u.stale) {
              setUsage({
                ok: true,
                usage: u.stale.usage,
                fetchedAt: u.stale.fetchedAt,
                cached: true,
                stale: true
              });
              setUsageErr(u.error ?? "\u7528\u91CF\u8BFB\u53D6\u5931\u8D25");
            } else {
              setUsageErr(u && u.error || "\u7528\u91CF\u8BFB\u53D6\u5931\u8D25");
            }
          }).catch((error) => {
            setBusy(null);
            setUsageErr(String(error?.message ?? error));
          });
        },
        [provider.id]
      );
      React.useEffect(() => {
        if (provider.configured) refresh(false);
        else {
          setUsage(null);
          setUsageErr(null);
        }
      }, [provider.configured, refresh]);
      const rows = [];
      if (!provider.configured) {
        rows.push(
          React.createElement(
            C.Hint,
            {
              key: "na",
              text: "\u5148\u914D\u7F6E API Key \u540E\u518D\u67E5\u770B\u7528\u91CF\u3002\u914D\u989D\u7531 Tavily \u8D26\u53F7\u63D0\u4F9B\uFF0C\u5B98\u65B9\u9650\u6D41 10 \u6B21 / 10 \u5206\u949F\uFF0C\u670D\u52A1\u7AEF\u5DF2\u505A 60 \u79D2\u7F13\u5B58\u3002"
            },
            null
          )
        );
      } else if (busy !== null) {
        rows.push(React.createElement(C.Loading, { key: "busy", text: "\u6B63\u5728\u8BF7\u6C42 api.tavily.com/usage \u2026" }));
      } else if (usage !== null && usage.usage) {
        const data = asRec(usage.usage);
        const k = asRec(data["key"]);
        const a = asRec(data["account"]);
        const keyUsage = asNum(k["usage"]);
        const keyLimit = asNum(k["limit"]);
        const planUsage = asNum(a["plan_usage"]);
        const planLimit = asNum(a["plan_limit"]);
        const paygoUsage = asNum(a["paygo_usage"]);
        const paygoLimit = asNum(a["paygo_limit"]);
        const keyRemain = keyLimit !== null && keyUsage !== null ? keyLimit - keyUsage : null;
        const planRemain = planLimit !== null && planUsage !== null ? planLimit - planUsage : null;
        const paygoRemain = paygoLimit !== null && paygoUsage !== null ? paygoLimit - paygoUsage : null;
        const keyLimited = keyLimit !== null;
        const planLimited = planLimit !== null;
        const effLimit = keyLimited && planLimited ? Math.min(keyLimit, planLimit) : keyLimited ? keyLimit : planLimited ? planLimit : null;
        const effSource = keyLimited && planLimited ? keyLimit < planLimit ? "Key \u66F4\u5C0F" : planLimit < keyLimit ? "\u8D26\u53F7\u8BA1\u5212\u66F4\u5C0F" : "\u4E24\u8005\u4E00\u81F4" : keyLimited ? "Key\uFF08\u8D26\u53F7\u8BA1\u5212\u672A\u8BBE\u9650\uFF09" : planLimited ? "\u8D26\u53F7\u8BA1\u5212\uFF08Key \u672A\u8BBE\u9650\uFF09" : null;
        const effRemain = keyRemain !== null && planRemain !== null ? Math.min(keyRemain, planRemain) : keyRemain !== null ? keyRemain : planRemain;
        const bindPct = Math.max(
          keyLimited ? pctOf(keyUsage, keyLimit) : 0,
          planLimited ? pctOf(planUsage, planLimit) : 0
        );
        const planName = asStr(a["current_plan"]);
        const keyLine = fmtCount(keyUsage, keyLimit) + (keyRemain !== null ? " \xB7 \u5269\u4F59 " + keyRemain : "") + (keyLimited ? "" : " \xB7 Key \u672A\u8BBE\u9650\uFF08\u53D7\u8D26\u53F7\u5957\u9910\u7EA6\u675F\uFF09");
        rows.push(
          React.createElement(
            "div",
            { key: "rows" },
            React.createElement(
              C.Row,
              { label: "\u751F\u6548\u4E0A\u9650\uFF08\u53D6\u5C0F\u503C\uFF09" },
              React.createElement(
                "span",
                { className: "sp-mono" },
                effLimit !== null ? String(effLimit) + (effSource ? " \xB7 " + effSource : "") : "\u4E0D\u9650"
              )
            ),
            React.createElement(
              C.Row,
              { label: "\u8D26\u53F7\u8BA1\u5212\u7528\u91CF\uFF08\u603B\u91CF\u7EA6\u675F\uFF09" },
              React.createElement(
                "span",
                { className: "sp-mono" },
                fmtCount(planUsage, planLimit) + (planRemain !== null ? " \xB7 \u5269\u4F59 " + planRemain : "")
              )
            ),
            React.createElement(
              C.Row,
              { label: "\u5F53\u524D Key \u7528\u91CF" },
              React.createElement("span", { className: "sp-mono" }, keyLine)
            ),
            React.createElement(
              C.Row,
              { label: "\u8D26\u53F7\u5957\u9910" },
              planName.length > 0 ? React.createElement(C.Badge, { kind: "ok", text: planName }) : React.createElement(C.Badge, { kind: "muted", text: "\u672A\u77E5" })
            ),
            React.createElement(
              C.Row,
              { label: "PAYGO \u7528\u91CF" },
              React.createElement(
                "span",
                { className: "sp-mono" },
                fmtCount(paygoUsage, paygoLimit) + (paygoRemain !== null ? " \xB7 \u5269\u4F59 " + paygoRemain : "")
              )
            ),
            React.createElement(C.Meter, { pct: bindPct }),
            effRemain !== null ? React.createElement(
              "p",
              { className: "sp-sub" },
              "\u5B9E\u9645\u53EF\u7528\uFF08\u53D6 Key \u4E0E\u8D26\u53F7\u8F83\u5C0F\u5269\u4F59\uFF09\uFF1A\u5269\u4F59 " + effRemain
            ) : null,
            !keyLimited ? React.createElement(
              "p",
              { className: "sp-hint" },
              "\u8BE5 Key \u672A\u5355\u72EC\u8BBE\u9650\uFF0C\u4E0D\u4EE3\u8868\u65E0\u9650\uFF1A\u4ECD\u53D7\u4E0A\u65B9\u8D26\u53F7\u8BA1\u5212\u603B\u91CF\u7EA6\u675F\u3002"
            ) : null,
            React.createElement(
              "div",
              { className: "sp-break" },
              React.createElement(C.BreakRow, {
                label: "Key search",
                value: fmtCount(asNum(k["search_usage"]), null)
              }),
              React.createElement(C.BreakRow, {
                label: "Key extract",
                value: fmtCount(asNum(k["extract_usage"]), null)
              }),
              React.createElement(C.BreakRow, {
                label: "Key crawl",
                value: fmtCount(asNum(k["crawl_usage"]), null)
              }),
              React.createElement(C.BreakRow, {
                label: "Key map",
                value: fmtCount(asNum(k["map_usage"]), null)
              }),
              React.createElement(C.BreakRow, {
                label: "Key research",
                value: fmtCount(asNum(k["research_usage"]), null)
              })
            ),
            React.createElement("p", { className: "sp-sub" }, "\u8D26\u53F7\u5404\u7AEF\u70B9\u5206\u9879\uFF08\u672C\u8BA1\u8D39\u5468\u671F\uFF09\uFF1A"),
            React.createElement(
              "div",
              { className: "sp-break" },
              React.createElement(C.BreakRow, {
                label: "\u8D26\u53F7 search",
                value: fmtNumber(asNum(a["search_usage"]))
              }),
              React.createElement(C.BreakRow, {
                label: "\u8D26\u53F7 extract",
                value: fmtNumber(asNum(a["extract_usage"]))
              }),
              React.createElement(C.BreakRow, {
                label: "\u8D26\u53F7 crawl",
                value: fmtNumber(asNum(a["crawl_usage"]))
              }),
              React.createElement(C.BreakRow, { label: "\u8D26\u53F7 map", value: fmtNumber(asNum(a["map_usage"])) }),
              React.createElement(C.BreakRow, {
                label: "\u8D26\u53F7 research",
                value: fmtNumber(asNum(a["research_usage"]))
              })
            ),
            React.createElement(
              "div",
              { className: "sp-foot" },
              React.createElement(
                "span",
                { className: "sp-hint" },
                "\u66F4\u65B0\u4E8E " + fmtTime(usage.fetchedAt) + (usage.cached ? " \xB7 \u7F13\u5B58" : " \xB7 \u5B9E\u65F6") + (usage.stale ? " \xB7 \u65E7\u6570\u636E\uFF08\u6700\u65B0\u67E5\u8BE2\u5931\u8D25\uFF09" : "")
              ),
              React.createElement(
                "a",
                { href: provider.homepage, target: "_blank", rel: "noreferrer", className: "sp-hint" },
                "\u5B98\u65B9\u6587\u6863"
              )
            )
          )
        );
      } else {
        rows.push(
          React.createElement(C.Notice, {
            key: "err",
            kind: "err",
            text: "\u7528\u91CF\u8BFB\u53D6\u5931\u8D25\uFF1A" + (usageErr || "\u672A\u77E5\u9519\u8BEF")
          })
        );
      }
      const rateLimit = asStr(usageMeta["rateLimit"]);
      return React.createElement(
        "div",
        { className: "sp-section" },
        React.createElement("div", { className: "sp-sectionHead" }, "\u7528\u91CF\u4E0E\u914D\u989D\uFF08GET /usage\uFF09"),
        React.createElement(
          "div",
          { className: "sp-bar" },
          React.createElement("span", { style: { flex: 1 } }),
          React.createElement(
            P.Button,
            {
              variant: "outline",
              size: "sm",
              disabled: busy !== null || !provider.configured,
              onClick: () => refresh(false)
            },
            busy === "usage" ? "\u8BFB\u53D6\u4E2D\u2026" : "\u5237\u65B0"
          ),
          React.createElement(
            P.Button,
            {
              variant: "outline",
              size: "sm",
              disabled: busy !== null || !provider.configured,
              onClick: () => refresh(true)
            },
            busy === "usage-force" ? "\u5237\u65B0\u4E2D\u2026" : "\u5F3A\u5236\u5237\u65B0"
          )
        ),
        rows,
        usageErr && usage && usage.usage ? React.createElement(C.Notice, { kind: "err", text: "\u6700\u65B0\u67E5\u8BE2\u5931\u8D25\uFF0C\u5DF2\u663E\u793A\u7F13\u5B58\uFF1A" + usageErr }) : null,
        usageErr && !(usage && usage.usage) && provider.configured ? React.createElement(C.Notice, { kind: "err", text: String(usageErr) }) : null,
        React.createElement(
          C.Hint,
          {
            text: "\u9274\u6743\u4E3A Authorization: Bearer <Key>\uFF08\u4E0E /search \u7684 body.api_key \u4E0D\u540C\uFF09\uFF1B401 \u8868\u793A Key \u65E0\u6548\u3001429 \u8868\u793A\u89E6\u53D1\u9650\u6D41" + (rateLimit.length > 0 ? "\uFF08" + rateLimit + "\uFF09" : "") + "\u3002\u8BA1\u8D39\u6309 credits\uFF1Abasic \u641C\u7D22 1/\u6B21\u3001advanced 2/\u6B21\u3002"
          },
          null
        )
      );
    };
  }

  // src/client/providers/index.ts
  function createProviderExtras(React, P, C, bridge) {
    return {
      tavily: createTavilyExtras(React, P, C, bridge)
    };
  }

  // src/client/SearchSection.ts
  function createSearchSection(React, P, bridge) {
    const C = createComponents(React, P);
    const EXTRAS = createProviderExtras(React, P, C, bridge);
    return function SearchSection() {
      const [info, setInfo] = React.useState(null);
      const [config, setConfig] = React.useState(null);
      const [stateErr, setStateErr] = React.useState(null);
      const [saving, setSaving] = React.useState(false);
      const [keyDraft, setKeyDraft] = React.useState("");
      const [keyShown, setKeyShown] = React.useState(false);
      const [busy, setBusy] = React.useState(null);
      const [notice, setNotice] = React.useState(null);
      const [query, setQuery] = React.useState("");
      const [result, setResult] = React.useState(null);
      const applyState = React.useCallback((value) => {
        if (value && value.ok) {
          setInfo(value);
          if (value.config) setConfig(value.config);
          setStateErr(null);
        } else {
          setStateErr(value && value.error || "\u72B6\u6001\u8BFB\u53D6\u5931\u8D25");
        }
      }, []);
      const load = React.useCallback(() => {
        bridge.getState().then((value) => applyState(value)).catch((error) => setStateErr(String(error?.message ?? error)));
      }, [applyState]);
      React.useEffect(() => {
        load();
      }, [load]);
      const saveConfig = React.useCallback((patch, okText) => {
        setSaving(true);
        setNotice(null);
        bridge.saveConfig(patch).then((reply) => {
          setSaving(false);
          if (reply && reply.ok) {
            if (reply.config) setConfig(reply.config);
            setNotice({
              kind: "ok",
              text: okText || "\u641C\u7D22\u884C\u4E3A\u5DF2\u4FDD\u5B58\u5230 settings.yaml\uFF08dshp-search-provider\uFF09\uFF0C\u5373\u65F6\u751F\u6548\u3002"
            });
          } else {
            setNotice({ kind: "err", text: reply && reply.error || "\u4FDD\u5B58\u5931\u8D25" });
          }
        }).catch((error) => {
          setSaving(false);
          setNotice({ kind: "err", text: String(error?.message ?? error) });
        });
      }, []);
      const providers = info && info.providers || [];
      const providerId = config && config.provider || (providers[0] ? providers[0].id : "");
      const focusedProvider = providers.find((p) => p.id === providerId) || (providers.length > 0 ? providers[0] : null);
      const focused = focusedProvider === null ? null : { provider: focusedProvider, block: readBlock(config, focusedProvider.id) };
      const selectedId = info ? info.selectedProviderId ?? null : null;
      const extras = info && info.extras || {};
      const saveKey = () => {
        if (focused === null) return;
        const value = keyDraft.trim();
        if (value.length === 0) {
          setNotice({ kind: "err", text: "\u8BF7\u8F93\u5165 API Key \u540E\u518D\u4FDD\u5B58\u3002" });
          return;
        }
        setBusy("saving");
        setNotice(null);
        bridge.saveKey(focused.provider.credentialRef, value).then((reply) => {
          setBusy(null);
          if (reply && reply.ok) {
            setKeyDraft("");
            setNotice({ kind: "ok", text: "\u5BC6\u94A5\u5DF2\u4FDD\u5B58\u5230\u51ED\u8BC1\u5E93\uFF0C\u641C\u7D22\u5373\u65F6\u751F\u6548\u3002" });
            applyState(reply.state);
          } else {
            setNotice({ kind: "err", text: reply && reply.error || "\u4FDD\u5B58\u5931\u8D25" });
          }
        }).catch((error) => {
          setBusy(null);
          setNotice({ kind: "err", text: String(error?.message ?? error) });
        });
      };
      const clearKey = () => {
        if (focused === null) return;
        setBusy("clearing");
        setNotice(null);
        bridge.clearKey(focused.provider.credentialRef).then((reply) => {
          setBusy(null);
          if (reply && reply.ok) {
            setNotice({ kind: "ok", text: "\u5BC6\u94A5\u5DF2\u4ECE\u51ED\u8BC1\u5E93\u79FB\u9664\u3002" });
            applyState(reply.state);
          } else {
            setNotice({ kind: "err", text: reply && reply.error || "\u6E05\u9664\u5931\u8D25" });
          }
        }).catch((error) => {
          setBusy(null);
          setNotice({ kind: "err", text: String(error?.message ?? error) });
        });
      };
      const runTest = () => {
        if (focused === null) return;
        const q = query.trim();
        if (q.length === 0) {
          setNotice({ kind: "err", text: "\u5148\u8F93\u5165\u4E00\u4E2A\u6D4B\u8BD5\u67E5\u8BE2\u3002" });
          return;
        }
        setBusy("testing");
        setNotice(null);
        setResult(null);
        bridge.runTest(focused.provider.id, q).then((value) => {
          setBusy(null);
          setResult(value || { ok: false, error: "\u65E0\u54CD\u5E94" });
        }).catch((error) => {
          setBusy(null);
          setResult({ ok: false, error: String(error?.message ?? error) });
        });
      };
      const children = [];
      children.push(
        React.createElement(
          "p",
          { className: "sp-intro", key: "intro" },
          focused === null ? "\u7528 AI \u641C\u7D22\u63D0\u4F9B\u65B9\u63A5\u7BA1\u6A21\u578B\u7684 web_search\uFF0C\u66FF\u6362 DeepSeek \u5B98\u65B9\u641C\u7D22\u2014\u2014\u5B98\u65B9\u641C\u7D22\u6BCF\u6B21\u89E6\u53D1\u90FD\u6D88\u8017\u4E00\u8F6E\u6A21\u578B\u8C03\u7528\uFF0C\u7B2C\u4E09\u65B9\u641C\u7D22\u66F4\u4FBF\u5B9C\u3001\u66F4\u5FEB\u3002\u5BC6\u94A5\u5199\u5165\u51ED\u8BC1\u5E93\uFF0C\u4FDD\u5B58\u540E\u7ACB\u5373\u751F\u6548\u3002" : "\u7528 " + focused.provider.label + " \u63A5\u7BA1\u6A21\u578B\u7684 web_search\uFF0C\u66FF\u6362 DeepSeek \u5B98\u65B9\u641C\u7D22\u2014\u2014\u5B98\u65B9\u641C\u7D22\u6BCF\u6B21\u89E6\u53D1\u90FD\u6D88\u8017\u4E00\u8F6E\u6A21\u578B\u8C03\u7528\uFF0C" + focused.provider.label + " \u66F4\u4FBF\u5B9C\u3001\u66F4\u5FEB\u3002\u5BC6\u94A5\u5199\u5165\u51ED\u8BC1\u5E93\uFF0C\u4FDD\u5B58\u540E\u7ACB\u5373\u751F\u6548\uFF1B\u4E0B\u65B9\u53EF\u67E5\u770B\u914D\u989D\u4E0E\u8FDE\u63A5\u6D4B\u8BD5\u3002"
        )
      );
      if (focused !== null && focused.provider.description.length > 0) {
        children.push(React.createElement(C.Hint, { key: "pdesc", text: focused.provider.description }));
      }
      if (stateErr)
        children.push(
          React.createElement(C.Notice, { key: "stateErr", kind: "err", text: "\u72B6\u6001\u8BFB\u53D6\u5931\u8D25\uFF1A" + stateErr })
        );
      if (notice)
        children.push(React.createElement(C.Notice, { key: "notice", kind: notice.kind, text: notice.text }));
      const effective = focused !== null && focused.provider.selected && (selectedId === null || selectedId === focused.provider.id);
      const selectedBadge = focused === null ? React.createElement(C.Badge, { kind: "muted", text: "\u8BFB\u53D6\u4E2D\u2026" }) : effective ? React.createElement(C.Badge, { kind: "ok", text: focused.provider.label + " \xB7 \u5F53\u524D\u751F\u6548" }) : selectedId !== null ? React.createElement(C.Badge, { kind: "warn", text: "patch \u56FA\u5B9A\u4E3A " + selectedId }) : React.createElement(C.Badge, { kind: "warn", text: "\u7B49\u5F85\u63A5\u7BA1" });
      const keyBadge = focused === null ? React.createElement(C.Badge, { kind: "muted", text: "\u8BFB\u53D6\u4E2D\u2026" }) : focused.provider.configured ? React.createElement(C.Badge, {
        kind: "ok",
        text: "\u5DF2\u914D\u7F6E \xB7 " + (focused.provider.source || "\u51ED\u8BC1\u5E93")
      }) : React.createElement(C.Badge, { kind: "warn", text: "\u672A\u914D\u7F6E\u5BC6\u94A5" });
      const statusRows = [
        React.createElement(
          C.Row,
          { label: "\u641C\u7D22\u5F15\u64CE", desc: "\u63A5\u7BA1 web_search \u7684\u63D0\u4F9B\u65B9\u3002", key: "engine" },
          selectedBadge
        ),
        React.createElement(
          C.Row,
          { label: "\u63D0\u4F9B\u65B9 ID", key: "pid" },
          React.createElement("span", { className: "sp-mono" }, focused === null ? "\u2014" : focused.provider.id)
        ),
        React.createElement(
          C.Row,
          { label: "API Key", key: "key" },
          React.createElement(
            "span",
            { className: "sp-mono" },
            focused === null ? "\u2014" : focused.provider.credentialRef
          )
        ),
        React.createElement(C.Row, { label: "\u5BC6\u94A5\u72B6\u6001", key: "keystate" }, keyBadge),
        React.createElement(
          C.Row,
          { label: "\u63A5\u7BA1\u524D", key: "before" },
          React.createElement("span", { className: "sp-hint" }, "DeepSeek \u5B98\u65B9")
        )
      ];
      children.push(React.createElement("div", { className: "sp-section", key: "status" }, statusRows));
      if (info && info.selectionHint) {
        children.push(React.createElement(C.Hint, { key: "selhint", text: info.selectionHint }));
      }
      if (providers.length > 1 && focused !== null) {
        const options = providers.map((p) => ({
          id: p.id,
          label: p.label + (p.selected ? "\uFF08\u5F53\u524D\u751F\u6548\uFF09" : p.configured ? "" : "\uFF08\u672A\u914D\u7F6E\u5BC6\u94A5\uFF09")
        }));
        const current = providers.find((p) => p.id === providerId) || focused.provider;
        children.push(
          React.createElement(
            "div",
            { className: "sp-section", key: "switch" },
            React.createElement("div", { className: "sp-sectionHead" }, "\u4F9B\u5E94\u5546"),
            React.createElement(
              C.Row,
              {
                label: "\u751F\u6548\u63D0\u4F9B\u65B9",
                desc: "\u5207\u6362\u540E\u7ACB\u5373\u89E3\u7ED1\u65E7\u63D0\u4F9B\u65B9\u5E76\u6CE8\u518C\u65B0\u63D0\u4F9B\u65B9\uFF0C\u641C\u7D22\u5373\u65F6\u751F\u6548\uFF08\u65E0\u9700\u91CD\u542F\uFF09\uFF1B\u82E5 profile patch \u56FA\u5B9A\u4E86\u5176\u4ED6 id\uFF0C\u9700\u5148\u5220\u9664 web.searchProvider \u4E00\u884C\u3002"
              },
              React.createElement(C.Select, {
                disabled: saving,
                value: current.id,
                selectedLabel: current.label,
                options,
                onSelect: (id) => {
                  const picked = providers.find((x) => x.id === id);
                  saveConfig(
                    { provider: id },
                    "\u5DF2\u5207\u6362\u63D0\u4F9B\u65B9\u4E3A " + (picked !== void 0 ? picked.label : id) + "\uFF0C\u6CE8\u518C\u5373\u65F6\u751F\u6548"
                  );
                  bridge.getState().then((v) => applyState(v)).catch(() => {
                  });
                }
              })
            )
          )
        );
      }
      if (focused !== null) {
        const keyInput = React.createElement(
          "div",
          { className: "sp-inputWrap" },
          React.createElement(P.IconSearchOutline16, null),
          React.createElement("input", {
            className: "sp-input",
            type: keyShown ? "text" : "password",
            placeholder: "\u7C98\u8D34 " + focused.provider.label + " API Key\uFF08" + focused.provider.credentialRef + "\uFF09",
            value: keyDraft,
            autoComplete: "off",
            onChange: (event) => setKeyDraft(event.target.value),
            onKeyDown: (event) => {
              if (event.key === "Enter") saveKey();
            }
          })
        );
        children.push(
          React.createElement(
            "div",
            { className: "sp-section", key: "creds" },
            React.createElement("div", { className: "sp-sectionHead" }, "\u5BC6\u94A5\u914D\u7F6E"),
            React.createElement(
              "div",
              { className: "sp-bar" },
              keyInput,
              React.createElement(
                P.Button,
                {
                  variant: "outline",
                  size: "sm",
                  disabled: busy !== null,
                  onClick: () => setKeyShown(!keyShown)
                },
                keyShown ? "\u9690\u85CF" : "\u663E\u793A"
              ),
              React.createElement(
                P.Button,
                { variant: "primary", size: "sm", disabled: busy !== null, onClick: saveKey },
                busy === "saving" ? "\u4FDD\u5B58\u4E2D\u2026" : "\u4FDD\u5B58\u5BC6\u94A5"
              )
            ),
            React.createElement(C.Hint, {
              key: "credhint",
              text: "\u5BC6\u94A5\u901A\u8FC7 credentials \u670D\u52A1\u6301\u4E45\u5316\u5230\u51ED\u8BC1\u5E93\uFF08~/.dsh/.credentials.yaml\uFF09\uFF0C\u4E0D\u4F1A\u88AB\u56DE\u663E\uFF1B\u542F\u52A8\u7EC8\u7AEF\u91CC\u5B58\u5728\u540C\u540D\u73AF\u5883\u53D8\u91CF\u65F6\u4EE5\u73AF\u5883\u53D8\u91CF\u4E3A\u51C6\u3002"
            }),
            React.createElement(
              "div",
              { className: "sp-bar", key: "clearbar" },
              React.createElement(
                P.Button,
                {
                  variant: "ghost",
                  size: "sm",
                  disabled: busy !== null || !focused.provider.configured,
                  onClick: clearKey
                },
                "\u6E05\u9664\u5BC6\u94A5"
              )
            )
          )
        );
      }
      if (focused !== null) {
        const maxOptions = [];
        for (let n = 1; n <= 10; n += 1) maxOptions.push({ id: String(n), label: n + " \u6761" });
        const maxValue = String(config && config.maxResults || 5);
        const behaviorRows = [
          React.createElement(
            C.Row,
            { label: "\u9ED8\u8BA4\u7ED3\u679C\u6570", desc: "\u5355\u6B21\u8C03\u7528\u4F20 maxResults \u65F6\u4F18\u5148\u7528\u8C03\u7528\u65B9\u7684\u503C\u3002", key: "max" },
            React.createElement(C.Select, {
              disabled: saving || config === null,
              value: maxValue,
              selectedLabel: maxValue + " \u6761",
              options: maxOptions,
              onSelect: (id) => saveConfig({ maxResults: Number(id) })
            })
          )
        ];
        for (const field of focused.provider.fields) {
          behaviorRows.push(fieldControl(React, C, field, focused, saving || config === null, saveConfig));
        }
        children.push(
          React.createElement(
            "div",
            { className: "sp-section", key: "behavior" },
            React.createElement("div", { className: "sp-sectionHead" }, "\u641C\u7D22\u884C\u4E3A"),
            behaviorRows,
            React.createElement(C.Hint, {
              key: "behint",
              text: "\u6301\u4E45\u5316\u5230 settings.yaml\uFF08dshp-search-provider \u547D\u540D\u7A7A\u95F4\uFF09\uFF0C\u4FDD\u5B58\u5373\u65F6\u751F\u6548\u3002"
            })
          )
        );
      }
      if (focused !== null) {
        const Extra = EXTRAS[focused.provider.id];
        if (Extra !== void 0) {
          const extraMeta = extras[focused.provider.id] || {};
          children.push(
            React.createElement(Extra, {
              key: "extra-" + focused.provider.id,
              provider: focused.provider,
              usageMeta: extraMeta["usageMeta"] || {}
            })
          );
        }
      }
      if (focused !== null) {
        const testInput = React.createElement(
          "div",
          { className: "sp-inputWrap" },
          React.createElement("input", {
            className: "sp-input",
            placeholder: "\u8F93\u5165\u67E5\u8BE2\uFF0C\u4F8B\u5982\uFF1ADeepSeek \u6700\u65B0\u53D1\u5E03",
            value: query,
            onChange: (event) => setQuery(event.target.value),
            onKeyDown: (event) => {
              if (event.key === "Enter") runTest();
            }
          })
        );
        children.push(
          React.createElement(
            "div",
            { className: "sp-section", key: "test" },
            React.createElement("div", { className: "sp-sectionHead" }, "\u8FDE\u63A5\u6D4B\u8BD5"),
            React.createElement(
              "div",
              { className: "sp-bar" },
              testInput,
              React.createElement(
                P.Button,
                { variant: "primary", size: "sm", disabled: busy !== null, onClick: runTest },
                busy === "testing" ? "\u641C\u7D22\u4E2D\u2026" : "\u8FD0\u884C\u6D4B\u8BD5"
              )
            )
          )
        );
      }
      if (result !== null) {
        if (result.ok) {
          const items = [];
          for (const source of result.sources || []) {
            const meta = [source.url].concat(source.publishedAt ? ["\u53D1\u5E03\u4E8E " + source.publishedAt] : []).join(" \xB7 ");
            items.push(
              React.createElement(
                "div",
                { className: "sp-result-item", key: source.url },
                React.createElement(
                  P.Tooltip,
                  { label: source.url, side: "top" },
                  React.createElement(
                    "a",
                    { href: source.url, target: "_blank", rel: "noreferrer" },
                    source.title || source.url
                  )
                ),
                source.snippet ? React.createElement("div", { className: "sp-result-snippet" }, source.snippet) : null,
                React.createElement("div", { className: "sp-result-meta" }, meta)
              )
            );
          }
          children.push(
            React.createElement(
              "div",
              { className: "sp-section", key: "result" },
              React.createElement(
                "div",
                { className: "sp-sectionHead" },
                "\u6D4B\u8BD5\u6210\u529F \xB7 " + (result.sources || []).length + " \u6761\u7ED3\u679C \xB7 " + result.takenMs + " ms"
              ),
              React.createElement("div", { className: "sp-results" }, items)
            )
          );
        } else {
          children.push(
            React.createElement(C.Notice, {
              key: "testerr",
              kind: "err",
              text: "\u6D4B\u8BD5\u5931\u8D25" + (result.takenMs ? "\uFF08" + result.takenMs + " ms\uFF09" : "") + "\uFF1A" + result.error
            })
          );
        }
      }
      return React.createElement("div", { className: "sp-page" }, children);
    };
  }
  function readBlock(config, providerId) {
    const raw = config === null ? void 0 : config[providerId];
    return raw !== null && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
  }
  function fieldControl(React, C, field, focused, disabled, save) {
    const current = focused.block[field.key];
    const desc = field.hint !== void 0 && field.hint.length > 0 ? field.hint : void 0;
    if (field.kind === "select") {
      const options = field.options || [];
      const first = options[0];
      const hit = options.find((o) => o.value === current);
      const value = hit !== void 0 ? hit.value : first !== void 0 ? first.value : "";
      const label = hit !== void 0 ? hit.label : first !== void 0 ? first.label : value;
      return React.createElement(
        C.Row,
        { label: field.label, key: "field-" + field.key, ...desc !== void 0 ? { desc } : {} },
        React.createElement(C.Select, {
          disabled,
          value,
          selectedLabel: label,
          options: options.map((o) => ({ id: o.value, label: o.label })),
          onSelect: (id) => save({ [focused.provider.id]: { [field.key]: id } })
        })
      );
    }
    const text = typeof current === "string" || typeof current === "number" ? String(current) : "";
    const input = React.createElement("input", {
      className: "sp-input",
      type: field.kind === "number" ? "number" : "text",
      placeholder: field.placeholder || "",
      defaultValue: text,
      disabled,
      onBlur: (event) => {
        const raw = String(event.target.value);
        if (raw === text) return;
        if (field.kind === "number") {
          const n = Number(raw);
          if (!Number.isFinite(n)) return;
          save({ [focused.provider.id]: { [field.key]: n } });
          return;
        }
        save({ [focused.provider.id]: { [field.key]: raw } });
      }
    });
    return React.createElement(
      C.Row,
      { label: field.label, key: "field-" + field.key, ...desc !== void 0 ? { desc } : {} },
      React.createElement("div", { className: "sp-inputWrap" }, input)
    );
  }

  // src/client/index.ts
  var PLUGIN_ID = "@dshp/search-provider";
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
        const exportsObj = exportsShim;
        exportsObj.inject = ["slots", "remote", "remote.credentials"];
        exportsObj.apply = function apply(ctx) {
          const slots = ctx.get("slots");
          if (slots === void 0) return;
          const style = document.createElement("style");
          style.setAttribute("data-plugin-css", "dshp-search-provider/settings.css");
          style.textContent = CSS;
          document.head.appendChild(style);
          ctx.effect(() => () => style.remove(), "dshp-search-provider: section styles");
          const bridge = createBridge(ctx.get("remote"));
          const Section = createSearchSection(React, P, bridge);
          slots.inject(
            "settings.section",
            () => slots.register(
              { name: "settings.section", id: "dshp-search-provider", order: 28, label: "AI \u641C\u7D22" },
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
