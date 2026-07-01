import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { IDealer, DealerFormValues } from '@entities/dealer/model/types';
import {
  useCreateDealerMutation,
  useDeleteDealerMutation,
  useUpdateDealerMutation,
} from '@entities/dealer/api/dealerApi';
import { DealerForm } from '@features/dealer-create-edit/ui/DealerForm';
import { DealerTable } from '@widgets/dealer-table/ui/DealerTable';
import { Modal } from '@shared/ui/Modal';
import { parseApiError } from '@shared/api/parseApiError';
import type { ApiException } from '@shared/api/type';
import { notify } from '@shared/lib/toast';
import { usePageTitle } from '@shared/lib/pageTitle';

type ModalState = { mode: 'create' } | { mode: 'edit'; dealer: IDealer } | null;

export function DealersPage() {
  const { t } = useTranslation();
  usePageTitle(t('dealer.title'));
  const [modalState, setModalState] = useState<ModalState>(null);

  const [createDealer, { isLoading: isCreating }] = useCreateDealerMutation();
  const [updateDealer, { isLoading: isUpdating }] = useUpdateDealerMutation();
  const [deleteDealer] = useDeleteDealerMutation();

  const closeModal = () => setModalState(null);

  const handleSubmit = async (values: DealerFormValues) => {
    try {
      if (modalState?.mode === 'edit') {
        await updateDealer({ id: modalState.dealer.id, data: values }).unwrap();
      } else {
        await createDealer(values).unwrap();
      }
      notify.success(t('message.saved'));
      closeModal();
    } catch (error) {
      notify.error(parseApiError(error as ApiException));
    }
  };

  const handleDelete = async (dealer: IDealer) => {
    try {
      await deleteDealer(dealer.id).unwrap();
      notify.success(t('message.deleted'));
    } catch (error) {
      notify.error(parseApiError(error as ApiException));
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <DealerTable
        onCreate={() => setModalState({ mode: 'create' })}
        onEdit={(dealer) => setModalState({ mode: 'edit', dealer })}
        onDelete={handleDelete}
      />

      <Modal
        isOpen={modalState !== null}
        onClose={closeModal}
        title={
          modalState?.mode === 'edit'
            ? t('dealer.editTitle')
            : t('dealer.createTitle')
        }
      >
        <DealerForm
          dealer={modalState?.mode === 'edit' ? modalState.dealer : undefined}
          isSubmitting={isCreating || isUpdating}
          onSubmit={handleSubmit}
          onCancel={closeModal}
        />
      </Modal>
    </div>
  );
}
