import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type {
  IExternalSystem,
  ExternalSystemFormValues,
} from '@entities/external-system/model/types';
import {
  useCreateExternalSystemMutation,
  useDeleteExternalSystemMutation,
  useUpdateExternalSystemMutation,
} from '@entities/external-system/api/externalSystemApi';
import { ExternalSystemForm } from '@features/external-system-create-edit/ui/ExternalSystemForm';
import { ExternalSystemTable } from '@widgets/external-system-table/ui/ExternalSystemTable';
import { Modal } from '@shared/ui/Modal';
import { parseApiError } from '@shared/api/parseApiError';
import type { ApiException } from '@shared/api/type';
import { notify } from '@shared/lib/toast';
import { useConfirm } from '@shared/lib/confirm';

type ModalState =
  { mode: 'create' } | { mode: 'edit'; system: IExternalSystem } | null;

export function ExternalSystemsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const [modalState, setModalState] = useState<ModalState>(null);

  const [createSystem, { isLoading: isCreating }] =
    useCreateExternalSystemMutation();
  const [updateSystem, { isLoading: isUpdating }] =
    useUpdateExternalSystemMutation();
  const [deleteSystem] = useDeleteExternalSystemMutation();

  const closeModal = () => setModalState(null);

  const handleSubmit = async (values: ExternalSystemFormValues) => {
    try {
      if (modalState?.mode === 'edit') {
        await updateSystem({ id: modalState.system.id, data: values }).unwrap();
      } else {
        await createSystem(values).unwrap();
      }
      notify.success(t('message.saved'));
      closeModal();
    } catch (error) {
      notify.error(parseApiError(error as ApiException));
    }
  };

  const handleDelete = async (system: IExternalSystem) => {
    const confirmed = await confirm({
      title: t('externalSystem.deleteTitle'),
      description: t('externalSystem.deleteConfirm', { name: system.name }),
    });
    if (!confirmed) return;

    try {
      await deleteSystem(system.id).unwrap();
      notify.success(t('message.deleted'));
    } catch (error) {
      notify.error(parseApiError(error as ApiException));
    }
  };

  return (
    <div className="h-full">
      <ExternalSystemTable
        onCreate={() => setModalState({ mode: 'create' })}
        onEdit={(system) => setModalState({ mode: 'edit', system })}
        onDelete={handleDelete}
        onOpenConfig={(system) => navigate(`/external-systems/${system.id}`)}
      />

      <Modal
        isOpen={modalState !== null}
        onClose={closeModal}
        title={
          modalState?.mode === 'edit'
            ? t('externalSystem.editTitle')
            : t('externalSystem.createTitle')
        }
      >
        <ExternalSystemForm
          entity={modalState?.mode === 'edit' ? modalState.system : undefined}
          isSubmitting={isCreating || isUpdating}
          onSubmit={handleSubmit}
          onCancel={closeModal}
        />
      </Modal>
    </div>
  );
}
