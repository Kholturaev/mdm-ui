import { apiService } from '@shared/api';
import { buildCrudEndpoints } from '@shared/api/createCrudEndpoints';
import type { IResponse } from '@shared/api/type';
import type {
  CharacteristicsGroupFormValues,
  ICharacteristicsGroup,
  ICharacteristicsGroupWithItems,
} from '../model/types';

export const addTagTypes = ['characteristic-group'] as const;

export const characteristicGroupApiHooks = apiService
  .enhanceEndpoints({ addTagTypes })
  .injectEndpoints({
    endpoints: (build) => {
      const crud = buildCrudEndpoints<
        ICharacteristicsGroup,
        CharacteristicsGroupFormValues
      >(build, {
        basePath: '/characteristics-group',
        tagType: 'characteristic-group',
      });
      return {
        createCharacteristicsGroup: crud.create,
        updateCharacteristicsGroup: crud.update,
        deleteCharacteristicsGroup: crud.remove,

        /** Characteristic groups scoped to a nomenclature type, each with its regular characteristics and dynamic tables nested — everything the tree/panel UI and the product details tab need in one call. */
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
      };
    },
  });

export const {
  useCreateCharacteristicsGroupMutation,
  useUpdateCharacteristicsGroupMutation,
  useDeleteCharacteristicsGroupMutation,
  useGetCharacteristicGroupsByNomenclatureQuery,
} = characteristicGroupApiHooks;
