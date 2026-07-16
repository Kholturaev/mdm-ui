import type { IIntegrationMapping } from '../model/types';

export type PreviewLine = { text: string; sourcePath: string | null };

function setDeepValue(
  obj: Record<string, unknown>,
  path: string,
  value: unknown,
): void {
  const parts = path.split('.').filter(Boolean);
  if (!parts.length) return;

  let ref = obj;
  for (let i = 0; i < parts.length; i += 1) {
    const key = parts[i];
    if (i === parts.length - 1) {
      ref[key] = value;
      return;
    }
    if (typeof ref[key] !== 'object' || ref[key] === null) {
      ref[key] = {};
    }
    ref = ref[key] as Record<string, unknown>;
  }
}

/** Builds a template preview object from a mapping tree — a `SCALAR` node renders its `defaultValue`, or a `{{sourcePath}}` placeholder when that's empty; `OBJECT`/`ARRAY` nodes nest their children. Mirrors akfa-data-frontend's `LivePreview.mappingToPreviewObject`. */
export function mappingsToPreviewObject(
  mappings: IIntegrationMapping[],
): Record<string, unknown> {
  return mappings.reduce<Record<string, unknown>>((acc, item) => {
    if (!item.targetPath) return acc;

    const value: unknown =
      item.mappingType === 'SCALAR'
        ? item.defaultValue || `{{${item.sourcePath}}}`
        : item.mappingType === 'ARRAY'
          ? [mappingsToPreviewObject(item.children ?? [])]
          : mappingsToPreviewObject(item.children ?? []);

    if (item.targetPath.includes('.')) {
      setDeepValue(acc, item.targetPath, value);
    } else {
      acc[item.targetPath] = value;
    }

    return acc;
  }, {});
}

type JsonMergedNode =
  | { kind: 'scalar'; sourcePath: string; value: string }
  | {
      kind: 'object';
      sourcePath: string | null;
      children: Record<string, JsonMergedNode>;
    }
  | { kind: 'array'; sourcePath: string; item: JsonMergedNode };

function setDeepMergedNode(
  children: Record<string, JsonMergedNode>,
  path: string,
  node: JsonMergedNode,
): void {
  const parts = path.split('.').filter(Boolean);
  let ref = children;
  for (let i = 0; i < parts.length; i += 1) {
    const key = parts[i];
    if (i === parts.length - 1) {
      ref[key] = node;
      return;
    }
    const existing = ref[key];
    const container: JsonMergedNode =
      existing && existing.kind === 'object'
        ? existing
        : { kind: 'object', sourcePath: null, children: {} };
    ref[key] = container;
    ref = container.children;
  }
}

function buildJsonMergedChildren(
  mappings: IIntegrationMapping[],
): Record<string, JsonMergedNode> {
  const children: Record<string, JsonMergedNode> = {};
  for (const item of mappings) {
    if (!item.targetPath) continue;
    const node = buildJsonMergedNode(item);
    if (item.targetPath.includes('.')) {
      setDeepMergedNode(children, item.targetPath, node);
    } else {
      children[item.targetPath] = node;
    }
  }
  return children;
}

function buildJsonMergedNode(item: IIntegrationMapping): JsonMergedNode {
  if (item.mappingType === 'SCALAR') {
    return {
      kind: 'scalar',
      sourcePath: item.sourcePath,
      value: item.defaultValue || `{{${item.sourcePath}}}`,
    };
  }
  if (item.mappingType === 'ARRAY') {
    return {
      kind: 'array',
      sourcePath: item.sourcePath,
      item: {
        kind: 'object',
        sourcePath: item.sourcePath,
        children: buildJsonMergedChildren(item.children ?? []),
      },
    };
  }
  return {
    kind: 'object',
    sourcePath: item.sourcePath,
    children: buildJsonMergedChildren(item.children ?? []),
  };
}

