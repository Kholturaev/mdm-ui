import { apiService } from '@shared/api';
import { buildCrudEndpoints } from '@shared/api/createCrudEndpoints';
import type { IProduct } from '../model/types';

export const addTagTypes = ['product'] as const;

export const productApiHooks = apiService
  .enhanceEndpoints({ addTagTypes })
  .injectEndpoints({
    endpoints: (build) => {
      const crud = buildCrudEndpoints<IProduct, never>(build, {
        basePath: '/products',
        tagType: 'product',
      });
      return {
        getProducts: crud.getList,
      };
    },
  });

export const { useGetProductsQuery } = productApiHooks;
