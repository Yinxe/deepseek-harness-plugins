import { readFileSync } from 'node:fs';
import { defineConfig } from 'tsup';

/**
 * 包元信息在构建期注入 client bundle：分享面板页头要显示「插件名 + 版本 + 仓库」，
 * 而这三样只能有一个来源（package.json）—— 写死字面量迟早与它漂移。
 * 仓库地址取 `homepage`，去掉协议与 `#readme` 尾巴：图里给人看的是可读的域名路径。
 */
const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as {
  name: string;
  version: string;
  homepage?: string;
};
const PKG_INFO = {
  name: pkg.name,
  version: pkg.version,
  repo: String(pkg.homepage ?? '')
    .replace(/^https?:\/\//, '')
    .replace(/#.*$/, ''),
};

const jsOnly = () => ({ js: '.js' });

export default defineConfig([
  // Host（Node）：src/host/index.ts → lib/host.js（单文件 ESM）
  // schemastery 内联，运行时零依赖；dts 暂关（tsup 8 dts 与 TS7 不兼容，后续用 api-extractor 补）
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
    noExternal: ['@deepseek-ai/schemastery', '@deepseek-ai/cosmokit', '@standard-schema/spec'],
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
    define: { __DSHP_TOKEN_METER_PKG__: JSON.stringify(PKG_INFO) },
  },
]);
