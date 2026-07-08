import { useController } from 'react-hook-form';
import type { FieldValues } from 'react-hook-form';
import { DatePicker } from '../DatePicker';
import type { FormFieldBaseProps } from './types';
import type { ControlSize } from '../types';

type FormDatePickerProps<TFieldValues extends FieldValues> =
  FormFieldBaseProps<TFieldValues> & {
    label?: string;
    placeholder?: string;
    required?: boolean;
    size?: ControlSize;
    disabled?: boolean;
    dateFormat?: string;
    minDate?: Date;
    maxDate?: Date;
  };

export function FormDatePicker<TFieldValues extends FieldValues>({
  name,
  control,
  rules,
  ...datePickerProps
}: FormDatePickerProps<TFieldValues>) {
  const { field, fieldState } = useController({ name, control, rules });

  return (
    <DatePicker
      {...datePickerProps}
      name={field.name}
      selected={field.value ?? null}
      onChange={field.onChange}
      onBlur={field.onBlur}
      error={fieldState.error?.message}
    />
  );
}
