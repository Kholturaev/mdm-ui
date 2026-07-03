import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { ColumnDef } from '@tanstack/react-table';
import type { AuditEntry } from '@entities/audit/model/types';
import {
  AUDIT_ACTION_BADGE_VARIANT,
  auditFeedParams,
} from '@entities/audit/lib/actionMeta';
import { Avatar } from '@shared/ui/Avatar';
import { Badge } from '@shared/ui/Badge';
import { formatDateTime } from '@shared/lib/formatDate';

type UseAuditColumnsParams = {
  onViewChanges: (entry: AuditEntry) => void;
};

export function useAuditColumns({ onViewChanges }: UseAuditColumnsParams) {
  const { t } = useTranslation();

  const columns = useMemo<ColumnDef<AuditEntry>[]>(
    () => [
      {
        id: 'actionTime',
        size: 150,
        header: t('audit.columns.time'),
        cell: ({ row }) => formatDateTime(row.original.actionTime),
      },
      {
        id: 'actor',
        size: 180,
        header: t('audit.columns.actor'),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Avatar name={row.original.performedBy.fullName} size="sm" />
            <span className="truncate">
              {row.original.performedBy.fullName}
            </span>
          </div>
        ),
      },
      {
        id: 'action',
        size: 140,
        header: t('audit.columns.action'),
        cell: ({ row }) => (
          <Badge
            variant={AUDIT_ACTION_BADGE_VARIANT[row.original.actionType]}
            dot
          >
            {t(`audit.action.${row.original.actionType}`)}
          </Badge>
        ),
      },
      {
        id: 'record',
        size: 300,
        header: t('audit.columns.record'),
        cell: ({ row }) => {
          const { entityType, recordName } = row.original;
          if (!recordName) return '—';
          return (
            <span className="truncate">
              {entityType && (
                <span className="text-fg-muted">
                  {t(`audit.entityType.${entityType}`)} ·{' '}
                </span>
              )}
              {recordName}
            </span>
          );
        },
      },
      {
        id: 'description',
        size: 280,
        header: t('audit.columns.details'),
        cell: ({ row }) => (
          <span className="text-fg-muted truncate">
            {t(
              `audit.feed.${row.original.description}`,
              auditFeedParams(row.original),
            )}
          </span>
        ),
      },
      {
        id: 'changes',
        size: 170,
        header: t('audit.columns.changes'),
        cell: ({ row }) =>
          row.original.fieldChanges.length > 0 ? (
            <button
              type="button"
              onClick={() => onViewChanges(row.original)}
              className="text-primary text-xs font-medium hover:underline"
            >
              {t('audit.viewChanges', {
                count: row.original.fieldChanges.length,
              })}
            </button>
          ) : (
            '—'
          ),
      },
      {
        id: 'status',
        size: 130,
        header: t('audit.columns.status'),
        cell: ({ row }) => (
          <Badge
            variant={row.original.status === 'SUCCESS' ? 'success' : 'danger'}
            dot
          >
            {t(`audit.status.${row.original.status}`)}
          </Badge>
        ),
      },
    ],
    [t, onViewChanges],
  );

  return { columns };
}
