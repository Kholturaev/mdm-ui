import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { IClientType } from '@entities/client-type/model/types';
import { useCurrencyOptions } from '@entities/currency/lib/useCurrencyOptions';
import { useUnitOptions } from '@entities/unit/lib/useUnitOptions';
import { Button } from '@shared/ui/Button';
import { Modal } from '@shared/ui/Modal';
import { Tabs } from '@shared/ui/Tabs/Tabs';
import { FormDatePicker, FormPriceInput, FormSelect } from '@shared/ui/form';
import { ShoppingCartIcon } from '@shared/ui/icons/ShoppingCartIcon';
import { TagIcon } from '@shared/ui/icons/TagIcon';
import { CopyStackIcon } from '@shared/ui/icons/CopyStackIcon';

export type CreateRateTab = 'PURCHASE' | 'SALES' | 'PAIR';

export type CreateRateSubmitValues = {
  amount: number;
  currencyId: number;
  altCurrencyId: number | null;
  unitId: number;
  date: string;
};

type CreateRateFormValues = {
  amount: number | null;
  currencyId: number | null;
  altCurrencyId: number | null;
  unitId: number | null;
  date: Date | null;
};

const DEFAULT_VALUES: CreateRateFormValues = {
  amount: null,
  currencyId: null,
  altCurrencyId: null,
  unitId: null,
  date: new Date(),
};

export function CreateRateModal({
  clientType,
  initialTab,
  isSubmitting,
  onSubmit,
  onClose,
}: {
  clientType: IClientType;
  initialTab: CreateRateTab;
  isSubmitting: boolean;
  onSubmit: (tab: CreateRateTab, values: CreateRateSubmitValues) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<CreateRateTab>(initialTab);
  const [formError, setFormError] = useState<string | null>(null);

  const { control, handleSubmit } = useForm<CreateRateFormValues>({
    defaultValues: DEFAULT_VALUES,
  });

  const unit = useUnitOptions();
  const currency = useCurrencyOptions();

  const amountLabel =
    activeTab === 'PURCHASE'
      ? t('product.price.purchasePrice')
      : activeTab === 'SALES'
        ? t('product.price.salesPrice')
        : t('product.price.samePrice');

  const submit = handleSubmit((values) => {
    if (
      values.amount === null ||
      !values.currencyId ||
      !values.unitId ||
      !values.date
    ) {
      setFormError(t('common.required'));
      return;
    }
    setFormError(null);
    onSubmit(activeTab, {
      amount: values.amount,
      currencyId: values.currencyId,
      altCurrencyId: values.altCurrencyId,
      unitId: values.unitId,
      date: values.date.toISOString(),
    });
  });

  return (
    <Modal isOpen onClose={onClose} title={t('product.price.addPrice')}>
      <Tabs
        className="mb-4"
        items={[
          {
            key: 'PURCHASE',
            label: t('product.price.purchase'),
            icon: <ShoppingCartIcon size={14} />,
          },
          {
            key: 'SALES',
            label: t('product.price.sales'),
            icon: <TagIcon size={14} />,
          },
          {
            key: 'PAIR',
            label: t('product.price.samePriceTab'),
            icon: <CopyStackIcon size={14} />,
          },
        ]}
        value={activeTab}
        onChange={(key) => setActiveTab(key as CreateRateTab)}
      />

      <p className="text-fg-muted mb-3 text-xs">
        {t('product.price.clientType')}:{' '}
        <span className="text-fg font-medium">{clientType.name}</span>
      </p>

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

        {formError && <p className="text-danger text-xs">{formError}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {t('product.price.add')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
