import type { TFunction } from 'i18next';

const DATE_TIME_FORMAT = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

/** Formats an ISO date string as `DD.MM.YYYY, HH:mm` — falls back to '—' or the raw value if it isn't a parseable date. */
export function formatDateTime(value?: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return DATE_TIME_FORMAT.format(date);
}

/**
 * Formats an ISO timestamp as "5 daqiqa oldin" / "2 soat oldin" using our own
 * `common.relativeTime.*` translations. Deliberately not `Intl.RelativeTimeFormat`:
 * without full ICU data for `uz`/`ru` it silently falls back to broken output
 * like "this minute" or "-1 min" instead of throwing — the same class of issue
 * `formatAuditTimelineDate` sidesteps for month names.
 */
export function formatRelativeTime(iso: string, t: TFunction): string {
  const diffMinutes = Math.max(
    0,
    Math.round((Date.now() - new Date(iso).getTime()) / 60000),
  );
  if (diffMinutes < 1) return t('common.relativeTime.justNow');
  if (diffMinutes < 60) {
    return t('common.relativeTime.minutesAgo', { count: diffMinutes });
  }
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) {
    return t('common.relativeTime.hoursAgo', { count: diffHours });
  }
  const diffDays = Math.round(diffHours / 24);
  return t('common.relativeTime.daysAgo', { count: diffDays });
}
