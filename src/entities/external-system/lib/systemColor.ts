/** Deterministic color per external system id — purely cosmetic (badges, grouped headers), lets systems stay visually distinct without any server-side color field. */
const PALETTE = [
  { bg: 'bg-violet-500/10', text: 'text-violet-600 dark:text-violet-400' },
  { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400' },
  { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400' },
  { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400' },
  { bg: 'bg-rose-500/10', text: 'text-rose-600 dark:text-rose-400' },
  { bg: 'bg-cyan-500/10', text: 'text-cyan-600 dark:text-cyan-400' },
] as const;

export function getSystemColor(id: number) {
  return PALETTE[Math.abs(id) % PALETTE.length];
}
