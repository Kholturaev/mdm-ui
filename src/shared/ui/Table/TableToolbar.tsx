import type { ReactNode } from 'react';
import { Input } from '../Input';
import { SearchIcon } from '../icons/SearchIcon';

type TableToolbarProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  /** Right-aligned actions, e.g. "Create" / "Export" buttons. */
  children?: ReactNode;
};

/** Search input and row actions on one line, so a table's filter bar doesn't cost an extra row. */
export function TableToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  children,
}: TableToolbarProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Input
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={searchPlaceholder}
        leftIcon={<SearchIcon size={14} />}
        containerClassName="max-w-xs"
      />
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}
