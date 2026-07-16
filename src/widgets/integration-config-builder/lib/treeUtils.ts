import type { ISourceSchemaNode } from '@entities/external-system/model/types';

export function matchesSearch(node: ISourceSchemaNode, query: string): boolean {
  const q = query.toLowerCase();
  return (
    node.label.toLowerCase().includes(q) ||
    node.key.toLowerCase().includes(q) ||
    (node.sourcePath ?? '').toLowerCase().includes(q) ||
    (node.fieldKey ?? '').toLowerCase().includes(q)
  );
}

/** Recursively keeps only nodes that match `query` themselves or have a descendant that does — ancestors of a match are kept even when they don't match, so results stay visible in context. Returns `null` when nothing in the subtree matches. */
export function filterTreeBySearch(
  node: ISourceSchemaNode,
  query: string,
): ISourceSchemaNode | null {
  if (!query.trim()) return node;

  const filteredChildren = node.children
    .map((child) => filterTreeBySearch(child, query))
    .filter((child): child is ISourceSchemaNode => child !== null);

  if (matchesSearch(node, query) || filteredChildren.length > 0) {
    return { ...node, children: filteredChildren };
  }
  return null;
}

export function findNodeByKey(
  node: ISourceSchemaNode,
  key: string,
): ISourceSchemaNode | null {
  if (node.key === key) return node;
  for (const child of node.children) {
    const found = findNodeByKey(child, key);
    if (found) return found;
  }
  return null;
}

export function findNodeBySourcePath(
  node: ISourceSchemaNode,
  sourcePath: string,
): ISourceSchemaNode | null {
  if (node.sourcePath === sourcePath || node.key === sourcePath) return node;
  for (const child of node.children) {
    const found = findNodeBySourcePath(child, sourcePath);
    if (found) return found;
  }
  return null;
}

/** Every ancestor key on the path from the tree root down to (but not including) `targetKey`, or `[]` if not found. */
export function findAncestorKeys(
  node: ISourceSchemaNode,
  targetKey: string,
  path: string[] = [],
): string[] {
  if (node.key === targetKey) return path;
  for (const child of node.children) {
    const found = findAncestorKeys(child, targetKey, [...path, node.key]);
    if (found.length > 0 || child.key === targetKey) return found;
  }
  return [];
}

/** A dynamic-table container is structurally recognizable (not just by `icon`, since the backend tags a table's ARRAY child and nested row-item OBJECT the same way): it owns exactly one `ARRAY`-typed child alongside its scalar column children. */
export function isTableContainerNode(node: ISourceSchemaNode): boolean {
  return node.icon === 'table' && node.children.some((c) => c.type === 'ARRAY');
}

export function getTableArrayChild(
  node: ISourceSchemaNode,
): ISourceSchemaNode | undefined {
  return node.children.find((c) => c.type === 'ARRAY');
}

export function getTableColumnChildren(
  node: ISourceSchemaNode,
): ISourceSchemaNode[] {
  return node.children.filter((c) => c.type !== 'ARRAY');
}

/** A node is checkable — gets an enabled checkbox and can hold its own mapping entry — if the backend marked it `selectable`, OR it's a container (has children) that can be checked to select/wrap its whole subtree. Mirrors akfa-data-frontend's `isNodeCheckable`: a non-selectable parent (e.g. the "product" root) is still checkable because it has children. */
export function isNodeCheckable(node: ISourceSchemaNode): boolean {
  return node.selectable || node.children.length > 0;
}

/** Every checkable node key in this subtree, including `node` itself when checkable — used to cascade a parent's checkbox toggle onto its whole subtree (and to include the parent's own key so its checkbox reflects selection). */
export function collectCheckableKeys(node: ISourceSchemaNode): string[] {
  const own = isNodeCheckable(node) ? [node.key] : [];
  return [...own, ...node.children.flatMap(collectCheckableKeys)];
}

/** Namespaces every key in a tree with `prefix` (used to keep multiple nomenclature-type trees, or an embedded product-group branch, from colliding with identical relative paths in the same selection state) — `sourcePath` is preserved as the true backend path (falling back to the original, unprefixed key) so mapping/restore logic still resolves correctly. */
export function prefixTreeKeys(
  node: ISourceSchemaNode,
  prefix: string,
): ISourceSchemaNode {
  return {
    ...node,
    key: `${prefix}${node.key}`,
    sourcePath: node.sourcePath ?? node.key,
    children: node.children.map((child) => prefixTreeKeys(child, prefix)),
  };
}

const NOMENCLATURE_VALUE_TYPES = new Set(['STRING', 'NUMBER', 'BOOLEAN']);

function isNomenclatureValueType(type: string): boolean {
  return NOMENCLATURE_VALUE_TYPES.has(type);
}

/**
 * Default target-path a node's mapping gets before the user overrides it —
 * ported verbatim from akfa-data-frontend's `getDefaultTargetPath`. The key
 * thing this gets right that a naive `node.label` fallback doesn't: for
 * plain product/rate/dealer/group fields it uses the last dot-segment of the
 * backend `key`/`sourcePath` (e.g. `product.status` → `status`), not the
 * display label — the label is often a different, human-facing string
 * (`"Status"` vs. the technical `"status"`), and the backend expects the
 * technical field name as the target key. `fieldKey` (when present, on
 * nomenclature characteristic/table-column value nodes) always wins, since
 * unlike a label it's stable across renames.
 */
export function getDefaultTargetPath(node: ISourceSchemaNode): string {
  if (node.key === 'product') return 'product';
  if (node.key === 'productGroup') return 'productGroup';

  const sourcePath = node.sourcePath || node.key || '';
  const fromSource = sourcePath.split('.').pop();
  const fromKey = (node.key || '').split('.').pop();

  const isProductGroupBranch =
    sourcePath.startsWith('productGroup') ||
    sourcePath.startsWith('productGroups') ||
    sourcePath.startsWith('product-group');
  const keySegment = fromSource || fromKey || '';
  const hasNumericLeafKey = /^\d+$/.test(keySegment);

  if (sourcePath.startsWith('nomenclature')) {
    if (sourcePath === 'nomenclature') {
      const typeLabel = (node.label || fromKey || 'type').trim();
      return `nomenclature.${typeLabel}`;
    }
    if (isNomenclatureValueType(node.type) && node.fieldKey) {
      return node.fieldKey;
    }
    return (node.label || fromSource || fromKey || '').trim();
  }

  if (isProductGroupBranch && hasNumericLeafKey) {
    return (node.label || fromSource || fromKey || '').trim();
  }

  return (fromSource || fromKey || node.label || '').trim();
}

export function nodeByKeyMap(
  node: ISourceSchemaNode,
  map: Map<string, ISourceSchemaNode> = new Map(),
): Map<string, ISourceSchemaNode> {
  map.set(node.key, node);
  node.children.forEach((child) => nodeByKeyMap(child, map));
  return map;
}
