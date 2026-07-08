import { apiService } from '@shared/api';
import type { IResponse } from '@shared/api/type';
import type { IMyPermissionGroup } from '../model/types';

export const addTagTypes = ['my-permissions'] as const;

export const permissionApiHooks = apiService
  .enhanceEndpoints({ addTagTypes })
  .injectEndpoints({
    endpoints: (build) => ({
      /** The currently logged-in user's real granted permissions, grouped by backend module — used by the Profile page, not the Role-management mock catalog. */
      getMyPermissions: build.query<IResponse<IMyPermissionGroup[]>, void>({
        query: () => ({ path: '/permission/me/permissions', method: 'GET' }),
        providesTags: ['my-permissions'],
      }),
    }),
  });

export const { useGetMyPermissionsQuery } = permissionApiHooks;
