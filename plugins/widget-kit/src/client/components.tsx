/**
 * 设置节的小构件（官方 primitives 里没有的那几个）
 *
 * @module @dshp/widget-kit/client/components
 */
import { Button, Menu } from '@deepseek-ai/dsh-client-ui-primitives';
import type { MenuEntry } from '@deepseek-ai/dsh-client-ui-primitives';
import { useState } from 'react';
import type { ReactNode } from 'react';
import styles from './styles.module.css';

/** 一行设置：左标题+说明，右控件。 */
export function SettingRow({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}): ReactNode {
  return (
    <div className={styles.row}>
      <div className={styles.rowLabel}>
        <span className={styles.rowTitle}>{title}</span>
        {hint !== undefined && <span className={styles.rowHint}>{hint}</span>}
      </div>
      <div className={styles.rowControl}>{children}</div>
    </div>
  );
}

/** 枚举选择（胶囊按钮 + 官方 Menu；键盘/焦点交给官方组件）。 */
export function PrefSelect<T extends string | number>({
  value,
  options,
  label,
  disabled,
  onChange,
}: {
  value: T;
  options: ReadonlyArray<{ value: T; label: string }>;
  label: string;
  disabled?: boolean;
  onChange: (next: T) => void;
}): ReactNode {
  const [open, setOpen] = useState(false);
  const current = options.find((option) => option.value === value);
  const items: MenuEntry[] = options.map((option) => ({ id: String(option.value), label: option.label }));
  return (
    <Menu
      open={open}
      dense
      selection="check"
      selectedId={String(value)}
      items={items}
      align="end"
      onClose={() => {
        setOpen(false);
      }}
      onSelect={(id) => {
        setOpen(false);
        const next = options.find((option) => String(option.value) === id);
        if (next !== undefined) onChange(next.value);
      }}
      anchor={
        <Button
          variant="outline"
          size="sm"
          aria-label={label}
          disabled={disabled === true}
          onClick={() => {
            setOpen((prev) => !prev);
          }}
        >
          {current?.label ?? String(value)}
        </Button>
      }
    />
  );
}

/** 一行提示（普通 / 出错 / 成功三态）。 */
export function Notice({
  tone = 'plain',
  children,
}: {
  tone?: 'plain' | 'bad' | 'ok';
  children: ReactNode;
}): ReactNode {
  const toneClass = tone === 'bad' ? styles.noticeBad : tone === 'ok' ? styles.noticeOk : '';
  return <p className={styles.notice + (toneClass === '' ? '' : ' ' + toneClass)}>{children}</p>;
}
