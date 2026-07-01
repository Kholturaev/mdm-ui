import { forwardRef } from 'react';
import { Input } from './Input';
import type { InputProps } from './Input';

type NumberInputProps = Omit<InputProps, 'type' | 'onChange' | 'value'> & {
  value?: number | null;
  onChangeValue?: (value: number | null) => void;
};

/** Numeric text field: no native spinner arrows, emits `number | null` instead of a string. */
export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  function NumberInput({ value, onChangeValue, onWheel, ...rest }, ref) {
    return (
      <Input
        {...rest}
        ref={ref}
        type="number"
        value={value ?? ''}
        onChange={(e) => {
          const raw = e.target.value;
          onChangeValue?.(raw === '' ? null : Number(raw));
        }}
        onWheel={(e) => {
          // Prevent the mouse wheel from silently changing the value while scrolling the page.
          e.currentTarget.blur();
          onWheel?.(e);
        }}
      />
    );
  },
);
