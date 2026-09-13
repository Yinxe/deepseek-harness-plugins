/**
 * Host 半冒烟测试：不启动 DSH，直接跑 lib/host.js 的 `apply`
 *
 * 盯的是只有 Host 侧才看得见的三件事：
 *
 *   1. 导出契约：`name` / `inject` / `apply`，以及 `NS` 必须等于 cordis 行 id
 *      （NS 四处同名：settings 命名空间 / `/ext` 路由前缀 / patch id / settings.section id）；
 *   2. 必须真的 `installSection` 一个命名空间，并把 `setSource` 交给 settings 服务（热重载靠它）；
 *   3. `/ext` 两条路由（state / config）必须**真的把补丁写进 settings**——设置节点了没反应、
 *      settings.yaml 里没有分节，就是这一段断了。
 *
 * 只用 node 内建模块，零依赖。
 */

import assert from 'node:assert/strict';

/** 最近一次 fake ctx 的可观测面。 */
let last = null;

/** 记录一次 installSection 调用。 */
let installed = null;

/** 造一个假 ctx：只认插件真正用到的那几件（inject / get / effect / webServer / tools / fs）。 */
function fakeCtx(options = {}) {
  const state = {
    installed: null,
    routes: [],
    updates: [],
    effects: 0,
    hasSettings: options.hasSettings !== false,
    tools: [],
    /** 内存文件系统：displayPath → 内容。 */
    files: new Map(options.files ?? []),
    writeLog: [],
    fsWriteDenied: false,
    writePolicies: [],
    approvals: [],
    sandboxMode: options.sandboxMode,
    standingMode: options.standingMode ?? 'workspace-write',
    approvalOutcome: options.approvalOutcome,
    /** false = 策略服务还没挂上（模拟插件挂载顺序）。 */
    policyReady: options.policyReady !== false,
    confiningReads: 0,
  };
  last = state;
  const settings = {
    installSection: (ctxArg, ns, schema, entry, hooks) => {
      state.installed = { ctxArg, ns, schema, entry, options: hooks };
      installed = state.installed;
    },
    update: async (ns, patch) => {
      state.updates.push({ ns, patch });
    },
  };
  const fs = {
    resolve: async (path) => ({ displayPath: path, targetKey: path }),
    stat: async (target) =>
      state.files.has(target.displayPath) ? { version: 'v1', type: 'file', size: 1 } : undefined,
    readText: async (target) => {
      if (!state.files.has(target.displayPath)) {
        const error = new Error('not found');
        error.code = 'FS_NOT_FOUND';
        throw error;
      }
      return state.files.get(target.displayPath);
    },
    writeText: async (target, content, _intent, _signal, sandboxPolicy) => {
      state.writePolicies.push(sandboxPolicy);
      if (state.fsWriteDenied === true) {
        const error = new Error(
          'cannot write "' + target.displayPath + '": file access denied under workspace-write mode',
        );
        error.code = 'FS_SANDBOX_DENIED';
        throw error;
      }
      const before = state.files.has(target.displayPath) ? state.files.get(target.displayPath) : null;
      state.files.set(target.displayPath, content);
      state.writeLog.push(target.displayPath);
      return { operation: before === null ? 'create' : 'update', before, after: content, version: 'v2' };
    },
  };
  const tools = {
    register: (definition) => {
      state.tools.push(definition);
    },
  };
  if (options.sandboxMode !== undefined) fs.sandboxMode = options.sandboxMode;
  const sandboxPolicy = {
    defaultMode: state.sandboxMode ?? 'workspace-write',
    workspaceRoot: '/w',
    resolve: () => ({ mode: state.standingMode, workspaceRoot: '/w' }),
    overrideOf: () => undefined,
  };
  const approval = {
    request: async (request) => {
      state.approvals.push(request);
      return state.approvalOutcome;
    },
  };
  const ctx = {
    get: (name) => {
      if (name === 'settings') return state.hasSettings ? settings : undefined;
      if (name === 'sandboxPolicy') {
        if (state.sandboxMode === undefined) return undefined;
        return state.policyReady ? sandboxPolicy : undefined;
      }
      if (name === 'approval') return state.approvalOutcome === undefined ? undefined : approval;
      // locate 路由显式取 fs 服务（它挂在插件自己的 ctx 上，不在 tools/fs 的注入作用域里）。
      if (name === 'fs') return fs;
      return undefined;
    },
    effect: (callback) => {
      state.effects += 1;
      callback();
    },
    emit: () => {},
    waterfall: (...args) => {
      const fallback = args[args.length - 1];
      return typeof fallback === 'function' ? fallback() : undefined;
    },
    webServer: {
      register: (route) => {
        state.routes.push(route);
        return () => {};
      },
    },
  };
  return {
    ...ctx,
    // Cordis 的 `inject` 回调拿到的是**继承父 ctx 的子上下文**（services 仍在），不是只有依赖的裸对象。
    inject: (deps, callback) => {
      if (deps.length === 1 && deps[0] === 'settings') {
        callback({ ...ctx, settings });
        return;
      }
      assert.deepEqual(deps, ['tools', 'fs']);
      callback({ ...ctx, tools, fs });
    },
  };
}

