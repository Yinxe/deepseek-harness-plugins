(function () {
  'use strict';

  // src/client/styles.ts
  var CSS = `
.mw-page{max-width:720px;color:var(--dsw-alias-label-primary);flex-direction:column;display:flex}
.mw-section{flex-direction:column;width:100%;display:flex}
.mw-sectionHead{color:var(--dsw-alias-label-secondary);font-size:12px;font-weight:500;line-height:18px;padding:14px 0 2px}
.mw-row{border-bottom:.5px solid var(--dsw-alias-border-l2);align-items:center;gap:8px;padding:16px 0;display:flex}
.mw-rowWrap{border-bottom:.5px solid var(--dsw-alias-border-l2);align-items:flex-start;gap:8px;padding:16px 0;display:flex;flex-direction:column}
.mw-section .mw-row:last-child,.mw-section .mw-rowWrap:last-child,.mw-section .mw-bar:last-child{border-bottom:none}
.mw-rowText{flex-direction:column;flex:1;gap:4px;min-width:0;padding-right:48px;display:flex}
.mw-control{align-items:center;gap:8px;display:inline-flex;flex:none}
.mw-unit{color:var(--dsw-alias-label-secondary);font-size:14px;line-height:22px;flex:none}
.mw-title{color:var(--dsw-alias-label-primary);font-size:14px;font-weight:400;line-height:22px}
.mw-desc{color:var(--dsw-alias-label-tertiary);font-size:12px;font-weight:400;line-height:18px}
.mw-intro{color:var(--dsw-alias-label-tertiary);margin:0 0 4px;font-size:14px;line-height:22px}
.mw-mono{font-family:var(--ds-font-family-code)}
.mw-results{flex-direction:column;gap:8px;display:flex;padding:8px 0}
.mw-inputWrap{display:inline-flex;align-items:center;gap:6px;height:32px;padding:0 8px;border:.5px solid var(--dsw-alias-border-l4);border-radius:8px;background:var(--dsw-alias-bg-layer-1);width:100%}
.mw-inputWrap:focus-within{border-color:var(--dsw-alias-brand-primary)}
.mw-input{flex:1;min-width:0;border:none;outline:none;background:transparent;font-size:14px;line-height:22px;color:var(--dsw-alias-label-primary);font-family:inherit}
.mw-input::placeholder{color:var(--dsw-alias-label-dimmed)}
.mw-input:disabled{opacity:.5}
.mw-badge{white-space:nowrap;align-items:center;height:20px;border-radius:10px;padding:0 8px;font-size:11px;font-weight:500;line-height:20px;display:inline-flex}
.mw-badge-ok{background:var(--dsw-alias-state-success-tertiary);color:var(--dsw-alias-state-success-primary)}
.mw-badge-muted{background:var(--dsw-alias-button-ghost-active-fill);color:var(--dsw-alias-label-caption)}
.mw-notice{margin:0;font-size:12px;line-height:18px}
.mw-notice-err{color:var(--dsw-alias-state-error-primary)}
.mw-notice-ok{color:var(--dsw-alias-state-success-primary)}
.mw-hint{font-size:12px;color:var(--dsw-alias-label-tertiary);margin:0;line-height:18px}
.mw-bar{align-items:center;gap:8px;display:flex;flex-wrap:wrap;padding:12px 0;border-bottom:.5px solid var(--dsw-alias-border-l2)}
.mw-barEnd{align-items:center;gap:8px;display:flex;flex-wrap:wrap;padding:12px 0;border-bottom:.5px solid var(--dsw-alias-border-l2);justify-content:flex-end}
.mw-loading{align-items:center;gap:8px;display:flex}
.mw-loadingText{color:var(--dsw-alias-label-tertiary);font-size:13px;line-height:20px}
.mw-result-item{border:.5px solid var(--dsw-alias-border-l4);border-radius:8px;flex-direction:column;gap:4px;padding:10px 12px;display:flex}
.mw-result-item a{color:var(--dsw-alias-state-business-primary);text-decoration:none;font-weight:500}
.mw-result-item a:hover{text-decoration:underline}
.mw-result-snippet{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px;margin-top:4px}
.mw-result-meta{color:var(--dsw-alias-label-tertiary);font-size:12px;margin-top:4px;word-break:break-all}
.mw-codeblock{margin-top:8px}
.mw-codeblock pre{max-height:320px;overflow:auto}
/* /mcwiki \u547D\u4EE4\u5361\u7247\uFF08conversation.chat.commandview \u69FD\u4F4D\uFF1B\u5E03\u5C40only\uFF0C\u989C\u8272\u8D70\u5B98\u65B9 token\uFF09 */
.mw-cmdRoot{width:100%}
.mw-cmdRow{width:100%}
.mw-cmdTitle{font-size:13px}
.mw-cmdSummary{color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.mw-cmdSummaryErr{color:var(--dsw-alias-state-error-primary)}
.mw-cmdBody{font-size:13px;line-height:20px;color:var(--dsw-alias-label-primary);padding:4px 0 8px}
`;

  // src/client/api.ts
  var BASE = "/ext/dshp-mcwiki-search";
  async function fetchState() {
    const r = await fetch(`${BASE}/state`, { cache: "no-store" });
    return await r.json();
  }
  async function saveConfig(patch) {
    const r = await fetch(`${BASE}/config`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(patch ?? {})
    });
    return await r.json();
  }
  async function runTest(value, kind) {
    const r = await fetch(`${BASE}/test`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(
        kind === "page" ? { query: value, title: value, section: "full" } : { query: value, section: "intro" }
      )
    });
    return await r.json();
  }

  // src/client/components.ts
  function createComponents(React, _P) {
    function Badge(props) {
      return React.createElement("span", { className: "mw-badge mw-badge-" + props.kind }, props.text);
    }
    function Row(props) {
      return React.createElement(
        "div",
        { className: "mw-row" },
        React.createElement(
          "div",
          { className: "mw-rowText" },
          React.createElement("div", { className: "mw-title" }, props.label),
          props.desc ? React.createElement("div", { className: "mw-desc" }, props.desc) : null
        ),
        props.children
      );
    }
    return { Badge, Row };
  }

  // src/client/McWikiSection.ts
  function createMcWikiSection(React, P) {
    const { Badge, Row } = createComponents(React);
    function McWikiSettingsSection() {
      const [info, setInfo] = React.useState(null);
      const [cfg, setCfg] = React.useState(null);
      const [cfgBusy, setCfgBusy] = React.useState(false);
      const [stateErr, setStateErr] = React.useState(null);
      const [notice, setNotice] = React.useState(null);
      const [busy, setBusy] = React.useState(null);
      const [query, setQuery] = React.useState("");
      const [result, setResult] = React.useState(null);
      const [title, setTitle] = React.useState("");
      const [pageResult, setPageResult] = React.useState(null);
      const load = React.useCallback(() => {
        fetchState().then((value) => {
          if (value && value.ok) {
            setInfo(value);
            setCfg(value && value.config || null);
            setStateErr(null);
          } else setStateErr(value && value.error || "\u65E0\u6CD5\u8BFB\u53D6\u63D2\u4EF6\u72B6\u6001");
        }).catch((error) => setStateErr(String(error?.message ?? error)));
      }, []);
      React.useEffect(() => {
        load();
      }, [load]);
      const saveCfg = () => {
        if (cfg === null) return;
        setCfgBusy(true);
        setNotice(null);
        saveConfig(cfg).then((value) => {
          setCfgBusy(false);
          if (value && value.ok) {
            setCfg(value.config ?? null);
            setNotice({ kind: "ok", text: "\u914D\u7F6E\u5DF2\u4FDD\u5B58\u5230 settings.yaml\uFF08dshp-mcwiki-search\uFF09\uFF0C\u5373\u65F6\u751F\u6548\u3002" });
            load();
          } else setNotice({ kind: "err", text: value && value.error || "\u4FDD\u5B58\u5931\u8D25" });
        }).catch((error) => {
          setCfgBusy(false);
          setNotice({ kind: "err", text: String(error?.message ?? error) });
        });
      };
      const runSearch = () => {
        const q = query.trim();
        if (q.length === 0) {
          setNotice({ kind: "err", text: "\u5148\u8F93\u5165\u4E00\u4E2A\u6D4B\u8BD5\u67E5\u8BE2\u3002" });
          return;
        }
        setBusy("search");
        setNotice(null);
        setResult(null);
        runTest(q, "search").then((value) => {
          setBusy(null);
          setResult(value || { ok: false, error: "\u65E0\u54CD\u5E94" });
        }).catch((error) => {
          setBusy(null);
          setResult({ ok: false, error: String(error?.message ?? error) });
        });
      };
      const runPage = () => {
        const t = title.trim();
        if (t.length === 0) {
          setNotice({ kind: "err", text: "\u5148\u8F93\u5165\u4E00\u4E2A\u9875\u9762\u6807\u9898\u3002" });
          return;
        }
        setBusy("page");
        setNotice(null);
        setPageResult(null);
        runTest(t, "page").then((value) => {
          setBusy(null);
          setPageResult(value || { ok: false, error: "\u65E0\u54CD\u5E94" });
        }).catch((error) => {
          setBusy(null);
          setPageResult({ ok: false, error: String(error?.message ?? error) });
        });
      };
      const children = [];
      children.push(
        React.createElement(
          "p",
          { className: "mw-intro" },
          "\u76F4\u63A5\u4ECE Minecraft Wiki\uFF08MediaWiki API\uFF09\u67E5\u8BE2\uFF0C\u5E76\u628A\u641C\u7D22\u7ED3\u679C / \u9875\u9762\u5168\u6587\u5B8C\u6574\u8F6C\u6362\u4E3A AI \u53EF\u76F4\u63A5\u9605\u8BFB\u7684\u5E72\u51C0\u6587\u672C\uFF08\u53BB\u6A21\u677F\u3001\u53BB\u5F15\u7528\u3001wikitext\u2192Markdown\uFF09\u3002\u6A21\u578B\u5DE5\u5177\u9ED8\u8BA4\u5B8C\u6574\u8F93\u51FA\u3001\u4E0D\u622A\u65AD\uFF0C\u6240\u6709\u4FE1\u606F\u4E0E\u7EC6\u8282\u90FD\u4F1A\u4FDD\u7559\u3002\u53EF\u7528\u5DE5\u5177\uFF1Amcwiki_search\u3001mcwiki_get_page\u3001mcwiki_random\u3002"
        )
      );
      if (stateErr)
        children.push(
          React.createElement("p", { className: "mw-notice mw-notice-err" }, "\u72B6\u6001\u8BFB\u53D6\u5931\u8D25\uFF1A" + stateErr)
        );
      if (notice)
        children.push(
          React.createElement("p", { className: "mw-notice mw-notice-" + notice.kind }, notice.text)
        );
      const siteBadge = info === null ? React.createElement(Badge, { kind: "muted", text: "\u8BFB\u53D6\u4E2D\u2026" }) : React.createElement(Badge, { kind: "ok", text: "\u4E2D\u6587 Minecraft Wiki" });
      children.push(
        React.createElement(
          "div",
          { className: "mw-section" },
          React.createElement("div", { className: "mw-sectionHead" }, "\u6570\u636E\u6E90"),
          React.createElement(Row, { label: "\u6570\u636E\u6E90", desc: "\u641C\u7D22\u4E0E\u9875\u9762\u6293\u53D6\u7684\u76EE\u6807\u7AD9\u70B9\u3002" }, siteBadge),
          React.createElement(
            Row,
            { label: "\u5BC6\u94A5", desc: "\u65E0\u9700\u6CE8\u518C\uFF0C\u516C\u5F00\u63A5\u53E3\u76F4\u63A5\u8C03\u7528\u3002" },
            React.createElement(Badge, { kind: "ok", text: "\u514D\u8D39\u516C\u5F00 API" })
          ),
          React.createElement(
            Row,
            { label: "\u6A21\u578B\u5DE5\u5177", desc: "\u6CE8\u518C\u7ED9\u6A21\u578B\u7684\u4E09\u4E2A\u67E5\u8BE2\u5DE5\u5177\u3002" },
            React.createElement(
              "span",
              { className: "mw-hint" },
              (info && info.tools || ["mcwiki_search", "mcwiki_get_page", "mcwiki_random"]).join("\u3001")
            )
          )
        )
      );
      const numInput = (key, unit) => React.createElement(
        "span",
        { className: "mw-control" },
        React.createElement(
          "div",
          { className: "mw-inputWrap", style: { width: 96 } },
          React.createElement("input", {
            className: "mw-input",
            style: { textAlign: "right", fontVariantNumeric: "tabular-nums" },
            inputMode: "numeric",
            disabled: cfgBusy || cfg === null,
            value: cfg === null ? "" : String(cfg[key]),
            onChange: (event) => {
              const v = event.target.value;
              setCfg(
                (prev) => prev === null ? prev : { ...prev, [key]: v === "" ? 0 : Number(v) }
              );
            }
          })
        ),
        unit ? React.createElement("span", { className: "mw-unit" }, unit) : null
      );
      children.push(
        React.createElement(
          "div",
          { className: "mw-section" },
          React.createElement("div", { className: "mw-sectionHead" }, "\u914D\u7F6E"),
          React.createElement(
            "p",
            { className: "mw-hint", style: { margin: "2px 0 0" } },
            "\u6301\u4E45\u5316\u5230 settings.yaml\uFF08dshp-mcwiki-search \u547D\u540D\u7A7A\u95F4\uFF09\uFF0C\u4FDD\u5B58\u5373\u65F6\u751F\u6548\u3002\u6570\u636E\u6E90\u56FA\u5B9A\u4E3A\u4E2D\u6587 Minecraft Wiki\uFF08\u4E0D\u53EF\u914D\u7F6E\uFF09\u3002"
          ),
          React.createElement(
            Row,
            { label: "\u8BF7\u6C42\u8D85\u65F6", desc: "\u5355\u6B21\u8BF7\u6C42\u7684\u7B49\u5F85\u4E0A\u9650\uFF0C\u22651000\u3002" },
            numInput("timeoutMs", "ms")
          ),
          React.createElement(
            Row,
            { label: "\u641C\u7D22\u9ED8\u8BA4\u6761\u6570", desc: "mcwiki_search \u6BCF\u9875\u8FD4\u56DE\u7684\u6761\u76EE\u6570\uFF0C\u22651\u3002" },
            numInput("searchMaxResults", "\u6761")
          ),
          React.createElement(
            Row,
            { label: "\u5168\u6587\u4E0A\u9650", desc: "mcwiki_get_page full \u8F93\u51FA\u7684\u5B57\u7B26\u6570\uFF1B0 \u8868\u793A\u5B8C\u6574\u8F93\u51FA\u4E0D\u622A\u65AD\u3002" },
            numInput("maxChars", null)
          ),
          React.createElement(
            Row,
            { label: "\u5F15\u8A00\u4E0A\u9650", desc: "intro \u8F93\u51FA\u7684\u5B57\u7B26\u6570\uFF1B0 \u8868\u793A\u5B8C\u6574\u8F93\u51FA\u4E0D\u622A\u65AD\u3002" },
            numInput("introMaxChars", null)
          ),
          React.createElement(
            "div",
            { className: "mw-barEnd" },
            React.createElement(
              P.Button,
              { variant: "outline", size: "sm", disabled: cfgBusy, onClick: load },
              "\u91CD\u65B0\u8BFB\u53D6"
            ),
            React.createElement(
              P.Button,
              { variant: "primary", size: "sm", disabled: cfgBusy || cfg === null, onClick: saveCfg },
              cfgBusy ? "\u4FDD\u5B58\u4E2D\u2026" : "\u4FDD\u5B58\u914D\u7F6E"
            )
          )
        )
      );
      const searchInput = React.createElement(
        "div",
        { className: "mw-inputWrap" },
        React.createElement(P.IconSearchOutline16, null),
        React.createElement("input", {
          className: "mw-input",
          placeholder: "\u641C\u7D22\uFF0C\u4F8B\u5982\uFF1A\u94BB\u77F3 / \u82E6\u529B\u6015 / Ancient City",
          value: query,
          onChange: (event) => setQuery(event.target.value),
          onKeyDown: (event) => {
            if (event.key === "Enter") runSearch();
          }
        })
      );
      children.push(
        React.createElement(
          "div",
          { className: "mw-section" },
          React.createElement("div", { className: "mw-sectionHead" }, "\u641C\u7D22\u6D4B\u8BD5"),
          React.createElement(
            "p",
            { className: "mw-hint", style: { margin: "2px 0 0" } },
            "\u76F4\u63A5\u770B\u5230\u300C\u8F6C\u6362\u540E\u7684 AI \u53EF\u8BFB\u6458\u8981\u300D\u2014\u2014\u6A21\u578B\u62FF\u5230\u7684\u5C31\u662F\u8FD9\u4E2A\u683C\u5F0F\u3002"
          ),
          React.createElement(
            "div",
            { className: "mw-bar", style: { borderBottom: "none" } },
            searchInput,
            React.createElement(
              P.Button,
              {
                variant: "primary",
                size: "sm",
                disabled: busy !== null,
                onClick: runSearch,
                icon: busy === "search" ? React.createElement(P.IconLoadingOutline16) : void 0
              },
              busy === "search" ? "\u641C\u7D22\u4E2D\u2026" : "\u641C\u7D22\u6D4B\u8BD5"
            )
          )
        )
      );
      if (busy === "search")
        children.push(
          React.createElement(
            "div",
            { className: "mw-loading" },
            React.createElement(P.IconLoadingOutline16, null),
            React.createElement("span", { className: "mw-loadingText" }, "\u6B63\u5728\u8BF7\u6C42 MediaWiki API \u2026")
          )
        );
      if (result !== null) {
        if (result.ok) {
          const items = [];
          for (const item of result.results ?? []) {
            items.push(
              React.createElement(
                "div",
                { className: "mw-result-item", key: item.url },
                React.createElement(
                  P.Tooltip,
                  { label: item.url, side: "top" },
                  React.createElement("a", { href: item.url, target: "_blank", rel: "noreferrer" }, item.title)
                ),
                React.createElement("div", { className: "mw-result-snippet" }, item.snippet),
                React.createElement(
                  "div",
                  { className: "mw-result-meta" },
                  item.url + (item.updated ? " \xB7 \u66F4\u65B0 " + String(item.updated).slice(0, 10) : "")
                )
              )
            );
          }
          children.push(
            React.createElement(
              "div",
              { className: "mw-section" },
              React.createElement(
                "div",
                { className: "mw-sectionHead" },
                "\u641C\u7D22\u6210\u529F \xB7 \u5171 " + (result.totalHits ?? 0) + " \u6761 \xB7 " + (result.takenMs ?? 0) + " ms"
              ),
              React.createElement(
                "div",
                { className: "mw-results" },
                items.length > 0 ? items : React.createElement("span", { className: "mw-hint" }, "\u65E0\u7ED3\u679C")
              )
            )
          );
        } else {
          children.push(
            React.createElement(
              "p",
              { className: "mw-notice mw-notice-err" },
              "\u6D4B\u8BD5\u5931\u8D25" + (result.takenMs ? "\uFF08" + result.takenMs + " ms\uFF09" : "") + "\uFF1A" + result.error
            )
          );
        }
      }
      const pageInput = React.createElement(
        "div",
        { className: "mw-inputWrap" },
        React.createElement("input", {
          className: "mw-input",
          placeholder: "\u9875\u9762\u6807\u9898\uFF0C\u4F8B\u5982\uFF1A\u82E6\u529B\u6015 / Diamond Ore",
          value: title,
          onChange: (event) => setTitle(event.target.value),
          onKeyDown: (event) => {
            if (event.key === "Enter") runPage();
          }
        })
      );
      children.push(
        React.createElement(
          "div",
          { className: "mw-section" },
          React.createElement("div", { className: "mw-sectionHead" }, "\u9875\u9762\u8F6C\u6362\u6D4B\u8BD5"),
          React.createElement(
            "p",
            { className: "mw-hint", style: { margin: "2px 0 0" } },
            "wikitext \u2192 Markdown \u9884\u89C8\uFF08\u6700\u591A 6000 \u5B57\u7B26\uFF09\uFF1B\u6A21\u578B\u5DE5\u5177\u8F93\u51FA\u4E3A\u5B8C\u6574\u5168\u6587\u3002"
          ),
          React.createElement(
            "div",
            { className: "mw-bar", style: { borderBottom: "none" } },
            pageInput,
            React.createElement(
              P.Button,
              {
                variant: "primary",
                size: "sm",
                disabled: busy !== null,
                onClick: runPage,
                icon: busy === "page" ? React.createElement(P.IconLoadingOutline16) : void 0
              },
              busy === "page" ? "\u6293\u53D6\u4E2D\u2026" : "\u9875\u9762\u8F6C\u6362\u6D4B\u8BD5"
            )
          )
        )
      );
      if (busy === "page")
        children.push(
          React.createElement(
            "div",
            { className: "mw-loading" },
            React.createElement(P.IconLoadingOutline16, null),
            React.createElement("span", { className: "mw-loadingText" }, "\u6B63\u5728\u6293\u53D6\u5E76\u8F6C\u6362\u9875\u9762 \u2026")
          )
        );
      if (pageResult !== null) {
        if (pageResult.ok && pageResult.page) {
          children.push(
            React.createElement(
              "div",
              { className: "mw-section" },
              React.createElement(
                "div",
                { className: "mw-sectionHead" },
                pageResult.page.title + "\uFF08" + pageResult.page.section + " \xB7 " + pageResult.page.format + "\uFF09"
              ),
              React.createElement(P.CodeBlock, {
                code: pageResult.page.text,
                lang: "markdown",
                copyLabel: "\u590D\u5236",
                copiedLabel: "\u5DF2\u590D\u5236",
                className: "mw-codeblock"
              }),
              React.createElement(
                "div",
                { className: "mw-hint", style: { marginTop: 6 } },
                "\u6765\u6E90\uFF1A" + pageResult.page.url
              )
            )
          );
        } else {
          children.push(
            React.createElement(
              "p",
              { className: "mw-notice mw-notice-err" },
              "\u9875\u9762\u6293\u53D6\u5931\u8D25\uFF1A" + (pageResult && pageResult.error || "\u672A\u77E5\u9519\u8BEF")
            )
          );
        }
      }
      return React.createElement("div", { className: "mw-page" }, children);
    }
    return McWikiSettingsSection;
  }

  // src/client/CommandCard.ts
  var MD_LABELS = { code: { copyLabel: "\u590D\u5236", copiedLabel: "\u5DF2\u590D\u5236" }, footnotes: "\u811A\u6CE8" };
  function summaryOf(text) {
    return text.split("\n")[0]?.replace(/^#+\s*/, "").replace(/\*\*/g, "").slice(0, 120) ?? "";
  }
  function createMcwikiCommandCard(React, P) {
    const h = React.createElement.bind(React);
    return function McwikiCommandCard(props) {
      const [open, setOpen] = React.useState(false);
      const node = props?.node ?? {};
      const outcome = node.outcome ?? null;
      const text = typeof outcome?.text === "string" ? outcome.text : "";
      const state = outcome === null ? "running" : outcome.kind === "error" ? "error" : "ok";
      const body = text.includes("\n") ? text : null;
      const summary = outcome === null ? "\u6B63\u5728\u67E5\u8BE2 Minecraft Wiki\u2026" : state === "error" ? text : text.length === 0 ? "\u5B8C\u6210" : summaryOf(text);
      return h(
        "div",
        { className: "mw-cmdRoot", "data-state": state },
        h(
          P.DisclosureRow,
          {
            rowClassName: "mw-cmdRow",
            titleClassName: "mw-cmdTitle",
            chevronClassName: "mw-cmdChevron",
            icon: state === "error" ? h(P.StateDot, { state: "error" }) : h(P.IconApiOutline14, null),
            title: "mcwiki",
            open: open && body !== null,
            expandable: body !== null,
            expandOnRowClick: true,
            keepContentWhenOpen: true,
            onToggle: () => setOpen((v) => !v),
            collapsedContent: h(
              "span",
              { className: "mw-cmdSummary" + (state === "error" ? " mw-cmdSummaryErr" : "") },
              summary
            )
          },
          body !== null ? h(
            "div",
            { className: "mw-cmdBody" },
            h(P.MarkdownText, { text, streaming: false, labels: MD_LABELS })
          ) : null
        )
      );
    };
  }

  // src/client/index.ts
  var PLUGIN_ID = "@dshp/mcwiki-search";
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
        const Section = createMcWikiSection(React, P);
        const exportsObj = exportsShim;
        exportsObj.inject = ["slots"];
        exportsObj.apply = function apply(ctx) {
          const slots = ctx.get("slots");
          if (slots === void 0) return;
          const style = document.createElement("style");
          style.setAttribute("data-plugin-css", "dshp-mcwiki-search/settings.css");
          style.textContent = CSS;
          document.head.appendChild(style);
          ctx.effect(() => () => style.remove(), "dshp-mcwiki-search: section styles");
          slots.inject(
            "settings.section",
            () => slots.register(
              { name: "settings.section", id: "dshp-mcwiki-search", order: 26, label: "Minecraft Wiki \u641C\u7D22" },
              Section
            )
          );
          const CommandCard = createMcwikiCommandCard(React, P);
          slots.inject(
            "conversation.chat.commandview",
            () => slots.register({ name: "conversation.chat.commandview", key: "mcwiki" }, CommandCard)
          );
        };
        return moduleShim.exports;
      }
    });
  }
  register();

})();
