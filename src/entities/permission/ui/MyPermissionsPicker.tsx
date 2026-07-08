import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { IMyPermissionGroup } from '../model/types';
import {
  formatPermissionGroupName,
  getPermissionActionIcon,
} from '../lib/permissionActionStyle';
import { cn } from '@shared/lib/cn';
import { Badge } from '@shared/ui/Badge';
import { Input } from '@shared/ui/Input';
import { ChevronDownIcon } from '@shared/ui/icons/ChevronDownIcon';
import { SearchIcon } from '@shared/ui/icons/SearchIcon';

/**
 * Read-only view of the current user's real granted permissions, grouped by
 * backend module — same search + collapsible-group layout as the editable
 * `PermissionPicker` (used by Role management), but built for the dynamic
 * `nameEndpoint`/`{name,value}` shape `/permission/me/permissions` returns
 * instead of the local mock catalog, and with no `onChange` path at all so
 * there is no way to toggle or save anything from this view.
 */
export function MyPermissionsPicker({
  groups,
}: {
  groups: IMyPermissionGroup[];
}) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  // Unlike PermissionPicker (which starts every module collapsed for editing),
  // this is a "what do I actually have" view — everything starts expanded so
  // nothing reads as hidden.
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    new Set(),
  );

  const totalCount = useMemo(
    () => groups.reduce((sum, group) => sum + group.permissions.length, 0),
    [groups],
  );

  const query = search.trim().toLowerCase();
  const visibleGroups = useMemo(() => {
    if (!query) return groups;
    return groups
      .map((group) => ({
        ...group,
        permissions: group.permissions.filter(
          (permission) =>
            permission.name.toLowerCase().includes(query) ||
            formatPermissionGroupName(group.nameEndpoint)
              .toLowerCase()
              .includes(query),
        ),
      }))
      .filter((group) => group.permissions.length > 0);
  }, [groups, query]);

  const isExpanded = (nameEndpoint: string) =>
    Boolean(query) || !collapsedGroups.has(nameEndpoint);

  const toggleGroup = (nameEndpoint: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(nameEndpoint)) next.delete(nameEndpoint);
      else next.add(nameEndpoint);
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <Input
          size="sm"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t('permission.search')}
          leftIcon={<SearchIcon size={14} />}
          containerClassName="max-w-xs"
        />
        <span className="text-fg-muted text-xs font-medium whitespace-nowrap">
          {t('profile.permissionsCount', { count: totalCount })}
        </span>
      </div>

      {visibleGroups.length === 0 ? (
        <p className="text-fg-muted py-6 text-center text-sm">
          {t('common.noData')}
        </p>
      ) : (
        <div className="border-border divide-border divide-y rounded-md border">
          {visibleGroups.map((group) => {
            const expanded = isExpanded(group.nameEndpoint);
            return (
              <div key={group.nameEndpoint}>
                <button
                  type="button"
                  onClick={() => toggleGroup(group.nameEndpoint)}
                  disabled={Boolean(query)}
                  className="hover:bg-surface-hover flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors disabled:cursor-default disabled:hover:bg-transparent"
                >
                  <span className="text-fg flex-1 text-sm font-medium">
                    {formatPermissionGroupName(group.nameEndpoint)}
                  </span>
                  <Badge variant="neutral">{group.permissions.length}</Badge>
                  {!query && (
                    <ChevronDownIcon
                      size={14}
                      className={cn(
                        'text-fg-muted shrink-0 transition-transform',
                        expanded && 'rotate-180',
                      )}
                    />
                  )}
                </button>

                {expanded && (
                  <div className="bg-bg/40 grid grid-cols-1 gap-x-4 gap-y-1 px-4 py-2 sm:grid-cols-2">
                    {group.permissions.map((permission) => (
                      <span
                        key={permission.value}
                        className="text-fg flex items-center gap-2 rounded px-2 py-1.5 text-sm"
                      >
                        <span className="text-fg-muted flex size-3.5 shrink-0 items-center justify-center">
                          {getPermissionActionIcon(permission.value) ?? (
                            <span className="bg-fg-muted/50 size-1.5 rounded-full" />
                          )}
                        </span>
                        {permission.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
