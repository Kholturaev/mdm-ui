import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  ActionTypeCount,
  ActivityTrendPoint,
  AuditEntry,
  AuditFilterParams,
  SpringPage,
  TeamActivityItem,
} from '../model/types';
import { AUDIT_SEED } from './auditMockData';
import { useApprovalQueue } from './approvalApi';
import {
  computeActionTypeBreakdown,
  computeActivityTrend,
  computeDashboardStats,
  computeTeamActivity,
  type AuditDashboardStats,
} from '../lib/dashboardStats';

const MOCK_DELAY_MS = 300;

function matchesFilters(entry: AuditEntry, params: AuditFilterParams): boolean {
  if (params.actionType && entry.actionType !== params.actionType) return false;
  if (
    params.performedByUsername &&
    entry.performedBy.username !== params.performedByUsername
  ) {
    return false;
  }
  if (params.dateFrom && entry.actionTime < params.dateFrom) return false;
  if (params.dateTo && entry.actionTime > params.dateTo) return false;
  if (params.search) {
    const query = params.search.trim().toLowerCase();
    const haystack =
      `${entry.recordName ?? ''} ${entry.performedBy.fullName}`.toLowerCase();
    if (query && !haystack.includes(query)) return false;
  }
  return true;
}

function buildPage(params: AuditFilterParams): SpringPage<AuditEntry> {
  const page = params.page ?? 0;
  const size = params.size ?? 20;
  const filtered = AUDIT_SEED.filter((entry) => matchesFilters(entry, params));
  const start = page * size;
  const content = filtered.slice(start, start + size);
  return {
    content,
    totalElements: filtered.length,
    totalPages: Math.max(1, Math.ceil(filtered.length / size)),
    size,
    number: page,
    first: page === 0,
    last: start + size >= filtered.length,
    empty: content.length === 0,
  };
}

interface UseAuditListResult {
  data: SpringPage<AuditEntry> | undefined;
  isLoading: boolean;
  isFetching: boolean;
  refetch: () => void;
}

/**
 * Stands in for a future `useGetAuditListQuery(params)` RTK Query hook
 * against akfa-data-frontend's real `POST /audit/info` — same filter fields
 * and Spring `Page<T>` response shape, so wiring up the real endpoint later
 * only touches this file.
 */
export function useGetAuditListQuery(
  params: AuditFilterParams,
): UseAuditListResult {
  const [data, setData] = useState<SpringPage<AuditEntry>>();
  const [reloadToken, setReloadToken] = useState(0);
  const paramsKey = JSON.stringify(params);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const [loadedReloadToken, setLoadedReloadToken] = useState(-1);

  // Derived from state comparisons during render, same as useAnalyticsOverview
  // — reflects a params/refetch change immediately without a setState-in-effect
  // render cascade.
  const isFetching =
    loadedKey !== paramsKey || loadedReloadToken !== reloadToken;

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      if (cancelled) return;
      setData(buildPage(params));
      setLoadedKey(paramsKey);
      setLoadedReloadToken(reloadToken);
    }, MOCK_DELAY_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // paramsKey captures every field of `params` used inside buildPage
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey, reloadToken]);

  const refetch = useCallback(() => setReloadToken((token) => token + 1), []);

  return { data, isLoading: isFetching && !data, isFetching, refetch };
}

function startOfDaysAgo(days: number): string {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

/** Today + yesterday feed for the dashboard's "Faoliyat tarixi" card — same store, no pagination. The full history lives on the dedicated audit log page. */
export function useRecentAuditEntries(limit: number = 10): {
  entries: AuditEntry[] | undefined;
  isLoading: boolean;
} {
  const [entries, setEntries] = useState<AuditEntry[]>();

  useEffect(() => {
    let cancelled = false;
    const since = startOfDaysAgo(1);
    const timer = setTimeout(() => {
      if (cancelled) return;
      setEntries(
        AUDIT_SEED.filter((entry) => entry.actionTime >= since).slice(0, limit),
      );
    }, MOCK_DELAY_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [limit]);

  return { entries, isLoading: entries === undefined };
}

/** Last `days` days of activity counts for the dashboard's trend chart. Derived synchronously from the same seed — no loading state needed. */
export function useActivityTrend(days: number): ActivityTrendPoint[] {
  return useMemo(() => computeActivityTrend(AUDIT_SEED, days), [days]);
}

/** Action-type counts over the last `days` days, for the trend chart's legend. */
export function useActionTypeBreakdown(days: number): ActionTypeCount[] {
  return useMemo(() => computeActionTypeBreakdown(AUDIT_SEED, days), [days]);
}

/** Per-person leaderboard over the last `days` days, for the "Jamoa faolligi" card. */
export function useTeamActivity(days: number): TeamActivityItem[] {
  return useMemo(() => computeTeamActivity(AUDIT_SEED, days), [days]);
}

/** The four dashboard stat tiles — each fixed to its own window regardless of the page's period toggle. */
export function useAuditDashboardStats(): AuditDashboardStats {
  const { approvals } = useApprovalQueue();
  return useMemo(
    () => computeDashboardStats(AUDIT_SEED, approvals.length),
    [approvals.length],
  );
}
