import { useController } from 'react-hook-form';
import type { FieldValues } from 'react-hook-form';
import { PhoneField } from '../Input';
import type { InputProps } from '../Input';
import type { FormFieldBaseProps } from './types';

type FormPhoneFieldProps<TFieldValues extends FieldValues> =
  FormFieldBaseProps<TFieldValues> &
    Omit<InputProps, 'name' | 'value' | 'onChange' | 'ref' | 'type'>;

export function FormPhoneField<TFieldValues extends FieldValues>({
  name,
  control,
  rules,
  ...inputProps
}: FormPhoneFieldProps<TFieldValues>) {
  const { field, fieldState } = useController({ name, control, rules });

  return (
    <PhoneField
      {...inputProps}
      name={field.name}
      value={field.value ?? ''}
      onChangeValue={field.onChange}
      onBlur={field.onBlur}
      ref={field.ref}
      error={fieldState.error?.message}
    />
  );
}
