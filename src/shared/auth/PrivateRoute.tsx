// Route-level permission guard.
// Usage (in router config):
//   { element: <PrivateRoute permission="PRODUCT_READ" />, children: [...] }
//
// AGENTS.md: use ONLY the permission codes defined in docs/01-data-models.md.

import { Navigate, Outlet } from 'react-router';
import { useAuth } from './useAuth';
import { ROUTES } from '../constants/routes';

interface PrivateRouteProps {
  /** Required permission code from docs/01-data-models.md */
  permission?: string;
  /** One of these roles must be present (OR logic) */
  roles?: string[];
}

export function PrivateRoute({ permission, roles }: PrivateRouteProps) {
  const { permissions, roles: userRoles, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  const permOk = !permission || permissions.includes(permission);
  const roleOk = !roles?.length || roles.some((r) => userRoles.includes(r));

  if (!permOk || !roleOk) {
    return <Navigate to={ROUTES.FORBIDDEN} replace />;
  }

  return <Outlet />;
}
