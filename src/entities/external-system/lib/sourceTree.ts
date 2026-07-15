import type { IResponse } from '@shared/api/type';
import type { ISourceSchemaNode } from '../model/types';

/** Leaf nodes from the backend omit `children` entirely rather than sending `[]` — every consumer here (`treeUtils`, `useMappings`, `SourceTreeNode`) assumes `children` is always an array, so normalize it once at the boundary instead of defending against `undefined` everywhere downstream. */
function normalizeSourceNode(node: ISourceSchemaNode): ISourceSchemaNode {
  return {
    ...node,
    children: (node.children ?? []).map(normalizeSourceNode),
  };
}

/** Normalizes the source-tree endpoints' inconsistent wrapping (some responses arrive as the bare node, some as `IResponse<node>`) into a single shape, with `children` guaranteed on every node. */
export function extractSourceNode(
  response: IResponse<ISourceSchemaNode> | ISourceSchemaNode | undefined,
): ISourceSchemaNode | null {
  if (!response) return null;
  const node = 'key' in response ? response : (response.data ?? null);
  return node ? normalizeSourceNode(node) : null;
}
