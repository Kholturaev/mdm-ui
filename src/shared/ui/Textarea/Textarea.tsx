import { forwardRef, useId } from 'react';
import type { TextareaHTMLAttributes } from 'react';
import { cn } from '@shared/lib/cn';
import { FieldShell } from '../Field';
import { INPUT_ERROR_CLASSES, INPUT_FRAME_CLASSES } from '../Input/inputStyles';

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
  helperText?: string;
  containerClassName?: string;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    {
      label,
      error,
      helperText,
      required,
      className,
      containerClassName,
      id,
      rows = 4,
      ...rest
    },
    ref,
  ) {
    const generatedId = useId();
    const textareaId = id ?? generatedId;

    return (
      <FieldShell
        id={textareaId}
        label={label}
        required={required}
        error={error}
        helperText={helperText}
        className={containerClassName}
      >
        <textarea
          ref={ref}
          id={textareaId}
          required={required}
          rows={rows}
          className={cn(
            INPUT_FRAME_CLASSES,
            'resize-y px-3 py-2 text-sm',
            error && INPUT_ERROR_CLASSES,
            className,
          )}
          {...rest}
        />
      </FieldShell>
    );
  },
);
