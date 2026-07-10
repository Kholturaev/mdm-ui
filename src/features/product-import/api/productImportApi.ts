import { apiService } from '@shared/api';
import type { IResponse } from '@shared/api/type';
import type {
  ExternalSystemBriefDto,
  ProductImportPreviewDto,
  ProductImportResultDto,
} from '../model/types';
import { buildImportActionQuery } from '../lib/buildImportQuery';

export const productImportApiHooks = apiService
  .enhanceEndpoints({ addTagTypes: ['product-import', 'product'] as const })
  .injectEndpoints({
    endpoints: (build) => ({
      /** Only systems with an active PRODUCT import config — picking one without it 400s on template/preview/execute. */
      getProductImportExternalSystems: build.query<
        IResponse<ExternalSystemBriefDto[]>,
        void
      >({
        query: () => ({ path: '/product/import/external-systems' }),
      }),

      previewProductImport: build.mutation<
        IResponse<ProductImportPreviewDto>,
        { file: File; externalSystemIds: number[] }
      >({
        query: ({ file, externalSystemIds }) => {
          const form = new FormData();
          form.append('file', file);
          const qs = buildImportActionQuery(externalSystemIds);
          return {
            path: `/product/import/preview?${qs}`,
            method: 'POST',
            body: form,
          };
        },
      }),

      executeProductImport: build.mutation<
        IResponse<ProductImportResultDto>,
        { file: File; externalSystemIds: number[] }
      >({
        query: ({ file, externalSystemIds }) => {
          const form = new FormData();
          form.append('file', file);
          const qs = buildImportActionQuery(externalSystemIds);
          return {
            path: `/product/import/execute?${qs}`,
            method: 'POST',
            body: form,
          };
        },
        invalidatesTags: ['product'],
      }),
    }),
  });

export const {
  useGetProductImportExternalSystemsQuery,
  usePreviewProductImportMutation,
  useExecuteProductImportMutation,
} = productImportApiHooks;
