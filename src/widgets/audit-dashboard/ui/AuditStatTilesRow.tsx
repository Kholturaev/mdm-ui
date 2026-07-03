import { useTranslation } from 'react-i18next';
import { useAuditDashboardStats } from '@entities/audit/api/auditApi';
import { ZapIcon } from '@shared/ui/icons/ZapIcon';
import { UserIcon } from '@shared/ui/icons/UserIcon';
import { ClockIcon } from '@shared/ui/icons/ClockIcon';
import { CheckCircleIcon } from '@shared/ui/icons/CheckCircleIcon';
import { AuditStatTile } from './AuditStatTile';

export function AuditStatTilesRow() {
  const { t } = useTranslation();
  const stats = useAuditDashboardStats();

  const percentChange =
    stats.actionsYesterday > 0
      ? Math.round(
          ((stats.actionsToday - stats.actionsYesterday) /
            stats.actionsYesterday) *
            100,
        )
      : null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <AuditStatTile
        label={t('audit.stats.actionsToday')}
        value={stats.actionsToday}
        subtext={
          percentChange === null
            ? t('audit.stats.actionsTodaySubtextFlat')
            : t('audit.stats.actionsTodaySubtext', {
                percent:
                  percentChange > 0 ? `+${percentChange}` : percentChange,
              })
        }
        icon={<ZapIcon size={16} />}
        iconClassName="bg-primary/10 text-primary"
      />
      <AuditStatTile
        label={t('audit.stats.totalUsers')}
        value={stats.totalUsers}
        subtext={t('audit.stats.totalUsersSubtext', {
          count: stats.activeUsers,
        })}
        icon={<UserIcon size={16} />}
        iconClassName="bg-fg/10 text-fg"
      />
      <AuditStatTile
        label={t('audit.stats.pendingApprovals')}
        value={stats.pendingApprovals}
        subtext={t('audit.stats.pendingApprovalsSubtext')}
        icon={<ClockIcon size={16} />}
        iconClassName="bg-warning/10 text-warning"
      />
      <AuditStatTile
        label={t('audit.stats.syncSuccess')}
        value={`${stats.syncSuccessRate}%`}
        subtext={t('audit.stats.syncSuccessSubtext')}
        icon={<CheckCircleIcon size={16} />}
        iconClassName="bg-success/10 text-success"
      />
    </div>
  );
}
