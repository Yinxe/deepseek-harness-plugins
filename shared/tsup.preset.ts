/**
 * `@dshp/*` 插件的构建预设（全仓唯一一份）。
 *
 * 每个插件的 `tsup.config.ts` 只该是薄薄一层：
 *
 * ```ts
 * import { pluginBuild } from '../../shared/tsup.preset.js';
 * export default pluginBuild('@dshp/<name>');
 * ```
 *
 * 这样做是照参考项目 dsh-web 的分层：那边 20 个包的 `tsdown.config.ts` 大多只有 11–22 行，
 * 全部委托给 `shared/tsdown.client.ts`；构建细节（closure 工厂壳、CSS Modules 内联、externals）
 * 只在那一个文件里维护。把机制抄进每个包 = 8 份要同步的副本。
 *
 * 预设产出**两个 bundle**：
 *
 * - **Host**（`src/host/index.ts` → `lib/host.js`）：单文件 ESM，`noExternal` 的第三方内联进去，
 *   运行时零依赖。
 * - **Client**（`src/client/index.tsx` → `lib/client.js`）：单文件 CJS + banner / footer 拼出的
 *   `__ModuleLoader__.load({ id, factory })` 注册壳。react / react/jsx-runtime / 官方 primitives
 *   留在 external（由 shell 的冻结模块表注入，绝不打包）。
 *
 * `lightningcss` 与 `tsup` 声明在**仓库根**的 devDependencies：本文件位于 `shared/`，
 * 依赖解析向上走到根 `node_modules`，所以各插件不必重复声明构建工具。
 *
 * @module @dshp/shared/tsup.preset
 */
import { readFileSync } from 'node:fs';
import { relative, resolve as resolvePath, sep } from 'node:path';
import type { Plugin } from 'esbuild';
import { transform } from 'lightningcss';
import type { Options } from 'tsup';

/** 所有 client bundle 共用的 externals：由 shell 的冻结模块表注入，绝不打包。 */
const CLIENT_EXTERNALS = ['react', 'react/jsx-runtime', '@deepseek-ai/dsh-client-ui-primitives'];

/** 所有 host bundle 默认内联的第三方（内联进去 = 运行时零依赖）。 */
const HOST_INLINE = ['@deepseek-ai/schemastery', '@deepseek-ai/cosmokit', '@standard-schema/spec'];

/**
 * 虚拟模块 id 的前后缀。
 *
 * **后缀必须是 `.mjs`，绝不能是 `.css`** —— 这是本预设最不显然的一处，踩过一次：
 *
 * tsup 内置的 postcss 插件注册的是 `onLoad({ filter: /\.css$/ })`，**没有写 namespace**；
 * 而 esbuild 的语义是「不写 namespace = 匹配任意 namespace」。它又排在 `esbuildPlugins` 之前，
 * 于是即便我们的 `onResolve` 已经把模块划进 `dsh-css-module` 命名空间，postcss 那个 onLoad 仍然
 * 会先把它抢走、按普通 CSS 输出成**第二个产物文件 lib/client.css**（而且全程不报错）。
 *
 * 把虚拟 id 的结尾换成非 `.css`，postcss 的 filter 就匹配不上，onLoad 才轮到我们。
 * 上游 dsh-web 的 `shared/tsdown.client.ts` 里有一段同样的注释（他们那边是 tsdown 的 css 管线）：
 * "the suffix matters: tsdown's guard matches ids ending in `.css`, so the virtual id must not."
 *
 * 前缀**刻意不用 rollup 惯例的 `\0`**：esbuild 会把模块 id 原样写进产物里的模块分界注释
 * （`// <namespace>:<id>`），NUL 字节就跟着进了 lib/client.js。行注释里它虽然合法，但没有理由
 * 让一个可提交的产物里躺着控制字符。自定义命名空间本身就够隔离，前缀只是给 onLoad 反解用。
 */
const VIRTUAL_PREFIX = 'dsh-css:';
const VIRTUAL_SUFFIX = '.mjs';

