// KpiCard — displays a single KPI metric with optional trend indicator.
// Usage: <KpiCard label="Total products" value={1240} trend="up" onClick={...} />
//
// Data is injected via props; this component makes no API calls.

import React from 'react';

export type TrendDirection = 'up' | 'down' | 'flat';

export interface KpiCardProps {
  label: string;
  value: string | number;
  trend?: TrendDirection;
  onClick?: () => void;
}

const TrendUpIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </svg>
);

const TrendDownIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
    <polyline points="16 17 22 17 22 11" />
  </svg>
);

const TrendFlatIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="15 8 19 12 15 16" />
  </svg>
);

const TREND_CONFIG: Record<TrendDirection, { icon: React.ReactNode; color: string }> = {
  up:   { icon: <TrendUpIcon />,   color: 'var(--color-success-700)' },
  down: { icon: <TrendDownIcon />, color: 'var(--color-error-700)'   },
  flat: { icon: <TrendFlatIcon />, color: 'var(--text-secondary)'    },
};

export function KpiCard({ label, value, trend, onClick }: KpiCardProps) {
  const isClickable = typeof onClick === 'function';

  const cardStyle: React.CSSProperties = {
    backgroundColor: 'var(--surface-card)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-sm)',
    padding: 'var(--layout-card-padding)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-2)',
    cursor: isClickable ? 'pointer' : 'default',
    transition: 'box-shadow var(--transition-fast)',
    outline: 'none',
  };

  const Tag = isClickable ? 'button' : 'div';

  return (
    <Tag
      style={cardStyle}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (isClickable) {
          (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)';
        }
      }}
      onMouseLeave={(e) => {
        if (isClickable) {
          (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-sm)';
        }
      }}
      {...(isClickable ? { type: 'button' as const } : {})}
    >
      <span
        style={{
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--font-medium)' as React.CSSProperties['fontWeight'],
          color: 'var(--text-secondary)',
          lineHeight: 'var(--leading-tight)',
        }}
      >
        {label}
      </span>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        <span
          style={{
            fontSize: 'var(--text-3xl)',
            fontWeight: 'var(--font-bold)' as React.CSSProperties['fontWeight'],
            color: 'var(--text-primary)',
            lineHeight: 'var(--leading-tight)',
          }}
        >
          {value}
        </span>

        {trend && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              color: TREND_CONFIG[trend].color,
            }}
          >
            {TREND_CONFIG[trend].icon}
          </span>
        )}
      </div>
    </Tag>
  );
}
