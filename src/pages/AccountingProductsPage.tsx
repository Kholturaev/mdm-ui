import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type {
  IAccountingProduct,
  AccountingProductFormValues,
} from '@entities/accounting-product/model/types';
import {
  useCreateAccountingProductMutation,
  useDeleteAccountingProductMutation,
  useUpdateAccountingProductMutation,
} from '@entities/accounting-product/api/accountingProductApi';
import { AccountingProductForm } from '@features/accounting-product-create-edit/ui/AccountingProductForm';
import { AccountingProductTable } from '@widgets/accounting-product-table/ui/AccountingProductTable';
import { Modal } from '@shared/ui/Modal';
import { parseApiError } from '@shared/api/parseApiError';
import type { ApiException } from '@shared/api/type';
import { notify } from '@shared/lib/toast';
import { useConfirm } from '@shared/lib/confirm';

type ModalState =
  | { mode: 'create' }
  | { mode: 'edit'; accountingProduct: IAccountingProduct }
  | null;

export function AccountingProductsPage() {
  const { t } = useTranslation();
  const confirm = useConfirm();
  const [modalState, setModalState] = useState<ModalState>(null);

  const [createAccountingProduct, { isLoading: isCreating }] =
    useCreateAccountingProductMutation();
  const [updateAccountingProduct, { isLoading: isUpdating }] =
    useUpdateAccountingProductMutation();
  const [deleteAccountingProduct] = useDeleteAccountingProductMutation();

  const closeModal = () => setModalState(null);

  const handleSubmit = async (values: AccountingProductFormValues) => {
    try {
      if (modalState?.mode === 'edit') {
        await updateAccountingProduct({
          id: modalState.accountingProduct.id,
          data: values,
        }).unwrap();
      } else {
        await createAccountingProduct(values).unwrap();
      }
      notify.success(t('message.saved'));
      closeModal();
    } catch (error) {
      notify.error(parseApiError(error as ApiException));
    }
  };

  const handleDelete = async (accountingProduct: IAccountingProduct) => {
    const confirmed = await confirm({
      title: t('accountingProduct.deleteTitle'),
      description: t('accountingProduct.deleteConfirm', {
        name: accountingProduct.name,
      }),
    });
    if (!confirmed) return;

    try {
      await deleteAccountingProduct(accountingProduct.id).unwrap();
      notify.success(t('message.deleted'));
    } catch (error) {
      notify.error(parseApiError(error as ApiException));
    }
  };

  return (
    <div className="h-full">
      <AccountingProductTable
        onCreate={() => setModalState({ mode: 'create' })}
        onEdit={(accountingProduct) =>
          setModalState({ mode: 'edit', accountingProduct })
        }
        onDelete={handleDelete}
      />

      <Modal
        isOpen={modalState !== null}
        onClose={closeModal}
        title={
          modalState?.mode === 'edit'
            ? t('accountingProduct.editTitle')
            : t('accountingProduct.createTitle')
        }
      >
        <AccountingProductForm
          entity={
            modalState?.mode === 'edit'
              ? modalState.accountingProduct
              : undefined
          }
          isSubmitting={isCreating || isUpdating}
          onSubmit={handleSubmit}
          onCancel={closeModal}
        />
      </Modal>
    </div>
  );
}
