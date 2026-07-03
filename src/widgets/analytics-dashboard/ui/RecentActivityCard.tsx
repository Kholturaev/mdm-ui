import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type {
  ActivityActionType,
  RecentActivityItem,
} from '@entities/analytics/model/types';
import { Card, CardHeader } from '@shared/ui/Card';
import { cn } from '@shared/lib/cn';
import { ActivityIcon } from '@shared/ui/icons/ActivityIcon';
import { PlusIcon } from '@shared/ui/icons/PlusIcon';
import { EditIcon } from '@shared/ui/icons/EditIcon';
import { DeleteIcon } from '@shared/ui/icons/DeleteIcon';
import { RefreshIcon } from '@shared/ui/icons/RefreshIcon';
import { DownloadIcon } from '@shared/ui/icons/DownloadIcon';
import { formatRelativeTime } from '../lib/format';

const ACTION_ICON: Record<ActivityActionType, ReactNode> = {
  CREATE: <PlusIcon size={13} />,
  UPDATE: <EditIcon size={13} />,
  DELETE: <DeleteIcon size={13} />,
  SYNC: <RefreshIcon size={13} />,
  IMPORT: <DownloadIcon size={13} />,
};

const ACTION_COLOR: Record<ActivityActionType, string> = {
  CREATE: 'bg-success/10 text-success',
  UPDATE: 'bg-fg/10 text-fg-muted',
  DELETE: 'bg-danger/10 text-danger',
  SYNC: 'bg-primary/10 text-primary',
  IMPORT: 'bg-fg/10 text-fg-muted',
};

type RecentActivityCardProps = {
  items: RecentActivityItem[];
};

export function RecentActivityCard({ items }: RecentActivityCardProps) {
  const { t, i18n } = useTranslation();

  return (
    <Card>
      <CardHeader
        title={t('analytics.recentActivity.title')}
        icon={<ActivityIcon size={16} />}
      />

      <div className="divide-border -mx-5 divide-y">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 px-5 py-2.5">
            <span
              className={cn(
                'flex size-7 shrink-0 items-center justify-center rounded-md',
                ACTION_COLOR[item.actionType],
              )}
            >
              {ACTION_ICON[item.actionType]}
            </span>
            <p className="text-fg min-w-0 flex-1 truncate text-sm">
              {t(`analytics.${item.description}`, {
                actor: item.actor,
                system: item.systemName,
              })}
            </p>
            <span className="text-fg-muted shrink-0 text-xs whitespace-nowrap">
              {formatRelativeTime(item.timestamp, i18n.language)}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
