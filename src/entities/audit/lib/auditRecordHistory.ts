import type { TFunction } from 'i18next';
import type {
  AuditFieldChange,
  AuditRecordFieldEntry,
  AuditRecordGroup,
} from '../model/types';

/** Groups flat per-field audit rows into one entry per user action — by `activityLogId` when the backend supplies it (e.g. every field of a create/import shares one), otherwise by actionType+actionTime+performedById, since a lone field update has no activityLogId but is already its own group (no other row shares its exact timestamp). */
export function groupAuditRecordEntries(
  entries: AuditRecordFieldEntry[],
): AuditRecordGroup[] {
  const groups = new Map<string, AuditRecordGroup>();

  for (const entry of entries) {
    const key =
      entry.activityLogId ??
      `${entry.actionType}:${entry.actionTime}:${entry.performedById}`;
    const change: AuditFieldChange = {
      fieldName: entry.fieldName,
      oldValue: entry.oldValue,
      newValue: entry.newValue,
    };

    const existing = groups.get(key);
    if (existing) {
      existing.fieldChanges.push(change);
      if (entry.actionTime < existing.actionTime) {
        existing.actionTime = entry.actionTime;
      }
      continue;
    }

    groups.set(key, {
      key,
      actionType: entry.actionType,
      actionTime: entry.actionTime,
      performedBy: entry.performedBy,
      fieldChanges: [change],
    });
  }

  return [...groups.values()].sort((a, b) =>
    a.actionTime < b.actionTime ? 1 : a.actionTime > b.actionTime ? -1 : 0,
  );
}

/** Fields whose raw "true"/"false" string values should render as translated yes/no rather than the literal word. */
const BOOLEAN_FIELD_NAMES = new Set(['isGolden', 'isFree']);

/** Resolves a raw backend field name to its display label — reuses the product column labels already translated for the nomenclature table (`product.*`), falling back to the relation's own label for a foreign-key column (`categoryId` -> `product.category`), then a dedicated `product.historyField.*` entry, then the raw field name. */
export function getAuditFieldLabel(fieldName: string, t: TFunction): string {
  const columnLabel = t(`product.${fieldName}`, { defaultValue: '' });
  if (columnLabel) return columnLabel;

  if (fieldName.endsWith('Id')) {
    const relationLabel = t(`product.${fieldName.slice(0, -2)}`, {
      defaultValue: '',
    });
    if (relationLabel) return relationLabel;
  }

  const historyLabel = t(`product.historyField.${fieldName}`, {
    defaultValue: '',
  });
  return historyLabel || fieldName;
}

/**
 * Timeline timestamp — a fixed "Iyun 29, 2026" / "Июнь 29, 2026" format
 * rather than relative phrasing, so the reader does their own "how long
 * ago" math instead of us guessing a threshold. Deliberately not using
 * `Intl.DateTimeFormat` here: some devices report a locale with a
 * non-Gregorian calendar preference baked in (e.g. `-u-ca-chinese`), which
 * silently turns `month: 'long'` into a "M06"-style label even with
 * `calendar: 'gregory'` requested — looking the month name up in our own
 * `common.months.*` translations sidesteps that entirely.
 */
export function formatAuditTimelineDate(iso: string, t: TFunction): string {
  const date = new Date(iso);
  const month = t(`common.months.${date.getMonth()}`);
  return `${month} ${date.getDate()}, ${date.getFullYear()}`;
}

/** Renders a raw old/new field value for display — translates known booleans and the product status enum, em-dashes empty values. */
export function formatAuditFieldValue(
  fieldName: string,
  value: string | null,
  t: TFunction,
): string {
  if (value === null || value === '') return '—';
  if (fieldName === 'productStatus') {
    return t(`product.status.${value}`, { defaultValue: value });
  }
  if (
    BOOLEAN_FIELD_NAMES.has(fieldName) &&
    (value === 'true' || value === 'false')
  ) {
    return t(value === 'true' ? 'common.yes' : 'common.no');
  }
  return value;
}
