import { useTranslation } from 'react-i18next';
import type { ErrorBreakdownResponse } from '@entities/analytics/model/dashboardKpisTypes';
import { Card, CardHeader } from '@shared/ui/Card';
import { AlertTriangleIcon } from '@shared/ui/icons/AlertTriangleIcon';
import { XCircleIcon } from '@shared/ui/icons/XCircleIcon';
import { ClockIcon } from '@shared/ui/icons/ClockIcon';
import { RefreshIcon } from '@shared/ui/icons/RefreshIcon';
import { CheckCircleIcon } from '@shared/ui/icons/CheckCircleIcon';

type AttentionPanelProps = {
  errorBreakdown: ErrorBreakdownResponse;
};

const PERIOD_DAYS_MATCH = /^last_(\d+)_days$/;

export function AttentionPanel({
  errorBreakdown: breakdown,
}: AttentionPanelProps) {
  const { t } = useTranslation();

  const days = PERIOD_DAYS_MATCH.exec(breakdown.period)?.[1];
  const pending = breakdown.dlqByStatus.PENDING ?? 0;
  const replayed = breakdown.dlqByStatus.REPLAYED ?? 0;
  const resolved = breakdown.dlqByStatus.RESOLVED ?? 0;

  const rows = [
    {
      key: 'syncFailed',
      count: breakdown.syncFailedCount,
      icon: <XCircleIcon size={15} />,
      className: 'bg-danger/10 text-danger',
    },
    {
      key: 'validationErrors',
      count: breakdown.validationErrorCount,
      icon: <AlertTriangleIcon size={15} />,
      className: 'bg-warning/10 text-warning',
    },
    {
      key: 'dlqPending',
      count: pending,
      icon: <ClockIcon size={15} />,
      className: 'bg-warning/10 text-warning',
    },
    {
      key: 'dlqReplayed',
      count: replayed,
      icon: <RefreshIcon size={15} />,
      className: 'bg-fg/10 text-fg',
    },
    {
      key: 'dlqResolved',
      count: resolved,
      icon: <CheckCircleIcon size={15} />,
      className: 'bg-success/10 text-success',
    },
  ].filter((row) => row.count > 0);

  return (
    <Card className="flex h-full flex-col">
      <CardHeader
        title={t('analytics.attention.title')}
        subtitle={
          days ? t('analytics.attention.subtitlePeriod', { days }) : undefined
        }
        icon={<AlertTriangleIcon size={16} />}
      />

      {rows.length === 0 ? (
        <div className="text-fg-muted flex flex-1 flex-col items-center justify-center gap-2 py-8 text-center text-sm">
          <CheckCircleIcon size={22} />
          {t('analytics.attention.allClear')}
        </div>
      ) : (
        <>
          <div className="divide-border flex flex-col divide-y">
            {rows.map((row) => (
              <div
                key={row.key}
                className="flex items-center gap-3 py-2.5 first:pt-0"
              >
                <span
                  className={`flex size-8 shrink-0 items-center justify-center rounded-md ${row.className}`}
                >
                  {row.icon}
                </span>
                <div className="min-w-0">
                  <p className="text-fg text-sm font-medium tabular-nums">
                    {t(`analytics.attention.${row.key}.title`, {
                      count: row.count,
                    })}
                  </p>
                  <p className="text-fg-muted text-xs">
                    {t(`analytics.attention.${row.key}.desc`)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {breakdown.topDlqErrorTypes.length > 0 && (
            <div className="border-border mt-3 border-t pt-3">
              <p className="text-fg-muted mb-2 text-xs font-medium tracking-wide uppercase">
                {t('analytics.attention.topErrorTypes')}
              </p>
              <ul className="flex flex-col gap-1">
                {breakdown.topDlqErrorTypes.map((entry) => (
                  <li
                    key={entry.errorType}
                    className="text-fg-muted flex items-baseline gap-1.5 text-xs"
                  >
                    <span>•</span>
                    <span>
                      {t(`analytics.attention.errorType.${entry.errorType}`, {
                        defaultValue: entry.errorType,
                      })}{' '}
                      ({entry.count})
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </Card>
  );
}
