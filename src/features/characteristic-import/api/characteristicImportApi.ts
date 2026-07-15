import { apiService } from '@shared/api';
import type { IResponse } from '@shared/api/type';
import type {
  CharacteristicImportPreviewDto,
  CharacteristicImportExecuteDto,
} from '../model/types';

export const characteristicImportApiHooks = apiService
  .enhanceEndpoints({
    addTagTypes: ['characteristic-import', 'characteristic-group'] as const,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      previewCharacteristicImport: build.mutation<
        IResponse<CharacteristicImportPreviewDto>,
        { file: File }
      >({
        query: ({ file }) => {
          const form = new FormData();
          form.append('file', file);
          return {
            path: '/characteristics/import/preview',
            method: 'POST',
            body: form,
          };
        },
      }),

      executeCharacteristicImport: build.mutation<
        IResponse<CharacteristicImportExecuteDto>,
        { file: File }
      >({
        query: ({ file }) => {
          const form = new FormData();
          form.append('file', file);
          return {
            path: '/characteristics/import/execute',
            method: 'POST',
            body: form,
          };
        },
        invalidatesTags: ['characteristic-group'],
      }),
    }),
  });

export const {
  usePreviewCharacteristicImportMutation,
  useExecuteCharacteristicImportMutation,
} = characteristicImportApiHooks;
