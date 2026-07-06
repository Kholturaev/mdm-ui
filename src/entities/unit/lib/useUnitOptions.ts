import { useMemo, useState } from 'react';
import type { SelectOption } from '@shared/ui/Select';
import { useDebouncedValue } from '@shared/lib/hooks/useDebouncedValue';
import { useGetUnitsQuery } from '../api/unitApi';

/** Searchable options for the base-unit select — shared by the product create form and the details page's general-info tab. */
export function useUnitOptions() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const { data, isFetching } = useGetUnitsQuery({
    page: 0,
    size: 50,
    filters: debouncedSearch ? { name: debouncedSearch } : undefined,
  });

  const options = useMemo<SelectOption[]>(
    () =>
      (data?.data.data ?? []).map((unit) => ({
        label: unit.name,
        value: unit.id,
      })),
    [data],
  );

  return { options, isFetching, onInputChange: setSearch };
}
