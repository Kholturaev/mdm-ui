import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ColumnDef } from '@tanstack/react-table';
import type { IProductGroup } from '@entities/product-group/model/types';
import { useGetProductGroupsQuery } from '@entities/product-group/api/productGroupApi';
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

type ProductGroupTableProps = {
  onCreate: () => void;
  onEdit: (productGroup: IProductGroup) => void;
  onDelete: (productGroup: IProductGroup) => void;
};

export function ProductGroupTable({
  onCreate,
  onEdit,
  onDelete,
}: ProductGroupTableProps) {
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

  const { data, isFetching, refetch } = useGetProductGroupsQuery({
    page,
    size: pageSize,
    sortField: sortField ?? undefined,
    sortDirection: sortDirection ?? undefined,
    filters: debouncedName ? { name: debouncedName } : undefined,
  });
  const meta = data?.data;
  const rows = meta?.data ?? [];

  const canUpdate = can(Permissions.PRODUCT_GROUP.UPDATE);
  const canDelete = can(Permissions.PRODUCT_GROUP.DELETE);

  const toggleableColumns = useMemo<ToggleableColumn[]>(
    () => [
      { id: 'name', label: t('productGroup.name') },
      { id: 'code', label: t('productGroup.code') },
      { id: 'description', label: t('productGroup.description') },
    ],
    [t],
  );
  const [visibleColumnKeys, setVisibleColumnKeys] = useState<string[]>(() =>
    toggleableColumns.map((column) => column.id),
  );

  const columns = useMemo<ColumnDef<IProductGroup>[]>(() => {
    const base: ColumnDef<IProductGroup>[] = [
      {
        accessorKey: 'name',
        id: 'name',
        header: () => (
          <SortableHeader
            label={t('productGroup.name')}
            field="name"
            activeField={sortField}
            direction={sortDirection}
            onSort={handleSort}
          />
        ),
      },
      {
        accessorKey: 'code',
        id: 'code',
        header: () => (
          <SortableHeader
            label={t('productGroup.code')}
            field="code"
            activeField={sortField}
            direction={sortDirection}
            onSort={handleSort}
          />
        ),
      },
      {
        accessorKey: 'description',
        id: 'description',
        header: t('productGroup.description'),
        cell: ({ row }) => row.original.description || '—',
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
        title={t('productGroup.title')}
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
          filename="product-groups"
          rows={rows}
          columns={[
            { label: t('productGroup.name'), getValue: (r) => r.name },
            { label: t('productGroup.code'), getValue: (r) => r.code },
            {
              label: t('productGroup.description'),
              getValue: (r) => r.description ?? '',
            },
          ]}
        />
        <PermissionGuard permission={Permissions.PRODUCT_GROUP.CREATE}>
          <Button size="sm" icon={<PlusIcon size={15} />} onClick={onCreate}>
            {t('productGroup.addProductGroup')}
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
