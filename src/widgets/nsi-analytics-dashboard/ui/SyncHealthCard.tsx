import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type {
  SyncLogStatus,
  SyncSummaryResponse,
  SystemSyncStatus,
} from '@entities/monitoring/model/types';
import { Card } from '@shared/ui/Card';
import { Progress } from '@shared/ui/Progress';
import { ArrowRightIcon } from '@shared/ui/icons/ArrowRightIcon';

type SyncHealthCardProps = {
  summary: SyncSummaryResponse;
};

type Tier = 'success' | 'warning' | 'danger';

/** >=70% is healthy, >=40% still recovering, below that needs attention — same scale used for the header's system-health pill. */
function tierFromRate(rate: number): Tier {
  if (rate >= 70) return 'success';
  if (rate >= 40) return 'warning';
  return 'danger';
}

const TIER_TEXT_CLASS: Record<Tier, string> = {
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
};

const TIER_DOT_CLASS: Record<Tier, string> = {
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
};

type Buckets = {
  confirmed: number;
  inProgress: number;
  failed: number;
  dead: number;
  total: number;
};

function bucketsFor(system: SystemSyncStatus): Buckets {
  const confirmed = system.acknowledgedCount;
  const inProgress = system.notifiedCount + system.fetchedCount;
  const failed = system.failedCount;
  const dead = system.deadCount;
  return {
    confirmed,
    inProgress,
    failed,
    dead,
    total: confirmed + inProgress + failed + dead,
  };
}

/**
 * Picks the single most useful number to headline for a system — the success
 * rate itself when it's already healthy, otherwise whichever non-success
 * bucket actually explains the gap (real failures/dead items take priority
 * over items that are simply still in flight) — and, since that's already a
 * judgment call about what's most relevant, reuses it as the default
 * `syncStatus` filter for the drill-down link too, so clicking a row lands
 * on exactly the rows its own headline is talking about.
 */
function pickHighlight(
  system: SystemSyncStatus,
  buckets: Buckets,
  t: (key: string, opts?: Record<string, unknown>) => string,
): { text: string; className: string; status: SyncLogStatus } {
  if (system.successRate >= 70) {
    return {
      text: t('nsiAnalytics.syncHealth.caption.rate', {
        percent: system.successRate.toFixed(1),
      }),
      className: 'text-success',
      status: 'ACKNOWLEDGED',
    };
  }
  const problems = buckets.failed + buckets.dead;
  if (problems > buckets.inProgress && problems > 0) {
    return buckets.dead >= buckets.failed
      ? {
          text: t('nsiAnalytics.syncHealth.caption.dead', {
            count: buckets.dead,
          }),
          className: 'text-danger',
          status: 'DEAD',
        }
      : {
          text: t('nsiAnalytics.syncHealth.caption.failed', {
            count: buckets.failed,
          }),
          className: 'text-danger',
          status: 'FAILED',
        };
  }
  if (buckets.inProgress > 0) {
    return {
      text: t('nsiAnalytics.syncHealth.caption.inProgress', {
        count: buckets.inProgress,
      }),
      className: 'text-primary',
      status:
        system.fetchedCount >= system.notifiedCount ? 'FETCHED' : 'NOTIFIED',
    };
  }
  return {
    text: t('nsiAnalytics.syncHealth.noData'),
    className: 'text-fg-muted',
    status: 'ACKNOWLEDGED',
  };
}