/** 假请求：`readBody` 只需要 `on('data'|'end')`。 */
function fakeRequest(method, body, headers = {}) {
  return {
    method,
    headers,
    on(event, callback) {
      if (event === 'data' && body !== undefined) callback(Buffer.from(body));
      if (event === 'end') callback();
      return this;
    },
    destroy() {},
  };
}

/** 假应答：收下 status / body 供断言。 */
function fakeResponse() {
  return {
    status: 0,
    body: null,
    writeHead(status) {
      this.status = status;
      return this;
    },
    end(text) {
      this.body = text;
    },
  };
}

/** 打一次路由并解析 JSON 应答。 */
async function callRoute(route, method, body, headers = {}) {
  const res = fakeResponse();
  await route.handler(fakeRequest(method, body, headers), res);
  return { status: res.status, json: res.body === null ? null : JSON.parse(res.body) };
}

const host = await import('../lib/host.js');

let checks = 0;
function ok(label, condition) {
  checks += 1;
  assert.ok(condition, label);
}

const realInfo = console.info;
console.info = () => {}; // 启动日志不该进测试输出
/** 被文件策略拒绝时的 Host 侧诊断日志（模型看不到，测试要看）。 */
const denials = [];
const realWarn = console.warn;
console.warn = (...args) => {
  denials.push(args.map((value) => String(value)).join(' '));
};

ok('必须导出 name', host.name === '@dshp/file-change-viewer');
ok(
  'inject 必须声明 webServer（/ext 路由要用）',
  Array.isArray(host.inject) && host.inject.includes('webServer'),
);
ok('必须导出 apply', typeof host.apply === 'function');
ok('必须导出 NS 与 ConfigSchema（settings 契约四件套）', typeof host.NS === 'string' && host.ConfigSchema);
ok('NS 必须等于 cordis 行 id（NS 四处同名）', host.NS === 'dshp-file-change-viewer');

// ── 默认值 + 补丁 + 命名空间 ────────────────────────────────────────────────
host.apply(fakeCtx(), undefined);
ok('必须注册 settings 命名空间', installed !== null);
ok('注册的命名空间就是 NS', installed.ns === 'dshp-file-change-viewer');
ok(
  '没传补丁时用出厂默认（高亮 + 不默认展开 = 保持原生折叠）',
  installed.entry.view === 'highlight' && installed.entry.sectionsOpen === false,
);
ok(
  '必须把 setSource 回调交给 settings 服务（热重载靠它）',
  typeof installed.options.setSource === 'function',
);

host.apply(fakeCtx(), { view: 'diff', sectionsOpen: true });
ok('composition 补丁必须生效', installed.entry.view === 'diff' && installed.entry.sectionsOpen === true);

host.apply(fakeCtx(), { view: 'bogus', sectionsOpen: 'yes' });
ok(
  '非法补丁必须被丢弃（逐字段消毒）',
  installed.entry.view === 'highlight' && installed.entry.sectionsOpen === false,
);

host.apply(fakeCtx(), 'not-an-object');
ok('非对象补丁不抛错', installed.entry.view === 'highlight');

