export interface IAccountingProduct {
  id: number;
  name: string;
  description?: string;
}

export type AccountingProductFormValues = Omit<IAccountingProduct, 'id'>;
