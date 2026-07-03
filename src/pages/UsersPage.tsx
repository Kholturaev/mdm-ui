import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { IUser, UserFormValues } from '@entities/user/model/types';
import {
  useCreateUserMutation,
  useDeleteUserMutation,
  useUpdateUserMutation,
} from '@entities/user/api/userApi';
import { UserForm } from '@features/user-create-edit/ui/UserForm';
import { UserTable } from '@widgets/user-table/ui/UserTable';
import { Modal } from '@shared/ui/Modal';
import { parseApiError } from '@shared/api/parseApiError';
import type { ApiException } from '@shared/api/type';
import { notify } from '@shared/lib/toast';
import { usePageTitle } from '@shared/lib/pageTitle';

type ModalState = { mode: 'create' } | { mode: 'edit'; user: IUser } | null;

export function UsersPage() {
  const { t } = useTranslation();
  usePageTitle(t('user.title'));
  const [modalState, setModalState] = useState<ModalState>(null);

  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();

  const closeModal = () => setModalState(null);

  const handleSubmit = async (values: UserFormValues) => {
    try {
      if (modalState?.mode === 'edit') {
        await updateUser({ id: modalState.user.id, data: values }).unwrap();
      } else {
        await createUser(values).unwrap();
      }
      notify.success(t('message.saved'));
      closeModal();
    } catch (error) {
      notify.error(parseApiError(error as ApiException));
    }
  };

  const handleDelete = async (user: IUser) => {
    try {
      await deleteUser(user.id).unwrap();
      notify.success(t('message.deleted'));
    } catch (error) {
      notify.error(parseApiError(error as ApiException));
    }
  };

  return (
    <div className="h-full">
      <UserTable
        onCreate={() => setModalState({ mode: 'create' })}
        onEdit={(user) => setModalState({ mode: 'edit', user })}
        onDelete={handleDelete}
      />

      <Modal
        isOpen={modalState !== null}
        onClose={closeModal}
        title={
          modalState?.mode === 'edit'
            ? t('user.editTitle')
            : t('user.createTitle')
        }
      >
        <UserForm
          user={modalState?.mode === 'edit' ? modalState.user : undefined}
          isSubmitting={isCreating || isUpdating}
          onSubmit={handleSubmit}
          onCancel={closeModal}
        />
      </Modal>
    </div>
  );
}