// ── schema ─────────────────────────────────────────────────────────────────
const parsed = installed.schema({});
ok('schema 默认 view=highlight', parsed.view === 'highlight');
ok('schema 默认 sectionsOpen=false（新渲染的行保持原生折叠）', parsed.sectionsOpen === false);
ok('schema 里不再有 rowsOpen 这种多余属性', parsed.rowsOpen === undefined);
const narrowed = installed.schema({ view: 'diff', sectionsOpen: false });
ok('schema 接受合法值', narrowed.view === 'diff' && narrowed.sectionsOpen === false);

// ── /ext 路由 ──────────────────────────────────────────────────────────────
host.apply(fakeCtx({ hasSettings: true }), { view: 'diff', sectionsOpen: true });
const state = last;
const paths = state.routes.map((route) => route.path);
ok('必须注册三条 exact 路由', paths.length === 3 && state.routes.every((route) => route.kind === 'exact'));
ok('state 路由路径必须等于 NS 前缀', paths[0] === '/ext/dshp-file-change-viewer/state');
ok('config 路由路径必须等于 NS 前缀', paths[1] === '/ext/dshp-file-change-viewer/config');
ok('locate 路由（真实行号定位）路径正确', paths[2] === '/ext/dshp-file-change-viewer/locate');

const stateRoute = state.routes[0];
const configRoute = state.routes[1];

// locate：只回行号、不回文件内容
{
  const located = fakeCtx({ files: [['src/l.ts', 'one\ntwo\nthree\nfour\n']] });
  host.apply(located, undefined);
  const route = last.routes[2];
  const answer = await callRoute(
    route,
    'POST',
    JSON.stringify({
      cwd: '/w',
      items: [
        { path: 'src/l.ts', newText: 'three\nfour' },
        { path: 'src/l.ts', newText: '不存在的段落' },
        { path: 'src/missing.ts', newText: 'x' },
      ],
    }),
  );
  ok('locate 回 ok:true', answer.status === 200 && answer.json.ok === true);
  ok('locate 报到真实行号（three 是第 3 行）', answer.json.lines[0] === 3);
  ok('定位不到时回 null（卡片退回从 1 开始）', answer.json.lines[1] === null);
  ok('文件不存在也回 null', answer.json.lines[2] === null);
  ok(
    'locate 的响应里没有任何文件内容（正文一个字都不回传）',
    JSON.stringify(answer.json) === '{"ok":true,"lines":[3,null,null]}',
  );
}

const stateAnswer = await callRoute(stateRoute, 'GET');
ok('GET state 回 ok:true', stateAnswer.status === 200 && stateAnswer.json.ok === true);
ok(
  'GET state 回当前生效偏好（含 composition 补丁）',
  stateAnswer.json.config.view === 'diff' && stateAnswer.json.config.sectionsOpen === true,
);

const writeAnswer = await callRoute(configRoute, 'POST', JSON.stringify({ view: 'highlight' }));
ok('POST config 回 ok:true 与回写后的 config', writeAnswer.status === 200 && writeAnswer.json.ok === true);
ok(
  'POST config 必须调 settings.update(NS, patch)',
  state.updates.length === 1 && state.updates[0].ns === host.NS,
);
ok('写入的补丁只含被点的字段', state.updates[0].patch.view === 'highlight');

const badView = await callRoute(configRoute, 'POST', JSON.stringify({ view: 'bogus' }));
ok('非法 view 必须回 ok:false + 中文提示', badView.json.ok === false && badView.json.error.includes('view'));
ok(
  'sectionsOpen 也能单独写',
  (await callRoute(configRoute, 'POST', JSON.stringify({ sectionsOpen: true }))).json.ok === true &&
    state.updates[1].patch.sectionsOpen === true,
);
const badBool = await callRoute(configRoute, 'POST', JSON.stringify({ sectionsOpen: 'yes' }));
ok('非法 sectionsOpen 必须回 ok:false', badBool.json.ok === false);
const legacy = await callRoute(configRoute, 'POST', JSON.stringify({ rowsOpen: true }));
ok(
  '多余的 rowsOpen 不再被当作偏好（已移除该属性）',
  state.updates.length === 2 && !('rowsOpen' in state.updates[1].patch) && legacy.json.ok === true,
);
ok('非法值不得落库', state.updates.length === 2);

