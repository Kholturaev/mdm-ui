// Sidebar — 4-group navigation per Phase 1 Part 2 specification.
// Groups: CATALOG · COMMERCIAL · OPERATIONS · ADMINISTRATION
// Geography is nested under Partners in OPERATIONS.
// All colors come from design tokens (no hardcoded hex).

import React, { useState } from 'react';
import { NavLink } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../auth/useAuth';
import { ROUTES } from '../constants/routes';

// ── Icons (stroke-based, 20×20 viewport, currentColor) ──────────────────────

const DashboardIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" />
  </svg>
);
const ProductIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 16V8a2 2 0 0 0-1-1.73L13 2.27a2 2 0 0 0-2 0L4 6.27A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73L11 21.73a2 2 0 0 0 2 0L20 17.73A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);
const CharIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);
const ClassIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);
const PricingIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);
const CurrencyIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" /><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" /><line x1="12" y1="18" x2="12" y2="21" /><line x1="12" y1="3" x2="12" y2="6" />
  </svg>
);
const ClientTypeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const SegmentIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 0 12 2v10z" />
  </svg>
);
const DiscountIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);
const IntegrationIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="18" cy="18" r="3" /><circle cx="6" cy="6" r="3" /><path d="M13 6h3a2 2 0 0 1 2 2v7" /><line x1="6" y1="9" x2="6" y2="21" />
  </svg>
);
const PartnerIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);
const GeoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" /><circle cx="12" cy="10" r="3" />
  </svg>
);
const ImportIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);
const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const AuditIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
  </svg>
);
const HealthIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);
const SettingsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);
const ChevronDownIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
const ChevronRightIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

// ── Nav config ────────────────────────────────────────────────────────────────

interface NavChild {
  key: string;
  labelKey: string;
  route: string;
  icon: React.ReactNode;
  permission?: string;
}

interface NavItem extends NavChild {
  children?: NavChild[];
}

interface NavGroup {
  key: string;
  labelKey: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    key: 'catalog',
    labelKey: 'nav.catalog',
    items: [
      { key: 'products',        labelKey: 'nav.products',        route: ROUTES.PRODUCTS,         icon: <ProductIcon />,    permission: 'PRODUCT_READ' },
      { key: 'characteristics', labelKey: 'nav.characteristics', route: ROUTES.CHARACTERISTICS,  icon: <CharIcon />,       permission: 'CHARACTERISTICS_GET' },
      { key: 'classification',  labelKey: 'nav.classification',  route: ROUTES.CLASSIFICATION,   icon: <ClassIcon /> },
    ],
  },
  {
    key: 'commercial',
    labelKey: 'nav.commercial',
    items: [
      { key: 'pricing',      labelKey: 'nav.pricing',      route: ROUTES.PRICING,               icon: <PricingIcon />,    permission: 'PRODUCT_RATE_READ' },
      { key: 'currencies',   labelKey: 'nav.currencies',   route: ROUTES.PRICING_CURRENCIES,    icon: <CurrencyIcon />,   permission: 'CURRENCY_READ' },
      { key: 'clientTypes',  labelKey: 'nav.clientTypes',  route: ROUTES.PARTNERS_CLIENT_TYPES, icon: <ClientTypeIcon />, permission: 'CLIENT_TYPE_READ' },
      { key: 'segments',     labelKey: 'nav.segments',     route: ROUTES.PARTNERS_SEGMENTS,     icon: <SegmentIcon />,    permission: 'SEGMENT_READ' },
      { key: 'discounts',    labelKey: 'nav.discounts',    route: ROUTES.PARTNERS_DISCOUNTS,    icon: <DiscountIcon />,   permission: 'DEALER_DISCOUNT_READ' },
    ],
  },
  {
    key: 'operations',
    labelKey: 'nav.operations',
    items: [
      { key: 'integrations', labelKey: 'nav.integrations', route: ROUTES.INTEGRATIONS,      icon: <IntegrationIcon />, permission: 'EXTERNAL_SYSTEM_READ' },
      {
        key: 'partners', labelKey: 'nav.partners', route: ROUTES.PARTNERS_DEALERS, icon: <PartnerIcon />, permission: 'DEALER_READ',
        children: [
          { key: 'geography', labelKey: 'nav.geography', route: ROUTES.GEOGRAPHY, icon: <GeoIcon />, permission: 'REGION_READ' },
        ],
      },
      { key: 'import', labelKey: 'nav.import', route: ROUTES.IMPORT, icon: <ImportIcon /> },
    ],
  },
  {
    key: 'administration',
    labelKey: 'nav.administration',
    items: [
      { key: 'users',    labelKey: 'nav.usersAccess',    route: ROUTES.USERS,           icon: <UserIcon />,     permission: 'USER_READ' },
      { key: 'audit',    labelKey: 'nav.auditActivity',  route: ROUTES.AUDIT_SESSIONS,  icon: <AuditIcon />,    permission: 'PERFORM_AUDIT' },
      { key: 'health',   labelKey: 'nav.platformHealth', route: ROUTES.HEALTH,          icon: <HealthIcon /> },
      { key: 'settings', labelKey: 'nav.settings',       route: ROUTES.SETTINGS,        icon: <SettingsIcon /> },
    ],
  },
];

// ── Reusable leaf nav link ────────────────────────────────────────────────────

