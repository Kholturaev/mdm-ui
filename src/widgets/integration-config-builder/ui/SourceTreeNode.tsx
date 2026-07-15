import { useTranslation } from 'react-i18next';
import type { ISourceSchemaNode } from '@entities/external-system/model/types';
import { Badge } from '@shared/ui/Badge';
import { Checkbox } from '@shared/ui/Checkbox';
import { Input } from '@shared/ui/Input';
import { SegmentedControl } from '@shared/ui/SegmentedControl';
import { ChevronDownIcon } from '@shared/ui/icons/ChevronDownIcon';
import { cn } from '@shared/lib/cn';
import type { UseTreeStateReturn } from '../lib/useTreeState';
import { isTableContainerNode } from '../lib/treeUtils';

type SourceTreeNodeProps = {
  node: ISourceSchemaNode;
  depth: number;
  tree: UseTreeStateReturn;
  conflictingSourcePaths: Set<string>;
  forceExpand: boolean;
};

const TYPE_BADGE_VARIANT: Record<string, 'neutral' | 'success' | 'warning'> = {
  OBJECT: 'warning',
  ARRAY: 'success',
};

export function SourceTreeNode({
  node,
  depth,
  tree,
  conflictingSourcePaths,
  forceExpand,
}: SourceTreeNodeProps) {
  const { t } = useTranslation();
  const isExpanded = forceExpand || Boolean(tree.expandedKeys[node.key]);
  const isSelected = Boolean(tree.selectedKeys[node.key]);
  const hasChildren = node.children.length > 0;
  const isTableContainer = isTableContainerNode(node);
  const hasConflict = conflictingSourcePaths.has(node.sourcePath || node.key);
  const tableView = tree.tableViewByKey[node.key] ?? 'COLUMNS';
  const nodeMode = tree.nodeModeByKey[node.key] ?? 'OBJECT';

  const visibleChildren =
    isTableContainer && tableView === 'ROWS'
      ? node.children.filter((child) => child.type === 'ARRAY')
      : isTableContainer && tableView === 'COLUMNS'
        ? node.children.filter((child) => child.type !== 'ARRAY')
        : node.children;

  return (
    <div>
      <div
        className={cn(
          'hover:bg-surface-hover flex items-center gap-1.5 rounded-md py-1 pr-2 transition-colors',
        )}
        style={{ paddingLeft: 8 + depth * 18 }}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={() => tree.toggleExpand(node.key)}
            className="text-fg-muted flex size-5 shrink-0 items-center justify-center"
          >
            <ChevronDownIcon
              size={12}
              className={cn(
                'transition-transform',
                !isExpanded && '-rotate-90',
              )}
            />
          </button>
        ) : (
          <span className="size-5 shrink-0" />
        )}

        {node.selectable && (
          <Checkbox
            size="sm"
            checked={isSelected}
            onChange={() => tree.toggleNode(node)}
          />
        )}

        <span
          className={cn(
            'truncate text-sm',
            isSelected ? 'text-fg font-medium' : 'text-fg-muted',
          )}
          title={node.sourcePath ?? node.key}
        >
          {node.label}
        </span>

        <Badge
          variant={TYPE_BADGE_VARIANT[node.type] ?? 'neutral'}
          className="shrink-0"
        >
          {node.type}
        </Badge>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          {isTableContainer && node.selectable && (
            <SegmentedControl
              size="xs"
              value={tableView}
              onChange={(mode) => tree.setTableView(node, mode)}
              options={[
                { label: t('externalSystem.config.columns'), value: 'COLUMNS' },
                { label: t('externalSystem.config.rows'), value: 'ROWS' },
              ]}
            />
          )}

          {!isTableContainer && node.type === 'OBJECT' && node.selectable && (
            <SegmentedControl
              size="xs"
              value={nodeMode}
              onChange={(mode) => tree.setNodeMode(node.key, mode)}
              options={[
                { label: t('externalSystem.config.object'), value: 'OBJECT' },
                { label: t('externalSystem.config.flat'), value: 'FLAT' },
              ]}
            />
          )}

          {isSelected && (
            <>
              <Input
                size="sm"
                value={tree.targetPathByKey[node.key] ?? ''}
                onChange={(e) => tree.setTargetPath(node.key, e.target.value)}
                placeholder={t('externalSystem.config.targetPathPlaceholder')}
                className={cn('w-40', hasConflict && 'border-danger')}
              />
              <label className="text-fg-muted flex items-center gap-1 text-[11px] whitespace-nowrap">
                <Checkbox
                  size="sm"
                  checked={tree.requiredByKey[node.key] ?? true}
                  onChange={(e) => tree.setRequired(node.key, e.target.checked)}
                />
                {t('externalSystem.config.required')}
              </label>
            </>
          )}
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div>
          {visibleChildren.map((child) => (
            <SourceTreeNode
              key={child.key}
              node={child}
              depth={depth + 1}
              tree={tree}
              conflictingSourcePaths={conflictingSourcePaths}
              forceExpand={forceExpand}
            />
          ))}
        </div>
      )}
    </div>
  );
}
