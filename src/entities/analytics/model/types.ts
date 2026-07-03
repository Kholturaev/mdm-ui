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

export type ConflictField = 'PRICE' | 'UNIT' | 'BARCODE';

export interface ConflictSystemValue {
  systemName: string;
  value: string;
}

export interface ProductConflict {
  productId: number;
  productName: string;
  field: ConflictField;
  severity: AttentionSeverity;
  /** The differing value recorded in each system that disagrees — 2+ entries. */
  values: ConflictSystemValue[];
}

export interface ConflictsSummary {
  /** Full count across all systems — `items` below is only the top examples shown on the dashboard. */
  totalCount: number;
  items: ProductConflict[];
}

export interface DataQualitySummary {
  duplicateGroups: number;
  affectedProducts: number;
  validationErrorCount: number;
}

export interface AnalyticsOverview {
  generatedAt: string;
  totals: AnalyticsTotals;
  attention: AttentionItem[];
  systemsCoverage: SystemCoverageItem[];
  trend: TrendPoint[];
  completeness: CompletenessSummary;
  conflicts: ConflictsSummary;
  dataQuality: DataQualitySummary;
}
