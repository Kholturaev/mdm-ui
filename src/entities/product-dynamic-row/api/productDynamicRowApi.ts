import { apiService } from '@shared/api';
import type { IResponse } from '@shared/api/type';
import type {
  IProductDynamicRow,
  ProductDynamicRowBulkAttachPayload,
} from '../model/types';

export const addTagTypes = ['product-dynamic-row'] as const;

export const productDynamicRowApiHooks = apiService
  .enhanceEndpoints({ addTagTypes })
  .injectEndpoints({
    endpoints: (build) => ({
      getProductDynamicRowsByProductAndTable: build.query<
        IResponse<IProductDynamicRow[]>,
        { productId: number; tableId: number }
      >({
        query: ({ productId, tableId }) => ({
          path: `/product-dynamic-rows/by-product/${productId}/by-table/${tableId}`,
          method: 'GET',
        }),
        providesTags: ['product-dynamic-row'],
      }),

      /** Replaces the full set of dynamic-table rows selected for a product. */
      bulkAttachProductDynamicRows: build.mutation<
        IResponse<IProductDynamicRow[]>,
        ProductDynamicRowBulkAttachPayload
      >({
        query: (data) => ({
          path: `/product-dynamic-rows/bulk`,
          method: 'POST',
          body: data,
        }),
        invalidatesTags: ['product-dynamic-row'],
      }),
    }),
  });

export const {
  useGetProductDynamicRowsByProductAndTableQuery,
  useBulkAttachProductDynamicRowsMutation,
} = productDynamicRowApiHooks;
