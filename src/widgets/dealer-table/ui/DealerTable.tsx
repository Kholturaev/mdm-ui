import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ColumnDef } from '@tanstack/react-table';
import type { IDealer } from '@entities/dealer/model/types';
import { useGetDealersQuery } from '@entities/dealer/api/dealerApi';
import {
  ColumnVisibilityButton,
  DataTable,
  ExportCsvButton,
  Pagination,
  SortableHeader,
  TableToolbar,
} from '@shared/ui/Table';
import type { SortDirection, ToggleableColumn } from '@shared/ui/Table';
import { RowActions } from '@shared/ui/Menu';
import { Button } from '@shared/ui/Button';
import { Badge } from '@shared/ui/Badge';
import { EditIcon } from '@shared/ui/icons/EditIcon';
import { DeleteIcon } from '@shared/ui/icons/DeleteIcon';
import { PlusIcon } from '@shared/ui/icons/PlusIcon';
import { useDebouncedValue } from '@shared/lib/hooks/useDebouncedValue';

type DealerTableProps = {
  onCreate: () => void;
  onEdit: (dealer: IDealer) => void;
  onDelete: (dealer: IDealer) => void;
};

export function DealerTable({ onCreate, onEdit, onDelete }: DealerTableProps) {
  const { t } = useTranslation();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
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

  const toggleableColumns = useMemo<ToggleableColumn[]>(
    () => [
      { id: 'name', label: t('dealer.name') },
      { id: 'dealerCode', label: t('dealer.dealerCode') },
      { id: 'counterAgent', label: t('dealer.counterAgent') },
      { id: 'clientType', label: t('dealer.clientType') },
      { id: 'active', label: t('dealer.active') },
    ],
    [t],
  );
  const [visibleColumnKeys, setVisibleColumnKeys] = useState<string[]>(() =>
    toggleableColumns.map((column) => column.id),
  );

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
        cell: ({ row }) => {
          const isActive = row.original.active === 'ACTIVE';
          return (
            <Badge variant={isActive ? 'success' : 'neutral'} dot>
              {isActive ? t('dealer.active') : t('dealer.inactive')}
            </Badge>
          );
        },
      },
      {
        id: 'actions',
        header: '',
        meta: { pin: 'right' },
        cell: ({ row }) => (
          <RowActions
            items={[
              {
                label: t('common.edit'),
                icon: <EditIcon size={14} />,
                onClick: () => onEdit(row.original),
              },
              {
                label: t('common.delete'),
                icon: <DeleteIcon size={14} />,
                onClick: () => onDelete(row.original),
                danger: true,
              },
            ]}
          />
        ),
      },
    ],
    [t, sortField, sortDirection, onEdit, onDelete, handleSort],
  );

  const visibleColumns = useMemo(
    () =>
      columns.filter(
        (column) =>
          column.id === 'actions' ||
          (column.id ? visibleColumnKeys.includes(column.id) : true),
      ),
    [columns, visibleColumnKeys],
  );

  return (
    <div className="flex h-full flex-col">
      <TableToolbar
        title={t('dealer.title')}
        searchValue={nameFilter}
        onSearchChange={(value) => {
          setNameFilter(value);
          setPage(0);
        }}
        searchPlaceholder={t('common.search')}
      >
        <ColumnVisibilityButton
          columns={toggleableColumns}
          visible={visibleColumnKeys}
          onChange={setVisibleColumnKeys}
        />
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
        <Button size="sm" icon={<PlusIcon size={15} />} onClick={onCreate}>
          {t('dealer.addDealer')}
        </Button>
      </TableToolbar>

      <div className="min-h-0 flex-1">
        <DataTable
          columns={visibleColumns}
          data={rows}
          isLoading={isFetching}
          emptyMessage={t('common.noData')}
          sortedColumnId={sortField ?? undefined}
        />
      </div>

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
