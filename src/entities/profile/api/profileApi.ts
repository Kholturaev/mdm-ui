import { apiService } from '@shared/api';
import type { IResponse } from '@shared/api/type';
import type { IProfile } from '../model/types';

export const addTagTypes = ['profile'] as const;

export const profileApiHooks = apiService
  .enhanceEndpoints({ addTagTypes })
  .injectEndpoints({
    endpoints: (build) => ({
      /** The currently logged-in user, resolved from the session cookie server-side — used for the header's identity display. */
      getMe: build.query<IResponse<IProfile>, void>({
        query: () => ({ path: '/users/me', method: 'GET' }),
        providesTags: ['profile'],
      }),
    }),
  });

export const { useGetMeQuery } = profileApiHooks;
