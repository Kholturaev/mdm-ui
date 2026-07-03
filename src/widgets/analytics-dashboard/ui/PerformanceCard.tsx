import { useTranslation } from 'react-i18next';
import type { PerformanceSummary } from '@entities/analytics/model/types';
import { Card, CardHeader } from '@shared/ui/Card';
import { ZapIcon } from '@shared/ui/icons/ZapIcon';
import { ClockIcon } from '@shared/ui/icons/ClockIcon';
import { formatHours } from '../lib/format';
import { Sparkline } from './Sparkline';

type PerformanceCardProps = {
  performance: PerformanceSummary;
};

export function PerformanceCard({ performance }: PerformanceCardProps) {
  const { t } = useTranslation();

  return (
    <Card className="flex flex-col">
      <CardHeader
        title={t('analytics.performance.title')}
        icon={<ZapIcon size={16} />}
      />

      <div className="divide-border flex flex-1 flex-col divide-y">
        <div className="flex items-center justify-between gap-3 py-2.5 first:pt-0">
          <div className="min-w-0">
            <p className="text-fg-muted flex items-center gap-1.5 text-xs">
              <ZapIcon size={12} />
              {t('analytics.performance.timeToMarket')}
            </p>
            <p className="text-fg mt-1 text-lg font-semibold tabular-nums">
              {formatHours(performance.timeToMarket.avgHours, t)}
            </p>
          </div>
          <Sparkline
            data={performance.timeToMarket.trend}
            color="var(--color-primary)"
          />
        </div>

        <div className="flex items-center justify-between gap-3 py-2.5 last:pb-0">
          <div className="min-w-0">
            <p className="text-fg-muted flex items-center gap-1.5 text-xs">
              <ClockIcon size={12} />
              {t('analytics.performance.mttr')}
            </p>
            <p className="text-fg mt-1 text-lg font-semibold tabular-nums">
              {formatHours(performance.mttr.avgHours, t)}
            </p>
          </div>
          <Sparkline
            data={performance.mttr.trend}
            color="var(--color-warning)"
          />
        </div>
      </div>
    </Card>
  );
}
