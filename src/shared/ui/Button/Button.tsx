import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@shared/lib/cn';
import { Spinner } from '../Spinner';
import type { ControlSize } from '../types';

export type ButtonVariant =
  'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ControlSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
};

const SIZE_CLASSES: Record<ControlSize, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded',
  md: 'h-9 px-4 text-sm gap-2 rounded',
  lg: 'h-11 px-5 text-base gap-2 rounded',
};

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary-hover',
  secondary: 'bg-surface-hover text-fg hover:bg-border',
  outline: 'border border-border text-fg bg-surface hover:bg-surface-hover',
  ghost: 'text-fg hover:bg-surface-hover',
  danger: 'bg-danger text-danger-foreground hover:bg-danger-hover',
};

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  disabled,
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-colors',
        'disabled:bg-disabled-bg disabled:text-disabled-fg disabled:cursor-not-allowed disabled:border-transparent',
        SIZE_CLASSES[size],
        VARIANT_CLASSES[variant],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {isLoading ? (
        <Spinner className="size-4" />
      ) : (
        <>
          {icon && iconPosition === 'left' && icon}
          {children}
          {icon && iconPosition === 'right' && icon}
        </>
      )}
    </button>
  );
}
