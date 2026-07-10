import type { ReactNode } from 'react';
import { usePermission } from '@shared/lib/hooks/usePermission';

type PermissionGuardProps = {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
  loadingFallback?: ReactNode;
};

/** Gate any UI behind a permission check — use this instead of inlining `can(...)` so every entity checks permissions the same way. */
export function PermissionGuard({
  permission,
  children,
  fallback = null,
  loadingFallback = null,
}: PermissionGuardProps) {
  const { can, isLoading } = usePermission();
  if (isLoading) return <>{loadingFallback}</>;
  return <>{can(permission) ? children : fallback}</>;
}
