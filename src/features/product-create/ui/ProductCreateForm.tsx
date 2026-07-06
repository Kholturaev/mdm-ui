import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { ProductFormValues } from '@entities/product/model/types';
import { useTypeOfNomenclatureOptions } from '@entities/type-of-nomenclature/lib/useTypeOfNomenclatureOptions';
import { useUnitOptions } from '@entities/unit/lib/useUnitOptions';
import { ProductReferenceModals } from '@features/product-reference-quick-create/ui/ProductReferenceModals';
import type { ProductReferenceType } from '@features/product-reference-quick-create/model/types';
import { Button } from '@shared/ui/Button';
import { AddMoreLink } from '@shared/ui/AddMoreLink';
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

const REFERENCE_FIELD_BY_TYPE: Record<
  ProductReferenceType,
  keyof ProductFormValues
> = {
  typeOfNomenclature: 'typeOfNomenclatureId',
  productGroup: 'productGroupId',
  category: 'categoryId',
  segment: 'segmentId',
  unit: 'baseUnitId',
};

/** Required-fields-only create form — the rest of a product's general info is filled in later on its details page. */
export function ProductCreateForm({
  isSubmitting,
  onSubmit,
  onCancel,
}: ProductCreateFormProps) {
  const { t } = useTranslation();
  const { control, handleSubmit, setValue } = useForm<ProductFormValues>({
    defaultValues: EMPTY_VALUES,
  });

  const typeOfNomenclature = useTypeOfNomenclatureOptions();
  const unit = useUnitOptions();

  const [activeReferenceModal, setActiveReferenceModal] =
    useState<ProductReferenceType | null>(null);

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
        <div className="flex flex-col gap-1">
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
          <AddMoreLink
            onClick={() => setActiveReferenceModal('typeOfNomenclature')}
          />
        </div>
        <div className="flex flex-col gap-1">
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
          <AddMoreLink onClick={() => setActiveReferenceModal('unit')} />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {t('common.create')}
        </Button>
      </div>

      <ProductReferenceModals
        activeModal={activeReferenceModal}
        onClose={() => setActiveReferenceModal(null)}
        onCreated={(type, id) =>
          setValue(REFERENCE_FIELD_BY_TYPE[type], id, { shouldDirty: true })
        }
      />
    </form>
  );
}
