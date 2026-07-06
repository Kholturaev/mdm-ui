import { useMemo, useState } from 'react';
import type { SelectOption } from '@shared/ui/Select';
import { useDebouncedValue } from '@shared/lib/hooks/useDebouncedValue';
import { useGetProductCategoriesQuery } from '../api/productCategoryApi';

/** Searchable options for the product category select. */
export function useProductCategoryOptions() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const { data, isFetching } = useGetProductCategoriesQuery({
    page: 0,
    size: 50,
    filters: debouncedSearch ? { name: debouncedSearch } : undefined,
  });

  const options = useMemo<SelectOption[]>(
    () =>
      (data?.data.data ?? []).map((category) => ({
        label: category.name,
        value: category.id,
      })),
    [data],
  );

  return { options, isFetching, onInputChange: setSearch };
}
