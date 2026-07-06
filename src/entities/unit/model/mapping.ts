import type { IUnit, UnitFormValues } from './types';

const EMPTY_VALUES: UnitFormValues = {
  name: '',
  code: 0,
  symbol: '',
  internationalAbbreviation: '',
};

export function toUnitFormValues(entity?: IUnit): UnitFormValues {
  if (!entity) return EMPTY_VALUES;
  return {
    name: entity.name,
    code: entity.code,
    symbol: entity.symbol,
    internationalAbbreviation: entity.internationalAbbreviation,
  };
}
