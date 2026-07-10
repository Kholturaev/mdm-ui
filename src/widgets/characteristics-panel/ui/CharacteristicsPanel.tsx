import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ColumnDef } from '@tanstack/react-table';
import type {
  CharacteristicFormValues,
  ICharacteristic,
} from '@entities/characteristic/model/types';
import { canHaveValues } from '@entities/characteristic/lib/canHaveValues';
import {
  useCreateCharacteristicMutation,
  useDeleteCharacteristicMutation,
  useUpdateCharacteristicMutation,
} from '@entities/characteristic/api/characteristicApi';
import { useGetCharacteristicGroupsByNomenclatureQuery } from '@entities/characteristic-group/api/characteristicGroupApi';
import { CharacteristicForm } from '@features/characteristic-create-edit/ui/CharacteristicForm';
import { CharacteristicValuesModal } from '@features/characteristic-value-manage/ui/CharacteristicValuesModal';
import { DataTable, TableToolbar } from '@shared/ui/Table';
import { RowActions } from '@shared/ui/Menu';
import { Button } from '@shared/ui/Button';
import { Badge } from '@shared/ui/Badge';
import { Modal } from '@shared/ui/Modal';
import { Spinner } from '@shared/ui/Spinner';
import { PermissionGuard } from '@shared/ui/PermissionGuard';
import { EditIcon } from '@shared/ui/icons/EditIcon';
import { DeleteIcon } from '@shared/ui/icons/DeleteIcon';
import { ChecklistIcon } from '@shared/ui/icons/ChecklistIcon';
import { LockIcon } from '@shared/ui/icons/LockIcon';
import { PlusIcon } from '@shared/ui/icons/PlusIcon';
import { ChevronDownIcon } from '@shared/ui/icons/ChevronDownIcon';
import { Permissions } from '@shared/constants/permissions';
import { usePermission } from '@shared/lib/hooks/usePermission';
import { useConfirm } from '@shared/lib/confirm';
import { parseApiError } from '@shared/api/parseApiError';
import type { ApiException } from '@shared/api/type';
import { notify } from '@shared/lib/toast';

type CharacteristicModalState =
  { mode: 'create' } | { mode: 'edit'; characteristic: ICharacteristic } | null;

type CharacteristicsPanelProps = {
  typeId: number | null;
  typeName?: string;
  groupId: number | null;
};

