import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { AUDIT_ACTOR_SEED } from '@entities/audit/api/auditActors';
import type { AuditActionType, AuditEntry } from '@entities/audit/model/types';
import { useRecentAuditEntries } from '@entities/audit/api/auditApi';
import {
  AUDIT_ACTION_COLOR,
  AUDIT_ACTION_DOT_CLASS,
  AUDIT_ACTION_ICON,
  auditFeedParams,
} from '@entities/audit/lib/actionMeta';
import { Card, CardHeader } from '@shared/ui/Card';
import { cn } from '@shared/lib/cn';
import { formatRelativeTime } from '@shared/lib/formatDate';
import { ActivityIcon } from '@shared/ui/icons/ActivityIcon';
import { ArrowRightIcon } from '@shared/ui/icons/ArrowRightIcon';
import { ChevronDownIcon } from '@shared/ui/icons/ChevronDownIcon';

const CHIP_ACTION_TYPES: AuditActionType[] = [
  'CREATE',
  'UPDATE',
  'DELETE',
  'SYNC',
];

function isToday(iso: string): boolean {
  const date = new Date(iso);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

function Chip({
  active,
  onClick,
  dotClassName,
  children,
}: {
  active: boolean;
  onClick: () => void;
  dotClassName?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors',
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border text-fg-muted hover:text-fg hover:bg-surface-hover',
      )}
    >
      {dotClassName && (
        <span className={cn('size-1.5 shrink-0 rounded-full', dotClassName)} />
      )}
      {children}
    </button>
  );
}

function ActivityRow({ entry }: { entry: AuditEntry }) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChanges = entry.fieldChanges.length > 0;

  return (
    <div className="px-5 py-2.5">
      <div className="flex items-center gap-3">
        <span
          className={cn(
            'flex size-7 shrink-0 items-center justify-center rounded-md',
            AUDIT_ACTION_COLOR[entry.actionType],
          )}
        >
          {AUDIT_ACTION_ICON[entry.actionType]}
        </span>
        <p className="text-fg min-w-0 flex-1 truncate text-sm">
          {t(`audit.feed.${entry.description}`, auditFeedParams(entry))}
        </p>
        <span className="text-fg-muted shrink-0 text-xs whitespace-nowrap">
          {formatRelativeTime(entry.actionTime, t)}
        </span>
      </div>

      {hasChanges && (
        <div className="mt-1 pl-10">
          <button
            type="button"
            onClick={() => setIsExpanded((value) => !value)}
            className="text-primary flex items-center gap-1 text-xs font-medium hover:underline"
          >
            {t('audit.viewChanges', { count: entry.fieldChanges.length })}
            <ChevronDownIcon
              size={10}
              className={cn('transition-transform', isExpanded && 'rotate-180')}
            />
          </button>
          {isExpanded && (
            <ul className="border-border mt-1.5 space-y-1 border-l pl-3">
              {entry.fieldChanges.map((change) => (
                <li key={change.fieldName} className="text-fg-muted text-xs">
                  <span className="font-medium">{change.fieldName}:</span>{' '}
                  {change.oldValue ?? '—'} → {change.newValue ?? '—'}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export function RecentActivityCard() {
  const { t } = useTranslation();
  const { entries, isLoading } = useRecentAuditEntries(15);
  const [actionFilter, setActionFilter] = useState<AuditActionType | null>(
    null,
  );
  const [actorFilter, setActorFilter] = useState<string | null>(null);

  const actorOptions = useMemo(
    () =>
      AUDIT_ACTOR_SEED.map((user) => ({
        username: user.username,
        fullName: `${user.firstName} ${user.lastName}`,
      })),
    [],
  );

  const filtered = useMemo(() => {
    if (!entries) return undefined;
    return entries.filter((entry) => {
      if (actionFilter && entry.actionType !== actionFilter) return false;
      if (actorFilter && entry.performedBy.username !== actorFilter)
        return false;
      return true;
    });
  }, [entries, actionFilter, actorFilter]);

  const todayEntries = filtered?.filter((entry) => isToday(entry.actionTime));
  const yesterdayEntries = filtered?.filter(
    (entry) => !isToday(entry.actionTime),
  );

  return (
    <Card>
      <CardHeader
        title={t('audit.recentTitle')}
        icon={<ActivityIcon size={16} />}
        action={
          <Link
            to="/audit/log"
            className="text-primary flex items-center gap-1 text-xs font-medium hover:underline"
          >
            {t('audit.viewAll')}
            <ArrowRightIcon size={11} />
          </Link>
        }
      />

      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        <Chip
          active={actionFilter === null}
          onClick={() => setActionFilter(null)}
        >
          {t('audit.filters.actionTypeAll')}
        </Chip>
        {CHIP_ACTION_TYPES.map((type) => (
          <Chip
            key={type}
            active={actionFilter === type}
            onClick={() => setActionFilter(actionFilter === type ? null : type)}
            dotClassName={AUDIT_ACTION_DOT_CLASS[type]}
          >
            {t(`audit.action.${type}`)}
          </Chip>
        ))}
      </div>
      <div className="border-border mb-3 flex flex-wrap items-center gap-1.5 border-b pb-3">
        <Chip
          active={actorFilter === null}
          onClick={() => setActorFilter(null)}
        >
          {t('audit.filters.personAll')}
        </Chip>
        {actorOptions.map((actor) => (
          <Chip
            key={actor.username}
            active={actorFilter === actor.username}
            onClick={() =>
              setActorFilter(
                actorFilter === actor.username ? null : actor.username,
              )
            }
          >
            {actor.fullName}
          </Chip>
        ))}
      </div>

      {isLoading ? (
        <div className="text-fg-muted py-8 text-center text-sm">
          {t('common.loading')}
        </div>
      ) : !filtered || filtered.length === 0 ? (
        <div className="text-fg-muted py-8 text-center text-sm">
          {t('audit.empty')}
        </div>
      ) : (
        <div className="-mx-5">
          {todayEntries && todayEntries.length > 0 && (
            <div>
              <p className="text-fg-muted px-5 pt-1 pb-1 text-[11px] font-semibold tracking-wide uppercase">
                {t('audit.today')}
              </p>
              <div className="divide-border divide-y">
                {todayEntries.map((entry) => (
                  <ActivityRow key={entry.id} entry={entry} />
                ))}
              </div>
            </div>
          )}
          {yesterdayEntries && yesterdayEntries.length > 0 && (
            <div>
              <p className="text-fg-muted border-border border-t px-5 pt-2 pb-1 text-[11px] font-semibold tracking-wide uppercase">
                {t('audit.yesterday')}
              </p>
              <div className="divide-border divide-y">
                {yesterdayEntries.map((entry) => (
                  <ActivityRow key={entry.id} entry={entry} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