/**
 * `*.module.css` 的内联插件。
 *
 * 产物的硬约束是**只有一个 JS 文件**：插件不能带第二个 HTTP 资源，所以不能像普通前端那样另出一个
 * `.css`。这里在构建期把样式表编译好，把**文本与类名映射一起塞进 bundle**，模块被求值时就地插一条
 * `<style data-plugin>`——与 dsh-web 同款做法。
 *
 * 用 lightningcss 而不是 esbuild 自带的 css loader：后者的 CSS Modules 只会把样式写进独立的 CSS
 * 产物，拿不到「文本 + 类名映射」这一对；lightningcss 的 `cssModules` 一次给全。
 *
 * `filename` 传**相对仓库的路径**而不是绝对路径：lightningcss 的 `[hash]` 会把文件名混进哈希，用
 * 绝对路径会让每台机器构建出的类名都不一样，而 `lib/` 是提交物——那样每次构建都是一次无意义 diff。
 *
 * @param id - 插件 id（= 包名），写进样式标签的归属属性。
 * @returns esbuild 插件。
 */
function cssModulesInline(id: string): Plugin {
  /** 非 module 的 CSS 直接报错，而不是落到 esbuild 手里悄悄多出一个 .css 产物。 */
  const REJECT_PLAIN_CSS = {
    errors: [
      {
        text:
          'client bundle 里只允许 *.module.css（构建预设会把它内联进单个 lib/client.js）。' +
          '普通 .css 会被 esbuild 写成第二个文件，破坏「产物只有一个 JS」的契约——请改名为 *.module.css。',
      },
    ],
  };

  return {
    name: 'dsh-css-modules-inline',
    setup(build) {
      build.onResolve({ filter: /\.css$/ }, (args) => {
        if (!args.path.endsWith('.module.css')) return REJECT_PLAIN_CSS;
        const absolute = resolvePath(args.resolveDir, args.path);
        const assetId = relative(process.cwd(), absolute).split(sep).join('/');
        // 返回**虚拟 id**（见 VIRTUAL_SUFFIX 的说明），而不是真实路径。
        return { path: VIRTUAL_PREFIX + assetId + VIRTUAL_SUFFIX, namespace: 'dsh-css-module' };
      });

      build.onLoad({ filter: /.*/, namespace: 'dsh-css-module' }, (args) => {
        const assetId = args.path.slice(VIRTUAL_PREFIX.length, -VIRTUAL_SUFFIX.length);
        /**
         * 喂给 lightningcss 当 `[hash]` 输入的名字。
         *
         * **必须把插件 id 混进去**：8 个插件的样式表相对路径一模一样
         * （`src/client/styles.module.css`），只拿它当 filename 会让每个插件生成**完全相同**的
         * `<hash>_<local>`——而 `.card` / `.title` / `.body` / `.stat` / `.desc` 这种局部名在
         * 插件之间大量重名，于是谁后注入谁覆盖，样式在插件之间互相串味。真实踩过：token-meter 的
         * `.stat{display:flex;flex-direction:column;border-radius:12px}` 把 file-change-viewer
         * 行头那对 `+N -M` 统计打成了**上下两行**（而且带上了 token-meter 的卡片边框），
         * 排查了半天才发现是类名撞车。
         *
         * 用 `<包名>/<相对路径>`：按插件唯一，而且仍然是**机器无关**的（不含绝对路径），
         * 所以 `lib/` 作为提交物在任何人机器上都能重打出同样的类名。
         */
        const hashName = id + '/' + assetId;
        const { code, exports } = transform({
          filename: hashName,
          code: readFileSync(resolvePath(process.cwd(), assetId)),
          cssModules: { pattern: '[hash]_[local]' },
          minify: true,
        });

        // 类名映射按 local 名排序：lightningcss 的 exports 迭代顺序依赖进程内的哈希种子，
        // 不排序会让 lib/client.js 每次构建都抖一次。
        // 注意先赋值再排（而不是内联 `.sort()`）：`Object.entries` 出来的是新数组，就地排是安全的，
        // 但 oxlint 的 unicorn/no-array-sort 只认这种「排一个具名数组」的写法。
        const classMap: Record<string, string> = {};
        const entries = Object.entries(exports ?? {});
        entries.sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
        for (const [local, entry] of entries) {
          classMap[local] = entry.name;
        }

        // 生成的模块：把 CSS 文本与类名映射一起交给运行时。
        // 每个 .module.css 一条 <style>：data-plugin 供 shell 在插件卸载时清理，
        // data-plugin-css 供自己判重（模块重复求值时不重复插）。
        const css = JSON.stringify(code.toString());
        const tagId = JSON.stringify(`${id}/${assetId}`);
        const pluginId = JSON.stringify(id);
        return {
          loader: 'js',
          contents: `
const css = ${css};
const tagId = ${tagId};
if (typeof document !== 'undefined' && document.querySelector(\`style[data-plugin-css="\${tagId}"]\`) === null) {
  const tag = document.createElement('style');
  tag.setAttribute('data-plugin', ${pluginId});
  tag.setAttribute('data-plugin-css', tagId);
  tag.textContent = css;
  document.head.appendChild(tag);
}
export default ${JSON.stringify(classMap)};
`,
        };
      });
    },
  };
}

