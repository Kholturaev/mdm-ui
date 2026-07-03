import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type {
  ConflictField,
  ProductConflict,
} from '@entities/analytics/model/types';
import { Card, CardHeader } from '@shared/ui/Card';
import { cn } from '@shared/lib/cn';
import { SwapIcon } from '@shared/ui/icons/SwapIcon';
import { DollarIcon } from '@shared/ui/icons/DollarIcon';
import { RulerIcon } from '@shared/ui/icons/RulerIcon';
import { BarcodeIcon } from '@shared/ui/icons/BarcodeIcon';
import { ArrowRightIcon } from '@shared/ui/icons/ArrowRightIcon';

const FIELD_ICON: Record<ConflictField, ReactNode> = {
  PRICE: <DollarIcon size={14} />,
  UNIT: <RulerIcon size={14} />,
  BARCODE: <BarcodeIcon size={14} />,
};

type DataConflictsCardProps = {
  totalCount: number;
  items: ProductConflict[];
};

function useConflictDetail() {
  const { t } = useTranslation();
  return (conflict: ProductConflict) => {
    const field = t(`analytics.conflicts.field.${conflict.field}`);
    if (conflict.field === 'BARCODE') {
      return t('analytics.conflicts.differsAcross', {
        field,
        count: conflict.values.length,
      });
    }
    const values = conflict.values
      .map((v) => `${v.systemName} ${v.value}`)
      .join(' · ');
    return `${field}: ${values}`;
  };
}

export function DataConflictsCard({
  totalCount,
  items,
}: DataConflictsCardProps) {
  const { t } = useTranslation();
  const describe = useConflictDetail();

  return (
    <Card className="flex flex-col">
      <CardHeader
        title={t('analytics.conflicts.title')}
        subtitle={t('analytics.conflicts.subtitle')}
        icon={<SwapIcon size={16} />}
      />

      <div className="mb-3 flex items-baseline gap-1.5">
        <span className="text-warning text-2xl font-semibold tabular-nums">
          {totalCount}
        </span>
        <span className="text-fg-muted text-sm">
          {t('analytics.conflicts.countLabel')}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2">
        {items.map((conflict) => (
          <div
            key={conflict.productId}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2.5',
              conflict.severity === 'danger' ? 'bg-danger/10' : 'bg-warning/10',
            )}
          >
            <div className="min-w-0 flex-1">
              <p className="text-fg truncate text-sm font-medium">
                {conflict.productName}
              </p>
              <p
                className={cn(
                  'truncate text-xs',
                  conflict.severity === 'danger'
                    ? 'text-danger'
                    : 'text-warning',
                )}
              >
                {describe(conflict)}
              </p>
            </div>
            <span
              className={cn(
                'shrink-0',
                conflict.severity === 'danger' ? 'text-danger' : 'text-warning',
              )}
            >
              {FIELD_ICON[conflict.field]}
            </span>
          </div>
        ))}
      </div>

      {/* TODO: point at a dedicated, filterable conflicts view once the
          backend tracks per-field cross-system values — for now this is the
          closest real page, same approximation used for the attention panel. */}
      <Link
        to="/nomenclature"
        className="text-primary mt-3 flex items-center gap-1 self-start text-xs font-semibold"
      >
        {t('analytics.conflicts.viewAll')}
        <ArrowRightIcon size={12} />
      </Link>
    </Card>
  );
}
