import type { IProductGroup, ProductGroupFormValues } from './types';

const EMPTY_VALUES: ProductGroupFormValues = {
  name: '',
  description: '',
  code: '',
};

export function toProductGroupFormValues(
  entity?: IProductGroup,
): ProductGroupFormValues {
  if (!entity) return EMPTY_VALUES;
  return {
    name: entity.name,
    description: entity.description ?? '',
    code: entity.code,
  };
}
