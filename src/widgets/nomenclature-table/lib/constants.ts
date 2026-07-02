import { ProductStatus } from '@entities/product/model/types';
import type { BadgeVariant } from '@shared/ui/Badge';

export const STATUS_VARIANT: Record<ProductStatus, BadgeVariant> = {
  [ProductStatus.ACTIVE]: 'success',
  [ProductStatus.PASSIVE]: 'neutral',
  [ProductStatus.TEMPORARILY_PASSIVE]: 'warning',
};

// Only columns the backend actually supports filtering on get a search box in the filter row.
export const FILTER_KEY_BY_COLUMN: Record<string, string> = {
  id: 'id',
  name: 'name',
  sapCode: 'sapCode',
  sapText: 'sapText',
  productGroup: 'productGroupName',
  category: 'categoryName',
  segment: 'segmentName',
  typeOfNomenclature: 'typeOfNomenclatureName',
  productStatus: 'productStatus',
  baseUnit: 'baseUnitName',
  gtin: 'gtin',
  createdBy: 'createdBy',
  createdAt: 'createdAt',
};
