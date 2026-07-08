export interface IProductCharacteristicValue {
  id: number;
  productId: number;
  characteristicId: number;
  charValueId: number | null;
  value: string | null;
  position: number;
}

export interface ProductCharacteristicValueBulkAttachPayload {
  productId: number;
  characteristicId: number;
  valueIds: number[];
}

export interface ProductCharacteristicValueTextAttachPayload {
  productId: number;
  characteristicId: number;
  textValue: string;
}
