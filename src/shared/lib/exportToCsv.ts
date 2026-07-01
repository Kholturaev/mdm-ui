export type CsvColumn<TRow> = {
  label: string;
  getValue: (row: TRow) => string | number | null | undefined;
};

function escapeCsvCell(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function exportToCsv<TRow>(
  filename: string,
  rows: TRow[],
  columns: CsvColumn<TRow>[],
) {
  const header = columns.map((c) => escapeCsvCell(c.label)).join(',');
  const lines = rows.map((row) =>
    columns.map((c) => escapeCsvCell(String(c.getValue(row) ?? ''))).join(','),
  );
  // Leading BOM so Excel opens UTF-8 (Cyrillic/Latin-extended) text correctly.
  const csv = ['﻿' + header, ...lines].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
