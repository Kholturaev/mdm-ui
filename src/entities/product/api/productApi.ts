import { apiService } from '@shared/api';
import { buildCrudEndpoints } from '@shared/api/createCrudEndpoints';
import type { IProduct, ProductFormValues } from '../model/types';

export const addTagTypes = ['product'] as const;

export const productApiHooks = apiService
  .enhanceEndpoints({ addTagTypes })
  .injectEndpoints({
    endpoints: (build) => {
      const crud = buildCrudEndpoints<IProduct, ProductFormValues>(build, {
        basePath: '/products',
        tagType: 'product',
      });
      return {
        getProducts: crud.getList,
        getOneProduct: crud.getOne,
        createProduct: crud.create,
        updateProduct: crud.update,
      };
    },
  });

export const {
  useGetProductsQuery,
  useGetOneProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
} = productApiHooks;
