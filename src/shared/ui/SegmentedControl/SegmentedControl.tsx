import { cn } from '@shared/lib/cn';

export type SegmentedOption<T extends string> = {
  label: string;
  value: T;
};

type SegmentedControlProps<T extends string> = {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: 'xs' | 'sm';
  disabled?: boolean;
  className?: string;
};

const SIZE_CLASSES = {
  xs: 'h-6 px-2 text-[11px]',
  sm: 'h-7 px-2.5 text-xs',
};

/** Two/three-way exclusive choice rendered as adjacent buttons in one bordered pill — e.g. Object/Flat, Columns/Rows, JSON/XML. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  size = 'sm',
  disabled = false,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      className={cn(
        'border-border bg-surface divide-border inline-flex shrink-0 items-stretch divide-x overflow-hidden rounded-md border',
        disabled && 'opacity-50',
        className,
      )}
    >
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={cn(
              'font-medium transition-colors disabled:cursor-not-allowed',
              SIZE_CLASSES[size],
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-fg-muted hover:bg-surface-hover hover:text-fg',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
