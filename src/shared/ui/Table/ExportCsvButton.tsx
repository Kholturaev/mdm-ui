import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../Button';
import { DownloadIcon } from '../icons/DownloadIcon';
import { exportToCsv } from '@shared/lib/exportToCsv';
import type { CsvColumn } from '@shared/lib/exportToCsv';
import { useClickOutside } from '@shared/lib/hooks/useClickOutside';

type ExportCsvButtonProps<TRow> = {
  filename: string;
  rows: TRow[];
  columns: CsvColumn<TRow>[];
};

/** Exports the currently loaded rows as a CSV file — opens a column picker first (all columns selected by default) instead of exporting everything immediately. */
export function ExportCsvButton<TRow>({
  filename,
  rows,
  columns,
}: ExportCsvButtonProps<TRow>) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(() => columns.map((c) => c.label));
  const containerRef = useRef<HTMLDivElement>(null);
  useClickOutside(containerRef, () => setIsOpen(false));

  const allSelected = selected.length === columns.length;

  const toggle = (label: string) => {
    setSelected((prev) =>
      prev.includes(label)
        ? prev.filter((existing) => existing !== label)
        : [...prev, label],
    );
  };

  const toggleAll = () => {
    setSelected(allSelected ? [] : columns.map((c) => c.label));
  };

  const handleExport = () => {
    const chosen = columns.filter((column) => selected.includes(column.label));
    exportToCsv(filename, rows, chosen);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <Button
        variant="outline"
        size="sm"
        icon={<DownloadIcon size={14} />}
        onClick={() => setIsOpen((open) => !open)}
        disabled={rows.length === 0}
      >
        {t('common.export')}
      </Button>

      {isOpen && (
        <div className="border-border bg-surface absolute top-full right-0 z-50 mt-1 w-64 rounded-md border p-3 shadow-lg">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-fg text-xs font-semibold">
              {t('common.exportColumns')}
            </span>
            <button
              type="button"
              onClick={toggleAll}
              className="text-fg-muted hover:text-primary text-[11px] font-medium transition-colors hover:underline"
            >
              {allSelected ? t('common.deselectAll') : t('common.selectAll')}
            </button>
          </div>

          <div className="-mx-1 max-h-60 overflow-y-auto">
            {columns.map((column) => (
              <label
                key={column.label}
                className="hover:bg-surface-hover flex cursor-pointer items-center gap-2 rounded px-1 py-1.5 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(column.label)}
                  onChange={() => toggle(column.label)}
                  className="accent-primary size-3.5 shrink-0"
                />
                <span className="text-fg truncate text-xs">{column.label}</span>
              </label>
            ))}
          </div>

          <div className="mt-3 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => setIsOpen(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              size="sm"
              className="flex-1"
              onClick={handleExport}
              disabled={selected.length === 0}
            >
              {t('common.export')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
