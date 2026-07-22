/**
 * Data Quality & Completeness domain — the v1 scope of the unified NSI
 * Analytics hub. Shapes for completeness/duplicates/orphans mirror
 * akfa-data-frontend's real `/analytics/*` endpoints field-for-field so
 * swapping these mock hooks for real RTK Query endpoints later is a pure
 * plumbing change. `conflicts` has no backend prior art in either frontend
 * yet — designed fresh, see the backend gap list for what it needs.
 */

export interface DataPage<T> {
  data: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
}

export interface SpringPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

// ---------------------------------------------------------------------------
// Completeness
// ---------------------------------------------------------------------------

export interface CompletenessDistributionItem {
  label: string;
  count: number;
}

export interface CompletenessTopIncompleteItem {
  productId: number;
  article: string;
  name: string;
  score: number;
  missingFields: string[];
  missingFieldLabels?: string[];
}

export interface CompletenessSummary {
  overallScore: number;
  totalProducts: number;
  fullComplete: number;
  partial: number;
  incomplete: number;
  distribution: CompletenessDistributionItem[];
  topIncomplete: CompletenessTopIncompleteItem[];
}

export interface FieldCompletenessItem {
  field: string;
  filledCount: number;
  missingCount: number;
  missingPercent: number;
}

export interface FieldCompletenessResponse {
  totalProducts: number;
  fields: FieldCompletenessItem[];
}

export type CompletenessGroupDimension = 'PRODUCT_GROUP' | 'CATEGORY';

export interface GroupCompletenessItem {
  groupId: number | null;
  groupName: string | null;
  productCount: number;
  avgScore: number;
  fullCompleteCount: number;
  incompleteCount: number;
}

export interface GroupCompletenessParams {
  dimension: CompletenessGroupDimension;
  page: number;
  size: number;
}

export interface SourceSystemCompletenessItem {
  externalSystemId: number;
  systemName: string;
  productCount: number;
  avgScore: number;
}

export interface SourceSystemCompletenessResponse {
  basis: 'COVERAGE_PROXY';
  systems: SourceSystemCompletenessItem[];
}

export interface CompletenessTrendPoint {
  date: string;
  avgScore: number;
  totalProducts: number;
  fullCompleteCount: number;
  incompleteCount: number;
}

export interface CompletenessTrendResponse {
  days: number;
  points: CompletenessTrendPoint[];
}

export interface IncompleteProductsListParams {
  page: number;
  size: number;
}

// ---------------------------------------------------------------------------
// Duplicates
// ---------------------------------------------------------------------------

export type DuplicateMatchType = 'ARTICLE' | 'NAME';

export interface DuplicateItem {
  productId: number;
  article: string;
  name: string;
  createdAt: string;
}

export interface DuplicateGroup {
  duplicateKey: string;
  matchType: DuplicateMatchType;
  items: DuplicateItem[];
}

export interface DuplicatesResponse {
  totalGroups: number;
  affectedProducts: number;
  groups: SpringPage<DuplicateGroup>;
}

// ---------------------------------------------------------------------------
// Orphans
// ---------------------------------------------------------------------------

/** `article` is nullable on the real backend — not every product has one. */
export interface OrphanItem {
  productId: number;
  article: string | null;
  name: string;
  createdAt: string;
  daysSinceCreation: number;
}

export interface OrphansResponse {
  totalOrphans: number;
  orphanPercent: number;
  items: SpringPage<OrphanItem>;
}
