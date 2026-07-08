import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { IDynamicCharacteristicTable } from '@entities/dynamic-characteristic/model/types';
import {
  useBulkAttachProductDynamicRowsMutation,
  useGetProductDynamicRowsByProductAndTableQuery,
} from '@entities/product-dynamic-row/api/productDynamicRowApi';
import type { ApiException } from '@shared/api/type';
import { parseApiError } from '@shared/api/parseApiError';
import { Badge } from '@shared/ui/Badge';
import { Button } from '@shared/ui/Button';
import { Spinner } from '@shared/ui/Spinner';
import { CheckCircleIcon } from '@shared/ui/icons/CheckCircleIcon';
import { LayersIcon } from '@shared/ui/icons/LayersIcon';
import { notify } from '@shared/lib/toast';
import { DynamicRowPickerModal } from './DynamicRowPickerModal';
import { SelectedRowsPreview } from './SelectedRowsPreview';

export function DynamicTableRow({
  table,
  productId,
}: {
  table: IDynamicCharacteristicTable;
  productId: number;
}) {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [removingRowId, setRemovingRowId] = useState<number | null>(null);

  const { data, isFetching } = useGetProductDynamicRowsByProductAndTableQuery({
    productId,
    tableId: table.tableId,
  });
  const attachedRowIds = useMemo(
    () => (data?.data ?? []).map((item) => item.rowId),
    [data],
  );
  const selectedRows = useMemo(
    () => table.rows.filter((row) => attachedRowIds.includes(row.id)),
    [table.rows, attachedRowIds],
  );

  const [bulkAttach, { isLoading: isSaving }] =
    useBulkAttachProductDynamicRowsMutation();

  const handleSave = async (rowIds: number[]) => {
    try {
      await bulkAttach({ productId, tableId: table.tableId, rowIds }).unwrap();
      notify.success(t('message.saved'));
      setIsModalOpen(false);
    } catch (error) {
      notify.error(parseApiError(error as ApiException));
    }
  };

  /** Lets a row be dropped straight from the inline preview — no need to open the full picker just to deselect one row. */
  const handleRemoveRow = async (rowId: number) => {
    setRemovingRowId(rowId);
    try {
      await bulkAttach({
        productId,
        tableId: table.tableId,
        rowIds: attachedRowIds.filter((id) => id !== rowId),
      }).unwrap();
      notify.success(t('message.saved'));
    } catch (error) {
      notify.error(parseApiError(error as ApiException));
    } finally {
      setRemovingRowId(null);
    }
  };

  return (
    <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-start sm:gap-4">
      <div className="min-w-0 shrink-0 sm:w-52">
        <p className="text-fg text-sm font-medium">{table.tableName}</p>
        <p className="text-fg-muted mt-0.5 flex items-center gap-1 text-xs">
          <LayersIcon size={12} />
          {t('product.char.type.TABLE')}
        </p>
      </div>

      <div className="min-w-0 flex-1">
        {isFetching ? (
          <Spinner className="text-fg-muted size-4" />
        ) : selectedRows.length === 0 ? (
          <p className="text-fg-muted text-sm italic">
            {t('product.char.noRowsSelected')}
          </p>
        ) : (
          <SelectedRowsPreview
            columns={table.columns}
            rows={selectedRows}
            onRemoveRow={handleRemoveRow}
            removingRowId={removingRowId}
          />
        )}
      </div>

      <div className="flex h-9 shrink-0 items-center gap-2">
        {selectedRows.length > 0 && (
          <Badge variant="success">
            <CheckCircleIcon size={12} />
            {t('product.char.filled')}
          </Badge>
        )}
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsModalOpen(true)}
        >
          {t('product.char.manageRows')}
        </Button>
      </div>

      {isModalOpen && (
        <DynamicRowPickerModal
          table={table}
          attachedRowIds={attachedRowIds}
          isSaving={isSaving}
          onSave={handleSave}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
