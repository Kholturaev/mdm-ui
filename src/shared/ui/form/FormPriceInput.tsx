import { useController } from 'react-hook-form';
import type { FieldValues } from 'react-hook-form';
import { PriceInput } from '../Input';
import type { InputProps } from '../Input';
import type { FormFieldBaseProps } from './types';

type FormPriceInputProps<TFieldValues extends FieldValues> =
  FormFieldBaseProps<TFieldValues> &
    Omit<InputProps, 'name' | 'value' | 'onChange' | 'ref' | 'type'>;

export function FormPriceInput<TFieldValues extends FieldValues>({
  name,
  control,
  rules,
  ...inputProps
}: FormPriceInputProps<TFieldValues>) {
  const { field, fieldState } = useController({ name, control, rules });

  return (
    <PriceInput
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
