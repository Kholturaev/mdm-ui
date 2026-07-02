import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '../Input';
import { SearchIcon } from '../icons/SearchIcon';
import { CloseIcon } from '../icons/ChevronDownIcon';

type TableToolbarProps = {
  /** Omit both to skip rendering the search input entirely — e.g. when a table uses per-column search instead. */
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  /** Right-aligned actions, e.g. "Create" / "Export" buttons. */
  children?: ReactNode;
};

/** Search input and row actions on one line, sitting directly on top of the table as its header bar. */
export function TableToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  children,
}: TableToolbarProps) {
  const { t } = useTranslation();

  return (
    <div className="bg-surface border-border flex items-center justify-between gap-3 border-b px-3 py-2">
      {onSearchChange ? (
        <Input
          size="sm"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          leftIcon={<SearchIcon size={14} />}
          rightIcon={
            searchValue && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                aria-label={t('common.clear')}
                className="text-fg-muted hover:text-fg flex items-center"
              >
                <CloseIcon size={12} />
              </button>
            )
          }
          containerClassName="max-w-xs"
        />
      ) : (
        <div />
      )}
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}
