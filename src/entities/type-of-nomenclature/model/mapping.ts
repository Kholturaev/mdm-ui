import type {
  ITypeOfNomenclature,
  TypeOfNomenclatureFormValues,
} from './types';

const EMPTY_VALUES: TypeOfNomenclatureFormValues = {
  name: '',
  description: '',
};

export function toTypeOfNomenclatureFormValues(
  entity?: ITypeOfNomenclature,
): TypeOfNomenclatureFormValues {
  if (!entity) return EMPTY_VALUES;
  return { name: entity.name, description: entity.description ?? '' };
}
