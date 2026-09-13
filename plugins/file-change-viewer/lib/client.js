(function () {
  'use strict';

  // src/shared/patch.ts
  var HUNK_HEADER = /^@@+ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@+(.*)$/;
  function cleanPath(raw) {
    let text = raw.trim();
    const tab = text.indexOf("	");
    if (tab >= 0) text = text.slice(0, tab);
    if (text === "/dev/null") return "";
    if (text.startsWith("a/") || text.startsWith("b/")) text = text.slice(2);
    return text;
  }
  function isHeaderNoise(line) {
    return line.startsWith("diff --git ") || line.startsWith("index ") || line.startsWith("old mode ") || line.startsWith("new mode ") || line.startsWith("similarity index ") || line.startsWith("new file mode ") || line.startsWith("deleted file mode ");
  }
  function parseUnifiedPatch(text, options = {}) {
    const tolerant = options.tolerant === true;
    const raw = text.replace(/\r\n/g, "\n").split("\n");
    const files = [];
    let current = null;
    let hunk = null;
    let pendingOldPath = null;
    let sawOldNull = false;
    let sawNewNull = false;
    let createFlag = false;
    let deleteFlag = false;
    let lastSide = null;
    const closeHunk = () => {
      if (current !== null && hunk !== null) current.hunks.push(hunk);
      hunk = null;
    };
    const closeFile = () => {
      closeHunk();
      if (current !== null) {
        if (current.newPath === null) {
          current.delete = true;
        }
        current.create = current.oldPath === null;
        finalizeFile(current);
        if (current.oldPath === null && !current.delete && !createFlag && !sawOldNull && !tolerant) {
          current.oldPath = current.newPath;
          current.create = false;
        }
        files.push(current);
      }
      current = null;
    };
    for (let index = 0; index < raw.length; index += 1) {
      const line = raw[index];
      if (isHeaderNoise(line)) {
        if (line.startsWith("new file mode ")) createFlag = true;
        if (line.startsWith("deleted file mode ")) deleteFlag = true;
        continue;
      }
      if (line.startsWith("--- ")) {
        closeFile();
        pendingOldPath = cleanPath(line.slice(4));
        sawOldNull = pendingOldPath === "";
        continue;
      }
      if (line.startsWith("+++ ")) {
        const newPath = cleanPath(line.slice(4));
        sawNewNull = newPath === "";
        current = {
          path: newPath !== "" ? newPath : pendingOldPath ?? "",
          oldPath: sawOldNull ? null : pendingOldPath,
          newPath: sawNewNull ? null : newPath,
          create: sawOldNull || createFlag,
          delete: sawNewNull || deleteFlag,
          hunks: [],
          oldText: null,
          newText: "",
          added: 0,
          removed: 0
        };
        lastSide = null;
        continue;
      }
      const header = HUNK_HEADER.exec(line);
      if (header !== null) {
        closeHunk();
        if (current === null) {
          if (tolerant) continue;
          throw new Error(`patch \u7B2C ${index + 1} \u884C\uFF1A\u51FA\u73B0\u4E86 @@ \u5C0F\u8282\uFF0C\u4F46\u5B83\u524D\u9762\u6CA1\u6709 --- / +++ \u6587\u4EF6\u5934`);
        }
        hunk = {
          oldStart: Number(header[1]),
          oldCount: header[2] === void 0 ? 1 : Number(header[2]),
          newStart: Number(header[3]),
          newCount: header[4] === void 0 ? 1 : Number(header[4]),
          heading: (header[5] ?? "").trim(),
          lines: [],
          oldNoNewline: false,
          newNoNewline: false
        };
        continue;
      }
      if (hunk !== null) {
        const marker = line.charAt(0);
        if (line.startsWith("\\")) {
          if (lastSide === "old") hunk.oldNoNewline = true;
          else if (lastSide === "new") hunk.newNoNewline = true;
          continue;
        }
        if (line === "") {
          if (index === raw.length - 1) continue;
          hunk.lines.push({ kind: "ctx", text: "" });
          lastSide = null;
          continue;
        }
        if (marker === " ") {
          hunk.lines.push({ kind: "ctx", text: line.slice(1) });
          lastSide = null;
          continue;
        }
        if (marker === "-") {
          hunk.lines.push({ kind: "del", text: line.slice(1) });
          lastSide = "old";
          continue;
        }
        if (marker === "+") {
          hunk.lines.push({ kind: "add", text: line.slice(1) });
          lastSide = "new";
          continue;
        }
        if (tolerant) {
          continue;
        }
        throw new Error(
          `patch \u7B2C ${index + 1} \u884C\uFF1Ahunk \u91CC\u7684\u884C\u5FC5\u987B\u4EE5\u7A7A\u683C\u3001- \u6216 + \u5F00\u5934\uFF0C\u5B9E\u9645\u662F ${JSON.stringify(line.slice(0, 20))}`
        );
      }
    }
    closeFile();
    return files.filter((file) => file.delete || file.hunks.length > 0);
  }
  function finalizeFile(file) {
    const oldSide = [];
    const newSide = [];
    let added = 0;
    let removed = 0;
    for (const hunk of file.hunks) {
      for (const line of hunk.lines) {
        if (line.kind === "del") {
          oldSide.push(line.text);
          removed += 1;
        } else if (line.kind === "add") {
          newSide.push(line.text);
          added += 1;
        } else {
          oldSide.push(line.text);
          newSide.push(line.text);
        }
      }
    }
    file.oldText = oldSide.length === 0 ? null : oldSide.join("\n");
    file.newText = newSide.join("\n");
    file.added = added;
    file.removed = removed;
  }

  // src/client/diff.ts
  var EDIT_TOOL = "edit";
  var WRITE_TOOL = "write";
  var STR_REPLACE_TOOL = "str_replace_editor";
  var PATCH_TOOL = "patch";
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
      const startLine = hunk["startLine"];
      out.push(
        typeof startLine === "number" && startLine > 0 ? { path, oldText, newText, startLine } : { path, oldText, newText }
      );
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
    if (toolName === PATCH_TOOL) {
      const text = readString("patch");
      if (text === void 0 || text.trim() === "") return null;
      const files = parseUnifiedPatch(text, { tolerant: true });
      const diffs = files.map((file) => ({
        path: file.path,
        oldText: file.oldText,
        newText: file.newText
      }));
      if (diffs.length === 0) return null;
      return { diffs, replaceAll: false, complete };
    }
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
  function changedDiffOf(raw, rows) {
    const dels = [];
    const adds = [];
    for (const row of rows) {
      if (row.kind === "del") dels.push(row.text);
      else if (row.kind === "add") adds.push(row.text);
    }
    return {
      path: raw.path,
      oldText: dels.length === 0 ? null : dels.join("\n"),
      newText: adds.join("\n")
    };
  }
  function hasChange(hunk) {
    return hunk.changed.oldText !== null || hunk.changed.newText !== "";
  }
  var DIFF_CELL_LIMIT = 16e4;
  var DIFF_LINE_LIMIT = 4e3;
  function splitLines(text) {
    if (text === "") return [];
    const body = text.endsWith("\n") ? text.slice(0, -1) : text;
    return body.split("\n");
  }
  function unifiedDiffRows(oldText, newText) {
    const before = splitLines(oldText === null ? "" : oldText);
    const after = splitLines(newText);
    if (before.length === 0) return after.map((text) => ({ kind: "add", text }));
    if (after.length === 0) return before.map((text) => ({ kind: "del", text }));
    const n = before.length;
    const m = after.length;
    const naive = () => [
      ...before.map((text) => ({ kind: "del", text })),
      ...after.map((text) => ({ kind: "add", text }))
    ];
    if (n * m > DIFF_CELL_LIMIT || n + m > DIFF_LINE_LIMIT) return naive();
    const width = m + 1;
    const dp = Array.from({ length: (n + 1) * width }, () => 0);
    for (let i2 = n - 1; i2 >= 0; i2 -= 1) {
      for (let j2 = m - 1; j2 >= 0; j2 -= 1) {
        dp[i2 * width + j2] = before[i2] === after[j2] ? dp[(i2 + 1) * width + (j2 + 1)] + 1 : Math.max(dp[(i2 + 1) * width + j2], dp[i2 * width + (j2 + 1)]);
      }
    }
    const rows = [];
    let i = 0;
    let j = 0;
    while (i < n && j < m) {
      if (before[i] === after[j]) {
        rows.push({ kind: "ctx", text: before[i] });
        i += 1;
        j += 1;
      } else if (dp[(i + 1) * width + j] >= dp[i * width + (j + 1)]) {
        rows.push({ kind: "del", text: before[i] });
        i += 1;
      } else {
        rows.push({ kind: "add", text: after[j] });
        j += 1;
      }
    }
    while (i < n) {
      rows.push({ kind: "del", text: before[i] });
      i += 1;
    }
    while (j < m) {
      rows.push({ kind: "add", text: after[j] });
      j += 1;
    }
    return rows;
  }
  function toDiffText(rows) {
    return rows.map((row) => row.text).join("\n");
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
    const hunks = (applied ?? intended?.diffs ?? []).map((raw) => {
      const rows = unifiedDiffRows(raw.oldText, raw.newText);
      return { raw, rows, changed: changedDiffOf(raw, rows) };
    });
    let badge;
    if (state === "error") badge = "rejected";
    else if (state === "ok") badge = "applied";
    else badge = intended !== null && !intended.complete ? "streaming" : "pending";
    return {
      state,
      hunks,
      badge,
      newFile: hunks.length > 0 && hunks.every((hunk) => hunk.raw.oldText === null),
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

  // src/client/lang.ts
  var LANG_BY_EXTENSION = {
    // C / C++
    c: "c",
    h: "c",
    cc: "cpp",
    cpp: "cpp",
    cxx: "cpp",
    hh: "cpp",
    hpp: "cpp",
    hxx: "cpp",
    // 其它语言
    cs: "csharp",
    go: "go",
    java: "java",
    kt: "kotlin",
    kts: "kotlin",
    lua: "lua",
    php: "php",
    py: "python",
    pyi: "python",
    rb: "ruby",
    rs: "rust",
    swift: "swift",
    // JS 家族：官方只有 typescript 语法，js / jsx / mjs / cjs 一律归到它
    ts: "typescript",
    tsx: "typescript",
    mts: "typescript",
    cts: "typescript",
    js: "typescript",
    jsx: "typescript",
    mjs: "typescript",
    cjs: "typescript",
    // 数据与配置
    json: "json",
    jsonc: "json",
    yml: "yaml",
    yaml: "yaml",
    toml: "toml",
    ini: "ini",
    cfg: "ini",
    conf: "ini",
    properties: "ini",
    // 标记与文档
    md: "markdown",
    markdown: "markdown",
    mdx: "mdx",
    html: "html",
    htm: "html",
    xml: "xml",
    xsl: "xml",
    xslt: "xml",
    svg: "xml",
    plist: "xml",
    // 样式
    css: "css",
    scss: "scss",
    less: "less",
    // 脚本
    sh: "shellscript",
    bash: "shellscript",
    zsh: "shellscript",
    ksh: "shellscript",
    sql: "sql"
  };
  function languageOf(path) {
    if (typeof path !== "string" || path === "") return null;
    const slash = Math.max(path.lastIndexOf("/"), path.lastIndexOf("\\"));
    const base = path.slice(slash + 1);
    const dot = base.lastIndexOf(".");
    if (dot <= 0 || dot === base.length - 1) return null;
    const extension = base.slice(dot + 1).toLowerCase();
    return LANG_BY_EXTENSION[extension] ?? null;
  }

  // src/client/FileChangeRow.ts
  var HIGHLIGHT_MAX_LINES = 400;
  var DIFF_MAX_LINES = 200;
  var RAW_MAX_CHARS = 4e3;
  var RAW_ARGS_LABEL = "\u539F\u59CB\u53C2\u6570";
  var WAITING_TEXT = "\u7B49\u5F85\u53C2\u6570\u2026";
  var OVERFLOW_HINT = "\u5207\u6362\u5230 \xB1 \u5DEE\u5F02\u89C6\u56FE\u53EF\u5C55\u5F00";
  var NEW_FILE_LABEL = "\u65B0\u6587\u4EF6";
  var REPLACE_ALL_LABEL = "\u5168\u90E8\u66FF\u6362";
  var PATCH_TITLE = "\u8865\u4E01";
  var UNAVAILABLE_TEXT = "\u53C2\u6570\u4E0D\u53EF\u7528";
  var ICON_SIZE = 12;
  var FILE_ICON_SIZE = 14;
  var VIEW_GROUP_LABEL = "\u5DEE\u5F02\u5C55\u793A\u65B9\u5F0F";
  var VIEW_HIGHLIGHT_LABEL = "\u9AD8\u4EAE";
  var VIEW_DIFF_LABEL = "\xB1 \u5DEE\u5F02";
  var VIEW_HIGHLIGHT_TITLE = "\u5355\u4EE3\u7801\u5757\u7EDF\u4E00 diff\uFF1A\u6574\u884C\u7EA2\u7EFF\u5E95\u8272 + \u884C\u53F7 + \u8BED\u6CD5\u9AD8\u4EAE";
  var VIEW_DIFF_TITLE = "\u5B98\u65B9 \xB1 \u5DEE\u5F02\u89C6\u56FE\uFF1A\u9010\u884C\u7EA2\u7EFF\u6587\u5B57\uFF0C\u7D27\u51D1\uFF0C\u8D85\u957F\u4E2D\u90E8\u6298\u53E0";
  function tintRules(codeClass, rows, startLine) {
    const rules = [];
    if (startLine > 1) rules.push("." + codeClass + " code{counter-reset:source-line " + (startLine - 1) + "}");
    const del = rangeSelectors(codeClass, rows, "del");
    if (del.length > 0) {
      rules.push(del.join(",") + "{counter-increment:none;background:var(--fcv-del-bg)}");
      rules.push(del.map((selector) => selector + ":before").join(",") + '{content:""}');
    }
    const add = rangeSelectors(codeClass, rows, "add");
    if (add.length > 0) rules.push(add.join(",") + "{background:var(--fcv-add-bg)}");
    return rules.join("\n");
  }
  function rangeSelectors(codeClass, rows, kind) {
    const selectors = [];
    let start = -1;
    for (let i = 0; i <= rows.length; i += 1) {
      const row = rows[i];
      const matches = row !== void 0 && row.kind === kind;
      if (matches && start < 0) start = i;
      if (!matches && start >= 0) {
        const from = start + 1;
        const to = i;
        selectors.push(
          from === to ? "." + codeClass + " code>.line:nth-child(" + from + ")" : "." + codeClass + " code>.line:nth-child(n+" + from + "):nth-child(-n+" + to + ")"
        );
        start = -1;
      }
    }
    return selectors;
  }
  var anonymousCardSeq = 0;
  function cardKeyOf(callId) {
    const cleaned = typeof callId === "string" ? callId.replace(/[^A-Za-z0-9_-]/g, "") : "";
    if (cleaned !== "") return cleaned.slice(0, 40);
    anonymousCardSeq += 1;
    return "anon" + anonymousCardSeq;
  }
  function countLines(text) {
    if (text === "") return 0;
    const body = text.endsWith("\n") ? text.slice(0, -1) : text;
    return body.split("\n").length;
  }
  function createFileChangeRow(React, P, prefsFace, locator) {
    const { usePrefs } = prefsFace;
    const { lineOf: lineOf2, useLines } = locator;
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
    function newUiState(callId) {
      return { callId, row: null, sections: {}, views: {} };
    }
    function FileChangeRow(props) {
      const t = typeof props.t === "function" ? props.t : (key) => key;
      const prefs = usePrefs();
      useLines();
      const [ui, setUi] = React.useState(() => newUiState(props.callId));
      const bound = ui.callId === props.callId ? ui : newUiState(props.callId);
      const patchUi = (fields) => {
        setUi((prev) => {
          const base = prev.callId === props.callId ? prev : newUiState(props.callId);
          return { ...base, ...fields };
        });
      };
      const rowOpen = bound.row === null ? prefs.sectionsOpen : bound.row;
      const model = buildModel(props.toolName, props.block);
      const changed = model.hunks.some(hasChange);
      const statDiffs = changed ? model.hunks.map((hunk) => hunk.changed) : model.hunks.map((hunk) => hunk.raw);
      const totals = P.diffTotals(statDiffs);
      const first = model.hunks[0];
      const rawPath = first === void 0 ? void 0 : first.raw.path;
      const startLines = model.hunks.map((hunk) => {
        if (typeof hunk.raw.startLine === "number" && hunk.raw.startLine > 0) return hunk.raw.startLine;
        const located = lineOf2(hunk.raw.path, hunk.raw.newText, props.cwd);
        return typeof located === "number" && located > 0 ? located : 1;
      });
      const stopKeyToggle = (event) => {
        if (event.key === "Enter" || event.key === " ") event.stopPropagation();
      };
      const renderStat = (added, removed) => React.createElement(
        "span",
        { className: "fcv-stat" },
        React.createElement(
          "span",
          { className: "fcv-statPart fcv-add" },
          React.createElement(P.IconPlusOutline16, { size: ICON_SIZE }),
          String(added)
        ),
        React.createElement(
          "span",
          { className: "fcv-statPart fcv-del" },
          React.createElement(
            "svg",
            { width: ICON_SIZE, height: ICON_SIZE, viewBox: "0 0 16 16", "aria-hidden": true },
            React.createElement("rect", {
              x: 3,
              y: 7.25,
              width: 10,
              height: 1.5,
              rx: 0.75,
              fill: "currentColor"
            })
          ),
          String(removed)
        )
      );
      const renderViewSwitch = (index, current) => {
        const pill = (view, label, icon) => React.createElement(
          P.Pill,
          {
            key: view,
            active: current === view,
            className: "fcv-viewPill",
            title: view === "highlight" ? VIEW_HIGHLIGHT_TITLE : VIEW_DIFF_TITLE,
            onClick: (event) => {
              event.stopPropagation();
              patchUi({ views: { ...bound.views, [index]: view } });
            }
          },
          icon,
          label
        );
        return React.createElement(
          "span",
          { className: "fcv-viewGroup", role: "group", "aria-label": VIEW_GROUP_LABEL },
          pill(
            "highlight",
            VIEW_HIGHLIGHT_LABEL,
            React.createElement(P.IconCodeOutline16, { size: ICON_SIZE })
          ),
          pill("diff", VIEW_DIFF_LABEL, React.createElement(P.IconBranchOutline16, { size: ICON_SIZE }))
        );
      };
      const renderPath = (path, line) => {
        const label = displayPath(path, props.cwd, props.home);
        const openFile = props.openFile;
        if (typeof openFile !== "function") {
          return React.createElement("span", { className: "fcv-summary" }, label);
        }
        return React.createElement(
          "button",
          {
            type: "button",
            className: "fcv-path",
            title: path,
            onClick: (event) => {
              event.stopPropagation();
              if (typeof line === "number" && line > 1) openFile(path, { line });
              else openFile(path);
            },
            onKeyDown: stopKeyToggle
          },
          label
        );
      };
      const unavailableText = model.state === "running" ? WAITING_TEXT : UNAVAILABLE_TEXT;
      const failed = model.state === "error" && model.errorText !== null;
      const summaryChildren = failed ? [React.createElement("span", { className: "fcv-errorSummary" }, model.errorText)] : [
        React.createElement("span", { className: "fcv-sep" }),
        rawPath === void 0 ? React.createElement("span", { className: "fcv-summary" }, unavailableText) : renderPath(rawPath, startLines[0]),
        model.hunks.length > 0 ? renderStat(totals.added, totals.removed) : null,
        model.newFile ? React.createElement("span", { className: "fcv-stat fcv-note" }, NEW_FILE_LABEL) : null,
        model.replaceAll ? React.createElement("span", { className: "fcv-stat fcv-note" }, REPLACE_ALL_LABEL) : null
      ];
      const cardKey = cardKeyOf(props.callId);
      const highlightHunks = model.hunks.map((hunk, index) => {
        const rows = hunk.rows;
        const overflow = rows.length > HIGHLIGHT_MAX_LINES;
        const shown = overflow ? rows.slice(0, HIGHLIGHT_MAX_LINES) : rows;
        const codeClass = "fcv-lines-" + cardKey + "-" + index;
        return {
          rows,
          shown,
          overflow,
          codeClass,
          language: languageOf(hunk.raw.path),
          startLine: startLines[index] ?? 1,
          css: rows.length === 0 ? "" : tintRules(codeClass, shown, startLines[index] ?? 1)
        };
      });
      const tintCss = highlightHunks.map((hunk) => hunk.css).filter((css) => css !== "").join("\n");
      const renderHighlight = (index) => {
        const hunk = highlightHunks[index];
        if (hunk === void 0 || hunk.rows.length === 0) return [];
        return [
          React.createElement(P.CodeBlock, {
            key: "code",
            code: toDiffText(hunk.shown),
            lang: hunk.language === null ? void 0 : hunk.language,
            className: "fcv-code " + hunk.codeClass,
            lineNumbers: true,
            copyLabel: t("copy"),
            copiedLabel: t("copied")
          }),
          hunk.overflow ? React.createElement(
            "div",
            { className: "fcv-muted", key: "overflow" },
            "\u2026 \u5176\u4F59 " + (hunk.rows.length - HIGHLIGHT_MAX_LINES) + " \u884C\u672A\u663E\u793A\uFF08" + OVERFLOW_HINT + "\uFF09"
          ) : null
        ];
      };
      const renderDiff = (index, fallback2) => React.createElement(P.DiffBlock, {
        diffs: [statDiffs[index] ?? fallback2],
        labels: diffLabels(t),
        maxLines: DIFF_MAX_LINES,
        className: "fcv-diff"
      });
      const renderSections = () => {
        const nodes = [];
        const viewOf = (index) => {
          const override = bound.views[index];
          return override === void 0 ? prefs.view : override;
        };
        if (tintCss !== "" && model.hunks.some((_hunk, index) => viewOf(index) === "highlight")) {
          nodes.push(React.createElement("style", { key: "fcv-tint" }, tintCss));
        }
        model.hunks.forEach((hunk, index) => {
          const shown = statDiffs[index] ?? hunk.raw;
          const collapseOverride = bound.sections[index];
          const open = collapseOverride === void 0 ? prefs.sectionsOpen : collapseOverride;
          const view = viewOf(index);
          nodes.push(
            React.createElement(
              "div",
              { className: "fcv-card", key: "card" + index },
              React.createElement(
                P.DisclosureRow,
                {
                  // 卡头就是这一行的 row：文件名作标题、统计与视图切换放右侧，整行仍可点着折叠。
                  rowClassName: "fcv-cardRow",
                  titleClassName: "fcv-cardTitle",
                  // 文件名前挂官方「按文件类型」图标（FileTypeIcon 自己从扩展名判类型）。
                  title: React.createElement(
                    "span",
                    { className: "fcv-cardName" },
                    React.createElement(P.FileTypeIcon, {
                      path: hunk.raw.path,
                      size: FILE_ICON_SIZE,
                      className: "fcv-fileIcon"
                    }),
                    React.createElement(
                      "span",
                      { className: "fcv-cardNameText" },
                      displayPath(hunk.raw.path, props.cwd, props.home)
                    )
                  ),
                  open,
                  expandable: true,
                  expandOnRowClick: true,
                  keepContentWhenOpen: true,
                  onToggle: () => patchUi({ sections: { ...bound.sections, [index]: !open } }),
                  collapsedContent: [
                    // 卡头统计与行头同口径（语义变更），所以卡头数字和它自己的高亮 / ± 视图永远对得上。
                    renderStat(countLines(shown.newText), countLines(shown.oldText ?? "")),
                    renderViewSwitch(index, view)
                  ]
                },
                view === "highlight" ? renderHighlight(index) : renderDiff(index, hunk.raw)
              )
            )
          );
        });
        return nodes;
      };
      const fallback = model.parsedArgs !== null ? React.createElement(P.JsonBlock, {
        label: RAW_ARGS_LABEL,
        payload: model.parsedArgs,
        defaultOpen: true,
        truncatedLabel: (total) => "\u5DF2\u622A\u65AD\uFF0C\u5171 " + total + " \u5B57\u7B26"
      }) : React.createElement(
        "div",
        { className: "fcv-summary" },
        model.rawArgs === "" ? unavailableText : model.rawArgs.slice(0, RAW_MAX_CHARS) + (model.rawArgs.length > RAW_MAX_CHARS ? "\u2026" : "")
      );
      const inspectNode = typeof props.inspect === "function" ? React.createElement(
        "button",
        {
          type: "button",
          className: "fcv-inspect",
          onClick: (event) => {
            event.stopPropagation();
            if (typeof props.inspect === "function") props.inspect();
          },
          onKeyDown: stopKeyToggle
        },
        t("row.inspect")
      ) : null;
      const body = React.createElement(
        "div",
        { className: "fcv-body" },
        model.hunks.length === 0 ? fallback : renderSections(),
        inspectNode
      );
      return React.createElement(
        P.DisclosureRow,
        {
          // 只挂一个类用于「hover 行时显示查看药丸」，不改任何布局/配色（行样式仍全部来自官方默认）。
          className: "fcv-rowRoot",
          rowClassName: "fcv-toolRow",
          icon: model.state === "error" ? React.createElement(P.StateDot, { state: "error" }) : React.createElement(P.IconEditOutline16, { size: 14 }),
          title: props.toolName === "patch" ? PATCH_TITLE : t(props.toolName === "write" ? "tool.title.write" : "tool.title.edit"),
          open: rowOpen,
          expandable: true,
          expandOnRowClick: true,
          keepContentWhenOpen: true,
          onToggle: () => patchUi({ row: !rowOpen }),
          collapsedContent: summaryChildren
        },
        body
      );
    }
    return FileChangeRow;
  }

  // src/client/locate.ts
  var BASE = "/ext/dshp-file-change-viewer/locate";
  var MAX_BATCH = 20;
  var cache = /* @__PURE__ */ new Map();
  var listeners = /* @__PURE__ */ new Set();
  var pending = [];
  var scheduled = false;
  var currentCwd;
  function keyOf(path, newText) {
    return path + "\0" + newText;
  }
  function notify() {
    for (const listener of Array.from(listeners)) {
      try {
        listener();
      } catch {
      }
    }
  }
  async function flush() {
    scheduled = false;
    const batch = pending;
    pending = [];
    if (batch.length === 0) return;
    try {
      const response = await fetch(BASE, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...currentCwd === void 0 ? {} : { cwd: currentCwd },
          items: batch.map((item) => ({ path: item.path, newText: item.newText }))
        })
      });
      const payload = await response.json();
      const lines = Array.isArray(payload?.lines) ? payload.lines : [];
      batch.forEach((item, index) => {
        const value = lines[index];
        cache.set(item.key, typeof value === "number" && value > 0 ? value : null);
      });
    } catch {
      for (const item of batch) cache.set(item.key, null);
    }
    notify();
  }
  function lineOf(path, newText, cwd) {
    if (path === "" || newText === "") return null;
    if (cwd !== void 0) currentCwd = cwd;
    const key = keyOf(path, newText);
    if (cache.has(key)) return cache.get(key) ?? null;
    if (!pending.some((item) => item.key === key) && pending.length < MAX_BATCH) {
      pending.push({ key, path, newText });
      if (!scheduled) {
        scheduled = true;
        setTimeout(() => {
          void flush();
        }, 0);
      }
    }
    return void 0;
  }
  function subscribeLines(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }
  function createLocator(React) {
    function useLines() {
      const [, bump] = React.useState(0);
      React.useEffect(() => {
        const listener = () => bump((tick) => tick + 1);
        return subscribeLines(listener);
      }, []);
      return 0;
    }
    return { lineOf, useLines };
  }

  // src/client/FileChangeViewerSection.ts
  var INTRO = "\u300C\u7F16\u8F91 / \u5199\u5165\u300D\u5DE5\u5177\u884C\u7684\u9ED8\u8BA4\u5F62\u6001\u4E0E\u5DEE\u5F02\u89C6\u56FE\u3002\u8FD9\u91CC\u6539\u7684\u662F\u5168\u5C40\u9ED8\u8BA4\u503C\uFF0C\u7ACB\u5373\u5199\u5165 settings.yaml \u7684 dshp-file-change-viewer \u5206\u8282\uFF0C\u5E76\u53EA\u5F71\u54CD**\u4E4B\u540E\u65B0\u6E32\u67D3**\u7684\u7F16\u8F91 / \u5199\u5165\u884C\uFF1B\u5DF2\u7ECF\u5728\u4F1A\u8BDD\u91CC\u7684\u884C\u4FDD\u6301\u5B83\u5F53\u524D\u7684\u6837\u5B50\uFF0C\u5355\u884C\u3001\u5355\u5757\u968F\u65F6\u53EF\u4EE5\u4E34\u65F6\u70B9\u5F00 / \u6536\u8D77\uFF08\u4E0D\u5199\u56DE\uFF09\u3002";
  var EXPAND_LABEL = "\u7F16\u8F91 / \u5199\u5165\u9ED8\u8BA4\u5C55\u5F00";
  var EXPAND_HINT = "\u5F00\uFF1A\u65B0\u6E32\u67D3\u7684\u7F16\u8F91 / \u5199\u5165\u884C\u76F4\u63A5\u5C55\u5F00\u663E\u793A\u6539\u52A8\uFF1B\u5173\uFF1A\u4E0E\u601D\u8003 / \u8BFB\u53D6\u884C\u4E00\u81F4\uFF0C\u9ED8\u8BA4\u6536\u8D77\u3001\u70B9\u4E00\u4E0B\u624D\u5C55\u5F00\u3002\u53EA\u51B3\u5B9A\u65B0\u6E32\u67D3\u65F6\u7684\u521D\u59CB\u72B6\u6001\uFF0C\u884C\u5185\u6587\u4EF6\u5757\u4E0E\u5355\u5757\u6298\u53E0\u90FD\u53EF\u4E34\u65F6\u70B9\u3002";
  var VIEW_LABEL = "\u5C55\u793A\u65B9\u5F0F";
  var VIEW_HINT = "\u9AD8\u4EAE\uFF1A\u5355\u4E2A\u4EE3\u7801\u5757\u91CC\u653E\u5B8C\u6574\u7EDF\u4E00 diff\uFF08\u6574\u884C\u7EA2\u7EFF + \u884C\u53F7 + \u8BED\u6CD5\u9AD8\u4EAE\uFF09\uFF1B\xB1 \u5DEE\u5F02\uFF1A\u5B98\u65B9\u9010\u884C \xB1 \u89C6\u56FE\uFF0C\u7D27\u51D1\u3001\u8D85\u957F\u4E2D\u90E8\u6298\u53E0\u3002";
  var VIEW_OPTIONS = [
    { id: "highlight", label: "\u9AD8\u4EAE" },
    { id: "diff", label: "\xB1 \u5DEE\u5F02" }
  ];
  function createFileChangeViewerSection(React, P, prefsFace) {
    const { usePrefs, setPref, useSaveState, reload } = prefsFace;
    function Row(props) {
      return React.createElement(
        "div",
        { className: "fcv-settingRow" },
        React.createElement(
          "div",
          { className: "fcv-rowText" },
          React.createElement("div", { className: "fcv-title" }, props.label),
          React.createElement("div", { className: "fcv-desc" }, props.desc)
        ),
        props.children
      );
    }
    function Badge(props) {
      return React.createElement("span", { className: "fcv-badge fcv-badge-" + props.kind }, props.text);
    }
    function Switch(props) {
      return React.createElement(
        "button",
        {
          type: "button",
          role: "switch",
          "aria-checked": props.checked === true,
          "aria-label": props.label,
          className: "fcv-switch" + (props.checked ? " fcv-switchOn" : ""),
          onClick: props.onChange
        },
        React.createElement("span", { className: "fcv-thumb" })
      );
    }
    function Select(props) {
      const [open, setOpen] = React.useState(false);
      const selector = React.createElement(
        "button",
        {
          type: "button",
          className: "fcv-selector",
          "aria-haspopup": "menu",
          "aria-expanded": open,
          onClick: () => setOpen((prev) => !prev)
        },
        React.createElement("span", { className: "fcv-selectorLabel" }, props.selectedLabel),
        React.createElement(P.IconChevronDownOutline14, { className: "fcv-chevron" })
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
    function statusBadge(phase) {
      if (phase === "loading") return React.createElement(Badge, { kind: "muted", text: "\u6B63\u5728\u8BFB\u53D6\u914D\u7F6E\u2026" });
      if (phase === "saving") return React.createElement(Badge, { kind: "muted", text: "\u6B63\u5728\u4FDD\u5B58\u2026" });
      if (phase === "ready") return React.createElement(Badge, { kind: "ok", text: "\u5DF2\u540C\u6B65 settings.yaml" });
      if (phase === "error") return React.createElement(Badge, { kind: "warn", text: "\u672A\u4FDD\u5B58" });
      return null;
    }
    return function FileChangeViewerSection() {
      const prefs = usePrefs();
      const save = useSaveState();
      const picked = VIEW_OPTIONS.filter((option) => option.id === prefs.view)[0];
      const busy = save.phase === "loading" || save.phase === "saving";
      const children = [
        React.createElement("p", { className: "fcv-intro" }, INTRO),
        React.createElement(
          "div",
          { className: "fcv-section" },
          React.createElement("div", { className: "fcv-sectionHead" }, "\u663E\u793A"),
          React.createElement(
            Row,
            { label: VIEW_LABEL, desc: VIEW_HINT },
            React.createElement(Select, {
              value: prefs.view,
              selectedLabel: picked === void 0 ? prefs.view : picked.label,
              options: VIEW_OPTIONS,
              onSelect: (id) => setPref("view", id)
            })
          ),
          React.createElement(
            Row,
            { label: EXPAND_LABEL, desc: EXPAND_HINT },
            React.createElement(Switch, {
              checked: prefs.sectionsOpen,
              label: EXPAND_LABEL,
              onChange: () => setPref("sectionsOpen", !prefs.sectionsOpen)
            })
          )
        ),
        React.createElement(
          "div",
          { className: "fcv-barEnd" },
          statusBadge(save.phase),
          React.createElement(
            P.Button,
            { variant: "outline", size: "sm", disabled: busy, onClick: reload },
            save.phase === "loading" ? "\u8BFB\u53D6\u4E2D\u2026" : "\u91CD\u65B0\u8BFB\u53D6"
          )
        )
      ];
      if (save.phase === "error" && save.error !== null) {
        children.push(React.createElement("p", { className: "fcv-notice fcv-notice-err" }, save.error));
      }
      return React.createElement("div", { className: "fcv-page" }, children);
    };
  }

  // src/client/api.ts
  var BASE2 = "/ext/dshp-file-change-viewer";
  async function fetchState() {
    const response = await fetch(`${BASE2}/state`, { cache: "no-store" });
    return await response.json();
  }
  async function saveConfig(patch) {
    const response = await fetch(`${BASE2}/config`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(patch ?? {})
    });
    return await response.json();
  }

  // src/client/prefs.ts
  var DEFAULT_PREFS = { view: "highlight", sectionsOpen: false };
  function sanitizePrefs(raw) {
    if (raw === null || typeof raw !== "object" || Array.isArray(raw)) return { ...DEFAULT_PREFS };
    const record = raw;
    return {
      view: record["view"] === "diff" ? "diff" : "highlight",
      sectionsOpen: record["sectionsOpen"] === true
    };
  }
  function createPrefs(React) {
    let prefs = { ...DEFAULT_PREFS };
    let phase = "idle";
    let error = null;
    const listeners2 = /* @__PURE__ */ new Set();
    function notify2() {
      for (const listener of Array.from(listeners2)) {
        try {
          listener();
        } catch {
        }
      }
    }
    function messageOf(cause) {
      return String(cause?.message ?? cause);
    }
    function read() {
      phase = "loading";
      error = null;
      notify2();
      fetchState().then((response) => {
        if (response && response.ok) {
          prefs = sanitizePrefs(response.config);
          phase = "ready";
        } else {
          phase = "error";
          error = response && response.error || "\u8BFB\u53D6\u914D\u7F6E\u5931\u8D25";
        }
        notify2();
      }).catch((cause) => {
        phase = "error";
        error = "\u8BFB\u53D6\u914D\u7F6E\u5931\u8D25\uFF1A" + messageOf(cause);
        notify2();
      });
    }
    function write(field, previous) {
      const patch = {};
      if (field === "view") patch.view = prefs.view;
      else patch.sectionsOpen = prefs.sectionsOpen;
      saveConfig(patch).then((response) => {
        if (response && response.ok) {
          prefs = sanitizePrefs(response.config);
          phase = "ready";
          error = null;
        } else {
          prefs = previous;
          phase = "error";
          error = "\u4FDD\u5B58\u5931\u8D25\uFF1A" + (response && response.error || "\u672A\u77E5\u9519\u8BEF");
        }
        notify2();
      }).catch((cause) => {
        prefs = previous;
        phase = "error";
        error = "\u4FDD\u5B58\u5931\u8D25\uFF1A" + messageOf(cause);
        notify2();
      });
    }
    function setPref(field, value) {
      const candidate = sanitizePrefs({ ...prefs, [field]: value });
      if (candidate[field] === prefs[field]) return;
      const previous = prefs;
      prefs = candidate;
      phase = "saving";
      error = null;
      notify2();
      write(field, previous);
    }
    function useSnapshot(pick) {
      const [, bump] = React.useState(0);
      React.useEffect(() => {
        const listener = () => bump((tick) => tick + 1);
        listeners2.add(listener);
        return () => {
          listeners2.delete(listener);
        };
      }, []);
      return pick();
    }
    if (typeof fetch === "function") read();
    return {
      usePrefs: () => useSnapshot(() => prefs),
      useSaveState: () => useSnapshot(() => ({ phase, error })),
      setPref,
      reload: read
    };
  }

  // src/client/styles.ts
  var CSS = `

/* \u2500\u2500 \u2460 \u884C\u5185\u6837\u5F0F\uFF08\u955C\u50CF\u5B98\u65B9 ToolRow.module.css\uFF0C\u7C7B\u540D\u6362\u6210 fcv-\uFF09 \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.fcv-sep{background:var(--dsw-alias-label-caption);border-radius:1px;flex:none;width:2px;height:2px;margin:0 8px}
.fcv-summary{text-overflow:ellipsis;white-space:nowrap;min-width:0;font-size:var(--dsh-content-font-size-secondary,13px);line-height:calc(24px + var(--dsh-content-font-delta,0px));color:var(--dsw-alias-label-tertiary);flex:auto;overflow:hidden}
.fcv-path{text-overflow:ellipsis;white-space:nowrap;min-width:0;font:inherit;text-align:left;font-size:var(--dsh-content-font-size-secondary,13px);line-height:calc(24px + var(--dsh-content-font-delta,0px));color:var(--dsw-alias-label-secondary);text-decoration:underline dotted;text-decoration-color:var(--dsw-alias-label-tertiary);text-underline-offset:3px;text-decoration-thickness:1px;cursor:pointer;background:0 0;border:none;flex:0 auto;margin:0;padding:0;overflow:hidden}
.fcv-path:hover{color:var(--dsw-alias-label-primary);text-decoration-color:currentColor}
.fcv-stat{white-space:nowrap;flex:none;margin-left:10px;font-family:var(--ds-font-family-code);font-size:calc(var(--dsh-content-font-size-secondary,13px) - 2px);transform:translateY(.5px);display:inline-flex;align-items:center;gap:10px}
.fcv-statPart{display:inline-flex;align-items:center;gap:3px}
.fcv-add{color:var(--dsw-alias-state-success-primary)}
.fcv-del{color:var(--dsw-alias-state-error-primary)}
.fcv-note{color:var(--dsw-alias-label-caption)}
.fcv-errorSummary{font-size:var(--dsh-content-font-size-secondary,13px);line-height:calc(24px + var(--dsh-content-font-delta,0px));color:var(--dsw-alias-state-error-primary);text-overflow:ellipsis;white-space:nowrap;min-width:0;overflow:hidden}
.fcv-body{--fcv-del-bg:var(--dsw-alias-interactive-bg-hover-danger);--fcv-add-bg:var(--dsw-alias-state-success-tertiary);flex-direction:column;display:flex}
/* \u5B98\u65B9 Inspect \u836F\u4E38\uFF1A\u9ED8\u8BA4\u900F\u660E\uFF0Chover \u884C\uFF08\u6216\u952E\u76D8\u805A\u7126\uFF09\u65F6\u6D6E\u73B0 */
.fcv-inspect{border:.5px solid var(--dsw-alias-border-l3);corner-shape:round;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-secondary);cursor:pointer;opacity:0;border-radius:999px;align-self:flex-start;align-items:center;gap:4px;margin:4px 0 2px 4px;padding:2px 8px;font-size:11px;line-height:16px;transition:opacity .1s;display:inline-flex}
.fcv-rowRoot:hover .fcv-inspect,.fcv-inspect:focus-visible{opacity:1}
.fcv-inspect:hover{background:var(--dsw-alias-interactive-bg-hover-solid);color:var(--dsw-alias-label-primary)}

/* \u2500\u2500 \u2461 \u5DEE\u5F02\u5361\u7247\uFF1A\u4E00\u4E2A card \u5305\u4F4F\u300C\u5361\u5934 + \u4EE3\u7801\u300D \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
/* \u5361\u5934\u5C31\u662F card \u91CC\u7684\u90A3\u4E00\u884C row\uFF1A\u5DE6\u8FB9\u6298\u53E0\u7BAD\u5934 + \u6587\u4EF6\u540D\uFF0C\u53F3\u8FB9\u589E\u5220\u7EDF\u8BA1 + \u5355\u5757\u89C6\u56FE\u5207\u6362\u3002
   \u5361\u5934\u5E95\u8272\u7528\u5B98\u65B9 banner \u8272\uFF08\u4E0E\u5B98\u65B9\u4EE3\u7801\u5757\u7684 banner \u540C\u8272\uFF09\uFF0C\u4EE3\u7801\u533A\u7528\u5B98\u65B9\u4EE3\u7801\u5757\u5E95\u8272\uFF0C
   \u4E8E\u662F\u6574\u4F53\u770B\u8D77\u6765\u5C31\u662F\u300C\u5B98\u65B9\u4EE3\u7801\u5361\u7247\uFF0C\u53EA\u662F\u628A banner \u6362\u6210\u4E86\u6587\u4EF6\u540D + \u7EDF\u8BA1 + \u63A7\u4EF6\u300D\u3002
   \u5B98\u65B9 CodeBlock \u81EA\u5E26\u7684 banner\uFF08\u8BED\u8A00\u540D + \u590D\u5236\u6309\u94AE\uFF09\u7EE7\u7EED\u9690\u85CF\uFF1B\u5B83\u81EA\u5DF1\u7684\u5E95\u8272/\u5706\u89D2/\u5185\u8FB9\u8DDD\u4E5F\u7EE7\u7EED
   \u6E05\u6389\u2014\u2014\u76D2\u5B50\u7531\u672C\u63D2\u4EF6\u7684 .fcv-card \u63D0\u4F9B\uFF0C\u907F\u514D\u5957\u4E24\u5C42\u5361\u7247\u3002
   \u9009\u62E9\u5668\u4E00\u5F8B\u5E26 .fcv-card \u4E24\u7EA7\uFF080,2,x\uFF09\uFF0C\u65E2\u80FD\u538B\u8FC7\u5B98\u65B9\u540C\u7EA7\u89C4\u5219\uFF0C\u53C8\u4E0D\u4F9D\u8D56\u6837\u5F0F\u6CE8\u5165\u987A\u5E8F\u3002 */
.fcv-card{border:.5px solid var(--dsw-alias-border-l2);border-radius:12px;background:var(--dsw-alias-markdown-code-block);overflow:hidden;margin:6px 0 8px 4px}
.fcv-card .fcv-cardRow{height:auto;min-height:30px;gap:4px;padding:0 10px;background:var(--dsw-alias-markdown-code-block-banner);border-bottom:.5px solid var(--dsw-alias-border-l1)}
.fcv-card .fcv-cardTitle{flex:1;min-width:0;display:inline-flex;align-items:center;font-size:12px;color:var(--dsw-alias-label-secondary)}
.fcv-cardName{display:inline-flex;align-items:center;gap:6px;min-width:0;max-width:100%}
.fcv-cardNameText{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:var(--ds-font-family-code)}
.fcv-fileIcon{flex:none;display:inline-flex;align-items:center}
.fcv-card .fcv-cardRow:hover .fcv-cardTitle{color:var(--dsw-alias-label-primary)}
/* \u5355\u5757\u89C6\u56FE\u5207\u6362\uFF1A\u4E24\u4E2A\u5B98\u65B9 Pill \u7EC4\u6210\u7684\u5C0F\u5206\u6BB5\u63A7\u4EF6\uFF08Pill \u9AD8 24px\uFF0C\u5361\u5934 30px \u521A\u597D\u653E\u5F97\u4E0B\uFF09 */
.fcv-viewGroup{display:inline-flex;align-items:center;gap:4px;flex:none;margin-left:6px}
.fcv-viewPill{height:20px;padding:0 8px;border-radius:10px;font-size:11px;line-height:18px;gap:4px}
.fcv-viewPill svg{flex:none}
/* \u4EE3\u7801\u533A\uFF1A\u53BB\u6389\u5B98\u65B9\u4EE3\u7801\u5757\u81EA\u5DF1\u7684\u5916\u58F3\uFF08\u76D2\u5B50\u7531 .fcv-card \u7ED9\uFF09\uFF0C\u53EA\u5728\u4E0A\u4E0B\u7559\u4E00\u70B9\u5185\u8FB9\u8DDD\u8BA9\u5E95\u8272\u4E0D\u8D34\u8FB9 */
.fcv-card .fcv-code{--dsl-code-block-line-white-space:pre;background:none!important;border-radius:0;margin:0}
.fcv-card .fcv-code>div:has([data-code-block-banner]){display:none}
.fcv-card .fcv-code [data-code-block-banner]{display:none}
.fcv-card .fcv-code pre{background:none!important;padding:8px 0;border-radius:0}
/* \xB1 \u5DEE\u5F02\u89C6\u56FE\u540C\u6837\u644A\u5E73\u8FDB\u8FD9\u5F20\u5361\uFF1A\u53BB\u6389\u5B83\u81EA\u5DF1\u7684\u5916\u8FB9\u8DDD\u4E0E\u5706\u89D2\uFF0C\u5E95\u8272\u4E0E\u5361\u7247\u4E00\u81F4 */
.fcv-card .fcv-diff{margin:0;border-radius:0}
.fcv-muted{margin:0;padding:6px 10px 8px;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px}

/* \u2500\u2500 \u2462 \u8BBE\u7F6E\u8282\u300C\u6587\u4EF6\u4FEE\u6539\u5361\u7247\u300D\uFF08settings.section\uFF09 \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
/* \u7248\u5F0F\u7167\u6284\u5B98\u65B9\u8BBE\u7F6E\u8282\u7684\u300C\u884C\u300D\u89C4\u683C\uFF0C\u503C\u53D6\u81EA\u672C\u4ED3\u6807\u6746 vision-bridge / mcwiki-search\uFF1A\u4E00\u9875
   max-width 720px\uFF0C\u6BCF\u8282\u4E00\u5C0F\u6BB5\u6807\u9898\uFF0C\u884C\u5185\u5DE6\u5217 label 14px + desc 12px\u3001\u53F3\u4FA7\u63A7\u4EF6\uFF0C\u884C\u95F4 .5px \u7EC6\u7EBF\u3002 */
.fcv-page{max-width:720px;color:var(--dsw-alias-label-primary);flex-direction:column;display:flex}
.fcv-intro{color:var(--dsw-alias-label-tertiary);margin:0 0 4px;font-size:14px;line-height:22px}
.fcv-section{flex-direction:column;width:100%;display:flex}
.fcv-sectionHead{color:var(--dsw-alias-label-secondary);font-size:12px;font-weight:500;line-height:18px;padding:14px 0 2px}
/* \u7C7B\u540D\u523B\u610F\u4E0E\u5DE5\u5177\u884C\uFF08fcv-toolRow / fcv-rowRoot\uFF09\u5206\u5F00\uFF1A\u4E24\u5957\u7248\u5F0F\u7684\u540C\u540D\u7C7B\u4F1A\u4E92\u76F8\u4E32\u5473 */
.fcv-settingRow{border-bottom:.5px solid var(--dsw-alias-border-l2);align-items:center;gap:8px;padding:16px 0;display:flex}
.fcv-section .fcv-settingRow:last-child{border-bottom:none}
.fcv-rowText{flex-direction:column;flex:1;gap:4px;min-width:0;padding-right:48px;display:flex}
.fcv-title{color:var(--dsw-alias-label-primary);font-size:14px;font-weight:400;line-height:22px}
.fcv-desc{color:var(--dsw-alias-label-tertiary);font-size:12px;font-weight:400;line-height:18px}
.fcv-barEnd{align-items:center;gap:8px;display:flex;flex-wrap:wrap;padding:12px 0;justify-content:flex-end}
.fcv-notice{margin:0;font-size:12px;line-height:18px}
.fcv-notice-err{color:var(--dsw-alias-state-error-primary)}
.fcv-badge{white-space:nowrap;align-items:center;height:20px;border-radius:10px;padding:0 8px;font-size:11px;font-weight:500;line-height:20px;display:inline-flex}
.fcv-badge-ok{background:var(--dsw-alias-state-success-tertiary);color:var(--dsw-alias-state-success-primary)}
.fcv-badge-warn{background:var(--dsw-alias-state-warn-tertiary);color:var(--dsw-alias-state-warn-label)}
.fcv-badge-muted{background:var(--dsw-alias-button-ghost-active-fill);color:var(--dsw-alias-label-caption)}
/* \u4E0B\u62C9\u80F6\u56CA\uFF08\u5B98\u65B9\u884C\u5185\u9009\u62E9\u5668\u540C\u6B3E\uFF0C\u503C\u7167\u6284\u6807\u6746 vision-bridge \u7684 Select \u6837\u5F0F\uFF09 */
.fcv-selector{background:var(--dsw-alias-bg-module-platform);height:36px;font:inherit;color:var(--dsw-alias-label-primary);cursor:pointer;border:none;border-radius:18px;align-items:center;gap:12px;padding:0 14px;font-size:14px;line-height:22px;display:inline-flex;max-width:100%}
.fcv-selector:hover{background:var(--dsw-alias-interactive-bg-hover)}
.fcv-selector:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}
.fcv-selectorLabel{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.fcv-chevron{flex:none}
/* \u81EA\u7ED8\u5F00\u5173\uFF0836x20 \u80F6\u56CA + 16px \u5706\u70B9\uFF0C\u5B98\u65B9 Switch \u540C\u5C3A\u5BF8\uFF1B\u989C\u8272\u5168\u8D70 token\uFF09 */
.fcv-switch{box-sizing:border-box;background:var(--dsw-alias-border-l3);cursor:pointer;border:0;border-radius:10px;flex:none;width:36px;height:20px;padding:2px;position:relative}
.fcv-switchOn{background:var(--dsw-alias-brand-primary)}
.fcv-switch:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}
.fcv-thumb{background:var(--dsw-alias-label-primary-foreground);border-radius:50%;width:16px;height:16px;transition:transform .12s;display:block}
.fcv-switchOn .fcv-thumb{transform:translate(16px)}
@media (prefers-reduced-motion:reduce){.fcv-thumb{transition:none}}
`;

  // src/client/index.ts
  var PLUGIN_ID = "@dshp/file-change-viewer";
  var CONVERSATION_NS = "conversation";
  var SHADOW_PRIORITY = -1;
  var TOOL_KEYS = ["edit", "write", "str_replace_editor", "patch"];
  var SETTINGS_NS = "dshp-file-change-viewer";
  var SETTINGS_ORDER = 31;
  var SETTINGS_LABEL = "\u6587\u4EF6\u4FEE\u6539\u5361\u7247";
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
        exportsObj.inject = ["slots"];
        exportsObj.apply = function apply(ctx) {
          const slots = ctx.get("slots");
          if (slots === void 0) return;
          const prefsFace = createPrefs(React);
          const locator = createLocator(React);
          const FileChangeRow = createFileChangeRow(React, P, prefsFace, locator);
          const FileChangeViewerSection = createFileChangeViewerSection(React, P, prefsFace);
          try {
            const style = document.createElement("style");
            style.setAttribute("data-plugin-css", "dshp-file-change-viewer/settings.css");
            style.textContent = CSS;
            document.head.appendChild(style);
            ctx.effect(() => () => style.remove(), "dshp-file-change-viewer: styles");
          } catch (error) {
            console.error("[dshp-file-change-viewer] \u6CE8\u5165\u6837\u5F0F\u5931\u8D25\uFF0C\u884C\u5185\u7EDF\u8BA1\u4E0E\u5DEE\u5F02\u5E95\u8272\u4F1A\u7F3A\u5931\uFF1A", error);
          }
          try {
            ctx.effect(
              () => slots.inject(
                "settings.section",
                () => slots.register(
                  { name: "settings.section", id: SETTINGS_NS, order: SETTINGS_ORDER, label: SETTINGS_LABEL },
                  FileChangeViewerSection
                )
              ),
              "dshp-file-change-viewer: settings section"
            );
          } catch (error) {
            console.error(
              "[dshp-file-change-viewer] \u6CE8\u518C\u8BBE\u7F6E\u8282\u5931\u8D25\uFF0C\u4E24\u9879\u504F\u597D\u5C06\u53EA\u80FD\u624B\u6539 settings.yaml\uFF1A",
              error
            );
          }
          try {
            ctx.effect(
              () => slots.inject("tool.call.toolview", function* () {
                for (const key of TOOL_KEYS) {
                  try {
                    yield slots.register(
                      {
                        name: "tool.call.toolview",
                        key,
                        locale: CONVERSATION_NS,
                        priority: SHADOW_PRIORITY
                      },
                      FileChangeRow
                    );
                  } catch (error) {
                    console.error(
                      "[dshp-file-change-viewer] \u63A5\u7BA1 " + key + " \u884C\u5931\u8D25\uFF0C\u8BE5\u5DE5\u5177\u5C06\u6CBF\u7528\u5185\u7F6E\u884C\uFF1A",
                      error
                    );
                  }
                }
              }),
              "dshp-file-change-viewer: edit/write tool cards"
            );
          } catch (error) {
            console.error("[dshp-file-change-viewer] \u6CE8\u518C\u6587\u4EF6\u4FEE\u6539\u884C\u5931\u8D25\uFF0Cedit / write \u5C06\u56DE\u843D\u5230\u5185\u7F6E\u884C\uFF1A", error);
          }
        };
        return moduleShim.exports;
      }
    });
  }
  register();

})();
