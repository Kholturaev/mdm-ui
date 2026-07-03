import type { ReactNode } from 'react';
import { Card } from '@shared/ui/Card';
import { cn } from '@shared/lib/cn';

type AuditStatTileProps = {
  label: string;
  value: ReactNode;
  subtext: ReactNode;
  icon: ReactNode;
  iconClassName: string;
};

export function AuditStatTile({
  label,
  value,
  subtext,
  icon,
  iconClassName,
}: AuditStatTileProps) {
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
    </Card>
  );
}
