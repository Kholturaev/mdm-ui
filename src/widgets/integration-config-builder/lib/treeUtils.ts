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

/** Returns every `selectable` node key in this subtree, including `node` itself. */
export function collectSelectableKeys(node: ISourceSchemaNode): string[] {
  const own = node.selectable ? [node.key] : [];
  return [...own, ...node.children.flatMap(collectSelectableKeys)];
}

/** Namespaces every key in a tree with `prefix` (and updates internal parent/child key references) — used to keep multiple nomenclature-type trees (identical relative paths) from colliding in the same selection state. */
export function prefixTreeKeys(
  node: ISourceSchemaNode,
  prefix: string,
): ISourceSchemaNode {
  return {
    ...node,
    key: `${prefix}${node.key}`,
    children: node.children.map((child) => prefixTreeKeys(child, prefix)),
  };
}

export function nodeByKeyMap(
  node: ISourceSchemaNode,
  map: Map<string, ISourceSchemaNode> = new Map(),
): Map<string, ISourceSchemaNode> {
  map.set(node.key, node);
  node.children.forEach((child) => nodeByKeyMap(child, map));
  return map;
}
