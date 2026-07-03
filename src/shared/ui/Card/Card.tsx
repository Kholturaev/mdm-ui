import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@shared/lib/cn';

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

/** Base surface container — the shared visual shell for dashboard panels. */
export function Card({ children, className, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        'border-border bg-surface rounded-lg border p-5',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

type CardHeaderProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
};

/** Standard panel header: icon + title/subtitle on the left, an optional action (link/control) on the right. */
export function CardHeader({
  title,
  subtitle,
  icon,
  action,
  className,
}: CardHeaderProps) {
  return (
    <div
      className={cn('mb-4 flex items-start justify-between gap-3', className)}
    >
      <div className="flex items-start gap-2.5">
        {icon && <span className="text-fg-muted mt-0.5 shrink-0">{icon}</span>}
        <div>
          <h3 className="text-fg text-sm font-semibold">{title}</h3>
          {subtitle && (
            <p className="text-fg-muted mt-0.5 text-xs">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