const badJson = await callRoute(configRoute, 'POST', '{oops');
ok('请求体不是 JSON 必须回 ok:false', badJson.json.ok === false && badJson.json.error.includes('JSON'));

const wrongMethod = await callRoute(configRoute, 'GET');
ok('config 路由只收 POST', wrongMethod.status === 405);
const crossSite = await callRoute(stateRoute, 'GET', undefined, { origin: 'http://evil.example', host: 'x' });
ok('跨站调用必须 403', crossSite.status === 403);

host.apply(fakeCtx({ hasSettings: false }), undefined);
const noSettings = await callRoute(last.routes[1], 'POST', JSON.stringify({ sectionsOpen: true }));
ok(
  'settings 服务缺失时必须回 ok:false（不能假装保存成功）',
  noSettings.json.ok === false && noSettings.json.error.includes('settings 服务不可用'),
);

// ── patch 工具：注册契约 + 真正落盘 + 全有或全无 ────────────────────────────

const withFiles = fakeCtx({
  files: [
    ['src/a.ts', 'const a = 1;\n'],
    ['src/b.ts', 'const b = 2;\n'],
  ],
});
host.apply(withFiles, undefined);
const patchTool = last.tools.filter((tool) => tool.name === 'patch')[0];
ok('必须注册 patch 工具', patchTool !== undefined);
ok('patch 工具要求必须带 patch 文本', patchTool.parameters.required.includes('patch'));
ok('patch 工具声明了输出 schema 与 render', typeof patchTool.output.render === 'function');
ok(
  'patch 工具必须给差异卡片提供 diffs（presentationMeta）',
  typeof patchTool.output.presentationMeta === 'function',
);
ok('patch 工具声明为不可并行（会改文件）', patchTool.isConcurrencySafe() === false);

// 工具说明必须把「改已有文件」与「新建文件」两种形式都写出来，而且**各自带例子**：
// 只给「改」的例子，模型第一次就会拿它去写一个还不存在的文件（真实踩过）。
{
  const description = patchTool.description;
  const paramHint = patchTool.parameters.properties.patch.description;
  ok(
    '描述里写明改已有文件的形式',
    description.includes('--- a/') || description.includes('EDIT an existing file'),
  );
  ok(
    '描述里写明新建文件的形式（--- /dev/null + @@ -0,0）',
    description.includes('/dev/null') && description.includes('@@ -0,0'),
  );
  ok('描述里点明「文件不存在且用改的形式」会被拒', description.includes('refused'));
  ok('描述里说明不支持删除文件', description.includes('Deleting files is not supported'));
  ok('参数说明里同时给了改 / 建两个例子', paramHint.includes('EDIT:') && paramHint.includes('CREATE:'));
  ok('新建例子用的是 /dev/null 形式', paramHint.includes('--- /dev/null'));
}

const execCtx = { agent: { session: { header: { cwd: '/w' } } }, signal: undefined };
const twoFilePatch = [
  '--- a/src/a.ts',
  '+++ b/src/a.ts',
  '@@ -1,1 +1,1 @@',
  '-const a = 1;',
  '+const a = 11;',
  '--- a/src/b.ts',
  '+++ b/src/b.ts',
  '@@ -1,1 +1,1 @@',
  '-const b = 2;',
  '+const b = 22;',
].join('\n');

const result = await patchTool.execute({ patch: twoFilePatch }, execCtx);
ok(
  '两个文件都写进去了',
  last.files.get('src/a.ts') === 'const a = 11;\n' && last.files.get('src/b.ts') === 'const b = 22;\n',
);
ok('返回值按文件列出增删', result.files.length === 2 && result.added === 2 && result.removed === 2);
ok(
  '返回值带上「只含变化行」的差异文本（差异卡片直接用）',
  result.files[0].oldText === 'const a = 1;' && result.files[0].newText === 'const a = 11;',
);
const meta = patchTool.output.presentationMeta({ patch: twoFilePatch }, result);
ok(
  'presentationMeta 把两个文件的差异交给卡片',
  meta.diffs.length === 2 && meta.diffs[0].path === 'src/a.ts' && meta.diffs[1].newText === 'const b = 22;',
);
ok('render 只回小结、不回显整份 patch', typeof patchTool.output.render({}, result)[0].text === 'string');

