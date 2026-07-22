import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ColumnDef } from '@tanstack/react-table';
import type { CompletenessTopIncompleteItem } from '@entities/nsi-analytics/model/types';
import { useIncompleteProductsList } from '@entities/nsi-analytics/api/useCompleteness';
import { scoreBadgeVariant } from '@entities/nsi-analytics/lib/scoreColor';
import { Card, CardHeader } from '@shared/ui/Card';
import { Badge } from '@shared/ui/Badge';
import { DataTable, Pagination } from '@shared/ui/Table';
import { PackageIcon } from '@shared/ui/icons/PackageIcon';

const PAGE_SIZE = 10;

export function IncompleteProductsTable() {
  const { t } = useTranslation();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const { data, isFetching, refetch } = useIncompleteProductsList(
    page,
    pageSize,
  );

  const columns = useMemo<ColumnDef<CompletenessTopIncompleteItem>[]>(
    () => [
      {
        id: 'article',
        header: t('nsiAnalytics.completenessDetail.list.article'),
        size: 130,
        cell: ({ row }) => row.original.article,
      },
      {
        id: 'name',
        header: t('nsiAnalytics.completenessDetail.list.name'),
        cell: ({ row }) => row.original.name,
      },
      {
        id: 'score',
        header: t('nsiAnalytics.completenessDetail.list.score'),
        size: 90,
        cell: ({ row }) => (
          <Badge variant={scoreBadgeVariant(row.original.score)}>
            {row.original.score}%
          </Badge>
        ),
      },
      {
        id: 'missingFields',
        header: t('nsiAnalytics.completenessDetail.list.missingFields'),
        size: 320,
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1 py-1">
            {(
              row.original.missingFieldLabels ?? row.original.missingFields
            ).map((label, index) => (
              <Badge key={index} variant="neutral">
                {label}
              </Badge>
            ))}
          </div>
        ),
      },
    ],
    [t],
  );

  return (
    <Card className="flex flex-col p-0">
      <CardHeader
        className="p-4 pb-0"
        title={t('nsiAnalytics.completenessDetail.list.title')}
        icon={<PackageIcon size={16} />}
      />

      <div className="min-h-0 flex-1">
        <DataTable
          columns={columns}
          data={data?.data ?? []}
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
    </Card>
  );
}
