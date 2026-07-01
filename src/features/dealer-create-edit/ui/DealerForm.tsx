import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import type { Dealer, DealerFormValues } from '@entities/dealer/model/types';
import { toDealerFormValues } from '@entities/dealer/model/mapping';
import { REGION_OPTIONS } from '@entities/dealer/model/regionOptions';
import { Button } from '@shared/ui/Button';
import {
  FormCheckbox,
  FormDatePicker,
  FormInput,
  FormNumberInput,
  FormPhoneField,
  FormSelect,
  FormTextarea,
} from '@shared/ui/form';

type DealerFormProps = {
  dealer?: Dealer;
  isSubmitting: boolean;
  onSubmit: (values: DealerFormValues) => void;
  onCancel: () => void;
};

export function DealerForm({
  dealer,
  isSubmitting,
  onSubmit,
  onCancel,
}: DealerFormProps) {
  const { t } = useTranslation();
  const { control, handleSubmit, reset } = useForm<DealerFormValues>({
    defaultValues: toDealerFormValues(dealer),
  });

  useEffect(() => {
    reset(toDealerFormValues(dealer));
  }, [dealer, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <FormInput
        name="name"
        control={control}
        label={t('dealer.name')}
        required
        rules={{ required: t('common.required') }}
      />

      <FormTextarea
        name="description"
        control={control}
        label={t('dealer.description')}
        rows={3}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormInput
          name="dealerCode"
          control={control}
          label={t('dealer.dealerCode')}
          required
          rules={{ required: t('common.required') }}
        />
        <FormNumberInput
          name="discountRate"
          control={control}
          label={t('dealer.discountRate')}
          min={0}
          max={100}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormDatePicker
          name="registeredAt"
          control={control}
          label={t('dealer.registeredAt')}
        />
        <FormPhoneField
          name="contactPhone"
          control={control}
          label={t('dealer.contactPhone')}
        />
      </div>

      <FormSelect
        name="regionId"
        control={control}
        options={REGION_OPTIONS}
        label={t('dealer.region')}
        isClearable
        isSearchable
      />

      <FormCheckbox
        name="active"
        control={control}
        label={t('dealer.active')}
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
