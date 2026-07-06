export interface ISegment {
  id: number;
  name: string;
}

export type SegmentFormValues = Omit<ISegment, 'id'>;