// 全有或全无：第二个文件的 hunk 对不上时，第一个文件也不能被写
const broken = fakeCtx({ files: [['src/a.ts', 'const a = 1;\n']] });
host.apply(broken, undefined);
const brokenTool = last.tools.filter((tool) => tool.name === 'patch')[0];
const halfPatch = [
  '--- a/src/a.ts',
  '+++ b/src/a.ts',
  '@@ -1,1 +1,1 @@',
  '-const a = 1;',
  '+const a = 11;',
  '--- a/missing.ts',
  '+++ b/missing.ts',
  '@@ -1,1 +1,1 @@',
  '-nope',
  '+nope2',
].join('\n');
let allOrNothing = null;
try {
  await brokenTool.execute({ patch: halfPatch }, execCtx);
} catch (error) {
  allOrNothing = error;
}
ok('任一文件对不上就整体失败', allOrNothing !== null);
ok('失败时第一个文件没有被写（不会留半截状态）', last.files.get('src/a.ts') === 'const a = 1;\n');
ok('失败消息点名是哪个文件', String(allOrNothing.message).includes('missing.ts'));

// ── 沙箱提权：与官方 write / edit / bash 同一套 ─────────────────────────────

ok(
  '没有沙箱后端时不广告 sandbox_permissions',
  patchTool.parameters.properties.sandbox_permissions === undefined,
);

const sandboxed = fakeCtx({
  sandboxMode: 'workspace-write',
  approvalOutcome: 'allowed-once',
  files: [
    ['src/a.ts', 'const a = 1;\n'],
    ['src/b.ts', 'const b = 2;\n'],
  ],
});
host.apply(sandboxed, undefined);
const sandboxTool = last.tools.filter((tool) => tool.name === 'patch')[0];
const sandboxParams = sandboxTool.parameters.properties;
ok('有沙箱后端时广告 sandbox_permissions', sandboxParams.sandbox_permissions !== undefined);
ok(
  '提权词表是官方的闭合目标集',
  JSON.stringify(sandboxParams.sandbox_permissions.enum) === '["workspace-write","danger-full-access"]',
);
ok('同时广告 justification', sandboxParams.justification !== undefined);

const escalated = await sandboxTool.execute(
  { patch: twoFilePatch, sandbox_permissions: 'danger-full-access', justification: '需要写工作区外的文件' },
  execCtx,
);
ok('批准后写入成功', last.files.get('src/a.ts') === 'const a = 11;\n');
ok('审批只问一次', last.approvals.length === 1);
ok(
  '审批请求里有模式与理由',
  String(last.approvals[0].reason).includes('danger-full-access') &&
    String(last.approvals[0].reason).includes('需要写工作区外的文件'),
);
ok(
  '提权后的策略只盖这一次调用（writeText 收到 danger-full-access）',
  last.writePolicies.length > 0 && last.writePolicies[0].mode === 'danger-full-access',
);
ok('返回值照常（两个文件都在）', escalated.files.length === 2);

const refused = fakeCtx({
  sandboxMode: 'workspace-write',
  approvalOutcome: 'rejected',
  files: [
    ['src/a.ts', 'const a = 1;\n'],
    ['src/b.ts', 'const b = 2;\n'],
  ],
});
host.apply(refused, undefined);
const refusedTool = last.tools.filter((tool) => tool.name === 'patch')[0];
let refusal = null;
try {
  await refusedTool.execute(
    { patch: twoFilePatch, sandbox_permissions: 'danger-full-access', justification: '想写外面' },
    execCtx,
  );
} catch (error) {
  refusal = error;
}
ok('被拒时抛错', refusal !== null && String(refusal.message).includes('the user rejected'));
ok(
  '被拒时一个字节都没写',
  last.files.get('src/a.ts') === 'const a = 1;\n' && last.files.get('src/b.ts') === 'const b = 2;\n',
);

