/**
 * GallerySection.ts —— 设置 → 外观定制（主题画廊 + 壁纸取色 + 全局圆角）
 *
 * 结构（与原版逐段对应）：
 *   topbar（圆角档 + 回到官方 + 提示/错误）
 *   wallSection（壁纸取色 · Material You：上传 → seed → 5 组 ref 调色板 × 亮/暗角色）
 *   tg-list（当前态 now 条 + 搜索/过滤工具栏 + 主题 grid）
 *
 * 无分组：全部主题（含取色）直接平铺，grid 自适应（默认 4 列）。
 * 颜色只走 meta.swatch（= 目录元数据），token 按需问 Host 要，不进 bundle。
 *
 * 原实现：dsh-custom-ui/client.js 的 createGallery()，React.createElement 写法
 * 逐行保留（不用 JSX，避免 jsx 运行时配置漂移）。
 *
 * @module @dshp/web-style/client
 */
import { applyThemeChoice, findStaticTheme } from './apply-theme.js';
import type { Bridge } from './api.js';
import { copyText } from './clipboard.js';
import {
  buildM3ExportCss,
  buildM3Scheme,
  buildWallpaperTheme,
  M3_PREVIEW_TONES,
  paletteFromFile,
} from './md3.js';
import { applyRadius } from './radius.js';
import { state } from './state.js';
import { BUILTIN_LABELS, PHOTO_ID, THEMES } from './themes.js';
import type { M3RefName, M3SchemeRole } from './md3.js';
import type { AnyCtx, AnyReact, ThemeMeta, ThemeService } from './types.js';

/** 提示条：err 红字 / ok 绿字，二者可同时为空（= 不显示）。 */
interface Notice {
  err?: string | null;
  ok?: string;
}

/** 画廊条目（编号用于卡片右上角 001/002…）。 */
interface GalleryEntry {
  data: ThemeMeta;
  idx: string;
}

/** 静态主题 + photo:custom 的统一取色。 */
function accentOf(t: ThemeMeta | null): string {
  if (t && typeof t.accent === 'string' && t.accent) return t.accent;
  if (t && Array.isArray(t.swatch) && typeof t.swatch[2] === 'string') return t.swatch[2] as string;
  return '#2f81f7';
}

/**
 * 品牌填充上的文字色：按相对亮度在「白 / 近黑」之间择优。
 *
 * 主题 accent 从 Spotify 绿 (#1ed760) 到 SpaceX 近白 (#f0f0fa) 都有，固定白字在
 * 18/23 套主题上不到 WCAG AA 4.5:1（最差 supabase #3ecf8e 只有 1.91）；按亮度择优
 * 后 20/23 达标（最差 4.37，已贴近阈值）。这也是「不写死主题色」的落法 ——
 * 两个端点是**对比度端点**，不是主题色；主题色一律走 --dsw-* token。
 */
const INK_ON_LIGHT = '#ffffff';
const INK_ON_DARK = '#111111';

