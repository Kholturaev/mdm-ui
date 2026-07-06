import { apiService } from '@shared/api';
import { buildCrudEndpoints } from '@shared/api/createCrudEndpoints';
import type { ISegment } from '../model/types';

export const addTagTypes = ['segment'] as const;

export const segmentApiHooks = apiService
  .enhanceEndpoints({ addTagTypes })
  .injectEndpoints({
    endpoints: (build) => {
      const crud = buildCrudEndpoints<ISegment, never>(build, {
        basePath: '/segment',
        tagType: 'segment',
      });
      return {
        getSegments: crud.getList,
      };
    },
  });

export const { useGetSegmentsQuery } = segmentApiHooks;
