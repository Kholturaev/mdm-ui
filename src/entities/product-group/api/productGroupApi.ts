import { apiService } from '@shared/api';
import { buildCrudEndpoints } from '@shared/api/createCrudEndpoints';
import type { IProductGroup, ProductGroupFormValues } from '../model/types';

export const addTagTypes = ['product-group'] as const;

export const productGroupApiHooks = apiService
  .enhanceEndpoints({ addTagTypes })
  .injectEndpoints({
    endpoints: (build) => {
      const crud = buildCrudEndpoints<IProductGroup, ProductGroupFormValues>(
        build,
        {
          basePath: '/product/group',
          tagType: 'product-group',
        },
      );
      return {
        getProductGroups: crud.getList,
        createProductGroup: crud.create,
      };
    },
  });

export const { useGetProductGroupsQuery, useCreateProductGroupMutation } =
  productGroupApiHooks;
