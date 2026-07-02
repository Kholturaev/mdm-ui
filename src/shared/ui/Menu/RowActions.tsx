import type { ReactNode } from 'react';
import { cn } from '@shared/lib/cn';
import { ActionsMenu } from './ActionsMenu';

export type RowAction = {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  danger?: boolean;
};

type RowActionsProps = {
  items: RowAction[];
  /** How many actions render as direct icon buttons before the rest collapse into the "…" menu. */
  maxVisible?: number;
};

/** Row actions as one connected button group — separated by divider lines — with anything past `maxVisible` tucked behind a trailing "…" menu. No menu at all when everything fits. */
export function RowActions({ items, maxVisible = 2 }: RowActionsProps) {
  const visible =
    items.length > maxVisible ? items.slice(0, maxVisible) : items;
  const overflow = items.length > maxVisible ? items.slice(maxVisible) : [];

  return (
    <div className="border-border bg-surface divide-border ml-auto flex w-fit shrink-0 items-center divide-x overflow-hidden rounded border">
      {visible.map((item) => (
        <button
          key={item.label}
          type="button"
          onClick={item.onClick}
          aria-label={item.label}
          title={item.label}
          className={cn(
            'flex size-7 shrink-0 items-center justify-center transition-colors',
            item.danger
              ? 'text-danger hover:bg-danger/10'
              : 'text-fg-muted hover:bg-surface-hover hover:text-fg',
          )}
        >
          {item.icon}
        </button>
      ))}
      {overflow.length > 0 && (
        <ActionsMenu
          items={overflow}
          triggerClassName="rounded-none border-0 shadow-none"
        />
      )}
    </div>
  );
}
