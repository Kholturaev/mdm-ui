export interface DynamicTableImportErrorDto {
  rowNumber: number;
  columnName: string;
  value: string;
  error: string;
}

export interface DynamicTableImportRowDto {
  rowNumber: number;
  tableId: number;
  columnValues: Record<number, string>;
}

export interface DynamicTableImportPreviewDto {
  tableId: number;
  tableName: string;
  validRows: DynamicTableImportRowDto[];
  errorRows: DynamicTableImportErrorDto[];
}

export interface DynamicTableImportExecuteDto {
  created: number;
}
