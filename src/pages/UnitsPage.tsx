import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { IUnit, UnitFormValues } from '@entities/unit/model/types';
import {
  useCreateUnitMutation,
  useDeleteUnitMutation,
  useUpdateUnitMutation,
} from '@entities/unit/api/unitApi';
import { UnitForm } from '@features/unit-create-edit/ui/UnitForm';
import { UnitTable } from '@widgets/unit-table/ui/UnitTable';
import { RecordHistoryModal } from '@widgets/audit-log/ui/RecordHistoryModal';
import { Modal } from '@shared/ui/Modal';
import { parseApiError } from '@shared/api/parseApiError';
import type { ApiException } from '@shared/api/type';
import { notify } from '@shared/lib/toast';
import { useConfirm } from '@shared/lib/confirm';

type ModalState = { mode: 'create' } | { mode: 'edit'; unit: IUnit } | null;

export function UnitsPage() {
  const { t } = useTranslation();
  const confirm = useConfirm();
  const [modalState, setModalState] = useState<ModalState>(null);
  const [historyUnit, setHistoryUnit] = useState<IUnit | null>(null);

  const [createUnit, { isLoading: isCreating }] = useCreateUnitMutation();
  const [updateUnit, { isLoading: isUpdating }] = useUpdateUnitMutation();
  const [deleteUnit] = useDeleteUnitMutation();

  const closeModal = () => setModalState(null);

  const handleSubmit = async (values: UnitFormValues) => {
    try {
      if (modalState?.mode === 'edit') {
        await updateUnit({ id: modalState.unit.id, data: values }).unwrap();
      } else {
        await createUnit(values).unwrap();
      }
      notify.success(t('message.saved'));
      closeModal();
    } catch (error) {
      notify.error(parseApiError(error as ApiException));
    }
  };

  const handleDelete = async (unit: IUnit) => {
    const confirmed = await confirm({
      title: t('unit.deleteTitle'),
      description: t('unit.deleteConfirm', { name: unit.name }),
    });
    if (!confirmed) return;

    try {
      await deleteUnit(unit.id).unwrap();
      notify.success(t('message.deleted'));
    } catch (error) {
      notify.error(parseApiError(error as ApiException));
    }
  };

  return (
    <div className="h-full">
      <UnitTable
        onCreate={() => setModalState({ mode: 'create' })}
        onEdit={(unit) => setModalState({ mode: 'edit', unit })}
        onDelete={handleDelete}
        onShowHistory={setHistoryUnit}
      />

      {historyUnit && (
        <RecordHistoryModal
          isOpen
          onClose={() => setHistoryUnit(null)}
          tableName="unit"
          recordId={historyUnit.id}
          recordTitle={historyUnit.name}
          recordCode={String(historyUnit.code)}
        />
      )}

      <Modal
        isOpen={modalState !== null}
        onClose={closeModal}
        title={
          modalState?.mode === 'edit'
            ? t('unit.editTitle')
            : t('unit.createTitle')
        }
      >
        <UnitForm
          entity={modalState?.mode === 'edit' ? modalState.unit : undefined}
          isSubmitting={isCreating || isUpdating}
          onSubmit={handleSubmit}
          onCancel={closeModal}
        />
      </Modal>
    </div>
  );
}
