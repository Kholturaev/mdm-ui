import { apiService } from '@shared/api';
import type { IResponse } from '@shared/api/type';
import type { DuplicatesResponse } from '../model/types';

/** Real `POST /analytics/duplicates/list` — feeds both the hub's duplicates card and the duplicates detail page's paginated group list. */
export const duplicatesApiHooks = apiService.injectEndpoints({
  endpoints: (build) => ({
    getDuplicatesList: build.query<
      IResponse<DuplicatesResponse>,
      { page: number; size: number }
    >({
      query: ({ page, size }) => ({
        path: '/analytics/duplicates/list',
        method: 'POST',
        body: { page, size },
      }),
    }),
  }),
});

export const { useGetDuplicatesListQuery } = duplicatesApiHooks;
