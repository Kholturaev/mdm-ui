import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGetAuditByRecordQuery } from '@entities/audit/api/auditRecordApi';
import type {
  AuditActionType,
  AuditRecordActionType,
} from '@entities/audit/model/types';
import {
  AUDIT_ACTION_BADGE_VARIANT,
  AUDIT_ACTION_DOT_CLASS,
} from '@entities/audit/lib/actionMeta';
import {
  formatAuditFieldValue,
  formatAuditTimelineDate,
  getAuditFieldLabel,
  groupAuditRecordEntries,
} from '@entities/audit/lib/auditRecordHistory';
import { Avatar } from '@shared/ui/Avatar';
import { Badge } from '@shared/ui/Badge';
import { Modal } from '@shared/ui/Modal';
import { Spinner } from '@shared/ui/Spinner';
import { cn } from '@shared/lib/cn';
import { formatDateTime } from '@shared/lib/formatDate';
import { ArrowRightIcon } from '@shared/ui/icons/ArrowRightIcon';

type RecordHistoryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  /** Backend audit table name, e.g. `product`. */
  tableName: string;
  recordId: number;
  recordTitle: string;
  recordCode?: string;
};

type ActionFilter = 'ALL' | AuditRecordActionType;

/** The real backend's INSERT/UPDATE/DELETE don't line up 1:1 with the mocked audit log's CREATE/UPDATE/DELETE/... action types — map to the closest one so this timeline reuses the same color coding as the audit log page instead of its own. */
function toAuditActionType(actionType: AuditRecordActionType): AuditActionType {
  return actionType === 'INSERT' ? 'CREATE' : actionType;
}

function performerName(
  performer: {
    firstName?: string | null;
    lastName?: string | null;
    username: string;
  } | null,
  fallback: string,
): string {
  if (!performer) return fallback;
  const fullName =
    `${performer.firstName ?? ''} ${performer.lastName ?? ''}`.trim();
  return fullName || performer.username;
}

