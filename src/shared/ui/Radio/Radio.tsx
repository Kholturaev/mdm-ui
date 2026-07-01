import { forwardRef, useId } from 'react';
import type { InputHTMLAttributes } from 'react';
import { cn } from '@shared/lib/cn';
import type { ControlSize } from '../types';

type RadioProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'size' | 'type'
> & {
  label?: string;
  size?: ControlSize;
};

const DOT_SIZE_CLASSES: Record<ControlSize, string> = {
  sm: 'size-3.5',
  md: 'size-4',
  lg: 'size-5',
};

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { label, size = 'md', className, id, ...rest },
  ref,
) {
  const generatedId = useId();
  const radioId = id ?? generatedId;

  return (
    <label
      htmlFor={radioId}
      className={cn('inline-flex cursor-pointer items-center gap-2', className)}
    >
      <span className="relative inline-flex items-center justify-center">
        <input
          ref={ref}
          id={radioId}
          type="radio"
          className="peer sr-only"
          {...rest}
        />
        <span
          className={cn(
            'border-border peer-checked:border-primary rounded-full border transition-colors',
            'peer-focus-visible:ring-primary/30 peer-focus-visible:ring-2',
            'peer-disabled:bg-disabled-bg peer-disabled:border-disabled-fg',
            DOT_SIZE_CLASSES[size],
          )}
        />
        <span className="bg-primary absolute size-2 scale-0 rounded-full opacity-0 transition-transform peer-checked:scale-100 peer-checked:opacity-100" />
      </span>
      {label && <span className="text-fg text-sm">{label}</span>}
    </label>
  );
});
