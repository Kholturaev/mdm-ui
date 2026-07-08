import { AUDIT_ACTOR_SEED } from '../api/auditActors';
import type {
  ActionTypeCount,
  ActivityTrendPoint,
  AuditActionType,
  AuditEntry,
  TeamActivityItem,
} from '../model/types';

function startOfDay(date: Date): Date {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
}

function daysAgo(days: number): Date {
  const date = startOfDay(new Date());
  date.setDate(date.getDate() - days);
  return date;
}

function isSameDay(iso: string, day: Date): boolean {
  const date = new Date(iso);
  return (
    date.getFullYear() === day.getFullYear() &&
    date.getMonth() === day.getMonth() &&
    date.getDate() === day.getDate()
  );
}

/** Last `days` calendar days (oldest first, today last) — one bar per day for the trend chart. */
export function computeActivityTrend(
  entries: AuditEntry[],
  days: number,
): ActivityTrendPoint[] {
  return Array.from({ length: days }, (_, index) => {
    const day = daysAgo(days - 1 - index);
    const dayEntries = entries.filter((entry) =>
      isSameDay(entry.actionTime, day),
    );
    return {
      date: day.toISOString(),
      count: dayEntries.length,
      hasFailure: dayEntries.some((entry) => entry.status === 'FAILED'),
    };
  });
}

/** Counts per action type over the last `days` days, most frequent first. */
export function computeActionTypeBreakdown(
  entries: AuditEntry[],
  days: number,
): ActionTypeCount[] {
  const since = daysAgo(days - 1);
  const counts = new Map<AuditActionType, number>();
  for (const entry of entries) {
    if (new Date(entry.actionTime) < since) continue;
    counts.set(entry.actionType, (counts.get(entry.actionType) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([actionType, count]) => ({ actionType, count }))
    .sort((a, b) => b.count - a.count);
}

/** Per-person action counts over the last `days` days, joined with their primary role — for the team-activity leaderboard. Excludes the synthetic `system` actor. */
export function computeTeamActivity(
  entries: AuditEntry[],
  days: number,
): TeamActivityItem[] {
  const since = daysAgo(days - 1);
  const counts = new Map<string, number>();
  for (const entry of entries) {
    if (entry.performedBy.username === 'system') continue;
    if (new Date(entry.actionTime) < since) continue;
    const key = entry.performedBy.username;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([username, actionCount]) => {
      const user = AUDIT_ACTOR_SEED.find(
        (candidate) => candidate.username === username,
      );
      return {
        actor: user
          ? {
              id: user.id,
              username: user.username,
              fullName: `${user.firstName} ${user.lastName}`,
            }
          : { id: 0, username, fullName: username },
        roleName: user?.roleName ?? '—',
        actionCount,
      };
    })
    .sort((a, b) => b.actionCount - a.actionCount);
}

export interface AuditDashboardStats {
  actionsToday: number;
  actionsYesterday: number;
  totalUsers: number;
  activeUsers: number;
  pendingApprovals: number;
  syncSuccessRate: number;
}

/** The four top stat tiles — each fixed to its own natural window (today, last 24h), independent of the page's trend-chart period toggle. */
export function computeDashboardStats(
  entries: AuditEntry[],
  pendingApprovals: number,
): AuditDashboardStats {
  const today = startOfDay(new Date());
  const yesterday = daysAgo(1);
  const actionsToday = entries.filter((entry) =>
    isSameDay(entry.actionTime, today),
  ).length;
  const actionsYesterday = entries.filter((entry) =>
    isSameDay(entry.actionTime, yesterday),
  ).length;

  const dayAgo = new Date();
  dayAgo.setHours(dayAgo.getHours() - 24);
  const recentSyncs = entries.filter(
    (entry) =>
      entry.actionType === 'SYNC' && new Date(entry.actionTime) >= dayAgo,
  );
  const failedSyncs = recentSyncs.filter(
    (entry) => entry.status === 'FAILED',
  ).length;
  const syncSuccessRate =
    recentSyncs.length > 0
      ? Math.round(
          ((recentSyncs.length - failedSyncs) / recentSyncs.length) * 100,
        )
      : 100;

  return {
    actionsToday,
    actionsYesterday,
    totalUsers: AUDIT_ACTOR_SEED.length,
    activeUsers: AUDIT_ACTOR_SEED.length,
    pendingApprovals,
    syncSuccessRate,
  };
}
