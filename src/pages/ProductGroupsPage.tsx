import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type {
  IProductGroup,
  ProductGroupFormValues,
} from '@entities/product-group/model/types';
import {
  useCreateProductGroupMutation,
  useDeleteProductGroupMutation,
  useUpdateProductGroupMutation,
} from '@entities/product-group/api/productGroupApi';
import { ProductGroupForm } from '@features/product-group-create-edit/ui/ProductGroupForm';
import { ProductGroupTable } from '@widgets/product-group-table/ui/ProductGroupTable';
import { Modal } from '@shared/ui/Modal';
import { parseApiError } from '@shared/api/parseApiError';
import type { ApiException } from '@shared/api/type';
import { notify } from '@shared/lib/toast';
import { useConfirm } from '@shared/lib/confirm';

type ModalState =
  { mode: 'create' } | { mode: 'edit'; productGroup: IProductGroup } | null;

export function ProductGroupsPage() {
  const { t } = useTranslation();
  const confirm = useConfirm();
  const [modalState, setModalState] = useState<ModalState>(null);

  const [createProductGroup, { isLoading: isCreating }] =
    useCreateProductGroupMutation();
  const [updateProductGroup, { isLoading: isUpdating }] =
    useUpdateProductGroupMutation();
  const [deleteProductGroup] = useDeleteProductGroupMutation();

  const closeModal = () => setModalState(null);

  const handleSubmit = async (values: ProductGroupFormValues) => {
    try {
      if (modalState?.mode === 'edit') {
        await updateProductGroup({
          id: modalState.productGroup.id,
          data: values,
        }).unwrap();
      } else {
        await createProductGroup(values).unwrap();
      }
      notify.success(t('message.saved'));
      closeModal();
    } catch (error) {
      notify.error(parseApiError(error as ApiException));
    }
  };

  const handleDelete = async (productGroup: IProductGroup) => {
    const confirmed = await confirm({
      title: t('productGroup.deleteTitle'),
      description: t('productGroup.deleteConfirm', {
        name: productGroup.name,
      }),
    });
    if (!confirmed) return;

    try {
      await deleteProductGroup(productGroup.id).unwrap();
      notify.success(t('message.deleted'));
    } catch (error) {
      notify.error(parseApiError(error as ApiException));
    }
  };

  return (
    <div className="h-full">
      <ProductGroupTable
        onCreate={() => setModalState({ mode: 'create' })}
        onEdit={(productGroup) => setModalState({ mode: 'edit', productGroup })}
        onDelete={handleDelete}
      />

      <Modal
        isOpen={modalState !== null}
        onClose={closeModal}
        title={
          modalState?.mode === 'edit'
            ? t('productGroup.editTitle')
            : t('productGroup.createTitle')
        }
      >
        <ProductGroupForm
          entity={
            modalState?.mode === 'edit' ? modalState.productGroup : undefined
          }
          isSubmitting={isCreating || isUpdating}
          onSubmit={handleSubmit}
          onCancel={closeModal}
        />
      </Modal>
    </div>
  );
}
