import { Navigate, createBrowserRouter } from 'react-router-dom';
import { AppShell } from '@widgets/app-shell/ui/AppShell';
import { LoginPage } from '@pages/LoginPage';
import { AnalyticsPage } from '@pages/AnalyticsPage';
import { AuditPage } from '@pages/AuditPage';
import { AuditLogPage } from '@pages/AuditLogPage';
import { DealersPage } from '@pages/DealersPage';
import { NomenclaturePage } from '@pages/NomenclaturePage';
import { ProductDetailsPage } from '@pages/ProductDetailsPage';
import { UsersPage } from '@pages/UsersPage';
import { UserDetailsPage } from '@pages/UserDetailsPage';
import { RolesPage } from '@pages/RolesPage';
import { RoleDetailsPage } from '@pages/RoleDetailsPage';
import { ProfilePage } from '@pages/ProfilePage';
import { SettingsPage } from '@pages/SettingsPage';
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
          { path: 'audit', element: <AuditPage /> },
          { path: 'audit/log', element: <AuditLogPage /> },
          { path: 'dealers', element: <DealersPage /> },
          { path: 'nomenclature', element: <NomenclaturePage /> },
          { path: 'nomenclature/:id', element: <ProductDetailsPage /> },
          { path: 'access/users', element: <UsersPage /> },
          { path: 'access/users/:id', element: <UserDetailsPage /> },
          { path: 'access/roles', element: <RolesPage /> },
          { path: 'access/roles/:id', element: <RoleDetailsPage /> },
          { path: 'profile', element: <ProfilePage /> },
          { path: 'settings', element: <SettingsPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
