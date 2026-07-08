import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ColumnDef } from '@tanstack/react-table';
import { useGetUnitsQuery } from '@entities/unit/api/unitApi';
import type {
  IUnitConversion,
  UnitConversionFormValues,
} from '@entities/product-unit-conversion/model/types';
import {
  useCreateUnitConversionMutation,
  useDeleteUnitConversionMutation,
  useGetUnitConversionsQuery,
  useUpdateUnitConversionMutation,
} from '@entities/product-unit-conversion/api/productUnitConversionApi';
import { formatConversionLine } from '@entities/product-unit-conversion/lib/formatConversion';
import { Badge } from '@shared/ui/Badge';
import { Button } from '@shared/ui/Button';
import { Card, CardHeader } from '@shared/ui/Card';
import { Modal } from '@shared/ui/Modal';
import { DataTable } from '@shared/ui/Table';
import type { SelectOption } from '@shared/ui/Select';
import { PlusIcon } from '@shared/ui/icons/PlusIcon';
import { EditIcon } from '@shared/ui/icons/EditIcon';
import { DeleteIcon } from '@shared/ui/icons/DeleteIcon';
import { SwapIcon } from '@shared/ui/icons/SwapIcon';
import { parseApiError } from '@shared/api/parseApiError';
import type { ApiException } from '@shared/api/type';
import { notify } from '@shared/lib/toast';
import type { UnitConversionSubmitValues } from './UnitConversionForm';
import { UnitConversionForm } from './UnitConversionForm';

type ModalState =
  { mode: 'create' } | { mode: 'edit'; row: IUnitConversion } | null;

