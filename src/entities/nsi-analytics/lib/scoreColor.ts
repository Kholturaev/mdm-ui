/** Shared completeness/quality score → semantic color mapping — used by every score display (cards, tables, badges) so thresholds stay in one place. */
export function scoreTextClass(score: number): string {
  if (score >= 80) return 'text-success';
  if (score >= 50) return 'text-warning';
  return 'text-danger';
}

export function scoreBadgeVariant(
  score: number,
): 'success' | 'warning' | 'danger' {
  if (score >= 80) return 'success';
  if (score >= 50) return 'warning';
  return 'danger';
}
