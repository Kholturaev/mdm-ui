import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ColumnDef } from '@tanstack/react-table';
import type { IIntegrationConfig } from '@entities/external-system/model/types';
import { useGetIntegrationConfigsQuery } from '@entities/external-system/api/externalSystemApi';
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
import { Badge } from '@shared/ui/Badge';
import { EditIcon } from '@shared/ui/icons/EditIcon';
import { DeleteIcon } from '@shared/ui/icons/DeleteIcon';
import { useDebouncedValue } from '@shared/lib/hooks/useDebouncedValue';
import { usePermission } from '@shared/lib/hooks/usePermission';
import { Permissions } from '@shared/constants/permissions';

type IntegrationConfigTableProps = {
  onEdit: (config: IIntegrationConfig) => void;
  onDelete: (config: IIntegrationConfig) => void;
};

export function IntegrationConfigTable({
  onEdit,
  onDelete,
}: IntegrationConfigTableProps) {
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

  const { data, isFetching, refetch } = useGetIntegrationConfigsQuery({
    page,
    size: pageSize,
    sortField: sortField ?? undefined,
    sortDirection: sortDirection ?? undefined,
    filters: debouncedName ? { name: debouncedName } : undefined,
  });
  const meta = data?.data;
  const rows = meta?.data ?? [];

  const canUpdate = can(Permissions.INTEGRATION_CONFIG.UPDATE);
  const canDelete = can(Permissions.INTEGRATION_CONFIG.DELETE);

  const toggleableColumns = useMemo<ToggleableColumn[]>(
    () => [
      { id: 'name', label: t('integrationConfig.name') },
      { id: 'code', label: t('integrationConfig.code') },
      {
        id: 'externalSystemName',
        label: t('integrationConfig.externalSystem'),
      },
      { id: 'format', label: t('integrationConfig.format') },
      { id: 'sectionCount', label: t('integrationConfig.sections') },
    ],
    [t],
  );
  const [visibleColumnKeys, setVisibleColumnKeys] = useState<string[]>(() =>
    toggleableColumns.map((column) => column.id),
  );

  const columns = useMemo<ColumnDef<IIntegrationConfig>[]>(() => {
    const base: ColumnDef<IIntegrationConfig>[] = [
      {
        accessorKey: 'name',
        id: 'name',
        header: () => (
          <SortableHeader
            label={t('integrationConfig.name')}
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
            label={t('integrationConfig.code')}
            field="code"
            activeField={sortField}
            direction={sortDirection}
            onSort={handleSort}
          />
        ),
        cell: ({ row }) => (
          <code className="text-fg-muted text-xs">{row.original.code}</code>
        ),
      },
      {
        accessorKey: 'externalSystemName',
        id: 'externalSystemName',
        header: t('integrationConfig.externalSystem'),
      },
      {
        id: 'format',
        header: t('integrationConfig.format'),
        cell: ({ row }) => (
          <Badge variant="neutral">{row.original.format}</Badge>
        ),
      },
      {
        id: 'sectionCount',
        header: t('integrationConfig.sections'),
        cell: ({ row }) => row.original.sections?.length ?? 0,
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
        title={t('integrationConfig.title')}
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
          filename="integration-configs"
          rows={rows}
          columns={[
            { label: t('integrationConfig.name'), getValue: (r) => r.name },
            { label: t('integrationConfig.code'), getValue: (r) => r.code },
            {
              label: t('integrationConfig.externalSystem'),
              getValue: (r) => r.externalSystemName,
            },
            { label: t('integrationConfig.format'), getValue: (r) => r.format },
            {
              label: t('integrationConfig.sections'),
              getValue: (r) => String(r.sections?.length ?? 0),
            },
          ]}
        />
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
