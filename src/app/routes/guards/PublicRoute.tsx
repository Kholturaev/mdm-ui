import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '@app/store';

export function PublicRoute() {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/dealers" replace />;
  }

  return <Outlet />;
}
