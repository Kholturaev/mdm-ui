import { apiService } from '@shared/api';
import type { IResponse } from '@shared/api/type';
import type {
  ProductDynamicRowLinkPreviewDto,
  ProductDynamicRowLinkExecuteDto,
} from '../model/types';

export const productDynamicRowLinkImportApiHooks = apiService
  .enhanceEndpoints({
    addTagTypes: [
      'product-dynamic-row-link-import',
      'product-dynamic-row',
    ] as const,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      /**
       * Links only — rows and products must already exist. Neither preview
       * nor execute take a `tableId`; the backend resolves the table (and
       * every product/row code pair) from the uploaded file itself.
       */
      previewProductDynamicRowLinkImport: build.mutation<
        IResponse<ProductDynamicRowLinkPreviewDto>,
        { file: File }
      >({
        query: ({ file }) => {
          const form = new FormData();
          form.append('file', file);
          return {
            path: '/product-dynamic-rows/import/preview',
            method: 'POST',
            body: form,
          };
        },
      }),

      executeProductDynamicRowLinkImport: build.mutation<
        IResponse<ProductDynamicRowLinkExecuteDto>,
        { file: File }
      >({
        query: ({ file }) => {
          const form = new FormData();
          form.append('file', file);
          return {
            path: '/product-dynamic-rows/import/execute',
            method: 'POST',
            body: form,
          };
        },
        invalidatesTags: ['product-dynamic-row'],
      }),
    }),
  });

export const {
  usePreviewProductDynamicRowLinkImportMutation,
  useExecuteProductDynamicRowLinkImportMutation,
} = productDynamicRowLinkImportApiHooks;
