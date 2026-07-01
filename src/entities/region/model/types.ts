export enum RegionType {
  District = 'District',
  Region = 'Region',
  City = 'City',
}

export interface IRegion {
  id: number;
  name: string;
  parentId: number | null;
  type: RegionType | null;
}
