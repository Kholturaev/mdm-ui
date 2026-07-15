import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type {
  ICurrency,
  CurrencyFormValues,
} from '@entities/currency/model/types';
import {
  toCurrencyFormValues,
  toCurrencyPayload,
  type CurrencyFormInputValues,
} from '@entities/currency/model/mapping';
import { Button } from '@shared/ui/Button';
import { FormInput, FormDatePicker } from '@shared/ui/form';

type CurrencyFormProps = {
  entity?: ICurrency;
  isSubmitting: boolean;
  onSubmit: (values: CurrencyFormValues) => void;
  onCancel: () => void;
};

/** `currencyDate` is required only on create — editing an existing currency doesn't force re-picking it. */
export function CurrencyForm({
  entity,
  isSubmitting,
  onSubmit,
  onCancel,
}: CurrencyFormProps) {
  const { t } = useTranslation();
  const { control, handleSubmit, reset } = useForm<CurrencyFormInputValues>({
    defaultValues: toCurrencyFormValues(entity),
  });

  useEffect(() => {
    reset(toCurrencyFormValues(entity));
  }, [entity, reset]);

  const submit = handleSubmit((values) => {
    onSubmit(toCurrencyPayload(values));
  });

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <FormInput
        name="name"
        control={control}
        label={t('currency.name')}
        required
        rules={{ required: t('common.required') }}
      />

      <FormInput
        name="symbol"
        control={control}
        label={t('currency.symbol')}
        required
        rules={{ required: t('common.required') }}
      />

      <FormDatePicker
        name="currencyDate"
        control={control}
        label={t('currency.date')}
        required={!entity}
        rules={{ required: !entity ? t('common.required') : false }}
        minDate={!entity ? new Date() : undefined}
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
