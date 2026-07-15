export interface ProductDynamicRowLinkErrorDto {
  rowNumber: number;
  productCode: string;
  rowCode: string;
  error: string;
}

export interface ProductDynamicRowLinkRowDto {
  rowNumber: number;
  productId: number;
  productCode: string;
  rowId: number;
  rowCode: string;
}

export interface ProductDynamicRowLinkPreviewDto {
  tableId: number;
  tableName: string;
  validRows: ProductDynamicRowLinkRowDto[];
  errorRows: ProductDynamicRowLinkErrorDto[];
}

export interface ProductDynamicRowLinkExecuteDto {
  linked: number;
}
