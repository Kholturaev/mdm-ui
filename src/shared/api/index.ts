import { type BaseQueryFn, createApi } from '@reduxjs/toolkit/query/react';
import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type AxiosResponse,
} from 'axios';
import { env } from '@shared/config/env';
import type { ApiException, HttpResponseHeaders } from './type';
import { extractFieldErrors } from './parseApiError';

export interface FetchArgs {
  path: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: object | FormData;
  baseURL?: string;
  responseType?: AxiosRequestConfig['responseType'];
}

const axiosInstance = axios.create({ withCredentials: true });

const AUTH_NO_REFRESH = ['/auth', '/auth/refresh-token', '/auth/logout'];

// Shared refresh promise so concurrent 401s only trigger ONE refresh call.
let refreshPromise: Promise<boolean> | null = null;

async function performRefresh(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = axiosInstance
      .post(`${env.authApiUrl}/auth/refresh-token`, undefined, {
        withCredentials: true,
      })
      .then((res) => res.status >= 200 && res.status < 300)
      .catch(() => false)
      .finally(() => {
        // Release on next tick so any awaiters resolve from this promise first.
        setTimeout(() => {
          refreshPromise = null;
        }, 0);
      });
  }
  return refreshPromise;
}

function buildHeaders(isFormData: boolean): Record<string, string> {
  const headers: Record<string, string> = {};
  if (!isFormData) headers['Content-Type'] = 'application/json';
  return headers;
}

async function request<T>(
  args: FetchArgs,
  isRetry = false,
): Promise<AxiosResponse<T>> {
  const isFormData = args.body instanceof FormData;

  const config: AxiosRequestConfig = {
    url: `${args.baseURL || env.apiUrl}${args.path}`,
    method: args.method || 'GET',
    headers: buildHeaders(isFormData),
    data: isFormData
      ? args.body
      : args.body
        ? JSON.stringify(args.body)
        : undefined,
    responseType: args.responseType || 'json',
    withCredentials: true,
  };

  try {
    return await axiosInstance(config);
  } catch (e) {
    const err = e as AxiosError;

    if (
      err.response?.status === 401 &&
      !isRetry &&
      !AUTH_NO_REFRESH.includes(args.path)
    ) {
      const refreshed = await performRefresh();
      if (refreshed) return request<T>(args, true);
    }

    throw err;
  }
}

interface FetchResult<T> {
  data: T;
  status: number;
  headers: HttpResponseHeaders;
}

export const api = {
  async fetch<T>(args: FetchArgs): Promise<FetchResult<T>> {
    const res = await request<T>(args);
    return {
      data: res.status === 204 ? (undefined as unknown as T) : res.data,
      status: res.status,
      headers: res.headers as HttpResponseHeaders,
    };
  },
};

const axiosBaseQuery: BaseQueryFn<FetchArgs, unknown, ApiException> = async (
  args,
) => {
  try {
    const result = await api.fetch(args);
    return { data: result };
  } catch (e) {
    const err = e as AxiosError;
    const apiError: ApiException = err.response
      ? {
          status: err.response.status,
          message: err.message,
          data: err.response.data,
          fields: extractFieldErrors(err.response.data),
        }
      : { status: 0, message: err.message || 'Network error' };
    return { error: apiError };
  }
};

export const apiService = createApi({
  baseQuery: axiosBaseQuery,
  endpoints: () => ({}),
  reducerPath: 'apiService',
  keepUnusedDataFor: 5,
});

export async function logout() {
  try {
    await axiosInstance.post(`${env.authApiUrl}/auth/logout`, undefined, {
      withCredentials: true,
    });
  } finally {
    window.location.href = '/login';
  }
}
