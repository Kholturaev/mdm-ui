import { cn } from '@shared/lib/cn';

export type ProgressSegment = {
  value: number;
  /** Tailwind background class for this segment, e.g. `bg-success`. */
  className: string;
  label?: string;
};

type ProgressProps = {
  segments: ProgressSegment[];
  max: number;
  size?: 'sm' | 'md';
  className?: string;
};

const SIZE_CLASSES: Record<'sm' | 'md', string> = {
  sm: 'h-1.5',
  md: 'h-2',
};

/** Multi-segment progress track — e.g. synced/pending/failed portions of a whole, each rendered as its own colored slice. */
export function Progress({
  segments,
  max,
  size = 'md',
  className,
}: ProgressProps) {
  const safeMax = max > 0 ? max : 1;

  return (
    <div
      className={cn(
        'bg-disabled-bg flex w-full overflow-hidden rounded-full',
        SIZE_CLASSES[size],
        className,
      )}
    >
      {segments
        .filter((segment) => segment.value > 0)
        .map((segment, index) => (
          <div
            key={index}
            title={segment.label}
            className={cn('h-full first:rounded-l-full', segment.className)}
            style={{ width: `${(segment.value / safeMax) * 100}%` }}
          />
        ))}
    </div>
  );
}
