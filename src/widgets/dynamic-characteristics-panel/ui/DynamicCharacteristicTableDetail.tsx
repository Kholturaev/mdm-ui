import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type {
  CreateOrUpdateDynamicCharacteristicColumnPayload,
  IDynamicCharacteristicColumn,
  IDynamicCharacteristicTable,
} from '@entities/dynamic-characteristic/model/types';
import { useCreateOrUpdateDynamicCharacteristicColumnMutation } from '@entities/dynamic-characteristic/api/dynamicCharacteristicApi';
import { DynamicCharacteristicColumnForm } from '@features/dynamic-characteristic-column-create-edit/ui/DynamicCharacteristicColumnForm';
import { Modal } from '@shared/ui/Modal';
import { parseApiError } from '@shared/api/parseApiError';
import type { ApiException } from '@shared/api/type';
import { notify } from '@shared/lib/toast';
import { DynamicCharacteristicRowsGrid } from './DynamicCharacteristicRowsGrid';

type ColumnModalState =
  | { mode: 'create' }
  | { mode: 'edit'; column: IDynamicCharacteristicColumn }
  | null;

type DynamicCharacteristicTableDetailProps = {
  table: IDynamicCharacteristicTable;
};

export function DynamicCharacteristicTableDetail({
  table,
}: DynamicCharacteristicTableDetailProps) {
  const { t } = useTranslation();
  const [columnModalState, setColumnModalState] =
    useState<ColumnModalState>(null);

  const [saveColumn, { isLoading: isSavingColumn }] =
    useCreateOrUpdateDynamicCharacteristicColumnMutation();

  const closeColumnModal = () => setColumnModalState(null);

  const handleColumnSubmit = async (
    values: CreateOrUpdateDynamicCharacteristicColumnPayload,
  ) => {
    try {
      await saveColumn(values).unwrap();
      notify.success(t('message.saved'));
      closeColumnModal();
    } catch (error) {
      notify.error(parseApiError(error as ApiException));
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <DynamicCharacteristicRowsGrid
        table={table}
        onEditColumn={(column) => setColumnModalState({ mode: 'edit', column })}
        onAddColumn={() => setColumnModalState({ mode: 'create' })}
      />

      <Modal
        isOpen={columnModalState !== null}
        onClose={closeColumnModal}
        title={
          columnModalState?.mode === 'edit'
            ? t('dynamicCharacteristic.editColumnTitle')
            : t('dynamicCharacteristic.createColumnTitle')
        }
      >
        <DynamicCharacteristicColumnForm
          entity={
            columnModalState?.mode === 'edit'
              ? columnModalState.column
              : undefined
          }
          tableId={table.tableId}
          position={table.columns.length}
          isSubmitting={isSavingColumn}
          onSubmit={handleColumnSubmit}
          onCancel={closeColumnModal}
        />
      </Modal>
    </div>
  );
}
