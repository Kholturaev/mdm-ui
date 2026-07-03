import { useAnalyticsOverview } from '../api/useAnalyticsOverview';

export type SystemHealthStatus = 'healthy' | 'warning' | 'critical';

export interface SystemHealth {
  status: SystemHealthStatus;
  syncedPercent: number;
}

/** Rolls the analytics overview up into a single glanceable signal for chrome outside the Analytics page itself (e.g. the app header). */
export function useSystemHealth(): SystemHealth | undefined {
  const { data } = useAnalyticsOverview('30d');
  if (!data) return undefined;

  const syncedSlots = data.systemsCoverage.reduce(
    (sum, system) => sum + system.syncedCount,
    0,
  );
  const totalSlots = data.systemsCoverage.reduce(
    (sum, system) => sum + system.totalProducts,
    0,
  );
  const syncedPercent =
    totalSlots > 0 ? Math.round((syncedSlots / totalSlots) * 100) : 100;

  const hasCritical = data.attention.some((item) => item.severity === 'danger');
  const hasWarning = data.attention.some((item) => item.severity === 'warning');
  const status: SystemHealthStatus = hasCritical
    ? 'critical'
    : hasWarning
      ? 'warning'
      : 'healthy';

  return { status, syncedPercent };
}
