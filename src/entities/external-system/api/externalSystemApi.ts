import { apiService } from '@shared/api';
import { buildCrudEndpoints } from '@shared/api/createCrudEndpoints';
import type { IExternalSystem } from '../model/types';

export const addTagTypes = ['external-system'] as const;

export const externalSystemApiHooks = apiService
  .enhanceEndpoints({ addTagTypes })
  .injectEndpoints({
    endpoints: (build) => {
      const crud = buildCrudEndpoints<IExternalSystem, never>(build, {
        basePath: '/external-systems',
        tagType: 'external-system',
      });
      return {
        getExternalSystems: crud.getList,
      };
    },
  });

export const { useGetExternalSystemsQuery } = externalSystemApiHooks;
