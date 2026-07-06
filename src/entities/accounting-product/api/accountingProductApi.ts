import { apiService } from '@shared/api';
import { buildCrudEndpoints } from '@shared/api/createCrudEndpoints';
import type { IAccountingProduct } from '../model/types';

export const addTagTypes = ['accounting-product'] as const;

export const accountingProductApiHooks = apiService
  .enhanceEndpoints({ addTagTypes })
  .injectEndpoints({
    endpoints: (build) => {
      const crud = buildCrudEndpoints<IAccountingProduct, never>(build, {
        basePath: '/accounting-product',
        tagType: 'accounting-product',
      });
      return {
        getAccountingProducts: crud.getList,
      };
    },
  });

export const { useGetAccountingProductsQuery } = accountingProductApiHooks;
