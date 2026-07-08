import { apiService } from '@shared/api';
import type { IMeta, IRequestList, IResponse } from '@shared/api/type';
import type {
  IProductRate,
  ProductRateFormValues,
  ProductRatePairPayload,
} from '../model/types';

export const addTagTypes = ['product-rate'] as const;

export const productRateApiHooks = apiService
  .enhanceEndpoints({ addTagTypes })
  .injectEndpoints({
    endpoints: (build) => ({
      getProductRates: build.query<
        IResponse<IMeta<IProductRate[]>>,
        IRequestList
      >({
        query: (query) => ({
          path: '/product-rate/list',
          method: 'POST',
          body: query,
        }),
        providesTags: ['product-rate'],
      }),

      /** First-time price for a client type — creates whichever of sales/purchase rows are supplied in one call. */
      createProductRatePair: build.mutation<
        IResponse<IProductRate[]>,
        ProductRatePairPayload
      >({
        query: (data) => ({
          path: '/product-rate/pair',
          method: 'POST',
          body: data,
        }),
        invalidatesTags: ['product-rate'],
      }),

      /** Adds a single SALES-or-PURCHASE row — used when editing adds the *other* type to a client type that only had one so far. */
      createProductRate: build.mutation<
        IResponse<IProductRate>,
        ProductRateFormValues
      >({
        query: (data) => ({
          path: '/product-rate',
          method: 'POST',
          body: data,
        }),
        invalidatesTags: ['product-rate'],
      }),

      updateProductRate: build.mutation<
        IResponse<IProductRate>,
        { id: number; data: ProductRateFormValues }
      >({
        query: ({ id, data }) => ({
          path: `/product-rate/${id}`,
          method: 'PUT',
          body: data,
        }),
        invalidatesTags: ['product-rate'],
      }),

      deleteProductRate: build.mutation<IResponse<void>, number>({
        query: (id) => ({ path: `/product-rate/${id}`, method: 'DELETE' }),
        invalidatesTags: ['product-rate'],
      }),
    }),
  });

export const {
  useGetProductRatesQuery,
  useCreateProductRatePairMutation,
  useCreateProductRateMutation,
  useUpdateProductRateMutation,
  useDeleteProductRateMutation,
} = productRateApiHooks;
