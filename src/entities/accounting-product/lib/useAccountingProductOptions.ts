import { useMemo, useState } from 'react';
import type { SelectOption } from '@shared/ui/Select';
import { useDebouncedValue } from '@shared/lib/hooks/useDebouncedValue';
import { useGetAccountingProductsQuery } from '../api/accountingProductApi';

/** Searchable options for the accounting-product select. */
export function useAccountingProductOptions() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const { data, isFetching } = useGetAccountingProductsQuery({
    page: 0,
    size: 50,
    filters: debouncedSearch ? { name: debouncedSearch } : undefined,
  });

  const options = useMemo<SelectOption[]>(
    () =>
      (data?.data.data ?? []).map((item) => ({
        label: item.name,
        value: item.id,
      })),
    [data],
  );

  return { options, isFetching, onInputChange: setSearch };
}
