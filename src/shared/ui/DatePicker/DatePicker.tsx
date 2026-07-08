import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import ReactDatePicker from 'react-datepicker';
import type { DatePickerProps as ReactDatePickerProps } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './datepicker-overrides.css';
import { Input } from '../Input/Input';
import type { InputProps } from '../Input/Input';

type DatePickerProps = ReactDatePickerProps & {
  label?: string;
  error?: string;
  helperText?: string;
  size?: InputProps['size'];
  required?: boolean;
};

type CustomInputProps = {
  label?: string;
  error?: string;
  helperText?: string;
  size?: InputProps['size'];
  required?: boolean;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>;

const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>(
  function CustomInput(
    { label, error, helperText, size, required, ...rest },
    ref,
  ) {
    return (
      <Input
        ref={ref}
        label={label}
        error={error}
        helperText={helperText}
        size={size}
        required={required}
        readOnly
        {...rest}
      />
    );
  },
);

export function DatePicker({
  label,
  error,
  helperText,
  size,
  required,
  dateFormat = 'dd.MM.yyyy',
  ...rest
}: DatePickerProps) {
  return (
    <ReactDatePicker
      dateFormat={dateFormat}
      customInput={
        <CustomInput
          label={label}
          error={error}
          helperText={helperText}
          size={size}
          required={required}
        />
      }
      {...rest}
    />
  );
}
