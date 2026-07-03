import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type { SystemCoverageItem } from '@entities/analytics/model/types';
import { Card, CardHeader } from '@shared/ui/Card';
import { Progress } from '@shared/ui/Progress';
import { LayersIcon } from '@shared/ui/icons/LayersIcon';
import { systemAbbr } from '@shared/lib/systemAbbr';
import { buildNomenclatureLink } from '@shared/lib/nomenclatureLink';

type SystemsCoverageCardProps = {
  systems: SystemCoverageItem[];
};

const LEGEND: { key: 'synced' | 'pending' | 'error'; dotClassName: string }[] =
  [
    { key: 'synced', dotClassName: 'bg-success' },
    { key: 'pending', dotClassName: 'bg-warning' },
    { key: 'error', dotClassName: 'bg-danger' },
  ];

export function SystemsCoverageCard({ systems }: SystemsCoverageCardProps) {
  const { t } = useTranslation();

  return (
    <Card className="flex h-full flex-col">
      <CardHeader
        title={t('analytics.coverage.title')}
        icon={<LayersIcon size={16} />}
        action={
          <div className="flex items-center gap-3">
            {LEGEND.map((entry) => (
              <span
                key={entry.key}
                className="text-fg-muted flex items-center gap-1.5 text-xs"
              >
                <span className={`size-2 rounded-full ${entry.dotClassName}`} />
                {t(`analytics.coverage.legend.${entry.key}`)}
              </span>
            ))}
          </div>
        }
      />

      <div className="flex flex-1 flex-col justify-center gap-4">
        {systems.map((system) => {
          const covered =
            system.syncedCount + system.pendingCount + system.errorCount;
          return (
            <Link
              key={system.systemId}
              to={buildNomenclatureLink({ systemId: system.systemId })}
              className="hover:bg-surface-hover -mx-2 block rounded-md px-2 py-1 transition-colors"
            >
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="bg-primary/10 text-primary flex size-6 shrink-0 items-center justify-center rounded text-[10px] font-semibold">
                    {systemAbbr(system.systemName)}
                  </span>
                  <span className="text-fg text-sm font-medium">
                    {system.systemName}
                  </span>
                </div>
                <span className="text-fg-muted text-xs font-medium tabular-nums">
                  {covered}/{system.totalProducts}
                </span>
              </div>
              <Progress
                max={system.totalProducts}
                segments={[
                  { value: system.syncedCount, className: 'bg-success' },
                  { value: system.pendingCount, className: 'bg-warning' },
                  { value: system.errorCount, className: 'bg-danger' },
                ]}
              />
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
