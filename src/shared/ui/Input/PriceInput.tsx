import { forwardRef } from 'react';
import { Input } from './Input';
import type { InputProps } from './Input';
import { formatPrice } from '@shared/lib/formatPrice';

type PriceInputProps = Omit<InputProps, 'type' | 'onChange' | 'value'> & {
  value?: number | null;
  onChangeValue?: (value: number | null) => void;
};

/** Digits-only text field that displays as a thousands-grouped number (`10000` → `10 000`) — a native `type="number"` input can't show that formatting. */
export const PriceInput = forwardRef<HTMLInputElement, PriceInputProps>(
  function PriceInput({ value, onChangeValue, ...rest }, ref) {
    const display =
      value === null || value === undefined ? '' : formatPrice(value);

    return (
      <Input
        {...rest}
        ref={ref}
        type="text"
        inputMode="numeric"
        value={display}
        onChange={(e) => {
          const digitsOnly = e.target.value.replace(/\D/g, '');
          onChangeValue?.(digitsOnly ? Number(digitsOnly) : null);
        }}
      />
    );
  },
);
