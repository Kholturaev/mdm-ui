// DashboardPage — /dashboard
// All data comes from src/shared/mocks/index.mock.ts (MOCK_DASHBOARD, MOCK_ACTIVITY).
// No API calls. See docs/09-analytics-dashboard.md for spec.
//
// TODO Phase 2: replace mock data with RTK Query endpoints.
// TODO Phase 2: add Product Status donut chart and trend line charts.

import React from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { KpiCard } from '../../shared/ui/KpiCard';
import { CoverageBar } from '../../shared/ui/CoverageBar';
import {
  MOCK_DASHBOARD,
  MOCK_ACTIVITY,
  type MockActivity,
} from '../../shared/mocks/index.mock';
import { ROUTES } from '../../shared/constants/routes';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatRelativeTime(iso: string): string {
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 2) return '< 1 мин';
    if (mins < 60) return `${mins} мин`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} ч`;
    const days = Math.floor(hrs / 24);
    return `${days} д`;
  } catch {
    return '';
  }
}

// ── Action badge ──────────────────────────────────────────────────────────────

type ActionVariant = 'active' | 'info' | 'error' | 'warning' | 'passive';

const ACTION_VARIANT: Record<MockActivity['action'], ActionVariant> = {
  CREATE:  'active',
  APPROVE: 'active',
  UPDATE:  'info',
  DELETE:  'error',
  EXPORT:  'warning',
  IMPORT:  'warning',
  LOGIN:   'passive',
};

interface VStyle { bg: string; color: string; border: string }
const VARIANT_STYLES: Record<ActionVariant, VStyle> = {
  active:  { bg: 'var(--badge-active-bg)',  color: 'var(--badge-active-text)',  border: 'var(--badge-active-border)'  },
  info:    { bg: 'var(--badge-info-bg)',    color: 'var(--badge-info-text)',    border: 'var(--badge-info-border)'    },
  error:   { bg: 'var(--badge-error-bg)',   color: 'var(--badge-error-text)',   border: 'var(--badge-error-border)'   },
  warning: { bg: 'var(--badge-warning-bg)', color: 'var(--badge-warning-text)', border: 'var(--badge-warning-border)' },
  passive: { bg: 'var(--badge-passive-bg)', color: 'var(--badge-passive-text)', border: 'var(--badge-passive-border)' },
};

// ── Alert severity config ─────────────────────────────────────────────────────

type AlertSeverity = 'CRITICAL' | 'HIGH' | 'WARNING' | 'INFO';

const ALERT_STYLES: Record<AlertSeverity, VStyle & { icon: string }> = {
  CRITICAL: { bg: 'var(--badge-error-bg)',   color: 'var(--badge-error-text)',   border: 'var(--badge-error-border)',   icon: '✕' },
  HIGH:     { bg: 'var(--badge-error-bg)',   color: 'var(--badge-error-text)',   border: 'var(--badge-error-border)',   icon: '⚠' },
  WARNING:  { bg: 'var(--badge-warning-bg)', color: 'var(--badge-warning-text)', border: 'var(--badge-warning-border)', icon: '⚠' },
  INFO:     { bg: 'var(--badge-info-bg)',    color: 'var(--badge-info-text)',    border: 'var(--badge-info-border)',    icon: 'ℹ' },
};

function isAlertSeverity(s: string): s is AlertSeverity {
  return s === 'CRITICAL' || s === 'HIGH' || s === 'WARNING' || s === 'INFO';
}

// ── Section heading ───────────────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontSize: 'var(--text-base)',
        fontWeight: 'var(--font-semibold)' as React.CSSProperties['fontWeight'],
        color: 'var(--text-primary)',
        margin: '0 0 var(--space-3)',
        lineHeight: 'var(--leading-tight)',
      }}
    >
      {children}
    </h2>
  );
}

// ── Card wrapper ──────────────────────────────────────────────────────────────

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        backgroundColor: 'var(--surface-card)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        padding: 'var(--layout-card-padding)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ── DashboardPage ─────────────────────────────────────────────────────────────

export function DashboardPage() {
  const { t } = useTranslation();
  const { kpis, systemCoverage, alerts } = MOCK_DASHBOARD;
  const activities = MOCK_ACTIVITY.slice(0, 10);

  return (
    <div
      style={{
        padding: 'var(--layout-page-padding)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-6)',
        maxWidth: 'var(--layout-content-max-width)',
      }}
    >
      {/* Page title */}
      <h1
        style={{
          fontSize: 'var(--text-xl)',
          fontWeight: 'var(--font-semibold)' as React.CSSProperties['fontWeight'],
          color: 'var(--text-primary)',
          margin: 0,
          lineHeight: 'var(--leading-tight)',
        }}
      >
        {t('dashboard.title')}
      </h1>

      {/* ── KPI Row ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: 'var(--space-4)',
        }}
      >
        <KpiCard label={t('dashboard.kpi.totalProducts')}   value={kpis.totalProducts} />
        <KpiCard label={t('dashboard.kpi.activeProducts')}  value={kpis.activeProducts} trend="up" />
        <KpiCard label={t('dashboard.kpi.avgCoverage')}     value={`${kpis.avgCoveragePct}%`} />
        <KpiCard
          label={t('dashboard.kpi.needsFix')}
          value={kpis.needsFix}
          trend="down"
          onClick={() => { /* TODO Phase 2: navigate to filtered product list */ }}
        />
        <KpiCard
          label={t('dashboard.kpi.usersOnline')}
          value={kpis.usersOnline}
          onClick={() => { /* TODO Phase 2: navigate to audit/sessions */ }}
        />
      </div>

      {/* ── Lower grid: coverage + activity + alerts ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
          gap: 'var(--space-4)',
        }}
      >
        {/* Coverage bars */}
        <Card>
          <SectionHeading>{t('dashboard.sections.systemCoverage')}</SectionHeading>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {systemCoverage.map((sc) => (
              <CoverageBar
                key={sc.system}
                label={sc.system}
                covered={sc.covered}
                total={sc.total}
              />
            ))}
          </div>
        </Card>

        {/* Alerts */}
        <Card>
          <SectionHeading>{t('dashboard.sections.alerts')}</SectionHeading>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {alerts.map((alert) => {
              const severity = isAlertSeverity(alert.severity) ? alert.severity : 'INFO';
              const s = ALERT_STYLES[severity];
              return (
                <div
                  key={alert.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 'var(--space-2)',
                    padding: 'var(--space-2) var(--space-3)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: s.bg,
                    border: `1px solid ${s.border}`,
                  }}
                >
                  <span
                    style={{
                      fontSize: 'var(--text-xs)',
                      color: s.color,
                      flexShrink: 0,
                      fontWeight: 'var(--font-bold)' as React.CSSProperties['fontWeight'],
                      marginTop: 1,
                    }}
                  >
                    {s.icon}
                  </span>
                  <span style={{ fontSize: 'var(--text-sm)', color: s.color, lineHeight: 'var(--leading-normal)' }}>
                    {alert.text}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* ── Recent Activity ── */}
      <Card>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: 'var(--space-3)',
          }}
        >
          <SectionHeading>{t('dashboard.sections.recentActivity')}</SectionHeading>
          <Link
            to={ROUTES.AUDIT_SESSIONS}
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text-link)',
              textDecoration: 'none',
              flexShrink: 0,
            }}
          >
            {t('dashboard.viewAll')} →
          </Link>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {activities.map((activity, idx) => {
            const variant = ACTION_VARIANT[activity.action];
            const vs = VARIANT_STYLES[variant];
            const isLast = idx === activities.length - 1;

            return (
              <div
                key={activity.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  padding: 'var(--space-2) 0',
                  borderBottom: isLast ? 'none' : '1px solid var(--border-subtle)',
                }}
              >
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
                    flexShrink: 0,
                  }}
                >
                  {t(`common.action.${activity.action}`)}
                </span>

                {/* User */}
                <span
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-medium)' as React.CSSProperties['fontWeight'],
                    color: 'var(--text-primary)',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  {activity.user}
                </span>

                {/* Description */}
                <span
                  style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--text-secondary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  {activity.description}
                </span>

                {/* Relative time */}
                <span
                  style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--text-disabled)',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {formatRelativeTime(activity.createdAt)}
                </span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
