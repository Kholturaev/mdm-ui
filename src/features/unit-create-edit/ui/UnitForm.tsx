import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { IUnit, UnitFormValues } from '@entities/unit/model/types';
import { toUnitFormValues } from '@entities/unit/model/mapping';
import { Button } from '@shared/ui/Button';
import { FormInput, FormNumberInput } from '@shared/ui/form';

type UnitFormProps = {
  entity?: IUnit;
  isSubmitting: boolean;
  onSubmit: (values: UnitFormValues) => void;
  onCancel: () => void;
};

/** Reusable across the product form's "+ yana qo'shish" quick-create and a future dedicated unit management page. */
export function UnitForm({
  entity,
  isSubmitting,
  onSubmit,
  onCancel,
}: UnitFormProps) {
  const { t } = useTranslation();
  const { control, handleSubmit, reset } = useForm<UnitFormValues>({
    defaultValues: toUnitFormValues(entity),
  });

  useEffect(() => {
    reset(toUnitFormValues(entity));
  }, [entity, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <FormInput
        name="name"
        control={control}
        label={t('unit.name')}
        required
        rules={{ required: t('common.required') }}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormNumberInput
          name="code"
          control={control}
          label={t('unit.code')}
          required
          rules={{ required: t('common.required') }}
        />
        <FormInput
          name="symbol"
          control={control}
          label={t('unit.symbol')}
          required
          rules={{ required: t('common.required') }}
        />
      </div>

      <FormInput
        name="internationalAbbreviation"
        control={control}
        label={t('unit.internationalAbbreviation')}
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