export function ProductUnitConversionTab({
  productId,
  baseUnitId,
  onGoToGeneral,
}: {
  productId: number;
  baseUnitId?: number | null;
  onGoToGeneral?: () => void;
}) {
  const { t } = useTranslation();
  const [modalState, setModalState] = useState<ModalState>(null);
  const [rowPendingDelete, setRowPendingDelete] =
    useState<IUnitConversion | null>(null);

  const { data: unitsData } = useGetUnitsQuery({ page: 0, size: 200 });
  const units = useMemo(() => unitsData?.data?.data ?? [], [unitsData]);
  const unitById = useMemo(
    () => new Map(units.map((unit) => [unit.id, unit])),
    [units],
  );
  const baseUnit = baseUnitId ? unitById.get(baseUnitId) : undefined;

  const { data: conversionsData, isFetching } = useGetUnitConversionsQuery({
    page: 0,
    size: 100,
    filters: { productId },
  });
  const rows = useMemo(
    () => conversionsData?.data?.data ?? [],
    [conversionsData],
  );

  const unitOptionsForModal = useMemo<SelectOption[]>(() => {
    const excluded = new Set<number>();
    if (baseUnitId) excluded.add(baseUnitId);
    rows.forEach((row) => {
      const isRowBeingEdited =
        modalState?.mode === 'edit' && modalState.row.id === row.id;
      if (row.alternativeUnitId && !isRowBeingEdited) {
        excluded.add(row.alternativeUnitId);
      }
    });
    return units
      .filter((unit) => !excluded.has(unit.id))
      .map((unit) => ({
        label: `${unit.name} (${unit.symbol})`,
        value: unit.id,
      }));
  }, [units, rows, baseUnitId, modalState]);

  const [createConversion, { isLoading: isCreating }] =
    useCreateUnitConversionMutation();
  const [updateConversion, { isLoading: isUpdating }] =
    useUpdateUnitConversionMutation();
  const [deleteConversion] = useDeleteUnitConversionMutation();

  const closeModal = () => setModalState(null);

  const handleSubmit = async (values: UnitConversionSubmitValues) => {
    if (!baseUnitId) return;
    try {
      const payload: UnitConversionFormValues = {
        productId,
        baseUnitId,
        alternativeUnitId: values.alternativeUnitId,
        baseConversionFactor: values.baseConversionFactor,
        alternativeConversionFactor: values.alternativeConversionFactor,
      };
      if (modalState?.mode === 'edit') {
        await updateConversion({
          id: modalState.row.id,
          data: payload,
        }).unwrap();
      } else {
        await createConversion(payload).unwrap();
      }
      notify.success(t('message.saved'));
      closeModal();
    } catch (error) {
      notify.error(parseApiError(error as ApiException));
    }
  };

  const handleConfirmDelete = async () => {
    if (!rowPendingDelete) return;
    try {
      await deleteConversion(rowPendingDelete.id).unwrap();
      notify.success(t('message.deleted'));
      setRowPendingDelete(null);
    } catch (error) {
      notify.error(parseApiError(error as ApiException));
    }
  };

  const columns = useMemo<ColumnDef<IUnitConversion>[]>(
    () => [
      {
        id: 'unit',
        header: t('product.unitConv.otherUnit'),
        cell: ({ row }) => {
          const unit = row.original.alternativeUnitId
            ? unitById.get(row.original.alternativeUnitId)
            : undefined;
          return (
            <span className="text-fg text-sm font-medium">
              {unit?.name ?? row.original.alternativeUnitSymbol}
            </span>
          );
        },
      },
      {
        id: 'conversion',
        header: t('product.unitConv.conversion'),
        cell: ({ row }) => (
          <span className="text-fg-muted text-sm">
            {formatConversionLine(row.original)}
          </span>
        ),
      },
      {
        id: 'actions',
        header: '',
        meta: { pin: 'right' },
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              onClick={() => setModalState({ mode: 'edit', row: row.original })}
              aria-label={t('common.edit')}
              className="text-fg-muted hover:bg-surface-hover hover:text-fg inline-flex size-6 items-center justify-center rounded transition-colors"
            >
              <EditIcon size={13} />
            </button>
            <button
              type="button"
              onClick={() => setRowPendingDelete(row.original)}
              aria-label={t('common.delete')}
              className="text-fg-muted hover:bg-danger/10 hover:text-danger inline-flex size-6 items-center justify-center rounded transition-colors"
            >
              <DeleteIcon size={13} />
            </button>
          </div>
        ),
      },
    ],
    [t, unitById],
  );

  return (
    <div className="wide:max-w-4xl wide:mx-auto flex w-full flex-col gap-4">
      <Card className="flex flex-col gap-3">
        <CardHeader
          icon={<SwapIcon size={15} />}
          title={
            <span className="flex items-center gap-2">
              {t('product.unitConv.title')}
              <Badge variant="neutral">{rows.length}</Badge>
            </span>
          }
          subtitle={
            baseUnit
              ? t('product.unitConv.desc', { unit: baseUnit.name })
              : t('product.unitConv.noBaseUnit')
          }
          action={
            baseUnitId ? (
              <Button
                size="sm"
                icon={<PlusIcon size={15} />}
                onClick={() => setModalState({ mode: 'create' })}
              >
                {t('product.unitConv.add')}
              </Button>
            ) : undefined
          }
        />
      </Card>

      {!baseUnitId ? (
        <Card className="flex flex-col items-center gap-2 py-10 text-center">
          <p className="text-fg-muted text-sm">
            {t('product.unitConv.noBaseUnitHint')}
          </p>
          {onGoToGeneral && (
            <button
              type="button"
              onClick={onGoToGeneral}
              className="text-primary text-sm font-medium hover:underline"
            >
              {t('product.unitConv.goToGeneral')}
            </button>
          )}
        </Card>
      ) : (
        <Card className="flex flex-col gap-3">
          <div className="border-border overflow-hidden rounded-lg border">
            <DataTable
              columns={columns}
              data={rows}
              isLoading={isFetching}
              emptyMessage={t('product.unitConv.empty')}
            />
          </div>
        </Card>
      )}

      <Modal
        isOpen={modalState !== null}
        onClose={closeModal}
        title={
          modalState?.mode === 'edit'
            ? t('product.unitConv.editTitle')
            : t('product.unitConv.createTitle')
        }
      >
        {modalState && baseUnit && (
          <UnitConversionForm
            editingRow={modalState.mode === 'edit' ? modalState.row : null}
            baseUnitSymbol={baseUnit.symbol}
            unitOptions={unitOptionsForModal}
            isSubmitting={isCreating || isUpdating}
            onSubmit={handleSubmit}
            onCancel={closeModal}
          />
        )}
      </Modal>

      <Modal
        isOpen={rowPendingDelete !== null}
        onClose={() => setRowPendingDelete(null)}
        title={t('product.unitConv.deleteTitle')}
      >
        <div className="flex flex-col gap-4">
          <p className="text-fg text-sm">
            {rowPendingDelete &&
              t('product.unitConv.deleteConfirm', {
                conversion: formatConversionLine(rowPendingDelete),
              })}
          </p>
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setRowPendingDelete(null)}
            >
              {t('common.cancel')}
            </Button>
            <Button size="sm" variant="danger" onClick={handleConfirmDelete}>
              {t('common.delete')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
