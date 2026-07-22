import { useTranslation } from 'react-i18next';
import { cn } from '@shared/lib/cn';
import type { AnalyticsPeriod } from '@entities/analytics/model/types';

const OPTIONS: AnalyticsPeriod[] = ['7d', '30d', '90d'];

type PeriodToggleProps = {
  value: AnalyticsPeriod;
  onChange: (period: AnalyticsPeriod) => void;
};

export function PeriodToggle({ value, onChange }: PeriodToggleProps) {
  const { t } = useTranslation();

  return (
    <div className="border-border bg-surface inline-flex items-center rounded-md border p-0.5">
      {OPTIONS.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={cn(
            'rounded px-2.5 py-1 text-xs font-medium transition-colors',
            value === option
              ? 'bg-primary text-primary-foreground'
              : 'text-fg-muted hover:text-fg',
          )}
        >
          {t(`analytics.period.${option}`)}
        </button>
      ))}
    </div>
  );
}
