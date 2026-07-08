import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGetClientTypesQuery } from '@entities/client-type/api/clientTypeApi';
import type {
  IProductRate,
  ProductRateFormValues,
} from '@entities/product-rate/model/types';
import {
  useCreateProductRatePairMutation,
  useDeleteProductRateMutation,
  useGetProductRatesQuery,
  useUpdateProductRateMutation,
} from '@entities/product-rate/api/productRateApi';
import { summarizeRatesByClientType } from '@entities/product-rate/lib/summarizeRates';
import { Button } from '@shared/ui/Button';
import { Card } from '@shared/ui/Card';
import { Spinner } from '@shared/ui/Spinner';
import { PlusIcon } from '@shared/ui/icons/PlusIcon';
import { ShoppingCartIcon } from '@shared/ui/icons/ShoppingCartIcon';
import { TagIcon } from '@shared/ui/icons/TagIcon';
import { parseApiError } from '@shared/api/parseApiError';
import type { ApiException } from '@shared/api/type';
import { notify } from '@shared/lib/toast';
import { ClientTypeTabs } from './ClientTypeTabs';
import { RateTypeCard } from './RateTypeCard';
import type { CreateRateSubmitValues, CreateRateTab } from './CreateRateModal';
import { CreateRateModal } from './CreateRateModal';
import type { EditRateSubmitValues } from './EditRateModal';
import { EditRateModal } from './EditRateModal';

