import { useMemo, useState } from 'react';
import type { SelectOption } from '@shared/ui/Select';
import { useDebouncedValue } from '@shared/lib/hooks/useDebouncedValue';
import { useGetSegmentsQuery } from '../api/segmentApi';

/** Searchable options for the segment select. */
export function useSegmentOptions() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const { data, isFetching } = useGetSegmentsQuery({
    page: 0,
    size: 50,
    filters: debouncedSearch ? { name: debouncedSearch } : undefined,
  });

  const options = useMemo<SelectOption[]>(
    () =>
      (data?.data.data ?? []).map((segment) => ({
        label: segment.name,
        value: segment.id,
      })),
    [data],
  );

  return { options, isFetching, onInputChange: setSearch };
}
