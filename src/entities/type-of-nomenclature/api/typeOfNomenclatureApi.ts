import { apiService } from '@shared/api';
import { buildCrudEndpoints } from '@shared/api/createCrudEndpoints';
import type { ITypeOfNomenclature } from '../model/types';

export const addTagTypes = ['type-of-nomenclature'] as const;

export const typeOfNomenclatureApiHooks = apiService
  .enhanceEndpoints({ addTagTypes })
  .injectEndpoints({
    endpoints: (build) => {
      const crud = buildCrudEndpoints<ITypeOfNomenclature, never>(build, {
        basePath: '/type-of-nomenclature',
        tagType: 'type-of-nomenclature',
      });
      return {
        getTypeOfNomenclatures: crud.getList,
      };
    },
  });

export const { useGetTypeOfNomenclaturesQuery } = typeOfNomenclatureApiHooks;
