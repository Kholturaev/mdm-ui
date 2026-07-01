import { useController } from 'react-hook-form';
import type { FieldValues } from 'react-hook-form';
import { NumberInput } from '../Input';
import type { InputProps } from '../Input';
import type { FormFieldBaseProps } from './types';

type FormNumberInputProps<TFieldValues extends FieldValues> =
  FormFieldBaseProps<TFieldValues> &
    Omit<InputProps, 'name' | 'value' | 'onChange' | 'ref' | 'type'>;

export function FormNumberInput<TFieldValues extends FieldValues>({
  name,
  control,
  rules,
  ...inputProps
}: FormNumberInputProps<TFieldValues>) {
  const { field, fieldState } = useController({ name, control, rules });

  return (
    <NumberInput
      {...inputProps}
      name={field.name}
      value={field.value ?? null}
      onChangeValue={field.onChange}
      onBlur={field.onBlur}
      ref={field.ref}
      error={fieldState.error?.message}
    />
  );
}
