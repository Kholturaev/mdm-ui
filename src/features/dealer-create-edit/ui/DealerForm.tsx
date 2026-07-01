import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useEffect, useMemo, useState } from 'react';
import type { DealerFormValues, IDealer } from '@entities/dealer/model/types';
import { toDealerFormValues } from '@entities/dealer/model/mapping';
import { useGetContractorsQuery } from '@entities/contractor/api/contractorApi';
import { useGetClientTypesQuery } from '@entities/client-type/api/clientTypeApi';
import { useGetRegionalBasesQuery } from '@entities/regional-base/api/regionalBaseApi';
import { useGetRegionsQuery } from '@entities/region/api/regionApi';
import { Button } from '@shared/ui/Button';
import { Checkbox } from '@shared/ui/Checkbox';
import type { SelectOption } from '@shared/ui/Select';
import { FormInput, FormSelect, FormTextarea } from '@shared/ui/form';
import { useDebouncedValue } from '@shared/lib/hooks/useDebouncedValue';

type DealerFormProps = {
  dealer?: IDealer;
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

  const [contractorSearch, setContractorSearch] = useState('');
  const [regionalBaseSearch, setRegionalBaseSearch] = useState('');
  const [regionSearch, setRegionSearch] = useState('');
  const debouncedContractorSearch = useDebouncedValue(contractorSearch);
  const debouncedRegionalBaseSearch = useDebouncedValue(regionalBaseSearch);
  const debouncedRegionSearch = useDebouncedValue(regionSearch);

  const { data: contractors, isFetching: isContractorsFetching } =
    useGetContractorsQuery({
      page: 0,
      size: 20,
      filters: debouncedContractorSearch
        ? { firstName: debouncedContractorSearch }
        : undefined,
    });
  const { data: clientTypes } = useGetClientTypesQuery({ page: 0, size: 50 });
  const { data: regionalBases, isFetching: isRegionalBasesFetching } =
    useGetRegionalBasesQuery({
      page: 0,
      size: 20,
      filters: debouncedRegionalBaseSearch
        ? { name: debouncedRegionalBaseSearch }
        : undefined,
    });
  const { data: regions, isFetching: isRegionsFetching } = useGetRegionsQuery({
    page: 0,
    size: 20,
    filters: debouncedRegionSearch
      ? { name: debouncedRegionSearch }
      : undefined,
  });

  const contractorOptions = useMemo<SelectOption[]>(
    () =>
      (contractors?.data.data ?? []).map((c) => ({
        label: `${c.firstName} ${c.lastName}`,
        value: c.id,
      })),
    [contractors],
  );
  const clientTypeOptions = useMemo<SelectOption[]>(
    () =>
      (clientTypes?.data.data ?? []).map((c) => ({
        label: c.name,
        value: c.id,
      })),
    [clientTypes],
  );
  const regionalBaseOptions = useMemo<SelectOption[]>(
    () =>
      (regionalBases?.data.data ?? []).map((r) => ({
        label: r.name,
        value: r.id,
      })),
    [regionalBases],
  );
  const regionOptions = useMemo<SelectOption[]>(
    () =>
      (regions?.data.data ?? []).map((r) => ({ label: r.name, value: r.id })),
    [regions],
  );

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
        <FormSelect
          name="clientTypeId"
          control={control}
          options={clientTypeOptions}
          label={t('dealer.clientType')}
          required
          rules={{ required: t('common.required') }}
          isClearable
          isSearchable
        />
      </div>

      <FormSelect
        name="counterAgentId"
        control={control}
        options={contractorOptions}
        label={t('dealer.counterAgent')}
        required
        rules={{ required: t('common.required') }}
        isClearable
        isSearchable
        isLoading={isContractorsFetching}
        onInputChange={setContractorSearch}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormSelect
          name="regionalBaseId"
          control={control}
          options={regionalBaseOptions}
          label={t('dealer.regionalBase')}
          required
          rules={{ required: t('common.required') }}
          isClearable
          isSearchable
          isLoading={isRegionalBasesFetching}
          onInputChange={setRegionalBaseSearch}
        />
        <FormSelect
          name="regionId"
          control={control}
          options={regionOptions}
          label={t('dealer.region')}
          isClearable
          isSearchable
          isLoading={isRegionsFetching}
          onInputChange={setRegionSearch}
        />
      </div>

      <Controller
        name="active"
        control={control}
        render={({ field: { value, onChange, onBlur, ref } }) => (
          <Checkbox
            label={t('dealer.active')}
            checked={value === 'ACTIVE'}
            onChange={(e) => onChange(e.target.checked ? 'ACTIVE' : 'INACTIVE')}
            onBlur={onBlur}
            ref={ref}
          />
        )}
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
