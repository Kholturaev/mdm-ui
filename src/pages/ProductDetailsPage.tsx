import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useGetOneProductQuery,
  useUpdateProductMutation,
} from '@entities/product/api/productApi';
import { toProductFormValues } from '@entities/product/model/mapping';
import type {
  IProduct,
  ProductFormValues,
} from '@entities/product/model/types';
import { ProductStatus } from '@entities/product/model/types';
import { useTypeOfNomenclatureOptions } from '@entities/type-of-nomenclature/lib/useTypeOfNomenclatureOptions';
import { useUnitOptions } from '@entities/unit/lib/useUnitOptions';
import { useProductCategoryOptions } from '@entities/product-category/lib/useProductCategoryOptions';
import { useProductGroupOptions } from '@entities/product-group/lib/useProductGroupOptions';
import { useSegmentOptions } from '@entities/segment/lib/useSegmentOptions';
import { useAccountingProductOptions } from '@entities/accounting-product/lib/useAccountingProductOptions';
import { useGetExternalSystemsQuery } from '@entities/external-system/api/externalSystemApi';
import type { IExternalSystem } from '@entities/external-system/model/types';
import { useGetAuditByRecordQuery } from '@entities/audit/api/auditRecordApi';
import type { AuditRecordPerformer } from '@entities/audit/model/types';
import {
  formatAuditFieldValue,
  getAuditFieldLabel,
  groupAuditRecordEntries,
} from '@entities/audit/lib/auditRecordHistory';
import { RecordHistoryModal } from '@widgets/audit-log/ui/RecordHistoryModal';
import { ProductAttributesTab } from '@widgets/product-attributes/ui/ProductAttributesTab';
import { ProductCharacteristicsTab } from '@widgets/product-characteristics/ui/ProductCharacteristicsTab';
import { ProductReferenceModals } from '@features/product-reference-quick-create/ui/ProductReferenceModals';
import type { ProductReferenceType } from '@features/product-reference-quick-create/model/types';
import { Avatar } from '@shared/ui/Avatar';
import { Badge } from '@shared/ui/Badge';
import type { BadgeVariant } from '@shared/ui/Badge';
import { Button } from '@shared/ui/Button';
import { Card, CardHeader } from '@shared/ui/Card';
import { Modal } from '@shared/ui/Modal';
import { AddMoreLink } from '@shared/ui/AddMoreLink';
import { ProgressRing } from '@shared/ui/ProgressRing';
import {
  FormCheckbox,
  FormInput,
  FormSelect,
  FormTextarea,
} from '@shared/ui/form';
import type { SelectOption } from '@shared/ui/Select';
import { cn } from '@shared/lib/cn';
import { systemAbbr } from '@shared/lib/systemAbbr';
import { useClickOutside } from '@shared/lib/hooks/useClickOutside';
import { formatDateTime, formatRelativeTime } from '@shared/lib/formatDate';
import { parseApiError } from '@shared/api/parseApiError';
import type { ApiException } from '@shared/api/type';
import { notify } from '@shared/lib/toast';
import { usePageTitle } from '@shared/lib/pageTitle';
import { ArrowLeftIcon } from '@shared/ui/icons/ArrowLeftIcon';
import { ArrowRightIcon } from '@shared/ui/icons/ArrowRightIcon';
import { EditIcon } from '@shared/ui/icons/EditIcon';
import { CheckIcon } from '@shared/ui/icons/CheckIcon';
import { CheckCircleIcon } from '@shared/ui/icons/CheckCircleIcon';
import { CloseIcon } from '@shared/ui/icons/ChevronDownIcon';
import { DocumentIcon } from '@shared/ui/icons/DocumentIcon';
import { ChecklistIcon } from '@shared/ui/icons/ChecklistIcon';
import { SlidersIcon } from '@shared/ui/icons/SlidersIcon';
import { DollarIcon } from '@shared/ui/icons/DollarIcon';
import { SwapIcon } from '@shared/ui/icons/SwapIcon';
import { ImageIcon } from '@shared/ui/icons/ImageIcon';
import { ShareIcon } from '@shared/ui/icons/ShareIcon';
import { ClockIcon } from '@shared/ui/icons/ClockIcon';
import { InfoIcon } from '@shared/ui/icons/InfoIcon';

