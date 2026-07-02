import { useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@shared/lib/cn';
import { useClickOutside } from '@shared/lib/hooks/useClickOutside';
import { ChevronDownIcon } from '@shared/ui/icons/ChevronDownIcon';
import { CheckCircleIcon } from '@shared/ui/icons/CheckCircleIcon';
import { AlertTriangleIcon } from '@shared/ui/icons/AlertTriangleIcon';
import { XCircleIcon } from '@shared/ui/icons/XCircleIcon';
import { ClockIcon } from '@shared/ui/icons/ClockIcon';
import { LayersIcon } from '@shared/ui/icons/LayersIcon';
import type { SyncStatusFilter } from '../model/types';

const SYNC_STATUS_OPTIONS: {
  value: SyncStatusFilter;
  labelKey: string;
  descKey: string;
  icon: ReactNode;
  colorClass: string;
}[] = [
  {
    value: 'all',
    labelKey: 'product.syncAll',
    descKey: 'product.syncAllDesc',
    icon: <LayersIcon size={14} />,
    colorClass: 'text-fg-muted',
  },
  {
    value: 'full',
    labelKey: 'product.syncFull',
    descKey: 'product.syncFullDesc',
    icon: <CheckCircleIcon size={14} />,
    colorClass: 'text-success',
  },
  {
    value: 'partial',
    labelKey: 'product.syncPartial',
    descKey: 'product.syncPartialDesc',
    icon: <AlertTriangleIcon size={14} />,
    colorClass: 'text-warning',
  },
  {
    value: 'error',
    labelKey: 'product.syncError',
    descKey: 'product.syncErrorDesc',
    icon: <XCircleIcon size={14} />,
    colorClass: 'text-danger',
  },
  {
    value: 'none',
    labelKey: 'product.syncNone',
    descKey: 'product.syncNoneDesc',
    icon: <ClockIcon size={14} />,
    colorClass: 'text-fg-muted',
  },
];

type SyncStatusDropdownProps = {
  value: SyncStatusFilter;
  onChange: (value: SyncStatusFilter) => void;
  /** Approximate counts per status — there's no backend aggregate yet, so these are derived from whatever page is currently loaded. */
  counts: Record<SyncStatusFilter, number>;
};

export function SyncStatusDropdown({
  value,
  onChange,
  counts,
}: SyncStatusDropdownProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  useClickOutside(containerRef, () => setIsOpen(false));

  const active =
    SYNC_STATUS_OPTIONS.find((option) => option.value === value) ??
    SYNC_STATUS_OPTIONS[0];

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="border-border bg-surface hover:bg-surface-hover flex h-8 items-center gap-1.5 rounded border px-2.5 text-xs font-medium transition-colors"
      >
        <span className="text-fg-muted">{t('product.productStatus')}:</span>
        <span className={active.colorClass}>{active.icon}</span>
        <span className="text-fg">
          {t(active.labelKey)} ({counts[active.value]})
        </span>
        <ChevronDownIcon
          size={12}
          className={cn(
            'text-fg-muted transition-transform',
            isOpen && 'rotate-180',
          )}
        />
      </button>

      {isOpen && (
        <div className="border-border bg-surface absolute top-full left-0 z-50 mt-1 w-64 rounded-md border py-1.5 shadow-lg">
          {SYNC_STATUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={cn(
                'hover:bg-surface-hover flex w-full items-start gap-2.5 px-3 py-2 text-left transition-colors',
                value === option.value && 'bg-surface-hover',
              )}
            >
              <span className={cn('mt-0.5', option.colorClass)}>
                {option.icon}
              </span>
              <span className="flex flex-1 flex-col">
                <span className="text-fg flex items-center justify-between gap-2 text-xs font-medium">
                  {t(option.labelKey)}
                  <span className="text-fg-muted font-normal">
                    {counts[option.value]}
                  </span>
                </span>
                <span className="text-fg-muted text-[11px]">
                  {t(option.descKey)}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
