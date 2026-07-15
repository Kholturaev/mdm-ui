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
