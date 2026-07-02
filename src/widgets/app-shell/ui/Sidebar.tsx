import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@shared/lib/cn';
import { BuildingIcon } from '@shared/ui/icons/BuildingIcon';
import { LayersIcon } from '@shared/ui/icons/LayersIcon';
import { ChevronDownIcon } from '@shared/ui/icons/ChevronDownIcon';

type NavChild = { to: string; labelKey: string };
type NavGroup = {
  key: string;
  labelKey: string;
  icon: ReactNode;
  children: NavChild[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    key: 'dealership',
    labelKey: 'nav.dealership',
    icon: <BuildingIcon size={18} />,
    children: [{ to: '/dealers', labelKey: 'nav.dealers' }],
  },
  {
    key: 'nsi',
    labelKey: 'nav.nsi',
    icon: <LayersIcon size={18} />,
    children: [{ to: '/nomenclature', labelKey: 'nav.nomenclature' }],
  },
];

const COLLAPSE_STORAGE_KEY = 'mdm:sidebar-collapsed';

function isGroupActive(group: NavGroup, pathname: string) {
  return group.children.some((child) => pathname.startsWith(child.to));
}

export function Sidebar() {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem(COLLAPSE_STORAGE_KEY) === '1',
  );

  const activeGroupKey =
    NAV_GROUPS.find((group) => isGroupActive(group, pathname))?.key ?? null;

  // Track the route's active group so navigation (not just clicks) can open
  // its section — adjusted during render instead of an effect, per
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  const [lastActiveGroupKey, setLastActiveGroupKey] = useState(activeGroupKey);
  const [manualOpenGroupKey, setManualOpenGroupKey] = useState<string | null>(
    activeGroupKey,
  );
  if (activeGroupKey !== lastActiveGroupKey) {
    setLastActiveGroupKey(activeGroupKey);
    setManualOpenGroupKey(activeGroupKey);
  }
  const openGroupKey = manualOpenGroupKey;

  useEffect(() => {
    localStorage.setItem(COLLAPSE_STORAGE_KEY, collapsed ? '1' : '0');
  }, [collapsed]);

  return (
    <aside
      className={cn(
        'border-border bg-surface relative flex flex-col border-r transition-[width] duration-200',
        collapsed ? 'w-16' : 'w-56',
      )}
    >
      <div className="border-border flex h-12 items-center border-b px-4 text-sm font-semibold">
        {collapsed ? 'M' : 'MDM'}
      </div>

      <button
        type="button"
        onClick={() => setCollapsed((value) => !value)}
        aria-label={t(collapsed ? 'nav.expandSidebar' : 'nav.collapseSidebar')}
        className="border-border bg-surface text-fg-muted hover:text-fg absolute top-5 -right-3 flex size-6 items-center justify-center rounded-full border shadow-sm transition-colors"
      >
        <ChevronDownIcon
          size={12}
          className={collapsed ? '-rotate-90' : 'rotate-90'}
        />
      </button>

      <nav className="flex flex-col gap-1 overflow-y-auto p-2">
        {NAV_GROUPS.map((group) => {
          const active = isGroupActive(group, pathname);
          const isOpen = openGroupKey === group.key;

          if (collapsed) {
            return (
              <div key={group.key} className="group relative">
                <NavLink
                  to={group.children[0].to}
                  className={cn(
                    'flex h-9 items-center justify-center rounded-md transition-colors',
                    active
                      ? 'bg-primary/10 text-primary'
                      : 'text-fg-muted hover:bg-surface-hover hover:text-fg',
                  )}
                >
                  {group.icon}
                </NavLink>
                <span className="bg-fg text-fg-invert pointer-events-none absolute top-1/2 left-full z-50 ml-2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-medium whitespace-nowrap opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                  {t(group.labelKey)}
                </span>
              </div>
            );
          }

          return (
            <div key={group.key} className="flex flex-col gap-0.5">
              <button
                type="button"
                onClick={() =>
                  setManualOpenGroupKey((current) =>
                    current === group.key ? null : group.key,
                  )
                }
                className={cn(
                  'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'text-primary'
                    : 'text-fg-muted hover:bg-surface-hover hover:text-fg',
                )}
              >
                {group.icon}
                <span className="flex-1 text-left">{t(group.labelKey)}</span>
                <ChevronDownIcon
                  size={14}
                  className={cn('transition-transform', isOpen && 'rotate-180')}
                />
              </button>

              {isOpen && (
                <div className="border-border ml-3.5 flex flex-col gap-0.5 border-l pl-3">
                  {group.children.map((child) => (
                    <NavLink
                      key={child.to}
                      to={child.to}
                      className={({ isActive }) =>
                        cn(
                          'text-fg-muted hover:bg-surface-hover hover:text-fg rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                          isActive && 'bg-primary/10 text-primary',
                        )
                      }
                    >
                      {t(child.labelKey)}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
