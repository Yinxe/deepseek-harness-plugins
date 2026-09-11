/**
 * 拉取失败友好提示卡（Friendly Error Box）
 *
 * 目标：任何失败都让用户一眼看懂三件事 —— **结论（哪坏了）/ 后果 / 该怎么办**，
 * 再按需展开细节用于自助排查或反馈维护者。
 *
 * 分层渲染同思路：分类与文案全部由 Host 产出（host/errors.ts 的 ErrorInfo），
 * 本组件只负责渲染，不认识任何供应商。老 Host 只下发字符串时走本地兜底分类。
 *
 * 结构：
 *   [图标] 结论标题 ················ ▾ 展开      ← 严重度配色（红/黄/蓝）
 *          一句话解释
 *          → 该去哪改
 *          [重试] [复制详情]                    ← 可重试才给重试
 *   ── 展开 ──
 *          排查步骤（有序）
 *          原始信息（等宽、可整段复制）
 */
import type { AnyReact, ErrorInfo, ErrorKind, ErrorTone } from './types.js';

/** 分类 → 图标（纯字符，零依赖，深浅主题都能看）。 */
const ICONS: Record<ErrorKind, string> = {
  auth: '🔑',
  session: '⏳',
  plan: '📅',
  balance: '💰',
  rate: '🐢',
  network: '🌐',
  parse: '🧩',
  config: '⚙️',
  server: '🛠️',
  unknown: '⚠️',
};

/** 本地兜底分类（仅当 Host 未下发 errorInfo，即旧版本 Host 时使用）。 */
const FALLBACK_RULES: Array<[RegExp, ErrorKind]> = [
  [/未配置|凭据未配置|必填|参数非法|workspaceId 非法/, 'config'],
  [/会话失效|会话已过期|登录失效|登录态|被风控|logged out/i, 'session'],
  [/密钥无效|密钥已失效|密钥引用.*为空|Invalid 'Authorization'|401|403/i, 'auth'],
  [/upgrade_required|订阅.*(到期|结束|失败|取消)|计划.*(不含|不支持)/, 'plan'],
  [/余额不足|insufficient|402/, 'balance'],
  [/限流|429|rate.?limit/i, 'rate'],
  [/fetch failed|ENOTFOUND|ECONNREFUSED|ETIMEDOUT|network|超时|timeout/i, 'network'],
  [/非 JSON|结构异常|字段缺失|解析失败|改版|未命中/, 'parse'],
  [/\b5\d\d\b/, 'server'],
];

const FALLBACK_TITLES: Record<ErrorKind, string> = {
  auth: '密钥无效或已失效',
  session: '登录状态已过期',
  plan: '订阅已到期或计划不支持',
  balance: '余额不足',
  rate: '请求过于频繁（被限流）',
  network: '网络不可达',
  parse: '接口返回结构异常',
  config: '供应商配置不完整',
  server: '上游服务异常',
  unknown: '拉取失败',
};

/** 无 errorInfo 时的最小可用兜底（结论 + 原始信息）。 */
export function fallbackErrorInfo(message: string): ErrorInfo {
  const msg = String(message || '拉取失败');
  let kind: ErrorKind = 'unknown';
  for (const [re, k] of FALLBACK_RULES) {
    if (re.test(msg)) {
      kind = k;
      break;
    }
  }
  const tone: ErrorTone =
    kind === 'auth' || kind === 'session' || kind === 'plan' || kind === 'balance' ? 'bad' : 'warn';
  return {
    kind,
    title: FALLBACK_TITLES[kind],
    hint: '本次拉取没有成功，展开可见原始信息。',
    action: '点「刷新」重试；若持续失败请把详情反馈给维护者',
    steps: ['点「刷新」重试一次', '若持续失败，把「原始信息」反馈给插件维护者'],
    detail: msg,
    retriable: true,
    tone,
  };
}

export interface ErrorBoxProps {
  /** 结构化失败信息；缺省时用 msg 现场兜底分类 */
  info?: ErrorInfo | null;
  /** 原始错误（老 Host 只给这个） */
  msg?: string;
  /** 附加说明：供应商名 · 失败时间 · 凭据形态 */
  meta?: string;
  /** 重试回调（有则显示「重试」按钮） */
  onRetry?: () => void;
  /** 是否紧凑模式（侧边栏窄卡用） */
  compact?: boolean;
}

