export type DynamicColumnDataType = 'STRING' | 'NUMBER' | 'BOOLEAN' | 'DATE';

export type CreateDynamicCharacteristicTablePayload = {
  characteristicGroupId: number;
  name: string;
};

export type CreateOrUpdateDynamicCharacteristicColumnPayload = {
  id?: number;
  tableId: number;
  name: string;
  key: string;
  dataType: DynamicColumnDataType;
  position: number;
  required: boolean;
};

export type CreateOrUpdateDynamicCharacteristicRowPayload = {
  id?: number;
  tableId: number;
  values: { columnId: number; value: string; id?: number; rowId?: number }[];
};

export type ReorderDynamicCharacteristicColumnsPayload = {
  tableId: number;
  columns: { id: number; position: number }[];
};

export interface IDynamicCharacteristicColumn {
  id: number;
  tableId?: number;
  name: string;
  key: string;
  dataType: DynamicColumnDataType;
  position: number;
  required: boolean;
}

export interface IDynamicCharacteristicRow {
  id: number;
  position: number;
  values: Record<string, string> | null;
}

export interface IDynamicCharacteristicTable {
  tableId: number;
  tableName: string;
  description?: string | null;
  characteristicGroupId: number;
  columns: IDynamicCharacteristicColumn[];
  rows: IDynamicCharacteristicRow[];
}

/** Row values come back keyed by column id (e.g. "84"), sometimes by column key (e.g. "code") — support both. */
export function getDynamicRowValue(
  row: IDynamicCharacteristicRow,
  column: IDynamicCharacteristicColumn,
): string | null {
  const values = row.values;
  if (!values) return null;
  const raw = values[String(column.id)] ?? values[column.key];
  if (raw === null || raw === undefined || raw === '') return null;
  return String(raw);
}

/** `DATE` values are formatted manually (DD.MM.YYYY) rather than via `Intl` — see DataTable.tsx's own filter-date helpers for why: incomplete ICU data for uz/ru makes `Intl` output unreliable. */
export function formatDynamicValue(
  row: IDynamicCharacteristicRow,
  column: IDynamicCharacteristicColumn,
  yesLabel: string,
  noLabel: string,
): string | null {
  const raw = getDynamicRowValue(row, column);
  if (raw === null) return null;

  if (column.dataType === 'BOOLEAN') {
    return raw === 'true' || raw === '1' ? yesLabel : noLabel;
  }

  if (column.dataType === 'DATE') {
    const [year, month, day] = raw.split('T')[0].split('-');
    if (year && month && day) return `${day}.${month}.${year}`;
  }

  return raw;
}
