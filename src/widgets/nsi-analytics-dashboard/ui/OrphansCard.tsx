import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type { OrphansResponse } from '@entities/nsi-analytics/model/types';
import { Card } from '@shared/ui/Card';
import { Badge } from '@shared/ui/Badge';
import { ArrowRightIcon } from '@shared/ui/icons/ArrowRightIcon';

type OrphansCardProps = {
  orphans: Pick<OrphansResponse, 'totalOrphans' | 'orphanPercent'>;
  /** Products connected to at least one external system — the bar's complementary segment. */
  connectedCount: number;
};

export function OrphansCard({ orphans, connectedCount }: OrphansCardProps) {
  const { t } = useTranslation();
  const total = orphans.totalOrphans + connectedCount;
  const unconnectedPercent =
    total > 0 ? (orphans.totalOrphans / total) * 100 : 0;
  const connectedPercent = 100 - unconnectedPercent;

  return (
    <Card className="flex flex-col gap-3">
      <div>
        <div className="flex items-center gap-2">
          <Badge variant="danger">
            {t('nsiAnalytics.orphans.attentionBadge')}
          </Badge>
          <h3 className="text-fg text-sm font-semibold">
            {t('nsiAnalytics.orphans.title')}
          </h3>
        </div>
        <p className="text-fg-muted mt-1 text-xs">
          {t('nsiAnalytics.orphans.subtitle')}
        </p>
      </div>

      <div className="border-border flex h-8 overflow-hidden rounded-md border">
        <div
          className="bg-danger/20 text-danger flex items-center overflow-hidden px-2 text-xs font-medium whitespace-nowrap"
          style={{ width: `${unconnectedPercent}%` }}
        >
          {t('nsiAnalytics.orphans.barLabel', {
            percent: unconnectedPercent.toFixed(1),
          })}
        </div>
        <div className="bg-success" style={{ width: `${connectedPercent}%` }} />
      </div>

      <div className="flex items-center gap-5">
        <div className="flex items-center gap-1.5">
          <span className="bg-danger size-2 shrink-0 rounded-full" />
          <div>
            <div className="text-fg text-sm font-semibold tabular-nums">
              {orphans.totalOrphans}
            </div>
            <div className="text-fg-muted text-xs">
              {t('nsiAnalytics.orphans.unconnectedLabel')}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="bg-success size-2 shrink-0 rounded-full" />
          <div>
            <div className="text-fg text-sm font-semibold tabular-nums">
              {connectedCount}
            </div>
            <div className="text-fg-muted text-xs">
              {t('nsiAnalytics.orphans.connectedLabel')}
            </div>
          </div>
        </div>
      </div>

      <Link
        to="/nsi-analytics/orphans"
        className="text-danger mt-auto flex items-center gap-1 self-start text-xs font-semibold"
      >
        {t('nsiAnalytics.orphans.linkAction')}
        <span className="-rotate-45">
          <ArrowRightIcon size={12} />
        </span>
      </Link>
    </Card>
  );
}
