#!/usr/bin/env node
// 生成 release notes（latest 滚动预发布 / 手动后缀预发布共用）。
// 按 dist/*.tgz 实际产物反向定位 plugins/<name>/package.json，
// 提取包名、版本与描述；描述按首个中文字符拆分为 EN / 中文 两行展示。
// 环境变量：GITHUB_REPOSITORY、GITHUB_SHA、SUFFIX、NOTES_HEADER、NOTES_HINT。
'use strict';

const fs = require('fs');

const repo = process.env.GITHUB_REPOSITORY || '';
const suffix = process.env.SUFFIX || 'latest';
const header = process.env.NOTES_HEADER || '';
const hint = process.env.NOTES_HINT || '';

const files = fs
  .readdirSync('dist')
  .filter((f) => f.endsWith('.tgz'))
  .sort();

const out = [header];
if (hint) out.push(hint);
out.push('', '## 插件下载与安装（固定地址）', '');

const tail = `-${suffix}.tgz`;
for (const file of files) {
  const url = `https://github.com/${repo}/releases/download/${suffix}/${file}`;
  const short =
    file.startsWith('dshp-') && file.endsWith(tail)
      ? file.slice('dshp-'.length, file.length - tail.length)
      : file.replace(/\.tgz$/, '');

  let name = short;
  let version = '';
  let desc = '';
  const pkgFile = `plugins/${short}/package.json`;
  if (fs.existsSync(pkgFile)) {
    const pkg = JSON.parse(fs.readFileSync(pkgFile, 'utf8'));
    name = pkg.name || short;
    version = pkg.version || '';
    desc = (pkg.description || '').trim();
  }

  const cjk = desc.search(/[\u4e00-\u9fff]/);
  // 双语拆分时兜底剥离 EN 句尾误混入的拉丁片段（如 "…page. AI"）
  const en =
    cjk >= 0
      ? desc
          .slice(0, cjk)
          .trim()
          .replace(/\.\s*[A-Za-z0-9_-]+$/, '')
          .replace(/[\s.]+$/, '')
      : desc;
  const zh = cjk >= 0 ? desc.slice(cjk).trim() : '';

  out.push(`### ${name}${version ? ` \`${version}\`` : ''}`, '');
  out.push(`- 下载：[${file}](${url})`);
  out.push(`- 安装：\`dsh --profile web add ${url}\``);
  if (en) out.push(`- EN: ${en}`);
  if (zh) out.push(`- 中文：${zh}`);
  out.push('');
}

fs.writeFileSync('notes.md', out.join('\n'));
