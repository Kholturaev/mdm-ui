import { apiService } from '@shared/api';
import { buildCrudEndpoints } from '@shared/api/createCrudEndpoints';
import type { IResponse } from '@shared/api/type';
import type {
  IExternalSystem,
  IIntegrationConfigListResponse,
} from '../model/types';

export const addTagTypes = ['external-system'] as const;

export const externalSystemApiHooks = apiService
  .enhanceEndpoints({ addTagTypes })
  .injectEndpoints({
    endpoints: (build) => {
      const crud = buildCrudEndpoints<IExternalSystem, never>(build, {
        basePath: '/external-systems',
        tagType: 'external-system',
      });
      return {
        getExternalSystems: crud.getList,
        /** Saved export config(s) for one external system — used to preview the JSON shape a product would be sent in before creating it. */
        getIntegrationConfigsBySystem: build.query<
          IResponse<IIntegrationConfigListResponse>,
          { externalSystemId: number }
        >({
          query: ({ externalSystemId }) => ({
            path: `/integration-configs/list?externalSystemId=${externalSystemId}`,
            method: 'POST',
            body: { page: 0, size: 50 },
          }),
        }),
      };
    },
  });

export const {
  useGetExternalSystemsQuery,
  useGetIntegrationConfigsBySystemQuery,
} = externalSystemApiHooks;