export function CharacteristicsPanel({
  typeId,
  typeName,
  groupId,
}: CharacteristicsPanelProps) {
  const { t } = useTranslation();
  const { can } = usePermission();
  const confirm = useConfirm();
  const [modalState, setModalState] = useState<CharacteristicModalState>(null);
  const [valuesForId, setValuesForId] = useState<number | null>(null);

  const { data, isFetching } = useGetCharacteristicGroupsByNomenclatureQuery(
    typeId ?? 0,
    { skip: !typeId },
  );
  const group = useMemo(
    () => data?.data.find((g) => g.id === groupId),
    [data, groupId],
  );
  const rows = group?.characteristics ?? [];
  // Re-derived from `rows` every render (not a snapshot) so the values modal
  // stays in sync after add/delete mutations refetch this same query.
  const valuesForCharacteristic =
    rows.find((row) => row.id === valuesForId) ?? null;

  const [createCharacteristic, { isLoading: isCreating }] =
    useCreateCharacteristicMutation();
  const [updateCharacteristic, { isLoading: isUpdating }] =
    useUpdateCharacteristicMutation();
  const [deleteCharacteristic] = useDeleteCharacteristicMutation();

  const closeModal = () => setModalState(null);

  const handleSubmit = async (values: CharacteristicFormValues) => {
    try {
      if (modalState?.mode === 'edit') {
        await updateCharacteristic({
          id: modalState.characteristic.id,
          data: values,
        }).unwrap();
      } else {
        await createCharacteristic(values).unwrap();
      }
      notify.success(t('message.saved'));
      closeModal();
    } catch (error) {
      notify.error(parseApiError(error as ApiException));
    }
  };

  const handleDelete = useCallback(
    async (characteristic: ICharacteristic) => {
      const confirmed = await confirm({
        title: t('characteristic.deleteTitle'),
        description: t('characteristic.deleteConfirm', {
          name: characteristic.name,
        }),
      });
      if (!confirmed) return;

      try {
        await deleteCharacteristic(characteristic.id).unwrap();
        notify.success(t('message.deleted'));
      } catch (error) {
        notify.error(parseApiError(error as ApiException));
      }
    },
    [confirm, deleteCharacteristic, t],
  );

  const canUpdate = can(Permissions.CHARACTERISTICS.UPDATE);
  const canDelete = can(Permissions.CHARACTERISTICS.DELETE);

  const columns = useMemo<ColumnDef<ICharacteristic>[]>(
    () => [
      { accessorKey: 'name', id: 'name', header: t('characteristic.name') },
      {
        accessorKey: 'key',
        id: 'key',
        header: t('characteristic.key'),
        cell: ({ row }) => (
          <code className="text-fg-muted text-xs">{row.original.key}</code>
        ),
      },
      {
        id: 'type',
        header: t('characteristic.type'),
        cell: ({ row }) => (
          <Badge variant="neutral">
            {t(`product.char.type.${row.original.type}`)}
          </Badge>
        ),
      },
      {
        id: 'valuesCount',
        header: t('characteristic.valuesCount'),
        cell: ({ row }) =>
          canHaveValues(row.original.type) ? (
            <button
              type="button"
              onClick={() => setValuesForId(row.original.id)}
              className="text-primary text-sm font-medium hover:underline"
            >
              {row.original.values.length}
            </button>
          ) : (
            <span className="text-fg-muted">—</span>
          ),
      },
      ...(canUpdate || canDelete
        ? [
            {
              id: 'actions',
              header: '',
              meta: { pin: 'right' as const },
              cell: ({ row }: { row: { original: ICharacteristic } }) => (
                <RowActions
                  items={[
                    ...(canUpdate
                      ? [
                          {
                            label: t('common.edit'),
                            icon: <EditIcon size={14} />,
                            onClick: () =>
                              setModalState({
                                mode: 'edit',
                                characteristic: row.original,
                              }),
                          },
                        ]
                      : []),
                    ...(canDelete
                      ? [
                          {
                            label: t('common.delete'),
                            icon: <DeleteIcon size={14} />,
                            onClick: () => handleDelete(row.original),
                            danger: true,
                          },
                        ]
                      : []),
                  ]}
                />
              ),
            },
          ]
        : []),
    ],
    [t, canUpdate, canDelete, handleDelete],
  );

  if (!can(Permissions.CHARACTERISTICS.GET)) {
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
          {t('characteristic.selectGroupHint')}
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
          {t('characteristic.selectGroupHint')}
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-border border-b px-4 py-3">
        <div className="text-fg-muted flex items-center gap-1.5 text-xs">
          <span>{typeName}</span>
          <ChevronDownIcon size={11} className="-rotate-90" />
          <span>{group.name}</span>
        </div>
        <h2 className="text-fg mt-0.5 text-base font-semibold">
          {t('characteristic.panelTitle', { name: group.name })}
        </h2>
      </div>

      <TableToolbar>
        <PermissionGuard permission={Permissions.CHARACTERISTICS.CREATE}>
          <Button
            size="sm"
            icon={<PlusIcon size={15} />}
            onClick={() => setModalState({ mode: 'create' })}
          >
            {t('characteristic.addCharacteristic')}
          </Button>
        </PermissionGuard>
      </TableToolbar>

      <div className="min-h-0 flex-1">
        <DataTable
          columns={columns}
          data={rows}
          isLoading={isFetching}
          emptyMessage={t('characteristic.groupEmpty')}
        />
      </div>

      <Modal
        isOpen={modalState !== null}
        onClose={closeModal}
        title={
          modalState?.mode === 'edit'
            ? t('characteristic.editTitle')
            : t('characteristic.createTitle')
        }
      >
        <CharacteristicForm
          entity={
            modalState?.mode === 'edit' ? modalState.characteristic : undefined
          }
          characteristicsGroupId={groupId}
          isSubmitting={isCreating || isUpdating}
          onSubmit={handleSubmit}
          onCancel={closeModal}
        />
      </Modal>

      <CharacteristicValuesModal
        characteristic={valuesForCharacteristic}
        onClose={() => setValuesForId(null)}
      />
    </div>
  );
}
