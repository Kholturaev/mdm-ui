import { Outlet, useMatch } from 'react-router-dom';
import { BackLinkProvider } from '@shared/lib/backLink';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function AppShell() {
  // The product details page builds its own header (name, status, ring,
  // save/activate) and needs the horizontal space back, so the global chrome
  // steps aside instead of stacking a second header/full sidebar above it.
  const isProductDetails = Boolean(useMatch('/nomenclature/:id'));

  return (
    <BackLinkProvider>
      <div className="bg-bg flex h-screen">
        <Sidebar forceCollapsed={isProductDetails} />
        <div className="flex flex-1 flex-col overflow-hidden">
          {!isProductDetails && <Header />}
          <main className="min-h-0 flex-1 overflow-hidden">
            <Outlet />
          </main>
        </div>
      </div>
    </BackLinkProvider>
  );
}
