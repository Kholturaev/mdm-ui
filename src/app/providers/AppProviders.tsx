import type { ReactNode } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { store } from '@app/store';
import { ThemeProvider } from './ThemeProvider';
import '@shared/i18n/config';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ReduxProvider store={store}>
      <ThemeProvider>
        {children}
        <ToastContainer position="top-right" autoClose={4000} theme="colored" />
      </ThemeProvider>
    </ReduxProvider>
  );
}
