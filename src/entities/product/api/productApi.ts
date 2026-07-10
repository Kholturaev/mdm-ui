import { apiService } from '@shared/api';
import { buildCrudEndpoints } from '@shared/api/createCrudEndpoints';
import type { IResponse } from '@shared/api/type';
import type { IProduct, ProductFormValues } from '../model/types';

// `auditRecord` is also registered by `entities/audit/api/auditRecordApi.ts` — repeating
// it here just lets this module's own `invalidatesTags` reference it too, so saving a
// product refreshes any on-screen audit trail (e.g. the "last change" card, the History
// tab) without them needing to poll or be manually refetched.
export const addTagTypes = ['product', 'auditRecord'] as const;

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
        updateProduct: build.mutation<
          IResponse<IProduct>,
          { id: number; data: ProductFormValues }
        >({
          query: ({ id, data }) => ({
            path: `/products/${id}`,
            method: 'PUT',
            body: data,
          }),
          invalidatesTags: ['product', 'auditRecord'],
        }),
        deleteProduct: crud.remove,
      };
    },
  });

export const {
  useGetProductsQuery,
  useGetOneProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productApiHooks;