/** sRGB 相对亮度（WCAG 2.x 定义）；解析失败返回 null。 */
function relLuminance(hex: string): number | null {
  const m = /^#([0-9a-f]{6})$/i.exec((hex || '').trim());
  if (!m) return null;
  const n = parseInt(m[1] as string, 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** 给定填充色，返回在其上对比度更高的墨色。 */
function inkOn(fill: string): string {
  const l = relLuminance(fill);
  if (l === null) return INK_ON_LIGHT;
  // 与两种端点各算一次对比度，取高者
  const lLight = relLuminance(INK_ON_LIGHT) as number;
  const lDark = relLuminance(INK_ON_DARK) as number;
  const ratio = (a: number, b: number) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  return ratio(l, lLight) >= ratio(l, lDark) ? INK_ON_LIGHT : INK_ON_DARK;
}

/** 卡片三色拼接：壁纸主题用运行时调色板，其余用 meta.swatch。 */
function mosaicOf(t: ThemeMeta | null): string[] {
  if (t && t.id === PHOTO_ID && state.photoTheme) {
    const pal = state.photoTheme.palettes;
    return [pal.secondary[60] as string, state.photoTheme.seed, pal.tertiary[60] as string];
  }
  const sw = t && Array.isArray(t.swatch) ? t.swatch : [];
  return [sw[0] || '#222222', sw[1] || '#444444', accentOf(t)];
}

export function createGallery(React: AnyReact, ctx: AnyCtx, theme: ThemeService, bridge: Bridge): () => any {
  function ThemeGallery(): any {
    const [, setRevision] = React.useState(-1);
    const [notice, setNotice] = React.useState(null as Notice | null);
    const [radiusCfg, setRadiusCfg] = React.useState(state.desiredRadius as number);
    const [query, setQuery] = React.useState('');
    const [schemeFilter, setSchemeFilter] = React.useState('all');
    const [photoBusy, setPhotoBusy] = React.useState(false as boolean);

    React.useEffect(function () {
      return ctx.on('theme/change', function (snap: unknown) {
        const s = snap as { revision?: number } | null;
        setRevision(s && typeof s.revision === 'number' ? s.revision : 0);
        // 亮暗切换后渐变需按新 scheme 重渲染（photo 主题双分支）
        if (typeof state.renderBodyGradient === 'function') state.renderBodyGradient();
      });
    }, []);

    const snap = theme.getTheme();
    const current = snap && snap.active ? (snap.active.id ?? '') : '';
    const resolved =
      snap && snap.preference === 'system'
        ? current === 'dark'
          ? 'dark'
          : 'light'
        : snap
          ? (snap.preference ?? current)
          : current;

    const label: Record<string, string> = {};
    for (const t of THEMES) label[t.id] = t.label;
    label[PHOTO_ID] = '壁纸取色';
    label['light'] = BUILTIN_LABELS.light;
    label['dark'] = BUILTIN_LABELS.dark;
    // 新架构下「当前态」显示：官方 scheme（resolved）+ 是否有自定义层（desiredId）
    const currentLabel =
      state.desiredId.length > 0 && label[state.desiredId]
        ? (label[state.desiredId] as string)
        : resolved === 'dark'
          ? BUILTIN_LABELS.dark
          : resolved === 'light'
            ? BUILTIN_LABELS.light
            : current;

    const pick = function (t: ThemeMeta): void {
      state.desiredId = t.id;
      // 新架构：覆盖层 + 官方偏好双写，无守护
      applyThemeChoice(theme, bridge, t.id);
      bridge
        .saveTheme(t.id)
        .then(function (reply) {
          setNotice(
            reply && reply.ok
              ? null
              : { err: (reply && reply.error) || '主题选择保存失败（重启后会回到官方默认）' },
          );
        })
        .catch(function (e: unknown) {
          setNotice({ err: '主题选择保存失败：' + String((e as Error)?.message ?? e) });
        });
    };

    // 回到官方默认：撤销覆盖层 + 清持久化；官方亮/暗偏好保留原值。
    const release = function (): void {
      state.desiredId = '';
      applyThemeChoice(theme, bridge, '');
      bridge
        .saveTheme('')
        .then(function (reply) {
          setNotice(
            reply && reply.ok
              ? { err: null, ok: '已回到官方默认配色；亮/暗请用上方「外观」行切换' }
              : { err: (reply && reply.error) || '清除失败' },
          );
        })
        .catch(function (e: unknown) {
          setNotice({ err: '清除失败：' + String((e as Error)?.message ?? e) });
        });
    };

    // ── 截图式卡片：顶部三色拼接 + 右上编号 + 标签/标题/描述 + 底部胶囊按钮 + Live 态 ──
    const mkCard = (t: ThemeMeta, active: boolean, onPick: () => void, idx: string): any => {
      const accent = accentOf(t);
      const mosaic = mosaicOf(t);
      const schemeLabel = t.colorScheme === 'dark' ? '深色' : '浅色';
      const tagText = t.tag || schemeLabel + ' · ' + accent;
      return React.createElement(
        'button',
        {
          key: t.id,
          type: 'button',
          className: active ? 'tg-card tg-active' : 'tg-card',
          'aria-pressed': active,
          style: active ? { borderColor: accent, boxShadow: '0 0 0 1px ' + accent } : null,
          onClick: onPick,
        },
        React.createElement(
          'span',
          { className: 'tg-mosaic', 'aria-hidden': true },
          React.createElement('i', { className: 'tg-mA', style: { background: mosaic[0] } }),
          React.createElement('i', { className: 'tg-mB', style: { background: mosaic[1] } }),
          React.createElement('i', { className: 'tg-mC', style: { background: accent } }),
          React.createElement('span', { className: 'tg-idx' }, idx || ''),
        ),
        React.createElement(
          'span',
          { className: 'tg-body' },
          React.createElement(
            'span',
            { className: 'tg-tag', style: { color: accent }, title: tagText },
            tagText,
          ),
          React.createElement('span', { className: 'tg-title' }, t.label),
          React.createElement('span', { className: 'tg-desc', title: t.desc }, t.desc),
          React.createElement(
            'span',
            { className: 'tg-foot' },
            React.createElement(
              'span',
              { className: 'tg-use', style: { background: accent, color: inkOn(accent) } },
              active ? '使用中' : '启用',
            ),
            React.createElement(
              'span',
              { className: 'tg-live', style: { color: accent, opacity: active ? 1 : 0.72 } },
              React.createElement('i', null),
              active ? 'Live' : schemeLabel,
            ),
            active
              ? React.createElement('span', { className: 'tg-check', style: { color: accent } }, '✓')
              : null,
          ),
        ),
      );
    };

    // 无分组：全部主题（含取色）直接平铺，grid 自适应
    const ALL_THEMES: GalleryEntry[] = THEMES.map(function (t, i) {
      return { data: t, idx: String(i + 1).padStart(3, '0') };
    });

    // ── 壁纸取色（Material You 独立配置）：上传壁纸 → 提取 seed → MD3 整套配色 ──
    const pickPhoto = function (file: File | undefined | null): void {
      if (!file) return;
      setPhotoBusy(true);
      paletteFromFile(file)
        .then(function (palette) {
          const seed = palette.accent;
          const wt = buildWallpaperTheme(seed);
          state.photoTheme = wt;
          state.desiredId = PHOTO_ID;
          applyThemeChoice(theme, bridge, PHOTO_ID);
          const pal = wt.palettes;
          // 持久化（Host 字段不变做兼容：accent 即 seed）
          bridge
            .saveConfig({
              photoPalette: {
                accent: seed,
                companionA: pal.tertiary[60] as string,
                companionB: pal.secondary[60] as string,
              },
            })
            .then(function (reply) {
              setPhotoBusy(false);
              setNotice(
                reply && reply.ok
                  ? { err: null, ok: '壁纸 MD3 配色已生成（seed ' + seed + '）并保存；亮/暗跟随「外观」行' }
                  : { err: '配色已生效但保存失败（重启后会丢失取色）' },
              );
            })
            .catch(function () {
              setPhotoBusy(false);
              setNotice({ err: '配色已生效但保存失败' });
            });
          bridge.saveTheme(PHOTO_ID).catch(function () {
            /* 保存失败静默：覆盖层已生效，下次选择再落库 */
          });
        })
        .catch(function (e: unknown) {
          setPhotoBusy(false);
          setNotice({ err: '取色失败：' + String((e as Error)?.message ?? e) });
        });
    };

    const photoActive = state.desiredId === PHOTO_ID;

    const enableWallpaper = function (): void {
      if (!state.photoTheme) {
        setNotice({ err: '还没有壁纸配色，先上传一张壁纸取色' });
        return;
      }
      state.desiredId = PHOTO_ID;
      applyThemeChoice(theme, bridge, PHOTO_ID);
      bridge
        .saveTheme(PHOTO_ID)
        .then(function (reply) {
          setNotice(reply && reply.ok ? null : { err: (reply && reply.error) || '启用失败' });
        })
        .catch(function (e: unknown) {
          setNotice({ err: '启用失败：' + String((e as Error)?.message ?? e) });
        });
    };

    const clearWallpaper = function (): void {
      state.photoTheme = null;
      if (state.desiredId === PHOTO_ID) {
        state.desiredId = '';
        applyThemeChoice(theme, bridge, '');
      }
      bridge.saveTheme('').catch(function () {
        /* 静默：本地已清，重启后回读 settings 为准 */
      });
      bridge
        .saveConfig({ photoPalette: null })
        .then(function (reply) {
          setNotice(
            reply && reply.ok
              ? { err: null, ok: '壁纸配色已清除，回到官方默认' }
              : { err: (reply && reply.error) || '清除失败' },
          );
        })
        .catch(function (e: unknown) {
          setNotice({ err: '清除失败：' + String((e as Error)?.message ?? e) });
        });
    };

    const copyM3 = function (): void {
      const wt = state.photoTheme;
      if (!wt) {
        setNotice({ err: '还没有壁纸配色，先上传一张壁纸取色' });
        return;
      }
      copyText(buildM3ExportCss(wt.seed)).then(
        function () {
          setNotice({
            err: null,
            ok: 'MD3 令牌已复制（--md-ref-palette-* ×156 + --md-sys-color-*-light/dark ×74）',
          });
        },
        function (e: unknown) {
          setNotice({ err: '复制失败：' + String((e as Error)?.message ?? e) });
        },
      );
    };

    // 全局圆角三档：保存即生效。同时写模块级 desiredRadius——
    // theme/change 触发 setRevision 时若组件树因 key 重建，state 也不丢。
    const pickRadius = function (v: number): void {
      state.desiredRadius = v;
      setRadiusCfg(v);
      bridge
        .saveConfig({ radius: { global: v } })
        .then(function (reply) {
          if (reply && reply.ok === true) applyRadius(reply.radius);
        })
        .catch(function () {
          /* 保存失败静默：下次刷新回读 */
        });
    };
    const rdNow = typeof radiusCfg === 'number' ? radiusCfg : -1;
    const radiusButtons = [
      ['-1', '默认'],
      ['0', '锐角'],
      ['12', '圆润'],
    ].map(function (opt) {
      const value = Number(opt[0]);
      const active = rdNow === value;
      return React.createElement(
        'button',
        {
          key: opt[0],
          type: 'button',
          className: active ? 'tg-radiusBtn tg-active' : 'tg-radiusBtn',
          'aria-pressed': active,
          title: opt[0] === '-1' ? '跟随主题' : opt[0] === '0' ? '全锐角' : '统一 12px 圆润',
          onClick: function () {
            pickRadius(value);
          },
        },
        opt[1],
      );
    });

    // 顶部简单配置区：圆角 + 回到官方（取色已独立成区，当前主题下沉到列表头 now 条）
    const topbar = React.createElement(
      'div',
      { className: 'tg-topbar' },
      React.createElement(
        'div',
        { className: 'tg-ctl' },
        React.createElement('span', { className: 'tg-ctlLabel' }, '圆角'),
        React.createElement('div', { className: 'tg-radiusBtns' }, radiusButtons),
        React.createElement('span', { className: 'tg-ctlSep' }),
        React.createElement(
          'button',
          { type: 'button', className: 'tg-release', onClick: release },
          '回到官方',
        ),
        React.createElement('span', { className: 'tg-head' }, '点击卡片切换，自动保存'),
      ),
      notice && notice.err ? React.createElement('p', { className: 'tg-head tg-headErr' }, notice.err) : null,
      notice && notice.ok ? React.createElement('p', { className: 'tg-head tg-headOk' }, notice.ok) : null,
    );

    // ── 壁纸取色独立配置区（MD3 整套配色，不占用主题卡片位）──
    // 局部快照：闭包里 TS 无法沿用 state 上的收窄，取一次即稳定。
    const photoTheme = state.photoTheme;
    const wallSeed = photoTheme ? photoTheme.seed : null;
    const wallAccent = photoTheme
      ? resolved === 'dark'
        ? (photoTheme.palettes.primary[80] as string)
        : (photoTheme.palettes.primary[40] as string)
      : '#2f81f7';
    const wallToneRows = photoTheme
      ? (['primary', 'secondary', 'tertiary', 'neutral', 'neutralVariant'] as M3RefName[]).map(
          function (name) {
            const cells = M3_PREVIEW_TONES.map(function (t) {
              const hex = photoTheme.palettes[name][t] as string;
              return React.createElement('i', {
                key: t,
                style: { background: hex },
                title: name + t + ' ' + hex,
              });
            });
            return React.createElement(
              'div',
              { key: name, className: 'tg-toneRow' },
              React.createElement(
                'span',
                { className: 'tg-toneName' },
                name === 'neutralVariant' ? 'neutral-variant' : name,
              ),
              React.createElement('span', { className: 'tg-toneCells' }, cells),
            );
          },
        )
      : null;
    const wallRoleRows = photoTheme
      ? (['light', 'dark'] as const).map(function (sk) {
          const roles = buildM3Scheme(photoTheme.palettes, sk);
          const keys: M3SchemeRole[] = [
            'primary',
            'onPrimary',
            'primaryContainer',
            'onPrimaryContainer',
            'secondary',
            'secondaryContainer',
            'tertiary',
            'tertiaryContainer',
            'surface',
            'surfaceContainer',
            'surfaceContainerHighest',
            'onSurface',
            'outline',
            'error',
            'errorContainer',
          ];
          const chips = keys.map(function (k) {
            return React.createElement(
              'span',
              { key: k, className: 'tg-chip', title: '--md-sys-color-' + k + '-' + sk + ' ' + roles[k] },
              React.createElement('i', { style: { background: roles[k] } }),
              k,
            );
          });
          return React.createElement(
            'div',
            { key: sk, className: 'tg-roleRow' },
            React.createElement('span', { className: 'tg-toneName' }, sk === 'light' ? '浅色' : '深色'),
            React.createElement('span', { className: 'tg-chips' }, chips),
          );
        })
      : null;
    const wallSection = React.createElement(
      'div',
      { className: 'tg-wall' },
      React.createElement(
        'div',
        { className: 'tg-wallHead' },
        React.createElement('span', { className: 'tg-wallTitle' }, '壁纸取色 · Material You'),
        wallSeed
          ? React.createElement(
              'span',
              { className: 'tg-seedChip', title: 'seed ' + wallSeed },
              React.createElement('i', { style: { background: wallSeed } }),
              wallSeed,
            )
          : null,
        photoActive
          ? React.createElement(
              'span',
              { className: 'tg-live', style: { color: wallAccent } },
              React.createElement('i', null),
              'Live',
            )
          : null,
        React.createElement(
          'span',
          { className: 'tg-wallActions' },
          React.createElement(
            'label',
            {
              className: 'tg-radiusBtn',
              style: { cursor: photoBusy ? 'wait' : 'pointer', opacity: photoBusy ? 0.6 : 1 },
            },
            photoBusy ? '取色中…' : '上传壁纸',
            React.createElement('input', {
              type: 'file',
              accept: '.png,.jpg,.jpeg,.webp',
              style: { display: 'none' },
              disabled: photoBusy,
              onChange: function (e: { target: { files?: FileList | null; value: string } }) {
                pickPhoto(e.target.files && e.target.files[0]);
                e.target.value = '';
              },
            }),
          ),
          photoTheme && !photoActive
            ? React.createElement(
                'button',
                { type: 'button', className: 'tg-radiusBtn', onClick: enableWallpaper },
                '启用配色',
              )
            : null,
          photoTheme
            ? React.createElement(
                'button',
                {
                  type: 'button',
                  className: 'tg-radiusBtn',
                  onClick: copyM3,
                  title: '复制 MD3 令牌（ref 调色板 + 亮/暗 sys 色彩）',
                },
                '复制 MD3',
              )
            : null,
          photoTheme
            ? React.createElement(
                'button',
                { type: 'button', className: 'tg-release', onClick: clearWallpaper },
                '清除',
              )
            : null,
        ),
      ),
      photoTheme
        ? React.createElement(
            'div',
            { className: 'tg-wallBody' },
            wallToneRows,
            React.createElement('div', { className: 'tg-roles' }, wallRoleRows),
          )
        : React.createElement(
            'span',
            { className: 'tg-head' },
            '上传一张壁纸，生成整套 MD3 动态配色（5 组 ref 调色板 × 亮/暗 scheme）；本地采样不上传。',
          ),
    );

    // ── 当前正在使用的主题（列表头）──
    const nowTheme: ThemeMeta | null = (function () {
      if (state.desiredId === PHOTO_ID) {
        return photoTheme
          ? {
              id: PHOTO_ID,
              label: '壁纸取色',
              desc: 'seed ' + photoTheme.seed + ' · MD3 动态配色',
              colorScheme: 'dark',
              accent: photoTheme.seed,
            }
          : {
              id: PHOTO_ID,
              label: '壁纸取色',
              desc: '取色数据缺失，请重新上传壁纸',
              colorScheme: 'dark',
              accent: '#2f81f7',
            };
      }
      return findStaticTheme(state.desiredId);
    })();
    const nowMosaic = nowTheme
      ? mosaicOf(nowTheme)
      : ['var(--dsw-alias-bg-layer-1)', 'var(--dsw-alias-bg-layer-2)', 'var(--dsw-alias-brand-primary)'];
    const nowAccent = nowTheme ? accentOf(nowTheme) : '#2f81f7';
    const nowStrip = React.createElement(
      'div',
      { className: 'tg-now' },
      React.createElement(
        'span',
        { className: 'tg-nowMosaic', 'aria-hidden': true },
        React.createElement('i', { className: 'tg-mA', style: { background: nowMosaic[0] } }),
        React.createElement('i', { className: 'tg-mB', style: { background: nowMosaic[1] } }),
        React.createElement('i', { className: 'tg-mC', style: { background: nowAccent } }),
      ),
      React.createElement(
        'span',
        { className: 'tg-nowMeta' },
        React.createElement('span', { className: 'tg-nowTitle' }, '正在使用：' + currentLabel),
        React.createElement(
          'span',
          { className: 'tg-nowSub' },
          nowTheme ? nowTheme.desc + ' · ' + nowAccent : '官方默认配色 · 跟随「外观」亮/暗',
        ),
      ),
      React.createElement(
        'span',
        { className: 'tg-nowDots', 'aria-hidden': true },
        React.createElement('i', { style: { background: nowMosaic[0] } }),
        React.createElement('i', { style: { background: nowMosaic[1] } }),
        React.createElement('i', { style: { background: nowAccent } }),
      ),
    );

    // ── 关键词搜索 + 亮/暗过滤 ──
    const q = query.trim().toLowerCase();
    const matchEntry = function (entry: GalleryEntry): boolean {
      const t = entry.data;
      if (schemeFilter !== 'all' && t.colorScheme !== schemeFilter) return false;
      if (!q) return true;
      const hay = (t.label + ' ' + t.desc + ' ' + t.id + ' ' + accentOf(t)).toLowerCase();
      return hay.indexOf(q) !== -1;
    };
    const schemePills = [
      ['all', '全部'],
      ['dark', '深色'],
      ['light', '浅色'],
    ].map(function (opt) {
      const active = schemeFilter === opt[0];
      return React.createElement(
        'button',
        {
          key: opt[0],
          type: 'button',
          className: active ? 'tg-radiusBtn tg-active' : 'tg-radiusBtn',
          'aria-pressed': active,
          onClick: function () {
            setSchemeFilter(opt[0]);
          },
        },
        opt[1],
      );
    });
    const visibleEntries = ALL_THEMES.filter(matchEntry);
    const toolbar = React.createElement(
      'div',
      { className: 'tg-toolbar' },
      React.createElement('input', {
        className: 'tg-search',
        type: 'search',
        placeholder: '搜索主题…',
        value: query,
        onChange: function (e: { target: { value: string } }) {
          setQuery(e.target.value);
        },
      }),
      React.createElement('div', { className: 'tg-radiusBtns' }, schemePills),
      React.createElement(
        'span',
        { className: 'tg-count' },
        visibleEntries.length + ' / ' + ALL_THEMES.length,
      ),
    );
    const cards = visibleEntries.map(function (entry) {
      const t = entry.data;
      return mkCard(
        t,
        state.desiredId === t.id,
        function () {
          pick(t);
        },
        entry.idx,
      );
    });

    // 简单配置在前，壁纸取色居中，主题色列表（最后一项）在后
    return React.createElement(
      'div',
      { className: 'tg-page' },
      topbar,
      wallSection,
      React.createElement(
        'div',
        { className: 'tg-list' },
        nowStrip,
        toolbar,
        cards.length > 0
          ? React.createElement('div', { className: 'tg-grid' }, cards)
          : React.createElement(
              'span',
              { className: 'tg-head' },
              '无匹配主题，换个关键词或切换亮/暗过滤试试。',
            ),
      ),
    );
  }

  return ThemeGallery;
}
