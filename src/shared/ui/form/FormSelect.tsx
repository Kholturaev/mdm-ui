import { useController } from 'react-hook-form';
import type { FieldValues } from 'react-hook-form';
import { Select } from '../Select';
import type { SelectOption } from '../Select';
import type { FormFieldBaseProps } from './types';
import type { ControlSize } from '../types';

type FormSelectProps<
  TFieldValues extends FieldValues,
  Option extends SelectOption,
> = FormFieldBaseProps<TFieldValues> & {
  options: Option[];
  label?: string;
  placeholder?: string;
  required?: boolean;
  isClearable?: boolean;
  isSearchable?: boolean;
  isLoading?: boolean;
  isDisabled?: boolean;
  size?: ControlSize;
  onInputChange?: (value: string) => void;
};

/** Single-select bound to a form field: form value is the option's `value`, not the option object. */
export function FormSelect<
  TFieldValues extends FieldValues,
  Option extends SelectOption,
>({
  name,
  control,
  rules,
  options,
  ...selectProps
}: FormSelectProps<TFieldValues, Option>) {
  const { field, fieldState } = useController({ name, control, rules });
  const selected =
    options.find((option) => option.value === field.value) ?? null;

  return (
    <Select<Option>
      {...selectProps}
      name={field.name}
      options={options}
      value={selected}
      onChange={(option) => field.onChange(option ? option.value : null)}
      onBlur={field.onBlur}
      error={fieldState.error?.message}
    />
  );
}
