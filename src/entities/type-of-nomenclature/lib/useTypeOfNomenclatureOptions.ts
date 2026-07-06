import { useMemo, useState } from 'react';
import type { SelectOption } from '@shared/ui/Select';
import { useDebouncedValue } from '@shared/lib/hooks/useDebouncedValue';
import { useGetTypeOfNomenclaturesQuery } from '../api/typeOfNomenclatureApi';

/** Searchable options for the "type of nomenclature" select — shared by the product create form and the details page's general-info tab. */
export function useTypeOfNomenclatureOptions() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const { data, isFetching } = useGetTypeOfNomenclaturesQuery({
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
