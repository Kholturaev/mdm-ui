import { apiService } from '@shared/api';
import type { IResponse } from '@shared/api/type';
import type {
  IProductCharacteristicValue,
  ProductCharacteristicValueBulkAttachPayload,
  ProductCharacteristicValueTextAttachPayload,
} from '../model/types';

export const addTagTypes = ['product-characteristic-value'] as const;

export const productCharacteristicValueApiHooks = apiService
  .enhanceEndpoints({ addTagTypes })
  .injectEndpoints({
    endpoints: (build) => ({
      getProductCharacteristicValuesByProduct: build.query<
        IResponse<IProductCharacteristicValue[]>,
        number
      >({
        query: (productId) => ({
          path: `/product-characteristic-values/by-product/${productId}`,
          method: 'GET',
        }),
        providesTags: ['product-characteristic-value'],
      }),

      /** Replaces the full set of attached values for one SELECT/RADIO/CHECKBOX characteristic on a product. */
      bulkAttachProductCharacteristicValues: build.mutation<
        IResponse<number[]>,
        ProductCharacteristicValueBulkAttachPayload
      >({
        query: (data) => ({
          path: `/product-characteristic-values/bulk`,
          method: 'POST',
          body: data,
        }),
        invalidatesTags: ['product-characteristic-value'],
      }),

      /** Sets the free-text value for one TEXT characteristic on a product. */
      attachTextProductCharacteristicValue: build.mutation<
        IResponse<number>,
        ProductCharacteristicValueTextAttachPayload
      >({
        query: (data) => ({
          path: `/product-characteristic-values/text`,
          method: 'POST',
          body: data,
        }),
        invalidatesTags: ['product-characteristic-value'],
      }),
    }),
  });

export const {
  useGetProductCharacteristicValuesByProductQuery,
  useBulkAttachProductCharacteristicValuesMutation,
  useAttachTextProductCharacteristicValueMutation,
} = productCharacteristicValueApiHooks;
