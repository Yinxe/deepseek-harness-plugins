/**
 * 中心区「Token 总览」视图（conversation.view 条目）
 *
 * 展示方式对齐原生「轨迹」插件：在会话中心区注册**一个** tab（与「对话 / 轨迹」并列），
 * tab 内部再用左侧菜单切换三块内容：
 *   - 额度查询：全部供应商额度富卡片（quota.QuotaView）
 *   - 用量统计：完整统计图表（StatsView）
 *   - 在线统计：在线时长估算（online.OnlineView）
 *
 * 布局骨架（尺寸模型对齐原生轨迹视图）：
 *
 *   .tm-cview  ── 左侧 .tm-cnav（定宽菜单） + 右侧 .tm-cmain
 *   .tm-cmain  ── 顶部 .tm-chead（当前分区标题 + 说明） + .tm-cbody（唯一滚动容器）
 *
 * 为什么是「一个 tab + 侧边菜单」而不是三个 tab：会话中心区的 tab 属于会话级导航，
 * 挤三个本插件自己的 tab 会盖过产品自身的 对话/轨迹；收敛成一个入口更克制。
 *
 * 选中项持久化在 localStorage（`tm-center-section`），下次打开回到上次看的那块。
 */
import type { AnyReact } from './types.js';
import { DISPLAY_NAME } from '../name.js';

export interface CenterViewSections {
  /** 额度查询内容 */
  QuotaView: any;
  /** 用量统计内容 */
  StatsView: any;
  /** 在线统计内容 */
  OnlineView: any;
  /** 嵌入式在线块（分享卡内聚用；`{ data, block }`） */
  OnlineEmbed: any;
  /** 配置页（与 设置 → 同名分区 是同一个组件，改一处两边同步） */
  SettingsView: any;
  /** 分享面板（16:9 分享卡）；挂到 tab 头部按钮上 */
  SharePanel: any;
}

export interface CenterViewIcons {
  QuotaIcon: any;
  UsageIcon: any;
  OnlineIcon: any;
  SettingsIcon: any;
  ShareIcon: any;
}

/** 侧边菜单项 id（同时也是 localStorage 里存的值） */
type SectionId = 'quota' | 'stats' | 'online' | 'settings';

interface NavItem {
  id: SectionId;
  label: string;
  hint: string;
  Icon: any;
  /** 与上面的数据分区之间画一条分隔线（设置不是「看数据」，是「改配置」） */
  sep?: boolean;
}

const STORE_KEY = 'tm-center-section';

/**
 * 组件可用性判定。
 * 分区组件由上层装配传入，一旦漏项就是 `undefined`；直接交给 React 会抛 #130，
 * 而且**整个 conversation.view 条目一起崩**（不只是分享面板没了）。这里做一次显式判定：
 * 缺谁就说谁，把「崩掉整个 tab」降级成「少一个分区」。
 */
function isComponent(v: any): boolean {
  return typeof v === 'function' || (typeof v === 'object' && v !== null && typeof v.$$typeof === 'symbol');
}

/** 同一个字段只报一次，避免每次渲染都刷屏 */
const warnedMissing = new Set<string>();
function warnMissing(name: string): void {
  if (warnedMissing.has(name)) return;
  warnedMissing.add(name);
  try {
    console.error('[dshp-token-meter] 中心区分区未装配：' + name + '（检查 TokenMeterSection 的返回值）');
  } catch {
    /* ignore */
  }
}

