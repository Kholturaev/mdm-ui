import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { IRole, RoleFormValues } from '@entities/role/model/types';
import {
  useCreateRoleMutation,
  useDeleteRoleMutation,
  useUpdateRoleMutation,
} from '@entities/role/api/roleApi';
import { RoleForm } from '@features/role-create-edit/ui/RoleForm';
import { RoleTable } from '@widgets/role-table/ui/RoleTable';
import { Modal } from '@shared/ui/Modal';
import { parseApiError } from '@shared/api/parseApiError';
import type { ApiException } from '@shared/api/type';
import { notify } from '@shared/lib/toast';
import { useConfirm } from '@shared/lib/confirm';

type ModalState = { mode: 'create' } | { mode: 'edit'; role: IRole } | null;

export function RolesPage() {
  const { t } = useTranslation();
  const confirm = useConfirm();
  const [modalState, setModalState] = useState<ModalState>(null);

  const [createRole, { isLoading: isCreating }] = useCreateRoleMutation();
  const [updateRole, { isLoading: isUpdating }] = useUpdateRoleMutation();
  const [deleteRole] = useDeleteRoleMutation();

  const closeModal = () => setModalState(null);

  const handleSubmit = async (values: RoleFormValues) => {
    try {
      if (modalState?.mode === 'edit') {
        await updateRole({ id: modalState.role.name, data: values }).unwrap();
      } else {
        await createRole(values).unwrap();
      }
      notify.success(t('message.saved'));
      closeModal();
    } catch (error) {
      notify.error(parseApiError(error as ApiException));
    }
  };

  const handleDelete = async (role: IRole) => {
    const confirmed = await confirm({
      title: t('role.deleteTitle'),
      description: t('role.deleteConfirm', { name: role.name }),
    });
    if (!confirmed) return;

    try {
      await deleteRole(role.name).unwrap();
      notify.success(t('message.deleted'));
    } catch (error) {
      notify.error(parseApiError(error as ApiException));
    }
  };

  return (
    <div className="h-full">
      <RoleTable
        onCreate={() => setModalState({ mode: 'create' })}
        onEdit={(role) => setModalState({ mode: 'edit', role })}
        onDelete={handleDelete}
      />

      <Modal
        isOpen={modalState !== null}
        onClose={closeModal}
        title={
          modalState?.mode === 'edit'
            ? t('role.editTitle')
            : t('role.createTitle')
        }
      >
        <RoleForm
          role={modalState?.mode === 'edit' ? modalState.role : undefined}
          isSubmitting={isCreating || isUpdating}
          onSubmit={handleSubmit}
          onCancel={closeModal}
        />
      </Modal>
    </div>
  );
}
