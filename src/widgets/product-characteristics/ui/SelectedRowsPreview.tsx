import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type {
  IDynamicCharacteristicColumn,
  IDynamicCharacteristicRow,
} from '@entities/dynamic-characteristic/model/types';
import { formatDynamicValue } from '@entities/dynamic-characteristic/model/types';
import { Button } from '@shared/ui/Button';
import { Modal } from '@shared/ui/Modal';
import { Spinner } from '@shared/ui/Spinner';
import { ChevronDownIcon, CloseIcon } from '@shared/ui/icons/ChevronDownIcon';
import { cn } from '@shared/lib/cn';

/** Rows beyond this count collapse behind a "show N more" toggle so a table with 20 selected rows doesn't blow out every group card by default. */
const COLLAPSE_THRESHOLD = 4;
/** Inline preview stays compact — the modal is still the place to see every column. */
const MAX_PREVIEW_COLUMNS = 3;

export function SelectedRowsPreview({
  columns,
  rows,
  onRemoveRow,
  removingRowId,
}: {
  columns: IDynamicCharacteristicColumn[];
  rows: IDynamicCharacteristicRow[];
  onRemoveRow: (rowId: number) => void;
  removingRowId: number | null;
}) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [rowPendingRemoval, setRowPendingRemoval] =
    useState<IDynamicCharacteristicRow | null>(null);

  const previewColumns = useMemo(
    () =>
      [...columns]
        .sort((a, b) => a.position - b.position)
        .slice(0, MAX_PREVIEW_COLUMNS),
    [columns],
  );

  const canCollapse = rows.length > COLLAPSE_THRESHOLD;
  const visibleRows =
    canCollapse && !isExpanded ? rows.slice(0, COLLAPSE_THRESHOLD) : rows;

  const primaryColumn = previewColumns[0];
  const pendingRowLabel = rowPendingRemoval
    ? (primaryColumn &&
        formatDynamicValue(
          rowPendingRemoval,
          primaryColumn,
          t('common.yes'),
          t('common.no'),
        )) ||
      `#${rowPendingRemoval.id}`
    : '';

  const handleConfirmRemove = () => {
    if (!rowPendingRemoval) return;
    onRemoveRow(rowPendingRemoval.id);
    setRowPendingRemoval(null);
  };

  return (
    <div className="flex flex-col gap-1.5">
      {canCollapse && (
        <p className="text-fg-muted text-xs">
          {t('product.char.rowsSelected', { count: rows.length })}
        </p>
      )}

      <div className="border-border overflow-hidden rounded-md border">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-surface-hover">
              {previewColumns.map((column) => (
                <th
                  key={column.id}
                  className="text-fg-muted truncate px-2 py-1 font-medium"
                >
                  {column.name}
                </th>
              ))}
              <th className="w-6" />
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => (
              <tr key={row.id} className="border-border border-t">
                {previewColumns.map((column) => (
                  <td key={column.id} className="text-fg truncate px-2 py-1.5">
                    {formatDynamicValue(
                      row,
                      column,
                      t('common.yes'),
                      t('common.no'),
                    ) ?? '—'}
                  </td>
                ))}
                <td className="px-1 py-1.5 text-right">
                  <button
                    type="button"
                    onClick={() => setRowPendingRemoval(row)}
                    disabled={removingRowId === row.id}
                    aria-label={t('common.delete')}
                    className="text-fg-muted hover:bg-danger/10 hover:text-danger inline-flex size-5 items-center justify-center rounded disabled:opacity-50"
                  >
                    {removingRowId === row.id ? (
                      <Spinner className="size-3" />
                    ) : (
                      <CloseIcon size={11} />
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {canCollapse && (
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="text-primary inline-flex w-fit items-center gap-1 text-xs font-medium hover:underline"
        >
          <ChevronDownIcon
            size={12}
            className={cn('transition-transform', isExpanded && 'rotate-180')}
          />
          {isExpanded
            ? t('product.char.showLessRows')
            : t('product.char.showMoreRows', {
                count: rows.length - COLLAPSE_THRESHOLD,
              })}
        </button>
      )}

      <Modal
        isOpen={rowPendingRemoval !== null}
        onClose={() => setRowPendingRemoval(null)}
        title={t('product.char.removeRowTitle')}
      >
        <div className="flex flex-col gap-4">
          <p className="text-fg text-sm">
            {t('product.char.removeRowConfirm', { value: pendingRowLabel })}
          </p>
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setRowPendingRemoval(null)}
            >
              {t('common.cancel')}
            </Button>
            <Button size="sm" variant="danger" onClick={handleConfirmRemove}>
              {t('product.char.removeRowConfirmButton')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
