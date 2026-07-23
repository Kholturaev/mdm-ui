import { useTranslation } from 'react-i18next';
import { useGetCoverageQuery } from '@entities/analytics/api/dashboardKpisApi';
import { useGetOrphansListQuery } from '@entities/nsi-analytics/api/orphansApi';
import { useGetDuplicatesListQuery } from '@entities/nsi-analytics/api/duplicatesApi';
import { useGetSyncSummaryQuery } from '@entities/monitoring/api/monitoringApi';
import { LoadingBar } from '@shared/ui/LoadingBar';
import { EntitySummaryCard } from './EntitySummaryCard';
import { CoverageMatrix } from './CoverageMatrix';

const PENDING_ENTITY_KEYS = [
  'dealers',
  'characteristics',
  'prices',
  'productGroups',
] as const;

export function OverviewTab() {
  const { t } = useTranslation();

  const coverageQuery = useGetCoverageQuery();
  const orphansQuery = useGetOrphansListQuery({ page: 0, size: 1 });
  const duplicatesQuery = useGetDuplicatesListQuery({ page: 0, size: 1 });
  const syncSummaryQuery = useGetSyncSummaryQuery();

  const coverage = coverageQuery.data?.data;
  const orphans = orphansQuery.data?.data;
  const duplicates = duplicatesQuery.data?.data;
  const syncSummary = syncSummaryQuery.data?.data;

  const isLoading =
    coverageQuery.isLoading ||
    orphansQuery.isLoading ||
    duplicatesQuery.isLoading ||
    syncSummaryQuery.isLoading;
  const isFetching =
    coverageQuery.isFetching ||
    orphansQuery.isFetching ||
    duplicatesQuery.isFetching ||
    syncSummaryQuery.isFetching;

  if (isLoading || !coverage || !orphans || !duplicates || !syncSummary) {
    return (
      <div className="relative flex h-full flex-col overflow-y-auto p-6">
        {isFetching && <LoadingBar />}
        <div className="text-fg-muted flex flex-1 items-center justify-center py-24 text-sm">
          {t('common.loading')}
        </div>
      </div>
    );
  }

  const connectedCount = coverage.totalProducts - orphans.totalOrphans;
  const syncProblems = syncSummary.systems.reduce(
    (sum, system) => sum + system.failedCount + system.deadCount,
    0,
  );
  const openIssues = duplicates.totalGroups + syncProblems;

  return (
    <div className="relative flex h-full flex-col overflow-y-auto">
      {isFetching && <LoadingBar />}

      <div className="flex flex-col gap-5 p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <EntitySummaryCard
            label={t('nsiAnalytics.overview.entity.nomenclature')}
            status="active"
            total={coverage.totalProducts}
            connected={connectedCount}
            openIssues={openIssues}
          />
          {PENDING_ENTITY_KEYS.map((key) => (
            <EntitySummaryCard
              key={key}
              label={t(`nsiAnalytics.overview.entity.${key}`)}
              status="pending"
            />
          ))}
        </div>

        <CoverageMatrix coverage={coverage} />

        <p className="text-fg-muted text-sm">
          {t('nsiAnalytics.overview.footer')}
        </p>
      </div>
    </div>
  );
}
