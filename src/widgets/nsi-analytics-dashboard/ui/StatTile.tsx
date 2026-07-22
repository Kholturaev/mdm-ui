import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@shared/ui/Card';
import { Progress } from '@shared/ui/Progress';
import { cn } from '@shared/lib/cn';

type StatTileProps = {
  label: string;
  value: number;
  subtext: ReactNode;
  icon: ReactNode;
  iconClassName: string;
  /** Omit all three when there's no sound whole/part ratio to visualize — e.g. an error count that isn't a clean subset of some total. */
  progressValue?: number;
  progressMax?: number;
  progressClassName?: string;
  /** When set, the whole tile links here — e.g. the same product list filtered to this bucket. */
  to?: string;
  /** Supplementary content below the subtext — e.g. a row of activity-type badges. */
  extra?: ReactNode;
};

export function StatTile({
  label,
  value,
  subtext,
  icon,
  iconClassName,
  progressValue,
  progressMax,
  progressClassName,
  to,
  extra,
}: StatTileProps) {
  const card = (
    <Card
      className={cn(
        'flex h-full flex-col gap-3',
        to &&
          'hover:border-border-strong hover:bg-surface-hover transition-colors',
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-fg-muted text-xs font-medium tracking-wide uppercase">
          {label}
        </span>
        <span
          className={cn(
            'flex size-8 shrink-0 items-center justify-center rounded-md',
            iconClassName,
          )}
        >
          {icon}
        </span>
      </div>
      <div>
        <div className="text-fg text-2xl font-semibold tabular-nums">
          {value}
        </div>
        <div className="text-fg-muted mt-0.5 text-xs">{subtext}</div>
      </div>
      {extra}
      {progressMax !== undefined && (
        <Progress
          size="sm"
          max={progressMax}
          segments={[
            { value: progressValue ?? 0, className: progressClassName ?? '' },
          ]}
          className="mt-auto"
        />
      )}
    </Card>
  );

  if (!to) return card;
  return (
    <Link to={to} className="block h-full">
      {card}
    </Link>
  );
}
