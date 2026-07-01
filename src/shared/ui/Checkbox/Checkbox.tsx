import { forwardRef, useId } from 'react';
import type { InputHTMLAttributes } from 'react';
import { cn } from '@shared/lib/cn';
import { CheckIcon } from '../icons/CheckIcon';
import { ErrorText } from '../Field';
import type { ControlSize } from '../types';

type CheckboxProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'size' | 'type'
> & {
  label?: string;
  size?: ControlSize;
  error?: string;
};

const BOX_SIZE_CLASSES: Record<ControlSize, string> = {
  sm: 'size-3.5',
  md: 'size-4',
  lg: 'size-5',
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox(
    { label, size = 'md', error, className, id, checked, ...rest },
    ref,
  ) {
    const generatedId = useId();
    const checkboxId = id ?? generatedId;

    return (
      <div className={className}>
        <label
          htmlFor={checkboxId}
          className="inline-flex cursor-pointer items-center gap-2"
        >
          <span className="relative inline-flex">
            <input
              ref={ref}
              id={checkboxId}
              type="checkbox"
              checked={checked}
              className="peer sr-only"
              {...rest}
            />
            <span
              className={cn(
                'border-border bg-surface peer-checked:bg-primary peer-checked:border-primary text-primary-foreground flex items-center justify-center rounded-sm border transition-colors',
                'peer-focus-visible:ring-primary/30 peer-focus-visible:ring-2',
                'peer-disabled:bg-disabled-bg peer-disabled:border-disabled-fg',
                BOX_SIZE_CLASSES[size],
              )}
            >
              {checked && <CheckIcon size={size === 'lg' ? 14 : 10} />}
            </span>
          </span>
          {label && <span className="text-fg text-sm">{label}</span>}
        </label>
        <ErrorText>{error}</ErrorText>
      </div>
    );
  },
);
