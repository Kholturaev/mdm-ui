// StatusBadge — maps business statuses to badge variants.
// Usage: <StatusBadge status="ACTIVE" />
//
// Every badge renders icon + text + color — never color alone (a11y requirement
// from AGENTS.md). Status mapping is the canonical table from docs/11-design-tokens.md.

import { useTranslation } from 'react-i18next';

// All business-entity and sync statuses handled by this badge.
export type BusinessStatus =
  | 'ACTIVE'
  | 'INACTIVE'
  | 'PASSIVE'
  | 'TEMPORARILY_PASSIVE'
  | 'SYNCED'
  | 'PENDING'
  | 'FAILED'
  | 'STALE';

type BadgeVariant = 'active' | 'passive' | 'warning' | 'info' | 'error';

// Canonical mapping from docs/11-design-tokens.md — Status Mapping table.
const VARIANT_MAP: Record<BusinessStatus, BadgeVariant> = {
  ACTIVE:               'active',
  INACTIVE:             'passive',
  PASSIVE:              'passive',
  TEMPORARILY_PASSIVE:  'warning',
  SYNCED:               'active',
  PENDING:              'info',
  FAILED:               'error',
  STALE:                'warning',
};

interface VariantStyle {
  backgroundColor: string;
  color: string;
  borderColor: string;
}

const VARIANT_STYLES: Record<BadgeVariant, VariantStyle> = {
  active:  { backgroundColor: 'var(--badge-active-bg)',  color: 'var(--badge-active-text)',  borderColor: 'var(--badge-active-border)'  },
  passive: { backgroundColor: 'var(--badge-passive-bg)', color: 'var(--badge-passive-text)', borderColor: 'var(--badge-passive-border)' },
  warning: { backgroundColor: 'var(--badge-warning-bg)', color: 'var(--badge-warning-text)', borderColor: 'var(--badge-warning-border)' },
  info:    { backgroundColor: 'var(--badge-info-bg)',    color: 'var(--badge-info-text)',    borderColor: 'var(--badge-info-border)'    },
  error:   { backgroundColor: 'var(--badge-error-bg)',   color: 'var(--badge-error-text)',   borderColor: 'var(--badge-error-border)'   },
};

// Stroke-based, 24×24 viewBox, currentColor — follows icon spec in docs/11-design-tokens.md.
const CheckIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const MinusIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const ClockIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const XIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const WarningIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const VARIANT_ICONS: Record<BadgeVariant, Record<string, React.ReactNode>> = {
  active:  { default: <CheckIcon /> },
  passive: { default: <MinusIcon /> },
  warning: {
    default:              <ClockIcon />,
    TEMPORARILY_PASSIVE:  <ClockIcon />,
    STALE:                <WarningIcon />,
  },
  info:    { default: <ClockIcon /> },
  error:   { default: <XIcon /> },
};

function getIcon(variant: BadgeVariant, status: BusinessStatus): React.ReactNode {
  const icons = VARIANT_ICONS[variant];
  return (icons[status] ?? icons['default']) as React.ReactNode;
}

// ─────────────────────────────────────────────────────────────────────────────

export interface StatusBadgeProps {
  status: BusinessStatus;
  /** sm = 11px font, md = 12px font (default md) */
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const { t } = useTranslation();
  const variant = VARIANT_MAP[status];
  const styles = VARIANT_STYLES[variant];
  const icon = getIcon(variant, status);
  const label = t(`common.status.${status}`);

  return (
    <span
      style={{
        ...styles,
        fontSize: size === 'sm' ? 'var(--text-xs)' : 'var(--text-xs)',
        fontWeight: 'var(--font-medium)' as React.CSSProperties['fontWeight'],
        borderWidth: 1,
        borderStyle: 'solid',
        borderRadius: 'var(--radius-full)',
        padding: size === 'sm' ? '2px var(--space-2)' : '3px var(--space-2)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-1)',
        whiteSpace: 'nowrap',
        lineHeight: 'var(--leading-normal)',
      }}
    >
      {icon}
      {label}
    </span>
  );
}
