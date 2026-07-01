import { forwardRef } from 'react';
import { Input } from './Input';
import type { InputProps } from './Input';
import { formatPhone } from './formatPhone';

type PhoneFieldProps = Omit<InputProps, 'type' | 'onChange' | 'value'> & {
  value?: string;
  onChangeValue?: (value: string) => void;
};

export const PhoneField = forwardRef<HTMLInputElement, PhoneFieldProps>(
  function PhoneField({ value = '', onChangeValue, ...rest }, ref) {
    return (
      <Input
        {...rest}
        ref={ref}
        type="tel"
        inputMode="numeric"
        placeholder="+998 90 123 45 67"
        value={value}
        onChange={(e) => onChangeValue?.(formatPhone(e.target.value))}
      />
    );
  },
);
