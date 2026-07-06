import { apiService } from '@shared/api';
import { buildCrudEndpoints } from '@shared/api/createCrudEndpoints';
import type {
  IProductCategory,
  ProductCategoryFormValues,
} from '../model/types';

export const addTagTypes = ['product-category'] as const;

export const productCategoryApiHooks = apiService
  .enhanceEndpoints({ addTagTypes })
  .injectEndpoints({
    endpoints: (build) => {
      const crud = buildCrudEndpoints<
        IProductCategory,
        ProductCategoryFormValues
      >(build, {
        basePath: '/product-category',
        tagType: 'product-category',
      });
      return {
        getProductCategories: crud.getList,
        createProductCategory: crud.create,
      };
    },
  });

export const {
  useGetProductCategoriesQuery,
  useCreateProductCategoryMutation,
} = productCategoryApiHooks;
