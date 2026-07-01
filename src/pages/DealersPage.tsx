import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Dealer, DealerFormValues } from '@entities/dealer/model/types';
import { toDealerPayload } from '@entities/dealer/model/mapping';
import {
  useCreateDealerMutation,
  useDeleteDealerMutation,
  useUpdateDealerMutation,
} from '@entities/dealer/api/dealerApi';
import { DealerForm } from '@features/dealer-create-edit/ui/DealerForm';
import { DealerTable } from '@widgets/dealer-table/ui/DealerTable';
import { Button } from '@shared/ui/Button';
import { Modal } from '@shared/ui/Modal';

type ModalState = { mode: 'create' } | { mode: 'edit'; dealer: Dealer } | null;

export function DealersPage() {
  const { t } = useTranslation();
  const [modalState, setModalState] = useState<ModalState>(null);

  const [createDealer, { isLoading: isCreating }] = useCreateDealerMutation();
  const [updateDealer, { isLoading: isUpdating }] = useUpdateDealerMutation();
  const [deleteDealer] = useDeleteDealerMutation();

  const closeModal = () => setModalState(null);

  const handleSubmit = async (values: DealerFormValues) => {
    const payload = toDealerPayload(values);

    if (modalState?.mode === 'edit') {
      await updateDealer({ id: modalState.dealer.id, data: payload }).unwrap();
    } else {
      await createDealer(payload).unwrap();
    }
    closeModal();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-fg text-lg font-semibold">{t('dealer.title')}</h1>
        <Button onClick={() => setModalState({ mode: 'create' })}>
          {t('common.create')}
        </Button>
      </div>

      <DealerTable
        onEdit={(dealer) => setModalState({ mode: 'edit', dealer })}
        onDelete={(dealer) => deleteDealer(dealer.id)}
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
