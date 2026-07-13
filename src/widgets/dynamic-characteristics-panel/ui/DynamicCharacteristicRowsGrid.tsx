import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ColumnDef } from '@tanstack/react-table';
import type {
  IDynamicCharacteristicColumn,
  IDynamicCharacteristicTable,
} from '@entities/dynamic-characteristic/model/types';
import { getDynamicRowValue } from '@entities/dynamic-characteristic/model/types';
import {
  useCreateOrUpdateDynamicCharacteristicRowMutation,
  useDeleteDynamicCharacteristicColumnMutation,
  useDeleteDynamicCharacteristicRowMutation,
  useReorderDynamicCharacteristicColumnsMutation,
} from '@entities/dynamic-characteristic/api/dynamicCharacteristicApi';
import { DataTable } from '@shared/ui/Table';
import { Button } from '@shared/ui/Button';
import { Badge } from '@shared/ui/Badge';
import { RowActions } from '@shared/ui/Menu';
import { PermissionGuard } from '@shared/ui/PermissionGuard';
import { PlusIcon } from '@shared/ui/icons/PlusIcon';
import { EditIcon } from '@shared/ui/icons/EditIcon';
import { DeleteIcon } from '@shared/ui/icons/DeleteIcon';
import { CheckIcon } from '@shared/ui/icons/CheckIcon';
import { CloseIcon } from '@shared/ui/icons/ChevronDownIcon';
import { Permissions } from '@shared/constants/permissions';
import { usePermission } from '@shared/lib/hooks/usePermission';
import { useConfirm } from '@shared/lib/confirm';
import { parseApiError } from '@shared/api/parseApiError';
import type { ApiException } from '@shared/api/type';
import { notify } from '@shared/lib/toast';
import { DynamicCharacteristicCellInput } from './components/DynamicCharacteristicCellInput';

type GridRow = {
  key: string;
  rowId: number | null;
  isDraft: boolean;
};

let draftCounter = 0;

function formatDisplayValue(
  raw: string,
  column: IDynamicCharacteristicColumn,
  yesLabel: string,
  noLabel: string,
): string {
  if (!raw) return '—';
  if (column.dataType === 'BOOLEAN') return raw === 'true' ? yesLabel : noLabel;
  if (column.dataType === 'DATE') {
    const [year, month, day] = raw.split('T')[0].split('-');
    if (year && month && day) return `${day}.${month}.${year}`;
  }
  return raw;
}

function findMissingRequiredColumn(
  columns: IDynamicCharacteristicColumn[],
  values: Record<number, string>,
) {
  return columns.find(
    (column) => column.required && !values[column.id]?.trim(),
  );
}

type DynamicCharacteristicRowsGridProps = {
  table: IDynamicCharacteristicTable;
  onEditColumn: (column: IDynamicCharacteristicColumn) => void;
  onAddColumn: () => void;
};