function renderJsonMergedNode(
  node: JsonMergedNode,
  indent: string,
  keyPrefix: string,
  suffix: string,
  lines: PreviewLine[],
): void {
  if (node.kind === 'scalar') {
    lines.push({
      text: `${indent}${keyPrefix}${JSON.stringify(node.value)}${suffix}`,
      sourcePath: node.sourcePath,
    });
    return;
  }
  if (node.kind === 'array') {
    lines.push({ text: `${indent}${keyPrefix}[`, sourcePath: node.sourcePath });
    renderJsonMergedNode(node.item, `${indent}  `, '', '', lines);
    lines.push({ text: `${indent}]${suffix}`, sourcePath: node.sourcePath });
    return;
  }
  const entries = Object.entries(node.children);
  if (entries.length === 0) {
    lines.push({
      text: `${indent}${keyPrefix}{}${suffix}`,
      sourcePath: node.sourcePath,
    });
    return;
  }
  lines.push({ text: `${indent}${keyPrefix}{`, sourcePath: node.sourcePath });
  entries.forEach(([key, child], i) => {
    const childSuffix = i < entries.length - 1 ? ',' : '';
    renderJsonMergedNode(
      child,
      `${indent}  `,
      `${JSON.stringify(key)}: `,
      childSuffix,
      lines,
    );
  });
  lines.push({ text: `${indent}}${suffix}`, sourcePath: node.sourcePath });
}

/** Same content as `JSON.stringify(mappingsToPreviewObject(mappings), null, 2)`, emitted line-by-line with each line tagged by the `sourcePath` of the mapping it renders — lets the live-preview panel highlight the exact line a focused source-tree row maps to, without re-deriving the merge-by-dotted-target-path logic from scratch. */
export function mappingsToJsonPreviewLines(
  mappings: IIntegrationMapping[],
): PreviewLine[] {
  const root: JsonMergedNode = {
    kind: 'object',
    sourcePath: null,
    children: buildJsonMergedChildren(mappings),
  };
  const lines: PreviewLine[] = [];
  renderJsonMergedNode(root, '', '', '', lines);
  return lines;
}

/** Flattens a mapping tree (including nested `OBJECT`/`ARRAY` children) so every leaf can be checked for `required` regardless of nesting depth. */
export function flattenMappings(
  mappings: IIntegrationMapping[],
): IIntegrationMapping[] {
  return mappings.flatMap((item) => [
    item,
    ...flattenMappings(item.children ?? []),
  ]);
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** Sanitizes a `targetPath` segment into a valid XML tag name — element names can't contain dots/spaces/etc. */
function toXmlTagName(name: string): string {
  const cleaned = name.replace(/[^a-zA-Z0-9_-]/g, '_');
  return /^[a-zA-Z_]/.test(cleaned) ? cleaned : `_${cleaned}`;
}

function mappingsToXmlLines(
  mappings: IIntegrationMapping[],
  indent: string,
): PreviewLine[] {
  return mappings.flatMap((item): PreviewLine[] => {
    if (!item.targetPath) return [];
    const tag = toXmlTagName(item.targetPath);
    const sourcePath = item.sourcePath;

    if (item.mappingType === 'SCALAR') {
      const value = escapeXml(item.defaultValue || `{{${item.sourcePath}}}`);
      return [{ text: `${indent}<${tag}>${value}</${tag}>`, sourcePath }];
    }

    const childLines = mappingsToXmlLines(item.children ?? [], `${indent}  `);
    return [
      { text: `${indent}<${tag}>`, sourcePath },
      ...childLines,
      { text: `${indent}</${tag}>`, sourcePath },
    ];
  });
}

/** Renders a mapping tree as XML lines under `rootName`, each tagged with the `sourcePath` of the mapping it renders (root tags get `null`) — the XML counterpart to `mappingsToJsonPreviewLines`. */
export function mappingsToXmlPreviewLines(
  mappings: IIntegrationMapping[],
  rootName: string,
): PreviewLine[] {
  const rootTag = toXmlTagName(rootName || 'root');
  const body = mappingsToXmlLines(mappings, '  ');
  return [
    { text: `<${rootTag}>`, sourcePath: null },
    ...body,
    { text: `</${rootTag}>`, sourcePath: null },
  ];
}

/** Renders a mapping tree as an indented XML string under `rootName` — the XML-format counterpart to `mappingsToPreviewObject`, same placeholder-token behavior for unset `SCALAR` values. */
export function mappingsToXmlString(
  mappings: IIntegrationMapping[],
  rootName: string,
): string {
  return mappingsToXmlPreviewLines(mappings, rootName)
    .map((line) => line.text)
    .join('\n');
}
