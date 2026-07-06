import { apiService } from '@shared/api';
import { buildCrudEndpoints } from '@shared/api/createCrudEndpoints';
import type { IUnit, UnitFormValues } from '../model/types';

export const addTagTypes = ['unit'] as const;

export const unitApiHooks = apiService
  .enhanceEndpoints({ addTagTypes })
  .injectEndpoints({
    endpoints: (build) => {
      const crud = buildCrudEndpoints<IUnit, UnitFormValues>(build, {
        basePath: '/unit',
        tagType: 'unit',
      });
      return {
        getUnits: crud.getList,
        createUnit: crud.create,
      };
    },
  });

export const { useGetUnitsQuery, useCreateUnitMutation } = unitApiHooks;
