import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type {
  AttentionItem,
  AttentionKind,
} from '@entities/analytics/model/types';
import { Card, CardHeader } from '@shared/ui/Card';
import { cn } from '@shared/lib/cn';
import { AlertTriangleIcon } from '@shared/ui/icons/AlertTriangleIcon';
import { XCircleIcon } from '@shared/ui/icons/XCircleIcon';
import { ClockIcon } from '@shared/ui/icons/ClockIcon';
import { CheckCircleIcon } from '@shared/ui/icons/CheckCircleIcon';
import { ArrowRightIcon } from '@shared/ui/icons/ArrowRightIcon';

const KIND_ICON: Record<AttentionKind, ReactNode> = {
  unconnected: <AlertTriangleIcon size={16} />,
  syncErrors: <XCircleIcon size={16} />,
  pendingSync: <ClockIcon size={16} />,
};

type AttentionPanelProps = {
  items: AttentionItem[];
};

export function AttentionPanel({ items }: AttentionPanelProps) {
  const { t } = useTranslation();

  return (
    <Card className="flex h-full flex-col">
      <CardHeader
        title={t('analytics.attention.title')}
        icon={<AlertTriangleIcon size={16} />}
      />

      {items.length === 0 ? (
        <div className="text-fg-muted flex flex-1 flex-col items-center justify-center gap-2 py-8 text-center text-sm">
          <CheckCircleIcon size={22} />
          {t('analytics.attention.allClear')}
        </div>
      ) : (
        <div className="divide-border -mx-5 flex-1 divide-y">
          {items.map((item) => (
            <div key={item.kind} className="flex items-start gap-3 px-5 py-3">
              <span
                className={cn(
                  'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md',
                  item.severity === 'danger'
                    ? 'bg-danger/10 text-danger'
                    : 'bg-warning/10 text-warning',
                )}
              >
                {KIND_ICON[item.kind]}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-fg text-sm font-medium">
                  {t(`analytics.attention.${item.kind}.title`, {
                    count: item.count,
                  })}
                </p>
                <p className="text-fg-muted truncate text-xs">
                  {item.sample?.length
                    ? item.sample.join(', ')
                    : t(`analytics.attention.${item.kind}.desc`)}
                </p>
              </div>
              <button
                type="button"
                className={cn(
                  'flex shrink-0 items-center gap-1 self-center text-xs font-semibold whitespace-nowrap',
                  item.severity === 'danger' ? 'text-danger' : 'text-warning',
                )}
              >
                {t(`analytics.attention.${item.kind}.cta`)}
                <ArrowRightIcon size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
