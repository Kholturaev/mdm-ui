import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type {
  CharacteristicFormValues,
  CharacteristicType,
  ICharacteristic,
} from '@entities/characteristic/model/types';
import { Button } from '@shared/ui/Button';
import { FormInput, FormSelect, FormTextarea } from '@shared/ui/form';
import type { SelectOption } from '@shared/ui/Select';

const TYPE_OPTIONS: CharacteristicType[] = [
  'TEXT',
  'SELECT',
  'RADIO',
  'CHECKBOX',
];

type CharacteristicFormProps = {
  entity?: ICharacteristic;
  characteristicsGroupId: number;
  isSubmitting: boolean;
  onSubmit: (values: CharacteristicFormValues) => void;
  onCancel: () => void;
};

export function CharacteristicForm({
  entity,
  characteristicsGroupId,
  isSubmitting,
  onSubmit,
  onCancel,
}: CharacteristicFormProps) {
  const { t } = useTranslation();
  const { control, handleSubmit, reset } = useForm<CharacteristicFormValues>({
    defaultValues: {
      name: entity?.name ?? '',
      key: entity?.key ?? '',
      description: entity?.description ?? '',
      type: entity?.type ?? 'TEXT',
      characteristicsGroupId,
    },
  });

  useEffect(() => {
    reset({
      name: entity?.name ?? '',
      key: entity?.key ?? '',
      description: entity?.description ?? '',
      type: entity?.type ?? 'TEXT',
      characteristicsGroupId,
    });
  }, [entity, characteristicsGroupId, reset]);

  const typeOptions = useMemo<SelectOption[]>(
    () =>
      TYPE_OPTIONS.map((type) => ({
        label: t(`product.char.type.${type}`),
        value: type,
      })),
    [t],
  );

  return (
    <form
      onSubmit={handleSubmit((values) =>
        onSubmit({ ...values, characteristicsGroupId }),
      )}
      className="flex flex-col gap-4"
    >
      <FormInput
        name="name"
        control={control}
        label={t('characteristic.name')}
        required
        rules={{ required: t('common.required') }}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormInput
          name="key"
          control={control}
          label={t('characteristic.key')}
          required
          rules={{ required: t('common.required') }}
        />
        <FormSelect
          name="type"
          control={control}
          options={typeOptions}
          label={t('characteristic.type')}
          required
          rules={{ required: t('common.required') }}
        />
      </div>

      <FormTextarea
        name="description"
        control={control}
        label={t('characteristic.description')}
        rows={3}
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
