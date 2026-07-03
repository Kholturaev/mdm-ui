import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { AnalyticsPeriod } from '@entities/analytics/model/types';
import { useAnalyticsOverview } from '@entities/analytics/api/useAnalyticsOverview';
import { Button } from '@shared/ui/Button';
import { LoadingBar } from '@shared/ui/LoadingBar';
import { RefreshIcon } from '@shared/ui/icons/RefreshIcon';
import { formatDateTime } from '@shared/lib/formatDate';
import { StatTilesRow } from './StatTilesRow';
import { AttentionPanel } from './AttentionPanel';
import { SystemsCoverageCard } from './SystemsCoverageCard';
import { TrendChartCard } from './TrendChartCard';
import { CompletenessCard } from './CompletenessCard';
import { PerformanceCard } from './PerformanceCard';
import { DataQualityCard } from './DataQualityCard';
import { RecentActivityCard } from './RecentActivityCard';
import { PeriodToggle } from './PeriodToggle';

export function AnalyticsDashboard() {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<AnalyticsPeriod>('30d');
  const { data, isLoading, isFetching, refetch } = useAnalyticsOverview(period);

  return (
    <div className="relative flex h-full flex-col overflow-y-auto">
      {isFetching && <LoadingBar />}

      <div className="flex flex-col gap-5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-fg text-xl font-semibold">
              {t('analytics.title')}
            </h1>
            <p className="text-fg-muted mt-0.5 text-sm">
              {t('analytics.subtitle')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {data && (
              <span className="text-fg-muted text-xs">
                {t('analytics.updatedAt', {
                  time: formatDateTime(data.generatedAt),
                })}
              </span>
            )}
            <PeriodToggle value={period} onChange={setPeriod} />
            <Button
              variant="outline"
              size="sm"
              icon={<RefreshIcon size={14} />}
              onClick={refetch}
              isLoading={isFetching}
            >
              {t('common.reload')}
            </Button>
          </div>
        </div>

        {isLoading || !data ? (
          <div className="text-fg-muted flex flex-1 items-center justify-center py-24 text-sm">
            {t('common.loading')}
          </div>
        ) : (
          <>
            <StatTilesRow totals={data.totals} />

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_3fr]">
              <AttentionPanel items={data.attention} />
              <SystemsCoverageCard systems={data.systemsCoverage} />
            </div>

            <TrendChartCard data={data.trend} period={period} />

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <CompletenessCard completeness={data.completeness} />
              <PerformanceCard performance={data.performance} />
              <DataQualityCard dataQuality={data.dataQuality} />
            </div>

            <RecentActivityCard items={data.recentActivity} />
          </>
        )}
      </div>
    </div>
  );
}
