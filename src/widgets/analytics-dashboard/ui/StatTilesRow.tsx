import { useTranslation } from 'react-i18next';
import type { AnalyticsTotals } from '@entities/analytics/model/types';
import { PackageIcon } from '@shared/ui/icons/PackageIcon';
import { CheckCircleIcon } from '@shared/ui/icons/CheckCircleIcon';
import { AlertTriangleIcon } from '@shared/ui/icons/AlertTriangleIcon';
import { UnlinkIcon } from '@shared/ui/icons/UnlinkIcon';
import { StatTile } from './StatTile';

type StatTilesRowProps = {
  totals: AnalyticsTotals;
};

export function StatTilesRow({ totals }: StatTilesRowProps) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatTile
        label={t('analytics.stats.total')}
        value={totals.totalProducts}
        subtext={t('analytics.stats.totalSubtext', {
          count: totals.connectedProductsCount,
        })}
        icon={<PackageIcon size={16} />}
        iconClassName="bg-fg/10 text-fg"
        progressValue={totals.connectedProductsCount}
        progressMax={totals.totalProducts}
        progressClassName="bg-fg"
      />
      <StatTile
        label={t('analytics.stats.fullySynced')}
        value={totals.fullySyncedCount}
        subtext={t('analytics.stats.fullySyncedSubtext', {
          count: totals.totalSystemsCount,
        })}
        icon={<CheckCircleIcon size={16} />}
        iconClassName="bg-success/10 text-success"
        progressValue={totals.fullySyncedCount}
        progressMax={totals.totalProducts}
        progressClassName="bg-success"
      />
      <StatTile
        label={t('analytics.stats.partial')}
        value={totals.partialCount}
        subtext={t('analytics.stats.partialSubtext', {
          pending: totals.partialPendingCount,
          error: totals.partialErrorCount,
        })}
        icon={<AlertTriangleIcon size={16} />}
        iconClassName="bg-warning/10 text-warning"
        progressValue={totals.partialCount}
        progressMax={totals.totalProducts}
        progressClassName="bg-warning"
      />
      <StatTile
        label={t('analytics.stats.unconnected')}
        value={totals.unconnectedCount}
        subtext={t('analytics.stats.unconnectedSubtext')}
        icon={<UnlinkIcon size={16} />}
        iconClassName="bg-danger/10 text-danger"
        progressValue={totals.unconnectedCount}
        progressMax={totals.totalProducts}
        progressClassName="bg-danger"
      />
    </div>
  );
}
