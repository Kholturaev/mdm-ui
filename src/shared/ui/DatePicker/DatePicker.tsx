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
};

type CustomInputProps = {
  label?: string;
  error?: string;
  helperText?: string;
  size?: InputProps['size'];
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>;

const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>(
  function CustomInput({ label, error, helperText, size, ...rest }, ref) {
    return (
      <Input
        ref={ref}
        label={label}
        error={error}
        helperText={helperText}
        size={size}
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
        />
      }
      {...rest}
    />
  );
}
