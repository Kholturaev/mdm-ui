import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@shared/lib/cn';
import { ChevronDownIcon } from '../icons/ChevronDownIcon';
import { RefreshIcon } from '../icons/RefreshIcon';
import { buildPageRange } from './pageRange';

type PaginationProps = {
  /** 0-indexed current page. */
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onReload?: () => void;
  pageSizeOptions?: number[];
};

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const ICON_BUTTON =
  'flex size-7 items-center justify-center rounded border transition-colors';
const NUMBER_BUTTON =
  'flex size-7 items-center justify-center rounded text-xs font-medium transition-colors';

export function Pagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onReload,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
}: PaginationProps) {
  const { t } = useTranslation();
  const [jumpValue, setJumpValue] = useState('');

  if (totalPages <= 0) return null;

  const currentPage = page + 1;
  const rangeStart = page * pageSize + 1;
  const rangeEnd = Math.min((page + 1) * pageSize, totalItems);

  const submitJump = () => {
    const target = Number(jumpValue);
    if (Number.isInteger(target) && target >= 1 && target <= totalPages) {
      onPageChange(target - 1);
    }
    setJumpValue('');
  };

  return (
    <div className="bg-surface border-border flex flex-wrap items-center justify-between gap-3 rounded-md border px-3 py-2 text-xs">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-fg-muted whitespace-nowrap">
          {t('common.showingRange', {
            start: rangeStart,
            end: rangeEnd,
            total: totalItems,
          })}
        </span>

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5">
            <span className="text-fg-muted whitespace-nowrap">
              {t('common.rowsPerPage')}
            </span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="border-border bg-surface text-fg h-7 rounded border px-1.5 outline-none"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={page <= 0}
          onClick={() => onPageChange(page - 1)}
          aria-label={t('common.previous')}
          title={t('common.previous')}
          className={cn(
            ICON_BUTTON,
            'border-border text-fg hover:bg-surface-hover disabled:text-disabled-fg disabled:hover:bg-surface disabled:cursor-not-allowed',
          )}
        >
          <ChevronDownIcon size={14} className="rotate-90" />
        </button>

        {buildPageRange(currentPage, totalPages).map((item, index) =>
          item === 'ellipsis' ? (
            <span key={`ellipsis-${index}`} className="text-fg-muted px-1">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item - 1)}
              className={cn(
                NUMBER_BUTTON,
                item === currentPage
                  ? 'bg-primary text-primary-foreground'
                  : 'text-fg hover:bg-surface-hover',
              )}
            >
              {item}
            </button>
          ),
        )}

        <button
          type="button"
          disabled={page >= totalPages - 1}
          onClick={() => onPageChange(page + 1)}
          aria-label={t('common.next')}
          title={t('common.next')}
          className={cn(
            ICON_BUTTON,
            'border-border text-fg hover:bg-surface-hover disabled:text-disabled-fg disabled:hover:bg-surface disabled:cursor-not-allowed',
          )}
        >
          <ChevronDownIcon size={14} className="-rotate-90" />
        </button>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="text-fg-muted whitespace-nowrap">
          {t('common.goToPage')}
        </span>
        <input
          type="number"
          min={1}
          max={totalPages}
          value={jumpValue}
          onChange={(e) => setJumpValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submitJump()}
          className="border-border bg-surface text-fg h-7 w-12 [appearance:textfield] rounded border px-1.5 outline-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <button
          type="button"
          onClick={submitJump}
          className="border-border text-fg hover:bg-surface-hover h-7 rounded border px-2 font-medium transition-colors"
        >
          {t('common.go')}
        </button>

        {onReload && (
          <button
            type="button"
            onClick={onReload}
            aria-label={t('common.reload')}
            title={t('common.reload')}
            className={cn(
              ICON_BUTTON,
              'text-fg-muted hover:bg-surface-hover hover:text-fg border-transparent',
            )}
          >
            <RefreshIcon size={13} />
          </button>
        )}
      </div>
    </div>
  );
}
