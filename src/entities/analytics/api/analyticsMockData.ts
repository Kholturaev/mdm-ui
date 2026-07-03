import type {
  AnalyticsOverview,
  AnalyticsPeriod,
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
    conflicts: {
      totalCount: 7,
      items: [
        {
          productId: 101,
          productName: 'Montaj kopik 750ml professional',
          field: 'PRICE',
          severity: 'warning',
          values: [
            { systemName: 'SAP', value: '42 000' },
            { systemName: '1C', value: '45 000' },
          ],
        },
        {
          productId: 102,
          productName: 'Plastik podkladka 6mm 150x50mm',
          field: 'UNIT',
          severity: 'warning',
          values: [
            { systemName: 'SAP', value: 'mm' },
            { systemName: 'WMS', value: 'sm' },
          ],
        },
      ],
    },
    dataQuality: {
      duplicateGroups: 3,
      affectedProducts: 7,
      validationErrorCount: 12,
    },
  };
}
