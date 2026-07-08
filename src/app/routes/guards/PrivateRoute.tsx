import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '@app/store';
import { FullScreenLoader } from '@shared/ui/FullScreenLoader';

export function PrivateRoute() {
  const status = useAppSelector((state) => state.auth.status);

  if (status === 'checking') {
    return <FullScreenLoader />;
  }

  if (status !== 'authenticated') {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
