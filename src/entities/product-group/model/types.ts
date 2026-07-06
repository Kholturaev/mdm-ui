export interface IProductGroup {
  id: number;
  name: string;
  description?: string;
  code: string;
}

export type ProductGroupFormValues = Omit<IProductGroup, 'id'>;
