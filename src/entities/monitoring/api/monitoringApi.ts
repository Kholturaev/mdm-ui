import { apiService } from '@shared/api';
import type { IResponse } from '@shared/api/type';
import type {
  SpringPage,
  SyncLogEntry,
  SyncLogsParams,
  SyncSummaryResponse,
} from '../model/types';

export const monitoringApiHooks = apiService.injectEndpoints({
  endpoints: (build) => ({
    /** Real `GET /monitoring/sync-summary` — per-system sync attempt outcomes + overall success rate. */
    getSyncSummary: build.query<IResponse<SyncSummaryResponse>, void>({
      query: () => ({ path: '/monitoring/sync-summary', method: 'GET' }),
    }),
    /** Real `GET /monitoring/sync-logs` — paginated, filterable raw sync-attempt log. */
    getSyncLogs: build.query<
      IResponse<SpringPage<SyncLogEntry>>,
      SyncLogsParams
    >({
      query: (params) => {
        const search = new URLSearchParams();
        if (params.externalSystemId !== undefined) {
          search.set('externalSystemId', String(params.externalSystemId));
        }
        if (params.syncStatus) search.set('syncStatus', params.syncStatus);
        if (params.sectionType) search.set('sectionType', params.sectionType);
        search.set('page', String(params.page));
        search.set('size', String(params.size));
        search.set('sort', 'createdAt,DESC');
        return {
          path: `/monitoring/sync-logs?${search.toString()}`,
          method: 'GET',
        };
      },
    }),
  }),
});

export const { useGetSyncSummaryQuery, useGetSyncLogsQuery } =
  monitoringApiHooks;
