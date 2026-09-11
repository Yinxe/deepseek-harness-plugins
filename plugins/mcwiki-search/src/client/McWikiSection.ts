/**
 * McWikiSection（设置 → Minecraft Wiki 搜索）
 * 由原 client.js createSection() 等价改写：React.createElement 写法保留（不用 JSX，
 * 避免引入 jsx 运行时配置），逻辑逐行对齐。
 *
 * 设置页：查看数据源状态、运行搜索/页面抓取测试，直接看到「转换后的 AI 可读文本」。
 */
import { fetchState, runTest, saveConfig } from './api.js';
import { createComponents } from './components.js';
import type { AnyPrimitives, AnyReact, McWikiConfig, StateResponse, TestResponse } from './types.js';

export function createMcWikiSection(React: AnyReact, P: AnyPrimitives): () => any {
  const { Badge, Row } = createComponents(React, P);

  function McWikiSettingsSection(): any {
    const [info, setInfo] = React.useState(null as StateResponse | null);
    const [cfg, setCfg] = React.useState(null as McWikiConfig | null);
    const [cfgBusy, setCfgBusy] = React.useState(false as boolean);
    const [stateErr, setStateErr] = React.useState(null as string | null);
    const [notice, setNotice] = React.useState(null as { kind: string; text: string } | null);
    const [busy, setBusy] = React.useState(null as 'search' | 'page' | null);
    const [query, setQuery] = React.useState('' as string);
    const [result, setResult] = React.useState(null as TestResponse | null);
    const [title, setTitle] = React.useState('' as string);
    const [pageResult, setPageResult] = React.useState(null as TestResponse | null);

    const load = React.useCallback(() => {
      fetchState()
        .then((value) => {
          if (value && value.ok) {
            setInfo(value);
            setCfg((value && value.config) || null);
            setStateErr(null);
          } else setStateErr((value && value.error) || '无法读取插件状态');
        })
        .catch((error: unknown) => setStateErr(String((error as Error)?.message ?? error)));
    }, []);
    React.useEffect(() => {
      load();
    }, [load]);

    const saveCfg = (): void => {
      if (cfg === null) return;
      setCfgBusy(true);
      setNotice(null);
      saveConfig(cfg)
        .then((value) => {
          setCfgBusy(false);
          if (value && value.ok) {
            setCfg(value.config ?? null);
            setNotice({ kind: 'ok', text: '配置已保存到 settings.yaml（dshp-mcwiki-search），即时生效。' });
            load();
          } else setNotice({ kind: 'err', text: (value && value.error) || '保存失败' });
        })
        .catch((error: unknown) => {
          setCfgBusy(false);
          setNotice({ kind: 'err', text: String((error as Error)?.message ?? error) });
        });
    };

    const runSearch = (): void => {
      const q = query.trim();
      if (q.length === 0) {
        setNotice({ kind: 'err', text: '先输入一个测试查询。' });
        return;
      }
      setBusy('search');
      setNotice(null);
      setResult(null);
      runTest(q, 'search')
        .then((value) => {
          setBusy(null);
          setResult(value || { ok: false, error: '无响应' });
        })
        .catch((error: unknown) => {
          setBusy(null);
          setResult({ ok: false, error: String((error as Error)?.message ?? error) });
        });
    };

    const runPage = (): void => {
      const t = title.trim();
      if (t.length === 0) {
        setNotice({ kind: 'err', text: '先输入一个页面标题。' });
        return;
      }
      setBusy('page');
      setNotice(null);
      setPageResult(null);
      runTest(t, 'page')
        .then((value) => {
          setBusy(null);
          setPageResult(value || { ok: false, error: '无响应' });
        })
        .catch((error: unknown) => {
          setBusy(null);
          setPageResult({ ok: false, error: String((error as Error)?.message ?? error) });
        });
    };

    const children: any[] = [];
    children.push(
      React.createElement(
        'p',
        { className: 'mw-intro' },
        '直接从 Minecraft Wiki（MediaWiki API）查询，并把搜索结果 / 页面全文完整转换为 AI 可直接阅读的干净文本（去模板、去引用、wikitext→Markdown）。模型工具默认完整输出、不截断，所有信息与细节都会保留。可用工具：mcwiki_search、mcwiki_get_page、mcwiki_random。',
      ),
    );

    if (stateErr)
      children.push(
        React.createElement('p', { className: 'mw-notice mw-notice-err' }, '状态读取失败：' + stateErr),
      );
    if (notice)
      children.push(
        React.createElement('p', { className: 'mw-notice mw-notice-' + notice.kind }, notice.text),
      );

    /* ── 数据源状态（官方行）：端点写死中文站（api.ts API_BASE），不可配置 ── */
    const siteBadge =
      info === null
        ? React.createElement(Badge, { kind: 'muted', text: '读取中…' })
        : React.createElement(Badge, { kind: 'ok', text: '中文 Minecraft Wiki' });
    children.push(
      React.createElement(
        'div',
        { className: 'mw-section' },
        React.createElement('div', { className: 'mw-sectionHead' }, '数据源'),
        React.createElement(Row, { label: '数据源', desc: '搜索与页面抓取的目标站点。' }, siteBadge),
        React.createElement(
          Row,
          { label: '密钥', desc: '无需注册，公开接口直接调用。' },
          React.createElement(Badge, { kind: 'ok', text: '免费公开 API' }),
        ),
        React.createElement(
          Row,
          { label: '模型工具', desc: '注册给模型的三个查询工具。' },
          React.createElement(
            'span',
            { className: 'mw-hint' },
            ((info && info.tools) || ['mcwiki_search', 'mcwiki_get_page', 'mcwiki_random']).join('、'),
          ),
        ),
      ),
    );

    /* ── 配置（官方行 + Input）── */
    /* 数字行：右侧输入 + 单位后缀，desc 随行 */
    const numInput = (key: keyof McWikiConfig, unit: string | null): any =>
      React.createElement(
        'span',
        { className: 'mw-control' },
        React.createElement(
          'div',
          { className: 'mw-inputWrap', style: { width: 96 } },
          React.createElement('input', {
            className: 'mw-input',
            style: { textAlign: 'right', fontVariantNumeric: 'tabular-nums' },
            inputMode: 'numeric',
            disabled: cfgBusy || cfg === null,
            value: cfg === null ? '' : String(cfg[key]),
            onChange: (event: { target: { value: string } }) => {
              const v = event.target.value;
              setCfg((prev: McWikiConfig | null) =>
                prev === null ? prev : { ...prev, [key]: v === '' ? 0 : Number(v) },
              );
            },
          }),
        ),
        unit ? React.createElement('span', { className: 'mw-unit' }, unit) : null,
      );
    children.push(
      React.createElement(
        'div',
        { className: 'mw-section' },
        React.createElement('div', { className: 'mw-sectionHead' }, '配置'),
        React.createElement(
          'p',
          { className: 'mw-hint', style: { margin: '2px 0 0' } },
          '持久化到 settings.yaml（dshp-mcwiki-search 命名空间），保存即时生效。数据源固定为中文 Minecraft Wiki（不可配置）。',
        ),
        React.createElement(
          Row,
          { label: '请求超时', desc: '单次请求的等待上限，≥1000。' },
          numInput('timeoutMs', 'ms'),
        ),
        React.createElement(
          Row,
          { label: '搜索默认条数', desc: 'mcwiki_search 每页返回的条目数，≥1。' },
          numInput('searchMaxResults', '条'),
        ),
        React.createElement(
          Row,
          { label: '全文上限', desc: 'mcwiki_get_page full 输出的字符数；0 表示完整输出不截断。' },
          numInput('maxChars', null),
        ),
        React.createElement(
          Row,
          { label: '引言上限', desc: 'intro 输出的字符数；0 表示完整输出不截断。' },
          numInput('introMaxChars', null),
        ),
        React.createElement(
          'div',
          { className: 'mw-barEnd' },
          React.createElement(
            P.Button,
            { variant: 'outline', size: 'sm', disabled: cfgBusy, onClick: load },
            '重新读取',
          ),
          React.createElement(
            P.Button,
            { variant: 'primary', size: 'sm', disabled: cfgBusy || cfg === null, onClick: saveCfg },
            cfgBusy ? '保存中…' : '保存配置',
          ),
        ),
      ),
    );

    /* ── 搜索测试 ── */
    const searchInput = React.createElement(
      'div',
      { className: 'mw-inputWrap' },
      React.createElement(P.IconSearchOutline16, null),
      React.createElement('input', {
        className: 'mw-input',
        placeholder: '搜索，例如：钻石 / 苦力怕 / Ancient City',
        value: query,
        onChange: (event: { target: { value: string } }) => setQuery(event.target.value),
        onKeyDown: (event: { key: string }) => {
          if (event.key === 'Enter') runSearch();
        },
      }),
    );
    children.push(
      React.createElement(
        'div',
        { className: 'mw-section' },
        React.createElement('div', { className: 'mw-sectionHead' }, '搜索测试'),
        React.createElement(
          'p',
          { className: 'mw-hint', style: { margin: '2px 0 0' } },
          '直接看到「转换后的 AI 可读摘要」——模型拿到的就是这个格式。',
        ),
        React.createElement(
          'div',
          { className: 'mw-bar', style: { borderBottom: 'none' } },
          searchInput,
          React.createElement(
            P.Button,
            {
              variant: 'primary',
              size: 'sm',
              disabled: busy !== null,
              onClick: runSearch,
              icon: busy === 'search' ? React.createElement(P.IconLoadingOutline16) : undefined,
            },
            busy === 'search' ? '搜索中…' : '搜索测试',
          ),
        ),
      ),
    );

    if (busy === 'search')
      children.push(
        React.createElement(
          'div',
          { className: 'mw-loading' },
          React.createElement(P.IconLoadingOutline16, null),
          React.createElement('span', { className: 'mw-loadingText' }, '正在请求 MediaWiki API …'),
        ),
      );
    if (result !== null) {
      if (result.ok) {
        const items: any[] = [];
        for (const item of result.results ?? []) {
          items.push(
            React.createElement(
              'div',
              { className: 'mw-result-item', key: item.url },
              React.createElement(
                P.Tooltip,
                { label: item.url, side: 'top' },
                React.createElement('a', { href: item.url, target: '_blank', rel: 'noreferrer' }, item.title),
              ),
              React.createElement('div', { className: 'mw-result-snippet' }, item.snippet),
              React.createElement(
                'div',
                { className: 'mw-result-meta' },
                item.url + (item.updated ? ' · 更新 ' + String(item.updated).slice(0, 10) : ''),
              ),
            ),
          );
        }
        children.push(
          React.createElement(
            'div',
            { className: 'mw-section' },
            React.createElement(
              'div',
              { className: 'mw-sectionHead' },
              '搜索成功 · 共 ' + (result.totalHits ?? 0) + ' 条 · ' + (result.takenMs ?? 0) + ' ms',
            ),
            React.createElement(
              'div',
              { className: 'mw-results' },
              items.length > 0 ? items : React.createElement('span', { className: 'mw-hint' }, '无结果'),
            ),
          ),
        );
      } else {
        children.push(
          React.createElement(
            'p',
            { className: 'mw-notice mw-notice-err' },
            '测试失败' + (result.takenMs ? '（' + result.takenMs + ' ms）' : '') + '：' + result.error,
          ),
        );
      }
    }

    /* ── 页面转换测试 ── */
    const pageInput = React.createElement(
      'div',
      { className: 'mw-inputWrap' },
      React.createElement('input', {
        className: 'mw-input',
        placeholder: '页面标题，例如：苦力怕 / Diamond Ore',
        value: title,
        onChange: (event: { target: { value: string } }) => setTitle(event.target.value),
        onKeyDown: (event: { key: string }) => {
          if (event.key === 'Enter') runPage();
        },
      }),
    );
    children.push(
      React.createElement(
        'div',
        { className: 'mw-section' },
        React.createElement('div', { className: 'mw-sectionHead' }, '页面转换测试'),
        React.createElement(
          'p',
          { className: 'mw-hint', style: { margin: '2px 0 0' } },
          'wikitext → Markdown 预览（最多 6000 字符）；模型工具输出为完整全文。',
        ),
        React.createElement(
          'div',
          { className: 'mw-bar', style: { borderBottom: 'none' } },
          pageInput,
          React.createElement(
            P.Button,
            {
              variant: 'primary',
              size: 'sm',
              disabled: busy !== null,
              onClick: runPage,
              icon: busy === 'page' ? React.createElement(P.IconLoadingOutline16) : undefined,
            },
            busy === 'page' ? '抓取中…' : '页面转换测试',
          ),
        ),
      ),
    );

    if (busy === 'page')
      children.push(
        React.createElement(
          'div',
          { className: 'mw-loading' },
          React.createElement(P.IconLoadingOutline16, null),
          React.createElement('span', { className: 'mw-loadingText' }, '正在抓取并转换页面 …'),
        ),
      );
    if (pageResult !== null) {
      if (pageResult.ok && pageResult.page) {
        children.push(
          React.createElement(
            'div',
            { className: 'mw-section' },
            React.createElement(
              'div',
              { className: 'mw-sectionHead' },
              pageResult.page.title + '（' + pageResult.page.section + ' · ' + pageResult.page.format + '）',
            ),
            React.createElement(P.CodeBlock, {
              code: pageResult.page.text,
              lang: 'markdown',
              copyLabel: '复制',
              copiedLabel: '已复制',
              className: 'mw-codeblock',
            }),
            React.createElement(
              'div',
              { className: 'mw-hint', style: { marginTop: 6 } },
              '来源：' + pageResult.page.url,
            ),
          ),
        );
      } else {
        children.push(
          React.createElement(
            'p',
            { className: 'mw-notice mw-notice-err' },
            '页面抓取失败：' + ((pageResult && pageResult.error) || '未知错误'),
          ),
        );
      }
    }

    return React.createElement('div', { className: 'mw-page' }, children);
  }

  return McWikiSettingsSection;
}