export function createCenterView(
  React: AnyReact,
  sections: CenterViewSections,
  icons: CenterViewIcons,
): (props: any) => any {
  const h = React.createElement;
  const ITEMS: NavItem[] = [
    {
      id: 'quota',
      label: '额度查询',
      hint: '全部供应商额度一览 · 增删改供应商在左侧「设置」里',
      Icon: icons.QuotaIcon,
    },
    {
      id: 'stats',
      label: '用量统计',
      hint: '会话日志聚合的用量趋势、热力图与模型分布',
      Icon: icons.UsageIcon,
    },
    {
      id: 'online',
      label: '在线统计',
      hint: '在线 / 对话进行中 / 模型 + 工具三口径时长与每日排行',
      Icon: icons.OnlineIcon,
    },
    {
      id: 'settings',
      label: '设置',
      hint: '偏好、供应商增删改、数据来源与统计缓存 · 与 设置里的同名分区是同一份',
      Icon: icons.SettingsIcon,
      sep: true,
    },
  ];
  const ids = ITEMS.map((i) => i.id);
  const first = ITEMS[0] as NavItem;

  /** 读上次选中项；越界或读不到时回到第一项 */
  function readSaved(): SectionId {
    try {
      const raw = window.localStorage.getItem(STORE_KEY);
      if (raw && (ids as string[]).indexOf(raw) >= 0) return raw as SectionId;
    } catch {
      /* 无 localStorage（隐私模式等）：用默认值即可 */
    }
    return first.id;
  }

  return function TokenMeterCenterView(): any {
    const [cur, setCur] = React.useState(readSaved) as [SectionId, (v: SectionId) => void];
    const [share, setShare] = React.useState(false);
    const pick = (id: SectionId): void => {
      setCur(id);
      try {
        window.localStorage.setItem(STORE_KEY, id);
      } catch {
        /* ignore */
      }
    };
    const active: NavItem = ITEMS.filter((i) => i.id === cur)[0] ?? first;
    /** 供各分区内部「去设置」的入口调用（例如额度查询的空状态） */
    const openSettings = (): void => pick('settings');

    const box = sections as Record<string, any>;
    /** 渲染分区；未装配的字段渲染一条就地提示，而不是让 React 抛 #130 崩掉整个 tab */
    const section = (name: string, props?: any): any => {
      const Comp = box[name];
      if (!isComponent(Comp)) {
        warnMissing(name);
        return h('div', { className: 'tm-sectMiss' }, '「' + name + '」分区未装配，请重新加载插件。');
      }
      return h(Comp, props);
    };
    const icon = (Comp: any, size: number): any => (isComponent(Comp) ? h(Comp, { size }) : null);
    const canShare = isComponent(sections.SharePanel);
    if (!canShare) warnMissing('SharePanel');

    return h(
      'div',
      { className: 'tm-cview' },
      h(
        'nav',
        { className: 'tm-cnav', 'aria-label': DISPLAY_NAME },
        // 整列（背景 + 右分隔线）铺满内容高度，菜单本体 sticky 钉在顶部
        h(
          'div',
          { className: 'tm-cnavInner' },
          h('div', { className: 'tm-cnavHead' }, DISPLAY_NAME),
          h(
            'div',
            { className: 'tm-cnavList' },
            ITEMS.map((item) =>
              h(
                'button',
                {
                  key: item.id,
                  type: 'button',
                  className:
                    'tm-cnavItem' +
                    (cur === item.id ? ' tm-cnavOn' : '') +
                    (item.sep ? ' tm-cnavItemSep' : ''),
                  'aria-current': cur === item.id ? 'true' : undefined,
                  title: item.hint,
                  onClick: () => pick(item.id),
                },
                icon(item.Icon, 15),
                h('span', { className: 'tm-cnavLabel' }, item.label),
              ),
            ),
          ),
        ),
      ),
      h(
        'div',
        { className: 'tm-cmain' },
        h(
          'header',
          { className: 'tm-chead' },
          h('span', { className: 'tm-cheadTitle' }, active.label),
          h('span', { className: 'tm-cheadHint' }, active.hint),
          // 分享入口：任何分区都能一键生成整张 16:9 分享卡
          // 面板没装配就不画按钮 —— 宁可没有入口，也不要一个点了就崩的按钮
          canShare
            ? h(
                'button',
                {
                  type: 'button',
                  className: 'tm-shareBtn',
                  title: '把用量统计与在线统计合成一张 16:9 分享卡',
                  onClick: () => setShare(true),
                },
                icon(icons.ShareIcon, 14),
                h('span', null, '分享'),
              )
            : null,
          canShare && share
            ? h(sections.SharePanel, {
                onClose: () => setShare(false),
                // 在线块来自 OnlineSection，这里把它交给分享面板一起内聚
                OnlineEmbed: sections.OnlineEmbed,
              })
            : null,
        ),
        // 只挂载当前分区的面板：各面板自己会去打接口，全挂载会白拉几份数据。
        h(
          'div',
          { className: 'tm-cbody', 'data-tm-scroll': '1' },
          cur === 'quota'
            ? section('QuotaView', { onOpenSettings: openSettings })
            : cur === 'stats'
              ? section('StatsView')
              : cur === 'online'
                ? section('OnlineView')
                : // 设置页是行式表单布局，宽屏下收窄居中更好读（数据卡片才吃满宽度）
                  h('div', { className: 'tm-cset' }, section('SettingsView')),
        ),
      ),
    );
  };
}
