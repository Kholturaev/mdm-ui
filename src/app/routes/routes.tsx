import { Navigate, createBrowserRouter } from 'react-router-dom';
import { AppShell } from '@widgets/app-shell/ui/AppShell';
import { LoginPage } from '@pages/LoginPage';
import { AnalyticsPage } from '@pages/AnalyticsPage';
import { DealersPage } from '@pages/DealersPage';
import { NomenclaturePage } from '@pages/NomenclaturePage';
import { UsersPage } from '@pages/UsersPage';
import { UserDetailsPage } from '@pages/UserDetailsPage';
import { RolesPage } from '@pages/RolesPage';
import { RoleDetailsPage } from '@pages/RoleDetailsPage';
import { NotFoundPage } from '@pages/NotFoundPage';
import { PrivateRoute } from './guards/PrivateRoute';
import { PublicRoute } from './guards/PublicRoute';

export const router = createBrowserRouter([
  {
    element: <PublicRoute />,
    children: [{ path: '/login', element: <LoginPage /> }],
  },
  {
    element: <PrivateRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { index: true, element: <Navigate to="/analytics" replace /> },
          { path: 'analytics', element: <AnalyticsPage /> },
          { path: 'dealers', element: <DealersPage /> },
          { path: 'nomenclature', element: <NomenclaturePage /> },
          { path: 'access/users', element: <UsersPage /> },
          { path: 'access/users/:id', element: <UserDetailsPage /> },
          { path: 'access/roles', element: <RolesPage /> },
          { path: 'access/roles/:id', element: <RoleDetailsPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
