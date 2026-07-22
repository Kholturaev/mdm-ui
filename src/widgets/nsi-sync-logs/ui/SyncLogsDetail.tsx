import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { ColumnDef } from '@tanstack/react-table';
import type { BadgeVariant } from '@shared/ui/Badge';
import {
  SECTION_TYPES,
  SYNC_LOG_STATUSES,
  type SectionType,
  type SyncLogEntry,
  type SyncLogStatus,
} from '@entities/monitoring/model/types';
import { useGetSyncLogsQuery } from '@entities/monitoring/api/monitoringApi';
import { useExternalSystemOptions } from '@entities/external-system/lib/useExternalSystemOptions';
import { Card } from '@shared/ui/Card';
import { Badge } from '@shared/ui/Badge';
import { DataTable, Pagination, TableToolbar } from '@shared/ui/Table';
import { Select } from '@shared/ui/Select';
import type { SelectOption } from '@shared/ui/Select';
import { LoadingBar } from '@shared/ui/LoadingBar';
import { formatDateTime } from '@shared/lib/formatDate';
import { ArrowLeftIcon } from '@shared/ui/icons/ArrowLeftIcon';

const PAGE_SIZE = 20;

const STATUS_BADGE_VARIANT: Record<SyncLogStatus, BadgeVariant> = {
  NOTIFIED: 'neutral',
  FETCHED: 'neutral',
  ACKNOWLEDGED: 'success',
  FAILED: 'warning',
  DEAD: 'danger',
};

function parseSyncLogStatus(raw: string | null): SyncLogStatus | null {
  return raw && (SYNC_LOG_STATUSES as readonly string[]).includes(raw)
    ? (raw as SyncLogStatus)
    : null;
}

