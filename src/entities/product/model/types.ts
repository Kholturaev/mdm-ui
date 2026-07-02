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
  productGroup?: IProductNamedEntity | null;
  category?: IProductNamedEntity | null;
  categoryId?: number | null;
  segment?: IProductNamedEntity | null;
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