export function ProductPricesTab({ productId }: { productId: number }) {
  const { t } = useTranslation();
  const [selectedClientTypeId, setSelectedClientTypeId] = useState<
    number | null
  >(null);
  const [createModalState, setCreateModalState] = useState<{
    tab: CreateRateTab;
  } | null>(null);
  const [editingRate, setEditingRate] = useState<IProductRate | null>(null);

  const { data: clientTypesData, isFetching: isFetchingClientTypes } =
    useGetClientTypesQuery({ page: 0, size: 200 });
  const clientTypes = useMemo(
    () => clientTypesData?.data?.data ?? [],
    [clientTypesData],
  );

  const { data: ratesData, isFetching: isFetchingRates } =
    useGetProductRatesQuery({ page: 0, size: 100, filters: { productId } });
  const rates = useMemo(() => ratesData?.data?.data ?? [], [ratesData]);

  const summaries = useMemo(
    () => summarizeRatesByClientType(clientTypes, rates),
    [clientTypes, rates],
  );

  // No client type is "selected" by default in state — the first one in the
  // list is used until the user actually picks another, so there's always
  // something on screen without needing an effect to seed the initial pick.
  const effectiveSelectedId =
    selectedClientTypeId ?? clientTypes[0]?.id ?? null;
  const selectedClientType =
    clientTypes.find((ct) => ct.id === effectiveSelectedId) ?? null;
  const selectedSummary = summaries.find(
    (summary) => summary.clientType.id === effectiveSelectedId,
  );
  const purchaseRows = useMemo(
    () => (selectedSummary?.history ?? []).filter((r) => r.type === 'PURCHASE'),
    [selectedSummary],
  );
  const salesRows = useMemo(
    () => (selectedSummary?.history ?? []).filter((r) => r.type === 'SALES'),
    [selectedSummary],
  );

  const hasPrice = (clientTypeId: number) => {
    const summary = summaries.find((s) => s.clientType.id === clientTypeId);
    return Boolean(summary?.currentSales || summary?.currentPurchase);
  };

  const [createRatePair, { isLoading: isCreatingPair }] =
    useCreateProductRatePairMutation();
  const [updateRate, { isLoading: isUpdating }] =
    useUpdateProductRateMutation();
  const [deleteRate] = useDeleteProductRateMutation();

  const handleCreateSubmit = async (
    tab: CreateRateTab,
    values: CreateRateSubmitValues,
  ) => {
    if (!selectedClientType) return;
    try {
      await createRatePair({
        productId,
        clientTypeId: selectedClientType.id,
        unitId: values.unitId,
        currencyId: values.currencyId,
        altCurrencyId: values.altCurrencyId ?? undefined,
        date: values.date,
        ...(tab === 'PURCHASE'
          ? { purchaseRate: values.amount }
          : tab === 'SALES'
            ? { salesRate: values.amount }
            : { rate: values.amount }),
      }).unwrap();
      notify.success(t('message.saved'));
      setCreateModalState(null);
    } catch (error) {
      notify.error(parseApiError(error as ApiException));
    }
  };

  const handleEditSubmit = async (values: EditRateSubmitValues) => {
    if (!editingRate) return;
    try {
      const payload: ProductRateFormValues = {
        productId,
        clientTypeId: editingRate.clientTypeId,
        unitId: values.unitId,
        currencyId: values.currencyId,
        altCurrencyId: values.altCurrencyId,
        date: values.date,
        type: editingRate.type,
        rate: editingRate.type === 'SALES' ? values.amount : editingRate.rate,
        cost:
          editingRate.type === 'PURCHASE' ? values.amount : editingRate.cost,
      };
      await updateRate({ id: editingRate.id, data: payload }).unwrap();
      notify.success(t('message.saved'));
      setEditingRate(null);
    } catch (error) {
      notify.error(parseApiError(error as ApiException));
    }
  };

  const handleDeleteRate = async (rate: IProductRate) => {
    try {
      await deleteRate(rate.id).unwrap();
      notify.success(t('message.deleted'));
    } catch (error) {
      notify.error(parseApiError(error as ApiException));
    }
  };

  const isLoading = isFetchingClientTypes || isFetchingRates;

  if (isLoading && clientTypes.length === 0) {
    return (
      <Card className="flex items-center justify-center py-16">
        <Spinner className="text-fg-muted size-6" />
      </Card>
    );
  }

  if (clientTypes.length === 0) {
    return (
      <Card className="flex flex-col items-center gap-1 py-16 text-center">
        <p className="text-fg-muted text-sm">
          {t('product.price.noClientTypes')}
        </p>
      </Card>
    );
  }

  return (
    <div className="wide:max-w-6xl wide:mx-auto flex w-full flex-col gap-4">
      <ClientTypeTabs
        clientTypes={clientTypes}
        selectedId={effectiveSelectedId}
        onSelect={(clientType) => setSelectedClientTypeId(clientType.id)}
        hasPrice={hasPrice}
      />

      {selectedClientType && (
        <>
          <div className="flex items-center justify-between gap-3">
            <p className="text-fg-muted text-sm">
              {t('product.price.clientTypeHint')}
            </p>
            <Button
              icon={<PlusIcon size={15} />}
              onClick={() => setCreateModalState({ tab: 'PURCHASE' })}
            >
              {t('product.price.addPrice')}
            </Button>
          </div>

          <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
            <RateTypeCard
              type="PURCHASE"
              icon={<ShoppingCartIcon size={16} />}
              rows={purchaseRows}
              onAdd={() => setCreateModalState({ tab: 'PURCHASE' })}
              onEdit={setEditingRate}
              onDelete={handleDeleteRate}
            />
            <RateTypeCard
              type="SALES"
              icon={<TagIcon size={16} />}
              rows={salesRows}
              onAdd={() => setCreateModalState({ tab: 'SALES' })}
              onEdit={setEditingRate}
              onDelete={handleDeleteRate}
            />
          </div>
        </>
      )}

      {createModalState && selectedClientType && (
        <CreateRateModal
          clientType={selectedClientType}
          initialTab={createModalState.tab}
          isSubmitting={isCreatingPair}
          onSubmit={handleCreateSubmit}
          onClose={() => setCreateModalState(null)}
        />
      )}

      {editingRate && (
        <EditRateModal
          rate={editingRate}
          isSubmitting={isUpdating}
          onSubmit={handleEditSubmit}
          onClose={() => setEditingRate(null)}
        />
      )}
    </div>
  );
}
