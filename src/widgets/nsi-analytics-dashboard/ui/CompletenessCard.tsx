import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type { TooltipContentProps } from 'recharts';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type {
  NameType,
  ValueType,
} from 'recharts/types/component/DefaultTooltipContent';
import type { CompletenessSummary } from '@entities/nsi-analytics/model/types';
import { Card, CardHeader } from '@shared/ui/Card';
import { GaugeIcon } from '@shared/ui/icons/GaugeIcon';
import { ArrowRightIcon } from '@shared/ui/icons/ArrowRightIcon';

type CompletenessCardProps = {
  completeness: Pick<
    CompletenessSummary,
    'totalProducts' | 'fullComplete' | 'partial' | 'incomplete'
  >;
};

type Segment = { key: string; value: number; color: string };

export function CompletenessCard({ completeness }: CompletenessCardProps) {
  const { t } = useTranslation();
  const { totalProducts } = completeness;

  const segments: Segment[] = [
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

  const fullCompletePercent =
    totalProducts > 0 ? (completeness.fullComplete / totalProducts) * 100 : 0;

  const renderTooltip = ({
    active,
    payload,
  }: TooltipContentProps<ValueType, NameType>) => {
    if (!active || !payload?.length) return null;
    const entry = payload[0];
    const segment = entry.payload as Segment;
    const percent =
      totalProducts > 0 ? (segment.value / totalProducts) * 100 : 0;
    return (
      <div className="border-border bg-surface rounded-md border px-3 py-2 text-xs shadow-lg">
        <div className="text-fg-muted mb-1 flex items-center gap-1.5">
          <span
            className="size-2 shrink-0 rounded-full"
            style={{ backgroundColor: segment.color }}
          />
          {t(`analytics.completeness.${segment.key}`)}
        </div>
        <div className="text-fg font-medium tabular-nums">
          {segment.value} ({percent.toFixed(1)}%)
        </div>
      </div>
    );
  };

  return (
    <Card className="flex flex-col">
      <CardHeader
        title={t('analytics.completeness.title')}
        subtitle={t('analytics.completeness.subtitle')}
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
              <Tooltip content={renderTooltip} wrapperStyle={{ zIndex: 20 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 z-0 flex flex-col items-center justify-center">
            <span className="text-fg text-lg font-semibold tabular-nums">
              {fullCompletePercent.toFixed(1)}%
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

      <Link
        to="/nsi-analytics/completeness"
        className="text-primary mt-3 flex items-center gap-1 self-start text-xs font-semibold"
      >
        {t('nsiAnalytics.viewDetails')}
        <ArrowRightIcon size={12} />
      </Link>
    </Card>
  );
}