type TabKey =
  | 'general'
  | 'attributes'
  | 'characteristics'
  | 'prices'
  | 'unitConversion'
  | 'media'
  | 'systems'
  | 'history';

/**
 * Text/select fields tracked for the "Umumiy" section's completion count —
 * booleans (isFree, isViewOnlySmap, ...) are excluded since unchecked is a
 * valid, deliberate value rather than "missing data". Other sections aren't
 * built yet, so only these feed the ring for now.
 */
const GENERAL_FIELDS: (keyof ProductFormValues)[] = [
  'name',
  'description',
  'typeOfNomenclatureId',
  'productGroupId',
  'categoryId',
  'segmentId',
  'sapCode',
  'sapText',
  'article',
  'baseUnitId',
  'productStatus',
  'gtin',
  'additionalGtins',
  'accountingProductId',
];

/** Every tracked field lives under "Umumiy" for now — this map exists so the missing-fields panel already reads section labels off field metadata instead of a hardcoded string, ready for when Atributlar/Narxlar gain real tracked fields of their own. */
const GENERAL_FIELD_LABEL_KEYS: Record<string, string> = {
  name: 'product.name',
  description: 'product.description',
  typeOfNomenclatureId: 'product.typeOfNomenclature',
  productGroupId: 'product.productGroup',
  categoryId: 'product.category',
  segmentId: 'product.segment',
  sapCode: 'product.sapCode',
  sapText: 'product.sapText',
  article: 'product.article',
  baseUnitId: 'product.baseUnit',
  productStatus: 'product.productStatus',
  gtin: 'product.gtin',
  additionalGtins: 'product.additionalGtins',
  accountingProductId: 'product.accountingProduct',
};

const ACTIVATION_THRESHOLD = 90;

const STATUS_BADGE_VARIANT: Record<ProductStatus, BadgeVariant> = {
  [ProductStatus.ACTIVE]: 'success',
  [ProductStatus.TEMPORARILY_PASSIVE]: 'warning',
  [ProductStatus.PASSIVE]: 'neutral',
};

const REFERENCE_FIELD_BY_TYPE: Record<
  ProductReferenceType,
  keyof ProductFormValues
> = {
  typeOfNomenclature: 'typeOfNomenclatureId',
  productGroup: 'productGroupId',
  category: 'categoryId',
  segment: 'segmentId',
  unit: 'baseUnitId',
};

function isFilled(value: unknown): boolean {
  return value !== null && value !== undefined && value !== '';
}

/** Drops null/empty-string fields from an update payload — an untouched field should be omitted rather than sent as an explicit null/blank value. */
function cleanPayload<T extends object>(values: T): T {
  return Object.fromEntries(
    Object.entries(values).filter(
      ([, value]) => value !== null && value !== '',
    ),
  ) as T;
}

function ReadOnlyField({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div>
      <p className="text-fg-muted text-xs">{label}</p>
      <p className="text-fg mt-0.5 text-sm font-semibold">{value || '—'}</p>
    </div>
  );
}

function ReadOnlyBooleanField({
  label,
  value,
}: {
  label: string;
  value: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div>
      <p className="text-fg-muted text-xs">{label}</p>
      <p className="text-fg mt-0.5 flex items-center gap-1.5 text-sm font-semibold">
        {value ? (
          <span className="text-success">
            <CheckIcon size={14} />
          </span>
        ) : (
          <CloseIcon size={14} className="text-fg-muted" />
        )}
        {value ? t('common.yes') : t('common.no')}
      </p>
    </div>
  );
}

