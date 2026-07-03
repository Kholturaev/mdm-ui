/** Short badge label for an external system — e.g. "Akfa-dealer" → "AK". */
export function systemAbbr(name: string) {
  return name.slice(0, 2).toUpperCase();
}
