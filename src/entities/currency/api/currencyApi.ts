import { apiService } from '@shared/api';
import { buildCrudEndpoints } from '@shared/api/createCrudEndpoints';
import type { ICurrency, CurrencyFormValues } from '../model/types';

export const addTagTypes = ['currency'] as const;

export const currencyApiHooks = apiService
  .enhanceEndpoints({ addTagTypes })
  .injectEndpoints({
    endpoints: (build) => {
      const crud = buildCrudEndpoints<ICurrency, CurrencyFormValues>(build, {
        basePath: '/currency',
        tagType: 'currency',
      });
      return {
        getCurrencies: crud.getList,
        getOneCurrency: crud.getOne,
        createCurrency: crud.create,
        updateCurrency: crud.update,
        deleteCurrency: crud.remove,
      };
    },
  });

export const {
  useGetCurrenciesQuery,
  useGetOneCurrencyQuery,
  useCreateCurrencyMutation,
  useUpdateCurrencyMutation,
  useDeleteCurrencyMutation,
} = currencyApiHooks;
