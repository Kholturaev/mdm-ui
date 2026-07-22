import { apiService } from '@shared/api';
import type { IResponse } from '@shared/api/type';
import type {
  CoverageResponse,
  DailyDigestResponse,
  ErrorBreakdownResponse,
  TrendsResponse,
} from '../model/dashboardKpisTypes';

export const dashboardKpisApiHooks = apiService.injectEndpoints({
  endpoints: (build) => ({
    /** Total product count + per-external-system synced counts — feeds the "total products" stat tile and the Systems Coverage card. */
    getCoverage: build.query<IResponse<CoverageResponse>, void>({
      query: () => ({ path: '/analytics/coverage', method: 'GET' }),
    }),
    /** Today's event/sync/error counts — feeds the 3 remaining stat tiles. */
    getDailyDigest: build.query<IResponse<DailyDigestResponse>, void>({
      query: () => ({ path: '/analytics/daily-digest', method: 'GET' }),
    }),
    /** DLQ status/validation/sync-failure breakdown over a window — feeds the Attention panel. */
    getErrorBreakdown: build.query<
      IResponse<ErrorBreakdownResponse>,
      { days: number }
    >({
      query: ({ days }) => ({
        path: `/analytics/error-breakdown?days=${days}`,
        method: 'GET',
      }),
    }),
    /** Daily event/error counts over a window — feeds the trend chart. */
    getTrends: build.query<IResponse<TrendsResponse>, { days: number }>({
      query: ({ days }) => ({
        path: `/analytics/trends?days=${days}`,
        method: 'GET',
      }),
    }),
  }),
});

export const {
  useGetCoverageQuery,
  useGetDailyDigestQuery,
  useGetErrorBreakdownQuery,
  useGetTrendsQuery,
} = dashboardKpisApiHooks;
