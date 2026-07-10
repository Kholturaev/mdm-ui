import { useMemo } from 'react';
import { useGetMeQuery } from '@entities/profile/api/profileApi';
import { useGetMyPermissionsQuery } from '@entities/permission/api/permissionApi';
import { FULL_ACCESS_ROLES } from '@shared/constants/permissions';

/**
 * Single source of truth for "can the current user do X" — reads the
 * session's own roles (via `/users/me`, already fetched app-wide) and
 * permissions (via `/permission/me/permissions`) straight from RTK Query's
 * cache, no redundant redux slice. `SUPER_ADMIN`/`ADMIN` bypass every check.
 */
export function usePermission() {
  const { data: profileRes, isLoading: isLoadingProfile } = useGetMeQuery();
  const roles = profileRes?.data.roles ?? [];
  const hasFullAccess = roles.some((role) =>
    (FULL_ACCESS_ROLES as readonly string[]).includes(role),
  );

  const { data: permissionsRes, isLoading: isLoadingPermissions } =
    useGetMyPermissionsQuery(undefined, { skip: hasFullAccess });

  const permissionSet = useMemo(() => {
    const groups = permissionsRes?.data ?? [];
    return new Set(
      groups.flatMap((group) => group.permissions.map((p) => p.value)),
    );
  }, [permissionsRes]);

  const can = (permission: string) =>
    hasFullAccess || permissionSet.has(permission);

  return {
    can,
    isLoading: isLoadingProfile || (isLoadingPermissions && !hasFullAccess),
  };
}