export function ProductDetailsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);

  const { data, isLoading } = useGetOneProductQuery(productId);
  const product = data?.data;
  usePageTitle(product?.name ?? t('product.title'));

  const [tab, setTab] = useState<TabKey>('general');
  const [isEditing, setIsEditing] = useState(false);
  const [updateProduct, { isLoading: isSaving }] = useUpdateProductMutation();
  const [isMissingPanelOpen, setIsMissingPanelOpen] = useState(false);
  const missingPanelRef = useRef<HTMLDivElement>(null);
  const missingTriggerRef = useRef<HTMLButtonElement>(null);
  useClickOutside([missingPanelRef, missingTriggerRef], () =>
    setIsMissingPanelOpen(false),
  );
  const [activeReferenceModal, setActiveReferenceModal] =
    useState<ProductReferenceType | null>(null);
  const [pendingTab, setPendingTab] = useState<TabKey | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { isDirty },
  } = useForm<ProductFormValues>({
    defaultValues: toProductFormValues(product),
  });

  useEffect(() => {
    reset(toProductFormValues(product));
  }, [product, reset]);

  const typeOfNomenclature = useTypeOfNomenclatureOptions();
  const unit = useUnitOptions();
  const productCategory = useProductCategoryOptions();
  const productGroup = useProductGroupOptions();
  const segment = useSegmentOptions();
  const accountingProduct = useAccountingProductOptions();

  const { data: externalSystemsData } = useGetExternalSystemsQuery({
    page: 0,
    size: 100,
  });
  const externalSystems = useMemo(
    () => externalSystemsData?.data?.data ?? [],
    [externalSystemsData],
  );

  const values = useWatch({ control });
  const missingFields = useMemo(
    () =>
      GENERAL_FIELDS.filter((field) => !isFilled(values[field])).map(
        (field) => ({
          key: field,
          label: t(GENERAL_FIELD_LABEL_KEYS[field]),
          sectionLabel: t('product.tabGeneral'),
        }),
      ),
    [values, t],
  );
  const filledCount = GENERAL_FIELDS.length - missingFields.length;
  const completionPercent = Math.round(
    (filledCount / GENERAL_FIELDS.length) * 100,
  );

  const productStatusOptions = useMemo<SelectOption[]>(
    () =>
      Object.values(ProductStatus).map((status) => ({
        label: t(`product.status.${status}`),
        value: status,
      })),
    [t],
  );

  const submitValues = async (formValues: ProductFormValues) => {
    try {
      await updateProduct({
        id: productId,
        data: cleanPayload(formValues),
      }).unwrap();
      notify.success(t('message.saved'));
      setIsEditing(false);
      return true;
    } catch (error) {
      notify.error(parseApiError(error as ApiException));
      return false;
    }
  };

  const handleSave = handleSubmit((formValues) => {
    if (!isDirty) {
      setIsEditing(false);
      return;
    }
    return submitValues(formValues);
  });

  const handleCancelEdit = () => {
    reset(toProductFormValues(product));
    setIsEditing(false);
  };

  const handleTabClick = (nextTab: TabKey) => {
    if (nextTab === tab) return;
    if (isEditing && isDirty) {
      setPendingTab(nextTab);
      return;
    }
    setTab(nextTab);
  };

  const handleDiscardAndSwitchTab = () => {
    handleCancelEdit();
    setTab(pendingTab as TabKey);
    setPendingTab(null);
  };

  const handleSaveAndSwitchTab = handleSubmit(
    async (formValues) => {
      const saved = await submitValues(formValues);
      if (saved) setTab(pendingTab as TabKey);
      setPendingTab(null);
    },
    () => setPendingTab(null),
  );

  const sections: { key: TabKey; label: string; icon: ReactNode }[] = [
    {
      key: 'general',
      label: t('product.tabGeneral'),
      icon: <DocumentIcon size={15} />,
    },
    {
      key: 'attributes',
      label: t('product.tabAttributes'),
      icon: <ChecklistIcon size={15} />,
    },
    {
      key: 'characteristics',
      label: t('product.tabCharacteristics'),
      icon: <SlidersIcon size={15} />,
    },
    {
      key: 'prices',
      label: t('product.tabPrices'),
      icon: <DollarIcon size={15} />,
    },
    {
      key: 'unitConversion',
      label: t('product.tabUnitConversion'),
      icon: <SwapIcon size={15} />,
    },
    {
      key: 'media',
      label: t('product.tabMedia'),
      icon: <ImageIcon size={15} />,
    },
    {
      key: 'systems',
      label: t('product.tabSystems'),
      icon: <ShareIcon size={15} />,
    },
    {
      key: 'history',
      label: t('product.tabHistory'),
      icon: <ClockIcon size={15} />,
    },
  ];

  if (isLoading || !product) {
    return (
      <div className="text-fg-muted flex h-full items-center justify-center text-sm">
        {t('common.loading')}
      </div>
    );
  }

  const metaTooltip = [
    t('product.createdMetaLine', {
      date: formatDateTime(product.createdAt),
      by: product.createdBy || '—',
    }),
    product.updatedAt &&
      t('product.updatedMetaLine', {
        time: formatRelativeTime(product.updatedAt, t),
      }),
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="flex h-full flex-col">
      <div className="border-border bg-surface flex items-center justify-between gap-4 border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/nomenclature')}
            aria-label={t('product.backToList')}
            className="border-border bg-surface text-fg-muted hover:bg-surface-hover hover:text-fg flex size-8 shrink-0 items-center justify-center rounded-lg border transition-colors"
          >
            <ArrowLeftIcon size={16} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-fg text-base font-semibold">
                {product.name}
              </h1>
              <Badge variant={isEditing ? 'warning' : 'neutral'}>
                {isEditing
                  ? t('product.editingBadge')
                  : t('product.viewingBadge')}
              </Badge>
            </div>
            <p className="text-fg-muted flex items-center gap-1 text-xs">
              <span>
                {product.sapCode ?? '—'} · #{product.id} · product
              </span>
              <span
                title={metaTooltip}
                className="text-fg-muted/70 hover:text-fg-muted inline-flex cursor-help"
              >
                <InfoIcon size={12} />
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            ref={missingTriggerRef}
            onClick={() => setIsMissingPanelOpen((value) => !value)}
            className={cn(
              'flex items-center gap-2',
              tab === 'general' && 'wide:hidden',
            )}
          >
            <span className="relative inline-flex">
              <ProgressRing
                percent={completionPercent}
                size={40}
                strokeWidth={4}
                completeThreshold={ACTIVATION_THRESHOLD}
              />
              {missingFields.length > 0 && (
                <span className="bg-warning text-fg-invert absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full text-[9px] font-bold">
                  {missingFields.length}
                </span>
              )}
            </span>
            <span className="text-fg-muted text-xs whitespace-nowrap">
              {t('product.filled')}
            </span>
          </button>

          {externalSystems.length > 0 && (
            <div
              className={cn(
                'flex items-center gap-1',
                tab === 'general' && 'wide:hidden',
              )}
            >
              {externalSystems.map((system) => {
                const present = (product.externalSystemIds ?? []).includes(
                  system.id,
                );
                return (
                  <span
                    key={system.id}
                    title={system.name}
                    className={cn(
                      'flex h-6 min-w-6 items-center justify-center rounded px-1 text-[10px] font-semibold',
                      present
                        ? 'bg-success/10 text-success'
                        : 'border-border text-fg-muted/50 border border-dashed',
                    )}
                  >
                    {systemAbbr(system.name)}
                  </span>
                );
              })}
            </div>
          )}

          {product.productStatus && (
            <Badge variant={STATUS_BADGE_VARIANT[product.productStatus]} dot>
              {t(`product.status.${product.productStatus}`)}
            </Badge>
          )}

          {tab === 'general' &&
            (isEditing ? (
              <>
                <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                  {t('common.cancel')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  icon={<CheckIcon size={14} />}
                  onClick={handleSave}
                  isLoading={isSaving}
                >
                  {t('common.save')}
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                icon={<EditIcon size={14} />}
                onClick={() => setIsEditing(true)}
              >
                {t('common.edit')}
              </Button>
            ))}
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        <div className="border-border w-56 shrink-0 overflow-y-auto border-r p-3">
          <nav className="flex flex-col gap-0.5">
            {sections.map((section) => (
              <button
                key={section.key}
                type="button"
                onClick={() => handleTabClick(section.key)}
                className={cn(
                  'flex items-center gap-2 rounded px-3 py-2 text-sm transition-colors',
                  tab === section.key
                    ? 'bg-surface-hover text-fg font-medium'
                    : 'text-fg-muted hover:bg-surface-hover hover:text-fg',
                )}
              >
                {section.icon}
                <span className="flex-1 text-left">{section.label}</span>
                {section.key === 'general' && (
                  <span className="text-fg-muted text-xs">
                    {filledCount}/{GENERAL_FIELDS.length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          {tab === 'general' ? (
            <div className="wide:grid-cols-[48rem_20rem] wide:justify-center grid gap-6">
              {isEditing ? (
                <form
                  onSubmit={handleSave}
                  className="flex max-w-3xl flex-col gap-4 xl:max-w-none"
                >
                  <Card className="flex flex-col gap-4">
                    <h3 className="text-fg text-sm font-semibold">
                      {t('product.generalInfo')}
                    </h3>

                    <FormInput
                      name="name"
                      control={control}
                      label={t('product.name')}
                      required
                      rules={{ required: t('common.required') }}
                    />
                    <FormTextarea
                      name="description"
                      control={control}
                      label={t('product.description')}
                      rows={2}
                    />

                    <div className="flex gap-4">
                      <div className="flex flex-1 flex-col gap-1">
                        <FormSelect
                          name="typeOfNomenclatureId"
                          control={control}
                          options={typeOfNomenclature.options}
                          label={t('product.typeOfNomenclature')}
                          isClearable
                          isSearchable
                          isLoading={typeOfNomenclature.isFetching}
                          onInputChange={typeOfNomenclature.onInputChange}
                        />
                        <AddMoreLink
                          onClick={() =>
                            setActiveReferenceModal('typeOfNomenclature')
                          }
                        />
                      </div>
                      <div className="flex flex-1 flex-col gap-1">
                        <FormSelect
                          name="productGroupId"
                          control={control}
                          options={productGroup.options}
                          label={t('product.productGroup')}
                          isClearable
                          isSearchable
                          isLoading={productGroup.isFetching}
                          onInputChange={productGroup.onInputChange}
                        />
                        <AddMoreLink
                          onClick={() =>
                            setActiveReferenceModal('productGroup')
                          }
                        />
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex flex-1 flex-col gap-1">
                        <FormSelect
                          name="categoryId"
                          control={control}
                          options={productCategory.options}
                          label={t('product.category')}
                          isClearable
                          isSearchable
                          isLoading={productCategory.isFetching}
                          onInputChange={productCategory.onInputChange}
                        />
                        <AddMoreLink
                          onClick={() => setActiveReferenceModal('category')}
                        />
                      </div>
                      <div className="flex flex-1 flex-col gap-1">
                        <FormSelect
                          name="segmentId"
                          control={control}
                          options={segment.options}
                          label={t('product.segment')}
                          isClearable
                          isSearchable
                          isLoading={segment.isFetching}
                          onInputChange={segment.onInputChange}
                        />
                        <AddMoreLink
                          onClick={() => setActiveReferenceModal('segment')}
                        />
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-1">
                        <FormInput
                          name="sapCode"
                          control={control}
                          label={t('product.sapCode')}
                        />
                      </div>
                      <div className="flex-1">
                        <FormInput
                          name="sapText"
                          control={control}
                          label={t('product.sapText')}
                        />
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-1">
                        <FormInput
                          name="article"
                          control={control}
                          label={t('product.article')}
                        />
                      </div>
                      <div className="flex flex-1 flex-col gap-1">
                        <FormSelect
                          name="baseUnitId"
                          control={control}
                          options={unit.options}
                          label={t('product.baseUnit')}
                          isClearable
                          isSearchable
                          isLoading={unit.isFetching}
                          onInputChange={unit.onInputChange}
                        />
                        <AddMoreLink
                          onClick={() => setActiveReferenceModal('unit')}
                        />
                      </div>
                    </div>

                    <div className="flex items-end gap-4">
                      <div className="flex-1">
                        <FormSelect
                          name="productStatus"
                          control={control}
                          options={productStatusOptions}
                          label={t('product.productStatus')}
                          isClearable
                        />
                      </div>
                      <div className="flex-1">
                        <FormCheckbox
                          name="isFree"
                          control={control}
                          label={t('product.isFree')}
                        />
                      </div>
                    </div>
                  </Card>

                  <Card className="flex flex-col gap-4">
                    <h3 className="text-fg text-sm font-semibold">
                      {t('product.gtin')}
                    </h3>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <FormInput
                          name="gtin"
                          control={control}
                          label={t('product.gtin')}
                        />
                      </div>
                      <div className="flex-1">
                        <FormInput
                          name="additionalGtins"
                          control={control}
                          label={t('product.additionalGtins')}
                        />
                      </div>
                    </div>
                  </Card>

                  <Card className="flex flex-col gap-4">
                    <h3 className="text-fg text-sm font-semibold">
                      {t('product.accountingInfo')}
                    </h3>
                    <FormSelect
                      name="accountingProductId"
                      control={control}
                      options={accountingProduct.options}
                      label={t('product.accountingProduct')}
                      isClearable
                      isSearchable
                      isLoading={accountingProduct.isFetching}
                      onInputChange={accountingProduct.onInputChange}
                    />
                    <div className="flex flex-col gap-3">
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <FormCheckbox
                            name="isViewOnlySmap"
                            control={control}
                            label={t('product.isViewOnlySmap')}
                          />
                        </div>
                        <div className="flex-1">
                          <FormCheckbox
                            name="isCalcAccAmountByPercent"
                            control={control}
                            label={t('product.isCalcAccAmountByPercent')}
                          />
                        </div>
                      </div>
                      <FormCheckbox
                        name="isAutoGenerateKM"
                        control={control}
                        label={t('product.isAutoGenerateKM')}
                      />
                    </div>
                  </Card>

                  <ProductReferenceModals
                    activeModal={activeReferenceModal}
                    onClose={() => setActiveReferenceModal(null)}
                    onCreated={(type, referenceId) =>
                      setValue(REFERENCE_FIELD_BY_TYPE[type], referenceId, {
                        shouldDirty: true,
                      })
                    }
                  />
                </form>
              ) : (
                <ProductGeneralReadOnly product={product} />
              )}

              <aside className="wide:flex hidden flex-col gap-4">
                <ProductCompletenessCard
                  percent={completionPercent}
                  threshold={ACTIVATION_THRESHOLD}
                  missingFields={missingFields}
                  onFieldClick={() => setIsEditing(true)}
                />
                {externalSystems.length > 0 && (
                  <ProductSystemsStatusCard
                    systems={externalSystems}
                    presentIds={product.externalSystemIds ?? []}
                  />
                )}
                <ProductLastChangeCard product={product} />
              </aside>
            </div>
          ) : tab === 'attributes' ? (
            <ProductAttributesTab productId={productId} />
          ) : tab === 'characteristics' ? (
            <ProductCharacteristicsTab
              productId={productId}
              typeOfNomenclatureId={product.typeOfNomenclature?.id ?? null}
              onGoToGeneral={() => setTab('general')}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-1 text-center">
              <p className="text-fg-muted text-sm">
                {t('product.tabPlaceholder')}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="border-border bg-surface text-fg-muted border-t px-6 py-2 text-xs">
        {t('product.completionHint', { threshold: ACTIVATION_THRESHOLD })}
      </div>

      {isMissingPanelOpen &&
        createPortal(
          <div
            ref={missingPanelRef}
            className="border-border bg-surface fixed top-0 right-0 z-100 flex h-full w-72 flex-col gap-4 overflow-y-auto border-l p-5 shadow-xl"
          >
            <div>
              <h3 className="text-fg text-sm font-semibold">
                {t('product.missingFieldsTitle')}
              </h3>
              <p className="text-fg-muted mt-0.5 text-xs">
                {missingFields.length > 0
                  ? t('product.missingFieldsHint', {
                      count: missingFields.length,
                      threshold: ACTIVATION_THRESHOLD,
                    })
                  : t('product.missingFieldsEmpty')}
              </p>
            </div>

            {missingFields.length > 0 && (
              <ul className="flex flex-col gap-0.5">
                {missingFields.map((field) => (
                  <li key={field.key}>
                    <button
                      type="button"
                      onClick={() => {
                        setTab('general');
                        setIsMissingPanelOpen(false);
                      }}
                      className="hover:bg-surface-hover flex w-full items-start gap-2 rounded px-2 py-2 text-left transition-colors"
                    >
                      <span className="bg-warning mt-1.5 size-1.5 shrink-0 rounded-full" />
                      <div>
                        <p className="text-fg text-sm font-medium">
                          {field.label}
                        </p>
                        <p className="text-fg-muted text-xs">
                          {field.sectionLabel}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>,
          document.body,
        )}

      <Modal
        isOpen={pendingTab !== null}
        onClose={() => setPendingTab(null)}
        title={t('product.unsavedChangesTitle')}
      >
        <div className="flex flex-col gap-4">
          <p className="text-fg-muted text-sm">
            {t('product.unsavedChangesHint')}
          </p>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setPendingTab(null)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleDiscardAndSwitchTab}
            >
              {t('product.discardChanges')}
            </Button>
            <Button
              type="button"
              onClick={handleSaveAndSwitchTab}
              isLoading={isSaving}
            >
              {t('common.save')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function ProductGeneralReadOnly({ product }: { product: IProduct }) {
  const { t } = useTranslation();

  return (
    <div className="flex max-w-3xl flex-col gap-4 xl:max-w-none">
      <Card className="flex flex-col gap-4">
        <h3 className="text-fg text-sm font-semibold">
          {t('product.generalInfo')}
        </h3>

        <ReadOnlyField label={t('product.name')} value={product.name} />
        <ReadOnlyField
          label={t('product.description')}
          value={product.description}
        />

        <div className="flex gap-4">
          <div className="flex-1">
            <ReadOnlyField
              label={t('product.typeOfNomenclature')}
              value={product.typeOfNomenclature?.name}
            />
          </div>
          <div className="flex-1">
            <ReadOnlyField
              label={t('product.productGroup')}
              value={product.productGroup?.name}
            />
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <ReadOnlyField
              label={t('product.category')}
              value={product.category?.name}
            />
          </div>
          <div className="flex-1">
            <ReadOnlyField
              label={t('product.segment')}
              value={product.segment?.name}
            />
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <ReadOnlyField
              label={t('product.sapCode')}
              value={product.sapCode}
            />
          </div>
          <div className="flex-1">
            <ReadOnlyField
              label={t('product.sapText')}
              value={product.sapText}
            />
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <ReadOnlyField
              label={t('product.article')}
              value={product.article}
            />
          </div>
          <div className="flex-1">
            <ReadOnlyField
              label={t('product.baseUnit')}
              value={product.baseUnit?.name}
            />
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <ReadOnlyField
              label={t('product.productStatus')}
              value={
                product.productStatus
                  ? t(`product.status.${product.productStatus}`)
                  : undefined
              }
            />
          </div>
          <div className="flex-1">
            <ReadOnlyBooleanField
              label={t('product.isFree')}
              value={Boolean(product.isFree)}
            />
          </div>
        </div>
      </Card>

      <Card className="flex flex-col gap-4">
        <h3 className="text-fg text-sm font-semibold">{t('product.gtin')}</h3>
        <div className="flex gap-4">
          <div className="flex-1">
            <ReadOnlyField label={t('product.gtin')} value={product.gtin} />
          </div>
          <div className="flex-1">
            <ReadOnlyField
              label={t('product.additionalGtins')}
              value={product.additionalGtins}
            />
          </div>
        </div>
      </Card>

      <Card className="flex flex-col gap-4">
        <h3 className="text-fg text-sm font-semibold">
          {t('product.accountingInfo')}
        </h3>
        <ReadOnlyField
          label={t('product.accountingProduct')}
          value={product.accountingProduct?.name}
        />
        <div className="flex flex-col gap-3">
          <div className="flex gap-4">
            <div className="flex-1">
              <ReadOnlyBooleanField
                label={t('product.isViewOnlySmap')}
                value={Boolean(product.isViewOnlySmap)}
              />
            </div>
            <div className="flex-1">
              <ReadOnlyBooleanField
                label={t('product.isCalcAccAmountByPercent')}
                value={Boolean(product.isCalcAccAmountByPercent)}
              />
            </div>
          </div>
          <ReadOnlyBooleanField
            label={t('product.isAutoGenerateKM')}
            value={Boolean(product.isAutoGenerateKM)}
          />
        </div>
      </Card>
    </div>
  );
}

function ProductCompletenessCard({
  percent,
  threshold,
  missingFields,
  onFieldClick,
}: {
  percent: number;
  threshold: number;
  missingFields: { key: string; label: string }[];
  onFieldClick: () => void;
}) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader
        icon={
          <ProgressRing
            percent={percent}
            size={44}
            strokeWidth={5}
            completeThreshold={threshold}
          />
        }
        title={t('product.completeness')}
        subtitle={
          missingFields.length > 0
            ? t('product.missingFieldsHint', {
                count: missingFields.length,
                threshold,
              })
            : t('product.missingFieldsEmpty')
        }
      />
      {missingFields.length > 0 && (
        <ul className="-mx-1.5 flex flex-col gap-0.5">
          {missingFields.map((field) => (
            <li key={field.key}>
              <button
                type="button"
                onClick={onFieldClick}
                className="hover:bg-surface-hover flex w-full items-center gap-2 rounded px-1.5 py-1.5 text-left transition-colors"
              >
                <span className="bg-warning size-1.5 shrink-0 rounded-full" />
                <span className="text-fg truncate text-sm">{field.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function ProductSystemsStatusCard({
  systems,
  presentIds,
}: {
  systems: IExternalSystem[];
  presentIds: number[];
}) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader
        title={t('product.externalSystemsTitle')}
        icon={<ShareIcon size={15} />}
      />
      <ul className="flex flex-col gap-2.5">
        {systems.map((system) => {
          const present = presentIds.includes(system.id);
          return (
            <li
              key={system.id}
              className="flex items-center justify-between gap-2 text-sm"
            >
              <span className="truncate font-medium">
                <span className="text-fg">
                  {system.name.slice(0, 2).toUpperCase()}
                </span>
                <span className="text-fg-muted">
                  {system.name.slice(2).toLowerCase()}
                </span>
              </span>
              {present ? (
                <span className="text-success flex shrink-0 items-center gap-1 text-xs font-medium">
                  <CheckCircleIcon size={13} />
                  {t('analytics.coverage.legend.synced')}
                </span>
              ) : (
                <span className="text-fg-muted flex shrink-0 items-center gap-1 text-xs">
                  <ClockIcon size={13} />
                  {t('analytics.coverage.legend.pending')}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

function auditPerformerName(
  performer: AuditRecordPerformer | null,
  fallback: string,
): string {
  if (!performer) return fallback;
  const fullName =
    `${performer.firstName ?? ''} ${performer.lastName ?? ''}`.trim();
  return fullName || performer.username;
}

function ProductLastChangeCard({ product }: { product: IProduct }) {
  const { t } = useTranslation();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const { data, isFetching } = useGetAuditByRecordQuery({
    tableName: 'product',
    recordId: product.id,
    page: 0,
    size: 200,
  });
  const latest = useMemo(
    () => groupAuditRecordEntries(data?.data?.content ?? [])[0],
    [data],
  );

  return (
    <Card>
      <CardHeader
        title={t('product.lastChange')}
        icon={<ClockIcon size={15} />}
        action={
          <button
            type="button"
            onClick={() => setIsHistoryOpen(true)}
            className="text-primary flex items-center gap-1 text-xs font-medium hover:underline"
          >
            {t('audit.viewAll')}
            <ArrowRightIcon size={11} />
          </button>
        }
      />

      {isFetching ? (
        <p className="text-fg-muted text-xs">{t('common.loading')}</p>
      ) : !latest ? (
        <p className="text-fg-muted text-xs">
          {t('audit.recordHistory.empty')}
        </p>
      ) : (
        <div>
          <div className="flex items-center gap-2">
            <Avatar
              name={auditPerformerName(latest.performedBy, '?')}
              size="sm"
            />
            <span className="text-fg min-w-0 flex-1 truncate text-sm font-medium">
              {latest.performedBy
                ? auditPerformerName(latest.performedBy, '?')
                : t('audit.systemActor')}
            </span>
            <span className="text-fg-muted shrink-0 text-xs whitespace-nowrap">
              {formatRelativeTime(latest.actionTime, t)}
            </span>
          </div>

          {latest.actionType === 'INSERT' ? (
            <p className="text-fg-muted mt-2 text-xs">
              {t('audit.recordHistory.createdMessage')}
            </p>
          ) : (
            <div className="mt-2 flex flex-col gap-1">
              {latest.fieldChanges.slice(0, 2).map((change) => (
                <p key={change.fieldName} className="truncate text-xs">
                  <span className="text-fg-muted">
                    {getAuditFieldLabel(change.fieldName, t)}:{' '}
                  </span>
                  <span className="text-fg-muted line-through">
                    {formatAuditFieldValue(
                      change.fieldName,
                      change.oldValue,
                      t,
                    )}
                  </span>
                  {' → '}
                  <span className="text-fg font-medium">
                    {formatAuditFieldValue(
                      change.fieldName,
                      change.newValue,
                      t,
                    )}
                  </span>
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      <RecordHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        tableName="product"
        recordId={product.id}
        recordTitle={product.name}
        recordCode={product.sapCode}
      />
    </Card>
  );
}
