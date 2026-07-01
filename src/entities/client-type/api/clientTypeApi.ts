import { apiService } from '@shared/api';
import { buildCrudEndpoints } from '@shared/api/createCrudEndpoints';
import type { IClientType } from '../model/types';

export const addTagTypes = ['client-type'] as const;

export const clientTypeApiHooks = apiService
  .enhanceEndpoints({ addTagTypes })
  .injectEndpoints({
    endpoints: (build) => {
      const crud = buildCrudEndpoints<IClientType, unknown>(build, {
        basePath: '/client-type',
        tagType: 'client-type',
      });
      return { getClientTypes: crud.getList };
    },
  });

export const { useGetClientTypesQuery } = clientTypeApiHooks;
