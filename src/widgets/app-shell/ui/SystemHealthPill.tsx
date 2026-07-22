import { useTranslation } from 'react-i18next';
import { useSystemHealth } from '../lib/useSystemHealth';
import type { SystemHealthStatus } from '../lib/useSystemHealth';
import { cn } from '@shared/lib/cn';

const STATUS_CLASSES: Record<SystemHealthStatus, string> = {
  healthy: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  critical: 'bg-danger/10 text-danger',
};

export function SystemHealthPill() {
  const { t } = useTranslation();
  const health = useSystemHealth();

  if (!health) return null;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
        STATUS_CLASSES[health.status],
      )}
    >
      <span className="size-1.5 shrink-0 rounded-full bg-current" />
      {t(`header.systemHealth.${health.status}`)}
      <span>·</span>
      {t('header.systemHealth.syncedSuffix', { percent: health.syncedPercent })}
    </span>
  );
}
