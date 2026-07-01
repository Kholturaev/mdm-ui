import { Radio } from './Radio';
import { Label, ErrorText } from '../Field';
import type { ControlSize } from '../types';

export type RadioOption<T extends string> = { label: string; value: T };

type RadioGroupProps<T extends string> = {
  name: string;
  label?: string;
  options: RadioOption<T>[];
  value?: T;
  onChange: (value: T) => void;
  size?: ControlSize;
  error?: string;
  direction?: 'row' | 'column';
  disabled?: boolean;
};

export function RadioGroup<T extends string>({
  name,
  label,
  options,
  value,
  onChange,
  size = 'md',
  error,
  direction = 'row',
  disabled,
}: RadioGroupProps<T>) {
  return (
    <div>
      {label && <Label className="mb-1.5 block">{label}</Label>}
      <div
        className={
          direction === 'row' ? 'flex flex-wrap gap-4' : 'flex flex-col gap-2'
        }
      >
        {options.map((option) => (
          <Radio
            key={option.value}
            name={name}
            label={option.label}
            size={size}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            disabled={disabled}
          />
        ))}
      </div>
      <ErrorText>{error}</ErrorText>
    </div>
  );
}
