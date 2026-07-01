import type { ReactNode } from 'react';
import { Label } from './Label';
import { ErrorText } from './ErrorText';
import { HelperText } from './HelperText';

type FieldShellProps = {
  id?: string;
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  className?: string;
  children: ReactNode;
};

/** Shared label/control/error layout used by every field-style shared/ui component. */
export function FieldShell({
  id,
  label,
  required,
  error,
  helperText,
  className,
  children,
}: FieldShellProps) {
  return (
    <div className={className}>
      <div className="flex flex-col gap-1.5">
        {label && (
          <Label htmlFor={id} required={required}>
            {label}
          </Label>
        )}
        {children}
      </div>
      <ErrorText>{error}</ErrorText>
      {!error && <HelperText>{helperText}</HelperText>}
    </div>
  );
}
