import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ColumnDef } from '@tanstack/react-table';
import type { IDealer } from '@entities/dealer/model/types';
import { useGetDealersQuery } from '@entities/dealer/api/dealerApi';
import {
  DataTable,
  ExportCsvButton,
  Pagination,
  SortableHeader,
  TableToolbar,
} from '@shared/ui/Table';
import type { SortDirection } from '@shared/ui/Table';
import { ActionsMenu } from '@shared/ui/Menu';
import { Button } from '@shared/ui/Button';
import { useDebouncedValue } from '@shared/lib/hooks/useDebouncedValue';

type DealerTableProps = {
  onCreate: () => void;
  onEdit: (dealer: IDealer) => void;
  onDelete: (dealer: IDealer) => void;
};

export function DealerTable({ onCreate, onEdit, onDelete }: DealerTableProps) {
  const { t } = useTranslation();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [nameFilter, setNameFilter] = useState('');
  const debouncedName = useDebouncedValue(nameFilter);

  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleSort = useCallback(
    (field: string) => {
      if (sortField !== field) {
        setSortField(field);
        setSortDirection('asc');
        return;
      }
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortField(null);
        setSortDirection(null);
      } else {
        setSortDirection('asc');
      }
    },
    [sortField, sortDirection],
  );

  const { data, isFetching, refetch } = useGetDealersQuery({
    page,
    size: pageSize,
    sortField: sortField ?? undefined,
    sortDirection: sortDirection ?? undefined,
    filters: debouncedName ? { name: debouncedName } : undefined,
  });
  const meta = data?.data;
  const rows = meta?.data ?? [];

  const columns = useMemo<ColumnDef<IDealer>[]>(
    () => [
      {
        accessorKey: 'name',
        id: 'name',
        header: () => (
          <SortableHeader
            label={t('dealer.name')}
            field="name"
            activeField={sortField}
            direction={sortDirection}
            onSort={handleSort}
          />
        ),
      },
      {
        accessorKey: 'dealerCode',
        id: 'dealerCode',
        header: () => (
          <SortableHeader
            label={t('dealer.dealerCode')}
            field="dealerCode"
            activeField={sortField}
            direction={sortDirection}
            onSort={handleSort}
          />
        ),
      },
      {
        id: 'counterAgent',
        header: t('dealer.counterAgent'),
        cell: ({ row }) => row.original.contractor?.firstName ?? '—',
      },
      {
        id: 'clientType',
        header: t('dealer.clientType'),
        cell: ({ row }) => row.original.clientType?.name ?? '—',
      },
      {
        id: 'active',
        header: t('dealer.active'),
        cell: ({ row }) => (row.original.active === 'ACTIVE' ? '✓' : '—'),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className="flex justify-end">
            <ActionsMenu
              items={[
                {
                  label: t('common.edit'),
                  onClick: () => onEdit(row.original),
                },
                {
                  label: t('common.delete'),
                  onClick: () => onDelete(row.original),
                  danger: true,
                },
              ]}
            />
          </div>
        ),
      },
    ],
    [t, sortField, sortDirection, onEdit, onDelete, handleSort],
  );

  return (
    <div className="flex flex-col gap-3">
      <TableToolbar
        searchValue={nameFilter}
        onSearchChange={(value) => {
          setNameFilter(value);
          setPage(0);
        }}
        searchPlaceholder={t('common.search')}
      >
        <ExportCsvButton
          filename="dealers"
          rows={rows}
          columns={[
            { label: t('dealer.name'), getValue: (r) => r.name },
            { label: t('dealer.dealerCode'), getValue: (r) => r.dealerCode },
            {
              label: t('dealer.counterAgent'),
              getValue: (r) => r.contractor?.firstName ?? '',
            },
            {
              label: t('dealer.clientType'),
              getValue: (r) => r.clientType?.name ?? '',
            },
            { label: t('dealer.active'), getValue: (r) => r.active },
          ]}
        />
        <Button onClick={onCreate}>{t('common.create')}</Button>
      </TableToolbar>

      <DataTable
        columns={columns}
        data={rows}
        isLoading={isFetching}
        emptyMessage={t('common.noData')}
        sortedColumnId={sortField ?? undefined}
      />

      <Pagination
        page={page}
        totalPages={meta?.totalPages ?? 0}
        totalItems={meta?.totalElements ?? 0}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(0);
        }}
        onReload={refetch}
      />
    </div>
  );
}
