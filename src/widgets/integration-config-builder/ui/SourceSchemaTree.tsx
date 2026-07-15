import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { ISourceSchemaNode } from '@entities/external-system/model/types';
import { Input } from '@shared/ui/Input';
import { Spinner } from '@shared/ui/Spinner';
import { SearchIcon } from '@shared/ui/icons/SearchIcon';
import { useDebouncedValue } from '@shared/lib/hooks/useDebouncedValue';
import type { UseTreeStateReturn } from '../lib/useTreeState';
import { filterTreeBySearch } from '../lib/treeUtils';
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
};

export function SourceSchemaTree({
  roots,
  isLoading,
  emptyMessage,
  tree,
  conflictingSourcePaths,
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
    <div className="flex h-full flex-col gap-2">
      <Input
        size="sm"
        value={tree.search}
        onChange={(e) => tree.setSearch(e.target.value)}
        placeholder={t('externalSystem.config.searchFields')}
        leftIcon={<SearchIcon size={14} />}
      />

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
          <div className="flex flex-col gap-1">
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
