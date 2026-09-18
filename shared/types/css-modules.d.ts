/**
 * `*.module.css` 的类型声明 —— 全仓唯一一份，各插件共享。
 *
 * 作用相当于 Vue 项目里的 `vite/client`：框架侧提供声明，**开发者侧只有 CSS，不产生任何
 * 按文件生成的 `.d.ts`**。写 `styles.module.css`、组件里 `styles.card` 就能用，不需要跑任何命令。
 *
 * 代价是这类映射是「宽松」的：`styles.拼错` 不是编译错误，运行时是 `undefined`，React 会静默
 * 丢掉 className。这是刻意的取舍——精确到键的声明必须按文件生成、且要跟 CSS 同步（TypeScript
 * 不给 `.css` 补 `.d.ts`，还得开 allowArbitraryExtensions），那份机械比它挡住的问题更重。
 * 拼错的类名由 `scripts/check-client.mjs` 的渲染断言兜（它按类名找元素，找不到就红）。
 */
declare module '*.module.css' {
  const classes: Record<string, string>;
  export default classes;
}
