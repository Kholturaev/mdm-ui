const SECTION_TYPE = 'PRODUCT';

/**
 * preview/execute only accept a single optional externalSystemId (the same
 * backend contract akfa-data-frontend uses) — when more than one system was
 * selected, it's omitted here.
 */
export function buildImportActionQuery(externalSystemIds: number[]): string {
  const single =
    externalSystemIds.length === 1 ? externalSystemIds[0] : undefined;
  return single !== undefined
    ? `externalSystemId=${single}&sectionType=${SECTION_TYPE}`
    : `sectionType=${SECTION_TYPE}`;
}
