import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { IProductRate } from '@entities/product-rate/model/types';
import { useCurrencyOptions } from '@entities/currency/lib/useCurrencyOptions';
import { useUnitOptions } from '@entities/unit/lib/useUnitOptions';
import { Badge } from '@shared/ui/Badge';
import { Button } from '@shared/ui/Button';
import { Modal } from '@shared/ui/Modal';
import { FormDatePicker, FormPriceInput, FormSelect } from '@shared/ui/form';

export type EditRateSubmitValues = {
  amount: number;
  currencyId: number;
  altCurrencyId: number | null;
  unitId: number;
  date: string;
};

type EditRateFormValues = {
  amount: number | null;
  currencyId: number | null;
  altCurrencyId: number | null;
  unitId: number | null;
  date: Date | null;
};

export function EditRateModal({
  rate,
  isSubmitting,
  onSubmit,
  onClose,
}: {
  rate: IProductRate;
  isSubmitting: boolean;
  onSubmit: (values: EditRateSubmitValues) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const amountField = rate.type === 'SALES' ? 'rate' : 'cost';
  const amountLabel =
    rate.type === 'SALES'
      ? t('product.price.salesPrice')
      : t('product.price.purchasePrice');

  const { control, handleSubmit } = useForm<EditRateFormValues>({
    defaultValues: {
      amount: rate[amountField],
      currencyId: rate.currencyId,
      altCurrencyId: rate.altCurrencyId ?? null,
      unitId: rate.unitId,
      date: new Date(rate.date),
    },
  });

  const unit = useUnitOptions();
  const currency = useCurrencyOptions();

  const submit = handleSubmit((values) => {
    if (
      values.amount === null ||
      !values.currencyId ||
      !values.unitId ||
      !values.date
    ) {
      return;
    }
    onSubmit({
      amount: values.amount,
      currencyId: values.currencyId,

      altCurrencyId: values.altCurrencyId,
      unitId: values.unitId,
      date: values.date.toISOString(),
    });
  });

  return (
    <Modal isOpen onClose={onClose} title={t('product.price.editPrice')}>
      <div className="mb-3">
        <Badge variant={rate.type === 'SALES' ? 'success' : 'warning'}>
          {t(`product.price.type${rate.type}`)}
        </Badge>
      </div>

      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <FormPriceInput
            name="amount"
            control={control}
            label={amountLabel}
            required
            placeholder="0"
          />
          <FormSelect
            name="currencyId"
            control={control}
            options={currency.options}
            label={t('product.price.currency')}
            required
            isSearchable
            isLoading={currency.isFetching}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormSelect
            name="altCurrencyId"
            control={control}
            options={currency.options}
            label={t('product.price.altCurrency')}
            isClearable
            isSearchable
            isLoading={currency.isFetching}
          />
          <FormSelect
            name="unitId"
            control={control}
            options={unit.options}
            label={t('product.price.unitField')}
            required
            isSearchable
            isLoading={unit.isFetching}
            onInputChange={unit.onInputChange}
          />
        </div>

        <FormDatePicker
          name="date"
          control={control}
          label={t('product.price.effectiveDate')}
          required
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {t('common.save')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