function LeafLink({ item, indent = false }: { item: NavChild; indent?: boolean }) {
  const { t } = useTranslation();
  return (
    <NavLink
      to={item.route}
      style={({ isActive }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        padding: indent
          ? 'var(--space-2) var(--space-3) var(--space-2) var(--space-8)'
          : 'var(--space-2) var(--space-3)',
        borderRadius: 'var(--radius-md)',
        color: isActive ? 'var(--sidebar-text-active)' : 'var(--sidebar-text)',
        backgroundColor: isActive ? 'var(--sidebar-item-active)' : 'transparent',
        fontWeight: isActive ? 'var(--font-medium)' : 'var(--font-regular)',
        fontSize: 'var(--text-sm)',
        textDecoration: 'none',
        transition: 'background-color var(--transition-fast), color var(--transition-fast)',
        cursor: 'pointer',
      })}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        if (!el.dataset.active) {
          el.style.backgroundColor = 'var(--sidebar-item-hover)';
        }
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        if (!el.dataset.active) {
          el.style.backgroundColor = '';
        }
      }}
    >
      <span style={{ flexShrink: 0, display: 'flex' }}>{item.icon}</span>
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {t(item.labelKey)}
      </span>
    </NavLink>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

export function Sidebar() {
  const { t } = useTranslation();
  const { username } = useAuth();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(['partners']));

  function toggleItem(key: string) {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        width: 'var(--sidebar-width)',
        backgroundColor: 'var(--sidebar-bg)',
        borderRight: '1px solid var(--sidebar-border)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
        overflowY: 'auto',
        overflowX: 'hidden',
      }}
    >
      {/* Brand */}
      <div
        style={{
          padding: 'var(--space-5) var(--space-4)',
          borderBottom: '1px solid var(--sidebar-border)',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: 'var(--text-lg)',
            fontWeight: 'var(--font-bold)' as React.CSSProperties['fontWeight'],
            color: 'var(--color-brand-600)',
            letterSpacing: '-0.01em',
          }}
        >
          AKFA MDM
        </span>
      </div>

      {/* Dashboard — top-level link outside groups */}
      <div style={{ padding: 'var(--space-3) var(--space-2) var(--space-1)' }}>
        <NavLink
          to={ROUTES.DASHBOARD}
          end
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            padding: 'var(--space-2) var(--space-3)',
            borderRadius: 'var(--radius-md)',
            color: isActive ? 'var(--sidebar-text-active)' : 'var(--sidebar-text)',
            backgroundColor: isActive ? 'var(--sidebar-item-active)' : 'transparent',
            fontWeight: isActive
              ? ('var(--font-semibold)' as React.CSSProperties['fontWeight'])
              : ('var(--font-medium)' as React.CSSProperties['fontWeight']),
            fontSize: 'var(--text-sm)',
            textDecoration: 'none',
            transition: 'background-color var(--transition-fast), color var(--transition-fast)',
          })}
        >
          <span style={{ flexShrink: 0, display: 'flex' }}><DashboardIcon /></span>
          <span>{t('nav.dashboard')}</span>
        </NavLink>
      </div>

      {/* Groups */}
      <div style={{ flex: 1, padding: 'var(--space-1) var(--space-2) var(--space-4)' }}>
        {NAV_GROUPS.map((group) => (
          <div key={group.key} style={{ marginBottom: 'var(--space-4)' }}>
            {/* Group label */}
            <div
              style={{
                padding: 'var(--space-3) var(--space-3) var(--space-1)',
                fontSize: '0.6875rem',
                fontWeight: 'var(--font-semibold)' as React.CSSProperties['fontWeight'],
                color: 'var(--sidebar-text-muted)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              {t(group.labelKey)}
            </div>

            {/* Items */}
            {group.items.map((item) => {
              const hasChildren = !!item.children?.length;
              const isExpanded = expandedItems.has(item.key);

              if (!hasChildren) {
                return <LeafLink key={item.key} item={item} />;
              }

              // Item with children (Partners + Geography)
              return (
                <div key={item.key}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {/* The item itself navigates */}
                    <NavLink
                      to={item.route}
                      style={({ isActive }) => ({
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-2)',
                        padding: 'var(--space-2) var(--space-1) var(--space-2) var(--space-3)',
                        borderRadius: 'var(--radius-md) 0 0 var(--radius-md)',
                        color: isActive ? 'var(--sidebar-text-active)' : 'var(--sidebar-text)',
                        backgroundColor: isActive ? 'var(--sidebar-item-active)' : 'transparent',
                        fontWeight: isActive ? 'var(--font-medium)' : 'var(--font-regular)',
                        fontSize: 'var(--text-sm)',
                        textDecoration: 'none',
                        transition: 'background-color var(--transition-fast)',
                        minWidth: 0,
                      })}
                    >
                      <span style={{ flexShrink: 0, display: 'flex' }}>{item.icon}</span>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {t(item.labelKey)}
                      </span>
                    </NavLink>

                    {/* Chevron button to toggle children */}
                    <button
                      type="button"
                      onClick={() => toggleItem(item.key)}
                      aria-expanded={isExpanded}
                      aria-label={isExpanded ? 'Collapse' : 'Expand'}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 28,
                        height: 32,
                        border: 'none',
                        background: 'none',
                        color: 'var(--sidebar-text-muted)',
                        cursor: 'pointer',
                        borderRadius: '0 var(--radius-md) var(--radius-md) 0',
                        flexShrink: 0,
                        padding: 0,
                      }}
                    >
                      {isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
                    </button>
                  </div>

                  {/* Children */}
                  {isExpanded && item.children?.map((child) => (
                    <LeafLink key={child.key} item={child} indent />
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* User footer */}
      <div
        style={{
          padding: 'var(--space-3) var(--space-4)',
          borderTop: '1px solid var(--sidebar-border)',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-brand-100)',
            color: 'var(--color-brand-700)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'var(--text-xs)',
            fontWeight: 'var(--font-semibold)' as React.CSSProperties['fontWeight'],
            flexShrink: 0,
          }}
        >
          {username.slice(0, 2).toUpperCase()}
        </div>
        <span
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--sidebar-text)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {username}
        </span>
      </div>
    </nav>
  );
}
