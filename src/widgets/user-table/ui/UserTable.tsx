import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import type { ColumnDef } from '@tanstack/react-table';
import type { IUser } from '@entities/user/model/types';
import { useGetUsersQuery } from '@entities/user/api/userApi';
import { useGetRolesQuery } from '@entities/role/api/roleApi';
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
import { Avatar } from '@shared/ui/Avatar';
import { EditIcon } from '@shared/ui/icons/EditIcon';
import { DeleteIcon } from '@shared/ui/icons/DeleteIcon';
import { PlusIcon } from '@shared/ui/icons/PlusIcon';
import { formatDateTime } from '@shared/lib/formatDate';
import { useDebouncedValue } from '@shared/lib/hooks/useDebouncedValue';

type UserTableProps = {
  onCreate: () => void;
  onEdit: (user: IUser) => void;
  onDelete: (user: IUser) => void;
};

export function UserTable({ onCreate, onEdit, onDelete }: UserTableProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);

  // Seeded once from the URL — e.g. a role's "N users" link — deep linking
  // only, not kept in sync as the user changes filters afterwards.
  const [roleFilter] = useState<number | null>(() => {
    const roleId = Number(searchParams.get('role'));
    return Number.isInteger(roleId) && roleId > 0 ? roleId : null;
  });

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

  const { data: rolesData } = useGetRolesQuery({ page: 0, size: 100 });
  const roles = useMemo(() => rolesData?.data.data ?? [], [rolesData]);
  const roleNameById = useMemo(
    () => new Map(roles.map((role) => [role.id, role.name])),
    [roles],
  );

  const filters = useMemo(() => {
    const entries: [string, unknown][] = [];
    if (debouncedSearch) entries.push(['search', debouncedSearch]);
    if (roleFilter != null) entries.push(['roleId', roleFilter]);
    return entries.length ? Object.fromEntries(entries) : undefined;
  }, [debouncedSearch, roleFilter]);

  const { data, isFetching, refetch } = useGetUsersQuery({
    page,
    size: pageSize,
    sortField: sortField ?? undefined,
    sortDirection: sortDirection ?? undefined,
    filters,
  });
  const meta = data?.data;
  const rows = meta?.data ?? [];

  const columns = useMemo<ColumnDef<IUser>[]>(
    () => [
      {
        id: 'name',
        accessorFn: (user) => `${user.firstName} ${user.lastName}`,
        header: () => (
          <SortableHeader
            label={t('user.name')}
            field="firstName"
            activeField={sortField}
            direction={sortDirection}
            onSort={handleSort}
          />
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <Avatar name={row.original.firstName} size="sm" />
            <div>
              <div className="text-fg font-medium">
                {row.original.firstName} {row.original.lastName}
              </div>
              <div className="text-fg-muted text-xs">
                {row.original.username}
              </div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'email',
        id: 'email',
        header: t('user.email'),
      },
      {
        id: 'roles',
        header: t('user.roles'),
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.roleIds.length === 0 ? (
              <span className="text-fg-muted">—</span>
            ) : (
              row.original.roleIds.map((roleId) => (
                <Link
                  key={roleId}
                  to={`/access/roles/${roleId}`}
                  onClick={(event) => event.stopPropagation()}
                >
                  <Badge variant="neutral">
                    {roleNameById.get(roleId) ?? roleId}
                  </Badge>
                </Link>
              ))
            )}
          </div>
        ),
      },
      {
        id: 'status',
        header: t('user.status'),
        cell: ({ row }) => (
          <Badge
            variant={row.original.status === 'ACTIVE' ? 'success' : 'neutral'}
            dot
          >
            {row.original.status === 'ACTIVE'
              ? t('user.active')
              : t('user.inactive')}
          </Badge>
        ),
      },
      {
        id: 'lastLoginAt',
        header: t('user.lastLogin'),
        cell: ({ row }) =>
          row.original.lastLoginAt ? (
            formatDateTime(row.original.lastLoginAt)
          ) : (
            <span className="text-fg-muted">{t('user.neverLoggedIn')}</span>
          ),
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
    [t, sortField, sortDirection, roleNameById, onEdit, onDelete, handleSort],
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
          {t('user.addUser')}
        </Button>
      </TableToolbar>

      <div className="min-h-0 flex-1">
        <DataTable
          columns={columns}
          data={rows}
          isLoading={isFetching}
          emptyMessage={t('common.noData')}
          sortedColumnId={sortField ?? undefined}
          onRowClick={(user) => navigate(`/access/users/${user.id}`)}
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
