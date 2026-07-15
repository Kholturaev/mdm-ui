import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type {
  ICurrency,
  CurrencyFormValues,
} from '@entities/currency/model/types';
import {
  useCreateCurrencyMutation,
  useDeleteCurrencyMutation,
  useUpdateCurrencyMutation,
} from '@entities/currency/api/currencyApi';
import { CurrencyForm } from '@features/currency-create-edit/ui/CurrencyForm';
import { CurrencyTable } from '@widgets/currency-table/ui/CurrencyTable';
import { Modal } from '@shared/ui/Modal';
import { parseApiError } from '@shared/api/parseApiError';
import type { ApiException } from '@shared/api/type';
import { notify } from '@shared/lib/toast';
import { useConfirm } from '@shared/lib/confirm';

type ModalState =
  { mode: 'create' } | { mode: 'edit'; currency: ICurrency } | null;

export function CurrenciesPage() {
  const { t } = useTranslation();
  const confirm = useConfirm();
  const [modalState, setModalState] = useState<ModalState>(null);

  const [createCurrency, { isLoading: isCreating }] =
    useCreateCurrencyMutation();
  const [updateCurrency, { isLoading: isUpdating }] =
    useUpdateCurrencyMutation();
  const [deleteCurrency] = useDeleteCurrencyMutation();

  const closeModal = () => setModalState(null);

  const handleSubmit = async (values: CurrencyFormValues) => {
    try {
      if (modalState?.mode === 'edit') {
        await updateCurrency({
          id: modalState.currency.id,
          data: values,
        }).unwrap();
      } else {
        await createCurrency(values).unwrap();
      }
      notify.success(t('message.saved'));
      closeModal();
    } catch (error) {
      notify.error(parseApiError(error as ApiException));
    }
  };

  const handleDelete = async (currency: ICurrency) => {
    const confirmed = await confirm({
      title: t('currency.deleteTitle'),
      description: t('currency.deleteConfirm', { name: currency.name }),
    });
    if (!confirmed) return;

    try {
      await deleteCurrency(currency.id).unwrap();
      notify.success(t('message.deleted'));
    } catch (error) {
      notify.error(parseApiError(error as ApiException));
    }
  };

  return (
    <div className="h-full">
      <CurrencyTable
        onCreate={() => setModalState({ mode: 'create' })}
        onEdit={(currency) => setModalState({ mode: 'edit', currency })}
        onDelete={handleDelete}
      />

      <Modal
        isOpen={modalState !== null}
        onClose={closeModal}
        title={
          modalState?.mode === 'edit'
            ? t('currency.editTitle')
            : t('currency.createTitle')
        }
      >
        <CurrencyForm
          entity={modalState?.mode === 'edit' ? modalState.currency : undefined}
          isSubmitting={isCreating || isUpdating}
          onSubmit={handleSubmit}
          onCancel={closeModal}
        />
      </Modal>
    </div>
  );
}
