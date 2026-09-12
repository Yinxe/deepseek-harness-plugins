import { defineConfig } from 'tsup';

const jsOnly = () => ({ js: '.js' });

export default defineConfig([
  // Host（Node）：src/host/index.ts → lib/host.js（单文件 ESM）
  // schemastery / yaml 内联，运行时零依赖；dts 暂关（tsup 8 dts 与 TS7 不兼容，后续用 api-extractor 补）
  // banner：yaml 内部有 CJS 式 require('process')，ESM 产物里用 createRequire 兜住
  {
    entry: { host: 'src/host/index.ts' },
    outDir: 'lib',
    format: ['esm'],
    platform: 'node',
    target: 'node20',
    bundle: true,
    splitting: false,
    sourcemap: false,
    dts: false,
    clean: false,
    minify: false,
    treeshake: true,
    banner: {
      js: "import { createRequire as __dshpCreateRequire } from 'node:module';\nconst require = __dshpCreateRequire(import.meta.url);",
    },
    noExternal: ['@deepseek-ai/schemastery', '@deepseek-ai/cosmokit', '@standard-schema/spec', 'yaml'],
    outExtension: jsOnly,
  },
  // Client（浏览器）：src/client/index.ts → lib/client.js（单文件，内含 __ModuleLoader__.load）
  {
    entry: { client: 'src/client/index.ts' },
    outDir: 'lib',
    format: ['iife'],
    platform: 'browser',
    target: 'es2020',
    bundle: true,
    splitting: false,
    sourcemap: false,
    dts: false,
    clean: false,
    minify: false,
    treeshake: true,
    external: ['react', '@deepseek-ai/dsh-client-ui-primitives'],
    outExtension: jsOnly,
  },
]);
