import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type {
  ITypeOfNomenclature,
  TypeOfNomenclatureFormValues,
} from '@entities/type-of-nomenclature/model/types';
import { toTypeOfNomenclatureFormValues } from '@entities/type-of-nomenclature/model/mapping';
import { Button } from '@shared/ui/Button';
import { FormInput, FormTextarea } from '@shared/ui/form';

type TypeOfNomenclatureFormProps = {
  entity?: ITypeOfNomenclature;
  isSubmitting: boolean;
  onSubmit: (values: TypeOfNomenclatureFormValues) => void;
  onCancel: () => void;
};

/** Reusable across the product form's "+ yana qo'shish" quick-create and a future dedicated type-of-nomenclature management page. */
export function TypeOfNomenclatureForm({
  entity,
  isSubmitting,
  onSubmit,
  onCancel,
}: TypeOfNomenclatureFormProps) {
  const { t } = useTranslation();
  const { control, handleSubmit, reset } =
    useForm<TypeOfNomenclatureFormValues>({
      defaultValues: toTypeOfNomenclatureFormValues(entity),
    });

  useEffect(() => {
    reset(toTypeOfNomenclatureFormValues(entity));
  }, [entity, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <FormInput
        name="name"
        control={control}
        label={t('typeOfNomenclature.name')}
        required
        rules={{ required: t('common.required') }}
      />
      <FormTextarea
        name="description"
        control={control}
        label={t('typeOfNomenclature.description')}
        rows={3}
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
