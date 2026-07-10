import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ColumnDef } from '@tanstack/react-table';
import type { IUnit } from '@entities/unit/model/types';
import { useGetUnitsQuery } from '@entities/unit/api/unitApi';
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
import { ClockIcon } from '@shared/ui/icons/ClockIcon';
import { PlusIcon } from '@shared/ui/icons/PlusIcon';
import { useDebouncedValue } from '@shared/lib/hooks/useDebouncedValue';
import { usePermission } from '@shared/lib/hooks/usePermission';
import { Permissions } from '@shared/constants/permissions';

type UnitTableProps = {
  onCreate: () => void;
  onEdit: (unit: IUnit) => void;
  onDelete: (unit: IUnit) => void;
  onShowHistory: (unit: IUnit) => void;
};

export function UnitTable({
  onCreate,
  onEdit,
  onDelete,
  onShowHistory,
}: UnitTableProps) {
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

  const { data, isFetching, refetch } = useGetUnitsQuery({
    page,
    size: pageSize,
    sortField: sortField ?? undefined,
    sortDirection: sortDirection ?? undefined,
    filters: debouncedName ? { name: debouncedName } : undefined,
  });
  const meta = data?.data;
  const rows = meta?.data ?? [];

  const canUpdate = can(Permissions.UNIT.UPDATE);
  const canDelete = can(Permissions.UNIT.DELETE);

  const toggleableColumns = useMemo<ToggleableColumn[]>(
    () => [
      { id: 'name', label: t('unit.name') },
      { id: 'code', label: t('unit.code') },
      { id: 'symbol', label: t('unit.symbol') },
      {
        id: 'internationalAbbreviation',
        label: t('unit.internationalAbbreviation'),
      },
    ],
    [t],
  );
  const [visibleColumnKeys, setVisibleColumnKeys] = useState<string[]>(() =>
    toggleableColumns.map((column) => column.id),
  );

  const columns = useMemo<ColumnDef<IUnit>[]>(() => {
    const base: ColumnDef<IUnit>[] = [
      {
        accessorKey: 'name',
        id: 'name',
        header: () => (
          <SortableHeader
            label={t('unit.name')}
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
            label={t('unit.code')}
            field="code"
            activeField={sortField}
            direction={sortDirection}
            onSort={handleSort}
          />
        ),
      },
      { accessorKey: 'symbol', id: 'symbol', header: t('unit.symbol') },
      {
        accessorKey: 'internationalAbbreviation',
        id: 'internationalAbbreviation',
        header: t('unit.internationalAbbreviation'),
      },
    ];

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
              {
                label: t('common.history'),
                icon: <ClockIcon size={14} />,
                onClick: () => onShowHistory(row.original),
              },
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
    onShowHistory,
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
        title={t('unit.title')}
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
          filename="units"
          rows={rows}
          columns={[
            { label: t('unit.name'), getValue: (r) => r.name },
            { label: t('unit.code'), getValue: (r) => String(r.code) },
            { label: t('unit.symbol'), getValue: (r) => r.symbol },
            {
              label: t('unit.internationalAbbreviation'),
              getValue: (r) => r.internationalAbbreviation,
            },
          ]}
        />
        <PermissionGuard permission={Permissions.UNIT.CREATE}>
          <Button size="sm" icon={<PlusIcon size={15} />} onClick={onCreate}>
            {t('unit.addUnit')}
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
