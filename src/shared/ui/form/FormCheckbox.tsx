import { useController } from 'react-hook-form';
import type { FieldValues } from 'react-hook-form';
import { Checkbox } from '../Checkbox';
import type { FormFieldBaseProps } from './types';
import type { ControlSize } from '../types';

type FormCheckboxProps<TFieldValues extends FieldValues> =
  FormFieldBaseProps<TFieldValues> & {
    label?: string;
    size?: ControlSize;
    disabled?: boolean;
    className?: string;
  };

export function FormCheckbox<TFieldValues extends FieldValues>({
  name,
  control,
  rules,
  ...checkboxProps
}: FormCheckboxProps<TFieldValues>) {
  const { field, fieldState } = useController({ name, control, rules });

  return (
    <Checkbox
      {...checkboxProps}
      name={field.name}
      checked={Boolean(field.value)}
      onChange={(e) => field.onChange(e.target.checked)}
      onBlur={field.onBlur}
      ref={field.ref}
      error={fieldState.error?.message}
    />
  );
}
