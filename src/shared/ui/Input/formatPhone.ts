/** Formats digits as a Uzbek phone number: +998 90 123 45 67 */
export function formatPhone(rawValue: string): string {
  const digits = rawValue.replace(/\D/g, '').replace(/^998/, '').slice(0, 9);

  const parts = [
    digits.slice(0, 2),
    digits.slice(2, 5),
    digits.slice(5, 7),
    digits.slice(7, 9),
  ].filter(Boolean);

  return parts.length ? `+998 ${parts.join(' ')}` : '';
}
