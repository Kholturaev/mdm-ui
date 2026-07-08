import { useController } from 'react-hook-form';
import type { FieldValues } from 'react-hook-form';
import type { ReactNode } from 'react';
import { Select } from '../Select';
import type { SelectOption } from '../Select';
import type { FormFieldBaseProps } from './types';
import type { ControlSize } from '../types';

type FormMultiSelectProps<
  TFieldValues extends FieldValues,
  Option extends SelectOption,
> = FormFieldBaseProps<TFieldValues> & {
  options: Option[];
  label?: string;
  helperText?: string;
  placeholder?: string;
  required?: boolean;
  isClearable?: boolean;
  isSearchable?: boolean;
  isLoading?: boolean;
  isDisabled?: boolean;
  size?: ControlSize;
  onInputChange?: (value: string) => void;
  formatOptionLabel?: (option: Option) => ReactNode;
};

/** Multi-select bound to a form field: form value is an array of the chosen options' `value`s. */
export function FormMultiSelect<
  TFieldValues extends FieldValues,
  Option extends SelectOption,
>({
  name,
  control,
  rules,
  options,
  ...selectProps
}: FormMultiSelectProps<TFieldValues, Option>) {
  const { field, fieldState } = useController({ name, control, rules });
  const values: Array<string | number> = field.value ?? [];
  const selected = options.filter((option) => values.includes(option.value));

  return (
    <Select<Option, true>
      {...selectProps}
      isMulti
      name={field.name}
      options={options}
      value={selected}
      onChange={(nextOptions) =>
        field.onChange((nextOptions ?? []).map((option) => option.value))
      }
      onBlur={field.onBlur}
      error={fieldState.error?.message}
    />
  );
}
