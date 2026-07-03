import { useCallback, useState } from 'react';
import { createMockResource, wait } from '@shared/lib/mockResource';
import type { IRole, RoleFormValues } from '../model/types';
import { ROLE_SEED } from './roleMockData';

const resource = createMockResource<IRole, RoleFormValues>({
  seed: ROLE_SEED,
  getId: (role) => role.id,
  applyForm: (form, existing, nextId) => ({
    id: existing?.id ?? nextId,
    name: form.name,
    description: form.description,
    permissionKeys: existing?.permissionKeys ?? [],
    createdAt: existing?.createdAt ?? new Date().toISOString(),
  }),
  matchesSearch: (role, query) => role.name.toLowerCase().includes(query),
});

export const useGetRolesQuery = resource.useList;
export const useGetRoleQuery = resource.useGetOne;
export const useCreateRoleMutation = resource.useCreate;
export const useUpdateRoleMutation = resource.useUpdate;
export const useDeleteRoleMutation = resource.useRemove;
export const useRoleStoreVersion = resource.useStoreVersion;
export const getRoleSnapshot = resource.getSnapshot;

export function useSetRolePermissionsMutation() {
  const [isLoading, setIsLoading] = useState(false);
  const trigger = useCallback(
    (args: { id: number; permissionKeys: string[] }) => {
      setIsLoading(true);
      const promise = wait().then(() => {
        resource.mutateStore((roles) =>
          roles.map((role) =>
            role.id === args.id
              ? { ...role, permissionKeys: args.permissionKeys }
              : role,
          ),
        );
        setIsLoading(false);
      });
      return { unwrap: () => promise };
    },
    [],
  );
  return [trigger, { isLoading }] as const;
}
