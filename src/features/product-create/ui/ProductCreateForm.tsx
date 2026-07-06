import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { ProductFormValues } from '@entities/product/model/types';
import { useTypeOfNomenclatureOptions } from '@entities/type-of-nomenclature/lib/useTypeOfNomenclatureOptions';
import { useUnitOptions } from '@entities/unit/lib/useUnitOptions';
import { Button } from '@shared/ui/Button';
import { FormInput, FormSelect } from '@shared/ui/form';

type ProductCreateFormProps = {
  isSubmitting: boolean;
  onSubmit: (values: ProductFormValues) => void;
  onCancel: () => void;
};

const EMPTY_VALUES: ProductFormValues = {
  name: '',
  article: '',
  sapCode: '',
  typeOfNomenclatureId: null,
  baseUnitId: null,
};

/** Required-fields-only create form — the rest of a product's general info is filled in later on its details page. */
export function ProductCreateForm({
  isSubmitting,
  onSubmit,
  onCancel,
}: ProductCreateFormProps) {
  const { t } = useTranslation();
  const { control, handleSubmit } = useForm<ProductFormValues>({
    defaultValues: EMPTY_VALUES,
  });

  const typeOfNomenclature = useTypeOfNomenclatureOptions();
  const unit = useUnitOptions();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <FormInput
        name="name"
        control={control}
        label={t('product.name')}
        required
        rules={{ required: t('common.required') }}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormInput
          name="sapCode"
          control={control}
          label={t('product.sapCode')}
          required
          rules={{ required: t('common.required') }}
        />
        <FormInput
          name="article"
          control={control}
          label={t('product.article')}
          required
          rules={{ required: t('common.required') }}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormSelect
          name="typeOfNomenclatureId"
          control={control}
          options={typeOfNomenclature.options}
          label={t('product.typeOfNomenclature')}
          required
          rules={{ required: t('common.required') }}
          isClearable
          isSearchable
          isLoading={typeOfNomenclature.isFetching}
          onInputChange={typeOfNomenclature.onInputChange}
        />
        <FormSelect
          name="baseUnitId"
          control={control}
          options={unit.options}
          label={t('product.baseUnit')}
          required
          rules={{ required: t('common.required') }}
          isClearable
          isSearchable
          isLoading={unit.isFetching}
          onInputChange={unit.onInputChange}
        />
      </div>

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
