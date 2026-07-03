export type SyncStatusFilter = 'all' | 'full' | 'partial' | 'error' | 'none';

type NomenclatureLinkParams = {
  sync?: SyncStatusFilter;
  systemId?: number;
};

/**
 * Builds a deep link into the nomenclature table pre-filtered by sync status
 * and/or external system — the shared contract between anything that links
 * here (e.g. the analytics dashboard) and `NomenclatureTable`, which reads
 * these same params back out on mount.
 */
export function buildNomenclatureLink({
  sync,
  systemId,
}: NomenclatureLinkParams = {}): string {
  const search = new URLSearchParams();
  if (sync && sync !== 'all') search.set('sync', sync);
  if (systemId != null) search.set('system', String(systemId));
  const query = search.toString();
  return query ? `/nomenclature?${query}` : '/nomenclature';
}
