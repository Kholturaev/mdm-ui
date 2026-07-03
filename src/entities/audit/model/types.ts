/**
 * Mirrors akfa-data-frontend's real audit backend (`entities/audit`,
 * `entities/activity-log`) so this mock is a near drop-in once the endpoint
 * exists here too:
 *  - `AuditFieldChange` ~= their `IFieldChange` / per-row `IAuditEntry`.
 *  - `AuditFilterParams` ~= their `IAuditFilterParams`
 *    (tableName/actionType/performedByUsername/dateFrom/dateTo/page/size).
 *  - `SpringPage<T>` ~= their `ISpringPage<T>` — the real `POST /audit/info`
 *    returns a raw Spring `Page<T>`, not this app's usual `IMeta<T>` envelope.
 * Their backend returns one row per changed field; here `AuditEntry` is
 * already grouped into one row per user action (their group key would be
 * recordId + actionTime + performedBy) since that's what every UI — the
 * dashboard feed and the full log — actually renders.
 */
export type AuditActionType =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'SYNC'
  | 'IMPORT'
  | 'EXPORT'
  | 'APPROVE'
  | 'REJECT'
  | 'LOGIN';

export type AuditStatus = 'SUCCESS' | 'FAILED';

export type AuditEntityType =
  'PRODUCT' | 'DEALER' | 'UNIT' | 'SEGMENT' | 'USER' | 'ROLE' | 'SESSION';

export interface AuditFieldChange {
  fieldName: string;
  oldValue: string | null;
  newValue: string | null;
}

export interface AuditActor {
  id: number;
  username: string;
  fullName: string;
}

export interface AuditEntry {
  id: string;
  actionType: AuditActionType;
  actionTime: string;
  performedBy: AuditActor;
  entityType?: AuditEntityType;
  recordId?: number;
  recordName?: string;
  /** Per-field old/new values for this action — empty for CREATE/DELETE/LOGIN. */
  fieldChanges: AuditFieldChange[];
  /** i18n key suffix under `audit.feed.*`, interpolated with this entry's own fields. */
  description: string;
  status: AuditStatus;
  /** Free-text reason — set on REJECT and on FAILED syncs. */
  reason?: string;
  /** External systems a CREATE/SYNC/IMPORT was propagated to. */
  targetSystems?: string[];
  /** Set on LOGIN entries — global MDM audit trails track this for security review. */
  ipAddress?: string;
}

export interface AuditFilterParams {
  dateFrom?: string;
  dateTo?: string;
  actionType?: AuditActionType;
  performedByUsername?: string;
  /** Free-text match against record name — not part of the real `IAuditFilterParams` yet, added here since every list page in this app offers a search box. */
  search?: string;
  page?: number;
  size?: number;
}

export interface SpringPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

/** A change awaiting a reviewer's decision — distinct from `AuditEntry` since it hasn't happened yet. Once approved/rejected it becomes (or is discarded instead of becoming) an `AuditEntry`. */
export interface ApprovalRequest {
  id: string;
  requestedBy: AuditActor;
  createdAt: string;
  /** i18n key suffix under `audit.approvals.kind.*`. */
  kind: string;
  recordName: string;
  fieldChanges?: AuditFieldChange[];
}

export interface TeamActivityItem {
  actor: AuditActor;
  roleName: string;
  actionCount: number;
}

export interface ActivityTrendPoint {
  date: string;
  count: number;
  hasFailure: boolean;
}

export interface ActionTypeCount {
  actionType: AuditActionType;
  count: number;
}

/** Governs the trend chart's window on the audit dashboard — not the "today/yesterday" dashboard feed, which is always fixed regardless of this. */
export type AuditDashboardPeriod = 'today' | 'todayYesterday' | '7d' | '30d';
