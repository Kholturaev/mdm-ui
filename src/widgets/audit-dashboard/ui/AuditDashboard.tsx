import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { AuditDashboardPeriod } from '@entities/audit/model/types';
import { AuditPeriodToggle } from './AuditPeriodToggle';
import { AuditStatTilesRow } from './AuditStatTilesRow';
import { ActivityTrendCard } from './ActivityTrendCard';
import { RecentActivityCard } from './RecentActivityCard';
import { ApprovalQueueCard } from './ApprovalQueueCard';
import { TeamActivityCard } from './TeamActivityCard';

const PERIOD_DAYS: Record<AuditDashboardPeriod, number> = {
  today: 1,
  todayYesterday: 2,
  '7d': 7,
  '30d': 30,
};

export function AuditDashboard() {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<AuditDashboardPeriod>('7d');

  return (
    <div className="h-full overflow-y-auto">
      <div className="flex flex-col gap-5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-fg text-xl font-semibold">
              {t('audit.title')}
            </h1>
            <p className="text-fg-muted mt-0.5 text-sm">
              {t('audit.subtitle')}
            </p>
          </div>
          <AuditPeriodToggle value={period} onChange={setPeriod} />
        </div>

        <AuditStatTilesRow />

        <ActivityTrendCard days={PERIOD_DAYS[period]} />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
          <RecentActivityCard />
          <div className="flex flex-col gap-4">
            <ApprovalQueueCard />
            <TeamActivityCard />
          </div>
        </div>
      </div>
    </div>
  );
}
