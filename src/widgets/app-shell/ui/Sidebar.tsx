import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@shared/lib/cn';
import { BuildingIcon } from '@shared/ui/icons/BuildingIcon';
import { LayersIcon } from '@shared/ui/icons/LayersIcon';
import { BarChartIcon } from '@shared/ui/icons/BarChartIcon';
import { ShieldIcon } from '@shared/ui/icons/ShieldIcon';
import { ActivityIcon } from '@shared/ui/icons/ActivityIcon';
import { ShareIcon } from '@shared/ui/icons/ShareIcon';
import { ChevronDownIcon } from '@shared/ui/icons/ChevronDownIcon';
import { usePermission } from '@shared/lib/hooks/usePermission';
import { Permissions } from '@shared/constants/permissions';

type NavChild = { to: string; labelKey: string; permission?: string };
type TooltipState = { key: string; top: number; left: number };
type NavGroup = {
  kind: 'group';
  key: string;
  labelKey: string;
  icon: ReactNode;
  children: NavChild[];
};
type NavFlatLink = {
  kind: 'link';
  key: string;
  labelKey: string;
  icon: ReactNode;
  to: string;
};
type NavEntry = NavGroup | NavFlatLink;

// Not every section needs a parent/child dropdown — a flat `link` entry
// (e.g. `audit`) navigates directly, with no expand/collapse chevron.
const NAV_ITEMS: NavEntry[] = [
  {
    kind: 'group',
    key: 'analytics',
    labelKey: 'nav.analytics',
    icon: <BarChartIcon size={18} />,
    children: [{ to: '/analytics', labelKey: 'nav.analytics' }],
  },
  {
    kind: 'link',
    key: 'audit',
    labelKey: 'nav.audit',
    icon: <ActivityIcon size={18} />,
    to: '/audit',
  },
  {
    kind: 'group',
    key: 'dealership',
    labelKey: 'nav.dealership',
    icon: <BuildingIcon size={18} />,
    children: [{ to: '/dealers', labelKey: 'nav.dealers' }],
  },
  {
    kind: 'group',
    key: 'nsi',
    labelKey: 'nav.nsi',
    icon: <LayersIcon size={18} />,
    children: [
      { to: '/nomenclature', labelKey: 'nav.nomenclature' },
      {
        to: '/product-groups',
        labelKey: 'nav.productGroups',
        permission: Permissions.PRODUCT_GROUP.READ,
      },
      {
        to: '/product-categories',
        labelKey: 'nav.productCategories',
        permission: Permissions.PRODUCT_CATEGORY.READ,
      },
      {
        to: '/characteristics',
        labelKey: 'nav.characteristics',
        permission: Permissions.CHARACTERISTICS_GROUP.READ,
      },
      {
        to: '/units',
        labelKey: 'nav.units',
        permission: Permissions.UNIT.READ,
      },
      {
        to: '/currencies',
        labelKey: 'nav.currencies',
        permission: Permissions.CURRENCY.READ,
      },
      {
        to: '/accounting-products',
        labelKey: 'nav.accountingProducts',
        permission: Permissions.ACCOUNTING_PRODUCT.READ,
      },
    ],
  },
  {
    kind: 'group',
    key: 'integrations',
    labelKey: 'nav.integrations',
    icon: <ShareIcon size={18} />,
    children: [
      {
        to: '/external-systems',
        labelKey: 'nav.externalSystems',
        permission: Permissions.EXTERNAL_SYSTEM.READ,
      },
      {
        to: '/integration-configs',
        labelKey: 'nav.integrationConfigs',
        permission: Permissions.INTEGRATION_CONFIG.READ,
      },
    ],
  },
  {
    kind: 'group',
    key: 'access',
    labelKey: 'nav.access',
    icon: <ShieldIcon size={18} />,
    children: [
      { to: '/access/users', labelKey: 'nav.users' },
      { to: '/access/roles', labelKey: 'nav.roles' },
    ],
  },
];

const COLLAPSE_STORAGE_KEY = 'mdm:sidebar-collapsed';

function isEntryActive(entry: NavEntry, pathname: string): boolean {
  if (entry.kind === 'link') return pathname.startsWith(entry.to);
  return entry.children.some((child) => pathname.startsWith(child.to));
}

function primaryTo(entry: NavEntry): string {
  return entry.kind === 'link' ? entry.to : entry.children[0].to;
}

type SidebarProps = {
  /** Forces the collapsed (icon-only) layout regardless of the user's own toggle preference — e.g. on the product details page, which needs the width back. Doesn't touch the persisted preference, so it resumes once the user navigates away. */
  forceCollapsed?: boolean;
};

