/**
 * 分享面板外壳：全屏遮罩 + 可滚动舞台 + 导出操作条
 *
 * 内容本体是 SharePanel 的**内聚板子**（真组件拼成的一块 DOM 板），这里只负责
 * 「怎么摆」与「怎么拿走」：
 *  · 舞台占一屏、内容超高就在**舞台内滚动**，板子按容器宽度 1:1 排版（不缩放）；
 *  · **下载 PNG / 复制图片**走 DOM → SVG `<foreignObject>` → Image → canvas → toBlob（零依赖）；
 *  · 也可以什么都不点，直接系统截图。
 */
import {
  boardToPngBlob,
  createShareBoard,
  downloadBlob,
  type ShareInput,
  type ShareSections,
} from './SharePanel.js';
import type { AnyPrimitives, AnyReact } from './types.js';

export interface ShareShellProps extends ShareInput {
  /** 内聚到卡上的组件（StatsSection 的四个分区 + OnlineSection 的嵌入式在线块） */
  sections: ShareSections;
  onClose: () => void;
  /** 由调用方提供快照加载状态 */
  loading?: boolean;
  error?: string;
}

export function createShareShell(React: AnyReact, P: AnyPrimitives): (props: ShareShellProps) => any {
  const h = React.createElement;
  const ShareBoard = createShareBoard(React);
  const Btn =
    P.Button ||
    (({ children, ...rest }: any) => h('button', { type: 'button', className: 'tm-btn', ...rest }, children));

  return function ShareShell(props: ShareShellProps): any {
    const boardRef = React.useRef(null as any);
    /**
     * 板子跟随舞台宽度 1:1 排版（不缩放、不裁切），高度由内容决定、装不下就在舞台内滚动。
     * 这里只需要在导出前量一次它的真实尺寸。
     */
    const [size, setSize] = React.useState({ w: 0, h: 0 } as { w: number; h: number });
    const [showIdentity, setShowIdentity] = React.useState(true);
    const [busy, setBusy] = React.useState('');
    const [msg, setMsg] = React.useState('');

    const hasIdentity = Boolean(props.gitName || props.gitEmail);
    const input: ShareInput = {
      data: props.data,
      gitName: props.gitName,
      gitEmail: props.gitEmail,
      showIdentity: showIdentity && hasIdentity,
    };

    React.useEffect(() => {
      const board = boardRef.current as HTMLElement | null;
      if (board === null) return undefined;
      const measure = (): void => {
        const w = board.offsetWidth;
        const bh = board.offsetHeight; // 板子是 width:100%; height:auto
        if (w > 0 && bh > 0) {
          setSize((prev: { w: number; h: number }) => (prev.w === w && prev.h === bh ? prev : { w, h: bh }));
        }
      };
      measure();
      if (typeof ResizeObserver === 'undefined') return undefined;
      const ro = new ResizeObserver(measure);
      ro.observe(board); // 宽度随舞台变、高度随数据到位而变
      return () => ro.disconnect();
    }, [props.loading, props.data]);

    React.useEffect(() => {
      const onKey = (e: KeyboardEvent): void => {
        if (e.key === 'Escape') props.onClose();
      };
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
    }, [props]);

    const withBoard = async (fn: (node: HTMLElement) => Promise<void>): Promise<void> => {
      const node = boardRef.current as HTMLElement | null;
      // 拿不到节点时给一句明确反馈：静默 return 会让按钮看起来像坏了
      if (node === null || node === undefined || size.h <= 0 || size.w <= 0) {
        setMsg('卡片尚未就绪，请稍后再试（或直接系统截图）');
        return;
      }
      setBusy('工作…');
      setMsg('');
      // 先等两帧再量尺寸：各组件的图表是按实测宽度用 ResizeObserver 排版的，数据刚到就
      // 点导出时可能还没排定（实测首次导出会比最终布局矮一截，底部那一行会被切掉）。
      // **必须有超时兜底** —— 后台标签页/被遮挡的页面里 requestAnimationFrame 不会触发，
      // 只等 rAF 会把导出永久卡在「工作…」。
      await new Promise<void>((resolve) => {
        let settled = false;
        const finish = (): void => {
          if (!settled) {
            settled = true;
            resolve();
          }
        };
        if (typeof requestAnimationFrame === 'function')
          requestAnimationFrame(() => requestAnimationFrame(finish));
        window.setTimeout(finish, 150);
      });
      try {
        await fn(node);
      } catch (e) {
        setMsg('失败：' + String((e as Error)?.message ?? e));
      } finally {
        setBusy('');
      }
    };

    const onDownload = (): Promise<void> =>
      withBoard(async (node) => {
        const blob = await boardToPngBlob(node, node.offsetWidth, node.offsetHeight);
        const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
        downloadBlob(blob, `dsh-token-meter-${stamp}.png`);
        setMsg('已下载 PNG');
      });

    const onCopy = (): Promise<void> =>
      withBoard(async (node) => {
        const nav = navigator as Navigator & { clipboard?: Clipboard };
        if (nav.clipboard === undefined || typeof ClipboardItem === 'undefined') {
          setMsg('此浏览器不支持复制图片，请用「下载 PNG」');
          return;
        }
        const blob = await boardToPngBlob(node, node.offsetWidth, node.offsetHeight);
        await nav.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        setMsg('已复制到剪贴板');
      });

    return h(
      'div',
      { className: 'tm-shareVeil', role: 'dialog', 'aria-modal': 'true', 'aria-label': '分享卡' },
      h(
        'div',
        { className: 'tm-shareBar' },
        h('span', { className: 'tm-shareBarTitle' }, '分享卡 · 16:9'),
        h(
          'span',
          { className: 'tm-shareBarHint' },
          props.loading
            ? '正在聚合会话日志…'
            : props.error
              ? '统计不可用：' + props.error
              : msg ||
                '下载 / 复制为 ' +
                  (size.w > 0 ? Math.round(size.w) + '×' + Math.round(size.h) : '') +
                  ' 的 2× PNG，或直接系统截图',
        ),
        hasIdentity
          ? h(
              'label',
              { className: 'tm-shareToggle', title: '分享卡会带上 git 里的用户名与邮箱' },
              h('input', {
                type: 'checkbox',
                checked: showIdentity,
                onChange: (e: any) => setShowIdentity(e.target.checked === true),
              }),
              '显示用户名 / 邮箱',
            )
          : null,
        h(
          Btn,
          {
            variant: 'outline',
            size: 'sm',
            disabled: props.loading === true || busy !== '',
            onClick: () => void onDownload(),
          },
          '下载 PNG',
        ),
        h(
          Btn,
          {
            variant: 'outline',
            size: 'sm',
            disabled: props.loading === true || busy !== '',
            onClick: () => void onCopy(),
          },
          '复制图片',
        ),
        h(Btn, { variant: 'ghost', size: 'sm', onClick: props.onClose }, '关闭'),
      ),
      h(
        'div',
        { className: 'tm-shareStage' },
        props.loading === true
          ? h('div', { className: 'tm-shareLoading' }, h('span', { className: 'tm-spinner' }), '正在聚合…')
          : h(
              'div',
              { className: 'tm-shareFit' },
              h(
                'div',
                { className: 'tm-shareZoom', ref: boardRef },
                h(ShareBoard, { ...input, sections: props.sections }),
              ),
            ),
      ),
    );
  };
}
