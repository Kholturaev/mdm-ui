export interface IProductAttribute {
  id: number;
  name: string;
  key: string;
  value: string;
  productId: number;
  externalSystemId?: number | null;
  externalSystem?: {
    id: number;
    name: string;
  } | null;
}

export type ProductAttributeFormValues = Omit<
  IProductAttribute,
  'id' | 'externalSystem'
>;
