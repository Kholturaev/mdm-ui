import { apiService } from '@shared/api';
import type { IResponse } from '@shared/api/type';
import type { CompletenessSummary } from '../model/types';

/**
 * Real `GET /analytics/completeness` — feeds the hub's completeness card
 * (overallScore/totalProducts/fullComplete/partial/incomplete). The detail
 * page's by-field/by-group/by-source-system/trend/list sections still read
 * from the mock hooks in `useCompleteness.ts` — not swapped yet.
 */
export const completenessApiHooks = apiService.injectEndpoints({
  endpoints: (build) => ({
    getCompleteness: build.query<IResponse<CompletenessSummary>, void>({
      query: () => ({ path: '/analytics/completeness', method: 'GET' }),
    }),
  }),
});

export const { useGetCompletenessQuery } = completenessApiHooks;
