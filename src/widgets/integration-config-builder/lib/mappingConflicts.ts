import type { IIntegrationMapping } from '@entities/external-system/model/types';

export type MappingConflicts = {
  duplicateTargetPaths: Set<string>;
  conflictingSourcePaths: Set<string>;
  conflictCount: number;
};

function collectAbsolutePaths(
  mappings: IIntegrationMapping[],
  parentPath: string,
  out: { absolutePath: string; sourcePath: string }[],
): void {
  for (const mapping of mappings) {
    if (!mapping.targetPath) continue;
    const absolutePath = parentPath
      ? `${parentPath}.${mapping.targetPath}`
      : mapping.targetPath;
    out.push({ absolutePath, sourcePath: mapping.sourcePath });
    if (mapping.children?.length) {
      collectAbsolutePaths(mapping.children, absolutePath, out);
    }
  }
}

/** Two mappings that resolve to the same absolute target path (accounting for OBJECT/ARRAY nesting) would silently overwrite each other in the exported payload — this finds every such collision so the builder can block saving and highlight the offending rows. */
export function analyzeMappingConflicts(
  mappings: IIntegrationMapping[],
): MappingConflicts {
  const entries: { absolutePath: string; sourcePath: string }[] = [];
  collectAbsolutePaths(mappings, '', entries);

  const countByPath = new Map<string, number>();
  for (const entry of entries) {
    countByPath.set(
      entry.absolutePath,
      (countByPath.get(entry.absolutePath) ?? 0) + 1,
    );
  }

  const duplicateTargetPaths = new Set(
    [...countByPath.entries()]
      .filter(([, count]) => count > 1)
      .map(([path]) => path),
  );
  const conflictingSourcePaths = new Set(
    entries
      .filter((entry) => duplicateTargetPaths.has(entry.absolutePath))
      .map((entry) => entry.sourcePath),
  );

  return {
    duplicateTargetPaths,
    conflictingSourcePaths,
    conflictCount: duplicateTargetPaths.size,
  };
}
