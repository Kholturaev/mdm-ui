import type { IntegrationConfigSectionType } from '@entities/external-system/model/types';

export type SourceTab = 'product' | 'productGroup' | 'rate' | 'dealer';

export const SOURCE_TABS: SourceTab[] = [
  'product',
  'productGroup',
  'rate',
  'dealer',
];

export const TAB_TO_SECTION_TYPE: Record<
  SourceTab,
  IntegrationConfigSectionType
> = {
  product: 'PRODUCT',
  productGroup: 'PRODUCT_GROUP',
  rate: 'PRODUCT_RATE',
  dealer: 'DEALER',
};

export const SECTION_TYPE_TO_TAB: Record<
  IntegrationConfigSectionType,
  SourceTab
> = {
  PRODUCT: 'product',
  PRODUCT_GROUP: 'productGroup',
  PRODUCT_RATE: 'rate',
  DEALER: 'dealer',
};

export type NodeMappingMode = 'OBJECT' | 'FLAT';
export type TableViewMode = 'COLUMNS' | 'ROWS';

/**
 * Column sizing for every tree row — shared between `SourceTreeNode` (rows)
 * and `SourceSchemaTree` (header) so they line up exactly. `select` is the
 * merged expand-arrow + checkbox column; its content shifts right per
 * nesting depth (via inline padding in `SourceTreeNode`), so it stays a
 * plain pixel number for that arithmetic rather than a class string.
 * The rest are Tailwind width classes that shrink below `2xl` — narrower
 * screens need the fixed-width columns (especially the target-path input)
 * to give up space, or the flexible field-label column gets squeezed to
 * nothing and its text disappears entirely.
 */
export const TREE_COLUMNS = {
  select: 64,
  mode: 'w-20 2xl:w-[104px]',
  target: 'w-32 2xl:w-56',
  required: 'w-10 2xl:w-16',
  status: 'w-5 2xl:w-8',
};
