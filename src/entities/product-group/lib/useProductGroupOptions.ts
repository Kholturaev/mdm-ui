import { useMemo, useState } from 'react';
import type { SelectOption } from '@shared/ui/Select';
import { useDebouncedValue } from '@shared/lib/hooks/useDebouncedValue';
import { useGetProductGroupsQuery } from '../api/productGroupApi';

/** Searchable options for the product group select. */
export function useProductGroupOptions() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const { data, isFetching } = useGetProductGroupsQuery({
    page: 0,
    size: 50,
    filters: debouncedSearch ? { name: debouncedSearch } : undefined,
  });

  const options = useMemo<SelectOption[]>(
    () =>
      (data?.data.data ?? []).map((group) => ({
        label: group.name,
        value: group.id,
      })),
    [data],
  );

  return { options, isFetching, onInputChange: setSearch };
}
