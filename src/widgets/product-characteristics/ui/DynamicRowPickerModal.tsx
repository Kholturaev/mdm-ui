import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ColumnDef } from '@tanstack/react-table';
import type {
  IDynamicCharacteristicRow,
  IDynamicCharacteristicTable,
} from '@entities/dynamic-characteristic/model/types';
import { formatDynamicValue } from '@entities/dynamic-characteristic/model/types';
import { Button } from '@shared/ui/Button';
import { Checkbox } from '@shared/ui/Checkbox';
import { Input } from '@shared/ui/Input';
import { Modal } from '@shared/ui/Modal';
import { DataTable } from '@shared/ui/Table';
import { SearchIcon } from '@shared/ui/icons/SearchIcon';

export function DynamicRowPickerModal({
  table,
  attachedRowIds,
  isSaving,
  onSave,
  onClose,
}: {
  table: IDynamicCharacteristicTable;
  attachedRowIds: number[];
  isSaving: boolean;
  onSave: (rowIds: number[]) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  // Mounted only while the modal is open (see DynamicTableRow), so this lazy
  // initializer is all that's needed to seed the draft from what's attached.
  const [selected, setSelected] = useState<Set<number>>(
    () => new Set(attachedRowIds),
  );
  const [search, setSearch] = useState('');

  const sortedColumns = useMemo(
    () => [...table.columns].sort((a, b) => a.position - b.position),
    [table.columns],
  );

  const visibleRows = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return table.rows;
    return table.rows.filter((row) =>
      sortedColumns.some((column) => {
        const formatted = formatDynamicValue(
          row,
          column,
          t('common.yes'),
          t('common.no'),
        );
        return formatted?.toLowerCase().includes(term);
      }),
    );
  }, [table.rows, search, sortedColumns, t]);

  const toggleRow = (rowId: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(rowId)) next.delete(rowId);
      else next.add(rowId);
      return next;
    });
  };

  const allVisibleSelected =
    visibleRows.length > 0 && visibleRows.every((row) => selected.has(row.id));

  const toggleAllVisible = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) visibleRows.forEach((row) => next.delete(row.id));
      else visibleRows.forEach((row) => next.add(row.id));
      return next;
    });
  };

  const columns = useMemo<ColumnDef<IDynamicCharacteristicRow>[]>(
    () => [
      {
        id: 'select',
        size: 36,
        meta: { pin: 'left' },
        header: () => (
          <Checkbox checked={allVisibleSelected} onChange={toggleAllVisible} />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={selected.has(row.original.id)}
            onChange={() => toggleRow(row.original.id)}
          />
        ),
      },
      ...sortedColumns.map<ColumnDef<IDynamicCharacteristicRow>>((column) => ({
        id: `col-${column.id}`,
        header: column.name,
        cell: ({ row }) =>
          formatDynamicValue(
            row.original,
            column,
            t('common.yes'),
            t('common.no'),
          ) ?? '—',
      })),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps -- toggleAllVisible/toggleRow close over `selected`/`visibleRows`, already deps
    [sortedColumns, selected, allVisibleSelected, visibleRows, t],
  );

  return (
    <Modal isOpen onClose={onClose} title={table.tableName} size="lg">
      <div className="flex flex-col gap-3">
        {table.description && (
          <p className="text-fg-muted text-xs">{table.description}</p>
        )}

        <Input
          size="sm"
          leftIcon={<SearchIcon size={14} />}
          placeholder={t('common.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="border-border h-80 overflow-hidden rounded-lg border">
          <DataTable
            columns={columns}
            data={visibleRows}
            emptyMessage={t('common.noData')}
          />
        </div>

        <div className="flex items-center justify-between gap-3 pt-1">
          <p className="text-fg-muted text-xs">
            {t('product.char.rowsSelected', { count: selected.size })}
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              disabled={isSaving}
              onClick={onClose}
            >
              {t('common.cancel')}
            </Button>
            <Button
              size="sm"
              isLoading={isSaving}
              onClick={() => onSave(Array.from(selected))}
            >
              {t('common.save')}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
