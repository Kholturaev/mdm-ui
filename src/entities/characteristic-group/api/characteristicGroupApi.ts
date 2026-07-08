import { apiService } from '@shared/api';
import type { IResponse } from '@shared/api/type';
import type { ICharacteristicsGroupWithItems } from '../model/types';

export const addTagTypes = ['characteristic-group'] as const;

export const characteristicGroupApiHooks = apiService
  .enhanceEndpoints({ addTagTypes })
  .injectEndpoints({
    endpoints: (build) => ({
      /** Characteristic groups scoped to a nomenclature type, each with its regular characteristics and dynamic tables nested — everything the product details tab needs in one call. */
      getCharacteristicGroupsByNomenclature: build.query<
        IResponse<ICharacteristicsGroupWithItems[]>,
        number
      >({
        query: (typeOfNomenclatureId) => ({
          path: `/characteristics-group/by-nomenclature/${typeOfNomenclatureId}`,
          method: 'GET',
        }),
        providesTags: ['characteristic-group'],
      }),
    }),
  });

export const { useGetCharacteristicGroupsByNomenclatureQuery } =
  characteristicGroupApiHooks;
