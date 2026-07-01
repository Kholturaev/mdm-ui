import { apiService } from '@shared/api';
import { buildCrudEndpoints } from '@shared/api/createCrudEndpoints';
import type { IRegionalBase } from '../model/types';

export const addTagTypes = ['regional-base'] as const;

export const regionalBaseApiHooks = apiService
  .enhanceEndpoints({ addTagTypes })
  .injectEndpoints({
    endpoints: (build) => {
      const crud = buildCrudEndpoints<IRegionalBase, unknown>(build, {
        basePath: '/regional-base',
        tagType: 'regional-base',
      });
      return { getRegionalBases: crud.getList };
    },
  });

export const { useGetRegionalBasesQuery } = regionalBaseApiHooks;
