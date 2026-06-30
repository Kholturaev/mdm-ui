// App — root component: Redux Provider + React Router.
// Phase 1: all routes wired; non-implemented pages show PlaceholderPage.

import { Provider } from 'react-redux';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router';
import { store } from './app/store';
import { AppLayout } from './shared/layout/AppLayout';
import { PrivateRoute } from './shared/auth/PrivateRoute';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { PlaceholderPage } from './pages/_placeholder/PlaceholderPage';
import { ForbiddenPage } from './pages/forbidden/ForbiddenPage';
import { ROUTES } from './shared/constants/routes';

// Phase-2 placeholder factory — keeps router definition concise.
const ph = (title: string) => <PlaceholderPage title={title} />;

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      // Root → dashboard
      { index: true, element: <Navigate to={ROUTES.DASHBOARD} replace /> },

      // Dashboard (no permission required)
      { path: 'dashboard', element: <DashboardPage /> },

      // ── CATALOG ─────────────────────────────────────────────────────────
      {
        element: <PrivateRoute permission="PRODUCT_READ" />,
        children: [
          { path: 'products',       element: ph('Products') },
          { path: 'products/:id',   element: ph('Product Detail') },
        ],
      },
      {
        element: <PrivateRoute permission="CHARACTERISTICS_GET" />,
        children: [{ path: 'characteristics', element: ph('Characteristics') }],
      },
      { path: 'classification', element: ph('Classification') },

      // ── COMMERCIAL ──────────────────────────────────────────────────────
      {
        element: <PrivateRoute permission="PRODUCT_RATE_READ" />,
        children: [{ path: 'pricing', element: ph('Pricing') }],
      },
      {
        element: <PrivateRoute permission="CURRENCY_READ" />,
        children: [{ path: 'pricing/currencies', element: ph('Currencies') }],
      },
      {
        element: <PrivateRoute permission="CLIENT_TYPE_READ" />,
        children: [{ path: 'partners/client-types', element: ph('Client Types') }],
      },
      {
        element: <PrivateRoute permission="SEGMENT_READ" />,
        children: [{ path: 'partners/segments', element: ph('Segments') }],
      },
      {
        element: <PrivateRoute permission="DEALER_DISCOUNT_READ" />,
        children: [{ path: 'partners/discounts', element: ph('Discounts') }],
      },

      // ── OPERATIONS ──────────────────────────────────────────────────────
      {
        element: <PrivateRoute permission="EXTERNAL_SYSTEM_READ" />,
        children: [
          { path: 'integrations',       element: ph('Integrations') },
          { path: 'integrations/:id',   element: ph('Integration Detail') },
        ],
      },
      {
        element: <PrivateRoute permission="DEALER_READ" />,
        children: [
          { path: 'partners/dealers',       element: ph('Partners / Dealers') },
          { path: 'partners/dealers/:id',   element: ph('Dealer Detail') },
        ],
      },
      {
        element: <PrivateRoute permission="REGION_READ" />,
        children: [{ path: 'geography', element: ph('Geography') }],
      },
      { path: 'import', element: ph('Import') },

      // ── ADMINISTRATION ───────────────────────────────────────────────────
      {
        element: <PrivateRoute permission="USER_READ" />,
        children: [
          { path: 'users',       element: ph('Users & Access') },
          { path: 'users/:id',   element: ph('User Detail') },
        ],
      },
      {
        element: <PrivateRoute permission="PERFORM_AUDIT" />,
        children: [
          { path: 'audit/sessions',       element: ph('Audit — Sessions') },
          { path: 'audit/sessions/:id',   element: ph('Session Detail') },
          { path: 'audit/changes',        element: ph('Audit — Changes') },
        ],
      },
      { path: 'health',    element: ph('Platform Health') },
      { path: 'settings',  element: ph('Settings') },

      // Meta
      { path: 'forbidden', element: <ForbiddenPage /> },
      { path: '*',         element: <ForbiddenPage /> },
    ],
  },
]);

export default function App() {
  return (
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  );
}
