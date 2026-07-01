import { cn } from '@shared/lib/cn';
import { SortArrowDownIcon, SortArrowUpIcon } from '../icons/SortArrowIcon';

export type SortDirection = 'asc' | 'desc' | null;

type SortableHeaderProps = {
  label: string;
  field: string;
  activeField: string | null;
  direction: SortDirection;
  onSort: (field: string) => void;
};

/** Column header with small up/down arrows next to the label — active column's label and direction arrow turn primary-colored. */
export function SortableHeader({
  label,
  field,
  activeField,
  direction,
  onSort,
}: SortableHeaderProps) {
  const isActive = activeField === field;

  return (
    <button
      type="button"
      onClick={() => onSort(field)}
      className="flex items-center gap-1 text-xs font-semibold transition-colors"
    >
      <span
        className={isActive ? 'text-primary' : 'text-fg-muted hover:text-fg'}
      >
        {label}
      </span>
      <span className="flex items-center">
        <SortArrowUpIcon
          className={cn(
            isActive && direction === 'asc'
              ? 'text-primary'
              : 'text-border-strong',
          )}
        />
        <SortArrowDownIcon
          className={cn(
            isActive && direction === 'desc'
              ? 'text-primary'
              : 'text-border-strong',
          )}
        />
      </span>
    </button>
  );
}
