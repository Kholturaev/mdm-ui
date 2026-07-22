/** Real `GET /analytics/coverage` and `GET /analytics/daily-digest` response shapes — verified against the live backend. */
export interface SystemCoverage {
  externalSystemId: number;
  systemName: string;
  syncedProductCount: number;
  coveragePercent: number;
}

export interface CoverageResponse {
  totalProducts: number;
  systems: SystemCoverage[];
}

export interface DailyDigestResponse {
  date: string;
  totalEvents: number;
  inboundErrors: number;
  syncSuccess: number;
  syncFailed: number;
  /** Combined `inboundErrors + syncFailed`, returned directly by the backend. */
  errorCount: number;
  newAuditRecords: number;
  topActivities: string[];
}

export interface DlqErrorTypeCount {
  errorType: string;
  count: number;
}

export interface ErrorBreakdownResponse {
  /** Keyed by DLQ message status, e.g. PENDING/REPLAYED/RESOLVED. */
  dlqByStatus: Record<string, number>;
  validationErrorCount: number;
  syncFailedCount: number;
  topDlqErrorTypes: DlqErrorTypeCount[];
  period: string;
}

export interface TrendDataPoint {
  date: string;
  /** Total events that day — errors included, not on top of. */
  eventCount: number;
  errorCount: number;
  errorRate: number;
}

export interface TrendsResponse {
  days: number;
  dataPoints: TrendDataPoint[];
}
