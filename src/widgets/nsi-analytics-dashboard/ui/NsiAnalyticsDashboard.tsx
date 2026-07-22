import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { AnalyticsPeriod } from '@entities/analytics/model/types';
import {
  useGetCoverageQuery,
  useGetDailyDigestQuery,
  useGetErrorBreakdownQuery,
  useGetTrendsQuery,
} from '@entities/analytics/api/dashboardKpisApi';
import { useGetCompletenessQuery } from '@entities/nsi-analytics/api/completenessApi';
import { useGetOrphansListQuery } from '@entities/nsi-analytics/api/orphansApi';
import { useGetDuplicatesListQuery } from '@entities/nsi-analytics/api/duplicatesApi';
import { useGetSyncSummaryQuery } from '@entities/monitoring/api/monitoringApi';
import { Button } from '@shared/ui/Button';
import { LoadingBar } from '@shared/ui/LoadingBar';
import { RefreshIcon } from '@shared/ui/icons/RefreshIcon';
import { formatDateOnly } from '@shared/lib/formatDate';
import { StatTilesRow } from './StatTilesRow';
import { AttentionPanel } from './AttentionPanel';
import { SystemsCoverageCard } from './SystemsCoverageCard';
import { SyncHealthCard } from './SyncHealthCard';
import { TrendChartCard } from './TrendChartCard';
import { PeriodToggle } from './PeriodToggle';
import { CompletenessCard } from './CompletenessCard';
import { DuplicatesCard } from './DuplicatesCard';
import { OrphansCard } from './OrphansCard';

const PERIOD_DAYS: Record<AnalyticsPeriod, number> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
};

export function NsiAnalyticsDashboard() {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<AnalyticsPeriod>('30d');

  const coverageQuery = useGetCoverageQuery();
  const digestQuery = useGetDailyDigestQuery();
  const errorBreakdownQuery = useGetErrorBreakdownQuery({
    days: PERIOD_DAYS[period],
  });
  const trendsQuery = useGetTrendsQuery({ days: PERIOD_DAYS[period] });
  const completenessQuery = useGetCompletenessQuery();
  // Only the totals are needed for these hub cards, so a minimal page is enough.
  const orphansHubQuery = useGetOrphansListQuery({ page: 0, size: 1 });
  const duplicatesHubQuery = useGetDuplicatesListQuery({ page: 0, size: 1 });
  const syncSummaryQuery = useGetSyncSummaryQuery();

  const coverage = coverageQuery.data?.data;
  const digest = digestQuery.data?.data;
  const errorBreakdown = errorBreakdownQuery.data?.data;
  const trends = trendsQuery.data?.data;
  const completeness = completenessQuery.data?.data;
  const orphans = orphansHubQuery.data?.data;
  const duplicates = duplicatesHubQuery.data?.data;
  const syncSummary = syncSummaryQuery.data?.data;
  const connectedCount =
    (coverage?.totalProducts ?? 0) - (orphans?.totalOrphans ?? 0);

  const isLoading =
    coverageQuery.isLoading ||
    digestQuery.isLoading ||
    errorBreakdownQuery.isLoading ||
    trendsQuery.isLoading ||
    completenessQuery.isLoading ||
    orphansHubQuery.isLoading ||
    duplicatesHubQuery.isLoading ||
    syncSummaryQuery.isLoading;
  const isFetching =
    coverageQuery.isFetching ||
    digestQuery.isFetching ||
    errorBreakdownQuery.isFetching ||
    trendsQuery.isFetching ||
    completenessQuery.isFetching ||
    orphansHubQuery.isFetching ||
    duplicatesHubQuery.isFetching ||
    syncSummaryQuery.isFetching;

  const refetchAll = () => {
    coverageQuery.refetch();
    digestQuery.refetch();
    errorBreakdownQuery.refetch();
    trendsQuery.refetch();
    completenessQuery.refetch();
    orphansHubQuery.refetch();
    duplicatesHubQuery.refetch();
    syncSummaryQuery.refetch();
  };

  return (
    <div className="relative flex h-full flex-col overflow-y-auto">
      {isFetching && <LoadingBar />}

      <div className="flex flex-col gap-5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-fg text-xl font-semibold">
              {t('nsiAnalytics.title')}
            </h1>
            <p className="text-fg-muted mt-0.5 text-sm">
              {t('nsiAnalytics.subtitle')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {digest && (
              <span className="text-fg-muted text-xs">
                {t('analytics.updatedAt', {
                  time: formatDateOnly(digest.date),
                })}
              </span>
            )}
            <PeriodToggle value={period} onChange={setPeriod} />
            <Button
              variant="outline"
              size="sm"
              icon={<RefreshIcon size={14} />}
              onClick={refetchAll}
              isLoading={isFetching}
            >
              {t('common.reload')}
            </Button>
          </div>
        </div>

        {isLoading ||
        !coverage ||
        !digest ||
        !errorBreakdown ||
        !trends ||
        !completeness ||
        !orphans ||
        !duplicates ||
        !syncSummary ? (
          <div className="text-fg-muted flex flex-1 items-center justify-center py-24 text-sm">
            {t('common.loading')}
          </div>
        ) : (
          <>
            <StatTilesRow
              kpis={{
                totalProducts: coverage.totalProducts,
                totalEvents: digest.totalEvents,
                syncSuccess: digest.syncSuccess,
                errorCount: digest.errorCount,
                topActivities: digest.topActivities,
              }}
              connectedCount={connectedCount}
            />

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_3fr]">
              <AttentionPanel errorBreakdown={errorBreakdown} />
              <SystemsCoverageCard
                totalProducts={coverage.totalProducts}
                systems={coverage.systems}
              />
            </div>

            <SyncHealthCard summary={syncSummary} />

            <TrendChartCard data={trends.dataPoints} period={period} />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <CompletenessCard completeness={completeness} />
              <OrphansCard orphans={orphans} connectedCount={connectedCount} />
              <DuplicatesCard duplicates={duplicates} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
