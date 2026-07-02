import { Navigate, createBrowserRouter } from 'react-router-dom';
import { AppShell } from '@widgets/app-shell/ui/AppShell';
import { LoginPage } from '@pages/LoginPage';
import { DealersPage } from '@pages/DealersPage';
import { NomenclaturePage } from '@pages/NomenclaturePage';
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
          { index: true, element: <Navigate to="/dealers" replace /> },
          { path: 'dealers', element: <DealersPage /> },
          { path: 'nomenclature', element: <NomenclaturePage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
