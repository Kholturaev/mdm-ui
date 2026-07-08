export interface IProductAttributeExternalSystem {
  id: number;
  name: string;
}

export interface IProductAttribute {
  id: number;
  name: string;
  key: string;
  value: string;
  productId: number;
  /** An attribute may be sourced from more than one external system at once — this is what drives the "group by system" view. */
  externalSystemIds?: number[];
  externalSystems?: IProductAttributeExternalSystem[] | null;
}

export type ProductAttributeFormValues = Omit<
  IProductAttribute,
  'id' | 'externalSystems'
>;
