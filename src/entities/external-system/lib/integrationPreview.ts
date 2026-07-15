import type { IIntegrationMapping } from '../model/types';

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
): string[] {
  return mappings.flatMap((item) => {
    if (!item.targetPath) return [];
    const tag = toXmlTagName(item.targetPath);

    if (item.mappingType === 'SCALAR') {
      const value = escapeXml(item.defaultValue || `{{${item.sourcePath}}}`);
      return [`${indent}<${tag}>${value}</${tag}>`];
    }

    const childLines = mappingsToXmlLines(item.children ?? [], `${indent}  `);
    if (item.mappingType === 'ARRAY') {
      return [
        `${indent}<${tag}>`,
        ...mappingsToXmlLines(item.children ?? [], `${indent}  `),
        `${indent}</${tag}>`,
      ];
    }
    return [`${indent}<${tag}>`, ...childLines, `${indent}</${tag}>`];
  });
}

/** Renders a mapping tree as an indented XML string under `rootName` — the XML-format counterpart to `mappingsToPreviewObject`, same placeholder-token behavior for unset `SCALAR` values. */
export function mappingsToXmlString(
  mappings: IIntegrationMapping[],
  rootName: string,
): string {
  const rootTag = toXmlTagName(rootName || 'root');
  const body = mappingsToXmlLines(mappings, '  ');
  return [`<${rootTag}>`, ...body, `</${rootTag}>`].join('\n');
}
