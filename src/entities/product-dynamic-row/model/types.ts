export interface IProductDynamicRow {
  id: number;
  productId: number;
  rowId: number;
  position: number | null;
}

export interface ProductDynamicRowBulkAttachPayload {
  productId: number;
  tableId: number;
  rowIds: number[];
}
