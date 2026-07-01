import { useController } from 'react-hook-form';
import type { FieldValues } from 'react-hook-form';
import { Textarea } from '../Textarea';
import type { TextareaProps } from '../Textarea';
import type { FormFieldBaseProps } from './types';

type FormTextareaProps<TFieldValues extends FieldValues> =
  FormFieldBaseProps<TFieldValues> &
    Omit<TextareaProps, 'name' | 'value' | 'onChange' | 'ref'>;

export function FormTextarea<TFieldValues extends FieldValues>({
  name,
  control,
  rules,
  ...textareaProps
}: FormTextareaProps<TFieldValues>) {
  const { field, fieldState } = useController({ name, control, rules });

  return (
    <Textarea
      {...textareaProps}
      {...field}
      value={field.value ?? ''}
      error={fieldState.error?.message}
    />
  );
}
