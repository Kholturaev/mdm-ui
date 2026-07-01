import { apiService } from '@shared/api';
import { buildCrudEndpoints } from '@shared/api/createCrudEndpoints';
import type { IRegion } from '../model/types';

export const addTagTypes = ['region'] as const;

export const regionApiHooks = apiService
  .enhanceEndpoints({ addTagTypes })
  .injectEndpoints({
    endpoints: (build) => {
      const crud = buildCrudEndpoints<IRegion, unknown>(build, {
        basePath: '/region',
        tagType: 'region',
      });
      return { getRegions: crud.getList };
    },
  });

export const { useGetRegionsQuery } = regionApiHooks;
