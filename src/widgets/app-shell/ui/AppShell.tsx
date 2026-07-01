import { Outlet } from 'react-router-dom';
import { PageTitleProvider } from '@shared/lib/pageTitle';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function AppShell() {
  return (
    <PageTitleProvider>
      <div className="bg-bg flex h-screen">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-auto p-3">
            <Outlet />
          </main>
        </div>
      </div>
    </PageTitleProvider>
  );
}
