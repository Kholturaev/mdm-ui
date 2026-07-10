import { apiService } from '@shared/api';
import { buildCrudEndpoints } from '@shared/api/createCrudEndpoints';
import type {
  ITypeOfNomenclature,
  TypeOfNomenclatureFormValues,
} from '../model/types';

export const addTagTypes = ['type-of-nomenclature'] as const;

export const typeOfNomenclatureApiHooks = apiService
  .enhanceEndpoints({ addTagTypes })
  .injectEndpoints({
    endpoints: (build) => {
      const crud = buildCrudEndpoints<
        ITypeOfNomenclature,
        TypeOfNomenclatureFormValues
      >(build, {
        basePath: '/type-of-nomenclature',
        tagType: 'type-of-nomenclature',
      });
      return {
        getTypeOfNomenclatures: crud.getList,
        getOneTypeOfNomenclature: crud.getOne,
        createTypeOfNomenclature: crud.create,
        updateTypeOfNomenclature: crud.update,
        deleteTypeOfNomenclature: crud.remove,
      };
    },
  });

export const {
  useGetTypeOfNomenclaturesQuery,
  useGetOneTypeOfNomenclatureQuery,
  useCreateTypeOfNomenclatureMutation,
  useUpdateTypeOfNomenclatureMutation,
  useDeleteTypeOfNomenclatureMutation,
} = typeOfNomenclatureApiHooks;
