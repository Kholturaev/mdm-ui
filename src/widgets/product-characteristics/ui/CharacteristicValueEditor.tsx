import { useTranslation } from 'react-i18next';
import type { ICharacteristic } from '@entities/characteristic/model/types';
import { Input } from '@shared/ui/Input';
import { Select } from '@shared/ui/Select';
import type { SelectOption } from '@shared/ui/Select';

/**
 * `value`/`onChange` are always string arrays for a uniform diff/save contract:
 *  - TEXT: at most one element, the free text
 *  - SELECT/RADIO/CHECKBOX: `charValueId`s (as strings) of the chosen options
 */
export function CharacteristicValueEditor({
  characteristic,
  value,
  onChange,
  disabled,
}: {
  characteristic: ICharacteristic;
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
}) {
  const { t } = useTranslation();

  if (characteristic.type === 'TEXT') {
    return (
      <Input
        size="sm"
        value={value[0] ?? ''}
        onChange={(e) => onChange(e.target.value ? [e.target.value] : [])}
        placeholder={t('product.char.textPlaceholder')}
        disabled={disabled}
      />
    );
  }

  const options: SelectOption[] = (characteristic.values ?? []).map((item) => ({
    label: item.value,
    value: item.id,
  }));
  const selected = options.filter((option) =>
    value.includes(String(option.value)),
  );

  return (
    <Select
      size="sm"
      isMulti
      isDisabled={disabled}
      options={options}
      value={selected}
      onChange={(next) => onChange((next ?? []).map((o) => String(o.value)))}
      placeholder={t('product.char.selectPlaceholder')}
      noOptionsMessage={() => t('common.noData')}
    />
  );
}
