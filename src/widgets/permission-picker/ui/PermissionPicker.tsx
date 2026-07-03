import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type {
  IPermission,
  PermissionModule,
} from '@entities/permission/model/types';
import { groupPermissionsByModule } from '@entities/permission/model/catalog';
import { cn } from '@shared/lib/cn';
import { Input } from '@shared/ui/Input';
import { Badge } from '@shared/ui/Badge';
import { SearchIcon } from '@shared/ui/icons/SearchIcon';
import { ChevronDownIcon } from '@shared/ui/icons/ChevronDownIcon';
import { CheckIcon } from '@shared/ui/icons/CheckIcon';

type PermissionPickerProps = {
  catalog: IPermission[];
  selectedKeys: Set<string>;
  onChange?: (keys: Set<string>) => void;
  readOnly?: boolean;
  /** Read-only mode only — permission key -> names of the role(s) granting it, shown as small chips. */
  sourceLabels?: Record<string, string[]>;
};

export function PermissionPicker({
  catalog,
  selectedKeys,
  onChange,
  readOnly = false,
  sourceLabels,
}: PermissionPickerProps) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [expandedModules, setExpandedModules] = useState<Set<PermissionModule>>(
    new Set(),
  );

  const query = search.trim().toLowerCase();
  const groups = useMemo(() => groupPermissionsByModule(catalog), [catalog]);

  const visibleGroups = useMemo(() => {
    if (!query) return groups;
    return groups
      .map((group) => ({
        module: group.module,
        permissions: group.permissions.filter(
          (permission) =>
            t(`permission.actions.${permission.action}`)
              .toLowerCase()
              .includes(query) ||
            t(`permission.modules.${group.module}`)
              .toLowerCase()
              .includes(query) ||
            permission.key.toLowerCase().includes(query),
        ),
      }))
      .filter((group) => group.permissions.length > 0);
  }, [groups, query, t]);

  const isExpanded = (module: PermissionModule) =>
    Boolean(query) || expandedModules.has(module);

  const toggleModule = (module: PermissionModule) => {
    setExpandedModules((current) => {
      const next = new Set(current);
      if (next.has(module)) next.delete(module);
      else next.add(module);
      return next;
    });
  };

  const togglePermission = (key: string) => {
    if (!onChange) return;
    const next = new Set(selectedKeys);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onChange(next);
  };

  const toggleGroup = (permissions: IPermission[], allSelected: boolean) => {
    if (!onChange) return;
    const next = new Set(selectedKeys);
    permissions.forEach((permission) => {
      if (allSelected) next.delete(permission.key);
      else next.add(permission.key);
    });
    onChange(next);
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
          {t('permission.selectedCount', {
            count: selectedKeys.size,
            total: catalog.length,
          })}
        </span>
      </div>

      {visibleGroups.length === 0 ? (
        <p className="text-fg-muted py-6 text-center text-sm">
          {t('common.noData')}
        </p>
      ) : (
        <div className="border-border divide-border divide-y rounded-md border">
          {visibleGroups.map((group) => {
            const selectedInGroup = group.permissions.filter((permission) =>
              selectedKeys.has(permission.key),
            ).length;
            const allSelected = selectedInGroup === group.permissions.length;
            const expanded = isExpanded(group.module);

            return (
              <div key={group.module}>
                <button
                  type="button"
                  onClick={() => toggleModule(group.module)}
                  disabled={Boolean(query)}
                  className="hover:bg-surface-hover flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors disabled:cursor-default disabled:hover:bg-transparent"
                >
                  {!readOnly && (
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
                        toggleGroup(group.permissions, allSelected);
                      }}
                      onClick={(event) => event.stopPropagation()}
                      className="accent-primary size-3.5"
                    />
                  )}
                  <span className="text-fg flex-1 text-sm font-medium">
                    {t(`permission.modules.${group.module}`)}
                  </span>
                  <Badge variant={selectedInGroup > 0 ? 'success' : 'neutral'}>
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
                  <div className="bg-bg/40 grid grid-cols-1 gap-x-4 gap-y-1 px-4 py-2 sm:grid-cols-2">
                    {group.permissions.map((permission) => {
                      const checked = selectedKeys.has(permission.key);
                      const sources = sourceLabels?.[permission.key];

                      return (
                        <label
                          key={permission.key}
                          className={cn(
                            'flex items-center gap-2 rounded px-2 py-1.5 text-sm',
                            !readOnly &&
                              'hover:bg-surface-hover cursor-pointer',
                          )}
                        >
                          {readOnly ? (
                            <span
                              className={cn(
                                'flex size-3.5 shrink-0 items-center justify-center rounded-sm',
                                checked
                                  ? 'bg-success/15 text-success'
                                  : 'bg-disabled-bg',
                              )}
                            >
                              {checked && <CheckIcon size={10} />}
                            </span>
                          ) : (
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => togglePermission(permission.key)}
                              className="accent-primary size-3.5 shrink-0"
                            />
                          )}
                          <span
                            className={cn(
                              !checked && readOnly && 'text-fg-muted',
                            )}
                          >
                            {t(`permission.actions.${permission.action}`)}
                          </span>
                          {sources && sources.length > 0 && (
                            <span className="text-fg-muted ml-auto truncate text-xs">
                              {sources.join(', ')}
                            </span>
                          )}
                        </label>
                      );
                    })}
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
