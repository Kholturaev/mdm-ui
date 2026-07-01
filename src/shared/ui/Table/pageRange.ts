/**
 * Which page numbers to render around `current`, with 'ellipsis' markers for
 * the gaps — always shows the first/last 2 pages plus 1 neighbor on each
 * side of the current page (1-indexed in, 1-indexed out).
 */
export function buildPageRange(
  current: number,
  total: number,
): (number | 'ellipsis')[] {
  const boundaryCount = 2;
  const siblingCount = 1;

  const shown = new Set<number>();
  for (let i = 1; i <= Math.min(boundaryCount, total); i++) shown.add(i);
  for (let i = Math.max(1, total - boundaryCount + 1); i <= total; i++)
    shown.add(i);
  for (
    let i = Math.max(1, current - siblingCount);
    i <= Math.min(total, current + siblingCount);
    i++
  ) {
    shown.add(i);
  }

  const sorted = Array.from(shown).sort((a, b) => a - b);
  const items: (number | 'ellipsis')[] = [];
  sorted.forEach((page, index) => {
    if (index > 0 && page - sorted[index - 1] > 1) items.push('ellipsis');
    items.push(page);
  });
  return items;
}
