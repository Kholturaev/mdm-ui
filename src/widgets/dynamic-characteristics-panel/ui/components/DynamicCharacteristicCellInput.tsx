import type { DynamicColumnDataType } from '@entities/dynamic-characteristic/model/types';
import { Checkbox } from '@shared/ui/Checkbox';
import { Input, NumberInput } from '@shared/ui/Input';
import { DatePicker } from '@shared/ui/DatePicker';

type DynamicCharacteristicCellInputProps = {
  dataType: DynamicColumnDataType;
  /** Raw string value as stored/sent to the API — `""` means empty regardless of data type. */
  value: string;
  onChange: (value: string) => void;
};

function parseCellDate(value: string): Date | null {
  if (!value) return null;
  const [year, month, day] = value.split('T')[0].split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

/** The API expects DATE values as a full ISO datetime string (e.g. "2026-02-09T19:00:00.000Z"), not a bare date. */
function formatCellDate(date: Date): string {
  return date.toISOString();
}

export function DynamicCharacteristicCellInput({
  dataType,
  value,
  onChange,
}: DynamicCharacteristicCellInputProps) {
  if (dataType === 'BOOLEAN') {
    return (
      <Checkbox
        size="sm"
        checked={value === 'true'}
        onChange={(e) => onChange(e.target.checked ? 'true' : 'false')}
      />
    );
  }

  if (dataType === 'NUMBER') {
    return (
      <NumberInput
        size="sm"
        value={value === '' ? null : Number(value)}
        onChangeValue={(next) => onChange(next === null ? '' : String(next))}
      />
    );
  }

  if (dataType === 'DATE') {
    return (
      <DatePicker
        size="sm"
        selected={parseCellDate(value)}
        onChange={(date: Date | null) =>
          onChange(date ? formatCellDate(date) : '')
        }
        isClearable
        popperProps={{ strategy: 'fixed' }}
      />
    );
  }

  return (
    <Input size="sm" value={value} onChange={(e) => onChange(e.target.value)} />
  );
}
