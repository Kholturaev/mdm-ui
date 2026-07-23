import { useTranslation } from 'react-i18next';
import { buildNomenclatureLink } from '@shared/lib/nomenclatureLink';
import { PackageIcon } from '@shared/ui/icons/PackageIcon';
import { ZapIcon } from '@shared/ui/icons/ZapIcon';
import { CheckCircleIcon } from '@shared/ui/icons/CheckCircleIcon';
import { XCircleIcon } from '@shared/ui/icons/XCircleIcon';
import { StatTile } from './StatTile';

type StatTilesRowProps = {
  /** Real akfa-shaped KPIs: `coverage.totalProducts` + `daily-digest`'s `totalEvents`/`syncSuccess`/`errorCount`. */
  kpis: {
    totalProducts: number;
    totalEvents: number;
    syncSuccess: number;
    errorCount: number;
  };
  /**
   * `totalProducts` connected to at least one external system — not a field
   * akfa's coverage endpoint returns directly, but legitimately derivable as
   * `totalProducts - orphans.totalOrphans` (unlike "fully synced"/"partial",
   * which no per-product×system data anywhere can compute). Passed in
   * already-derived so this component stays a pure presentational tile row.
   */
  connectedCount: number;
};

export function StatTilesRow({ kpis, connectedCount }: StatTilesRowProps) {
  const { t } = useTranslation();
  const successPercent =
    kpis.totalEvents > 0
      ? Math.round((kpis.syncSuccess / kpis.totalEvents) * 100)
      : 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatTile
        label={t('analytics.stats.total')}
        value={kpis.totalProducts}
        subtext={t('analytics.stats.totalSubtext', { count: connectedCount })}
        icon={<PackageIcon size={16} />}
        iconClassName="bg-fg/10 text-fg"
        to={buildNomenclatureLink()}
      />
      <StatTile
        label={t('analytics.stats.todayEvents')}
        value={kpis.totalEvents}
        subtext={t('analytics.stats.todayEventsSubtext')}
        icon={<ZapIcon size={16} />}
        iconClassName="bg-fg/10 text-fg"
      />
      <StatTile
        label={t('analytics.stats.syncSuccess')}
        value={kpis.syncSuccess}
        subtext={t('analytics.stats.syncSuccessSubtext', {
          percent: successPercent,
        })}
        icon={<CheckCircleIcon size={16} />}
        iconClassName="bg-success/10 text-success"
      />
      <StatTile
        label={t('analytics.stats.todayErrors')}
        value={kpis.errorCount}
        subtext={t('analytics.stats.todayErrorsSubtext')}
        icon={<XCircleIcon size={16} />}
        iconClassName="bg-danger/10 text-danger"
      />
    </div>
  );
}