export function DynamicCharacteristicRowsGrid({
  table,
  onEditColumn,
  onAddColumn,
}: DynamicCharacteristicRowsGridProps) {
  const { t } = useTranslation();
  const { can } = usePermission();
  const confirm = useConfirm();
  const canEditRows = can(Permissions.CHARACTERISTIC_ROW.CREATE);
  const canDeleteRows = can(Permissions.CHARACTERISTIC_ROW.DELETE);
  const canCreateColumns = can(Permissions.CHARACTERISTIC_COLUMN.CREATE);

  const sortedColumns = useMemo(
    () => [...table.columns].sort((a, b) => a.position - b.position),
    [table.columns],
  );

  const [editingValues, setEditingValues] = useState<
    Record<string, Record<number, string>>
  >({});
  const [draftKeys, setDraftKeys] = useState<string[]>([]);
  const [draggedColumnId, setDraggedColumnId] = useState<number | null>(null);

  const [saveRow, { isLoading: isSavingRow }] =
    useCreateOrUpdateDynamicCharacteristicRowMutation();
  const [deleteRow] = useDeleteDynamicCharacteristicRowMutation();
  const [deleteColumn] = useDeleteDynamicCharacteristicColumnMutation();
  const [reorderColumns] = useReorderDynamicCharacteristicColumnsMutation();

  const rows = useMemo<GridRow[]>(
    () => [
      ...table.rows.map((row) => ({
        key: String(row.id),
        rowId: row.id,
        isDraft: false,
      })),
      ...draftKeys.map((key) => ({ key, rowId: null, isDraft: true })),
    ],
    [table.rows, draftKeys],
  );

  const startEdit = useCallback(
    (row: GridRow) => {
      if (editingValues[row.key]) return;
      const sourceRow = table.rows.find((r) => r.id === row.rowId);
      const values: Record<number, string> = {};
      sortedColumns.forEach((column) => {
        values[column.id] = sourceRow
          ? (getDynamicRowValue(sourceRow, column) ?? '')
          : '';
      });
      setEditingValues((prev) => ({ ...prev, [row.key]: values }));
    },
    [editingValues, sortedColumns, table.rows],
  );

  const cancelEdit = useCallback((row: GridRow) => {
    setEditingValues((prev) => {
      const next = { ...prev };
      delete next[row.key];
      return next;
    });
    if (row.isDraft) {
      setDraftKeys((prev) => prev.filter((key) => key !== row.key));
    }
  }, []);

  const updateCell = useCallback(
    (rowKey: string, columnId: number, value: string) => {
      setEditingValues((prev) => ({
        ...prev,
        [rowKey]: { ...prev[rowKey], [columnId]: value },
      }));
    },
    [],
  );

  const handleSaveRow = useCallback(
    async (row: GridRow) => {
      const values = editingValues[row.key] ?? {};
      const missingColumn = findMissingRequiredColumn(sortedColumns, values);
      if (missingColumn) {
        notify.error(
          t('dynamicCharacteristic.requiredColumnMissing', {
            name: missingColumn.name,
          }),
        );
        return;
      }

      try {
        await saveRow({
          id: row.isDraft ? undefined : (row.rowId ?? undefined),
          tableId: table.tableId,
          values: sortedColumns.map((column) => ({
            columnId: column.id,
            value: values[column.id] ?? '',
          })),
        }).unwrap();
        notify.success(t('message.saved'));
        setEditingValues((prev) => {
          const next = { ...prev };
          delete next[row.key];
          return next;
        });
        if (row.isDraft) {
          setDraftKeys((prev) => prev.filter((key) => key !== row.key));
        }
      } catch (error) {
        notify.error(parseApiError(error as ApiException));
      }
    },
    [editingValues, saveRow, sortedColumns, t, table.tableId],
  );

  const handleDeleteRow = useCallback(
    async (row: GridRow) => {
      if (row.rowId === null) return;
      const confirmed = await confirm({
        title: t('dynamicCharacteristic.deleteRowTitle'),
        description: t('dynamicCharacteristic.deleteRowConfirm'),
      });
      if (!confirmed) return;

      try {
        await deleteRow(row.rowId).unwrap();
        notify.success(t('message.deleted'));
      } catch (error) {
        notify.error(parseApiError(error as ApiException));
      }
    },
    [confirm, deleteRow, t],
  );

  const handleAddRow = () => {
    draftCounter += 1;
    const key = `draft-${draftCounter}`;
    const values: Record<number, string> = {};
    sortedColumns.forEach((column) => {
      values[column.id] = '';
    });
    setDraftKeys((prev) => [...prev, key]);
    setEditingValues((prev) => ({ ...prev, [key]: values }));
  };

  const handleDeleteColumn = useCallback(
    async (column: IDynamicCharacteristicColumn) => {
      const confirmed = await confirm({
        title: t('dynamicCharacteristic.deleteColumnTitle'),
        description: t('dynamicCharacteristic.deleteColumnConfirm', {
          name: column.name,
        }),
      });
      if (!confirmed) return;

      try {
        await deleteColumn(column.id).unwrap();
        notify.success(t('message.deleted'));
      } catch (error) {
        notify.error(parseApiError(error as ApiException));
      }
    },
    [confirm, deleteColumn, t],
  );

  const handleDropColumn = useCallback(
    async (targetColumn: IDynamicCharacteristicColumn) => {
      if (draggedColumnId === null || draggedColumnId === targetColumn.id) {
        setDraggedColumnId(null);
        return;
      }
      const fromIndex = sortedColumns.findIndex(
        (c) => c.id === draggedColumnId,
      );
      const toIndex = sortedColumns.findIndex((c) => c.id === targetColumn.id);
      setDraggedColumnId(null);
      if (fromIndex === -1 || toIndex === -1) return;

      const reordered = [...sortedColumns];
      const [moved] = reordered.splice(fromIndex, 1);
      reordered.splice(toIndex, 0, moved);

      try {
        await reorderColumns({
          tableId: table.tableId,
          columns: reordered.map((column, index) => ({
            id: column.id,
            position: index + 1,
          })),
        }).unwrap();
      } catch (error) {
        notify.error(parseApiError(error as ApiException));
      }
    },
    [draggedColumnId, reorderColumns, sortedColumns, table.tableId],
  );

  const columns = useMemo<ColumnDef<GridRow>[]>(() => {
    const dataColumns: ColumnDef<GridRow>[] = sortedColumns.map((column) => ({
      id: String(column.id),
      header: () => (
        <div
          draggable
          onDragStart={() => setDraggedColumnId(column.id)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDropColumn(column)}
          className="flex cursor-move items-center justify-between gap-1.5"
        >
          <span className="flex min-w-0 items-center gap-1 truncate">
            <span className="truncate">{column.name}</span>
            {column.required && <span className="text-danger">*</span>}
            <Badge variant="neutral">
              {t(`dynamicCharacteristic.dataType.${column.dataType}`)}
            </Badge>
          </span>
          <span className="flex shrink-0 items-center gap-0.5">
            <PermissionGuard
              permission={Permissions.CHARACTERISTIC_COLUMN.CREATE}
            >
              <button
                type="button"
                onClick={() => onEditColumn(column)}
                aria-label={t('common.edit')}
                className="text-fg-muted hover:bg-surface-hover hover:text-fg inline-flex size-5 items-center justify-center rounded transition-colors"
              >
                <EditIcon size={11} />
              </button>
            </PermissionGuard>
            <PermissionGuard
              permission={Permissions.CHARACTERISTIC_COLUMN.DELETE}
            >
              <button
                type="button"
                onClick={() => handleDeleteColumn(column)}
                aria-label={t('common.delete')}
                className="text-fg-muted hover:bg-danger/10 hover:text-danger inline-flex size-5 items-center justify-center rounded transition-colors"
              >
                <DeleteIcon size={11} />
              </button>
            </PermissionGuard>
          </span>
        </div>
      ),
      cell: ({ row }) => {
        const gridRow = row.original;
        const draft = editingValues[gridRow.key];
        if (draft) {
          return (
            <DynamicCharacteristicCellInput
              dataType={column.dataType}
              value={draft[column.id] ?? ''}
              onChange={(value) => updateCell(gridRow.key, column.id, value)}
            />
          );
        }
        const sourceRow = table.rows.find((r) => r.id === gridRow.rowId);
        const raw = sourceRow
          ? (getDynamicRowValue(sourceRow, column) ?? '')
          : '';
        return (
          <span className="text-fg">
            {formatDisplayValue(raw, column, t('common.yes'), t('common.no'))}
          </span>
        );
      },
    }));

    if (canEditRows || canDeleteRows || canCreateColumns) {
      dataColumns.push({
        id: 'actions',
        header: () =>
          canCreateColumns ? (
            <Button
              size="sm"
              variant="secondary"
              icon={<PlusIcon size={13} />}
              onClick={onAddColumn}
            >
              {t('dynamicCharacteristic.addColumn')}
            </Button>
          ) : null,
        meta: { pin: 'right' },
        cell: ({ row }) => {
          const gridRow = row.original;
          const isEditing = Boolean(editingValues[gridRow.key]);

          if (isEditing) {
            return (
              <RowActions
                items={[
                  {
                    label: t('common.save'),
                    icon: <CheckIcon size={14} />,
                    onClick: () => handleSaveRow(gridRow),
                  },
                  {
                    label: t('common.cancel'),
                    icon: <CloseIcon size={12} />,
                    onClick: () => cancelEdit(gridRow),
                  },
                ]}
              />
            );
          }

          return (
            <RowActions
              items={[
                ...(canEditRows
                  ? [
                      {
                        label: t('common.edit'),
                        icon: <EditIcon size={14} />,
                        onClick: () => startEdit(gridRow),
                      },
                    ]
                  : []),
                ...(canDeleteRows
                  ? [
                      {
                        label: t('common.delete'),
                        icon: <DeleteIcon size={14} />,
                        onClick: () => handleDeleteRow(gridRow),
                        danger: true,
                      },
                    ]
                  : []),
              ]}
            />
          );
        },
      });
    }

    return dataColumns;
  }, [
    sortedColumns,
    editingValues,
    handleDropColumn,
    handleDeleteColumn,
    onEditColumn,
    onAddColumn,
    table.rows,
    t,
    updateCell,
    canEditRows,
    canDeleteRows,
    canCreateColumns,
    handleSaveRow,
    cancelEdit,
    startEdit,
    handleDeleteRow,
  ]);

  if (sortedColumns.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <p className="text-fg-muted text-sm">
          {t('dynamicCharacteristic.noColumnsHint')}
        </p>
        <PermissionGuard permission={Permissions.CHARACTERISTIC_COLUMN.CREATE}>
          <Button size="sm" icon={<PlusIcon size={13} />} onClick={onAddColumn}>
            {t('dynamicCharacteristic.addColumn')}
          </Button>
        </PermissionGuard>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="border-border max-h-100 overflow-auto rounded-md border">
        <DataTable
          columns={columns}
          data={rows}
          isLoading={isSavingRow}
          emptyMessage={t('dynamicCharacteristic.noRowsHint')}
        />
      </div>
      <PermissionGuard permission={Permissions.CHARACTERISTIC_ROW.CREATE}>
        <Button
          size="sm"
          variant="outline"
          icon={<PlusIcon size={13} />}
          onClick={handleAddRow}
        >
          {t('dynamicCharacteristic.addRow')}
        </Button>
      </PermissionGuard>
    </div>
  );
}
