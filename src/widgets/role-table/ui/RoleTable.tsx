import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import type { ColumnDef } from '@tanstack/react-table';
import type { IRole } from '@entities/role/model/types';
import { useGetRolesQuery } from '@entities/role/api/roleApi';
import { PERMISSION_CATALOG } from '@entities/permission/model/catalog';
import {
  DataTable,
  Pagination,
  SortableHeader,
  TableToolbar,
} from '@shared/ui/Table';
import type { SortDirection } from '@shared/ui/Table';
import { RowActions } from '@shared/ui/Menu';
import { Button } from '@shared/ui/Button';
import { Badge } from '@shared/ui/Badge';
import { EditIcon } from '@shared/ui/icons/EditIcon';
import { DeleteIcon } from '@shared/ui/icons/DeleteIcon';
import { PlusIcon } from '@shared/ui/icons/PlusIcon';
import { useDebouncedValue } from '@shared/lib/hooks/useDebouncedValue';
import { RoleUserCountBadge } from './RoleUserCountBadge';

type RoleTableProps = {
  onCreate: () => void;
  onEdit: (role: IRole) => void;
  onDelete: (role: IRole) => void;
};

export function RoleTable({ onCreate, onEdit, onDelete }: RoleTableProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);

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

  const { data, isFetching, refetch } = useGetRolesQuery({
    page,
    size: pageSize,
    sortField: sortField ?? undefined,
    sortDirection: sortDirection ?? undefined,
    filters: debouncedSearch ? { search: debouncedSearch } : undefined,
  });
  const meta = data?.data;
  const rows = meta?.data ?? [];

  const columns = useMemo<ColumnDef<IRole>[]>(
    () => [
      {
        accessorKey: 'name',
        id: 'name',
        header: () => (
          <SortableHeader
            label={t('role.name')}
            field="name"
            activeField={sortField}
            direction={sortDirection}
            onSort={handleSort}
          />
        ),
        cell: ({ row }) => (
          <span className="text-fg font-medium">{row.original.name}</span>
        ),
      },
      {
        id: 'description',
        header: t('role.description'),
        cell: ({ row }) => (
          <span className="text-fg-muted">
            {row.original.description ?? '—'}
          </span>
        ),
      },
      {
        id: 'permissions',
        header: t('role.permissions'),
        cell: ({ row }) => (
          <Badge
            variant={
              row.original.permissionKeys.length > 0 ? 'success' : 'neutral'
            }
          >
            {row.original.permissionKeys.length}/{PERMISSION_CATALOG.length}
          </Badge>
        ),
      },
      {
        id: 'users',
        header: t('role.users'),
        cell: ({ row }) => <RoleUserCountBadge roleId={row.original.id} />,
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

  return (
    <div className="flex h-full flex-col">
      <TableToolbar
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(0);
        }}
        searchPlaceholder={t('common.search')}
      >
        <Button size="sm" icon={<PlusIcon size={15} />} onClick={onCreate}>
          {t('role.addRole')}
        </Button>
      </TableToolbar>

      <div className="min-h-0 flex-1">
        <DataTable
          columns={columns}
          data={rows}
          isLoading={isFetching}
          emptyMessage={t('common.noData')}
          sortedColumnId={sortField ?? undefined}
          onRowClick={(role) => navigate(`/access/roles/${role.id}`)}
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
