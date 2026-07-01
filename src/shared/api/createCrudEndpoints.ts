import type { EndpointBuilder } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn } from '@reduxjs/toolkit/query';
import type { ApiException, IMeta, IRequestList, IResponse } from './type';
import type { FetchArgs } from './index';

type Builder = EndpointBuilder<
  BaseQueryFn<FetchArgs, unknown, ApiException>,
  string,
  'apiService'
>;

interface CrudOptions {
  basePath: string;
  tagType: string;
  listPath?: string;
}

type IdType = string | number;

export function buildCrudEndpoints<TEntity, TForm, TId extends IdType = number>(
  build: Builder,
  { basePath, tagType, listPath = `${basePath}/list` }: CrudOptions,
) {
  return {
    getList: build.query<IResponse<IMeta<TEntity[]>>, IRequestList>({
      query: (q) => ({ path: listPath, method: 'POST', body: q }),
      providesTags: [tagType],
    }),

    getOne: build.query<IResponse<TEntity>, TId | null>({
      query: (id) => ({ path: `${basePath}/${id}`, method: 'GET' }),
      providesTags: [tagType],
    }),

    create: build.mutation<IResponse<TEntity>, TForm>({
      query: (data) => ({
        path: basePath,
        method: 'POST',
        body: data as object,
      }),
      invalidatesTags: [tagType],
    }),

    update: build.mutation<IResponse<TEntity>, { id: TId; data: TForm }>({
      query: ({ id, data }) => ({
        path: `${basePath}/${id}`,
        method: 'PUT',
        body: data as object,
      }),
      invalidatesTags: [tagType],
    }),

    remove: build.mutation<IResponse<void>, TId>({
      query: (id) => ({ path: `${basePath}/${id}`, method: 'DELETE' }),
      invalidatesTags: [tagType],
    }),
  };
}
