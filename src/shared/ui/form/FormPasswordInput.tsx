import { useController } from 'react-hook-form';
import type { FieldValues } from 'react-hook-form';
import { PasswordInput } from '../Input';
import type { InputProps } from '../Input';
import type { FormFieldBaseProps } from './types';

type FormPasswordInputProps<TFieldValues extends FieldValues> =
  FormFieldBaseProps<TFieldValues> &
    Omit<InputProps, 'name' | 'value' | 'onChange' | 'ref' | 'type'>;

export function FormPasswordInput<TFieldValues extends FieldValues>({
  name,
  control,
  rules,
  ...inputProps
}: FormPasswordInputProps<TFieldValues>) {
  const { field, fieldState } = useController({ name, control, rules });

  return (
    <PasswordInput
      {...inputProps}
      {...field}
      value={field.value ?? ''}
      error={fieldState.error?.message}
    />
  );
}
