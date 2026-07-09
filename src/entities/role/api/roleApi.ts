import { apiService } from '@shared/api';
import { buildCrudEndpoints } from '@shared/api/createCrudEndpoints';
import type { IResponse } from '@shared/api/type';
import type { IMyPermissionGroup } from '@entities/permission/model/types';
import type { IRole, RoleFormValues } from '../model/types';

export const addTagTypes = ['role', 'role-permissions'] as const;

export const roleApiHooks = apiService
  .enhanceEndpoints({ addTagTypes })
  .injectEndpoints({
    endpoints: (build) => {
      const crud = buildCrudEndpoints<IRole, RoleFormValues, string>(build, {
        basePath: '/role',
        tagType: 'role',
      });

      return {
        getRoles: crud.getList,
        getOneRole: crud.getOne,
        createRole: crud.create,
        updateRole: crud.update,
        deleteRole: crud.remove,

        // Keyed by the role's name, not its numeric id — same convention the
        // Keycloak-backed role endpoints use everywhere else in this app.
        getRoleDefaultPermissions: build.query<
          IResponse<IMyPermissionGroup[]>,
          string
        >({
          query: (role) => ({
            path: `/permission/role-default-permissions?role=${encodeURIComponent(role)}`,
            method: 'GET',
          }),
          providesTags: ['role-permissions'],
        }),
        setRoleDefaultPermissions: build.mutation<
          IResponse<void>,
          { role: string; permissions: string[] }
        >({
          query: (data) => ({
            path: '/permission/role-default-permissions',
            method: 'POST',
            body: data,
          }),
          invalidatesTags: ['role-permissions'],
        }),
      };
    },
  });

export const {
  useGetRolesQuery,
  useGetOneRoleQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useGetRoleDefaultPermissionsQuery,
  useSetRoleDefaultPermissionsMutation,
} = roleApiHooks;
