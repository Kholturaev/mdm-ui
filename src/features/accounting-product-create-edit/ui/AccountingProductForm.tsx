import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type {
  IAccountingProduct,
  AccountingProductFormValues,
} from '@entities/accounting-product/model/types';
import { toAccountingProductFormValues } from '@entities/accounting-product/model/mapping';
import { Button } from '@shared/ui/Button';
import { FormInput, FormTextarea } from '@shared/ui/form';

type AccountingProductFormProps = {
  entity?: IAccountingProduct;
  isSubmitting: boolean;
  onSubmit: (values: AccountingProductFormValues) => void;
  onCancel: () => void;
};

export function AccountingProductForm({
  entity,
  isSubmitting,
  onSubmit,
  onCancel,
}: AccountingProductFormProps) {
  const { t } = useTranslation();
  const { control, handleSubmit, reset } = useForm<AccountingProductFormValues>(
    {
      defaultValues: toAccountingProductFormValues(entity),
    },
  );

  useEffect(() => {
    reset(toAccountingProductFormValues(entity));
  }, [entity, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <FormInput
        name="name"
        control={control}
        label={t('accountingProduct.name')}
        required
        rules={{ required: t('common.required') }}
      />

      <FormTextarea
        name="description"
        control={control}
        label={t('accountingProduct.description')}
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