export function createErrorBox(
  React: AnyReact,
  deps: {
    isOpen: () => boolean;
    toggle: () => void;
    /** 可选：打开设置页（「去设置页」快捷入口） */
    openSettings?: () => void;
  },
): (props: ErrorBoxProps) => any {
  const h = React.createElement;
  const useState = React.useState as <T>(init: T) => [T, (v: T | ((prev: T) => T)) => void];

  function copy(text: string, done: (ok: boolean) => void): void {
    try {
      const nav: any = typeof navigator !== 'undefined' ? navigator : null;
      if (nav && nav.clipboard && typeof nav.clipboard.writeText === 'function') {
        void nav.clipboard.writeText(text).then(
          () => done(true),
          () => done(false),
        );
        return;
      }
    } catch {
      /* 落到下面的兜底 */
    }
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand && document.execCommand('copy');
      document.body.removeChild(ta);
      done(!!ok);
    } catch {
      done(false);
    }
  }

  return function ErrorBox(props: ErrorBoxProps): any {
    const raw: ErrorInfo | null = props.info || null;
    const info: ErrorInfo = raw || fallbackErrorInfo(props.msg || '拉取失败');
    const open = deps.isOpen();
    const [copied, setCopied] = useState('');
    const tone: ErrorTone = info.tone || 'warn';
    const steps = Array.isArray(info.steps) ? info.steps.slice(0, 6) : [];
    const detailText =
      info.detail +
      (props.meta ? '\n' + props.meta : '') +
      (info.status ? '\nHTTP ' + info.status : '') +
      (info.docs ? '\n文档：' + info.docs : '');
    const icon = ICONS[info.kind] || ICONS.unknown;

    const head = h(
      'button',
      {
        key: 'h',
        type: 'button',
        className: 'tm-errhead',
        title: open ? '收起详情' : '展开排查详情',
        'aria-expanded': open,
        onClick: () => deps.toggle(),
      },
      h('span', { key: 'i', className: 'tm-erricon tm-erricon-' + tone }, icon),
      h(
        'span',
        { key: 't', className: 'tm-errtitlewrap' },
        h('span', { key: 'a', className: 'tm-errtitle' }, info.title),
        h('span', { key: 'b', className: 'tm-errhint' }, info.hint),
      ),
      h('span', { key: 'c', className: 'tm-vcaret' }, open ? '▴' : '▾'),
    );

    const actionRow = h(
      'div',
      { key: 'a', className: 'tm-erraction' },
      info.action ? h('span', { key: 'p', className: 'tm-erractionText' }, '→ ' + info.action) : null,
      h(
        'span',
        { key: 'btns', className: 'tm-errabtns' },
        props.onRetry && info.retriable
          ? h(
              'button',
              {
                key: 'retry',
                type: 'button',
                className: 'tm-mini',
                title: '立即重新拉取一次',
                onClick: () => props.onRetry && props.onRetry(),
              },
              '↻ 重试',
            )
          : props.onRetry && !info.retriable
            ? h(
                'button',
                {
                  key: 'recheck',
                  type: 'button',
                  className: 'tm-mini',
                  title: '按上面步骤处理完后，点这里立即验证一次',
                  onClick: () => props.onRetry && props.onRetry(),
                },
                '✓ 已处理，验证',
              )
            : null,
        deps.openSettings
          ? h(
              'button',
              {
                key: 'settings',
                type: 'button',
                className: 'tm-mini',
                title: '前往设置页修改该供应商配置',
                onClick: () => deps.openSettings && deps.openSettings(),
              },
              '设置页',
            )
          : null,
      ),
    );

    const body = open
      ? h(
          'div',
          { key: 'd', className: 'tm-errdetail' },
          steps.length
            ? h(
                'div',
                { key: 'steps' },
                h('div', { className: 'tm-errsub' }, '排查步骤'),
                h(
                  'ol',
                  { className: 'tm-errsteps' },
                  steps.map((s, i) => h('li', { key: 's' + i }, s)),
                ),
              )
            : null,
          h(
            'div',
            { key: 'raw' },
            h('div', { className: 'tm-errsub' }, '原始信息'),
            h('pre', { className: 'tm-errraw' }, detailText),
          ),
          h(
            'div',
            { key: 'acts', className: 'tm-errdactions' },
            h(
              'button',
              {
                type: 'button',
                className: 'tm-mini',
                onClick: () =>
                  copy(detailText, (ok) => {
                    setCopied(ok ? '已复制' : '复制失败');
                    window.setTimeout(() => setCopied(''), 1600);
                  }),
              },
              copied || '复制详情',
            ),
            info.docs
              ? h(
                  'a',
                  {
                    className: 'tm-mini',
                    href: info.docs,
                    target: '_blank',
                    rel: 'noreferrer noopener',
                  },
                  '官方文档',
                )
              : null,
            props.meta ? h('span', { className: 'tm-errmeta' }, props.meta) : null,
          ),
        )
      : null;

    return h(
      'div',
      { className: 'tm-errbox tm-errbox-' + tone + (props.compact ? ' tm-errbox-compact' : '') },
      head,
      actionRow,
      body,
    );
  };
}
