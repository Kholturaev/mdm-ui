import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ColumnDef } from '@tanstack/react-table';
import type { IAccountingProduct } from '@entities/accounting-product/model/types';
import { useGetAccountingProductsQuery } from '@entities/accounting-product/api/accountingProductApi';
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
import { PermissionGuard } from '@shared/ui/PermissionGuard';
import { EditIcon } from '@shared/ui/icons/EditIcon';
import { DeleteIcon } from '@shared/ui/icons/DeleteIcon';
import { PlusIcon } from '@shared/ui/icons/PlusIcon';
import { useDebouncedValue } from '@shared/lib/hooks/useDebouncedValue';
import { usePermission } from '@shared/lib/hooks/usePermission';
import { Permissions } from '@shared/constants/permissions';

type AccountingProductTableProps = {
  onCreate: () => void;
  onEdit: (accountingProduct: IAccountingProduct) => void;
  onDelete: (accountingProduct: IAccountingProduct) => void;
};

export function AccountingProductTable({
  onCreate,
  onEdit,
  onDelete,
}: AccountingProductTableProps) {
  const { t } = useTranslation();
  const { can } = usePermission();
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

  const { data, isFetching, refetch } = useGetAccountingProductsQuery({
    page,
    size: pageSize,
    sortField: sortField ?? undefined,
    sortDirection: sortDirection ?? undefined,
    filters: debouncedName ? { name: debouncedName } : undefined,
  });
  const meta = data?.data;
  const rows = meta?.data ?? [];

  const canUpdate = can(Permissions.ACCOUNTING_PRODUCT.UPDATE);
  const canDelete = can(Permissions.ACCOUNTING_PRODUCT.DELETE);

  const toggleableColumns = useMemo<ToggleableColumn[]>(
    () => [
      { id: 'name', label: t('accountingProduct.name') },
      { id: 'description', label: t('accountingProduct.description') },
    ],
    [t],
  );
  const [visibleColumnKeys, setVisibleColumnKeys] = useState<string[]>(() =>
    toggleableColumns.map((column) => column.id),
  );

  const columns = useMemo<ColumnDef<IAccountingProduct>[]>(() => {
    const base: ColumnDef<IAccountingProduct>[] = [
      {
        accessorKey: 'name',
        id: 'name',
        header: () => (
          <SortableHeader
            label={t('accountingProduct.name')}
            field="name"
            activeField={sortField}
            direction={sortDirection}
            onSort={handleSort}
          />
        ),
      },
      {
        accessorKey: 'description',
        id: 'description',
        header: t('accountingProduct.description'),
      },
    ];

    if (!canUpdate && !canDelete) return base;

    return [
      ...base,
      {
        id: 'actions',
        header: '',
        meta: { pin: 'right' },
        cell: ({ row }) => (
          <RowActions
            items={[
              ...(canUpdate
                ? [
                    {
                      label: t('common.edit'),
                      icon: <EditIcon size={14} />,
                      onClick: () => onEdit(row.original),
                    },
                  ]
                : []),
              ...(canDelete
                ? [
                    {
                      label: t('common.delete'),
                      icon: <DeleteIcon size={14} />,
                      onClick: () => onDelete(row.original),
                      danger: true,
                    },
                  ]
                : []),
            ]}
          />
        ),
      },
    ];
  }, [
    t,
    sortField,
    sortDirection,
    handleSort,
    onEdit,
    onDelete,
    canUpdate,
    canDelete,
  ]);

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
        title={t('accountingProduct.title')}
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
          filename="accounting-products"
          rows={rows}
          columns={[
            { label: t('accountingProduct.name'), getValue: (r) => r.name },
            {
              label: t('accountingProduct.description'),
              getValue: (r) => r.description ?? '',
            },
          ]}
        />
        <PermissionGuard permission={Permissions.ACCOUNTING_PRODUCT.CREATE}>
          <Button size="sm" icon={<PlusIcon size={15} />} onClick={onCreate}>
            {t('accountingProduct.addAccountingProduct')}
          </Button>
        </PermissionGuard>
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
