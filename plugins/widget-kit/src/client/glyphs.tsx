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

/** 滑杆（快速设置）。 */
export function SlidersGlyph(): ReactNode {
  return (
    <Glyph>
      <path d="M3 5.5h12M3 9h12M3 12.5h12" strokeLinecap="round" />
      <circle cx="7" cy="5.5" r="1.6" />
      <circle cx="11.5" cy="9" r="1.6" />
      <circle cx="6" cy="12.5" r="1.6" />
    </Glyph>
  );
}

/** 脉冲（状态速览）。 */
export function PulseGlyph(): ReactNode {
  return (
    <Glyph>
      <path d="M2 9.5h3.2l1.6-4 2.4 7.4 1.8-4.4 1.2 2.4H16" strokeLinecap="round" strokeLinejoin="round" />
    </Glyph>
  );
}
