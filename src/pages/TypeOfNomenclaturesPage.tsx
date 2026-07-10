import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type {
  ITypeOfNomenclature,
  TypeOfNomenclatureFormValues,
} from '@entities/type-of-nomenclature/model/types';
import {
  useCreateTypeOfNomenclatureMutation,
  useDeleteTypeOfNomenclatureMutation,
  useUpdateTypeOfNomenclatureMutation,
} from '@entities/type-of-nomenclature/api/typeOfNomenclatureApi';
import { TypeOfNomenclatureForm } from '@features/type-of-nomenclature-create-edit/ui/TypeOfNomenclatureForm';
import { TypeOfNomenclatureTable } from '@widgets/type-of-nomenclature-table/ui/TypeOfNomenclatureTable';
import { Modal } from '@shared/ui/Modal';
import { parseApiError } from '@shared/api/parseApiError';
import type { ApiException } from '@shared/api/type';
import { notify } from '@shared/lib/toast';
import { useConfirm } from '@shared/lib/confirm';

type ModalState =
  | { mode: 'create' }
  | { mode: 'edit'; typeOfNomenclature: ITypeOfNomenclature }
  | null;

export function TypeOfNomenclaturesPage() {
  const { t } = useTranslation();
  const confirm = useConfirm();
  const [modalState, setModalState] = useState<ModalState>(null);

  const [createTypeOfNomenclature, { isLoading: isCreating }] =
    useCreateTypeOfNomenclatureMutation();
  const [updateTypeOfNomenclature, { isLoading: isUpdating }] =
    useUpdateTypeOfNomenclatureMutation();
  const [deleteTypeOfNomenclature] = useDeleteTypeOfNomenclatureMutation();

  const closeModal = () => setModalState(null);

  const handleSubmit = async (values: TypeOfNomenclatureFormValues) => {
    try {
      if (modalState?.mode === 'edit') {
        await updateTypeOfNomenclature({
          id: modalState.typeOfNomenclature.id,
          data: values,
        }).unwrap();
      } else {
        await createTypeOfNomenclature(values).unwrap();
      }
      notify.success(t('message.saved'));
      closeModal();
    } catch (error) {
      notify.error(parseApiError(error as ApiException));
    }
  };

  const handleDelete = async (typeOfNomenclature: ITypeOfNomenclature) => {
    const confirmed = await confirm({
      title: t('typeOfNomenclature.deleteTitle'),
      description: t('typeOfNomenclature.deleteConfirm', {
        name: typeOfNomenclature.name,
      }),
    });
    if (!confirmed) return;

    try {
      await deleteTypeOfNomenclature(typeOfNomenclature.id).unwrap();
      notify.success(t('message.deleted'));
    } catch (error) {
      notify.error(parseApiError(error as ApiException));
    }
  };

  return (
    <div className="h-full">
      <TypeOfNomenclatureTable
        onCreate={() => setModalState({ mode: 'create' })}
        onEdit={(typeOfNomenclature) =>
          setModalState({ mode: 'edit', typeOfNomenclature })
        }
        onDelete={handleDelete}
      />

      <Modal
        isOpen={modalState !== null}
        onClose={closeModal}
        title={
          modalState?.mode === 'edit'
            ? t('typeOfNomenclature.editTitle')
            : t('typeOfNomenclature.createTitle')
        }
      >
        <TypeOfNomenclatureForm
          entity={
            modalState?.mode === 'edit'
              ? modalState.typeOfNomenclature
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
