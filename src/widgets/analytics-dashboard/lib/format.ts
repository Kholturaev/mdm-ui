/** Formats a duration in hours as e.g. "6.4 soat" or "1.2 kun" once it crosses a day. */
export function formatHours(
  hours: number,
  t: (key: string, opts?: Record<string, unknown>) => string,
): string {
  if (hours >= 24) {
    return t('analytics.units.days', {
      count: Number((hours / 24).toFixed(1)),
    });
  }
  return t('analytics.units.hours', { count: Number(hours.toFixed(1)) });
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

/** Formats an ISO timestamp as "6 minutes ago" / "2 hours ago" in the active locale. */
export function formatRelativeTime(iso: string, locale: string): string {
  const diffMs = new Date(iso).getTime() - Date.now();
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const diffMinutes = Math.round(diffMs / 60000);
  if (Math.abs(diffMinutes) < 60) return rtf.format(diffMinutes, 'minute');
  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) return rtf.format(diffHours, 'hour');
  const diffDays = Math.round(diffHours / 24);
  return rtf.format(diffDays, 'day');
}
