export type AnalyticsPeriod = '7d' | '30d' | '90d';

export interface AnalyticsTotals {
  /** All nomenclature rows in the MDM, regardless of sync state. */
  totalProducts: number;
  /** How many distinct external systems products can be distributed to. */
  totalSystemsCount: number;
  /** Products present in at least one external system. */
  connectedProductsCount: number;
  /** Products present in every external system. */
  fullySyncedCount: number;
  /** Products present in some, but not all, external systems. */
  partialCount: number;
  /** Of the partial set: currently queued, not yet delivered. */
  partialPendingCount: number;
  /** Of the partial set: last delivery attempt failed. */
  partialErrorCount: number;
  /** Products present in no external system at all. */
  unconnectedCount: number;
}

export type AttentionSeverity = 'danger' | 'warning';

export type AttentionKind = 'unconnected' | 'syncErrors' | 'pendingSync';

export interface AttentionItem {
  kind: AttentionKind;
  severity: AttentionSeverity;
  count: number;
  /** Free-text example, e.g. a couple of affected product names — mirrors what the backend would return to give the count context without a drill-down click. */
  sample?: string[];
}

export interface SystemCoverageItem {
  systemId: number;
  systemName: string;
  syncedCount: number;
  pendingCount: number;
  errorCount: number;
  /** Universe this system is measured against — normally equal to totals.totalProducts. */
  totalProducts: number;
}

export interface TrendPoint {
  date: string;
  successCount: number;
  errorCount: number;
}

export interface CompletenessSummary {
  /** 0-100 weighted score across required fields. */
  overallScore: number;
  fullComplete: number;
  partial: number;
  incomplete: number;
}

export interface PerformanceTrendPoint {
  date: string;
  avgHours: number;
}

export interface PerformanceSummary {
  timeToMarket: {
    avgHours: number;
    trend: PerformanceTrendPoint[];
  };
  mttr: {
    avgHours: number;
    trend: PerformanceTrendPoint[];
  };
}

export interface DataQualitySummary {
  duplicateGroups: number;
  affectedProducts: number;
  validationErrorCount: number;
}

export type ActivityActionType =
  'CREATE' | 'UPDATE' | 'DELETE' | 'SYNC' | 'IMPORT';

export interface RecentActivityItem {
  id: string;
  actionType: ActivityActionType;
  actor: string;
  description: string;
  systemName?: string;
  timestamp: string;
}

export interface AnalyticsOverview {
  generatedAt: string;
  totals: AnalyticsTotals;
  attention: AttentionItem[];
  systemsCoverage: SystemCoverageItem[];
  trend: TrendPoint[];
  completeness: CompletenessSummary;
  performance: PerformanceSummary;
  dataQuality: DataQualitySummary;
  recentActivity: RecentActivityItem[];
}
