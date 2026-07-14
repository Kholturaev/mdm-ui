import type { IAccountingProduct, AccountingProductFormValues } from './types';

const EMPTY_VALUES: AccountingProductFormValues = {
  name: '',
  description: '',
};

export function toAccountingProductFormValues(
  entity?: IAccountingProduct,
): AccountingProductFormValues {
  if (!entity) return EMPTY_VALUES;
  return {
    name: entity.name,
    description: entity.description ?? '',
  };
}
