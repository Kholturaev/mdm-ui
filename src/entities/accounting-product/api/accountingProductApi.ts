import { apiService } from '@shared/api';
import { buildCrudEndpoints } from '@shared/api/createCrudEndpoints';
import type {
  IAccountingProduct,
  AccountingProductFormValues,
} from '../model/types';

export const addTagTypes = ['accounting-product'] as const;

export const accountingProductApiHooks = apiService
  .enhanceEndpoints({ addTagTypes })
  .injectEndpoints({
    endpoints: (build) => {
      const crud = buildCrudEndpoints<
        IAccountingProduct,
        AccountingProductFormValues
      >(build, {
        basePath: '/accounting-product',
        tagType: 'accounting-product',
      });
      return {
        getAccountingProducts: crud.getList,
        getOneAccountingProduct: crud.getOne,
        createAccountingProduct: crud.create,
        updateAccountingProduct: crud.update,
        deleteAccountingProduct: crud.remove,
      };
    },
  });

export const {
  useGetAccountingProductsQuery,
  useGetOneAccountingProductQuery,
  useCreateAccountingProductMutation,
  useUpdateAccountingProductMutation,
  useDeleteAccountingProductMutation,
} = accountingProductApiHooks;
