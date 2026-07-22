import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import type { ColumnDef } from '@tanstack/react-table';
import type { OrphanItem } from '@entities/nsi-analytics/model/types';
import { useGetOrphansListQuery } from '@entities/nsi-analytics/api/orphansApi';
import { Card } from '@shared/ui/Card';
import { DataTable, Pagination } from '@shared/ui/Table';
import { LoadingBar } from '@shared/ui/LoadingBar';
import { formatDateOnly } from '@shared/lib/formatDate';
import { cn } from '@shared/lib/cn';
import { ArrowLeftIcon } from '@shared/ui/icons/ArrowLeftIcon';

const PAGE_SIZE = 20;

export function OrphansDetail() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const { data, isFetching, refetch } = useGetOrphansListQuery({
    page,
    size: pageSize,
  });
  const orphans = data?.data;

  const columns = useMemo<ColumnDef<OrphanItem>[]>(
    () => [
      {
        id: 'article',
        header: t('nsiAnalytics.orphansDetail.article'),
        size: 130,
        cell: ({ row }) => row.original.article ?? '—',
      },
      {
        id: 'name',
        header: t('nsiAnalytics.orphansDetail.name'),
        cell: ({ row }) => row.original.name,
      },
      {
        id: 'createdAt',
        header: t('nsiAnalytics.orphansDetail.createdAt'),
        size: 120,
        cell: ({ row }) => formatDateOnly(row.original.createdAt),
      },
      {
        id: 'daysSinceCreation',
        header: t('nsiAnalytics.orphansDetail.daysSinceCreation'),
        size: 100,
        cell: ({ row }) => (
          <span
            className={cn(
              'tabular-nums',
              row.original.daysSinceCreation > 30 &&
                'text-danger font-semibold',
            )}
          >
            {row.original.daysSinceCreation}
          </span>
        ),
      },
    ],
    [t],
  );

  return (
    <div className="relative flex h-full flex-col overflow-y-auto">
      {isFetching && <LoadingBar />}

      <div className="flex flex-col gap-5 p-6">
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
              {t('nsiAnalytics.orphansDetail.title')}
            </h1>
            <p className="text-fg-muted mt-0.5 text-sm">
              {t('nsiAnalytics.orphansDetail.subtitle')}
            </p>
          </div>
        </div>

        {orphans && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card className="flex flex-col gap-1">
              <span className="text-fg-muted text-xs font-medium tracking-wide uppercase">
                {t('nsiAnalytics.orphans.countLabel')}
              </span>
              <span className="text-danger text-2xl font-semibold tabular-nums">
                {orphans.totalOrphans}
              </span>
            </Card>
            <Card className="flex flex-col gap-1">
              <span className="text-fg-muted text-xs font-medium tracking-wide uppercase">
                {t('nsiAnalytics.orphansDetail.percentLabel')}
              </span>
              <span className="text-fg text-2xl font-semibold tabular-nums">
                {orphans.orphanPercent.toFixed(1)}%
              </span>
            </Card>
          </div>
        )}

        <Card className="flex flex-col p-0">
          <div className="min-h-0 flex-1">
            <DataTable
              columns={columns}
              data={orphans?.items.content ?? []}
              isLoading={isFetching}
              emptyMessage={t('common.noData')}
            />
          </div>
          <Pagination
            page={page}
            totalPages={orphans?.items.totalPages ?? 0}
            totalItems={orphans?.items.totalElements ?? 0}
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
