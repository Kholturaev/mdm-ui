import { useTranslation } from 'react-i18next';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import type { CompletenessSummary } from '@entities/analytics/model/types';
import { Card, CardHeader } from '@shared/ui/Card';
import { GaugeIcon } from '@shared/ui/icons/GaugeIcon';

type CompletenessCardProps = {
  completeness: CompletenessSummary;
};

export function CompletenessCard({ completeness }: CompletenessCardProps) {
  const { t } = useTranslation();

  const segments = [
    {
      key: 'fullComplete',
      value: completeness.fullComplete,
      color: 'var(--color-success)',
    },
    {
      key: 'partial',
      value: completeness.partial,
      color: 'var(--color-warning)',
    },
    {
      key: 'incomplete',
      value: completeness.incomplete,
      color: 'var(--color-danger)',
    },
  ];

  return (
    <Card className="flex flex-col">
      <CardHeader
        title={t('analytics.completeness.title')}
        icon={<GaugeIcon size={16} />}
      />

      <div className="flex flex-1 items-center gap-4">
        <div className="relative size-28 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={segments}
                dataKey="value"
                nameKey="key"
                innerRadius={38}
                outerRadius={54}
                startAngle={90}
                endAngle={-270}
                stroke="none"
              >
                {segments.map((segment) => (
                  <Cell key={segment.key} fill={segment.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-fg text-lg font-semibold tabular-nums">
              {completeness.overallScore}%
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-2">
          {segments.map((segment) => (
            <div
              key={segment.key}
              className="flex items-center justify-between text-xs"
            >
              <span className="text-fg-muted flex items-center gap-1.5">
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: segment.color }}
                />
                {t(`analytics.completeness.${segment.key}`)}
              </span>
              <span className="text-fg font-medium tabular-nums">
                {segment.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
