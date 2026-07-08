import { apiService } from '@shared/api';
import { buildCrudEndpoints } from '@shared/api/createCrudEndpoints';
import type { ICurrency } from '../model/types';

export const addTagTypes = ['currency'] as const;

export const currencyApiHooks = apiService
  .enhanceEndpoints({ addTagTypes })
  .injectEndpoints({
    endpoints: (build) => {
      const crud = buildCrudEndpoints<ICurrency, unknown>(build, {
        basePath: '/currency',
        tagType: 'currency',
      });
      return { getCurrencies: crud.getList };
    },
  });

export const { useGetCurrenciesQuery } = currencyApiHooks;
