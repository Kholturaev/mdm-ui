import { apiService } from '@shared/api';
import type { IResponse } from '@shared/api/type';
import type { ICharacteristicValue } from '@entities/characteristic/model/types';

export const addTagTypes = ['characteristic-group'] as const;

/**
 * Allowed values for a SELECT/RADIO/CHECKBOX characteristic. There's no
 * standalone "list values" query here — a characteristic's `values[]` always
 * comes embedded off `getCharacteristicGroupsByNomenclature`, so add/remove
 * just invalidate that one tag and let the tree/panel UI re-render with the
 * fresh embedded list.
 */
export const characteristicValueApiHooks = apiService
  .enhanceEndpoints({ addTagTypes })
  .injectEndpoints({
    endpoints: (build) => ({
      createCharacteristicValue: build.mutation<
        IResponse<ICharacteristicValue>,
        { characteristicId: number; value: string }
      >({
        query: (data) => ({
          path: '/characteristic-values',
          method: 'POST',
          body: data,
        }),
        invalidatesTags: ['characteristic-group'],
      }),

      deleteCharacteristicValue: build.mutation<IResponse<void>, number>({
        query: (id) => ({
          path: `/characteristic-values/${id}`,
          method: 'DELETE',
        }),
        invalidatesTags: ['characteristic-group'],
      }),
    }),
  });

export const {
  useCreateCharacteristicValueMutation,
  useDeleteCharacteristicValueMutation,
} = characteristicValueApiHooks;
