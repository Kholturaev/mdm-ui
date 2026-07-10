export type ProductImportParams = {
  externalSystemIds: number[];
  includePrice: boolean;
  clientTypeIds: number[];
};

const SECTION_TYPE = 'PRODUCT';

/**
 * Mirrors the akfa-data backend's three template endpoints exactly (same
 * backend as akfa-data-frontend, reached through the same /akfa-data gateway
 * prefix) — a single externalSystemId gets the plain template, multiple
 * systems get template-multi, and turning prices on always goes through
 * template-with-rates regardless of system count.
 */
export function buildTemplateDownloadPath({
  externalSystemIds,
  includePrice,
  clientTypeIds,
}: ProductImportParams): string {
  if (includePrice) {
    const qs = [
      ...externalSystemIds.map((id) => `externalSystemIds=${id}`),
      ...clientTypeIds.map((id) => `clientTypeIds=${id}`),
      `sectionType=${SECTION_TYPE}`,
    ].join('&');
    return `/product/import/template-with-rates.xlsx?${qs}`;
  }

  if (externalSystemIds.length === 1) {
    return `/product/import/template.xlsx?externalSystemId=${externalSystemIds[0]}&sectionType=${SECTION_TYPE}`;
  }

  const qs = [
    ...externalSystemIds.map((id) => `externalSystemIds=${id}`),
    `sectionType=${SECTION_TYPE}`,
  ].join('&');
  return `/product/import/template-multi.xlsx?${qs}`;
}

/**
 * preview/execute only accept a single optional externalSystemId (the same
 * backend contract akfa-data-frontend uses) — when more than one system was
 * selected for the template, it's omitted here.
 */
export function buildImportActionQuery(externalSystemIds: number[]): string {
  const single =
    externalSystemIds.length === 1 ? externalSystemIds[0] : undefined;
  return single !== undefined
    ? `externalSystemId=${single}&sectionType=${SECTION_TYPE}`
    : `sectionType=${SECTION_TYPE}`;
}
