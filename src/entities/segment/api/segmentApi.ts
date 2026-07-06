import { apiService } from '@shared/api';
import { buildCrudEndpoints } from '@shared/api/createCrudEndpoints';
import type { ISegment, SegmentFormValues } from '../model/types';

export const addTagTypes = ['segment'] as const;

export const segmentApiHooks = apiService
  .enhanceEndpoints({ addTagTypes })
  .injectEndpoints({
    endpoints: (build) => {
      const crud = buildCrudEndpoints<ISegment, SegmentFormValues>(build, {
        basePath: '/segment',
        tagType: 'segment',
      });
      return {
        getSegments: crud.getList,
        createSegment: crud.create,
      };
    },
  });

export const { useGetSegmentsQuery, useCreateSegmentMutation } =
  segmentApiHooks;
