(function () {
  'use strict';

  // src/client/styles.ts
  var CSS = `

.sm-page{max-width:860px;color:var(--dsw-alias-label-primary);flex-direction:column;display:flex}
.sm-intro{color:var(--dsw-alias-label-tertiary);margin:0 0 4px;font-size:14px;line-height:22px}
/* \u5DE5\u5177\u680F\uFF1A\u8303\u56F4\u5207\u6362 + \u8BA1\u6570 + \u641C\u7D22 + \u52A8\u4F5C\uFF08ZCode \u6280\u80FD\u9875\u540C\u6B3E\u5E03\u5C40\uFF09 */
.sm-toolbar{align-items:center;gap:10px;display:flex;flex-wrap:wrap;padding:10px 0 12px;border-bottom:.5px solid var(--dsw-alias-border-l2)}
.sm-toolbarSpacer{flex:1;min-width:0}
.sm-count{color:var(--dsw-alias-label-tertiary);font-size:13px;line-height:20px;white-space:nowrap}
.sm-searchW{width:230px}
/* \u7D27\u51D1\u5217\u8868\u884C\uFF1A\u56FE\u6807\u5757 + \u540D\u79F0/\u5355\u884C\u63CF\u8FF0 + \u884C\u5185\u63A7\u4EF6 */
.sm-list{display:flex;flex-direction:column}
.sm-row{border-bottom:.5px solid var(--dsw-alias-border-l2);align-items:center;gap:10px;padding:12px 0;display:flex;flex-wrap:wrap}
.sm-list .sm-row:last-child{border-bottom:none}
.sm-rowText{flex-direction:column;flex:1;gap:2px;min-width:200px;display:flex}
.sm-title{color:var(--dsw-alias-label-primary);font-size:14px;font-weight:400;line-height:22px;display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.sm-line{color:var(--dsw-alias-label-tertiary);font-size:12px;font-weight:400;line-height:18px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.sm-mono{font-family:var(--ds-font-family-code);font-size:13px}
.sm-tile{width:28px;height:28px;border-radius:8px;background:var(--dsw-alias-button-ghost-active-fill);color:var(--dsw-alias-label-secondary);align-items:center;justify-content:center;display:flex;flex:none}
.sm-controls{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-left:auto;justify-content:flex-end}
.sm-ctlLabel{color:var(--dsw-alias-label-tertiary);font-size:11px;display:inline-flex;align-items:center;gap:5px}
.sm-danger{color:var(--dsw-alias-state-error-primary)}
/* \u5F39\u7A97\uFF1A\u539F\u751F Modal \u9ED8\u8BA4 380px\uFF0C\u7F16\u8F91/\u65B0\u5EFA\u9700\u8981\u66F4\u5BBD\uFF08div \u524D\u7F00\u62AC\u9AD8\u4F18\u5148\u7EA7\u538B\u8FC7\u6A21\u5757\u7C7B\uFF09 */
div.sm-wideModal{width:min(760px,94vw)}
/* \u5F39\u7A97\u8868\u5355\uFF08\u539F\u751F Modal \u7684\u5185\u5BB9/\u5E95\u90E8\uFF09 */
.sm-form{display:flex;flex-direction:column;gap:8px}
.sm-fieldLabel{color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:16px}
.sm-surfaceRow{display:flex;align-items:center;gap:16px;flex-wrap:wrap}
.sm-textarea{box-sizing:border-box;border:.5px solid var(--dsw-alias-border-l4);background:var(--dsw-alias-bg-layer-1);font:inherit;color:var(--dsw-alias-label-primary);border-radius:8px;padding:8px 12px;font-size:13px;line-height:20px;outline:none;width:100%;resize:vertical;min-height:64px}
.sm-textarea:focus-visible{border-color:var(--dsw-alias-brand-primary)}
.sm-textarea::placeholder{color:var(--dsw-alias-label-dimmed)}
.sm-textarea:disabled{opacity:.5}
.sm-textareaMono{font-family:var(--ds-font-family-code);font-size:12px;line-height:19px}
.sm-bar{align-items:center;gap:8px;display:flex;flex-wrap:wrap}
/* \u72B6\u6001\u4E0E\u63D0\u793A */
.sm-notice{margin:0;font-size:12px;line-height:18px}
.sm-notice-err{color:var(--dsw-alias-state-error-primary)}
.sm-notice-warn{color:var(--dsw-alias-state-warn-label)}
.sm-notice-ok{color:var(--dsw-alias-state-success-primary)}
.sm-hint{color:var(--dsw-alias-label-tertiary);margin:0;font-size:12px;line-height:18px}
.sm-loading{align-items:center;gap:8px;display:flex}
.sm-loadingText{color:var(--dsw-alias-label-tertiary);font-size:13px;line-height:20px}
.sm-rootPath{color:var(--dsw-alias-label-dimmed);font-family:var(--ds-font-family-code);font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}
.sm-empty{padding:32px 0 24px;display:flex;flex-direction:column;align-items:center;gap:8px}
.sm-emptyTitle{color:var(--dsw-alias-label-secondary);font-size:14px;line-height:22px}
`;

  // src/client/api.ts
  var BASE = "/ext/dshp-skill-manager";
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
  async function fetchSkill(rootId, name) {
    const r = await fetch(`${BASE}/read?root=${encodeURIComponent(rootId)}&name=${encodeURIComponent(name)}`, {
      cache: "no-store"
    });
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
  function createSkill(payload) {
    return postJson("/create", payload);
  }
  function updateSkill(payload) {
    return postJson("/update", payload);
  }
  function toggleSkill(payload) {
    return postJson("/toggle", payload);
  }
  function removeSkill(payload) {
    return postJson("/remove", payload);
  }
  function transferSkill(payload) {
    return postJson("/transfer", payload);
  }

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
        React.createElement("span", { className: "sm-selectorLabel" }, props.selectedLabel),
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
    function ActionMenu(props) {
      const [open, setOpen] = React.useState(false);
      const anchor = React.createElement(
        P.Button,
        {
          variant: "toolbar",
          disabled: props.disabled,
          title: props.title,
          "aria-haspopup": "menu",
          "aria-expanded": open,
          onClick: () => setOpen((v) => !v)
        },
        props.icon !== void 0 ? props.icon : props.text ?? "\u22EF"
      );
      return React.createElement(P.Menu, {
        open,
        onClose: () => setOpen(false),
        items: props.options,
        selectedId: "",
        onSelect: (id) => {
          setOpen(false);
          props.onPick(id);
        },
        align: "end",
        portal: true,
        anchor
      });
    }
    return { Badge, Switch, Selector, ActionMenu };
  }

  // src/client/SkillSection.ts
  var SCOPE_KEY = "dshp-skill-manager.scope";
  var ctxHolder = { current: null };
  var probeState = { sessionId: null, actions: null, clickSessionId: null, pendingDraft: "", pendingDeadline: 0 };
  function createSessionInputProbe(React) {
    return function SkillInputProbe(props) {
      React.useEffect(() => {
        probeState.actions = props?.inputActions ?? null;
        probeState.sessionId = props?.sessionId ?? null;
        if (pendingDraftDue() && probeState.actions && probeState.sessionId !== probeState.clickSessionId) {
          const text = probeState.pendingDraft;
          probeState.pendingDraft = "";
          try {
            probeState.actions.setDraft(text);
          } catch {
          }
        }
      });
      return null;
    };
  }
  function pendingDraftDue() {
    if (!probeState.pendingDraft) return false;
    if (Date.now() > probeState.pendingDeadline) {
      probeState.pendingDraft = "";
      return false;
    }
    return true;
  }
  function basename(p) {
    const parts = (p || "").split("/").filter((x) => x !== "");
    return parts.length > 0 ? parts[parts.length - 1] : p;
  }
  function skillKey(entry) {
    return entry.rootId + "::" + entry.name;
  }
  var CREATE_BODY_TEMPLATE = "# \u6280\u80FD\u540D\n\n## \u4EC0\u4E48\u65F6\u5019\u7528\n\n- \n\n## \u6B65\u9AA4\n\n1. \n";
  var SKILL_NAME_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  function copyToClipboard(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).catch(() => legacyCopy(text));
        return;
      }
    } catch {
    }
    legacyCopy(text);
  }
  function legacyCopy(text) {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    } catch {
    }
  }
  function createSkillSection(React, P) {
    const { Badge, Switch, Selector, ActionMenu } = createComponents(React, P);
    function SkillSection() {
      const [state, setState] = React.useState(null);
      const [loading, setLoading] = React.useState(true);
      const [saving, setSaving] = React.useState(false);
      const [error, setError] = React.useState("");
      const [notice, setNotice] = React.useState("");
      const [scope, setScope] = React.useState("global");
      const [query, setQuery] = React.useState("");
      const [installOpen, setInstallOpen] = React.useState(false);
      const [extraRootOpen, setExtraRootOpen] = React.useState(false);
      const [editing, setEditing] = React.useState("");
      const [editDraft, setEditDraft] = React.useState(
        null
      );
      const [editInfo, setEditInfo] = React.useState(null);
      const [editNameDraft, setEditNameDraft] = React.useState("");
      const [creating, setCreating] = React.useState(false);
      const [createDraft, setCreateDraft] = React.useState({
        toScope: "global",
        toSuffix: "agents",
        name: "",
        kind: "bundle",
        description: "",
        whenToUse: "",
        body: CREATE_BODY_TEMPLATE
      });
      const [confirmTarget, setConfirmTarget] = React.useState(null);
      const [moveState, setMoveState] = React.useState(
        null
      );
      const [wsRootDraft, setWsRootDraft] = React.useState("");
      function flash(msg) {
        setNotice(msg);
        try {
          window.setTimeout(() => setNotice((cur) => cur === msg ? "" : cur), 4e3);
        } catch {
        }
      }
      function adoptState(next) {
        setState(next);
        setWsRootDraft(next.workspaceRoot || "");
        if (next.workspaces.length > 0 && next.workspaces.indexOf(scope) < 0) setScope("global");
      }
      function load() {
        setLoading(true);
        setError("");
        fetchState().then((res) => {
          if (res && res.ok && res.state) {
            let saved = "global";
            try {
              saved = window.localStorage.getItem(SCOPE_KEY) || "global";
            } catch {
            }
            if (saved !== "global" && res.state.workspaces.indexOf(saved) >= 0) setScope(saved);
            adoptState(res.state);
          } else {
            setError(res && res.error || "\u65E0\u6CD5\u8BFB\u53D6\u6280\u80FD\u76EE\u5F55");
          }
          setLoading(false);
        }).catch((e) => {
          setError("\u8BFB\u53D6\u6280\u80FD\u76EE\u5F55\u5931\u8D25\uFF1A" + String(e?.message ?? e));
          setLoading(false);
        });
      }
      React.useEffect(() => {
        load();
      }, []);
      const focusRef = React.useRef(null);
      focusRef.current = () => {
        if (loading || saving || editing || creating || moveState || confirmTarget || extraRootOpen) return;
        fetchState().then((res) => {
          if (res && res.ok && res.state) adoptState(res.state);
        }).catch(() => {
        });
      };
      React.useEffect(() => {
        const onFocus = () => focusRef.current && focusRef.current();
        window.addEventListener("focus", onFocus);
        return () => window.removeEventListener("focus", onFocus);
      }, []);
      function applyResult(res, okMsg) {
        if (res && res.ok && res.state) {
          adoptState(res.state);
          flash(okMsg);
          setSaving(false);
          return true;
        }
        setError("\u64CD\u4F5C\u5931\u8D25\uFF1A" + String(res && res.error || "\u672A\u77E5\u9519\u8BEF"));
        setSaving(false);
        return false;
      }
      function run(p, okMsg, after) {
        setSaving(true);
        setError("");
        p.then((res) => {
          const done = applyResult(res, okMsg);
          if (after && done) after();
        }).catch((e) => {
          setError("\u64CD\u4F5C\u5931\u8D25\uFF1A" + String(e?.message ?? e));
          setSaving(false);
        });
      }
      if (loading) {
        return React.createElement(
          "div",
          { className: "sm-page" },
          React.createElement(
            "div",
            { className: "sm-loading" },
            React.createElement(P.IconLoadingOutline16, null),
            React.createElement("span", { className: "sm-loadingText" }, "\u6B63\u5728\u8BFB\u53D6\u6280\u80FD\u76EE\u5F55\u2026")
          )
        );
      }
      const enabled = !!(state && state.enabled);
      const roots = state ? state.roots : [];
      const skills = state ? state.skills : [];
      const isGlobal = scope === "global";
      const scopeRoots = roots.filter(
        (r) => isGlobal ? r.scope === "global" : r.scope === "workspace" && r.workspace === scope
      );
      const scopeSkills = skills.filter(
        (s) => isGlobal ? s.scope === "global" : s.scope === "workspace" && s.workspace === scope
      );
      const q = query.trim().toLowerCase();
      const visibleSkills = q ? scopeSkills.filter(
        (s) => s.name.toLowerCase().indexOf(q) >= 0 || s.description.toLowerCase().indexOf(q) >= 0 || s.whenToUse.toLowerCase().indexOf(q) >= 0
      ) : scopeSkills;
      const disabledCtl = saving || !enabled;
      const skillCreatorReady = skills.some((s) => s.name === "skill-creator" && s.valid);
      function rootOf(scopeKey, suffix) {
        return roots.find(
          (r) => r.id.endsWith("-" + suffix) && (scopeKey === "global" ? r.scope === "global" : r.scope === "workspace" && r.workspace === scopeKey)
        );
      }
      function scopeLabel(scopeKey) {
        return scopeKey === "global" ? "\u5168\u5C40\uFF08\u6240\u6709\u5DE5\u4F5C\u533A\uFF09" : basename(scopeKey);
      }
      const scopeOptions = [{ id: "global", label: "\u5168\u5C40\uFF08\u6240\u6709\u5DE5\u4F5C\u533A\uFF09" }].concat(
        (state ? state.workspaces : []).map((w) => ({ id: w, label: basename(w) }))
      );
      const dirOptions = [
        { id: "agents", label: ".agents/skills\uFF08\u63A8\u8350\uFF09" },
        { id: "dsh", label: ".dsh/skills" }
      ];
      function pickScope(id) {
        setScope(id);
        setQuery("");
        try {
          window.localStorage.setItem(SCOPE_KEY, id);
        } catch {
        }
      }
      function startEdit(entry) {
        if (disabledCtl) return;
        setEditing(skillKey(entry));
        setEditDraft(null);
        setEditInfo(entry);
        setEditNameDraft(entry.name);
        fetchSkill(entry.rootId, entry.name).then((res) => {
          if (res && res.ok && res.entry) {
            const desc = (res.fields || []).find((f) => f.key === "description");
            const when = (res.fields || []).find((f) => f.key === "whenToUse");
            setEditDraft({
              description: desc ? desc.value : res.entry?.description || "",
              whenToUse: when ? when.value : res.entry?.whenToUse || "",
              body: res.body || ""
            });
            setEditInfo(res.entry);
            setEditNameDraft(res.entry.name);
          } else {
            setError("\u8BFB\u53D6\u6280\u80FD\u5931\u8D25\uFF1A" + String(res && res.error || "\u672A\u77E5\u9519\u8BEF"));
            setEditing("");
          }
        }).catch((e) => {
          setError("\u8BFB\u53D6\u6280\u80FD\u5931\u8D25\uFF1A" + String(e?.message ?? e));
          setEditing("");
        });
      }
      async function saveEdit() {
        if (!editDraft || !editInfo || saving) return;
        const target = editInfo;
        const newName = editNameDraft.trim() || target.name;
        setSaving(true);
        setError("");
        try {
          const r1 = await updateSkill({
            rootId: target.rootId,
            name: target.name,
            description: editDraft.description,
            whenToUse: editDraft.whenToUse,
            body: editDraft.body
          });
          if (!r1 || r1.ok !== true) {
            setError("\u4FDD\u5B58\u5931\u8D25\uFF1A" + String(r1 && r1.error || "\u672A\u77E5\u9519\u8BEF"));
            return;
          }
          if (r1.state) adoptState(r1.state);
          if (newName !== target.name) {
            const r2 = await transferSkill({
              fromRootId: target.rootId,
              fromName: target.name,
              toRootId: target.rootId,
              toName: newName,
              deleteSource: true
            });
            if (!r2 || r2.ok !== true) {
              setError("\u5B57\u6BB5\u5DF2\u4FDD\u5B58\uFF0C\u4F46\u6539\u540D\u5931\u8D25\uFF1A" + String(r2 && r2.error || "\u672A\u77E5\u9519\u8BEF"));
              return;
            }
            adoptState(r2.state);
            flash("\u5DF2\u4FDD\u5B58\u5E76\u6539\u540D\u4E3A " + newName);
          } else {
            flash("\u5DF2\u4FDD\u5B58 " + target.name);
          }
          setEditing("");
          setEditDraft(null);
          setEditInfo(null);
        } catch (e) {
          setError("\u4FDD\u5B58\u5931\u8D25\uFF1A" + String(e?.message ?? e));
        } finally {
          setSaving(false);
        }
      }
      function toggle(entry, field) {
        const value = field === "all" ? !(entry.modelInvocable || entry.userInvocable) : field === "model" ? !entry.modelInvocable : !entry.userInvocable;
        run(
          toggleSkill({ rootId: entry.rootId, name: entry.name, field, value }),
          (field === "all" ? value ? "\u5DF2\u542F\u7528 " : "\u5DF2\u7981\u7528 " : "\u5DF2\u66F4\u65B0 ") + entry.name
        );
      }
      function openMove(entry) {
        const defaultScope = entry.scope === "global" ? state && state.workspaces[0] || "global" : "global";
        setMoveState({ entry, toScope: defaultScope, toSuffix: "agents", mode: "copy" });
      }
      function applyMove() {
        const m = moveState;
        if (!m || saving) return;
        const root = rootOf(m.toScope, m.toSuffix);
        if (!root || root.id === m.entry.rootId) return;
        run(
          transferSkill({
            fromRootId: m.entry.rootId,
            fromName: m.entry.name,
            toRootId: root.id,
            deleteSource: m.mode === "move"
          }),
          (m.mode === "move" ? "\u5DF2\u79FB\u52A8 " : "\u5DF2\u590D\u5236 ") + m.entry.name,
          () => setMoveState(null)
        );
      }
      function closeSettingsOverlay() {
        try {
          const area = document.querySelector('[data-slot="sidebar.settings"]');
          if (!area) return;
          const overlay = area.querySelector('[role="presentation"]');
          const mask = overlay?.querySelector('[aria-hidden="true"]') ?? overlay?.firstElementChild ?? null;
          if (mask) mask.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
        } catch {
        }
      }
      function handleNewClick() {
        if (disabledCtl) return;
        if (!skillCreatorReady) {
          setInstallOpen(true);
          return;
        }
        const ws = ctxHolder.current?.get?.("uiWorkspace");
        if (ws && typeof ws.startSession === "function") {
          probeState.clickSessionId = probeState.sessionId;
          probeState.pendingDraft = "/skill-creator";
          probeState.pendingDeadline = Date.now() + 3e4;
          try {
            ws.startSession();
            flash("\u5DF2\u5728\u65B0\u4F1A\u8BDD\u8F93\u5165\u6846\u63D2\u5165 /skill-creator\uFF0C\u53D1\u9001\u5373\u53EF\u5F00\u59CB\u751F\u6210\u6280\u80FD");
            closeSettingsOverlay();
            try {
              window.setTimeout(closeSettingsOverlay, 200);
            } catch {
            }
            return;
          } catch {
            probeState.pendingDraft = "";
          }
        }
        copyToClipboard("/skill-creator");
        flash("\u5DF2\u590D\u5236 /skill-creator\uFF1A\u65B0\u5EFA\u4E00\u4E2A\u4F1A\u8BDD\u5E76\u7C98\u8D34\u53D1\u9001\u5373\u53EF\u5F00\u59CB\u751F\u6210\u6280\u80FD");
      }
      function doRemove() {
        const entry = confirmTarget;
        if (!entry) return;
        setConfirmTarget(null);
        run(removeSkill({ rootId: entry.rootId, name: entry.name }), "\u5DF2\u5220\u9664 " + entry.name, () => {
          if (editing === skillKey(entry)) {
            setEditing("");
            setEditDraft(null);
            setEditInfo(null);
          }
        });
      }
      function submitCreate() {
        const d = createDraft;
        const root = rootOf(d.toScope, d.toSuffix);
        if (!root) {
          setError("\u76EE\u6807\u4F4D\u7F6E\u65E0\u6548\uFF1A\u8BF7\u91CD\u65B0\u9009\u62E9\u4F4D\u7F6E\u4E0E\u76EE\u5F55");
          return;
        }
        run(
          createSkill({
            rootId: root.id,
            name: d.name.trim(),
            description: d.description,
            whenToUse: d.whenToUse,
            body: d.body,
            kind: d.kind
          }),
          "\u5DF2\u521B\u5EFA " + (d.name.trim() || "\u6280\u80FD"),
          () => {
            setCreating(false);
            setCreateDraft({
              toScope: "global",
              toSuffix: "agents",
              name: "",
              kind: "bundle",
              description: "",
              whenToUse: "",
              body: CREATE_BODY_TEMPLATE
            });
          }
        );
      }
      function saveWsRoot() {
        const v = wsRootDraft.trim();
        if (state && v === (state.workspaceRoot || "")) {
          setExtraRootOpen(false);
          return;
        }
        run(
          saveConfig({ workspaceRoot: v }),
          v ? "\u5DF2\u4FDD\u5B58\u5DE5\u4F5C\u533A\u6839\u76EE\u5F55" : "\u5DF2\u6E05\u7A7A\u5DE5\u4F5C\u533A\u6839\u76EE\u5F55",
          () => setExtraRootOpen(false)
        );
      }
      function skillRow(entry) {
        const rootBadge = entry.rootId.endsWith("-dsh") ? ".dsh" : ".agents";
        const titleChildren = [
          React.createElement("span", { key: "n", className: "sm-mono" }, entry.name),
          React.createElement(Badge, { key: "root", kind: "info", text: rootBadge })
        ];
        if (entry.valid) {
          titleChildren.push(
            React.createElement(Badge, {
              key: "kind",
              kind: "muted",
              text: entry.kind === "bundle" ? "\u76EE\u5F55\u5305" : "\u5355\u6587\u4EF6"
            })
          );
          if (entry.shadowedBy) {
            const winner = roots.find((r) => r.id === entry.shadowedBy);
            titleChildren.push(
              React.createElement(Badge, {
                key: "shadow",
                kind: "warn",
                text: "\u88AB " + (winner ? winner.label : entry.shadowedBy) + " \u540C\u540D\u6280\u80FD\u906E\u853D"
              })
            );
          }
        } else {
          titleChildren.push(
            React.createElement(Badge, { key: "bad", kind: "err", text: entry.problem || "\u89E3\u6790\u5931\u8D25" })
          );
        }
        const fullTip = entry.description + (entry.whenToUse ? "\n\u4F55\u65F6\u4F7F\u7528\uFF1A" + entry.whenToUse : "");
        return React.createElement(
          "div",
          { key: skillKey(entry), className: "sm-row" },
          React.createElement("div", { className: "sm-tile" }, React.createElement(P.IconSkillOutline16, null)),
          React.createElement(
            "div",
            { className: "sm-rowText" },
            React.createElement("div", { className: "sm-title" }, titleChildren),
            React.createElement(
              "div",
              { className: "sm-line", title: fullTip },
              entry.valid ? entry.description || "\uFF08\u65E0 description\uFF09" : entry.problem || "\u89E3\u6790\u5931\u8D25"
            )
          ),
          React.createElement(
            "div",
            { className: "sm-controls" },
            React.createElement(Switch, {
              checked: entry.modelInvocable || entry.userInvocable,
              disabled: disabledCtl || !entry.valid,
              label: "\u542F\u7528 / \u7981\u7528 " + entry.name,
              title: "\u542F\u7528 / \u7981\u7528\uFF08\u53EF\u5728\u7F16\u8F91\u5F39\u7A97\u91CC\u5206\u522B\u63A7\u5236\u6A21\u578B\u4E0E\u7528\u6237\u8C03\u7528\u9762\uFF09",
              onChange: () => toggle(entry, "all")
            }),
            React.createElement(
              P.Button,
              {
                variant: "toolbar",
                disabled: disabledCtl,
                title: "\u7F16\u8F91 " + entry.name,
                onClick: () => startEdit(entry)
              },
              React.createElement(P.IconEditOutline16, null)
            ),
            React.createElement(
              P.Button,
              {
                variant: "toolbar",
                disabled: disabledCtl || !entry.valid,
                title: "\u590D\u5236 / \u79FB\u52A8 " + entry.name,
                onClick: () => openMove(entry)
              },
              React.createElement(P.IconCopyOutline16, null)
            ),
            React.createElement(
              P.Button,
              {
                variant: "toolbar",
                className: "sm-danger",
                disabled: disabledCtl,
                title: "\u5220\u9664 " + entry.name,
                onClick: () => setConfirmTarget(entry)
              },
              React.createElement(P.IconTrashOutline16, null)
            )
          )
        );
      }
      function editLive() {
        if (!editInfo) return null;
        return skills.find((s) => s.rootId === editInfo.rootId && s.name === editInfo.name) ?? editInfo;
      }
      function editorModal() {
        const live = editLive();
        const nameOk = SKILL_NAME_RE.test(editNameDraft.trim());
        const nameChanged = editNameDraft.trim() !== "" && editNameDraft.trim() !== (live ? live.name : "");
        return React.createElement(
          P.Modal,
          {
            open: editInfo !== null,
            onClose: () => {
              setEditing("");
              setEditDraft(null);
              setEditInfo(null);
            },
            className: "sm-wideModal",
            title: "\u7F16\u8F91\u6280\u80FD",
            closeLabel: "\u5173\u95ED",
            description: live ? "\u4F4D\u7F6E\uFF1A" + live.entryPath : void 0,
            footer: React.createElement(
              "div",
              { className: "sm-bar" },
              React.createElement(
                P.Button,
                {
                  variant: "primary",
                  disabled: saving || !editDraft || !nameOk,
                  onClick: saveEdit
                },
                nameChanged ? "\u4FDD\u5B58\u5E76\u6539\u540D" : "\u4FDD\u5B58"
              ),
              React.createElement(P.Button, { disabled: saving, onClick: () => setEditInfo(null) }, "\u53D6\u6D88"),
              !nameOk ? React.createElement(
                "span",
                { className: "sm-notice sm-notice-err" },
                "\u6280\u80FD\u540D\u9700\u4E3A\u5C0F\u5199 kebab-case\uFF08\u5B57\u6BCD / \u6570\u5B57 / \u8FDE\u5B57\u7B26\uFF09"
              ) : null
            )
          },
          React.createElement(
            "div",
            { className: "sm-form" },
            !editDraft || !live ? React.createElement(
              "div",
              { className: "sm-loading" },
              React.createElement(P.IconLoadingOutline16, null),
              React.createElement("span", { className: "sm-loadingText" }, "\u6B63\u5728\u8BFB\u53D6\u6280\u80FD\u5168\u6587\u2026")
            ) : [
              React.createElement(
                "div",
                { className: "sm-fieldLabel", key: "ln" },
                "\u6280\u80FD\u540D\uFF08\u5C0F\u5199 kebab-case\uFF1B\u6539\u52A8\u4F1A\u8FDE\u540C\u76EE\u5F55/\u6587\u4EF6\u4E00\u8D77\u6539\u540D\uFF09"
              ),
              React.createElement(P.Input, {
                className: "sm-mono",
                key: "n",
                disabled: saving,
                value: editNameDraft,
                onChange: (e) => setEditNameDraft(e.target.value)
              }),
              React.createElement(
                "div",
                { className: "sm-fieldLabel", key: "ld" },
                "description\uFF08\u76EE\u5F55\u6458\u8981\uFF0C\u6A21\u578B\u68C0\u7D22\u9760\u5B83\uFF1B\u2264500 \u5B57\u7B26\uFF09"
              ),
              React.createElement("textarea", {
                className: "sm-textarea",
                key: "d",
                disabled: saving,
                rows: 3,
                value: editDraft.description,
                onChange: (e) => setEditDraft({ ...editDraft, description: e.target.value })
              }),
              React.createElement(
                "div",
                { className: "sm-fieldLabel", key: "lw" },
                "\u89E6\u53D1\u6761\u4EF6 whenToUse\uFF08\u53EF\u9009\uFF1B\u7559\u7A7A\u5E76\u4FDD\u5B58\u5373\u5220\u9664\u8BE5\u952E\uFF09"
              ),
              React.createElement("textarea", {
                className: "sm-textarea",
                key: "w",
                disabled: saving,
                rows: 2,
                placeholder: "\u4EC0\u4E48\u60C5\u51B5\u4E0B\u5E94\u52A0\u8F7D\u8FD9\u4E2A\u6280\u80FD\uFF0C\u4F8B\u5982\u201C\u7528\u6237\u8981\u6C42 TDD / \u5148\u5199\u6D4B\u8BD5\u65F6\u201D",
                value: editDraft.whenToUse,
                onChange: (e) => setEditDraft({ ...editDraft, whenToUse: e.target.value })
              }),
              React.createElement(
                "div",
                { className: "sm-fieldLabel", key: "ls" },
                "\u8C03\u7528\u9762\uFF08\u7EC6\u7C92\u5EA6\uFF1B\u884C\u5185\u300C\u542F\u7528\u300D\u5F00\u5173\u63A7\u5236\u6574\u4F53\uFF09"
              ),
              React.createElement(
                "div",
                { className: "sm-surfaceRow", key: "s" },
                React.createElement(
                  "span",
                  { className: "sm-ctlLabel" },
                  "\u6A21\u578B\u53EF\u8C03\u7528",
                  React.createElement(Switch, {
                    checked: live.modelInvocable,
                    disabled: saving || !live.valid,
                    label: "\u5141\u8BB8\u6A21\u578B\u901A\u8FC7 skill \u5DE5\u5177\u52A0\u8F7D",
                    onChange: () => toggle(live, "model")
                  })
                ),
                React.createElement(
                  "span",
                  { className: "sm-ctlLabel" },
                  "\u7528\u6237\u53EF /name \u8C03\u7528",
                  React.createElement(Switch, {
                    checked: live.userInvocable,
                    disabled: saving || !live.valid,
                    label: "\u5141\u8BB8\u7528\u6237\u4EE5 /\u540D\u5B57 \u76F4\u63A5\u8C03\u7528",
                    onChange: () => toggle(live, "user")
                  })
                )
              ),
              React.createElement(
                "div",
                { className: "sm-fieldLabel", key: "lb" },
                "\u6B63\u6587\uFF08frontmatter \u4E4B\u540E\u7684 Markdown\uFF09"
              ),
              React.createElement("textarea", {
                className: "sm-textarea sm-textareaMono",
                key: "b",
                disabled: saving,
                rows: 16,
                spellCheck: false,
                value: editDraft.body,
                onChange: (e) => setEditDraft({ ...editDraft, body: e.target.value })
              })
            ]
          )
        );
      }
      function moveModal() {
        const m = moveState;
        const destRoot = m ? rootOf(m.toScope, m.toSuffix) : void 0;
        const sameRoot = !!(m && destRoot && destRoot.id === m.entry.rootId);
        return React.createElement(
          P.Modal,
          {
            open: m !== null,
            onClose: () => setMoveState(null),
            className: "sm-wideModal",
            title: (m ? m.mode === "move" ? "\u79FB\u52A8\u6280\u80FD" : "\u590D\u5236\u6280\u80FD" : "\u590D\u5236 / \u79FB\u52A8\u6280\u80FD") + (m ? " \xB7 " + m.entry.name : ""),
            closeLabel: "\u5173\u95ED",
            description: "\u590D\u5236/\u79FB\u52A8\u76EE\u5F55\u5305\u65F6\u4FDD\u7559 references\u3001scripts \u7B49\u8D44\u6E90\uFF1B\u8DE8\u540C\u540D\u76EE\u5F55\u4F1A\u62D2\u7EDD\u8986\u76D6\u3002",
            footer: React.createElement(
              "div",
              { className: "sm-bar" },
              React.createElement(
                P.Button,
                { variant: "primary", disabled: !m || saving || sameRoot, onClick: applyMove },
                m && m.mode === "move" ? "\u79FB\u52A8" : "\u590D\u5236"
              ),
              React.createElement(P.Button, { disabled: saving, onClick: () => setMoveState(null) }, "\u53D6\u6D88"),
              sameRoot ? React.createElement("span", { className: "sm-notice sm-notice-err" }, "\u76EE\u6807\u4E0E\u6765\u6E90\u76F8\u540C") : null
            )
          },
          React.createElement(
            "div",
            { className: "sm-form" },
            m ? [
              React.createElement("div", { className: "sm-fieldLabel", key: "lt" }, "\u64CD\u4F5C"),
              React.createElement(
                "div",
                { className: "sm-bar", key: "t" },
                React.createElement(
                  P.Pill,
                  {
                    active: m.mode === "copy",
                    onClick: () => setMoveState({ ...m, mode: "copy" })
                  },
                  "\u590D\u5236"
                ),
                React.createElement(
                  P.Pill,
                  {
                    active: m.mode === "move",
                    onClick: () => setMoveState({ ...m, mode: "move" })
                  },
                  "\u79FB\u52A8\uFF08\u5220\u9664\u539F\u4F4D\u7F6E\uFF09"
                )
              ),
              React.createElement("div", { className: "sm-fieldLabel", key: "lw" }, "\u76EE\u6807\u5DE5\u4F5C\u533A"),
              React.createElement(Selector, {
                key: "w",
                disabled: saving,
                value: m.toScope,
                selectedLabel: scopeLabel(m.toScope),
                options: scopeOptions,
                onSelect: (id) => setMoveState({ ...m, toScope: id })
              }),
              React.createElement("div", { className: "sm-fieldLabel", key: "ld" }, "\u76EE\u6807\u76EE\u5F55"),
              React.createElement(Selector, {
                key: "d",
                disabled: saving,
                value: m.toSuffix,
                selectedLabel: m.toSuffix === "agents" ? ".agents/skills\uFF08\u63A8\u8350\uFF09" : ".dsh/skills",
                options: dirOptions,
                onSelect: (id) => setMoveState({ ...m, toSuffix: id === "dsh" ? "dsh" : "agents" })
              }),
              destRoot ? React.createElement("div", { className: "sm-rootPath", key: "p" }, destRoot.path) : null
            ] : null
          )
        );
      }
      function createModal() {
        const chosenRoot = rootOf(createDraft.toScope, createDraft.toSuffix);
        const nameOk = SKILL_NAME_RE.test(createDraft.name.trim());
        return React.createElement(
          P.Modal,
          {
            open: creating,
            onClose: () => setCreating(false),
            className: "sm-wideModal",
            title: "\u65B0\u5EFA\u6280\u80FD",
            closeLabel: "\u5173\u95ED",
            description: "\u521B\u5EFA\u540E\u76EE\u5F55\u4F1A\u88AB harness \u5B9E\u65F6\u53D1\u73B0\uFF0C\u4E0B\u4E00\u4E2A\u6A21\u578B\u6B65\u9AA4\u5373\u53EF\u4F7F\u7528\u3002",
            footer: React.createElement(
              "div",
              { className: "sm-bar" },
              React.createElement(
                P.Button,
                {
                  variant: "primary",
                  disabled: saving || !createDraft.name.trim() || !createDraft.description.trim() || !nameOk,
                  onClick: submitCreate
                },
                "\u521B\u5EFA"
              ),
              React.createElement(P.Button, { disabled: saving, onClick: () => setCreating(false) }, "\u53D6\u6D88"),
              createDraft.name.trim() && !nameOk ? React.createElement(
                "span",
                { className: "sm-notice sm-notice-err" },
                "\u6280\u80FD\u540D\u9700\u4E3A\u5C0F\u5199 kebab-case\uFF08\u5B57\u6BCD / \u6570\u5B57 / \u8FDE\u5B57\u7B26\uFF09"
              ) : null
            )
          },
          React.createElement(
            "div",
            { className: "sm-form" },
            React.createElement("div", { className: "sm-fieldLabel" }, "\u4F4D\u7F6E\u4E0E\u5F62\u6001"),
            React.createElement(
              "div",
              { className: "sm-bar" },
              React.createElement(Selector, {
                disabled: saving,
                value: createDraft.toScope,
                selectedLabel: scopeLabel(createDraft.toScope),
                options: scopeOptions,
                onSelect: (id) => setCreateDraft({ ...createDraft, toScope: id })
              }),
              React.createElement(Selector, {
                disabled: saving,
                value: createDraft.toSuffix,
                selectedLabel: createDraft.toSuffix === "agents" ? ".agents/skills\uFF08\u63A8\u8350\uFF09" : ".dsh/skills",
                options: dirOptions,
                onSelect: (id) => setCreateDraft({ ...createDraft, toSuffix: id === "dsh" ? "dsh" : "agents" })
              }),
              React.createElement(Selector, {
                disabled: saving,
                value: createDraft.kind,
                selectedLabel: createDraft.kind === "bundle" ? "\u76EE\u5F55\u5305 <name>/SKILL.md" : "\u5355\u6587\u4EF6 <name>.md",
                options: [
                  { id: "bundle", label: "\u76EE\u5F55\u5305 <name>/SKILL.md" },
                  { id: "flat", label: "\u5355\u6587\u4EF6 <name>.md" }
                ],
                onSelect: (id) => setCreateDraft({ ...createDraft, kind: id === "flat" ? "flat" : "bundle" })
              })
            ),
            chosenRoot ? React.createElement("div", { className: "sm-rootPath" }, chosenRoot.path) : null,
            React.createElement(
              "div",
              { className: "sm-fieldLabel" },
              "\u6280\u80FD\u540D\uFF08\u5C0F\u5199 kebab-case\uFF1A\u5B57\u6BCD / \u6570\u5B57 / \u8FDE\u5B57\u7B26\uFF09"
            ),
            React.createElement(P.Input, {
              className: "sm-mono",
              disabled: saving,
              placeholder: "my-new-skill",
              value: createDraft.name,
              onChange: (e) => setCreateDraft({ ...createDraft, name: e.target.value })
            }),
            React.createElement("div", { className: "sm-fieldLabel" }, "description\uFF08\u5FC5\u586B\uFF0C\u2264500 \u5B57\u7B26\uFF09"),
            React.createElement("textarea", {
              className: "sm-textarea",
              disabled: saving,
              rows: 2,
              placeholder: "\u4E00\u53E5\u8BDD\u8BF4\u6E05\u8FD9\u4E2A\u6280\u80FD\u505A\u4EC0\u4E48\u3001\u4EC0\u4E48\u65F6\u5019\u7528\uFF08\u5199\u89E6\u53D1\u8BCD\uFF09",
              value: createDraft.description,
              onChange: (e) => setCreateDraft({ ...createDraft, description: e.target.value })
            }),
            React.createElement("div", { className: "sm-fieldLabel" }, "whenToUse\uFF08\u53EF\u9009\uFF09"),
            React.createElement(P.Input, {
              disabled: saving,
              value: createDraft.whenToUse,
              onChange: (e) => setCreateDraft({ ...createDraft, whenToUse: e.target.value })
            }),
            React.createElement("div", { className: "sm-fieldLabel" }, "\u6B63\u6587"),
            React.createElement("textarea", {
              className: "sm-textarea sm-textareaMono",
              disabled: saving,
              rows: 10,
              spellCheck: false,
              value: createDraft.body,
              onChange: (e) => setCreateDraft({ ...createDraft, body: e.target.value })
            })
          )
        );
      }
      function confirmModal() {
        return React.createElement(
          P.Modal,
          {
            open: confirmTarget !== null,
            onClose: () => setConfirmTarget(null),
            title: "\u5220\u9664\u6280\u80FD",
            closeLabel: "\u5173\u95ED",
            footer: React.createElement(
              "div",
              { className: "sm-bar" },
              React.createElement(P.Button, { className: "sm-danger", onClick: doRemove }, "\u5220\u9664"),
              React.createElement(P.Button, { onClick: () => setConfirmTarget(null) }, "\u53D6\u6D88")
            )
          },
          React.createElement(
            "div",
            { className: "sm-form" },
            React.createElement(
              "p",
              { className: "sm-notice sm-notice-warn" },
              "\u786E\u8BA4\u5220\u9664 ",
              confirmTarget ? confirmTarget.name : "",
              "\uFF1F\u76EE\u5F55\u5305\u4F1A\u8FDE\u540C references / scripts \u7B49\u8D44\u6E90\u4E00\u8D77\u5220\u9664\uFF0C\u64CD\u4F5C\u4E0D\u53EF\u6062\u590D\u3002"
            ),
            confirmTarget ? React.createElement("div", { className: "sm-rootPath" }, confirmTarget.entryPath) : null
          )
        );
      }
      const SKILL_CREATOR_INSTALL_CMD = "npx skills install anthropics/skills@skill-creator --global --yes";
      function installModal() {
        return React.createElement(
          P.Modal,
          {
            open: installOpen,
            onClose: () => setInstallOpen(false),
            className: "sm-wideModal",
            title: "\u5C1A\u672A\u5B89\u88C5 skill-creator",
            closeLabel: "\u5173\u95ED",
            description: "skill-creator \u662F\u5B98\u65B9\u7684\u6280\u80FD\u751F\u6210\u5668\u3002\u5728\u7EC8\u7AEF\u4EFB\u610F\u76EE\u5F55\u6267\u884C\u4E0B\u9762\u7684\u547D\u4EE4\u5168\u5C40\u5B89\u88C5\uFF08\u5199\u5165 ~/.agents/skills\uFF1B\u4E2A\u522B agent \u9002\u914D\u76EE\u6807\u63D0\u793A\u4E0D\u652F\u6301\u5C5E\u6B63\u5E38\u566A\u97F3\uFF0C\u53EA\u8981 skill-creator \u76EE\u5F55\u51FA\u73B0\u5373\u6210\u529F\uFF09\u3002\u88C5\u5B8C\u56DE\u5230\u672C\u9875\u70B9\u300C\u5237\u65B0\u300D\u3002"
          },
          React.createElement(
            "div",
            { className: "sm-form" },
            React.createElement(P.Input, {
              className: "sm-mono",
              readOnly: true,
              value: SKILL_CREATOR_INSTALL_CMD,
              onFocus: (e) => e.target.select()
            }),
            React.createElement(
              "div",
              { className: "sm-bar" },
              React.createElement(
                P.Button,
                {
                  variant: "primary",
                  onClick: () => {
                    copyToClipboard(SKILL_CREATOR_INSTALL_CMD);
                    flash("\u5B89\u88C5\u547D\u4EE4\u5DF2\u590D\u5236\uFF0C\u53BB\u7EC8\u7AEF\u6267\u884C\u540E\u56DE\u5230\u672C\u9875\u70B9\u300C\u5237\u65B0\u300D");
                  }
                },
                "\u590D\u5236\u5B89\u88C5\u547D\u4EE4"
              ),
              React.createElement(
                P.Button,
                {
                  onClick: () => {
                    copyToClipboard("/skill-creator");
                    flash("\u5DF2\u590D\u5236 /skill-creator\uFF1A\u88C5\u597D\u540E\u5728\u65B0\u5EFA\u4F1A\u8BDD\u91CC\u7C98\u8D34\u53D1\u9001\u4E5F\u53EF\u4EE5");
                  }
                },
                "\u590D\u5236 /skill-creator"
              )
            )
          ),
          React.createElement(P.Button, { onClick: () => setInstallOpen(false) }, "\u5173\u95ED")
        );
      }
      function extraRootModal() {
        return React.createElement(
          P.Modal,
          {
            open: extraRootOpen,
            onClose: () => setExtraRootOpen(false),
            title: "\u989D\u5916\u5DE5\u4F5C\u533A\u6839\u76EE\u5F55",
            closeLabel: "\u5173\u95ED",
            description: "\u586B\u7EDD\u5BF9\u8DEF\u5F84\uFF08\u5982 /home/me/project\uFF09\uFF1B\u4FDD\u5B58\u540E\u8BE5\u76EE\u5F55\u7684 .dsh/skills \u4E0E .agents/skills \u4F1A\u51FA\u73B0\u5728\u8303\u56F4\u5207\u6362\u91CC\u3002\u7559\u7A7A\u5219\u53EA\u7528 DSH \u5DF2\u767B\u8BB0\u7684\u5DE5\u4F5C\u533A\u3002",
            footer: React.createElement(
              "div",
              { className: "sm-bar" },
              React.createElement(
                P.Button,
                { variant: "primary", disabled: saving, onClick: saveWsRoot },
                "\u4FDD\u5B58"
              ),
              React.createElement(
                P.Button,
                { disabled: saving, onClick: () => setExtraRootOpen(false) },
                "\u53D6\u6D88"
              )
            )
          },
          React.createElement(
            "div",
            { className: "sm-form" },
            React.createElement(P.Input, {
              className: "sm-mono",
              disabled: saving,
              placeholder: "/home/me/project",
              value: wsRootDraft,
              onChange: (e) => setWsRootDraft(e.target.value)
            })
          )
        );
      }
      const children = [];
      children.push(
        React.createElement(
          "p",
          { className: "sm-intro" },
          "\u7EDF\u4E00\u7BA1\u7406\u5168\u5C40\u4E0E\u5DE5\u4F5C\u533A\u6280\u80FD\uFF08SKILL.md\uFF09\u3002\u6280\u80FD\u76EE\u5F55\u88AB harness \u5B9E\u65F6\u76D1\u542C\uFF0C\u6539\u52A8\u5373\u523B\u751F\u6548\uFF0C\u65E0\u9700\u91CD\u542F\u3002"
        )
      );
      if (error) children.push(React.createElement("p", { className: "sm-notice sm-notice-err" }, error));
      if (notice) children.push(React.createElement("p", { className: "sm-notice sm-notice-ok" }, notice));
      if (!enabled)
        children.push(
          React.createElement(
            "p",
            { className: "sm-notice sm-notice-warn" },
            "\u6280\u80FD\u7BA1\u7406\u5DF2\u5173\u95ED\uFF1A\u4E0B\u65B9\u5F00\u5173\u4E0E\u6309\u94AE\u5747\u4E0D\u53EF\u7528\uFF1B\u53EF\u5728 settings.yaml \u7684 dshp-skill-manager \u5206\u8282\u628A enabled \u6539\u56DE true\u3002"
          )
        );
      children.push(
        React.createElement(
          "div",
          { className: "sm-toolbar" },
          React.createElement(Selector, {
            disabled: saving,
            value: scope,
            selectedLabel: isGlobal ? "\u5168\u5C40\uFF08\u6240\u6709\u5DE5\u4F5C\u533A\uFF09" : basename(scope),
            options: scopeOptions,
            onSelect: pickScope
          }),
          React.createElement(
            "span",
            { className: "sm-count" },
            "\u6280\u80FD " + scopeSkills.length + " \xB7 \u5DF2\u542F\u7528 " + scopeSkills.filter((s) => s.modelInvocable || s.userInvocable).length
          ),
          q ? React.createElement("span", { className: "sm-count" }, "\xB7 \u5339\u914D " + visibleSkills.length) : null,
          React.createElement("div", { className: "sm-toolbarSpacer" }),
          React.createElement(P.Input, {
            className: "sm-searchW",
            icon: React.createElement(P.IconSearchOutline16, null),
            disabled: loading,
            placeholder: "\u641C\u7D22\u6280\u80FD\u2026",
            value: query,
            onChange: (e) => setQuery(e.target.value)
          }),
          React.createElement(ActionMenu, {
            disabled: saving,
            icon: React.createElement(P.IconEllipsisOutline16, null),
            title: "\u66F4\u591A\u64CD\u4F5C",
            options: [
              { id: "manual-create", label: "\u624B\u52A8\u65B0\u5EFA\u6280\u80FD\u2026" },
              { id: "extra-root", label: "\u989D\u5916\u5DE5\u4F5C\u533A\u6839\u76EE\u5F55\u2026" },
              { id: "reload", label: "\u91CD\u65B0\u8BFB\u53D6" }
            ],
            onPick: (id) => {
              if (id === "manual-create") {
                if (!createDraft.toScope && scopeRoots.length > 0) {
                  const first = scopeRoots[0];
                  setCreateDraft({ ...createDraft, toScope: first.workspace || "global" });
                }
                setCreating(true);
              } else if (id === "extra-root") setExtraRootOpen(true);
              else if (id === "reload") load();
            }
          }),
          React.createElement(
            P.Button,
            { variant: "toolbar", disabled: saving, title: "\u91CD\u65B0\u8BFB\u53D6", onClick: load },
            React.createElement(P.IconRefreshOutline14, null)
          ),
          React.createElement(
            P.Button,
            {
              variant: "primary",
              icon: React.createElement(P.IconPlusOutline16, null),
              disabled: disabledCtl,
              title: skillCreatorReady ? "\u5728\u5F53\u524D\u5DE5\u4F5C\u533A\u5F00\u4E00\u4E2A\u65B0\u4F1A\u8BDD\uFF0C\u5E76\u628A /skill-creator \u63D2\u5165\u8F93\u5165\u6846" : "\u5C1A\u672A\u5B89\u88C5 skill-creator\uFF1A\u70B9\u51FB\u67E5\u770B\u5B89\u88C5\u547D\u4EE4",
              onClick: handleNewClick
            },
            "\u65B0\u5EFA"
          )
        )
      );
      if (!isGlobal) {
        children.push(
          React.createElement(
            "div",
            { className: "sm-toolbar", style: { borderTop: "none", paddingTop: 8, paddingBottom: 8 } },
            React.createElement(
              "span",
              { className: "sm-rootPath" },
              basename(scope) + "\uFF1A" + scopeRoots.map((r) => r.path).join(" \xB7 ")
            )
          )
        );
      }
      children.push(
        React.createElement("div", { className: "sm-section sm-list" }, visibleSkills.map(skillRow))
      );
      if (scopeSkills.length === 0) {
        children.push(
          React.createElement(
            "div",
            { className: "sm-empty" },
            React.createElement(
              "div",
              { className: "sm-tile" },
              React.createElement(P.IconSkillOutline16, null)
            ),
            React.createElement(
              "div",
              { className: "sm-emptyTitle" },
              isGlobal ? "\u5168\u5C40\u8FD8\u6CA1\u6709\u6280\u80FD" : "\u8FD9\u4E2A\u5DE5\u4F5C\u533A\u8FD8\u6CA1\u6709\u6280\u80FD"
            ),
            React.createElement(
              "p",
              { className: "sm-hint" },
              isGlobal ? "\u7528\u300C\u65B0\u5EFA\u300D\u521B\u5EFA\uFF0C\u6216\u628A\u6280\u80FD\u653E\u5230 " + (state ? state.dshHome + "/skills \u6216 " + state.agentsHome + "/skills" : "~/.dsh/skills") + " \u4E0B\u3002" : "\u7528\u300C\u65B0\u5EFA\u300D\u521B\u5EFA\uFF08\u9ED8\u8BA4\u5199\u5165\u5F53\u524D\u8303\u56F4\uFF09\uFF0C\u6216\u624B\u5DE5\u521B\u5EFA .dsh/skills/<name>/SKILL.md\u3002"
            )
          )
        );
      } else if (visibleSkills.length === 0) {
        children.push(
          React.createElement(
            "div",
            { className: "sm-empty" },
            React.createElement(
              "div",
              { className: "sm-emptyTitle" },
              "\u6CA1\u6709\u5339\u914D\u300C" + query.trim() + "\u300D\u7684\u6280\u80FD"
            )
          )
        );
      }
      children.push(
        React.createElement(
          "p",
          { className: "sm-hint", style: { marginTop: 4 } },
          "\u4F18\u5148\u7EA7\uFF1A\u5DE5\u4F5C\u533A .dsh/skills\uFF08100\uFF09 > \u5DE5\u4F5C\u533A .agents/skills\uFF08200\uFF09 > \u5168\u5C40 ~/.dsh/skills\uFF08400\uFF09 > \u5168\u5C40 ~/.agents/skills\uFF08500\uFF09\uFF0C\u540C\u540D\u6280\u80FD\u4F4E\u4F18\u5148\u7EA7\u7684\u4F1A\u88AB\u9AD8\u4F18\u5148\u7EA7\u906E\u853D\u3002\u4E3A\u9632\u6B62\u63D0\u793A\u8BCD\u6CE8\u5165\uFF0C\u672C\u63D2\u4EF6\u4E0D\u5411\u6A21\u578B\u5F00\u653E\u5199\u5165\u5DE5\u5177\uFF0C\u6280\u80FD\u6587\u4EF6\u53EA\u80FD\u7531\u4EBA\u5728\u8BBE\u7F6E\u9875\u6216\u6587\u4EF6\u7CFB\u7EDF\u91CC\u4FEE\u6539\u3002"
        )
      );
      children.push(
        editorModal(),
        createModal(),
        confirmModal(),
        extraRootModal(),
        moveModal(),
        installModal()
      );
      return React.createElement("div", { className: "sm-page" }, children);
    }
    return SkillSection;
  }

  // src/client/index.ts
  var PLUGIN_ID = "@dshp/skill-manager";
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
        const Section = createSkillSection(React, P);
        const InputProbe = createSessionInputProbe(React);
        const exportsObj = exportsShim;
        exportsObj.inject = ["slots"];
        exportsObj.apply = function apply(ctx) {
          ctxHolder.current = ctx;
          const slots = ctx.get("slots");
          if (slots === void 0) return;
          const style = document.createElement("style");
          style.setAttribute("data-plugin-css", "dshp-skill-manager/settings.css");
          style.textContent = CSS;
          document.head.appendChild(style);
          ctx.effect(() => () => style.remove(), "dshp-skill-manager: section styles");
          ctx.effect(
            () => slots.inject(
              "settings.section",
              () => slots.register(
                { name: "settings.section", id: "dshp-skill-manager", order: 29, label: "Skills" },
                Section
              )
            ),
            "dshp-skill-manager: settings section"
          );
          try {
            ctx.effect(
              () => slots.inject(
                "conversation.input.right",
                () => slots.register(
                  { name: "conversation.input.right", id: "dshp-skill-manager", order: 90 },
                  InputProbe
                )
              ),
              "dshp-skill-manager: input right probe"
            );
          } catch {
          }
        };
        return moduleShim.exports;
      }
    });
  }
  register();

})();
