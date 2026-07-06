import { apiService } from '@shared/api';
import { buildCrudEndpoints } from '@shared/api/createCrudEndpoints';
import type { IProductGroup } from '../model/types';

export const addTagTypes = ['product-group'] as const;

export const productGroupApiHooks = apiService
  .enhanceEndpoints({ addTagTypes })
  .injectEndpoints({
    endpoints: (build) => {
      const crud = buildCrudEndpoints<IProductGroup, never>(build, {
        basePath: '/product/group',
        tagType: 'product-group',
      });
      return {
        getProductGroups: crud.getList,
      };
    },
  });

export const { useGetProductGroupsQuery } = productGroupApiHooks;
