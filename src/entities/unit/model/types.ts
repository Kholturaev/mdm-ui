export interface IUnit {
  id: number;
  name: string;
  code: number;
  symbol: string;
  internationalAbbreviation: string;
}

export type UnitFormValues = Omit<IUnit, 'id'>;
