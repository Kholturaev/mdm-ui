export interface IUnitConversion {
  id: number;
  productId: number | null;
  baseUnitId: number | null;
  alternativeUnitId: number | null;
  /** e.g. `baseConversionFactor=1, alternativeConversionFactor=12` reads as "1 box = 12 pieces". */
  baseConversionFactor: number;
  alternativeConversionFactor: number;
  /** Denormalized by the backend so the table doesn't need a separate unit lookup. */
  baseUnitSymbol: string;
  alternativeUnitSymbol: string;
}

export type UnitConversionFormValues = Omit<
  IUnitConversion,
  'id' | 'baseUnitSymbol' | 'alternativeUnitSymbol'
>;
