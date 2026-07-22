import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { CompletenessGroupDimension } from '@entities/nsi-analytics/model/types';
import { useCompletenessByGroup } from '@entities/nsi-analytics/api/useCompleteness';
import { scoreTextClass } from '@entities/nsi-analytics/lib/scoreColor';
import { Card, CardHeader } from '@shared/ui/Card';
import { SegmentedControl } from '@shared/ui/SegmentedControl';
import { Progress } from '@shared/ui/Progress';
import { Pagination } from '@shared/ui/Table';
import { LayersIcon } from '@shared/ui/icons/LayersIcon';

const PAGE_SIZE = 5;

export function GroupCompletenessSection() {
  const { t } = useTranslation();
  const [dimension, setDimension] =
    useState<CompletenessGroupDimension>('PRODUCT_GROUP');
  const [page, setPage] = useState(0);
  const { data, isFetching } = useCompletenessByGroup(
    dimension,
    page,
    PAGE_SIZE,
  );

  return (
    <Card>
      <CardHeader
        title={t('nsiAnalytics.completenessDetail.byGroup.title')}
        icon={<LayersIcon size={16} />}
        action={
          <SegmentedControl
            size="xs"
            value={dimension}
            onChange={(value) => {
              setDimension(value);
              setPage(0);
            }}
            options={[
              {
                value: 'PRODUCT_GROUP',
                label: t(
                  'nsiAnalytics.completenessDetail.byGroup.productGroup',
                ),
              },
              {
                value: 'CATEGORY',
                label: t('nsiAnalytics.completenessDetail.byGroup.category'),
              },
            ]}
          />
        }
      />

      <div className="flex flex-col gap-3">
        {(data?.data ?? []).map((item, index) => (
          <div
            key={item.groupId ?? `unassigned-${index}`}
            className="flex flex-col gap-1"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="text-fg font-medium">
                {item.groupName ??
                  t('nsiAnalytics.completenessDetail.byGroup.unassigned')}
              </span>
              <span className="text-fg-muted tabular-nums">
                <span className={scoreTextClass(item.avgScore)}>
                  {item.avgScore}%
                </span>
                {' · '}
                {t('nsiAnalytics.completenessDetail.byGroup.productCount', {
                  count: item.productCount,
                })}
              </span>
            </div>
            <Progress
              size="sm"
              max={100}
              segments={[
                {
                  value: item.avgScore,
                  className:
                    item.avgScore >= 80
                      ? 'bg-success'
                      : item.avgScore >= 50
                        ? 'bg-warning'
                        : 'bg-danger',
                },
              ]}
            />
          </div>
        ))}
      </div>

      {data && data.totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={data.totalPages}
          totalItems={data.totalElements}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
          className="mt-3 rounded-md border"
        />
      )}

      {isFetching && !data && (
        <div className="text-fg-muted py-8 text-center text-sm">
          {t('common.loading')}
        </div>
      )}
    </Card>
  );
}
