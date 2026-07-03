import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGetAuditListQuery } from '@entities/audit/api/auditApi';
import type { AuditActionType, AuditEntry } from '@entities/audit/model/types';
import { AUDIT_ACTION_TYPES } from '@entities/audit/lib/actionMeta';
import { useGetUsersQuery } from '@entities/user/api/userApi';
import { DataTable, Pagination, TableToolbar } from '@shared/ui/Table';
import { DatePicker } from '@shared/ui/DatePicker';
import { Select } from '@shared/ui/Select';
import type { SelectOption } from '@shared/ui/Select';
import { useDebouncedValue } from '@shared/lib/hooks/useDebouncedValue';
import { useAuditColumns } from './useAuditColumns';
import { AuditChangesModal } from './AuditChangesModal';

function toIsoStartOfDay(date: Date | null): string | undefined {
  if (!date) return undefined;
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start.toISOString();
}

function toIsoEndOfDay(date: Date | null): string | undefined {
  if (!date) return undefined;
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return end.toISOString();
}

export function AuditLogTable() {
  const { t } = useTranslation();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);
  const [actionType, setActionType] = useState<AuditActionType | null>(null);
  const [performedByUsername, setPerformedByUsername] = useState<string | null>(
    null,
  );
  const [viewingEntry, setViewingEntry] = useState<AuditEntry | null>(null);

  const resetPage = useCallback(() => setPage(0), []);

  const { data: usersData } = useGetUsersQuery({ page: 0, size: 100 });
  const users = useMemo(() => usersData?.data?.data ?? [], [usersData]);

  const personOptions = useMemo<SelectOption[]>(
    () => [
      { label: t('audit.filters.personAll'), value: '' },
      ...users.map((user) => ({
        label: `${user.firstName} ${user.lastName}`,
        value: user.username,
      })),
      { label: t('audit.systemActor'), value: 'system' },
    ],
    [users, t],
  );

  const actionTypeOptions = useMemo<SelectOption[]>(
    () => [
      { label: t('audit.filters.actionTypeAll'), value: '' },
      ...AUDIT_ACTION_TYPES.map((type) => ({
        label: t(`audit.action.${type}`),
        value: type,
      })),
    ],
    [t],
  );

  const { data, isFetching, refetch } = useGetAuditListQuery({
    page,
    size: pageSize,
    search: debouncedSearch || undefined,
    dateFrom: toIsoStartOfDay(dateFrom),
    dateTo: toIsoEndOfDay(dateTo),
    actionType: actionType ?? undefined,
    performedByUsername: performedByUsername ?? undefined,
  });

  const { columns } = useAuditColumns({ onViewChanges: setViewingEntry });

  return (
    <div className="flex h-full flex-col">
      <TableToolbar
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
          resetPage();
        }}
        searchPlaceholder={t('audit.filters.searchPlaceholder')}
      >
        <DatePicker
          selected={dateFrom}
          onChange={(date: Date | null) => {
            setDateFrom(date);
            resetPage();
          }}
          isClearable
          placeholderText={t('audit.filters.dateFrom')}
          wrapperClassName="w-32"
          popperProps={{ strategy: 'fixed' }}
        />
        <DatePicker
          selected={dateTo}
          onChange={(date: Date | null) => {
            setDateTo(date);
            resetPage();
          }}
          isClearable
          placeholderText={t('audit.filters.dateTo')}
          wrapperClassName="w-32"
          popperProps={{ strategy: 'fixed' }}
        />
        <Select
          options={personOptions}
          value={
            personOptions.find(
              (option) => option.value === (performedByUsername ?? ''),
            ) ?? null
          }
          onChange={(option) => {
            setPerformedByUsername(
              option && option.value ? String(option.value) : null,
            );
            resetPage();
          }}
          containerClassName="w-56"
          placeholder={t('audit.filters.person')}
        />
        <Select
          options={actionTypeOptions}
          value={
            actionTypeOptions.find(
              (option) => option.value === (actionType ?? ''),
            ) ?? null
          }
          onChange={(option) => {
            setActionType(
              option && option.value ? (option.value as AuditActionType) : null,
            );
            resetPage();
          }}
          containerClassName="w-52"
          placeholder={t('audit.filters.actionType')}
        />
      </TableToolbar>

      <div className="min-h-0 flex-1">
        <DataTable
          columns={columns}
          data={data?.content ?? []}
          isLoading={isFetching}
          emptyMessage={t('common.noData')}
        />
      </div>

      <Pagination
        page={page}
        totalPages={data?.totalPages ?? 0}
        totalItems={data?.totalElements ?? 0}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(0);
        }}
        onReload={refetch}
      />

      <AuditChangesModal
        entry={viewingEntry}
        onClose={() => setViewingEntry(null)}
      />
    </div>
  );
}
