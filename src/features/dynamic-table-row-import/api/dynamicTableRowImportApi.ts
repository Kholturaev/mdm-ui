import { apiService } from '@shared/api';
import type { IResponse } from '@shared/api/type';
import type {
  DynamicTableImportPreviewDto,
  DynamicTableImportExecuteDto,
} from '../model/types';

export const dynamicTableRowImportApiHooks = apiService
  .enhanceEndpoints({
    addTagTypes: [
      'dynamic-table-row-import',
      'dynamic-characteristic',
      'characteristic-group',
    ] as const,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      /**
       * Neither preview nor execute take a `tableId` — the backend derives
       * the target table from the uploaded template itself (only the
       * template download needs it, as a query param).
       */
      previewDynamicTableRowImport: build.mutation<
        IResponse<DynamicTableImportPreviewDto>,
        { file: File }
      >({
        query: ({ file }) => {
          const form = new FormData();
          form.append('file', file);
          return {
            path: '/dynamic-table/import/preview',
            method: 'POST',
            body: form,
          };
        },
      }),

      executeDynamicTableRowImport: build.mutation<
        IResponse<DynamicTableImportExecuteDto>,
        { file: File }
      >({
        query: ({ file }) => {
          const form = new FormData();
          form.append('file', file);
          return {
            path: '/dynamic-table/import/execute',
            method: 'POST',
            body: form,
          };
        },
        invalidatesTags: ['dynamic-characteristic', 'characteristic-group'],
      }),
    }),
  });

export const {
  usePreviewDynamicTableRowImportMutation,
  useExecuteDynamicTableRowImportMutation,
} = dynamicTableRowImportApiHooks;