/** Per-record change timeline — real backend history (`POST /audit/info/by-record`), grouped client-side into one entry per action. Generic over `tableName` so it can be reused from other entities' row actions later, not just nomenclature. */
export function RecordHistoryModal({
  isOpen,
  onClose,
  tableName,
  recordId,
  recordTitle,
  recordCode,
}: RecordHistoryModalProps) {
  const { t } = useTranslation();
  const [actionFilter, setActionFilter] = useState<ActionFilter>('ALL');

  const { data, isFetching, isError } = useGetAuditByRecordQuery(
    { tableName, recordId, page: 0, size: 200 },
    { skip: !isOpen },
  );

  const groups = useMemo(
    () => groupAuditRecordEntries(data?.data?.content ?? []),
    [data],
  );

  const counts = useMemo(() => {
    const result: Record<ActionFilter, number> = {
      ALL: groups.length,
      INSERT: 0,
      UPDATE: 0,
      DELETE: 0,
    };
    groups.forEach((group) => {
      result[group.actionType] += 1;
    });
    return result;
  }, [groups]);

  const filteredGroups = useMemo(
    () =>
      actionFilter === 'ALL'
        ? groups
        : groups.filter((group) => group.actionType === actionFilter),
    [groups, actionFilter],
  );

  const tabs = useMemo(() => {
    const items: { key: ActionFilter; label: string }[] = [
      {
        key: 'ALL',
        label: `${t('audit.filters.actionTypeAll')} · ${counts.ALL}`,
      },
    ];
    if (counts.UPDATE > 0) {
      items.push({ key: 'UPDATE', label: t('audit.action.UPDATE') });
    }
    if (counts.INSERT > 0) {
      items.push({ key: 'INSERT', label: t('audit.recordAction.created') });
    }
    if (counts.DELETE > 0) {
      items.push({ key: 'DELETE', label: t('audit.action.DELETE') });
    }
    return items;
  }, [counts, t]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={
        <div>
          <p className="text-fg-muted text-xs font-normal">
            {t('audit.recordHistory.title')} · #{recordId}
          </p>
          <h2 className="text-fg text-base font-semibold">{recordTitle}</h2>
          {recordCode && (
            <p className="text-fg-muted mt-1 text-xs font-normal">
              {recordCode} · {tableName}
            </p>
          )}
        </div>
      }
    >
      <div className="flex flex-col">
        <div className="border-border border-t" />

        <div className="flex flex-wrap items-center gap-1.5 py-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActionFilter(tab.key)}
              className={cn(
                'rounded-full px-2 py-0.5 text-[11px] font-medium whitespace-nowrap transition-colors',
                actionFilter === tab.key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-fg-muted/10 text-fg-muted hover:bg-fg-muted/20',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="border-border border-t" />

        <div className="pt-4">
          {isFetching && (
            <div className="flex justify-center py-8">
              <Spinner className="text-primary size-6" />
            </div>
          )}

          {!isFetching && isError && (
            <p className="text-danger py-8 text-center text-sm">
              {t('audit.recordHistory.loadError')}
            </p>
          )}

          {!isFetching && !isError && filteredGroups.length === 0 && (
            <p className="text-fg-muted py-8 text-center text-sm">
              {t('audit.recordHistory.empty')}
            </p>
          )}

          {!isFetching && !isError && filteredGroups.length > 0 && (
            <ul className="flex flex-col">
              {filteredGroups.map((group, index) => (
                <li
                  key={group.key}
                  className="relative flex gap-3 pb-5 last:pb-0"
                >
                  {index < filteredGroups.length - 1 && (
                    <span className="bg-border absolute top-6 left-2.25 h-full w-px" />
                  )}
                  <span
                    className={cn(
                      'relative z-10 mt-1.5 size-2.25 shrink-0 rounded-full',
                      AUDIT_ACTION_DOT_CLASS[
                        toAuditActionType(group.actionType)
                      ],
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Avatar
                        name={performerName(group.performedBy, '?')}
                        size="sm"
                      />
                      <span className="text-fg text-sm font-medium">
                        {group.performedBy
                          ? performerName(group.performedBy, '?')
                          : t('audit.systemActor')}
                      </span>
                      <Badge
                        variant={
                          AUDIT_ACTION_BADGE_VARIANT[
                            toAuditActionType(group.actionType)
                          ]
                        }
                      >
                        {group.actionType === 'INSERT'
                          ? t('audit.recordAction.created')
                          : group.fieldChanges.length > 1
                            ? `${t(`audit.action.${group.actionType}`)} · ${group.fieldChanges.length}`
                            : t(`audit.action.${group.actionType}`)}
                      </Badge>
                      <span
                        className="text-fg-muted ml-auto shrink-0 text-xs"
                        title={formatDateTime(group.actionTime)}
                      >
                        {formatAuditTimelineDate(group.actionTime, t)}
                      </span>
                    </div>

                    {group.actionType === 'INSERT' ? (
                      <p className="text-fg-muted mt-2 text-sm">
                        {t('audit.recordHistory.createdMessage')}
                      </p>
                    ) : (
                      <div className="bg-surface-hover mt-2 flex flex-col gap-2 rounded-md p-3">
                        {group.fieldChanges.map((change) => (
                          <div
                            key={change.fieldName}
                            className="flex items-center gap-2 text-sm"
                          >
                            <span className="text-fg-muted w-32 shrink-0 truncate">
                              {getAuditFieldLabel(change.fieldName, t)}
                            </span>
                            <span className="text-fg-muted truncate line-through">
                              {formatAuditFieldValue(
                                change.fieldName,
                                change.oldValue,
                                t,
                              )}
                            </span>
                            <ArrowRightIcon size={12} />
                            <span className="text-fg truncate font-medium">
                              {formatAuditFieldValue(
                                change.fieldName,
                                change.newValue,
                                t,
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Modal>
  );
}
