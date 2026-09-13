import { defineConfig } from 'tsup';

const jsOnly = () => ({ js: '.js' });

export default defineConfig([
  // Host（Node）：src/host/index.ts → lib/host.js（单文件 ESM）
  // 本插件 Host 半零第三方依赖（无 settings/路由/工具），故无 noExternal 内联项；
  // dts 暂关（tsup 8 dts 与 TS7 不兼容，后续用 api-extractor 补）
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
    outExtension: jsOnly,
  },
  // Client（浏览器）：src/client/index.ts → lib/client.js（单文件，内含 __ModuleLoader__.load）
  // react / primitives 由 DSH 运行时注入，绝不打包（external）
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
