import type {
  IIntegrationMapping,
  ISourceSchemaNode,
} from '@entities/external-system/model/types';
import type { TreeState } from './useTreeState';
import { getTableArrayChild, isTableContainerNode } from './treeUtils';

function defaultTargetPath(node: ISourceSchemaNode): string {
  return node.fieldKey || node.label;
}

function buildNodeMapping(
  node: ISourceSchemaNode,
  state: TreeState,
): IIntegrationMapping[] {
  // Rows mode: the table container itself contributes nothing — its ARRAY
  // child's own mapping (if selected) stands in for the whole container, so
  // the payload gets `mappingType: 'ARRAY'` directly instead of an extra
  // OBJECT wrapper around it.
  if (
    isTableContainerNode(node) &&
    (state.tableViewByKey[node.key] ?? 'COLUMNS') === 'ROWS'
  ) {
    const arrayChild = getTableArrayChild(node);
    return arrayChild ? buildNodeMapping(arrayChild, state) : [];
  }

  const childMappings = node.children.flatMap((child) =>
    buildNodeMapping(child, state),
  );
  const isSelected = Boolean(state.selectedKeys[node.key]);

  if (!isSelected && childMappings.length === 0) return [];

  if (
    node.type === 'OBJECT' &&
    (state.nodeModeByKey[node.key] ?? 'OBJECT') === 'FLAT'
  ) {
    return childMappings;
  }

  const mappingType =
    node.type === 'ARRAY'
      ? 'ARRAY'
      : childMappings.length > 0
        ? 'OBJECT'
        : 'SCALAR';

  return [
    {
      id: `map-${node.key}`,
      mappingType,
      sourcePath: node.sourcePath || node.key,
      targetPath: state.targetPathByKey[node.key] ?? defaultTargetPath(node),
      sourceDataType: node.type,
      required: state.requiredByKey[node.key] ?? true,
      defaultValue: '',
      position: 0,
      children: childMappings,
    },
  ];
}

function normalizePositions(
  mappings: IIntegrationMapping[],
): IIntegrationMapping[] {
  return mappings.map((mapping, index) => ({
    ...mapping,
    position: index,
    children: normalizePositions(mapping.children ?? []),
  }));
}

/**
 * Derives the live `IIntegrationMapping[]` tree for ONE source-tree root from
 * the current checkbox/target-path/mode selection state. Deliberately kept
 * per-root (not a flattened multi-root hook) so the Product tab's per-
 * nomenclature-type mappings never need to be reverse-engineered from a
 * merged list afterward — call this once per root and each result is already
 * correctly and unambiguously attributed to that root.
 */
export function buildMappingsForRoot(
  root: ISourceSchemaNode,
  state: TreeState,
): IIntegrationMapping[] {
  return normalizePositions(buildNodeMapping(root, state));
}
