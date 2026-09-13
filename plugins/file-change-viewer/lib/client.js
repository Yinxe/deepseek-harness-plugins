(function () {
  'use strict';

  // src/client/diff.ts
  var EDIT_TOOL = "edit";
  var WRITE_TOOL = "write";
  var STR_REPLACE_TOOL = "str_replace_editor";
  function isRecord(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }
  function isResultBlock(block) {
    return isRecord(block) && block["kind"] === "tool-result";
  }
  function isErrored(block) {
    return isRecord(block) && block["isError"] === true;
  }
  function readCallHead(block, settled) {
    const source = settled ? isRecord(block) ? block["call"] : null : block;
    if (!isRecord(source)) return null;
    const name = source["name"];
    const argsRaw = source["argsRaw"];
    if (typeof name !== "string" || typeof argsRaw !== "string") return null;
    return { name, argsRaw };
  }
  function readAppliedDiffs(meta) {
    if (!isRecord(meta)) return null;
    const diffs = meta["diffs"];
    if (!Array.isArray(diffs) || diffs.length === 0) return null;
    const out = [];
    for (const hunk of diffs) {
      if (!isRecord(hunk)) return null;
      const path = hunk["path"];
      const oldText = hunk["oldText"];
      const newText = hunk["newText"];
      if (typeof path !== "string") return null;
      if (oldText !== null && typeof oldText !== "string") return null;
      if (typeof newText !== "string") return null;
      out.push({ path, oldText, newText });
    }
    return out;
  }
  function parseArgs(rawArgs) {
    try {
      const value = JSON.parse(rawArgs);
      return isRecord(value) ? value : null;
    } catch {
      return null;
    }
  }
  var SIMPLE_ESCAPES = {
    '"': '"',
    "\\": "\\",
    "/": "/",
    b: "\b",
    f: "\f",
    n: "\n",
    r: "\r",
    t: "	"
  };
  function readJsonString(raw, key) {
    const marker = '"' + key + '"';
    const at = raw.indexOf(marker);
    if (at < 0) return void 0;
    let i = at + marker.length;
    while (i < raw.length && raw[i] !== ":") i += 1;
    if (i >= raw.length) return void 0;
    i += 1;
    while (i < raw.length && (raw[i] === " " || raw[i] === "	" || raw[i] === "\n" || raw[i] === "\r")) i += 1;
    if (raw[i] !== '"') return void 0;
    i += 1;
    let out = "";
    while (i < raw.length) {
      const ch = raw[i];
      if (ch === "\\") {
        const next = raw[i + 1];
        if (next === void 0) break;
        if (next === "u") {
          const hex = raw.slice(i + 2, i + 6);
          if (!/^[0-9a-fA-F]{4}$/.test(hex)) break;
          out += String.fromCharCode(parseInt(hex, 16));
          i += 6;
          continue;
        }
        out += SIMPLE_ESCAPES[next] ?? next;
        i += 2;
        continue;
      }
      if (ch === '"') break;
      out += ch;
      i += 1;
    }
    return out;
  }
  function readIntended(toolName, rawArgs) {
    if (rawArgs === "") return null;
    const args = parseArgs(rawArgs);
    const complete = args !== null;
    const readString = (key) => {
      if (args !== null) {
        const value = args[key];
        if (typeof value === "string") return value;
      }
      return readJsonString(rawArgs, key);
    };
    const path = readString("file_path") ?? readString("path");
    if (path === void 0 || path.trim() === "") return null;
    if (toolName === WRITE_TOOL) {
      const content = readString("content");
      if (content === void 0) return null;
      return { diffs: [{ path, oldText: null, newText: content }], replaceAll: false, complete };
    }
    if (toolName === STR_REPLACE_TOOL) {
      const command = readString("command");
      if (command === "create") {
        const fileText = readString("file_text");
        if (fileText === void 0) return null;
        return { diffs: [{ path, oldText: null, newText: fileText }], replaceAll: false, complete };
      }
      if (command === "str_replace") {
        const oldStr = readString("old_str");
        const newStr = readString("new_str");
        if (oldStr === void 0 || newStr === void 0) return null;
        return {
          diffs: [{ path, oldText: oldStr === "" ? null : oldStr, newText: newStr }],
          replaceAll: false,
          complete
        };
      }
      return null;
    }
    if (toolName !== EDIT_TOOL) return null;
    const oldString = readString("old_string");
    const newString = readString("new_string");
    if (oldString === void 0 || newString === void 0) return null;
    const replaceAll = args !== null && args["replace_all"] === true;
    return {
      diffs: [{ path, oldText: oldString === "" ? null : oldString, newText: newString }],
      replaceAll,
      complete
    };
  }
  function firstLine(text) {
    for (const line of text.split("\n")) {
      if (line.trim() !== "") return line;
    }
    return null;
  }
  function readErrorLine(block) {
    if (!isRecord(block)) return null;
    const content = block["content"];
    if (Array.isArray(content)) {
      const parts = [];
      for (const part of content) {
        if (isRecord(part) && typeof part["text"] === "string") parts.push(part["text"]);
      }
      const line = firstLine(parts.join("\n"));
      if (line !== null) return line;
    }
    const error = block["error"];
    if (isRecord(error)) return String(error["name"]) + ": " + String(error["code"]);
    return null;
  }
  function buildModel(toolName, block) {
    const settled = isResultBlock(block);
    const call = readCallHead(block, settled);
    const name = call !== null && call.name !== "" ? call.name : toolName;
    const rawArgs = call !== null ? call.argsRaw : "";
    const state = settled ? isErrored(block) ? "error" : "ok" : "running";
    const errorText = state === "error" ? readErrorLine(block) : null;
    const meta = isRecord(block) ? block["meta"] : void 0;
    const applied = settled && state === "ok" ? readAppliedDiffs(meta) : null;
    const intended = readIntended(name, rawArgs);
    const diffs = applied ?? intended?.diffs ?? [];
    let badge;
    if (state === "error") badge = "rejected";
    else if (state === "ok") badge = "applied";
    else badge = intended !== null && !intended.complete ? "streaming" : "pending";
    return {
      state,
      diffs,
      badge,
      newFile: diffs.length > 0 && diffs.every((diff) => diff.oldText === null),
      replaceAll: intended?.replaceAll === true,
      errorText,
      parsedArgs: parseArgs(rawArgs),
      rawArgs
    };
  }
  function isWindowsStylePath(path) {
    return /^[A-Za-z]:[\\/]/.test(path) || path.startsWith("\\\\");
  }
  function relativizeToCwd(text, cwd) {
    if (cwd === void 0 || cwd === "") return text;
    const root = cwd.replace(/[/\\]+$/, "");
    if (text.startsWith(root + "/") || text.startsWith(root + "\\")) return text.slice(root.length + 1);
    return text;
  }
  function abbreviateHomePath(path, home) {
    if (home === void 0 || home === "") return path;
    if (isWindowsStylePath(path) || isWindowsStylePath(home)) return path;
    const root = home.replace(/\/+$/, "");
    if (root === "" || root === "/") return path;
    if (path.replace(/\/+$/, "") === root) return "~";
    if (path.startsWith(root + "/")) return "~" + path.slice(root.length);
    return path;
  }
  function displayPath(path, cwd, home) {
    return abbreviateHomePath(relativizeToCwd(path, cwd), home);
  }

  // src/client/FileChangeRow.ts
  var DIFF_MAX_LINES = 200;
  var RAW_MAX_CHARS = 4e3;
  var BADGE_TEXT = {
    applied: "\u5DF2\u5E94\u7528",
    pending: "\u5F85\u5E94\u7528",
    streaming: "\u751F\u6210\u4E2D",
    rejected: "\u672A\u5E94\u7528"
  };
  var NEW_FILE_TEXT = "\u65B0\u6587\u4EF6";
  var REPLACE_ALL_TEXT = "\u5168\u90E8\u66FF\u6362";
  var RAW_ARGS_LABEL = "\u539F\u59CB\u53C2\u6570";
  var WAITING_TEXT = "\u7B49\u5F85\u53C2\u6570\u2026";
  function createFileChangeRow(React, P) {
    function diffLabels(t) {
      return {
        copy: t("copy"),
        copied: t("copied"),
        collapseAria: t("diff.collapseAria"),
        expandAria: (hidden) => t("diff.expandAria", { count: hidden }),
        collapse: t("collapse"),
        expand: (hidden) => t("diff.expandRest", { count: hidden }),
        files: (count) => t(count === 1 ? "diff.files.one" : "diff.files.other", { count })
      };
    }
    function FileChangeRow(props) {
      const t = typeof props.t === "function" ? props.t : (key) => key;
      const [open, setOpen] = React.useState(true);
      const model = buildModel(props.toolName, props.block);
      const totals = P.diffTotals(model.diffs);
      const first = model.diffs[0];
      const rawPath = first === void 0 ? void 0 : first.path;
      const stopKeyToggle = (event) => {
        if (event.key === "Enter" || event.key === " ") event.stopPropagation();
      };
      const renderPath = () => {
        if (rawPath === void 0) return null;
        const label = displayPath(rawPath, props.cwd, props.home);
        const openFile = props.openFile;
        if (typeof openFile !== "function") {
          return React.createElement("span", { className: "fcv-pathStatic" }, label);
        }
        return React.createElement(
          "button",
          {
            type: "button",
            className: "fcv-path",
            title: rawPath,
            onClick: (event) => {
              event.stopPropagation();
              openFile(rawPath);
            },
            onKeyDown: stopKeyToggle
          },
          React.createElement("span", { className: "fcv-pathText" }, label)
        );
      };
      const badge = (kind, text) => React.createElement("span", { className: "fcv-badge fcv-badge-" + kind }, text);
      const renderInspect = () => {
        const inspect = props.inspect;
        if (typeof inspect !== "function") return null;
        return React.createElement(
          "button",
          {
            type: "button",
            className: "fcv-inspect",
            onClick: (event) => {
              event.stopPropagation();
              inspect();
            },
            onKeyDown: stopKeyToggle
          },
          t("row.inspect")
        );
      };
      const summary = React.createElement(
        "span",
        { className: "fcv-summary" },
        renderPath(),
        model.newFile ? badge("newfile", NEW_FILE_TEXT) : null,
        model.replaceAll ? React.createElement("span", { className: "fcv-replaceAll" }, REPLACE_ALL_TEXT) : null,
        model.diffs.length > 0 ? React.createElement("span", { className: "fcv-stat" }, "+" + totals.added + " -" + totals.removed) : null,
        badge(model.badge, BADGE_TEXT[model.badge]),
        renderInspect()
      );
      const fallback = model.parsedArgs !== null ? React.createElement(P.JsonBlock, {
        label: RAW_ARGS_LABEL,
        payload: model.parsedArgs,
        defaultOpen: true,
        truncatedLabel: (total) => "\u5DF2\u622A\u65AD\uFF0C\u5171 " + total + " \u5B57\u7B26"
      }) : React.createElement(
        "div",
        { className: "fcv-muted" },
        model.rawArgs === "" ? WAITING_TEXT : model.rawArgs.slice(0, RAW_MAX_CHARS) + (model.rawArgs.length > RAW_MAX_CHARS ? "\u2026" : "")
      );
      const body = React.createElement(
        "div",
        { className: "fcv-body" },
        model.errorText !== null ? React.createElement("div", { className: "fcv-error" }, model.errorText) : null,
        model.diffs.length > 0 ? React.createElement(P.DiffBlock, {
          diffs: model.diffs,
          labels: diffLabels(t),
          maxLines: DIFF_MAX_LINES,
          className: "fcv-diff"
        }) : fallback
      );
      return React.createElement(
        "div",
        // data-state 是给样式与 scripts/check-client.mjs 的无头断言用的稳定钩子。
        { className: "fcv-card", "data-state": model.state },
        React.createElement(
          P.DisclosureRow,
          {
            rowClassName: "fcv-head",
            leadingClassName: "fcv-leading",
            titleClassName: "fcv-title",
            icon: model.state === "error" ? React.createElement(P.StateDot, { state: "error" }) : React.createElement(P.IconEditOutline16, { size: 14 }),
            title: t(props.toolName === "write" ? "tool.title.write" : "tool.title.edit"),
            open,
            expandable: true,
            expandOnRowClick: true,
            keepContentWhenOpen: true,
            onToggle: () => setOpen(!open),
            collapsedContent: summary
          },
          body
        )
      );
    }
    return FileChangeRow;
  }

  // src/client/styles.ts
  var CSS = `

.fcv-card{margin:4px 0;border:.5px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);border-radius:10px;overflow:hidden}
.fcv-card .fcv-head{display:flex;align-items:center;gap:8px;padding:6px 10px;cursor:pointer}
.fcv-card .fcv-head:hover{background:var(--dsw-alias-interactive-bg-hover)}
.fcv-card .fcv-head:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:-2px}
.fcv-leading{display:inline-flex;align-items:center;flex:none;color:var(--dsw-alias-label-tertiary)}
.fcv-title{flex:none;color:var(--dsw-alias-label-primary);font-size:14px;line-height:22px}
.fcv-summary{display:inline-flex;align-items:center;gap:8px;flex:1;min-width:0}
.fcv-path{display:inline-flex;align-items:center;gap:6px;min-width:0;padding:0;border:none;background:none;color:var(--dsw-alias-label-secondary);font-family:var(--ds-font-family-code);font-size:12px;line-height:18px;cursor:pointer}
.fcv-path:hover{color:var(--dsw-alias-label-primary);text-decoration:underline}
.fcv-pathText{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.fcv-pathStatic{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-secondary);font-family:var(--ds-font-family-code);font-size:12px;line-height:18px}
.fcv-badge{display:inline-flex;align-items:center;flex:none;height:20px;padding:0 8px;border-radius:10px;font-size:11px;font-weight:500;line-height:20px;white-space:nowrap}
.fcv-badge-applied{background:var(--dsw-alias-state-success-tertiary);color:var(--dsw-alias-state-success-primary)}
.fcv-badge-pending,.fcv-badge-streaming{background:var(--dsw-alias-state-warn-tertiary);color:var(--dsw-alias-state-warn-label)}
.fcv-badge-newfile{background:var(--dsw-alias-button-ghost-active-fill);color:var(--dsw-alias-label-caption)}
.fcv-badge-rejected{background:var(--dsw-alias-button-ghost-active-fill);color:var(--dsw-alias-state-error-primary)}
.fcv-replaceAll{color:var(--dsw-alias-label-tertiary);font-size:11px;white-space:nowrap}
.fcv-stat{flex:none;margin-left:auto;color:var(--dsw-alias-label-tertiary);font-family:var(--ds-font-family-code);font-size:12px}
.fcv-inspect{flex:none;padding:0 2px;border:none;background:none;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px;cursor:pointer}
.fcv-inspect:hover{color:var(--dsw-alias-label-primary)}
.fcv-body{border-top:.5px solid var(--dsw-alias-border-l2)}
.fcv-card .fcv-diff{margin:10px 12px}
.fcv-error{margin:0;padding:8px 12px;color:var(--dsw-alias-state-error-primary);font-size:12px;line-height:18px;white-space:pre-wrap;word-break:break-word}
.fcv-muted{margin:0;padding:8px 12px;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px}
.fcv-raw{margin:0;padding:8px 12px;background:var(--dsw-alias-markdown-code-block);color:var(--dsw-alias-label-secondary);font-family:var(--ds-font-family-code);font-size:12px;line-height:18px;white-space:pre-wrap;word-break:break-all}
`;

  // src/client/index.ts
  var PLUGIN_ID = "@dshp/file-change-viewer";
  var CONVERSATION_NS = "conversation";
  var SHADOW_PRIORITY = -1;
  var TOOL_KEYS = ["edit", "write", "str_replace_editor"];
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
        const FileChangeRow = createFileChangeRow(React, P);
        const exportsObj = exportsShim;
        exportsObj.inject = ["slots"];
        exportsObj.apply = function apply(ctx) {
          const slots = ctx.get("slots");
          if (slots === void 0) return;
          try {
            const style = document.createElement("style");
            style.setAttribute("data-plugin-css", "dshp-file-change-viewer/cards.css");
            style.textContent = CSS;
            document.head.appendChild(style);
            ctx.effect(() => () => style.remove(), "dshp-file-change-viewer: card styles");
          } catch (error) {
            console.error("[dshp-file-change-viewer] \u6CE8\u5165\u5361\u7247\u6837\u5F0F\u5931\u8D25\uFF0C\u5DE5\u5177\u5361\u7247\u5C06\u7F3A\u5C11\u8FB9\u6846\u4E0E\u89D2\u6807\u6837\u5F0F\uFF1A", error);
          }
          try {
            ctx.effect(
              () => slots.inject("tool.call.toolview", function* () {
                for (const key of TOOL_KEYS) {
                  try {
                    yield slots.register(
                      { name: "tool.call.toolview", key, locale: CONVERSATION_NS, priority: SHADOW_PRIORITY },
                      FileChangeRow
                    );
                  } catch (error) {
                    console.error(
                      "[dshp-file-change-viewer] \u63A5\u7BA1 " + key + " \u5361\u7247\u5931\u8D25\uFF0C\u8BE5\u5DE5\u5177\u5C06\u6CBF\u7528\u5185\u7F6E\u5361\u7247\uFF1A",
                      error
                    );
                  }
                }
              }),
              "dshp-file-change-viewer: edit/write tool cards"
            );
          } catch (error) {
            console.error(
              "[dshp-file-change-viewer] \u6CE8\u518C\u6587\u4EF6\u4FEE\u6539\u5361\u7247\u5931\u8D25\uFF0Cedit / write \u5C06\u56DE\u843D\u5230\u5185\u7F6E\u5361\u7247\uFF1A",
              error
            );
          }
        };
        return moduleShim.exports;
      }
    });
  }
  register();

})();
