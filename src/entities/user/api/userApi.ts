import { apiService } from '@shared/api';
import { buildCrudEndpoints } from '@shared/api/createCrudEndpoints';
import { env } from '@shared/config/env';
import type { IResponse } from '@shared/api/type';
import type { IMyPermissionGroup } from '@entities/permission/model/types';
import type {
  IUser,
  IUserRole,
  UserCreateFormValues,
  UserFormValues,
} from '../model/types';

export const addTagTypes = ['user', 'user-roles', 'user-permissions'] as const;

export const userApiHooks = apiService
  .enhanceEndpoints({ addTagTypes })
  .injectEndpoints({
    endpoints: (build) => {
      const crud = buildCrudEndpoints<IUser, UserFormValues, string>(build, {
        basePath: '/users',
        tagType: 'user',
      });

      return {
        getUsers: crud.getList,
        getOneUser: crud.getOne,
        deleteUser: crud.remove,

        createUser: build.mutation<IResponse<IUser>, UserCreateFormValues>({
          query: (data) => ({ path: '/users', method: 'POST', body: data }),
          invalidatesTags: ['user'],
        }),
        updateUser: build.mutation<
          IResponse<IUser>,
          { id: string; data: UserFormValues }
        >({
          query: ({ id, data }) => ({
            path: `/users/${id}`,
            method: 'PUT',
            body: data,
          }),
          invalidatesTags: ['user'],
        }),

        getUserRoles: build.query<IResponse<IUserRole[]>, string>({
          query: (id) => ({
            path: `/auth/realm/user/roles/${id}`,
            method: 'GET',
            baseURL: env.authApiUrl,
          }),
          providesTags: ['user-roles'],
        }),
        getAllRoles: build.query<IResponse<IUserRole[]>, void>({
          query: () => ({
            path: `/auth/realm/client/roles`,
            method: 'GET',
            baseURL: env.authApiUrl,
          }),
        }),
        assignRolesToUser: build.mutation<
          IResponse<IUser>,
          { userId: string; roleNames: string[] }
        >({
          query: ({ userId, roleNames }) => ({
            path: `/users/${userId}/roles`,
            method: 'PUT',
            body: roleNames,
          }),
          invalidatesTags: ['user-roles'],
        }),

        getUserPermissions: build.query<
          IResponse<IMyPermissionGroup[]>,
          string
        >({
          query: (id) => ({
            path: `/permission/user-permissions/${id}`,
            method: 'GET',
          }),
          providesTags: ['user-permissions'],
        }),
        getAllPermissions: build.query<IResponse<IMyPermissionGroup[]>, void>({
          query: () => ({ path: `/permission/list`, method: 'GET' }),
        }),
        addPermissionsToUser: build.mutation<
          IResponse<IUser>,
          { userId: string; permissions: string[] }
        >({
          query: ({ userId, permissions }) => ({
            path: `/permission/add-permission`,
            method: 'POST',
            body: { userId, permissions },
          }),
          invalidatesTags: ['user-permissions'],
        }),
        removePermissionFromUser: build.mutation<
          IResponse<IUser>,
          { userId: string; permission: string }
        >({
          query: ({ userId, permission }) => ({
            path: `/permission/user-permissions/${userId}/custom/${permission}`,
            method: 'DELETE',
          }),
          invalidatesTags: ['user-permissions'],
        }),
        resetUserPermissions: build.mutation<IResponse<IUser>, string>({
          query: (userId) => ({
            path: `/permission/user-permissions/${userId}/reset`,
            method: 'POST',
          }),
          invalidatesTags: ['user-permissions'],
        }),

        resetUserPassword: build.mutation<
          IResponse<null>,
          { userId: string; newPassword: string }
        >({
          query: ({ userId, newPassword }) => ({
            path: `/auth/user/reset-password/${userId}`,
            method: 'PUT',
            body: { value: newPassword },
            baseURL: env.authApiUrl,
          }),
        }),
        changeOwnPassword: build.mutation<
          IResponse<null>,
          { currentPassword: string; newPassword: string }
        >({
          query: (data) => ({
            path: `/auth/user/change-password`,
            method: 'PUT',
            body: data,
            baseURL: env.authApiUrl,
          }),
        }),
      };
    },
  });

export const {
  useGetUsersQuery,
  useGetOneUserQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetUserRolesQuery,
  useGetAllRolesQuery,
  useAssignRolesToUserMutation,
  useGetUserPermissionsQuery,
  useGetAllPermissionsQuery,
  useAddPermissionsToUserMutation,
  useRemovePermissionFromUserMutation,
  useResetUserPermissionsMutation,
  useResetUserPasswordMutation,
  useChangeOwnPasswordMutation,
} = userApiHooks;
