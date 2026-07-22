import { apiService } from '@shared/api';
import type { IResponse } from '@shared/api/type';
import type { OrphansResponse } from '../model/types';

/** Real `POST /analytics/orphans/list` — feeds both the hub's orphans card and the orphans detail page's paginated table. */
export const orphansApiHooks = apiService.injectEndpoints({
  endpoints: (build) => ({
    getOrphansList: build.query<
      IResponse<OrphansResponse>,
      { page: number; size: number }
    >({
      query: ({ page, size }) => ({
        path: '/analytics/orphans/list',
        method: 'POST',
        body: { page, size },
      }),
    }),
  }),
});

export const { useGetOrphansListQuery } = orphansApiHooks;
