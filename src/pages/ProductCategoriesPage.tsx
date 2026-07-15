import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type {
  IProductCategory,
  ProductCategoryFormValues,
} from '@entities/product-category/model/types';
import {
  useCreateProductCategoryMutation,
  useDeleteProductCategoryMutation,
  useUpdateProductCategoryMutation,
} from '@entities/product-category/api/productCategoryApi';
import { ProductCategoryForm } from '@features/product-category-create-edit/ui/ProductCategoryForm';
import { ProductCategoryTable } from '@widgets/product-category-table/ui/ProductCategoryTable';
import { Modal } from '@shared/ui/Modal';
import { parseApiError } from '@shared/api/parseApiError';
import type { ApiException } from '@shared/api/type';
import { notify } from '@shared/lib/toast';
import { useConfirm } from '@shared/lib/confirm';

type ModalState =
  | { mode: 'create' }
  | { mode: 'edit'; productCategory: IProductCategory }
  | null;

export function ProductCategoriesPage() {
  const { t } = useTranslation();
  const confirm = useConfirm();
  const [modalState, setModalState] = useState<ModalState>(null);

  const [createProductCategory, { isLoading: isCreating }] =
    useCreateProductCategoryMutation();
  const [updateProductCategory, { isLoading: isUpdating }] =
    useUpdateProductCategoryMutation();
  const [deleteProductCategory] = useDeleteProductCategoryMutation();

  const closeModal = () => setModalState(null);

  const handleSubmit = async (values: ProductCategoryFormValues) => {
    try {
      if (modalState?.mode === 'edit') {
        await updateProductCategory({
          id: modalState.productCategory.id,
          data: values,
        }).unwrap();
      } else {
        await createProductCategory(values).unwrap();
      }
      notify.success(t('message.saved'));
      closeModal();
    } catch (error) {
      notify.error(parseApiError(error as ApiException));
    }
  };

  const handleDelete = async (productCategory: IProductCategory) => {
    const confirmed = await confirm({
      title: t('productCategory.deleteTitle'),
      description: t('productCategory.deleteConfirm', {
        name: productCategory.name,
      }),
    });
    if (!confirmed) return;

    try {
      await deleteProductCategory(productCategory.id).unwrap();
      notify.success(t('message.deleted'));
    } catch (error) {
      notify.error(parseApiError(error as ApiException));
    }
  };

  return (
    <div className="h-full">
      <ProductCategoryTable
        onCreate={() => setModalState({ mode: 'create' })}
        onEdit={(productCategory) =>
          setModalState({ mode: 'edit', productCategory })
        }
        onDelete={handleDelete}
      />

      <Modal
        isOpen={modalState !== null}
        onClose={closeModal}
        title={
          modalState?.mode === 'edit'
            ? t('productCategory.editTitle')
            : t('productCategory.createTitle')
        }
      >
        <ProductCategoryForm
          entity={
            modalState?.mode === 'edit' ? modalState.productCategory : undefined
          }
          isSubmitting={isCreating || isUpdating}
          onSubmit={handleSubmit}
          onCancel={closeModal}
        />
      </Modal>
    </div>
  );
}
