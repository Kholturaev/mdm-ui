import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useCompletenessTrend } from '@entities/nsi-analytics/api/useCompleteness';
import { Card, CardHeader } from '@shared/ui/Card';
import { SegmentedControl } from '@shared/ui/SegmentedControl';
import { ChartTooltip } from '@shared/ui/ChartTooltip';
import { TrendingUpIcon } from '@shared/ui/icons/TrendingUpIcon';

type TrendDays = '30' | '90';

export function CompletenessTrendSection() {
  const { t, i18n } = useTranslation();
  const [days, setDays] = useState<TrendDays>('30');
  const { data, isLoading } = useCompletenessTrend(Number(days));

  const tickFormatter = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(i18n.language, {
      day: '2-digit',
      month: '2-digit',
    });
    return (value: string) => formatter.format(new Date(value));
  }, [i18n.language]);

  const labelFormatter = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(i18n.language, {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
    return (value: string) => formatter.format(new Date(value));
  }, [i18n.language]);

  return (
    <Card>
      <CardHeader
        title={t('nsiAnalytics.completenessDetail.trend.title')}
        icon={<TrendingUpIcon size={16} />}
        action={
          <SegmentedControl
            size="xs"
            value={days}
            onChange={setDays}
            options={[
              {
                value: '30',
                label: t('nsiAnalytics.completenessDetail.trend.days30'),
              },
              {
                value: '90',
                label: t('nsiAnalytics.completenessDetail.trend.days90'),
              },
            ]}
          />
        }
      />

      {isLoading || !data ? (
        <div className="text-fg-muted py-8 text-center text-sm">
          {t('common.loading')}
        </div>
      ) : (
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={data.points}
              margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id="completenessTrendScore"
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
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: 'var(--color-fg-muted)' }}
                axisLine={false}
                tickLine={false}
                width={32}
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
                type="monotone"
                dataKey="avgScore"
                name={t('nsiAnalytics.completenessDetail.trend.avgScore')}
                stroke="var(--color-primary)"
                strokeWidth={2}
                fill="url(#completenessTrendScore)"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
