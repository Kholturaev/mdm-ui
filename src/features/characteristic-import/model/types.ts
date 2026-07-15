export interface CharacteristicImportRowDto {
  rowNumber: number;
  groupLabel: string;
  groupId: number;
  name: string;
  key: string;
  description: string;
  type: string;
  values: string[];
}

export interface CharacteristicImportErrorDto {
  rowNumber: number;
  groupLabel: string;
  name: string;
  key: string;
  error: string;
}

export interface CharacteristicImportPreviewDto {
  validRows: CharacteristicImportRowDto[];
  errorRows: CharacteristicImportErrorDto[];
}

export interface CharacteristicImportExecuteDto {
  created: number;
}
