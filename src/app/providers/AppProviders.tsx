import type { ReactNode } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from '@app/store';
import { ThemeProvider } from './ThemeProvider';
import '@shared/i18n/config';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ReduxProvider store={store}>
      <ThemeProvider>{children}</ThemeProvider>
    </ReduxProvider>
  );
}
