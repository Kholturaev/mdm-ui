import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type {
  IProductAttribute,
  ProductAttributeFormValues,
} from '@entities/product-attribute/model/types';
import { useGetExternalSystemsQuery } from '@entities/external-system/api/externalSystemApi';
import { Button } from '@shared/ui/Button';
import { FormInput, FormSelect } from '@shared/ui/form';
import type { SelectOption } from '@shared/ui/Select';

type ProductAttributeFormProps = {
  productId: number;
  attribute?: IProductAttribute;
  isSubmitting: boolean;
  onSubmit: (values: ProductAttributeFormValues) => void;
  onCancel: () => void;
};

function toFormValues(
  productId: number,
  attribute?: IProductAttribute,
): ProductAttributeFormValues {
  return {
    name: attribute?.name ?? '',
    key: attribute?.key ?? '',
    value: attribute?.value ?? '',
    productId,
    externalSystemId: attribute?.externalSystemId ?? null,
  };
}

export function ProductAttributeForm({
  productId,
  attribute,
  isSubmitting,
  onSubmit,
  onCancel,
}: ProductAttributeFormProps) {
  const { t } = useTranslation();
  const { control, handleSubmit, reset } = useForm<ProductAttributeFormValues>({
    defaultValues: toFormValues(productId, attribute),
  });

  useEffect(() => {
    reset(toFormValues(productId, attribute));
  }, [productId, attribute, reset]);

  const { data: externalSystemsData } = useGetExternalSystemsQuery({
    page: 0,
    size: 100,
  });
  const externalSystemOptions = useMemo<SelectOption[]>(
    () =>
      (externalSystemsData?.data?.data ?? []).map((system) => ({
        label: system.name,
        value: system.id,
      })),
    [externalSystemsData],
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <FormInput
        name="name"
        control={control}
        label={t('product.attr.name')}
        required
        rules={{ required: t('common.required') }}
      />
      <FormInput
        name="key"
        control={control}
        label={t('product.attr.key')}
        required
        rules={{ required: t('common.required') }}
      />
      <FormInput
        name="value"
        control={control}
        label={t('product.attr.value')}
        required
        rules={{ required: t('common.required') }}
      />
      <FormSelect
        name="externalSystemId"
        control={control}
        options={externalSystemOptions}
        label={t('product.attr.externalSystem')}
        isClearable
        isSearchable
      />

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {t('common.save')}
        </Button>
      </div>
    </form>
  );
}
