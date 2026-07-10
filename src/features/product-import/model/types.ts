export interface ExternalSystemBriefDto {
  id: number;
  name: string;
}

export interface ProductImportPreviewDto {
  totalRows: number;
  validRows: number;
  willCreate: number;
  willUpdate: number;
  invalidRows: number;
  matchedColumns: string[];
  unmatchedColumns: string[];
  missingRequiredColumns: string[];
  sampleErrors: ProductImportErrorRow[];
  duplicateWarnings: string[];
}

export interface ProductImportResultDto {
  totalRows: number;
  inserted: number;
  updated: number;
  failed: number;
  errorFileUrl: string | null;
  errors: ProductImportErrorRow[];
}

export interface ProductImportErrorRow {
  rowNumber: number;
  column: string | null;
  value: string | null;
  error: string;
}
