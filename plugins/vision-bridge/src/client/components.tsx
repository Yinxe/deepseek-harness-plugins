/**
 * 基础 UI 构件（官方设置行规格）
 *
 * 「一行 = 标题 + 说明 + 右侧控件」的版式与胶囊下拉的调用形态本来就不在 primitives 里，
 * 所以在这里就地实现；能复用的都复用官方实现：下拉内部是官方 `Menu`，箭头是官方图标，
 * 开关只是一个受控 `<button role="switch">`（官方 `Switch` 的 DOM 与之同构，但形状/尺寸是
 * 这一节自己的规格，见 `styles.module.css`）。
 *
 * 类型全部真实：props 用本地接口建模，`children` 是 `ReactNode`，不再有 `AnyReact` 那层 shim。
 *
 * @module @dshp/vision-bridge/client/components
 */
import { useState, type ReactNode } from 'react';
import { IconChevronDownOutline14, Menu } from '@deepseek-ai/dsh-client-ui-primitives';
import styles from './styles.module.css';

/**
 * 拼类名。
 *
 * CSS Module 的映射是宽松声明（`shared/types/css-modules.d.ts`），每个值都是 `string | undefined`
 * ——直接拼字符串会得到 `"a undefined"`。这里统一滤掉空值，省得每个调用点自己判。
 *
 * @param names - 类名候选。
 * @returns 空格分隔的类名。
 */
function cx(...names: Array<string | undefined>): string {
  return names.filter((name) => name !== undefined).join(' ');
}

/** 徽章配色（官方色板）。 */
export type BadgeKind = 'ok' | 'warn' | 'muted' | 'info';

/** 徽章配色 → 类名。 */
const BADGE_CLASS: Record<BadgeKind, string | undefined> = {
  ok: styles.badgeOk,
  warn: styles.badgeWarn,
  muted: styles.badgeMuted,
  info: styles.badgeInfo,
};

/** 徽章 props。 */
export interface BadgeProps {
  kind: BadgeKind;
  text: string;
}

/**
 * 一枚状态徽章。
 *
 * @param props - 配色与文字。
 * @returns 胶囊标签。
 */
export function Badge({ kind, text }: BadgeProps): ReactNode {
  return <span className={cx(styles.badge, BADGE_CLASS[kind])}>{text}</span>;
}

/** 设置行 props。 */
export interface RowProps {
  label: string;
  desc?: string | undefined;
  children?: ReactNode;
}

/**
 * 一行设置：左侧标题 + 说明，右侧是调用方给的控件。
 *
 * @param props - 标题、可选说明与右侧控件。
 * @returns 设置行。
 */
export function Row({ label, desc, children }: RowProps): ReactNode {
  return (
    <div className={styles.row}>
      <div className={styles.rowText}>
        <div className={styles.title}>{label}</div>
        {desc ? <div className={styles.desc}>{desc}</div> : null}
      </div>
      {children}
    </div>
  );
}

/** 下拉的一个选项。 */
export interface SelectOption {
  id: string;
  label: string;
}

/** 下拉 props。 */
export interface SelectProps {
  disabled?: boolean | undefined;
  value: string;
  /** 收起状态下按钮上显示的文字（可以比选项 label 更长，如「不使用 fallback」）。 */
  selectedLabel: string;
  options: SelectOption[];
  onSelect: (id: string) => void;
}

/**
 * 胶囊下拉（官方 `Menu` 的受控包装）。
 *
 * 自己持有「展开 / 收起」这一个状态，选中后先收起再回调——选中项由调用方（配置对象）决定。
 *
 * @param props - 当前值、选项与选中回调。
 * @returns 锚点按钮 + 条件渲染的菜单。
 */
export function Select({ disabled, value, selectedLabel, options, onSelect }: SelectProps): ReactNode {
  const [open, setOpen] = useState(false);
  const anchor = (
    <button
      type="button"
      className={styles.selector}
      aria-haspopup="menu"
      aria-expanded={open}
      disabled={disabled}
      onClick={() => setOpen((current) => !current)}
    >
      <span className={styles.selectorLabel}>{selectedLabel}</span>
      <IconChevronDownOutline14 className={styles.chevron} />
    </button>
  );
  return (
    <Menu
      open={open}
      onClose={() => setOpen(false)}
      items={options}
      selectedId={value}
      onSelect={(id) => {
        setOpen(false);
        onSelect(id);
      }}
      align="end"
      portal
      anchor={anchor}
    />
  );
}

/** 开关 props。 */
export interface SwitchProps {
  checked: boolean;
  disabled?: boolean | undefined;
  /** 无障碍名（也用于 aria-label）。 */
  label: string;
  onChange: () => void;
}

/**
 * 受控开关。
 *
 * @param props - 勾选态与切换回调。
 * @returns 开关按钮。
 */
export function Switch({ checked, disabled, label, onChange }: SwitchProps): ReactNode {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked === true}
      aria-label={label}
      className={cx(styles.switch, checked ? styles.switchOn : undefined)}
      disabled={disabled}
      onClick={onChange}
    >
      <span className={styles.thumb} />
    </button>
  );
}
