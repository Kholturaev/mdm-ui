// AppLayout — shell that wraps all authenticated pages.
// Sidebar is fixed left; content scrolls in the remaining viewport.
// TODO Phase 2: add collapsible sidebar, top header bar, breadcrumbs.

import { Outlet } from 'react-router';
import { Sidebar } from './Sidebar';

export function AppLayout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main
        style={{
          marginLeft: 'var(--sidebar-width)',
          flex: 1,
          minWidth: 0,
          backgroundColor: 'var(--surface-page)',
          minHeight: '100vh',
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}
