import { formatPrice } from '@shared/lib/formatPrice';
import type { IUnitConversion } from '../model/types';

/** e.g. "1 quti = 12 dona" */
export function formatConversionLine(row: IUnitConversion): string {
  return `${formatPrice(row.baseConversionFactor)} ${row.baseUnitSymbol} = ${formatPrice(row.alternativeConversionFactor)} ${row.alternativeUnitSymbol}`;
}
