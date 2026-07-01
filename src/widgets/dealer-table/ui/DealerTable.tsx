import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ColumnDef } from '@tanstack/react-table';
import type { Dealer } from '@entities/dealer/model/types';
import { useGetDealersQuery } from '@entities/dealer/api/dealerApi';
import { DataTable, Pagination } from '@shared/ui/Table';
import { Button } from '@shared/ui/Button';
import { Input } from '@shared/ui/Input';
import { useDebouncedValue } from '@shared/lib/hooks/useDebouncedValue';

type DealerTableProps = {
  onEdit: (dealer: Dealer) => void;
  onDelete: (dealer: Dealer) => void;
};

const PAGE_SIZE = 10;

export function DealerTable({ onEdit, onDelete }: DealerTableProps) {
  const { t } = useTranslation();
  const [page, setPage] = useState(0);
  const [nameFilter, setNameFilter] = useState('');
  const debouncedName = useDebouncedValue(nameFilter);

  const { data, isFetching } = useGetDealersQuery({
    page,
    size: PAGE_SIZE,
    filters: debouncedName ? { name: debouncedName } : undefined,
  });
  const meta = data?.data;

  const columns = useMemo<ColumnDef<Dealer>[]>(
    () => [
      { accessorKey: 'name', header: t('dealer.name') },
      { accessorKey: 'dealerCode', header: t('dealer.dealerCode') },
      { accessorKey: 'contactPhone', header: t('dealer.contactPhone') },
      {
        id: 'active',
        header: t('dealer.active'),
        cell: ({ row }) => (row.original.active ? '✓' : '—'),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(row.original)}
            >
              {t('common.edit')}
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => onDelete(row.original)}
            >
              {t('common.delete')}
            </Button>
          </div>
        ),
      },
    ],
    [t, onEdit, onDelete],
  );

  return (
    <div className="flex flex-col gap-3">
      <Input
        value={nameFilter}
        onChange={(e) => {
          setNameFilter(e.target.value);
          setPage(0);
        }}
        placeholder={t('common.search')}
        containerClassName="max-w-xs"
      />
      <DataTable
        columns={columns}
        data={meta?.data ?? []}
        isLoading={isFetching}
        emptyMessage={t('common.noData')}
      />
      <Pagination
        page={page}
        totalPages={meta?.totalPages ?? 0}
        onPageChange={setPage}
      />
    </div>
  );
}
