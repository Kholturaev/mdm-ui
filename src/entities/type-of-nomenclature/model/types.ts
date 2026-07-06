export interface ITypeOfNomenclature {
  id: number;
  name: string;
  description?: string;
}

export type TypeOfNomenclatureFormValues = Omit<ITypeOfNomenclature, 'id'>;