/** `pluginBuild` 的选项。 */
export interface PluginBuildOptions {
  /** host 半入口（相对插件根）；`null` = 没有 host 半。 */
  host?: string | null;
  /** client 半入口（相对插件根）；`null` = 没有 client 半。 */
  client?: string | null;
  /** host 侧额外内联进 bundle 的第三方（见 `HOST_INLINE`）。 */
  inline?: readonly string[];
  /** client 侧额外保留为 external 的模块。 */
  external?: readonly string[];
}

/**
 * 造一个插件的 tsup 配置。
 *
 * @param id - 插件 id，必须等于包名（它同时是 `__ModuleLoader__.load` 的 id 与样式标签归属）。
 * @param options - 入口与依赖清单覆盖；缺省即本仓标准形态（host + client 双 bundle）。
 * @returns tsup 配置数组。
 */
export function pluginBuild(id: string, options: PluginBuildOptions = {}): Options[] {
  const hostEntry = options.host === undefined ? 'src/host/index.ts' : options.host;
  const clientEntry = options.client === undefined ? 'src/client/index.tsx' : options.client;
  const configs: Options[] = [];

  if (hostEntry !== null) {
    configs.push({
      entry: { host: hostEntry },
      outDir: 'lib',
      format: ['esm'],
      platform: 'node',
      target: 'node20',
      bundle: true,
      splitting: false,
      sourcemap: false,
      // dts 暂关（tsup 8 的 dts 与 TS 7 不兼容），以后补类型用 api-extractor
      dts: false,
      // 双 entry 分两次写同一 outDir：clean 会互相删
      clean: false,
      minify: false,
      treeshake: true,
      noExternal: [...HOST_INLINE, ...(options.inline ?? [])],
      outExtension: () => ({ js: '.js' }),
    });
  }

  if (clientEntry !== null) {
    configs.push({
      entry: { client: clientEntry },
      outDir: 'lib',
      // 必须是 cjs：external 的 import 才编译成 require('react')，由 factory 的形参 require
      // （shell 的冻结模块表）解析；iife 只会去找全局变量。
      format: ['cjs'],
      platform: 'browser',
      target: 'es2020',
      bundle: true,
      splitting: false,
      sourcemap: false,
      dts: false,
      clean: false,
      minify: false,
      // treeshake 会在 esbuild 产物上再跑一遍 rollup，容易把 banner/footer 拼出的 CJS 壳搅碎
      treeshake: false,
      external: [...CLIENT_EXTERNALS, ...(options.external ?? [])],
      // 必须走 tsup 顶层的 `esbuildPlugins`。**不能**在 `esbuildOptions` 里往 `options.plugins`
      // 追加：tsup 把 esbuildOptions 塞进一个名为 modify-options 的插件，那时 esbuild 的插件列表
      // 已经定下来了，追加是静默无效的（CSS 会照旧落到第二个产物文件上，且不报任何错）。
      esbuildPlugins: [cssModulesInline(id)],
      esbuildOptions(esbuild) {
        // 不依赖 esbuild 是否正确读到 tsconfig 的 jsx 字段（tsconfig 里也开了 react-jsx）
        esbuild.jsx = 'automatic';
      },
      banner: {
        js: `window.__ModuleLoader__.load({ id: ${JSON.stringify(id)}, factory: (require) => { var module = { exports: {} }; var exports = module.exports;`,
      },
      footer: { js: 'return module.exports; } });' },
      outExtension: () => ({ js: '.js' }),
    });
  }

  return configs;
}
