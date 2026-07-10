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
        getOneProductGroup: crud.getOne,
        createProductGroup: crud.create,
        updateProductGroup: crud.update,
        deleteProductGroup: crud.remove,
      };
    },
  });

export const {
  useGetProductGroupsQuery,
  useGetOneProductGroupQuery,
  useCreateProductGroupMutation,
  useUpdateProductGroupMutation,
  useDeleteProductGroupMutation,
} = productGroupApiHooks;
