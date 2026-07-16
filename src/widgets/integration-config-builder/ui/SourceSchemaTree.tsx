import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { ISourceSchemaNode } from '@entities/external-system/model/types';
import { Input } from '@shared/ui/Input';
import { Spinner } from '@shared/ui/Spinner';
import { SearchIcon } from '@shared/ui/icons/SearchIcon';
import { useDebouncedValue } from '@shared/lib/hooks/useDebouncedValue';
import { cn } from '@shared/lib/cn';
import type { UseTreeStateReturn } from '../lib/useTreeState';
import { filterTreeBySearch } from '../lib/treeUtils';
import { TREE_COLUMNS } from '../lib/constants';
import { SourceTreeNode } from './SourceTreeNode';

export type SourceTreeRoot = {
  key: string;
  /** Only shown when there's more than one root (e.g. the Product tab's per-nomenclature-type trees). */
  label?: string;
  node: ISourceSchemaNode;
};

type SourceSchemaTreeProps = {
  roots: SourceTreeRoot[];
  isLoading: boolean;
  emptyMessage: string;
  tree: UseTreeStateReturn;
  conflictingSourcePaths: Set<string>;
  /** Extra controls (e.g. the Product tab's nomenclature-type picker + "include product group" checkbox) rendered in the same row as the search input. */
  toolbarExtras?: ReactNode;
};

export function SourceSchemaTree({
  roots,
  isLoading,
  emptyMessage,
  tree,
  conflictingSourcePaths,
  toolbarExtras,
}: SourceSchemaTreeProps) {
  const { t } = useTranslation();
  const debouncedSearch = useDebouncedValue(tree.search, 200);

  const filteredRoots = useMemo(
    () =>
      roots
        .map((root) => ({
          ...root,
          node: debouncedSearch
            ? filterTreeBySearch(root.node, debouncedSearch)
            : root.node,
        }))
        .filter(
          (root): root is SourceTreeRoot & { node: ISourceSchemaNode } =>
            root.node !== null,
        ),
    [roots, debouncedSearch],
  );

  return (
    <div className="border-border bg-surface flex h-full min-w-0 flex-col overflow-hidden rounded-lg border">
      <div className="border-border flex flex-wrap items-center gap-2 border-b p-2">
        <Input
          size="sm"
          value={tree.search}
          onChange={(e) => tree.setSearch(e.target.value)}
          placeholder={t('externalSystem.config.searchFields')}
          leftIcon={<SearchIcon size={14} />}
          containerClassName="min-w-48 flex-1"
        />
        {toolbarExtras}
      </div>

      <div className="bg-bg border-border text-fg-muted flex shrink-0 items-center gap-2 border-b py-1.5 pr-2 text-[10px] font-semibold uppercase 2xl:text-[11px]">
        <span style={{ width: TREE_COLUMNS.select }} className="text-center">
          {t('externalSystem.config.colSelect')}
        </span>
        <span className="min-w-0 flex-1">
          {t('externalSystem.config.colField')}
        </span>
        <span className={cn('shrink-0', TREE_COLUMNS.mode)} />
        <span className={cn('shrink-0', TREE_COLUMNS.target)}>
          {t('externalSystem.config.colTargetPath')}
        </span>
        <span className={cn('shrink-0 text-center', TREE_COLUMNS.required)}>
          {t('externalSystem.config.colRequired')}
        </span>
        <span className={cn('shrink-0 text-center', TREE_COLUMNS.status)}>
          {t('externalSystem.config.colStatus')}
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Spinner className="text-fg-muted size-5" />
          </div>
        ) : filteredRoots.length === 0 ? (
          <p className="text-fg-muted py-10 text-center text-sm">
            {emptyMessage}
          </p>
        ) : (
          <div className="flex flex-col">
            {filteredRoots.map((root) => (
              <div key={root.key}>
                {root.label && (
                  <div className="text-fg-muted bg-bg sticky top-0 px-2 py-1 text-xs font-semibold">
                    {root.label}
                  </div>
                )}
                <SourceTreeNode
                  node={root.node}
                  depth={0}
                  tree={tree}
                  conflictingSourcePaths={conflictingSourcePaths}
                  forceExpand={Boolean(debouncedSearch)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
