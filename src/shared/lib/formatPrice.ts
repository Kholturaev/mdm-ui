const PRICE_FORMAT = new Intl.NumberFormat('ru-RU', {
  maximumFractionDigits: 2,
});

/** Thousands-grouped number, e.g. `1234.5` → `1 234,5`. Pass a currency symbol separately — this never attaches one, since a row's currency is a separate field the caller already has. */
export function formatPrice(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return PRICE_FORMAT.format(value);
}