export function SyncLogsDetail() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  // Seeded once from the deep-link (e.g. the hub's "N problems" link) — not
  // kept in sync with subsequent filter changes, matching akfa's own
  // InboundMonitorPage/SyncLogsPage convention.
  const [externalSystemId, setExternalSystemId] = useState<number | null>(
    () => {
      const raw = searchParams.get('externalSystemId');
      return raw ? Number(raw) : null;
    },
  );
  const [syncStatus, setSyncStatus] = useState<SyncLogStatus | null>(() =>
    parseSyncLogStatus(searchParams.get('syncStatus')),
  );
  const [sectionType, setSectionType] = useState<SectionType | null>(null);

  const { options: systemOptions } = useExternalSystemOptions();

  const { data, isFetching, refetch } = useGetSyncLogsQuery({
    externalSystemId: externalSystemId ?? undefined,
    syncStatus: syncStatus ?? undefined,
    sectionType: sectionType ?? undefined,
    page,
    size: pageSize,
  });
  const logs = data?.data;

  const resetPage = () => setPage(0);

  const statusOptions: SelectOption[] = useMemo(
    () =>
      SYNC_LOG_STATUSES.map((status) => ({
        label: t(`nsiAnalytics.syncLogsDetail.status.${status}`),
        value: status,
      })),
    [t],
  );

  const sectionOptions: SelectOption[] = useMemo(
    () =>
      SECTION_TYPES.map((section) => ({
        label: t(`nsiAnalytics.syncLogsDetail.section.${section}`),
        value: section,
      })),
    [t],
  );

  const columns = useMemo<ColumnDef<SyncLogEntry>[]>(
    () => [
      {
        id: 'system',
        header: t('nsiAnalytics.syncLogsDetail.columns.system'),
        size: 130,
        cell: ({ row }) =>
          systemOptions.find(
            (option) => option.value === row.original.externalSystemId,
          )?.label ?? row.original.externalSystemId,
      },
      {
        id: 'sectionType',
        header: t('nsiAnalytics.syncLogsDetail.columns.section'),
        size: 110,
        cell: ({ row }) =>
          t(`nsiAnalytics.syncLogsDetail.section.${row.original.sectionType}`),
      },
      {
        id: 'externalEntityId',
        header: t('nsiAnalytics.syncLogsDetail.columns.externalEntityId'),
        size: 140,
        cell: ({ row }) => row.original.externalEntityId ?? '—',
      },
      {
        id: 'syncStatus',
        header: t('nsiAnalytics.syncLogsDetail.columns.status'),
        size: 120,
        cell: ({ row }) => (
          <Badge variant={STATUS_BADGE_VARIANT[row.original.syncStatus]}>
            {t(`nsiAnalytics.syncLogsDetail.status.${row.original.syncStatus}`)}
          </Badge>
        ),
      },
      {
        id: 'errorMessage',
        header: t('nsiAnalytics.syncLogsDetail.columns.errorMessage'),
        size: 280,
        cell: ({ row }) =>
          row.original.errorMessage ? (
            <span className="block truncate" title={row.original.errorMessage}>
              {row.original.errorMessage}
            </span>
          ) : (
            '—'
          ),
      },
      {
        id: 'retryCount',
        header: t('nsiAnalytics.syncLogsDetail.columns.retryCount'),
        size: 90,
        cell: ({ row }) => row.original.retryCount,
      },
      {
        id: 'createdAt',
        header: t('nsiAnalytics.syncLogsDetail.columns.createdAt'),
        size: 150,
        cell: ({ row }) => formatDateTime(row.original.createdAt),
      },
    ],
    [t, systemOptions],
  );

  return (
    <div className="relative flex h-full flex-col overflow-y-auto">
      {isFetching && <LoadingBar />}

      <div className="flex h-full flex-col gap-5 p-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/nsi-analytics')}
            aria-label={t('nsiAnalytics.backToHub')}
            className="border-border bg-surface text-fg-muted hover:bg-surface-hover hover:text-fg flex size-8 shrink-0 items-center justify-center rounded-lg border transition-colors"
          >
            <ArrowLeftIcon size={16} />
          </button>
          <div>
            <h1 className="text-fg text-xl font-semibold">
              {t('nsiAnalytics.syncLogsDetail.title')}
            </h1>
            <p className="text-fg-muted mt-0.5 text-sm">
              {t('nsiAnalytics.syncLogsDetail.subtitle')}
            </p>
          </div>
        </div>

        <Card className="flex min-h-0 flex-1 flex-col p-0">
          <TableToolbar title={t('nsiAnalytics.syncLogsDetail.tableTitle')}>
            <div className="w-48">
              <Select
                options={systemOptions}
                value={
                  systemOptions.find(
                    (option) => option.value === externalSystemId,
                  ) ?? null
                }
                onChange={(option) => {
                  setExternalSystemId(option ? Number(option.value) : null);
                  resetPage();
                }}
                placeholder={t('nsiAnalytics.syncLogsDetail.systemFilter')}
                isClearable
                containerClassName="z-50"
              />
            </div>
            <div className="w-44">
              <Select
                options={statusOptions}
                value={
                  statusOptions.find((option) => option.value === syncStatus) ??
                  null
                }
                onChange={(option) => {
                  setSyncStatus(
                    option ? (option.value as SyncLogStatus) : null,
                  );
                  resetPage();
                }}
                placeholder={t('nsiAnalytics.syncLogsDetail.allStatuses')}
                isClearable
                containerClassName="z-50"
              />
            </div>
            <div className="w-44">
              <Select
                options={sectionOptions}
                value={
                  sectionOptions.find(
                    (option) => option.value === sectionType,
                  ) ?? null
                }
                onChange={(option) => {
                  setSectionType(option ? (option.value as SectionType) : null);
                  resetPage();
                }}
                placeholder={t('nsiAnalytics.syncLogsDetail.allSections')}
                isClearable
                containerClassName="z-50"
              />
            </div>
          </TableToolbar>

          <div className="min-h-0 flex-1">
            <DataTable
              columns={columns}
              data={logs?.content ?? []}
              isLoading={isFetching}
              emptyMessage={t('common.noData')}
            />
          </div>

          <Pagination
            page={page}
            totalPages={logs?.totalPages ?? 0}
            totalItems={logs?.totalElements ?? 0}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(0);
            }}
            onReload={refetch}
          />
        </Card>
      </div>
    </div>
  );
}
