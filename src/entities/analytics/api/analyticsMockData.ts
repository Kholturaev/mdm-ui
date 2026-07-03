import type {
  AnalyticsOverview,
  AnalyticsPeriod,
  PerformanceTrendPoint,
  TrendPoint,
} from '../model/types';

const PERIOD_DAYS: Record<AnalyticsPeriod, number> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
};

function isoDate(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().slice(0, 10);
}

function buildTrend(days: number): TrendPoint[] {
  return Array.from({ length: days }, (_, index) => {
    const daysAgo = days - 1 - index;
    const isWeekend = new Date(isoDate(daysAgo)).getDay() % 6 === 0;
    const base = isWeekend ? 60 : 140;
    const successCount = Math.round(
      base + Math.sin(index / 3) * 20 + Math.random() * 15,
    );
    const errorCount = Math.round(2 + Math.random() * (isWeekend ? 3 : 6));
    return { date: isoDate(daysAgo), successCount, errorCount };
  });
}

function buildPerformanceTrend(
  days: number,
  avg: number,
  spread: number,
): PerformanceTrendPoint[] {
  return Array.from({ length: days }, (_, index) => {
    const daysAgo = days - 1 - index;
    const avgHours = Math.max(
      0.5,
      avg +
        Math.sin(index / 4) * spread +
        (Math.random() - 0.5) * spread * 0.25,
    );
    return { date: isoDate(daysAgo), avgHours: Number(avgHours.toFixed(1)) };
  });
}

const SYSTEM_NAMES = ['SAP', '1C', 'B2B', 'ESHOP', 'WMS'];

/** Mirrors the shape a real `/analytics/overview` endpoint would return. Swap this generator for an RTK Query hook once the backend exposes it — every consumer already reads through `useAnalyticsOverview`. */
export function generateAnalyticsOverview(
  period: AnalyticsPeriod,
): AnalyticsOverview {
  const days = PERIOD_DAYS[period];
  const totalProducts = 29;

  return {
    generatedAt: new Date().toISOString(),
    totals: {
      totalProducts,
      totalSystemsCount: SYSTEM_NAMES.length,
      connectedProductsCount: 27,
      fullySyncedCount: 8,
      partialCount: 19,
      partialPendingCount: 5,
      partialErrorCount: 5,
      unconnectedCount: 2,
    },
    attention: [
      {
        kind: 'unconnected',
        severity: 'danger',
        count: 2,
        sample: [
          'Montaj kopik 750ml professional',
          'Plastik podkladka 6mm 150x50mm',
        ],
      },
      {
        kind: 'syncErrors',
        severity: 'danger',
        count: 5,
      },
      {
        kind: 'pendingSync',
        severity: 'warning',
        count: 5,
      },
    ],
    systemsCoverage: [
      {
        systemId: 1,
        systemName: 'SAP',
        syncedCount: 27,
        pendingCount: 0,
        errorCount: 0,
        totalProducts,
      },
      {
        systemId: 2,
        systemName: '1C',
        syncedCount: 25,
        pendingCount: 1,
        errorCount: 1,
        totalProducts,
      },
      {
        systemId: 3,
        systemName: 'B2B',
        syncedCount: 17,
        pendingCount: 0,
        errorCount: 3,
        totalProducts,
      },
      {
        systemId: 4,
        systemName: 'ESHOP',
        syncedCount: 14,
        pendingCount: 2,
        errorCount: 2,
        totalProducts,
      },
      {
        systemId: 5,
        systemName: 'WMS',
        syncedCount: 22,
        pendingCount: 3,
        errorCount: 0,
        totalProducts,
      },
    ],
    trend: buildTrend(days),
    completeness: {
      overallScore: 78,
      fullComplete: 14,
      partial: 11,
      incomplete: 4,
    },
    performance: {
      timeToMarket: {
        avgHours: 6.4,
        trend: buildPerformanceTrend(days, 6.4, 2.5),
      },
      mttr: {
        avgHours: 2.1,
        trend: buildPerformanceTrend(days, 2.1, 1.2),
      },
    },
    dataQuality: {
      duplicateGroups: 3,
      affectedProducts: 7,
      validationErrorCount: 12,
    },
    recentActivity: [
      {
        id: '1',
        actionType: 'SYNC',
        actor: 'SAP',
        description: 'recentActivity.syncCompleted',
        systemName: 'SAP',
        timestamp: minutesAgo(6),
      },
      {
        id: '2',
        actionType: 'UPDATE',
        actor: 'a.tursunov',
        description: 'recentActivity.productUpdated',
        timestamp: minutesAgo(24),
      },
      {
        id: '3',
        actionType: 'SYNC',
        actor: 'B2B',
        description: 'recentActivity.syncFailed',
        systemName: 'B2B',
        timestamp: minutesAgo(41),
      },
      {
        id: '4',
        actionType: 'IMPORT',
        actor: 'sh.karimov',
        description: 'recentActivity.bulkImport',
        timestamp: hoursAgo(2),
      },
      {
        id: '5',
        actionType: 'CREATE',
        actor: 'a.tursunov',
        description: 'recentActivity.productCreated',
        timestamp: hoursAgo(3),
      },
      {
        id: '6',
        actionType: 'SYNC',
        actor: 'ESHOP',
        description: 'recentActivity.syncCompleted',
        systemName: 'ESHOP',
        timestamp: hoursAgo(5),
      },
    ],
  };
}

function minutesAgo(minutes: number): string {
  const date = new Date();
  date.setMinutes(date.getMinutes() - minutes);
  return date.toISOString();
}

function hoursAgo(hours: number): string {
  const date = new Date();
  date.setHours(date.getHours() - hours);
  return date.toISOString();
}
