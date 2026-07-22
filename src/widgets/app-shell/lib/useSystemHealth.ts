import { useGetSyncSummaryQuery } from '@entities/monitoring/api/monitoringApi';

export type SystemHealthStatus = 'healthy' | 'warning' | 'critical';

export interface SystemHealth {
  status: SystemHealthStatus;
  syncedPercent: number;
}

/** Same 70/40 thresholds as the hub's Sync Health card, so the header pill and the hub always agree on what "critical" means. */
function statusFromSuccessRate(rate: number): SystemHealthStatus {
  if (rate >= 70) return 'healthy';
  if (rate >= 40) return 'warning';
  return 'critical';
}

/** Real sync-attempt success rate (`overallSuccessRate` from `/monitoring/sync-summary`) rolled into one glanceable signal for chrome outside the analytics hub itself (the app header). */
export function useSystemHealth(): SystemHealth | undefined {
  const { data: syncSummary } = useGetSyncSummaryQuery();
  if (!syncSummary?.data) return undefined;

  const { overallSuccessRate } = syncSummary.data;
  return {
    status: statusFromSuccessRate(overallSuccessRate),
    syncedPercent: Math.round(overallSuccessRate),
  };
}
