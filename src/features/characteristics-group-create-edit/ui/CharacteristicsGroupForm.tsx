import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type {
  CharacteristicsGroupFormValues,
  ICharacteristicsGroup,
} from '@entities/characteristic-group/model/types';
import { Button } from '@shared/ui/Button';
import { FormInput, FormTextarea } from '@shared/ui/form';

type CharacteristicsGroupFormProps = {
  entity?: ICharacteristicsGroup;
  typeOfNomenclatureId: number;
  isSubmitting: boolean;
  onSubmit: (values: CharacteristicsGroupFormValues) => void;
  onCancel: () => void;
};

export function CharacteristicsGroupForm({
  entity,
  typeOfNomenclatureId,
  isSubmitting,
  onSubmit,
  onCancel,
}: CharacteristicsGroupFormProps) {
  const { t } = useTranslation();
  const { control, handleSubmit, reset } =
    useForm<CharacteristicsGroupFormValues>({
      defaultValues: {
        name: entity?.name ?? '',
        description: entity?.description ?? '',
        typeOfNomenclatureId,
      },
    });

  useEffect(() => {
    reset({
      name: entity?.name ?? '',
      description: entity?.description ?? '',
      typeOfNomenclatureId,
    });
  }, [entity, typeOfNomenclatureId, reset]);

  return (
    <form
      onSubmit={handleSubmit((values) =>
        onSubmit({ ...values, typeOfNomenclatureId }),
      )}
      className="flex flex-col gap-4"
    >
      <FormInput
        name="name"
        control={control}
        label={t('characteristicsGroup.name')}
        required
        rules={{ required: t('common.required') }}
      />
      <FormTextarea
        name="description"
        control={control}
        label={t('characteristicsGroup.description')}
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
