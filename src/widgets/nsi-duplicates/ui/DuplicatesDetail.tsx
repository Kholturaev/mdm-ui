import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import type { DuplicateGroup } from '@entities/nsi-analytics/model/types';
import { useGetDuplicatesListQuery } from '@entities/nsi-analytics/api/duplicatesApi';
import { Card } from '@shared/ui/Card';
import { Badge } from '@shared/ui/Badge';
import { Pagination } from '@shared/ui/Table';
import { LoadingBar } from '@shared/ui/LoadingBar';
import { formatDateOnly } from '@shared/lib/formatDate';
import { ArrowLeftIcon } from '@shared/ui/icons/ArrowLeftIcon';
import { ChevronDownIcon } from '@shared/ui/icons/ChevronDownIcon';
import { InfoIcon } from '@shared/ui/icons/InfoIcon';

const PAGE_SIZE = 10;

function DuplicateGroupCard({ group }: { group: DuplicateGroup }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="flex items-center gap-2 text-left"
      >
        <ChevronDownIcon size={14} className={expanded ? '' : '-rotate-90'} />
        <Badge variant={group.matchType === 'ARTICLE' ? 'warning' : 'neutral'}>
          {t(`nsiAnalytics.duplicatesDetail.matchType.${group.matchType}`)}
        </Badge>
        <span className="text-fg-muted text-xs">
          {t('nsiAnalytics.duplicatesDetail.itemCount', {
            count: group.items.length,
          })}
        </span>
      </button>

      {expanded && (
        <div className="border-border overflow-hidden rounded-md border">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-hover">
              <tr>
                <th className="px-3 py-1.5 font-semibold">
                  {t('nsiAnalytics.duplicatesDetail.article')}
                </th>
                <th className="px-3 py-1.5 font-semibold">
                  {t('nsiAnalytics.duplicatesDetail.name')}
                </th>
                <th className="px-3 py-1.5 font-semibold">
                  {t('nsiAnalytics.duplicatesDetail.createdAt')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {group.items.map((item) => (
                <tr key={item.productId}>
                  <td className="px-3 py-1.5">{item.article || '—'}</td>
                  <td
                    className="max-w-64 truncate px-3 py-1.5"
                    title={item.name}
                  >
                    {item.name}
                  </td>
                  <td className="px-3 py-1.5">
                    {formatDateOnly(item.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

export function DuplicatesDetail() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const { data, isFetching, refetch } = useGetDuplicatesListQuery({
    page,
    size: pageSize,
  });
  const duplicates = data?.data;

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
              {t('nsiAnalytics.duplicatesDetail.title')}
            </h1>
            <p className="text-fg-muted mt-0.5 text-sm">
              {t('nsiAnalytics.duplicatesDetail.subtitle')}
            </p>
          </div>
        </div>

        {duplicates && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card className="flex flex-col gap-1">
              <span className="text-fg-muted text-xs font-medium tracking-wide uppercase">
                {t('nsiAnalytics.duplicates.groupsLabel')}
              </span>
              <span className="text-warning text-2xl font-semibold tabular-nums">
                {duplicates.totalGroups}
              </span>
            </Card>
            <Card className="flex flex-col gap-1">
              <span className="text-fg-muted text-xs font-medium tracking-wide uppercase">
                {t('nsiAnalytics.duplicatesDetail.affectedLabel')}
              </span>
              <span className="text-fg text-2xl font-semibold tabular-nums">
                {duplicates.affectedProducts}
              </span>
            </Card>
          </div>
        )}

        <div className="border-border bg-surface flex items-start gap-2.5 rounded-lg border px-4 py-3 text-sm">
          <span className="text-fg-muted mt-0.5 shrink-0">
            <InfoIcon size={16} />
          </span>
          <p className="text-fg-muted">
            {t('nsiAnalytics.duplicatesDetail.explanation')}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {duplicates?.groups.content.length === 0 && (
            <Card className="text-fg-muted py-8 text-center text-sm">
              {t('nsiAnalytics.duplicatesDetail.empty')}
            </Card>
          )}
          {duplicates?.groups.content.map((group, index) => (
            <DuplicateGroupCard
              key={`${group.duplicateKey}-${index}`}
              group={group}
            />
          ))}
        </div>

        <Pagination
          page={page}
          totalPages={duplicates?.groups.totalPages ?? 0}
          totalItems={duplicates?.groups.totalElements ?? 0}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(0);
          }}
          onReload={refetch}
          className="rounded-md border"
        />
      </div>
    </div>
  );
}
