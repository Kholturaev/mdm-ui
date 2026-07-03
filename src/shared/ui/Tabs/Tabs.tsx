import type { ReactNode } from 'react';
import { cn } from '@shared/lib/cn';

export type TabItem = {
  key: string;
  label: string;
  icon?: ReactNode;
};

type TabsProps = {
  items: TabItem[];
  value: string;
  onChange: (key: string) => void;
  className?: string;
};

/** Underline-style tab bar — switches content below it, doesn't route. */
export function Tabs({ items, value, onChange, className }: TabsProps) {
  return (
    <div className={cn('border-border flex gap-1 border-b', className)}>
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={() => onChange(item.key)}
          className={cn(
            '-mb-px flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium transition-colors',
            value === item.key
              ? 'border-primary text-fg'
              : 'text-fg-muted hover:text-fg border-transparent',
          )}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </div>
  );
}
