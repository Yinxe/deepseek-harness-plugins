/**
 * themes.ts —— client 画廊主题 meta（token 由 Host 下发，这里只存展示信息）。
 *
 * swatch：卡片三色拼接 + 搜索 accent（= src/host/themes 各模块 meta.swatch）；
 * token 单源 src/host/themes，client 只按需向 GET /themes 要，绝不内联进 bundle。
 * 顺序即画廊展示顺序，必须与 Host 目录（src/host/themes/index.ts）逐项一致——
 * scripts/check-themes.mjs 会校验，不一致直接非零退出。
 *
 * 原实现：dsh-custom-ui/client.js 内联 THEMES（已去掉不再使用的 group 字段）。
 *
 * @module @dshp/web-style/client
 */
import type { ThemeMeta } from './types.js';

export const THEMES: ThemeMeta[] = [
  {
    id: 'opencode-terminal-dark',
    colorScheme: 'dark',
    label: 'OpenCode 暱夜终端',
    desc: '暖黑 #201d1d + Apple 蓝，全站 mono',
    swatch: ['#201d1d', '#302c2c', '#007aff', '#30d158'],
  },
  {
    id: 'opencode-terminal-light',
    colorScheme: 'light',
    label: 'OpenCode 纸感终端',
    desc: '暖白 #fdfcfc + 暖灰层次',
    swatch: ['#fdfcfc', '#f1eeee', '#201d1d', '#007aff'],
  },
  {
    id: 'github-dark',
    colorScheme: 'dark',
    label: 'GitHub 暗色 Primer',
    desc: '#0d1117 + Primer 蓝 #2f81f7',
    swatch: ['#0d1117', '#161b22', '#2f81f7', '#3fb950'],
  },
  {
    id: 'github-light',
    colorScheme: 'light',
    label: 'GitHub 亮色 Primer',
    desc: '纯白 + #0969da + 绿色按钮',
    swatch: ['#ffffff', '#f6f8fa', '#0969da', '#1f883d'],
  },
  {
    id: 'linear-dark',
    colorScheme: 'dark',
    label: 'Linear 暗夜无彩',
    desc: '近黑 #08090a + Indigo #5e6ad2',
    swatch: ['#08090a', '#191a1b', '#5e6ad2', '#f7f8f8'],
  },
  {
    id: 'notion-light',
    colorScheme: 'light',
    label: 'Notion 暖白极简',
    desc: '纯白 + 暖灰 + Notion 蓝',
    swatch: ['#ffffff', '#f6f5f4', '#31302e', '#0075de'],
  },
  {
    id: 'claude-parchment-light',
    colorScheme: 'light',
    label: 'Claude 羊皮纸',
    desc: '羊皮纸 #f5f4ed + 赤陶 #c96442',
    swatch: ['#f5f4ed', '#faf9f5', '#c96442', '#141413'],
  },
  {
    id: 'nvidia-dark',
    colorScheme: 'dark',
    label: 'NVIDIA 硬核绿',
    desc: '纯黑 #000 + 信号绿 #76b900',
    swatch: ['#000000', '#1a1a1a', '#76b900', '#ffffff'],
  },
  {
    id: 'replicate-light',
    colorScheme: 'light',
    label: 'Replicate 开发者红',
    desc: '纯白 #ffffff + 品牌红 #ea2804',
    swatch: ['#ffffff', '#f8f8f8', '#ea2804', '#202020'],
  },
  {
    id: 'cisco-dark',
    colorScheme: 'dark',
    label: 'Cisco 信任蓝',
    desc: '藏青 #0f1720 + 信号蓝 #049fd9',
    swatch: ['#0f1720', '#1b2530', '#049fd9', '#ffffff'],
  },
  {
    id: 'neobrutalism-light',
    colorScheme: 'light',
    label: 'Neobrutalism 粗野拼贴',
    desc: '奶油 #fff4cf + 橘红 #d24b1f',
    swatch: ['#fff4cf', '#fffaf0', '#d24b1f', '#2a1810'],
  },
  {
    id: 'mission-control-dark',
    colorScheme: 'dark',
    label: 'Mission Control 深空',
    desc: '深空 #090b12 + 指挥蓝 #60a5fa',
    swatch: ['#090b12', '#121722', '#60a5fa', '#f8fafc'],
  },
  {
    id: 'levels-light',
    colorScheme: 'light',
    label: 'Levels 纸感评审',
    desc: '米纸 #fbf7ef + 代谢绿 #2f8f46',
    swatch: ['#fbf7ef', '#ffffff', '#2f8f46', '#1f2a24'],
  },
  {
    id: 'arc-light',
    colorScheme: 'light',
    label: 'Arc 蜜桃珊瑚',
    desc: '蜜桃 #fdf3ec + 珊瑚 #ff5f5f',
    swatch: ['#fdf3ec', '#ffffff', '#ff5f5f', '#1a1a1f'],
  },
  {
    id: 'luxury-dark',
    colorScheme: 'dark',
    label: 'Luxury 鎏金黑',
    desc: '曜石 #080706 + 鎏金 #c6a15b',
    swatch: ['#080706', '#151310', '#c6a15b', '#fff8ea'],
  },
  {
    id: 'skeumorphism-light',
    colorScheme: 'light',
    label: 'Skeumorphism 拟物陶土',
    desc: '陶土 #f7eee6 + 陶釉 #b46a46',
    swatch: ['#f7eee6', '#fff8f1', '#b46a46', '#2b211c'],
  },
  {
    id: 'wechat-light',
    colorScheme: 'light',
    label: 'WeChat 微信绿',
    desc: '浅灰 #ededed + 微信绿 #07c160',
    swatch: ['#ededed', '#f7f7f7', '#07c160', '#1a1a1a'],
  },
  {
    id: 'xiaohongshu-light',
    colorScheme: 'light',
    label: '小红书 种草红',
    desc: '米灰 #f5f5f5 + 种草红 #ff2442',
    swatch: ['#f5f5f5', '#ffffff', '#ff2442', 'rgba(0, 0, 0, 0.8)'],
  },
  {
    id: 'discord-dark',
    colorScheme: 'dark',
    label: 'Discord Blurple夜',
    desc: '深灰 #313338 + Blurple #5865f2',
    swatch: ['#313338', '#2b2d31', '#5865f2', '#dbdee1'],
  },
  {
    id: 'supabase-dark',
    colorScheme: 'dark',
    label: 'Supabase 翡翠夜',
    desc: '墨黑 #171717 + 翡翠绿 #3ecf8e',
    swatch: ['#171717', '#1c1c1c', '#3ecf8e', '#fafafa'],
  },
  {
    id: 'nebula-dark',
    colorScheme: 'dark',
    label: 'Nebula 星云紫',
    desc: '紫黑 #0d0a1a + 霓紫 #8b5cf6',
    swatch: ['#0d0a1a', '#161230', '#8b5cf6', '#f1edfd'],
  },
  {
    id: 'sakura-light',
    colorScheme: 'light',
    label: 'Sakura 樱粉',
    desc: '樱白 #fff9fa + 樱粉 #e75480',
    swatch: ['#fff9fa', '#fbeef2', '#e75480', '#432635'],
  },
  {
    id: 'tide-dark',
    colorScheme: 'dark',
    label: 'Tide 潮汐青',
    desc: '深青 #062a2c + 潮汐 #2dd4bf',
    swatch: ['#062a2c', '#0b3538', '#2dd4bf', '#eafaf8'],
  },
];

/** 内置主题的画廊显示名（light/dark 也能在画廊里被切回）。 */
export const BUILTIN_LABELS: Record<'light' | 'dark', string> = {
  light: '浅色（内置）',
  dark: '深色（内置）',
};

/** 壁纸取色虚拟主题 id（与 Host 白名单的 photo:custom 一致）。 */
export const PHOTO_ID = 'photo:custom';
