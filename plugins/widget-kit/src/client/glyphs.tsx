/**
 * 托盘图标（18px 视口，`currentColor`，`aria-hidden` —— 可访问名由托盘按钮的 aria-label 给）
 *
 * @module @dshp/widget-kit/client/glyphs
 */
import type { ReactNode } from 'react';

function Glyph({ children }: { children: ReactNode }): ReactNode {
  return (
    <svg
      viewBox="0 0 18 18"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

/** 时钟。 */
export function ClockGlyph(): ReactNode {
  return (
    <Glyph>
      <circle cx="9" cy="9" r="6.5" />
      <path d="M9 5.4V9l2.6 1.6" strokeLinecap="round" />
    </Glyph>
  );
}

/** 注册表 / 清单。 */
export function RegistryGlyph(): ReactNode {
  return (
    <Glyph>
      <rect x="2.6" y="3.4" width="12.8" height="11.2" rx="2.2" />
      <path d="M5.6 7h6.8M5.6 9.6h6.8M5.6 12.2h4" strokeLinecap="round" />
    </Glyph>
  );
}
