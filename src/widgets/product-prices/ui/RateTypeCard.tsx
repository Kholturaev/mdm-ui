import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { ColumnDef } from '@tanstack/react-table';
import type {
  IProductRate,
  ProductRateType,
} from '@entities/product-rate/model/types';
import { Badge } from '@shared/ui/Badge';
import { Button } from '@shared/ui/Button';
import { Card, CardHeader } from '@shared/ui/Card';
import { Modal } from '@shared/ui/Modal';
import { DataTable } from '@shared/ui/Table';
import { PlusIcon } from '@shared/ui/icons/PlusIcon';
import { EditIcon } from '@shared/ui/icons/EditIcon';
import { DeleteIcon } from '@shared/ui/icons/DeleteIcon';
import { InboxIcon } from '@shared/ui/icons/InboxIcon';
import { formatDateOnly } from '@shared/lib/formatDate';
import { formatPrice } from '@shared/lib/formatPrice';

const COPY: Record<
  ProductRateType,
  { title: string; subtitle: string; empty: string }
> = {
  PURCHASE: {
    title: 'product.price.purchase',
    subtitle: 'product.price.purchaseSubtitle',
    empty: 'product.price.noPurchasePrice',
  },
  SALES: {
    title: 'product.price.sales',
    subtitle: 'product.price.salesSubtitle',
    empty: 'product.price.noSalesPrice',
  },
};

export function RateTypeCard({
  type,
  icon,
  rows,
  onAdd,
  onEdit,
  onDelete,
}: {
  type: ProductRateType;
  icon: ReactNode;
  /** Every row of this type for the selected client type, newest first — the first one is flagged "current". */
  rows: IProductRate[];
  onAdd: () => void;
  onEdit: (rate: IProductRate) => void;
  onDelete: (rate: IProductRate) => void;
}) {
  const { t } = useTranslation();
  const copy = COPY[type];
  const amountField = type === 'SALES' ? 'rate' : 'cost';
  const [ratePendingDelete, setRatePendingDelete] =
    useState<IProductRate | null>(null);

  const columns = useMemo<ColumnDef<IProductRate>[]>(
    () => [
      {
        id: 'amount',
        header: t('product.price.amount'),
        cell: ({ row }) => (
          <span className="inline-flex items-center gap-1.5">
            <span className="text-fg text-sm font-semibold">
              {formatPrice(row.original[amountField])}
            </span>
            <span className="text-fg-muted text-xs">
              {row.original.currency?.symbol ?? ''}
            </span>
            {row.index === 0 && (
              <span className="text-success text-xs font-medium">
                {t('product.price.current')}
              </span>
            )}
          </span>
        ),
      },
      {
        id: 'unit',
        header: t('product.price.unit'),
        cell: ({ row }) =>
          row.original.unit?.name ?? row.original.unit?.symbol ?? '—',
      },
      {
        id: 'date',
        header: t('product.price.effectiveDate'),
        cell: ({ row }) => (
          <span className="text-fg text-xs font-medium">
            {formatDateOnly(row.original.date)}
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
              onClick={() => onEdit(row.original)}
              aria-label={t('common.edit')}
              className="text-fg-muted hover:bg-surface-hover hover:text-fg inline-flex size-6 items-center justify-center rounded transition-colors"
            >
              <EditIcon size={13} />
            </button>
            <button
              type="button"
              onClick={() => setRatePendingDelete(row.original)}
              aria-label={t('common.delete')}
              className="text-fg-muted hover:bg-danger/10 hover:text-danger inline-flex size-6 items-center justify-center rounded transition-colors"
            >
              <DeleteIcon size={13} />
            </button>
          </div>
        ),
      },
    ],
    [t, amountField, onEdit],
  );

  const pendingAmount = ratePendingDelete
    ? formatPrice(ratePendingDelete[amountField])
    : '';
  const pendingCurrency = ratePendingDelete?.currency?.symbol ?? '';

  const handleConfirmDelete = () => {
    if (!ratePendingDelete) return;
    onDelete(ratePendingDelete);
    setRatePendingDelete(null);
  };

  return (
    <Card className="flex flex-col gap-3 p-0">
      <CardHeader
        className="px-4 pt-4"
        icon={icon}
        title={
          <span className="flex items-center gap-2">
            {t(copy.title)}
            <Badge variant="neutral">{rows.length}</Badge>
          </span>
        }
        subtitle={t(copy.subtitle)}
        action={
          <button
            type="button"
            onClick={onAdd}
            aria-label={t('product.price.addPrice')}
            className="border-border text-fg-muted hover:bg-surface-hover hover:text-fg flex size-8 items-center justify-center rounded-lg border transition-colors"
          >
            <PlusIcon size={14} />
          </button>
        }
      />

      {rows.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-4 pb-6 text-center">
          <InboxIcon size={28} />
          <p className="text-fg-muted text-sm">{t(copy.empty)}</p>
          <button
            type="button"
            onClick={onAdd}
            className="text-primary text-sm font-medium hover:underline"
          >
            + {t('product.price.addPrice')}
          </button>
        </div>
      ) : (
        <div className="border-border overflow-hidden border-t">
          <DataTable columns={columns} data={rows} />
        </div>
      )}

      <Modal
        isOpen={ratePendingDelete !== null}
        onClose={() => setRatePendingDelete(null)}
        title={t('product.price.deleteTitle')}
      >
        <div className="flex flex-col gap-4">
          <p className="text-fg text-sm">
            {t('product.price.deleteConfirm', {
              amount: pendingAmount,
              currency: pendingCurrency,
            })}
          </p>
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setRatePendingDelete(null)}
            >
              {t('common.cancel')}
            </Button>
            <Button size="sm" variant="danger" onClick={handleConfirmDelete}>
              {t('common.delete')}
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
}