const noWider = fakeCtx({
  sandboxMode: 'workspace-write',
  standingMode: 'danger-full-access',
  approvalOutcome: 'allowed-once',
});
host.apply(noWider, undefined);
const noWiderTool = last.tools.filter((tool) => tool.name === 'patch')[0];
let notWider = null;
try {
  await noWiderTool.execute(
    { patch: twoFilePatch, sandbox_permissions: 'workspace-write', justification: '缩回去' },
    execCtx,
  );
} catch (error) {
  notWider = error;
}
ok('不是严格更宽时直接拒', notWider !== null && String(notWider.message).includes('not strictly wider'));
ok('不更宽的请求不发审批', last.approvals.length === 0);

let pairing = null;
try {
  await noWiderTool.execute({ patch: twoFilePatch, justification: '只给了理由' }, execCtx);
} catch (error) {
  pairing = error;
}
ok('只给 justification 时拒绝', pairing !== null && String(pairing.message).includes('only valid together'));

// ⑦ 挂载顺序回归：注册时 ctx.sandboxPolicy 还不在，调用时才有 —— 必须用会话工作区当可写根
{
  const late = fakeCtx({
    sandboxMode: 'workspace-write',
    policyReady: false, // 注册那一刻：策略服务尚未挂载
    files: [
      ['src/a.ts', 'const a = 1;\n'],
      ['src/b.ts', 'const b = 2;\n'],
    ],
  });
  host.apply(late, undefined);
  const lateTool = last.tools.filter((tool) => tool.name === 'patch')[0];

  // 策略服务仍然没挂上：宁可拒绝，也不能用「无策略」去写（那会让围栏退回兜底根）
  let unresolved = null;
  try {
    await lateTool.execute({ patch: twoFilePatch }, execCtx);
  } catch (error) {
    unresolved = error;
  }
  ok('围栏在但策略服务缺失时明确拒绝', unresolved !== null);
  ok(
    '拒绝理由点明 ctx.sandboxPolicy missing',
    String(unresolved.message).includes('sandboxPolicy is missing'),
  );
  ok('拒绝时一个字节都没写', last.files.get('src/a.ts') === 'const a = 1;\n');

  // 策略服务挂上后：同一次执行要能拿到**带会话工作区**的策略，写入成功
  last.policyReady = true; // state 才是 fake 的可观测面
  const lateResult = await lateTool.execute({ patch: twoFilePatch }, execCtx);
  ok('策略服务晚挂载也能正常写入（服务每次调用现读）', lateResult.files.length === 2);
  ok(
    '写盘时带的是会话工作区策略（不是兜底根）',
    last.writePolicies.length > 0 && last.writePolicies[last.writePolicies.length - 1].workspaceRoot === '/w',
  );
}

const denied = fakeCtx({
  sandboxMode: 'workspace-write',
  files: [
    ['src/a.ts', 'const a = 1;\n'],
    ['src/b.ts', 'const b = 2;\n'],
  ],
});
host.apply(denied, undefined);
const deniedTool = last.tools.filter((tool) => tool.name === 'patch')[0];
last.fsWriteDenied = true;
let blocked = null;
try {
  await deniedTool.execute({ patch: twoFilePatch }, execCtx);
} catch (error) {
  blocked = error;
}
ok('文件策略拒绝时抛出可读错误', blocked !== null);
ok(
  '拒绝消息用官方的 [sandbox: …] 标记',
  String(blocked.message).includes('[sandbox: file access denied under workspace-write mode]'),
);
ok('拒绝消息带同轮次的提权提示', String(blocked.message).includes('[sandbox: escalation available'));
ok(
  '拒绝消息与官方逐字一致（两行 marker，不带任何额外说明）',
  String(blocked.message) ===
    '[sandbox: file access denied under workspace-write mode]\n' +
      '[sandbox: escalation available — retry this exact operation once with sandbox_permissions ' +
      '(the narrowest wider mode that suffices) + justification; the approval prompt asks the user]',
);
ok(
  '拒绝仍带着 FS_SANDBOX_DENIED 码（ToolRuntime 才会填 result.error.code，与 edit 一致）',
  blocked.code === 'FS_SANDBOX_DENIED',
);
ok('Host 侧留下诊断日志（路径 / 模式 / 可写根）', denials.length === 1 && denials[0].includes('src/a.ts'));
ok('被拒时文件没有被改（fail-closed）', last.files.get('src/a.ts') === 'const a = 1;\n');

