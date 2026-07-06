import type { IProduct, ProductFormValues } from './types';

const EMPTY_VALUES: ProductFormValues = {
  name: '',
  article: '',
  sapCode: '',
  typeOfNomenclatureId: null,
  baseUnitId: null,
  code: '',
  sapText: '',
  description: '',
  comment: '',
  productStatus: undefined,
  productGroupId: null,
  categoryId: null,
  segmentId: null,
  gtin: '',
  additionalGtins: '',
  accountingProductId: null,
  isFree: false,
  isViewOnlySmap: false,
  isCalcAccAmountByPercent: false,
  isAutoGenerateKM: false,
};

export function toProductFormValues(product?: IProduct): ProductFormValues {
  if (!product) return EMPTY_VALUES;
  return {
    name: product.name,
    article: product.article ?? '',
    sapCode: product.sapCode ?? '',
    typeOfNomenclatureId: product.typeOfNomenclature?.id ?? null,
    baseUnitId: product.baseUnit?.id ?? null,
    code: product.code ?? '',
    sapText: product.sapText ?? '',
    description: product.description ?? '',
    comment: product.comment ?? '',
    productStatus: product.productStatus,
    productGroupId: product.productGroup?.id ?? null,
    categoryId: product.category?.id ?? null,
    segmentId: product.segment?.id ?? null,
    gtin: product.gtin ?? '',
    additionalGtins: product.additionalGtins ?? '',
    accountingProductId: product.accountingProduct?.id ?? null,
    isFree: product.isFree ?? false,
    isViewOnlySmap: product.isViewOnlySmap ?? false,
    isCalcAccAmountByPercent: product.isCalcAccAmountByPercent ?? false,
    isAutoGenerateKM: product.isAutoGenerateKM ?? false,
  };
}
