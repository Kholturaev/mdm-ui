import { useId } from 'react';
import ReactSelect, { components } from 'react-select';
import type { GroupBase, Props as ReactSelectProps } from 'react-select';
import { cn } from '@shared/lib/cn';
import { FieldShell } from '../Field';
import { Spinner } from '../Spinner';
import { ChevronDownIcon, CloseIcon } from '../icons/ChevronDownIcon';
import type { ControlSize } from '../types';

export type SelectOption = { label: string; value: string | number };

type SelectProps<
  Option extends SelectOption,
  IsMulti extends boolean = false,
> = Omit<
  ReactSelectProps<Option, IsMulti, GroupBase<Option>>,
  'unstyled' | 'classNames' | 'components'
> & {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  size?: ControlSize;
  containerClassName?: string;
};

const CONTROL_HEIGHT: Record<ControlSize, string> = {
  sm: 'min-h-8',
  md: 'min-h-9',
  lg: 'min-h-11',
};

export function Select<
  Option extends SelectOption,
  IsMulti extends boolean = false,
>({
  label,
  error,
  helperText,
  required,
  size = 'md',
  containerClassName,
  isDisabled,
  ...rest
}: SelectProps<Option, IsMulti>) {
  const generatedId = useId();
  const inputId = rest.inputId ?? generatedId;

  return (
    <FieldShell
      id={inputId}
      label={label}
      required={required}
      error={error}
      helperText={helperText}
      className={containerClassName}
    >
      <ReactSelect<Option, IsMulti, GroupBase<Option>>
        inputId={inputId}
        unstyled
        isDisabled={isDisabled}
        classNames={{
          control: ({ isFocused }) =>
            cn(
              'w-full rounded border bg-surface px-2.5 text-sm transition-colors',
              CONTROL_HEIGHT[size],
              isFocused
                ? 'border-primary ring-2 ring-primary/20'
                : 'border-border',
              error && 'border-danger',
              isDisabled && 'bg-disabled-bg cursor-not-allowed',
            ),
          placeholder: () => 'text-fg-muted',
          input: () => 'text-fg',
          singleValue: () => 'text-fg',
          multiValue: () =>
            'bg-surface-hover rounded-sm px-1.5 py-0.5 gap-1 flex items-center',
          multiValueLabel: () => 'text-fg text-xs',
          multiValueRemove: () =>
            'text-fg-muted hover:text-danger cursor-pointer',
          valueContainer: () => 'gap-1 py-1',
          indicatorsContainer: () => 'gap-1',
          indicatorSeparator: () => 'hidden',
          dropdownIndicator: () => 'text-fg-muted',
          clearIndicator: () =>
            'text-fg-muted hover:text-danger cursor-pointer',
          menu: () =>
            'mt-1 rounded border border-border bg-surface shadow-lg overflow-hidden z-20',
          menuList: () => 'py-1 max-h-60 overflow-auto',
          noOptionsMessage: () => 'text-fg-muted text-sm py-2 text-center',
          loadingMessage: () => 'text-fg-muted text-sm py-2 text-center',
          option: ({ isFocused, isSelected }) =>
            cn(
              'px-3 py-2 text-sm cursor-pointer',
              isSelected && 'bg-primary text-primary-foreground',
              !isSelected && isFocused && 'bg-surface-hover',
            ),
        }}
        components={{
          DropdownIndicator: (props) => (
            <components.DropdownIndicator {...props}>
              <ChevronDownIcon />
            </components.DropdownIndicator>
          ),
          ClearIndicator: (props) => (
            <components.ClearIndicator {...props}>
              <CloseIcon size={12} />
            </components.ClearIndicator>
          ),
          LoadingIndicator: () => <Spinner className="size-4" />,
        }}
        {...rest}
      />
    </FieldShell>
  );
}
