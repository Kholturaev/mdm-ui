import { useMemo } from 'react';
import type { SelectOption } from '@shared/ui/Select';
import { useGetCurrenciesQuery } from '../api/currencyApi';

/** Currencies are few enough to list in full — no search/pagination needed, unlike unit/category pickers. */
export function useCurrencyOptions() {
  const { data, isFetching } = useGetCurrenciesQuery({ page: 0, size: 100 });

  const options = useMemo<SelectOption[]>(
    () =>
      (data?.data.data ?? []).map((currency) => ({
        label: `${currency.name} (${currency.symbol})`,
        value: currency.id,
      })),
    [data],
  );

  return { options, isFetching };
}
