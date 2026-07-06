import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type {
  IProductCategory,
  ProductCategoryFormValues,
} from '@entities/product-category/model/types';
import { toProductCategoryFormValues } from '@entities/product-category/model/mapping';
import { Button } from '@shared/ui/Button';
import { FormInput, FormTextarea } from '@shared/ui/form';

type ProductCategoryFormProps = {
  entity?: IProductCategory;
  isSubmitting: boolean;
  onSubmit: (values: ProductCategoryFormValues) => void;
  onCancel: () => void;
};

/** Reusable across the product form's "+ yana qo'shish" quick-create and a future dedicated category management page. */
export function ProductCategoryForm({
  entity,
  isSubmitting,
  onSubmit,
  onCancel,
}: ProductCategoryFormProps) {
  const { t } = useTranslation();
  const { control, handleSubmit, reset } = useForm<ProductCategoryFormValues>({
    defaultValues: toProductCategoryFormValues(entity),
  });

  useEffect(() => {
    reset(toProductCategoryFormValues(entity));
  }, [entity, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <FormInput
        name="name"
        control={control}
        label={t('productCategory.name')}
        required
        rules={{ required: t('common.required') }}
      />
      <FormTextarea
        name="description"
        control={control}
        label={t('productCategory.description')}
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
