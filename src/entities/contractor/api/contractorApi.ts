import { apiService } from '@shared/api';
import { buildCrudEndpoints } from '@shared/api/createCrudEndpoints';
import type { IContractor } from '../model/types';

export const addTagTypes = ['contractor'] as const;

export const contractorApiHooks = apiService
  .enhanceEndpoints({ addTagTypes })
  .injectEndpoints({
    endpoints: (build) => {
      const crud = buildCrudEndpoints<IContractor, unknown, string>(build, {
        basePath: '/contractor',
        tagType: 'contractor',
      });
      return { getContractors: crud.getList };
    },
  });

export const { useGetContractorsQuery } = contractorApiHooks;
