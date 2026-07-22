import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type { SystemCoverage } from '@entities/analytics/model/dashboardKpisTypes';
import { Card, CardHeader } from '@shared/ui/Card';
import { Progress } from '@shared/ui/Progress';
import { LayersIcon } from '@shared/ui/icons/LayersIcon';
import { systemAbbr } from '@shared/lib/systemAbbr';
import { buildNomenclatureLink } from '@shared/lib/nomenclatureLink';

type SystemsCoverageCardProps = {
  totalProducts: number;
  systems: SystemCoverage[];
};

export function SystemsCoverageCard({
  totalProducts,
  systems,
}: SystemsCoverageCardProps) {
  const { t } = useTranslation();

  return (
    <Card className="flex h-full flex-col">
      <CardHeader
        title={t('analytics.coverage.title')}
        icon={<LayersIcon size={16} />}
      />

      <div className="flex flex-1 flex-col justify-center gap-4">
        {systems.map((system) => (
          <Link
            key={system.externalSystemId}
            to={buildNomenclatureLink({ systemId: system.externalSystemId })}
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
                {system.syncedProductCount}/{totalProducts} (
                {system.coveragePercent.toFixed(2)}%)
              </span>
            </div>
            <Progress
              max={totalProducts}
              segments={[
                { value: system.syncedProductCount, className: 'bg-success' },
              ]}
            />
          </Link>
        ))}
      </div>
    </Card>
  );
}
