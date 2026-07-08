import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useAddPermissionsToUserMutation,
  useGetAllPermissionsQuery,
  useGetUserPermissionsQuery,
  useRemovePermissionFromUserMutation,
  useResetUserPermissionsMutation,
} from '@entities/user/api/userApi';
import {
  formatPermissionGroupName,
  getPermissionActionIcon,
} from '@entities/permission/lib/permissionActionStyle';
import { cn } from '@shared/lib/cn';
import { Button } from '@shared/ui/Button';
import { Badge } from '@shared/ui/Badge';
import { Input } from '@shared/ui/Input';
import { ShieldIcon } from '@shared/ui/icons/ShieldIcon';
import { SearchIcon } from '@shared/ui/icons/SearchIcon';
import { ChevronDownIcon } from '@shared/ui/icons/ChevronDownIcon';
import { parseApiError } from '@shared/api/parseApiError';
import type { ApiException } from '@shared/api/type';
import { notify } from '@shared/lib/toast';

type UserPermissionsPanelProps = {
  userId: string;
};

export function UserPermissionsPanel({ userId }: UserPermissionsPanelProps) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const { data: userPermissionsData } = useGetUserPermissionsQuery(userId);
  const { data: catalogData } = useGetAllPermissionsQuery();
  const [addPermissions, { isLoading: isAdding }] =
    useAddPermissionsToUserMutation();
  const [removePermission] = useRemovePermissionFromUserMutation();
  const [resetPermissions, { isLoading: isResetting }] =
    useResetUserPermissionsMutation();

  const catalogGroups = useMemo(() => catalogData?.data ?? [], [catalogData]);
  const currentValues = useMemo(
    () =>
      new Set(
        (userPermissionsData?.data ?? []).flatMap((group) =>
          group.permissions.map((permission) => permission.value),
        ),
      ),
    [userPermissionsData],
  );

  const [draftValues, setDraftValues] = useState<Set<string> | null>(null);
  const selectedValues = draftValues ?? currentValues;

  const isDirty = useMemo(() => {
    if (!draftValues) return false;
    if (draftValues.size !== currentValues.size) return true;
    for (const value of draftValues) {
      if (!currentValues.has(value)) return true;
    }
    return false;
  }, [draftValues, currentValues]);

  const query = search.trim().toLowerCase();
  const visibleGroups = useMemo(() => {
    if (!query) return catalogGroups;
    return catalogGroups
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
  }, [catalogGroups, query]);

  const isExpanded = (nameEndpoint: string) =>
    Boolean(query) || expandedGroups.has(nameEndpoint);

  const toggleGroupExpand = (nameEndpoint: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(nameEndpoint)) next.delete(nameEndpoint);
      else next.add(nameEndpoint);
      return next;
    });
  };

  const togglePermission = (value: string) => {
    const next = new Set(selectedValues);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    setDraftValues(next);
  };

  const handleSave = async () => {
    if (!draftValues) return;
    const toAdd = [...draftValues].filter((value) => !currentValues.has(value));
    const toRemove = [...currentValues].filter(
      (value) => !draftValues.has(value),
    );
    try {
      if (toAdd.length > 0) {
        await addPermissions({ userId, permissions: toAdd }).unwrap();
      }
      for (const permission of toRemove) {
        await removePermission({ userId, permission }).unwrap();
      }
      notify.success(t('message.saved'));
      setDraftValues(null);
    } catch (error) {
      notify.error(parseApiError(error as ApiException));
    }
  };

  const handleResetToDefaults = async () => {
    try {
      await resetPermissions(userId).unwrap();
      notify.success(t('message.saved'));
      setDraftValues(null);
    } catch (error) {
      notify.error(parseApiError(error as ApiException));
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-fg flex items-center gap-1.5 text-sm font-semibold">
          <span className="text-fg-muted flex items-center">
            <ShieldIcon size={14} />
          </span>
          {t('user.permissionsTitle')}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            isLoading={isResetting}
            onClick={handleResetToDefaults}
          >
            {t('user.resetPermissions')}
          </Button>
          {isDirty && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDraftValues(null)}
              >
                {t('common.cancel')}
              </Button>
              <Button size="sm" isLoading={isAdding} onClick={handleSave}>
                {t('common.save')}
              </Button>
            </>
          )}
        </div>
      </div>

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
          {t('permission.selectedCount', {
            count: selectedValues.size,
            total: catalogGroups.reduce(
              (sum, group) => sum + group.permissions.length,
              0,
            ),
          })}
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {visibleGroups.length === 0 ? (
          <p className="text-fg-muted py-6 text-center text-sm">
            {t('common.noData')}
          </p>
        ) : (
          <div className="border-border divide-border divide-y rounded-md border">
            {visibleGroups.map((group) => {
              const selectedInGroup = group.permissions.filter((permission) =>
                selectedValues.has(permission.value),
              ).length;
              const allSelected = selectedInGroup === group.permissions.length;
              const expanded = isExpanded(group.nameEndpoint);

              return (
                <div key={group.nameEndpoint}>
                  <button
                    type="button"
                    onClick={() => toggleGroupExpand(group.nameEndpoint)}
                    disabled={Boolean(query)}
                    className="hover:bg-surface-hover flex w-full items-center gap-3 px-3 py-1.5 text-left transition-colors disabled:cursor-default disabled:hover:bg-transparent"
                  >
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={(el) => {
                        if (el)
                          el.indeterminate =
                            selectedInGroup > 0 && !allSelected;
                      }}
                      onChange={(event) => {
                        event.stopPropagation();
                        const next = new Set(selectedValues);
                        group.permissions.forEach((permission) => {
                          if (allSelected) next.delete(permission.value);
                          else next.add(permission.value);
                        });
                        setDraftValues(next);
                      }}
                      onClick={(event) => event.stopPropagation()}
                      className="accent-primary size-3.5"
                    />
                    <span className="text-fg flex-1 text-sm font-medium">
                      {formatPermissionGroupName(group.nameEndpoint)}
                    </span>
                    <Badge
                      variant={selectedInGroup > 0 ? 'success' : 'neutral'}
                    >
                      {selectedInGroup}/{group.permissions.length}
                    </Badge>
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
                    <div className="bg-bg/40 grid grid-cols-1 gap-x-4 gap-y-0.5 px-3 py-1.5 sm:grid-cols-2">
                      {group.permissions.map((permission) => (
                        <label
                          key={permission.value}
                          className="hover:bg-surface-hover flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={selectedValues.has(permission.value)}
                            onChange={() => togglePermission(permission.value)}
                            className="accent-primary size-3.5 shrink-0"
                          />
                          <span className="text-fg-muted flex size-3.5 shrink-0 items-center justify-center">
                            {getPermissionActionIcon(permission.value) ?? (
                              <span className="bg-fg-muted/50 size-1.5 rounded-full" />
                            )}
                          </span>
                          {permission.name}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
