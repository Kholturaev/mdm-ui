import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '../Input';
import { SearchIcon } from '../icons/SearchIcon';
import { CloseIcon } from '../icons/ChevronDownIcon';

type TableToolbarProps = {
  /** Page/section title, rendered in the left slot. */
  title?: ReactNode;
  /** Omit both search props to skip rendering the search input entirely — e.g. when a table uses per-column search instead. */
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  /** Extra content in the left slot, after the title — e.g. a result-count label. */
  leftContent?: ReactNode;
  /** Right-aligned actions, e.g. "Create" / "Export" buttons — rendered after the search input. */
  children?: ReactNode;
};

/** Title on the left; search input and row actions on the right, sitting directly on top of the table as its header bar. */
export function TableToolbar({
  title,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  leftContent,
  children,
}: TableToolbarProps) {
  const { t } = useTranslation();

  return (
    <div className="bg-surface border-border flex items-center justify-between gap-3 border-b px-3 py-2">
      <div className="flex min-w-0 items-center gap-3">
        {title && (
          <h2 className="text-fg shrink-0 text-sm font-semibold whitespace-nowrap">
            {title}
          </h2>
        )}
        {leftContent}
      </div>
      <div className="flex items-center gap-2">
        {onSearchChange && (
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
        )}
        {children && <div className="flex items-center gap-2">{children}</div>}
      </div>
    </div>
  );
}
