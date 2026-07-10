import { Outlet, useMatch } from 'react-router-dom';
import { BackLinkProvider } from '@shared/lib/backLink';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function AppShell() {
  // The product details page builds its own header (name, status, ring,
  // save/activate) and needs the horizontal space back, so the global chrome
  // steps aside instead of stacking a second header/full sidebar above it.
  const isProductDetails = Boolean(useMatch('/nomenclature/:id'));
  // Role/user detail pages keep the global header but still want the extra
  // width back for their permission lists, so only the sidebar collapses.
  const isRoleDetails = Boolean(useMatch('/access/roles/:id'));
  const isUserDetails = Boolean(useMatch('/access/users/:id'));
  const forceSidebarCollapsed =
    isProductDetails || isRoleDetails || isUserDetails;

  return (
    <BackLinkProvider>
      <div className="bg-bg flex h-screen">
        <Sidebar forceCollapsed={forceSidebarCollapsed} />
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
