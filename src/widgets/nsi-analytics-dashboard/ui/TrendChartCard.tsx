import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { AnalyticsPeriod } from '@entities/analytics/model/types';
import type { TrendDataPoint } from '@entities/analytics/model/dashboardKpisTypes';
import { Card, CardHeader } from '@shared/ui/Card';
import { TrendingUpIcon } from '@shared/ui/icons/TrendingUpIcon';
import { ChartTooltip } from '@shared/ui/ChartTooltip';

type TrendChartCardProps = {
  data: TrendDataPoint[];
  period: AnalyticsPeriod;
};

export function TrendChartCard({ data, period }: TrendChartCardProps) {
  const { t, i18n } = useTranslation();

  const tickFormatter = useMemo(() => {
    const optionsByPeriod: Record<AnalyticsPeriod, Intl.DateTimeFormatOptions> =
      {
        '7d': { weekday: 'short' },
        '30d': { day: '2-digit', month: '2-digit' },
        '90d': { month: 'short' },
      };
    const formatter = new Intl.DateTimeFormat(
      i18n.language,
      optionsByPeriod[period],
    );
    return (value: string) => formatter.format(new Date(value));
  }, [period, i18n.language]);

  const labelFormatter = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(i18n.language, {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
    return (value: string) => formatter.format(new Date(value));
  }, [i18n.language]);

  // `eventCount` and `errorCount` are independent counters, not a
  // whole/part pair — a single event can carry more than one error, so
  // there's no "successCount = eventCount - errorCount" to derive. Both are
  // shown as their own raw series.
  const { totalEvents, totalErrors, errorRate } = useMemo(() => {
    const events = data.reduce((sum, point) => sum + point.eventCount, 0);
    const errors = data.reduce((sum, point) => sum + point.errorCount, 0);
    return {
      totalEvents: events,
      totalErrors: errors,
      errorRate: events > 0 ? (errors / events) * 100 : 0,
    };
  }, [data]);

  return (
    <Card>
      <CardHeader
        title={t('analytics.trend.title')}
        subtitle={t('analytics.trend.subtitle', { rate: errorRate.toFixed(1) })}
        icon={<TrendingUpIcon size={16} />}
        action={
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="bg-primary size-2 rounded-full" />
              <span className="text-fg-muted">
                {t('analytics.trend.events')}
              </span>
              <span className="text-fg font-semibold tabular-nums">
                {totalEvents}
              </span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="bg-danger size-2 rounded-full" />
              <span className="text-fg-muted">
                {t('analytics.trend.errors')}
              </span>
              <span className="text-fg font-semibold tabular-nums">
                {totalErrors}
              </span>
            </span>
          </div>
        }
      />

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient
                id="analyticsTrendEvents"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="var(--color-primary)"
                  stopOpacity={0.25}
                />
                <stop
                  offset="100%"
                  stopColor="var(--color-primary)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--color-border)" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={tickFormatter}
              tick={{ fontSize: 11, fill: 'var(--color-fg-muted)' }}
              axisLine={{ stroke: 'var(--color-border)' }}
              tickLine={false}
              minTickGap={24}
            />
            <YAxis
              yAxisId="events"
              tick={{ fontSize: 11, fill: 'var(--color-fg-muted)' }}
              axisLine={false}
              tickLine={false}
              width={32}
            />
            <YAxis
              yAxisId="error"
              orientation="right"
              domain={[0, (max: number) => Math.max(4, Math.ceil(max * 4))]}
              tick={{ fontSize: 11, fill: 'var(--color-fg-muted)' }}
              axisLine={false}
              tickLine={false}
              width={28}
            />
            <Tooltip
              content={(props) => (
                <ChartTooltip {...props} formatLabel={labelFormatter} />
              )}
              cursor={{
                stroke: 'var(--color-border-strong)',
                strokeDasharray: '3 3',
              }}
            />
            <Area
              yAxisId="events"
              type="monotone"
              dataKey="eventCount"
              name={t('analytics.trend.events')}
              stroke="var(--color-primary)"
              strokeWidth={2}
              fill="url(#analyticsTrendEvents)"
            />
            <Line
              yAxisId="error"
              type="monotone"
              dataKey="errorCount"
              name={t('analytics.trend.errors')}
              stroke="var(--color-danger)"
              strokeWidth={1.75}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
