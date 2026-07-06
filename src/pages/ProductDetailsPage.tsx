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
import { Badge } from '@shared/ui/Badge';
import { Button } from '@shared/ui/Button';
import { Card } from '@shared/ui/Card';
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
import { parseApiError } from '@shared/api/parseApiError';
import type { ApiException } from '@shared/api/type';
import { notify } from '@shared/lib/toast';
import { usePageTitle } from '@shared/lib/pageTitle';
import { ArrowLeftIcon } from '@shared/ui/icons/ArrowLeftIcon';
import { EditIcon } from '@shared/ui/icons/EditIcon';
import { CheckIcon } from '@shared/ui/icons/CheckIcon';
import { CloseIcon } from '@shared/ui/icons/ChevronDownIcon';
import { DocumentIcon } from '@shared/ui/icons/DocumentIcon';
import { ChecklistIcon } from '@shared/ui/icons/ChecklistIcon';
import { SlidersIcon } from '@shared/ui/icons/SlidersIcon';
import { DollarIcon } from '@shared/ui/icons/DollarIcon';
import { SwapIcon } from '@shared/ui/icons/SwapIcon';
import { ImageIcon } from '@shared/ui/icons/ImageIcon';
import { ShareIcon } from '@shared/ui/icons/ShareIcon';
import { ClockIcon } from '@shared/ui/icons/ClockIcon';
import { LockIcon } from '@shared/ui/icons/LockIcon';

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
  article: 'product.article',
  baseUnitId: 'product.baseUnit',
  productStatus: 'product.productStatus',
  gtin: 'product.gtin',
  additionalGtins: 'product.additionalGtins',
  accountingProductId: 'product.accountingProduct',
};

const ACTIVATION_THRESHOLD = 90;

function isFilled(value: unknown): boolean {
  return value !== null && value !== undefined && value !== '';
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
  const [isActivating, setIsActivating] = useState(false);
  const [isMissingPanelOpen, setIsMissingPanelOpen] = useState(false);
  const missingPanelRef = useRef<HTMLDivElement>(null);
  const missingTriggerRef = useRef<HTMLButtonElement>(null);
  useClickOutside([missingPanelRef, missingTriggerRef], () =>
    setIsMissingPanelOpen(false),
  );

  const { control, handleSubmit, reset } = useForm<ProductFormValues>({
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
  const canActivate = completionPercent >= ACTIVATION_THRESHOLD;

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
      await updateProduct({ id: productId, data: formValues }).unwrap();
      notify.success(t('message.saved'));
      setIsEditing(false);
    } catch (error) {
      notify.error(parseApiError(error as ApiException));
    }
  };

  const handleSave = handleSubmit(submitValues);

  const handleCancelEdit = () => {
    reset(toProductFormValues(product));
    setIsEditing(false);
  };

  const handleActivate = handleSubmit(async (formValues) => {
    setIsActivating(true);
    try {
      await submitValues({
        ...formValues,
        productStatus: ProductStatus.ACTIVE,
      });
    } finally {
      setIsActivating(false);
    }
  });

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
            <p className="text-fg-muted text-xs">
              {product.sapCode ?? '—'} · #{product.id} · product
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            ref={missingTriggerRef}
            onClick={() => setIsMissingPanelOpen((value) => !value)}
            className="flex items-center gap-2"
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
            <div className="flex items-center gap-1">
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

          {isEditing ? (
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
          )}

          <Button
            size="sm"
            disabled={!canActivate}
            icon={!canActivate ? <LockIcon size={13} /> : undefined}
            onClick={handleActivate}
            isLoading={isActivating}
          >
            {t('product.activate')}
          </Button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        <div className="border-border w-56 shrink-0 overflow-y-auto border-r p-3">
          <nav className="flex flex-col gap-0.5">
            {sections.map((section) => (
              <button
                key={section.key}
                type="button"
                onClick={() => setTab(section.key)}
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
            isEditing ? (
              <form
                onSubmit={handleSave}
                className="flex max-w-3xl flex-col gap-4"
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
                    <div className="flex-1">
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
                    </div>
                    <div className="flex-1">
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
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1">
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
                    </div>
                    <div className="flex-1">
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
                        name="article"
                        control={control}
                        label={t('product.article')}
                      />
                    </div>
                  </div>

                  <div className="flex items-end gap-4">
                    <div className="flex-1">
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
                    </div>
                    <div className="flex-1">
                      <FormSelect
                        name="productStatus"
                        control={control}
                        options={productStatusOptions}
                        label={t('product.productStatus')}
                        isClearable
                      />
                    </div>
                  </div>

                  <FormCheckbox
                    name="isFree"
                    control={control}
                    label={t('product.isFree')}
                  />
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
              </form>
            ) : (
              <ProductGeneralReadOnly product={product} />
            )
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
    </div>
  );
}

function ProductGeneralReadOnly({ product }: { product: IProduct }) {
  const { t } = useTranslation();

  return (
    <div className="flex max-w-3xl flex-col gap-4">
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
              label={t('product.article')}
              value={product.article}
            />
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <ReadOnlyField
              label={t('product.baseUnit')}
              value={product.baseUnit?.name}
            />
          </div>
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
        </div>

        <ReadOnlyBooleanField
          label={t('product.isFree')}
          value={Boolean(product.isFree)}
        />
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
