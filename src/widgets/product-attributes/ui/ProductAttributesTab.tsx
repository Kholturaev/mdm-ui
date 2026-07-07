import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ColumnDef } from '@tanstack/react-table';
import type {
  IProductAttribute,
  ProductAttributeFormValues,
} from '@entities/product-attribute/model/types';
import {
  useCreateProductAttributeMutation,
  useDeleteProductAttributeMutation,
  useGetProductAttributesQuery,
  useUpdateProductAttributeMutation,
} from '@entities/product-attribute/api/productAttributeApi';
import { ProductAttributeForm } from '@features/product-attribute-create-edit/ui/ProductAttributeForm';
import { Badge } from '@shared/ui/Badge';
import { Button } from '@shared/ui/Button';
import { Card, CardHeader } from '@shared/ui/Card';
import { Modal } from '@shared/ui/Modal';
import { DataTable } from '@shared/ui/Table';
import { RowActions } from '@shared/ui/Menu';
import { PlusIcon } from '@shared/ui/icons/PlusIcon';
import { EditIcon } from '@shared/ui/icons/EditIcon';
import { DeleteIcon } from '@shared/ui/icons/DeleteIcon';
import { ChecklistIcon } from '@shared/ui/icons/ChecklistIcon';
import { parseApiError } from '@shared/api/parseApiError';
import type { ApiException } from '@shared/api/type';
import { notify } from '@shared/lib/toast';

type ModalState =
  { mode: 'create' } | { mode: 'edit'; attribute: IProductAttribute } | null;

export function ProductAttributesTab({ productId }: { productId: number }) {
  const { t } = useTranslation();
  const [modalState, setModalState] = useState<ModalState>(null);

  const { data, isFetching } = useGetProductAttributesQuery({
    page: 0,
    size: 200,
    filters: { productId },
  });
  const attributes = useMemo(() => data?.data?.data ?? [], [data]);

  const [createAttribute, { isLoading: isCreating }] =
    useCreateProductAttributeMutation();
  const [updateAttribute, { isLoading: isUpdating }] =
    useUpdateProductAttributeMutation();
  const [deleteAttribute] = useDeleteProductAttributeMutation();

  const closeModal = () => setModalState(null);

  const handleSubmit = async (values: ProductAttributeFormValues) => {
    try {
      if (modalState?.mode === 'edit') {
        await updateAttribute({
          id: modalState.attribute.id,
          data: values,
        }).unwrap();
      } else {
        await createAttribute(values).unwrap();
      }
      notify.success(t('message.saved'));
      closeModal();
    } catch (error) {
      notify.error(parseApiError(error as ApiException));
    }
  };

  const handleDelete = useCallback(
    async (attribute: IProductAttribute) => {
      try {
        await deleteAttribute(attribute.id).unwrap();
        notify.success(t('message.deleted'));
      } catch (error) {
        notify.error(parseApiError(error as ApiException));
      }
    },
    [deleteAttribute, t],
  );

  const columns = useMemo<ColumnDef<IProductAttribute>[]>(
    () => [
      {
        accessorKey: 'name',
        id: 'name',
        header: t('product.attr.name'),
      },
      {
        accessorKey: 'key',
        id: 'key',
        header: t('product.attr.key'),
      },
      {
        accessorKey: 'value',
        id: 'value',
        header: t('product.attr.value'),
      },
      {
        id: 'externalSystem',
        header: t('product.attr.externalSystem'),
        cell: ({ row }) =>
          row.original.externalSystem ? (
            <Badge variant="neutral">{row.original.externalSystem.name}</Badge>
          ) : (
            <span className="text-fg-muted">—</span>
          ),
      },
      {
        id: 'actions',
        header: '',
        meta: { pin: 'right' },
        cell: ({ row }) => (
          <RowActions
            items={[
              {
                label: t('common.edit'),
                icon: <EditIcon size={14} />,
                onClick: () =>
                  setModalState({ mode: 'edit', attribute: row.original }),
              },
              {
                label: t('common.delete'),
                icon: <DeleteIcon size={14} />,
                onClick: () => handleDelete(row.original),
                danger: true,
              },
            ]}
          />
        ),
      },
    ],
    [t, handleDelete],
  );

  return (
    <div className="wide:max-w-4xl wide:mx-auto flex w-full flex-col gap-4">
      <Card className="flex flex-col gap-3">
        <CardHeader
          icon={<ChecklistIcon size={15} />}
          title={t('product.attr.title')}
          subtitle={t('product.attr.desc')}
          action={
            <Button
              size="sm"
              icon={<PlusIcon size={15} />}
              onClick={() => setModalState({ mode: 'create' })}
            >
              {t('product.attr.add')}
            </Button>
          }
        />

        <div className="border-border overflow-hidden rounded-lg border">
          <DataTable
            columns={columns}
            data={attributes}
            isLoading={isFetching}
            emptyMessage={t('product.attr.empty')}
          />
        </div>
      </Card>

      <Modal
        isOpen={modalState !== null}
        onClose={closeModal}
        title={
          modalState?.mode === 'edit'
            ? t('product.attr.editTitle')
            : t('product.attr.createTitle')
        }
      >
        <ProductAttributeForm
          productId={productId}
          attribute={
            modalState?.mode === 'edit' ? modalState.attribute : undefined
          }
          isSubmitting={isCreating || isUpdating}
          onSubmit={handleSubmit}
          onCancel={closeModal}
        />
      </Modal>
    </div>
  );
}
