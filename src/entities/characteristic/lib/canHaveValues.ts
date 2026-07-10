import type { CharacteristicType } from '../model/types';

/** Only these types manage a list of allowed values — TEXT is free-form. */
export function canHaveValues(type: CharacteristicType): boolean {
  return type !== 'TEXT';
}
