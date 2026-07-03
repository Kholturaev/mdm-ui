import type { ReactNode } from 'react';
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
}: StatTileProps) {
  return (
    <Card className="flex flex-col gap-3">
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
}
