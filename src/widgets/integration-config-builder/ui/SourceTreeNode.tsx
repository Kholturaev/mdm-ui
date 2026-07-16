import { useTranslation } from 'react-i18next';
import type { ISourceSchemaNode } from '@entities/external-system/model/types';
import { Checkbox } from '@shared/ui/Checkbox';
import { Input } from '@shared/ui/Input';
import { SegmentedControl } from '@shared/ui/SegmentedControl';
import { Switch } from '@shared/ui/Switch';
import { ChevronDownIcon } from '@shared/ui/icons/ChevronDownIcon';
import { AlertTriangleIcon } from '@shared/ui/icons/AlertTriangleIcon';
import { CheckCircleIcon } from '@shared/ui/icons/CheckCircleIcon';
import { cn } from '@shared/lib/cn';
import type { UseTreeStateReturn } from '../lib/useTreeState';
import {
  getDefaultTargetPath,
  isNodeCheckable,
  isTableContainerNode,
} from '../lib/treeUtils';
import { TREE_COLUMNS } from '../lib/constants';
import { useSetFocusedSourcePath } from '../lib/focusedField';

type SourceTreeNodeProps = {
  node: ISourceSchemaNode;
  depth: number;
  tree: UseTreeStateReturn;
  conflictingSourcePaths: Set<string>;
  forceExpand: boolean;
};

export function SourceTreeNode({
  node,
  depth,
  tree,
  conflictingSourcePaths,
  forceExpand,
}: SourceTreeNodeProps) {
  const { t } = useTranslation();
  const setFocusedSourcePath = useSetFocusedSourcePath();
  const isExpanded = forceExpand || Boolean(tree.expandedKeys[node.key]);
  const isSelected = Boolean(tree.selectedKeys[node.key]);
  const hasChildren = node.children.length > 0;
  const checkable = isNodeCheckable(node);
  const isTableContainer = isTableContainerNode(node);
  const tableView = tree.tableViewByKey[node.key] ?? 'COLUMNS';
  const nodeMode = tree.nodeModeByKey[node.key] ?? 'OBJECT';

  // Live default (e.g. "status" from `product.status`, not the display
  // label) shown even before the row is checked or explicitly overridden —
  // matches akfa-data-frontend's `getTargetPathValue` fallback.
  const targetPath =
    tree.targetPathByKey[node.key] ?? getDefaultTargetPath(node);
  const hasConflict = conflictingSourcePaths.has(node.sourcePath || node.key);
  const isEmptyTarget = isSelected && targetPath.trim() === '';
  const validation = !isSelected
    ? 'none'
    : hasConflict
      ? 'danger'
      : isEmptyTarget
        ? 'warning'
        : 'valid';

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
          'hover:bg-surface-hover border-border/60 flex items-center gap-2 border-b py-1 pr-2',
          hasChildren && 'bg-bg',
        )}
      >
        <div
          style={{
            width: TREE_COLUMNS.select + depth * 16,
            paddingLeft: depth * 16,
          }}
          className="flex shrink-0 items-center justify-center gap-1"
        >
          <button
            type="button"
            onClick={() => hasChildren && tree.toggleExpand(node.key)}
            className="text-fg-muted flex size-5 shrink-0 items-center justify-center"
          >
            {hasChildren && (
              <ChevronDownIcon
                size={13}
                className={cn(
                  'transition-transform',
                  !isExpanded && '-rotate-90',
                )}
              />
            )}
          </button>
          <Checkbox
            size="lg"
            checked={isSelected}
            disabled={!checkable}
            onChange={() => checkable && tree.toggleNode(node)}
          />
        </div>

        <div className="flex min-w-0 flex-1 items-center">
          {depth > 0 && (
            <span className="border-border mr-3 h-4 w-px shrink-0 self-stretch border-l" />
          )}
          <span
            className={cn(
              'truncate text-xs 2xl:text-sm',
              hasChildren && 'font-semibold',
              isSelected
                ? 'text-fg font-semibold'
                : hasChildren
                  ? 'text-fg'
                  : 'text-fg-muted',
            )}
            title={node.sourcePath ?? node.key}
          >
            {node.label}
          </span>
        </div>

        <div className={cn('flex shrink-0 justify-end', TREE_COLUMNS.mode)}>
          {isTableContainer && (
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
          {!isTableContainer && node.type === 'OBJECT' && (
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
        </div>

        <div className={cn('shrink-0', TREE_COLUMNS.target)}>
          {checkable && (
            <Input
              size="sm"
              value={targetPath}
              onChange={(e) => tree.setTargetPath(node.key, e.target.value)}
              onFocus={() => setFocusedSourcePath(node.sourcePath || node.key)}
              onBlur={() => setFocusedSourcePath(null)}
              placeholder={t('externalSystem.config.targetPathPlaceholder')}
              className={cn(
                hasConflict && 'border-danger focus:border-danger',
                isEmptyTarget && 'border-warning focus:border-warning',
              )}
            />
          )}
        </div>

        <div
          className={cn(
            'flex shrink-0 items-center justify-center',
            TREE_COLUMNS.required,
          )}
        >
          <Switch
            checked={tree.requiredByKey[node.key] ?? true}
            disabled={!checkable}
            onChange={(checked) => tree.setRequired(node.key, checked)}
            title={t('externalSystem.config.required')}
          />
        </div>

        <div
          className={cn(
            'flex shrink-0 items-center justify-center',
            TREE_COLUMNS.status,
          )}
        >
          {validation === 'valid' && (
            <span
              className="text-success"
              title={t('externalSystem.config.validRow')}
            >
              <CheckCircleIcon size={16} />
            </span>
          )}
          {validation === 'warning' && (
            <span
              className="text-warning"
              title={t('externalSystem.config.emptyTargetWarning')}
            >
              <AlertTriangleIcon size={16} />
            </span>
          )}
          {validation === 'danger' && (
            <span
              className="text-danger"
              title={t('externalSystem.config.duplicateTargetWarning')}
            >
              <AlertTriangleIcon size={16} />
            </span>
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
