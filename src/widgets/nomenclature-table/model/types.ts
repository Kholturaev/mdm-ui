/** How much of a product's `externalSystemIds` is filled in, relative to every known system — there's no real per-system sync/error status yet, only presence/absence, so `error` always yields zero rows until the backend tracks it. */
export type SyncStatusFilter = 'all' | 'full' | 'partial' | 'error' | 'none';
