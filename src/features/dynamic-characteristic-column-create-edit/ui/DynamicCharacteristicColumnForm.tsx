import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type {
  CreateOrUpdateDynamicCharacteristicColumnPayload,
  DynamicColumnDataType,
  IDynamicCharacteristicColumn,
} from '@entities/dynamic-characteristic/model/types';
import { Button } from '@shared/ui/Button';
import { FormCheckbox, FormInput, FormSelect } from '@shared/ui/form';
import type { SelectOption } from '@shared/ui/Select';

const DATA_TYPE_OPTIONS: DynamicColumnDataType[] = [
  'STRING',
  'NUMBER',
  'BOOLEAN',
  'DATE',
];

type ColumnFormValues = {
  name: string;
  key: string;
  dataType: DynamicColumnDataType;
  required: boolean;
};

type DynamicCharacteristicColumnFormProps = {
  entity?: IDynamicCharacteristicColumn;
  tableId: number;
  position: number;
  isSubmitting: boolean;
  onSubmit: (values: CreateOrUpdateDynamicCharacteristicColumnPayload) => void;
  onCancel: () => void;
};

export function DynamicCharacteristicColumnForm({
  entity,
  tableId,
  position,
  isSubmitting,
  onSubmit,
  onCancel,
}: DynamicCharacteristicColumnFormProps) {
  const { t } = useTranslation();
  const { control, handleSubmit, reset } = useForm<ColumnFormValues>({
    defaultValues: {
      name: entity?.name ?? '',
      key: entity?.key ?? '',
      dataType: entity?.dataType ?? 'STRING',
      required: entity?.required ?? false,
    },
  });

  useEffect(() => {
    reset({
      name: entity?.name ?? '',
      key: entity?.key ?? '',
      dataType: entity?.dataType ?? 'STRING',
      required: entity?.required ?? false,
    });
  }, [entity, reset]);

  const dataTypeOptions = useMemo<SelectOption[]>(
    () =>
      DATA_TYPE_OPTIONS.map((type) => ({
        label: t(`dynamicCharacteristic.dataType.${type}`),
        value: type,
      })),
    [t],
  );

  return (
    <form
      onSubmit={handleSubmit((values) =>
        onSubmit({
          ...values,
          id: entity?.id,
          tableId,
          position: entity?.position ?? position,
        }),
      )}
      className="flex flex-col gap-4"
    >
      <FormInput
        name="name"
        control={control}
        label={t('dynamicCharacteristic.columnName')}
        required
        rules={{ required: t('common.required') }}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormInput
          name="key"
          control={control}
          label={t('dynamicCharacteristic.columnKey')}
          required
          rules={{ required: t('common.required') }}
        />
        <FormSelect
          name="dataType"
          control={control}
          options={dataTypeOptions}
          label={t('dynamicCharacteristic.columnDataType')}
          required
          rules={{ required: t('common.required') }}
        />
      </div>

      <FormCheckbox
        name="required"
        control={control}
        label={t('dynamicCharacteristic.columnRequired')}
      />

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {entity ? t('common.update') : t('common.create')}
        </Button>
      </div>
    </form>
  );
}
