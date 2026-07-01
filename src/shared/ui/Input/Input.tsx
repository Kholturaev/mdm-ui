import { forwardRef, useId } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '@shared/lib/cn';
import { FieldShell } from '../Field';
import type { ControlSize } from '../types';
import {
  INPUT_ERROR_CLASSES,
  INPUT_FRAME_CLASSES,
  INPUT_SIZE_CLASSES,
} from './inputStyles';

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  label?: string;
  error?: string;
  helperText?: string;
  size?: ControlSize;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  containerClassName?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    error,
    helperText,
    size = 'md',
    leftIcon,
    rightIcon,
    required,
    className,
    containerClassName,
    id,
    ...rest
  },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <FieldShell
      id={inputId}
      label={label}
      required={required}
      error={error}
      helperText={helperText}
      className={containerClassName}
    >
      <div className="relative flex items-center">
        {leftIcon && (
          <span className="text-fg-muted pointer-events-none absolute left-3 flex items-center">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          required={required}
          className={cn(
            INPUT_FRAME_CLASSES,
            INPUT_SIZE_CLASSES[size],
            leftIcon && 'pl-9',
            rightIcon && 'pr-9',
            error && INPUT_ERROR_CLASSES,
            className,
          )}
          {...rest}
        />
        {rightIcon && (
          <span className="text-fg-muted absolute right-3 flex items-center">
            {rightIcon}
          </span>
        )}
      </div>
    </FieldShell>
  );
});
