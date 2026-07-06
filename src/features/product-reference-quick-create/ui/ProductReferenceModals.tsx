import { useTranslation } from 'react-i18next';
import { useCreateTypeOfNomenclatureMutation } from '@entities/type-of-nomenclature/api/typeOfNomenclatureApi';
import { useCreateProductGroupMutation } from '@entities/product-group/api/productGroupApi';
import { useCreateProductCategoryMutation } from '@entities/product-category/api/productCategoryApi';
import { useCreateSegmentMutation } from '@entities/segment/api/segmentApi';
import { useCreateUnitMutation } from '@entities/unit/api/unitApi';
import { TypeOfNomenclatureForm } from '@features/type-of-nomenclature-create-edit/ui/TypeOfNomenclatureForm';
import { ProductGroupForm } from '@features/product-group-create-edit/ui/ProductGroupForm';
import { ProductCategoryForm } from '@features/product-category-create-edit/ui/ProductCategoryForm';
import { SegmentForm } from '@features/segment-create-edit/ui/SegmentForm';
import { UnitForm } from '@features/unit-create-edit/ui/UnitForm';
import { Modal } from '@shared/ui/Modal';
import { parseApiError } from '@shared/api/parseApiError';
import type { ApiException } from '@shared/api/type';
import { notify } from '@shared/lib/toast';
import type { ProductReferenceType } from '../model/types';

type ProductReferenceModalsProps = {
  activeModal: ProductReferenceType | null;
  onClose: () => void;
  /** Fires after a successful create, so the caller can select the new item in its select field. */
  onCreated: (type: ProductReferenceType, id: number) => void;
};

/**
 * The 5 "+ yana qo'shish" quick-create modals for a product's reference
 * selects (type of nomenclature, product group, category, segment, unit) —
 * shared between the required-fields create form and the details page's
 * editable general-info tab so both stay in sync, mirroring akfa-data-frontend's
 * `ProductReferenceCreateProvider`. No accounting-product quick-create, same as
 * akfa (it doesn't offer one either).
 */
export function ProductReferenceModals({
  activeModal,
  onClose,
  onCreated,
}: ProductReferenceModalsProps) {
  const { t } = useTranslation();

  const [createTypeOfNomenclature, { isLoading: isCreatingType }] =
    useCreateTypeOfNomenclatureMutation();
  const [createProductGroup, { isLoading: isCreatingGroup }] =
    useCreateProductGroupMutation();
  const [createProductCategory, { isLoading: isCreatingCategory }] =
    useCreateProductCategoryMutation();
  const [createSegment, { isLoading: isCreatingSegment }] =
    useCreateSegmentMutation();
  const [createUnit, { isLoading: isCreatingUnit }] = useCreateUnitMutation();

  return (
    <>
      <Modal
        isOpen={activeModal === 'typeOfNomenclature'}
        onClose={onClose}
        title={t('typeOfNomenclature.createTitle')}
      >
        <TypeOfNomenclatureForm
          isSubmitting={isCreatingType}
          onCancel={onClose}
          onSubmit={async (values) => {
            try {
              const created = await createTypeOfNomenclature(values).unwrap();
              notify.success(t('message.saved'));
              onCreated('typeOfNomenclature', created.data.id);
              onClose();
            } catch (error) {
              notify.error(parseApiError(error as ApiException));
            }
          }}
        />
      </Modal>

      <Modal
        isOpen={activeModal === 'productGroup'}
        onClose={onClose}
        title={t('productGroup.createTitle')}
      >
        <ProductGroupForm
          isSubmitting={isCreatingGroup}
          onCancel={onClose}
          onSubmit={async (values) => {
            try {
              const created = await createProductGroup(values).unwrap();
              notify.success(t('message.saved'));
              onCreated('productGroup', created.data.id);
              onClose();
            } catch (error) {
              notify.error(parseApiError(error as ApiException));
            }
          }}
        />
      </Modal>

      <Modal
        isOpen={activeModal === 'category'}
        onClose={onClose}
        title={t('productCategory.createTitle')}
      >
        <ProductCategoryForm
          isSubmitting={isCreatingCategory}
          onCancel={onClose}
          onSubmit={async (values) => {
            try {
              const created = await createProductCategory(values).unwrap();
              notify.success(t('message.saved'));
              onCreated('category', created.data.id);
              onClose();
            } catch (error) {
              notify.error(parseApiError(error as ApiException));
            }
          }}
        />
      </Modal>

      <Modal
        isOpen={activeModal === 'segment'}
        onClose={onClose}
        title={t('segment.createTitle')}
      >
        <SegmentForm
          isSubmitting={isCreatingSegment}
          onCancel={onClose}
          onSubmit={async (values) => {
            try {
              const created = await createSegment(values).unwrap();
              notify.success(t('message.saved'));
              onCreated('segment', created.data.id);
              onClose();
            } catch (error) {
              notify.error(parseApiError(error as ApiException));
            }
          }}
        />
      </Modal>

      <Modal
        isOpen={activeModal === 'unit'}
        onClose={onClose}
        title={t('unit.createTitle')}
      >
        <UnitForm
          isSubmitting={isCreatingUnit}
          onCancel={onClose}
          onSubmit={async (values) => {
            try {
              const created = await createUnit(values).unwrap();
              notify.success(t('message.saved'));
              onCreated('unit', created.data.id);
              onClose();
            } catch (error) {
              notify.error(parseApiError(error as ApiException));
            }
          }}
        />
      </Modal>
    </>
  );
}
