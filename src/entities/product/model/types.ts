export interface IProductNamedEntity {
  id: number;
  name: string;
}

export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  PASSIVE = 'PASSIVE',
  TEMPORARILY_PASSIVE = 'TEMPORARILY_PASSIVE',
}

export interface IProduct {
  id: number;
  name: string;
  code?: string;
  article?: string | null;
  description?: string | null;
  comment?: string | null;
  sapCode?: string;
  sapText?: string;
  gtin?: string;
  additionalGtins?: string | null;
  accountAmountPercent?: number | null;
  productStatus?: ProductStatus;
  isFree?: boolean;
  isViewOnlySmap?: boolean;
  isCalcAccAmountByPercent?: boolean;
  isAutoGenerateKM?: boolean;
  productGroup?: IProductNamedEntity | null;
  productGroupId?: number | null;
  category?: IProductNamedEntity | null;
  categoryId?: number | null;
  segment?: IProductNamedEntity | null;
  segmentId?: number | null;
  typeOfNomenclature?: IProductNamedEntity | null;
  baseUnit?: IProductNamedEntity | null;
  baseUnitId?: number | null;
  accountingProduct?: IProductNamedEntity | null;
  accountingProductId?: number | null;
  accountingUnit?: IProductNamedEntity | null;
  accountingUnitId?: number | null;
  alternateUnit?: IProductNamedEntity | null;
  alternateUnitId?: number | null;
  createdAt?: string;
  createdBy?: string;
  updatedBy?: string;
  /** IDs of the external systems (SAP, 1C, etc.) this product has been sent to. */
  externalSystemIds?: number[];
}

/**
 * The product's "Umumiy" (general info) fields — mirrors akfa-data-frontend's
 * product form field set (`ProductGeneralInfoCard`/`ProductGtinCard`/
 * `ProductAccountingInfoCard`). Used both by the required-fields-only create
 * modal (only `name`/`typeOfNomenclatureId`/`sapCode`/`article`/`baseUnitId`
 * are rendered there) and the details page's editable general-info tab
 * (which renders the rest too).
 */
export interface ProductFormValues {
  name: string;
  article: string;
  sapCode: string;
  typeOfNomenclatureId: number | null;
  baseUnitId: number | null;
  code?: string | null;
  sapText?: string;
  description?: string | null;
  comment?: string | null;
  productStatus?: ProductStatus;
  productGroupId?: number | null;
  categoryId?: number | null;
  segmentId?: number | null;
  gtin?: string;
  additionalGtins?: string | null;
  accountingProductId?: number | null;
  isFree?: boolean;
  isViewOnlySmap?: boolean;
  isCalcAccAmountByPercent?: boolean;
  isAutoGenerateKM?: boolean;
}
