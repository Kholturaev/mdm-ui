import type { ISegment, SegmentFormValues } from './types';

const EMPTY_VALUES: SegmentFormValues = {
  name: '',
};

export function toSegmentFormValues(entity?: ISegment): SegmentFormValues {
  if (!entity) return EMPTY_VALUES;
  return { name: entity.name };
}
