import { useTranslation } from 'react-i18next';
import { cn } from '@shared/lib/cn';
import type { AuditDashboardPeriod } from '@entities/audit/model/types';

const OPTIONS: AuditDashboardPeriod[] = [
  'today',
  'todayYesterday',
  '7d',
  '30d',
];

type AuditPeriodToggleProps = {
  value: AuditDashboardPeriod;
  onChange: (period: AuditDashboardPeriod) => void;
};

export function AuditPeriodToggle({ value, onChange }: AuditPeriodToggleProps) {
  const { t } = useTranslation();

  return (
    <div className="border-border bg-surface inline-flex items-center rounded-md border p-0.5">
      {OPTIONS.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={cn(
            'rounded px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors',
            value === option
              ? 'bg-primary text-primary-foreground'
              : 'text-fg-muted hover:text-fg',
          )}
        >
          {t(`audit.dashboardPeriod.${option}`)}
        </button>
      ))}
    </div>
  );
}
