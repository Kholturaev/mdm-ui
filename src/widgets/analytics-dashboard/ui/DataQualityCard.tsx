import { useTranslation } from 'react-i18next';
import type { DataQualitySummary } from '@entities/analytics/model/types';
import { Card, CardHeader } from '@shared/ui/Card';
import { CopyStackIcon } from '@shared/ui/icons/CopyStackIcon';
import { AlertTriangleIcon } from '@shared/ui/icons/AlertTriangleIcon';

type DataQualityCardProps = {
  dataQuality: DataQualitySummary;
};

export function DataQualityCard({ dataQuality }: DataQualityCardProps) {
  const { t } = useTranslation();

  return (
    <Card className="flex flex-col">
      <CardHeader
        title={t('analytics.dataQuality.title')}
        icon={<CopyStackIcon size={16} />}
      />

      <div className="divide-border flex flex-1 flex-col divide-y">
        <div className="flex items-center gap-3 py-2.5 first:pt-0">
          <span className="bg-warning/10 text-warning flex size-8 shrink-0 items-center justify-center rounded-md">
            <CopyStackIcon size={15} />
          </span>
          <div className="min-w-0">
            <p className="text-fg text-sm font-medium tabular-nums">
              {t('analytics.dataQuality.duplicates', {
                count: dataQuality.duplicateGroups,
              })}
            </p>
            <p className="text-fg-muted text-xs">
              {t('analytics.dataQuality.duplicatesDesc', {
                count: dataQuality.affectedProducts,
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 py-2.5 last:pb-0">
          <span className="bg-danger/10 text-danger flex size-8 shrink-0 items-center justify-center rounded-md">
            <AlertTriangleIcon size={15} />
          </span>
          <div className="min-w-0">
            <p className="text-fg text-sm font-medium tabular-nums">
              {t('analytics.dataQuality.validationErrors', {
                count: dataQuality.validationErrorCount,
              })}
            </p>
            <p className="text-fg-muted text-xs">
              {t('analytics.dataQuality.validationErrorsDesc')}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
