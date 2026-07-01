import type { LabelHTMLAttributes } from 'react';
import { cn } from '@shared/lib/cn';

type LabelProps = LabelHTMLAttributes<HTMLLabelElement> & {
  required?: boolean;
};

export function Label({ children, required, className, ...rest }: LabelProps) {
  return (
    <label className={cn('text-fg text-xs font-medium', className)} {...rest}>
      {children}
      {required && <span className="text-danger ml-0.5">*</span>}
    </label>
  );
}
