export interface IProductCategory {
  id: number;
  name: string;
  description?: string;
}

export type ProductCategoryFormValues = Omit<IProductCategory, 'id'>;
