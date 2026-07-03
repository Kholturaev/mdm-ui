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
  progressValue: number;
  progressMax: number;
  progressClassName: string;
  /** When set, the whole tile links here — e.g. the same product list filtered to this bucket. */
  to?: string;
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
}: StatTileProps) {
  const card = (
    <Card
      className={cn(
        'flex flex-col gap-3',
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
      <Progress
        size="sm"
        max={progressMax}
        segments={[{ value: progressValue, className: progressClassName }]}
      />
    </Card>
  );

  if (!to) return card;
  return (
    <Link to={to} className="block">
      {card}
    </Link>
  );
}
