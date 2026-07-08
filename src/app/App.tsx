import { RouterProvider } from 'react-router-dom';
import { AppProviders } from './providers/AppProviders';
import { AuthGate } from './providers/AuthGate';
import { router } from './routes/routes';

export function App() {
  return (
    <AppProviders>
      <AuthGate>
        <RouterProvider router={router} />
      </AuthGate>
    </AppProviders>
  );
}
