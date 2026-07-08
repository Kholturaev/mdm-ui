import { apiService } from '@shared/api';
import type { IMeta, IRequestList, IResponse } from '@shared/api/type';
import type { IUnitConversion, UnitConversionFormValues } from '../model/types';

export const addTagTypes = ['unit-conversion'] as const;

export const productUnitConversionApiHooks = apiService
  .enhanceEndpoints({ addTagTypes })
  .injectEndpoints({
    endpoints: (build) => ({
      getUnitConversions: build.query<
        IResponse<IMeta<IUnitConversion[]>>,
        IRequestList
      >({
        query: (query) => ({
          path: '/unit-conversion/list',
          method: 'POST',
          body: query,
        }),
        providesTags: ['unit-conversion'],
      }),

      createUnitConversion: build.mutation<
        IResponse<IUnitConversion>,
        UnitConversionFormValues
      >({
        query: (data) => ({
          path: '/unit-conversion',
          method: 'POST',
          body: data,
        }),
        invalidatesTags: ['unit-conversion'],
      }),

      updateUnitConversion: build.mutation<
        IResponse<IUnitConversion>,
        { id: number; data: UnitConversionFormValues }
      >({
        query: ({ id, data }) => ({
          path: `/unit-conversion/${id}`,
          method: 'PUT',
          body: data,
        }),
        invalidatesTags: ['unit-conversion'],
      }),

      deleteUnitConversion: build.mutation<IResponse<void>, number>({
        query: (id) => ({ path: `/unit-conversion/${id}`, method: 'DELETE' }),
        invalidatesTags: ['unit-conversion'],
      }),
    }),
  });

export const {
  useGetUnitConversionsQuery,
  useCreateUnitConversionMutation,
  useUpdateUnitConversionMutation,
  useDeleteUnitConversionMutation,
} = productUnitConversionApiHooks;
