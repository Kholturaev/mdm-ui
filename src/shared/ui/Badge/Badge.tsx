import type { ReactNode } from 'react';
import { cn } from '@shared/lib/cn';

export type BadgeVariant = 'success' | 'neutral' | 'warning' | 'danger';

type BadgeProps = {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
  /** Shows a small leading dot in the badge's own color — a lightweight status indicator alongside the label. */
  dot?: boolean;
};

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  success: 'bg-success/10 text-success',
  neutral: 'bg-fg-muted/10 text-fg-muted',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-danger/10 text-danger',
};

/** Small status pill using our semantic color tokens — e.g. active/inactive, stage labels. */
export function Badge({
  variant = 'neutral',
  children,
  className,
  dot = false,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium',
        VARIANT_CLASSES[variant],
        className,
      )}
    >
      {dot && <span className="size-1.5 shrink-0 rounded-full bg-current" />}
      {children}
    </span>
  );
}
