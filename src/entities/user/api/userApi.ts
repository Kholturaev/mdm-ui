import { useCallback, useState } from 'react';
import { createMockResource, wait } from '@shared/lib/mockResource';
import type { IUser, UserFormValues } from '../model/types';
import { USER_SEED } from './userMockData';

const resource = createMockResource<IUser, UserFormValues>({
  seed: USER_SEED,
  getId: (user) => user.id,
  applyForm: (form, existing, nextId) => ({
    id: existing?.id ?? nextId,
    firstName: form.firstName,
    lastName: form.lastName,
    username: form.username,
    email: form.email,
    status: form.status,
    roleIds: form.roleIds,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    lastLoginAt: existing?.lastLoginAt,
  }),
  matchesSearch: (user, query) =>
    `${user.firstName} ${user.lastName} ${user.username} ${user.email}`
      .toLowerCase()
      .includes(query),
  matchesFilters: (user, filters) =>
    filters.roleId == null || user.roleIds.includes(Number(filters.roleId)),
});

export const useGetUsersQuery = resource.useList;
export const useGetUserQuery = resource.useGetOne;
export const useCreateUserMutation = resource.useCreate;
export const useUpdateUserMutation = resource.useUpdate;
export const useDeleteUserMutation = resource.useRemove;
export const useUserStoreVersion = resource.useStoreVersion;

export function useAssignRolesMutation() {
  const [isLoading, setIsLoading] = useState(false);
  const trigger = useCallback((args: { id: number; roleIds: number[] }) => {
    setIsLoading(true);
    const promise = wait().then(() => {
      resource.mutateStore((users) =>
        users.map((user) =>
          user.id === args.id ? { ...user, roleIds: args.roleIds } : user,
        ),
      );
      setIsLoading(false);
    });
    return { unwrap: () => promise };
  }, []);
  return [trigger, { isLoading }] as const;
}

/** Live count of users holding a given role — for the role details page's "N users" link, independent of any list's pagination. */
export function useCountUsersByRole(roleId: number): number {
  resource.useStoreVersion();
  return resource.getSnapshot().filter((user) => user.roleIds.includes(roleId))
    .length;
}
