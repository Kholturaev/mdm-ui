// CoverageBar — shows how many items out of a total are covered by a given system.
// Usage: <CoverageBar label="SAP ERP" covered={12} total={16} />
//
// Data is injected via props; this component makes no API calls.
//
// SPEC-GAP: Coverage thresholds (≥80% green, ≥50% warning, <50% error) are not
// defined in the spec — assumed from common MDM conventions. Adjust in Phase 2
// once design confirms the breakpoints.

import React from 'react';
import { useTranslation } from 'react-i18next';

export interface CoverageBarProps {
  label: string;
  /** Number of products present / synced in this system */
  covered: number;
  /** Total product count */
  total: number;
}

function barColor(pct: number): string {
  if (pct >= 80) return 'var(--color-success-500)';
  if (pct >= 50) return 'var(--color-warning-500)';
  return 'var(--color-error-500)';
}

export function CoverageBar({ label, covered, total }: CoverageBarProps) {
  const { t } = useTranslation();
  const pct = total > 0 ? Math.round((covered / total) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
      {/* Label + count row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          gap: 'var(--space-2)',
        }}
      >
        <span
          style={{
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-medium)' as React.CSSProperties['fontWeight'],
            color: 'var(--text-primary)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--text-secondary)',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          {covered} {t('common.coverage.of')} {total} — {pct}{t('common.coverage.pct')}
        </span>
      </div>

      {/* Track */}
      <div
        style={{
          height: 8,
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--color-neutral-200)',
          overflow: 'hidden',
        }}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label}: ${pct}%`}
      >
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            borderRadius: 'var(--radius-full)',
            backgroundColor: barColor(pct),
            transition: 'width var(--transition-slow)',
          }}
        />
      </div>
    </div>
  );
}
