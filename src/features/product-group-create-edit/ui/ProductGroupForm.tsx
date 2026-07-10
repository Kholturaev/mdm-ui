import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type {
  IProductGroup,
  ProductGroupFormValues,
} from '@entities/product-group/model/types';
import { toProductGroupFormValues } from '@entities/product-group/model/mapping';
import { Button } from '@shared/ui/Button';
import { FormInput, FormTextarea } from '@shared/ui/form';

type ProductGroupFormProps = {
  entity?: IProductGroup;
  isSubmitting: boolean;
  onSubmit: (values: ProductGroupFormValues) => void;
  onCancel: () => void;
};

/** Reusable across the product form's "+ yana qo'shish" quick-create and a future dedicated product-group management page. Parent-group nesting isn't wired up here — a quick-create only needs the essentials. */
export function ProductGroupForm({
  entity,
  isSubmitting,
  onSubmit,
  onCancel,
}: ProductGroupFormProps) {
  const { t } = useTranslation();
  const { control, handleSubmit, reset } = useForm<ProductGroupFormValues>({
    defaultValues: toProductGroupFormValues(entity),
  });

  useEffect(() => {
    reset(toProductGroupFormValues(entity));
  }, [entity, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <FormInput
        name="name"
        control={control}
        label={t('productGroup.name')}
        required
        rules={{ required: t('common.required') }}
      />
      <FormInput
        name="code"
        control={control}
        label={t('productGroup.code')}
        required
        rules={{ required: t('common.required') }}
      />
      <FormTextarea
        name="description"
        control={control}
        label={t('productGroup.description')}
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
