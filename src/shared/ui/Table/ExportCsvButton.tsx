import { useTranslation } from 'react-i18next';
import { Button } from '../Button';
import { DownloadIcon } from '../icons/DownloadIcon';
import { exportToCsv } from '@shared/lib/exportToCsv';
import type { CsvColumn } from '@shared/lib/exportToCsv';

type ExportCsvButtonProps<TRow> = {
  filename: string;
  rows: TRow[];
  columns: CsvColumn<TRow>[];
};

/** Exports the currently loaded rows as a CSV file (opens fine in Excel) — reusable across any table. */
export function ExportCsvButton<TRow>({
  filename,
  rows,
  columns,
}: ExportCsvButtonProps<TRow>) {
  const { t } = useTranslation();

  return (
    <Button
      variant="outline"
      size="sm"
      icon={<DownloadIcon size={14} />}
      onClick={() => exportToCsv(filename, rows, columns)}
      disabled={rows.length === 0}
    >
      {t('common.export')}
    </Button>
  );
}
