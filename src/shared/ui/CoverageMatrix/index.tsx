// CoverageMatrix — product × external-system coverage grid.
// Usage: <CoverageMatrix products={rows} systems={cols} />
//
// Data is injected via props; this component makes no API calls.
//
// BACKEND-NEEDED for non-binary cell states:
//   mapping.status:    'SYNCED' | 'PENDING' | 'FAILED'  — explicit sync result
//   mapping.lastSyncAt: string (ISO)                     — timestamp of last sync attempt
//   mapping.lastError:  string | null                    — error detail when FAILED
//   STALE is a derived state: product.updatedAt > mapping.lastSyncAt
//
// Only SYNCED and MISSING are real today (from product.externalSystemIds presence).
// PENDING and FAILED are rendered from mock data only — do not treat as real data
// until the backend fields above exist. See also src/shared/mocks/index.mock.ts.

import React from 'react';
import { useTranslation } from 'react-i18next';

export type CoverageState = 'SYNCED' | 'MISSING' | 'PENDING' | 'FAILED';

export interface CoverageMatrixProduct {
  id: number;
  name: string;
  /** systemId → coverage state; undefined/missing key treated as MISSING */
  coverage: Record<number, CoverageState>;
}

export interface CoverageMatrixSystem {
  id: number;
  name: string;
  code: string;
}

export interface CoverageMatrixProps {
  products: CoverageMatrixProduct[];
  systems: CoverageMatrixSystem[];
}

// ─── Cell icons ──────────────────────────────────────────────────────────────

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const DashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// ─── Cell config ─────────────────────────────────────────────────────────────

interface CellConfig {
  icon: React.ReactNode;
  bg: string;
  color: string;
  labelKey: string;
}

const CELL_CONFIG: Record<CoverageState, CellConfig> = {
  SYNCED:  { icon: <CheckIcon />, bg: 'var(--badge-active-bg)',  color: 'var(--badge-active-text)',  labelKey: 'common.status.SYNCED'  },
  MISSING: { icon: <DashIcon />,  bg: 'var(--badge-passive-bg)', color: 'var(--badge-passive-text)', labelKey: 'common.status.MISSING' },
  PENDING: { icon: <ClockIcon />, bg: 'var(--badge-info-bg)',    color: 'var(--badge-info-text)',    labelKey: 'common.status.PENDING' },
  FAILED:  { icon: <XIcon />,    bg: 'var(--badge-error-bg)',   color: 'var(--badge-error-text)',   labelKey: 'common.status.FAILED'  },
};

// ─── CoverageCell (private) ───────────────────────────────────────────────────

function CoverageCell({ state, label }: { state: CoverageState; label: string }) {
  const cfg = CELL_CONFIG[state];
  return (
    <div
      title={label}
      aria-label={label}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 28,
        height: 28,
        borderRadius: 'var(--radius-md)',
        backgroundColor: cfg.bg,
        color: cfg.color,
        margin: '0 auto',
      }}
    >
      {cfg.icon}
    </div>
  );
}

// ─── CoverageMatrix ───────────────────────────────────────────────────────────

export function CoverageMatrix({ products, systems }: CoverageMatrixProps) {
  const { t } = useTranslation();

  if (products.length === 0 || systems.length === 0) return null;

  const thCell: React.CSSProperties = {
    padding: 'var(--space-2) var(--space-3)',
    fontSize: 'var(--text-xs)',
    fontWeight: 'var(--font-semibold)' as React.CSSProperties['fontWeight'],
    color: 'var(--table-header-text)',
    backgroundColor: 'var(--table-header-bg)',
    borderBottom: '1px solid var(--border-subtle)',
    whiteSpace: 'nowrap',
    textAlign: 'center' as const,
  };

  const tdCell: React.CSSProperties = {
    padding: 'var(--space-2) var(--space-3)',
    borderBottom: '1px solid var(--border-subtle)',
    fontSize: 'var(--text-sm)',
    color: 'var(--text-primary)',
    height: 'var(--layout-table-compact-row-height)',
    textAlign: 'center' as const,
  };

  return (
    <div style={{ overflowX: 'auto' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          backgroundColor: 'var(--surface-card)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <thead>
          <tr>
            <th style={{ ...thCell, textAlign: 'left', minWidth: 200, position: 'sticky', left: 0, backgroundColor: 'var(--table-header-bg)', zIndex: 1 }}>
              {/* product name column — no translation needed, label provided by caller */}
            </th>
            {systems.map((sys) => (
              <th key={sys.id} style={thCell} title={sys.name}>
                {sys.code}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {products.map((product, idx) => (
            <tr
              key={product.id}
              style={{
                backgroundColor: idx % 2 === 0 ? 'var(--table-row-bg)' : 'var(--color-neutral-50)',
              }}
            >
              <td
                style={{
                  ...tdCell,
                  textAlign: 'left',
                  fontWeight: 'var(--font-medium)' as React.CSSProperties['fontWeight'],
                  maxWidth: 260,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  position: 'sticky',
                  left: 0,
                  backgroundColor: idx % 2 === 0 ? 'var(--table-row-bg)' : 'var(--color-neutral-50)',
                  zIndex: 1,
                }}
                title={product.name}
              >
                {product.name}
              </td>

              {systems.map((sys) => {
                const state: CoverageState = product.coverage[sys.id] ?? 'MISSING';
                const label = `${product.name} / ${sys.name}: ${t(CELL_CONFIG[state].labelKey)}`;
                return (
                  <td key={sys.id} style={tdCell}>
                    <CoverageCell state={state} label={label} />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
