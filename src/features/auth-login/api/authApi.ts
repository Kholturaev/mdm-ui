import { apiService } from '@shared/api';
import { env } from '@shared/config/env';
import type { IResponse } from '@shared/api/type';

export type SignInRequest = {
  username: string;
  password: string;
};

export type SignInResponse = {
  success?: boolean;
};

export const authApiHooks = apiService.injectEndpoints({
  endpoints: (build) => ({
    signIn: build.mutation<IResponse<SignInResponse>, SignInRequest>({
      query: (data) => ({
        path: '/auth',
        method: 'POST',
        body: data,
        baseURL: env.authApiUrl,
      }),
    }),
  }),
});

export const { useSignInMutation } = authApiHooks;
