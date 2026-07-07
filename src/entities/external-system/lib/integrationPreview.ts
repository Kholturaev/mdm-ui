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
