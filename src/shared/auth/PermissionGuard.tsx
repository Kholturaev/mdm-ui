// Component-level permission guard — hides children when permission is missing.
// Usage: <PermissionGuard permission="PRODUCT_CREATE"><Button>Create</Button></PermissionGuard>

import type { ReactNode } from 'react';
import { usePermission } from './useAuth';

interface PermissionGuardProps {
  permission: string;
  children: ReactNode;
}

export function PermissionGuard({ permission, children }: PermissionGuardProps) {
  const allowed = usePermission(permission);
  if (!allowed) return null;
  return <>{children}</>;
}
