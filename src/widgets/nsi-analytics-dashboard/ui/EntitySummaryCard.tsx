import { useTranslation } from 'react-i18next';
import { Card } from '@shared/ui/Card';
import { Badge } from '@shared/ui/Badge';

type EntitySummaryCardProps = {
  label: string;
  /** `active` = real analytics wired for this entity type; `pending` = backend doesn't expose it yet. */
  status: 'active' | 'pending';
  total?: number;
  connected?: number;
  openIssues?: number;
};

export function EntitySummaryCard({
  label,
  status,
  total,
  connected,
  openIssues,
}: EntitySummaryCardProps) {
  const { t } = useTranslation();

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-fg text-sm font-semibold">{label}</h3>
        <Badge variant={status === 'active' ? 'success' : 'warning'}>
          {t(`nsiAnalytics.overview.status.${status}`)}
        </Badge>
      </div>

      <div className="text-fg text-2xl font-semibold tabular-nums">
        {total !== undefined ? total.toLocaleString('en-US') : '—'}
      </div>

      <div className="text-fg-muted flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
        <span>
          {t('nsiAnalytics.overview.connected')}:{' '}
          <span className="text-fg font-medium">{connected ?? '—'}</span>
        </span>
        <span>
          {t('nsiAnalytics.overview.openIssues')}:{' '}
          <span
            className={
              openIssues ? 'text-danger font-medium' : 'text-fg font-medium'
            }
          >
            {openIssues ?? '—'}
          </span>
        </span>
      </div>
    </Card>
  );
}
