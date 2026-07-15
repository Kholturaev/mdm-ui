import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ColumnDef } from '@tanstack/react-table';
import type { IExternalSystem } from '@entities/external-system/model/types';
import { useGetExternalSystemsQuery } from '@entities/external-system/api/externalSystemApi';
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

type ExternalSystemTableProps = {
  onCreate: () => void;
  onEdit: (system: IExternalSystem) => void;
  onDelete: (system: IExternalSystem) => void;
  onOpenConfig: (system: IExternalSystem) => void;
};

export function ExternalSystemTable({
  onCreate,
  onEdit,
  onDelete,
  onOpenConfig,
}: ExternalSystemTableProps) {
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

  const { data, isFetching, refetch } = useGetExternalSystemsQuery({
    page,
    size: pageSize,
    sortField: sortField ?? undefined,
    sortDirection: sortDirection ?? undefined,
    filters: debouncedName ? { name: debouncedName } : undefined,
  });
  const meta = data?.data;
  const rows = meta?.data ?? [];

  const canUpdate = can(Permissions.EXTERNAL_SYSTEM.UPDATE);
  const canDelete = can(Permissions.EXTERNAL_SYSTEM.DELETE);

  const toggleableColumns = useMemo<ToggleableColumn[]>(
    () => [
      { id: 'name', label: t('externalSystem.name') },
      { id: 'description', label: t('externalSystem.description') },
      { id: 'url', label: t('externalSystem.url') },
    ],
    [t],
  );
  const [visibleColumnKeys, setVisibleColumnKeys] = useState<string[]>(() =>
    toggleableColumns.map((column) => column.id),
  );

  const columns = useMemo<ColumnDef<IExternalSystem>[]>(() => {
    const base: ColumnDef<IExternalSystem>[] = [
      {
        accessorKey: 'name',
        id: 'name',
        header: () => (
          <SortableHeader
            label={t('externalSystem.name')}
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
        header: t('externalSystem.description'),
        cell: ({ row }) => row.original.description ?? '—',
      },
      {
        accessorKey: 'url',
        id: 'url',
        header: t('externalSystem.url'),
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
        title={t('externalSystem.title')}
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
          filename="external-systems"
          rows={rows}
          columns={[
            { label: t('externalSystem.name'), getValue: (r) => r.name },
            {
              label: t('externalSystem.description'),
              getValue: (r) => r.description ?? '',
            },
            { label: t('externalSystem.url'), getValue: (r) => r.url },
          ]}
        />
        <PermissionGuard permission={Permissions.EXTERNAL_SYSTEM.CREATE}>
          <Button size="sm" icon={<PlusIcon size={15} />} onClick={onCreate}>
            {t('externalSystem.addExternalSystem')}
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
          onRowClick={onOpenConfig}
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