function SystemRow({ system }: { system: SystemSyncStatus }) {
  const { t } = useTranslation();
  const buckets = bucketsFor(system);
  const tier = tierFromRate(system.successRate);
  const highlight = pickHighlight(system, buckets, t);

  const bucketEntries = [
    { key: 'confirmed', value: buckets.confirmed },
    { key: 'inProgress', value: buckets.inProgress },
    { key: 'failed', value: buckets.failed },
    { key: 'dead', value: buckets.dead },
  ] as const;
  const nonZeroEntries = bucketEntries.filter((entry) => entry.value > 0);

  const captionParts = nonZeroEntries.map((entry) =>
    t(`nsiAnalytics.syncHealth.caption.${entry.key}`, { count: entry.value }),
  );

  const linkTo = `/nsi-analytics/sync-logs?externalSystemId=${system.externalSystemId}&syncStatus=${highlight.status}`;

  return (
    <Link
      to={linkTo}
      className="hover:bg-surface-hover -mx-2 flex flex-col gap-1.5 rounded-md px-2 py-3 transition-colors first:pt-0"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-2">
          <span
            className={`size-2 shrink-0 rounded-full ${TIER_DOT_CLASS[tier]}`}
          />
          <span className="text-fg truncate text-sm font-semibold">
            {system.systemName}
          </span>
        </span>
        <span
          className={`shrink-0 text-sm font-semibold tabular-nums ${highlight.className}`}
        >
          {highlight.text}
        </span>
      </div>

      {buckets.total > 0 && (
        <Progress
          size="md"
          max={buckets.total}
          segments={[
            { value: buckets.confirmed, className: 'bg-success' },
            { value: buckets.inProgress, className: 'bg-primary' },
            { value: buckets.failed, className: 'bg-warning' },
            { value: buckets.dead, className: 'bg-danger' },
          ]}
        />
      )}

      <p className="text-fg-muted text-xs">
        {nonZeroEntries.length <= 1
          ? t('nsiAnalytics.syncHealth.caption.allOneBucket', {
              count: buckets.total,
              label: t(
                `nsiAnalytics.syncHealth.label.${nonZeroEntries[0]?.key ?? 'confirmed'}`,
              ),
            })
          : captionParts.join(' · ')}
      </p>
    </Link>
  );
}

export function SyncHealthCard({ summary }: SyncHealthCardProps) {
  const { t } = useTranslation();
  const overallTier = tierFromRate(summary.overallSuccessRate);
  const totalItems = summary.systems.reduce(
    (sum, system) => sum + bucketsFor(system).total,
    0,
  );

  return (
    <Card className="flex flex-col">
      <div className="mb-1 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-fg text-base font-semibold">
            {t('nsiAnalytics.syncHealth.title')}
          </h3>
          <p className="text-fg-muted mt-0.5 text-sm">
            {t('nsiAnalytics.syncHealth.subtitle', {
              systems: summary.systems.length,
              items: totalItems,
            })}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <div
            className={`text-2xl font-semibold tabular-nums ${TIER_TEXT_CLASS[overallTier]}`}
          >
            {summary.overallSuccessRate.toFixed(1)}%
          </div>
          <div className="text-fg-muted text-xs">
            {t('nsiAnalytics.syncHealth.overallLabel')}
          </div>
        </div>
      </div>

      <div className="divide-border flex flex-col divide-y">
        {summary.systems.map((system) => (
          <SystemRow key={system.externalSystemId} system={system} />
        ))}
      </div>

      <div className="border-border mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t pt-3 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="bg-success size-2 shrink-0 rounded-full" />
          <span className="text-fg-muted">
            {t('nsiAnalytics.syncHealth.legend.confirmed')}
          </span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="bg-primary size-2 shrink-0 rounded-full" />
          <span className="text-fg-muted">
            {t('nsiAnalytics.syncHealth.legend.inProgress')}
          </span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="bg-warning size-2 shrink-0 rounded-full" />
          <span className="text-fg-muted">
            {t('nsiAnalytics.syncHealth.legend.failed')}
          </span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="bg-danger size-2 shrink-0 rounded-full" />
          <span className="text-fg-muted">
            {t('nsiAnalytics.syncHealth.legend.dead')}
          </span>
        </span>
      </div>

      <Link
        to="/nsi-analytics/sync-logs"
        className="text-primary mt-3 flex items-center gap-1 self-start text-xs font-semibold"
      >
        {t('nsiAnalytics.viewDetails')}
        <ArrowRightIcon size={12} />
      </Link>
    </Card>
  );
}