export function Sidebar({ forceCollapsed = false }: SidebarProps) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const { can } = usePermission();

  // A child with no `permission` is always visible; a group that ends up
  // with zero visible children (everything in it gated) is dropped entirely
  // rather than rendered empty.
  const navItems = useMemo<NavEntry[]>(() => {
    const result: NavEntry[] = [];
    for (const entry of NAV_ITEMS) {
      if (entry.kind === 'link') {
        result.push(entry);
        continue;
      }
      const children = entry.children.filter(
        (child) => !child.permission || can(child.permission),
      );
      if (children.length > 0) result.push({ ...entry, children });
    }
    return result;
  }, [can]);

  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem(COLLAPSE_STORAGE_KEY) === '1',
  );
  const effectiveCollapsed = collapsed || forceCollapsed;

  const activeGroupKey =
    navItems.find(
      (entry) => entry.kind === 'group' && isEntryActive(entry, pathname),
    )?.key ?? null;

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

  // Tooltip for collapsed icons is portalled to <body> — rendering it inline
  // would push past the sidebar's narrow width and force an unwanted
  // horizontal scrollbar on `nav` (its `overflow-y-auto` implicitly turns
  // `overflow-x` into `auto` too, per spec).
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  // The hovered icon unmounts once the sidebar expands, so it never fires
  // `onMouseLeave` — clear the tooltip during render instead of relying on it.
  const [lastCollapsed, setLastCollapsed] = useState(effectiveCollapsed);
  if (effectiveCollapsed !== lastCollapsed) {
    setLastCollapsed(effectiveCollapsed);
    if (!effectiveCollapsed) setTooltip(null);
  }

  return (
    <aside
      className={cn(
        'border-border bg-surface relative flex flex-col border-r transition-[width] duration-200',
        effectiveCollapsed ? 'w-16' : 'w-56',
      )}
    >
      <div className="border-border flex h-12 items-center border-b px-4 text-sm font-semibold">
        {effectiveCollapsed ? 'M' : 'MDM'}
      </div>

      <button
        type="button"
        onClick={() => setCollapsed((value) => !value)}
        aria-label={t(
          effectiveCollapsed ? 'nav.expandSidebar' : 'nav.collapseSidebar',
        )}
        className="border-border bg-surface text-fg-muted hover:text-fg absolute top-5 -right-3 flex size-6 items-center justify-center rounded-full border shadow-sm transition-colors"
      >
        <ChevronDownIcon
          size={12}
          className={effectiveCollapsed ? '-rotate-90' : 'rotate-90'}
        />
      </button>

      <nav className="flex flex-col gap-1 overflow-y-auto p-2">
        {navItems.map((entry) => {
          const active = isEntryActive(entry, pathname);

          if (effectiveCollapsed) {
            return (
              <NavLink
                key={entry.key}
                to={primaryTo(entry)}
                onClick={() => setCollapsed(false)}
                onMouseEnter={(event) => {
                  const rect = event.currentTarget.getBoundingClientRect();
                  setTooltip({
                    key: entry.key,
                    top: rect.top + rect.height / 2,
                    left: rect.right + 8,
                  });
                }}
                onMouseLeave={() => setTooltip(null)}
                className={cn(
                  'flex h-9 items-center justify-center rounded-md transition-colors',
                  active
                    ? 'bg-primary/10 text-primary dark:text-white'
                    : 'text-fg-muted hover:bg-surface-hover hover:text-fg',
                )}
              >
                {entry.icon}
              </NavLink>
            );
          }

          if (entry.kind === 'link') {
            return (
              <NavLink
                key={entry.key}
                to={entry.to}
                className={cn(
                  'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'text-primary dark:text-white'
                    : 'text-fg-muted hover:bg-surface-hover hover:text-fg',
                )}
              >
                {entry.icon}
                <span className="flex-1 text-left">{t(entry.labelKey)}</span>
              </NavLink>
            );
          }

          const isOpen = openGroupKey === entry.key;

          return (
            <div key={entry.key} className="flex flex-col gap-0.5">
              <button
                type="button"
                onClick={() =>
                  setManualOpenGroupKey((current) =>
                    current === entry.key ? null : entry.key,
                  )
                }
                className={cn(
                  'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'text-primary dark:text-white'
                    : 'text-fg-muted hover:bg-surface-hover hover:text-fg',
                )}
              >
                {entry.icon}
                <span className="flex-1 text-left">{t(entry.labelKey)}</span>
                <ChevronDownIcon
                  size={14}
                  className={cn('transition-transform', isOpen && 'rotate-180')}
                />
              </button>

              {isOpen && (
                <div className="border-border ml-3.5 flex flex-col gap-0.5 border-l pl-3">
                  {entry.children.map((child) => (
                    <NavLink
                      key={child.to}
                      to={child.to}
                      className={({ isActive }) =>
                        cn(
                          'text-fg-muted hover:bg-surface-hover hover:text-fg rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                          isActive &&
                            'bg-primary/10 text-primary dark:text-white',
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

      {tooltip &&
        createPortal(
          <div
            style={{ top: tooltip.top, left: tooltip.left }}
            className="bg-fg text-fg-invert pointer-events-none fixed z-100 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-medium whitespace-nowrap shadow-lg"
          >
            {t(navItems.find((entry) => entry.key === tooltip.key)!.labelKey)}
          </div>,
          document.body,
        )}
    </aside>
  );
}
