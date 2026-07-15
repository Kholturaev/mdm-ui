import { useMemo } from 'react';
import type { SelectOption } from '@shared/ui/Select';
import { useGetExternalSystemsQuery } from '../api/externalSystemApi';

/** External systems are few enough to list in full — no search/pagination needed, unlike unit/category pickers. */
export function useExternalSystemOptions() {
  const { data, isFetching } = useGetExternalSystemsQuery({
    page: 0,
    size: 200,
  });

  const options = useMemo<SelectOption[]>(
    () =>
      (data?.data.data ?? []).map((system) => ({
        label: system.name,
        value: system.id,
      })),
    [data],
  );

  return { options, isFetching };
}