let garbage = null;
try {
  await brokenTool.execute({ patch: '这里没有 diff' }, execCtx);
} catch (error) {
  garbage = error;
}
ok('没有可解析的 hunk 时给出可照做的中文报错', garbage !== null && String(garbage.message).includes('hunk'));

// ── 写前预检：越界目标必须在任何写入之前被拦下 ────────────────────────────────

const { assertWritable, writableRootsUnder } = host;
ok(
  'workspace-write 的可写根 = 工作区 + /tmp + 平台临时目录',
  writableRootsUnder({ mode: 'workspace-write', workspaceRoot: '/w' }).length >= 2,
);
await assertWritable({ mode: 'workspace-write', workspaceRoot: '/w' }, '/w/src/a.ts');
ok('工作区内的目标放行', true);
await assertWritable({ mode: 'danger-full-access', workspaceRoot: '/w' }, '/anywhere/x.ts');
ok('danger-full-access 直接放行', true);
await assertWritable({ mode: 'workspace-write', workspaceRoot: '/w' }, '/tmp/x.ts');
ok('临时目录放行（与围栏口径一致）', true);
await assertWritable(undefined, '/anywhere/x.ts');
ok('没有策略（未装围栏）时不做预检', true);
await assertWritable({ mode: 'workspace-write', workspaceRoot: '/w' }, 'relative/x.ts');
ok('相对路径不做预检（交给真围栏判）', true);

for (const [label, policy, target] of [
  ['工作区外的目标被预检拦下', { mode: 'workspace-write', workspaceRoot: '/w' }, '/outside/x.ts'],
  ['read-only 下任何目标都被拦下', { mode: 'read-only', workspaceRoot: '/w' }, '/w/src/a.ts'],
]) {
  let preflightBlocked = null;
  try {
    await assertWritable(policy, target);
  } catch (error) {
    preflightBlocked = error;
  }
  ok(label, preflightBlocked !== null);
  ok(
    label + '：消息与围栏一致（两行 marker + 可提权提示）',
    String(preflightBlocked.message).includes('[sandbox: file access denied under '),
  );
  ok(label + '：带 FS_SANDBOX_DENIED 码', preflightBlocked.code === 'FS_SANDBOX_DENIED');
}

// 集成：批量里混进一个工作区外的文件 → 工作区内那个也不能被写
{
  const mixed = fakeCtx({
    sandboxMode: 'workspace-write',
    files: [
      ['/w/inside.txt', 'inside\n'],
      ['/w/src/a.ts', 'const a = 1;\n'],
      ['/w/src/b.ts', 'const b = 2;\n'],
    ],
  });
  host.apply(mixed, undefined);
  const mixedTool = last.tools.filter((tool) => tool.name === 'patch')[0];
  // 前两个文件在工作区内，第三个是绝对路径的工作区外目标
  const outsidePatch = [
    '--- /dev/null',
    '+++ b//w/new-inside.txt',
    '@@ -0,0 +1,1 @@',
    '+ok',
    '--- /dev/null',
    '+++ b//outside/evil.txt',
    '@@ -0,0 +1,1 @@',
    '+nope',
  ].join('\n');
  let mixedBlocked = null;
  try {
    await mixedTool.execute({ patch: outsidePatch }, execCtx);
  } catch (error) {
    mixedBlocked = error;
  }
  ok('混入越界文件时整体失败', mixedBlocked !== null);
  ok('越界的那个文件没被创建', last.files.has('/outside/evil.txt') === false);
  ok(
    '同一个 patch 里合法的那个文件也没被写（写前预检 => 原子性）',
    last.files.has('/w/new-inside.txt') === false,
  );
}

console.info = realInfo;
console.warn = realWarn;
console.log('✓ @dshp/file-change-viewer host: ' + checks + ' 项断言全部通过');
