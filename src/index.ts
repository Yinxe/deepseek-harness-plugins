/**
 * deepseek-harness-plugins - 入口
 */

export function hello(name = "world"): string {
  return `Hello, ${name}!`;
}

// 直接运行时打印（tsx / node 都可）
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(hello());
}
