/** Mirrors akfa-data-frontend's real `entities/monitoring/api/monitoringApi.ts` field-for-field. */

export interface SystemSyncStatus {
  externalSystemId: number;
  systemName: string;
  notifiedCount: number;
  fetchedCount: number;
  acknowledgedCount: number;
  failedCount: number;
  deadCount: number;
  successRate: number;
}

export interface SyncSummaryResponse {
  systems: SystemSyncStatus[];
  overallSuccessRate: number;
}

export const SYNC_LOG_STATUSES = [
  'NOTIFIED',
  'FETCHED',
  'ACKNOWLEDGED',
  'FAILED',
  'DEAD',
] as const;

export type SyncLogStatus = (typeof SYNC_LOG_STATUSES)[number];

export const SECTION_TYPES = [
  'PRODUCT',
  'PRODUCT_GROUP',
  'PRODUCT_RATE',
  'DEALER',
] as const;

export type SectionType = (typeof SECTION_TYPES)[number];

export interface SyncLogEntry {
  id: number;
  sectionType: SectionType;
  sourceEntityId: number;
  externalSystemId: number;
  externalEntityId: string | null;
  syncStatus: SyncLogStatus;
  errorMessage: string | null;
  notificationSentAt: string;
  fetchedAt: string | null;
  acknowledgedAt: string | null;
  lastAttemptAt: string | null;
  nextRetryAt: string | null;
  retryCount: number;
  createdAt: string;
}

export interface SyncLogsParams {
  externalSystemId?: number;
  syncStatus?: SyncLogStatus;
  sectionType?: SectionType;
  page: number;
  size: number;
}

export interface SpringPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
