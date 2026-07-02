import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ProductStatus } from '@entities/product/model/types';
import { cn } from '@shared/lib/cn';
import { useClickOutside } from '@shared/lib/hooks/useClickOutside';
import { Badge } from '@shared/ui/Badge';
import { ChevronDownIcon } from '@shared/ui/icons/ChevronDownIcon';
import { STATUS_VARIANT } from '../lib/constants';

type StatusFilterDropdownProps = {
  value: string;
  onChange: (value: string) => void;
};

/** Status filter for the table's own filter row — its options are the same colored badges as the table's `productStatus` cells, so picking a filter looks like picking the value itself. */
export function StatusFilterDropdown({
  value,
  onChange,
}: StatusFilterDropdownProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  useClickOutside(containerRef, () => setIsOpen(false));

  const select = (next: string) => {
    onChange(next);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="border-border bg-surface hover:bg-surface-hover flex h-7 w-full items-center justify-between gap-1 rounded border px-1.5 transition-colors"
      >
        {value ? (
          <Badge variant={STATUS_VARIANT[value as ProductStatus]} dot>
            {t(`product.status.${value}`)}
          </Badge>
        ) : (
          <span className="text-fg-muted px-0.5 text-xs">—</span>
        )}
        <ChevronDownIcon
          size={12}
          className={cn(
            'text-fg-muted shrink-0 transition-transform',
            isOpen && 'rotate-180',
          )}
        />
      </button>

      {isOpen && (
        <div className="border-border bg-surface absolute top-full left-0 z-50 mt-1 w-44 rounded-md border py-1.5 shadow-lg">
          <button
            type="button"
            onClick={() => select('')}
            className={cn(
              'hover:bg-surface-hover flex w-full items-center px-3 py-2 text-left transition-colors',
              value === '' && 'bg-surface-hover',
            )}
          >
            <span className="text-fg-muted text-xs">
              {t('product.systemAll')}
            </span>
          </button>
          {Object.values(ProductStatus).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => select(status)}
              className={cn(
                'hover:bg-surface-hover flex w-full items-center px-3 py-2 text-left transition-colors',
                value === status && 'bg-surface-hover',
              )}
            >
              <Badge variant={STATUS_VARIANT[status]} dot>
                {t(`product.status.${status}`)}
              </Badge>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
