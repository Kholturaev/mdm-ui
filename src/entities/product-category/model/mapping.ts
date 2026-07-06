import type { IProductCategory, ProductCategoryFormValues } from './types';

const EMPTY_VALUES: ProductCategoryFormValues = {
  name: '',
  description: '',
};

export function toProductCategoryFormValues(
  entity?: IProductCategory,
): ProductCategoryFormValues {
  if (!entity) return EMPTY_VALUES;
  return { name: entity.name, description: entity.description ?? '' };
}
