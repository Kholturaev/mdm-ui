import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ColumnDef } from '@tanstack/react-table';
import type {
  CreateDynamicCharacteristicTablePayload,
  IDynamicCharacteristicTable,
} from '@entities/dynamic-characteristic/model/types';
import {
  useCreateDynamicCharacteristicTableMutation,
  useDeleteDynamicCharacteristicTableMutation,
} from '@entities/dynamic-characteristic/api/dynamicCharacteristicApi';
import { useGetCharacteristicGroupsByNomenclatureQuery } from '@entities/characteristic-group/api/characteristicGroupApi';
import { DynamicCharacteristicTableForm } from '@features/dynamic-characteristic-table-create-edit/ui/DynamicCharacteristicTableForm';
import { DataTable, TableToolbar } from '@shared/ui/Table';
import { RowActions } from '@shared/ui/Menu';
import { Button } from '@shared/ui/Button';
import { Modal } from '@shared/ui/Modal';
import { Spinner } from '@shared/ui/Spinner';
import { PermissionGuard } from '@shared/ui/PermissionGuard';
import { DeleteIcon } from '@shared/ui/icons/DeleteIcon';
import { LockIcon } from '@shared/ui/icons/LockIcon';
import { ChecklistIcon } from '@shared/ui/icons/ChecklistIcon';
import { PlusIcon } from '@shared/ui/icons/PlusIcon';
import { Permissions } from '@shared/constants/permissions';
import { usePermission } from '@shared/lib/hooks/usePermission';
import { useConfirm } from '@shared/lib/confirm';
import { parseApiError } from '@shared/api/parseApiError';
import type { ApiException } from '@shared/api/type';
import { notify } from '@shared/lib/toast';
import { DynamicCharacteristicTableDetail } from './DynamicCharacteristicTableDetail';

type DynamicCharacteristicsPanelProps = {
  typeId: number | null;
  groupId: number | null;
};

export function DynamicCharacteristicsPanel({
  typeId,
  groupId,
}: DynamicCharacteristicsPanelProps) {
  const { t } = useTranslation();
  const { can } = usePermission();
  const confirm = useConfirm();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [expandedTableId, setExpandedTableId] = useState<number | null>(null);

  const { data, isFetching } = useGetCharacteristicGroupsByNomenclatureQuery(
    typeId ?? 0,
    { skip: !typeId },
  );
  const group = useMemo(
    () => data?.data.find((g) => g.id === groupId),
    [data, groupId],
  );
  const rows = group?.dynamicTables ?? [];

  const [createTable, { isLoading: isCreating }] =
    useCreateDynamicCharacteristicTableMutation();
  const [deleteTable] = useDeleteDynamicCharacteristicTableMutation();

  const handleCreate = async (
    values: CreateDynamicCharacteristicTablePayload,
  ) => {
    try {
      await createTable(values).unwrap();
      notify.success(t('message.saved'));
      setIsCreateOpen(false);
    } catch (error) {
      notify.error(parseApiError(error as ApiException));
    }
  };

  const handleDelete = useCallback(
    async (table: IDynamicCharacteristicTable) => {
      const confirmed = await confirm({
        title: t('dynamicCharacteristic.deleteTableTitle'),
        description: t('dynamicCharacteristic.deleteTableConfirm', {
          name: table.tableName,
        }),
      });
      if (!confirmed) return;

      try {
        await deleteTable(table.tableId).unwrap();
        notify.success(t('message.deleted'));
        setExpandedTableId((current) =>
          current === table.tableId ? null : current,
        );
      } catch (error) {
        notify.error(parseApiError(error as ApiException));
      }
    },
    [confirm, deleteTable, t],
  );

  const canDelete = can(Permissions.CHARACTERISTIC_TABLE.DELETE);

  const columns = useMemo<ColumnDef<IDynamicCharacteristicTable>[]>(
    () => [
      {
        accessorKey: 'tableName',
        id: 'name',
        header: t('dynamicCharacteristic.tableName'),
      },
      {
        id: 'columnsCount',
        header: t('dynamicCharacteristic.columnsCountLabel'),
        cell: ({ row }) => row.original.columns.length,
      },
      {
        id: 'rowsCount',
        header: t('dynamicCharacteristic.rowsCountLabel'),
        cell: ({ row }) => row.original.rows.length,
      },
      ...(canDelete
        ? [
            {
              id: 'actions',
              header: '',
              meta: { pin: 'right' as const },
              cell: ({
                row,
              }: {
                row: { original: IDynamicCharacteristicTable };
              }) => (
                <RowActions
                  items={[
                    {
                      label: t('common.delete'),
                      icon: <DeleteIcon size={14} />,
                      onClick: () => handleDelete(row.original),
                      danger: true,
                    },
                  ]}
                />
              ),
            },
          ]
        : []),
    ],
    [t, canDelete, handleDelete],
  );

  if (!can(Permissions.CHARACTERISTIC_TABLE.READ)) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
        <span className="text-fg-muted">
          <LockIcon size={28} />
        </span>
        <p className="text-fg-muted text-sm">{t('message.permissionDenied')}</p>
      </div>
    );
  }

  if (!typeId || !groupId) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
        <span className="text-fg-muted">
          <ChecklistIcon size={28} />
        </span>
        <p className="text-fg-muted text-sm">
          {t('dynamicCharacteristic.selectGroupHint')}
        </p>
      </div>
    );
  }

  if (isFetching && !group) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner className="text-fg-muted size-6" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
        <span className="text-fg-muted">
          <ChecklistIcon size={28} />
        </span>
        <p className="text-fg-muted text-sm">
          {t('dynamicCharacteristic.selectGroupHint')}
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <TableToolbar>
        <PermissionGuard permission={Permissions.CHARACTERISTIC_TABLE.CREATE}>
          <Button
            size="sm"
            icon={<PlusIcon size={15} />}
            onClick={() => setIsCreateOpen(true)}
          >
            {t('dynamicCharacteristic.addTable')}
          </Button>
        </PermissionGuard>
      </TableToolbar>

      <div className="min-h-0 flex-1">
        <DataTable
          columns={columns}
          data={rows}
          isLoading={isFetching}
          emptyMessage={t('dynamicCharacteristic.groupEmpty')}
          getRowId={(table) => table.tableId}
          expandedRowId={expandedTableId}
          onToggleExpand={(table) =>
            setExpandedTableId((current) =>
              current === table.tableId ? null : table.tableId,
            )
          }
          renderExpandedRow={(table) => (
            <DynamicCharacteristicTableDetail table={table} />
          )}
        />
      </div>

      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title={t('dynamicCharacteristic.createTableTitle')}
      >
        <DynamicCharacteristicTableForm
          characteristicGroupId={groupId}
          isSubmitting={isCreating}
          onSubmit={handleCreate}
          onCancel={() => setIsCreateOpen(false)}
        />
      </Modal>
    </div>
  );
}
