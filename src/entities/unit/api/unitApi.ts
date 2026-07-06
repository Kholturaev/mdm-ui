import { apiService } from '@shared/api';
import { buildCrudEndpoints } from '@shared/api/createCrudEndpoints';
import type { IUnit } from '../model/types';

export const addTagTypes = ['unit'] as const;

export const unitApiHooks = apiService
  .enhanceEndpoints({ addTagTypes })
  .injectEndpoints({
    endpoints: (build) => {
      const crud = buildCrudEndpoints<IUnit, never>(build, {
        basePath: '/unit',
        tagType: 'unit',
      });
      return {
        getUnits: crud.getList,
      };
    },
  });

export const { useGetUnitsQuery } = unitApiHooks;
