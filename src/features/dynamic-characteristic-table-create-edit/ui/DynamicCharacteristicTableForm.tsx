import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import type { CreateDynamicCharacteristicTablePayload } from '@entities/dynamic-characteristic/model/types';
import { Button } from '@shared/ui/Button';
import { FormInput } from '@shared/ui/form';

type DynamicCharacteristicTableFormProps = {
  characteristicGroupId: number;
  isSubmitting: boolean;
  onSubmit: (values: CreateDynamicCharacteristicTablePayload) => void;
  onCancel: () => void;
};

export function DynamicCharacteristicTableForm({
  characteristicGroupId,
  isSubmitting,
  onSubmit,
  onCancel,
}: DynamicCharacteristicTableFormProps) {
  const { t } = useTranslation();
  const { control, handleSubmit } = useForm<{ name: string }>({
    defaultValues: { name: '' },
  });

  return (
    <form
      onSubmit={handleSubmit((values) =>
        onSubmit({ ...values, characteristicGroupId }),
      )}
      className="flex flex-col gap-4"
    >
      <FormInput
        name="name"
        control={control}
        label={t('dynamicCharacteristic.tableName')}
        required
        rules={{ required: t('common.required') }}
      />

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {t('common.create')}
        </Button>
      </div>
    </form>
  );
}
