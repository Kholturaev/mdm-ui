import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import type { ColumnDef } from '@tanstack/react-table';
import type { IUser } from '@entities/user/model/types';
import { useGetUsersQuery } from '@entities/user/api/userApi';
import {
  DataTable,
  Pagination,
  SortableHeader,
  TableToolbar,
} from '@shared/ui/Table';
import type { SortDirection } from '@shared/ui/Table';
import { RowActions } from '@shared/ui/Menu';
import { Button } from '@shared/ui/Button';
import { Avatar } from '@shared/ui/Avatar';
import { ContactLink } from '@shared/ui/ContactLink';
import { EditIcon } from '@shared/ui/icons/EditIcon';
import { DeleteIcon } from '@shared/ui/icons/DeleteIcon';
import { PlusIcon } from '@shared/ui/icons/PlusIcon';
import { MailIcon } from '@shared/ui/icons/MailIcon';
import { PhoneIcon } from '@shared/ui/icons/PhoneIcon';
import { TelegramIcon } from '@shared/ui/icons/TelegramIcon';
import { useDebouncedValue } from '@shared/lib/hooks/useDebouncedValue';

type UserTableProps = {
  onCreate: () => void;
  onEdit: (user: IUser) => void;
  onDelete: (user: IUser) => void;
};

export function UserTable({ onCreate, onEdit, onDelete }: UserTableProps) {
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

  const filters = useMemo(
    () => (debouncedSearch ? { search: debouncedSearch } : undefined),
    [debouncedSearch],
  );

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
        cell: ({ row }) =>
          row.original.email ? (
            <ContactLink
              href={`mailto:${row.original.email}`}
              icon={<MailIcon size={13} />}
            >
              {row.original.email}
            </ContactLink>
          ) : (
            <span className="text-fg-muted">—</span>
          ),
      },
      {
        accessorKey: 'phone',
        id: 'phone',
        header: t('user.phone'),
        cell: ({ row }) =>
          row.original.phone ? (
            <ContactLink
              href={`tel:${row.original.phone.replace(/\s+/g, '')}`}
              icon={<PhoneIcon size={13} />}
            >
              {row.original.phone}
            </ContactLink>
          ) : (
            <span className="text-fg-muted">—</span>
          ),
      },
      {
        accessorKey: 'telegramNickName',
        id: 'telegramNickName',
        header: t('user.telegram'),
        cell: ({ row }) =>
          row.original.telegramNickName ? (
            <ContactLink
              href={`https://t.me/${row.original.telegramNickName.replace(/^@/, '')}`}
              icon={<TelegramIcon size={13} />}
            >
              {row.original.telegramNickName}
            </ContactLink>
          ) : (
            <span className="text-fg-muted">—</span>
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
    [t, sortField, sortDirection, onEdit, onDelete, handleSort],
  );

  return (
    <div className="flex h-full flex-col">
      <TableToolbar
        title={t('user.title')}
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
