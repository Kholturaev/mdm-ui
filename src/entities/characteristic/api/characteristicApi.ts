import { apiService } from '@shared/api';
import type { IResponse } from '@shared/api/type';
import type { CharacteristicFormValues, ICharacteristic } from '../model/types';

export const addTagTypes = ['characteristic', 'characteristic-group'] as const;

/** The backend rejects a blank `description` (`""`), so omit it entirely rather than sending an empty string. */
function buildCharacteristicBody(data: CharacteristicFormValues) {
  const { description, ...rest } = data;
  return {
    ...rest,
    ...(description?.trim() ? { description: description.trim() } : {}),
  };
}

/**
 * A characteristic's own list is never fetched standalone in this app — the
 * tree/panel UI (and the product details tab) always reads the embedded
 * `characteristics[]` off `getCharacteristicGroupsByNomenclature`, tagged
 * `characteristic-group`. So these mutations invalidate BOTH tags: their own,
 * plus `characteristic-group` so that embedded list (and its values-count
 * badge) refreshes too.
 */
export const characteristicApiHooks = apiService
  .enhanceEndpoints({ addTagTypes })
  .injectEndpoints({
    endpoints: (build) => ({
      createCharacteristic: build.mutation<
        IResponse<ICharacteristic>,
        CharacteristicFormValues
      >({
        query: (data) => ({
          path: '/characteristics',
          method: 'POST',
          body: { ...buildCharacteristicBody(data), values: [] },
        }),
        invalidatesTags: ['characteristic', 'characteristic-group'],
      }),

      updateCharacteristic: build.mutation<
        IResponse<ICharacteristic>,
        { id: number; data: CharacteristicFormValues }
      >({
        query: ({ id, data }) => ({
          path: `/characteristics/${id}`,
          method: 'PUT',
          body: { ...buildCharacteristicBody(data), values: [] },
        }),
        invalidatesTags: ['characteristic', 'characteristic-group'],
      }),

      deleteCharacteristic: build.mutation<IResponse<void>, number>({
        query: (id) => ({ path: `/characteristics/${id}`, method: 'DELETE' }),
        invalidatesTags: ['characteristic', 'characteristic-group'],
      }),
    }),
  });

export const {
  useCreateCharacteristicMutation,
  useUpdateCharacteristicMutation,
  useDeleteCharacteristicMutation,
} = characteristicApiHooks;
