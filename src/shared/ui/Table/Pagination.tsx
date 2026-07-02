import { useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { cn } from '@shared/lib/cn';
import { useClickOutside } from '@shared/lib/hooks/useClickOutside';
import { ChevronDownIcon } from '../icons/ChevronDownIcon';
import { RefreshIcon } from '../icons/RefreshIcon';
import { buildPageRange } from './pageRange';

type PageSizeSelectProps = {
  value: number;
  options: number[];
  onChange: (size: number) => void;
};

/** Compact dropdown for the page-size control — a native `<select>` can't have its own padded, hover-styled option list. */
function PageSizeSelect({ value, options, onChange }: PageSizeSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside(containerRef, () => setIsOpen(false));

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="border-border bg-surface text-fg hover:bg-surface-hover flex h-7 items-center gap-1 rounded border px-2 transition-colors"
      >
        {value}
        <ChevronDownIcon
          size={12}
          className={cn(
            'text-fg-muted transition-transform',
            isOpen && 'rotate-180',
          )}
        />
      </button>

      {isOpen && (
        <div className="border-border bg-surface absolute right-0 bottom-full z-20 mb-1 w-16 rounded border py-1 shadow-lg">
          {options.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => {
                onChange(size);
                setIsOpen(false);
              }}
              className={cn(
                'hover:bg-surface-hover flex w-full items-center px-3 py-1.5 text-left transition-colors',
                size === value ? 'text-primary font-medium' : 'text-fg',
              )}
            >
              {size}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

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
  className?: string;
};

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export function Pagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onReload,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  className,
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
    <div
      className={cn(
        'bg-surface border-border flex flex-wrap items-center justify-between gap-3 border-b px-3 py-2 text-xs',
        className,
      )}
    >
      <span className="text-fg-muted font-medium whitespace-nowrap">
        <Trans
          i18nKey="common.showingRange"
          values={{ start: rangeStart, end: rangeEnd, total: totalItems }}
          components={{ b: <strong className="text-fg font-semibold" /> }}
        />
      </span>

      <div className="flex flex-wrap items-center gap-3">
        {onPageSizeChange && (
          <PageSizeSelect
            value={pageSize}
            options={pageSizeOptions}
            onChange={onPageSizeChange}
          />
        )}

        <div className="border-border divide-border flex h-7 items-center divide-x overflow-hidden rounded border">
          {/* <span className="text-fg-muted px-2 whitespace-nowrap">
            {t('common.goToPage')}
          </span> */}
          <input
            type="number"
            min={1}
            max={totalPages}
            value={jumpValue}
            onChange={(e) => setJumpValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submitJump()}
            className="bg-surface text-fg h-full w-14 [appearance:textfield] px-1.5 outline-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <button
            type="button"
            onClick={submitJump}
            className="text-fg hover:bg-surface-hover h-full px-2 font-medium transition-colors"
          >
            {t('common.goToPage')}
          </button>
        </div>

        <div className="border-border divide-border flex h-7 items-center divide-x overflow-hidden rounded border">
          <button
            type="button"
            disabled={page <= 0}
            onClick={() => onPageChange(page - 1)}
            className="text-fg hover:bg-surface-hover disabled:text-disabled-fg flex h-full items-center gap-1 px-2.5 font-medium whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:hover:bg-transparent"
          >
            <ChevronDownIcon size={11} className="rotate-90" />
            {t('common.previous')}
          </button>

          {buildPageRange(currentPage, totalPages).map((item, index) =>
            item === 'ellipsis' ? (
              <span
                key={`ellipsis-${index}`}
                className="text-fg-muted flex h-full w-7 items-center justify-center"
              >
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => onPageChange(item - 1)}
                className={cn(
                  'flex h-full w-7 items-center justify-center font-medium transition-colors',
                  item === currentPage
                    ? 'bg-surface-hover text-fg'
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
            className="text-fg hover:bg-surface-hover disabled:text-disabled-fg flex h-full items-center gap-1 px-2.5 font-medium whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:hover:bg-transparent"
          >
            {t('common.next')}
            <ChevronDownIcon size={11} className="-rotate-90" />
          </button>
        </div>

        {onReload && (
          <button
            type="button"
            onClick={onReload}
            aria-label={t('common.reload')}
            title={t('common.reload')}
            className="text-fg-muted hover:text-fg hover:bg-surface-hover flex size-7 items-center justify-center rounded transition-colors"
          >
            <RefreshIcon size={12} />
          </button>
        )}
      </div>
    </div>
  );
}
