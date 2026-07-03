import { useTranslation } from 'react-i18next';
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from 'recharts';
import {
  useActionTypeBreakdown,
  useActivityTrend,
} from '@entities/audit/api/auditApi';
import { AUDIT_ACTION_DOT_CLASS } from '@entities/audit/lib/actionMeta';
import { Card, CardHeader } from '@shared/ui/Card';
import { cn } from '@shared/lib/cn';
import { BarChartIcon } from '@shared/ui/icons/BarChartIcon';

type ActivityTrendCardProps = {
  days: number;
};

export function ActivityTrendCard({ days }: ActivityTrendCardProps) {
  const { t, i18n } = useTranslation();
  const trend = useActivityTrend(days);
  const breakdown = useActionTypeBreakdown(days);

  const maxCount = Math.max(1, ...breakdown.map((item) => item.count));
  const weekdayFormatter = new Intl.DateTimeFormat(i18n.language, {
    weekday: 'short',
  });

  const chartData = trend.map((point, index) => ({
    ...point,
    label:
      index === trend.length - 1
        ? t('audit.trend.today')
        : weekdayFormatter.format(new Date(point.date)),
  }));

  return (
    <Card>
      <CardHeader
        title={t('audit.trend.title')}
        subtitle={t('audit.trend.subtitle', { count: days })}
        icon={<BarChartIcon size={16} />}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
            >
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: 'var(--color-fg-muted)' }}
                axisLine={{ stroke: 'var(--color-border)' }}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: 'var(--color-surface-hover)' }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const point = payload[0]
                    .payload as (typeof chartData)[number];
                  return (
                    <div className="border-border bg-surface rounded-md border px-2.5 py-1.5 text-xs shadow-lg">
                      <div className="text-fg font-semibold">{point.label}</div>
                      <div className="text-fg-muted">
                        {t('audit.trend.tooltipCount', { count: point.count })}
                      </div>
                    </div>
                  );
                }}
              />
              <Bar dataKey="count" radius={[3, 3, 0, 0]} maxBarSize={36}>
                {chartData.map((point) => (
                  <Cell
                    key={point.date}
                    fill={
                      point.hasFailure
                        ? 'var(--color-danger)'
                        : 'var(--color-primary)'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div>
          <p className="text-fg-muted mb-2 text-xs font-semibold tracking-wide uppercase">
            {t('audit.trend.breakdownTitle', { count: days })}
          </p>
          <div className="flex flex-col gap-2">
            {breakdown.map((item) => (
              <div key={item.actionType} className="flex items-center gap-2">
                <span
                  className={cn(
                    'size-2 shrink-0 rounded-full',
                    AUDIT_ACTION_DOT_CLASS[item.actionType],
                  )}
                />
                <span className="text-fg-muted min-w-0 flex-1 truncate text-xs">
                  {t(`audit.action.${item.actionType}`)}
                </span>
                <span className="text-fg w-6 shrink-0 text-right text-xs font-semibold tabular-nums">
                  {item.count}
                </span>
                <span className="bg-disabled-bg h-1.5 w-10 shrink-0 overflow-hidden rounded-full">
                  <span
                    className={cn(
                      'block h-full rounded-full',
                      AUDIT_ACTION_DOT_CLASS[item.actionType],
                    )}
                    style={{ width: `${(item.count / maxCount) * 100}%` }}
                  />
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
