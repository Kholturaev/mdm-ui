// AuditTimeline — vertical timeline of audit / activity events.
// Usage: <AuditTimeline items={history} />
//
// Each item shows timestamp + user + action badge. Field changes are collapsed
// by default and expand on click (animated via Framer Motion).
//
// Data is injected via props; this component makes no API calls.
//
// BACKEND-NEEDED: Field changes (changes[]) require ActivityLog.changes[] from
// the backend (see docs/08-audit-activity.md and docs/01-data-models.md IActivityLog).
// Pass pre-fetched changes via the `changes` prop.
//
// SPEC-GAP: Action badge colors are not defined in the spec; using semantic tokens:
//   CREATE/APPROVE → active (green), UPDATE → info (blue),
//   DELETE → error (red), EXPORT/IMPORT → warning, LOGIN → passive (gray).

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

// Matches ActivityAction from docs/01-data-models.md
export type AuditAction =
  | 'CREATE' | 'UPDATE' | 'DELETE'
  | 'EXPORT' | 'IMPORT'
  | 'LOGIN'
  | 'APPROVE';

export interface FieldChange {
  field: string;
  oldValue: string;
  newValue: string;
}

export interface AuditTimelineItem {
  id: string;
  /** ISO 8601 timestamp */
  timestamp: string;
  user: string;
  action: AuditAction;
  changes: FieldChange[];
}

export interface AuditTimelineProps {
  items: AuditTimelineItem[];
}

// ─── Action badge config ──────────────────────────────────────────────────────

type BadgeVariant = 'active' | 'info' | 'error' | 'warning' | 'passive';

const ACTION_VARIANT: Record<AuditAction, BadgeVariant> = {
  CREATE:  'active',
  APPROVE: 'active',
  UPDATE:  'info',
  DELETE:  'error',
  EXPORT:  'warning',
  IMPORT:  'warning',
  LOGIN:   'passive',
};

interface VariantStyle { bg: string; color: string; border: string }

const VARIANT_STYLES: Record<BadgeVariant, VariantStyle> = {
  active:  { bg: 'var(--badge-active-bg)',  color: 'var(--badge-active-text)',  border: 'var(--badge-active-border)'  },
  info:    { bg: 'var(--badge-info-bg)',    color: 'var(--badge-info-text)',    border: 'var(--badge-info-border)'    },
  error:   { bg: 'var(--badge-error-bg)',   color: 'var(--badge-error-text)',   border: 'var(--badge-error-border)'   },
  warning: { bg: 'var(--badge-warning-bg)', color: 'var(--badge-warning-text)', border: 'var(--badge-warning-border)' },
  passive: { bg: 'var(--badge-passive-bg)', color: 'var(--badge-passive-text)', border: 'var(--badge-passive-border)' },
};

// ─── Chevron icons ────────────────────────────────────────────────────────────

const ChevronDownIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const ChevronUpIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="18 15 12 9 6 15" />
  </svg>
);

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTimestamp(iso: string): string {
  try {
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit', month: '2-digit',
      hour: '2-digit', minute: '2-digit',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

// ─── AuditTimeline ────────────────────────────────────────────────────────────

export function AuditTimeline({ items }: AuditTimelineProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  if (items.length === 0) return null;

  return (
    <ol
      style={{
        listStyle: 'none',
        margin: 0,
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
      }}
    >
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        const variant = ACTION_VARIANT[item.action];
        const vs = VARIANT_STYLES[variant];
        const isExpanded = expanded.has(item.id);
        const hasChanges = item.changes.length > 0;

        return (
          <li
            key={item.id}
            style={{ display: 'flex', gap: 'var(--space-3)', position: 'relative' }}
          >
            {/* Timeline track */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: 20 }}>
              {/* Dot */}
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: vs.color,
                  border: `2px solid ${vs.border}`,
                  flexShrink: 0,
                  marginTop: 'var(--space-1)',
                }}
              />
              {/* Vertical line */}
              {!isLast && (
                <div
                  style={{
                    flex: 1,
                    width: 2,
                    backgroundColor: 'var(--border-subtle)',
                    minHeight: 'var(--space-4)',
                  }}
                />
              )}
            </div>

            {/* Content */}
            <div style={{ flex: 1, paddingBottom: isLast ? 0 : 'var(--space-4)' }}>
              {/* Top row: timestamp + user + action badge */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  flexWrap: 'wrap',
                }}
              >
                <span
                  style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--text-secondary)',
                    fontFamily: 'var(--font-mono)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {formatTimestamp(item.timestamp)}
                </span>

                <span
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-medium)' as React.CSSProperties['fontWeight'],
                    color: 'var(--text-primary)',
                  }}
                >
                  {item.user}
                </span>

                {/* Action badge */}
                <span
                  style={{
                    fontSize: 'var(--text-xs)',
                    fontWeight: 'var(--font-semibold)' as React.CSSProperties['fontWeight'],
                    backgroundColor: vs.bg,
                    color: vs.color,
                    border: `1px solid ${vs.border}`,
                    borderRadius: 'var(--radius-full)',
                    padding: '2px var(--space-2)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {t(`common.action.${item.action}`)}
                </span>
              </div>

              {/* Expand/collapse toggle */}
              {hasChanges && (
                <button
                  type="button"
                  onClick={() => toggle(item.id)}
                  style={{
                    marginTop: 'var(--space-1)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 'var(--space-1)',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--text-link)',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                  aria-expanded={isExpanded}
                >
                  {isExpanded ? (
                    <>
                      <ChevronUpIcon />
                      {t('common.audit.hideChanges')}
                    </>
                  ) : (
                    <>
                      <ChevronDownIcon />
                      {t('common.audit.showChanges')} ({item.changes.length})
                    </>
                  )}
                </button>
              )}

              {/* Animated field-change list */}
              <AnimatePresence initial={false}>
                {isExpanded && hasChanges && (
                  <motion.div
                    key={`${item.id}-changes`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div
                      style={{
                        marginTop: 'var(--space-2)',
                        borderLeft: '2px solid var(--border-subtle)',
                        paddingLeft: 'var(--space-3)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--space-1)',
                      }}
                    >
                      {item.changes.map((change, ci) => (
                        <div
                          key={ci}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr auto 1fr',
                            alignItems: 'baseline',
                            gap: 'var(--space-2)',
                            fontSize: 'var(--text-xs)',
                          }}
                        >
                          {/* Field name */}
                          <span
                            style={{
                              color: 'var(--text-secondary)',
                              fontWeight: 'var(--font-medium)' as React.CSSProperties['fontWeight'],
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                            title={change.field}
                          >
                            {change.field}
                          </span>
                          {/* Old → New */}
                          <span style={{ color: 'var(--text-secondary)' }}>→</span>
                          <span
                            style={{
                              display: 'flex',
                              gap: 'var(--space-1)',
                              flexWrap: 'wrap',
                            }}
                          >
                            <span
                              style={{
                                textDecoration: 'line-through',
                                color: 'var(--color-error-700)',
                                fontFamily: 'var(--font-mono)',
                              }}
                            >
                              {change.oldValue}
                            </span>
                            <span
                              style={{
                                color: 'var(--color-success-700)',
                                fontFamily: 'var(--font-mono)',
                              }}
                            >
                              {change.newValue}
                            </span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
